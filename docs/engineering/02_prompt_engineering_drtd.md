# 🎯 Engenharia de Prompt DRTD

> **Módulo:** Engenharia de AI Coding  
> **Base Teórica:** Tratado Técnico AI Coding Avançado — Capítulo 2  
> **Propósito:** Framework avançado DRTD (Decodificação Restrita por Topologia de Domínio) para elevar a precisão estocástica acima de 90%.

---

## 1. Filosofia: A Morte do Prompt Coloquial

Comandos "informais" ou "como se falasse com um júnior" geram _vibe coding_. Prompts devem ser tratados como **linguagens de compilação** direcionadas ao espaço paramétrico da IA.

---

## 2. A Fórmula C + R + K + O

O framework DRTD força a manipulação da distribuição de probabilidades:

- **[C] Contexto (Context):** Delimitação minimalista e matemática do estado. Apenas `Repo Map` focado e AST parcial. **(Menos arquivos = Maior sinal)**
- **[R] Papel (Role):** Filtro Bayesiano do espaço latente. A identidade não é "seja um júnior", mas sim "Engenheiro Pragmatista Senior".
- **[K] Conhecimento (Knowledge/Rules):** Princípios de Clean Code inegociáveis. Restrições e limitações "morais" (ex: "Não antecipe abstrações").
- **[O] Objetivo (Output):** Tipo rigoroso de saída, exigindo JSON estrito ou difs esquemáticos, banindo prosa inútil.

---

## 3. A Estrutura de Camadas de um Prompt Fundacional (Agent Rules)

O arquivo-mestre de configurações (como `.cursorrules` ou `CLAUDE.md`) exige 6 camadas taxativas:

1. **Perfil Epistemológico:** Valorizar legibilidade e restrição em vez de invenção inútil.
2. **Contextualização Isolada:** Apresentação purificada de mapas hierárquicos.
3. **Restrições Negativas (Anti-patterns):** Ordens estritas do que a IA **não tem permissão** de codar.
4. **Obrigação Reflexiva (Chain-of-Thought):** Tags de `<thinking>` obrigatórias. _A IA não tem estado fora dos tokens gerados; refletir atua como memória rascunho._
5. **Qualidade Verificável:** Critérios matemáticos (ciclomática máxima < 15, Nesting max 2).
6. **Mecânica de Resposta:** Rigor no `application/json` ou syntax de diffing da ferramenta local.

---

## 4. Comparativo de Abordagem

| Fator          | Vibe Coding (Fraco)                 | DRTD (Avançado)                                                                                 |
| -------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Papel**      | "Você é um programador sênior"      | "Assuma papel de Arquiteto. Maximize simplicidade, garanta idempotência, não use libs externas" |
| **Contexto**   | "Aqui está o arquivo com 2k linhas" | "Anexo AST topológico do módulo. Isole o estado das requisições I/O sem destruir contratos"     |
| **Execução**   | "Conserte este erro de console."    | "Planeje na tag `<reflection>`. Liste os side-effects. Emita em `application/json`."            |
| **Alucinação** | Inventa APIs                        | "Regra Tolerância-Zero: APIs não mapeadas ativam flag `HUMAN_INTERVENTION_REQUIRED`."           |

---

## 5. Meta-Prompting e Recursividade Estrutural

Não se submete a tarefa ao codificador; submete-se ao **Planejador Orquestral**:

1. Analisa issue bruta e gera o Prompt Instrucional focado de execução (Passo A).
2. O prompt de Passo A já contém todos os guardrails para a infraestrutura delimitada e é encaminhado para execução pelo Codificador de Menor Parametrização.

### Categorias de Meta-Prompts

- **de Planejamento:** Pseudo-código antes de escrita da sintaxe.
- **de Auto-revisão:** Inverte o vetor de atenção. Obriga o LLM a atuar como adversário que procura falhas do arquivo recém gerado (_Reflexion Pattern_).
- **de Refatoração Arquitetural:** Agrupa AST Nodes pela correlação heurística.
