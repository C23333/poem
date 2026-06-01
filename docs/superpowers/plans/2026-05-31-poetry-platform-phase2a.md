# Poetry Platform Phase 2A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add production-readiness foundations that move the poetry MVP toward a deployable traffic system without depending on external provider credentials.

**Architecture:** Keep public content prerendered. Add small TypeScript verification modules and npm scripts for production config, content quality, and discovery output. Extend content metadata and public routes in place, while leaving login, comments, AI provider calls, and real email delivery for later Phase 2 tasks.

**Tech Stack:** Astro 5, TypeScript, Vitest, Astro content collections, Node scripts run through `tsx` or compiled TypeScript-compatible ESM, Cloudflare Pages/Functions config files.

---

## File Structure

- `src/config/site.ts`: add production environment helpers, ad publisher config, search submission config, and binding names.
- `src/config/site.test.ts`: tests for production config and provider disabled behavior.
- `src/content/config.ts`: add review state, dynasty, collection, article schemas, and richer metadata.
- `src/content/poems/*.md`: add `reviewState`, `canonicalSlug`, and metadata fields required by verification.
- `src/content/articles/*.md`: seed one editorial article.
- `src/content/collections/*.md`: seed one collection.
- `src/content/dynasties/*.md`: seed Tang dynasty page data.
- `src/lib/content/poems.ts`: extend indexability helpers for review states.
- `src/lib/content/poems.test.ts`: tests for draft, AI draft, reviewed, and published states.
- `src/lib/seo/structured-data.ts`: add JSON-LD builders for WebSite, BreadcrumbList, Person, CollectionPage, and Article.
- `src/lib/seo/seo.test.ts`: tests for JSON-LD expansion and safe serialization.
- `src/pages/dynasties/[slug].astro`: static dynasty page.
- `src/pages/collections/[slug].astro`: static collection page.
- `src/pages/articles/[slug].astro`: static article page.
- `src/pages/poems/index.astro`: static poem index/search surface.
- `src/pages/poets/index.astro`: static poet index.
- `src/pages/themes/index.astro`: static theme index.
- `src/pages/ads.txt.ts`: config-driven ads.txt route.
- `scripts/validate-production.mjs`: production env validation.
- `scripts/verify-content.mjs`: content quality verification.
- `scripts/verify-discovery.mjs`: built-output discovery verification.
- `wrangler.toml`: Cloudflare Pages/Functions binding names for later D1/KV use.
- `README.md`: update launch, webmaster console, and verification instructions.

## Task 1: Production Config And Validation

**Files:**
- Modify: `package.json`
- Modify: `.env.example`
- Modify: `src/config/site.ts`
- Modify: `src/config/site.test.ts`
- Create: `scripts/validate-production.mjs`
- Create: `wrangler.toml`

- [ ] **Step 1: Write failing config tests**

Add tests to `src/config/site.test.ts`:

```ts
import { getProductionConfig, getSearchSubmissionConfig } from "./site";

it("marks example.com as unsafe for production", () => {
  const config = getProductionConfig({ PUBLIC_SITE_URL: "https://example.com" });
  expect(config.safeDomain).toBe(false);
});

it("normalizes production binding names", () => {
  const config = getProductionConfig({});
  expect(config.bindings.d1Database).toBe("POETRY_DB");
  expect(config.bindings.sessionKv).toBe("POETRY_SESSION");
  expect(config.bindings.tokensKv).toBe("POETRY_TOKENS");
});

it("keeps search submission disabled without tokens", () => {
  const config = getSearchSubmissionConfig({});
  expect(config.indexNow.enabled).toBe(false);
  expect(config.baidu.enabled).toBe(false);
});
```

- [ ] **Step 2: Run failing tests**

Run:

```powershell
npm test -- src/config/site.test.ts
```

Expected: FAIL because `getProductionConfig` and `getSearchSubmissionConfig` do not exist.

- [ ] **Step 3: Implement config helpers**

Add to `src/config/site.ts`:

