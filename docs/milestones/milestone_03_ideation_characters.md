# 🧠 Milestone 3 — Ideação CHI & Construtor de Personagens

> **Fase:** Primeiro Agente Criativo  
> **Objetivo:** Implementar os dois primeiros módulos do pipeline literário: Ideação via Método CHI (anti-clichê) e Construtor de Personagens Profundos (OCEAN + Hauge).  
> **Base Teórica:** [`01_ideation_chi.md`](../agents/01_ideation_chi.md), [`02_character_builder.md`](../agents/02_character_builder.md)  
> **Compliance:** Lei 1 (TDD), Lei 5 (YAGNI), Lei 3 (Economia de Contexto)

---

## Pré-Condições

- [x] Milestone 1 completo (scaffold, IPC, testes)
- [x] Milestone 2 completo (Codex da História, SQLite CRUD, RAG pipeline)

---

## Etapa 3.1 — Domínio: Entidades de Ideação

### Tarefas (TDD)

- [x] 🔴 RED: Teste para entidade `Premise` (protagonist, incitingIncident, antagonist, stakes)
- [x] 🔴 RED: Teste para validação: premissa rejeitada se `stakes` for vago
- [x] 🔴 RED: Teste para entidade `ClicheBlacklist` (genre, banned terms list)
- [x] 🔴 RED: Teste para entidade `CrossPollinationSeed` (genre + academicDiscipline)
- [x] 🟢 GREEN: Implementar entidades com validações rígidas
- [x] 🔵 REFACTOR: Extrair Value Objects — `Genre`, `AcademicDiscipline`

### Critério de Aceite

```
Premissa com antagonista vazio é rejeitada.
Premissa com stakes vagos ("salvar o mundo") é rejeitada.
Entidades puras no domain/.
```

---

## Etapa 3.2 — Caso de Uso: Método CHI (3 Fases)

### Tarefas (TDD)

- [x] 🔴 RED: Teste para `ExtractClichesUseCase` — dado gênero, retorna lista de clichês
- [x] 🟢 GREEN: Implementar use case que instrui LLM a listar clichês (via `LlmPort`)
- [x] 🔴 RED: Teste para `GeneratePremisesUseCase` — dado gênero + disciplina + blacklist, retorna 3 premissas
- [x] 🟢 GREEN: Implementar Fase 2 (Polinização Cruzada) com blacklist injetada
- [x] 🔴 RED: Teste para `ValidatePremiseUseCase` — valida motor de conflito (quer/impede/falha)
- [x] 🟢 GREEN: Implementar Fase 3 (Validação Reversa)
- [x] 🔵 REFACTOR: Compor pipeline `IdeationPipeline` que encadeia as 3 fases

### Interface LlmPort (Domain)

```typescript
interface LlmPort {
  complete(prompt: string, options: LlmOptions): Promise<LlmResponse>;
}
```

### Critério de Aceite

```
Pipeline CHI executa 3 fases em sequência.
Clichês extraídos são persistidos no Codex (BlacklistRepository).
LlmPort é interface no domínio (zero acoplamento com provedor).
```

---

## Etapa 3.3 — Domínio: Ficha de Personagem Completa

### Tarefas (TDD)

- [x] 🔴 RED: Teste para `OceanProfile` (5 traços, scores Baixo/Médio/Alto)
- [x] 🔴 RED: Teste para validação: combination que gera "defeito fatal" descrita
- [x] 🔴 RED: Teste para `HaugeArc` (Wound, Belief, Fear, Identity, Essence)
- [x] 🔴 RED: Teste para regra: Identity e Essence devem estar em oposição direta
- [x] 🔴 RED: Teste para `VoiceProfile` (sentenceLength, formality, verbalTics, evasionMechanism)
- [x] 🔴 RED: Teste para `PhysicalTells` (lista de 3 comportamentos involuntários)
- [x] 🟢 GREEN: Implementar `CharacterSheet` agregando OCEAN + Hauge + Voz + Tells
- [x] 🔵 REFACTOR: Validar completude via método `isComplete()` no aggregate root

### Critério de Aceite

```
CharacterSheet incompleta (sem Hauge) é sinalizada como rascunho.
Identity e Essence em mesmo polo são rejeitadas.
Cada trait OCEAN impacta decisões do personagem.
```

---

## Etapa 3.4 — Caso de Uso: Gerador de Personagens

### Tarefas (TDD)

- [x] 🔴 RED: Teste para `GenerateCharacterUseCase` — dado premissa + role, retorna CharacterSheet
- [x] 🟢 GREEN: Implementar com prompt DRTD (C+R+K+O) conforme template do doc
- [x] 🔴 RED: Teste para regra negativa: personagem "terapeuta perfeito" é rejeitado
- [x] 🟢 GREEN: Implementar guardrail que detecta anti-patterns (voz genérica, otimismo artificial)
- [x] 🔵 REFACTOR: Extrair `CharacterValidator` como serviço de domínio

### Critério de Aceite

```
Personagem gerado possui todos os 5 componentes (OCEAN, Hauge, Voz, Tells, falha moral).
Anti-patterns detectados geram alerta (não bloqueio hard).
Ficha salva no Codex da História via CharacterRepository.
```

---

## Etapa 3.5 — Worldbuilding via CAD (Context-Aware Decomposition)

### Tarefas (TDD)

- [x] 🔴 RED: Teste para `WorldbuildingPipeline` — executa 4 passos em sequência
- [x] 🟢 GREEN: Implementar pipeline:
  1. Definir Física/Sistema de Magia
  2. Derivar Economia a partir da Física
  3. Derivar Sociologia e Religião a partir da Economia
  4. Cruzar dados para zonas de conflito cultural
- [x] 🔵 REFACTOR: Cada passo é um use case isolado, composto pelo pipeline

### Critério de Aceite

```
Worldbuilding monolítico ("crie um mundo inteiro") é bloqueado.
Cada passo mantém tema central ativo.
Resultado persistido como WorldRules no Codex.
```

---

## Etapa 3.6 — UI: Módulo de Ideação & Personagens

### Tarefas

- [x] Criar página `/ideation` com wizard de 3 etapas (CHI)
- [x] Mostrar clichês extraídos (Fase 1) como lista visual marcada em vermelho
- [x] Exibir 3 premissas geradas (Fase 2) com cards comparativos
- [x] Formulário de validação da premissa (Fase 3) com checklist interativa
- [x] Criar página `/characters` com listagem de fichas
- [x] Formulário de criação com seções: OCEAN, Hauge, Voz, Tells
- [x] Visualização da ficha completa com indicador de completude

### Critério de Aceite

```
Wizard CHI é navegável e persiste estado entre etapas.
Fichas de personagem exibem indicador visual de completude.
Design consistente com AppShell.
```

---

## Entregáveis do Milestone 3

| Artefato          | Status       | Descrição                                             |
| ----------------- | ------------ | ----------------------------------------------------- |
| Método CHI        | ✅ Concluído | Pipeline de 3 fases (clichês → premissas → validação) |
| Worldbuilding CAD | ✅ Concluído | Pipeline de 4 passos decompostos                      |
| CharacterSheet    | ✅ Concluído | Aggregate root com OCEAN + Hauge + Voz + Tells        |
| LlmPort           | ✅ Concluído | Interface de domínio para comunicação com LLM         |
| UI Ideação        | ✅ Concluído | Wizard de 3 etapas para geração de premissas          |
| UI Personagens    | ✅ Concluído | CRUD de fichas com suporte a psicologia profunda      |
