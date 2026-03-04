import { expect, test, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { IdeationWizard } from "./IdeationWizard";

// Mock Tauri API
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(async (cmd) => {
    if (cmd === "create_blacklist_entry") return { id: "new-id" };
    if (cmd === "create_world_rule") return { id: "rule-id" };
    return [];
  }),
}));

test("IdeationWizard - full flow transitions", async () => {
  const onBack = vi.fn();
  render(
    <IdeationWizard
      projectId="123e4567-e89b-12d3-a456-426614174000"
      bookId="123e4567-e89b-12d3-a456-426614174001"
      onBack={onBack}
    />,
  );

  // Step 1: Cliche Extraction
  expect(screen.getByText(/Forja de Ideias \(CHI\)/i)).toBeInTheDocument();
  expect(screen.getByText(/Escolha seu Gênero/i)).toBeInTheDocument();

  // Select genre
  const fantasyBtn = screen.getByText("Fantasia");
  fireEvent.click(fantasyBtn);

  // Click Map Cliches
  const mapBtn = screen.getByText("Mapear Clichês");
  fireEvent.click(mapBtn);

  // Wait for cliches to appear and next step button
  await waitFor(
    () => {
      expect(screen.getByText(/Continuar para Hibridização/i)).toBeInTheDocument();
    },
    { timeout: 10000 },
  );

  fireEvent.click(screen.getByText(/Continuar para Hibridização/i));

  // Step 2: Hibridização
  expect(screen.getByText(/Hibridização/i)).toBeInTheDocument();
  expect(screen.getByText(/Combine Fantasia com uma disciplina acadêmica/i)).toBeInTheDocument();

  // Select discipline
  const botanyBtn = screen.getByText("Botânica");
  fireEvent.click(botanyBtn);

  // Generate Premises
  const generateBtn = screen.getByText("Gerar 3 Premissas Únicas");
  fireEvent.click(generateBtn);

  // Wait for premises to appear
  await waitFor(
    () => {
      expect(screen.getByText("Premissa 1")).toBeInTheDocument();
    },
    { timeout: 10000 },
  );

  // Select a premise (this should trigger next step)
  fireEvent.click(screen.getByText("Premissa 1"));

  // Step 3: Inversão e Validação
  expect(screen.getByText(/Inversão e Validação/i)).toBeInTheDocument();

  // Click Validate
  const validateBtn = screen.getByText("Validar Potencial Dramático");
  fireEvent.click(validateBtn);

  // Wait for validation result
  await waitFor(
    () => {
      expect(screen.getByText(/Análise da Forja/i)).toBeInTheDocument();
    },
    { timeout: 10000 },
  );

  // Click Accept and Forge
  const finishBtn = screen.getByText(/Aceitar e Forjar Universo/i);
  fireEvent.click(finishBtn);

  // Wait for finish
  await waitFor(
    () => {
      expect(onBack).toHaveBeenCalled();
    },
    { timeout: 15000 },
  );
}, 30000);
