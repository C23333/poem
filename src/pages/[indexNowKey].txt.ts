import { getSearchSubmissionConfig } from "@/config/site";
import { indexNowKeyResponse } from "@/lib/search/indexnow.js";

export const prerender = false;

export function GET({ params }: { params: { indexNowKey?: string } }) {
  const config = getSearchSubmissionConfig();
  const result = indexNowKeyResponse({
    requestedKey: params.indexNowKey || "",
    configuredKey: config.indexNow.key
  });

  return new Response(result.body, {
    status: result.status,
    headers: {
      "content-type": "text/plain; charset=utf-8"
    }
  });
}
