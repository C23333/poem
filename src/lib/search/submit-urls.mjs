import { isValidIndexNowKey } from "./indexnow.js";
import { isPublicSitemapUrl } from "../seo/sitemap-rules.js";

const NON_INDEXABLE_URL_SEGMENTS = ["/poems/jiang-ye/"];

function buildCanonicalUrl(siteUrl, path) {
  const normalizedSite = siteUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedSite}${normalizedPath}`;
}

export function extractSitemapUrls(xml) {
  return Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g)).map((match) => match[1].trim());
}

export function filterReviewedSubmissionUrls(urls) {
  return urls.filter((url) => isPublicSitemapUrl(url) && !NON_INDEXABLE_URL_SEGMENTS.some((segment) => url.includes(segment)));
}

function normalizedEndpoint(endpoint) {
  if (!endpoint.trim()) throw new Error("Submission endpoint is required.");
  return endpoint.trim();
}

function hostFromSiteUrl(siteUrl) {
  return new URL(siteUrl).host;
}

function assertUrlsMatchHost(urls, siteUrl) {
  const expectedHost = hostFromSiteUrl(siteUrl);
  const mismatched = urls.filter((url) => new URL(url).host !== expectedHost);
  if (mismatched.length > 0) {
    throw new Error(`Submission URLs must match PUBLIC_SITE_URL host ${expectedHost}.`);
  }
}

export function buildIndexNowSubmissionRequest(input) {
  if (!isValidIndexNowKey(input.key)) {
    throw new Error("INDEXNOW_KEY is required and must be 8-128 characters using letters, numbers, underscore, or hyphen.");
  }
  if (input.urls.length === 0) {
    throw new Error("No reviewed URLs found for IndexNow submission.");
  }
  assertUrlsMatchHost(input.urls, input.siteUrl);

  return {
    url: normalizedEndpoint(input.endpoint),
    init: {
      method: "POST",
      headers: {
        "content-type": "application/json; charset=utf-8"
      }
    },
    body: {
      host: hostFromSiteUrl(input.siteUrl),
      key: input.key,
      keyLocation: buildCanonicalUrl(input.siteUrl, `/${input.key}.txt`),
      urlList: input.urls
    }
  };
}

export function buildBaiduSubmissionRequest(input) {
  if (!input.token.trim()) {
    throw new Error("BAIDU_SUBMIT_TOKEN is required.");
  }
  if (input.urls.length === 0) {
    throw new Error("No reviewed URLs found for Baidu submission.");
  }
  assertUrlsMatchHost(input.urls, input.siteUrl);

  const endpoint = new URL(normalizedEndpoint(input.endpoint));
  endpoint.searchParams.set("site", hostFromSiteUrl(input.siteUrl));
  endpoint.searchParams.set("token", input.token);

  return {
    url: endpoint.toString(),
    init: {
      method: "POST",
      headers: {
        "content-type": "text/plain; charset=utf-8"
      }
    },
    body: input.urls.join("\n")
  };
}
