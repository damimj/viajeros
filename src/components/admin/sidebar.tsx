"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Map,
  Navigation,
  MapPin,
  Route,
  Tags,
  PlaneTakeoff,
  Home,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", labelKey: "trips", icon: <Navigation className="h-4 w-4" /> },
  { href: "/admin/points", labelKey: "points", icon: <MapPin className="h-4 w-4" /> },
  { href: "/admin/routes", labelKey: "routes", icon: <Route className="h-4 w-4" /> },
  { href: "/admin/tags", labelKey: "tags", icon: <Tags className="h-4 w-4" /> },
  { href: "/admin/import-flights", labelKey: "importFlights", icon: <PlaneTakeoff className="h-4 w-4" /> },
  { href: "/admin/import-airbnb", labelKey: "importAirbnb", icon: <Home className="h-4 w-4" /> },
  { href: "/admin/settings", labelKey: "settings", icon: <Settings className="h-4 w-4" /> },
];

export function AdminSidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const navContent = (
    <>
      <div className="mb-6 flex items-center gap-2">
        <Map className="h-6 w-6 text-primary" />
        <h2 className="text-lg font-bold">{t("admin")}</h2>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {item.icon}
            {t(item.labelKey)}
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-1 border-t pt-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Map className="h-4 w-4" />
          {t("publicMap")}
        </Link>

        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          {t("logout")}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-md border bg-background p-2 shadow-sm lg:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - desktop always visible, mobile slides in */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-background p-4 transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {navContent}
      </aside>
    </>
  );
}
