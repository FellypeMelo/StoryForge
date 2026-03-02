# Plan: Improved Character Modal UI/UX

## Phase 1: Refactoring to Wizard [checkpoint: fc7d1e0]
- [x] Task: Create `CharacterWizard` component structure
    - [x] 🔴 RED: Test navigation between 3 empty steps.
    - [x] 🟢 GREEN: Implement base wizard layout with "Next/Previous" buttons.
- [x] Task: Migrate `CharacterForm` fields to Wizard steps
    - [x] 🔴 RED: Test that data persists when switching steps.
    - [x] 🟢 GREEN: Move existing fields into Step 1 (Core), Step 2 (Psychology), and Step 3 (Narrative).
- [x] Task: Implement Inline Validation
    - [x] 🔴 RED: Test that "Name" field shows error immediately on blur if empty.
    - [x] 🟢 GREEN: Add `onBlur` validation and visual error state to inputs.
- [x] Task: Conductor - User Manual Verification 'Refactoring to Wizard' (Protocol in workflow.md) [f223d8c]

## Phase 2: Visualization & UX [checkpoint: c0d17cf]
- [x] Task: Implement OCEAN Radar Chart
    - [x] 🔴 RED: Test that chart component receives correct OCEAN scores from state.
    - [x] 🟢 GREEN: Integrate `recharts` (or custom SVG) into Step 2.
- [x] Task: Add Semantic Labels to OCEAN sliders
    - [x] 🔴 RED: Test label logic (e.g., 0-30 = 'Low', 31-70 = 'Moderate', 71-100 = 'High').
    - [x] 🟢 GREEN: Update Step 2 UI with dynamic text labels.
- [x] Task: Implement Word/Character Counters
    - [x] 🔴 RED: Test counter increment/decrement during typing.
    - [x] 🟢 GREEN: Add "X / Y characters" indicator to all textareas.
- [x] Task: Implement Contextual Help Tooltips
    - [x] 🔴 RED: Test tooltip visibility on hover.
    - [x] 🟢 GREEN: Add info icons with explainers for complex terms.
- [x] Task: Conductor - User Manual Verification 'Visualization & UX' (Protocol in workflow.md) [fc7d1e0]

## Phase 3: Polish & Finalization [checkpoint: c0d17cf]
- [x] Task: Implement Draft Auto-save
    - [x] 🔴 RED: Test that form state is restored from `localStorage` on component mount.
    - [x] 🟢 GREEN: Implement `useEffect` to save state changes to local storage.
- [x] Task: Final UI Polish & Animations
    - [x] 🔴 RED: Test accessibility (tab order through wizard).
    - [x] 🟢 GREEN: Add smooth transitions between steps and refine monochrome aesthetic.
- [x] Task: Conductor - User Manual Verification 'Polish & Finalization' (Protocol in workflow.md) [e57b01e]

## Phase: Review Fixes
- [x] Task: Apply review suggestions [75f5ee2]


