# Tech Stack: StoryForge

## Core & Runtime
- **Backend:** Rust (Tauri) - High-performance system backend with native IPC and cross-platform portability.
- **Frontend:** React + Tailwind CSS - Modular, distraction-free UI.

## Persistence & Search
- **Database:** SQLite - Reliable, local relational storage.
- **Vector Search:** `sqlite-vec` + FTS5 - Local semantic search and full-text indexing for RAG (Story Bible).

## GenAI & Orchestration
- **Providers:** Multi-provider API support:
  - Cloud: OpenAI, Anthropic Claude, Google Gemini.
  - Local: Ollama (Llama 3), llama.cpp.
- **Agent Orchestration:** 
  - **CrewAI:** Local agent squad management.
  - **LangGraph:** CI/CD pipelines and complex stateful workflows.

## Infrastructure & Engineering
- **Architecture:** Clean Architecture with Vertical Slicing.
- **Methodology:** AI-XP (AI eXtreme Programming).
- **Quality Control:** LangGraph + SonarQube (SAST) for self-healing CI/CD.
