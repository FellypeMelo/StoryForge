# Implementation Plan: Milestone 2 — Character Management (Core & UI)

## Phase 1: Domain Entities & Validation [checkpoint: 5d56556]
- [x] Task: Define Character Value Objects & Entity (Backend) (2b429ea)
    - [x] 🔴 RED: Test CharacterId and Character validation
    - [x] 🟢 GREEN: Implement Character entity with strict validation
- [x] Task: Define Character Value Objects & Entity (Frontend) (1982026)
    - [x] 🔴 RED: Test Character schema validation (Zod/etc)
    - [x] 🟢 GREEN: Implement TypeScript entities and types
- [x] Task: Conductor - User Manual Verification 'Domain Entities & Validation' (Protocol in workflow.md)

## Phase 2: Persistence & Infrastructure [checkpoint: a4dd8fc]
- [x] Task: Character Database Schema & Migration (b81851c)
    - [x] 🔴 RED: Test migration creates characters table
    - [x] 🟢 GREEN: Implement SQLite migration for characters
- [x] Task: CharacterRepository Implementation (5046fad)
    - [x] 🔴 RED: Test CRUD operations via Repository
    - [x] 🟢 GREEN: Implement SqliteCharacterRepository
- [x] Task: Conductor - User Manual Verification 'Persistence & Infrastructure' (Protocol in workflow.md)

## Phase 3: IPC Bridge & Backend Application [checkpoint: c9f2428]
- [x] Task: Character Use Cases & Commands (5cca231)
    - [x] 🔴 RED: Test IPC commands for Character CRUD
    - [x] 🟢 GREEN: Implement Tauri commands and application logic
- [x] Task: Conductor - User Manual Verification 'IPC Bridge & Backend Application' (Protocol in workflow.md)

## Phase 4: UI Shell Integration & Gallery
- [x] Task: Sidebar & Navigation Update (4fcaf28)
    - [x] 🔴 RED: Test navigation to Character view
    - [x] 🟢 GREEN: Update AppShell sidebar and routing
- [~] Task: Character Gallery View
    - [ ] 🔴 RED: Test rendering of character list
    - [ ] 🟢 GREEN: Implement responsive grid with character cards
- [ ] Task: Conductor - User Manual Verification 'UI Shell Integration & Gallery' (Protocol in workflow.md)

## Phase 5: Profile Editor & Finalization
- [ ] Task: Character Profile Editor Form
    - [ ] 🔴 RED: Test form validation and submission
    - [ ] 🟢 GREEN: Implement comprehensive editor with Tailwind CSS
- [ ] Task: Final Quality Pass & Pipeline Execution
    - [ ] Run `npm run test:all` and verify 100% pass
    - [ ] Verify linting and formatting compliance
- [ ] Task: Conductor - User Manual Verification 'Profile Editor & Finalization' (Protocol in workflow.md)
