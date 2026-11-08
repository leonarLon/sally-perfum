import { describe, expect, it } from "vitest";
import {
  discountPercent,
  formatBRL,
  maxInstallments,
  multiplyCents,
  parseBRLToCents,
  percentOf,
  splitInstallments,
  sumCents,
} from "./money";

describe("money (centavos inteiros)", () => {
  it("formata em BRL", () => {
    expect(formatBRL(18990).replace(/\s/g, " ")).toBe("R$ 189,90");
    expect(formatBRL(129900).replace(/\s/g, " ")).toBe("R$ 1.299,00");
    expect(formatBRL(0).replace(/\s/g, " ")).toBe("R$ 0,00");
  });

  it("rejeita valores não inteiros", () => {
    expect(() => formatBRL(189.9)).toThrow();
    expect(() => sumCents([100, 0.1])).toThrow();
  });

  it("converte texto para centavos sem float", () => {
    expect(parseBRLToCents("189,90")).toBe(18990);
    expect(parseBRLToCents("R$ 1.299,00")).toBe(129900);
    expect(parseBRLToCents("50")).toBe(5000);
    expect(parseBRLToCents("0,5")).toBe(50);
    expect(() => parseBRLToCents("12,345")).toThrow();
    expect(() => parseBRLToCents("abc")).toThrow();
  });

  it("evita o erro clássico de float 0.1 + 0.2", () => {
    expect(sumCents([10, 20])).toBe(30);
    expect(multiplyCents(18990, 3)).toBe(56970);
  });

  it("aplica percentual em pontos-base com arredondamento half-up", () => {
    expect(percentOf(18990, 1000)).toBe(1899);
    expect(percentOf(999, 1500)).toBe(150); // 149,85 -> 150
    expect(() => percentOf(100, 10_001)).toThrow();
  });

  it("calcula selo de desconto", () => {
    expect(discountPercent(17490, 10390)).toBe(41);
    expect(discountPercent(10000, 10000)).toBe(0);
    expect(discountPercent(10000, 12000)).toBe(0);
  });

  it("divide parcelas com soma exata", () => {
    const parts = splitInstallments(10000, 3);
    expect(parts).toEqual([3334, 3333, 3333]);
    expect(sumCents(parts)).toBe(10000);
    expect(maxInstallments(48900, 7000)).toBe(6);
    expect(maxInstallments(5000, 7000)).toBe(1);
    expect(maxInstallments(500000, 7000)).toBe(10);
  });
});
