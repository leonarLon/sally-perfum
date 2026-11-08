"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { FormState } from "@/lib/admin/schemas";
import { Field, FormMessage, type FormAction } from "./form-kit";

export function ImageUploadForm({ action, defaultAlt }: { action: FormAction; defaultAlt: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  return (
    <form action={formAction} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          name="file"
          label="Arquivo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          state={state}
          required
          hint="JPEG, PNG ou WebP, de 5 KB a 5 MB. O formato é conferido pelo conteúdo do arquivo."
          className="[&_input]:h-auto [&_input]:py-2"
        />
        <Field name="alt" label="Descrição da imagem (texto alternativo)" state={state} defaultValue={defaultAlt} required maxLength={160} />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Enviando…" : "Enviar imagem"}
      </Button>
      <FormMessage state={state} />
    </form>
  );
}
