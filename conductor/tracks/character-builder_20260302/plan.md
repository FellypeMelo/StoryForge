# Implementation Plan: Character Builder

**Track ID:** character-builder_20260302
**Spec:** [spec.md](./spec.md)
**Created:** 2026-03-02
**Status:** [ ] Not Started

## Phase 1: Character Domain

Create the core domain models for complex characters.

### Tasks
- [ ] Task 1.1: TDD for `OceanProfile` and `HaugeArc`.
- [ ] Task 1.2: TDD for `VoiceProfile` and `PhysicalTells`.
- [ ] Task 1.3: TDD for `CharacterSheet` aggregate root.
- [ ] Task 1.4: Refactor to add `isComplete()` validation.

### Verification
- [ ] Domain tests passing, strict validation on Identity vs Essence.

## Phase 2: Character Use Cases

Implement generation use cases.

### Tasks
- [ ] Task 2.1: TDD for `GenerateCharacterUseCase`.
- [ ] Task 2.2: Implement DRTD prompt template for character generation.
- [ ] Task 2.3: TDD for `CharacterValidator` to detect anti-patterns.
- [ ] Task 2.4: Integrate validator into the generation use case.

### Verification
- [ ] Use cases successfully create characters and alert on anti-patterns.

## Phase 3: Character UI

Implement the UI for character management.

### Tasks
- [ ] Task 3.1: Create `/characters` route with list view.
- [ ] Task 3.2: Build Character creation form (OCEAN, Hauge, Voice, Tells sections).
- [ ] Task 3.3: Implement visual completeness indicator on CharacterSheet UI.

### Verification
- [ ] UI shows list of characters and allows creation of new detailed characters.

## Final Verification
- [ ] All tests passing.
- [ ] App builds successfully.
