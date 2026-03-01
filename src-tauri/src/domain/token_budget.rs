use crate::domain::error::{AppError, AppResult};

pub struct TokenBudgetCalculator {
    max_tokens: usize,
}

impl TokenBudgetCalculator {
    pub fn new(max_tokens: usize) -> Self {
        Self { max_tokens }
    }

    /// Estimativa simples: 1 token ~= 4 caracteres para inglês/português básico.
    /// Em uma implementação real, usaríamos um tokenizer como tiktoken.
    pub fn estimate_tokens(&self, text: &str) -> usize {
        text.len() / 4
    }

    pub fn validate_budget(&self, current_text: &str, new_snippet: &str) -> AppResult<()> {
        let current_tokens = self.estimate_tokens(current_text);
        let new_tokens = self.estimate_tokens(new_snippet);
        
        if current_tokens + new_tokens > self.max_tokens {
            return Err(AppError::Validation(format!(
                "Token budget exceeded: {} + {} > {}",
                current_tokens, new_tokens, self.max_tokens
            )));
        }
        
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_estimate_tokens() {
        let calculator = TokenBudgetCalculator::new(100);
        let text = "This is a test sentence."; // 24 chars
        assert_eq!(calculator.estimate_tokens(text), 6);
    }

    #[test]
    fn test_validate_budget_overflow() {
        let calculator = TokenBudgetCalculator::new(10);
        let current = "This is a long text that uses many tokens."; // ~42 chars -> 10 tokens
        let snippet = "More text."; // 10 chars -> 2 tokens
        
        let result = calculator.validate_budget(current, snippet);
        assert!(result.is_err());
        if let Err(AppError::Validation(msg)) = result {
            assert!(msg.contains("Token budget exceeded"));
        } else {
            panic!("Expected validation error");
        }
    }
}
