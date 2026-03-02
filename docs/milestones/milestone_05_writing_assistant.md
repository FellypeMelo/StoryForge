# ✍️ Milestone 5 — Assistente de Escrita E.P.R.L.

> **Fase:** Core Writing Engine  
> **Objetivo:** Implementar o motor de geração de prosa literária via Metodologia E.P.R.L. (CAD + Guardrails Negativos + RSIP), editor WYSIWYG reativo e enforcement do padrão Show/Don't Tell via MRU.  
> **Base Teórica:** [`05_writing_assistant.md`](../agents/05_writing_assistant.md)  
> **Compliance:** Lei 1 (TDD), Lei 3 (Economia de Contexto), Lei 5 (YAGNI)

---

## Pré-Condições

- [x] Milestones 1–4 completos
- [x] Beat sheets detalhados por capítulo disponíveis no Codex
- [x] Pipeline RAG (Milestone 2) funcional para injeção de contexto
- [x] LlmPort definida e implementada (Milestone 3)

---

## Etapa 5.1 — Domínio: Modelo de Geração de Prosa

### Tarefas (TDD)

- [ ] 🔴 RED: Teste para entidade `WritingRequest` (beat, character, pov, wordLimit)
- [ ] 🔴 RED: Teste para validação: wordLimit entre 500–800 (regra CAD)
- [ ] 🔴 RED: Teste para Value Object `PointOfView` (primeira, terceira limitada, terceira onisciente)
- [ ] 🔴 RED: Teste para entidade `ProseOutput` (draft, critique, finalVersion)
- [ ] 🟢 GREEN: Implementar entidades com validações
- [ ] 🔵 REFACTOR: Extrair `WordLimitPolicy` como política de domínio

### Critério de Aceite

```
Requisições de >800 palavras por beat são rejeitadas.
ProseOutput agrega 3 versões (rascunho, crítica, final).
```

---

## Etapa 5.2 — Domínio: Blacklist de AI-ismos

### Tarefas (TDD)

- [ ] 🔴 RED: Teste para `AiismBlacklist` com termos proibidos pré-carregados
- [ ] 🔴 RED: Teste para detecção de termos: "rica tapeçaria", "mosaico de emoções", "dança mortal"
- [ ] 🔴 RED: Teste para detecção de reações clichê: "apertou a mandíbula", "arrepio na espinha"
- [ ] 🔴 RED: Teste para detecção de advérbios em "-mente" acima do threshold
- [ ] 🟢 GREEN: Implementar `AiismDetector` como serviço de domínio
- [ ] 🔵 REFACTOR: Categorizar detecções (metáforas, frases, reações, conectores, resoluções)

### Categorias de Blacklist

| Categoria                    | Exemplos                                          |
| ---------------------------- | ------------------------------------------------- |
| Metáforas visuais grandiosas | "rica tapeçaria", "mosaico de emoções"            |
| Frases genéricas             | "silêncio ensurdecedor", "olhou para o horizonte" |
| Reações corporais            | "apertou a mandíbula", "olhos brilharam"          |
| Conectores artificiais       | "Não apenas... mas também"                        |
| Resoluções limpas            | Lições de moral, epifanias súbitas                |

### Critério de Aceite

```
Detector identifica AI-ismos por categoria.
Alertas são sugestivos (não bloqueantes).
Blacklist é extensível pelo autor.
```

---

## Etapa 5.3 — Caso de Uso: Pipeline E.P.R.L. (3 Pilares)

### Tarefas (TDD)

- [ ] 🔴 RED: Teste para Pilar 1 (CAD): gera prosa para um único beat com contexto injetado
- [ ] 🟢 GREEN: Implementar `GenerateProseUseCase`:
  - Input: WritingRequest + contexto RAG (do Codex)
  - Prompt com guardrails negativos injetados
  - Output: rascunho de 500–800 palavras
