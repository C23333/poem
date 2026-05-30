## Context

The repository currently has no application code. The target product is a Chinese classical poetry traffic site that can serve overseas users first through SEO and AdSense, while keeping domestic analytics and future Baidu monetization ready but disabled until the domain, filing, and Baidu-side requirements are known.

The site must avoid becoming a thin poem-text mirror. Public-domain poem text can be the foundation, but each indexable page needs its own value: modern Chinese explanation, English translation, word notes, historical context, appreciation, theme links, related poems, and transparent source metadata. AI may help draft explanation and translation, but pages must mark review state and avoid publishing unreviewed bulk content as if it were editorially verified.

Because the first traffic target includes overseas users, bilingual support is not just a language switch. The reading page needs configurable presentation modes: Chinese-only for native readers, English-only for learners or overseas search visitors, bilingual side-by-side for comparison, and interlinear annotation where Chinese or English can appear as the helper line under the poem text, similar to how pinyin annotations support reading without replacing the main text.

The chosen architecture is Astro Hybrid on Cloudflare. Public content pages are statically generated for speed and crawlability. User-specific features such as login, personal center, saved poems, preferences, subscriptions, and recommendation APIs are designed as Cloudflare Workers/Pages Functions backed by D1/KV, but only minimal subscription and preference capture should be implemented in the first release.

Configuration must be centralized. Language presentation, default reading mode, helper-line language, indexability thresholds, analytics scripts, ad placements, canonical host, feature flags, and future provider adapters should come from a small set of typed config modules and environment variables. Page components should consume normalized config instead of hard-coding the same choice in several files.

## Goals / Non-Goals

**Goals:**

- Launch an SEO-first bilingual poetry site with crawlable, fast, elegant pages.
- Support Chinese-only, English-only, bilingual, and interlinear reading modes on poem pages.
- Keep global display, SEO, analytics, ad, and provider behavior configurable from typed config boundaries.
- Support global traffic first with AdSense-ready pages and GA4/Search Console integration.
- Keep domestic tracking placeholders for Baidu Tongji and future Baidu Union without making them required for MVP.
- Provide a visual system with Chinese traditional colors, literary atmosphere, and enough restraint for reading.
- Provide daily poem, RSS, email subscription, topic discovery, and future personalization paths.
- Write a README that explains setup, development, content rules, SEO, analytics, deployment, and verification.

**Non-Goals:**

- No production login system in the first implementation unless explicitly approved later.
- No paid membership, comments, social feed, or admin CMS in the first implementation.
- No automatic publication of unreviewed AI-generated commentary.
- No scraping competitor sites as a content source.
- No guarantee of Google/Baidu approval or search ranking; the project can only implement compliant technical and content foundations.

## Decisions

### 1. Use Astro Hybrid instead of pure static Astro or Next.js

Astro Hybrid keeps poem, poet, dynasty, theme, collection, article, and daily pages static by default. It also allows server-rendered or API-backed pages for user features later. This fits a content site where SEO and page speed are the first revenue engine, while still leaving a path for login and personal center.

Alternative considered: Next.js full stack. It is attractive for user features, but it raises the first-release complexity and makes it easier to overbuild before proving search traffic. Alternative considered: pure static Astro. It is simpler, but it would make later personalization feel bolted on.

### 2. Separate public content from user data

Public content lives in versioned content/data files and can be statically built. User data later lives in Cloudflare D1/KV behind API routes: account identity, saved poems, interests, email subscription status, and recommendation history. Public pages must not depend on user APIs to render their main content.

This separation keeps crawler-visible pages stable and avoids breaking SEO when user services are down.

### 3. Centralize product configuration

The implementation should have a typed site configuration boundary, for example:

- `site`: canonical host, supported locales, default locale, route prefixes.
- `reading`: enabled display modes, default mode, helper-line defaults, mode persistence behavior.
- `seo`: sitemap limits, indexability rules, crawler policy, structured-data defaults.
- `analytics`: GA4, Cloudflare Web Analytics, Baidu Tongji toggles.
- `ads`: AdSense publisher settings and named slot definitions.
- `features`: subscription, future login, future AI, future personal center.

Components should receive configuration through helpers or props, not import scattered environment variables or repeat string literals. If the default helper language changes from English to modern Chinese later, one config change should update all poem pages.

### 4. Design content pages around value-added sections

Each poem page should include:

