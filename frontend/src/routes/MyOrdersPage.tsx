import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getMyOrders } from "../features/cart/cart.api";
import { Chip } from "../components/ui/Chip";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { Spinner } from "../components/ui/Spinner";

export function MyOrdersPage() {
  const ordersQ = useQuery({
    queryKey: ["orders", "mine"],
    queryFn: getMyOrders,
  });

  if (ordersQ.isLoading)
    return (
      <div className="py-16 flex justify-center">
        <Spinner label="cargando_historial" />
      </div>
    );
  if (!ordersQ.data)
    return (
      <EmptyState
        icon="⚠"
        title="Error"
        description="No pudimos cargar tu historial."
      />
    );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="// HISTORIAL_PERSONAL"
        title="Mis pedidos"
        subtitle={
          ordersQ.data.length > 0
            ? `${ordersQ.data.length} ${ordersQ.data.length === 1 ? "compra" : "compras"} registradas`
            : "Todavía no compraste nada."
        }
      />

      {ordersQ.data.length === 0 ? (
        <EmptyState
          icon="∅"
          title="Sin compras todavía"
          description="Tu primera misión: elegí algo del catálogo y completá tu primera compra."
          action={
            <Link to="/" className="btn btn-primary">
              ▶ Ir al catálogo
            </Link>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {ordersQ.data.map((o) => {
            const items = o.items.reduce((s, i) => s + i.quantity, 0);
            return (
              <Link key={o.id} to={`/orders/${o.id}`} className="group">
                <Panel
                  corners
                  padding="md"
                  className="h-full hover:panel-glow transition-all relative"
                >
                  <div className="flex items-center justify-between">
                    <Chip tone="cyan">ORDER · #{o.id}</Chip>
                    <span className="font-mono text-[0.6rem] uppercase tracking-widest2 text-fg-muted group-hover:text-neon-cyan">
                      VER →
                    </span>
                  </div>

                  <div className="mt-3 font-mono text-sm text-neon-cyan break-all">
                    {o.orderNumber}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <div className="text-fg-dim uppercase tracking-widest2">FECHA</div>
                      <div className="text-fg mt-0.5">
                        {new Date(o.placedAtUtc).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-fg-dim uppercase tracking-widest2">ITEMS</div>
                      <div className="text-fg mt-0.5">{items}</div>
                    </div>
                  </div>

                  <div className="divider-neon my-4" />

                  <div>
                    <div className="font-mono text-[0.6rem] uppercase tracking-widest2 text-fg-dim">
                      TOTAL
                    </div>
                    <div className="font-display font-bold text-2xl text-neon-cyan text-glow-cyan">
                      ${o.total.toFixed(2)}
                    </div>
                  </div>
                </Panel>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
