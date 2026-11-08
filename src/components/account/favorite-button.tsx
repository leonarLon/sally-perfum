"use client";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { getFavoriteState, toggleFavorite } from "@/lib/account/actions";
import { cn } from "@/lib/utils";

/**
 * Favoritar. A página do produto é cacheada para todos; o estado do favorito é
 * pessoal, então vem do servidor depois da hidratação. Sem login, leva para entrar.
 */
export function FavoriteButton({ productId, slug, name }: { productId: string; slug: string; name: string }) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    let alive = true;
    getFavoriteState(productId)
      .then((s) => alive && setFavorite(s.favorite))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [productId]);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        aria-pressed={favorite}
        aria-label={favorite ? `Remover ${name} dos favoritos` : `Adicionar ${name} aos favoritos`}
        title={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await toggleFavorite(productId);
            if (!r.loggedIn) {
              router.push(`/login?returnTo=${encodeURIComponent(`/produtos/${slug}`)}`);
              return;
            }
            setError(r.error ?? null);
            setFavorite(r.favorite);
          })
        }
        className="inline-flex size-11 items-center justify-center rounded-full border border-border hover:border-primary disabled:opacity-60"
      >
        <Heart className={cn("size-5", favorite ? "fill-primary text-primary" : "text-text")} aria-hidden />
      </button>
      {error && (
        <span role="alert" className="text-xs text-error">
          {error}
        </span>
      )}
    </div>
  );
}
