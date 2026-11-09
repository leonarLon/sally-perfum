import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LojaError from "./error";

describe("recuperação de falhas: tela de erro da loja", () => {
  it("mostra mensagem amigável, sem detalhes internos, e permite tentar de novo", () => {
    const reset = vi.fn();
    render(<LojaError error={Object.assign(new Error("relation \"products\" timeout at 10.0.0.5"), { digest: "abc" })} reset={reset} />);
    expect(screen.getByRole("heading", { name: "Não foi possível carregar esta página" })).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/relation|10\.0\.0\.5/);
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
