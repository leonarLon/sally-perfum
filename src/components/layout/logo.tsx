import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn("font-display text-2xl font-semibold tracking-wide text-primary", className)}
      aria-label="Sally Perfumaria — página inicial"
    >
      Sally <span className="font-normal text-text">Perfumaria</span>
    </Link>
  );
}
