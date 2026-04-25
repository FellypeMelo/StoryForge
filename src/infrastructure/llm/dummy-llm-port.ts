import { LlmPort, LlmResponse, LlmOptions } from "../../domain/ideation/ports/llm-port";

/**
 * Dummy implementation of LlmPort for development and testing.
 * Returns predefined mock responses based on prompt content.
 */
export class DummyLlmPort implements LlmPort {
  async complete(prompt: string, _options?: LlmOptions): Promise<LlmResponse> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // CHI Cliche Extraction
    if (prompt.includes("common cliches") && prompt.includes("Fantasia")) {
      return {
        text: "O Escolhido, O Lorde das Trevas, Espada Mágica, Profecia Antiga, Mentor que Morre",
      };
    }
    if (prompt.includes("common cliches") && prompt.includes("Ficção Científica")) {
      return {
        text: "IA Assassina, Império Galáctico, Viagem no Tempo, Alienígenas Hostis, Arma de Destruição em Massa",
      };
    }

    // CHI Premise Generation
    if (prompt.includes("JSON array") && prompt.includes("cross-pollinating")) {
      const premises = [
        {
          protagonist: "Um botânico que vive isolado em uma estação espacial",
          incitingIncident:
            "Descobre que as plantas que cultiva estão mimetizando a voz de sua esposa falecida",
          antagonist: "A corporação que quer extrair o 'óleo da memória' das plantas",
          stakes: "A sanidade do protagonista e a preservação da última conexão com sua amada",
        },
        {
          protagonist: "Uma especialista em biologia marinha com fobia de água",
          incitingIncident: "Encontra um artefato abissal que reage apenas ao seu DNA",
          antagonist: "Uma seita que acredita que o artefato é a chave para o apocalipse",
          stakes: "O equilíbrio dos oceanos e a sobrevivência das cidades costeiras",
        },
        {
          protagonist: "Um arqueólogo de dados em um futuro distópico",
          incitingIncident:
            "Recupera um HD de 2024 que contém a localização de uma semente física real",
          antagonist: "A inteligência artificial que controla o suprimento de comida sintética",
          stakes: "A chance de restaurar a biodiversidade no planeta Terra",
        },
      ];
      return { text: JSON.stringify(premises) };
    }

    // CHI Validation
    if (prompt.includes("Critically analyze")) {
      return {
        text: JSON.stringify({
          isValid: true,
          reason:
            "Conflito central forte. A premissa apresenta uma subversão clara de tropos e riscos emocionais bem definidos.",
        }),
      };
    }

    // Worldbuilding CAD
    if (prompt.includes("Physics") || prompt.includes("Magic")) {
      return {
        text: "Regras de física baseadas em ressonância sonora vegetal e harmonia quântica.",
      };
    }
    if (prompt.includes("Economy")) {
      return {
        text: "Economia baseada na troca de sementes de memória e créditos de oxigênio purificado.",
      };
    }
    if (prompt.includes("Sociology")) {
      return {
        text: "Sociedade organizada em clãs de jardineiros estelares com hierarquia baseada na diversidade biológica mantida.",
      };
    }
    if (prompt.includes("Zones")) {
      return {
        text: "Conflitos ideológicos entre tecnocratas expansionistas e preservacionistas orgânicos radicais.",
      };
    }

    // Character Generation
    if (prompt.includes("professional character architect")) {
      const character = {
        ocean: {
          openness: "High",
          conscientiousness: "Medium",
          extraversion: "Low",
          agreeableness: "High",
          neuroticism: "Medium",
        },
        hauge: {
          wound: "Perda da família em um desastre tecnológico",
          belief: "A tecnologia sempre acaba destruindo o que amamos",
          fear: "Ficar sozinho novamente por causa de um erro técnico",
          identity: "O Eremita Tecnológico",
          essence: "O Guardião da Natureza",
        },
        voice: {
          sentenceLength: "Curta",
          formality: "Casual",
          verbalTics: ["entende?", "veja bem"],
          evasionMechanism: "Sarcasmo defensivo",
        },
        tells: [
          "Ajustar os óculos constantemente",
          "Evitar contato visual direto",
          "Bater os dedos na mesa em ritmo binário",
        ],
      };
      return { text: JSON.stringify(character) };
    }

    // Beat Sheet Generation (Dwight Swain Scene & Sequel)
    if (prompt.includes("Dwight Swain") || prompt.includes("Cena e Sequela")) {
      return {
        text: JSON.stringify({
          beats: [
            {
              type: "scene",
              goal: "Find the hidden map in the old library",
              conflict: "The library is on fire and guarded by a hostile librarian",
              disaster: "no-and-worse",
            },
            {
              type: "sequel",
              reaction: "Panics thinking about losing the only connection to grandfather",
              dilemma: [
                "Run into the burning library and risk death",
                "Abandon the quest and fail everything forever",
                "Wait for firemen and lose the map to looters",
              ],
              decision: "Decides to run in with wet clothes",
            },
            {
              type: "scene",
              goal: "Search the burning shelves for the real map",
              conflict: "Ceiling collapses blocking the exit",
              disaster: "yes-but",
            },
            {
              type: "sequel",
              reaction: "Terrified but desperate for answers",
              dilemma: [
                "Stay trapped and lose all hope forever",
                "Risk crushing injury to dig through rubble",
                "Sacrifice the clothes as torch and risk fire spread",
              ],
              decision: "Decides to dig through the rubble with bare hands",
            },
          ],
          cliffhanger: {
            type: "climactic",
            description: "Finds the map but realizes it is a fake — the real one was taken",
          },
          startPolarity: "positive",
          endPolarity: "negative",
        }),
      };
    }

    // EPRL Prose Generation (RSIP: Draft → Critique → Final)
    if (prompt.includes("three-step RSIP") || prompt.includes("Passo 1")) {
      return {
        text: JSON.stringify({
          draft: "The blade struck stone, sending sparks through the damp air. Aria pressed her back against the cold wall, counting her breaths. Three. Four. The corridor beyond remained silent. She traced the mark on her palm — the same mark her grandmother had carved into the cellar door. The sound of footsteps echoed. Too close.",
          critique: "1. 'counting her breaths' is good show-don't-tell, but 'damp air' is generic sensory. 2. The grandmother reference feels like exposition dump — needs to be woven into physical action rather than stated directly.",
          finalVersion: "Steel rang against granite. Sparks hissed against wet stone. Aria flattened herself against the wall, lungs burning, and pressed her branded palm flat — her grandmother's mark still raw, still glowing faint in the dark. Footsteps scraped the corridor. Close enough to taste.",
        }),
      };
    }

    return { text: "Resposta simulada da Forja para: " + prompt.substring(0, 50) + "..." };
  }
}
