import { buildCanonicalUrl } from "./meta";

type JsonLdInput = {
  siteUrl: string;
  path: string;
};

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

export function websiteJsonLd(input: { siteUrl: string; name: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": buildCanonicalUrl(input.siteUrl, "/#website"),
    name: input.name,
    description: input.description,
    url: buildCanonicalUrl(input.siteUrl, "/")
  };
}

export function breadcrumbJsonLd(siteUrl: string, items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildCanonicalUrl(siteUrl, item.path)
    }))
  };
}

export function personJsonLd(input: JsonLdInput & { name: string; alternateName?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": buildCanonicalUrl(input.siteUrl, `${input.path}#person`),
    name: input.name,
    ...(input.alternateName ? { alternateName: input.alternateName } : {}),
    url: buildCanonicalUrl(input.siteUrl, input.path)
  };
}

export function collectionPageJsonLd(input: JsonLdInput & { name: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": buildCanonicalUrl(input.siteUrl, `${input.path}#collection`),
    name: input.name,
    description: input.description,
    url: buildCanonicalUrl(input.siteUrl, input.path)
  };
}

export function articleJsonLd(
  input: JsonLdInput & {
    title: string;
    description: string;
    author: string;
    dateModified: string;
  }
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": buildCanonicalUrl(input.siteUrl, `${input.path}#article`),
    headline: input.title,
    description: input.description,
    author: {
      "@type": "Organization",
      name: input.author
    },
    dateModified: input.dateModified,
    url: buildCanonicalUrl(input.siteUrl, input.path)
  };
}
