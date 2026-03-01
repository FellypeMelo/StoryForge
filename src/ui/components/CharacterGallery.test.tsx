import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CharacterGallery } from "./CharacterGallery";
import { Character } from "../../domain/character";
import React from "react";

const mockCharacters: Character[] = [
  {
    id: "1",
    project_id: "p1",
    name: "John Doe",
    age: 30,
    occupation: "Writer",
    physical_description: "",
    goal: "",
    motivation: "",
    internal_conflict: "",
    ocean_scores: {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
    },
    voice: "",
    mannerisms: "",
  },
  {
    id: "2",
    project_id: "p1",
    name: "Jane Smith",
    age: 25,
    occupation: "Artist",
    physical_description: "",
    goal: "",
    motivation: "",
    internal_conflict: "",
    ocean_scores: {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
    },
    voice: "",
    mannerisms: "",
  },
];

describe("CharacterGallery", () => {
  it("should render a list of characters", () => {
    render(<CharacterGallery characters={mockCharacters} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Writer")).toBeInTheDocument();
    expect(screen.getByText("Artist")).toBeInTheDocument();
  });

  it("should show empty state when no characters are provided", () => {
    render(<CharacterGallery characters={[]} />);
    expect(screen.getByText(/No characters found/i)).toBeInTheDocument();
  });
});
