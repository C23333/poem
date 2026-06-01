import { describe, expect, it, vi } from "vitest";
import { POST } from "./moderate";

function createContext(input: { user?: { id: string; email: string; role?: "reader" | "moderator" }; db?: unknown; body?: unknown } = {}) {
  return {
    locals: {
      user: input.user,
      runtime: {
        env: {
          POETRY_DB: input.db
        }
      }
    },
    request: new Request("https://poem.example/api/comments/moderate", {
      method: "POST",
      body: input.body ? JSON.stringify(input.body) : undefined
    })
  } as never;
}

describe("comment moderation API", () => {
  it("returns disabled when comments are off", async () => {
    const response = await POST(createContext());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "comments is disabled"
    });
  });

  it("requires a moderator user", async () => {
    vi.stubEnv("PUBLIC_ENABLE_COMMENTS", "true");

    const response = await POST(
      createContext({
        user: { id: "user_1", email: "reader@example.com", role: "reader" },
        body: { commentId: "comment_1", action: "approve" }
      })
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Moderator permission is required"
    });
  });

  it("updates comment status and records moderation event", async () => {
    vi.stubEnv("PUBLIC_ENABLE_COMMENTS", "true");
    const run = vi.fn().mockResolvedValue({});
    const bind = vi.fn().mockReturnValue({ run });
    const prepare = vi.fn().mockReturnValue({ bind });

    const response = await POST(
      createContext({
        user: { id: "mod_1", email: "mod@example.com", role: "moderator" },
        db: { prepare },
        body: { commentId: "comment_1", action: "approve", reason: "Reviewed manually" }
      })
    );

    expect(response.status).toBe(200);
    expect(prepare).toHaveBeenCalledWith(expect.stringContaining("UPDATE comments"));
    expect(prepare).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO moderation_events"));
    await expect(response.json()).resolves.toEqual({
      ok: true,
      commentId: "comment_1",
      status: "approved"
    });
  });
});
