# 🏗️ Milestone 1 — Fundação & Scaffold

> **Fase:** Zero to MVP Foundation  
> **Objetivo:** Estabelecer o esqueleto arquitetural com Tauri + React + SQLite, Clean Architecture rigorosa e pipeline TDD funcional.  
> **Compliance:** Lei 1 (TDD), Lei 2 (Clean Arch), Lei 5 (YAGNI+KISS)

---

## Pré-Condições

- [ ] Rust toolchain instalado (`rustup`, `cargo`)
- [ ] Node.js LTS instalado (≥ 18)
- [ ] `pnpm` como package manager
- [ ] Git inicializado com `.gitignore` adequado

---

## Etapa 1.1 — Scaffold Tauri + React

### Tarefas

- [ ] Inicializar projeto Tauri v2 com template React + TypeScript
- [ ] Configurar `tauri.conf.json` com permissões mínimas (Least Privilege)
- [ ] Validar build inicial: `cargo tauri dev` abre janela vazia
- [ ] Remover boilerplate desnecessário (logos, CSS default)

### Critério de Aceite

```
Aplicação Tauri abre com janela limpa e título "StoryForge".
Build em modo dev funciona sem warns críticos.
```

---

## Etapa 1.2 — Clean Architecture: Estrutura de Diretórios

### Tarefas

- [ ] Criar estrutura de camadas no frontend:
  ```
  src/
  ├── domain/          # Entidades puras, Value Objects, interfaces
  │   ├── entities/
  │   └── ports/       # Interfaces de repositório (contratos)
  ├── application/     # Casos de uso (orquestradores)
  │   └── usecases/
  ├── infrastructure/  # Implementações concretas (Tauri IPC, SQLite)
  │   ├── persistence/
  │   └── ipc/
  └── ui/              # Componentes React (camada de apresentação)
      ├── components/
      ├── pages/
      └── hooks/
  ```
- [ ] Criar estrutura equivalente no backend Rust:
  ```
  src-tauri/
  ├── src/
  │   ├── domain/       # Structs, traits, regras de negócio puras
  │   ├── application/  # Command handlers, use cases
  │   ├── infrastructure/ # SQLite, file system
  │   └── commands/     # Tauri IPC commands (camada de entrada)
  ```
- [ ] Documentar regra: `domain/` NUNCA importa de `infrastructure/`

### Critério de Aceite

```
Compilação limpa em ambos os lados (Rust + TS).
Nenhum import cruzado entre domain ↔ infrastructure.
```

---

## Etapa 1.3 — SQLite: Motor de Persistência Base

### Tarefas (TDD — Red primeiro)

- [ ] 🔴 RED: Escrever teste que valida criação de banco SQLite via Tauri
- [ ] 🔴 RED: Escrever teste que valida execução de migration schema vazio
- [ ] 🟢 GREEN: Implementar inicialização do SQLite no backend Rust
- [ ] 🟢 GREEN: Implementar sistema de migrations (versionado, incremental)
- [ ] 🔵 REFACTOR: Extrair lógica de conexão para trait `DatabasePort`
- [ ] Configurar `WAL mode` para performance de escrita
- [ ] Garantir arquivo `.db` em diretório `app_data_dir()` do Tauri

### Critério de Aceite

```
Teste automatizado cria e destrói banco em diretório efêmero.
Migration roda sem erro. Schema versionado.
Trait DatabasePort definida no domain sem dependência de rusqlite.
```

---

## Etapa 1.4 — IPC Bridge (Tauri Commands)

### Tarefas (TDD)

- [ ] 🔴 RED: Teste que invoca comando Tauri `get_app_info` e recebe JSON
- [ ] 🟢 GREEN: Implementar Tauri command `get_app_info` retornando versão
- [ ] 🔴 RED: Teste que invoca `health_check` e valida status do SQLite
- [ ] 🟢 GREEN: Implementar `health_check` com verificação de conexão DB
- [ ] 🔵 REFACTOR: Padronizar tipo de retorno (`Result<T, AppError>`)

### Critério de Aceite

```
Frontend invoca commands via @tauri-apps/api e recebe respostas tipadas.
Erros de infra são mapeados para AppError (Value Object).
```

---

## Etapa 1.5 — Pipeline de Testes & Linting

### Tarefas

- [ ] Configurar Vitest para testes unitários do frontend
- [ ] Configurar `cargo test` para testes unitários do backend Rust
- [ ] Configurar ESLint + Prettier com regras estritas (no-any, etc.)
- [ ] Configurar `clippy` com `deny(warnings)` no Rust
- [ ] Criar script `npm test:all` que roda ambos os lados
- [ ] Garantir que TODOS os testes passam antes de qualquer commit

### Critério de Aceite

```
`npm test:all` executa suítes frontend + backend.
Zero warnings em clippy e ESLint.
Coverage report gerado (mínimo framework funcional).
```

---

## Etapa 1.6 — UI Shell Mínima

### Tarefas

- [ ] Instalar e configurar Tailwind CSS
- [ ] Criar layout base: sidebar (vazia) + área principal (vazia)
- [ ] Implementar tema escuro como default
- [ ] Criar componente `<AppShell>` responsivo
- [ ] Tipografia base definida (sans-serif, tamanhos consistentes)

### Critério de Aceite

```
Aplicação abre com layout limpo, escuro, responsivo.
Sidebar e área principal renderizam sem erros.
Sem bibliotecas de componentes externas (YAGNI).
```

---

## Entregáveis do Milestone 1

| Artefato                     | Descrição                               |
| ---------------------------- | --------------------------------------- |
| Projeto Tauri funcional      | Build dev + build release               |
| Estrutura Clean Architecture | Ambos frontend e backend                |
| SQLite inicializado          | Com sistema de migrations e WAL mode    |
| IPC Bridge                   | Commands tipados com tratamento de erro |
| Pipeline de testes           | Vitest + cargo test + linting           |
| UI Shell                     | Layout base com tema escuro             |

---

## Checklist de Merge (GEMINI.md)

- [ ] Complexidade ciclomática ≤ 15 por função?
- [ ] Nesting Depth ≤ 2?
- [ ] Value Objects para IDs?
- [ ] Nenhum `new ConcreteClass()` no domínio?
- [ ] Testes cobrem happy path + edge cases?
- [ ] Zero dependências externas não aprovadas?
