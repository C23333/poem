import { describe, expect, it, vi } from "vitest";
import { GET, POST } from "./comments";

function createContext(input: {
  user?: { id: string; email: string };
  db?: unknown;
  kv?: unknown;
  body?: unknown;
  form?: Record<string, string>;
  url?: string;
} = {}) {
  const formBody = input.form ? new URLSearchParams(input.form) : undefined;
  return {
    locals: {
      user: input.user,
      runtime: {
        env: {
          POETRY_DB: input.db,
          POETRY_RATE_LIMIT: input.kv
        }
      }
    },
    request: new Request(input.url || "https://poem.example/api/comments?poemSlug=jing-ye-si", {
      method: input.body || formBody ? "POST" : "GET",
      body: input.body ? JSON.stringify(input.body) : formBody,
      headers: formBody ? { "content-type": "application/x-www-form-urlencoded" } : undefined
    })
  } as never;
}

describe("comments API", () => {
  it("returns disabled when comments are off", async () => {
    const response = await GET(createContext());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "comments is disabled"
    });
  });

  it("reads approved comments for reviewed poems", async () => {
    vi.stubEnv("PUBLIC_ENABLE_COMMENTS", "true");
    const all = vi.fn().mockResolvedValue({
      results: [
        {
          id: "comment_1",
          user_id: "user_1",
          poem_slug: "jing-ye-si",
          body: "好句。",
          created_at: "2026-06-01 10:00:00"
        }
      ]
    });
    const bind = vi.fn().mockReturnValue({ all });
    const prepare = vi.fn().mockReturnValue({ bind });

    const response = await GET(createContext({ db: { prepare } }));

    expect(response.status).toBe(200);
    expect(prepare).toHaveBeenCalledWith(expect.stringContaining("status = 'approved'"));
    expect(bind).toHaveBeenCalledWith("jing-ye-si");
    await expect(response.json()).resolves.toEqual({
      ok: true,
      comments: [
        {
          id: "comment_1",
          poemSlug: "jing-ye-si",
          body: "好句。",
          createdAt: "2026-06-01 10:00:00"
        }
      ]
    });
  });

  it("requires authentication before submitting comments", async () => {
    vi.stubEnv("PUBLIC_ENABLE_COMMENTS", "true");

    const response = await POST(createContext({ body: { poemSlug: "jing-ye-si", body: "好句。" } }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Authentication is required before comments can be submitted"
    });
  });

  it("requires rate-limit KV before accepting comments", async () => {
    vi.stubEnv("PUBLIC_ENABLE_COMMENTS", "true");

    const response = await POST(
      createContext({
        user: { id: "user_1", email: "reader@example.com" },
        body: { poemSlug: "jing-ye-si", body: "好句。" }
      })
    );

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "comment rate limit is not configured"
    });
  });

  it("stores new comments as pending", async () => {
    vi.stubEnv("PUBLIC_ENABLE_COMMENTS", "true");
    const run = vi.fn().mockResolvedValue({});
    const bind = vi.fn().mockReturnValue({ run });
    const prepare = vi.fn().mockReturnValue({ bind });
    const kv = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined)
    };

    const response = await POST(
      createContext({
        user: { id: "user_1", email: "reader@example.com" },
        db: { prepare },
        kv,
        body: { poemSlug: "jing-ye-si", body: "好句。" }
      })
    );

    expect(response.status).toBe(202);
    expect(prepare).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO comments"));
    expect(bind).toHaveBeenCalledWith(expect.stringMatching(/^comment_/), "user_1", "jing-ye-si", "好句。", "pending");
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      status: "pending",
      poemSlug: "jing-ye-si"
    });
  });

  it("accepts comment form submissions", async () => {
    vi.stubEnv("PUBLIC_ENABLE_COMMENTS", "true");
    const run = vi.fn().mockResolvedValue({});
    const bind = vi.fn().mockReturnValue({ run });
    const prepare = vi.fn().mockReturnValue({ bind });
    const kv = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined)
    };

    const response = await POST(
      createContext({
        user: { id: "user_1", email: "reader@example.com" },
        db: { prepare },
        kv,
        form: { poemSlug: "jing-ye-si", body: "好句。" }
      })
    );

    expect(response.status).toBe(202);
    expect(bind).toHaveBeenCalledWith(expect.stringMatching(/^comment_/), "user_1", "jing-ye-si", "好句。", "pending");
  });
});
