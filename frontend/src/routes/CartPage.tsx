import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkout, getCart, removeItem, updateItem } from "../features/cart/cart.api";
import { useAuthStore } from "../features/auth/auth.store";
import { toApiError } from "../lib/api";

export function CartPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const cartQ = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: !!user,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, qty }: { id: number; qty: number }) => updateItem(id, qty),
    onSuccess: (data) => queryClient.setQueryData(["cart"], data),
    onError: (err) => setError(toApiError(err).message),
  });

  const removeMut = useMutation({
    mutationFn: (id: number) => removeItem(id),
    onSuccess: (data) => queryClient.setQueryData(["cart"], data),
  });

  const checkoutMut = useMutation({
    mutationFn: checkout,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate(`/orders/${order.id}`);
    },
    onError: (err) => setError(toApiError(err).message),
  });

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">Necesitas iniciar sesion para ver tu carrito.</p>
        <button
          onClick={() => navigate("/login")}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded"
        >
          Iniciar sesion
        </button>
      </div>
    );
  }

  if (cartQ.isLoading) return <p className="text-slate-500">Cargando carrito...</p>;
  if (!cartQ.data) return <p className="text-red-600">Error al cargar el carrito.</p>;

  const cart = cartQ.data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-900">Tu carrito</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {cart.items.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-slate-500">Tu carrito esta vacio</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded text-sm"
          >
            Ver catalogo
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {cart.items.map((item) => (
              <div key={item.cartItemId} className="p-4 flex items-center gap-4">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.productTitle}
                    className="w-20 h-20 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-brand-700">{item.category}</p>
                  <h3 className="font-semibold truncate">{item.productTitle}</h3>
                  <p className="text-sm text-slate-500">
                    ${item.unitPrice.toFixed(2)} c/u
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="w-8 h-8 rounded border border-slate-300 hover:bg-slate-50"
                    onClick={() =>
                      item.quantity > 1
                        ? updateMut.mutate({ id: item.cartItemId, qty: item.quantity - 1 })
                        : removeMut.mutate(item.cartItemId)
                    }
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button
                    className="w-8 h-8 rounded border border-slate-300 hover:bg-slate-50"
                    onClick={() => updateMut.mutate({ id: item.cartItemId, qty: item.quantity + 1 })}
                  >
                    +
                  </button>
                </div>
                <div className="w-24 text-right font-bold">${item.lineTotal.toFixed(2)}</div>
                <button
                  onClick={() => removeMut.mutate(item.cartItemId)}
                  className="text-red-500 hover:text-red-700 text-sm ml-2"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-xl p-4">
            <span className="text-lg">
              Total: <span className="font-bold text-brand-900">${cart.total.toFixed(2)}</span>
            </span>
            <button
              onClick={() => checkoutMut.mutate()}
              disabled={checkoutMut.isPending}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-6 py-2 rounded font-medium"
            >
              {checkoutMut.isPending ? "Procesando..." : "Confirmar compra"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
