import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  updateProduct,
  type ProductCreateRequest,
} from "../features/products/product.api";
import type { Product } from "../features/products/product.types";
import { useAuthStore } from "../features/auth/auth.store";
import { toApiError } from "../lib/api";
import { productImage } from "../lib/productImage";
import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";
import { EmptyState } from "../components/ui/EmptyState";
import { Field } from "../components/ui/Field";
import { Lightbox } from "../components/ui/Lightbox";
import { Modal } from "../components/ui/Modal";
import { ProductImage } from "../components/ui/ProductImage";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { Spinner } from "../components/ui/Spinner";
import { StatTile } from "../components/ui/StatTile";

type StockFilter = "all" | "in" | "low" | "out";

export function AdminProductsPage() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [zoom, setZoom] = useState<{ src: string; caption: string } | null>(null);

  if (!hasPermission("products.write")) {
    return (
      <EmptyState
        icon="⊘"
        title="Acceso restringido"
        description="No tenés permisos para gestionar productos."
      />
    );
  }

  const productsQ = useQuery({
    queryKey: ["admin-products", { page, search, category }],
    queryFn: () => getProducts({ page, pageSize: 20, search, category }),
    placeholderData: (prev) => prev,
  });

  const categoriesQ = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });

  const delMut = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
    onError: (err) => setError(toApiError(err).message),
  });

  if (productsQ.isLoading)
    return (
      <div className="py-16 flex justify-center">
        <Spinner label="cargando_productos" />
      </div>
    );
  if (!productsQ.data) return <EmptyState icon="⚠" title="Error al cargar" />;

  // filtro client-side por stock (search/category van al backend)
  const filteredItems = productsQ.data.items.filter((p) => {
    if (stockFilter === "in") return p.stock > 0;
    if (stockFilter === "low") return p.stock > 0 && p.stock < 5;
    if (stockFilter === "out") return p.stock === 0;
    return true;
  });

  const totalStock = filteredItems.reduce((s, p) => s + p.stock, 0);
  const inStock = filteredItems.filter((p) => p.stock > 0).length;
  const outStock = filteredItems.filter((p) => p.stock === 0).length;
  const lowStock = filteredItems.filter((p) => p.stock > 0 && p.stock < 5).length;

  function clearFilters() {
    setSearch("");
    setSearchInput("");
    setCategory(undefined);
    setStockFilter("all");
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// GESTION_PRODUCTOS"
        title="Catálogo · Admin"
        subtitle={`${productsQ.data.totalItems} productos en el sistema`}
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            + Nuevo producto
          </Button>
        }
      />

      {error && (
        <div className="border border-neon-red/60 bg-neon-red/5 px-4 py-2 font-mono text-xs text-neon-red flex items-center justify-between">
          <span>&gt; {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Filtros */}
      <Panel padding="md" className="space-y-4">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
        >
          <div className="flex-1 min-w-[240px]">
            <label className="label">Buscar</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neon-cyan font-mono text-sm pointer-events-none">
                ⌕
              </span>
              <input
                placeholder="Título / SKU..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input !pl-9"
              />
            </div>
          </div>
          <div className="min-w-[180px]">
            <label className="label">Categoría</label>
            <select
              value={category ?? ""}
              onChange={(e) => {
                setCategory(e.target.value || undefined);
                setPage(1);
              }}
              className="input"
            >
              <option value="">Todas</option>
              {categoriesQ.data?.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <Button variant="primary" type="submit">
            ▶ Filtrar
          </Button>
          {(search || category || stockFilter !== "all") && (
            <Button variant="ghost" type="button" onClick={clearFilters}>
              Limpiar
            </Button>
          )}
        </form>

        {/* Stock filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[0.6rem] uppercase tracking-widest2 text-fg-muted">
            STOCK ::
          </span>
          {(
            [
              { v: "all", l: `Todos · ${productsQ.data.totalItems}` },
              { v: "in", l: `En stock · ${inStock}` },
              { v: "low", l: `Bajo · ${lowStock}` },
              { v: "out", l: `Agotado · ${outStock}` },
            ] as { v: StockFilter; l: string }[]
          ).map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setStockFilter(opt.v)}
              className={`px-3 py-1 border font-mono text-[0.65rem] uppercase tracking-widest2 transition-all ${
                stockFilter === opt.v
                  ? "border-neon-cyan text-neon-cyan bg-neon-cyan/5 shadow-glow-soft"
                  : "border-line text-fg-muted hover:border-neon-cyan/50"
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>

        {(search || category) && (
          <div className="flex flex-wrap gap-2">
            {search && <Chip tone="cyan">QUERY · {search}</Chip>}
            {category && <Chip tone="magenta">CAT · {category}</Chip>}
          </div>
        )}
      </Panel>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Visibles" value={filteredItems.length} />
        <StatTile label="Stock total" value={totalStock} tone="green" />
        <StatTile label="Stock bajo" value={lowStock} tone="magenta" />
        <StatTile label="Sin stock" value={outStock} tone="red" />
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          icon="∅"
          title="Sin resultados"
          description="No hay productos con esos filtros. Probá relajar la búsqueda."
        />
      ) : (
        <Panel padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-cyber">
              <thead>
                <tr>
                  <th></th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th className="text-right">Precio</th>
                  <th className="text-center">Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((p) => {
                  const img = productImage(p.imageUrl, p.category);
                  return (
                    <tr key={p.id}>
                      <td>
                        <button
                          type="button"
                          onClick={() => setZoom({ src: img, caption: p.title })}
                          className="block w-12 h-12 border border-line hover:border-neon-cyan transition-colors cursor-zoom-in overflow-hidden"
                          aria-label={`Ver ${p.title}`}
                        >
                          <ProductImage
                            imageUrl={p.imageUrl}
                            category={p.category}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      </td>
                      <td>
                        <div className="font-display font-semibold">{p.title}</div>
                        <div className="font-mono text-xs text-fg-dim">
                          SKU.{p.id.toString().padStart(5, "0")}
                        </div>
                      </td>
                      <td>
                        <Chip tone="cyan">{p.category}</Chip>
                      </td>
                      <td className="text-right font-display font-bold text-neon-cyan">
                        ${p.price.toFixed(2)}
                      </td>
                      <td className="text-center">
                        <span
                          className={`font-mono ${
                            p.stock === 0
                              ? "text-neon-red"
                              : p.stock < 5
                              ? "text-neon-magenta"
                              : "text-neon-green"
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <button
                          onClick={() => setEditing(p)}
                          className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-cyan hover:text-glow-cyan mr-3"
                        >
                          [editar]
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Eliminar "${p.title}"?`)) delMut.mutate(p.id);
                          }}
                          className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-red hover:text-glow-magenta"
                        >
                          [eliminar]
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {productsQ.data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2 font-mono text-xs uppercase tracking-widest2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← prev
          </Button>
          <span className="text-neon-cyan">
            PAGE {page.toString().padStart(2, "0")} /{" "}
            {productsQ.data.totalPages.toString().padStart(2, "0")}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setPage((p) => Math.min(productsQ.data!.totalPages, p + 1))
            }
            disabled={page === productsQ.data.totalPages}
          >
            next →
          </Button>
        </div>
      )}

      {(creating || editing) && (
        <ProductEditor
          product={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            qc.invalidateQueries({ queryKey: ["admin-products"] });
            qc.invalidateQueries({ queryKey: ["products"] });
            qc.invalidateQueries({ queryKey: ["categories"] });
          }}
          onError={setError}
        />
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

function ProductEditor({
  product,
  onClose,
  onSaved,
  onError,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
  onError: (e: string) => void;
}) {
  const isEdit = !!product;
  const [form, setForm] = useState<ProductCreateRequest>({
    title: product?.title ?? "",
    category: product?.category ?? "",
    price: product?.price ?? 0,
    stock: product?.stock ?? 0,
    imageUrl: product?.imageUrl ?? "",
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.title.trim()) return onError("Título requerido");
    if (!form.category.trim()) return onError("Categoría requerida");
    if (form.price < 0) return onError("Precio no puede ser negativo");
    if (form.stock < 0) return onError("Stock no puede ser negativo");

    setSaving(true);
    try {
      if (isEdit) {
        await updateProduct(product!.id, {
          title: form.title,
          category: form.category,
          price: form.price,
          imageUrl: form.imageUrl?.trim() || null,
        });
      } else {
        await createProduct({
          ...form,
          imageUrl: form.imageUrl?.trim() || null,
        });
      }
      onSaved();
    } catch (e) {
      onError(toApiError(e).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      title={isEdit ? "EDITAR PRODUCTO" : "NUEVO PRODUCTO"}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={save} loading={saving}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Título" required>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input"
          />
        </Field>
        <Field label="Categoría" required>
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="input"
            placeholder="Consolas, Mandos, Juegos..."
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Precio (USD)" required>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="input"
            />
          </Field>
          <Field label="Stock" hint={isEdit ? "no editable acá" : undefined}>
            <input
              type="number"
              value={form.stock}
              disabled={isEdit}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              className="input disabled:opacity-50"
            />
          </Field>
        </div>
        <Field label="URL de imagen" hint="opcional · si se omite, fallback por categoría">
          <input
            value={form.imageUrl ?? ""}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="input font-mono text-xs"
            placeholder="https://..."
          />
        </Field>
        <div className="border border-line p-2 inline-block">
          <ProductImage
            imageUrl={form.imageUrl}
            category={form.category}
            alt=""
            className="w-32 h-32 object-cover"
          />
        </div>
      </div>
    </Modal>
  );
}
