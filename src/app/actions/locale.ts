"use server";

import { cookies } from "next/headers";
import { locales, type Locale } from "@/lib/i18n/config";

export async function switchLocale(locale: Locale) {
  if (!locales.includes(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set("VIAJEROS_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
