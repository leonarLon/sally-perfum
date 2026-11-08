"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { FormState } from "@/lib/admin/schemas";
import type { AdminProduct, Brand, Category } from "@/lib/admin/queries";
import { CheckboxField, Field, FormMessage, SelectField, TextAreaField, keepValuesOnSubmit, type FormAction } from "./form-kit";

const GENDERS = [
  { value: "feminino", label: "Feminino" },
  { value: "masculino", label: "Masculino" },
  { value: "unissex", label: "Unissex" },
];
const ORIGINS = [
  { value: "importado", label: "Importado" },
  { value: "nacional", label: "Nacional" },
];
const STATUSES = [
  { value: "draft", label: "Rascunho (oculto na loja)" },
  { value: "published", label: "Publicado" },
  { value: "archived", label: "Arquivado (oculto na loja)" },
];
const REVIEW = [
  { value: "pending", label: "Pendente de revisão" },
  { value: "approved", label: "Revisado e aprovado" },
];

const NOTES_HINT = "Separe por vírgula. Deixe vazio se a informação não foi confirmada: a loja avisa o cliente.";

export function ProductForm({
  action,
  product,
  brands,
  categories,
}: {
  action: FormAction;
  product?: AdminProduct;
  brands: Brand[];
  categories: Category[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const join = (list: string[] | null | undefined) => (list ?? []).join(", ");
  const isNew = !product;

  return (
    <form action={formAction} onSubmit={keepValuesOnSubmit(formAction)} className="space-y-8" noValidate>
      <FormMessage state={state} />

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 font-display text-xl font-semibold">Identificação</legend>
        <Field name="name" label="Nome" state={state} defaultValue={product?.name} required maxLength={160} className="sm:col-span-2" />
        <Field
          name="slug"
          label="Slug (endereço)"
          state={state}
          defaultValue={product?.slug}
          maxLength={80}
          hint={isNew ? "Deixe vazio para gerar a partir do nome." : "Mudar o slug muda o link do produto na loja."}
        />
        <SelectField
          name="brand_id"
          label="Marca"
          state={state}
          required
          defaultValue={product?.brand_id}
          options={brands.map((b) => ({ value: b.id, label: b.is_active ? b.name : `${b.name} (inativa)` }))}
        />
        <SelectField
          name="category_id"
          label="Categoria"
          state={state}
          required
          defaultValue={product?.category_id}
          options={categories.map((c) => ({ value: c.id, label: c.is_active ? c.name : `${c.name} (inativa)` }))}
        />
        <SelectField name="gender" label="Gênero" state={state} required defaultValue={product?.gender} options={GENDERS} />
        <SelectField name="origin" label="Origem" state={state} required defaultValue={product?.origin} options={ORIGINS} />
        <Field name="concentration" label="Concentração" state={state} defaultValue={product?.concentration ?? ""} placeholder="Eau de Parfum" maxLength={60} />
        <Field name="manufacturer" label="Fabricante" state={state} defaultValue={product?.manufacturer ?? ""} maxLength={120} />
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="mb-3 font-display text-xl font-semibold">Descrição</legend>
        <TextAreaField name="short_description" label="Resumo (até 280 caracteres)" state={state} defaultValue={product?.short_description} rows={2} />
        <TextAreaField name="description" label="Descrição completa" state={state} defaultValue={product?.description} rows={6} />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 font-display text-xl font-semibold">Perfil olfativo</legend>
        <Field name="olfactory_family" label="Família olfativa" state={state} defaultValue={product?.olfactory_family ?? ""} placeholder="Floral Frutado" maxLength={80} />
        <Field name="occasion" label="Ocasião" state={state} defaultValue={product?.occasion ?? ""} maxLength={120} />
        <TextAreaField name="top_notes" label="Notas de saída" state={state} defaultValue={join(product?.top_notes)} hint={NOTES_HINT} rows={2} />
        <TextAreaField name="heart_notes" label="Notas de corpo" state={state} defaultValue={join(product?.heart_notes)} hint={NOTES_HINT} rows={2} />
        <TextAreaField name="base_notes" label="Notas de fundo" state={state} defaultValue={join(product?.base_notes)} hint={NOTES_HINT} rows={2} />
        <TextAreaField
          name="highlights"
          label="Ingredientes em destaque"
          state={state}
          defaultValue={join(product?.highlights)}
          hint="Usado quando a pirâmide completa não foi confirmada."
          rows={2}
        />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 font-display text-xl font-semibold">Publicação</legend>
        {isNew ? (
          <p className="text-sm text-muted sm:col-span-2">
            O produto é criado como rascunho. Depois de cadastrar volumes, preços e fotos, publique-o na página de edição.
          </p>
        ) : (
          <SelectField name="status" label="Status" state={state} defaultValue={product.status} options={STATUSES} />
        )}
        <SelectField
          name="commercial_review"
          label="Revisão comercial"
          state={state}
          defaultValue={product?.commercial_review ?? "pending"}
          options={REVIEW}
          hint="Marque como aprovado depois de conferir textos, notas e fotos."
        />
        <CheckboxField name="featured" label="Destaque na página inicial" defaultChecked={product?.featured} />
      </fieldset>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : isNew ? "Criar produto" : "Salvar produto"}
        </Button>
        {state.fieldErrors && <span className="text-sm text-error">Há campos com erro.</span>}
      </div>
    </form>
  );
}
