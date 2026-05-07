import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addItem } from "../features/cart/cart.api";
import { getCategories, getProducts } from "../features/products/product.api";
import { useAuthStore } from "../features/auth/auth.store";
import { toApiError } from "../lib/api";

export function CatalogPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const user = useAuthStore((s) => s.user);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const addMut = useMutation({
    mutationFn: ({ productId }: { productId: number }) => addItem(productId, 1),
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
      setFeedback({ ok: true, msg: "Agregado al carrito" });
      setTimeout(() => setFeedback(null), 2500);
    },
    onError: (err) => {
      setFeedback({ ok: false, msg: toApiError(err).message });
      setTimeout(() => setFeedback(null), 4000);
    },
  });

  function handleAddToCart(productId: number) {
    if (!user) { navigate("/login"); return; }
    if (!hasPermission("cart.use")) {
      setFeedback({ ok: false, msg: "Tu rol no puede comprar" });
      return;
    }
    addMut.mutate({ productId });
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
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Catalogo</h1>
          <p className="text-sm text-slate-500">
            {productsQuery.data?.totalItems ?? "..."} productos disponibles
          </p>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
        >
          <input
            placeholder="Buscar..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border border-slate-300 rounded px-3 py-2 text-sm w-64"
          />
          <select
            value={category ?? ""}
            onChange={(e) => {
              setPage(1);
              setCategory(e.target.value || undefined);
            }}
            className="border border-slate-300 rounded px-3 py-2 text-sm"
          >
            <option value="">Todas las categorias</option>
            {categoriesQuery.data?.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded text-sm">
            Buscar
          </button>
        </form>
      </div>

      {feedback && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg text-sm z-20 ${
            feedback.ok
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {productsQuery.isLoading && <p className="text-slate-500">Cargando...</p>}

      {productsQuery.isError && (
        <p className="text-red-600">Error al cargar productos.</p>
      )}

      {productsQuery.data && productsQuery.data.items.length === 0 && (
        <p className="text-slate-500 text-center py-12">
          No hay productos con esos filtros.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {productsQuery.data?.items.map((p) => (
          <article
            key={p.id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {p.imageUrl && (
              <img
                src={p.imageUrl}
                alt={p.title}
                loading="lazy"
                className="w-full aspect-square object-cover"
              />
            )}
            <div className="p-3">
              <span className="text-xs text-brand-700 font-medium">
                {p.category}
              </span>
              <h3 className="font-semibold mt-1 line-clamp-2">{p.title}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-bold text-brand-900">
                  ${p.price.toFixed(2)}
                </span>
                <span
                  className={`text-xs ${
                    p.stock > 0 ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {p.stock > 0 ? `${p.stock} en stock` : "Sin stock"}
                </span>
              </div>
              <button
                disabled={p.stock === 0 || addMut.isPending}
                onClick={() => handleAddToCart(p.id)}
                className="w-full mt-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white py-1.5 rounded text-sm font-medium"
              >
                Agregar al carrito
              </button>
            </div>
          </article>
        ))}
      </div>

      {productsQuery.data && productsQuery.data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-slate-600">
            {page} / {productsQuery.data.totalPages}
          </span>
          <button
            onClick={() =>
              setPage((p) =>
                Math.min(productsQuery.data!.totalPages, p + 1)
              )
            }
            disabled={page === productsQuery.data.totalPages}
            className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
