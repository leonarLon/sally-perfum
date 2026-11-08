"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { placeOrder, type CheckoutState } from "@/app/(loja)/checkout/actions";
import { Field, FormMessage, SelectField } from "@/components/admin/form-kit";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/card";
import { cart, useCart, useHydrated } from "@/lib/cart/store";
import { PAYMENT_METHODS, UFS } from "@/lib/checkout/schemas";
import { formatBRL } from "@/lib/money";
import { CEP_KEY } from "./cart-view";
import { OrderSummary } from "./order-summary";
import { useQuote } from "./use-quote";

export function CheckoutForm() {
  const hydrated = useHydrated();
  const items = useCart();
  const router = useRouter();
  // Uma chave por tentativa de compra, criada no primeiro envio: clique duplo ou reenvio
  // devolvem o MESMO pedido (create_order é idempotente pela chave).
  const idempotencyKey = useRef<string | null>(null);
  const [cep, setCep] = useState(() => (typeof window === "undefined" ? "" : (sessionStorage.getItem(CEP_KEY) ?? "")));
  const cepDigits = cep.replace(/\D/g, "");
  const { quote, loading } = useQuote(items, cepDigits.length === 8 ? cepDigits : undefined);
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(placeOrder, {});

  useEffect(() => {
    if (state.ok && state.token) {
      cart.clear();
      router.replace(`/pedido/${state.token}?novo=1`);
    }
  }, [state, router]);

  if (!hydrated) return <Skeleton className="h-96 w-full" />;
  if (!items.length && !state.ok) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg">Sua sacola está vazia.</p>
        <Link href="/produtos" className="mt-4 inline-block text-primary hover:underline">
          Ver perfumes
        </Link>
      </div>
    );
  }

  const problems = quote?.lines.filter((l) => !l.available || l.quantity < l.requested) ?? [];
  const blocked = !quote || problems.length > 0;
  const s: CheckoutState = state;

  return (
    <form
      noValidate
      className="grid gap-8 lg:grid-cols-[1fr_22rem]"
      onSubmit={(e) => {
        e.preventDefault(); // sem o reset automático do React 19
        const fd = new FormData(e.currentTarget);
        idempotencyKey.current ??= crypto.randomUUID();
        fd.set("idempotency_key", idempotencyKey.current);
        startTransition(() => formAction(fd));
      }}
    >
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <div className="space-y-8">
        <FormMessage state={s} />

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 font-display text-xl font-semibold">Seus dados</legend>
          <Field name="name" label="Nome completo" state={s} autoComplete="name" required className="sm:col-span-2" />
          <Field name="email" label="E-mail" type="email" state={s} autoComplete="email" required hint="Enviaremos o link do pedido para este e-mail (simulado nesta demonstração)." />
          <Field name="phone" label="Celular (opcional)" type="tel" state={s} autoComplete="tel" inputMode="tel" placeholder="(11) 98765-4321" />
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-6">
          <legend className="mb-3 font-display text-xl font-semibold">Entrega</legend>
          <Field
            name="cep"
            label="CEP"
            state={s}
            autoComplete="postal-code"
            inputMode="numeric"
            maxLength={9}
            required
            value={cep}
            onChange={(e) => {
              setCep(e.target.value);
              sessionStorage.setItem(CEP_KEY, e.target.value);
            }}
            className="sm:col-span-2"
          />
          <Field name="street" label="Endereço" state={s} autoComplete="address-line1" required className="sm:col-span-4" />
          <Field name="number" label="Número" state={s} required className="sm:col-span-2" />
          <Field name="complement" label="Complemento (opcional)" state={s} autoComplete="address-line2" className="sm:col-span-4" />
          <Field name="district" label="Bairro" state={s} required className="sm:col-span-2" />
          <Field name="city" label="Cidade" state={s} autoComplete="address-level2" required className="sm:col-span-3" />
          <SelectField name="state" label="Estado" state={s} required options={UFS.map((u) => ({ value: u, label: u }))} className="sm:col-span-1" />
        </fieldset>

        <fieldset>
          <legend className="mb-3 font-display text-xl font-semibold">Pagamento</legend>
          <div role="radiogroup" className="grid gap-3 sm:grid-cols-3">
            {Object.entries(PAYMENT_METHODS).map(([value, label], i) => (
              <label key={value} className="flex cursor-pointer items-center gap-3 rounded-card border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-secondary/40">
                <input type="radio" name="payment_method" value={value} defaultChecked={i === 0} className="accent-primary" />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>
          {s.fieldErrors?.payment_method && <p className="mt-2 text-xs text-error">{s.fieldErrors.payment_method}</p>}
          <p className="mt-3 text-xs text-muted">
            Demonstração: nenhum pagamento é cobrado. O pedido fica aguardando pagamento e o estoque fica reservado por 30 minutos.
          </p>
        </fieldset>

        <div className="space-y-1">
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="privacy" className="mt-0.5 size-4 accent-primary" aria-invalid={Boolean(s.fieldErrors?.privacy)} />
            <span>
              Li e aceito a{" "}
              <Link href="/privacidade" target="_blank" className="text-primary underline">
                política de privacidade
                <span className="sr-only"> (abre em nova aba)</span>
              </Link>
              . Seus dados são usados só para processar este pedido.
            </span>
          </label>
          {s.fieldErrors?.privacy && <p className="text-xs text-error">{s.fieldErrors.privacy}</p>}
        </div>
      </div>

      <div className="space-y-4">
        {quote && (
          <ul className="space-y-2 text-sm">
            {quote.lines.map((l) => (
              <li key={l.variant_id} className="flex justify-between gap-3">
                <span className={l.available ? "" : "text-error line-through"}>
                  {l.quantity || l.requested}× {l.name ?? "Produto indisponível"}
                  {l.volume_ml ? ` ${l.volume_ml} ml` : ""}
                </span>
                <span className="tabular-nums">{formatBRL(l.line_total_cents)}</span>
              </li>
            ))}
          </ul>
        )}
        <OrderSummary quote={quote} loading={loading}>
          <Button type="submit" size="lg" className="w-full" disabled={pending || blocked || state.ok}>
            {pending || state.ok ? "Enviando pedido…" : "Concluir pedido"}
          </Button>
          {problems.length > 0 && (
            <p className="text-xs text-error">
              Há itens indisponíveis ou acima do estoque.{" "}
              <Link href="/carrinho" className="underline">
                Revise a sacola
              </Link>
              .
            </p>
          )}
        </OrderSummary>
      </div>
    </form>
  );
}
