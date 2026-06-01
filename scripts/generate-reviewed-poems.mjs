import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const poemsDir = join(process.cwd(), "src", "content", "poems");
const outputPath = join(process.cwd(), "src", "lib", "content", "reviewed-poems.generated.ts");

function frontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match?.[1] || "";
}

function reviewState(markdown) {
  const match = frontmatter(markdown).match(/^reviewState:\s*([a-z-]+)/m);
  return match?.[1] || "draft";
}

export async function reviewedPoemSlugs() {
  const entries = await readdir(poemsDir, { withFileTypes: true });
  const slugs = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const markdown = await readFile(join(poemsDir, entry.name), "utf8");
    const state = reviewState(markdown);
    if (state === "reviewed" || state === "published") {
      slugs.push(basename(entry.name, ".md"));
    }
  }

  return slugs.sort();
}

export async function generateReviewedPoems() {
  const slugs = await reviewedPoemSlugs();
  const contents = `export const REVIEWED_POEM_SLUGS = ${JSON.stringify(slugs)} as const;\n`;
  await writeFile(outputPath, contents);
  return slugs;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const slugs = await generateReviewedPoems();
  console.log(`Generated ${slugs.length} reviewed poem slugs.`);
}
