# Track: Milestone 1 — Fundação & Scaffold

## Specification

This track establishes the architectural skeleton for StoryForge using Tauri v2, React (TypeScript), and SQLite. It implements a rigorous Clean Architecture pattern across both frontend and backend, sets up a functional TDD pipeline, and creates a basic dark-themed UI shell.

## Scope

- Initialize Tauri v2 project with React template.
- Implement Clean Architecture directory structure (Vertical Slicing).
- Set up SQLite engine with migrations and WAL mode.
- Establish IPC bridge between frontend and backend.
- Configure testing (Vitest, Cargo Test) and linting (ESLint, Clippy) infrastructure.
- Create a minimal dark UI shell with Tailwind CSS.

## Success Criteria

- Successful `cargo tauri dev` build with a clean window titled "StoryForge".
- 100% adherence to Clean Architecture import rules (Domain isolated from Infra).
- Automated tests for SQLite connection and migrations.
- Working `get_app_info` and `health_check` Tauri commands.
- Pipeline `pnpm test:all` executing all tests with zero warnings.
- Dark UI layout responsive and error-free.


