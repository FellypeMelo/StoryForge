import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import { CodexDashboard } from "../CodexDashboard";
import { ToastProvider } from "../../shared/Toast";
import { mockDb } from "../../../../test/mock-db";
import {
  getStandardSeed,
  STANDARD_PROJECT_ID,
  STANDARD_BOOK_ID,
} from "../../../../test/seeds/standard-seed";

const invokeMock = vi.mocked(invoke);

const renderDashboard = () =>
  render(
    <ToastProvider>
      <CodexDashboard
        projectId={STANDARD_PROJECT_ID}
        bookId={STANDARD_BOOK_ID}
        onBack={vi.fn()}
      />
    </ToastProvider>,
  );

const waitForNotLoading = async () => {
  await waitFor(
    () => {
      expect(screen.queryByText(/Consultando os arquivos/i)).not.toBeInTheDocument();
    },
    { timeout: 10000 },
  );
};

describe("CodexDashboard UX", () => {
  beforeEach(() => {
    mockDb.reset();
    mockDb.seed(getStandardSeed());
    vi.clearAllMocks();
  });

  describe("delete confirmation", () => {
    it("should open a confirmation dialog and only delete a world rule after confirming", async () => {
      renderDashboard();
      fireEvent.click(screen.getByRole("button", { name: /Regras/i }));
      await waitForNotLoading();

      fireEvent.click(await screen.findByText(/Toda magia exige/i));
      fireEvent.click(await screen.findByTitle("Excluir Regra"));

      expect(await screen.findByRole("dialog")).toBeInTheDocument();
      expect(invokeMock.mock.calls.map((c) => c[0])).not.toContain("delete_world_rule");

      // Cancelar mantém a regra
      fireEvent.click(screen.getByRole("button", { name: /^Cancelar$/i }));
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
      expect(invokeMock.mock.calls.map((c) => c[0])).not.toContain("delete_world_rule");

      // Confirmar exclui
      fireEvent.click(await screen.findByTitle("Excluir Regra"));
      fireEvent.click(await screen.findByRole("button", { name: /^Excluir$/i }));

      await waitFor(
        () => {
          expect(screen.queryByText(/Toda magia exige/i)).not.toBeInTheDocument();
        },
        { timeout: 10000 },
      );
      expect(invokeMock.mock.calls.map((c) => c[0])).toContain("delete_world_rule");
    }, 30000);

    it("should ask for confirmation before deleting a character", async () => {
      renderDashboard();
      await waitForNotLoading();

      fireEvent.click(screen.getByText("Alaric"));
      fireEvent.click(await screen.findByRole("button", { name: /Excluir personagem/i }));

      expect(await screen.findByRole("dialog")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /^Excluir$/i }));

      await waitFor(
        () => {
          expect(screen.queryByText("Alaric")).not.toBeInTheDocument();
        },
        { timeout: 10000 },
      );
      expect(invokeMock.mock.calls.map((c) => c[0])).toContain("delete_character");
    }, 30000);
  });

  describe("toast feedback", () => {
    it("should show an error toast instead of alert when creating a relationship with fewer than 2 characters", async () => {
      const seed = getStandardSeed();
      mockDb.reset();
      mockDb.seed({ ...seed, characters: [seed.characters[0]], relationships: [] });

      renderDashboard();
      await waitForNotLoading();

      fireEvent.click(screen.getByRole("button", { name: /Relacionamentos/i }));
      await waitForNotLoading();
      fireEvent.click(screen.getByText(/Adicionar Relacionamento/i));

      expect(await screen.findByRole("alert")).toHaveTextContent(/pelo menos 2 personagens/i);
      expect(screen.queryByLabelText(/Natureza do Vínculo/i)).not.toBeInTheDocument();
    }, 30000);
  });

  describe("error states", () => {
    it("should show an error state with retry when loading data fails", async () => {
      invokeMock.mockRejectedValueOnce(new Error("db offline"));
      renderDashboard();

      expect(await screen.findByText(/Não foi possível carregar/i)).toBeInTheDocument();
      expect(screen.queryByText("Alaric")).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /Tentar novamente/i }));

      expect(await screen.findByText("Alaric")).toBeInTheDocument();
      expect(screen.queryByText(/Não foi possível carregar/i)).not.toBeInTheDocument();
    }, 30000);

    it("should show an error state with retry when search fails", async () => {
      renderDashboard();
      await waitForNotLoading();

      invokeMock.mockRejectedValueOnce(new Error("search broke"));
      fireEvent.change(screen.getByPlaceholderText(/Pesquisar sabedoria/i), {
        target: { value: "Alaric" },
      });

      expect(await screen.findByText(/A busca falhou/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /Tentar novamente/i }));

      expect(await screen.findByText(/Resultados da Busca/i)).toBeInTheDocument();
      expect(await screen.findByText("Alaric")).toBeInTheDocument();
    }, 30000);
  });

  describe("accessibility", () => {
    it("should render character cards as keyboard-accessible buttons", async () => {
      renderDashboard();
      await waitForNotLoading();

      expect(screen.getByRole("button", { name: /Alaric/i })).toBeInTheDocument();
    }, 30000);
  });
});
