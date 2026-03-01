# 🧠 Agente de Ideação e Premissa (Método CHI)

> **Módulo StoryForge:** Ideação e Premissa  
> **Base Teórica:** Manual de Escrita Criativa com IA — Parte 2  
> **Responsabilidade:** Gerar conceitos originais, bloquear clichês, definir conflito central e worldbuilding.

---

## 1. Fundamento: O Efeito da Média

Quando um LLM recebe um prompt simples de ideação, ele gera a premissa **estatisticamente mais comum** do seu banco de treinamento — o chamado _Averaging Effect_. Para combater isso, utilizamos o **Método CHI** aliado a **CAD**.

---

## 2. Método CHI (Controlled Hallucination for Ideation)

### Processo em 3 Fases

| Fase                             | Ação                                                                       | Regra                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Fase 1 — Extração de Clichês** | Forçar a IA a listar TUDO que é comum e previsível no gênero               | Os elementos listados ficam **permanentemente proibidos**                               |
| **Fase 2 — Polinização Cruzada** | Combinar a premissa de gênero com uma disciplina acadêmica não relacionada | Ex: _Fantasia Épica + Teoria dos Jogos_, _Romance + Termodinâmica_                      |
| **Fase 3 — Validação Reversa**   | Avaliar o motor de conflito da ideia gerada                                | Deve responder: O que o protagonista quer? Quem/o que impede? O que acontece se falhar? |

### Regras de Operação

1. **NUNCA** aceite a primeira sugestão do modelo como conceito final.
2. **SEMPRE** execute a Fase 1 antes de qualquer geração criativa.
3. A lista de clichês deve ser persistida na Bíblia da História como **blacklist ativa**.
4. A combinação da Fase 2 deve ser **genuinamente inesperada** — não derivações óbvias.

---

## 3. Fórmula da Premissa

A premissa deve sempre responder à equação:

```
[Protagonista Falho] + [Incidente Incitante] + [Antagonista / Força Opositora]
```

### Checklist de Validação da Premissa

- [ ] O protagonista tem uma **falha ativa** (não apenas "é muito bom")?
- [ ] O incidente incitante **força** o protagonista a agir (não é opcional)?
- [ ] O antagonista/força opositora é **tão desenvolvido** quanto o protagonista?
- [ ] O risco de falha é **concreto e irreversível**?

---

## 4. Worldbuilding via CAD (Context-Aware Decomposition)

**Regra:** Nunca peça à IA para criar o mundo inteiro em um único prompt.

### Sequência Obrigatória de Decomposição

```
Passo 1: Defina a Física / Sistema de Magia
    ↓
Passo 2: Derive a Economia a partir da Física
    ↓
Passo 3: Derive Sociologia e Religião a partir da Economia
    ↓
Passo 4: Cruze os dados para gerar zonas de conflito cultural
```

Cada passo mantém o **tema central ativo** enquanto resolve subcomponentes isoladamente.

---

## 5. Prompt Template — Subversão de Clichês

```
"Você é um Analista Estrutural de Aquisições de uma grande editora literária.
Eu quero escrever um romance de [GÊNERO].

FASE 1: Liste os 10 tropos, clichês e resoluções mais óbvios e estatisticamente
prováveis para este gênero.

FASE 2: Proíba estritamente o uso de todos os elementos listados na Fase 1.
Agora, gere 3 premissas originais utilizando a técnica de 'Polinização Cruzada'.
Combine o gênero com conceitos de [DISCIPLINA ACADÊMICA].

Para cada premissa, defina claramente:
A) O Fator de Novidade Absoluta.
B) O Conflito Central (O que o personagem quer vs. A força massiva que o impede).
C) O Risco (O que acontece se ele falhar?)."
```

---

## 6. Anti-Patterns a Bloquear

| Anti-Pattern                  | Sintoma                              | Ação                                                            |
| ----------------------------- | ------------------------------------ | --------------------------------------------------------------- |
| Premissa genérica             | "Um jovem descobre que tem poderes"  | Rejeitar. Executar Fase 1 do CHI                                |
| Conflito vago                 | "Ele precisa salvar o mundo"         | Exigir especificidade: quem, como, por que ele especificamente? |
| Antagonista ausente           | Sem força opositora clara            | Bloquear progressão até definição concreta                      |
| Worldbuilding de prompt único | "Crie um mundo de fantasia completo" | Forçar decomposição via CAD                                     |

---

## 7. Integração com StoryForge

- **Input:** Gênero desejado + disciplinas de cruzamento (opcional)
- **Output:** 3 premissas validadas com conflito central definido
- **Persistência:** Premissa aprovada + blacklist de clichês → Bíblia da História
- **Próximo módulo:** `02_character_builder.md` (personagens baseados na premissa)
