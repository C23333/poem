## ADDED Requirements

### Requirement: Governed Content States

The system SHALL represent content review state explicitly and SHALL only include reviewed/published value-added pages in sitemap and feed outputs.

#### Scenario: AI draft is excluded from discovery

- **GIVEN** a poem has `reviewState: ai-draft`
- **WHEN** sitemap and RSS outputs are generated
- **THEN** the poem SHALL be excluded.

#### Scenario: Reviewed poem with missing value-add remains excluded

- **GIVEN** a poem is marked reviewed but lacks commentary, explanation, or line helpers
- **WHEN** indexability checks run
- **THEN** the poem SHALL be treated as non-indexable.

### Requirement: Expanded Public Content Surfaces

The system SHALL add static public routes for dynasties, collections, articles, and index/search pages.

#### Scenario: Dynasty page links related poets and poems

- **GIVEN** a dynasty page exists
- **WHEN** a crawler reads the initial HTML
- **THEN** it SHALL include crawlable links to related poets and reviewed poems.

#### Scenario: Static search/index page is crawlable

- **GIVEN** the poems index page exists
- **WHEN** JavaScript is disabled
- **THEN** reviewed poems SHALL remain discoverable through static links and filters.

### Requirement: Import And Review Scripts

The system SHALL provide scripts to import public-domain poem data into draft content files without automatically publishing them.

#### Scenario: Bulk import creates drafts

- **GIVEN** an import source contains multiple poems
- **WHEN** the import script runs
- **THEN** generated content SHALL use draft or needs-review state by default.

### Requirement: Content Verification

The system SHALL provide automated content verification for value-added fields, source/license metadata, duplicate canonical paths, and route slug validity.

#### Scenario: Missing source metadata fails verification

- **GIVEN** an indexable poem lacks source or license metadata
- **WHEN** content verification runs
- **THEN** verification SHALL fail with the poem slug and missing fields.
