# Plan: Test Database Environment and Comprehensive Seeding Strategy

## Objective
Establish a reliable, isolated, and seeded database environment for all tests (Frontend and Backend) to improve stability, prevent regression bugs like the "Lore Duplication" issue, and increase overall test coverage.

## Background & Motivation
The recent bug in `CodexDashboard` (creating duplicates on save) occurred because tests were using static, shallow mocks that didn't simulate the stateful nature of a database. By having a "Stateful Mock Database" in the frontend and a "Real Test DB" in the backend, we can verify complex interactions and data persistence logic accurately.

## Proposed Solution

### 1. Frontend: In-Memory Stateful Mock Database (`src/test/mock-db.ts`)
Instead of hardcoding returns for `invoke` in every test, we will implement a lightweight in-memory engine that mimics the Rust backend's SQLite behavior.
- **State Management**: Holds arrays for `projects`, `books`, `characters`, `locations`, `rules`, etc.
- **CRUD Logic**: Implements filtering by `projectId`/`bookId` and ID-based updates.
- **Global Integration**: Configured in `src/test/setup.ts` to handle all Tauri `invoke` calls automatically.

### 2. Standardized Seed Factory (`src/test/seeds/standard-seed.ts`)
A centralized factory to populate the Mock DB with high-fidelity data:
- **"The Epic Adventure" Project**: A complete project with 2 books.
- **Rich Characters**: 5+ characters with full OCEAN, Hauge Arc, and Voice profiles.
- **Interconnected Lore**: Locations, Rules, and a Timeline with causal dependencies.
- **Complex Relationships**: A web of diverse relationship types.

### 3. Backend: Rust Test Database Isolation
- **Environment Detection**: Detect `TEST` mode in `src-tauri/src/lib.rs`.
- **Isolated File**: Use `storyforge_test.db` for backend integration tests.
- **Seeder Module**: Create `src-tauri/src/infrastructure/test_seeder.rs` to populate the real SQLite test DB.

## Implementation Plan

### Phase 1: Frontend Mock Engine & Seeds
1.  **Create `src/test/mock-db.ts`**:
    - Implement `MockDatabase` class with methods for all Tauri commands used in the UI.
    - Implement UUID generation for new entities.
2.  **Create `src/test/seeds/standard-seed.ts`**:
    - Define a `getStandardSeed()` function that returns a complete set of domain objects.
3.  **Update `src/test/setup.ts`**:
    - Initialize a global `mockDb` instance.
    - Setup `vi.mock("@tauri-apps/api/core")` to route calls to `mockDb`.

### Phase 2: Integration & Refactoring
1.  **Refactor `CodexDashboard.test.tsx`**:
    - Remove manual `invoke` mocks.
    - Use `mockDb.seed(standardSeed)` in `beforeEach`.
    - Verify that "Add Location" actually adds an item to the list and subsequents saves update the SAME item (preventing duplication).
2.  **Add User Journey Test**:
    - Create `src/ui/components/__tests__/UserJourney.test.tsx` to test a full flow: Create Project -> Add Book -> Create Character -> Link to Location.

### Phase 3: Backend Robustness
1.  **Modify `src-tauri/src/lib.rs`**:
    - Add logic to check for `APP_ENV=test`.
2.  **Create `src-tauri/src/infrastructure/test_seeder.rs`**:
    - Implement helper functions to insert standard seed data into SQLite.

## Verification & Testing
- **Coverage Check**: Run `npm run test -- --coverage` and verify that `CodexDashboard` coverage increases significantly (> 70%).
- **Stability Check**: Run tests multiple times to ensure no "leaked state" between runs.
- **Bug Verification**: Specifically test the "Save Lore" flow to ensure `create_x` is only called once per new entity.

## Migration & Rollback
- This is a non-breaking change for production code.
- Existing tests that use `vi.mock` locally will still work, but will be gradually migrated to the global `mockDb` for better fidelity.
