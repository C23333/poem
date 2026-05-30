## ADDED Requirements

### Requirement: Site deploys to Cloudflare
The system SHALL be deployable to Cloudflare Pages with documented build command, output directory, environment variables, and optional Workers/Pages Functions.

#### Scenario: Maintainer reads deployment docs
- **WHEN** a maintainer opens the README
- **THEN** they can find the Cloudflare deployment steps and required variables

### Requirement: README documents project operation
The system SHALL include README sections for purpose, stack, setup, scripts, content rules, SEO, analytics, monetization, deployment, and verification.

#### Scenario: New maintainer opens README
- **WHEN** a maintainer reads the README
- **THEN** they can understand how to run, build, verify, and safely add content

### Requirement: Verification commands are documented and runnable
The system SHALL provide documented commands for linting, type checking, building, and validating SEO output.

#### Scenario: Maintainer verifies a release
- **WHEN** a maintainer runs the documented verification commands
- **THEN** the commands validate application code, production build, sitemap generation, and key SEO files

### Requirement: Product behavior is centrally configurable
The system SHALL centralize site, reading-mode, SEO, analytics, ad, and feature-flag behavior in typed configuration boundaries instead of scattering duplicated constants across pages.

#### Scenario: Default reading helper language changes
- **WHEN** the default helper-line language is changed in the reading configuration
- **THEN** all poem pages and reading-mode controls use the new default without per-page edits

#### Scenario: Analytics provider is disabled
- **WHEN** an analytics provider is disabled in configuration
- **THEN** no page renders that provider script

#### Scenario: Ad slot placement changes
- **WHEN** a named ad slot is moved or disabled in ad configuration
- **THEN** pages using that slot reflect the change through the shared ad component without local template edits
