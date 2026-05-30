import { buildCanonicalUrl } from "./meta";

export function poemJsonLd(input: {
  siteUrl: string;
  path: string;
  title: string;
  author: string;
  language: "zh-CN" | "en";
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": buildCanonicalUrl(input.siteUrl, input.path),
    name: input.title,
    inLanguage: input.language,
    author: {
      "@type": "Person",
      name: input.author
    },
    url: buildCanonicalUrl(input.siteUrl, input.path)
  };
}
