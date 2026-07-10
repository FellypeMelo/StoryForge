import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { ToastProvider, useToast } from "./Toast";

function Trigger({ variant }: { variant?: "success" | "error" }) {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast("Operação concluída", variant)}>disparar</button>
  );
}

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("exibe mensagem ao chamar showToast", () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("disparar"));
    expect(screen.getByText("Operação concluída")).toBeInTheDocument();
  });

  it("região tem aria-live para leitores de tela", () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("disparar"));
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("remove toast automaticamente após timeout", () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("disparar"));
    expect(screen.getByText("Operação concluída")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.queryByText("Operação concluída")).not.toBeInTheDocument();
  });

  it("variante error é distinguível via role alert", () => {
    render(
      <ToastProvider>
        <Trigger variant="error" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("disparar"));
    expect(screen.getByRole("alert")).toHaveTextContent("Operação concluída");
  });

  it("useToast fora do provider lança erro claro", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Trigger />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
