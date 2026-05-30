## ADDED Requirements

### Requirement: Public poem pages include value-added content
The system SHALL render each indexable poem page with original text plus value-added explanation, notes, context, appreciation, translation or bilingual summary, theme tags, related poems, and source metadata.

#### Scenario: Reviewed poem page is indexable
- **WHEN** a poem has original text, metadata, reviewed explanation, notes, context, and related links
- **THEN** the poem page is included in the sitemap and does not emit `noindex`

#### Scenario: Thin poem page is withheld from indexing
- **WHEN** a poem has only original text and basic metadata
- **THEN** the poem page is excluded from the sitemap or emits `noindex`

### Requirement: Content source metadata is visible
The system SHALL display source, license, review status, and last-updated metadata for public poem and article pages.

#### Scenario: Reader opens a poem page
- **WHEN** a reader views a poem detail page
- **THEN** the page shows source/license/review metadata in a visible metadata area

### Requirement: Poetry taxonomy supports discovery
The system SHALL provide poet, dynasty, theme, collection, and article pages that link to related poems and each other.

#### Scenario: Reader browses by theme
- **WHEN** a reader opens a theme page
- **THEN** the page lists related poems, related poets, and editorial reading paths

### Requirement: Poem pages support configurable language presentation
The system SHALL support Chinese-only, English-only, bilingual, and interlinear annotation reading modes for poem pages when the required language assets are available.

#### Scenario: Reader selects Chinese-only mode
- **WHEN** a reader chooses Chinese-only mode
- **THEN** the poem page emphasizes original Chinese text, Chinese notes, and Chinese explanation

#### Scenario: Reader selects English-only mode
- **WHEN** a reader chooses English-only mode
- **THEN** the poem page emphasizes English translation, English context, and compact original Chinese metadata

#### Scenario: Reader selects bilingual mode
- **WHEN** a reader chooses bilingual mode
- **THEN** the poem page presents Chinese and English content together without duplicating indexable URLs unnecessarily

#### Scenario: Reader selects interlinear annotation mode
- **WHEN** a reader chooses interlinear mode and selects English as the helper language
- **THEN** each poem line can render a helper English line beneath it where line-level translation exists

#### Scenario: Reader selects Chinese helper line
- **WHEN** a reader chooses interlinear mode and selects Chinese explanation as the helper language
- **THEN** each poem line can render a modern Chinese helper line beneath it where line-level paraphrase exists
