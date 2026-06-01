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
- `PUBLIC_ADSENSE_PUBLISHER_ID`: AdSense publisher ID used for `ads.txt`; leave empty until the account is approved.
- `PUBLIC_ENABLE_ADS`: enables ad rendering only when true and AdSense client exists.
- `PUBLIC_ENABLE_SUBSCRIPTION`: enables the daily poem subscription form only when true.
- `PUBLIC_SUBSCRIPTION_ENDPOINT`: future subscription API endpoint. Empty means the form is disabled.
- `PUBLIC_ENABLE_AI`: enables future AI features only when true.
- `PUBLIC_AI_ENDPOINT`: future AI endpoint for explanation or recommendation features.
- `INDEXNOW_KEY`: future IndexNow key; no URL submission runs unless a real key is configured.
- `BAIDU_SUBMIT_TOKEN`: future Baidu Search Resource Platform push token; missing token must fail submission instead of silently skipping.

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

Current discovery checks:

```powershell
npm run verify:content
npm run verify:discovery
```

`verify:content` checks reviewed/published poems for value-added fields, source/license metadata, duplicate canonical slugs, and related-poem references. `verify:discovery` checks built `dist` output for sitemap, robots, RSS, sitemap exclusion of thin pages, and parseable JSON-LD.

Search submission commands are explicit and never run automatically during build:

```powershell
$env:PUBLIC_SITE_URL="https://your-domain.example"
$env:INDEXNOW_KEY="your-indexnow-key"
npm run build
npm run submit:indexnow -- --dry-run
npm run submit:indexnow

$env:BAIDU_SUBMIT_TOKEN="your-baidu-token"
npm run submit:baidu -- --dry-run
npm run submit:baidu
```

Both commands read `dist/sitemap-0.xml`, reject URLs whose host does not match `PUBLIC_SITE_URL`, and fail when the required token is missing. IndexNow also exposes `/{INDEXNOW_KEY}.txt` through the dynamic key route. Rebuild with the real `PUBLIC_SITE_URL` before running either submit command.

For external consoles, submit the production domain after deployment:

- Google Search Console: verify domain, submit `https://your-domain/sitemap-index.xml`, inspect important poem/article URLs.
- Bing Webmaster Tools: verify domain, submit sitemap, then enable IndexNow only after `INDEXNOW_KEY` is hosted and `/{INDEXNOW_KEY}.txt` returns the key.
- Baidu Search Resource Platform: verify domain, submit sitemap or API URLs after ICP/domain requirements are clear. Baidu URL push can speed discovery, but it does not guarantee indexing.
- AI crawlers: keep crawlable public pages in initial HTML; adjust `robots.txt` only after deciding whether to allow or restrict specific AI crawlers.

## Analytics and Monetization

Analytics and ads are disabled unless configured. AdSense approval is external and not guaranteed. Before enabling ads, keep these pages reachable from the footer:

- About
- Privacy
- Terms
- Contact
- Content Sources

`ads.txt` is generated from `PUBLIC_ADSENSE_PUBLISHER_ID`. When the publisher ID is empty, the route returns a disabled comment and does not emit a fake record. Google AdSense uses `google.com, pub-..., DIRECT, f08c47fec0942fa0` for AdSense publisher authorization records, so only add the real `pub-` ID after account approval.

Baidu Tongji and future Baidu Union are configuration placeholders for now. Baidu Union approval, AdSense approval, click/traffic quality, and revenue are not verified by this repository.

Monetization readiness before applying:

- Real domain configured in `PUBLIC_SITE_URL`.
- Policy pages complete: About, Privacy, Terms, Contact, Content Sources.
- No fake `ads.txt` publisher record.
- At least a small batch of reviewed value-added pages beyond public-domain originals.
- No reader-visible ad placeholders while ads are disabled.
- Search Console/Bing/Baidu verification status recorded outside the repo.

## Daily and Personalization

The first release includes a daily poem route and a disabled-by-default subscription UI. Interest tags live in `src/config/site.ts`, so later email, login, and personal-center features can reuse the same preference vocabulary.

No email provider or AI provider is called in the MVP. Configure those through `PUBLIC_SUBSCRIPTION_ENDPOINT` and `PUBLIC_AI_ENDPOINT` after the provider and cost rules are selected.

Account-ready routes and data boundaries now exist but stay disabled by default:

