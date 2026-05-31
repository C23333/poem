## Context

The current site is an MVP. It has the right public-page direction but still lacks production operations, scale-ready content workflows, login/personal center, comments, email provider integration, AI editorial workflow, and full search/monetization operations. The second phase must keep the SEO-first architecture intact: public poem, poet, theme, dynasty, collection, and article pages should remain prerendered when possible, and user-specific features should live behind Cloudflare Functions.

This design deliberately avoids a full admin CMS in the same change. A CMS would add a large UI and permission model before we know the content pipeline. Instead, Phase 2 builds the data contracts, migrations, import scripts, review gates, and operational pages needed to publish content safely from repository-managed Markdown/data first. A CMS can be a later change once the content model stabilizes.

## Goals / Non-Goals

**Goals:**

- Make the site production-deployable on Cloudflare with explicit runtime, binding, environment, and launch checks.
- Prepare for Node 22 and Astro 6 compatibility so current audit issues can be fixed without blind force upgrades.
- Add scalable content operations for poems, poets, dynasties, themes, collections, and editorial articles.
- Expand structured data and discovery workflows for Google, Bing, Baidu, and AI crawlers.
- Add account-ready engagement: email login adapter boundary, preferences, saved poems, reading history, subscription state, and moderated comments.
- Add AI-assisted editorial drafts that cannot publish without review.
- Add monetization compliance files and checks for AdSense/Baidu readiness.

**Non-Goals:**

- No public release of unreviewed AI content.
- No paid provider hard-coding before credentials and cost rules are approved.
- No visual redesign unless required for new pages.
- No guarantee of Google/Baidu/Bing inclusion, ranking, AdSense approval, or Baidu Union approval.
- No full CMS dashboard in this change.

## Architecture

### 1. Keep Public Content Static

Public content remains in Astro content collections and static/generated pages. The build should include only indexable reviewed pages in sitemap output. Thin pages can exist for editorial work but must stay out of public discovery.

New public surfaces:

- `/dynasties/[slug]`
- `/collections/[slug]`
- `/articles/[slug]`
- `/search` or `/poems` index page with static filters
- `/authors` and `/themes` index pages

These pages should use shared content helpers for canonical paths, indexability, related links, and structured data.

### 2. Put User Data Behind Cloudflare Bindings

User data lives in Cloudflare D1 and KV:

- D1: users, identities, preferences, saved poems, reading history, subscriptions, comments, moderation events, AI draft metadata.
- KV: magic-link tokens, rate-limit counters, IndexNow key, short-lived email verification state.

Pages that require user state should use server rendering or API routes. Public poem pages should not require D1/KV to render their main content.

### 3. Provider Adapters

External services sit behind adapters:

- Email adapter: disabled, Resend, Buttondown, Mailchimp, or later custom SMTP.
- AI adapter: disabled, OpenAI-compatible endpoint, or later local model.
- Search submission adapter: IndexNow, Baidu API token, manual checklist fallback.

The config should expose provider choice, endpoint, token presence, and feature flags. Components should not import raw provider env variables.

### 4. Review Gates

The content model should make review state explicit:

- `draft`: not public, not sitemaped.
- `ai-draft`: generated text exists but cannot be indexed.
- `needs-review`: content visible only in preview or admin/editor mode.
- `reviewed`: eligible for indexability checks.
- `published`: public route and sitemap eligible when value-add fields pass.

Bulk import can create draft records. Only reviewed/published content can be included in sitemap, RSS, IndexNow submissions, or daily email.

### 5. SEO and Discovery Operations

Add structured data builders for:

- `WebSite`
- `BreadcrumbList`
- `Person`
- `CollectionPage`
- `Article`
- `CreativeWork`

Add a build-time verification script that checks:

- sitemap has no thin/unreviewed pages
- all sitemap URLs are canonical
- bilingual pairs have reciprocal `hreflang`
- JSON-LD parses
- robots points to the configured domain
- `PUBLIC_SITE_URL` is not `https://example.com` in production mode

