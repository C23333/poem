## Why

The MVP proves the core direction: crawlable bilingual poetry pages, a traditional visual system, sitemap/robots/RSS, JSON-LD for poem pages, configurable analytics, configurable ad slots, and a disabled-by-default subscription path. It is enough for local preview and early product validation, but it is not yet a full production traffic system.

The next change turns the MVP into a deployable operating system for a poetry traffic site: more content surfaces, production deployment configuration, search submission workflows, account-ready preference data, moderated comments, editorial AI assistance, and monetization guardrails. The goal is not to add everything imaginable; it is to make the site safe to launch, maintain, measure, and grow without violating search or ad policies.

## What Changes

- Add Cloudflare production configuration, deploy documentation, and environment validation for domain, analytics, ads, D1, KV, and future secrets.
- Upgrade the dependency/runtime strategy so security fixes that require Astro 6 can be handled through a Node 22 compatibility pass instead of `npm audit fix --force`.
- Expand content from a seed page into a governed content library with import scripts, review state, noindex gates, collections, dynasty pages, search/index pages, and editorial articles.
- Add SEO and discovery automation: WebSite, BreadcrumbList, Person, CollectionPage, Article JSON-LD; sitemap health checks; IndexNow key and submission workflow; Search Console/Baidu/Bing operational checklists.
- Add account-ready data boundaries: email magic-link login adapter, profile/preference tables, saved poems, reading history, daily subscription state, and public comments with moderation.
- Add AI-assisted editorial tooling behind review gates: draft explanations, translations, line notes, related-poem suggestions, and quality checks. AI output must remain draft-only until reviewed.
- Add monetization readiness: `ads.txt`, policy-safe ad slots, consent/privacy behavior when non-essential scripts are enabled, and Baidu Union placeholders.
- Add README and runbook updates for deployment, content publishing, search submission, audit status, rollback, and launch checklist.

## Capabilities

### New Capabilities

- `production-launch`: Cloudflare deployment, runtime version, environment validation, bindings, security headers, rollback, and launch checklist.
- `content-operations`: Import, review, publish, noindex, collections, dynasties, articles, search pages, and editorial quality gates.
- `discovery-automation`: Search engine and AI discovery automation, structured data expansion, IndexNow, sitemap checks, and webmaster-console workflows.
- `user-engagement`: Login boundary, preferences, saved poems, daily email subscription state, moderated comments, and user-facing personal center.
- `ai-editorial`: AI draft/review workflow, provider adapter, prompt/version logging, usage limits, and reviewed-only publication rules.
- `monetization-compliance`: AdSense/Baidu ad readiness, `ads.txt`, policy-safe placements, consent/privacy behavior, and revenue analytics.

### Modified Capabilities

- `poetry-content`: Expand from seed poems to scalable governed content.
- `seo-discovery`: Expand from core metadata to submission, monitoring, and structured-data coverage.
- `daily-personalization`: Expand from disabled subscription UI to account-ready subscription/preference storage.
- `deployment-operations`: Expand from README deployment notes to production binding validation and launch runbook.

## Impact

- Adds Cloudflare D1/KV-backed server features while keeping public content pages prerendered for SEO.
- Introduces migration and seed scripts for user data and content operations.
- Adds admin/editor-only workflows, but does not expose unreviewed AI or user comments to indexable pages.
- Requires external setup before production monetization: domain, Cloudflare project, Search Console, Baidu Search Resource Platform, Bing Webmaster Tools, AdSense, optional Baidu Union, email provider, and optional AI provider.
- Requires explicit approval before selecting paid external providers or enabling live AI calls.

## Research Basis

- Google Search Central warns against scaled content made primarily for rankings and expects AI-assisted content to meet Search Essentials and spam policies.
- Google SEO guidance emphasizes unique canonical URLs, crawlable structure, useful content, and structured data where it helps search engines understand pages.
- Google AdSense policies prohibit encouraging accidental clicks, misleading ad headings, and formatting content to mimic ads.
- Cloudflare Pages Functions use bindings for resources such as KV and D1; production config must declare those bindings instead of assuming local `.env` behavior.
- Bing recommends IndexNow for automated URL submission; IndexNow requires a hosted verification key file.
- Baidu Search Resource Platform link submission can speed crawler discovery but does not guarantee inclusion.

## Sources

- Google Search spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Google Search AI content guidance: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- Google SEO starter guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google canonical guidance: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google AdSense ad placement policies: https://support.google.com/adsense/answer/1346295
- Google AdSense programme policies: https://support.google.com/adsense/answer/48182
- Cloudflare Pages Functions bindings: https://developers.cloudflare.com/pages/functions/bindings/
- Cloudflare Pages Functions configuration: https://developers.cloudflare.com/pages/functions/wrangler-configuration/
- Bing IndexNow setup: https://www.bing.com/indexnow/IndexNowView/IndexNowGetStartedView
- Bing URL submission guidance: https://www.bing.com/webmasters/help/URL-Submission-62f2860b
- IndexNow FAQ: https://www.indexnow.org/faq
- Baidu Search Resource Platform link submission: https://ziyuan.baidu.com/linksubmit/url
