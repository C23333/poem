import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { importPoems } from "../../../scripts/import-poems.mjs";

async function tempContentDir() {
  const root = await mkdtemp(join(tmpdir(), "poetry-import-"));
  const contentDir = join(root, "content");
  await mkdir(join(contentDir, "poems"), { recursive: true });
  return contentDir;
}

describe("poem import script", () => {
  it("imports public-domain poem data as draft markdown only", async () => {
    const contentDir = await tempContentDir();
    const inputPath = join(contentDir, "seed.json");
    await writeFile(
      inputPath,
      JSON.stringify([
        {
          slug: "wang-yue",
          title: "望岳",
          titleEn: "Gazing at Mount Tai",
          poet: "du-fu",
          dynasty: "唐",
          themes: ["landscape"],
          original: ["岱宗夫如何？", "齐鲁青未了。"],
          source: "Public-domain classical text.",
          license: "Original poem is public domain.",
          reviewState: "published",
          reviewed: true
        }
      ])
    );

    const result = await importPoems({ inputPath, contentDir });
    const output = await readFile(join(contentDir, "poems", "wang-yue.md"), "utf8");

    expect(result).toEqual({ imported: ["wang-yue"], skipped: [] });
    expect(output).toContain("reviewState: draft");
    expect(output).toContain("reviewed: false");
    expect(output).not.toContain("reviewState: published");
    expect(output).toContain("explanationZh: 待编辑。");
    expect(output).toContain("commentaryZh: 待编辑。");
  });

  it("refuses to overwrite existing poem files by default", async () => {
    const contentDir = await tempContentDir();
    const inputPath = join(contentDir, "seed.json");
    await writeFile(join(contentDir, "poems", "jing-ye-si.md"), "---\ntitle: 静夜思\n---\n");
    await writeFile(
      inputPath,
      JSON.stringify([
        {
          slug: "jing-ye-si",
          title: "静夜思",
          poet: "li-bai",
          dynasty: "唐",
          themes: ["homesickness"],
          original: ["床前明月光"],
          source: "Public-domain classical text.",
          license: "Original poem is public domain."
        }
      ])
    );

    await expect(importPoems({ inputPath, contentDir })).rejects.toThrow("already exists");
  });
});
