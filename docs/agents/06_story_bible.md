# 📚 Agente Bíblia da História

> **Módulo StoryForge:** Bíblia da História (Lorebook)  
> **Base Teórica:** Manual de Escrita Criativa com IA — Parte 6 (6.3)  
> **Responsabilidade:** Manter consistência narrativa, alimentar contexto RAG, detectar inconsistências.

---

## 1. Problema Central

A **degradação de contexto** é a falha letal da IA em textos longos. O LLM "esquece" regras do mundo, nomes de personagens secundários e motivações após poucas iterações.

---

## 2. Estrutura da Bíblia da História

O documento central (Lorebook) organiza o conhecimento narrativo em seções:

| Seção | Conteúdo | Formato |
|-------|----------|---------|
| **Personagens** | Fichas OCEAN + Hauge + Voz + Tells | Ficha estruturada |
| **Locais** | Descrição física, atmosfera, significado simbólico | Texto + metadados |
| **Regras do Mundo** | Física/magia, economia, sociologia, religião | Hierarquia CAD |
| **Cronologia** | Timeline de eventos com datas e dependências causais | Lista ordenada |
| **Relacionamentos** | Grafos de relação entre personagens | Pares + tipo de relação |
| **Blacklists** | Clichês proibidos, palavras banidas, AI-ismos | Listas negras |
| **Estado Atual** | Status de cada personagem no ponto atual da narrativa | Snapshot |

---

## 3. Prompt de Injeção de Continuidade (RAG Sintético)

Para cada geração de texto, o sistema injeta um bloco de continuidade:

```
"SISTEMA DE CONTINUIDADE:
Você está escrevendo o Livro [X], Capítulo [Y].

Aqui está a Bíblia da História (trechos relevantes):
[TRECHO RAG SELECIONADO AUTOMATICAMENTE]

Resumo do Capítulo Anterior:
[Ex: João perdeu a arma no rio e fraturou o braço direito]

Status Atual:
[Ex: João está escondido em um celeiro, sofrendo dor aguda no braço e desarmado]

Com base neste estado, continue a narrativa a partir daqui..."
```

---

## 4. Pipeline RAG

### 4.1 Armazenamento

- **SQLite** (estruturado) para fichas, cronologia, metadados.
- **SQLite FTS5** ou **sqlite-vec** para busca semântica de trechos relevantes.
- **Arquivos JSON** para exportação/importação.

### 4.2 Fluxo de Consulta

```
Requisição de escrita do usuário
    ↓
Extração de entidades mencionadas (personagens, locais, eventos)
    ↓
Busca RAG: apenas trechos relevantes da Bíblia
    ↓
Injeção no contexto do LLM (Prompt de Continuidade)
    ↓
Geração de texto com contexto enriquecido
```

### 4.3 Regra de Economia

> Injetar **apenas trechos relevantes**. Nunca inundar o contexto com a Bíblia inteira.

---

## 5. Alimentação da Bíblia

### 5.1 Alimentação Manual

O autor adiciona/edita diretamente fichas, locais, cronologia.

### 5.2 Extração Automática

A IA analisa capítulos escritos e sugere atualizações:
- Novos personagens mencionados
- Mudanças de estado (ferimentos, localizações, relações)
- Novos locais ou regras do mundo

**Regra:** Todas as extrações automáticas requerem **aprovação do usuário** antes de integrar a Bíblia.

---

## 6. Sistema de Alertas de Inconsistência

O agente monitora contradições entre o texto gerado e a Bíblia:

| Tipo de Inconsistência | Exemplo | Ação |
|------------------------|---------|------|
| **Factual** | Personagem usa braço fraturado normalmente | Alerta imediato |
| **Temporal** | Evento referenciado antes de acontecer | Alerta + sugestão de correção |
| **Caracterização** | Personagem introvertido (E: Baixo) lidera discurso público | Alerta com referência à ficha OCEAN |
| **Regra do mundo** | Magia usada onde foi estabelecida como impossível | Alerta com referência ao worldbuilding |

---

## 7. Checklist de Consistência

- [ ] A Bíblia contém todos os personagens ativos?
- [ ] O estado atual de cada personagem está sincronizado com o último capítulo?
- [ ] A cronologia de eventos está atualizada?
- [ ] Os trechos RAG injetados são relevantes (não ruidosos)?
- [ ] As extrações automáticas foram revisadas pelo autor?

---

## 8. Integração com StoryForge

- **Input:** Todo o conteúdo do projeto (capítulos, fichas, worldbuilding)
- **Output:** Contexto RAG filtrado para cada geração + alertas de inconsistência
- **Armazenamento:** SQLite via Tauri + FTS5/sqlite-vec
- **Exportação:** JSON para portabilidade
- **Alimenta:** Todos os outros módulos (`05_writing_assistant.md`, `07_bad_cop_editor.md`)
