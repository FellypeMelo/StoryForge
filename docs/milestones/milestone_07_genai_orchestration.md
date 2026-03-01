# 🔌 Milestone 7 — Multi-Provider GenAI & Orquestração de Agentes

> **Fase:** Infraestrutura de IA  
> **Objetivo:** Implementar API unificada multi-provedor (Ollama local, OpenAI, Anthropic Claude, Google Gemini), pipeline de orquestração de agentes (CrewAI para geração local, LangGraph para CI/CD) e sistema de fallback resiliente.  
> **Base Teórica:** [`06_multiagent_orchestration.md`](../engineering/06_multiagent_orchestration.md), [`01_llm_cognition.md`](../engineering/01_llm_cognition.md), [`02_prompt_engineering_drtd.md`](../engineering/02_prompt_engineering_drtd.md)  
> **Compliance:** Lei 1 (TDD), Lei 2 (Clean Arch — LlmPort no domínio), Lei 3 (Economia de Contexto)

---

## Pré-Condições

- [x] Milestones 1–6 completos
- [x] `LlmPort` interface definida no domínio (Milestone 3)
- [x] Todos os use cases usando `LlmPort` via DIP

---

## Etapa 7.1 — Infraestrutura: Adapter Ollama (Local-First)

### Tarefas (TDD)

- [ ] 🔴 RED: Teste de integração para `OllamaAdapter` — envia prompt, recebe completion
- [ ] 🔴 RED: Teste para timeout handling (Ollama não responde em N segundos)
- [ ] 🔴 RED: Teste para streaming parcial (chunks de resposta)
- [ ] 🟢 GREEN: Implementar `OllamaAdapter` que implementa `LlmPort`
- [ ] 🟢 GREEN: Configurar URL base via variável de ambiente
- [ ] 🔵 REFACTOR: Extrair parsing de resposta para `OllamaResponseParser`

### Critério de Aceite

```
OllamaAdapter conecta com instância Ollama local rodando Llama 3.
Timeout configurável. Fallback para erro tipado (LlmUnavailable).
Streaming funcional para UX progressiva.
```

---

## Etapa 7.2 — Infraestrutura: Adapter OpenAI

### Tarefas (TDD)

- [ ] 🔴 RED: Teste para `OpenAiAdapter` — envia prompt, recebe completion
- [ ] 🔴 RED: Teste para rate limiting (429) com retry exponencial
- [ ] 🔴 RED: Teste para tratamento de API key ausente
- [ ] 🟢 GREEN: Implementar `OpenAiAdapter` que implementa `LlmPort`
- [ ] 🟢 GREEN: API key via variável de ambiente (nunca hardcoded — Lei de Segurança)
- [ ] 🔵 REFACTOR: Extrair retry logic para `RetryPolicy` reutilizável

### Critério de Aceite

```
API key gerenciada via env var. Hardcoded = BLOQUEADO.
Rate limit 429 → retry com backoff exponencial (máx. 3 tentativas).
```

---

## Etapa 7.3 — Infraestrutura: Adapters Anthropic & Gemini

### Tarefas (TDD)

- [ ] 🔴 RED: Teste para `AnthropicAdapter` — streaming messages API
- [ ] 🟢 GREEN: Implementar com parsing de content blocks
- [ ] 🔴 RED: Teste para `GeminiAdapter` — generateContent API
- [ ] 🟢 GREEN: Implementar com parsing de candidates
- [ ] 🔵 REFACTOR: Normalizar resposta de todos os adapters para `LlmResponse`

### Critério de Aceite

```
Todos os adapters retornam LlmResponse unificado (content, model, usage).
Cada adapter isolado na camada de infraestrutura.
```

---

## Etapa 7.4 — Caso de Uso: Router de Provedor

### Tarefas (TDD)

- [ ] 🔴 RED: Teste para `LlmRouter` — seleciona provedor conforme configuração do usuário
- [ ] 🔴 RED: Teste para fallback: se provedor primário falha, tenta secundário
- [ ] 🔴 RED: Teste para Circuit Breaker: provedor com 3 falhas consecutivas é desabilitado
- [ ] 🟢 GREEN: Implementar `LlmRouter` como caso de uso de orquestração
- [ ] 🔵 REFACTOR: Extrair `CircuitBreaker` como pattern reutilizável

### Chain de Fallback

```
1. Provedor preferido do usuário (ex: Ollama local)
2. Provedor secundário (ex: OpenAI)
3. Provedor terciário (ex: Gemini)
4. Erro: LlmUnavailable com mensagem explicativa
```

### Critério de Aceite

```
Fallback automático transparente para o autor.
Circuit Breaker desabilita provedor após 3 falhas.
Logs de fallback para auditoria.
```

---

## Etapa 7.5 — Configuração do Usuário: Seleção de Provedor

### Tarefas

- [ ] 🔴 RED: Teste para entidade `ProviderConfig` (provider, model, apiKey, baseUrl)
- [ ] 🟢 GREEN: Implementar com validação de campos por provedor
- [ ] 🔴 RED: Teste para persistência de config em SQLite (criptografia para API keys)
- [ ] 🟢 GREEN: Implementar repositório com cifra AES para secrets
- [ ] 🔵 REFACTOR: API keys nunca transitam em texto plano para o frontend

### Critério de Aceite

```
API keys cifradas em repouso (SQLite).
Frontend nunca recebe API key em plaintext.
Configuração por projeto (provedores diferentes por livro).
```

---

## Etapa 7.6 — Orquestração: Pipeline de Agentes (CrewAI Model)

### Tarefas (TDD)

- [ ] 🔴 RED: Teste para `AgentPipeline` — cadeia de agentes com delegação hierárquica
- [ ] 🟢 GREEN: Implementar modelo Supervisor → Specialists:
  - Supervisor: Analisa requisição, delega para agente especialista
  - IdeationAgent: Executa pipeline CHI
  - CharacterAgent: Executa geração OCEAN/Hauge
  - WritingAgent: Executa pipeline EPRL
  - AuditAgent: Executa pipeline Bad Cop
- [ ] 🔴 RED: Teste para memory management: histórico resumido entre chamadas
- [ ] 🟢 GREEN: Implementar sumarização de contexto para evitar saturação de tokens
- [ ] 🔵 REFACTOR: Cada agente é composição de use cases existentes (zero duplicação)

### Critério de Aceite

```
Pipeline de agentes reutiliza use cases dos milestones 3–6.
Memory management previne token overflow.
Agentes são composições, não implementações duplicadas.
```

---

## Etapa 7.7 — UI: Configuração de Provedores

### Tarefas

- [ ] Criar página `/settings/providers` com lista de provedores
- [ ] Formulário de configuração por provedor (URL, modelo, API key)
- [ ] Teste de conexão ("Testar Conexão" → verifica health check do provedor)
- [ ] Seletor de provedor preferido por projeto
- [ ] Indicador visual de status de cada provedor (online/offline/circuit-break)

### Critério de Aceite

```
Autor configura provedores sem tocar em código.
Teste de conexão fornece feedback imediato.
API keys mascaradas na UI (******).
```

---

## Entregáveis do Milestone 7

| Artefato | Descrição |
|----------|-----------|
| OllamaAdapter | Local-first com streaming |
| OpenAiAdapter | Com retry + rate limit handling |
| AnthropicAdapter | Messages API com streaming |
| GeminiAdapter | GenerateContent API |
| LlmRouter | Fallback + Circuit Breaker |
| ProviderConfig | Persistência cifrada de API keys |
| AgentPipeline | Supervisor → Specialists reutilizando use cases |
| UI Settings | Configuração de provedores com teste de conexão |
