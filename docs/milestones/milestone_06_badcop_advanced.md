# 🚨 Milestone 6 — Bad Cop Editor & Técnicas Avançadas

> **Fase:** Auditoria & Profundidade  
> **Objetivo:** Implementar o editor "Bad Cop" (auditoria developmental rigorosa com detectores heurísticos), técnicas avançadas de narrativa (simbolismo, narradores não-confiáveis), e o pipeline Multi-Perspectiva (MPS).  
> **Base Teórica:** [`07_bad_cop_editor.md`](../agents/07_bad_cop_editor.md), [`08_advanced_techniques.md`](../agents/08_advanced_techniques.md)  
> **Compliance:** Lei 1 (TDD), Lei 5 (YAGNI)

---

## Pré-Condições

- [x] Milestones 1–5 completos
- [x] Editor WYSIWYG funcional com pipeline EPRL
- [x] AiismDetector implementado (Milestone 5)

---

## Etapa 6.1 — Caso de Uso: Auditoria Bad Cop (4 Eixos)

### Tarefas (TDD)

- [ ] 🔴 RED: Teste para `CausationAudit` — detecta eventos sem relação causa-efeito
- [ ] 🟢 GREEN: Implementar eixo 1: Mecânica de Causação
- [ ] 🔴 RED: Teste para `AgencyAudit` — detecta protagonista passivo (sem Sequela)
- [ ] 🟢 GREEN: Implementar eixo 2: Profundidade Psicológica e Agência
- [ ] 🔴 RED: Teste para `ShowDontTellAudit` — detecta info-dumping e emoções rotuladas
- [ ] 🟢 GREEN: Implementar eixo 3: Auditoria Show/Don't Tell
- [ ] 🔴 RED: Teste para `AntiPatternAudit` — detecta IA-ismos e tropos
- [ ] 🟢 GREEN: Implementar eixo 4: Detector de Anti-Patterns
- [ ] 🔵 REFACTOR: Compor `BadCopPipeline` que executa os 4 eixos e gera relatório

### Anti-Patterns Detectados

| Anti-Pattern | Causa Algorítmica | Sintoma |
|---|---|---|
| Escrita Genérica / Purple Prose | Modelo prediz palavra mais provável | Clichês descritivos |
| Diálogo de RH | RLHF treina IA para ser "útil e inofensiva" | Personagens como terapeutas |
| Reações Físicas Clichê | Marcadores físicos limitados | "Apertou a mandíbula" |
| Estrutura Repetitiva | Padrão sintático uniforme | Parágrafos iniciam igual |
| Resolução Precoce | IA treinada para "resolver" | Traumas curados instantaneamente |

### Critério de Aceite

```
Pipeline Bad Cop executa 4 eixos e gera relatório numerado.
Relatório inclui "Plano de Ação" com os 3 problemas macro.
Não é bloqueante — é informativo para o autor.
```

---

## Etapa 6.2 — Detectores Heurísticos (Background)

### Tarefas (TDD)

- [ ] 🔴 RED: Teste para `BlacklistWordDetector` — busca termos da lista de AI-ismos
- [ ] 🟢 GREEN: Implementar detector com scan por regex
- [ ] 🔴 RED: Teste para `RepetitionDetector` — análise de início de parágrafos
- [ ] 🟢 GREEN: Implementar detector de padrões sintáticos repetitivos
- [ ] 🔴 RED: Teste para `AdverbDensityDetector` — contagem de "-mente" por parágrafo
- [ ] 🟢 GREEN: Implementar com threshold configurável
- [ ] 🔵 REFACTOR: Interface `HeuristicDetector` para extensibilidade (OCP)

### Critério de Aceite

```
Detectores rodam em background sem bloquear a escrita.
Alertas categorizados: amarelo (baixo), laranja (médio).
Cada detector implementa interface comum (strategy + observer).
```

---

