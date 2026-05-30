## ADDED Requirements

### Requirement: Site uses a traditional literary visual system
The system SHALL use a restrained Chinese literary visual identity with rice paper, ink, cinnabar, deep teal, muted gold, and stone-gray tones.

#### Scenario: Reader opens a public page
- **WHEN** a reader views the homepage or poem page
- **THEN** the page presents a coherent traditional literary style without reducing text readability

### Requirement: Layout prioritizes reading
The system SHALL provide responsive layouts that keep poem text, explanations, navigation, recommendations, and ad slots visually separated.

#### Scenario: Reader views on mobile
- **WHEN** a reader opens a poem page on a narrow viewport
- **THEN** poem text and explanation remain readable and no UI element overlaps another

### Requirement: Reading mode controls are clear
The system SHALL provide visible controls for Chinese-only, English-only, bilingual, and interlinear modes without making the poem text feel like a settings panel.

#### Scenario: Reader switches reading mode
- **WHEN** a reader changes the language display mode
- **THEN** the poem content updates layout clearly and keeps the selected mode visually indicated

### Requirement: Visual design is reviewed before implementation
The system SHALL include an HTML design mockup for user review before production UI implementation begins.

#### Scenario: Design phase completes
- **WHEN** the proposal and design are ready for review
- **THEN** a local HTML design mockup exists and can be opened to inspect the proposed visual direction
