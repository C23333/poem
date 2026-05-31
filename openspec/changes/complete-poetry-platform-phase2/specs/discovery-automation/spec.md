## ADDED Requirements

### Requirement: Structured Data Expansion

The system SHALL generate valid JSON-LD for site, breadcrumbs, persons, collections, articles, and poems.

#### Scenario: Poem page includes breadcrumb JSON-LD

- **GIVEN** a reviewed poem page is rendered
- **WHEN** the page HTML is inspected
- **THEN** it SHALL include valid `CreativeWork` and `BreadcrumbList` JSON-LD.

#### Scenario: Poet page includes Person JSON-LD

- **GIVEN** a poet page is rendered
- **WHEN** the page HTML is inspected
- **THEN** it SHALL include valid `Person` JSON-LD with canonical URL.

### Requirement: Discovery Verification Script

The system SHALL provide a build-output verification script for sitemap, robots, RSS, canonical URLs, reciprocal `hreflang`, and JSON-LD parsing.

#### Scenario: Bad sitemap URL fails verification

- **GIVEN** a sitemap URL uses a different host from `PUBLIC_SITE_URL`
- **WHEN** discovery verification runs
- **THEN** verification SHALL fail.

### Requirement: IndexNow Support

The system SHALL support IndexNow key file generation and URL submission without automatic submission on every build.

#### Scenario: Key route is available

- **GIVEN** `INDEXNOW_KEY` is configured
- **WHEN** the key URL is requested
- **THEN** the response SHALL contain the key text required by IndexNow.

#### Scenario: Submission command sends reviewed URLs only

- **GIVEN** sitemap contains reviewed URLs and draft URLs exist locally
- **WHEN** IndexNow submission runs
- **THEN** only reviewed sitemap URLs SHALL be submitted.

### Requirement: Webmaster Console Runbooks

The system SHALL document manual setup for Google Search Console, Bing Webmaster Tools, Baidu Search Resource Platform, and AI crawler policy checks.

#### Scenario: Baidu token missing

- **GIVEN** no Baidu submission token is configured
- **WHEN** the Baidu submission command runs
- **THEN** it SHALL fail with a clear message and SHALL NOT silently skip submission.