## Etapa 6.3 — Técnicas Avançadas: Motif Engineering (Simbolismo)

### Tarefas (TDD)

- [ ] 🔴 RED: Teste para `MotifDefinition` (object, associatedWound, frequency curve)
- [ ] 🟢 GREEN: Implementar entidade de motif vinculada à Ferida (Hauge) do personagem
- [ ] 🔴 RED: Teste para `MotifInjector` — insere motif no prompt de forma periférica
- [ ] 🟢 GREEN: Implementar regras:
  1. Símbolo nunca explicado diretamente
  2. Aparece na periferia do ambiente
  3. Frequência aumenta conforme proximidade ao confronto
- [ ] 🔵 REFACTOR: Integrar com o pipeline EPRL como pré-processador

### Critério de Aceite

```
Motifs definidos na Bíblia da História.
Injection automática nos prompts de escrita relevantes.
Frequência escalona conforme progressão narrativa.
```

---

## Etapa 6.4 — Técnicas Avançadas: Narradores Não-Confiáveis

### Tarefas (TDD)

- [ ] 🔴 RED: Teste para `UnreliableNarratorConfig` (highNeuroticism, dissonance, selfPerception)
- [ ] 🟢 GREEN: Implementar configuração que instrui divergência ação ↔ narração
- [ ] 🔴 RED: Teste para prompt que gera contraste entre ações cruéis e pensamentos nobres
- [ ] 🟢 GREEN: Implementar `UnreliableNarratorPromptEnhancer`

### Regras

1. Narrador nunca reconhece que mente/distorce.
2. Pistas para o leitor vêm da ação, não da narração.
3. Contraste causa desconforto crescente.

### Critério de Aceite

```
Configuração ativável por personagem (flag na CharacterSheet).
Prompt enhancement injetado no pipeline EPRL quando ativo.
```

---

## Etapa 6.5 — Técnicas Avançadas: Multi-Perspectiva (MPS)

### Tarefas (TDD)

- [ ] 🔴 RED: Teste para `MultiPerspectiveUseCase` — dado trecho, gera 3 variações
- [ ] 🟢 GREEN: Implementar geração de:
  - A) Tom cínico e seco
  - B) Foco sensorial (sons, cheiros, texturas)
  - C) Poético e cadenciado
- [ ] 🔵 REFACTOR: Variações configuráveis pelo autor

### Critério de Aceite

```
3 variações estilísticas produzidas para qualquer trecho selecionado.
Autor atua como editor fundindo as melhores frases ("Frankenstein").
```

---

## Etapa 6.6 — UI: Painel de Auditoria & Técnicas

### Tarefas

- [ ] Criar painel `/audit` com relatório Bad Cop por capítulo
- [ ] Relatório com 4 seções (Causação, Agência, Show/Tell, Anti-Patterns)
- [ ] "Plano de Ação" com os 3 problemas macro destacados
- [ ] Indicadores de detectores heurísticos no editor (background)
- [ ] Menu de técnicas avançadas: Motif, Narrador Não-Confiável, MPS
- [ ] Interface de comparação lado-a-lado para MPS (3 variações)

### Critério de Aceite

```
Relatório Bad Cop acessível por capítulo com problemas numerados.
Técnicas avançadas ativáveis por contexto no editor.
Comparação MPS funcional com fusão manual.
```

---

## Entregáveis do Milestone 6

| Artefato | Descrição |
|----------|-----------|
| Bad Cop Pipeline | 4 eixos de auditoria + Plano de Ação |
| Detectores Heurísticos | Blacklist, Repetição, Advérbios (background) |
| Motif Engineering | Simbolismo vinculado a Ferida + frequência escalante |
| Narrador Não-Confiável | Prompt enhancement para dissonância ação/narração |
| MPS (Multi-Perspectiva) | 3 variações estilísticas + fusão Frankenstein |
| UI Auditoria | Relatório + indicadores inline + comparação MPS |
