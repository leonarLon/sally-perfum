"use client";
import { Heart, LayoutDashboard, MapPin, Package, UserCog } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/minha-conta", label: "Resumo", icon: LayoutDashboard },
  { href: "/minha-conta/pedidos", label: "Meus pedidos", icon: Package },
  { href: "/minha-conta/enderecos", label: "Endereços", icon: MapPin },
  { href: "/minha-conta/favoritos", label: "Favoritos", icon: Heart },
  { href: "/minha-conta/perfil", label: "Dados e privacidade", icon: UserCog },
];

export function AccountNav() {
  return (
    <Suspense fallback={<List pathname={null} />}>
      <Active />
    </Suspense>
  );
}

function Active() {
  return <List pathname={usePathname()} />;
}

function List({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Minha conta" className="flex gap-1 overflow-x-auto md:flex-col">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname !== null && (href === "/minha-conta" ? pathname === href : pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm",
              active ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
            )}
          >
            <Icon className="size-4" aria-hidden /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
