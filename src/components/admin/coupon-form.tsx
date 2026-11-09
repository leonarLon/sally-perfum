"use client";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AdminCoupon } from "@/lib/admin/queries";
import { isoToBrtLocal, type FormState } from "@/lib/admin/schemas";
import { centsToInput } from "@/lib/money";
import { CheckboxField, Field, FormMessage, keepValuesOnSubmit, SelectField, type FormAction } from "./form-kit";

/** Criação (sem coupon) ou edição de cupom. Datas em horário de Brasília. */
export function CouponForm({ action, coupon, label }: { action: FormAction; coupon?: AdminCoupon; label: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const [kind, setKind] = useState<"percent" | "fixed">(coupon?.kind ?? "percent");
  const value = coupon ? (coupon.kind === "percent" ? String(coupon.percent_off ?? "") : centsToInput(coupon.amount_off_cents)) : "";
  return (
    <form action={formAction} onSubmit={keepValuesOnSubmit(formAction)} className="space-y-4" noValidate aria-label={label}>
      <FormMessage state={state} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field name="code" label="Código" state={state} defaultValue={coupon?.code} required maxLength={32} placeholder="BEMVINDA10" autoCapitalize="characters" hint="Letras, números e hífens." />
        <Field name="description" label="Descrição (opcional)" state={state} defaultValue={coupon?.description ?? ""} maxLength={200} className="lg:col-span-3" />
        <div onChange={(e) => e.target instanceof HTMLSelectElement && setKind(e.target.value === "fixed" ? "fixed" : "percent")}>
          <SelectField
            name="kind"
            label="Tipo"
            state={state}
            required
            defaultValue={kind}
            options={[
              { value: "percent", label: "Percentual (%)" },
              { value: "fixed", label: "Valor fixo (R$)" },
            ]}
          />
        </div>
        <Field
          key={kind}
          name="value"
          label={kind === "percent" ? "Desconto (%)" : "Desconto (R$)"}
          state={state}
          required
          inputMode={kind === "percent" ? "numeric" : "decimal"}
          defaultValue={coupon?.kind === kind ? value : ""}
          placeholder={kind === "percent" ? "10" : "30,00"}
          hint={kind === "percent" ? "De 1 a 90." : undefined}
        />
        {kind === "percent" && (
          <Field name="max_discount" label="Teto do desconto (R$)" state={state} inputMode="decimal" defaultValue={centsToInput(coupon?.max_discount_cents)} hint="Opcional." />
        )}
        <Field
          name="min_subtotal"
          label="Compra mínima (R$)"
          state={state}
          inputMode="decimal"
          defaultValue={coupon?.min_subtotal_cents ? centsToInput(coupon.min_subtotal_cents) : ""}
          hint="Em produtos, sem o frete."
        />
        <Field name="starts_at" label="Início (opcional)" type="datetime-local" state={state} defaultValue={isoToBrtLocal(coupon?.starts_at ?? null)} />
        <Field name="ends_at" label="Fim (opcional)" type="datetime-local" state={state} defaultValue={isoToBrtLocal(coupon?.ends_at ?? null)} hint="Horário de Brasília." />
        <Field name="max_uses" label="Limite de usos (opcional)" state={state} inputMode="numeric" defaultValue={coupon?.max_uses ?? ""} hint="Pedidos cancelados ou expirados não contam." />
        <div className="space-y-3 sm:pt-6">
          <CheckboxField name="once_per_email" label="Um uso por e-mail" defaultChecked={coupon?.once_per_email ?? false} />
          <CheckboxField name="is_active" label="Ativo" defaultChecked={coupon ? coupon.is_active : true} />
        </div>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Salvando…" : coupon ? "Salvar cupom" : "Criar cupom"}
      </Button>
    </form>
  );
}
