"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { adminNav } from "./admin-nav";

/**
 * O menu inteiro vai no HTML estático (fallback sem item ativo); o destaque do
 * item atual depende da URL e é resolvido em seguida, dentro do Suspense.
 */
export function AdminSidebar() {
  return (
    <Suspense fallback={<AdminNavList pathname={null} />}>
      <ActiveAdminNav />
    </Suspense>
  );
}

function ActiveAdminNav() {
  return <AdminNavList pathname={usePathname()} />;
}

export function AdminNavList({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Menu administrativo" className="flex flex-col gap-1 p-3">
      {adminNav.map(({ href, label, icon: Icon }) => {
        const active =
          pathname !== null && (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-full px-4 py-2 text-sm transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-text hover:bg-secondary",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
