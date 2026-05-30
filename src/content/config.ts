import { defineCollection, z } from "astro:content";

const poemLine = z.object({
  zh: z.string(),
  en: z.string().optional(),
  zhHelper: z.string().optional(),
  pinyin: z.string().optional()
});

const poems = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    titleEn: z.string().optional(),
    poet: z.string(),
    dynasty: z.string(),
    themes: z.array(z.string()),
    reviewed: z.boolean().default(false),
    original: z.array(z.string()),
    translationEn: z.array(z.string()).default([]),
    explanationZh: z.string(),
    commentaryZh: z.string(),
    commentaryEn: z.string().default(""),
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

export const collections = { poems, poets, themes };
