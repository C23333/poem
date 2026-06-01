import { describe, expect, it } from "vitest";
import { parsePreferencesBody, serializePreferenceRow } from "./preferences";

describe("user preferences helpers", () => {
  it("parses a valid preferences request", () => {
    expect(
      parsePreferencesBody({
        readingMode: "interlinear",
        helperLanguage: "pinyin",
        interestTags: ["moon", "unknown", "homesickness"],
        emailDailyEnabled: true
      })
    ).toEqual({
      readingMode: "interlinear",
      helperLanguage: "pinyin",
      interestTags: ["moon", "homesickness"],
      emailDailyEnabled: true
    });
  });

  it("rejects unsupported reading modes", () => {
    expect(() =>
      parsePreferencesBody({
        readingMode: "sideways",
        helperLanguage: "en",
        interestTags: [],
        emailDailyEnabled: false
      })
    ).toThrow("Unsupported reading mode.");
  });

  it("serializes missing rows as null preferences", () => {
    expect(serializePreferenceRow(null)).toBeNull();
  });

  it("serializes stored D1 rows", () => {
    expect(
      serializePreferenceRow({
        reading_mode: "bilingual",
        helper_language: "en",
        interest_tags: JSON.stringify(["moon"]),
        email_daily_enabled: 1
      })
    ).toEqual({
      readingMode: "bilingual",
      helperLanguage: "en",
      interestTags: ["moon"],
      emailDailyEnabled: true
    });
  });
});
