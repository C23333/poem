import { getAiProviderConfig } from "@/config/site";
import { jsonResponse } from "@/lib/user/api";

export const prerender = false;

export async function POST() {
  const config = getAiProviderConfig();
  if (!config.enabled) {
    return jsonResponse(
      {
        ok: false,
        error: "AI provider is disabled"
      },
      { status: 503 }
    );
  }

  return jsonResponse(
    {
      ok: false,
      error: "AI draft generation is not wired to a reviewed provider"
    },
    { status: 501 }
  );
}
