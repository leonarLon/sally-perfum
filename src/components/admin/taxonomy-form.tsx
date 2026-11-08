"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { FormState } from "@/lib/admin/schemas";
import { CheckboxField, Field, FormMessage, keepValuesOnSubmit, type FormAction } from "./form-kit";

type Item = { name: string; slug: string; is_active: boolean; description?: string | null; position?: number };

/** Linha editável de marca/categoria (id null = criar). */
export function TaxonomyForm({ action, item, withCategoryFields = false, label }: { action: FormAction; item?: Item; withCategoryFields?: boolean; label: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  return (
    <form action={formAction} onSubmit={keepValuesOnSubmit(formAction)} className="space-y-2" noValidate aria-label={label}>
      <div className={withCategoryFields ? "grid gap-3 sm:grid-cols-[1fr_1fr_1.5fr_5rem_auto_auto] sm:items-end" : "grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end"}>
        <Field name="name" label="Nome" state={state} defaultValue={item?.name} required maxLength={80} />
        <Field name="slug" label="Slug" state={state} defaultValue={item?.slug} maxLength={80} placeholder="gerado do nome" />
        {withCategoryFields && (
          <>
            <Field name="description" label="Descrição" state={state} defaultValue={item?.description ?? ""} maxLength={500} />
            <Field name="position" label="Ordem" state={state} type="number" min={0} max={999} defaultValue={item?.position ?? 0} />
          </>
        )}
        <div className="pb-2.5">
          <CheckboxField name="is_active" label="Ativa" defaultChecked={item ? item.is_active : true} />
        </div>
        <Button type="submit" size="sm" disabled={pending} className="mb-1">
          {pending ? "Salvando…" : item ? "Salvar" : "Criar"}
        </Button>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
