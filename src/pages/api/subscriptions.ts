import { getSubscriptionConfig } from "@/config/site";
import { jsonResponse, missingImplementationResponse, requireFeature } from "@/lib/user/api";
import { createSubscriptionStatement } from "@/lib/user/repositories";
import { getD1Database, getRequestUser, getTokenKv } from "@/lib/user/runtime";
import { hashSubscriptionToken, parseSubscriptionBody } from "@/lib/user/subscriptions";

export const prerender = false;

async function subscriptionBodyFromRequest(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const interestTags = [...form.getAll("interests"), ...form.getAll("interestTags")].filter(
      (value): value is string => typeof value === "string"
    );
    return {
      email: form.get("email"),
      interestTags
    };
  }

  return request.json();
}

export async function POST(context: Parameters<typeof getRequestUser>[0] & { request: Request }) {
  const disabled = requireFeature(getSubscriptionConfig().enabled, "subscriptions");
  if (disabled) return disabled;

  const db = getD1Database(context);
  if (!db) return missingImplementationResponse("subscriptions database");

  const tokenKv = getTokenKv(context);
  if (!tokenKv) return missingImplementationResponse("subscription token storage");

  let input;
  try {
    input = parseSubscriptionBody(await subscriptionBodyFromRequest(context.request));
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Invalid subscription request."
      },
      { status: 400 }
    );
  }

  const subscriptionId = `sub_${crypto.randomUUID()}`;
  const unsubscribeToken = crypto.randomUUID();
  const unsubscribeTokenHash = await hashSubscriptionToken(unsubscribeToken);
  const user = getRequestUser(context);

  const statement = createSubscriptionStatement({
    id: subscriptionId,
    userId: user?.id,
    email: input.email,
    interestTags: input.interestTags,
    status: "pending",
    unsubscribeTokenHash
  });
  await db.prepare(statement.sql).bind(...statement.params).run();

  await tokenKv.put(`subscription:unsubscribe:${unsubscribeTokenHash}`, subscriptionId, {
    expirationTtl: 60 * 60 * 24 * 30
  });

  return jsonResponse(
    {
      ok: true,
      subscriptionId,
      email: input.email,
      interestTags: input.interestTags,
      status: "pending",
      emailDelivery: "not_configured"
    },
    { status: 202 }
  );
}
