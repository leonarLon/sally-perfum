import { OrderList } from "@/components/account/order-list";
import { listMyOrders } from "@/lib/account/queries";

export const metadata = { title: "Meus pedidos" };

export default async function MyOrdersPage() {
  const orders = await listMyOrders();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Meus pedidos</h1>
      {orders.length ? (
        <OrderList orders={orders} />
      ) : (
        <p className="text-sm text-muted">
          Nenhum pedido feito com esta conta. Pedidos feitos sem entrar na conta continuam acessíveis pelo link de acompanhamento.
        </p>
      )}
    </div>
  );
}
