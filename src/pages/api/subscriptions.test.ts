import { describe, expect, it, vi } from "vitest";
import { POST } from "./subscriptions";

function createContext(input: {
  user?: { id: string; email: string };
  db?: unknown;
  kv?: unknown;
  body?: unknown;
  form?: Record<string, string>;
} = {}) {
  const formBody = input.form ? new URLSearchParams(input.form) : undefined;
  return {
    locals: {
      user: input.user,
      runtime: {
        env: {
          POETRY_DB: input.db,
          POETRY_TOKENS: input.kv
        }
      }
    },
    request: new Request("https://poem.example/api/subscriptions", {
      method: "POST",
      body: input.body ? JSON.stringify(input.body) : formBody,
      headers: formBody ? { "content-type": "application/x-www-form-urlencoded" } : undefined
    })
  } as never;
}

describe("subscriptions API", () => {
  it("returns disabled when subscriptions are off", async () => {
    const response = await POST(createContext({ body: { email: "reader@example.com" } }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "subscriptions is disabled"
    });
  });

  it("fails explicitly when D1 is not configured", async () => {
    vi.stubEnv("PUBLIC_ENABLE_SUBSCRIPTION", "true");
    vi.stubEnv("PUBLIC_SUBSCRIPTION_ENDPOINT", "/api/subscriptions");

    const response = await POST(createContext({ body: { email: "reader@example.com", interestTags: ["moon"] } }));

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "subscriptions database is not configured"
    });
  });

  it("fails explicitly when token KV is not configured", async () => {
    vi.stubEnv("PUBLIC_ENABLE_SUBSCRIPTION", "true");
    vi.stubEnv("PUBLIC_SUBSCRIPTION_ENDPOINT", "/api/subscriptions");
    const run = vi.fn().mockResolvedValue({});
    const bind = vi.fn().mockReturnValue({ run });
    const prepare = vi.fn().mockReturnValue({ bind });

    const response = await POST(createContext({ db: { prepare }, body: { email: "reader@example.com" } }));

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "subscription token storage is not configured"
    });
  });

  it("stores a pending subscription and token hash without sending email", async () => {
    vi.stubEnv("PUBLIC_ENABLE_SUBSCRIPTION", "true");
    vi.stubEnv("PUBLIC_SUBSCRIPTION_ENDPOINT", "/api/subscriptions");
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
        body: {
          email: "Reader@Example.COM",
          interestTags: ["moon", "homesickness"]
        }
      })
    );

    expect(response.status).toBe(202);
    expect(prepare).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO subscriptions"));
    expect(bind).toHaveBeenCalledWith(
      expect.stringMatching(/^sub_/),
      "user_1",
      "reader@example.com",
      JSON.stringify(["moon", "homesickness"]),
      "pending",
      expect.stringMatching(/^[a-f0-9]{64}$/)
    );
    expect(kv.put).toHaveBeenCalledWith(
      expect.stringMatching(/^subscription:unsubscribe:/),
      expect.stringMatching(/^sub_/),
      { expirationTtl: 60 * 60 * 24 * 30 }
    );
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      status: "pending",
      email: "reader@example.com",
      emailDelivery: "not_configured"
    });
  });

  it("accepts subscription form submissions", async () => {
    vi.stubEnv("PUBLIC_ENABLE_SUBSCRIPTION", "true");
    vi.stubEnv("PUBLIC_SUBSCRIPTION_ENDPOINT", "/api/subscriptions");
    const run = vi.fn().mockResolvedValue({});
    const bind = vi.fn().mockReturnValue({ run });
    const prepare = vi.fn().mockReturnValue({ bind });
    const kv = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined)
    };

    const response = await POST(
      createContext({
        db: { prepare },
        kv,
        form: {
          email: "reader@example.com",
          interests: "moon",
          interestTags: "homesickness"
        }
      })
    );

    expect(response.status).toBe(202);
    expect(bind).toHaveBeenCalledWith(
      expect.stringMatching(/^sub_/),
      null,
      "reader@example.com",
      JSON.stringify(["moon", "homesickness"]),
      "pending",
      expect.stringMatching(/^[a-f0-9]{64}$/)
    );
  });
});
