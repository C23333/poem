import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

function yamlString(value) {
  return JSON.stringify(String(value ?? ""));
}

function yamlList(values) {
  return `[${values.map((value) => yamlString(value)).join(", ")}]`;
}

function slugValue(value) {
  const slug = String(value || "").trim();
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`Invalid slug "${slug}". Use lowercase letters, numbers, and hyphens only.`);
  }
  return slug;
}

function arrayValue(value, field) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${field} must be a non-empty array.`);
  }
  return value.map((item) => String(item));
}

function poemMarkdown(raw) {
  const slug = slugValue(raw.slug);
  const title = String(raw.title || "").trim();
  const poet = String(raw.poet || "").trim();
  const dynasty = String(raw.dynasty || "").trim();
  const themes = arrayValue(raw.themes, "themes");
  const original = arrayValue(raw.original, "original");
  const source = String(raw.source || "Public-domain classical text; imported as draft for editorial review.").trim();
  const license = String(raw.license || "Original poem is public domain; commentary is pending editorial review.").trim();
  const updated = String(raw.updated || new Date().toISOString().slice(0, 10));

  if (!title) throw new Error(`${slug} is missing title.`);
  if (!poet) throw new Error(`${slug} is missing poet.`);
  if (!dynasty) throw new Error(`${slug} is missing dynasty.`);

  const lines = original
    .map((line) => `  - zh: ${yamlString(line)}`)
    .join("\n");

  return {
    slug,
    markdown: `---
title: ${yamlString(title)}
titleEn: ${yamlString(raw.titleEn || "")}
canonicalSlug: ${slug}
poet: ${poet}
dynasty: ${yamlString(dynasty)}
themes: ${yamlList(themes)}
collections: []
reviewState: draft
reviewed: false
original:
${original.map((line) => `  - ${yamlString(line)}`).join("\n")}
translationEn: []
explanationZh: 待编辑。
commentaryZh: 待编辑。
commentaryEn: ""
editorNote: Imported as draft by scripts/import-poems.mjs; requires human value-added editing before publication.
relatedPoems: []
source: ${yamlString(source)}
license: ${yamlString(license)}
updated: ${yamlString(updated)}
lines:
${lines}
---

## 编辑备注

这首诗由导入脚本创建为草稿。发布前需要补充现代汉语说明、赏析、英译或英文说明、逐句辅助内容、关联阅读和人工审校记录。
`
  };
}

export async function importPoems(options) {
  const inputPath = options.inputPath;
  const contentDir = options.contentDir || join(process.cwd(), "src", "content");
  const poemsDir = join(contentDir, "poems");
  const overwrite = Boolean(options.overwrite);

  const records = JSON.parse(await readFile(inputPath, "utf8"));
  if (!Array.isArray(records)) throw new Error("Import input must be a JSON array.");

  await mkdir(poemsDir, { recursive: true });
  const imported = [];
  const skipped = [];

  for (const raw of records) {
    const poem = poemMarkdown(raw);
    const outputPath = join(poemsDir, `${poem.slug}.md`);
    if (existsSync(outputPath) && !overwrite) {
      throw new Error(`${basename(outputPath)} already exists. Pass --overwrite to replace it.`);
    }

    await writeFile(outputPath, poem.markdown);
    imported.push(poem.slug);
  }

  return { imported, skipped };
}

function cliArgs(argv) {
  const inputPath = argv.find((arg) => !arg.startsWith("--"));
  return {
    inputPath,
    overwrite: argv.includes("--overwrite")
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = cliArgs(process.argv.slice(2));
  if (!args.inputPath) {
    console.error("Usage: node scripts/import-poems.mjs <poems.json> [--overwrite]");
    process.exit(1);
  }

  const result = await importPoems(args);
  console.log(`Imported ${result.imported.length} draft poem(s): ${result.imported.join(", ")}`);
}
