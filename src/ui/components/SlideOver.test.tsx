import { render, screen, fireEvent } from "@testing-library/react";
import { SlideOver } from "./SlideOver";
import { expect, test, vi } from "vitest";

test("SlideOver renders children when isOpen is true", () => {
  render(
    <SlideOver isOpen={true} onClose={() => {}}>
      <div data-testid="content">Modal Content</div>
    </SlideOver>
  );

  expect(screen.getByTestId("content")).toBeInTheDocument();
  expect(screen.getByText("Modal Content")).toBeInTheDocument();
});

test("SlideOver does not render children when isOpen is false", () => {
  render(
    <SlideOver isOpen={false} onClose={() => {}}>
      <div data-testid="content">Modal Content</div>
    </SlideOver>
  );

  expect(screen.queryByTestId("content")).not.toBeInTheDocument();
});

test("SlideOver calls onClose when backdrop is clicked", () => {
  const onClose = vi.fn();
  render(
    <SlideOver isOpen={true} onClose={onClose}>
      <div>Content</div>
    </SlideOver>
  );

  const backdrop = screen.getByTestId("slideover-backdrop");
  fireEvent.click(backdrop);

  expect(onClose).toHaveBeenCalledTimes(1);
});

test("SlideOver calls onClose when Escape key is pressed", () => {
  const onClose = vi.fn();
  render(
    <SlideOver isOpen={true} onClose={onClose}>
      <div>Content</div>
    </SlideOver>
  );

  fireEvent.keyDown(window, { key: "Escape" });

  expect(onClose).toHaveBeenCalledTimes(1);
});
