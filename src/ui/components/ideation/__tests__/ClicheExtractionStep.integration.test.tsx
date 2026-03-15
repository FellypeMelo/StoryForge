import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ClicheExtractionStep } from "../ClicheExtractionStep";
import { mockDb } from "../../../../test/mock-db";

describe("ClicheExtractionStep Integration", () => {
  const projectId = "550e8400-e29b-41d4-a716-446655440000";
  const mockState = {
    genre: "",
    cliches: [],
    seeds: [],
    hybridPremises: [],
    selectedPremise: null,
    validationResult: null,
  };
  const updateState = vi.fn();
  const onNext = vi.fn();

  beforeEach(() => {
    mockDb.reset();
    vi.clearAllMocks();
  });

  it("should select genre and trigger extraction", async () => {
    render(
      <ClicheExtractionStep 
        state={mockState} 
        updateState={updateState} 
        onNext={onNext} 
        projectId={projectId} 
      />
    );

    // Select genre
    const genreBtn = screen.getByText("Fantasia");
    fireEvent.click(genreBtn);
    expect(updateState).toHaveBeenCalledWith({ genre: "Fantasia" });

    // Update props to simulate state change
    const updatedState = { ...mockState, genre: "Fantasia" };
    render(
      <ClicheExtractionStep 
        state={updatedState} 
        updateState={updateState} 
        onNext={onNext} 
        projectId={projectId} 
      />
    );

    // Trigger extraction
    fireEvent.click(screen.getByText(/Mapear Clichês/i));

    // Wait for extraction (DummyLlmPort takes 1500ms)
    await waitFor(() => {
      expect(updateState).toHaveBeenCalledWith(expect.objectContaining({
        cliches: expect.any(Array)
      }));
    }, { timeout: 3000 });

    const call = updateState.mock.calls.find(c => c[0].cliches);
    expect(call[0].cliches).toContain("O Escolhido");
  });

  it("should show extracted cliches and continue", async () => {
    const stateWithCliches = {
      ...mockState,
      genre: "Fantasia",
      cliches: ["Cliche 1", "Cliche 2"]
    };

    render(
      <ClicheExtractionStep 
        state={stateWithCliches} 
        updateState={updateState} 
        onNext={onNext} 
        projectId={projectId} 
      />
    );

    expect(screen.getByText("Cliche 1")).toBeInTheDocument();
    expect(screen.getByText("Cliche 2")).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Continuar para Hibridização/i));
    expect(onNext).toHaveBeenCalled();
  });
});