IndexNow and Baidu submission should be explicit commands, not automatic every build. This avoids submitting preview URLs or unreviewed content.

### 6. Monetization Compliance

Ad slots stay named and config-driven. When disabled, they must not render reader-visible placeholder text. When enabled, they must:

- use clear ad containers
- avoid accidental-click positioning
- avoid misleading headings like "recommended poem" for ad areas
- never push poem text behind sticky overlays

Add:

- `/ads.txt` route driven by env
- privacy page sections for analytics/ads/email
- README launch checklist for AdSense and Baidu Union

### 7. Deployment and Runtime

Phase 2 should introduce a `wrangler.toml` or `wrangler.jsonc` aligned with Cloudflare Pages Functions, with explicit D1/KV binding names. The project should document local dev, preview, and production environments separately.

Security audit path:

1. Add `engines.node >=22.12.0`.
2. Upgrade Astro/Cloudflare adapter in a controlled task.
3. Run tests, `astro check`, build, browser smoke.
4. Re-run `npm audit`.

Do not run `npm audit fix --force` without this compatibility pass.

## Data Model Sketch

### D1 Tables

- `users`: id, email, display_name, locale, created_at, updated_at.
- `user_identities`: provider, provider_subject, user_id, created_at.
- `user_preferences`: user_id, interest_slugs, default_reading_mode, helper_language, email_frequency.
- `saved_poems`: user_id, poem_slug, note, created_at.
- `reading_history`: user_id, poem_slug, read_at, source.
- `subscriptions`: email, user_id, status, interest_slugs, unsubscribe_token_hash, created_at, updated_at.
- `comments`: id, poem_slug, user_id, body, status, created_at, updated_at.
- `comment_moderation_events`: comment_id, actor, action, reason, created_at.
- `ai_drafts`: id, content_key, provider, prompt_version, output_hash, status, reviewer, created_at, reviewed_at.

### KV Namespaces

- `POETRY_SESSION`: future auth/session data if Astro sessions remain enabled.
- `POETRY_TOKENS`: magic link and unsubscribe tokens.
- `POETRY_RATE_LIMIT`: rate counters for comments, login links, subscriptions, and AI calls.
- `POETRY_INDEXNOW`: IndexNow key and submission state.

## Error Handling

- Provider disabled: return explicit 503 JSON from API routes and keep public UI non-submitting.
- Missing production env: fail build or deployment check before publishing.
- D1/KV binding missing: API route returns explicit configuration error in non-production; production deploy check should catch this first.
- AI provider error: keep draft as failed, never publish partial output.
- Comment moderation failure: keep comment pending, do not expose it publicly.
- Search submission failure: record status and retry manually; never block site build.

## Testing

- Unit tests for config normalization, content indexability, structured data, D1 repository functions, provider adapters, and submission payloads.
- API route tests for subscription, preference save, comment create/moderate, saved poem toggle, AI draft create.
- Build verification script tests for sitemap, robots, JSON-LD, and `hreflang`.
- Browser smoke for homepage, poem page, search/index page, personal center, comment form, and subscription form.
- Manual deployment checklist for Cloudflare binding presence and external webmaster-console setup.

## Rollout

1. Add production config validation and Node 22 compatibility plan.
2. Add content scale surfaces and verification scripts.
3. Add D1/KV migrations and read/write repositories.
4. Add API routes and UI for subscription, preferences, saved poems, and comments.
5. Add AI draft adapter and editorial review gates.
6. Add discovery submission commands and monetization readiness files.
7. Deploy to Cloudflare preview, verify, then production.

## Open Questions

- Domain is still unknown. Until chosen, production deploy must fail if `PUBLIC_SITE_URL=https://example.com`.
- Email provider is unknown. Phase 2 should keep adapter boundaries and can implement a local/dev adapter plus one approved provider after user selection.
- AI provider/model is unknown. Live calls require explicit provider and cost approval.
- Baidu Union may require ICP/domain constraints. Do not enable domestic ads before those requirements are confirmed.
- GitHub push is currently blocked by credential/network state; local implementation can continue, but remote CI/deploy cannot run until push works.
