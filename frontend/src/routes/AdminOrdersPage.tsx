import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { downloadOrderPdf, getAllOrders } from "../features/cart/cart.api";
import { useAuthStore } from "../features/auth/auth.store";

export function AdminOrdersPage() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [filter, setFilter] = useState("");
  const [applied, setApplied] = useState("");

  if (!hasPermission("orders.read.all")) {
    return <p className="text-red-600">No tenes permisos para esta pagina.</p>;
  }

  const ordersQ = useQuery({
    queryKey: ["admin-orders", applied],
    queryFn: () => getAllOrders(applied || undefined),
  });

  async function handleDownloadPdf(id: number) {
    const blob = await downloadOrderPdf(id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VentaGamer-${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-brand-900">Todos los pedidos</h1>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setApplied(filter.trim());
        }}
      >
        <input
          placeholder="Filtrar por usuario..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-slate-300 rounded px-3 py-1.5 text-sm w-64"
        />
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded text-sm">
          Filtrar
        </button>
        {applied && (
          <button
            type="button"
            onClick={() => {
              setFilter("");
              setApplied("");
            }}
            className="text-sm text-slate-500"
          >
            Limpiar
          </button>
        )}
      </form>

      {ordersQ.isLoading && <p>Cargando...</p>}
      {ordersQ.data && ordersQ.data.length === 0 && (
        <p className="text-slate-500 text-center py-8">Sin pedidos</p>
      )}

      {ordersQ.data && ordersQ.data.length > 0 && (
        <>
          <p className="text-xs text-slate-500">
            {ordersQ.data.length} pedidos · total $
            {ordersQ.data.reduce((s, o) => s + o.total, 0).toFixed(2)}
          </p>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="text-left p-2">N° orden</th>
                  <th className="text-left p-2">Cliente</th>
                  <th className="text-left p-2">Fecha</th>
                  <th className="text-center p-2">Items</th>
                  <th className="text-right p-2">Total</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ordersQ.data.map((o) => (
                  <tr key={o.id}>
                    <td className="p-2 font-mono text-xs">{o.orderNumber}</td>
                    <td className="p-2 font-medium">{o.customerUsername}</td>
                    <td className="p-2 text-xs">
                      {new Date(o.placedAtUtc).toLocaleString()}
                    </td>
                    <td className="p-2 text-center">
                      {o.items.reduce((s, i) => s + i.quantity, 0)}
                    </td>
                    <td className="p-2 text-right font-bold text-brand-900">
                      ${o.total.toFixed(2)}
                    </td>
                    <td className="p-2 text-right whitespace-nowrap">
                      <Link
                        to={`/orders/${o.id}`}
                        className="text-xs text-brand-600 hover:underline mr-3"
                      >
                        Ver
                      </Link>
                      <button
                        onClick={() => handleDownloadPdf(o.id)}
                        className="text-xs text-brand-600 hover:underline"
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
