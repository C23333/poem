import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(join(process.cwd(), "migrations", "0001_user_engagement.sql"), "utf8");

describe("user engagement migration", () => {
  it("defines all required user engagement tables", () => {
    for (const table of [
      "users",
      "user_identities",
      "user_preferences",
      "saved_poems",
      "reading_history",
      "subscriptions",
      "comments",
      "moderation_events"
    ]) {
      expect(migration).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    }
  });

  it("stores new comments as pending by default", () => {
    expect(migration).toContain("status TEXT NOT NULL DEFAULT 'pending'");
  });
});
