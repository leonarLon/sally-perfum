import { Container } from "@/components/ui/card";

export const metadata = { title: "Política de privacidade" };

/**
 * Política de DEMONSTRAÇÃO. Antes do uso comercial deve ser substituída por um texto
 * revisado juridicamente, com os dados reais do controlador (PENDENCIAS_COMERCIAIS.md §1).
 */
export default function PrivacyPage() {
  return (
    <Container className="max-w-3xl space-y-6 py-12 text-sm leading-relaxed">
      <h1 className="font-display text-3xl font-semibold">Política de privacidade</h1>
      <p className="rounded-card bg-secondary p-4 text-secondary-foreground">
        A Sally Perfumaria é um projeto de estudo. Não há vendas, cobranças nem entregas reais. Não informe dados de
        terceiros nem dados que você não queira usar em um ambiente de teste.
      </p>

      <section className="space-y-2">
        <h2 className="font-display text-xl font-semibold">Quais dados coletamos</h2>
        <p>
          No checkout: nome, e-mail, celular (opcional) e endereço de entrega. Não pedimos CPF, data de nascimento nem dados
          de cartão. Não usamos cookies de publicidade; os cookies existentes servem só para manter a sessão de quem entra
          na conta.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl font-semibold">Para que usamos</h2>
        <p>
          Somente para registrar e acompanhar o pedido (base legal: execução de contrato, art. 7º, V, da LGPD). Os dados não
          são vendidos nem compartilhados com terceiros, exceto o provedor de banco de dados e hospedagem que armazena o
          sistema.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl font-semibold">Quem acessa</h2>
        <p>
          Você, pelo link secreto do pedido, que mostra o endereço só de forma parcial, e os administradores da loja. A sacola
          fica salva apenas no seu navegador.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl font-semibold">Seus direitos</h2>
        <p>
          Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento. Como este é um projeto de estudo, os
          pedidos de demonstração podem ser apagados periodicamente.
        </p>
      </section>
    </Container>
  );
}
