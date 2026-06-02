## 1. Production Launch Foundation

- [x] 1.1 Add Node 22 compatibility branch/task and update `package.json` engines only after local Node/runtime decision is approved.
  - 2026-06-02: `package.json` now requires Node `>=22.12.0` / npm `>=9.6.5`; verified locally with Node `24.16.0` and npm `11.13.0`.
- [x] 1.2 Add controlled Astro/Cloudflare dependency upgrade task and rerun `npm audit`.
  - 2026-06-02: upgraded to Astro `6.4.2`, `@astrojs/cloudflare` `13.6.0`, Wrangler `4.95.0`, and `@astrojs/check` `0.9.9`; migrated content collections to `src/content.config.ts`; `npm audit --audit-level=moderate` returned `found 0 vulnerabilities`.
- [x] 1.3 Add Cloudflare config file with explicit D1/KV binding names for Phase 2 features.
- [x] 1.4 Add production environment validation script for canonical domain, feature flags, provider env, and binding names.
- [x] 1.5 Add launch runbook covering preview deploy, production deploy, rollback, domain, analytics, ads, and binding checks.

## 2. Content Operations

- [x] 2.1 Extend content schemas with review state, dynasty, collection, article, editor notes, and structured metadata fields.
- [x] 2.2 Add content helper tests for draft/AI-draft/noindex/published behavior.
- [x] 2.3 Implement dynasty, collection, article, poems index, poets index, and themes index pages.
- [x] 2.4 Add import script that creates draft content only and never publishes imported poems automatically.
- [x] 2.5 Add content verification script for value-added fields, source/license metadata, duplicate slug/canonical path, and related-link validity.
- [x] 2.6 Add enough reviewed seed content to make the site more credible before AdSense application.

## 3. Discovery Automation

- [x] 3.1 Add JSON-LD builders and tests for WebSite, BreadcrumbList, Person, CollectionPage, Article, and CreativeWork.
- [x] 3.2 Wire JSON-LD into homepage, poem pages, poet pages, dynasty pages, collection pages, theme pages, and articles.
- [x] 3.3 Add build-output discovery verification script for sitemap, robots, RSS, canonical URLs, reciprocal hreflang, and JSON-LD parsing.
- [x] 3.4 Add IndexNow key route and URL submission command that only submits reviewed sitemap URLs.
- [x] 3.5 Add Baidu submission command with explicit missing-token failure.
- [x] 3.6 Update README with Google Search Console, Bing Webmaster Tools, Baidu Search Resource Platform, IndexNow, and AI crawler setup.

## 4. User Engagement

- [x] 4.1 Add D1 migrations for users, identities, preferences, saved poems, reading history, subscriptions, comments, and moderation events.
- [x] 4.2 Add repository tests and implementations for each D1 table.
- [x] 4.3 Add disabled-by-default auth adapter and magic-link API boundary.
- [x] 4.4 Add profile/personal-center route with anonymous login prompt.
- [x] 4.5 Add preference save/read APIs and UI.
- [x] 4.6 Add saved poem toggle API and UI on reviewed poem pages.
- [x] 4.7 Add comment submit/list/moderation APIs with pending-by-default public behavior and rate limits.
- [x] 4.8 Add browser smoke tests for personal center, saved poem UI, and comment pending state.

## 5. AI Editorial Workflow

- [x] 5.1 Add AI provider config and disabled-by-default adapter tests.
- [x] 5.2 Add AI draft D1 table/repository and prompt version metadata.
- [x] 5.3 Add draft generation APIs for explanation, translation, line notes, and related-poem suggestions.
- [x] 5.4 Add quality checks for empty output, unsupported claims, missing source notes, duplicate text, and length boundaries.
- [x] 5.5 Add review flow that can promote AI draft content only after human approval.
- [x] 5.6 Add README section for provider selection, cost control, review policy, and no automatic publication.

## 6. Monetization Compliance

- [x] 6.1 Add `ads.txt` route driven by verified AdSense/Baidu publisher config.
- [x] 6.2 Add tests ensuring disabled ads produce no reader-visible development placeholders.
- [x] 6.3 Add policy-safe ad slot layout checks for poem pages, index pages, and article pages.
- [x] 6.4 Update privacy/terms/contact pages for analytics, ads, email subscription, comments, and account data.
- [x] 6.5 Add monetization launch checklist and status table for AdSense, Baidu Union, domain, content volume, and external approvals.

## 7. Verification And Release

- [x] 7.1 Run `npm test`.
  - 2026-06-01: `npm test` passed, 31 files / 158 tests.
  - 2026-06-02: `npm test` passed on Node `24.16.0`, 34 files / 173 tests.
- [x] 7.2 Run `npm run check`.
  - 2026-06-01: `npm run check` passed, 0 errors / 0 warnings / 0 hints.
  - 2026-06-02: `npm run check` passed on Astro `6.4.2`, 0 errors / 0 warnings / 0 hints.
- [x] 7.3 Run `npm run build`.
  - 2026-06-01: `npm run build` passed after running it by itself. A prior parallel `check` + `build` attempt failed with `ENOTEMPTY` in `node_modules/.vite/deps`, caused by concurrent Vite cache work.
  - 2026-06-02: `PUBLIC_SITE_URL=https://poem.example npm run build` passed with Cloudflare server output under `dist/client`.
- [x] 7.4 Run production environment validation in preview mode.
  - 2026-06-01: `PUBLIC_SITE_URL=https://poem.example npm run validate:production` passed.
  - 2026-06-02: `PUBLIC_SITE_URL=https://poem.example npm run validate:production` passed.
- [x] 7.5 Run content verification.
  - 2026-06-01: `npm run verify:content` passed.
  - 2026-06-02: `npm run verify:content` passed.
- [x] 7.6 Run discovery verification on `dist`.
  - 2026-06-01: `npm run verify:discovery` passed.
  - 2026-06-02: `npm run verify:discovery` passed against Cloudflare public output under `dist/client`.
- [x] 7.7 Run browser smoke on homepage, poem page, English poem page, index/search page, personal center, comment form, and subscription form.
  - 2026-06-01: `SMOKE_BASE_URL=http://127.0.0.1:4328 npm run smoke:user` passed.
  - 2026-06-01: Playwright browser smoke checked `/`, `/poems/jing-ye-si/`, `/en/poems/jing-ye-si/`, `/poems/`, and `/me`.
  - 2026-06-01: `/me` had `robots=noindex,follow`; subscription button stayed disabled with the no-email-collection message; disabled comments API returned explicit `503`.
  - 2026-06-01: Codex in-app browser runtime could not start because the local Windows sandbox failed during browser setup, so the browser smoke was completed with the available Playwright browser tool instead.
  - 2026-06-02: `SMOKE_BASE_URL=http://127.0.0.1:4332 npm run smoke:user` passed after adding same-origin POST headers for Astro 6 CSRF checks.
- [x] 7.8 Record remaining unverified external items: GitHub push, domain, Cloudflare project, Search Console, Bing, Baidu, AdSense, Baidu Union, email provider, AI provider.
  - GitHub push status is verified by the final pushed branch/commit handoff.
  - Real production domain, Cloudflare Pages project, real D1/KV IDs, Google Search Console, Bing Webmaster Tools, Baidu Search Resource Platform, AdSense approval, Baidu Union approval, live email provider, and live AI provider were not verified locally.
  - Node 22+ / Astro 6 upgrade and `npm audit` remediation were completed locally on 2026-06-02; external Cloudflare runtime deployment is still unverified.
