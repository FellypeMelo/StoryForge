# Implementation Plan: Milestone 2 — Character Management (Core & UI)

## Phase 1: Domain Entities & Validation
- [x] Task: Define Character Value Objects & Entity (Backend) (2b429ea)
    - [x] 🔴 RED: Test CharacterId and Character validation
    - [x] 🟢 GREEN: Implement Character entity with strict validation
- [~] Task: Define Character Value Objects & Entity (Frontend)
    - [ ] 🔴 RED: Test Character schema validation (Zod/etc)
    - [ ] 🟢 GREEN: Implement TypeScript entities and types
- [ ] Task: Conductor - User Manual Verification 'Domain Entities & Validation' (Protocol in workflow.md)

## Phase 2: Persistence & Infrastructure
- [ ] Task: Character Database Schema & Migration
    - [ ] 🔴 RED: Test migration creates characters table
    - [ ] 🟢 GREEN: Implement SQLite migration for characters
- [ ] Task: CharacterRepository Implementation
    - [ ] 🔴 RED: Test CRUD operations via Repository
    - [ ] 🟢 GREEN: Implement SqliteCharacterRepository
- [ ] Task: Conductor - User Manual Verification 'Persistence & Infrastructure' (Protocol in workflow.md)

## Phase 3: IPC Bridge & Backend Application
- [ ] Task: Character Use Cases & Commands
    - [ ] 🔴 RED: Test IPC commands for Character CRUD
    - [ ] 🟢 GREEN: Implement Tauri commands and application logic
- [ ] Task: Conductor - User Manual Verification 'IPC Bridge & Backend Application' (Protocol in workflow.md)

## Phase 4: UI Shell Integration & Gallery
- [ ] Task: Sidebar & Navigation Update
    - [ ] 🔴 RED: Test navigation to Character view
    - [ ] 🟢 GREEN: Update AppShell sidebar and routing
- [ ] Task: Character Gallery View
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
