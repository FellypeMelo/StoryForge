# 🧠 Cognição do LLM & Engenharia de Contexto

> **Módulo:** Engenharia de AI Coding  
> **Base Teórica:** Tratado Técnico AI Coding Avançado — Capítulo 1  
> **Propósito:** Compreender as limitações estruturais e cognitivas da IA para governar o código gerado.

---

## 1. A Matemática do Raciocínio (Self-Attention)

LLMs não "entendem" lógica; operam via inferência estatística de alta dimensão baseada no mecanismo de **Auto-Atenção (Self-Attention)**.

- **Query (Q):** O estado atual da geração (ex: declaração de interface).
- **Key (K):** Todo o contexto disponível na janela de tokens.
- O produto escalar (Q · K) pondera qual token passado DEVE influenciar o próximo.

### Implicação Prática: Diluição de Atenção
Atenção dilui com o aumento de tokens. Injetar um arquivo de 10.000 linhas satura a matriz com "ruído térmico", resultando em **alucinações**.

---

## 2. Alucinação como Compressão com Perdas

Alucinação não é "bug corrigível" — é limite matemático da **Complexidade de Kolmogorov**.
O LLM é um *lossy compressor* do GitHub. Quando o contexto falta, ele interpola via **proximidade semântica**.

**Exemplo:**
Se faltar contexto de tipagem em TypeScript, ele pode inferir padrões do React em código puramente Node, se a densidade vetorial de sua base apontar para essa direção.

---

## 3. A Síndrome da "Agulha no Palheiro"

Janelas de 2M de tokens (Gemini 1.5 Pro) processam montes de texto, mas o **ruído contextualmente adjacente** dilui o vetor de atenção. 
Enviar contexto desnecessário faz a IA ignorar regras arquiteturais vitais colocadas no meio do prompt.

---

## 4. O Espectro de Agência

Confundir os níveis de capacidade de um agente é a maior causa de falha corporativa.

| Paradigma | Características | Caso de Uso |
|-----------|-----------------|-------------|
| **LLM Simples (Zero-Shot)** | Stateless. Auto-regressivo simples. | Autocomplete trivial (Copilot clássico). Falha em refatorações massivas. |
| **Agente com Tools** | Executa funções determinísticas (JSON Schema). | Extrair logs, testes isolados. Exige gramática restrita para JSON. |
| **Agente ReAct** | Razão → Ação → Observação. Possui loop com stderr/stdout. | Depuração, refatorações curtas em um arquivo via CLI. |
| **Sistemas Multiagentes** | Coreografia distribuída: Planejador ➔ Trabalhadores ➔ Revisor. | Escala arquitetural complexa. Padrão exigido pelo AI-XP. |

---

## 5. Engenharia Cognitiva de Contexto

Para o desenvolvimento em grande escala, a IA sofre de **Miopia Topológica** (não entende arquivos 3D). A solução é a extração de **Grafos de Sintaxe Abstrata (AST)**.

### Regra de Injeção: Repo Map

1. **Nunca** concatene todo o projeto num prompt.
2. Extraia as assinaturas de classes, nomes de funções e imports via AST (ex: `tree-sitter`).
3. Forneça o mapa relacional e **somente os nós restritos cruciais** para a resolução da tarefa (centralidade por dependência).

---

## 6. Casos de Falha Reais (O Perigo do Vibe Coding)

1. **A Armadilha do Código Feliz:** 
   O LLM gera componentes complexos, mas não "pensa" na vida útil além de ciclos felizes (esquece Memory Leaks e Eventos Async).
2. **Quebra Silenciosa de Refatoração:**
   Como no ReAct a atenção satura para iteração de longo prazo, a IA adota atalhos nocivos: `// resto do código permanece o mesmo`, estilhaçando projetos.
