import { describe, expect, it, vi } from "vitest";
import { createAiDraft, disabledAiResponse } from "./provider";

describe("AI provider adapter", () => {
  it("returns an explicit disabled response without calling a provider", async () => {
    const fetcher = vi.fn();

    await expect(
      createAiDraft(
        {
          enabled: false,
          endpoint: "",
          model: "",
          token: "",
          dailyDraftLimit: 10,
          promptVersion: "poetry-editorial-v1"
        },
        {
          poemSlug: "jing-ye-si",
          task: "explanation",
          sourceText: "床前明月光"
        },
        fetcher
      )
    ).resolves.toEqual(disabledAiResponse());

    expect(fetcher).not.toHaveBeenCalled();
  });

  it("builds a provider request when fully configured", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ text: "Draft explanation" })
    });

    await expect(
      createAiDraft(
        {
          enabled: true,
          endpoint: "https://ai.example/v1",
          model: "poetry-model",
          token: "secret",
          dailyDraftLimit: 10,
          promptVersion: "poetry-editorial-v1"
        },
        {
          poemSlug: "jing-ye-si",
          task: "explanation",
          sourceText: "床前明月光"
        },
        fetcher
      )
    ).resolves.toEqual({
      ok: true,
      draft: {
        poemSlug: "jing-ye-si",
        task: "explanation",
        text: "Draft explanation",
        promptVersion: "poetry-editorial-v1",
        model: "poetry-model",
        status: "draft"
      }
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://ai.example/v1",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer secret"
        })
      })
    );
  });
});
