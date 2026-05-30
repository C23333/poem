## ADDED Requirements

### Requirement: Site publishes a daily poem
The system SHALL render a daily poem module on the homepage and a dedicated daily archive page.

#### Scenario: Reader opens homepage
- **WHEN** a reader visits the homepage
- **THEN** the page shows today's poem with a short reason for recommendation and a link to the full poem page

### Requirement: Readers can subscribe to daily poetry
The system SHALL provide an email subscription entry point with interest selection and clear unsubscribe expectations.

#### Scenario: Reader submits subscription form
- **WHEN** a reader enters an email and selects interests
- **THEN** the system records or forwards the subscription request through the configured email adapter and shows a confirmation state

### Requirement: Personalization is designed for later login
The system SHALL separate anonymous interest capture from future authenticated features such as saved poems, reading history, personal center, and recommendation preferences.

#### Scenario: Future login is added
- **WHEN** authenticated user features are implemented later
- **THEN** they can reuse the existing interest and recommendation concepts without changing public poem page URLs
