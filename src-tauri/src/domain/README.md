# Domain Layer (Backend)

This layer contains the core business logic, domain entities, and port definitions (traits).

## Dependency Rules

- **NO DEPENDENCIES** on any other layer (Infrastructure, Application, or Commands).
- Pure Rust logic only.
- Defines traits that the Infrastructure layer must implement (Dependency Inversion).


