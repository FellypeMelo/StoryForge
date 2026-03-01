# 🚫 Catálogo de Anti-Patterns em AI Coding

> **Módulo:** Engenharia de AI Coding  
> **Base Teórica:** Tratado Técnico AI Coding Avançado — Capítulos 5 e 6  
> **Propósito:** Mapeamento profundo e extermínio precoce das piores práticas inseridas organicamente pelos LLMs no software.

---

## 1. O Flagelo da Falsa Abstração (Premature Abstraction)

- **O que é:** Agentes criam heranças monstruosas e arquiteturas infladas (ex: `IValidator<T>`, `BaseValidatorAbstract`).
- **Por que ocorre:** Predomínio estatístico de dados educacionais sobre "Padrões de Projeto Gof/Enterprise" nos treinamentos primários do LLM.
- **A Solução Governamental:** **Regra das 3 Repetições**. Os meta-prompts suprimem as generalizações: *"Nenhuma interface genérica abstrata deverá ser delineada até que surja evidência incontestável de replicação em 3 módulos na base estática. Redija de forma puramente concreta."*

---

## 2. Acoplamento Implícito e "Mau DRY" (Implict Coupling)

- **O que é:** A IA força um falso reaproveitamento ao mesclar contextos lógicos fundamentalmente separados pelo mero acaso de possuírem os mesmos campos textuais no estado presente.
- **Exemplo:** Mesclar entidade de Banco de Dados (`UserModel`) com Objeto de Transferência HTTP (`UserDTO`). Alterar o front quebra veladamente a persistence ORM.
- **Por que ocorre:** Compressão matemática. Para economizar tokens preditivos na janela (DRY), o LLM engaveta abstrações e agrupa códigos distintos.
- **A Solução Governamental:** Segregação brutal por Bounded Contexts em prompts DRTD rigorosos exigindo duplicação tática protetiva frente ao acoplamento danoso. 

---

## 3. Degradação pelo Inchaço "Bloat" (LLM Bloat)

- **O que é:** O famoso fenômeno do "Exército de Jovens Seniores operando em Hyper-velocidade". Inválido de visão topológica, a IA não redefine roteamento primário; ela prefere criar if-elses aninhados (cascatas bizantinas e switch complexos).
- **Consequência:** Aumento vertiginoso (cerca de 8x) de ineficiências em loops de evento I/O Assíncrono com afogamento computacional.
- **A Solução Governamental:** Análise Ciclomática contínua em CI em malha de realimentação com LLMs Revisores que atiram fora funções que superem grau de complexidade estrutural 15.

---

## 4. O Framework FCLM (Condicionamento Logístico de Matriz)

O Sistema Mestre de Checklists de Interação contínua. Para cada requisição de refatoração massiva o Desenvolvedor submete e os Linters de CI atestam:

- [ ] **Contexto-Sinal Isolado:** O LLM obteve apenas o subset AST/RepoMap focado sem lixo.
- [ ] **Rigor de Resposta OBRIGATÓRIO:** Logit maskings exigindo saída JSON-schemas/strict-diff.
- [ ] **Reflexão Prévoca Estrita:** LLMs executaram <thinking> de ponderação visualizando side-effects previamente.
- [ ] **Integração do Ambiente Autônomo:** dependency-cruiser validando liminarmente.
