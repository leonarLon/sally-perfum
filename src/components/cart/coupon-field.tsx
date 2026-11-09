"use client";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { couponErrorMessage, type Quote } from "@/lib/checkout/schemas";
import { formatBRL } from "@/lib/money";

/**
 * Campo de cupom. O código é só repassado ao servidor, que valida e calcula o desconto
 * (quote_cart_coupon); aqui nada é decidido.
 */
export function CouponField({
  applied,
  onApply,
  quote,
  loading,
}: {
  applied: string;
  onApply: (code: string) => void;
  quote: Quote | null;
  loading: boolean;
}) {
  const id = useId();
  const [draft, setDraft] = useState(applied);
  const result = applied && !loading ? quote?.coupon : undefined;
  const apply = () => onApply(draft.replace(/\s+/g, "").toUpperCase());

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        Cupom de desconto
      </label>
      {result?.ok ? (
        <div className="flex items-center justify-between gap-3 rounded-card border border-success/40 bg-success/5 px-4 py-2.5 text-sm">
          <span id={`${id}-status`} role="status">
            Cupom <strong>{result.code}</strong> aplicado: −{formatBRL(result.discount_cents ?? 0)}
          </span>
          <button
            type="button"
            className="text-xs text-muted underline hover:text-text"
            onClick={() => {
              setDraft("");
              onApply("");
            }}
          >
            Remover<span className="sr-only"> cupom {result.code}</span>
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <Input
              id={id}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // Enter aplica o cupom, não envia o pedido
                  apply();
                }
              }}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={32}
              placeholder="Ex.: BEMVINDA10"
              aria-invalid={Boolean(result && !result.ok)}
              aria-describedby={`${id}-status`}
            />
            <Button type="button" variant="outline" onClick={apply} disabled={!draft.trim() || (loading && draft === applied)}>
              Aplicar
            </Button>
          </div>
          <p id={`${id}-status`} role="status" className="min-h-4 text-xs text-error">
            {applied && loading ? <span className="text-muted">Verificando cupom…</span> : result && !result.ok ? couponErrorMessage(result.error) : null}
          </p>
        </>
      )}
    </div>
  );
}
