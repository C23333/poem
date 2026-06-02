import { mkdtemp, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { publicOutputDir, publicOutputFile } from "./public-output.mjs";

describe("public build output helpers", () => {
  it("uses dist/client when Cloudflare server output is present", async () => {
    const dist = await mkdtemp(join(tmpdir(), "poetry-output-"));
    await mkdir(join(dist, "client"), { recursive: true });

    expect(publicOutputDir(dist)).toBe(join(dist, "client"));
    expect(publicOutputFile(dist, "sitemap-0.xml")).toBe(join(dist, "client", "sitemap-0.xml"));
  });

  it("uses flat dist output when no client directory exists", async () => {
    const dist = await mkdtemp(join(tmpdir(), "poetry-output-"));

    expect(publicOutputDir(dist)).toBe(dist);
    expect(publicOutputFile(dist, "sitemap-0.xml")).toBe(join(dist, "sitemap-0.xml"));
  });
});
