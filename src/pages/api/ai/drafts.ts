import { getAiProviderConfig } from "@/config/site";
import { createAiDraft } from "@/lib/ai/provider";
import { outputHash } from "@/lib/ai/hash";
import { evaluateAiDraftQuality } from "@/lib/ai/quality";
import { checkAiDraftRateLimit } from "@/lib/ai/rate-limit";
import { createAiDraftStatement } from "@/lib/ai/repositories";
import { isReviewedPoemSlug } from "@/lib/content/reviewed-poems";
import { jsonResponse, missingImplementationResponse } from "@/lib/user/api";
import { getD1Database, getRateLimitKv, getRequestUser } from "@/lib/user/runtime";

export const prerender = false;

const AI_DRAFT_TASKS = ["explanation", "translation", "line-notes", "related-poems"] as const;
type AiDraftTask = (typeof AI_DRAFT_TASKS)[number];

type RuntimeContext = Parameters<typeof getRequestUser>[0] & {
  request?: Request;
};

function runtimeEnv(context: RuntimeContext | undefined) {
  const raw = context?.locals?.runtime?.env || {};
  return Object.fromEntries(Object.entries(raw).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}

function providerName(endpoint: string) {
  try {
    return new URL(endpoint).hostname;
  } catch {
    return "configured-provider";
  }
}

function parseTask(value: unknown): AiDraftTask {
  if (AI_DRAFT_TASKS.includes(value as AiDraftTask)) return value as AiDraftTask;
  throw new Error("Unsupported AI draft task.");
}

async function parseAiDraftRequest(request: Request | undefined) {
  if (!request) throw new Error("AI draft request body is required.");
  const body = (await request.json()) as unknown;
  const input = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const poemSlug = typeof input.poemSlug === "string" ? input.poemSlug.trim() : "";
  const sourceText = typeof input.sourceText === "string" ? input.sourceText.trim() : "";

  if (!poemSlug) throw new Error("Poem slug is required.");
  if (!sourceText) throw new Error("AI draft source text is required.");

  return {
    poemSlug,
    sourceText,
    task: parseTask(input.task)
  };
}

export async function POST(context?: RuntimeContext) {
  const config = getAiProviderConfig({ ...import.meta.env, ...runtimeEnv(context) });
  if (!config.enabled) {
    return jsonResponse(
      {
        ok: false,
        error: "AI provider is disabled"
      },
      { status: 503 }
    );
  }

  const user = context ? getRequestUser(context) : undefined;
  if (!user) {
    return jsonResponse(
      {
        ok: false,
        error: "Authentication is required before AI drafts can be generated"
      },
      { status: 401 }
    );
  }

  if (user.role !== "moderator" && user.role !== "admin") {
    return jsonResponse(
      {
        ok: false,
        error: "Moderator or admin role is required for AI drafts"
      },
      { status: 403 }
    );
  }

  let input;
  try {
    input = await parseAiDraftRequest(context?.request);
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Invalid AI draft request."
      },
      { status: 400 }
    );
  }

  if (!isReviewedPoemSlug(input.poemSlug)) {
    return jsonResponse(
      {
        ok: false,
        error: "Only reviewed poems can receive AI drafts."
      },
      { status: 400 }
    );
  }

  const db = context ? getD1Database(context) : undefined;
  if (!db) return missingImplementationResponse("AI drafts database");

  const rateLimitKv = context ? getRateLimitKv(context) : undefined;
  if (!rateLimitKv) return missingImplementationResponse("AI draft rate limit");

  const limit = await checkAiDraftRateLimit(rateLimitKv, {
    userId: user.id,
    dailyLimit: config.dailyDraftLimit
  });
  if (!limit.allowed) {
    return jsonResponse(
      {
        ok: false,
        error: limit.error
      },
      { status: 429 }
    );
  }

  let result;
  try {
    result = await createAiDraft(config, input, (url, init) => fetch(url, init));
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : "AI provider request failed."
      },
      { status: 502 }
    );
  }

  if (!result.ok) {
    return jsonResponse(result, { status: 503 });
  }

  const draftId = `ai_draft_${crypto.randomUUID()}`;
  const inputContentKey = `poem:${input.poemSlug}:${input.task}:${config.promptVersion}`;
  const quality = evaluateAiDraftQuality({
    task: input.task,
    sourceText: input.sourceText,
    outputText: result.draft.text
  });
  const statement = createAiDraftStatement({
    id: draftId,
    poemSlug: input.poemSlug,
    task: input.task,
    promptVersion: config.promptVersion,
    providerName: providerName(config.endpoint),
    modelName: config.model,
    inputContentKey,
    outputHash: await outputHash(result.draft.text),
    outputText: result.draft.text,
    status: quality.status
  });

  await db.prepare(statement.sql).bind(...statement.params).run();

  return jsonResponse(
    {
      ok: true,
      draft: {
        id: draftId,
        poemSlug: result.draft.poemSlug,
        task: result.draft.task,
        text: result.draft.text,
        promptVersion: result.draft.promptVersion,
        model: result.draft.model,
        status: quality.status,
        qualityIssues: quality.issues
      }
    },
    { status: 202 }
  );
}
