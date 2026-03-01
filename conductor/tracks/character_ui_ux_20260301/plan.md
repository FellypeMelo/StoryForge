# Plan: Improved Character Modal UI/UX

## Phase 1: Refactoring to Wizard [checkpoint: ]
- [ ] Task: Create `CharacterWizard` component structure
    - [ ] 🔴 RED: Test navigation between 3 empty steps.
    - [ ] 🟢 GREEN: Implement base wizard layout with "Next/Previous" buttons.
- [ ] Task: Migrate `CharacterForm` fields to Wizard steps
    - [ ] 🔴 RED: Test that data persists when switching steps.
    - [ ] 🟢 GREEN: Move existing fields into Step 1 (Core), Step 2 (Psychology), and Step 3 (Narrative).
- [ ] Task: Implement Inline Validation
    - [ ] 🔴 RED: Test that "Name" field shows error immediately on blur if empty.
    - [ ] 🟢 GREEN: Add `onBlur` validation and visual error state to inputs.
- [ ] Task: Conductor - User Manual Verification 'Refactoring to Wizard' (Protocol in workflow.md)

## Phase 2: Visualization & UX [checkpoint: ]
- [ ] Task: Implement OCEAN Radar Chart
    - [ ] 🔴 RED: Test that chart component receives correct OCEAN scores from state.
    - [ ] 🟢 GREEN: Integrate `recharts` (or custom SVG) into Step 2.
- [ ] Task: Add Semantic Labels to OCEAN sliders
    - [ ] 🔴 RED: Test label logic (e.g., 0-30 = 'Low', 31-70 = 'Moderate', 71-100 = 'High').
    - [ ] 🟢 GREEN: Update Step 2 UI with dynamic text labels.
- [ ] Task: Implement Word/Character Counters
    - [ ] 🔴 RED: Test counter increment/decrement during typing.
    - [ ] 🟢 GREEN: Add "X / Y characters" indicator to all textareas.
- [ ] Task: Implement Contextual Help Tooltips
    - [ ] 🔴 RED: Test tooltip visibility on hover.
    - [ ] 🟢 GREEN: Add info icons with explainers for complex terms.
- [ ] Task: Conductor - User Manual Verification 'Visualization & UX' (Protocol in workflow.md)

## Phase 3: Polish & Finalization [checkpoint: ]
- [ ] Task: Implement Draft Auto-save
    - [ ] 🔴 RED: Test that form state is restored from `localStorage` on component mount.
    - [ ] 🟢 GREEN: Implement `useEffect` to save state changes to local storage.
- [ ] Task: Final UI Polish & Animations
    - [ ] 🔴 RED: Test accessibility (tab order through wizard).
    - [ ] 🟢 GREEN: Add smooth transitions between steps and refine monochrome aesthetic.
- [ ] Task: Conductor - User Manual Verification 'Polish & Finalization' (Protocol in workflow.md)
