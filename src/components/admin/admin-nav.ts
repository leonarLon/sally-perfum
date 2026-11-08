import {
  BadgePercent,
  Boxes,
  ChartColumn,
  ClipboardList,
  LayoutDashboard,
  Package,
  Settings,
  Store,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = { href: string; label: string; icon: LucideIcon };

export const adminNav: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/estoque", label: "Estoque", icon: Boxes },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/marcas", label: "Marcas", icon: Store },
  { href: "/admin/cupons", label: "Cupons", icon: BadgePercent },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/relatorios", label: "Relatórios", icon: ChartColumn },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];
