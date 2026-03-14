# Plan: Fix Story Codex Saving and Events Creation

The Story Codex has issues with saving entities (locations and world rules create duplicates upon update) and missing functionality for creating and editing timeline events, relationships, and blacklist entries.

## Objective
- Fix the duplicated saving bug for Locations and World Rules.
- Implement missing creation and editing UI for Timeline Events, Relationships, and Blacklist Entries.
- Unify the saving logic in `CodexDashboard.tsx`.

## Key Files & Context
- `src/ui/components/dashboard/CodexDashboard.tsx`: Main dashboard managing the lore tabs and state.
- `src/ui/components/dashboard/LoreLists.tsx`: Display lists for lore entities.
- `src/ui/components/dashboard/LoreForms.tsx`: **New file** to contain forms for Timeline, Relationship, and Blacklist.
- `src/domain/`: Domain entities for lore.

## Implementation Steps

### 1. Create `src/ui/components/dashboard/LoreForms.tsx`
Create a new file containing:
- `TimelineEventForm`: Fields for `date` and `description`.
- `RelationshipForm`: Dropdowns for `characterA` and `characterB`, and a field for `type`.
- `BlacklistEntryForm`: Fields for `term`, `category`, and `reason`.

### 2. Update `CodexDashboard.tsx`
- **State Management:**
  - Add state for `isEventModalOpen`, `isRelationshipModalOpen`, `isBlacklistModalOpen`.
  - Add state for `editingEvent`, `editingRelationship`, `editingBlacklistEntry`.
- **Handlers:**
  - Implement `handleCreateEvent`, `handleEditEvent`, `handleSaveEvent`.
  - Implement `handleCreateRelationship`, `handleEditRelationship`, `handleSaveRelationship`.
  - Implement `handleCreateBlacklist`, `handleEditBlacklist`, `handleSaveBlacklistEntry`.
  - Add `handleEditLocation` and `handleEditRule`.
- **Fix Saving Logic:**
  - Refactor `handleSaveLocation` and `handleSaveRule` to use `update_location`/`update_world_rule` directly if the entity already exists in the database (or just use a single `save` logic that handles both).
  - Actually, looking at the current code, it seems it was intended to create then update. I'll change it to check if we are editing an existing one.
- **UI Integration:**
  - Pass `onSelect` and `onCreateNew` to all lists.
  - Add `SlideOver` components for the new forms.

### 3. Fix Backend (if needed)
- Ensure the backend commands handle updates correctly (already verified they use `UPDATE ... WHERE id = ?`).

## Verification & Testing
- **Manual Verification:**
  - Create a new Location and save it.
  - Edit the same Location and verify it updates instead of creating a duplicate.
  - Create a new Timeline Event and verify it appears in the list.
  - Edit a Timeline Event and verify changes are persisted.
  - Repeat for Relationships and Blacklist.
- **Automated Tests:**
  - Update `CodexDashboard.test.tsx` if possible to cover these new interactions.
