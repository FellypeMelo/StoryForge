# Implementation Plan: Milestone 1 — Fundação & Scaffold

## Phase 1: Project Scaffolding & Architecture
- [ ] Task: Initialize Tauri v2 + React/TypeScript project
    - [ ] Run initialization command with React template
    - [ ] Configure `tauri.conf.json` with least privilege
    - [ ] Clean up default boilerplate (logos, styles)
    - [ ] Verify build opens "StoryForge" window
- [ ] Task: Establish Clean Architecture directory structure
    - [ ] Create `src/domain`, `src/application`, `src/infrastructure`, `src/ui`
    - [ ] Create `src-tauri/src/domain`, `src-tauri/src/application`, `src-tauri/src/infrastructure`, `src-tauri/src/commands`
    - [ ] Add `README.md` in domain folders documenting dependency rules
- [ ] Task: Conductor - User Manual Verification 'Project Scaffolding & Architecture' (Protocol in workflow.md)

## Phase 2: Persistence Engine (TDD)
- [ ] Task: Implement SQLite Base Connection
    - [ ] 🔴 RED: Test for DB file creation in efhemeral dir
    - [ ] 🟢 GREEN: Initialize SQLite in backend Rust
    - [ ] 🔵 REFACTOR: Extract `DatabasePort` trait in domain
- [ ] Task: Migration System
    - [ ] 🔴 RED: Test for schema migration execution
    - [ ] 🟢 GREEN: Implement versioned/incremental migration logic
    - [ ] Configure WAL mode and `app_data_dir` persistence
- [ ] Task: Conductor - User Manual Verification 'Persistence Engine (TDD)' (Protocol in workflow.md)

## Phase 3: IPC & Infrastructure Integration
- [ ] Task: Implement IPC Bridge Commands
    - [ ] 🔴 RED: Test for `get_app_info` command
    - [ ] 🟢 GREEN: Implement `get_app_info` returning version
    - [ ] 🔴 RED: Test for `health_check` (DB status)
    - [ ] 🟢 GREEN: Implement `health_check` command
    - [ ] 🔵 REFACTOR: Standardize `Result<T, AppError>` return types
- [ ] Task: Configure CI/CD Quality Pipeline
    - [ ] Set up Vitest (frontend) and Cargo Test (backend)
    - [ ] Configure ESLint/Prettier and Clippy (deny warnings)
    - [ ] Create `pnpm test:all` root script
- [ ] Task: Conductor - User Manual Verification 'IPC & Infrastructure Integration' (Protocol in workflow.md)

## Phase 4: UI Shell & Finalization
- [ ] Task: Initialize UI Foundation
    - [ ] Install and configure Tailwind CSS
    - [ ] Create responsive `<AppShell>` with Dark Theme
    - [ ] Implement layout with sidebar and main content area
- [ ] Task: Conductor - User Manual Verification 'UI Shell & Finalization' (Protocol in workflow.md)
