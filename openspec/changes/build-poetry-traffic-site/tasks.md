## 1. Project Foundation

- [x] 1.1 Create Astro Hybrid application structure using the repository root.
- [x] 1.2 Add Cloudflare adapter/configuration with static public pages and API-ready routing.
- [x] 1.3 Add TypeScript, formatting, linting, and build scripts matching the chosen stack.
- [x] 1.4 Add environment variable examples for canonical domain, analytics, ads, email, and future AI provider settings.
- [x] 1.5 Add typed config modules for site, reading modes, SEO, analytics, ads, and feature flags.

## 2. Content Model

- [x] 2.1 Define poem, poet, theme, and daily recommendation schemas, including line-level Chinese/English annotation assets.
- [x] 2.2 Add seed content with reviewed value-added fields instead of poem text only.
- [x] 2.3 Add indexability rules that exclude thin or unreviewed pages from sitemap output.
- [x] 2.4 Add source/license/review metadata rendering for public content pages.

## 3. Public Pages

- [x] 3.1 Implement homepage with daily poem, topic entry points, and subscription entry.
- [x] 3.2 Implement poem detail page with original text, notes, explanation, translation, context, appreciation, metadata, and configurable reading modes.
- [x] 3.3 Implement poet, theme, and daily archive pages.
- [x] 3.4 Implement Chinese and English routes for pages that have bilingual content, with display-mode controls that avoid unnecessary duplicate indexable URLs.

## 4. SEO and Discovery

- [x] 4.1 Generate canonical URLs, hreflang alternates, page titles, descriptions, Open Graph, and semantic headings.
- [x] 4.2 Generate sitemap index, content sitemaps, robots.txt, RSS feeds, and AI crawler policy comments.
- [x] 4.3 Add JSON-LD structured data for poem pages.
- [x] 4.4 Add internal linking strategy across poem, poet, theme, and daily pages.

## 5. Monetization and Analytics

- [x] 5.1 Add configuration-driven GA4 and Cloudflare Web Analytics support.
- [x] 5.2 Add disabled-by-default Baidu Tongji placeholder.
- [x] 5.3 Add AdSense-ready named ad slots that render only when configured.
- [x] 5.4 Add privacy, terms, contact, about, and content-source pages linked from the footer.

## 6. Daily Recommendation and Personalization Path

- [x] 6.1 Implement daily poem selection data and daily archive routing.
- [x] 6.2 Add email subscription UI with interest selection and adapter boundary.
- [x] 6.3 Add non-authenticated preference vocabulary that can later map to login accounts.
- [x] 6.4 Document future authenticated personal center boundaries without implementing full login in this change.

## 7. Visual System

- [x] 7.1 Create HTML design mockup for the homepage and poem detail visual direction, including Chinese-only, English-only, bilingual, and interlinear reading modes.
- [x] 7.2 Implement global layout, typography, color tokens, spacing, and responsive navigation after mockup approval.
- [x] 7.3 Implement accessible responsive components for cards, tabs, theme links, ad slots, subscription form, and footer.
- [x] 7.4 Verify mobile and desktop browser views for readability, spacing, and no overlapping UI.

## 8. Documentation and Verification

- [x] 8.1 Write README with purpose, stack, setup, scripts, content rules, SEO, analytics, monetization, deployment, and verification.
- [x] 8.2 Run lint/type/build verification.
- [x] 8.3 Verify generated sitemap, robots.txt, feed, structured metadata, and key page HTML.
- [x] 8.4 Record any unverified external approvals, including AdSense, Baidu Union, domain, and email provider.

Scoped deferrals for later changes:

- Dynasty, collection, article, and search/index pages are not implemented in this MVP slice.
- Website, breadcrumb, poet, and article JSON-LD are not implemented yet; poem JSON-LD is implemented and verified.
- Production login, personal center, AI provider calls, and email provider integration remain behind config boundaries.
