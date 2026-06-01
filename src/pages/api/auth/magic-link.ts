import { getFeatureConfig } from "@/config/site";
import { jsonResponse, requireFeature } from "@/lib/user/api";

export const prerender = false;

export async function POST() {
  const disabled = requireFeature(getFeatureConfig().login, "login");
  if (disabled) return disabled;

  return jsonResponse(
    {
      ok: false,
      error: "Magic-link provider is not configured"
    },
    { status: 501 }
  );
}
