import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  it("should render search input", () => {
    render(<SearchBar onSearch={() => {}} />);
    expect(screen.getByPlaceholderText(/Pesquisar sabedoria.../i)).toBeInTheDocument();
  });
});
