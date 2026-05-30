type PoemLike = {
  slug: string;
  data: {
    reviewed?: boolean;
    original?: string[];
    explanationZh?: string;
    commentaryZh?: string;
    translationEn?: string[];
    commentaryEn?: string;
    lines?: Array<{
      zh: string;
      en?: string;
      zhHelper?: string;
      pinyin?: string;
    }>;
  };
};

export function isIndexablePoem(poem: PoemLike): boolean {
  const data = poem.data;
  return Boolean(
    data.reviewed &&
      data.original?.length &&
      data.explanationZh?.trim() &&
      data.commentaryZh?.trim() &&
      data.lines?.length
  );
}

export function hasEnglishAssets(poem: PoemLike): boolean {
  return Boolean(poem.data.translationEn?.length && poem.data.commentaryEn?.trim());
}

export function hasLineHelpers(poem: PoemLike, helper: "en" | "zh" | "pinyin"): boolean {
  return Boolean(
    poem.data.lines?.some((line) => {
      if (helper === "en") return line.en?.trim();
      if (helper === "zh") return line.zhHelper?.trim();
      return line.pinyin?.trim();
    })
  );
}

export function poemPath(slug: string, locale: "zh-CN" | "en"): string {
  return locale === "en" ? `/en/poems/${slug}` : `/poems/${slug}`;
}
