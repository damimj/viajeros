"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Map,
  MapPin,
  Route,
  Tag,
  Settings,
  Plane,
  Home,
  Globe,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { logout } from "@/app/actions/auth";

const NAV_ITEMS = [
  { key: "dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { key: "trips", href: "/admin/trips", icon: Map },
  { key: "points", href: "/admin/points", icon: MapPin },
  { key: "routes", href: "/admin/routes", icon: Route },
  { key: "tags", href: "/admin/tags", icon: Tag },
  { key: "settings", href: "/admin/settings", icon: Settings },
  { key: "importFlights", href: "/admin/import-flights", icon: Plane },
  { key: "importAirbnb", href: "/admin/import-airbnb", icon: Home },
];

export function AdminSidebar() {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const navContent = (
    <nav className="flex flex-col gap-0.5 p-2">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {t(item.key as Parameters<typeof t>[0])}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b bg-white px-4 lg:hidden">
        <span className="font-semibold">Viajeros Admin</span>
        <div className="flex items-center gap-2">
          <Link href="/" className="rounded-md p-1.5 text-muted-foreground hover:bg-accent">
            <Globe className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-56 border-r bg-white transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {navContent}
        <div className="absolute bottom-0 left-0 right-0 border-t p-2">
          <form action={logout}>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent">
              <LogOut className="h-4 w-4" />
              {t("logout" as Parameters<typeof t>[0])}
            </button>
          </form>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden w-56 flex-shrink-0 flex-col border-r bg-white lg:flex">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="font-semibold">Viajeros</span>
          <Link
            href="/"
            className="rounded-md p-1 text-muted-foreground hover:bg-accent"
            title="View map"
          >
            <Globe className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">{navContent}</div>
        <div className="border-t p-2">
          <form action={logout}>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent">
              <LogOut className="h-4 w-4" />
              {t("logout" as Parameters<typeof t>[0])}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
