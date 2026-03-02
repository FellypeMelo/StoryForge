# Specification: Story Codex Persistence, Search & RAG Pipeline

## Overview
This track implements the persistent storage layer, search capabilities (Full-Text and Semantic), and the RAG (Retrieval-Augmented Generation) pipeline for the StoryForge Lorebook. It also expands the UI into a comprehensive Story Codex dashboard.

## Functional Requirements
- **SQLite Persistence (Etapa 2.3):**
  - Implement SQL migrations for all Lorebook entities: `projects`, `characters`, `locations`, `world_rules`, `timeline_events`, `relationships`, and `blacklist_entries`.
  - Create concrete `SqliteRepository` implementations for each entity, ensuring CRUD functionality and project-level isolation.
- **Search Engine (Etapa 2.4 & 2.5):**
  - **FTS5 (Full-Text Search):** Create virtual tables for characters, locations, world rules, and timeline events to enable fast keyword search.
  - **Vector Search:** Integrate `sqlite-vec` to store and query embeddings. Implement `VectorSearchPort` to retrieve lore entries based on semantic similarity.
- **RAG Pipeline (Etapa 2.6):**
  - **ContextInjector:** A domain use case that automatically detects mentioned entities in a text and retrieves relevant lore snippets via Search/Vector ports.
  - **TokenBudgetCalculator:** A service to ensure the injected context does not exceed model limits, prioritizing snippets by relevance.
- **Codex UI Dashboard (Etapa 2.7):**
  - A full `/Codex` panel with specialized tabs for each lore category.
  - **Live Search:** Top-level search bar with live filtering and a dedicated results panel.
  - **Injection Indicators:** Visual cues in the UI showing which lore items are currently "active" or "injected" in the AI's context.

## Non-Functional Requirements
- **Clean Architecture:** Persistence details must remain in the Infrastructure layer; the Domain must remain pure.
- **TDD:** Every repository and search feature must be verified with automated tests (Unit and Integration).
- **Performance:** Search queries (FTS and Vector) must execute in <100ms.

## Acceptance Criteria
- [ ] All Lorebook entities can be created, read, updated, and deleted via UI.
- [ ] Keyword search ranked by relevance (FTS5) works for all primary entities.
- [ ] Semantic search returns valid results based on vector similarity.
- [ ] Context injector produces a formatted continuity block that respects token limits.
- [ ] UI provides real-time feedback during search and clear navigation between lore tabs.

## Out of Scope
- Implementation of the LLM provider for embedding generation (assumed via `EmbeddingPort` interface).
- Advanced graph visualization for relationships.


