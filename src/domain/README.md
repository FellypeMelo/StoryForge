# Domain Layer (Frontend)

This layer contains the core business logic, entities, and repository interfaces.

## Dependency Rules
- **NO DEPENDENCIES** on any other layer (UI, Infrastructure, or Application).
- Should contain pure TypeScript logic.
- Defines interfaces/types that other layers must implement or use.
