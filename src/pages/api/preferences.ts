import { getFeatureConfig } from "@/config/site";
import { jsonResponse, missingImplementationResponse, requireFeature } from "@/lib/user/api";
import { isPreferenceRow, parsePreferencesBody, serializePreferenceRow } from "@/lib/user/preferences";
import { preferencesQuery, savePreferencesStatement } from "@/lib/user/repositories";
import { getD1Database, getRequestUser } from "@/lib/user/runtime";

export const prerender = false;

export async function GET(context: Parameters<typeof getRequestUser>[0]) {
  const disabled = requireFeature(getFeatureConfig().personalCenter, "personal center");
  if (disabled) return disabled;

  const user = getRequestUser(context);
  if (!user) {
    return jsonResponse(
      {
        ok: false,
        error: "Authentication is required"
      },
      { status: 401 }
    );
  }

  const db = getD1Database(context);
  if (!db) return missingImplementationResponse("preferences database");

  const statement = preferencesQuery(user.id);
  const row = await db.prepare(statement.sql).bind(...statement.params).first();

  return jsonResponse({
    ok: true,
    preferences: serializePreferenceRow(isPreferenceRow(row) ? row : null)
  });
}

export async function POST(context: Parameters<typeof getRequestUser>[0] & { request: Request }) {
  const disabled = requireFeature(getFeatureConfig().personalCenter, "personal center");
  if (disabled) return disabled;

  const user = getRequestUser(context);
  if (!user) {
    return jsonResponse(
      {
        ok: false,
        error: "Authentication is required"
      },
      { status: 401 }
    );
  }

  const db = getD1Database(context);
  if (!db) return missingImplementationResponse("preferences database");

  let preferences;
  try {
    preferences = parsePreferencesBody(await context.request.json());
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Invalid preferences request."
      },
      { status: 400 }
    );
  }

  const statement = savePreferencesStatement({
    userId: user.id,
    ...preferences
  });
  await db.prepare(statement.sql).bind(...statement.params).run();

  return jsonResponse({
    ok: true,
    preferences
  });
}
