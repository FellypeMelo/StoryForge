# Implementation Plan: Milestone 1 — Fundação & Scaffold

## Phase 1: Project Scaffolding & Architecture [checkpoint: 12286db]
- [x] Task: Initialize Tauri v2 + React/TypeScript project [7a20f42]
    - [x] Run initialization command with React template
    - [x] Configure `tauri.conf.json` with least privilege
    - [x] Clean up default boilerplate (logos, styles)
    - [x] Verify build opens "StoryForge" window
- [x] Task: Establish Clean Architecture directory structure [7a20f42]
    - [x] Create `src/domain`, `src/application`, `src/infrastructure`, `src/ui`
    - [x] Create `src-tauri/src/domain`, `src-tauri/src/application`, `src-tauri/src/infrastructure`, `src-tauri/src/commands`
    - [x] Add `README.md` in domain folders documenting dependency rules
- [x] Task: Conductor - User Manual Verification 'Project Scaffolding & Architecture' [12286db]

## Phase 2: Persistence Engine (TDD) [checkpoint: 2bafec7]
- [x] Task: Implement SQLite Base Connection [1866473]
    - [x] 🔴 RED: Test for DB file creation in efhemeral dir
    - [x] 🟢 GREEN: Initialize SQLite in backend Rust
    - [x] 🔵 REFACTOR: Extract `DatabasePort` trait in domain
- [x] Task: Migration System [7222110]
    - [x] 🔴 RED: Test for schema migration execution
    - [x] 🟢 GREEN: Implement versioned/incremental migration logic
    - [x] Configure WAL mode and `app_data_dir` persistence
- [x] Task: Conductor - User Manual Verification 'Persistence Engine (TDD)' [2bafec7]

## Phase 3: IPC & Infrastructure Integration
- [x] Task: Implement IPC Bridge Commands [5611c8a]
    - [x] 🔴 RED: Test for `get_app_info` command
    - [x] 🟢 GREEN: Implement `get_app_info` returning version
    - [x] 🔴 RED: Test for `health_check` (DB status)
    - [x] 🟢 GREEN: Implement `health_check` command
    - [x] 🔵 REFACTOR: Standardize `Result<T, AppError>` return types
- [~] Task: Configure CI/CD Quality Pipeline
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
