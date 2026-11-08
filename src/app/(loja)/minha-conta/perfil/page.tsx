import { Download } from "lucide-react";
import { DeleteAccountForm, PasswordChangeForm, ProfileForm } from "@/components/account/account-forms";
import { getProfile } from "@/lib/account/queries";

export const metadata = { title: "Dados e privacidade" };

export default async function ProfilePage() {
  const profile = await getProfile("/minha-conta/perfil");
  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl font-semibold">Dados e privacidade</h1>

      <section aria-labelledby="dados" className="space-y-3">
        <h2 id="dados" className="font-display text-xl font-semibold">
          Seus dados
        </h2>
        <p className="text-sm text-muted">E-mail da conta: {profile.email}</p>
        <ProfileForm profile={profile} />
      </section>

      <section aria-labelledby="senha" className="space-y-3">
        <h2 id="senha" className="font-display text-xl font-semibold">
          Senha
        </h2>
        <PasswordChangeForm />
      </section>

      <section aria-labelledby="lgpd" className="space-y-3">
        <h2 id="lgpd" className="font-display text-xl font-semibold">
          Seus direitos (LGPD)
        </h2>
        <p className="text-sm text-muted">Baixe uma cópia de tudo o que a loja guarda sobre você: perfil, endereços, favoritos e pedidos.</p>
        <a
          href="/minha-conta/dados"
          download
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-surface"
        >
          <Download className="size-4" aria-hidden /> Baixar meus dados (JSON)
        </a>
      </section>

      <section aria-labelledby="excluir" className="space-y-3 rounded-card border border-error/30 p-5">
        <h2 id="excluir" className="font-display text-xl font-semibold text-error">
          Excluir conta
        </h2>
        <p className="text-sm">
          Apaga seu perfil, endereços e favoritos e encerra o acesso. Pedidos já feitos são mantidos, sem vínculo com a conta,
          porque a loja precisa guardá-los por obrigação legal. Essa ação não pode ser desfeita.
        </p>
        <DeleteAccountForm />
      </section>
    </div>
  );
}
