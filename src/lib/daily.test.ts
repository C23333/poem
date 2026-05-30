import { describe, expect, it } from "vitest";
import { dailyPoemSlug } from "./daily";

describe("daily poem selection", () => {
  it("selects a deterministic poem for a date", () => {
    expect(dailyPoemSlug(["jing-ye-si", "guan-ju"], new Date("2026-05-29T00:00:00Z"))).toBe("guan-ju");
  });

  it("handles a single poem", () => {
    expect(dailyPoemSlug(["jing-ye-si"], new Date("2026-05-29T00:00:00Z"))).toBe("jing-ye-si");
  });
});
