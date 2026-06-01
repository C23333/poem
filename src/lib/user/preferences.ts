import { HELPER_LANGUAGES, INTEREST_TAGS, READING_MODES, type HelperLanguage, type ReadingMode } from "@/config/site";

export type UserPreferences = {
  readingMode: ReadingMode;
  helperLanguage: HelperLanguage;
  interestTags: string[];
  emailDailyEnabled: boolean;
};

type PreferenceRow = {
  reading_mode: string;
  helper_language: string;
  interest_tags: string;
  email_daily_enabled: number;
};

const interestSlugs: ReadonlySet<string> = new Set(INTEREST_TAGS.map((tag) => tag.slug));

function assertReadingMode(value: unknown): ReadingMode {
  if (READING_MODES.includes(value as ReadingMode)) return value as ReadingMode;
  throw new Error("Unsupported reading mode.");
}

function assertHelperLanguage(value: unknown): HelperLanguage {
  if (HELPER_LANGUAGES.includes(value as HelperLanguage)) return value as HelperLanguage;
  throw new Error("Unsupported helper language.");
}

function parseInterestTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((tag): tag is string => typeof tag === "string" && interestSlugs.has(tag));
}

export function parsePreferencesBody(body: unknown): UserPreferences {
  const input = body && typeof body === "object" ? (body as Record<string, unknown>) : {};

  return {
    readingMode: assertReadingMode(input.readingMode),
    helperLanguage: assertHelperLanguage(input.helperLanguage),
    interestTags: parseInterestTags(input.interestTags),
    emailDailyEnabled: input.emailDailyEnabled === true
  };
}

export function serializePreferenceRow(row: PreferenceRow | null): UserPreferences | null {
  if (!row) return null;

  return {
    readingMode: assertReadingMode(row.reading_mode),
    helperLanguage: assertHelperLanguage(row.helper_language),
    interestTags: parseInterestTags(JSON.parse(row.interest_tags)),
    emailDailyEnabled: row.email_daily_enabled === 1
  };
}

export function isPreferenceRow(row: unknown): row is PreferenceRow {
  return (
    Boolean(row) &&
    typeof row === "object" &&
    typeof (row as PreferenceRow).reading_mode === "string" &&
    typeof (row as PreferenceRow).helper_language === "string" &&
    typeof (row as PreferenceRow).interest_tags === "string" &&
    typeof (row as PreferenceRow).email_daily_enabled === "number"
  );
}
