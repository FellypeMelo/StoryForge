### 1. Identidade do Projeto

**Nome:** StoryForge  
**Tagline:** *Forjando narrativas, capítulo por capítulo.*

**Descrição oficial:**  
StoryForge é um assistente inteligente de escrita criativa que combina técnicas narrativas profissionais com IA generativa. Planeje personagens profundos, estruture capítulos com frameworks consagrados e escreva com assistência contextual — tudo em um ambiente local, privado e extensível.

### 2. Objetivos Principais

- Fornecer uma ferramenta gratuita e open source para escritores de todos os níveis, desde amadores até profissionais.
- Implementar na prática as melhores técnicas de narratologia e engenharia de prompt, conforme o manual de referência.
- Oferecer flexibilidade de uso: **offline-first** (modelos locais) para usuários técnicos e **online via APIs pagas** (com opções gratuitas como Gemini) para usuários que preferem simplicidade.
- Garantir total privacidade: todos os dados ficam na máquina do usuário, sem telemetria forçada ou armazenamento em nuvem.
- Ser extensível via futuros addons/plugins (a serem definidos em versões posteriores).

### 3. Público-Alvo

- Escritores de ficção (romances, contos, roteiros).
- Autores de não-ficção que desejam estruturar obras.
- Mestres de RPG que precisam criar mundos e personagens consistentes.
- Estudantes e professores de escrita criativa.
- Entusiastas de IA que querem experimentar modelos locais.

### 4. Funcionalidades Principais (Escopo MVP e Expansões)

**Módulo de Ideação e Premissa (Método CHI):**
- Geração de conceitos originais com polinização cruzada de temas.
- Identificação e bloqueio automático de clichês.
- Definição de conflito central (protagonista + incidente + antagonista).

**Módulo de Personagens Profundos:**
- Perfil baseado no modelo Big Five (OCEAN) com sliders e descrições.
- Arco interno segundo Michael Hauge (Ferida, Crença, Medo, Identidade, Essência).
- Definição de voz: tiques verbais, linguagem corporal, regras sintáticas.
- Sugestões de reações coerentes com o perfil psicológico.

**Módulo de Estrutura Narrativa:**
- Suporte a múltiplos frameworks: Jornada do Herói, Save the Cat, 7 Pontos, Kishōtenketsu.
- Criador visual de estruturas personalizadas.
- Geração automática de beats com base na estrutura escolhida.

**Módulo de Outlining de Capítulos:**
- Aplicação do padrão **Cena e Sequel** (Dwight Swain).
- Definição de Goal, Conflict, Disaster para cada cena.
- Definição de Reaction, Dilemma, Decision para cada sequela.
- Sugestão de cliffhangers estratégicos (pre-point, climactic, post-point).

**Módulo de Escrita Assistida:**
- Editor WYSIWYG (TipTap) com suporte a Markdown.
- Acionamento contextual de IA: selecione um trecho e peça reescrita, expansão, refinamento, variação de tom, etc.
- Comentários/sugestões da IA inline (modo revisão).
- "Bad Cop Editor": análise estrutural automática baseada em critérios do manual (causalidade, profundidade, anti-patterns, show-don't-tell).

**Módulo Bíblia da História:**
- Repositório central de personagens, locais, regras de mundo, cronologia.
- Armazenamento em SQLite (estruturado) + arquivos JSON para exportação.
- Alimentação manual e extração automática a partir dos capítulos (com aprovação do usuário).
- Consulta via RAG: apenas trechos relevantes são injetados no contexto da IA.
- Alertas de inconsistência quando a IA sugere algo que contradiz a Bíblia.

**Gestão de Provedores de IA:**
- Suporte a múltiplos provedores:
  - **Locais (offline):** llama.cpp (embutido, download automático de modelos via app), Ollama.
  - **Online:** OpenAI, Anthropic, Google Gemini (com destaque para a API gratuita do Gemini).
- Interface para inserir chaves de API (quando aplicável) e configurar limites de tokens/custos.
- Descoberta automática de serviços locais (ex: detectar se Ollama está rodando).
- Fallback entre provedores (ex: se online falhar, tenta local).

**Armazenamento e Exportação:**
- Projetos salvos em SQLite local via Tauri.
- Exportação para Markdown, DOCX e PDF (com qualidade tipográfica).
- Importação de arquivos Markdown existentes.

**Modos de Operação:**
- **Offline-first:** recomendado para usuários técnicos; todos os recursos funcionam com modelos locais.
- **Online com APIs:** para usuários que preferem simplicidade ou não têm hardware para modelos locais.
- **Modo Conservador (opcional):** IA sugere menos intervenções, priorizando a voz do autor.

**Validação de Qualidade:**
- Detectores heurísticos de anti-patterns (listas negras de palavras, frases comuns de IA).
- Modelos auxiliares (pequenos classificadores) para auditar trechos em background.
- Alertas não intrusivos, com sugestões de melhoria.

### 5. Stack Tecnológica

| Camada        | Tecnologias                                                                 |
|---------------|-----------------------------------------------------------------------------|
| **Frontend**  | SvelteKit + TypeScript, TipTap (editor), TailwindCSS, Shadcn-Svelte (UI)   |
| **Backend Nativo** | Tauri (Rust) – comunicação com sistema de arquivos, SQLite, processos locais |
| **Orquestração de IA** | LangGraph (microserviço em Python + FastAPI) – fluxos determinísticos |
| **Provedores de IA** | llama.cpp (embarcado), Ollama (integração), OpenAI, Anthropic, Gemini |
| **Armazenamento** | SQLite (via Tauri), com exportação/importação JSON                          |
| **RAG e Busca** | SQLite FTS5 ou vector search local (ex: sqlite-vec) para trechos relevantes |
| **Build/Dev** | Vite, pnpm, Rust toolchain, Python 3.11+                                    |

### 6. Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (SvelteKit)                      │
│  • Editor TipTap                     • Painéis de controle   │
│  • Visualização de estrutura         • Notificações          │
└─────────────────────────────────┬───────────────────────────┘
                                  │ IPC (Tauri bridge)
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND NATIVO (Tauri/Rust)                │
│  • Gerenciamento de projetos (SQLite)                        │
│  • Interface com sistema de arquivos                         │
│  • Controle de processos (llama.cpp, Ollama)                 │
│  • Cache de respostas e modelos                              │
└─────────────────────────────────┬───────────────────────────┘
                                  │ HTTP (ou IPC local)
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│               MICROSSERVIÇO LANGGRAPH (Python/FastAPI)       │
│  • Orquestração de fluxos de IA (ideação, escrita, revisão)  │
│  • Gerenciamento de prompts e templates                      │
│  • RAG sobre a Bíblia da História                            │
│  • Seleção de provedor e fallback                            │
└─────────────────────────────────────────────────────────────┘
```

**Observações:**  
- O microserviço LangGraph pode rodar na mesma máquina (localhost) e ser iniciado/gerenciado pelo Tauri.  
- A comunicação entre Tauri e o serviço Python é via HTTP (ou socket, se necessário).  
- Para modelos locais, o Tauri pode chamar diretamente a biblioteca llama.cpp (via bindings Rust) ou executar o binário.

### 7. Licenciamento

**Licença principal do core:** **GNU Affero General Public License v3.0 (AGPL-3.0)** – garantindo que o software permaneça livre e aberto, e que qualquer modificação ou serviço hospedado também seja disponibilizado sob a mesma licença.
