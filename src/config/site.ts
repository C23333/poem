export const READING_MODES = ["zh", "en", "bilingual", "interlinear"] as const;
export type ReadingMode = (typeof READING_MODES)[number];

export const HELPER_LANGUAGES = ["en", "zh", "pinyin"] as const;
export type HelperLanguage = (typeof HELPER_LANGUAGES)[number];

type EnvLike = Record<string, string | undefined>;

export const INTEREST_TAGS = [
  { slug: "homesickness", labelZh: "乡思", labelEn: "Homesickness" },
  { slug: "moon", labelZh: "月夜", labelEn: "Moonlit Night" },
  { slug: "landscape", labelZh: "山水", labelEn: "Landscape" },
  { slug: "friendship", labelZh: "送别", labelEn: "Parting" }
] as const;

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function boolValue(value: string | undefined): boolean {
  return value === "true";
}

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readingMode(value: string | undefined): ReadingMode {
  return READING_MODES.includes(value as ReadingMode) ? (value as ReadingMode) : "interlinear";
}

function helperLanguage(value: string | undefined): HelperLanguage {
  return HELPER_LANGUAGES.includes(value as HelperLanguage) ? (value as HelperLanguage) : "en";
}

export function getSiteConfig(env: EnvLike = import.meta.env) {
  return {
    url: stripTrailingSlash(env.PUBLIC_SITE_URL || "https://example.com"),
    defaultLocale: env.PUBLIC_DEFAULT_LOCALE || "zh-CN",
    locales: ["zh-CN", "en"] as const,
    routes: {
      poems: "/poems",
      englishPoems: "/en/poems",
      poets: "/poets",
      themes: "/themes",
      daily: "/daily"
    }
  };
}

export function getReadingConfig(env: EnvLike = import.meta.env) {
  return {
    modes: READING_MODES,
    helperLanguages: HELPER_LANGUAGES,
    defaultMode: readingMode(env.PUBLIC_DEFAULT_READING_MODE),
    defaultHelperLanguage: helperLanguage(env.PUBLIC_DEFAULT_HELPER_LANGUAGE),
    persistPreference: true
  };
}

export function getAnalyticsConfig(env: EnvLike = import.meta.env) {
  return {
    ga4: {
      enabled: Boolean(env.PUBLIC_GA4_ID),
      id: env.PUBLIC_GA4_ID || ""
    },
    cloudflare: {
      enabled: Boolean(env.PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN),
      token: env.PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN || ""
    },
    baiduTongji: {
      enabled: Boolean(env.PUBLIC_BAIDU_TONGJI_ID),
      id: env.PUBLIC_BAIDU_TONGJI_ID || ""
    }
  };
}

export const AD_SLOTS = {
  poemAfterIntro: {
    name: "poem-after-intro",
    description: "After poem intro, before commentary"
  },
  sidebar: {
    name: "sidebar",
    description: "Desktop sidebar slot"
  },
  feedInline: {
    name: "feed-inline",
    description: "Between listing sections"
  }
} as const;

export function getAdsConfig(env: EnvLike = import.meta.env) {
  const publisherId = env.PUBLIC_ADSENSE_PUBLISHER_ID || "";

  return {
    enabled: boolValue(env.PUBLIC_ENABLE_ADS) && Boolean(env.PUBLIC_ADSENSE_CLIENT),
    adsenseClient: env.PUBLIC_ADSENSE_CLIENT || "",
    adsensePublisherId: publisherId,
    adsTxtRecords: publisherId ? [`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0`] : [],
    slots: AD_SLOTS
  };
}

export function getAdSlotRenderState(config: ReturnType<typeof getAdsConfig>, slotKey: keyof typeof AD_SLOTS) {
  return {
    enabled: config.enabled,
    slotName: config.slots[slotKey].name,
    hidden: !config.enabled
  };
}

