# Track: Milestone 2 — Character Management (Core & UI)

## Overview
This track implements the core Character management system for StoryForge, following the Clean Architecture and TDD protocols established in Milestone 1. It focuses on the creation, persistence, and visual representation of characters within the Story Bible context.

## Functional Requirements
### Domain Layer (Business Logic)
- **Character Entity:** Pure Rust and TypeScript entity with rigid constructor validation.
- **Attributes:**
    - Core: Name, Age, Occupation, Physical Description.
    - Narrative: Goal, Motivation, Internal Conflict (The Wound).
    - Psychological: OCEAN model scores.
    - Distinctiveness: Voice, Mannerisms.
- **Value Objects:** Implementation of `CharacterId` and `ProjectId` as Value Objects (non-primitive).

### Infrastructure Layer (Persistence & IPC)
- **SQLite Schema:** Migration to create `characters` table with foreign key to `projects`.
- **CharacterRepository Port:** Interface defined in Domain, implemented in Infrastructure using `rusqlite`.
- **IPC Commands:** Tauri commands for Character CRUD (`create_character`, `get_character`, `update_character`, `delete_character`).

### UI Layer (Presentation)
- **Story Bible Sidebar:** Integrated character management within the existing `AppShell` layout.
- **Character Gallery:** Grid view of characters with portraits and summary data.
- **Profile Editor:** Comprehensive form for managing all character attributes using Tailwind CSS.

## Non-Functional Requirements
- **Rigor:** 100% adherence to Clean Architecture (Domain isolation).
- **Quality:** Mandatory TDD cycle (Red-Green-Refactor) for all backend and frontend logic.
- **Privacy:** Absolute offline-first storage in the application data directory.

## Acceptance Criteria
- [ ] Backend: CRUD operations verified by integration tests.
- [ ] Domain: Entity validation prevents invalid character states.
- [ ] UI: Users can navigate to the Character gallery and edit profiles.
- [ ] IPC: Frontend successfully communicates with backend for character state.

## Out of Scope
- Inter-character relationship mapping.
- Semantic search / Vector search (RAG integration).
