import { describe, expect, it } from "vitest";
import { outputHash } from "./hash";

describe("AI output hashing", () => {
  it("creates a stable hash for output audit records", async () => {
    await expect(outputHash("Draft explanation")).resolves.toMatch(/^[a-f0-9]{64}$/);
    await expect(outputHash("Draft explanation")).resolves.toBe(await outputHash("Draft explanation"));
  });
});
