import { describe, expect, it } from "vitest";
import { disabledFeatureResponse, missingImplementationResponse, requireFeature } from "./api";

describe("user API boundaries", () => {
  it("returns explicit disabled JSON", async () => {
    const response = disabledFeatureResponse("login");

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "login is disabled"
    });
  });

  it("guards disabled features", async () => {
    const response = requireFeature(false, "comments");

    expect(response?.status).toBe(503);
    await expect(response?.json()).resolves.toEqual({
      ok: false,
      error: "comments is disabled"
    });
  });

  it("returns explicit not implemented JSON for enabled but unwired features", async () => {
    const response = missingImplementationResponse("comments database");

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "comments database is not configured"
    });
  });
});
