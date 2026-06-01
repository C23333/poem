## 1. Production Launch Foundation

- [ ] 1.1 Add Node 22 compatibility branch/task and update `package.json` engines only after local Node/runtime decision is approved.
- [ ] 1.2 Add controlled Astro/Cloudflare dependency upgrade task and rerun `npm audit`.
- [x] 1.3 Add Cloudflare config file with explicit D1/KV binding names for Phase 2 features.
- [x] 1.4 Add production environment validation script for canonical domain, feature flags, provider env, and binding names.
- [x] 1.5 Add launch runbook covering preview deploy, production deploy, rollback, domain, analytics, ads, and binding checks.

## 2. Content Operations

- [x] 2.1 Extend content schemas with review state, dynasty, collection, article, editor notes, and structured metadata fields.
- [x] 2.2 Add content helper tests for draft/AI-draft/noindex/published behavior.
- [x] 2.3 Implement dynasty, collection, article, poems index, poets index, and themes index pages.
- [ ] 2.4 Add import script that creates draft content only and never publishes imported poems automatically.
- [x] 2.5 Add content verification script for value-added fields, source/license metadata, duplicate slug/canonical path, and related-link validity.
- [ ] 2.6 Add enough reviewed seed content to make the site more credible before AdSense application.

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
- [ ] 6.3 Add policy-safe ad slot layout checks for poem pages, index pages, and article pages.
- [x] 6.4 Update privacy/terms/contact pages for analytics, ads, email subscription, comments, and account data.
- [x] 6.5 Add monetization launch checklist and status table for AdSense, Baidu Union, domain, content volume, and external approvals.

## 7. Verification And Release

- [ ] 7.1 Run `npm test`.
- [ ] 7.2 Run `npm run check`.
- [ ] 7.3 Run `npm run build`.
- [ ] 7.4 Run production environment validation in preview mode.
- [ ] 7.5 Run content verification.
- [ ] 7.6 Run discovery verification on `dist`.
- [ ] 7.7 Run browser smoke on homepage, poem page, English poem page, index/search page, personal center, comment form, and subscription form.
- [ ] 7.8 Record remaining unverified external items: GitHub push, domain, Cloudflare project, Search Console, Bing, Baidu, AdSense, Baidu Union, email provider, AI provider.
