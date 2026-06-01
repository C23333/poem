import { describe, expect, it } from "vitest";
import { isReviewedPoemSlug } from "./reviewed-poems";

describe("reviewed poem registry", () => {
  it("allows reviewed or published poem slugs", () => {
    expect(isReviewedPoemSlug("jing-ye-si")).toBe(true);
  });

  it("rejects unreviewed poem slugs", () => {
    expect(isReviewedPoemSlug("jiang-ye")).toBe(false);
  });
});
