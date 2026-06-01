import { describe, expect, it, vi } from "vitest";
import { GET, POST } from "./preferences";

function createContext(input: {
  env?: Record<string, string | undefined>;
  user?: { id: string; email: string };
  db?: unknown;
  body?: unknown;
} = {}) {
  return {
    locals: {
      user: input.user,
      runtime: {
        env: {
          POETRY_DB: input.db
        }
      }
    },
    request: new Request("https://poem.example/api/preferences", {
      method: input.body ? "POST" : "GET",
      body: input.body ? JSON.stringify(input.body) : undefined
    })
  } as never;
}

describe("preferences API", () => {
  it("returns disabled when personal center is off", async () => {
    const response = await GET(createContext());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "personal center is disabled"
    });
  });

  it("requires authentication when enabled", async () => {
    vi.stubEnv("PUBLIC_ENABLE_PERSONAL_CENTER", "true");

    const response = await GET(createContext());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Authentication is required"
    });
  });

  it("fails explicitly when D1 is not configured", async () => {
    vi.stubEnv("PUBLIC_ENABLE_PERSONAL_CENTER", "true");

    const response = await GET(createContext({ user: { id: "user_1", email: "reader@example.com" } }));

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "preferences database is not configured"
    });
  });

  it("reads preferences for the authenticated user", async () => {
    vi.stubEnv("PUBLIC_ENABLE_PERSONAL_CENTER", "true");
    const first = vi.fn().mockResolvedValue({
      user_id: "user_1",
      reading_mode: "bilingual",
      helper_language: "en",
      interest_tags: JSON.stringify(["moon"]),
      email_daily_enabled: 1
    });
    const bind = vi.fn().mockReturnValue({ first });
    const prepare = vi.fn().mockReturnValue({ bind });

    const response = await GET(createContext({ user: { id: "user_1", email: "reader@example.com" }, db: { prepare } }));

    expect(response.status).toBe(200);
    expect(prepare).toHaveBeenCalledWith(expect.stringContaining("FROM user_preferences"));
    expect(bind).toHaveBeenCalledWith("user_1");
    await expect(response.json()).resolves.toEqual({
      ok: true,
      preferences: {
        readingMode: "bilingual",
        helperLanguage: "en",
        interestTags: ["moon"],
        emailDailyEnabled: true
      }
    });
  });

  it("saves validated preferences for the authenticated user", async () => {
    vi.stubEnv("PUBLIC_ENABLE_PERSONAL_CENTER", "true");
    const run = vi.fn().mockResolvedValue({});
    const bind = vi.fn().mockReturnValue({ run });
    const prepare = vi.fn().mockReturnValue({ bind });

    const response = await POST(
      createContext({
        user: { id: "user_1", email: "reader@example.com" },
        db: { prepare },
        body: {
          readingMode: "interlinear",
          helperLanguage: "pinyin",
          interestTags: ["moon", "homesickness"],
          emailDailyEnabled: true
        }
      })
    );

    expect(response.status).toBe(200);
    expect(prepare).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO user_preferences"));
    expect(bind).toHaveBeenCalledWith("user_1", "interlinear", "pinyin", JSON.stringify(["moon", "homesickness"]), 1);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      preferences: {
        readingMode: "interlinear",
        helperLanguage: "pinyin",
        interestTags: ["moon", "homesickness"],
        emailDailyEnabled: true
      }
    });
  });
});
