## Why

Chinese classical poetry has durable search demand in both Chinese and English, but most existing sites compete on copied poem text, short annotations, or generic encyclopedia-style pages. The opportunity is to build a bilingual poetry content site whose pages add commentary, editorial grouping, translation, learning context, daily recommendations, and later personalization, so the site is eligible for SEO traffic and AdSense monetization without depending on thin copied content.

## What Changes

- Build an Astro Hybrid poetry site deployed to Cloudflare Pages.
- Generate crawlable public pages for poems, poets, dynasties, themes, collections, and editorial articles.
- Add value beyond copied poem text: annotations, modern Chinese explanation, English translation, context, appreciation notes, theme links, related poems, source/license metadata, and editor/AI review status.
- Support configurable language presentation for overseas and domestic readers: Chinese-only, English-only, bilingual, and interlinear annotation mode where Chinese or English can appear as the helper line.
- Prepare SEO foundations: stable URL structure, canonical URLs, hreflang, sitemap indexes, robots.txt, structured data, RSS/Atom feeds, and AI crawler policy.
- Prepare monetization foundations: AdSense-ready layout, ad slot config, consent/privacy pages, and domestic placeholders for Baidu Tongji and future Baidu Union.
- Add daily poetry features: daily homepage poem, email subscription flow, RSS feed, and later personalized recommendations based on user interests.
- Design the first UI direction in a reviewable HTML mockup before implementation.
- Document project setup, SEO rules, content rules, deployment, analytics, and monetization in `README.md`.

## Capabilities

### New Capabilities

- `poetry-content`: Public poem, poet, dynasty, theme, collection, and article content surfaces with source metadata and value-added editorial fields.
- `seo-discovery`: Search-engine and AI-crawler discovery requirements, including multilingual SEO, sitemap, structured data, robots, RSS, and canonical rules.
- `monetization-analytics`: AdSense-first monetization, domestic analytics placeholders, privacy/consent pages, and safe ad placement requirements.
- `daily-personalization`: Daily poem, email subscription, interest capture, saved poems, and later personalized recommendation flows.
- `visual-identity`: Traditional Chinese visual system, responsive layout, typography, color, and UX requirements.
- `deployment-operations`: Cloudflare Pages/Workers deployment, environment config, verification, README, and operational checks.

### Modified Capabilities

- None.

## Impact

- Affects project structure by introducing an Astro Hybrid application, content/data directories, Cloudflare deployment config, and OpenSpec-managed implementation tasks.
- Adds future external integrations: Google AdSense, Google Analytics 4, Google Search Console, Cloudflare Web Analytics, optional Baidu Tongji, optional Baidu Search Resource Platform submission, future Baidu Union, email provider, and AI provider.
- Requires content governance to avoid low-value copied pages: every indexed poem page must include editorial or generated-and-reviewed material beyond public-domain text.
- Requires privacy, cookie, email unsubscribe, analytics opt-in/notice, and ad policy pages before public monetization.