- D1 migration: `migrations/0001_user_engagement.sql`
- Personal center: `/me`
- Login API boundary: `/api/auth/magic-link`
- Preferences API boundary: `/api/preferences`
- Saved poems API boundary: `/api/saved-poems`
- Comments API boundary: `/api/comments`

Use these flags only after a real auth/email plan and D1 binding IDs are configured:

```dotenv
PUBLIC_ENABLE_LOGIN=true
PUBLIC_ENABLE_PERSONAL_CENTER=true
PUBLIC_ENABLE_COMMENTS=true
```

When disabled, these APIs return explicit `503` JSON. Comments are designed to be stored as `pending` first and only approved comments can be read for public pages.

`/api/preferences` can read and save preferences once `PUBLIC_ENABLE_PERSONAL_CENTER=true`, `locals.user` is populated by a real auth layer, and the `POETRY_DB` D1 binding is available. Without authentication it returns `401`; without D1 it returns `501`.

## Cloudflare Deployment

Deploy to Cloudflare Pages with:

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables from `.env.example`

Production validation:

```powershell
npm run validate:production
```

With the default `https://example.com` placeholder this command must fail. Set a real domain before preview or production release:

```powershell
$env:PUBLIC_SITE_URL="https://your-domain.example"
npm run validate:production
```

`wrangler.toml` declares placeholder D1/KV binding names for Phase 2 features. It also declares `SESSION`, because the Astro Cloudflare adapter expects that KV binding when sessions are enabled by the adapter. Replace placeholder IDs in Cloudflare before enabling login, comments, subscriptions, or rate-limited APIs.

Launch runbook:

- Create Cloudflare Pages project and connect the repository branch.
- Configure Node/runtime version; current dependency audit remediation needs a separate Node 22/Astro 6 compatibility pass.
- Set `PUBLIC_SITE_URL` to the real domain and add analytics/ad variables only after approval.
- Replace placeholder D1/KV IDs or keep account features disabled.
- Run `npm test`, `npm run check`, `npm run build`, `npm run verify:content`, `npm run verify:discovery`, and `npm run validate:production`.
- Deploy preview, inspect representative pages, `robots.txt`, `rss.xml`, `sitemap-index.xml`, and `ads.txt`.
- Add custom domain, verify HTTPS, then submit sitemap to external webmaster consoles.
- Roll back through the previous Cloudflare Pages deployment if build output, indexing controls, or policy pages are wrong.

The current Cloudflare adapter config logs a `SESSION` KV binding hint because Astro sessions are supported by the adapter. The repository declares that binding in `wrangler.toml`; production still needs a real KV namespace ID instead of the placeholder value.

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
npm run verify:content
npm run verify:discovery
```

After build, inspect:

- `dist/robots.txt`
- `dist/rss.xml`
- generated sitemap files
- `dist/ads.txt`
- representative poem page HTML
- mobile and desktop screenshots

## Current Phase 2A Status

Implemented in this branch:

- production config helper and validation script
- explicit content review states
- dynasty, collection, article, poem index, poet index, and theme index pages
- expanded JSON-LD for site, breadcrumbs, people, collections, articles, and poems
- content and discovery verification scripts
- IndexNow key route and submit command
- Baidu URL submission command
- D1 migration and repository SQL for users, identities, preferences, saved poems, reading history, subscriptions, comments, and moderation events
- disabled-by-default login, personal-center, saved-poem, and comment API boundaries, with explicit `503`/`501` responses for disabled or unwired features
- `/me` personal center route with an anonymous/login-disabled prompt and config-driven preference form
- preference read/save API wired to authenticated `locals.user` plus Cloudflare D1
- saved-poem read/save/delete API wired to authenticated `locals.user`, Cloudflare D1, and reviewed-poem slug validation
- comment read/submit/moderation APIs with approved-only public reads, pending-by-default submissions, and KV-backed rate-limit boundary
- config-driven `ads.txt`
- real contact/privacy/terms pages
- Cloudflare binding skeleton in `wrangler.toml`

Still not implemented:

- real login sessions and profile data reads
- real magic-link email delivery and authenticated sessions
- real daily email delivery
- real AI provider calls and editorial review UI
- Node 22/Astro 6 security-upgrade pass
- external domain, Cloudflare project, webmaster-console verification, AdSense approval, Baidu Union approval
