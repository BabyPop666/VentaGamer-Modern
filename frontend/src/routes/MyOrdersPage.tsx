import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getMyOrders } from "../features/cart/cart.api";

export function MyOrdersPage() {
  const ordersQ = useQuery({
    queryKey: ["orders", "mine"],
    queryFn: getMyOrders,
  });

  if (ordersQ.isLoading) return <p className="text-slate-500">Cargando...</p>;
  if (!ordersQ.data) return <p className="text-red-600">Error.</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-brand-900">Mis pedidos</h1>
      {ordersQ.data.length === 0 ? (
        <p className="text-slate-500 py-8 text-center">No hay pedidos todavia.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {ordersQ.data.map((o) => (
            <Link
              key={o.id}
              to={`/orders/${o.id}`}
              className="block p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm text-brand-700">{o.orderNumber}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(o.placedAtUtc).toLocaleString()} ·{" "}
                    {o.items.reduce((s, i) => s + i.quantity, 0)} productos
                  </p>
                </div>
                <span className="font-bold text-lg text-brand-900">
                  ${o.total.toFixed(2)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
