import { describe, expect, it } from "vitest";
import {
  hashSubscriptionToken,
  isSubscriptionRow,
  parseSubscriptionBody,
  serializeSubscriptionRow
} from "./subscriptions";

describe("subscription helpers", () => {
  it("parses a valid daily-poem subscription request", () => {
    expect(
      parseSubscriptionBody({
        email: " Reader@Example.COM ",
        interestTags: ["moon", "homesickness", ""]
      })
    ).toEqual({
      email: "reader@example.com",
      interestTags: ["moon", "homesickness"]
    });
  });

  it("rejects invalid subscription email", () => {
    expect(() => parseSubscriptionBody({ email: "not-an-email", interestTags: ["moon"] })).toThrow(
      "A valid email is required."
    );
  });

  it("hashes unsubscribe tokens without exposing the raw token", async () => {
    const hash = await hashSubscriptionToken("secret-token");

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toContain("secret-token");
  });

  it("serializes subscription rows for APIs", () => {
    const row = {
      id: "sub_1",
      email: "reader@example.com",
      interest_tags: JSON.stringify(["moon"]),
      status: "pending",
      created_at: "2026-06-01 10:00:00",
      updated_at: "2026-06-01 10:00:00"
    };

    expect(isSubscriptionRow(row)).toBe(true);
    expect(serializeSubscriptionRow(row)).toEqual({
      id: "sub_1",
      email: "reader@example.com",
      interestTags: ["moon"],
      status: "pending",
      createdAt: "2026-06-01 10:00:00",
      updatedAt: "2026-06-01 10:00:00"
    });
  });
});
