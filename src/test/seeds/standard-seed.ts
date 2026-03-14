export const STANDARD_PROJECT_ID = "550e8400-e29b-41d4-a716-446655440000";
export const STANDARD_BOOK_ID = "550e8400-e29b-41d4-a716-446655440001";

export const getStandardSeed = () => {
  const char1Id = "550e8400-e29b-41d4-a716-446655440010";
  const char2Id = "550e8400-e29b-41d4-a716-446655440011";

  return {
    projects: [
      { id: STANDARD_PROJECT_ID, title: "A Forja das Sombras", description: "Uma fantasia épica." }
    ],
    books: [
      { id: STANDARD_BOOK_ID, project_id: STANDARD_PROJECT_ID, title: "Livro 1: O Despertar", summary: "O início da jornada." }
    ],
    characters: [
      {
        id: char1Id,
        project_id: STANDARD_PROJECT_ID,
        book_id: STANDARD_BOOK_ID,
        name: "Alaric",
        ocean_scores: {
          openness: 80,
          conscientiousness: 50,
          extraversion: 70,
          agreeableness: 60,
          neuroticism: 40,
        },
        hauge_identity: "Guerreiro solitário",
        hauge_essence: "Líder nato",
        voice_sentence_length: "Curta",
        voice_formality: "Informal",
        voice_verbal_tics: "[]",
        voice_evasion_mechanism: "Sarcasmo",
        physical_tells: JSON.stringify(["Coça a cicatriz no braço", "Evita contato visual direto", "Aperta o cabo da espada"])
      },
      {
        id: char2Id,
        project_id: STANDARD_PROJECT_ID,
        book_id: STANDARD_BOOK_ID,
        name: "Elara",
        ocean_scores: {
          openness: 90,
          conscientiousness: 90,
          extraversion: 30,
          agreeableness: 80,
          neuroticism: 20,
        },
        hauge_identity: "Eremita",
        hauge_essence: "Guardiã do conhecimento",
        voice_sentence_length: "Longa",
        voice_formality: "Formal",
        voice_verbal_tics: "[]",
        voice_evasion_mechanism: "Enigmas",
        physical_tells: JSON.stringify(["Ajusta os óculos", "Olha para o horizonte", "Cruza os braços calmamente"])
      }
    ],
    locations: [
      {
        id: "550e8400-e29b-41d4-a716-446655440020",
        project_id: STANDARD_PROJECT_ID,
        book_id: STANDARD_BOOK_ID,
        name: "Vale do Eco",
        description: "Um vale onde o som nunca morre.",
        symbolic_meaning: "O peso do passado"
      }
    ],
    worldRules: [
      {
        id: "550e8400-e29b-41d4-a716-446655440030",
        project_id: STANDARD_PROJECT_ID,
        book_id: STANDARD_BOOK_ID,
        category: "Magia",
        content: "Toda magia exige um sacrifício físico.",
        hierarchy: 1
      }
    ],
    timelineEvents: [
      {
        id: "550e8400-e29b-41d4-a716-446655440040",
        project_id: STANDARD_PROJECT_ID,
        book_id: STANDARD_BOOK_ID,
        description: "A Quebra do Selo",
        date: "Ano 0",
        causal_dependencies: "[]"
      }
    ],
    relationships: [
      {
        id: "550e8400-e29b-41d4-a716-446655440050",
        project_id: STANDARD_PROJECT_ID,
        book_id: STANDARD_BOOK_ID,
        character_a: char1Id,
        character_b: char2Id,
        type: "Mestre e Aprendiz",
        description: "Elara ensina Alaric a controlar seus impulsos."
      }
    ],
    blacklistEntries: [
      {
        id: "550e8400-e29b-41d4-a716-446655440060",
        project_id: STANDARD_PROJECT_ID,
        book_id: STANDARD_BOOK_ID,
        term: "Escolhido",
        category: "Clichê",
        reason: "Evitar o tropo do herói predestinado sem falhas."
      }
    ]
  };
};
