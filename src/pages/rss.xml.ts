import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getSiteConfig } from "@/config/site";
import { entrySlug } from "@/lib/content/entries";
import { isIndexablePoem } from "@/lib/content/poems";

export const prerender = true;

export async function GET() {
  const site = getSiteConfig();
  const poems = await getCollection("poems");

  return rss({
    title: "未名诗阁",
    description: "Bilingual Chinese classical poetry with notes and context.",
    site: site.url,
    items: poems.filter(isIndexablePoem).map((poem) => ({
      title: poem.data.title,
      description: poem.data.explanationZh,
      link: `/poems/${entrySlug(poem)}`,
      pubDate: new Date(poem.data.updated)
    }))
  });
}
