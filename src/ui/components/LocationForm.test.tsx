import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LocationForm } from "./LocationForm";
import { Location } from "../../domain/location";
import { LocationId } from "../../domain/value-objects/bible-ids";
import { ProjectId } from "../../domain/value-objects/project-id";

const locId = LocationId.generate();
const projId = ProjectId.generate();

const mockLocation = Location.create({
  id: locId,
  projectId: projId,
  name: "Old City",
  description: "A crumbling place",
});

describe("LocationForm", () => {
  it("should render form with data", () => {
    render(<LocationForm location={mockLocation} onSave={() => {}} onCancel={() => {}} />);
    expect(screen.getByDisplayValue("Old City")).toBeInTheDocument();
  });

  it("should call onSave with new data", () => {
    const onSave = vi.fn();
    render(<LocationForm location={mockLocation} onSave={onSave} onCancel={() => {}} />);
    
    const nameInput = screen.getByLabelText(/Nome/i);
    fireEvent.change(nameInput, { target: { value: "New City" } });
    
    fireEvent.click(screen.getByText(/Salvar Local/i));
    
    expect(onSave).toHaveBeenCalled();
    const saved = onSave.mock.calls[0][0] as Location;
    expect(saved.name).toBe("New City");
  });
});
