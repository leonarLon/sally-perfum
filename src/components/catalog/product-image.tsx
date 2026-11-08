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
  className,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
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
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-contain p-4" />
    </div>
  );
}
