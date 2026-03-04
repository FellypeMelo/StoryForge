# Specification: Deep Psychology UI for Character Form

**ID:** `character_deep_psychology_ui_20260304`  
**Status:** `DRAFT`  
**Type:** Refactor / Feature Enhancement

## 1. Objective
Refactor the `CharacterForm.tsx` component to support the full depth of the `Character` domain model, specifically Michael Hauge's Character Arc, Deep Voice Profiles, and the mandatory 3 Physical Tells.

## 2. Context & Background
The backend and domain layers already support complex character structures (OCEAN + Hauge + Voice). However, the current `CharacterForm` only exposes basic narrative elements and placeholder fields for voice/mannerisms. This discrepancy prevents users from manually editing the "deep" attributes that make StoryForge characters unique and causes them to remain in "Draft" status even when edited manually.

## 3. Requirements

### 3.1 Hauge Arc Section
- Implement fields for:
    - **Wound:** The past event causing pain.
    - **Belief:** The false belief derived from the wound.
    - **Fear:** What prevents them from moving to the essence.
    - **Identity:** The protective mask (should be in opposition to Essence).
    - **Essence:** Who they truly are inside.

### 3.2 Voice Profile Section
- Implement fields for:
    - **Sentence Length:** Narrative description of speech rhythm.
    - **Formality:** Level of speech formality.
    - **Evasion Mechanism:** How they avoid difficult questions.
    - **Verbal Tics:** A list/array of characteristic speech patterns.

### 3.3 Physical Tells Section
- Implement a dynamic list for Physical Tells.
- **Invariant Enforcement:** Must allow/require at least 3 tells to satisfy the Zod schema in `src/domain/character.ts`.

### 3.4 Validation & UI/UX
- Use Zod validation on submission to ensure domain invariants (e.g., min 3 tells).
- Maintain the "Sticky" header with Save/Cancel buttons.
- Follow the existing "Clean Architecture" pattern where the form creates a domain entity via `Character.create`.
- Visual consistency with the "Dark/Professional" aesthetic of StoryForge.

## 4. Acceptance Criteria
- [ ] `CharacterForm` allows editing all Hauge Arc fields.
- [ ] `CharacterForm` allows editing all Voice Profile fields.
- [ ] `CharacterForm` provides a way to manage 3+ Physical Tells.
- [ ] Submitting the form with 3+ tells and Hauge data removes the "Rascunho" (Draft) tag in `CharacterList`.
- [ ] Identity and Essence opposition is visually encouraged (or at least validable).
- [ ] No regression in existing basic field editing (Name, Age, Occupation, OCEAN).
