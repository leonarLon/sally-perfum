"use client";
import { useCartCount } from "@/lib/cart/store";

/** Contador da sacola no ícone do cabeçalho (lido do navegador após a hidratação). */
export function CartCount() {
  const count = useCartCount();
  if (!count) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold leading-5 text-primary-foreground">
      {count > 99 ? "99+" : count}
      <span className="sr-only"> {count === 1 ? "item" : "itens"} na sacola</span>
    </span>
  );
}
