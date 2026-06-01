import { getFeatureConfig } from "@/config/site";
import { isReviewedPoemSlug } from "@/lib/content/reviewed-poems";
import { jsonResponse, missingImplementationResponse, requireFeature } from "@/lib/user/api";
import { checkCommentRateLimit, parseCommentBody, serializeApprovedCommentRows } from "@/lib/user/comments";
import { approvedCommentsQuery, submitCommentStatement } from "@/lib/user/repositories";
import { getD1Database, getRateLimitKv, getRequestUser } from "@/lib/user/runtime";

export const prerender = false;

function reviewedPoemError() {
  return jsonResponse(
    {
      ok: false,
      error: "Only reviewed poems can receive comments."
    },
    { status: 400 }
  );
}

async function commentBodyFromRequest(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    return {
      poemSlug: form.get("poemSlug"),
      body: form.get("body")
    };
  }

  return request.json();
}

export async function GET(context: Parameters<typeof getD1Database>[0] & { request: Request }) {
  const disabled = requireFeature(getFeatureConfig().comments, "comments");
  if (disabled) return disabled;

  const poemSlug = new URL(context.request.url).searchParams.get("poemSlug") || "";
  if (!isReviewedPoemSlug(poemSlug)) return reviewedPoemError();

  const db = getD1Database(context);
  if (!db) return missingImplementationResponse("comments database");

  const statement = approvedCommentsQuery(poemSlug);
  const results = await db.prepare(statement.sql).bind(...statement.params).all();

  return jsonResponse({
    ok: true,
    comments: serializeApprovedCommentRows(Array.isArray(results.results) ? results.results : [])
  });
}

export async function POST(context: Parameters<typeof getRequestUser>[0] & { request: Request }) {
  const disabled = requireFeature(getFeatureConfig().comments, "comments");
  if (disabled) return disabled;

  const user = getRequestUser(context);
  if (!user) {
    return jsonResponse(
      {
        ok: false,
        error: "Authentication is required before comments can be submitted"
      },
      { status: 401 }
    );
  }

  let input;
  try {
    input = parseCommentBody(await commentBodyFromRequest(context.request));
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Invalid comment request."
      },
      { status: 400 }
    );
  }

  if (!isReviewedPoemSlug(input.poemSlug)) return reviewedPoemError();

  const rateLimitKv = getRateLimitKv(context);
  if (!rateLimitKv) return missingImplementationResponse("comment rate limit");

  const limit = await checkCommentRateLimit(rateLimitKv, user.id);
  if (!limit.allowed) {
    return jsonResponse(
      {
        ok: false,
        error: limit.error
      },
      { status: 429 }
    );
  }

  const db = getD1Database(context);
  if (!db) return missingImplementationResponse("comments database");

  const commentId = `comment_${crypto.randomUUID()}`;
  const statement = submitCommentStatement({
    id: commentId,
    userId: user.id,
    poemSlug: input.poemSlug,
    body: input.body
  });
  await db.prepare(statement.sql).bind(...statement.params).run();

  return jsonResponse(
    {
      ok: true,
      status: "pending",
      commentId,
      poemSlug: input.poemSlug
    },
    { status: 202 }
  );
}
