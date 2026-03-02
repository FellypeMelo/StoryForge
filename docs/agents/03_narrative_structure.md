# 🏗️ Agente de Estrutura Narrativa

> **Módulo StoryForge:** Estrutura Narrativa  
> **Base Teórica:** Manual de Escrita Criativa com IA — Partes 1 e 1.2–1.5  
> **Responsabilidade:** Selecionar, configurar e aplicar frameworks narrativos; validar progressão macro.

---

## 1. Princípio Fundamental

A IA escreve de forma **episódica** (eventos conectados por "e então"). O autor profissional força a IA a escrever de forma **causal** (eventos conectados por "portanto" ou "mas").

### Três Pilares de um Livro Memorável

1. **Ressonância Empática** — O leitor se vê nas **falhas** (não nas virtudes) do personagem.
2. **Causalidade Inquebrável** — Cada cena é consequência direta e inevitável da anterior.
3. **Surpresa Inevitável** — O desfecho não podia ser previsto, mas era o único caminho lógico.

---

## 2. Frameworks Narrativos Suportados

### 2.1 A Jornada do Herói (Campbell / Vogler)

| Estágio                      | Descrição                   |
| ---------------------------- | --------------------------- |
| 1. Mundo Comum               | Status quo do protagonista  |
| 2. Chamado à Aventura        | Evento disruptivo           |
| 3. Recusa do Chamado         | Hesitação e medo            |
| 4. Encontro com o Mentor     | Guia ou catalisador         |
| 5. Travessia do Limiar       | Ponto sem retorno           |
| 6. Testes, Aliados, Inimigos | Mundo especial              |
| 7. Aproximação da Caverna    | Preparação para a provação  |
| 8. Provação Suprema          | Confronto maior             |
| 9. Recompensa                | Conquista temporária        |
| 10. Caminho de Volta         | Consequências da recompensa |
| 11. Ressurreição             | Transformação final         |
| 12. Retorno com o Elixir     | Novo equilíbrio             |

**Aplicação ideal:** Fantasia, Épicos, Sci-Fi, Coming-of-Age.

### 2.2 Save the Cat (Blake Snyder)

15 beats prescritivos com exigência de que a **Imagem de Abertura** espelhe a **Imagem Final**, e a **Noite Escura da Alma** catalise a mudança no Ato 3.

**Aplicação ideal:** Romances comerciais, Thrillers, Young Adult, Roteiros.

### 2.3 Curva Fichteana (John Gardner)

Ignora o "mundo comum". Inicia **in medias res** com incidente incitante imediato, seguido por **múltiplas crises em rápida sucessão** até o clímax.

**Aplicação ideal:** Mistérios, Pulp Fiction, Suspenses de ritmo frenético.

### 2.4 Estrutura de 7 Pontos (Dan Wells)

Alternância geométrica: **Gancho** (oposto do fim) → Virada 1 → Ponto de Aperto 1 → **Ponto Médio** (reação → ação) → Ponto de Aperto 2 (tudo perdido) → Virada 2 → **Resolução**.

**Aplicação ideal:** Enredos complexos, planejamento reverso.

### 2.5 Kishōtenketsu (Estrutura Asiática em 4 Atos)

Foca em **contraste** em vez de conflito:

| Ato                       | Função                                 |
| ------------------------- | -------------------------------------- |
| **Ki** (Introdução)       | Apresentação                           |
| **Shō** (Desenvolvimento) | Expansão                               |
| **Ten** (Reviravolta)     | Elemento novo e **não relacionado**    |
| **Ketsu** (Conclusão)     | Harmoniza a reviravolta com a premissa |

**Aplicação ideal:** Ficção literária, slice-of-life.

### 2.6 Narrativa Não Linear

Quebra da linearidade temporal para forçar o leitor a montar o quebra-cabeça temático. Utiliza cronologia reversa ou flashbacks temáticos.

---

## 3. Story Grid — Macro vs Micro (Shawn Coyne)

### Diagrama de Polaridade de Cena

**Toda cena gerada pela IA deve sofrer uma inversão de valor:**

```
[Estado Inicial: Esperança (+)]
    → Ação do Personagem
    → Complicação Inesperada
    → Ponto de Crise (dilema irreversível)
    → Clímax da Cena
    → [Estado Final: deve ser oposto ao inicial]
```

### Regra de Ouro

> **Se a polaridade não mudar** (ex: começou triste e terminou triste), **a cena é inútil** e o autor deve rejeitar a saída da IA.

---

## 4. Erros Estruturais Comuns com IA

| Erro                  | Causa                                                     | Detecção                                                  | Prevenção                                                 |
| --------------------- | --------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| **Sagging Middle**    | IA perde direção entre evento incitante e clímax          | Reflexões internas intermináveis sem progressão de enredo | Exigir Pinch Points obrigatórios no meio                  |
| **Resolução Precoce** | RLHF causa aversão a prolongar sofrimento                 | Mistérios resolvidos rápido, traumas curados facilmente   | Instruir: "É proibido resolver o conflito antes do Ato 3" |
| **Episodicidade**     | Eventos conectados por "e então" em vez de "portanto/mas" | Cenas que podem ser reordenadas sem impacto               | Exigir relação causal explícita entre cenas               |

---

## 5. Checklist de Validação Estrutural

- [ ] Framework narrativo escolhido e documentado?
- [ ] Todos os beats/estágios do framework estão preenchidos?
- [ ] Cada cena possui inversão de polaridade (Story Grid)?
- [ ] Os Pinch Points do meio estão definidos?
- [ ] A relação entre cenas é **causal** (não episódica)?
- [ ] O conflito central não é resolvido antes do ponto correto?

---

## 6. Integração com StoryForge

- **Input:** Premissa + personagens (de `01` e `02`)
- **Output:** Beat sheet completo com framework escolhido + validação Story Grid
- **Persistência:** Estrutura → Codex da História
- **Visual:** Criador visual de estruturas personalizadas (UI)
- **Próximo módulo:** `04_chapter_architect.md`
