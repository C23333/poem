import { describe, expect, it } from "vitest";
import {
  AD_SLOTS,
  getAdsConfig,
  getAdSlotRenderState,
  getAnalyticsConfig,
  getAiProviderConfig,
  getFeatureConfig,
  getPersonalizationConfig,
  getProductionConfig,
  getReadingConfig,
  getSearchSubmissionConfig,
  getSiteConfig,
  getSubscriptionConfig,
  INTEREST_TAGS,
  READING_MODES
} from "./site";

describe("site configuration", () => {
  it("defines supported reading modes in one place", () => {
    expect(READING_MODES).toEqual(["zh", "en", "bilingual", "interlinear"]);
  });

  it("normalizes reading defaults from environment-like input", () => {
    const config = getReadingConfig({
      PUBLIC_DEFAULT_READING_MODE: "bilingual",
      PUBLIC_DEFAULT_HELPER_LANGUAGE: "zh"
    });

    expect(config.defaultMode).toBe("bilingual");
    expect(config.defaultHelperLanguage).toBe("zh");
  });

  it("falls back to safe reading defaults", () => {
    const config = getReadingConfig({});

    expect(config.defaultMode).toBe("interlinear");
    expect(config.defaultHelperLanguage).toBe("en");
  });

  it("disables analytics providers when IDs are missing", () => {
    expect(getAnalyticsConfig({}).ga4.enabled).toBe(false);
    expect(getAnalyticsConfig({}).baiduTongji.enabled).toBe(false);
  });

  it("exposes named ad slots through shared config", () => {
    expect(AD_SLOTS.poemAfterIntro.name).toBe("poem-after-intro");
    expect(AD_SLOTS.sidebar.name).toBe("sidebar");
  });

  it("normalizes the canonical site URL without trailing slash", () => {
    expect(getSiteConfig({ PUBLIC_SITE_URL: "https://poem.example/" }).url).toBe("https://poem.example");
  });

  it("defines interest tags for future personalization in one place", () => {
    expect(INTEREST_TAGS.map((tag) => tag.slug)).toContain("homesickness");
    expect(INTEREST_TAGS.every((tag) => tag.labelZh && tag.labelEn)).toBe(true);
  });

  it("keeps subscription disabled until both flag and endpoint exist", () => {
    expect(getSubscriptionConfig({ PUBLIC_ENABLE_SUBSCRIPTION: "true" }).enabled).toBe(false);

    expect(
      getSubscriptionConfig({
        PUBLIC_ENABLE_SUBSCRIPTION: "true",
        PUBLIC_SUBSCRIPTION_ENDPOINT: "/api/subscribe"
      }).enabled
    ).toBe(true);
  });

  it("keeps personalization API behind explicit configuration", () => {
    expect(getPersonalizationConfig({ PUBLIC_ENABLE_AI: "true" }).aiEndpoint).toBe("");
    expect(getPersonalizationConfig({ PUBLIC_AI_ENDPOINT: "/api/ai/explain" }).aiEndpoint).toBe("/api/ai/explain");
  });

  it("keeps AI provider disabled until endpoint, model, token, and usage limits exist", () => {
    expect(getAiProviderConfig({ PUBLIC_ENABLE_AI: "true" }).enabled).toBe(false);
    expect(
      getAiProviderConfig({
        PUBLIC_ENABLE_AI: "true",
        AI_PROVIDER_ENDPOINT: "https://ai.example/v1",
        AI_PROVIDER_MODEL: "poetry-model",
        AI_PROVIDER_TOKEN: "token",
        AI_DAILY_DRAFT_LIMIT: "25"
      })
    ).toMatchObject({
      enabled: true,
      endpoint: "https://ai.example/v1",
      model: "poetry-model",
      dailyDraftLimit: 25
    });
  });

  it("keeps account features disabled unless explicitly configured", () => {
    expect(getFeatureConfig({}).login).toBe(false);
    expect(
      getFeatureConfig({
        PUBLIC_ENABLE_LOGIN: "true",
        PUBLIC_ENABLE_PERSONAL_CENTER: "true",
        PUBLIC_ENABLE_COMMENTS: "true"
      })
    ).toMatchObject({
      login: true,
      personalCenter: true,
      comments: true
    });
  });

  it("marks the example domain as unsafe for production", () => {
    const config = getProductionConfig({ PUBLIC_SITE_URL: "https://example.com" });

    expect(config.safeDomain).toBe(false);
  });

  it("normalizes production binding names", () => {
    const config = getProductionConfig({});

    expect(config.bindings.d1Database).toBe("POETRY_DB");
    expect(config.bindings.astroSessionKv).toBe("SESSION");
    expect(config.bindings.sessionKv).toBe("POETRY_SESSION");
    expect(config.bindings.tokensKv).toBe("POETRY_TOKENS");
    expect(config.bindings.rateLimitKv).toBe("POETRY_RATE_LIMIT");
    expect(config.bindings.indexNowKv).toBe("POETRY_INDEXNOW");
  });

  it("keeps search submission disabled without tokens", () => {
    const config = getSearchSubmissionConfig({});

    expect(config.indexNow.enabled).toBe(false);
    expect(config.baidu.enabled).toBe(false);
  });

  it("does not emit fake ads.txt records without a publisher id", () => {
    expect(getAdsConfig({}).adsTxtRecords).toEqual([]);
  });

  it("keeps disabled ad slots hidden from readers", () => {
    expect(getAdSlotRenderState(getAdsConfig({}), "feedInline")).toEqual({
      enabled: false,
      slotName: "feed-inline",
      hidden: true
    });
  });
});
