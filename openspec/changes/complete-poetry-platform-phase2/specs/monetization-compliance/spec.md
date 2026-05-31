## ADDED Requirements

### Requirement: Ads Txt

The system SHALL provide an `ads.txt` route driven by configuration and SHALL keep it empty or disabled until an approved publisher ID exists.

#### Scenario: AdSense publisher missing

- **GIVEN** no AdSense publisher ID is configured
- **WHEN** `/ads.txt` is requested
- **THEN** it SHALL return a safe empty response or disabled comment, not a fake publisher record.

### Requirement: Policy-Safe Ad Rendering

The system SHALL render ad slots only when configured and SHALL avoid misleading labels, accidental-click placements, sticky overlays over poem text, and reader-visible development placeholders.

#### Scenario: Ads disabled

- **GIVEN** ads are disabled
- **WHEN** a page renders
- **THEN** no reader-visible ad placeholder text SHALL appear.

### Requirement: Consent And Privacy Updates

The system SHALL update privacy/terms pages and consent behavior when non-essential analytics, advertising, or email tracking features are enabled.

#### Scenario: Analytics enabled

- **GIVEN** GA4, Cloudflare Web Analytics, or Baidu Tongji is enabled
- **WHEN** privacy page renders
- **THEN** it SHALL mention enabled analytics categories and how users can contact the site owner.

### Requirement: Monetization Launch Checklist

The system SHALL document AdSense and Baidu Union readiness requirements, including content volume, policy pages, traffic source quality, domain verification, and external approval status.

#### Scenario: External approval missing

- **GIVEN** AdSense or Baidu Union is not approved
- **WHEN** release readiness is reported
- **THEN** the report SHALL mark monetization approval as unverified instead of claiming revenue readiness.
