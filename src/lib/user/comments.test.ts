import { describe, expect, it, vi } from "vitest";
import { checkCommentRateLimit, parseCommentBody, serializeApprovedCommentRows } from "./comments";

describe("comment helpers", () => {
  it("parses valid comment body from JSON", () => {
    expect(parseCommentBody({ poemSlug: "jing-ye-si", body: "这句很有画面。" })).toEqual({
      poemSlug: "jing-ye-si",
      body: "这句很有画面。"
    });
  });

  it("rejects empty comments", () => {
    expect(() => parseCommentBody({ poemSlug: "jing-ye-si", body: " " })).toThrow("Comment body is required.");
  });

  it("rejects long comments", () => {
    expect(() => parseCommentBody({ poemSlug: "jing-ye-si", body: "x".repeat(1201) })).toThrow(
      "Comment body must be 1200 characters or fewer."
    );
  });

  it("serializes approved comment rows without private fields", () => {
    expect(
      serializeApprovedCommentRows([
        {
          id: "comment_1",
          user_id: "user_1",
          poem_slug: "jing-ye-si",
          body: "好句。",
          created_at: "2026-06-01 10:00:00"
        }
      ])
    ).toEqual([
      {
        id: "comment_1",
        poemSlug: "jing-ye-si",
        body: "好句。",
        createdAt: "2026-06-01 10:00:00"
      }
    ]);
  });

  it("blocks repeated comments inside the rate-limit window", async () => {
    const kv = {
      get: vi.fn().mockResolvedValue("1"),
      put: vi.fn()
    };

    await expect(checkCommentRateLimit(kv, "user_1")).resolves.toEqual({
      allowed: false,
      error: "Please wait before submitting another comment."
    });
  });

  it("records a rate-limit marker when allowed", async () => {
    const kv = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined)
    };

    await expect(checkCommentRateLimit(kv, "user_1")).resolves.toEqual({ allowed: true });
    expect(kv.put).toHaveBeenCalledWith("comment:user_1", "1", { expirationTtl: 60 });
  });
});
