import { describe, expect, it, vi } from "vitest";
import { checkAiDraftRateLimit } from "./rate-limit";

describe("AI draft rate limit", () => {
  it("increments a per-user daily counter before draft generation", async () => {
    const kv = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined)
    };

    await expect(
      checkAiDraftRateLimit(kv, {
        userId: "mod_1",
        dailyLimit: 10,
        now: new Date("2026-06-01T12:00:00.000Z")
      })
    ).resolves.toEqual({ allowed: true });

    expect(kv.get).toHaveBeenCalledWith("ai-draft:2026-06-01:mod_1");
    expect(kv.put).toHaveBeenCalledWith("ai-draft:2026-06-01:mod_1", "1", { expirationTtl: 43200 });
  });

  it("blocks requests after the configured daily draft limit", async () => {
    const kv = {
      get: vi.fn().mockResolvedValue("10"),
      put: vi.fn().mockResolvedValue(undefined)
    };

    await expect(
      checkAiDraftRateLimit(kv, {
        userId: "mod_1",
        dailyLimit: 10,
        now: new Date("2026-06-01T12:00:00.000Z")
      })
    ).resolves.toEqual({
      allowed: false,
      error: "Daily AI draft limit reached."
    });

    expect(kv.put).not.toHaveBeenCalled();
  });
});
