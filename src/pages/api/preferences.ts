import { getFeatureConfig } from "@/config/site";
import { jsonResponse, requireFeature } from "@/lib/user/api";

export const prerender = false;

export async function GET() {
  const disabled = requireFeature(getFeatureConfig().personalCenter, "personal center");
  if (disabled) return disabled;

  return jsonResponse(
    {
      ok: false,
      error: "Authentication is required"
    },
    { status: 401 }
  );
}

export async function POST() {
  const disabled = requireFeature(getFeatureConfig().personalCenter, "personal center");
  if (disabled) return disabled;

  return jsonResponse(
    {
      ok: false,
      error: "Authentication is required"
    },
    { status: 401 }
  );
}
