import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const discoverableStates = new Set(["reviewed", "published"]);

async function walkMarkdown(dir) {
  if (!existsSync(dir)) return [];

  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkMarkdown(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

function parseFrontmatter(fileText) {
  const match = fileText.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  return YAML.parse(match[1]) || {};
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasItems(value) {
  return Array.isArray(value) && value.length > 0;
}

function slugFromFile(filePath) {
  return basename(filePath, ".md");
}

export async function verifyContent(options = {}) {
  const contentDir = options.contentDir || join(process.cwd(), "src", "content");
  const poemDir = join(contentDir, "poems");
  const errors = [];

  if (!existsSync(contentDir)) {
    return [`${contentDir} does not exist.`];
  }

  const poemFiles = await walkMarkdown(poemDir);
  const poemEntries = [];
  const seenCanonicalSlugs = new Map();

  for (const file of poemFiles) {
    const data = parseFrontmatter(await readFile(file, "utf8"));
    const rel = relative(contentDir, file).replace(/\\/g, "/");
    const slug = slugFromFile(file);
    const canonicalSlug = data.canonicalSlug || slug;

    poemEntries.push({ rel, slug, canonicalSlug, data });

    if (seenCanonicalSlugs.has(canonicalSlug)) {
      errors.push(`${rel} duplicates canonicalSlug ${canonicalSlug} from ${seenCanonicalSlugs.get(canonicalSlug)}.`);
    } else {
      seenCanonicalSlugs.set(canonicalSlug, rel);
    }

    if (discoverableStates.has(data.reviewState)) {
      if (!hasItems(data.original)) errors.push(`${rel} is ${data.reviewState} but missing original.`);
      if (!hasText(data.explanationZh)) errors.push(`${rel} is ${data.reviewState} but missing explanationZh.`);
      if (!hasText(data.commentaryZh)) errors.push(`${rel} is ${data.reviewState} but missing commentaryZh.`);
      if (!hasText(data.source)) errors.push(`${rel} is ${data.reviewState} but missing source.`);
      if (!hasText(data.license)) errors.push(`${rel} is ${data.reviewState} but missing license.`);
      if (!hasItems(data.lines)) errors.push(`${rel} is ${data.reviewState} but missing line-level content.`);
    }
  }

  const knownSlugs = new Set(poemEntries.flatMap((entry) => [entry.slug, entry.canonicalSlug]));

  for (const entry of poemEntries) {
    const relatedPoems = Array.isArray(entry.data.relatedPoems) ? entry.data.relatedPoems : [];
    for (const related of relatedPoems) {
      if (!knownSlugs.has(related)) {
        errors.push(`${entry.rel} references missing related poem ${related}.`);
      }
    }
  }

  return errors;
}

async function main() {
  const errors = await verifyContent();

  if (errors.length > 0) {
    console.error(errors.map((error) => `- ${error}`).join("\n"));
    process.exit(1);
  }

  console.log("Content verification passed.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
