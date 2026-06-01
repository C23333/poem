import { defineCollection, z } from "astro:content";

const poemLine = z.object({
  zh: z.string(),
  en: z.string().optional(),
  zhHelper: z.string().optional(),
  pinyin: z.string().optional()
});

const reviewState = z.enum(["draft", "ai-draft", "needs-review", "reviewed", "published"]).default("draft");

const poems = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    titleEn: z.string().optional(),
    canonicalSlug: z.string().optional(),
    poet: z.string(),
    dynasty: z.string(),
    themes: z.array(z.string()),
    collections: z.array(z.string()).default([]),
    reviewState,
    reviewed: z.boolean().default(false),
    original: z.array(z.string()),
    translationEn: z.array(z.string()).default([]),
    explanationZh: z.string(),
    commentaryZh: z.string(),
    commentaryEn: z.string().default(""),
    editorNote: z.string().default(""),
    relatedPoems: z.array(z.string()).default([]),
    source: z.string(),
    license: z.string(),
    updated: z.string(),
    lines: z.array(poemLine)
  })
});

const poets = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    nameEn: z.string().optional(),
    dynasty: z.string(),
    birthYear: z.number().optional(),
    deathYear: z.number().optional(),
    summaryZh: z.string(),
    summaryEn: z.string().optional()
  })
});

const themes = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    nameEn: z.string().optional(),
    summaryZh: z.string(),
    summaryEn: z.string().optional()
  })
});

const dynasties = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    nameEn: z.string().optional(),
    startYear: z.number().optional(),
    endYear: z.number().optional(),
    summaryZh: z.string(),
    summaryEn: z.string().optional()
  })
});

const poemCollections = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    nameEn: z.string().optional(),
    summaryZh: z.string(),
    summaryEn: z.string().optional(),
    poemSlugs: z.array(z.string()),
    reviewState
  })
});

const articles = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    titleEn: z.string().optional(),
    description: z.string(),
    author: z.string().default("未名诗阁编辑部"),
    tags: z.array(z.string()).default([]),
    relatedPoems: z.array(z.string()).default([]),
    reviewState,
    updated: z.string()
  })
});

export const collections = { poems, poets, themes, dynasties, collections: poemCollections, articles };
