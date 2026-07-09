import { useEffect } from "react";
import type { ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
};

export function Modal({ open, title, onClose, children, footer, size = "md" }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`panel corners panel-glow w-full ${
          size === "lg" ? "max-w-3xl" : "max-w-xl"
        } max-h-[90vh] flex flex-col`}
      >
        <header className="px-6 py-4 border-b border-line flex items-center justify-between">
          <h2 className="h-display text-lg text-neon-cyan">{title}</h2>
          <button
            onClick={onClose}
            className="text-fg-muted hover:text-neon-magenta font-mono text-sm"
            aria-label="Cerrar"
          >
            [ESC] ✕
          </button>
        </header>
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <footer className="px-6 py-4 border-t border-line flex justify-end gap-2 bg-ink-900/60">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
