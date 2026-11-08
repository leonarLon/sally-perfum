import { AuthCard } from "@/components/account/auth-card";
import { NewPasswordForm } from "@/components/account/auth-forms";

export const metadata = { title: "Nova senha", robots: { index: false } };

/** Chega aqui pelo link do e-mail (a rota /auth/callback já abriu a sessão de recuperação). */
export default function NewPasswordPage() {
  return (
    <AuthCard title="Criar nova senha">
      <NewPasswordForm />
    </AuthCard>
  );
}
