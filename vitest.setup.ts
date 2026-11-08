import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Sem `globals: true`, o Testing Library não desmonta sozinho entre testes.
afterEach(() => cleanup());

// "server-only" lança erro fora do bundler do Next; nos testes o tratamos como no-op.
vi.mock("server-only", () => ({}));
