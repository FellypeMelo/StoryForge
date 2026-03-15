import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LocationList } from "../LocationList";
import { LocationForm } from "../LocationForm";
import { Location } from "../../../../domain/location";
import { LocationId } from "../../../../domain/value-objects/codex-ids";
import { ProjectId } from "../../../../domain/value-objects/project-id";
import { BookId } from "../../../../domain/value-objects/book-id";

describe("Location Components", () => {
  const projectId = ProjectId.create("550e8400-e29b-41d4-a716-446655440000");
  const bookId = BookId.create("550e8400-e29b-41d4-a716-446655440001");
  
  const mockLocation = Location.create({
    id: LocationId.create("550e8400-e29b-41d4-a716-446655440020"),
    projectId,
    bookId,
    name: "Vale do Eco",
    description: "Um vale sonoro.",
    symbolicMeaning: "Passado"
  });

  describe("LocationList", () => {
    it("should render list of locations", () => {
      const onSelect = vi.fn();
      render(<LocationList locations={[mockLocation]} onSelect={onSelect} />);

      expect(screen.getByText("Vale do Eco")).toBeInTheDocument();
      expect(screen.getByText("Um vale sonoro.")).toBeInTheDocument();
      expect(screen.getByText(/Passado/i)).toBeInTheDocument();
      // Wait, component has: {loc.symbolicMeaning || "Sem significado simbólico"}
      // And class: text-[10px] font-bold tracking-widest uppercase text-text-muted italic
      // Just like before, uppercase is CSS.
      
      fireEvent.click(screen.getByText("Vale do Eco"));
      expect(onSelect).toHaveBeenCalledWith(mockLocation);
    });

    it("should show empty state", () => {
      const onCreateNew = vi.fn();
      render(<LocationList locations={[]} onCreateNew={onCreateNew} />);

      expect(screen.getByText(/Nenhum local encontrado/i)).toBeInTheDocument();
      fireEvent.click(screen.getByText(/Criar Local/i));
      expect(onCreateNew).toHaveBeenCalled();
    });
  });

  describe("LocationForm", () => {
    it("should render form with existing data and handle save", () => {
      const onSave = vi.fn();
      const onCancel = vi.fn();
      render(<LocationForm location={mockLocation} onSave={onSave} onCancel={onCancel} />);

      const nameInput = screen.getByLabelText(/Nome/i);
      expect(nameInput).toHaveValue("Vale do Eco");

      fireEvent.change(nameInput, { target: { value: "Novo Nome" } });
      fireEvent.click(screen.getByText(/Salvar Local/i));

      expect(onSave).toHaveBeenCalled();
      const savedLoc = onSave.mock.calls[0][0] as Location;
      expect(savedLoc.name).toBe("Novo Nome");
    });

    it("should show error when name is empty", () => {
      const onSave = vi.fn();
      const emptyLoc = Location.generate(projectId, "Temp");
      render(<LocationForm location={emptyLoc} onSave={onSave} onCancel={() => {}} />);

      const nameInput = screen.getByLabelText(/Nome/i);
      fireEvent.change(nameInput, { target: { value: "" } });
      fireEvent.click(screen.getByText(/Salvar Local/i));

      expect(screen.getByText(/Nome é obrigatório/i)).toBeInTheDocument();
      expect(onSave).not.toHaveBeenCalled();
    });

    it("should call onCancel", () => {
      const onCancel = vi.fn();
      render(<LocationForm location={mockLocation} onSave={() => {}} onCancel={onCancel} />);

      // The cancel button is an X icon button.
      // <button type="button" onClick={onCancel} className="p-2 ..."> <X size={20} /> </button>
      // It's the first button in the form.
      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[0]);
      expect(onCancel).toHaveBeenCalled();
    });
  });
});
