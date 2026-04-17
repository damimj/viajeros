import "server-only";

import { cookies } from "next/headers";
import { defaultLocale, type Locale } from "./config";

const COOKIE_NAME = "VIAJEROS_LOCALE";

export async function getUserLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(COOKIE_NAME)?.value;
  if (stored === "en" || stored === "es") return stored;
  return defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
}
