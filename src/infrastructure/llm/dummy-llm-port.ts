import { LlmPort, LlmResponse, LlmOptions } from "../../domain/ideation/ports/llm-port";

/**
 * Dummy implementation of LlmPort for development and testing.
 * Returns predefined mock responses based on prompt content.
 */
export class DummyLlmPort implements LlmPort {
  async complete(prompt: string, _options?: LlmOptions): Promise<LlmResponse> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // CHI Cliche Extraction
    if (prompt.includes("common cliches") && prompt.includes("Fantasia")) {
      return { text: "O Escolhido, O Lorde das Trevas, Espada Mágica, Profecia Antiga, Mentor que Morre" };
    }
    if (prompt.includes("common cliches") && prompt.includes("Ficção Científica")) {
      return { text: "IA Assassina, Império Galáctico, Viagem no Tempo, Alienígenas Hostis, Arma de Destruição em Massa" };
    }

    // CHI Premise Generation
    if (prompt.includes("JSON array") && prompt.includes("cross-pollinating")) {
      const premises = [
        {
          protagonist: "Um botânico que vive isolado em uma estação espacial",
          incitingIncident: "Descobre que as plantas que cultiva estão mimetizando a voz de sua esposa falecida",
          antagonist: "A corporação que quer extrair o 'óleo da memória' das plantas",
          stakes: "A sanidade do protagonista e a preservação da última conexão com sua amada"
        },
        {
          protagonist: "Uma especialista em biologia marinha com fobia de água",
          incitingIncident: "Encontra um artefato abissal que reage apenas ao seu DNA",
          antagonist: "Uma seita que acredita que o artefato é a chave para o apocalipse",
          stakes: "O equilíbrio dos oceanos e a sobrevivência das cidades costeiras"
        },
        {
          protagonist: "Um arqueólogo de dados em um futuro distópico",
          incitingIncident: "Recupera um HD de 2024 que contém a localização de uma semente física real",
          antagonist: "A inteligência artificial que controla o suprimento de comida sintética",
          stakes: "A chance de restaurar a biodiversidade no planeta Terra"
        }
      ];
      return { text: JSON.stringify(premises) };
    }

    // CHI Validation
    if (prompt.includes("Critically analyze")) {
      return { 
        text: JSON.stringify({ 
          isValid: true, 
          reason: "Conflito central forte. A premissa apresenta uma subversão clara de tropos e riscos emocionais bem definidos." 
        }) 
      };
    }
    
    // Worldbuilding CAD
    if (prompt.includes("Physics") || prompt.includes("Magic")) {
      return { text: "Regras de física baseadas em ressonância sonora vegetal e harmonia quântica." };
    }
    if (prompt.includes("Economy")) {
      return { text: "Economia baseada na troca de sementes de memória e créditos de oxigênio purificado." };
    }
    if (prompt.includes("Sociology")) {
      return { text: "Sociedade organizada em clãs de jardineiros estelares com hierarquia baseada na diversidade biológica mantida." };
    }
    if (prompt.includes("Zones")) {
      return { text: "Conflitos ideológicos entre tecnocratas expansionistas e preservacionistas orgânicos radicais." };
    }

    return { text: "Resposta simulada da Forja para: " + prompt.substring(0, 50) + "..." };
  }
}
