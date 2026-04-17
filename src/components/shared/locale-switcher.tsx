"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { switchLocale } from "@/app/actions/locale";
import { Globe } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

export function LocaleSwitcher() {
  const t = useTranslations("map");
  const currentLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const locale = e.target.value as Locale;
    startTransition(() => {
      switchLocale(locale);
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <select
        value={currentLocale}
        onChange={handleChange}
        disabled={isPending}
        className="rounded-md border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        aria-label={t("language")}
      >
        {Object.entries(LOCALE_LABELS).map(([locale, label]) => (
          <option key={locale} value={locale}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
