# 📚 Milestone 2 — Story Codex & Motor RAG

> **Fase:** Core Data Layer  
> **Objetivo:** Implementar o Lorebook (Codex da História) com persistência SQLite, busca semântica via `sqlite-vec`/FTS5 e pipeline RAG para injeção de contexto.  
> **Base Teórica:** [`06_story_codex.md`](../agents/06_story_codex.md)  
> **Compliance:** Lei 1 (TDD), Lei 2 (Clean Arch), Lei 3 (Economia de Contexto)

---

## Pré-Condições

- [x] Milestone 1 completo (SQLite funcional, Clean Arch, IPC bridge)

---

## Etapa 2.1 — Modelo de Domínio: Entidades do Lorebook

### Tarefas (TDD)

- [x] 🔴 RED: Teste para entidade `Project` (id, title, genre, createdAt)
- [x] 🔴 RED: Teste para entidade `Character` com validação de campos obrigatórios
- [x] 🔴 RED: Teste para entidade `Location` (name, description, symbolicMeaning)
- [x] 🔴 RED: Teste para entidade `WorldRule` (category, content, hierarchy)
- [x] 🔴 RED: Teste para entidade `TimelineEvent` (date, description, causalDependencies)
- [x] 🔴 RED: Teste para entidade `Relationship` (characterA, characterB, type)
- [x] 🔴 RED: Teste para entidade `BlacklistEntry` (term, category, reason)
- [x] 🟢 GREEN: Implementar todas as entidades no `domain/entities/`
- [x] 🔵 REFACTOR: Extrair Value Objects — `ProjectId`, `CharacterId`, `LocationId`

### Critério de Aceite

```
Cada entidade possui validação rígida no construtor.
IDs são Value Objects (não primitivos string/number).
Entidades são puras — zero dependências de infraestrutura.
```

---

## Etapa 2.2 — Ports (Interfaces de Repositório)

### Tarefas

- [x] Definir interface `ProjectRepository` no `domain/ports/`
- [x] Definir interface `CharacterRepository` com CRUD + busca por projeto
- [x] Definir interface `LocationRepository`
- [x] Definir interface `WorldRuleRepository`
- [x] Definir interface `TimelineRepository` com ordenação causal
- [x] Definir interface `RelationshipRepository` com busca por grafo
- [x] Definir interface `BlacklistRepository`

### Critério de Aceite

```
Interfaces definidas APENAS no domain, sem referência a SQLite.
Cada método retorna Result<T, DomainError>.
```

---

## Etapa 2.3 — Implementação SQLite (Infrastructure)

### Tarefas (TDD)

- [x] 🔴 RED: Teste de integração para `SqliteProjectRepository.create()`
- [x] 🔴 RED: Teste de integração para `SqliteProjectRepository.findById()`
- [x] 🟢 GREEN: Implementar `SqliteProjectRepository` com migrations
- [x] Repetir ciclo TDD para cada repositório (Character, Location, WorldRule, Timeline, Relationship, Blacklist)
- [x] 🔵 REFACTOR: Extrair helper de mapping row → entity
- [x] Implementar migration SQL para todas as tabelas

### Schema SQL Esperado

```sql
-- Tabelas principais
projects (id TEXT PK, title TEXT, genre TEXT, created_at TEXT)
characters (id TEXT PK, project_id TEXT FK, name TEXT, ocean_scores TEXT, ...)
locations (id TEXT PK, project_id TEXT FK, name TEXT, ...)
world_rules (id TEXT PK, project_id TEXT FK, category TEXT, content TEXT, ...)
timeline_events (id TEXT PK, project_id TEXT FK, ...)
relationships (id TEXT PK, project_id TEXT FK, character_a TEXT FK, character_b TEXT FK, type TEXT)
blacklist_entries (id TEXT PK, project_id TEXT FK, term TEXT, category TEXT, reason TEXT)
```

### Critério de Aceite

```
CRUD completo para todas as entidades com testes de integração.
Migrations versionadas. Rollback funcional.
Queries parametrizadas (zero SQL injection).
```

---

## Etapa 2.4 — FTS5: Busca Full-Text

### Tarefas (TDD)

