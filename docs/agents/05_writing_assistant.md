# ✍️ Agente de Escrita Assistida (Metodologia E.P.R.L.)

> **Módulo StoryForge:** Escrita Assistida  
> **Base Teórica:** Manual de Escrita Criativa com IA — Parte 5  
> **Responsabilidade:** Gerar prosa de qualidade literária usando decomposição, guardrails negativos e auto-refinamento recursivo.

---

## 1. Problema Central

LLMs são treinados para **contar** (resumir informações), não para **mostrar** (dramatizar). Sem restrições, produzem adjetivos excessivos (purple prose), suspiros, frases como "um misto de emoções tomou conta dele", e resolução limpa.

---

## 2. Metodologia E.P.R.L. (Engenharia de Prompt Recursiva Literária)

### 2.1 Pilar 1 — CAD (Context-Aware Decomposition)

**Regra:** Nunca peça mais de **600–800 palavras** por geração.

- O modelo recebe o **contexto global** (premissa, ficha do personagem, beat sheet).
- Mas resolve **localmente** — beat por beat.
- Cada geração foca em **um único beat** do capítulo.

### 2.2 Pilar 2 — Diretrizes Negativas Extremas (Guardrails)

A IA **obedece melhor ao que NÃO deve fazer**. Toda requisição de escrita deve conter:

**Proibições obrigatórias:**

- ❌ Nomear emoções diretamente ("sentiu raiva", "estava triste")
- ❌ Usar palavras da blacklist: "tapeçaria", "mosaico", "silêncio sepulcral", "olhou para o horizonte", "dança mortal"
- ❌ Reações físicas clichê: "apertou a mandíbula", "liberou uma respiração que não sabia que segurava", "arrepio desceu pela espinha"
- ❌ Resoluções emocionais limpas ou reflexões filosóficas ao final
- ❌ Advérbios em "-mente" em excesso
- ❌ Estrutura sintática repetitiva entre parágrafos

### 2.3 Pilar 3 — RSIP (Recursive Self-Improvement Prompting)

Força o LLM a **gerar, criticar e refinar** na mesma saída:

```
Passo 1: Escreva o rascunho visceral.
Passo 2: Assuma a persona de um editor literário implacável.
         Critique o seu próprio texto apontando 2 instâncias onde
         você 'contou' em vez de 'mostrar' ou soou melodramático.
Passo 3: Forneça a VERSÃO FINAL lapidada corrigindo essas falhas.
```

---

## 3. Show, Don't Tell — Enforcement via MRUs

**MRU = Motivation-Reaction Unit** — a sequência orgânica de resposta humana:

```
1º Estímulo Externo (som / visão)
    ↓
2º Reação Fisiológica (visceral, involuntária)
    ↓
3º Reação Consciente (fala ou ação)
```

### Regra

> A IA é **proibida** de nomear a emoção. Deve processar: estímulo → corpo → ação.

**Exemplo ruim:** "Ela sentiu raiva quando viu a carta."  
**Exemplo correto:** "A tinta azul da carta borrou sob seus dedos. Algo quente subiu pelo esôfago. Ela dobrou a folha uma vez, duas, até que o vinco rasgou o papel ao meio."

---

## 4. Emotion Prompting

Injetar urgência emocional no comando para elevar a qualidade da prosa:

> "Este é o momento mais devastador da vida dela. Trate a prosa com reverência e peso literário visceral."

Essa técnica ativa regiões mais densas do espaço latente associadas a escrita literária profunda.

---

## 5. Blacklist de AI-ismos (Palavras Proibidas)

| Categoria                        | Exemplos Proibidos                                             |
| -------------------------------- | -------------------------------------------------------------- |
| **Metáforas visuais grandiosas** | "rica tapeçaria", "mosaico de emoções", "dança mortal"         |
| **Frases genéricas**             | "um silêncio ensurdecedor", "olhou para o horizonte"           |
| **Reações corporais**            | "apertou a mandíbula", "arrepio na espinha", "olhos brilharam" |
| **Conectores artificiais**       | "Não apenas... mas também", perguntas retóricas em série       |
| **Resoluções limpas**            | Lições de moral, reflexões reconfortantes, epifanias súbitas   |

---

## 6. Prompt Template — Escrita E.P.R.L.

```
"Contexto: [PERSONAGEM] ([scores OCEAN relevantes]) está em [SITUAÇÃO].
Resumo do beat: [BEAT do capítulo sendo escrito].

Tarefa: Escreva as próximas 500 palavras. Perspectiva: [POV].

1. 'Show, Don't Tell' Radical: É proibido usar palavras que nomeiem emoções.
   Expresse a tensão através do foco do personagem em detalhes do ambiente
   e reações fisiológicas autênticas (MRU).

2. Ritmo de Frases: [Regra específica — ex: frases curtas para pânico,
   longas para introspecção].

3. Sem Clichês (AI-ismos): Não use as palavras: [LISTA DA BLACKLIST].

Passo 1: Escreva o rascunho visceral.
Passo 2: Assuma a persona de um editor literário implacável. Critique
         apontando 2 instâncias de 'Tell' ou melodrama.
Passo 3: Forneça a VERSÃO FINAL lapidada."
```

---

## 7. Prompts Auxiliares

### Intensificação de Subtexto

```
"Reescreva a cena abaixo adicionando camadas de subtexto. Os personagens
estão discutindo [ASSUNTO SUPERFICIAL], mas o conflito subjacente é
[CONFLITO REAL]. O conflito real nunca pode ser mencionado diretamente.
Transmita a tensão na forma como os personagens manipulam objetos físicos
e interrompem as falas um do outro."
```

### Variação Multi-Perspectiva (MPS)

```
"Gere 3 variações deste trecho:
A) Tom cínico e seco.
B) Foco sensorial no cenário (sons, cheiros, texturas).
C) Poético e cadenciado.
Eu atuarei como editor, fundindo as melhores frases."
```

---

## 8. Integração com StoryForge

- **Input:** Beat sheet detalhado (de `04_chapter_architect.md`) + ficha do personagem + Bíblia
- **Output:** Prosa de 500–800 palavras por beat, em 3 passos (rascunho → crítica → final)
- **Editor:** TipTap WYSIWYG com acionamento contextual (selecionar trecho → reescrever/expandir/refinar)
- **Modo revisão:** Comentários/sugestões da IA inline
- **Próximo módulo:** `06_story_bible.md` (alimentação contínua) e `07_bad_cop_editor.md` (auditoria)
