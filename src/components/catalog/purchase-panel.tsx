"use client";
import { ShoppingBag } from "lucide-react";
import { useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProductVariant } from "@/lib/catalog/types";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Price } from "./price";

export const STOCK_LABEL = {
  in_stock: { text: "Em estoque", variant: "success" },
  low_stock: { text: "Últimas unidades", variant: "warning" },
  out_of_stock: { text: "Esgotado", variant: "error" },
} as const;

const MAX_QTY = 10;

/**
 * Seleção de volume e quantidade. Preço e disponibilidade exibidos aqui são apenas
 * informativos: o servidor revalida tudo ao adicionar à sacola e no checkout.
 */
export function PurchasePanel({ variants }: { variants: ProductVariant[] }) {
  const firstAvailable = variants.find((v) => v.stock_status !== "out_of_stock") ?? variants[0];
  const [selectedId, setSelectedId] = useState(firstAvailable?.id);
  const [qty, setQty] = useState(1);
  const groupId = useId();
  const selected = variants.find((v) => v.id === selectedId) ?? firstAvailable;
  if (!selected) return <p className="text-muted">Produto sem variações disponíveis.</p>;
  const soldOut = selected.stock_status === "out_of_stock";
  const stock = STOCK_LABEL[selected.stock_status];

  return (
    <div className="space-y-6">
      <Price price={selected.price_cents} compareAt={selected.compare_at_cents} size="lg" />
      {selected.price_is_reference ? (
        <p className="text-xs text-muted">Preço de referência para demonstração (projeto de estudo).</p>
      ) : null}

      <fieldset>
        <legend id={groupId} className="mb-2 text-sm font-semibold">Tamanho</legend>
        <div role="radiogroup" aria-labelledby={groupId} className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const isSelected = v.id === selected.id;
            const out = v.stock_status === "out_of_stock";
            return (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => {
                  setSelectedId(v.id);
                  setQty(1);
                }}
                className={cn(
                  "flex min-w-24 flex-col items-center rounded-card border px-4 py-2 text-sm transition-colors",
                  isSelected ? "border-primary bg-secondary/40" : "border-border hover:border-primary",
                  out && "text-muted line-through decoration-muted",
                )}
              >
                <span className="font-semibold">{v.volume_ml ? `${v.volume_ml} ml` : "Único"}</span>
                <span className="text-xs">{formatBRL(v.price_cents)}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <Badge variant={stock.variant}>{stock.text}</Badge>
        <span className="text-xs text-muted">SKU {selected.sku}</span>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Quantidade</span>
          <select
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            disabled={soldOut}
            className="h-12 rounded-full border border-border bg-background px-4"
          >
            {Array.from({ length: MAX_QTY }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <Button size="lg" className="flex-1" disabled aria-describedby="sacola-aviso">
          <ShoppingBag /> {soldOut ? "Esgotado" : "Adicionar à sacola"}
        </Button>
      </div>
      <p id="sacola-aviso" className="text-xs text-muted" role="note">
        A sacola e o checkout serão liberados na Fase 6 do projeto.
      </p>
    </div>
  );
}
