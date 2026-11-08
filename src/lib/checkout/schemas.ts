import { z } from "zod";

export const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"] as const;
export const PAYMENT_METHODS = { pix: "Pix", card: "Cartão de crédito", boleto: "Boleto" } as const;

const digits = (v: string) => v.replace(/\D/g, "");
const text = (min: number, max: number, label: string) =>
  z.string(`Informe ${label}.`).trim().min(min, `Informe ${label}.`).max(max, `Máximo de ${max} caracteres.`);

export const cartItemsSchema = z
  .array(z.object({ variantId: z.uuid(), quantity: z.number().int().min(1).max(10) }))
  .min(1, "Sua sacola está vazia.")
  .max(20);

export const checkoutSchema = z.object({
  idempotency_key: z.uuid(),
  name: text(2, 120, "seu nome completo"),
  email: z.email("Informe um e-mail válido.").max(254),
  phone: z
    .string()
    .default("")
    .transform(digits)
    .refine((v) => v === "" || /^\d{10,11}$/.test(v), "Telefone com DDD: 10 ou 11 dígitos."),
  cep: z.string("Informe o CEP.").transform(digits).refine((v) => /^\d{8}$/.test(v), "CEP com 8 dígitos."),
  street: text(2, 160, "o endereço"),
  number: text(1, 20, "o número"),
  complement: z.string().trim().max(80, "Máximo de 80 caracteres.").default(""),
  district: text(2, 80, "o bairro"),
  city: text(2, 80, "a cidade"),
  state: z.enum(UFS, "Escolha o estado."),
  payment_method: z.enum(["pix", "card", "boleto"], "Escolha a forma de pagamento."),
  privacy: z.literal("on", "É preciso aceitar a política de privacidade para concluir."),
  items: z
    .string()
    .transform((v, ctx) => {
      try {
        return JSON.parse(v) as unknown;
      } catch {
        ctx.addIssue({ code: "custom", message: "Sacola inválida." });
        return z.NEVER;
      }
    })
    .pipe(cartItemsSchema),
});

export type CheckoutInput = z.output<typeof checkoutSchema>;

export const CHECKOUT_FIELDS = [
  "idempotency_key", "name", "email", "phone", "cep", "street", "number", "complement",
  "district", "city", "state", "payment_method", "privacy", "items",
] as const;

/** Erros do create_order → mensagem para o cliente. */
export function orderErrorMessage(message: string | undefined): { message: string; outOfStock?: string } {
  const m = message ?? "";
  const stock = /ESTOQUE_INSUFICIENTE:([^:]+):(\d+)/.exec(m);
  if (stock) {
    const left = Number(stock[2]);
    return {
      outOfStock: stock[1],
      message: left > 0 ? `Só restam ${left} unidade(s) de um dos itens. Ajuste a sacola e tente de novo.` : "Um dos itens acabou de esgotar. Ajuste a sacola e tente de novo.",
    };
  }
  if (/ITEM_INDISPONIVEL/.test(m)) return { message: "Um dos itens não está mais disponível. Revise a sacola." };
  if (/CEP inválido/.test(m)) return { message: "Não entregamos nesse CEP. Confira o número." };
  if (/quantidade por item|itens diferentes|sacola/.test(m)) return { message: "A sacola tem quantidades inválidas. Revise e tente de novo." };
  return { message: "Não foi possível concluir o pedido agora. Tente de novo em instantes." };
}

export type Quote = {
  lines: {
    variant_id: string;
    requested: number;
    available: boolean;
    max_qty: number;
    quantity: number;
    sku: string | null;
    name: string | null;
    slug: string | null;
    brand_name: string | null;
    volume_ml: number | null;
    price_cents: number | null;
    compare_at_cents: number | null;
    price_is_reference: boolean | null;
    line_total_cents: number;
    image_path: string | null;
    image_url: string | null;
  }[];
  subtotal_cents: number;
  shipping: { label: string; price_cents: number; days_min: number; days_max: number; free: boolean; free_over_cents: number | null } | null;
  free_shipping_over_cents: number | null;
  max_qty_per_item: number;
};
