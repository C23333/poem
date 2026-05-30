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
  return {
    enabled: boolValue(env.PUBLIC_ENABLE_ADS) && Boolean(env.PUBLIC_ADSENSE_CLIENT),
    adsenseClient: env.PUBLIC_ADSENSE_CLIENT || "",
    slots: AD_SLOTS
  };
}

export function getFeatureConfig(env: EnvLike = import.meta.env) {
  return {
    subscription: boolValue(env.PUBLIC_ENABLE_SUBSCRIPTION),
    ai: boolValue(env.PUBLIC_ENABLE_AI),
    login: false,
    personalCenter: false
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
    loginEnabled: false,
    personalCenterEnabled: false
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
