import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkout, getCart, removeItem, updateItem } from "../features/cart/cart.api";
import { useAuthStore } from "../features/auth/auth.store";
import { toApiError } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { ProductImage } from "../components/ui/ProductImage";
import { Spinner } from "../components/ui/Spinner";

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
      <EmptyState
        icon="⊘"
        title="Acceso restringido"
        description="Tenés que iniciar sesión para ver el inventario de tu carrito."
        action={
          <Button variant="primary" onClick={() => navigate("/login")}>
            ▶ Iniciar sesión
          </Button>
        }
      />
    );
  }

  if (cartQ.isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <Spinner label="cargando_inventario" />
      </div>
    );
  }
  if (!cartQ.data) {
    return (
      <EmptyState
        icon="⚠"
        title="Error de sincronización"
        description="No pudimos cargar tu carrito. Probá de nuevo."
      />
    );
  }

  const cart = cartQ.data;
  const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="// INVENTARIO_TEMPORAL"
        title="Tu carrito"
        subtitle={
          cart.items.length > 0
            ? `${totalItems} ${totalItems === 1 ? "item" : "items"} · listo para checkout`
            : "Vacío. Explorá el catálogo para empezar a sumar."
        }
      />

      {error && (
        <div className="border border-neon-red/60 bg-neon-red/5 px-4 py-2 font-mono text-xs text-neon-red flex items-center justify-between">
          <span>&gt; {error}</span>
          <button
            onClick={() => setError(null)}
            className="text-fg-muted hover:text-neon-red"
          >
            ✕
          </button>
        </div>
      )}

      {cart.items.length === 0 ? (
        <EmptyState
          icon="∅"
          title="Carrito vacío"
          description="No hay loot agregado todavía. Andá al catálogo y elegí tu próximo upgrade."
          action={
            <Button variant="primary" onClick={() => navigate("/")}>
              ▶ Ver catálogo
            </Button>
          }
        />
      ) : (
        <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div className="space-y-3">
            {cart.items.map((item) => (
              <Panel
                key={item.cartItemId}
                padding="none"
                className="flex items-center gap-4 p-4 hover:panel-glow transition-all"
              >
                <div className="w-20 h-20 shrink-0 bg-ink-800 overflow-hidden border border-line">
                  <ProductImage
                    imageUrl={item.imageUrl}
                    category={item.category}
                    alt={item.productTitle}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Chip tone="cyan" className="mb-1">
                    {item.category}
                  </Chip>
                  <h3 className="font-display font-semibold truncate">
                    {item.productTitle}
                  </h3>
                  <div className="font-mono text-xs text-fg-muted mt-0.5">
                    UNIT · ${item.unitPrice.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center border border-line">
                  <button
                    className="w-8 h-8 hover:bg-neon-cyan/10 hover:text-neon-cyan font-display text-lg leading-none transition-colors"
                    onClick={() =>
                      item.quantity > 1
                        ? updateMut.mutate({ id: item.cartItemId, qty: item.quantity - 1 })
                        : removeMut.mutate(item.cartItemId)
                    }
                    aria-label="Restar"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-display font-bold text-neon-cyan">
                    {item.quantity}
                  </span>
                  <button
                    className="w-8 h-8 hover:bg-neon-cyan/10 hover:text-neon-cyan font-display text-lg leading-none transition-colors"
                    onClick={() =>
                      updateMut.mutate({ id: item.cartItemId, qty: item.quantity + 1 })
                    }
                    aria-label="Sumar"
                  >
                    +
                  </button>
                </div>

                <div className="w-24 text-right font-display font-bold text-lg text-neon-cyan text-glow-cyan">
                  ${item.lineTotal.toFixed(2)}
                </div>

                <button
                  onClick={() => removeMut.mutate(item.cartItemId)}
                  className="text-fg-muted hover:text-neon-red font-mono text-xs uppercase tracking-widest2"
                  title="Eliminar"
                >
                  [✕]
                </button>
              </Panel>
            ))}
          </div>

          <Panel corners glow padding="lg" className="lg:sticky lg:top-28">
            <div className="font-mono text-[0.65rem] uppercase tracking-widest2 text-neon-cyan">
              // RESUMEN
            </div>
            <h2 className="h-display text-2xl mb-4">Checkout</h2>

            <div className="space-y-2 font-mono text-sm">
              <Row k="Items" v={totalItems.toString()} />
              <Row k="Subtotal" v={`$${cart.total.toFixed(2)}`} />
              <Row k="Envío" v="LIVE · gratis" tone="green" />
              <Row k="Impuestos" v="incluido" tone="muted" />
            </div>

            <div className="divider-neon my-4" />

            <div className="flex items-end justify-between">
              <div>
                <div className="font-mono text-[0.6rem] uppercase tracking-widest2 text-fg-dim">
                  TOTAL
                </div>
                <div className="font-display font-bold text-3xl text-neon-cyan text-glow-cyan">
                  ${cart.total.toFixed(2)}
                </div>
              </div>
            </div>

            <Button
              variant="magenta"
              loading={checkoutMut.isPending}
              onClick={() => checkoutMut.mutate()}
              className="!w-full !py-3 mt-5"
            >
              {checkoutMut.isPending ? "PROCESANDO..." : "▶ CONFIRMAR COMPRA"}
            </Button>

            <div className="mt-3 text-center">
              <button
                onClick={() => navigate("/")}
                className="font-mono text-xs uppercase tracking-widest2 text-fg-muted hover:text-neon-cyan"
              >
                ← seguir explorando
              </button>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

function Row({
  k,
  v,
  tone = "default",
}: {
  k: string;
  v: string;
  tone?: "default" | "green" | "muted";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-fg-muted">{k}</span>
      <span
        className={
          tone === "green"
            ? "text-neon-green"
            : tone === "muted"
            ? "text-fg-dim"
            : "text-fg"
        }
      >
        {v}
      </span>
    </div>
  );
}
