import Link from "next/link";
import { Suspense } from "react";
import { CheckoutForm, type CheckoutDefaults } from "@/components/cart/checkout-form";
import { Container, Skeleton } from "@/components/ui/card";
import type { Address } from "@/lib/account/queries";
import { getSessionUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Finalizar compra", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <Container className="py-10">
      <h1 className="mb-2 font-display text-3xl font-semibold">Finalizar compra</h1>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <CheckoutWithDefaults />
      </Suspense>
    </Container>
  );
}

/** Para quem está logado, preenche nome, contato e endereço padrão (lidos com a própria sessão). */
async function CheckoutWithDefaults() {
  const user = await getSessionUser();
  let defaults: CheckoutDefaults | null = null;
  if (user) {
    const supabase = await createSupabaseServerClient();
    const [profile, addresses] = await Promise.all([
      supabase.from("profiles").select("full_name, phone").maybeSingle(),
      supabase
        .from("customer_addresses")
        .select("id, label, recipient, cep, street, number, complement, district, city, state, is_default")
        .order("is_default", { ascending: false })
        .order("created_at"),
    ]);
    defaults = {
      name: profile.data?.full_name ?? user.name,
      email: user.email,
      phone: profile.data?.phone ?? null,
      addresses: (addresses.data ?? []) as Address[],
    };
  }
  return (
    <>
      <p className="mb-8 text-sm text-muted">
        {user ? (
          "O pedido ficará salvo em Meus pedidos."
        ) : (
          <>
            Compre sem cadastro: você recebe um link para acompanhar o pedido. Já tem conta?{" "}
            <Link href="/login?returnTo=/checkout" className="text-primary underline">
              Entre
            </Link>{" "}
            para usar seus endereços salvos.
          </>
        )}
      </p>
      <CheckoutForm defaults={defaults} />
    </>
  );
}
