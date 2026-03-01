# Plan: Story Bible Persistence, Search & RAG Pipeline

## Phase 1: SQLite Persistence & CRUD Repositories [checkpoint: 48abb36]
- [x] Task: Implement SQL Migrations [55c6243]
    - [x] Create migration for `projects`, `characters`, and `locations` tables.
    - [x] Create migration for `world_rules`, `timeline_events`, `relationships`, and `blacklist_entries`.
- [x] Task: Implement `SqliteProjectRepository` [bcd85c5]
    - [x] 🔴 RED: Test for project creation and retrieval.
    - [x] 🟢 GREEN: Implement basic CRUD in `infrastructure/sqlite/project-repository.rs`.
- [x] Task: Implement Lore repositories (Characters, Locations, Rules) [49c6785]
    - [x] 🔴 RED: Tests for character and location persistence.
    - [x] 🟢 GREEN: Implement repositories with project-level isolation.
- [x] Task: Implement Secondary repositories (Timeline, Relationship, Blacklist) [f3cb1cf]
    - [x] 🔴 RED: Tests for timeline ordering and relationship graph queries.
    - [x] 🟢 GREEN: Implement remaining repositories.
- [x] Task: Conductor - User Manual Verification 'SQLite Persistence & CRUD Repositories' (Protocol in workflow.md) [48abb36]

## Phase 2: Full-Text Search (FTS5)
- [ ] Task: Setup FTS5 Virtual Tables
    - [ ] 🔴 RED: Test that queries to non-existent virtual tables fail.
    - [ ] 🟢 GREEN: Implement virtual tables for characters and lore content.
- [ ] Task: Implement `SqliteSearchPort`
    - [ ] 🔴 RED: Test ranked keyword search for entities.
    - [ ] 🟢 GREEN: Implement FTS5 query logic in Infrastructure layer.
- [ ] Task: Conductor - User Manual Verification 'Full-Text Search (FTS5)' (Protocol in workflow.md)

## Phase 3: Vector Search (sqlite-vec)
- [ ] Task: Integrate `sqlite-vec` extension
    - [ ] 🔴 RED: Test vector table creation without extension.
    - [ ] 🟢 GREEN: Configure `libsqlite3-sys` and load `sqlite-vec` in Rust.
- [ ] Task: Implement `SqliteVectorSearchPort`
    - [ ] 🔴 RED: Test cosine similarity retrieval.
    - [ ] 🟢 GREEN: Create embedding mapping table and implement search logic.
- [ ] Task: Conductor - User Manual Verification 'Vector Search (sqlite-vec)' (Protocol in workflow.md)

## Phase 4: RAG Pipeline & Context Management
- [ ] Task: Implement `TokenBudgetCalculator`
    - [ ] 🔴 RED: Test budget overflow detection.
    - [ ] 🟢 GREEN: Implement pure domain service for token estimation.
- [ ] Task: Implement `ContextInjector` Use Case
    - [ ] 🔴 RED: Test automated entity detection and snippet retrieval.
    - [ ] 🟢 GREEN: Orchestrate Search/Vector ports to build the continuity block.
- [ ] Task: Conductor - User Manual Verification 'RAG Pipeline & Context Management' (Protocol in workflow.md)

## Phase 5: Story Bible UI Dashboard
- [ ] Task: Implement Bible Tabbed Interface
    - [ ] 🔴 RED: Test navigation between Lore categories.
    - [ ] 🟢 GREEN: Expand `/bible` with specialized views for each entity type.
- [ ] Task: Integrate Live Search & Results Panel
    - [ ] 🔴 RED: Test search results UI responsiveness.
    - [ ] 🟢 GREEN: Connect SearchBar to SearchPort and display results in real-time.
- [ ] Task: Implement Injection Indicators
    - [ ] 🔴 RED: Test UI state for "Active" lore entries.
    - [ ] 🟢 GREEN: Add visual cues for items prioritized by the RAG pipeline.
- [ ] Task: Conductor - User Manual Verification 'Story Bible UI Dashboard' (Protocol in workflow.md)
