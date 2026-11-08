"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { signInAdmin, type LoginState } from "./actions";

export function AdminLoginForm({ returnTo }: { returnTo?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signInAdmin, {});
  return (
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
  );
}
