# Plan: Story Bible Domain & UI (Mocks)

## Phase 1: Domain Entities & Value Objects
- [x] Task: Create Domain Value Objects for IDs (ProjectId, CharacterId, etc.) [b6fedc7]
    - [x] 🔴 RED: Test for `ProjectId` validation and equality.
    - [x] 🟢 GREEN: Implement `ProjectId` using `uuid`.
    - [x] 🔴 RED: Test for `CharacterId` validation.
    - [x] 🟢 GREEN: Implement `CharacterId`.
- [ ] Task: Implement Core Entities (Project, Character, Location)
    - [ ] 🔴 RED: Test for `Project` entity validation.
    - [ ] 🟢 GREEN: Implement `Project` entity.
    - [ ] 🔴 RED: Test for `Character` entity (OCEAN scores).
    - [ ] 🟢 GREEN: Implement `Character` entity.
    - [ ] 🔴 RED: Test for `Location` entity.
    - [ ] 🟢 GREEN: Implement `Location` entity.
- [ ] Task: Implement Secondary Entities (WorldRule, TimelineEvent, Relationship, BlacklistEntry)
    - [ ] 🔴 RED: Test for `WorldRule` validation.
    - [ ] 🟢 GREEN: Implement `WorldRule`.
    - [ ] 🔴 RED: Test for `TimelineEvent`.
    - [ ] 🟢 GREEN: Implement `TimelineEvent`.
    - [ ] 🔴 RED: Test for `Relationship`.
    - [ ] 🟢 GREEN: Implement `Relationship`.
    - [ ] 🔴 RED: Test for `BlacklistEntry`.
    - [ ] 🟢 GREEN: Implement `BlacklistEntry`.
- [ ] Task: Conductor - User Manual Verification 'Domain Entities & Value Objects' (Protocol in workflow.md)

## Phase 2: Repository Ports (Interfaces)
- [ ] Task: Define Repository Interfaces
    - [ ] Define `ProjectRepository` in `src/domain/ports/`.
    - [ ] Define `CharacterRepository` with CRUD signatures.
    - [ ] Define `LocationRepository`.
    - [ ] Define `WorldRuleRepository`.
    - [ ] Define `TimelineRepository` with causal ordering.
    - [ ] Define `RelationshipRepository` with graph search.
    - [ ] Define `BlacklistRepository`.
- [ ] Task: Define Search Ports
    - [ ] Define `SearchPort` for FTS.
    - [ ] Define `VectorSearchPort` signature.
- [ ] Task: Conductor - User Manual Verification 'Repository Ports' (Protocol in workflow.md)

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
