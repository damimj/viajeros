"use client";

import { useEffect } from "react";
import { locales, type Locale } from "@/lib/i18n/config";
import { switchLocale } from "@/app/actions/locale";

const DETECTED_KEY = "viajeros-locale-detected";

/**
 * Auto-detect browser language on first visit.
 * Only runs once (stores flag in localStorage).
 * If the browser language matches a supported locale, switches to it.
 */
export function useBrowserLanguageDetection() {
  useEffect(() => {
    // Only run client-side and only once
    if (typeof window === "undefined") return;

    const alreadyDetected = localStorage.getItem(DETECTED_KEY);
    if (alreadyDetected) return;

    // Mark as detected so it doesn't run again
    localStorage.setItem(DETECTED_KEY, "true");

    // Get browser language
    const browserLang = navigator.language?.split("-")[0]?.toLowerCase();
    if (!browserLang) return;

    // Check if it matches a supported locale
    const matchedLocale = locales.find((l) => l === browserLang) as Locale | undefined;
    if (!matchedLocale) return;

    // Check current cookie locale
    const currentLocale = document.cookie
      .split("; ")
      .find((c) => c.startsWith("VIAJEROS_LOCALE="))
      ?.split("=")[1];

    if (currentLocale === matchedLocale) return;

    // Switch locale
    switchLocale(matchedLocale).then(() => {
      window.location.reload();
    });
  }, []);
}
