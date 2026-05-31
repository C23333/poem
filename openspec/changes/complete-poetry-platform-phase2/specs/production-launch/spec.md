## ADDED Requirements

### Requirement: Production Environment Validation

The system SHALL provide a production validation command that fails before deployment when required production configuration is missing or unsafe.

#### Scenario: Reject placeholder domain in production

- **GIVEN** `PUBLIC_SITE_URL` is `https://example.com`
- **WHEN** production validation runs
- **THEN** validation SHALL fail with a message that the canonical production domain must be configured.

#### Scenario: Require Cloudflare bindings for enabled server features

- **GIVEN** login, subscription persistence, comments, saved poems, or AI drafts are enabled
- **WHEN** production validation runs
- **THEN** validation SHALL require D1/KV binding names for the enabled feature set.

### Requirement: Runtime Upgrade Path

The system SHALL document and verify a Node 22 compatibility path before upgrading Astro/Cloudflare dependencies that require Node `>=22.12.0`.

#### Scenario: Prevent blind audit force upgrade

- **GIVEN** the project runs on Node 20
- **WHEN** a developer reads the launch documentation
- **THEN** the documentation SHALL state that `npm audit fix --force` is not approved until Node 22 compatibility is verified.

### Requirement: Cloudflare Deployment Configuration

The system SHALL include Cloudflare Pages/Functions configuration for D1/KV bindings used by Phase 2 features.

#### Scenario: Bindings are named consistently

- **GIVEN** a developer opens the Cloudflare config
- **WHEN** they compare it with the README
- **THEN** D1 and KV binding names SHALL match the names used by application code and validation scripts.

### Requirement: Launch Runbook

The system SHALL include a launch runbook covering build, preview deployment, production deployment, rollback, domain verification, and external console setup.

#### Scenario: Production launch checklist

- **GIVEN** the launch runbook is followed
- **WHEN** the site is deployed
- **THEN** the operator SHALL have checked build output, sitemap, robots, RSS, analytics disabled/enabled state, ad disabled/enabled state, Cloudflare bindings, and canonical domain.