- [ ] 🔴 RED: Teste para Pilar 2 (Guardrails Negativos): prompt contém proibições explícitas
- [ ] 🟢 GREEN: Implementar injeção automática da blacklist no prompt
- [ ] 🔴 RED: Teste para Pilar 3 (RSIP): prosar gera 3 passos (rascunho → crítica → final)
- [ ] 🟢 GREEN: Implementar auto-revisão recursiva no mesmo prompt:
  ```
  Passo 1: Escreva o rascunho visceral.
  Passo 2: Critique apontando 2 instâncias de 'Tell' ou melodrama.
  Passo 3: Forneça a VERSÃO FINAL lapidada.
  ```
- [ ] 🔵 REFACTOR: Extrair cada pilar como step composável

### Critério de Aceite

```
Pipeline EPRL executa CAD → Guardrails → RSIP em sequência.
Prompt gerado contém proibições explícitas da blacklist.
Saída contém 3 versões distintas (draft, critique, final).
```

---

## Etapa 5.4 — Domínio: MRU (Motivation-Reaction Units)

### Tarefas (TDD)

- [ ] 🔴 RED: Teste para `MruValidator` — detecta nomeação direta de emoção ("sentiu raiva")
- [ ] 🔴 RED: Teste para validação da sequência: Estímulo → Reação Fisiológica → Reação Consciente
- [ ] 🟢 GREEN: Implementar detector de "Tell" (nomear emoções vs. encenar)
- [ ] 🔵 REFACTOR: Integrar MruValidator como pós-processador do pipeline EPRL

### Critério de Aceite

```
"Ela sentiu raiva quando viu a carta" → alerta de "Tell".
Detector sugere reescrita via MRU.
```

---

## Etapa 5.5 — Caso de Uso: Emotion Prompting

### Tarefas (TDD)

- [ ] 🔴 RED: Teste para `EmotionPromptEnhancer` — injeção de urgência emocional
- [ ] 🟢 GREEN: Implementar injeção contextual:
  ```
  "Este é o momento mais devastador da vida dela.
   Trate a prosa com reverência e peso literário visceral."
  ```
- [ ] 🔵 REFACTOR: Tornar intensidade configurável por beat

### Critério de Aceite

```
Beats marcados como "alta intensidade" recebem emotion prompting.
Configuração por beat, not global.
```

---

## Etapa 5.6 — UI: Editor WYSIWYG Reativo

### Tarefas

- [ ] Integrar editor TipTap como base do WYSIWYG
- [ ] Criar página `/write` com layout split: beat sheet (esquerda) + editor (direita)
- [ ] Implementar ação contextual: selecionar trecho → "Reescrever com EPRL"
- [ ] Implementar ação contextual: selecionar trecho → "Expandir"
- [ ] Implementar ação contextual: selecionar trecho → "Refinar"
- [ ] Exibir alertas de AI-ismos inline (highlight amarelo)
- [ ] Exibir alertas de MRU inline (highlight laranja)
- [ ] Painel lateral com o output de 3 passos RSIP (draft/critique/final)
- [ ] Salvar conteúdo do capítulo automaticamente (debounce)

### Critério de Aceite

```
Autor escreve/edita com ações contextuais de IA acessíveis via seleção.
Alertas visuais não-intrusivos para AI-ismos e violações MRU.
Beat sheet visível ao lado do editor para referência.
Auto-save funcional com debounce.
```

---

## Entregáveis do Milestone 5

| Artefato         | Descrição                                       |
| ---------------- | ----------------------------------------------- |
| Pipeline EPRL    | 3 pilares: CAD + Guardrails + RSIP              |
| AiismDetector    | Detecção por categoria com blacklist extensível |
| MruValidator     | Enforcement Show/Don't Tell via MRU             |
| EmotionPrompting | Injeção de urgência emocional por beat          |
| Editor TipTap    | WYSIWYG com ações contextuais de IA             |
| Alertas inline   | AI-ismos (amarelo) + MRU (laranja)              |
