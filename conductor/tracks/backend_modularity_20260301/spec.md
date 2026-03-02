# Specification: Rust Backend Modularity & Vertical Slicing

## Overview
Refactor the StoryForge Rust backend to improve modularity and maintainability by transitioning from a strictly layered architecture to a **Vertical Slicing** pattern. This change aims to decouple Tauri commands from direct infrastructure dependencies, centralize error handling, and organize code by business feature rather than technical layer, adhering to the AI-XP principles defined in `GEMINI.md`.

## Functional Requirements
1. **Vertical Slicing Reorganization**:
   - Reorganize `src-tauri/src` into feature-based modules (e.g., `features/characters`, `features/lore`, `features/projects`).
   - Each feature module should encapsulate its specific **Commands**, **Use Cases/Application Logic**, and **Repository Traits**.
2. **Decoupling Commands**:
   - Ensure Tauri commands act only as entry points (orchestrators), delegating all business logic to the Application/Service layer.
   - Commands should not interact directly with the database or vector search implementations.
3. **Modular Infrastructure**:
   - Break down the monolithic `sqlite.rs` into feature-specific repository implementations (e.g., `CharacterRepository`, `LoreRepository`).
   - Enforce the use of Traits for all repository interactions to allow for easier testing and future-proofing.
4. **Domain-Centric Error Handling**:
   - Implement a unified `AppError` enum within the Domain layer to standardize error reporting across all modules.
   - Use this central error type for all internal logic, converting to frontend-friendly formats only at the Command level.
5. **Dependency Management**:
   - Continue utilizing **Tauri State** for managing shared dependencies (DB pools, configurations), but ensure they are injected into feature-specific handlers.

## Non-Functional Requirements
- **Maintainability**: Reduced code coupling and smaller, focused files.
- **Testability**: Improved ease of writing unit and integration tests for individual features.
- **Rigor**: Adherence to the 15-line function limit and SOLID principles as per `GEMINI.md`.

## Acceptance Criteria
- [ ] Backend code is reorganized into feature-based directories under `src-tauri/src/features`.
- [ ] The monolithic `sqlite.rs` is decomposed into smaller, modular components.
- [ ] No Tauri command contains direct SQL or DB-specific logic.
- [ ] A centralized `AppError` system is in place and used by all feature modules.
- [ ] The application compiles and all existing functionality remains intact.
- [ ] `cargo test` passes 100% with the new structure.

## Out of Scope
- Frontend React structure reorganization (unless required for command registration).
- Introducing a complex DI container (staying with Tauri State).
- Rewriting the entire persistence layer (only refactoring/moving it).