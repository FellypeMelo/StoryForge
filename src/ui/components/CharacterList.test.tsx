import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CharacterList } from "./CharacterList";
import { Character } from "../../domain/character";

import { CharacterId } from "../../domain/value-objects/character-id";
import { ProjectId } from "../../domain/value-objects/project-id";

const pId = ProjectId.generate();

const mockCharacters: Character[] = [
  Character.create({
    id: CharacterId.generate(),
    projectId: pId,
    name: "John Doe",
    age: 30,
    occupation: "Writer",
  }),
  Character.create({
    id: CharacterId.generate(),
    projectId: pId,
    name: "Jane Smith",
    age: 25,
    occupation: "Artist",
  }),
];

describe("CharacterList", () => {
  it("should render a list of characters", () => {
    render(<CharacterList characters={mockCharacters} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Writer")).toBeInTheDocument();
    expect(screen.getByText("Artist")).toBeInTheDocument();
  });

  it("should highlight injected characters", () => {
    const injectedIds = [mockCharacters[0].id.value];
    render(<CharacterList characters={mockCharacters} injectedIds={injectedIds} />);
    
    expect(screen.getByText(/Injected/i)).toBeInTheDocument();
  });

  it("should show empty state when no characters are provided", () => {
    render(<CharacterList characters={[]} />);
    expect(screen.getByText(/No characters found/i)).toBeInTheDocument();
  });
});
