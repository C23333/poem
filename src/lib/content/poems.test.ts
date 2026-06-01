import { describe, expect, it } from "vitest";
import { displayPoetName, hasEnglishAssets, hasLineHelpers, isIndexablePoem, poemPath } from "./poems";

const reviewedPoem = {
  slug: "jing-ye-si",
  data: {
    title: "静夜思",
    titleEn: "Quiet Night Thoughts",
    reviewed: true,
    original: ["床前明月光，", "疑是地上霜。"],
    explanationZh: "这首诗写月夜里的乡思。",
    commentaryZh: "诗里的月光不是纯风景。",
    translationEn: ["Moonlight shines before my bed.", "I almost think it is frost upon the ground."],
    commentaryEn: "The moonlight becomes a trigger for homesickness.",
    lines: [
      {
        zh: "床前明月光，",
        en: "Moonlight shines before my bed.",
        zhHelper: "床前洒着明亮的月光。"
      }
    ]
  }
};

const thinPoem = {
  slug: "thin",
  data: {
    title: "薄页",
    reviewed: false,
    original: ["一句诗。"],
    explanationZh: "",
    commentaryZh: "",
    translationEn: [],
    commentaryEn: "",
    lines: []
  }
};

describe("poem content helpers", () => {
  it("marks reviewed value-added poem as indexable", () => {
    expect(isIndexablePoem(reviewedPoem)).toBe(true);
  });

  it("allows published value-added poems", () => {
    expect(
      isIndexablePoem({
        ...reviewedPoem,
        data: { ...reviewedPoem.data, reviewState: "published", reviewed: true }
      })
    ).toBe(true);
  });

  it("excludes AI drafts even when value-added text exists", () => {
    expect(
      isIndexablePoem({
        ...reviewedPoem,
        data: { ...reviewedPoem.data, reviewState: "ai-draft", reviewed: true }
      })
    ).toBe(false);
  });

  it("excludes needs-review pages even when reviewed flag is true", () => {
    expect(
      isIndexablePoem({
        ...reviewedPoem,
        data: { ...reviewedPoem.data, reviewState: "needs-review", reviewed: true }
      })
    ).toBe(false);
  });

  it("marks thin poem as not indexable", () => {
    expect(isIndexablePoem(thinPoem)).toBe(false);
  });

  it("detects English assets", () => {
    expect(hasEnglishAssets(reviewedPoem)).toBe(true);
    expect(hasEnglishAssets(thinPoem)).toBe(false);
  });

  it("detects line helpers", () => {
    expect(hasLineHelpers(reviewedPoem, "en")).toBe(true);
    expect(hasLineHelpers(reviewedPoem, "zh")).toBe(true);
  });

  it("builds locale-aware poem paths", () => {
    expect(poemPath("jing-ye-si", "zh-CN")).toBe("/poems/jing-ye-si");
    expect(poemPath("jing-ye-si", "en")).toBe("/en/poems/jing-ye-si");
  });

  it("uses poet collection data for display names", () => {
    expect(
      displayPoetName(
        { data: { poet: "li-bai" } },
        [{ slug: "li-bai", data: { name: "李白", nameEn: "Li Bai" } }]
      )
    ).toEqual({ zh: "李白", en: "Li Bai" });
  });
});