- [x] 🔴 RED: Teste que busca personagem por nome parcial
- [x] 🔴 RED: Teste que busca eventos de timeline por descrição
- [x] 🟢 GREEN: Criar tabelas virtuais FTS5 para characters, locations, timeline
- [x] 🟢 GREEN: Implementar `SearchPort` com método `search(query, entityType)`
- [x] 🔵 REFACTOR: Normalizar resultados em tipo unificado `SearchResult`

### Critério de Aceite

```
Busca "João" retorna personagem com nome "João Pedro Silva".
Resultados ranqueados por relevância FTS5.
```

---

## Etapa 2.5 — sqlite-vec: Busca Semântica Vetorial

### Tarefas (TDD)

- [x] 🔴 RED: Teste que insere embedding vetorial e recupera por similaridade
- [x] 🟢 GREEN: Integrar extensão `sqlite-vec` no Rust (via libsqlite3-sys)
- [x] 🟢 GREEN: Criar tabela de embeddings vinculada a entidades
- [x] 🔴 RED: Teste que busca "medo de abandono" e retorna personagem com Ferida compatível
- [x] 🟢 GREEN: Implementar `VectorSearchPort` com método `findSimilar(embedding, topK)`
- [x] 🔵 REFACTOR: Abstrair geração de embeddings atrás de `EmbeddingPort`

### Critério de Aceite

```
Busca vetorial retorna top-K resultados por similaridade cosseno.
EmbeddingPort é interface no domínio (implementação plugável).
```

---

## Etapa 2.6 — Pipeline RAG: Injeção de Contexto

### Tarefas (TDD)

- [x] 🔴 RED: Teste para `ContextInjector` que gera bloco de continuidade
- [x] 🟢 GREEN: Implementar `ContextInjector` (use case):
  - Inputs: capítulo atual, entidades mencionadas
  - Busca RAG: trechos relevantes do Codex
  - Output: prompt de continuidade formatado
- [x] 🔴 RED: Teste que valida injeção NÃO excede token budget (economia de contexto)
- [x] 🟢 GREEN: Implementar truncamento inteligente por relevância
- [x] 🔵 REFACTOR: Extrair `TokenBudgetCalculator` como serviço puro

### Template de Saída Esperado

```
"SISTEMA DE CONTINUIDADE:
Você está escrevendo o Livro [X], Capítulo [Y].
Codex da História (trechos relevantes): [TRECHO RAG]
Resumo do Capítulo Anterior: [RESUMO]
Status Atual: [STATUS DOS PERSONAGENS]"
```

### Critério de Aceite

```
Pipeline RAG gera contexto filtrado por relevância.
Token budget respeitado (nunca inunda contexto).
Caso de uso puro — sem dependência direta de SQLite ou LLM.
```

---

## Etapa 2.7 — UI: Painel do Codex da História

### Tarefas

- [x] Criar página `/codex` com tabs: Personagens, Locais, Mundo, Cronologia, Relações, Blacklist
- [x] Implementar listagem de cada entidade por tab
- [x] Implementar formulários de criação/edição (modal ou inline)
- [x] Implementar busca FTS5 no topo da página
- [x] Implementar visualização de estado atual (snapshot) por personagem

### Critério de Aceite

```
CRUD funcional para todas as entidades via UI.
Busca full-text retorna resultados em tempo real.
Design limpo, consistente com AppShell do Milestone 1.
```

---

## Entregáveis do Milestone 2

| Artefato             | Status  | Descrição                                          |
| -------------------- | ------- | -------------------------------------------------- |
| Modelo de domínio    | ✅ Done | 7 entidades com Value Objects para IDs             |
| Ports (interfaces)   | ✅ Done | 7 interfaces de repositório no domínio             |
| Implementação SQLite | ✅ Done | CRUD completo com migrations versionadas           |
| FTS5                 | ✅ Done | Busca full-text para personagens, locais, timeline |
| sqlite-vec           | ✅ Done | Busca semântica vetorial com embeddings            |
| Pipeline RAG         | ✅ Done | `ContextInjector` com token budget                 |
| UI Codex             | ✅ Done | Painel completo com CRUD e busca                   |

---

## Checklist de Merge (GEMINI.md)

- [x] Domínio puro — zero imports de `rusqlite` ou Tauri?
- [x] Queries SQL parametrizadas (anti SQL Injection)?
- [x] Value Objects para todos os IDs?
- [x] Testes de integração para cada repositório?
- [x] Token budget testado com edge cases?
