import { getFeatureConfig } from "@/config/site";
import { isReviewedPoemSlug } from "@/lib/content/reviewed-poems";
import { jsonResponse, missingImplementationResponse, requireFeature } from "@/lib/user/api";
import { deleteSavedPoemStatement, savePoemStatement, savedPoemsQuery } from "@/lib/user/repositories";
import { getD1Database, getRequestUser } from "@/lib/user/runtime";

export const prerender = false;

function authError() {
  return jsonResponse(
    {
      ok: false,
      error: "Authentication is required"
    },
    { status: 401 }
  );
}

async function poemSlugFromRequest(request: Request): Promise<string> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const slug = form.get("poemSlug");
    return typeof slug === "string" ? slug : "";
  }

  const body = await request.json();
  return body && typeof body === "object" && typeof (body as { poemSlug?: unknown }).poemSlug === "string"
    ? (body as { poemSlug: string }).poemSlug
    : "";
}

function invalidPoemResponse() {
  return jsonResponse(
    {
      ok: false,
      error: "Only reviewed poems can be saved."
    },
    { status: 400 }
  );
}

export async function GET(context: Parameters<typeof getRequestUser>[0]) {
  const disabled = requireFeature(getFeatureConfig().personalCenter, "saved poems");
  if (disabled) return disabled;

  const user = getRequestUser(context);
  if (!user) return authError();

  const db = getD1Database(context);
  if (!db) return missingImplementationResponse("saved poems database");

  const statement = savedPoemsQuery(user.id);
  const results = await db.prepare(statement.sql).bind(...statement.params).all();
  const rows = Array.isArray(results.results) ? results.results : [];

  return jsonResponse({
    ok: true,
    poems: rows.map((row) => (row as { poem_slug?: string }).poem_slug).filter(Boolean)
  });
}

export async function POST(context: Parameters<typeof getRequestUser>[0] & { request: Request }) {
  const disabled = requireFeature(getFeatureConfig().personalCenter, "saved poems");
  if (disabled) return disabled;

  const user = getRequestUser(context);
  if (!user) return authError();

  const poemSlug = await poemSlugFromRequest(context.request);
  if (!isReviewedPoemSlug(poemSlug)) return invalidPoemResponse();

  const db = getD1Database(context);
  if (!db) return missingImplementationResponse("saved poems database");

  const statement = savePoemStatement({ userId: user.id, poemSlug });
  await db.prepare(statement.sql).bind(...statement.params).run();

  return jsonResponse({ ok: true, saved: true, poemSlug });
}

export async function DELETE(context: Parameters<typeof getRequestUser>[0] & { request: Request }) {
  const disabled = requireFeature(getFeatureConfig().personalCenter, "saved poems");
  if (disabled) return disabled;

  const user = getRequestUser(context);
  if (!user) return authError();

  const poemSlug = new URL(context.request.url).searchParams.get("poemSlug") || "";
  if (!isReviewedPoemSlug(poemSlug)) return invalidPoemResponse();

  const db = getD1Database(context);
  if (!db) return missingImplementationResponse("saved poems database");

  const statement = deleteSavedPoemStatement({ userId: user.id, poemSlug });
  await db.prepare(statement.sql).bind(...statement.params).run();

  return jsonResponse({ ok: true, saved: false, poemSlug });
}
