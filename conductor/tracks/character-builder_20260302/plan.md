# Plan de Implementação: Construtor de Personagens Profundos

**Track ID:** character-builder_20260302
**Spec:** [spec.md](./spec.md)
**Milestone de Referência:** [Milestone 3 — Etapas 3.3, 3.4 e 3.6](../../docs/milestones/milestone_03_ideation_characters.md)
**Status:** [ ] Em Progresso (Refinado via AI-XP)

---

## 📜 Regras de Execução (Compliance @GEMINI.md)

1. **TDD Obrigatório:** Nenhuma linha de código de produção sem um teste falhando (Fase RED).
2. **Clean Architecture:** Entidades de domínio em `src/domain` puras, sem dependências de infraestrutura.
3. **DRTD Prompting:** Geração via LLM usando o framework Contexto + Role + Knowledge + Output.
4. **SOLID Estrito:** Classes focadas em uma única responsabilidade.

---

## 🏗️ Fase 1: Domínio - Ficha de Personagem Completa (Etapa 3.3)

**Objetivo:** Transformar a entidade básica em um Aggregate Root robusto com perfis psicológicos e narrativos.

### Tarefas
- [x] **Task 1.1: Perfil OCEAN (TDD)** [55d2e43]
    - 🔴 RED: Testar `OceanProfile` com 5 traços e scores semânticos (Baixo/Médio/Alto).
    - 🔴 RED: Validar combinação que gera "defeito fatal".
    - 🟢 GREEN: Implementar entidade.
- [x] **Task 1.2: Arco de Hauge (TDD)** [f836631]
    - 🔴 RED: Testar `HaugeArc` (Wound, Belief, Fear, Identity, Essence).
    - 🔴 RED: Validar regra: `Identity` e `Essence` devem estar em oposição direta.
    - 🟢 GREEN: Implementar entidade.
- [x] **Task 1.3: Perfil de Voz e Tells (TDD)** [a8a56a2]
    - 🔴 RED: Testar `VoiceProfile` (sentenceLength, formality, verbalTics, evasionMechanism).
    - 🔴 RED: Testar `PhysicalTells` (lista obrigatória de 3 comportamentos).
    - 🟢 GREEN: Implementar entidades.
- [ ] **Task 1.4: CharacterSheet Aggregate Root (TDD)**

  - 🔴 RED: Testar agregação dos 4 componentes.
  - 🔴 RED: Validar método `isComplete()` (CharacterSheet sem Hauge é sinalizada como rascunho).
  - 🟢 GREEN: Implementar Aggregate Root.
  - 🔵 REFACTOR: Garantir que cada trait OCEAN impacte métodos de decisão do domínio.

---

## 🧠 Fase 2: Casos de Uso - Gerador de Personagens (Etapa 3.4)

**Objetivo:** Orquestrar a geração inteligente via LLM com guardrails de qualidade literária.

### Tarefas

- [ ] **Task 2.1: GenerateCharacterUseCase (TDD)**
  - 🔴 RED: Testar fluxo: Premissa + Role -> LLM -> `CharacterSheet`.
  - 🟢 GREEN: Implementar use case com prompt DRTD (C+R+K+O) via `LlmPort`.
- [ ] **Task 2.2: Guardrail de Anti-Patterns (TDD)**
  - 🔴 RED: Testar regra: Personagem "terapeuta perfeito" ou "Mary Sue" deve ser rejeitado/alertado.
  - 🔴 RED: Detectar vozes genéricas ou otimismo artificial.
  - 🟢 GREEN: Implementar `CharacterValidator` como Domain Service.
- [ ] **Task 2.3: Persistência no Codex**
  - 🟢 GREEN: Integrar com `CharacterRepository` para salvar fichas completas.

---

## 🎨 Fase 3: UI - Módulo de Personagens (Etapa 3.6)

**Objetivo:** Interface rica para visualização e edição da complexidade do personagem.

### Tarefas

- [ ] **Task 3.1: Expansão do CharacterWizard**
  - [ ] Adicionar seção para Arco de Hauge (Ferida, Crença, Medo).
  - [ ] Adicionar controles para Voz e Dicção.
  - [ ] Implementar listagem visual de Physical Tells.
- [ ] **Task 3.2: Feedback de Completude**
  - [ ] Implementar indicador visual (barra de progresso ou badge) baseado no `isComplete()` da entidade.
- [ ] **Task 3.3: Visualização da Ficha Completa**
  - [ ] Dashboard do personagem integrando OCEAN Radar + Resumo Narrativo.

---

## ✅ Verificação Final

- [ ] Todos os testes unitários e de integração passando (`npm test`).
- [ ] Validação de Clean Architecture (Domínio não importa Infra).
- [ ] Carregamento e salvamento de rascunhos no `localStorage` via Wizard.
- [ ] App compila sem erros de TypeScript.
