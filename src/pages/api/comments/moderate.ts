import { getFeatureConfig } from "@/config/site";
import { jsonResponse, missingImplementationResponse, requireFeature } from "@/lib/user/api";
import { createModerationEventStatement, moderateCommentStatement } from "@/lib/user/repositories";
import { getD1Database, getRequestUser } from "@/lib/user/runtime";

export const prerender = false;

function statusForAction(action: unknown): "approved" | "rejected" | undefined {
  if (action === "approve") return "approved";
  if (action === "reject") return "rejected";
  return undefined;
}

export async function POST(context: Parameters<typeof getRequestUser>[0] & { request: Request }) {
  const disabled = requireFeature(getFeatureConfig().comments, "comments");
  if (disabled) return disabled;

  const user = getRequestUser(context);
  if (user?.role !== "moderator" && user?.role !== "admin") {
    return jsonResponse(
      {
        ok: false,
        error: "Moderator permission is required"
      },
      { status: 403 }
    );
  }

  const db = getD1Database(context);
  if (!db) return missingImplementationResponse("comments database");

  const body = (await context.request.json()) as { commentId?: unknown; action?: unknown; reason?: unknown };
  const commentId = typeof body.commentId === "string" ? body.commentId : "";
  const status = statusForAction(body.action);
  if (!commentId || !status) {
    return jsonResponse(
      {
        ok: false,
        error: "Valid commentId and moderation action are required"
      },
      { status: 400 }
    );
  }

  const update = moderateCommentStatement({ id: commentId, status });
  await db.prepare(update.sql).bind(...update.params).run();

  const event = createModerationEventStatement({
    id: `mod_${crypto.randomUUID()}`,
    commentId,
    moderatorUserId: user.id,
    action: status,
    reason: typeof body.reason === "string" ? body.reason : undefined
  });
  await db.prepare(event.sql).bind(...event.params).run();

  return jsonResponse({
    ok: true,
    commentId,
    status
  });
}
