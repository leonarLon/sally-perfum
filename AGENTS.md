<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Regras do projeto Sally Perfumaria

- Projeto de estudo e demonstração. Decisões em `docs/DECISOES.md`; o que muda na operação comercial em `docs/PENDENCIAS_COMERCIAIS.md` (atualize ao criar algo provisório).
- Dinheiro sempre em **centavos inteiros** (`src/lib/money.ts`). Nunca use float para valores.
- **Nenhum produto hardcoded** em componentes: o catálogo vem só do Supabase.
- Cores apenas pelos tokens de `src/app/globals.css` (ex.: `bg-primary`, `text-muted`).
- A autorização vale no servidor (`requireRole`/`requireUser`) e na RLS; o `proxy.ts` é só UX.
- Segredos só em módulos `server-only` (`src/lib/env.server.ts`, `src/lib/supabase/admin.ts`).
- Nenhuma operação remota (banco, deploy, pagamentos) sem autorização explícita do usuário.
- Commits sem linha de co-autoria.
- Antes de concluir: `npm run check` e, quando houver mudança de UI, `npm run e2e`.
