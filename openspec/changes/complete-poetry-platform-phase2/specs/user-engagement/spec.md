## ADDED Requirements

### Requirement: Account-Ready User Data

The system SHALL define D1 migrations and repository functions for users, identities, preferences, saved poems, reading history, subscriptions, comments, and moderation events.

#### Scenario: User preference save is persisted

- **GIVEN** a user has selected interest tags and a reading mode
- **WHEN** the preference API receives a valid request
- **THEN** the preferences SHALL be stored in D1 and returned by the profile API.

### Requirement: Login Boundary

The system SHALL provide a disabled-by-default magic-link login adapter boundary without requiring a provider in development.

#### Scenario: Login disabled

- **GIVEN** login is disabled in config
- **WHEN** a login request is submitted
- **THEN** the API SHALL return a clear disabled response and SHALL NOT send email.

### Requirement: Personal Center

The system SHALL provide a personal center route for preferences, saved poems, reading history, and subscription state when login is enabled.

#### Scenario: Anonymous visitor sees login prompt

- **GIVEN** a visitor is not authenticated
- **WHEN** they open the personal center route
- **THEN** they SHALL see a login prompt instead of private data.

### Requirement: Saved Poems

The system SHALL allow authenticated users to save and unsave reviewed poems.

#### Scenario: Save reviewed poem

- **GIVEN** an authenticated user opens a reviewed poem page
- **WHEN** they save the poem
- **THEN** the saved poem SHALL appear in their personal center.

### Requirement: Moderated Comments

The system SHALL support comments on reviewed poem pages with moderation states and rate limits.

#### Scenario: New comment is pending

- **GIVEN** comments are enabled
- **WHEN** a user submits a valid comment
- **THEN** the comment SHALL be stored as pending and SHALL NOT appear publicly until approved.

#### Scenario: Rejected comment is hidden

- **GIVEN** a comment is rejected
- **WHEN** a public poem page renders
- **THEN** the rejected comment SHALL NOT appear in the page HTML.
