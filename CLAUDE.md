# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**StoryForge** is an offline-first literary development platform built with Tauri (Rust backend + React frontend). It orchestrates AI creative agents for structured narrative development (ideation, character building, story structure, writing assistance, editing). Data persists in local SQLite with vector search (`sqlite-vec`) for RAG-based context injection.

## Commands

### Frontend (React + Vite)
```bash
npm run dev            # Start Vite dev server (port 1420 for Tauri)
npm run build          # TypeScript check + Vite production build
npm run preview        # Preview production build
npm test               # Run Vitest once (vitest run)
npm run test:watch     # Run Vitest in watch mode
npm run lint           # ESLint
npm run format         # Prettier format
```

### Backend (Rust + Tauri)
```bash
npm run tauri          # Tauri CLI (tauri dev, tauri build, etc.)
npm run tauri dev      # Full Tauri dev mode (frontend + Rust)
npm run test:backend   # Rust tests (cargo test)
npm run test:all       # Frontend + backend tests
npm run lint:backend   # Clippy linting (-D warnings)
npm run format:backend # Cargo fmt

cd src-tauri && cargo test -- --nocapture   # Rust tests with stdout
cd src-tauri && cargo test <module_name>     # Single module test
```

### Running a single frontend test
```bash
npm run test:watch -- -t "test name pattern"
```

## Architecture

### Clean Architecture (Hexagonal) — Frontend (`src/`)

```
src/
├── domain/                    # Pure business logic, zero external dependencies
│   ├── *.ts                   # Entities: Book, Character, CharacterSheet, Project, etc.
│   ├── value-objects/         # Strongly typed IDs: BookId, CharacterId, ProjectId, Genre, etc.
│   ├── ports/                 # Repository interfaces (CharacterRepository, BookRepository, etc.)
│   └── services/              # Domain services (CharacterValidator)
├── application/               # Use case layer — thin orchestrators
│   ├── character/             # generate-character.ts
│   ├── ideation/              # extract-cliches, generate-premises, validate-premise
│   └── worldbuilding/         # worldbuilding-pipeline
├── infrastructure/            # External implementations
│   ├── tauri/                 # Tauri IPC repository implementations
│   └── llm/                   # LLM port adapters (dummy for testing)
└── ui/                        # React + Tailwind CSS
    └── components/            # dashboard, ideation, character, book, location, project, etc.
```

**Key patterns:**
- Repository pattern via ports/interfaces in `domain/ports/`
- Implementations in `infrastructure/tauri/` call Tauri's `invoke` backend commands
- Domain entities use `Result<T, DomainError>` monad for error handling (`domain/result.ts`)
- Tests use a `mockDb` (in `src/test/mock-db.ts`) that simulates the Tauri backend in-memory

### Backend — Rust/Tauri (`src-tauri/src/`)

```
src-tauri/src/
├── main.rs                    # Tauri entry point, calls lib.rs
├── lib.rs                     # App setup: SQLite init, Tauri commands registration
├── domain/                    # Shared domain: error types, result, value_objects, token_budget
├── features/                  # Feature modules (CRUD + domain logic per aggregate)
│   ├── projects/              # Projects
│   ├── books/                 # Books (scoped to projects)
│   ├── characters/            # Characters (scoped to books/projects)
│   ├── lore/                  # Locations, WorldRules, TimelineEvents, Relationships, Blacklists
│   │                          # Includes RAG search (search_lore, get_lore_context)
│   └── integration_tests.rs   # Rust integration tests
├── infrastructure/
│   └── sqlite.rs              # Direct SQLite access with rusqlite + sqlite-vec
└── commands/                  # Common Tauri commands (get_app_info, health_check)
```

**Key patterns:**
- SQLite is the single source of truth, initialized in `lib.rs` setup
- Test database via `STORYFORGE_ENV=test` environment variable → uses `storyforge_test.db`
- All features follow feature-module pattern: commands are individual `#[tauri::command]` functions
- Tauri IPC bridges frontend → Rust; no HTTP layer

## Testing

### Frontend (Vitest + jsdom)
- Test files: colocated with source `*.test.ts` / `*.test.tsx`
- Setup file: `src/test/setup.ts` — globally mocks `@tauri-apps/api/core` with `mockDb`
- Mock DB resets automatically before each test for isolation
- Coverage currently at ~84%

### Backend (Rust/Cargo)
- Standard `cargo test` pattern; run from `src-tauri/`
- Integration tests in `src-tauri/src/features/integration_tests.rs`

## Domain Model (High-Level)

- **Project** — Top-level container for a story
  - **Book** — A manuscript/book within a project
    - **Character** + CharacterSheet (OCEAN + Hauge arc + Voice profile)
    - **Location** — Worldbuilding places
    - **WorldRule** — Consistency rules (magic systems, physics)
    - **TimelineEvent** — Chronological events with causal dependencies
    - **Relationship** — Character relationship graphs
    - **BlacklistEntry** — Banned clichés, AI-isms, tropes
- **Ideation** — CHI method premises, generated clichés, premise validation

## Important Details

- **No CLAUDE.md existed before** — this is the first one
- Strict TypeScript config: `noUnusedLocals`, `noUnusedParameters`, `strict: true`
- Domain entities never import from infrastructure layer (dependency rule)
- Frontend uses `zod` v4 for runtime validation schemas
- SQLite migrations run on app startup (`db.run_migrations()`)

---

## Extended Practices: AI-XP & Agentic Engineering

The following guidelines are derived from industry‑proven agentic software engineering (AI‑XP) and complement the existing clean architecture and TDD practices.

### TDD Mandatory Rule (Red‑Green‑Refactor)

