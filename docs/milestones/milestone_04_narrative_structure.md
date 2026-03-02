# 🏛️ Milestone 4 — Estrutura Narrativa & Arquiteto de Capítulos

> **Fase:** Frameworks Narrativos  
> **Objetivo:** Implementar seleção de frameworks narrativos (6 frameworks), diagramação Story Grid, padrão Cena & Sequela e geração automatizada de Beat Sheets por capítulo.  
> **Base Teórica:** [`03_narrative_structure.md`](../agents/03_narrative_structure.md), [`04_chapter_architect.md`](../agents/04_chapter_architect.md)  
> **Compliance:** Lei 1 (TDD), Lei 2 (Clean Arch), Lei 5 (YAGNI)

---

## Pré-Condições

- [x] Milestones 1–3 completos
- [x] Premissa aprovada e personagens com fichas completas no Codex

---

## Etapa 4.1 — Domínio: Frameworks Narrativos

### Tarefas (TDD)

- [ ] 🔴 RED: Teste para enum/Value Object `NarrativeFramework` com 6 variantes
- [ ] 🔴 RED: Teste para entidade `StoryStructure` com beats obrigatórios por framework
- [ ] 🟢 GREEN: Implementar frameworks com estágios:
  - Jornada do Herói (12 estágios)
  - Save the Cat (15 beats)
  - Curva Fichteana (crises em sequência)
  - Estrutura de 7 Pontos (gancho → resolução)
  - Kishōtenketsu (4 atos)
  - Narrativa Non-linear (marcadores temporais)
- [ ] 🔵 REFACTOR: Padrão Strategy para resolução de beats por framework

### Critério de Aceite

```
Cada framework define seus beats obrigatórios.
StoryStructure incompleta (beats faltando) impede progressão.
Entidade pura no domain/.
```

---

## Etapa 4.2 — Domínio: Story Grid (Polaridade de Cena)

### Tarefas (TDD)

- [ ] 🔴 RED: Teste para `ScenePolarity` — validação de inversão obrigatória
- [ ] 🔴 RED: Teste que rejeita cena onde polaridade NÃO muda (início = fim)
- [ ] 🟢 GREEN: Implementar regra: toda cena inicia em [+] ou [-] e termina no oposto
- [ ] 🔵 REFACTOR: Extrair `StoryGridValidator` como serviço de domínio

### Critério de Aceite

```
Cena que começa triste e termina triste é rejeitada como "inútil".
Validação retorna mensagem específica de violação Story Grid.
```

---

## Etapa 4.3 — Domínio: Padrão Cena & Sequela (Dwight Swain)

### Tarefas (TDD)

- [ ] 🔴 RED: Teste para entidade `SceneBeat` (Goal, Conflict, Disaster)
- [ ] 🔴 RED: Teste para validação: Disaster tipo "sucesso absoluto" é rejeitado
- [ ] 🔴 RED: Teste para entidade `SequelBeat` (Reaction, Dilemma, Decision)
- [ ] 🔴 RED: Teste para validação: Dilemma deve ter "todas as opções ruins"
- [ ] 🔴 RED: Teste para entidade `Cliffhanger` (type: PrePoint | Climactic | PostPoint)
- [ ] 🟢 GREEN: Implementar beats com validações
- [ ] 🔵 REFACTOR: Criar aggregate `ChapterOutline` que encapsula 4+ beats

### Resultados Permitidos para Disaster

| Tipo                                      | Válido       |
| ----------------------------------------- | ------------ |
| "Não" (fracasso direto)                   | ✅           |
| "Não, e pior..." (fracasso + complicação) | ✅           |
| "Sim, mas..." (sucesso com custo grave)   | ✅           |
| Sucesso limpo                             | ❌ BLOQUEADO |

### Critério de Aceite

```
ChapterOutline com beats alternando Cena → Sequela.
Último beat obrigatoriamente termina com cliffhanger tipado.
Sem reflexões filosóficas reconfortantes ao final.
```

---

## Etapa 4.4 — Caso de Uso: Gerador de Beat Sheet por Capítulo

### Tarefas (TDD)

- [ ] 🔴 RED: Teste para `GenerateBeatSheetUseCase` — dado capítulo N + contexto, retorna ChapterOutline
- [ ] 🟢 GREEN: Implementar com prompt DRTD seguindo template de `04_chapter_architect.md`
- [ ] 🔴 RED: Teste para validação pós-geração (StoryGridValidator + Cena/Sequela)
- [ ] 🟢 GREEN: Implementar rejeição automática se violações detectadas
- [ ] 🔵 REFACTOR: Compor pipeline `ChapterPlanningPipeline`

### Prompt Esperado (Injetado)

```
"Aplique Cena e Sequela de Dwight Swain.
Formato: BEAT 1 (CENA): Objetivo/Conflito/Desastre
         BEAT 2 (SEQUELA): Reação/Dilema/Decisão
Transição Story Grid: De [+/-] Para [-/+]
Tipo de Cliffhanger: [Pre-point/Climactic/Post-point]
PROIBIDO gerar resoluções pacíficas ao final."
```

### Critério de Aceite

```
Beat sheet gerado com mínimo 4 beats por capítulo.
Validação Story Grid e Cena/Sequela aplicada automaticamente.
Resultado persiste no Codex da História.
```

---

## Etapa 4.5 — Caso de Uso: Detecção de Erros Estruturais

### Tarefas (TDD)

- [ ] 🔴 RED: Teste para detector de "Sagging Middle" (reflexões sem progressão no meio)
- [ ] 🔴 RED: Teste para detector de "Resolução Precoce" (conflito resolvido antes do Ato 3)
- [ ] 🔴 RED: Teste para detector de "Episodicidade" (eventos desconectados causalmente)
- [ ] 🟢 GREEN: Implementar `StructuralErrorDetector` com 3 regras
- [ ] 🔵 REFACTOR: Padrão Chain of Responsibility para extensibilidade

### Critério de Aceite

```
Detectores retornam alertas tipados com referência ao beat problemático.
Não são bloqueantes — são informativos.
```

---

## Etapa 4.6 — UI: Módulo de Estrutura & Capítulos

### Tarefas

- [ ] Criar página `/structure` com seletor de framework narrativo
- [ ] Visualização dos beats do framework escolhido como cards arrastáveis
- [ ] Formulário de preenchimento de cada estágio/beat do framework
- [ ] Criar página `/chapters` com listagem de capítulos planejados
- [ ] Visualização de beat sheet por capítulo com tipagem Cena/Sequela
- [ ] Indicador visual de polaridade Story Grid (cores +/-)
- [ ] Indicador de tipo de cliffhanger no último beat

### Critério de Aceite

```
Autor seleciona framework e preenche beats.
Beat sheets de capítulos exibem Cena/Sequela com cores.
Alertas de erros estruturais visíveis inline.
```

---

## Entregáveis do Milestone 4

| Artefato                | Descrição                                        |
| ----------------------- | ------------------------------------------------ |
| 6 Frameworks Narrativos | Strategy pattern com beats obrigatórios          |
| Story Grid Validator    | Validação de inversão de polaridade por cena     |
| Cena & Sequela          | Modelo Dwight Swain com 3 tipos de Disaster      |
| Cliffhanger tipado      | Pre-point, Climactic, Post-point                 |
| Beat Sheet Generator    | Use case com prompt DRTD + validação pós-geração |
| Detecção de erros       | Sagging Middle, Resolução Precoce, Episodicidade |
| UI Estrutura            | Seletor de framework + visualização de beats     |
| UI Capítulos            | Beat sheets com indicadores visuais              |
