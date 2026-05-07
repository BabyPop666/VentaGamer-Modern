import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  type ProductCreateRequest,
} from "../features/products/product.api";
import type { Product } from "../features/products/product.types";
import { useAuthStore } from "../features/auth/auth.store";
import { toApiError } from "../lib/api";

export function AdminProductsPage() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  if (!hasPermission("products.write")) {
    return <p className="text-red-600">No tenes permisos para esta pagina.</p>;
  }

  const productsQ = useQuery({
    queryKey: ["admin-products", page],
    queryFn: () => getProducts({ page, pageSize: 20 }),
    placeholderData: (prev) => prev,
  });

  const delMut = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
    onError: (err) => setError(toApiError(err).message),
  });

  if (productsQ.isLoading) return <p>Cargando...</p>;
  if (!productsQ.data) return <p className="text-red-600">Error al cargar.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Gestion de productos</h1>
          <p className="text-sm text-slate-500">{productsQ.data.totalItems} productos en el catalogo</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded text-sm"
        >
          + Nuevo producto
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
          <button className="ml-2" onClick={() => setError(null)}>x</button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left p-2 w-16"></th>
              <th className="text-left p-2">Titulo</th>
              <th className="text-left p-2">Categoria</th>
              <th className="text-right p-2">Precio</th>
              <th className="text-center p-2">Stock</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {productsQ.data.items.map((p) => (
              <tr key={p.id}>
                <td className="p-2">
                  {p.imageUrl && (
                    <img src={p.imageUrl} alt="" className="w-12 h-12 rounded object-cover" />
                  )}
                </td>
                <td className="p-2 font-medium">{p.title}</td>
                <td className="p-2">
                  <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{p.category}</span>
                </td>
                <td className="p-2 text-right">${p.price.toFixed(2)}</td>
                <td className="p-2 text-center">
                  <span className={p.stock > 0 ? "text-green-700" : "text-red-600"}>{p.stock}</span>
                </td>
                <td className="p-2 text-right">
                  <button
                    onClick={() => setEditing(p)}
                    className="text-xs text-brand-600 hover:underline mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Eliminar "${p.title}"?`)) delMut.mutate(p.id);
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {productsQ.data.totalPages > 1 && (
        <div className="flex justify-center gap-2 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-slate-300 rounded disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="px-3 py-1">
            {page} / {productsQ.data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(productsQ.data!.totalPages, p + 1))}
            disabled={page === productsQ.data.totalPages}
            className="px-3 py-1 border border-slate-300 rounded disabled:opacity-40"
          >
            Siguiente
          </button>
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
    if (!form.title.trim()) {
      onError("Titulo requerido");
      return;
    }
    if (!form.category.trim()) {
      onError("Categoria requerida");
      return;
    }
    if (form.price < 0) {
      onError("Precio no puede ser negativo");
      return;
    }
    if (form.stock < 0) {
      onError("Stock no puede ser negativo");
      return;
    }

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-30">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold">{isEdit ? "Editar producto" : "Nuevo producto"}</h2>
        </div>
        <div className="p-6 space-y-3">
          <Field label="Titulo" required>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-slate-300 rounded px-2 py-1"
            />
          </Field>
          <Field label="Categoria" required>
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-slate-300 rounded px-2 py-1"
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
                className="w-full border border-slate-300 rounded px-2 py-1"
              />
            </Field>
            <Field label={isEdit ? "Stock (no editable aca)" : "Stock"}>
              <input
                type="number"
                value={form.stock}
                disabled={isEdit}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded px-2 py-1 disabled:bg-slate-100"
              />
            </Field>
          </div>
          <Field label="URL de imagen (opcional)">
            <input
              value={form.imageUrl ?? ""}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full border border-slate-300 rounded px-2 py-1"
              placeholder="https://..."
            />
          </Field>
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt=""
              className="w-32 h-32 rounded object-cover border border-slate-200"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
          )}
        </div>
        <div className="p-6 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm">
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}
