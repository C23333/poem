import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { verifyContent } from "../../../scripts/verify-content.mjs";

async function createContent(files: Record<string, string>) {
  const root = await mkdtemp(join(tmpdir(), "poetry-content-"));
  for (const [path, content] of Object.entries(files)) {
    const fullPath = join(root, path);
    await mkdir(join(fullPath, ".."), { recursive: true });
    await writeFile(fullPath, content, "utf8");
  }
  return root;
}

describe("verifyContent", () => {
  it("accepts reviewed poems with value-added fields and valid related poems", async () => {
    const contentDir = await createContent({
      "poems/jing-ye-si.md": `---
title: 静夜思
canonicalSlug: jing-ye-si
reviewState: published
original: [床前明月光]
explanationZh: 这首诗写月夜乡思。
commentaryZh: 这里有自写赏析，不只是原文。
source: Public domain text.
license: Public domain plus site editorial.
relatedPoems: [jiang-ye]
lines:
  - zh: 床前明月光
---
`,
      "poems/jiang-ye.md": `---
title: 江夜
canonicalSlug: jiang-ye
reviewState: needs-review
original: [露从今夜白]
explanationZh: ""
commentaryZh: ""
source: Placeholder.
license: Public domain.
relatedPoems: []
lines: []
---
`
    });

    expect(await verifyContent({ contentDir })).toEqual([]);
  });

  it("rejects published poems without editorial commentary", async () => {
    const contentDir = await createContent({
      "poems/thin.md": `---
title: 薄页
canonicalSlug: thin
reviewState: published
original: [一句诗]
explanationZh: ""
commentaryZh: ""
source: Public domain.
license: Public domain.
relatedPoems: []
lines: []
---
`
    });

    const errors = await verifyContent({ contentDir });
    expect(errors).toContain("poems/thin.md is published but missing explanationZh.");
    expect(errors).toContain("poems/thin.md is published but missing commentaryZh.");
  });

  it("rejects related poem links that point to missing slugs", async () => {
    const contentDir = await createContent({
      "poems/jing-ye-si.md": `---
title: 静夜思
canonicalSlug: jing-ye-si
reviewState: published
original: [床前明月光]
explanationZh: 这首诗写月夜乡思。
commentaryZh: 这里有自写赏析，不只是原文。
source: Public domain text.
license: Public domain plus site editorial.
relatedPoems: [missing-poem]
lines:
  - zh: 床前明月光
---
`
    });

    await expect(verifyContent({ contentDir })).resolves.toContain(
      "poems/jing-ye-si.md references missing related poem missing-poem."
    );
  });
});
