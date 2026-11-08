"use client";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { signInAdmin, type LoginState } from "./actions";

/**
 * Lê ?returnTo e ?erro no navegador. A página de login fica 100% estática de propósito:
 * com Cache Components, o envio sem JavaScript (antes da hidratação) numa página com
 * trecho dinâmico devolvia só o trecho, e o navegador mostrava a tela em branco.
 * O servidor ainda valida o returnTo (safeAdminReturnTo).
 */
export function AdminLoginFormWithParams() {
  const sp = useSearchParams();
  return <AdminLoginForm returnTo={sp.get("returnTo") ?? undefined} noPermission={sp.get("erro") === "sem-permissao"} />;
}

export function AdminLoginForm({ returnTo, noPermission = false }: { returnTo?: string; noPermission?: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signInAdmin, {});
  return (
    <>
      {noPermission && !state.error && (
        <p role="alert" className="mt-4 rounded-card bg-secondary p-3 text-sm text-secondary-foreground">
          Sua conta não tem acesso ao painel. Entre com uma conta de administrador.
        </p>
      )}
      <form action={action} className="mt-6 space-y-4 text-left" noValidate>
        <input type="hidden" name="returnTo" value={returnTo ?? "/admin"} />
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.email} aria-invalid={Boolean(state.error)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" required aria-invalid={Boolean(state.error)} />
        </div>
        <p role="alert" className="min-h-5 text-sm text-error">
          {state.error}
        </p>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Entrando…" : "Entrar"}
        </Button>
      </form>
    </>
  );
}
