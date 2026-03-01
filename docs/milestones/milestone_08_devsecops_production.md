# 🛡️ Milestone 8 — DevSecOps, CI/CD & Production Polish

> **Fase:** Produção & Entrega  
> **Objetivo:** Implementar pipeline CI/CD com SAST self-healing, sandboxing ativo, packaging multiplataforma, e polimento final de UX/performance para release 1.0.  
> **Base Teórica:** [`07_tdd_agentic.md`](../engineering/07_tdd_agentic.md), [`08_devsecops.md`](../engineering/08_devsecops.md), [`04_anti_patterns.md`](../engineering/04_anti_patterns.md)  
> **Compliance:** Todas as 5 Leis Invioláveis + Checklist Pré-Merge completa

---

## Pré-Condições

- [x] Milestones 1–7 completos
- [x] Todos os agentes criativos operacionais
- [x] Multi-provedor GenAI integrado
- [x] Suíte de testes com cobertura substancial

---

## Etapa 8.1 — Pipeline CI/CD: GitHub Actions

### Tarefas

- [ ] Criar workflow `.github/workflows/ci.yml`:
  - Trigger: push + pull_request em `main` e `develop`
  - Job 1: Lint (ESLint + Clippy com `deny(warnings)`)
  - Job 2: Testes Frontend (`vitest run --coverage`)
  - Job 3: Testes Backend (`cargo test`)
  - Job 4: Build Tauri (verifica compilação sem erros)
- [ ] Configurar matrix para múltiplos OS: Windows, macOS, Linux
- [ ] Configurar cache de dependências (node_modules, cargo registry)
- [ ] Bloquear merge se qualquer job falha

### Critério de Aceite

```
CI roda em <10 min para PR normal.
Merge bloqueado automaticamente se CI falha.
Matrix cobre Windows + macOS + Linux.
```

---

## Etapa 8.2 — SAST: Análise Estática de Segurança

### Tarefas (TDD)

- [ ] Integrar SonarQube/SonarCloud no pipeline CI
- [ ] Configurar regras de Quality Gate:
  - Zero bugs críticos
  - Zero vulnerabilidades de segurança
  - Cobertura de testes ≥ 70%
  - Duplicação ≤ 3%
- [ ] 🔴 RED: Teste que verifica ausência de hardcoded secrets no codebase
- [ ] 🟢 GREEN: Implementar scan de secrets via regex patterns
- [ ] Configurar `dependency-cruiser` ou equivalente Rust:
  - `domain/` não importa de `infrastructure/`
  - `infrastructure/` não importa de `ui/`
- [ ] Bloquear PR se boundary violation detectada

### Critério de Aceite

```
Quality Gate do SonarQube passa para merge.
Zero secrets hardcoded no repositório.
Boundary violations de Clean Architecture bloqueiam PR.
```

---

## Etapa 8.3 — Pipeline Self-Healing (Remediação Agêntica)

### Tarefas

- [ ] Implementar hook de pré-commit que roda linters automaticamente
- [ ] Implementar fix automático para issues de formatação (prettier + rustfmt)
- [ ] Criar workflow de auto-fix para dependências vulneráveis:
  ```
  Detecção (Dependabot/Renovate) → PR Automático → CI → Auto-merge se verde
  ```
- [ ] Implementar alerta Slack/Discord se CI quebra em `main`

### Critério de Aceite

```
Issues de formatação corrigidos automaticamente no commit.
Dependências vulneráveis geram PRs automáticos.
Quebra em main gera alerta imediato.
```

---

## Etapa 8.4 — Sandboxing & Segurança de Runtime

### Tarefas

- [ ] Auditar permissões Tauri (`tauri.conf.json`):
  - Permitir apenas: filesystem (app_data_dir), shell (nenhum), HTTP (provedores LLM)
  - Negar: clipboard, notification (a menos que explicitamente necessário)
- [ ] Implementar CSP (Content Security Policy) headers no WebView
- [ ] Parametrizar TODAS as queries SQL (anti SQL Injection — revisão completa)
- [ ] Escapar outputs HTML no editor (anti XSS)
- [ ] API keys: validar que NUNCA transitam para o frontend

### Critério de Aceite

```
Permissões Tauri mínimas (Least Privilege).
Zero SQL queries com concatenação de strings.
CSP headers configurados no WebView.
```

---

## Etapa 8.5 — Métricas de Qualidade & Fitness Functions

### Tarefas

