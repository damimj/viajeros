"use server";

import { setUserLocale } from "@/lib/i18n/locale";
import type { Locale } from "@/lib/i18n/config";

export async function switchLocale(locale: Locale) {
  await setUserLocale(locale);
}
