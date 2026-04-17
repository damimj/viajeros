import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Inter } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/models/settings";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = await createClient();
    const settings = await getSettings(supabase);

    return {
      title: {
        default: settings.siteTitle || "Viajeros",
        template: `%s | ${settings.siteTitle || "Viajeros"}`,
      },
      description:
        settings.siteDescription ||
        "Interactive travel diary with maps, routes, and points of interest.",
      manifest: "/manifest.json",
      icons: settings.siteFavicon
        ? { icon: settings.siteFavicon }
        : { icon: "/favicon.ico" },
    };
  } catch {
    return {
      title: {
        default: "Viajeros",
        template: "%s | Viajeros",
      },
      description: "Interactive travel diary with maps, routes, and points of interest.",
      manifest: "/manifest.json",
      icons: { icon: "/favicon.ico" },
    };
  }
}

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  // Load analytics script from settings
  let analyticsScript = "";
  try {
    const supabase = await createClient();
    const settings = await getSettings(supabase);
    analyticsScript = settings.siteAnalyticsCode ?? "";
  } catch {
    // Ignore
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {analyticsScript && (
          <script
            dangerouslySetInnerHTML={{ __html: analyticsScript }}
          />
        )}
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
