type Statement = {
  sql: string;
  params: Array<string | number | null>;
};

export function createAiDraftStatement(input: {
  id: string;
  poemSlug: string;
  task: string;
  promptVersion: string;
  providerName: string;
  modelName: string;
  inputContentKey: string;
  outputHash: string;
  outputText: string;
}): Statement {
  return {
    sql: `
      INSERT INTO ai_drafts (
        id, poem_slug, task, prompt_version, provider_name, model_name,
        input_content_key, output_hash, output_text, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    params: [
      input.id,
      input.poemSlug,
      input.task,
      input.promptVersion,
      input.providerName,
      input.modelName,
      input.inputContentKey,
      input.outputHash,
      input.outputText,
      "draft"
    ]
  };
}

export function reviewAiDraftStatement(input: {
  id: string;
  status: "approved" | "rejected" | "needs-review";
  reviewerUserId: string;
}): Statement {
  return {
    sql: "UPDATE ai_drafts SET status = ?, reviewer_user_id = ?, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    params: [input.status, input.reviewerUserId, input.id]
  };
}
