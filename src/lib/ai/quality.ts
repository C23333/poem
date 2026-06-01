import type { AiDraftRequest } from "./provider";

export type AiDraftQualityIssue =
  | "empty-output"
  | "duplicate-source-text"
  | "missing-source-note"
  | "too-short"
  | "too-long";

type QualityInput = {
  task: AiDraftRequest["task"];
  sourceText: string;
  outputText: string;
};

const lengthBoundaries: Record<AiDraftRequest["task"], { min: number; max: number }> = {
  explanation: { min: 12, max: 1600 },
  translation: { min: 8, max: 2000 },
  "line-notes": { min: 12, max: 2400 },
  "related-poems": { min: 12, max: 1200 }
};

const historicalClaimPattern = /(李白|杜甫|唐玄宗|开元|天宝|长安|洛阳|朝代|年间|公元|生于|卒于|写于|作于)/;
const sourceNotePattern = /(来源|出处|参考|据|source|reference|according to)/i;

function normalizeText(text: string): string {
  return text.replace(/\s+/g, "").replace(/[，。！？；：、,.!?;:'"“”‘’]/g, "");
}

export function evaluateAiDraftQuality(input: QualityInput) {
  const output = input.outputText.trim();
  const issues: AiDraftQualityIssue[] = [];

  if (!output) {
    return {
      status: "needs-review" as const,
      issues: ["empty-output" as const]
    };
  }

  const boundary = lengthBoundaries[input.task];
  if (output.length < boundary.min) issues.push("too-short");
  if (output.length > boundary.max) issues.push("too-long");

  if (normalizeText(output) === normalizeText(input.sourceText)) {
    issues.push("duplicate-source-text");
  }

  if (historicalClaimPattern.test(output) && !sourceNotePattern.test(output)) {
    issues.push("missing-source-note");
  }

  return {
    status: issues.length > 0 ? ("needs-review" as const) : ("draft" as const),
    issues
  };
}
