# 📚 Milestone 2 — Story Bible & Motor RAG

> **Fase:** Core Data Layer  
> **Objetivo:** Implementar o Lorebook (Bíblia da História) com persistência SQLite, busca semântica via `sqlite-vec`/FTS5 e pipeline RAG para injeção de contexto.  
> **Base Teórica:** [`06_story_bible.md`](../agents/06_story_bible.md)  
> **Compliance:** Lei 1 (TDD), Lei 2 (Clean Arch), Lei 3 (Economia de Contexto)

---

## Pré-Condições

- [x] Milestone 1 completo (SQLite funcional, Clean Arch, IPC bridge)

---

## Etapa 2.1 — Modelo de Domínio: Entidades do Lorebook

### Tarefas (TDD)

- [ ] 🔴 RED: Teste para entidade `Project` (id, title, genre, createdAt)
- [ ] 🔴 RED: Teste para entidade `Character` com validação de campos obrigatórios
- [ ] 🔴 RED: Teste para entidade `Location` (name, description, symbolicMeaning)
- [ ] 🔴 RED: Teste para entidade `WorldRule` (category, content, hierarchy)
- [ ] 🔴 RED: Teste para entidade `TimelineEvent` (date, description, causalDependencies)
- [ ] 🔴 RED: Teste para entidade `Relationship` (characterA, characterB, type)
- [ ] 🔴 RED: Teste para entidade `BlacklistEntry` (term, category, reason)
- [ ] 🟢 GREEN: Implementar todas as entidades no `domain/entities/`
- [ ] 🔵 REFACTOR: Extrair Value Objects — `ProjectId`, `CharacterId`, `LocationId`

### Critério de Aceite

```
Cada entidade possui validação rígida no construtor.
IDs são Value Objects (não primitivos string/number).
Entidades são puras — zero dependências de infraestrutura.
```

---

## Etapa 2.2 — Ports (Interfaces de Repositório)

### Tarefas

- [ ] Definir interface `ProjectRepository` no `domain/ports/`
- [ ] Definir interface `CharacterRepository` com CRUD + busca por projeto
- [ ] Definir interface `LocationRepository`
- [ ] Definir interface `WorldRuleRepository`
- [ ] Definir interface `TimelineRepository` com ordenação causal
- [ ] Definir interface `RelationshipRepository` com busca por grafo
- [ ] Definir interface `BlacklistRepository`

### Critério de Aceite

```
Interfaces definidas APENAS no domain, sem referência a SQLite.
Cada método retorna Result<T, DomainError>.
```

---

## Etapa 2.3 — Implementação SQLite (Infrastructure)

### Tarefas (TDD)

- [ ] 🔴 RED: Teste de integração para `SqliteProjectRepository.create()`
- [ ] 🔴 RED: Teste de integração para `SqliteProjectRepository.findById()`
- [ ] 🟢 GREEN: Implementar `SqliteProjectRepository` com migrations
- [ ] Repetir ciclo TDD para cada repositório (Character, Location, WorldRule, Timeline, Relationship, Blacklist)
- [ ] 🔵 REFACTOR: Extrair helper de mapping row → entity
- [ ] Implementar migration SQL para todas as tabelas

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

- [ ] 🔴 RED: Teste que busca personagem por nome parcial
- [ ] 🔴 RED: Teste que busca eventos de timeline por descrição
- [ ] 🟢 GREEN: Criar tabelas virtuais FTS5 para characters, locations, timeline
- [ ] 🟢 GREEN: Implementar `SearchPort` com método `search(query, entityType)`
- [ ] 🔵 REFACTOR: Normalizar resultados em tipo unificado `SearchResult`

### Critério de Aceite

```
Busca "João" retorna personagem com nome "João Pedro Silva".
Resultados ranqueados por relevância FTS5.
```

---

## Etapa 2.5 — sqlite-vec: Busca Semântica Vetorial

### Tarefas (TDD)

- [ ] 🔴 RED: Teste que insere embedding vetorial e recupera por similaridade
- [ ] 🟢 GREEN: Integrar extensão `sqlite-vec` no Rust (via libsqlite3-sys)
- [ ] 🟢 GREEN: Criar tabela de embeddings vinculada a entidades
- [ ] 🔴 RED: Teste que busca "medo de abandono" e retorna personagem com Ferida compatível
- [ ] 🟢 GREEN: Implementar `VectorSearchPort` com método `findSimilar(embedding, topK)`
- [ ] 🔵 REFACTOR: Abstrair geração de embeddings atrás de `EmbeddingPort`

### Critério de Aceite

```
Busca vetorial retorna top-K resultados por similaridade cosseno.
EmbeddingPort é interface no domínio (implementação plugável).
```

---

## Etapa 2.6 — Pipeline RAG: Injeção de Contexto

### Tarefas (TDD)

- [ ] 🔴 RED: Teste para `ContextInjector` que gera bloco de continuidade
- [ ] 🟢 GREEN: Implementar `ContextInjector` (use case):
  - Inputs: capítulo atual, entidades mencionadas
  - Busca RAG: trechos relevantes da Bíblia
  - Output: prompt de continuidade formatado
- [ ] 🔴 RED: Teste que valida injeção NÃO excede token budget (economia de contexto)
- [ ] 🟢 GREEN: Implementar truncamento inteligente por relevância
- [ ] 🔵 REFACTOR: Extrair `TokenBudgetCalculator` como serviço puro

### Template de Saída Esperado

```
"SISTEMA DE CONTINUIDADE:
Você está escrevendo o Livro [X], Capítulo [Y].
Bíblia da História (trechos relevantes): [TRECHO RAG]
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

## Etapa 2.7 — UI: Painel da Bíblia da História

### Tarefas

- [ ] Criar página `/bible` com tabs: Personagens, Locais, Mundo, Cronologia, Relações, Blacklist
- [ ] Implementar listagem de cada entidade por tab
- [ ] Implementar formulários de criação/edição (modal ou inline)
- [ ] Implementar busca FTS5 no topo da página
- [ ] Implementar visualização de estado atual (snapshot) por personagem

### Critério de Aceite

```
CRUD funcional para todas as entidades via UI.
Busca full-text retorna resultados em tempo real.
Design limpo, consistente com AppShell do Milestone 1.
```

---

## Entregáveis do Milestone 2

| Artefato             | Descrição                                          |
| -------------------- | -------------------------------------------------- |
| Modelo de domínio    | 7 entidades com Value Objects para IDs             |
| Ports (interfaces)   | 7 interfaces de repositório no domínio             |
| Implementação SQLite | CRUD completo com migrations versionadas           |
| FTS5                 | Busca full-text para personagens, locais, timeline |
| sqlite-vec           | Busca semântica vetorial com embeddings            |
| Pipeline RAG         | `ContextInjector` com token budget                 |
| UI Bíblia            | Painel completo com CRUD e busca                   |

---

## Checklist de Merge (GEMINI.md)

- [ ] Domínio puro — zero imports de `rusqlite` ou Tauri?
- [ ] Queries SQL parametrizadas (anti SQL Injection)?
- [ ] Value Objects para todos os IDs?
- [ ] Testes de integração para cada repositório?
- [ ] Token budget testado com edge cases?
