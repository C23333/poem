import type { getAiProviderConfig } from "@/config/site";

type AiProviderConfig = ReturnType<typeof getAiProviderConfig>;
type Fetcher = (url: string, init: RequestInit) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

export type AiDraftRequest = {
  poemSlug: string;
  task: "explanation" | "translation" | "line-notes" | "related-poems";
  sourceText: string;
};

export type AiDraftProviderDisabled = {
  ok: false;
  error: string;
};

export type AiDraftProviderSuccess = {
  ok: true;
  draft: {
    poemSlug: string;
    task: AiDraftRequest["task"];
    text: string;
    promptVersion: string;
    model: string;
    status: "draft";
  };
};

export type AiDraftProviderResult = AiDraftProviderDisabled | AiDraftProviderSuccess;

export function disabledAiResponse(): AiDraftProviderDisabled {
  return {
    ok: false,
    error: "AI provider is disabled"
  };
}

export async function createAiDraft(
  config: AiProviderConfig,
  request: AiDraftRequest,
  fetcher: Fetcher
): Promise<AiDraftProviderResult> {
  if (!config.enabled) return disabledAiResponse();

  const response = await fetcher(config.endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.token}`,
      "content-type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      model: config.model,
      promptVersion: config.promptVersion,
      task: request.task,
      poemSlug: request.poemSlug,
      sourceText: request.sourceText
    })
  });

  if (!response.ok) {
    throw new Error("AI provider request failed.");
  }

  const body = (await response.json()) as { text?: unknown };
  if (typeof body.text !== "string" || !body.text.trim()) {
    throw new Error("AI provider returned empty draft text.");
  }

  return {
    ok: true,
    draft: {
      poemSlug: request.poemSlug,
      task: request.task,
      text: body.text,
      promptVersion: config.promptVersion,
      model: config.model,
      status: "draft"
    }
  };
}
