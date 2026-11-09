import { z } from "zod";

/**
 * Zod configurado para a CSP da loja (sem 'unsafe-eval'): desliga a compilação JIT,
 * que testa `new Function()` e geraria violação de CSP no navegador. Importe `z` daqui.
 */
z.config({ jitless: true });

export { z };
