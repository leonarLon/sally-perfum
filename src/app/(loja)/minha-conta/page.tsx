import Link from "next/link";
import { OrderList } from "@/components/account/order-list";
import { getProfile, listMyOrders } from "@/lib/account/queries";

export const metadata = { title: "Resumo" };

export default async function AccountHome({ searchParams }: PageProps<"/minha-conta">) {
  const [sp, profile, orders] = await Promise.all([searchParams, getProfile(), listMyOrders(3)]);
  const first = profile.full_name?.split(" ")[0];
  return (
    <div className="space-y-8">
      {sp.senha === "alterada" && (
        <p role="status" className="rounded-card bg-success/10 px-4 py-2 text-sm text-success">
          Senha alterada com sucesso.
        </p>
      )}
      <div>
        <h1 className="font-display text-3xl font-semibold">Olá{first ? `, ${first}` : ""}!</h1>
        <p className="text-sm text-muted">{profile.email}</p>
      </div>
      <section aria-labelledby="ultimos" className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 id="ultimos" className="font-display text-xl font-semibold">
            Últimos pedidos
          </h2>
          <Link href="/minha-conta/pedidos" className="text-sm text-primary hover:underline">
            Ver todos
          </Link>
        </div>
        {orders.length ? (
          <OrderList orders={orders} />
        ) : (
          <p className="text-sm text-muted">
            Você ainda não fez pedidos com esta conta.{" "}
            <Link href="/produtos" className="text-primary underline">
              Ver perfumes
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}
