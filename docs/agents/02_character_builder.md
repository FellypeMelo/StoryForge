# 🎭 Agente de Personagens Profundos

> **Módulo StoryForge:** Personagens Profundos  
> **Base Teórica:** Manual de Escrita Criativa com IA — Parte 3  
> **Responsabilidade:** Construir personagens com profundidade psicológica, voz distinta e arco interno coerente.

---

## 1. Problema Central

A IA gera personagens **psicologicamente rasos**, sem agência, que operam como terapeutas perfeitos e não possuem defeitos morais verdadeiros. Isso ocorre porque o RLHF (alinhamento de segurança) treina os modelos para serem "úteis e inofensivos".

---

## 2. Framework A — Modelo Big Five (OCEAN)

O modelo dos Cinco Grandes Fatores parametriza o comportamento do personagem. A IA **entende profundamente** este modelo e responde com precisão quando os scores são fornecidos.

| Traço | Polo Alto | Polo Baixo |
|-------|-----------|------------|
| **Abertura (O)** | Originalidade, curiosidade | Rotina, conservadorismo |
| **Conscienciosidade (C)** | Disciplina, organização | Caos, impulsividade |
| **Extroversão (E)** | Busca por estímulo, sociabilidade | Isolamento, introspecção |
| **Amabilidade (A)** | Confiança, empatia | Ceticismo, hostilidade |
| **Neuroticismo (N)** | Ansiedade, vulnerabilidade | Estabilidade, resiliência |

### Regras de Uso

1. Defina scores como **Baixo / Médio / Alto** para cada traço.
2. Explique como a **combinação específica** de dois traços gera um defeito fatal na tomada de decisão.
3. Os scores devem **pautar todas as reações** geradas pela IA para este personagem.

---

## 3. Framework B — Arco Interno de Michael Hauge

Define a **trajetória da alma** do personagem ao longo da narrativa.

| Componente | Descrição | Exemplo |
|------------|-----------|---------|
| **Ferida (Wound)** | Trauma não curado do passado | Abandono parental aos 8 anos |
| **Crença (Belief)** | A mentira sobre o mundo que a ferida criou | "Ninguém pode ser confiável" |
| **Medo (Fear)** | O terror emocional de sofrer a ferida novamente | Medo paralisante de intimidade |
| **Identidade (Identity)** | O "eu falso", a armadura emocional | Persona de autossuficiência agressiva |
| **Essência (Essence)** | O "eu verdadeiro" a ser aceito no Ato 3 | Capacidade de vulnerabilidade e conexão |

### Regra Crítica

A **Identidade** e a **Essência** devem estar em **oposição direta**. A tensão entre elas é o motor do arco interno.

---

## 4. Voz Individual e Subtexto Comportamental

A IA **padroniza diálogos**. Para criar voz única, cada personagem precisa de:

### Regras Sintáticas Obrigatórias

- **Tamanho médio de frase** (curta/média/longa)
- **Nível de formalidade** (gírias vs. erudição)
- **Tiques verbais** (expressões recorrentes, hesitações, interjeições)
- **Mecanismo de evasão** — como o personagem evita dizer o que sente:
  - Sarcasmo
  - Silêncio deliberado
  - Agressão passiva
  - Mudança de assunto
  - Racionalização intelectual

### Subtexto Comportamental

Definir **3 "tells" físicos involuntários** que o personagem exibe quando sua Identidade é ameaçada. Ex:
1. Coça a cicatriz no pulso
2. Fala mais rápido e em volume mais baixo
3. Alinha obsessivamente objetos próximos

---

## 5. Checklist de Profundidade Psicológica

- [ ] Os scores OCEAN estão definidos para pautar reações da IA?
- [ ] A Identidade e a Essência estão em oposição direta?
- [ ] O personagem possui uma **falha moral ativa** (não apenas "é muito bom")?
- [ ] A voz sintática tem regras restritivas claras?
- [ ] Existem 3 tells físicos comportamentais definidos?
- [ ] O mecanismo de evasão emocional está documentado?

---

## 6. Prompt Template — Geração de Personagem Complexo

```
"Atue como um Psicólogo Comportamental e Arquiteto de Personagens Literários.
Construa o protagonista para o meu romance [GÊNERO/PREMISSA].

PARÂMETROS OBRIGATÓRIOS:

1. Perfil Psicológico (Big Five/OCEAN): Defina pontuações (Baixo/Médio/Alto)
   para os 5 traços. Explique como a combinação específica de [TRAÇO_X] e
   [TRAÇO_Y] gera um defeito fatal na sua tomada de decisão.

2. Motor de Conflito Interno (Michael Hauge): Defina a Ferida, a Crença
   (Mentira), o Medo, a Identidade (Máscara protetora) e a Essência.

3. Subtexto Comportamental: Descreva 3 'tells' físicos (linguagem corporal)
   involuntários que ele exibe quando a sua Identidade é ameaçada.

4. Voz Sintática: Defina regras restritas para o diálogo deste personagem.
   (Ex: frases curtas, responde perguntas com outras perguntas, usa ironia
   defensiva).

REGRA NEGATIVA: Proibido criar personagens excessivamente otimistas,
perfeitamente articulados emocionalmente ou sem preconceitos internos.
Quero falhas humanas feias e realistas."
```

---

## 7. Anti-Patterns a Bloquear

| Anti-Pattern | Sintoma | Ação |
|---|---|---|
| Personagem-terapeuta | Resolve conflitos conversando articuladamente | Exigir evasão, interrupção, jargão regional |
| Otimismo artificial | Sem preconceitos internos ou defeitos reais | Aplicar regra negativa do prompt |
| Voz genérica | Todos os personagens falam igual | Verificar regras sintáticas distintas por personagem |
| Arco interno ausente | Sem Ferida/Crença/Medo definidos | Bloquear progressão até preenchimento do Hauge |

---

## 8. Integração com StoryForge

- **Input:** Premissa (de `01_ideation_chi.md`) + papel na trama
- **Output:** Ficha completa (OCEAN + Hauge + Voz + Tells)
- **Persistência:** Ficha → Bíblia da História (consulta RAG)
- **Uso contínuo:** Todas as gerações de texto consultam a ficha para coerência
- **Próximo módulo:** `03_narrative_structure.md`
