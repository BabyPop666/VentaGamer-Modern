import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { downloadOrderPdf, getOrder } from "../features/cart/cart.api";

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

  if (orderQ.isLoading) return <p className="text-slate-500">Cargando pedido...</p>;
  if (!orderQ.data) return <p className="text-red-600">Pedido no encontrado.</p>;

  const order = orderQ.data;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center bg-green-50 border border-green-200 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-green-700">¡Pedido confirmado!</h1>
        <p className="text-green-600 text-sm mt-1">
          Pedido <span className="font-mono">{order.orderNumber}</span>
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Cliente</p>
            <p className="font-semibold">{order.customerUsername}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Fecha</p>
            <p className="text-sm font-mono">
              {new Date(order.placedAtUtc).toLocaleString()}
            </p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="text-xs text-slate-500 border-b">
            <tr>
              <th className="text-left py-2">Producto</th>
              <th className="text-right py-2">P. Unitario</th>
              <th className="text-center py-2">Cant.</th>
              <th className="text-right py-2">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((it) => (
              <tr key={it.productId}>
                <td className="py-3">{it.productTitle}</td>
                <td className="text-right">${it.unitPrice.toFixed(2)}</td>
                <td className="text-center">{it.quantity}</td>
                <td className="text-right font-semibold">${it.lineTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300">
              <td colSpan={3} className="py-3 text-right font-semibold">
                TOTAL:
              </td>
              <td className="text-right text-xl font-bold text-brand-900">
                ${order.total.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>

        <button
          onClick={handleDownloadPdf}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2 rounded font-medium"
        >
          Descargar comprobante PDF
        </button>
      </div>
    </div>
  );
}
