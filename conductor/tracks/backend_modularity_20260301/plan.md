# Plan: Backend Modularity Refactor (Vertical Slicing)

This plan outlines the steps to refactor the StoryForge Rust backend into a modular, feature-based architecture (Vertical Slicing), improving decoupling and error handling while adhering to AI-XP standards.

## Phase 1: Shared Domain Foundation & Error Handling
- [x] Task: **RED**: Define `AppError` enum and its conversions in `domain/errors.rs`. c56fb6f
- [x] Task: **GREEN**: Implement `AppError` and integrate with `domain/result.rs`. c56fb6f
- [x] Task: **RED**: Define standard `Repository` traits for core entities in `domain/ports/`. c56fb6f
- [x] Task: **GREEN**: Finalize trait definitions to support generic feature-based implementations. c56fb6f
- [x] Task: Conductor - User Manual Verification 'Shared Foundation' (Protocol in workflow.md) b819145

## Phase 2: Modularizing the 'Characters' Feature
- [x] Task: **RED**: Create `features/characters` module and write tests for character-specific application logic. c56fb6f
- [x] Task: **GREEN**: Migrate character domain models and repository implementation to `features/characters/`. c56fb6f
- [x] Task: **REFACTOR**: Decouple `characters.rs` commands from direct DB calls, using the new application layer. c56fb6f
- [x] Task: **RED**: Write tests for the modular `CharacterRepository` implementation. c56fb6f
- [x] Task: **GREEN**: Implement `CharacterRepository` in `features/characters/infrastructure/`. c56fb6f
- [x] Task: Conductor - User Manual Verification 'Characters Feature' (Protocol in workflow.md) accbf7d

## Phase 3: Modularizing 'Lore' & 'Projects' Features
- [x] Task: **RED**: Create `features/lore` and `features/projects` modules with corresponding TDD tests. c56fb6f
- [x] Task: **GREEN**: Migrate Lore entities (Locations, Rules, etc.) and Project logic to their respective feature folders. c56fb6f
- [x] Task: **REFACTOR**: Update Lore and Project commands to delegate logic to the Application layer. c56fb6f
- [x] Task: **GREEN**: Decompose the remainder of `sqlite.rs` into modular feature-specific infrastructure files. c56fb6f
- [x] Task: Conductor - User Manual Verification 'Lore & Projects' (Protocol in workflow.md) 3f488d4

## Phase 4: Integration & System Cleanup
- [x] Task: **REFACTOR**: Update `src-tauri/src/lib.rs` to register commands from the new feature modules. 3f488d4
- [x] Task: **RED**: Write integration tests to ensure cross-feature compatibility (e.g., character-project relations). 3f488d4
- [x] Task: **GREEN**: Verify entire system compiles and passes all existing tests. 3f488d4
- [x] Task: **REFACTOR**: Remove deprecated layered files (`application/`, `commands/`, `infrastructure/` if empty) and finalize `sqlite.rs` decomposition. e4fe400
- [ ] Task: Conductor - User Manual Verification 'Integration & Cleanup' (Protocol in workflow.md)