```ts
export function getProductionConfig(env: EnvLike = import.meta.env) {
  const site = getSiteConfig(env);
  return {
    safeDomain: site.url !== "https://example.com",
    nodeMinimum: ">=22.12.0",
    bindings: {
      d1Database: env.CLOUDFLARE_D1_BINDING || "POETRY_DB",
      sessionKv: env.CLOUDFLARE_SESSION_KV_BINDING || "POETRY_SESSION",
      tokensKv: env.CLOUDFLARE_TOKENS_KV_BINDING || "POETRY_TOKENS",
      rateLimitKv: env.CLOUDFLARE_RATE_LIMIT_KV_BINDING || "POETRY_RATE_LIMIT",
      indexNowKv: env.CLOUDFLARE_INDEXNOW_KV_BINDING || "POETRY_INDEXNOW"
    }
  };
}

export function getSearchSubmissionConfig(env: EnvLike = import.meta.env) {
  return {
    indexNow: {
      enabled: Boolean(env.INDEXNOW_KEY),
      key: env.INDEXNOW_KEY || "",
      endpoint: env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow"
    },
    baidu: {
      enabled: Boolean(env.BAIDU_SUBMIT_TOKEN),
      token: env.BAIDU_SUBMIT_TOKEN || "",
      endpoint: env.BAIDU_SUBMIT_ENDPOINT || "https://data.zz.baidu.com/urls"
    }
  };
}
```

- [ ] **Step 4: Add validation script**

Create `scripts/validate-production.mjs`:

```js
const env = process.env;
const siteUrl = env.PUBLIC_SITE_URL || "https://example.com";
const errors = [];

if (siteUrl === "https://example.com") {
  errors.push("PUBLIC_SITE_URL must be a real production domain.");
}

if (env.PUBLIC_ENABLE_ADS === "true" && !env.PUBLIC_ADSENSE_CLIENT) {
  errors.push("PUBLIC_ENABLE_ADS=true requires PUBLIC_ADSENSE_CLIENT.");
}

if (env.PUBLIC_ENABLE_SUBSCRIPTION === "true" && !env.PUBLIC_SUBSCRIPTION_ENDPOINT) {
  errors.push("PUBLIC_ENABLE_SUBSCRIPTION=true requires PUBLIC_SUBSCRIPTION_ENDPOINT.");
}

if (env.PUBLIC_ENABLE_AI === "true" && !env.PUBLIC_AI_ENDPOINT) {
  errors.push("PUBLIC_ENABLE_AI=true requires PUBLIC_AI_ENDPOINT.");
}

const requiredBindings = ["POETRY_DB", "POETRY_SESSION", "POETRY_TOKENS", "POETRY_RATE_LIMIT", "POETRY_INDEXNOW"];
for (const binding of requiredBindings) {
  if (env[`REQUIRE_${binding}`] === "true" && !env[binding]) {
    errors.push(`${binding} binding is required but not present in environment.`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("Production validation passed.");
```

- [ ] **Step 5: Add scripts and env examples**

Update `package.json` scripts:

```json
"validate:production": "node scripts/validate-production.mjs"
```

Add to `.env.example`:

```dotenv
INDEXNOW_KEY=
INDEXNOW_ENDPOINT=https://api.indexnow.org/indexnow
BAIDU_SUBMIT_TOKEN=
BAIDU_SUBMIT_ENDPOINT=https://data.zz.baidu.com/urls
CLOUDFLARE_D1_BINDING=POETRY_DB
CLOUDFLARE_SESSION_KV_BINDING=POETRY_SESSION
CLOUDFLARE_TOKENS_KV_BINDING=POETRY_TOKENS
CLOUDFLARE_RATE_LIMIT_KV_BINDING=POETRY_RATE_LIMIT
CLOUDFLARE_INDEXNOW_KV_BINDING=POETRY_INDEXNOW
```

- [ ] **Step 6: Add Cloudflare config**

Create `wrangler.toml`:

