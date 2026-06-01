import { fileURLToPath } from "node:url";

const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:4327";

async function fetchText(path, init) {
  const response = await fetch(new URL(path, baseUrl), init);
  return {
    response,
    text: await response.text()
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function assertJson(path, expectedStatus, expectedBody, init) {
  const { response, text } = await fetchText(path, init);
  assert(response.status === expectedStatus, `${path} expected ${expectedStatus}, got ${response.status}: ${text}`);
  const json = JSON.parse(text);
  for (const [key, value] of Object.entries(expectedBody)) {
    assert(json[key] === value, `${path} expected ${key}=${value}, got ${json[key]}`);
  }
}

export async function smokeUserEngagement() {
  const me = await fetchText("/me");
  assert(me.response.status === 200, `/me expected 200, got ${me.response.status}`);
  assert(me.text.includes('name="robots" content="noindex,follow"'), "/me must stay noindex.");
  assert(me.text.includes('name="readingMode"'), "/me must render reading preference controls.");
  assert(me.text.includes("保存偏好"), "/me must render the preference save action.");

  const poem = await fetchText("/poems/jing-ye-si/");
  assert(poem.response.status === 200, `/poems/jing-ye-si/ expected 200, got ${poem.response.status}`);
  assert(poem.text.includes("收藏与评论"), "Poem page must render reader actions.");
  assert(poem.text.includes("评论默认关闭"), "Poem page must expose the disabled comments state.");

  await assertJson("/api/preferences", 503, { ok: false, error: "personal center is disabled" });
  await assertJson("/api/saved-poems", 503, { ok: false, error: "saved poems is disabled" });
  await assertJson("/api/comments?poemSlug=jing-ye-si", 503, { ok: false, error: "comments is disabled" });

  console.log("User engagement smoke passed.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await smokeUserEngagement();
}
