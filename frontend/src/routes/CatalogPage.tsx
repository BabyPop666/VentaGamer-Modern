import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addItem } from "../features/cart/cart.api";
import { getCategories, getProducts } from "../features/products/product.api";
import { useAuthStore } from "../features/auth/auth.store";
import { toApiError } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";
import { EmptyState } from "../components/ui/EmptyState";
import { Lightbox } from "../components/ui/Lightbox";
import { PageHeader } from "../components/ui/PageHeader";
import { ProductImage } from "../components/ui/ProductImage";
import { Spinner } from "../components/ui/Spinner";
import { Toast } from "../components/ui/Toast";
import { productImage } from "../lib/productImage";

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") ?? undefined;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [zoom, setZoom] = useState<{ src: string; caption: string } | null>(null);

  const user = useAuthStore((s) => s.user);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const addMut = useMutation({
    mutationFn: ({ productId }: { productId: number }) => addItem(productId, 1),
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
      setFeedback({ ok: true, msg: "Loot agregado al inventario" });
      setTimeout(() => setFeedback(null), 2500);
    },
    onError: (err) => {
      setFeedback({ ok: false, msg: toApiError(err).message });
      setTimeout(() => setFeedback(null), 4000);
    },
  });

  function handleAddToCart(productId: number) {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!hasPermission("cart.use")) {
      setFeedback({ ok: false, msg: "Tu rol no puede comprar" });
      return;
    }
    addMut.mutate({ productId });
  }

  function applyCategory(c: string | undefined) {
    setPage(1);
    setCategory(c);
    if (c) setSearchParams({ category: c });
    else setSearchParams({});
  }

  const productsQuery = useQuery({
    queryKey: ["products", { page, search, category }],
    queryFn: () => getProducts({ page, pageSize: 12, search, category }),
    placeholderData: (prev) => prev,
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="// CATALOGO"
        title="Arsenal disponible"
        subtitle={
          productsQuery.data
            ? `${productsQuery.data.totalItems} items detectados en el sistema`
            : "Sincronizando inventario..."
        }
      />

      {/* Search bar */}
      <form
        className="flex flex-wrap gap-3 items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setSearch(searchInput.trim());
        }}
      >
        <div className="flex-1 min-w-[260px]">
          <label className="label">Búsqueda</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neon-cyan font-mono text-sm pointer-events-none">
              ⌕
            </span>
            <input
              placeholder="Buscar producto..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input !pl-9"
            />
          </div>
        </div>
        <div className="min-w-[200px]">
          <label className="label">Categoría</label>
          <select
            value={category ?? ""}
            onChange={(e) => applyCategory(e.target.value || undefined)}
            className="input"
          >
            <option value="">Todas</option>
            {categoriesQuery.data?.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <Button variant="primary" type="submit">
          ▶ Buscar
        </Button>
        {(search || category) && (
          <Button
            variant="ghost"
            type="button"
            onClick={() => {
              setSearch("");
              setSearchInput("");
              applyCategory(undefined);
            }}
          >
            Limpiar
          </Button>
        )}
      </form>

      {/* Active filter chips */}
      {(search || category) && (
        <div className="flex flex-wrap gap-2">
          {search && <Chip tone="cyan">QUERY · {search}</Chip>}
          {category && <Chip tone="magenta">CAT · {category}</Chip>}
        </div>
      )}

      {feedback && <Toast tone={feedback.ok ? "success" : "error"} message={feedback.msg} />}

      {productsQuery.isLoading && (
        <div className="py-16 flex justify-center">
          <Spinner label="cargando_inventario" />
        </div>
      )}

      {productsQuery.isError && (
        <EmptyState
          icon="⚠"
          title="Error de conexión"
          description="No se pudo cargar el catálogo. Probá de nuevo en unos segundos."
        />
      )}

      {productsQuery.data && productsQuery.data.items.length === 0 && (
        <EmptyState
          icon="∅"
          title="Sin resultados"
          description="No hay productos que coincidan con esos filtros. Probá relajar la búsqueda."
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
        {productsQuery.data?.items.map((p) => {
          const outOfStock = p.stock === 0;
          const lowStock = p.stock > 0 && p.stock < 5;
          return (
            <article
              key={p.id}
              className="panel corners group flex flex-col overflow-hidden"
              style={{ padding: 0 }}
            >
              <button
                type="button"
                onClick={() =>
                  setZoom({ src: productImage(p.imageUrl, p.category), caption: p.title })
                }
                className="aspect-[4/3] relative overflow-hidden bg-ink-800 block w-full text-left cursor-zoom-in"
                aria-label={`Ver imagen de ${p.title}`}
              >
                <ProductImage
                  imageUrl={p.imageUrl}
                  category={p.category}
                  alt={p.title}
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                    outOfStock ? "grayscale" : ""
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/30 to-transparent pointer-events-none" />
                {!outOfStock && (
                  <span
                    aria-hidden
                    className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity bg-ink-900/40"
                  >
                    <span className="px-3 py-1.5 border border-neon-cyan bg-ink-900/80 text-neon-cyan font-display text-xs tracking-widest2 uppercase shadow-glow-soft">
                      ⤢ ZOOM
                    </span>
                  </span>
                )}
                <Chip className="absolute top-3 left-3" tone="cyan">
                  {p.category}
                </Chip>
                {outOfStock && (
                  <div className="absolute inset-0 grid place-items-center bg-ink-900/70">
                    <div className="font-display font-black text-neon-red text-2xl tracking-widest2">
                      SIN STOCK
                    </div>
                  </div>
                )}
                {lowStock && !outOfStock && (
                  <Chip className="absolute top-3 right-3" tone="magenta">
                    LOW · {p.stock}
                  </Chip>
                )}
                <div className="absolute bottom-3 left-3 right-3 font-mono text-[0.6rem] uppercase tracking-widest2 text-fg-muted flex justify-between pointer-events-none">
                  <span>SKU.{p.id.toString().padStart(5, "0")}</span>
                  <span className={p.stock > 0 ? "text-neon-green" : "text-neon-red"}>
                    {p.stock > 0 ? `STK ${p.stock}` : "OFFLINE"}
                  </span>
                </div>
              </button>

              <div className="p-4 flex flex-col gap-3 flex-1">
                <h3 className="font-display font-semibold text-base line-clamp-2 group-hover:text-neon-cyan transition-colors min-h-[2.5em]">
                  {p.title}
                </h3>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="font-mono text-[0.6rem] uppercase tracking-widest2 text-fg-dim">
                      PRICE
                    </div>
                    <div className="font-display font-bold text-2xl text-neon-cyan text-glow-cyan">
                      ${p.price.toFixed(2)}
                    </div>
                  </div>
                </div>

                <Button
                  variant={outOfStock ? "ghost" : "primary"}
                  disabled={outOfStock || addMut.isPending}
                  onClick={() => handleAddToCart(p.id)}
                  className="!w-full mt-auto"
                >
                  {outOfStock ? "AGOTADO" : "+ AÑADIR"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      {productsQuery.data && productsQuery.data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 font-mono text-xs uppercase tracking-widest2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← prev
          </Button>
          <span className="text-neon-cyan">
            PAGE {page.toString().padStart(2, "0")} / {productsQuery.data.totalPages.toString().padStart(2, "0")}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setPage((p) => Math.min(productsQuery.data!.totalPages, p + 1))
            }
            disabled={page === productsQuery.data.totalPages}
          >
            next →
          </Button>
        </div>
      )}

      <Lightbox
        open={!!zoom}
        src={zoom?.src ?? null}
        caption={zoom?.caption}
        alt={zoom?.caption}
        onClose={() => setZoom(null)}
      />
    </div>
  );
}