```toml
name = "poetry-traffic-site"
compatibility_date = "2026-05-31"
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "POETRY_DB"
database_name = "poetry-traffic-site"
database_id = "00000000-0000-0000-0000-000000000000"

[[kv_namespaces]]
binding = "POETRY_SESSION"
id = "00000000000000000000000000000000"

[[kv_namespaces]]
binding = "POETRY_TOKENS"
id = "00000000000000000000000000000000"

[[kv_namespaces]]
binding = "POETRY_RATE_LIMIT"
id = "00000000000000000000000000000000"

[[kv_namespaces]]
binding = "POETRY_INDEXNOW"
id = "00000000000000000000000000000000"
```

- [ ] **Step 7: Verify**

Run:

```powershell
npm test -- src/config/site.test.ts
npm run validate:production
```

Expected: config tests pass. `npm run validate:production` fails with `PUBLIC_SITE_URL must be a real production domain.` while `.env` is not configured; this is expected. Run with `PUBLIC_SITE_URL=https://poem.example npm run validate:production` and expect pass.

## Task 2: Content Review State And Expanded Public Surfaces

**Files:**
- Modify: `src/content/config.ts`
- Modify: `src/content/poems/jing-ye-si.md`
- Modify: `src/content/poems/jiang-ye.md`
- Modify: `src/lib/content/poems.ts`
- Modify: `src/lib/content/poems.test.ts`
- Create: `src/content/dynasties/tang.md`
- Create: `src/content/collections/moon-and-home.md`
- Create: `src/content/articles/how-to-read-jing-ye-si.md`
- Create: `src/pages/dynasties/[slug].astro`
- Create: `src/pages/collections/[slug].astro`
- Create: `src/pages/articles/[slug].astro`
- Create: `src/pages/poems/index.astro`
- Create: `src/pages/poets/index.astro`
- Create: `src/pages/themes/index.astro`

- [ ] **Step 1: Write failing content state tests**

Add tests to `src/lib/content/poems.test.ts`:

```ts
it("excludes ai drafts even when text exists", () => {
  expect(
    isIndexablePoem({
      ...reviewedPoem,
      data: { ...reviewedPoem.data, reviewState: "ai-draft", reviewed: true }
    })
  ).toBe(false);
});

it("allows published value-added poems", () => {
  expect(
    isIndexablePoem({
      ...reviewedPoem,
      data: { ...reviewedPoem.data, reviewState: "published", reviewed: true }
    })
  ).toBe(true);
});
```

- [ ] **Step 2: Run failing content test**

Run:

```powershell
npm test -- src/lib/content/poems.test.ts
```

Expected: FAIL because `reviewState` is ignored.

- [ ] **Step 3: Implement review state logic**

Update `src/lib/content/poems.ts` to include:

```ts
type ReviewState = "draft" | "ai-draft" | "needs-review" | "reviewed" | "published";

function isDiscoverableState(state: ReviewState | undefined, reviewed?: boolean): boolean {
  if (state) return state === "reviewed" || state === "published";
  return Boolean(reviewed);
}
```

Use `isDiscoverableState(data.reviewState, data.reviewed)` inside `isIndexablePoem`.

- [ ] **Step 4: Extend content schemas**

Update `src/content/config.ts` with:

```ts
const reviewState = z.enum(["draft", "ai-draft", "needs-review", "reviewed", "published"]).default("draft");
```

Add `reviewState`, `canonicalSlug`, `editorNote`, and `relatedPoems` to poem schema. Add collections, dynasties, and articles collections with explicit schema fields.

- [ ] **Step 5: Add seed content**

Update `jing-ye-si.md` with `reviewState: published`, `canonicalSlug: jing-ye-si`, and related metadata.

Update `jiang-ye.md` with `reviewState: needs-review`.

Add Tang dynasty, moon/home collection, and one article.

- [ ] **Step 6: Add index pages and routes**

Create the new pages listed above. Each page must use `BaseLayout`, `getCollection`, semantic headings, static links, and existing visual tokens.

- [ ] **Step 7: Verify**

Run:

```powershell
npm test -- src/lib/content/poems.test.ts
npm run check
npm run build
```

