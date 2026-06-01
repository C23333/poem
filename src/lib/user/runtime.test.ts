import { describe, expect, it } from "vitest";
import { getD1Database, getRateLimitKv, getRequestUser } from "./runtime";

describe("user runtime helpers", () => {
  it("returns the authenticated user from Astro locals", () => {
    expect(getRequestUser({ locals: { user: { id: "user_1", email: "reader@example.com" } } })).toEqual({
      id: "user_1",
      email: "reader@example.com"
    });
  });

  it("does not invent an authenticated user", () => {
    expect(getRequestUser({ locals: {} })).toBeUndefined();
  });

  it("reads the configured Cloudflare D1 binding", () => {
    const db = { prepare: () => ({}) };

    expect(getD1Database({ locals: { runtime: { env: { POETRY_DB: db } } } })).toBe(db);
  });

  it("returns undefined when the D1 binding is missing", () => {
    expect(getD1Database({ locals: { runtime: { env: {} } } })).toBeUndefined();
  });

  it("reads the configured rate-limit KV binding", () => {
    const kv = { get: async () => null, put: async () => undefined };

    expect(getRateLimitKv({ locals: { runtime: { env: { POETRY_RATE_LIMIT: kv } } } })).toBe(kv);
  });
});
