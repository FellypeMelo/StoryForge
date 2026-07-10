import { useEffect, useId } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onCancel}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative bg-bg-surface border border-border-subtle rounded-xl p-6 max-w-sm w-full shadow-xl animate-scale-fade"
      >
        <h2 id={titleId} className="text-lg font-serif font-bold text-text-main">
          {title}
        </h2>
        <p className="mt-2 text-sm text-text-muted leading-relaxed">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-border-default text-text-main hover:bg-bg-hover transition-colors cursor-pointer active:scale-[0.98]"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            className="px-4 py-2 text-sm rounded-lg bg-danger text-white font-medium hover:opacity-90 transition-opacity cursor-pointer active:scale-[0.98]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
