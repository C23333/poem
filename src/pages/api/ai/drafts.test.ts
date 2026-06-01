import { describe, expect, it } from "vitest";
import { POST } from "./drafts";

describe("AI drafts API", () => {
  it("returns disabled when AI is off", async () => {
    const response = await POST();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "AI provider is disabled"
    });
  });
});
