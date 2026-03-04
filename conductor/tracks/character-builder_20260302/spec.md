# Specification: Character Builder

**Track ID:** character-builder_20260302
**Type:** Feature
**Created:** 2026-03-02
**Status:** Draft

## Summary

Implement the Deep Character Builder domain, use cases (OCEAN + Hauge), and the UI for character generation and management.

## Context

From Milestone 3. Covers Etapas 3.3, 3.4, and the Character UI from 3.6.
Builds complex characters combining OCEAN traits, Hauge character arcs, and physical/voice tells.

## User Story

As a writer, I want to construct deep, multi-dimensional characters so that my story has compelling protagonists and antagonists.

## Acceptance Criteria

- [ ] CharacterSheet rejects incomplete states (e.g. Identity and Essence in same pole).
- [ ] CharacterSheet is an aggregate root with OCEAN, Hauge, Voice, and Tells.
- [ ] `GenerateCharacterUseCase` detects and alerts on anti-patterns.
- [ ] Characters are persisted via CharacterRepository.
- [ ] `/characters` UI page allows list and creation of characters.

## Dependencies

- Milestone 2 Codex CRUD.
- Ideally shares `LlmPort` from ideation, but can run parallel.

## Out of Scope

- Ideation & Worldbuilding.

## Technical Notes

- Clean Architecture rules apply. Domain must not depend on infra.
