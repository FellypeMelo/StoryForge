# Implementation Plan: Modal System for Lore Creation

## Phase 1: Foundation & Shared Component [checkpoint: 71715f8]
- [x] Task: Create Generic `SlideOver` Component [8330ace]
    - [x] 🔴 RED: Test that `SlideOver` renders its children and triggers `onClose` when the backdrop is clicked.
    - [x] 🔴 RED: Test accessibility (ESC key triggers `onClose`, focus is trapped within the component).
    - [x] 🟢 GREEN: Implement `SlideOver` using standard React patterns and CSS for side-anchored layout.
    - [x] 🔵 REFACTOR: Apply "Scale & Fade" animations using CSS transitions or Framer Motion if already in project.
- [ ] Task: Conductor - User Manual Verification 'Foundation' (Protocol in workflow.md)

## Phase 2: Category Implementations [checkpoint: 19cdd9d]
- [x] Task: Integrate `LocationForm` into Modal [bfb63d6]
    - [x] 🔴 RED: Test that clicking "Adicionar Local" in `BibleDashboard` opens the `SlideOver` with `LocationForm`.
    - [x] 🟢 GREEN: Update `handleCreateLocation` to manage modal visibility state instead of using `prompt`.
- [x] Task: Integrate `WorldRuleForm` into Modal [6df5125]
    - [x] 🔴 RED: Test that clicking "Adicionar Regra" in `BibleDashboard` opens the `SlideOver` with `WorldRuleForm`.
    - [x] 🟢 GREEN: Update `handleCreateRule` to manage modal visibility state.
- [x] Task: Integrate `CharacterWizard` into Modal [19cdd9d]
    - [x] 🔴 RED: Test that clicking "Novo Personagem" opens the `SlideOver` containing the existing `CharacterWizard`.
    - [x] 🟢 GREEN: Refactor `BibleDashboard` to show `CharacterWizard` inside the modal system.
- [ ] Task: Conductor - User Manual Verification 'Category Implementations' (Protocol in workflow.md)

## Phase 3: Polish & Refinement
- [ ] Task: Mobile Optimization & Aesthetic Polish
    - [ ] 🔴 RED: Test that the modal is full-width on screens < 768px.
    - [ ] 🟢 GREEN: Add media queries to adjust `SlideOver` width and refine monochrome consistency.
- [ ] Task: Form Reset Logic
    - [ ] 🔴 RED: Test that closing the modal and reopening it displays a fresh/reset form (matching spec "Out of Scope").
    - [ ] 🟢 GREEN: Ensure form state is cleared when modal `onClose` is triggered.
- [ ] Task: Conductor - User Manual Verification 'Polish' (Protocol in workflow.md)
