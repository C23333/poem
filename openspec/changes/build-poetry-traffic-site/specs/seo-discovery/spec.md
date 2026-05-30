## ADDED Requirements

### Requirement: Site emits crawlable SEO metadata
The system SHALL emit unique title, description, canonical URL, Open Graph metadata, semantic headings, and language metadata for every public page.

#### Scenario: Search crawler reads a poem page
- **WHEN** a crawler requests a poem page
- **THEN** the initial HTML contains the poem content, SEO title, description, canonical URL, and semantic headings without requiring client-side rendering

### Requirement: Site supports multilingual discovery
The system SHALL support Chinese and English routes with canonical and hreflang links for equivalent pages.

#### Scenario: Chinese and English poem pages exist
- **WHEN** both language versions are available for a poem
- **THEN** each page links to the other through hreflang alternates and has its own canonical URL

#### Scenario: Display mode changes on a poem page
- **WHEN** a reader changes between Chinese-only, English-only, bilingual, and interlinear display modes on the same route
- **THEN** the page preserves a single canonical URL unless a separate language route contains substantial standalone content

### Requirement: Site publishes discovery files
The system SHALL generate robots.txt, sitemap indexes, per-content sitemaps, RSS or Atom feeds, and documented AI crawler policy.

#### Scenario: Build completes
- **WHEN** the production build finishes
- **THEN** sitemap files, robots.txt, and feed files are generated for the configured canonical domain

### Requirement: Site uses structured data
The system SHALL emit JSON-LD structured data for website, breadcrumb, person, article, and creative work-like poem pages where fields are available.

#### Scenario: Poem page has structured metadata
- **WHEN** a poem page is rendered
- **THEN** JSON-LD includes page identity, breadcrumb, author, language, and publication metadata where available
