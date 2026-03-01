# Plan: Story Bible Domain & UI (Mocks)

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

## Phase 3: UI Dashboard & Components (Mocks)
- [ ] Task: Create Bible Dashboard Layout
    - [ ] 🔴 RED: Test `BibleDashboard` layout and tabs existence.
    - [ ] 🟢 GREEN: Implement `BibleDashboard` with tabs using Tailwind.
- [ ] Task: Implement Entity List Views (Mocks)
    - [ ] 🔴 RED: Test `CharacterList` with mocked data.
    - [ ] 🟢 GREEN: Implement `CharacterList`.
    - [ ] 🔴 RED: Test `LocationList` and `WorldRuleList`.
    - [ ] 🟢 GREEN: Implement remaining lists.
- [ ] Task: Implement CRUD Forms (Mocks)
    - [ ] 🔴 RED: Test `CharacterForm` validation and submission.
    - [ ] 🟢 GREEN: Implement `CharacterForm`.
    - [ ] 🔴 RED: Test `LocationForm` and `WorldRuleForm`.
    - [ ] 🟢 GREEN: Implement remaining forms.
- [ ] Task: Integrate Search Bar UI
    - [ ] 🔴 RED: Test `SearchBar` rendering.
    - [ ] 🟢 GREEN: Implement `SearchBar` component.
- [ ] Task: Conductor - User Manual Verification 'UI Dashboard & Components' (Protocol in workflow.md)
