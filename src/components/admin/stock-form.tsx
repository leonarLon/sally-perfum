"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { InventoryRow } from "@/lib/admin/queries";
import type { FormState } from "@/lib/admin/schemas";
import { Field, FormMessage, SelectField, type FormAction } from "./form-kit";

const MODES = [
  { value: "set", label: "Contagem conferida (define o total)" },
  { value: "in", label: "Entrada de mercadoria (soma)" },
];

/**
 * Remontado (key) quando a quantidade muda no servidor, para os valores padrão
 * acompanharem o estoque atual.
 */
export function StockForm({ action, row, compact = false }: { action: FormAction; row: InventoryRow; compact?: boolean }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  return (
    <form action={formAction} className="space-y-2" noValidate aria-label={`Estoque ${row.sku}`}>
      <input type="hidden" name="variant_id" value={row.variant_id} />
      <div className={compact ? "grid gap-2 sm:grid-cols-[1.4fr_0.6fr_0.6fr_1.4fr_auto] sm:items-end" : "grid gap-3 sm:grid-cols-2"}>
        <SelectField name="mode" label="Tipo" state={state} defaultValue="set" options={MODES} />
        <Field name="quantity" label="Quantidade" state={state} type="number" min={0} max={100000} defaultValue={row.on_hand} required />
        <Field name="min_stock" label="Mínimo" state={state} type="number" min={0} max={10000} defaultValue={row.min_stock} required />
        <Field name="reason" label="Motivo" state={state} placeholder="Ex.: contagem de inventário" required maxLength={200} />
        <Button type="submit" size="sm" disabled={pending} className={compact ? "mb-0.5" : undefined}>
          {pending ? "Salvando…" : "Atualizar"}
        </Button>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
