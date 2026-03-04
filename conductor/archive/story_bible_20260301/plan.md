# Plan: Story Codex Domain & UI (Mocks)

## Phase 1: Domain Entities & Value Objects [checkpoint: b32102f]

- [x] Task: Create Domain Value Objects for IDs (ProjectId, CharacterId, etc.) [b6fedc7]
  - [x] 🔴 RED: Test for `ProjectId` validation and equality.
  - [x] 🟢 GREEN: Implement `ProjectId` using `uuid`.
  - [x] 🔴 RED: Test for `CharacterId` validation.
  - [x] 🟢 GREEN: Implement `CharacterId`.
- [x] Task: Implement Core Entities (Project, Character, Location) [350082c]
  - [x] 🔴 RED: Test for `Project` entity validation.
  - [x] 🟢 GREEN: Implement `Project` entity.
  - [x] 🔴 RED: Test for `Character` entity (OCEAN scores).
  - [x] 🟢 GREEN: Implement `Character` entity.
  - [x] 🔴 RED: Test for `Location` entity.
  - [x] 🟢 GREEN: Implement `Location` entity.
- [x] Task: Implement Secondary Entities (WorldRule, TimelineEvent, Relationship, BlacklistEntry) [46755b7]
  - [x] 🔴 RED: Test for `WorldRule` validation.
  - [x] 🟢 GREEN: Implement `WorldRule`.
  - [x] 🔴 RED: Test for `TimelineEvent`.
  - [x] 🟢 GREEN: Implement `TimelineEvent`.
  - [x] 🔴 RED: Test for `Relationship`.
  - [x] 🟢 GREEN: Implement `Relationship`.
  - [x] 🔴 RED: Test for `BlacklistEntry`.
  - [x] 🟢 GREEN: Implement `BlacklistEntry`.
- [x] Task: Conductor - User Manual Verification 'Domain Entities & Value Objects' (Protocol in workflow.md) [b32102f]

## Phase 2: Repository Ports (Interfaces) [checkpoint: a272179]

- [x] Task: Define Repository Interfaces [a272179]
  - [x] Define `ProjectRepository` in `src/domain/ports/`.
  - [x] Define `CharacterRepository` with CRUD signatures.
  - [x] Define `LocationRepository`.
  - [x] Define `WorldRuleRepository`.
  - [x] Define `TimelineRepository` with causal ordering.
  - [x] Define `RelationshipRepository` with graph search.
  - [x] Define `BlacklistRepository`.
- [x] Task: Define Search Ports [a272179]
  - [x] Define `SearchPort` for FTS.
  - [x] Define `VectorSearchPort` signature.
- [x] Task: Conductor - User Manual Verification 'Repository Ports' (Protocol in workflow.md) [a272179]

## Phase 3: UI Dashboard & Components (Mocks) [checkpoint: c1645b7]

- [x] Task: Create Codex Dashboard Layout [c1645b7]
  - [x] 🔴 RED: Test `CodexDashboard` layout and tabs existence.
  - [x] 🟢 GREEN: Implement `CodexDashboard` with tabs using Tailwind.
- [x] Task: Implement Entity List Views (Mocks) [c1645b7]
  - [x] 🔴 RED: Test `CharacterList` with mocked data.
  - [x] 🟢 GREEN: Implement `CharacterList`.
  - [x] 🔴 RED: Test `LocationList` and `WorldRuleList`.
  - [x] 🟢 GREEN: Implement remaining lists.
- [x] Task: Implement CRUD Forms (Mocks) [c1645b7]
  - [x] 🔴 RED: Test `CharacterForm` validation and submission.
  - [x] 🟢 GREEN: Implement `CharacterForm`.
  - [x] 🔴 RED: Test `LocationForm` and `WorldRuleForm`.
  - [x] 🟢 GREEN: Implement remaining forms.
- [x] Task: Integrate Search Bar UI [c1645b7]
  - [x] 🔴 RED: Test `SearchBar` rendering.
  - [x] 🟢 GREEN: Implement `SearchBar` component.
- [x] Task: Conductor - User Manual Verification 'UI Dashboard & Components' (Protocol in workflow.md) [c1645b7]

## Phase: Review Fixes

- [x] Task: Apply review suggestions [2e4ea23]
