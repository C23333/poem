## ADDED Requirements

### Requirement: AI Provider Adapter

The system SHALL expose AI functionality through a disabled-by-default provider adapter with explicit endpoint, model, token, and usage limits.

#### Scenario: AI disabled

- **GIVEN** AI is disabled
- **WHEN** an AI draft request is submitted
- **THEN** the API SHALL return a disabled response and SHALL NOT call any external provider.

### Requirement: Draft-Only AI Output

The system SHALL store AI-generated explanations, translations, notes, and related-poem suggestions as drafts that require human review before publication.

#### Scenario: AI draft cannot publish automatically

- **GIVEN** an AI draft is generated successfully
- **WHEN** content discovery outputs are built
- **THEN** the draft SHALL NOT be included in sitemap, RSS, IndexNow, or public page HTML until reviewed.

### Requirement: Prompt And Output Audit Trail

The system SHALL record prompt version, provider name, model name, input content key, output hash, status, reviewer, and timestamps for AI drafts.

#### Scenario: Reviewer approves draft

- **GIVEN** a reviewer approves an AI draft
- **WHEN** the draft becomes public content
- **THEN** the review metadata SHALL show that the published text passed review.

### Requirement: AI Quality Checks

The system SHALL run quality checks on AI drafts for missing citations/source notes, empty translations, unsupported claims, duplicate output, and length boundaries.

#### Scenario: Unsupported claim is flagged

- **GIVEN** an AI draft contains historical claims without source notes
- **WHEN** quality checks run
- **THEN** the draft SHALL be marked needs-review and SHALL NOT be publishable.
