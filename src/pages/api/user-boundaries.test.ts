import { describe, expect, it } from "vitest";
import { POST as requestMagicLink } from "./auth/magic-link";
import { GET as listComments } from "./comments";
import { GET as readPreferences } from "./preferences";
import { GET as readSavedPoems } from "./saved-poems";

async function expectDisabled(response: Response, error: string) {
  expect(response.status).toBe(503);
  await expect(response.json()).resolves.toEqual({ ok: false, error });
}

describe("user API route boundaries", () => {
  it("keeps login disabled by default", async () => {
    await expectDisabled(await requestMagicLink(), "login is disabled");
  });

  it("keeps preferences disabled by default", async () => {
    await expectDisabled(await readPreferences(), "personal center is disabled");
  });

  it("keeps saved poems disabled by default", async () => {
    await expectDisabled(await readSavedPoems(), "saved poems is disabled");
  });

  it("keeps comments disabled by default", async () => {
    await expectDisabled(await listComments(), "comments is disabled");
  });
});
