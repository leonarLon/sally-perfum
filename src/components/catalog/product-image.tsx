import { ImageOff } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Imagem de produto. Sem URL válida, mostra um placeholder CLARAMENTE identificado
 * (nunca a foto de outro perfume).
 */
export function ProductImage({
  src,
  alt,
  sizes,
  priority = false,
  quality,
  className,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** Precisa estar em images.qualities (next.config.ts). */
  quality?: 60 | 75;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={`Foto indisponível: ${alt}`}
        className={cn("flex aspect-square w-full flex-col items-center justify-center gap-2 bg-surface text-muted", className)}
      >
        <ImageOff className="size-8" aria-hidden />
        <span className="text-xs">Foto indisponível</span>
      </div>
    );
  }
  return (
    <div className={cn("relative aspect-square w-full bg-background", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        // Next 16: `priority` foi descontinuado; foto acima da dobra carrega já, com prioridade alta.
        loading={priority ? "eager" : undefined}
        fetchPriority={priority ? "high" : undefined}
        className="object-contain p-4"
      />
    </div>
  );
}
