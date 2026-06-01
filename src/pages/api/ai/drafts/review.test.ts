import { describe, expect, it, vi } from "vitest";
import { POST } from "./review";

function enableAi() {
  vi.stubEnv("PUBLIC_ENABLE_AI", "true");
  vi.stubEnv("AI_PROVIDER_ENDPOINT", "https://ai.example/v1");
  vi.stubEnv("AI_PROVIDER_MODEL", "poetry-model");
  vi.stubEnv("AI_PROVIDER_TOKEN", "secret");
  vi.stubEnv("AI_DAILY_DRAFT_LIMIT", "10");
}

function createContext(input: {
  user?: { id: string; email: string; role?: "reader" | "moderator" | "admin" };
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
    request: new Request("https://poem.example/api/ai/drafts/review", {
      method: "POST",
      body: input.body ? JSON.stringify(input.body) : undefined
    })
  } as never;
}

describe("AI draft review API", () => {
  it("returns disabled when AI is off", async () => {
    const response = await POST(createContext());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "AI provider is disabled"
    });
  });

  it("requires a moderator or admin user", async () => {
    enableAi();

    const response = await POST(
      createContext({
        user: { id: "user_1", email: "reader@example.com", role: "reader" },
        body: { draftId: "ai_draft_1", action: "approve" }
      })
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Moderator or admin role is required for AI draft review"
    });
  });

  it("fails explicitly when D1 is not configured", async () => {
    enableAi();

    const response = await POST(
      createContext({
        user: { id: "mod_1", email: "mod@example.com", role: "moderator" },
        body: { draftId: "ai_draft_1", action: "approve" }
      })
    );

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "AI drafts database is not configured"
    });
  });

  it("rejects invalid review actions", async () => {
    enableAi();
    const run = vi.fn().mockResolvedValue({});
    const bind = vi.fn().mockReturnValue({ run });
    const prepare = vi.fn().mockReturnValue({ bind });

    const response = await POST(
      createContext({
        user: { id: "mod_1", email: "mod@example.com", role: "moderator" },
        db: { prepare },
        body: { draftId: "ai_draft_1", action: "publish" }
      })
    );

    expect(response.status).toBe(400);
    expect(prepare).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Valid draftId and review action are required"
    });
  });

  it("updates draft review status without publishing content", async () => {
    enableAi();
    const run = vi.fn().mockResolvedValue({});
    const bind = vi.fn().mockReturnValue({ run });
    const prepare = vi.fn().mockReturnValue({ bind });

    const response = await POST(
      createContext({
        user: { id: "mod_1", email: "mod@example.com", role: "moderator" },
        db: { prepare },
        body: { draftId: "ai_draft_1", action: "approve" }
      })
    );

    expect(response.status).toBe(200);
    expect(prepare).toHaveBeenCalledWith(expect.stringContaining("UPDATE ai_drafts"));
    expect(bind).toHaveBeenCalledWith("approved", "mod_1", "ai_draft_1");
    await expect(response.json()).resolves.toEqual({
      ok: true,
      draftId: "ai_draft_1",
      status: "approved",
      published: false
    });
  });
});
