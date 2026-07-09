import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  src: string | null;
  alt?: string;
  caption?: string;
  onClose: () => void;
};

const FALLBACK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0a0d18"/>
        <stop offset="100%" stop-color="#141a2e"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1f2942" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect width="100%" height="100%" fill="url(#grid)"/>
    <g transform="translate(400 280)" text-anchor="middle" font-family="Orbitron, monospace" fill="#00f0ff">
      <text font-size="80" font-weight="800" letter-spacing="8">VG</text>
      <text y="60" font-size="22" fill="#8a96c5" letter-spacing="6">// IMG_NOT_FOUND</text>
    </g>
  </svg>`
)}`;

export function Lightbox({ open, src, alt, caption, onClose }: Props) {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src]);

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

  if (!open || !src) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-ink-900/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-rise"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 font-mono text-xs uppercase tracking-widest2 text-fg-muted hover:text-neon-cyan z-10"
        aria-label="Cerrar"
      >
        [ESC] ✕
      </button>

      <div
        className="relative max-w-[92vw] max-h-[88vh] panel corners panel-glow"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 0 }}
      >
        <div className="absolute -top-3 left-4 font-mono text-[0.6rem] uppercase tracking-widest2 text-neon-cyan bg-ink-900 px-2 py-0.5 z-10">
          ZOOM_VIEW · 1.00x
        </div>
        <img
          src={errored ? FALLBACK_SVG : src}
          alt={alt ?? ""}
          onError={() => setErrored(true)}
          className="block max-w-[92vw] max-h-[80vh] w-auto h-auto object-contain"
        />
        {caption && (
          <div className="px-4 py-3 border-t border-line bg-ink-900/60">
            <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-fg-dim">
              CAPTION
            </div>
            <div className="font-display font-semibold text-neon-cyan">
              {caption}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