- Original text and author/dynasty metadata.
- Modern Chinese explanation.
- English translation or bilingual summary for overseas users.
- Word and phrase notes.
- Background and appreciation.
- Theme tags and related poems.
- Source/license/review metadata.

Pages missing value-added sections should be marked `noindex` or excluded from the public sitemap until they are ready.

### 5. Treat language display as a reading feature and SEO feature

Each poem can have independent language assets: original Chinese text, Chinese explanation, English translation, English commentary, and line-level annotation pairs. The page component should render the same content in several modes:

- Chinese-only: original text, Chinese notes, Chinese explanation.
- English-only: translated title/text, English context, and compact original metadata.
- Bilingual: Chinese and English blocks side by side or stacked on mobile.
- Interlinear: main poem lines with a configurable helper line beneath each line. The helper line can be English, Chinese paraphrase, or later pinyin.

For SEO, Chinese and English canonical routes should exist where the content is substantial enough. Bilingual and interlinear display can be user-selectable on the page without creating many duplicate indexable URLs. If display mode becomes URL-addressable later, it must use canonical rules to avoid duplicate pages.

### 6. Build SEO as a product feature

The site must generate canonical URLs, language alternates, sitemap indexes, robots.txt, structured data, RSS/Atom feeds, Open Graph/Twitter metadata, fast HTML, semantic headings, and internal links. English pages should not be machine-cloned duplicates; they should have useful translation, context, and discovery copy.

AI crawler policy should explicitly allow desired search/answer crawlers unless the user later chooses to block training crawlers. The initial policy should be documented in README instead of hidden in code.

### 7. Monetization starts with AdSense-safe layout

Ad slots should be defined as named placements and rendered only when the required environment variables are configured. The first release should reserve ad areas without inserting hard-coded publisher IDs. Ad placement must avoid covering text, shifting layout heavily, or encouraging accidental clicks.

Baidu Tongji and Baidu Union placeholders should be configuration-driven and disabled by default. This avoids pretending the domestic monetization path is already approved.

### 8. Use a restrained traditional visual identity

The site should feel literary and substantial, not like an antique texture demo. The default palette should use rice paper, ink black, cinnabar, deep teal, muted gold, and stone gray. Typography should prioritize readable Chinese text, balanced English text, and stable responsive layouts. Decorative elements should be structural: seals, rule lines, chapter marks, scroll-like spacing, and subtle ink texture if performance allows.

## Risks / Trade-offs

- [Risk] AdSense may reject a young site with too little original content. → Build enough reviewed content before applying, publish privacy/about/contact pages, and keep thin pages out of the sitemap.
- [Risk] Poetry pages can become near-duplicates across competitors. → Require commentary, translation, theme graph, related reading, and editorial metadata before indexing.
- [Risk] AI-generated explanations can be wrong or generic. → Store review state, show reviewed content first, and keep unreviewed drafts out of public index.
- [Risk] Mainland access through Cloudflare Pages may be inconsistent. → Keep static output portable, document that domestic performance may require a separate deployment/CDN later.
- [Risk] Login and recommendation can distract from SEO MVP. → Design data boundaries now, implement only email/preference capture first, and defer full account center to a later approved change.
- [Risk] Baidu monetization depends on external approval and possibly filing/domain constraints. → Keep Baidu analytics/ad placeholders disabled by default and document the open requirement.
- [Risk] Language and SEO behavior gets duplicated across pages and becomes hard to change. → Use typed config modules and shared rendering helpers, with tests around defaults and mode mapping.

## Migration Plan

1. Create the Astro Hybrid project structure.
2. Add content schema and a small seed corpus with reviewed value-added fields.
3. Implement public SEO pages and visual system.
4. Add analytics/ad placeholders behind environment variables.
5. Add daily poem, RSS, and email subscription stub or provider adapter.
6. Add README and deployment docs.
7. Verify build output, accessibility basics, SEO metadata, sitemap, and responsive screenshots.

Rollback is simple before launch: disable analytics/ad environment variables, keep pages static, or deploy a previous Cloudflare Pages build.

## Open Questions

- Domain name is not decided yet, so final canonical host and Search Console/Baidu verification tokens must stay configurable.
- Email provider is not decided yet. The first implementation should use an adapter boundary and either a disabled form or a provider selected in a later change.
- AI provider/model is not decided yet. Any live AI feature needs a separate approval because it adds cost, policy, and API-key handling.
- Content source must be confirmed before bulk import. Open-source datasets can be considered only after license review.
