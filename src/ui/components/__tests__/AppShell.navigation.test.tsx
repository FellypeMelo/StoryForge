import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppShell } from "../layout/AppShell";

describe("AppShell Navigation", () => {
  it("should call onNavigate with 'codex' when Codex da História is clicked", () => {
    const onNavigate = vi.fn();
    render(
      <AppShell onNavigate={onNavigate}>
        <div>Content</div>
      </AppShell>,
    );

    const codexButton = screen.getByText("Codex da História");
    fireEvent.click(codexButton);

    expect(onNavigate).toHaveBeenCalledWith("codex");
  });
});

