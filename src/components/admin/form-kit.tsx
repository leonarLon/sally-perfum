"use client";
import { startTransition, useActionState, useId } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { FormState } from "@/lib/admin/schemas";
import { cn } from "@/lib/utils";

export type FormAction = (prev: FormState, formData: FormData) => Promise<FormState>;

/**
 * Envia sem o reset automático do React 19 (que apagaria o que foi digitado quando a
 * validação falha). Sem JavaScript, o `action` do form continua funcionando.
 */
export function keepValuesOnSubmit(formAction: (formData: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => formAction(formData));
  };
}

/** Mensagem geral do formulário: sucesso (status) ou erro (alert), lida por leitores de tela. */
export function FormMessage({ state }: { state: FormState }) {
  if (!state.message) return null;
  return state.ok ? (
    <p role="status" className="rounded-card bg-success/10 px-4 py-2 text-sm text-success">
      {state.message}
    </p>
  ) : (
    <p role="alert" className="rounded-card bg-error/10 px-4 py-2 text-sm text-error">
      {state.message}
    </p>
  );
}

type FieldProps = {
  name: string;
  label: string;
  state: FormState;
  hint?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">;

/** Campo com rótulo, dica e erro ligados por aria-describedby. */
export function Field({ name, label, state, hint, className, ...props }: FieldProps) {
  const id = useId();
  const error = state.fieldErrors?.[name];
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...props} />
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}

const controlClass =
  "w-full rounded-card border border-border bg-background px-4 py-2.5 text-sm text-text focus-visible:border-primary aria-[invalid=true]:border-error";

export function SelectField({
  name,
  label,
  state,
  options,
  defaultValue,
  hint,
  className,
  required,
}: {
  name: string;
  label: string;
  state: FormState;
  options: { value: string; label: string }[];
  defaultValue?: string;
  hint?: string;
  className?: string;
  required?: boolean;
}) {
  const id = useId();
  const error = state.fieldErrors?.[name];
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={[hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(" ") || undefined}
        className={cn(controlClass, "h-11 py-0")}
      >
        {!defaultValue && <option value="">Selecione…</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextAreaField({
  name,
  label,
  state,
  defaultValue,
  hint,
  rows = 3,
  className,
}: {
  name: string;
  label: string;
  state: FormState;
  defaultValue?: string | null;
  hint?: string;
  rows?: number;
  className?: string;
}) {
  const id = useId();
  const error = state.fieldErrors?.[name];
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        aria-invalid={Boolean(error)}
        aria-describedby={[hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(" ") || undefined}
        className={controlClass}
      />
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function CheckboxField({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  const id = useId();
  return (
    <div className="flex items-start gap-2">
      <input id={id} type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-4 accent-primary" aria-describedby={hint ? `${id}-hint` : undefined} />
      <div>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {hint && (
          <p id={`${id}-hint`} className="text-xs text-muted">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Botão isolado que dispara uma ação (ex.: definir principal, remover).
 * `confirmText` pede confirmação antes de ações destrutivas.
 */
export function ActionButton({
  action,
  children,
  confirmText,
  pendingText = "Aguarde…",
  ...buttonProps
}: { action: (prev: FormState) => Promise<FormState>; confirmText?: string; pendingText?: string } & Omit<ButtonProps, "formAction">) {
  const [state, run, pending] = useActionState<FormState>(action, {});
  return (
    <form
      action={run}
      onSubmit={(e) => {
        if (confirmText && !window.confirm(confirmText)) e.preventDefault();
      }}
      className="inline-flex flex-col gap-1"
    >
      <Button type="submit" size="sm" disabled={pending} {...buttonProps}>
        {pending ? pendingText : children}
      </Button>
      {state.message && !state.ok && (
        <span role="alert" className="text-xs text-error">
          {state.message}
        </span>
      )}
    </form>
  );
}
