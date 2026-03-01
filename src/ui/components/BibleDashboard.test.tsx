import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BibleDashboard } from "./BibleDashboard";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(async (cmd) => {
    if (cmd === "list_characters") return [];
    if (cmd === "list_locations") return [];
    if (cmd === "list_world_rules") return [];
    return [];
  }),
}));

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

  it("should show characters tab by default after loading", async () => {
    render(<BibleDashboard />);
    
    // Should show loading initially
    expect(screen.getByText(/Consulting the archives/i)).toBeInTheDocument();
    
    // Should eventually show empty state
    await waitFor(() => {
      expect(screen.getByText(/No characters found/i)).toBeInTheDocument();
    });
  });

  it("should show search results panel when searching", async () => {
    // Mock search results
    const mockResults = [{
      entity_id: "res-1",
      entity_type: "character",
      snippet: "Search result snippet",
      score: 0.5
    }];
    
    const { invoke } = await import("@tauri-apps/api/core");
    vi.mocked(invoke).mockImplementation(async (cmd) => {
      if (cmd === "search_lore") return mockResults;
      if (cmd === "list_characters") return [];
      if (cmd === "list_locations") return [];
      if (cmd === "list_world_rules") return [];
      return [];
    });

    render(<BibleDashboard />);
    
    const searchInput = screen.getByPlaceholderText(/Search lore.../i);
    fireEvent.change(searchInput, { target: { value: "test query" } });
    
    await waitFor(() => {
      expect(screen.getByText(/Search results/i)).toBeInTheDocument();
      expect(screen.getByText(/Search result snippet/i)).toBeInTheDocument();
    });
  });
});
