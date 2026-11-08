"use client";
import { useSyncExternalStore } from "react";

/**
 * Sacola no navegador (localStorage), para visitante e cliente logado.
 * Guarda SÓ variante e quantidade: preço, nome e disponibilidade vêm sempre do
 * servidor (quote_cart). Sincroniza entre abas pelo evento "storage".
 */
export type CartItem = { variantId: string; quantity: number };

export const CART_KEY = "sally-cart-v1";
export const MAX_QTY = 10;
export const MAX_LINES = 20;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMPTY: CartItem[] = [];

/** Aceita só o formato esperado; qualquer outra coisa no storage é descartada. */
export function sanitizeCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const merged = new Map<string, number>();
  for (const it of raw) {
    if (!it || typeof it !== "object") continue;
    const { variantId, quantity } = it as Record<string, unknown>;
    if (typeof variantId !== "string" || !UUID_RE.test(variantId)) continue;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) continue;
    merged.set(variantId, Math.min(MAX_QTY, (merged.get(variantId) ?? 0) + quantity));
  }
  return [...merged].slice(0, MAX_LINES).map(([variantId, quantity]) => ({ variantId, quantity }));
}

const listeners = new Set<() => void>();
let cache: { raw: string | null; items: CartItem[] } = { raw: null, items: EMPTY };

function read(): CartItem[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(CART_KEY);
  } catch {
    return EMPTY; // storage bloqueado (modo privado restrito)
  }
  if (raw === cache.raw) return cache.items;
  let items = EMPTY;
  try {
    items = raw ? sanitizeCart(JSON.parse(raw)) : EMPTY;
  } catch {
    items = EMPTY;
  }
  cache = { raw, items };
  return items;
}

function write(items: CartItem[]) {
  const clean = sanitizeCart(items);
  try {
    if (clean.length) window.localStorage.setItem(CART_KEY, JSON.stringify(clean));
    else window.localStorage.removeItem(CART_KEY);
  } catch {
    // sem storage: a sacola não persiste
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === CART_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export const cart = {
  get: read,
  /** Soma à quantidade existente (limitada a MAX_QTY). Retorna false se a sacola estiver cheia. */
  add(variantId: string, quantity: number) {
    const items = read();
    if (!items.some((i) => i.variantId === variantId) && items.length >= MAX_LINES) return false;
    write([...items, { variantId, quantity }]);
    return true;
  },
  setQuantity(variantId: string, quantity: number) {
    const items = read();
    write(quantity < 1 ? items.filter((i) => i.variantId !== variantId) : items.map((i) => (i.variantId === variantId ? { ...i, quantity: Math.min(MAX_QTY, quantity) } : i)));
  },
  remove(variantId: string) {
    write(read().filter((i) => i.variantId !== variantId));
  },
  clear() {
    write([]);
  },
};

/** Itens da sacola. No servidor e na primeira renderização: vazio (evita divergência na hidratação). */
export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function useCartCount(): number {
  return useCart().reduce((n, i) => n + i.quantity, 0);
}

const noopSubscribe = () => () => {};
/** false no servidor e durante a hidratação; true depois (evita "sacola vazia" piscando). */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
