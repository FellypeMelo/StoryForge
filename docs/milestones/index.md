# 🗺️ StoryForge — Roadmap de Milestones

> **Framework:** AI-XP (Artificially Intelligent eXtreme Programming)  
> **Progressão:** Scaffold → MVP → Aplicação Real  
> **Compliance:** TDD Mandatório, Clean Architecture, SOLID, YAGNI+KISS

---

## Visão Geral

| #   | Milestone                                                              | Fase         | Foco Principal                                            |
| --- | ---------------------------------------------------------------------- | ------------ | --------------------------------------------------------- |
| 1   | [Foundation & Scaffold](milestone_01_foundation.md)                    | 🏗️ Zero      | Tauri + React + SQLite + Clean Arch + Pipeline TDD        |
| 2   | [Story Codex & Motor RAG](milestone_02_story_codex_rag.md)             | 📚 Dados     | Lorebook, FTS5, sqlite-vec, Injeção de Contexto RAG       |
| 3   | [Ideação CHI & Personagens](milestone_03_ideation_characters.md)       | 🧠 Criativo  | Método CHI (anti-clichê), OCEAN, Hauge, Worldbuilding CAD |
| 4   | [Estrutura Narrativa & Capítulos](milestone_04_narrative_structure.md) | 🏛️ Estrutura | 6 Frameworks, Story Grid, Cena & Sequela, Beat Sheets     |
| 5   | [Assistente de Escrita E.P.R.L.](milestone_05_writing_assistant.md)    | ✍️ Core      | CAD + Guardrails + RSIP, MRU, Editor TipTap WYSIWYG       |
| 6   | [Bad Cop Editor & Avançado](milestone_06_badcop_advanced.md)           | 🚨 Qualidade | 4 Eixos de Auditoria, Motif Engineering, MPS, Narradores  |
| 7   | [Multi-Provider GenAI](milestone_07_genai_orchestration.md)            | 🔌 Infra IA  | Ollama, OpenAI, Claude, Gemini, Circuit Breaker, Agentes  |
| 8   | [DevSecOps & Production](milestone_08_devsecops_production.md)         | 🛡️ Release   | CI/CD, SAST, Self-Healing, Packaging, Performance         |

---

## Diagrama de Dependências

```
Milestone 1 (Foundation)
    │
    ▼
Milestone 2 (Story Codex & RAG)
    │
    ├──────────────────────────────┐
    ▼                              ▼
Milestone 3 (Ideação/Chars)    Milestone 7 (GenAI Providers)
    │                              │
    ▼                              │
Milestone 4 (Estrutura/Caps)       │
    │                              │
    ▼                              │
Milestone 5 (EPRL/Editor) ◄───────┘
    │
    ▼
Milestone 6 (Bad Cop/Advanced)
    │
    ▼
Milestone 8 (DevSecOps/Prod)
```

> **Nota:** Milestone 7 pode ser desenvolvido em paralelo com Milestones 3–5, pois a `LlmPort` (interface) é definida no Milestone 3, e os adapters concretos são independentes.

---

## Leis Invioláveis (Aplicadas em Todos os Milestones)

1. **TDD Mandatório** — 🔴 RED → 🟢 GREEN → 🔵 REFACTOR em cada etapa
2. **Clean Architecture** — Domínio NUNCA importa infraestrutura
3. **Economia de Contexto** — RAG cirúrgico, zero inundação de tokens
4. **Anti-Preguiça** — Código emitido integralmente, sem omissões
5. **YAGNI + KISS** — Funções ≤ 15 linhas, Classes ≤ 200 linhas
