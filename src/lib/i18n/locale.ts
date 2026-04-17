import { cookies } from "next/headers";
import { defaultLocale, locales, type Locale } from "./config";

export async function getLocaleFromCookie(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get("VIAJEROS_LOCALE")?.value as Locale | undefined;
  return value && locales.includes(value) ? value : defaultLocale;
}
