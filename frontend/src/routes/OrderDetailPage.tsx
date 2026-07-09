import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { downloadOrderPdf, getOrder } from "../features/cart/cart.api";
import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";
import { EmptyState } from "../components/ui/EmptyState";
import { Panel } from "../components/ui/Panel";
import { Spinner } from "../components/ui/Spinner";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);

  const orderQ = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId),
    enabled: !!orderId,
  });

  async function handleDownloadPdf() {
    const blob = await downloadOrderPdf(orderId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VentaGamer-${orderId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (orderQ.isLoading)
    return (
      <div className="py-16 flex justify-center">
        <Spinner label="cargando_orden" />
      </div>
    );
  if (!orderQ.data)
    return (
      <EmptyState
        icon="⊘"
        title="Orden no encontrada"
        description="O bien no existe, o no tenés permisos para verla."
        action={
          <Link to="/orders" className="btn btn-ghost">
            ← Mis pedidos
          </Link>
        }
      />
    );

  const order = orderQ.data;
  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Panel
        corners
        glow
        padding="lg"
        className="relative overflow-hidden text-center"
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(57,255,122,0.18) 0%, transparent 60%)",
          }}
        />
        <div className="relative">
          <div className="font-mono text-[0.7rem] uppercase tracking-widest2 text-neon-green animate-glow-pulse mb-2">
            [✓] TRANSACTION_CONFIRMED
          </div>
          <h1 className="font-display font-black uppercase text-4xl md:text-5xl">
            ¡COMPRA <span className="text-neon-green text-glow-cyan">CONFIRMADA</span>!
          </h1>
          <p className="text-fg-muted mt-2 font-mono text-sm">
            ORDER · {order.orderNumber}
          </p>
        </div>
      </Panel>

      <div className="grid md:grid-cols-3 gap-3">
        <Panel padding="sm" className="px-4 py-3">
          <div className="label">Cliente</div>
          <div className="font-display font-semibold">{order.customerUsername}</div>
        </Panel>
        <Panel padding="sm" className="px-4 py-3">
          <div className="label">Fecha</div>
          <div className="font-mono text-sm">
            {new Date(order.placedAtUtc).toLocaleString()}
          </div>
        </Panel>
        <Panel padding="sm" className="px-4 py-3">
          <div className="label">Items</div>
          <div className="font-display font-semibold">
            {totalItems} <span className="text-fg-muted text-sm font-normal">unidades</span>
          </div>
        </Panel>
      </div>

      <Panel padding="none" className="overflow-hidden">
        <div className="px-5 py-3 border-b border-line bg-ink-700/40">
          <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-cyan">
            // DETALLE_DE_LOOT
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-cyber">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="text-right">P. Unit</th>
                <th className="text-center">Cant</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.productId}>
                  <td>
                    <div className="font-display font-semibold">{it.productTitle}</div>
                    <div className="font-mono text-xs text-fg-dim">
                      SKU.{it.productId.toString().padStart(5, "0")}
                    </div>
                  </td>
                  <td className="text-right font-mono">
                    ${it.unitPrice.toFixed(2)}
                  </td>
                  <td className="text-center">
                    <Chip tone="muted">×{it.quantity}</Chip>
                  </td>
                  <td className="text-right font-display font-semibold text-neon-cyan">
                    ${it.lineTotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-line bg-ink-900/40 flex items-center justify-between">
          <span className="font-display font-semibold tracking-widest2 uppercase text-fg-muted">
            Total
          </span>
          <span className="font-display font-black text-3xl text-neon-cyan text-glow-cyan">
            ${order.total.toFixed(2)}
          </span>
        </div>
      </Panel>

      <div className="flex flex-wrap gap-3 justify-end">
        <Link to="/orders" className="btn btn-ghost">
          ← Mis pedidos
        </Link>
        <Button variant="primary" onClick={handleDownloadPdf}>
          ⬇ Descargar PDF
        </Button>
      </div>
    </div>
  );
}
