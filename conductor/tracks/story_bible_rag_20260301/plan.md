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
- [x] Task: Implement Secondary repositories (Timeline, Relationship, Blacklist) [7d7aba5]
    - [x] 🔴 RED: Tests for timeline ordering and relationship graph queries.
    - [x] 🟢 GREEN: Implement remaining repositories.
- [x] Task: Conductor - User Manual Verification 'SQLite Persistence & CRUD Repositories' (Protocol in workflow.md) [48abb36]

## Phase 2: Full-Text Search (FTS5) [checkpoint: 7d7aba5]
- [x] Task: Setup FTS5 Virtual Tables [e447d58]
    - [x] 🔴 RED: Test that queries to non-existent virtual tables fail.
    - [x] 🟢 GREEN: Implement virtual tables for characters and lore content.
- [x] Task: Implement `SqliteSearchPort` [7d7aba5]
    - [x] 🔴 RED: Test ranked keyword search for entities.
    - [x] 🟢 GREEN: Implement FTS5 query logic in Infrastructure layer.
- [x] Task: Conductor - User Manual Verification 'Full-Text Search (FTS5)' (Protocol in workflow.md) [7d7aba5]

## Phase 3: Vector Search (sqlite-vec)
- [x] Task: Integrate `sqlite-vec` extension [3a3b6b2]
    - [x] 🔴 RED: Test vector table creation without extension.
    - [x] 🟢 GREEN: Configure `libsqlite3-sys` and load `sqlite-vec` in Rust.
- [x] Task: Implement `SqliteVectorSearchPort` [9ceae9f]
    - [x] 🔴 RED: Test cosine similarity retrieval.
    - [x] 🟢 GREEN: Create embedding mapping table and implement search logic.
- [x] Task: Conductor - User Manual Verification 'Vector Search (sqlite-vec)' (Protocol in workflow.md) [9ceae9f]

## Phase 4: RAG Pipeline & Context Management
- [x] Task: Implement `TokenBudgetCalculator` [8923272]
    - [x] 🔴 RED: Test budget overflow detection.
    - [x] 🟢 GREEN: Implement pure domain service for token estimation.
- [x] Task: Implement `ContextInjector` Use Case [e9bf81c]
    - [x] 🔴 RED: Test automated entity detection and snippet retrieval.
    - [x] 🟢 GREEN: Orchestrate Search/Vector ports to build the continuity block.
- [x] Task: Conductor - User Manual Verification 'RAG Pipeline & Context Management' (Protocol in workflow.md) [e9bf81c]

## Phase 5: Story Bible UI Dashboard
- [x] Task: Implement Bible Tabbed Interface [579abf2]
    - [x] 🔴 RED: Test navigation between Lore categories.
    - [x] 🟢 GREEN: Expand `/bible` with specialized views for each entity type.
- [x] Task: Integrate Live Search & Results Panel [fd33b01]
    - [x] 🔴 RED: Test search results UI responsiveness.
    - [x] 🟢 GREEN: Connect SearchBar to SearchPort and display results in real-time.
- [x] Task: Implement Injection Indicators [604dff6]
    - [x] 🔴 RED: Test UI state for "Active" lore entries.
    - [x] 🟢 GREEN: Add visual cues for items prioritized by the RAG pipeline.
- [x] Task: Conductor - User Manual Verification 'Story Bible UI Dashboard' (Protocol in workflow.md) [604dff6]

## Phase: Review Fixes
- [x] Task: Apply review suggestions [78d6518]

