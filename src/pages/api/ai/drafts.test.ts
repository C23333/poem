import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./drafts";

function createContext(input: {
  user?: { id: string; email: string; role?: "reader" | "moderator" | "admin" };
  db?: unknown;
  kv?: unknown;
  env?: Record<string, string | undefined>;
  body?: unknown;
} = {}) {
  return {
    locals: {
      user: input.user,
      runtime: {
        env: {
          ...(input.env || {}),
          POETRY_DB: input.db,
          POETRY_RATE_LIMIT: input.kv
        }
      }
    },
    request: new Request("https://poem.example/api/ai/drafts", {
      method: "POST",
      body: input.body ? JSON.stringify(input.body) : undefined,
      headers: input.body ? { "content-type": "application/json" } : undefined
    })
  } as never;
}

function enableAi() {
  vi.stubEnv("PUBLIC_ENABLE_AI", "true");
  vi.stubEnv("AI_PROVIDER_ENDPOINT", "https://ai.example/v1");
  vi.stubEnv("AI_PROVIDER_MODEL", "poetry-model");
  vi.stubEnv("AI_PROVIDER_TOKEN", "secret");
  vi.stubEnv("AI_DAILY_DRAFT_LIMIT", "10");
  vi.stubEnv("AI_PROMPT_VERSION", "poetry-editorial-v1");
}

describe("AI drafts API", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns disabled when AI is off", async () => {
    const response = await POST();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "AI provider is disabled"
    });
  });

  it("requires an authenticated editor when AI is enabled", async () => {
    enableAi();

    const response = await POST(
      createContext({
        body: { poemSlug: "jing-ye-si", task: "explanation", sourceText: "床前明月光" }
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Authentication is required before AI drafts can be generated"
    });
  });

  it("rejects non-editor users", async () => {
    enableAi();

    const response = await POST(
      createContext({
        user: { id: "user_1", email: "reader@example.com", role: "reader" },
        body: { poemSlug: "jing-ye-si", task: "explanation", sourceText: "床前明月光" }
      })
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Moderator or admin role is required for AI drafts"
    });
  });

  it("rejects unsupported AI draft tasks", async () => {
    enableAi();

    const response = await POST(
      createContext({
        user: { id: "mod_1", email: "mod@example.com", role: "moderator" },
        body: { poemSlug: "jing-ye-si", task: "summary", sourceText: "床前明月光" }
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Unsupported AI draft task."
    });
  });

  it("rejects unreviewed poem slugs", async () => {
    enableAi();

    const response = await POST(
      createContext({
        user: { id: "mod_1", email: "mod@example.com", role: "moderator" },
        body: { poemSlug: "jiang-ye", task: "explanation", sourceText: "江边夜色" }
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Only reviewed poems can receive AI drafts."
    });
  });

  it("fails explicitly when D1 is not configured", async () => {
    enableAi();

    const response = await POST(
      createContext({
        user: { id: "mod_1", email: "mod@example.com", role: "moderator" },
        body: { poemSlug: "jing-ye-si", task: "translation", sourceText: "床前明月光" }
      })
    );

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "AI drafts database is not configured"
    });
  });

  it("requires rate-limit KV before calling the provider", async () => {
    enableAi();
    const run = vi.fn().mockResolvedValue({});
    const bind = vi.fn().mockReturnValue({ run });
    const prepare = vi.fn().mockReturnValue({ bind });
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);

    const response = await POST(
      createContext({
        user: { id: "mod_1", email: "mod@example.com", role: "moderator" },
        db: { prepare },
        body: { poemSlug: "jing-ye-si", task: "translation", sourceText: "床前明月光" }
      })
    );

    expect(response.status).toBe(501);
    expect(fetcher).not.toHaveBeenCalled();
    expect(prepare).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "AI draft rate limit is not configured"
    });
  });

  it("blocks draft generation after the daily limit", async () => {
    enableAi();
    const run = vi.fn().mockResolvedValue({});
    const bind = vi.fn().mockReturnValue({ run });
    const prepare = vi.fn().mockReturnValue({ bind });
    const kv = {
      get: vi.fn().mockResolvedValue("10"),
      put: vi.fn().mockResolvedValue(undefined)
    };
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);

    const response = await POST(
      createContext({
        user: { id: "mod_1", email: "mod@example.com", role: "moderator" },
        db: { prepare },
        kv,
        body: { poemSlug: "jing-ye-si", task: "translation", sourceText: "床前明月光" }
      })
    );

    expect(response.status).toBe(429);
    expect(fetcher).not.toHaveBeenCalled();
    expect(prepare).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Daily AI draft limit reached."
    });
  });

  it.each(["explanation", "translation", "line-notes", "related-poems"] as const)(
    "stores %s output as a draft",
    async (task) => {
      enableAi();
      const run = vi.fn().mockResolvedValue({});
      const bind = vi.fn().mockReturnValue({ run });
      const prepare = vi.fn().mockReturnValue({ bind });
      const kv = {
        get: vi.fn().mockResolvedValue(null),
        put: vi.fn().mockResolvedValue(undefined)
      };
      const fetcher = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ text: `${task} draft` })
      });
      vi.stubGlobal("fetch", fetcher);

      const response = await POST(
        createContext({
          user: { id: "mod_1", email: "mod@example.com", role: "moderator" },
          db: { prepare },
          kv,
          body: { poemSlug: "jing-ye-si", task, sourceText: "床前明月光" }
        })
      );

      expect(response.status).toBe(202);
      expect(fetcher).toHaveBeenCalledWith(
        "https://ai.example/v1",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ authorization: "Bearer secret" })
        })
      );
      expect(prepare).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO ai_drafts"));
      expect(bind).toHaveBeenCalledWith(
        expect.stringMatching(/^ai_draft_/),
        "jing-ye-si",
        task,
        "poetry-editorial-v1",
        "ai.example",
        "poetry-model",
        `poem:jing-ye-si:${task}:poetry-editorial-v1`,
        expect.stringMatching(/^[a-f0-9]{64}$/),
        `${task} draft`,
        "draft"
      );
      await expect(response.json()).resolves.toMatchObject({
        ok: true,
        draft: {
          poemSlug: "jing-ye-si",
          task,
          text: `${task} draft`,
          status: "draft",
          promptVersion: "poetry-editorial-v1",
          model: "poetry-model"
        }
      });
    }
  );

  it("returns provider errors without storing a draft", async () => {
    enableAi();
    const run = vi.fn().mockResolvedValue({});
    const bind = vi.fn().mockReturnValue({ run });
    const prepare = vi.fn().mockReturnValue({ bind });
    const kv = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined)
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({})
      })
    );

    const response = await POST(
      createContext({
        user: { id: "mod_1", email: "mod@example.com", role: "moderator" },
        db: { prepare },
        kv,
        body: { poemSlug: "jing-ye-si", task: "explanation", sourceText: "床前明月光" }
      })
    );

    expect(response.status).toBe(502);
    expect(prepare).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "AI provider request failed."
    });
  });
});
