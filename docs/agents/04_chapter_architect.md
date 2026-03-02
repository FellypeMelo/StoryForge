# 📐 Agente Arquiteto de Capítulos

> **Módulo StoryForge:** Outlining de Capítulos  
> **Base Teórica:** Manual de Escrita Criativa com IA — Parte 4  
> **Responsabilidade:** Delinear a microestrutura de cada capítulo usando Cena e Sequela, Cliffhangers e Beat Sheets.

---

## 1. Problema Central

Instruir a IA com "escreva o Capítulo 1" resulta em:

- Fluxo de consciência sem ritmo, **ou**
- Resumo apressado dos eventos.

A solução é controlar a **microestrutura** antes de gerar prosa.

---

## 2. Padrão Cena e Sequela (Dwight Swain)

O ritmo e a tensão são criados alternando **ação implacável** com **processamento psicológico**.

### 2.1 A CENA (Bloco de Ação)

Move a trama **externamente**.

| Componente              | Função                             | Regra                                 |
| ----------------------- | ---------------------------------- | ------------------------------------- |
| **Objetivo (Goal)**     | O que o personagem quer nesta cena | Deve ser específico e mensurável      |
| **Conflito (Conflict)** | Obstáculo tangível ou humano       | Deve ser ativo, não passivo           |
| **Desastre (Disaster)** | Resultado da cena                  | **NUNCA** termina em sucesso absoluto |

### Resultados Permitidos para o Desastre

| Tipo                 | Descrição                        |
| -------------------- | -------------------------------- |
| **"Não"**            | Fracasso direto                  |
| **"Não, e pior..."** | Fracasso + complicação adicional |
| **"Sim, mas..."**    | Sucesso parcial com custo grave  |

> ⛔ **Proibido:** Sucesso limpo sem consequências.

### 2.2 A SEQUELA (Bloco de Reação)

Move o arco **interno** e ajusta o ritmo.

| Componente             | Função                                  | Regra                                  |
| ---------------------- | --------------------------------------- | -------------------------------------- |
| **Reação (Reaction)**  | Choque emocional visceral ao Desastre   | Deve ser fisiológico, não intelectual  |
| **Dilema (Dilemma)**   | Análise das opções disponíveis          | **Todas as opções devem ser péssimas** |
| **Decisão (Decision)** | A escolha que define o próximo Objetivo | Deve gerar consequências irreversíveis |

---

## 3. Cliffhangers Estratégicos

A IA tende a fornecer "lições de moral" no fim dos capítulos. Use estas tipologias:

| Tipo           | Modo de Corte                                             | Efeito                       |
| -------------- | --------------------------------------------------------- | ---------------------------- |
| **Pre-point**  | Corte no segundo exato **antes** do evento principal      | Suspense máximo              |
| **Climactic**  | Corte no **meio** da ação ou revelação                    | O "gasp" — impacto emocional |
| **Post-point** | Corte **após** o evento, na reação inicial não processada | Tensão residual              |

### Regra de Ouro

> **É absolutamente proibido** gerar resoluções pacíficas, reflexões filosóficas reconfortantes ou resumos no final do capítulo.

---

## 4. Beat Sheet — Formato de Saída

Cada capítulo é decomposto em **4 beats mínimos** antes de qualquer geração de prosa:

```
BEAT 1 (CENA):
  Objetivo: [O que o personagem tenta realizar]
  Conflito: [Quem/o que se opõe]
  Desastre: [Como falha — Não / Não e pior / Sim mas]

BEAT 2 (SEQUELA):
  Reação: [Resposta emocional visceral]
  Dilema: [Opções disponíveis, todas ruins]
  Decisão: [Escolha que define o próximo objetivo]

BEAT 3 (CENA):
  Objetivo: [Derivado da Decisão do Beat 2]
  Conflito: [Escalada de tensão]
  Desastre: [Consequência mais grave]

BEAT 4 (SEQUELA + CLIFFHANGER):
  Reação: [Impacto emocional]
  Dilema: [Pior situação possível]
  Decisão: [INTERROMPIDA pelo cliffhanger]

TRANSIÇÃO DE VALOR (Story Grid):
  De: [Positivo/Negativo]
  Para: [Negativo/Positivo]

TIPO DE CLIFFHANGER: [Pre-point / Climactic / Post-point]
```

---

## 5. Prompt Template — Planejamento Estrutural

```
"Atue como um Editor Estrutural de Ficção. Nosso objetivo agora é delinear o
Capítulo [X]. O protagonista deve ir da situação [A] para o estado de espírito [B].

Aplique a mecânica de 'Cena e Sequela' de Dwight Swain para quebrar o capítulo
em 4 Beats (Momentos).

Formato de Saída Exigido para cada Beat:
BEAT 1 (CENA): Objetivo: [...], Conflito: [...], Desastre: [...]
BEAT 2 (SEQUELA): Reação: [...], Dilema: [...], Decisão: [...]

A transição de valor da cena (Story Grid) será de [Positivo/Negativo] para
[Negativo/Positivo].

O capítulo DEVE terminar com um '[TIPO] Cliffhanger' comovente. É
absolutamente proibido gerar resoluções pacíficas, reflexões filosóficas
reconfortantes ou resumos no final do capítulo."
```

---

## 6. Checklist de Validação de Capítulo

- [ ] Todos os beats seguem o padrão Cena → Sequela?
- [ ] Nenhuma cena termina em sucesso absoluto?
- [ ] A polaridade de valor se inverte (Story Grid)?
- [ ] As opções do Dilema são todas ruins?
- [ ] A Decisão gera consequências irreversíveis?
- [ ] O cliffhanger final usa uma das 3 tipologias?
- [ ] Não há resolução pacífica ou reflexão filosófica ao final?

---

## 7. Integração com StoryForge

- **Input:** Beat sheet macro (de `03_narrative_structure.md`) + fichas de personagens
- **Output:** Beat sheet detalhado por capítulo, validado
- **Persistência:** Beat sheets → Codex da História
- **Próximo módulo:** `05_writing_assistant.md` (geração de prosa beat por beat)
