"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Field, FormMessage } from "@/components/admin/form-kit";
import { Button } from "@/components/ui/button";
import { requestPasswordReset, signIn, signUp, updatePassword, type AuthState } from "@/lib/auth/actions";

/*
 * Páginas de autenticação são estáticas: ?returnTo e avisos são lidos no navegador.
 * Assim o envio antes da hidratação (sem JavaScript) também funciona.
 */

function useReturnTo() {
  const sp = useSearchParams();
  return { returnTo: sp.get("returnTo") ?? "", error: sp.get("erro") };
}

export function LoginForm({ returnTo = "", error }: { returnTo?: string; error?: string | null }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, {});
  const qs = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
  return (
    <form action={action} className="space-y-4" noValidate>
      {error === "link-invalido" && !state.message && (
        <p role="alert" className="rounded-card bg-error/10 px-4 py-2 text-sm text-error">
          O link é inválido ou expirou. Entre com sua senha ou peça um novo link.
        </p>
      )}
      <FormMessage state={state} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <Field name="email" label="E-mail" type="email" autoComplete="email" required state={state} defaultValue={state.email} />
      <Field name="password" label="Senha" type="password" autoComplete="current-password" required state={state} />
      <div className="text-right text-sm">
        <Link href="/recuperar-senha" className="text-primary hover:underline">
          Esqueci minha senha
        </Link>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
      <p className="text-center text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link href={`/cadastro${qs}`} className="font-medium text-primary underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}

export function LoginFormWithParams() {
  const { returnTo, error } = useReturnTo();
  return <LoginForm returnTo={returnTo} error={error} />;
}

export function SignupForm({ returnTo = "" }: { returnTo?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signUp, {});
  if (state.ok) {
    return (
      <div role="status" className="space-y-3 rounded-card bg-success/10 p-4 text-sm text-success">
        <p>{state.message}</p>
        <p className="text-text">
          Não chegou? Confira o spam. Nesta demonstração o envio de e-mails do Supabase gratuito é limitado.
        </p>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <Field name="full_name" label="Nome completo" autoComplete="name" required state={state} />
      <Field name="email" label="E-mail" type="email" autoComplete="email" required state={state} defaultValue={state.email} />
      <Field name="password" label="Senha" type="password" autoComplete="new-password" required state={state} hint="Mínimo de 8 caracteres, com letras e números." />
      <Field name="password_confirm" label="Confirme a senha" type="password" autoComplete="new-password" required state={state} />
      <div className="space-y-1">
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="privacy" className="mt-0.5 size-4 accent-primary" aria-invalid={Boolean(state.fieldErrors?.privacy)} />
          <span>
            Li e aceito a{" "}
            <Link href="/privacidade" target="_blank" className="text-primary underline">
              política de privacidade<span className="sr-only"> (abre em nova aba)</span>
            </Link>
            .
          </span>
        </label>
        {state.fieldErrors?.privacy && <p className="text-xs text-error">{state.fieldErrors.privacy}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Criando…" : "Criar conta"}
      </Button>
      <p className="text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href={`/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`} className="font-medium text-primary underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}

export function SignupFormWithParams() {
  const { returnTo } = useReturnTo();
  return <SignupForm returnTo={returnTo} />;
}

export function ResetRequestForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestPasswordReset, {});
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      {!state.ok && (
        <>
          <Field name="email" label="E-mail da conta" type="email" autoComplete="email" required state={state} />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Enviando…" : "Enviar link"}
          </Button>
        </>
      )}
      <p className="text-center text-sm">
        <Link href="/login" className="text-primary hover:underline">
          Voltar para entrar
        </Link>
      </p>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, {});
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <Field name="password" label="Nova senha" type="password" autoComplete="new-password" required state={state} hint="Mínimo de 8 caracteres, com letras e números." />
      <Field name="password_confirm" label="Confirme a nova senha" type="password" autoComplete="new-password" required state={state} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Salvando…" : "Salvar nova senha"}
      </Button>
    </form>
  );
}
