import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(join(process.cwd(), "migrations", "0002_ai_drafts.sql"), "utf8");

describe("AI draft migration", () => {
  it("defines the AI drafts audit table", () => {
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS ai_drafts");
    for (const column of [
      "prompt_version",
      "provider_name",
      "model_name",
      "input_content_key",
      "output_hash",
      "status",
      "reviewer_user_id"
    ]) {
      expect(migration).toContain(column);
    }
  });

  it("keeps AI drafts non-published by default", () => {
    expect(migration).toContain("status TEXT NOT NULL DEFAULT 'draft'");
  });
});