- **No production code change is allowed without a failing test first.**  
  If a test does not fail before implementation, reject the change and generate the missing test.
- **Three phases:**
  1. **RED** – Write a test that fails (describes the desired behaviour).
  2. **GREEN** – Write the minimum code to pass the test.
  3. **REFACTOR** – Improve design while keeping tests green.
- **Automated check:** Use pre‑edit hooks (e.g., `enforce-tdd-red-phase.ts`) to verify that a recent failing test exists before modifying any domain or application code.

### Clean Architecture & SOLID Reinforcement

- **Domain must NOT import any infrastructure** (no Tauri, no SQLite, no HTTP, no file system).
- **Dependency inversion:** All external dependencies are injected via constructor or interface (repository ports).
- **SOLID enforcement:**
  - **SRP:** One class, one reason to change. Maximum one public method per responsibility.
  - **OCP:** Extend via interfaces; never modify existing code without a test.
  - **LSP:** Subtypes must be substitutable without breaking tests.
  - **ISP:** Segregate interfaces per domain (no monolithic “service” interfaces).
  - **DIP:** No `new ConcreteClass()` in domain; use dependency injection.
- **Function limits:** ≤ 15 lines; early returns preferred.  
  **Class limits:** ≤ 200 lines.
- **Value Objects:** Never use primitives for IDs, money, or domain concepts (use `BookId`, `Genre`, etc.).

### Security & Self‑Healing (DevSecOps)

- **Hard‑coded secrets:** Forbidden. Use environment variables + validation.
- **SQL injection:** All database queries must be parameterised (Rust `rusqlite` already uses prepared statements).
- **XSS:** Output escaping and CSP headers for frontend.
- **Least privilege:** Agents (including Claude) operate in a sandbox with restricted disk/network access. No root execution.
- **Audit trail:** All critical changes (project creation, AI generation, deletion) should log a timestamp, actor, and affected entity.

### Anti‑Patterns to Avoid

| Anti‑Pattern                 | Detection Signal                             | Prevention                                   |
| ---------------------------- | -------------------------------------------- | -------------------------------------------- |
| **Avoidance of refactors**   | Cyclomatic complexity > 15, maintainability ↓ | Hard linting limits; fail PR if exceeded.    |
| **Bugs déjà‑vu**             | Duplicate code across modules                | Use RAG search before implementing new logic. |
| **Over‑specification**       | Code churn (deleted weeks later)             | Strict YAGNI + TDD.                          |
| **Return of monoliths**      | Controller directly calls database           | Enforce use of repository interfaces.        |
| **Comment noise**            | Comments explaining “what” instead of “why”  | Only allow “why” comments.                   |
| **Hallucinated dependencies** | Packages not in `package.json` or `Cargo.toml` | CI hook blocks unknown imports.              |
| **Stacktrace dumping**       | >12k lines of logs in prompts                | Reject; request filtered stack trace.        |

### Quality Metrics (Pre‑Merge Checklist)

- [ ] The implementation degrades gracefully with unexpected input (no panics / unhandled errors).
- [ ] Strong type protections are not bypassed (no `any` in TypeScript, no `unwrap()` in Rust without justification).
- [ ] Timeouts and circuit breakers are implemented for external calls (LLM, file system).
- [ ] Tests cover race conditions and hardware exceptions (e.g., database lock, disk full).
- [ ] Cyclomatic complexity ≤ 15 per function.
- [ ] Nesting depth ≤ 2.
- [ ] Value Objects used for all domain identifiers and measurements.
- [ ] No external dependency added without approval.
- [ ] Audit trail generated for compliance (where applicable).

### Performance & Context Economy

- **Limit context window:** Do not inject irrelevant files. Focus on exact lines being changed.
- **No code summarisation:** Always emit full `SEARCH/REPLACE` blocks; avoid `// ... code omitted`.
- **Prefer deterministic reasoning:** For closed‑scope refactorings, set `reasoning_effort="none"` to avoid token waste.

### Operational Rules for Claude

- **OP‑01:** Separate high‑level architectural decisions from low‑line editing. When uncertain about architecture, ask first.
- **OP‑02:** Never summarise code. Always output complete functions or blocks.
- **OP‑03:** Assume sandboxed environment – do not attempt network calls outside allowed APIs.
- **OP‑04:** Keep chat history concise; for large refactorings, start a fresh context.

### Behaviour: Prohibited vs Mandatory

| Prohibited                                 | Mandatory                                      |
| ------------------------------------------ | ---------------------------------------------- |
| Flood‑and‑hope prompts (vague requests)    | Require a failing test before any change.      |
| Generating code without a failing test.    | Emit full SEARCH/REPLACE blocks.               |
| Importing infrastructure into domain.      | Respect clean architecture boundaries.         |
| Creating abstractions without 3 conflicting real‑world use cases. | Apply YAGNI + KISS. |
| Using primitives for domain values.        | Use Value Objects.                             |
| Commenting what the code does.             | Comment only why something is done.            |
| Suggesting external dependencies without approval. | Obtain approval before adding deps.      |
| Running as root or outside sandbox.        | Operate with least privilege.                  |
| Keeping excessive chat history (>8192 tokens). | Prune context regularly.                   |

### Incident Recovery (Recursive Loop Hard Stop)

If a generated correction leads to a new failure or a recursive stack‑trace loop:
1. Revert all changes (`git checkout .`).
2. Discard the current context (the model’s memory is compromised).
3. Disable any “deep thinking” mode.
4. Rewrite a minimal, hyper‑circumscribed prompt manually.
5. Validate the failure locally before re‑attempting.