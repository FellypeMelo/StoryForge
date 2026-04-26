# 🔌 Milestone 7 — Multi-Provider GenAI & Orquestração de Agentes

> **Fase:** Infraestrutura de IA  
> **Objetivo:** Implementar API unificada multi-provedor (Ollama local, OpenAI, Anthropic Claude, Google Gemini), pipeline de orquestração de agentes (CrewAI para geração local, LangGraph para CI/CD) e sistema de fallback resiliente.  
> **Base Teórica:** [`06_multiagent_orchestration.md`](../engineering/06_multiagent_orchestration.md), [`01_llm_cognition.md`](../engineering/01_llm_cognition.md), [`02_prompt_engineering_drtd.md`](../engineering/02_prompt_engineering_drtd.md)  
> **Compliance:** Lei 1 (TDD), Lei 2 (Clean Arch — LlmPort no domínio), Lei 3 (Economia de Contexto), Lei 7 (Integridade)

---

## Pré-Condições

- [x] Milestones 1–6 completos
- [x] `LlmPort` interface definida no domínio (Milestone 3)
- [x] Todos os use cases usando `LlmPort` via DIP

---

## Etapa 7.1 — Infraestrutura: Adapter Ollama (Local-First)

### Tarefas (TDD)

- [x] 🔴 RED: Teste de integração para `OllamaAdapter` — envia prompt, recebe completion
- [x] 🟢 GREEN: Implementar `OllamaAdapter` que implementa `LlmPort`
- [x] 🟢 GREEN: Configurar URL base via parâmetro/config

### Critério de Aceite

```
OllamaAdapter conecta com instância Ollama local.
Timeout configurável. Fallback para erro tipado.
```

---

## Etapa 7.2 — Infraestrutura: Adapter OpenAI

### Tarefas (TDD)

- [x] 🔴 RED: Teste para `OpenAiAdapter` — envia prompt, recebe completion
- [x] 🟢 GREEN: Implementar `OpenAiAdapter` que implementa `LlmPort`
- [x] 🟢 GREEN: API key via construtor (gerenciada por env var no App)

---

## Etapa 7.4 — Caso de Uso: Router de Provedor

### Tarefas (TDD)

- [x] 🔴 RED: Teste para `LlmRouter` — seleciona provedor conforme ordem da chain
- [x] 🔴 RED: Teste para fallback: se provedor primário falha, tenta secundário
- [x] 🟢 GREEN: Implementar `LlmRouter` como caso de uso de orquestração

---

## Etapa 7.6 — Orquestração: Pipeline de Agentes (CrewAI Model)

### Tarefas (TDD)

- [x] 🔴 RED: Teste para `AgentSupervisor` — encaminha requisição para agente especialista
- [x] 🟢 GREEN: Implementar modelo Supervisor → Specialists

---

## Entregáveis do Milestone 7

| Artefato         | Status  | Descrição                                       |
| ---------------- | ------- | ----------------------------------------------- |
| OllamaAdapter    | ✅ Done | Local-first integration                         |
| OpenAiAdapter    | ✅ Done | OpenAI API implementation                       |
| LlamaCppAdapter  | ✅ Done | Native /completion API integration              |
| AnthropicAdapter | ✅ Done | Messages API integration                        |
| GeminiAdapter    | ✅ Done | GenerateContent API implementation              |
| CircuitBreaker   | ✅ Done | State-aware resilience pattern                  |
| ContextInjector  | ✅ Done | Entity-based RAG context engineering            |
| LlmRouter        | ✅ Done | Fallback mechanism implemented                  |
| AgentSupervisor  | ✅ Done | Supervisor delegation model implemented         |
