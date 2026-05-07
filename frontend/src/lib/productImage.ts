// Fallbacks gamer por categoría — cuando un producto no trae imageUrl
// y el seed/admin no la cargó, se usa una imagen acorde al rubro.
const CATEGORY_FALLBACK: Record<string, string> = {
  Consolas: "https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42?w=800&q=80",
  Mandos: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80",
  Auriculares: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&q=80",
  Mouse: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
  Teclados: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&q=80",
  Monitores: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80",
  Sillas: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80",
  Streaming: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80",
  Juegos: "https://images.unsplash.com/photo-1556438064-2d7646166914?w=800&q=80",
  Accesorios: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
};

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80";

export function productImage(
  imageUrl: string | null | undefined,
  category?: string | null
): string {
  if (imageUrl && imageUrl.trim().length > 0) return imageUrl;
  if (category && CATEGORY_FALLBACK[category]) return CATEGORY_FALLBACK[category];
  return DEFAULT_FALLBACK;
}