Expected: tests/check/build pass; sitemap includes new reviewed surfaces but still excludes `jiang-ye`.

## Task 3: Structured Data And Discovery Verification

**Files:**
- Modify: `src/lib/seo/structured-data.ts`
- Modify: `src/lib/seo/seo.test.ts`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: relevant public pages
- Create: `scripts/verify-discovery.mjs`

- [ ] **Step 1: Write failing structured data tests**

Add tests for `websiteJsonLd`, `breadcrumbJsonLd`, `personJsonLd`, `collectionPageJsonLd`, and `articleJsonLd`.

- [ ] **Step 2: Run failing SEO tests**

Run:

```powershell
npm test -- src/lib/seo/seo.test.ts
```

Expected: FAIL because the builders do not exist.

- [ ] **Step 3: Implement JSON-LD builders**

Add the builders to `src/lib/seo/structured-data.ts`, reusing `buildCanonicalUrl`.

- [ ] **Step 4: Allow multiple JSON-LD blocks**

Update `BaseLayout.astro` so `jsonLd` accepts `unknown | unknown[]` and serializes each block safely.

- [ ] **Step 5: Wire JSON-LD into pages**

Add WebSite JSON-LD to homepage, BreadcrumbList to public detail pages, Person to poet pages, CollectionPage to collection/theme/index pages, and Article to articles.

- [ ] **Step 6: Add discovery verification script**

Create `scripts/verify-discovery.mjs` that scans `dist/**/*.html`, `dist/sitemap-0.xml`, `dist/robots.txt`, and `dist/rss.xml`, then fails on unparsable JSON-LD, missing sitemap files, `example.com` host in production mode, or sitemap URLs containing `jiang-ye`.

- [ ] **Step 7: Verify**

Run:

```powershell
npm test -- src/lib/seo/seo.test.ts
npm run build
node scripts/verify-discovery.mjs
```

Expected: all pass in default local mode.

## Task 4: Ads Txt And Monetization Docs

**Files:**
- Modify: `src/config/site.ts`
- Modify: `src/config/site.test.ts`
- Create: `src/pages/ads.txt.ts`
- Modify: `README.md`

- [ ] **Step 1: Write failing ad config tests**

Add test:

```ts
it("does not emit fake ads.txt records without publisher id", () => {
  expect(getAdsConfig({}).adsTxtRecords).toEqual([]);
});
```

- [ ] **Step 2: Implement ads.txt config**

Add `adsTxtRecords` to `getAdsConfig`, returning an empty array unless `PUBLIC_ADSENSE_PUBLISHER_ID` is present.

- [ ] **Step 3: Add ads.txt route**

Create `src/pages/ads.txt.ts` that returns configured records or a safe disabled comment.

- [ ] **Step 4: Update docs**

Document that AdSense/Baidu Union approval remains external and unverified until obtained.

- [ ] **Step 5: Verify**

Run:

```powershell
npm test -- src/config/site.test.ts
npm run build
Get-Content -Path dist\ads.txt
```

Expected: tests/build pass and `dist\ads.txt` contains no fake publisher record.

## Task 5: Final Phase 2A Verification

**Files:**
- Modify: `openspec/changes/complete-poetry-platform-phase2/tasks.md`
- Modify: `README.md`

- [ ] **Step 1: Update task status**

Mark completed Phase 2A tasks in OpenSpec. Leave user engagement, AI, real email, comments, and provider integrations unchecked.

- [ ] **Step 2: Run full verification**

Run:

```powershell
npm test
npm run check
npm run build
node scripts/verify-discovery.mjs
```

Expected: all pass except production validation with placeholder domain, which should be documented as intentionally failing until domain is configured.

- [ ] **Step 3: Browser smoke**

Open homepage, poem detail, English poem, poem index, dynasty page, collection page, article page, and `ads.txt`.

Expected: no horizontal overflow; key content appears in initial HTML.

- [ ] **Step 4: Commit**

Run:

```powershell
git add .
git commit -m "feat: add production readiness and discovery checks"
```

Expected: commit succeeds.
