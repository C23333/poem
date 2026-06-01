import { describe, expect, it, vi } from "vitest";
import { DELETE, GET, POST } from "./saved-poems";

function createContext(input: {
  user?: { id: string; email: string };
  db?: unknown;
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
          POETRY_DB: input.db
        }
      }
    },
    request: new Request(input.url || "https://poem.example/api/saved-poems", {
      method: input.body || formBody ? "POST" : "GET",
      body: input.body ? JSON.stringify(input.body) : formBody,
      headers: formBody ? { "content-type": "application/x-www-form-urlencoded" } : undefined
    })
  } as never;
}

describe("saved poems API", () => {
  it("returns disabled when personal center is off", async () => {
    const response = await GET(createContext());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "saved poems is disabled"
    });
  });

  it("requires authentication when enabled", async () => {
    vi.stubEnv("PUBLIC_ENABLE_PERSONAL_CENTER", "true");

    const response = await POST(createContext({ body: { poemSlug: "jing-ye-si" } }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Authentication is required"
    });
  });

  it("rejects unreviewed poem slugs", async () => {
    vi.stubEnv("PUBLIC_ENABLE_PERSONAL_CENTER", "true");

    const response = await POST(
      createContext({
        user: { id: "user_1", email: "reader@example.com" },
        body: { poemSlug: "jiang-ye" }
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Only reviewed poems can be saved."
    });
  });

  it("fails explicitly when D1 is not configured", async () => {
    vi.stubEnv("PUBLIC_ENABLE_PERSONAL_CENTER", "true");

    const response = await POST(
      createContext({
        user: { id: "user_1", email: "reader@example.com" },
        body: { poemSlug: "jing-ye-si" }
      })
    );

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "saved poems database is not configured"
    });
  });

  it("saves a reviewed poem for the authenticated user", async () => {
    vi.stubEnv("PUBLIC_ENABLE_PERSONAL_CENTER", "true");
    const run = vi.fn().mockResolvedValue({});
    const bind = vi.fn().mockReturnValue({ run });
    const prepare = vi.fn().mockReturnValue({ bind });

    const response = await POST(
      createContext({
        user: { id: "user_1", email: "reader@example.com" },
        db: { prepare },
        body: { poemSlug: "jing-ye-si" }
      })
    );

    expect(response.status).toBe(200);
    expect(prepare).toHaveBeenCalledWith(expect.stringContaining("INSERT OR IGNORE INTO saved_poems"));
    expect(bind).toHaveBeenCalledWith("user_1", "jing-ye-si");
    await expect(response.json()).resolves.toEqual({
      ok: true,
      saved: true,
      poemSlug: "jing-ye-si"
    });
  });

  it("accepts poem slug from form submissions", async () => {
    vi.stubEnv("PUBLIC_ENABLE_PERSONAL_CENTER", "true");
    const run = vi.fn().mockResolvedValue({});
    const bind = vi.fn().mockReturnValue({ run });
    const prepare = vi.fn().mockReturnValue({ bind });

    const response = await POST(
      createContext({
        user: { id: "user_1", email: "reader@example.com" },
        db: { prepare },
        form: { poemSlug: "jing-ye-si" }
      })
    );

    expect(response.status).toBe(200);
    expect(bind).toHaveBeenCalledWith("user_1", "jing-ye-si");
  });

  it("unsaves a reviewed poem for the authenticated user", async () => {
    vi.stubEnv("PUBLIC_ENABLE_PERSONAL_CENTER", "true");
    const run = vi.fn().mockResolvedValue({});
    const bind = vi.fn().mockReturnValue({ run });
    const prepare = vi.fn().mockReturnValue({ bind });

    const response = await DELETE(
      createContext({
        user: { id: "user_1", email: "reader@example.com" },
        db: { prepare },
        url: "https://poem.example/api/saved-poems?poemSlug=jing-ye-si"
      })
    );

    expect(response.status).toBe(200);
    expect(prepare).toHaveBeenCalledWith(expect.stringContaining("DELETE FROM saved_poems"));
    expect(bind).toHaveBeenCalledWith("user_1", "jing-ye-si");
    await expect(response.json()).resolves.toEqual({
      ok: true,
      saved: false,
      poemSlug: "jing-ye-si"
    });
  });
});
