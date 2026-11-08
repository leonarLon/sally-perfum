import { Suspense } from "react";
import { AuthCard } from "@/components/account/auth-card";
import { SignupForm, SignupFormWithParams } from "@/components/account/auth-forms";

export const metadata = { title: "Criar conta", robots: { index: false } };

export default function SignupPage() {
  return (
    <AuthCard title="Criar conta" subtitle="Comprar sem cadastro continua possível; a conta só facilita.">
      <Suspense fallback={<SignupForm />}>
        <SignupFormWithParams />
      </Suspense>
    </AuthCard>
  );
}
