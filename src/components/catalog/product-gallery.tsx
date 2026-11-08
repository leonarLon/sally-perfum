"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProductImage } from "./product-image";

export function ProductGallery({ images, name }: { images: { src: string | null; alt: string }[]; name: string }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [{ src: null, alt: name }];
  const current = list[Math.min(active, list.length - 1)];
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-card border border-border">
        <ProductImage src={current.src} alt={current.alt} sizes="(min-width: 1024px) 50vw, 100vw" priority />
      </div>
      {list.length > 1 ? (
        <ul className="flex gap-2" aria-label="Fotos do produto">
          {list.map((img, i) => (
            <li key={i} className="w-20">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Ver foto ${i + 1} de ${list.length}`}
                aria-pressed={i === active}
                className={cn("block w-full overflow-hidden rounded-lg border-2", i === active ? "border-primary" : "border-border")}
              >
                <ProductImage src={img.src} alt="" sizes="80px" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
