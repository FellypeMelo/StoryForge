# Implementation Plan: Ideation & Worldbuilding

**Track ID:** ideation-worldbuilding_20260302
**Spec:** [spec.md](./spec.md)
**Created:** 2026-03-02
**Status:** [ ] Not Started

## Phase 1: Domain & Ports [checkpoint: e97bb11]

Create the core domain models and ports for Ideation.

### Tasks
- [x] Task 1.1: TDD for `Premise` entity with validation rules. (c236942)
- [x] Task 1.2: TDD for `ClicheBlacklist` and `CrossPollinationSeed` entities. (4a15f65)
- [x] Task 1.3: Define `LlmPort` interface in `src/domain/ideation/ports/`. (11a2817)
- [x] Task 1.4: Refactor domain with Value Objects (`Genre`, `AcademicDiscipline`). (953ef45)

### Verification
- [ ] Domain tests passing and no infrastructure dependencies in domain layer.

## Phase 2: CHI Pipeline Use Cases

Implement the CHI method use cases.

### Tasks
- [x] Task 2.1: TDD for `ExtractClichesUseCase`. (e4cc149)
- [x] Task 2.2: TDD for `GeneratePremisesUseCase`. (dc6e25a)
- [ ] Task 2.3: TDD for `ValidatePremiseUseCase`.
- [ ] Task 2.4: Implement `IdeationPipeline` composing the three phases.

### Verification
- [ ] Pipeline tests passing with mocked `LlmPort`.

## Phase 3: Worldbuilding CAD

Implement Context-Aware Decomposition for worldbuilding.

### Tasks
- [ ] Task 3.1: TDD for `WorldbuildingPipeline`.
- [ ] Task 3.2: Implement step 1 (Physics/Magic).
- [ ] Task 3.3: Implement step 2 (Economy).
- [ ] Task 3.4: Implement step 3 (Sociology/Religion).
- [ ] Task 3.5: Implement step 4 (Conflicts).

### Verification
- [ ] Pipeline isolates steps and persists `WorldRules`.

## Phase 4: Ideation UI

Implement the UI wizard for the CHI method.

### Tasks
- [ ] Task 4.1: Create `/ideation` route.
- [ ] Task 4.2: Build 3-step wizard component.
- [ ] Task 4.3: Build Phase 1 UI (Cliche list).
- [ ] Task 4.4: Build Phase 2 UI (Premises cards).
- [ ] Task 4.5: Build Phase 3 UI (Validation form).

### Verification
- [ ] UI correctly persists state across wizard steps.

## Final Verification
- [ ] All tests passing.
- [ ] App builds successfully.
