import { describe, expect, it } from "vitest";
import { evaluateAiDraftQuality } from "./quality";

describe("AI draft quality checks", () => {
  it("flags empty output", () => {
    expect(
      evaluateAiDraftQuality({
        task: "translation",
        sourceText: "床前明月光",
        outputText: " "
      })
    ).toEqual({
      status: "needs-review",
      issues: ["empty-output"]
    });
  });

  it("flags output that duplicates the source text", () => {
    expect(
      evaluateAiDraftQuality({
        task: "explanation",
        sourceText: "床前明月光",
        outputText: "床前明月光"
      }).issues
    ).toContain("duplicate-source-text");
  });

  it("flags unsupported historical claims when no source note is present", () => {
    const result = evaluateAiDraftQuality({
      task: "explanation",
      sourceText: "床前明月光",
      outputText: "李白于唐玄宗开元十五年在长安写下此诗。"
    });

    expect(result).toEqual({
      status: "needs-review",
      issues: ["missing-source-note"]
    });
  });

  it("accepts a sourced historical note within length boundaries", () => {
    const result = evaluateAiDraftQuality({
      task: "explanation",
      sourceText: "床前明月光",
      outputText: "一种常见读法认为此诗借月光写乡思；来源：站内人工审校资料。"
    });

    expect(result).toEqual({
      status: "draft",
      issues: []
    });
  });

  it("flags text outside task length boundaries", () => {
    expect(
      evaluateAiDraftQuality({
        task: "related-poems",
        sourceText: "床前明月光",
        outputText: "太短"
      }).issues
    ).toContain("too-short");

    expect(
      evaluateAiDraftQuality({
        task: "translation",
        sourceText: "床前明月光",
        outputText: "a".repeat(2001)
      }).issues
    ).toContain("too-long");
  });
});
