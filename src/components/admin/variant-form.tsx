"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { AdminVariant } from "@/lib/admin/queries";
import type { FormState } from "@/lib/admin/schemas";
import { CheckboxField, Field, FormMessage, keepValuesOnSubmit, type FormAction } from "./form-kit";

/** Centavos → "1.299,90" para edição (sem float). */
function centsToInput(cents: number | null | undefined) {
  if (cents == null) return "";
  const reais = Math.trunc(cents / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${reais},${String(cents % 100).padStart(2, "0")}`;
}

export function VariantForm({ action, variant, suggestedSku }: { action: FormAction; variant?: AdminVariant; suggestedSku?: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  return (
    <form action={formAction} onSubmit={keepValuesOnSubmit(formAction)} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Field name="sku" label="SKU" state={state} defaultValue={variant?.sku ?? suggestedSku} required className="lg:col-span-2" />
        <Field name="volume_ml" label="Volume (ml)" state={state} defaultValue={variant?.volume_ml ?? ""} inputMode="numeric" />
        <Field name="price" label="Preço (R$)" state={state} defaultValue={centsToInput(variant?.price_cents)} inputMode="decimal" placeholder="189,90" required />
        <Field name="compare_at" label="Preço “de” (R$)" state={state} defaultValue={centsToInput(variant?.compare_at_cents)} inputMode="decimal" hint="Opcional, para promoção." />
        <Field name="barcode" label="Código de barras" state={state} defaultValue={variant?.barcode ?? ""} inputMode="numeric" />
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <CheckboxField name="is_active" label="Ativa na loja" defaultChecked={variant ? variant.is_active : true} />
        <CheckboxField
          name="price_confirmed"
          label="Preço confirmado"
          defaultChecked={variant ? !variant.price_is_reference : false}
          hint="Desmarcado = preço de referência, ainda não conferido."
        />
        <Field name="weight_g" label="Peso (g)" state={state} defaultValue={variant?.weight_g ?? ""} inputMode="numeric" className="w-32" />
        <Button type="submit" size="sm" disabled={pending} className="ml-auto">
          {pending ? "Salvando…" : variant ? "Salvar variante" : "Adicionar variante"}
        </Button>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
