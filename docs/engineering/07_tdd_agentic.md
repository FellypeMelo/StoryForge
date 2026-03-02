# 🔴 Agentic TDD (Red-Green-Refactor)

> **Módulo:** Engenharia Multiagentes AI-XP  
> **Base Teórica:** XP com Agentes de IA — Seção 4  
> **Propósito:** Operacionalizar o Test-Driven Development para máquinas, evitando o "Code Churn" e blindando lógicas core.

---

## 1. O Problema da Saturação do Loop

Modelos submetidos à técnica falham rotineiramente no TDD clássico quando _Testes e Implementações_ ocorrem na mesma sessão de prompt/chat. OLLM comete um auto-engano (_Context Pollution_): em vez de corrigir a classe, ele sabota o teste para que passe usando retornos cravados (Hardcoded Mocks) de forma espúria, por já conhecer a implementação.

---

## 2. Ciclo Red-Green-Refactor com Separação Agêntica

Para sucesso estrito, os passos do TDD devem ser separados e orquestrados por **Hooks do Sistema**:

### FASE 1: 🔴 RED (Construir Testes Falhos)

- **Restrição de Hardware:** A ferramenta proíbe ativamente modificação de arquivos fonte de produção.
- O _Test Analyst Agent_ recebe apenas Especificações BDD/Gherkin ou requisitos textuais.
- **Saída Exigida:** Assertions em Jest/Vitest/Pytest falhando. A falha é a garantia de que não é um teste inócuo.

### FASE 2: 🟢 GREEN (Código Mínimo)

- O _Implementation Agent_ atua sob a regra absoluta: **Escreva o código mais ignorante e mínimo possível** apenas para transpor o erro vermelho captado pelo watcher do test runner.
- Proibido abstração e clean code temporário. YAGNI em sua forma mais agressiva.

### FASE 3: 🔵 REFACTOR (Melhoria Estrutural Segura)

- O _Refactoring Agent_ entra em cena sem acesso as lógicas base; seu prompt foca apenas em reduzir Complexidade Ciclomática (verificação de lint) ou Extração de Variáveis e remoção de bad DRY.
- A "Cibernética da Reversão": Se quebrar algum teste em milissegundos, um `git checkout` imediato roda (Hard Stop-Loss).

---

## 3. O "PreEditHook" de Firewall de Agentes

Não confie apenas na docilidade do Agent Planner — configure bloqueios de CI e hooks de commit que travem o Git se não houver cobertura nova acionando a regra TDD.

**Exemplo `.claude/hooks/enforce-tdd-red-phase.ts`:**
Qualquer alteração via _search_and_replace_ para `src/domain/` falha instantaneamente no terminal retornando erro caso não tenha encontrado a alteração correlata na pasta `tests/` com falhas recém inseridas ou corrigidas, abortando o envio.


