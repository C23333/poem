import { getAiProviderConfig } from "@/config/site";
import { reviewAiDraftStatement } from "@/lib/ai/repositories";
import { jsonResponse, missingImplementationResponse } from "@/lib/user/api";
import { getD1Database, getRequestUser } from "@/lib/user/runtime";

export const prerender = false;

type RuntimeContext = Parameters<typeof getRequestUser>[0] & {
  request: Request;
};

function runtimeEnv(context: RuntimeContext) {
  const raw = context.locals?.runtime?.env || {};
  return Object.fromEntries(Object.entries(raw).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}

function statusForAction(action: unknown): "approved" | "rejected" | "needs-review" | undefined {
  if (action === "approve") return "approved";
  if (action === "reject") return "rejected";
  if (action === "needs-review") return "needs-review";
  return undefined;
}

export async function POST(context: RuntimeContext) {
  const config = getAiProviderConfig({ ...import.meta.env, ...runtimeEnv(context) });
  if (!config.enabled) {
    return jsonResponse(
      {
        ok: false,
        error: "AI provider is disabled"
      },
      { status: 503 }
    );
  }

  const user = getRequestUser(context);
  if (user?.role !== "moderator" && user?.role !== "admin") {
    return jsonResponse(
      {
        ok: false,
        error: "Moderator or admin role is required for AI draft review"
      },
      { status: 403 }
    );
  }

  const db = getD1Database(context);
  if (!db) return missingImplementationResponse("AI drafts database");

  const body = (await context.request.json()) as { draftId?: unknown; action?: unknown };
  const draftId = typeof body.draftId === "string" ? body.draftId.trim() : "";
  const status = statusForAction(body.action);
  if (!draftId || !status) {
    return jsonResponse(
      {
        ok: false,
        error: "Valid draftId and review action are required"
      },
      { status: 400 }
    );
  }

  const statement = reviewAiDraftStatement({
    id: draftId,
    status,
    reviewerUserId: user.id
  });
  await db.prepare(statement.sql).bind(...statement.params).run();

  return jsonResponse({
    ok: true,
    draftId,
    status,
    published: false
  });
}
