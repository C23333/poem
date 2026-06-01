import type { KvLike } from "./runtime";

export type CommentInput = {
  poemSlug: string;
  body: string;
};

type ApprovedCommentRow = {
  id: string;
  user_id: string;
  poem_slug: string;
  body: string;
  created_at: string;
};

export function parseCommentBody(body: unknown): CommentInput {
  const input = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const poemSlug = typeof input.poemSlug === "string" ? input.poemSlug : "";
  const text = typeof input.body === "string" ? input.body.trim() : "";

  if (!text) throw new Error("Comment body is required.");
  if (text.length > 1200) throw new Error("Comment body must be 1200 characters or fewer.");

  return {
    poemSlug,
    body: text
  };
}

export function serializeApprovedCommentRows(rows: unknown[]) {
  return rows
    .filter((row): row is ApprovedCommentRow => {
      const candidate = row as ApprovedCommentRow;
      return Boolean(
        row &&
          typeof row === "object" &&
          typeof candidate.id === "string" &&
          typeof candidate.poem_slug === "string" &&
          typeof candidate.body === "string" &&
          typeof candidate.created_at === "string"
      );
    })
    .map((row) => ({
      id: row.id,
      poemSlug: row.poem_slug,
      body: row.body,
      createdAt: row.created_at
    }));
}

export async function checkCommentRateLimit(kv: KvLike, userId: string) {
  const key = `comment:${userId}`;
  const marker = await kv.get(key);
  if (marker) {
    return {
      allowed: false,
      error: "Please wait before submitting another comment."
    };
  }

  await kv.put(key, "1", { expirationTtl: 60 });
  return { allowed: true };
}
