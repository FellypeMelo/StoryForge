import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BibleDashboard } from "./BibleDashboard";

describe("BibleDashboard", () => {
  it("should render all lore tabs", () => {
    render(<BibleDashboard />);

    // Check for buttons in the nav
    expect(screen.getByRole("button", { name: /Characters/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Locations/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /World Rules/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Timeline/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Relationships/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Blacklist/i })).toBeInTheDocument();
  });

  it("should show characters tab by default", () => {
    render(<BibleDashboard />);
    expect(screen.getByText(/No characters found/i)).toBeInTheDocument();
  });
});
