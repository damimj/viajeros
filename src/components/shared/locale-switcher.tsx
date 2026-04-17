"use client";

import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { useState } from "react";
import { switchLocale } from "@/app/actions/locale";
import { locales, type Locale } from "@/lib/i18n/config";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

export function LocaleSwitcher() {
  const t = useTranslations("map");
  const [open, setOpen] = useState(false);

  async function handleSwitch(locale: Locale) {
    setOpen(false);
    await switchLocale(locale);
    window.location.reload();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md bg-white/90 px-2.5 py-1.5 text-xs font-medium shadow-md backdrop-blur-sm hover:bg-white"
        title={t("language")}
      >
        <Globe className="h-3.5 w-3.5" />
        {t("language")}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 z-20 mb-1 rounded-md border bg-white p-1 shadow-md">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleSwitch(locale)}
                className="block w-full rounded-sm px-3 py-1.5 text-left text-xs hover:bg-accent"
              >
                {LOCALE_LABELS[locale]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
