import { describe, expect, it } from "vitest";
import { addressSchema, newPasswordSchema, profileSchema, safeStoreReturnTo, signupSchema } from "./schemas";

describe("conta: validação", () => {
  it("cadastro exige senha forte, confirmação igual e aceite da privacidade", () => {
    const base = { full_name: "Ana Souza", email: " Ana@Example.COM ", password: "perfume123", password_confirm: "perfume123", privacy: "on" };
    expect(signupSchema.parse(base).email).toBe("ana@example.com");
    expect(signupSchema.safeParse({ ...base, password: "curta1", password_confirm: "curta1" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...base, password: "somenteletras", password_confirm: "somenteletras" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...base, password_confirm: "outra123" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...base, privacy: undefined }).success).toBe(false);
  });

  it("nova senha respeita o limite de 72 caracteres do bcrypt", () => {
    const long = `a1${"x".repeat(71)}`;
    expect(newPasswordSchema.safeParse({ password: long, password_confirm: long }).success).toBe(false);
  });

  it("perfil e endereço normalizam telefone e CEP", () => {
    expect(profileSchema.parse({ full_name: "Ana", phone: "(11) 98765-4321" }).phone).toBe("11987654321");
    expect(profileSchema.parse({ full_name: "Ana", phone: "" }).phone).toBeNull();
    const a = addressSchema.parse({ label: "Casa", recipient: "Ana", cep: "01310-100", street: "Av. Paulista", number: "1", district: "Centro", city: "SP", state: "SP" });
    expect(a).toMatchObject({ cep: "01310100", complement: null });
  });

  it("destino após login só aceita caminhos internos da loja (sem open redirect)", () => {
    expect(safeStoreReturnTo("/checkout")).toBe("/checkout");
    expect(safeStoreReturnTo("/produtos/sauvage-dior?x=1")).toBe("/produtos/sauvage-dior?x=1");
    for (const bad of ["https://evil.example", "//evil.example", "/\\evil.example", "/admin", "/auth/callback", "javascript:alert(1)", null, 7]) {
      expect(safeStoreReturnTo(bad)).toBe("/minha-conta");
    }
  });
});
