import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { verifyAdPolicy } from "../../../scripts/verify-ad-policy.mjs";

async function distWithPage(html: string) {
  const root = await mkdtemp(join(tmpdir(), "poetry-ads-"));
  const pageDir = join(root, "poems", "jing-ye-si");
  await mkdir(pageDir, { recursive: true });
  await writeFile(join(pageDir, "index.html"), html);
  return root;
}

describe("ad policy verification", () => {
  it("accepts hidden disabled ad slots and labeled enabled ad slots", async () => {
    const distDir = await distWithPage(`
      <main>
        <section class="poem-reader">床前明月光</section>
        <div class="ad-boundary" aria-label="Advertisement">
          <ins class="adsbygoogle"></ins>
        </div>
        <div class="ad-slot" hidden aria-hidden="true"></div>
      </main>
    `);

    await expect(verifyAdPolicy({ distDir })).resolves.toEqual([]);
  });

  it("flags misleading ad labels and sticky ad placement", async () => {
    const distDir = await distWithPage(`
      <main>
        <h2>相关推荐</h2>
        <ins class="adsbygoogle" style="position:fixed"></ins>
      </main>
    `);

    await expect(verifyAdPolicy({ distDir })).resolves.toEqual([
      "poems/jing-ye-si/index.html has an enabled ad without an Advertisement label.",
      "poems/jing-ye-si/index.html uses misleading recommendation text near an ad.",
      "poems/jing-ye-si/index.html uses sticky/fixed ad positioning."
    ]);
  });
});
