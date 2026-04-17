"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { switchLocale } from "@/app/actions/locale";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/lib/i18n/config";

const LOCALES: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "es", label: "ES" },
];

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  function handleChange(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await switchLocale(next);
      window.location.reload();
    });
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 p-1 backdrop-blur-sm">
      {LOCALES.map((l) => (
        <button
          key={l.value}
          onClick={() => handleChange(l.value)}
          disabled={isPending}
          className={cn(
            "rounded px-2 py-0.5 text-xs font-medium transition-colors",
            locale === l.value
              ? "bg-white text-slate-900"
              : "text-white hover:bg-white/20",
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
