# Specification: Modal System for Lore Creation

## Overview
This track implements a unified modal system to replace native `prompt` calls and enhance the lore creation experience. We will transition from simple text prompts to feature-rich forms displayed in a "Slide-over Panel" with smooth animations.

## Functional Requirements
- **Generic Modal Component:** Create a reusable `Modal` component featuring:
    - Slide-over panel layout (anchored to the right side).
    - Scale & Fade entry animations.
    - Backdrop overlay that closes the modal on click.
    - Accessibility support (ESC key to close, focus trapping).
- **Location Modal:** Replace the `prompt` in `handleCreateLocation` with a `Modal` containing the `LocationForm`.
- **World Rule Modal:** Replace the `prompt` in `handleCreateRule` with a `Modal` containing the `WorldRuleForm`.
- **Character Wizard Modal:** Refactor `BibleDashboard` to show the `CharacterWizard` inside a `Modal` instead of replacing the main dashboard view.
- **Form Integration:** Ensure all lore forms correctly trigger the same save/cancel logic previously used by the native prompts.

## Non-Functional Requirements
- **Z-Index Management:** Ensure modals appear above all other UI elements (Dashboards, Navigation).
- **Mobile Friendly:** Adjust the panel width for smaller screens (full width on mobile, 40-50% on desktop).
- **Monochrome Consistency:** Retain the project's minimalist black-and-white aesthetic.

## Acceptance Criteria
- [ ] Clicking "Novo Personagem" opens the 3-step wizard in a slide-over modal.
- [ ] Clicking "Adicionar Local" opens the location form in a slide-over modal.
- [ ] Clicking "Adicionar Regra" opens the world rule form in a slide-over modal.
- [ ] Clicking the backdrop or pressing ESC closes any open modal.
- [ ] Modals use the "Scale & Fade" animation pattern.

## Out of Scope
- Implementation of new lore categories beyond what exists.
- Persistent state for modals (closing the modal clears the form unless auto-save is active).