- [ ] Implementar Fitness Function para complexidade ciclomática (máx. 15)
- [ ] Implementar Fitness Function para nesting depth (máx. 2)
- [ ] Implementar Fitness Function para tamanho de função (máx. 15 linhas)
- [ ] Implementar Fitness Function para tamanho de classe/módulo (máx. 200 linhas)
- [ ] Integrar todas as fitness functions no CI (falha = merge bloqueado)

### Critério de Aceite

```
Qualquer função com ciclomática > 15 bloqueia merge.
Qualquer função com nesting > 2 gera warning.
Métricas reportadas no PR como comentário automático.
```

---

## Etapa 8.6 — Packaging & Distribuição Multiplataforma

### Tarefas

- [ ] Configurar `tauri build` para produção:
  - Windows: `.msi` + `.exe` (NSIS installer)
  - macOS: `.dmg` + `.app` bundle
  - Linux: `.AppImage` + `.deb`
- [ ] Configurar code signing (se certificados disponíveis)
- [ ] Configurar auto-updater do Tauri (verificação de novas versões)
- [ ] Criar release workflow no GitHub Actions:
  ```
  Tag v*.*.* → Build matrix → Upload artefatos → GitHub Release
  ```
- [ ] Otimizar tamanho do bundle (tree-shaking, minificação)

### Critério de Aceite

```
Builds produzidos para Windows, macOS e Linux.
Instalador funcional em cada plataforma.
Auto-updater verifica novas versões no startup.
```

---

## Etapa 8.7 — Performance & UX Polish

### Tarefas

- [ ] Profiling de startup time (target: <3s para janela visível)
- [ ] Profiling de operações SQLite (target: <100ms para queries comuns)
- [ ] Lazy loading de módulos pesados (editor TipTap, provedores GenAI)
- [ ] Implementar skeleton loaders para estados de carregamento
- [ ] Implementar toasts/notificações para ações assíncronas (geração, auditoria)
- [ ] Revisar responsividade em diferentes resoluções
- [ ] Revisar contraste e legibilidade do tema escuro (WCAG AA)
- [ ] Implementar atalhos de teclado para ações frequentes

### Critério de Aceite

```
Startup < 3s. Queries SQLite < 100ms.
UI responsiva sem layout breaks.
Atalhos documentados e funcionais.
```

---

## Etapa 8.8 — Documentação Final & Onboarding

### Tarefas

- [ ] Atualizar README.md com instruções de instalação completas
- [ ] Documentar setup de desenvolvimento (pré-requisitos, clone, build)
- [ ] Documentar configuração de provedores GenAI
- [ ] Criar guia de "Primeiro Projeto" (tutorial passo-a-passo)
- [ ] Documentar API de Tauri commands (para extensibilidade futura)
- [ ] Gerar CHANGELOG.md automatizado a partir de commits convencionais

### Critério de Aceite

```
Novo desenvolvedor consegue rodar o projeto em <15 min seguindo o README.
Novo autor consegue criar primeiro projeto seguindo o guia.
```

---

## Entregáveis do Milestone 8

| Artefato          | Descrição                                          |
| ----------------- | -------------------------------------------------- |
| CI/CD Pipeline    | GitHub Actions com lint, test, build, matrix OS    |
| SAST              | SonarQube + boundary validation + secret scanning  |
| Self-Healing      | Auto-fix, Dependabot, alertas                      |
| Sandboxing        | Tauri permissions mínimas, CSP, SQL parameterizado |
| Fitness Functions | Ciclomática, nesting, tamanho de função/classe     |
| Packaging         | Instaladores Windows/macOS/Linux + auto-updater    |
| Performance       | Startup <3s, queries <100ms, lazy loading          |
| Documentação      | README, Dev Setup, User Guide, CHANGELOG           |

---

## Checklist Pré-Release 1.0 (GEMINI.md Completa)

- [ ] A implementação degenera exponencialmente com dados inesperados?
- [ ] O código contorna proteções de tipos fortes?
- [ ] Circuit Breakers e Timeouts implementados na camada de transporte?
- [ ] Testes cobrem condições de corrida e exceções?
- [ ] Complexidade ciclomática ≤ 15 por função?
- [ ] Nesting Depth ≤ 2?
- [ ] Value Objects usados para IDs?
- [ ] Nenhuma dependência externa sem aprovação?
- [ ] Audit Trail gerado para compliance?
- [ ] Zero secrets hardcoded?
- [ ] Zero SQL injection vectors?
- [ ] Zero XSS vectors?
