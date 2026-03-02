import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const SlideOver: React.FC<SlideOverProps> = ({ isOpen, onClose, title, children }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle ESC key and Body scroll lock
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Focus Trapping
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const focusableElements = panelRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden font-sans">
      {/* Backdrop with Fade */}
      <div
        data-testid="slideover-backdrop"
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-500 ease-in-out animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over panel with Scale & Fade */}
      <div
        ref={panelRef}
        data-testid="slideover-panel"
        className="relative flex h-full w-full flex-col bg-bg-base shadow-2xl border-l border-border-subtle transition-all sm:max-w-xl animate-scale-fade"
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border-subtle bg-bg-base sticky top-0 z-10">
            <h2 className="text-sm font-bold tracking-[0.1em] uppercase text-text-main">
              {title || "Detalhes"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-main transition-all cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};


