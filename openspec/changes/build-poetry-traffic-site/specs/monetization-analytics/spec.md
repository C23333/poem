## ADDED Requirements

### Requirement: Analytics is configuration-driven
The system SHALL load Google Analytics, Cloudflare Web Analytics, and Baidu Tongji only when corresponding public environment variables are configured.

#### Scenario: Analytics IDs are absent
- **WHEN** analytics environment variables are not configured
- **THEN** no analytics script is rendered

#### Scenario: Google Analytics ID is configured
- **WHEN** the Google Analytics measurement ID is configured
- **THEN** the site renders the GA4 tag according to the configured ID

### Requirement: AdSense placement is safe and optional
The system SHALL define named ad placements that render only when AdSense configuration is present and never obscure poem text or navigation.

#### Scenario: AdSense config is absent
- **WHEN** AdSense publisher configuration is not present
- **THEN** ad components render reserved non-ad layout or nothing without broken scripts

#### Scenario: AdSense config is present
- **WHEN** AdSense publisher configuration is present
- **THEN** ad components render only in approved slots around content, not inside line-by-line poem text

### Requirement: Policy pages exist before monetization
The system SHALL provide privacy, terms, contact, about, and content-source pages before advertising scripts are enabled.

#### Scenario: Advertising is enabled
- **WHEN** AdSense rendering is enabled
- **THEN** the policy pages are reachable from the site footer
