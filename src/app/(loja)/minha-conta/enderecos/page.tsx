import { AddressActions, AddressForm } from "@/components/account/account-forms";
import { Badge } from "@/components/ui/badge";
import { saveAddress } from "@/lib/account/actions";
import { listAddresses } from "@/lib/account/queries";

export const metadata = { title: "Endereços" };

export default async function AddressesPage() {
  const addresses = await listAddresses("/minha-conta/enderecos");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Endereços</h1>
        <p className="text-sm text-muted">O endereço padrão já vem preenchido no checkout. Até 10 endereços.</p>
      </div>

      <ul className="space-y-4">
        {addresses.map((a) => (
          <li key={a.id} className="space-y-3 rounded-card border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <strong>{a.label}</strong>
                {a.is_default && <Badge variant="primary">Padrão</Badge>}
              </div>
              <AddressActions address={a} />
            </div>
            <details>
              <summary className="cursor-pointer text-sm text-primary">
                Editar <span className="sr-only">{a.label}</span>
                <span className="ml-2 text-muted">
                  {a.street}, {a.number} · {a.city}/{a.state}
                </span>
              </summary>
              <div className="mt-3">
                <AddressForm action={saveAddress.bind(null, a.id)} address={a} submitLabel="Salvar endereço" />
              </div>
            </details>
          </li>
        ))}
      </ul>

      {addresses.length < 10 && (
        <section aria-labelledby="novo" className="rounded-card border border-dashed border-border p-4">
          <h2 id="novo" className="mb-3 font-medium">
            Novo endereço
          </h2>
          <AddressForm action={saveAddress.bind(null, null)} submitLabel="Adicionar endereço" />
        </section>
      )}
    </div>
  );
}
