import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { downloadOrderPdf, getAllOrders } from "../features/cart/cart.api";
import { useAuthStore } from "../features/auth/auth.store";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { Spinner } from "../components/ui/Spinner";
import { StatTile } from "../components/ui/StatTile";

export function AdminOrdersPage() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const [filter, setFilter] = useState("");
  const [applied, setApplied] = useState("");

  if (!hasPermission("orders.read.all")) {
    return (
      <EmptyState
        icon="⊘"
        title="Acceso restringido"
        description="No tenés permisos para ver todos los pedidos."
      />
    );
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

  const total = ordersQ.data?.reduce((s, o) => s + o.total, 0) ?? 0;
  const totalItems =
    ordersQ.data?.reduce(
      (s, o) => s + o.items.reduce((s2, i) => s2 + i.quantity, 0),
      0
    ) ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// PEDIDOS_GLOBAL"
        title="Todos los pedidos"
        subtitle="Vista global de transacciones del arcade"
      />

      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setApplied(filter.trim());
        }}
      >
        <div className="flex-1 min-w-[260px]">
          <label className="label">Filtrar por usuario</label>
          <input
            placeholder="player.handle"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input font-mono"
          />
        </div>
        <Button variant="primary" type="submit">
          ▶ Filtrar
        </Button>
        {applied && (
          <Button
            variant="ghost"
            type="button"
            onClick={() => {
              setFilter("");
              setApplied("");
            }}
          >
            Limpiar
          </Button>
        )}
      </form>

      {ordersQ.isLoading && (
        <div className="py-16 flex justify-center">
          <Spinner label="cargando_pedidos" />
        </div>
      )}

      {ordersQ.data && ordersQ.data.length === 0 && (
        <EmptyState
          icon="∅"
          title="Sin pedidos"
          description={
            applied
              ? `No hay pedidos para "${applied}".`
              : "Todavía no se registraron compras."
          }
        />
      )}

      {ordersQ.data && ordersQ.data.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatTile label="Pedidos" value={ordersQ.data.length} />
            <StatTile label="Items" value={totalItems} tone="magenta" />
            <StatTile
              label="Volumen total"
              value={`$${total.toFixed(2)}`}
              tone="green"
            />
          </div>

          <Panel padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-cyber">
                <thead>
                  <tr>
                    <th>N° Orden</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th className="text-center">Items</th>
                    <th className="text-right">Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ordersQ.data.map((o) => (
                    <tr key={o.id}>
                      <td className="font-mono text-xs text-neon-cyan">
                        {o.orderNumber}
                      </td>
                      <td className="font-display font-semibold">
                        {o.customerUsername}
                      </td>
                      <td className="font-mono text-xs">
                        {new Date(o.placedAtUtc).toLocaleString()}
                      </td>
                      <td className="text-center font-mono">
                        {o.items.reduce((s, i) => s + i.quantity, 0)}
                      </td>
                      <td className="text-right font-display font-bold text-neon-cyan">
                        ${o.total.toFixed(2)}
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <Link
                          to={`/orders/${o.id}`}
                          className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-cyan hover:text-glow-cyan mr-3"
                        >
                          [ver]
                        </Link>
                        <button
                          onClick={() => handleDownloadPdf(o.id)}
                          className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-magenta hover:text-glow-magenta"
                        >
                          [pdf]
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
