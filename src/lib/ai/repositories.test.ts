import { describe, expect, it } from "vitest";
import { createAiDraftStatement, reviewAiDraftStatement } from "./repositories";

describe("AI draft repositories", () => {
  it("builds an AI draft insert statement with audit metadata", () => {
    const statement = createAiDraftStatement({
      id: "draft_1",
      poemSlug: "jing-ye-si",
      task: "explanation",
      promptVersion: "poetry-editorial-v1",
      providerName: "configured-provider",
      modelName: "poetry-model",
      inputContentKey: "poem:jing-ye-si:v1",
      outputHash: "hash_1",
      outputText: "Draft explanation"
    });

    expect(statement.sql).toContain("INSERT INTO ai_drafts");
    expect(statement.params).toEqual([
      "draft_1",
      "jing-ye-si",
      "explanation",
      "poetry-editorial-v1",
      "configured-provider",
      "poetry-model",
      "poem:jing-ye-si:v1",
      "hash_1",
      "Draft explanation",
      "draft"
    ]);
  });

  it("builds a review update statement", () => {
    const statement = reviewAiDraftStatement({
      id: "draft_1",
      status: "approved",
      reviewerUserId: "reviewer_1"
    });

    expect(statement.sql).toContain("UPDATE ai_drafts");
    expect(statement.params).toEqual(["approved", "reviewer_1", "draft_1"]);
  });
});
