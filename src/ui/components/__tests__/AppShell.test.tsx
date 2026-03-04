import { render, screen, fireEvent } from "@testing-library/react";
import { AppShell } from "../layout/AppShell";
import { expect, test } from "vitest";

test("sidebar collapses and expands on Ctrl+B / Cmd+B", () => {
  render(<AppShell>Content</AppShell>);

  // By default, it's not collapsed, so "Dashboard" text should be in the document
  expect(screen.queryByText(/Painel/i)).toBeInTheDocument();

  // Simulate Ctrl+B
  fireEvent.keyDown(window, { key: "b", ctrlKey: true });

  // Sidebar should instantly collapse, hiding the text
  expect(screen.queryByText(/Painel/i)).not.toBeInTheDocument();

  // Simulate Cmd+B (for Mac)
  fireEvent.keyDown(window, { key: "b", metaKey: true });

  // Sidebar should expand back
  expect(screen.queryByText(/Painel/i)).toBeInTheDocument();
});
