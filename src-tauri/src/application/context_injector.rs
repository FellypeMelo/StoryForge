use crate::domain::error::AppResult;
use crate::domain::ports::{EntityType, SearchPort, SearchResult};
use crate::domain::token_budget::TokenBudgetCalculator;
use crate::domain::value_objects::ProjectId;

pub struct ContextInjector<'a> {
    search_port: &'a dyn SearchPort,
    budget_calculator: TokenBudgetCalculator,
}

impl<'a> ContextInjector<'a> {
    pub fn new(search_port: &'a dyn SearchPort, max_tokens: usize) -> Self {
        Self {
            search_port,
            budget_calculator: TokenBudgetCalculator::new(max_tokens),
        }
    }

    /// Detecta entidades no texto e constrói o bloco de contexto.
    pub fn inject_context(
        &self,
        project_id: &ProjectId,
        book_id: Option<crate::domain::value_objects::BookId>,
        text: &str,
    ) -> AppResult<String> {
        // Implementação simplificada: buscar por palavras-chave relevantes no texto.
        // Em uma implementação real, usaríamos um extrator de entidades (NER)
        // ou buscaríamos todos os nomes conhecidos de personagens/locais.

        let words: Vec<&str> = text.split_whitespace().collect();
        let mut seen_entities = std::collections::HashSet::new();
        let mut context_block = String::from("--- LORE CONTEXT ---\n");

        for word in words {
            if word.len() < 4 {
                continue;
            } // Ignorar palavras muito curtas

            let results = self
                .search_port
                .search(project_id, word, book_id.clone(), None)?;
            for res in results {
                if seen_entities.contains(&res.entity_id) {
                    continue;
                }

                let snippet = format!("[{}]: {}\n", res.entity_type_str(), res.snippet);

                // Verificar orçamento de tokens
                if self
                    .budget_calculator
                    .validate_budget(&context_block, &snippet)
                    .is_ok()
                {
                    context_block.push_str(&snippet);
                    seen_entities.insert(res.entity_id);
                }
            }
        }

        if seen_entities.is_empty() {
            return Ok(String::new());
        }

        context_block.push_str("--------------------\n");
        Ok(context_block)
    }
}

// Extensão para SearchResult para facilitar exibição no contexto
trait SearchResultExt {
    fn entity_type_str(&self) -> &str;
}

impl SearchResultExt for SearchResult {
    fn entity_type_str(&self) -> &str {
        match self.entity_type {
            EntityType::Character => "Character",
            EntityType::Location => "Location",
            EntityType::WorldRule => "World Rule",
            EntityType::TimelineEvent => "Event",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::ports::SearchResult;

    struct MockSearchPort;
    impl SearchPort for MockSearchPort {
        fn search(
            &self,
            _project_id: &ProjectId,
            query: &str,
            _book_id: Option<crate::domain::value_objects::BookId>,
            _types: Option<Vec<EntityType>>,
        ) -> AppResult<Vec<SearchResult>> {
            if query == "Conan" {
                Ok(vec![SearchResult {
                    entity_id: "char-1".to_string(),
                    entity_type: EntityType::Character,
                    snippet: "Conan the Barbarian, a mighty warrior.".to_string(),
                    score: 1.0,
                }])
            } else {
                Ok(vec![])
            }
        }
    }

    #[test]
    fn test_context_injection() {
        let mock_search = MockSearchPort;
        let injector = ContextInjector::new(&mock_search, 500);
        let project_id = ProjectId("proj-1".to_string());

        let result = injector
            .inject_context(&project_id, None, "Conan enters the tavern.")
            .unwrap();
        assert!(result.contains("LORE CONTEXT"));
        assert!(result.contains("Conan the Barbarian"));
    }

    #[test]
    fn test_context_injection_empty() {
        let mock_search = MockSearchPort;
        let injector = ContextInjector::new(&mock_search, 500);
        let project_id = ProjectId("proj-1".to_string());

        let result = injector
            .inject_context(&project_id, None, "Unknown person enters.")
            .unwrap();
        assert!(result.is_empty());
    }
}
