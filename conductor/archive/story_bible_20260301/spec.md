# Specification: Story Codex Domain & UI (Mocks)

## Overview
This track implements the foundational domain entities and repository interfaces (ports) for the StoryForge Lorebook (Story Codex), along with a primary UI dashboard to manage these entries using mocked data. This establishes the "Clean Architecture" boundaries before moving to SQLite persistence.

## Functional Requirements
- **Domain Entities:**
  - `Project`: Core metadata for a story project (id, title, genre, createdAt).
  - `Character`: Psychological profile (OCEAN) and biographical data.
  - `Location`: Settings with symbolic meaning (name, description, symbolicMeaning).
  - `WorldRule`: Lore categories and hierarchy (category, content, hierarchy).
  - `TimelineEvent`: Causal sequence of events (date, description, causalDependencies).
  - `Relationship`: Character-to-character graph nodes (characterA, characterB, type).
  - `BlacklistEntry`: Negative guardrails for term prevention (term, category, reason).
- **Value Objects:**
  - Strong typing for IDs (e.g., `ProjectId`, `CharacterId`, `LocationId`).
- **Repository Ports:**
  - Interfaces for CRUD operations on all entities defined in `src/domain/ports`.
  - Search method signatures (FTS and Vector).
- **UI Dashboard:**
  - Tabbed interface for all entities in `/Codex`.
  - List views for existing entries using mocked data.
  - CRUD forms (Modals or Inline) for entity creation/editing.
  - Search bar interface (visual only).

## Non-Functional Requirements
- **TDD:** All domain logic and UI components must have unit tests.
- **Clean Architecture:** Domain layer must be pure (no Tauri/SQLite imports).
- **Type Safety:** Use TypeScript/Zod for domain integrity.

## Acceptance Criteria
- [ ] Each entity has rigid validation in the constructor.
- [ ] IDs are implemented as Value Objects.
- [ ] UI displays mocked entities correctly in their respective tabs.
- [ ] Forms correctly capture and validate input data.
- [ ] Tests verify domain rules and UI component rendering.

## Out of Scope
- SQLite implementation (migrations, actual DB persistence).
- Real vector embeddings (llama.cpp integration).
- RAG Pipeline logic.


