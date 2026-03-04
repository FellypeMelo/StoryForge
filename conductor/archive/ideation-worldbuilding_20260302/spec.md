# Specification: Ideation & Worldbuilding

**Track ID:** ideation-worldbuilding_20260302
**Type:** Feature
**Created:** 2026-03-02
**Status:** Draft

## Summary

Implement the Ideation Method (CHI) and Context-Aware Decomposition Worldbuilding pipelines along with their UI modules.

## Context

From Milestone 3. Covers Etapas 3.1, 3.2, 3.5, and the Ideation UI from 3.6.
Implements the ideation via CHI method (anti-cliche) and worldbuilding.

## User Story

As a writer, I want to use the CHI method to generate unique premises and build my world logically, so that my story avoids cliches and is internally consistent.

## Acceptance Criteria

- [ ] Premise with empty antagonist or vague stakes is rejected.
- [ ] CHI Pipeline executes 3 phases in sequence and persists extracted cliches to BlacklistRepository.
- [ ] `LlmPort` interface is defined in domain layer.
- [ ] Worldbuilding pipeline executes 4 steps in sequence and persists rules.
- [ ] `/ideation` UI page implemented with 3-step wizard.

## Dependencies

- Milestone 2 Codex CRUD and RAG pipeline.

## Out of Scope

- Character building (handled in separate track).

## Technical Notes

- Adhere to Clean Architecture and strict TDD.
