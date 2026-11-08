"use client";
import { Check, Copy, CreditCard, QrCode, Receipt } from "lucide-react";
import { useState, useTransition } from "react";
import { payWithCard, simulateProviderPayment, startPayment, type PaymentState } from "@/app/(loja)/pedido/[token]/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { fakeTokenize, TEST_CARDS } from "@/lib/payments/fake-card";
import { cn } from "@/lib/utils";

type Method = "pix" | "card" | "boleto";
export type PublicPayment = {
  method: Method;
  status: "pending" | "approved" | "declined" | "expired" | "canceled" | "refunded" | "review";
  pix_code: string | null;
  boleto_line: string | null;
  card_brand: string | null;
  card_last4: string | null;
  failure_reason: string | null;
} | null;

const TABS: { value: Method; label: string; icon: typeof QrCode }[] = [
  { value: "pix", label: "Pix", icon: QrCode },
  { value: "card", label: "Cartão", icon: CreditCard },
  { value: "boleto", label: "Boleto", icon: Receipt },
];

/** Pagamento do pedido (provedor SIMULADO). Nada é cobrado; o cartão nunca sai do navegador. */
export function PaymentPanel({ token, payment, preferred }: { token: string; payment: PublicPayment; preferred: Method }) {
  const [method, setMethod] = useState<Method>(payment?.status === "pending" ? payment.method : preferred);
  const [state, setState] = useState<PaymentState>({});
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<PaymentState>) => start(async () => setState(await fn()));
  const current = payment && payment.method === method && payment.status === "pending" ? payment : null;
  const lastDeclined = payment?.status === "declined" ? payment : null;

  return (
    <section aria-labelledby="pagamento" className="space-y-4 rounded-card border border-primary/30 p-5">
      <div>
        <h2 id="pagamento" className="font-display text-2xl font-semibold">
          Pagamento
        </h2>
        <p className="text-xs text-muted">Ambiente de demonstração: nenhum valor é cobrado.</p>
      </div>

      <div role="tablist" aria-label="Forma de pagamento" className="flex gap-2">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={method === value}
            onClick={() => {
              setMethod(value);
              setState({});
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm",
              method === value ? "border-primary bg-secondary/50 font-semibold" : "border-border hover:border-primary",
            )}
          >
            <Icon className="size-4" aria-hidden /> {label}
          </button>
        ))}
      </div>

      {lastDeclined && !state.message && (
        <p role="alert" className="rounded-card bg-error/10 px-4 py-2 text-sm text-error">
          Última tentativa recusada{lastDeclined.card_last4 ? ` (cartão final ${lastDeclined.card_last4})` : ""}. Tente de novo.
        </p>
      )}
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={cn("rounded-card px-4 py-2 text-sm", state.ok ? "bg-success/10 text-success" : "bg-error/10 text-error")}>
          {state.message}
        </p>
      )}

      <div role="tabpanel" aria-label={TABS.find((t) => t.value === method)!.label}>
        {method === "card" ? (
          <CardForm disabled={pending} onToken={(cardToken) => run(() => payWithCard(token, cardToken))} />
        ) : current ? (
          <CodeBox
            label={method === "pix" ? "Pix copia e cola (demonstração)" : "Linha digitável do boleto (demonstração)"}
            code={(method === "pix" ? current.pix_code : current.boleto_line) ?? ""}
            pending={pending}
            onSimulate={() => run(() => simulateProviderPayment(token))}
          />
        ) : (
          <Button disabled={pending} onClick={() => run(() => startPayment(token, method))}>
            {pending ? "Gerando…" : method === "pix" ? "Gerar código Pix" : "Gerar boleto"}
          </Button>
        )}
      </div>
    </section>
  );
}

function CodeBox({ label, code, pending, onSimulate }: { label: string; code: string; pending: boolean; onSimulate: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-3">
      <Label htmlFor="codigo-pagamento">{label}</Label>
      <div className="flex gap-2">
        <Input id="codigo-pagamento" readOnly value={code} className="font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
        <Button
          type="button"
          variant="outline"
          aria-label="Copiar código"
          onClick={async () => {
            await navigator.clipboard?.writeText(code).catch(() => {});
            setCopied(true);
          }}
        >
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        </Button>
      </div>
      <p className="text-xs text-muted">Em uma loja real, o banco avisa a loja quando o pagamento cai. Aqui, simule esse aviso:</p>
      <Button type="button" variant="secondary" disabled={pending} onClick={onSimulate}>
        {pending ? "Confirmando…" : "Simular pagamento recebido"}
      </Button>
    </div>
  );
}

function CardForm({ disabled, onToken }: { disabled: boolean; onToken: (token: string) => void }) {
  const [error, setError] = useState<{ field: string; message: string } | null>(null);
  return (
    <form
      noValidate
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        // Tokeniza no navegador. Os campos do cartão NÃO têm `name`: nem um envio sem
        // JavaScript mandaria número, validade ou CVV para o servidor ou para a URL.
        const val = (id: string) => (e.currentTarget.querySelector<HTMLInputElement>(`#${id}`)?.value ?? "");
        const r = fakeTokenize(val("cc-number"), val("cc-exp"), val("cc-csc"));
        if ("error" in r) return setError({ field: r.field, message: r.error });
        setError(null);
        e.currentTarget.reset();
        onToken(r.token);
      }}
    >
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="cc-number">Número do cartão</Label>
          <Input id="cc-number" inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" aria-invalid={error?.field === "number"} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cc-exp">Validade</Label>
          <Input id="cc-exp" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" aria-invalid={error?.field === "expiry"} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cc-csc">CVV</Label>
          <Input id="cc-csc" inputMode="numeric" autoComplete="cc-csc" placeholder="123" aria-invalid={error?.field === "cvc"} />
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-error">
          {error.message}
        </p>
      )}
      <details className="text-xs text-muted">
        <summary className="cursor-pointer">Cartões de teste</summary>
        <ul className="mt-2 space-y-1">
          {Object.entries(TEST_CARDS).map(([n, c]) => (
            <li key={n}>
              <code>{n.replace(/(\d{4})(?=\d)/g, "$1 ")}</code>: {c.label} (qualquer validade futura e CVV)
            </li>
          ))}
        </ul>
      </details>
      <Button type="submit" disabled={disabled}>
        {disabled ? "Processando…" : "Pagar com cartão"}
      </Button>
    </form>
  );
}
