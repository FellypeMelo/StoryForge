# Plan: Fix Universe Selection and Project Selector Styling

The project has three main issues reported/identified:
1.  **Universe Selection Failure:** The UI components (`ProjectSelector`, `BookSelector`) are attempting to access `id.value` on objects returned from Tauri's `invoke`. However, `invoke` returns raw JSON where the ID is serialized as a plain string. This results in `undefined` being passed to selection callbacks.
2.  **Missing `get_project` Command:** `BookSelector.tsx` attempts to invoke `get_project`, but this command is not implemented or registered in the backend.
3.  **Styling Bug in "Novo Universo" Button:** The button uses inconsistent color variables (`text-bg-main` which was previously undefined and `hover:bg-text-muted` which provides poor contrast).

## Proposed Changes

### 1. Backend (Rust) - Align Serialization and Add Missing Command
- **Align Serialization:** Add `#[serde(rename_all = "camelCase")]` to domain structs to match TypeScript naming.
    - `src-tauri/src/features/projects/domain.rs`: `Project` struct.
    - `src-tauri/src/features/books/domain.rs`: `Book` struct.
    - `src-tauri/src/features/characters/domain.rs`: `Character` and `OceanScores` structs.
- **Implement `get_project`:**
    - `src-tauri/src/features/projects/commands.rs`: Add `get_project` function.
    - `src-tauri/src/lib.rs`: Register `features::projects::commands::get_project` in the `invoke_handler`.

### 2. Frontend (TypeScript) - Fix Selection Logic
Update the selectors to handle the fact that `invoke` returns plain objects with string IDs.

- **Files:**
    - `src/ui/components/project/ProjectSelector.tsx`:
        - Change `project.id.value` to `(project.id as any)`.
        - Ensure `createdAt` access works once Rust renaming is applied.
    - `src/ui/components/book/BookSelector.tsx`:
        - Change `book.id.value` to `(book.id as any)`.

### 3. Frontend (Styling) - Fix Button Appearance
Adjust the "Novo Universo" button to use consistent design system variables.

- **Files:**
    - `src/ui/components/project/ProjectSelector.tsx`:
        - Update "Novo Universo" button classes to use `text-bg-base` instead of `text-bg-main`.
        - Change hover state to `hover:opacity-90` for better consistency.

## Verification Plan

### Automated Tests
- Run `npm run test:backend` to ensure Rust changes don't break logic.
- Run `npm run test` to check if existing frontend tests still pass.

### Manual Verification
1.  Launch the app: `npm run tauri dev`.
2.  Navigate to the Universe Selection screen.
3.  Click on a Universe card and verify it navigates to the Book Selector.
4.  Verify the project name is correctly displayed at the top of the Book Selector (proving `get_project` works).
5.  Verify the "Novo Universo" button has consistent coloring and hover effects.
6.  Verify that dates (e.g., "Criado em") are correctly displayed.