export function getFeatureConfig(env: EnvLike = import.meta.env) {
  return {
    subscription: boolValue(env.PUBLIC_ENABLE_SUBSCRIPTION),
    ai: boolValue(env.PUBLIC_ENABLE_AI),
    login: boolValue(env.PUBLIC_ENABLE_LOGIN),
    personalCenter: boolValue(env.PUBLIC_ENABLE_PERSONAL_CENTER),
    comments: boolValue(env.PUBLIC_ENABLE_COMMENTS)
  };
}

export function getSubscriptionConfig(env: EnvLike = import.meta.env) {
  const endpoint = env.PUBLIC_SUBSCRIPTION_ENDPOINT || "";

  return {
    enabled: boolValue(env.PUBLIC_ENABLE_SUBSCRIPTION) && Boolean(endpoint),
    endpoint,
    interests: INTEREST_TAGS
  };
}

export function getPersonalizationConfig(env: EnvLike = import.meta.env) {
  return {
    aiEnabled: boolValue(env.PUBLIC_ENABLE_AI) && Boolean(env.PUBLIC_AI_ENDPOINT),
    aiEndpoint: env.PUBLIC_AI_ENDPOINT || "",
    preferenceStorageKey: "poetry-reader-interests",
    loginEnabled: boolValue(env.PUBLIC_ENABLE_LOGIN),
    personalCenterEnabled: boolValue(env.PUBLIC_ENABLE_PERSONAL_CENTER)
  };
}

export function getAiProviderConfig(env: EnvLike = import.meta.env) {
  const endpoint = env.AI_PROVIDER_ENDPOINT || "";
  const model = env.AI_PROVIDER_MODEL || "";
  const token = env.AI_PROVIDER_TOKEN || "";
  const dailyDraftLimit = positiveInt(env.AI_DAILY_DRAFT_LIMIT, 10);

  return {
    enabled: boolValue(env.PUBLIC_ENABLE_AI) && Boolean(endpoint && model && token && dailyDraftLimit),
    endpoint,
    model,
    token,
    dailyDraftLimit,
    promptVersion: env.AI_PROMPT_VERSION || "poetry-editorial-v1"
  };
}

export function getProductionConfig(env: EnvLike = import.meta.env) {
  const site = getSiteConfig(env);

  return {
    safeDomain: site.url !== "https://example.com",
    nodeMinimum: ">=22.12.0",
    bindings: {
      d1Database: env.CLOUDFLARE_D1_BINDING || "POETRY_DB",
      astroSessionKv: env.CLOUDFLARE_ASTRO_SESSION_KV_BINDING || "SESSION",
      sessionKv: env.CLOUDFLARE_SESSION_KV_BINDING || "POETRY_SESSION",
      tokensKv: env.CLOUDFLARE_TOKENS_KV_BINDING || "POETRY_TOKENS",
      rateLimitKv: env.CLOUDFLARE_RATE_LIMIT_KV_BINDING || "POETRY_RATE_LIMIT",
      indexNowKv: env.CLOUDFLARE_INDEXNOW_KV_BINDING || "POETRY_INDEXNOW"
    }
  };
}

export function getSearchSubmissionConfig(env: EnvLike = import.meta.env) {
  return {
    indexNow: {
      enabled: Boolean(env.INDEXNOW_KEY),
      key: env.INDEXNOW_KEY || "",
      endpoint: env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow"
    },
    baidu: {
      enabled: Boolean(env.BAIDU_SUBMIT_TOKEN),
      token: env.BAIDU_SUBMIT_TOKEN || "",
      endpoint: env.BAIDU_SUBMIT_ENDPOINT || "https://data.zz.baidu.com/urls"
    }
  };
}

export function getSeoConfig(env: EnvLike = import.meta.env) {
  return {
    siteUrl: getSiteConfig(env).url,
    thinPageNoindex: true,
    allowAiCrawlers: true,
    sitemapChunkSize: 5000
  };
}
