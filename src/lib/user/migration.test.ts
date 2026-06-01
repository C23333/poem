import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(join(process.cwd(), "migrations", "0001_user_engagement.sql"), "utf8");
const allMigrations = [
  "0001_user_engagement.sql",
  "0002_ai_drafts.sql",
  "0003_subscription_tokens.sql"
]
  .map((name) => {
    try {
      return readFileSync(join(process.cwd(), "migrations", name), "utf8");
    } catch {
      return "";
    }
  })
  .join("\n");

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

  it("stores unsubscribe token hashes for daily poem subscriptions", () => {
    expect(allMigrations).toContain("unsubscribe_token_hash TEXT");
  });
});
