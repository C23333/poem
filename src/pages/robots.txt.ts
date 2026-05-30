import { getSiteConfig } from "@/config/site";

export const prerender = true;

export function GET() {
  const site = getSiteConfig();
  return new Response(
    [
      "User-agent: *",
      "Allow: /",
      "",
      "# AI crawler policy is intentionally documented in README.",
      `Sitemap: ${site.url}/sitemap-index.xml`
    ].join("\n"),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}
