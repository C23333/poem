import { getAdsConfig } from "@/config/site";

export const prerender = true;

export function GET() {
  const config = getAdsConfig();
  const body = config.adsTxtRecords.length
    ? `${config.adsTxtRecords.join("\n")}\n`
    : "# ads.txt is intentionally empty until a real AdSense publisher ID is configured.\n";

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8"
    }
  });
}
