import { AuthCard } from "@/components/account/auth-card";
import { ResetRequestForm } from "@/components/account/auth-forms";

export const metadata = { title: "Recuperar senha", robots: { index: false } };

export default function ResetPage() {
  return (
    <AuthCard title="Recuperar senha" subtitle="Enviaremos um link para você criar uma nova senha.">
      <ResetRequestForm />
    </AuthCard>
  );
}
