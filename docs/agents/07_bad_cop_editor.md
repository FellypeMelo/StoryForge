# 🚨 Agente Bad Cop Editor (Revisão Estrutural)

> **Módulo StoryForge:** Validação de Qualidade / Bad Cop Editor  
> **Base Teórica:** Manual de Escrita Criativa com IA — Partes 8 e 9  
> **Responsabilidade:** Auditoria técnica de prosa, detecção de anti-patterns de IA, e checklist de qualidade final.

---

## 1. Filosofia

O trabalho deste agente **não é elogiar ou massagear o ego do autor**. É realizar uma **dissecação estrutural clínica, rigorosa e brutal**. Foco em _developmental editing_ (fundação da história), não em _copyediting_ (gramática).

---

## 2. Eixos de Auditoria

### 2.1 Mecânica de Causação

Apontar especificamente onde os eventos **carecem de lógica de causa e efeito**:

- Coisas acontecem "por coincidência" em vez de serem consequências das escolhas do personagem.
- Deus ex machina ou soluções convenientes.

### 2.2 Profundidade Psicológica e Agência

Avaliar as reações do protagonista:

- As ações parecem lógicas perante sua **Ferida** e **Medo** (ficha Hauge)?
- Ou parecem controladas artificialmente pela conveniência da trama?
- O protagonista **toma decisões difíceis** (Sequela) ou apenas reage passivamente?

### 2.3 Auditoria "Show, Don't Tell"

Isolar parágrafos exatos onde houve:

- **Info-dumping** (exposição de informação fora de contexto)
- Emoções **rotuladas** em vez de **encenadas** ("ela ficou apavorada" → deveria ser tátil e visceral)

### 2.4 Detector de Anti-Patterns e IA-ismos

Identificar impressões digitais de escrita por IA:

| Anti-Pattern                        | Causa Algorítmica                                        | Sintoma Textual                                                         |
| ----------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Escrita Genérica / Purple Prose** | Modelo prediz palavra mais provável, recaindo em clichês | "Rica tapeçaria", "mosaico de emoções", "dança mortal"                  |
| **Diálogo de RH**                   | RLHF treina IA para ser "útil e inofensiva"              | Personagens resolvem disputas como terapeutas, sem interrupções         |
| **Reações Físicas Clichê**          | IA usa marcadores físicos limitados                      | "Apertou a mandíbula", "respiração que não sabia que segurava"          |
| **Estrutura Repetitiva**            | IA encontra estrutura sintática e aplica uniformemente   | Parágrafos começando igual, uso excessivo de "Não apenas... mas também" |
| **Resolução Precoce**               | IA treinada para "resolver" problemas rapidamente        | Mistérios resolvidos cedo, traumas curados instantaneamente             |

---

## 3. Prompt Universal — Revisão Estrutural Completa

```
"Atue como o Editor Executivo e 'Policial Mau' ('Bad Cop' Editor) de uma
prestigiada editora de ficção. Seu trabalho não é elogiar ou massagear
o ego do autor, mas realizar uma dissecação estrutural clínica, rigorosa
e brutal do capítulo fornecido.

Não foque em correção gramatical simples (copyediting), foque na fundação
da história (developmental editing).

Execute uma análise técnica cobrindo os seguintes parâmetros:

1. Mecânica de Causação: Aponte especificamente onde os eventos carecem
   de lógica de causa e efeito (momentos em que coisas acontecem 'por
   coincidência' em vez de serem consequências das escolhas do personagem).

2. Profundidade Psicológica e Agência: Avalie a reação do protagonista.
   As ações dele parecem lógicas perante sua 'Ferida' e 'Medo', ou parecem
   controladas artificialmente pela conveniência da trama?

3. Auditoria de Preguiça Descritiva ('Show, Don't Tell'): Isole parágrafos
   exatos onde houve 'info-dumping' ou onde emoções fortes foram apenas
   rotuladas em vez de encenadas de forma tátil e visceral.

4. Detector de Anti-Patterns e Tropos: Identifique o uso de linguagem clichê,
   metáforas desgastadas ou reações corporais artificiais de IA.

Conclua com um Plano de Ação listando os 3 problemas macro que destruirão a
experiência do leitor se não forem severamente reescritos.

Texto para análise:
[TEXTO DO CAPÍTULO]"
```

---

## 4. Checklist Operacional de Qualidade Literária

Antes da aprovação final, o autor deve auditar:

### Plot & Ritmo

- [ ] O arco do protagonista flui através do conflito externo?
- [ ] O _sagging middle_ foi evitado com Pinch Points?

### Agência

- [ ] O protagonista toma decisões difíceis (Sequela)?
- [ ] Ou apenas reage ao que lhe acontece?

### Erradicação de IA-ismos

- [ ] O texto foi limpo com "Pente Fino" contra:
  - Advérbios em "-mente"
  - Clichês descritivos ("tapeçaria", "mosaico")
  - Diálogos perfeitos (tipo terapeuta)

### Show, Don't Tell

- [ ] Os momentos críticos foram dramatizados em tempo real?
- [ ] Através da visão, cheiro e tato?
- [ ] Em vez de resumidos narrativamente?

---

## 5. Detectores Heurísticos

O módulo implementa detectores automatizados:

| Detector                   | Método                                               | Ação                  |
| -------------------------- | ---------------------------------------------------- | --------------------- |
| **Blacklist de palavras**  | Busca por termos da lista de AI-ismos                | Alerta amarelo        |
| **Classificador de IA**    | Modelo auxiliar pequeno audita trechos em background | Alerta laranja        |
| **Repetição sintática**    | Análise de padrões de início de parágrafos           | Alerta amarelo        |
| **Densidade de advérbios** | Contagem de "-mente" por parágrafo                   | Alerta se > threshold |

Todos os alertas são **não intrusivos**, com sugestões de melhoria.

---

## 6. Integração com StoryForge

- **Input:** Capítulo escrito (de `05_writing_assistant.md`) + Bíblia da História
- **Output:** Relatório de auditoria com problemas numerados + Plano de Ação
- **Modo:** Inline (comentários no editor) ou relatório separado
- **Automático:** Detectores heurísticos rodam em background
- **Fluxo:** Após auditoria, o autor corrige manualmente (Fase de Polimento Literário)
