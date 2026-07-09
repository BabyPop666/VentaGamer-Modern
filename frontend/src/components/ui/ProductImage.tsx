import { useEffect, useState } from "react";
import { productImage } from "../../lib/productImage";

type Props = {
  imageUrl?: string | null;
  category?: string | null;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
};

// SVG inline placeholder — siempre carga, no depende de red.
function svgPlaceholder(label: string): string {
  const safe = label.toUpperCase().slice(0, 14);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0d18"/>
      <stop offset="100%" stop-color="#141a2e"/>
    </linearGradient>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#1f2942" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  <g transform="translate(300 200)" text-anchor="middle" font-family="Orbitron, monospace" fill="#00f0ff">
    <text font-size="48" font-weight="800" letter-spacing="6" filter="drop-shadow(0 0 12px #00f0ff)">VG</text>
    <text y="60" font-size="18" fill="#8a96c5" letter-spacing="6">${safe}</text>
    <text y="92" font-size="11" fill="#ff2d95" letter-spacing="4">// NO_IMG</text>
  </g>
</svg>`.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function ProductImage({
  imageUrl,
  category,
  alt = "",
  className = "",
  loading = "lazy",
}: Props) {
  // Cascada: URL propia -> fallback de categoría -> SVG inline.
  const sources = [
    imageUrl?.trim() || null,
    productImage(null, category),
    svgPlaceholder(category ?? "GEAR"),
  ].filter((s): s is string => !!s);

  // De-dup pero conservar orden
  const unique = Array.from(new Set(sources));

  const [idx, setIdx] = useState(0);

  // Si imageUrl cambia (ej: edit en admin), reseteamos a la primera.
  useEffect(() => {
    setIdx(0);
  }, [imageUrl, category]);

  const src = unique[idx] ?? unique[unique.length - 1];

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      className={className}
      onError={() => {
        if (idx < unique.length - 1) setIdx(idx + 1);
      }}
    />
  );
}
