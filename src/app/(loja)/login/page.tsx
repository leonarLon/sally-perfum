import { Suspense } from "react";
import { AuthCard } from "@/components/account/auth-card";
import { LoginForm, LoginFormWithParams } from "@/components/account/auth-forms";

export const metadata = { title: "Entrar", robots: { index: false } };

export default function LoginPage() {
  return (
    <AuthCard title="Entrar" subtitle="Acompanhe pedidos, salve endereços e favoritos.">
      <Suspense fallback={<LoginForm />}>
        <LoginFormWithParams />
      </Suspense>
    </AuthCard>
  );
}
