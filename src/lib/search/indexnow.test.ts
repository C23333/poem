import { describe, expect, it } from "vitest";
import { indexNowKeyResponse, isValidIndexNowKey } from "./indexnow.js";

describe("IndexNow key route helpers", () => {
  it("accepts documented key characters and length", () => {
    expect(isValidIndexNowKey("abcDEF-12345678")).toBe(true);
  });

  it("rejects missing or unsafe key values", () => {
    expect(isValidIndexNowKey("")).toBe(false);
    expect(isValidIndexNowKey("../secret")).toBe(false);
    expect(isValidIndexNowKey("short")).toBe(false);
  });

  it("returns key text only when route param matches configured key", () => {
    const response = indexNowKeyResponse({
      requestedKey: "abcDEF-12345678",
      configuredKey: "abcDEF-12345678"
    });

    expect(response.status).toBe(200);
    expect(response.body).toBe("abcDEF-12345678");
  });

  it("returns 404 when no IndexNow key is configured", () => {
    const response = indexNowKeyResponse({
      requestedKey: "abcDEF-12345678",
      configuredKey: ""
    });

    expect(response.status).toBe(404);
  });
});
