# Specification: Improved Character Modal UI/UX

## Overview
This track focuses on enhancing the user experience and visual design of the character creation/editing modal. The current form is a single scrolling page that can feel overwhelming. We will transition to a guided wizard approach with richer data visualization and helpful user cues.

## Functional Requirements
- **Guided Creation (Wizard):** Reorganize the form into three distinct steps:
    1. **Step 1: Core Attributes** (Name, Age, Occupation, Physical Description).
    2. **Step 2: Psychological Profile** (OCEAN traits with radar chart).
    3. **Step 3: Narrative Core** (Goal, Motivation, Conflict, Voice, Mannerisms).
- **Radar Chart Visualization:** Implement a radar chart using a lightweight charting library (e.g., `recharts` or custom SVG) to visualize the OCEAN scores in real-time.
- **Semantic OCEAN Labels:** Display "Low", "Moderate", "High" labels next to the percentage scores based on value ranges.
- **Auto-save Drafts:** Implement a local state persistence (or temporary debounce save) to ensure users don't lose work if the modal is closed accidentally.
- **Inline Validation:** Highlight fields with errors immediately after they lose focus (blur event) or as the user types.
- **Word/Character Counts:** Add a "limit" indicator for longer text areas like "Physical Description" and "Conflict".
- **Contextual Help:** Add info icons/tooltips explaining psychological and narrative terms (e.g., what "Neuroticism" or "Internal Conflict" means in a literary context).

## Non-Functional Requirements
- **Minimalist Aesthetic:** Retain the monochrome, clean look of StoryForge.
- **Responsiveness:** Ensure the wizard layout adapts well to smaller desktop resolutions.
- **Performance:** Chart updates must be fluid and not cause input lag.

## Acceptance Criteria
- [ ] Users can navigate between the 3 steps of the wizard.
- [ ] The radar chart correctly reflects the slider values in Step 2.
- [ ] Inline validation prevents saving if required fields (Name) are empty.
- [ ] Tooltips appear on hover for specialized terms.
- [ ] The "Minimalist Mono" style is strictly followed.

## Out of Scope
- Backend changes to the Character database schema.
- Image uploads for character portraits.
