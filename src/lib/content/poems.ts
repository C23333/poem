type ReviewState = "draft" | "ai-draft" | "needs-review" | "reviewed" | "published";

type PoemLike = {
  slug: string;
  data: {
    poet?: string;
    reviewState?: ReviewState;
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

type PoetLike = {
  slug: string;
  data: {
    name: string;
    nameEn?: string;
  };
};

function isDiscoverableState(state: ReviewState | undefined, reviewed?: boolean): boolean {
  if (state) return state === "reviewed" || state === "published";
  return Boolean(reviewed);
}

export function isIndexablePoem(poem: PoemLike): boolean {
  const data = poem.data;
  return Boolean(
    isDiscoverableState(data.reviewState, data.reviewed) &&
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

export function displayPoetName(poem: Pick<PoemLike, "data">, poets: PoetLike[]) {
  const poet = poets.find((item) => item.slug === poem.data.poet);
  return {
    zh: poet?.data.name || poem.data.poet || "",
    en: poet?.data.nameEn || poet?.data.name || poem.data.poet || ""
  };
}
