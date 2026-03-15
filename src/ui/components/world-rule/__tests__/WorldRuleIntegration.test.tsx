import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorldRuleList } from "../WorldRuleList";
import { WorldRuleForm } from "../WorldRuleForm";
import { WorldRule } from "../../../../domain/world-rule";
import { WorldRuleId } from "../../../../domain/value-objects/codex-ids";
import { ProjectId } from "../../../../domain/value-objects/project-id";
import { BookId } from "../../../../domain/value-objects/book-id";

describe("WorldRule Components", () => {
  const projectId = ProjectId.create("550e8400-e29b-41d4-a716-446655440000");
  const bookId = BookId.create("550e8400-e29b-41d4-a716-446655440001");
  
  const mockRule = WorldRule.create({
    id: WorldRuleId.create("550e8400-e29b-41d4-a716-446655440030"),
    projectId,
    bookId,
    category: "Magia",
    content: "Toda magia exige um sacrifício físico.",
    hierarchy: 1
  });

  describe("WorldRuleList", () => {
    it("should render list of rules", () => {
      const onSelect = vi.fn();
      render(<WorldRuleList rules={[mockRule]} onSelect={onSelect} />);

      expect(screen.getByText("Magia")).toBeInTheDocument();
      expect(screen.getByText(/Toda magia exige/i)).toBeInTheDocument();
      
      fireEvent.click(screen.getByText(/Toda magia exige/i));
      expect(onSelect).toHaveBeenCalledWith(mockRule);
    });

    it("should show empty state", () => {
      const onCreateNew = vi.fn();
      render(<WorldRuleList rules={[]} onCreateNew={onCreateNew} />);

      expect(screen.getByText(/Nenhuma regra encontrada/i)).toBeInTheDocument();
      fireEvent.click(screen.getByText(/Criar Regra/i));
      expect(onCreateNew).toHaveBeenCalled();
    });
  });

  describe("WorldRuleForm", () => {
    it("should render form with existing data and handle save", () => {
      const onSave = vi.fn();
      const onCancel = vi.fn();
      render(<WorldRuleForm rule={mockRule} onSave={onSave} onCancel={onCancel} />);

      const contentInput = screen.getByLabelText(/Conteúdo da Regra/i);
      expect(contentInput).toHaveValue("Toda magia exige um sacrifício físico.");

      fireEvent.change(contentInput, { target: { value: "Novo Conteúdo" } });
      fireEvent.click(screen.getByText(/Salvar Regra/i));

      expect(onSave).toHaveBeenCalled();
      const savedRule = onSave.mock.calls[0][0] as WorldRule;
      expect(savedRule.content).toBe("Novo Conteúdo");
    });

    it("should show error when content is empty", () => {
      const onSave = vi.fn();
      const emptyRule = WorldRule.generate(projectId);
      render(<WorldRuleForm rule={emptyRule} onSave={onSave} onCancel={() => {}} />);

      const contentInput = screen.getByLabelText(/Conteúdo da Regra/i);
      fireEvent.change(contentInput, { target: { value: "" } });
      fireEvent.click(screen.getByText(/Salvar Regra/i));

      expect(screen.getByText(/Conteúdo é obrigatório/i)).toBeInTheDocument();
      expect(onSave).not.toHaveBeenCalled();
    });

    it("should handle hierarchy change", () => {
      render(<WorldRuleForm rule={mockRule} onSave={() => {}} onCancel={() => {}} />);
      const hierarchyInput = screen.getByLabelText(/Hierarquia/i);
      fireEvent.change(hierarchyInput, { target: { value: "5", name: "hierarchy" } });
      expect(hierarchyInput).toHaveValue(5);
    });

    it("should call onCancel", () => {
      const onCancel = vi.fn();
      render(<WorldRuleForm rule={mockRule} onSave={() => {}} onCancel={onCancel} />);

      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[0]);
      expect(onCancel).toHaveBeenCalled();
    });
  });
});
