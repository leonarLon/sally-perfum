import { beforeEach, describe, expect, it } from "vitest";
import { CART_KEY, MAX_LINES, cart, sanitizeCart } from "./store";

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

describe("sacola no navegador (grupo 8)", () => {
  beforeEach(() => localStorage.clear());

  it("adiciona, soma a mesma variante e respeita o máximo de 10 por item", () => {
    cart.add(id(1), 3);
    cart.add(id(1), 4);
    expect(cart.get()).toEqual([{ variantId: id(1), quantity: 7 }]);
    cart.add(id(1), 9);
    expect(cart.get()[0].quantity).toBe(10);
  });

  it("altera quantidade, remove com zero e limpa", () => {
    cart.add(id(1), 2);
    cart.add(id(2), 1);
    cart.setQuantity(id(1), 5);
    expect(cart.get().find((i) => i.variantId === id(1))?.quantity).toBe(5);
    cart.setQuantity(id(2), 0);
    expect(cart.get()).toHaveLength(1);
    cart.clear();
    expect(cart.get()).toEqual([]);
    expect(localStorage.getItem(CART_KEY)).toBeNull();
  });

  it("limita o número de produtos diferentes", () => {
    for (let n = 1; n <= MAX_LINES; n++) expect(cart.add(id(n), 1)).toBe(true);
    expect(cart.add(id(99), 1)).toBe(false);
    expect(cart.add(id(1), 1)).toBe(true); // a mesma variante continua aceita
  });

  it("descarta conteúdo adulterado no storage (sem preço, ids inválidos, frações)", () => {
    expect(sanitizeCart([{ variantId: id(1), quantity: 2, price: 1 }, { variantId: "<script>", quantity: 1 }, { variantId: id(2), quantity: 1.5 }, null, "x"])).toEqual([
      { variantId: id(1), quantity: 2 },
    ]);
    localStorage.setItem(CART_KEY, "{não é json");
    expect(cart.get()).toEqual([]);
  });
});
