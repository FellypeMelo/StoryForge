# 🏛️ Clean Architecture & Akita Rules

> **Módulo:** Engenharia de AI Coding  
> **Base Teórica:** Tratado Técnico AI Coding Avançado — Capítulo 3  
> **Propósito:** Governar a arquitetura contra o _LLM Bloat_ e overengineering, utilizando pragmatismo e validadão via CI/CD.

---

## 1. O Problema do "Cargo Cult" da IA

Treinados massivamente em repositórios da última década, LLMs internalizaram o _Cargo Cult_ da arquitetura "Enterprise" acoplada. Ao pedir um validador simples, a IA cria Factories, Proxies, e injeções bizantinas desnecessárias.

**Axioma (Akita Rules):** "A Simplicidade é a arte de maximizar a quantidade de trabalho que não precisou ser feito. O melhor software é zero software."

---

## 2. Supressão do Overengineering (Fatias Verticais)

Abandona-se o paradigma falho de camadas horizontais globais em favor de **Vertical Slices (Fatias Verticais)** ou módulos de domínio fechado.

### Separação Estrutural Focada

1. **Camada de Domínio Puro:** Entidades e regras de negócio.
   - **Regra da IA:** Deve ser puramente estéril. Zero dependências de framework, ORMs ou I/O HTTP. A IA tem precisão impecável aqui se o estado for evitado.
2. **Camada de Aplicação:** Orquestra os Casos de Uso.
   - **Regra da IA:** Proibido código de negócio aqui. Apenas instanciação e pipes via Injeção de Dependência.
3. **Camada de Infraestrutura:** Bancos de dados, redes e APIs.
   - **Regra da IA:** Escrutínio paranoico. A estocasticidade causa condições de corrida (race conditions). Requer TDD cego antes da codificação.

---

## 3. Validação Arquitetural Pós-Geração

Como a IA não entende espaço 3D/Topológico, regras em prompts são insuficientes.

É **mandatório** implementar em CI/CD _guardrails automatizados_ contra acoplamentos cruzados gerados por alucinação, como o `dependency-cruiser` (JavaScript) ou `ArchUnit` (Java/C#). O merge (PR) deve **falhar** imediatamente se a IA tentar importar requisições HTTP dentro da regra de negócios.

---

## 4. Checklist Arquitetural Estrito (Para System Prompts)

Estas regras compõem o modelo metalógico obrigatório injetado nas rotinas da IA e nas análises de pull requests.

1. **Isolamento de Estado:** Função pura. Mutações externas gerenciadas apenas por injeção de dependência por interface.
2. **Repúdio à Prematuridade:** Não antecipe a necessidade de abstração. **Adoção Integral da Regra das 3 Repetições** antes de criar a primeira interface/classe base genérica.
3. **Proibição de Magia Negra:** Monkey-patching ou Reflection são proibidos. A clareza explícita e trivial supera a elegância de one-liners ilegíveis. _(Se a IA gerar 3 linhas de comentário para explicar o que fez, ela excedeu a complexidade limite)_.
4. **Acoplamento Físico:** Lógicas que mudam juntas moram juntas na mesma árvore de arquivos. Alta coesão espacial, baixo acoplamento temporal.


