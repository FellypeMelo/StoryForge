import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocationList } from "./LocationList";
import { Location } from "../../domain/location";
import { LocationId } from "../../domain/value-objects/bible-ids";
import { ProjectId } from "../../domain/value-objects/project-id";

const pId = ProjectId.generate();

const mockLocations: Location[] = [
  Location.create({
    id: LocationId.generate(),
    projectId: pId,
    name: "The Capital",
    description: "The biggest city",
  }),
  Location.create({
    id: LocationId.generate(),
    projectId: pId,
    name: "Ancient Ruins",
    description: "A mysterious place",
  }),
];

describe("LocationList", () => {
  it("should render a list of locations", () => {
    render(<LocationList locations={mockLocations} />);

    expect(screen.getByText("The Capital")).toBeInTheDocument();
    expect(screen.getByText("Ancient Ruins")).toBeInTheDocument();
  });

  it("should show empty state", () => {
    render(<LocationList locations={[]} />);
    expect(screen.getByText(/Nenhum local encontrado/i)).toBeInTheDocument();
  });
});
