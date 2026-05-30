# 未名诗阁 Poetry Traffic Site

Chinese classical poetry site for global SEO traffic. The first release focuses on crawlable public content, bilingual reading modes, daily poem discovery, AdSense-ready layout, and Cloudflare deployment.

## Stack

- Astro Hybrid
- TypeScript
- Astro content collections
- Vitest
- Cloudflare Pages / Workers target

## Development

```powershell
npm install
npm run dev
npm run check
npm test
npm run build
```

## Configuration

Copy `.env.example` to `.env` and set values as needed.

- `PUBLIC_SITE_URL`: canonical domain.
- `PUBLIC_DEFAULT_LOCALE`: default locale.
- `PUBLIC_DEFAULT_READING_MODE`: `zh`, `en`, `bilingual`, or `interlinear`.
- `PUBLIC_DEFAULT_HELPER_LANGUAGE`: `en`, `zh`, or `pinyin`.
- `PUBLIC_GA4_ID`: Google Analytics 4 ID.
- `PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`: Cloudflare Web Analytics token.
- `PUBLIC_BAIDU_TONGJI_ID`: Baidu Tongji ID, disabled when empty.
- `PUBLIC_ADSENSE_CLIENT`: AdSense client ID.
- `PUBLIC_ENABLE_ADS`: enables ad rendering only when true and AdSense client exists.
- `PUBLIC_ENABLE_SUBSCRIPTION`: enables the daily poem subscription form only when true.
- `PUBLIC_SUBSCRIPTION_ENDPOINT`: future subscription API endpoint. Empty means the form is disabled.
- `PUBLIC_ENABLE_AI`: enables future AI features only when true.
- `PUBLIC_AI_ENDPOINT`: future AI endpoint for explanation or recommendation features.

## Content Rules

Do not publish poem-text-only pages into the public sitemap. An indexable poem page needs reviewed value-added material:

- original text
- line-level helper data where available
- modern Chinese explanation
- Chinese commentary
- English translation or English commentary for English routes
- source, license, review status, updated date
- theme links and related reading paths

Unreviewed or thin pages must render `noindex` or stay out of sitemap output.

## Reading Modes

Reading behavior is controlled by `src/config/site.ts`.

- Chinese-only: original Chinese, notes, explanation.
- English-only: translation and English context.
- Bilingual: Chinese and English together.
- Interlinear: poem lines with helper lines below. Helper language can be English, modern Chinese, or later pinyin.

## SEO

The site must keep public pages crawlable in initial HTML. Required outputs:

- canonical URL
- title and description
- semantic headings
- `hreflang` for substantial Chinese/English pairs
- sitemap
- robots.txt
- RSS feed
- JSON-LD

Display modes should not create duplicate indexable URLs unless a mode becomes a substantial standalone page with its own canonical strategy.

## Analytics and Monetization

Analytics and ads are disabled unless configured. AdSense approval is external and not guaranteed. Before enabling ads, keep these pages reachable from the footer:

- About
- Privacy
- Terms
- Contact
- Content Sources

Baidu Tongji and future Baidu Union are configuration placeholders for now.

## Daily and Personalization

The first release includes a daily poem route and a disabled-by-default subscription UI. Interest tags live in `src/config/site.ts`, so later email, login, and personal-center features can reuse the same preference vocabulary.

No email provider, account system, or AI provider is called in the MVP. Configure those through `PUBLIC_SUBSCRIPTION_ENDPOINT` and `PUBLIC_AI_ENDPOINT` after the provider and cost rules are selected.

## Cloudflare Deployment

Deploy to Cloudflare Pages with:

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables from `.env.example`

The current Cloudflare adapter config logs a `SESSION` KV binding hint because Astro sessions are supported by the adapter. The MVP does not use login sessions yet, but a production Cloudflare project should either add a `SESSION` KV namespace before enabling server features that use sessions, or revisit the adapter/session config when the login plan is implemented.

Future login, personal center, and recommendation APIs should use Cloudflare Workers/Pages Functions and D1/KV behind the same typed config boundary.

## Dependency Audit

On Node 20, the project uses Astro 5-compatible packages. `npm audit --audit-level=moderate` currently reports vulnerabilities in the Astro/Cloudflare/Wrangler dependency chain. The available npm fix upgrades to Astro 6 and `@astrojs/cloudflare` 13, but `astro@6.4.2` requires Node `>=22.12.0`.

Do not run `npm audit fix --force` on the Node 20 environment without approving a Node 22 upgrade and a follow-up compatibility pass.

## Verification

Run before claiming a release:

```powershell
npm run check
npm test
npm run build
```

After build, inspect:

- `dist/robots.txt`
- `dist/rss.xml`
- generated sitemap files
- representative poem page HTML
- mobile and desktop screenshots
