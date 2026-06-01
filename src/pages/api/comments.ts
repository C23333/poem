import { getFeatureConfig } from "@/config/site";
import { jsonResponse, missingImplementationResponse, requireFeature } from "@/lib/user/api";

export const prerender = false;

export async function GET() {
  const disabled = requireFeature(getFeatureConfig().comments, "comments");
  if (disabled) return disabled;

  return missingImplementationResponse("comments database");
}

export async function POST() {
  const disabled = requireFeature(getFeatureConfig().comments, "comments");
  if (disabled) return disabled;

  return jsonResponse(
    {
      ok: false,
      error: "Authentication is required before comments can be submitted"
    },
    { status: 401 }
  );
}
