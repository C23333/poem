import { describe, expect, it } from "vitest";
import {
  buildBaiduSubmissionRequest,
  buildIndexNowSubmissionRequest,
  extractSitemapUrls,
  filterReviewedSubmissionUrls
} from "./submit-urls.mjs";

const sitemap = `
<urlset>
  <url><loc>https://poem.example/poems/jing-ye-si/</loc></url>
  <url><loc>https://poem.example/en/poems/jing-ye-si/</loc></url>
  <url><loc>https://poem.example/poems/jiang-ye/</loc></url>
</urlset>
`;

describe("search URL submission helpers", () => {
  it("extracts sitemap loc values", () => {
    expect(extractSitemapUrls(sitemap)).toEqual([
      "https://poem.example/poems/jing-ye-si/",
      "https://poem.example/en/poems/jing-ye-si/",
      "https://poem.example/poems/jiang-ye/"
    ]);
  });

  it("keeps reviewed sitemap URLs and excludes known draft URLs", () => {
    expect(filterReviewedSubmissionUrls(extractSitemapUrls(sitemap))).toEqual([
      "https://poem.example/poems/jing-ye-si/",
      "https://poem.example/en/poems/jing-ye-si/"
    ]);
  });

  it("fails IndexNow request creation when sitemap URLs do not match the configured site host", () => {
    expect(() =>
      buildIndexNowSubmissionRequest({
        endpoint: "https://api.indexnow.org/indexnow",
        siteUrl: "https://poem.example",
        key: "abcDEF-12345678",
        urls: ["https://example.com/poems/jing-ye-si/"]
      })
    ).toThrow("Submission URLs must match PUBLIC_SITE_URL host");
  });

  it("builds an IndexNow batch request", () => {
    const request = buildIndexNowSubmissionRequest({
      endpoint: "https://api.indexnow.org/indexnow",
      siteUrl: "https://poem.example",
      key: "abcDEF-12345678",
      urls: ["https://poem.example/poems/jing-ye-si/"]
    });

    expect(request.url).toBe("https://api.indexnow.org/indexnow");
    expect(request.body).toEqual({
      host: "poem.example",
      key: "abcDEF-12345678",
      keyLocation: "https://poem.example/abcDEF-12345678.txt",
      urlList: ["https://poem.example/poems/jing-ye-si/"]
    });
  });

  it("fails IndexNow request creation when key is missing", () => {
    expect(() =>
      buildIndexNowSubmissionRequest({
        endpoint: "https://api.indexnow.org/indexnow",
        siteUrl: "https://poem.example",
        key: "",
        urls: ["https://poem.example/poems/jing-ye-si/"]
      })
    ).toThrow("INDEXNOW_KEY is required");
  });

  it("builds a Baidu push request and requires token", () => {
    const request = buildBaiduSubmissionRequest({
      endpoint: "https://data.zz.baidu.com/urls",
      siteUrl: "https://poem.example",
      token: "token123",
      urls: ["https://poem.example/poems/jing-ye-si/"]
    });

    expect(request.url).toBe("https://data.zz.baidu.com/urls?site=poem.example&token=token123");
    expect(request.body).toBe("https://poem.example/poems/jing-ye-si/");
  });

  it("fails Baidu request creation when token is missing", () => {
    expect(() =>
      buildBaiduSubmissionRequest({
        endpoint: "https://data.zz.baidu.com/urls",
        siteUrl: "https://poem.example",
        token: "",
        urls: ["https://poem.example/poems/jing-ye-si/"]
      })
    ).toThrow("BAIDU_SUBMIT_TOKEN is required");
  });
});
