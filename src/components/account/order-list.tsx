import Link from "next/link";
import { formatDateTime } from "@/components/admin/labels";
import { Badge } from "@/components/ui/badge";
import type { MyOrder } from "@/lib/account/queries";
import { ORDER_STATUS } from "@/lib/checkout/status";
import { formatBRL } from "@/lib/money";

export function OrderList({ orders }: { orders: MyOrder[] }) {
  return (
    <ul className="divide-y divide-border rounded-card border border-border">
      {orders.map((o) => (
        <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
          <Link href={`/minha-conta/pedidos/${o.id}`} className="font-medium text-primary hover:underline">
            Pedido #{o.number}
          </Link>
          <span className="text-muted">{formatDateTime(o.created_at)}</span>
          <Badge variant={ORDER_STATUS[o.status].variant}>{ORDER_STATUS[o.status].label}</Badge>
          <span className="tabular-nums">{formatBRL(o.total_cents)}</span>
        </li>
      ))}
    </ul>
  );
}
