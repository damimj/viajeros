import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Inter } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

/**
 * Dynamic metadata from settings table.
 */
export async function generateMetadata(): Promise<Metadata> {
  let siteTitle = process.env.NEXT_PUBLIC_DEFAULT_SITE_TITLE || "Viajeros";
  let siteDescription = "Interactive travel diary with maps, routes, and points of interest.";
  let faviconUrl: string | undefined;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["site_title", "site_description", "site_favicon"]);

    if (data) {
      for (const row of data as { setting_key: string; setting_value: string | null }[]) {
        if (row.setting_key === "site_title" && row.setting_value) siteTitle = row.setting_value;
        if (row.setting_key === "site_description" && row.setting_value) siteDescription = row.setting_value;
        if (row.setting_key === "site_favicon" && row.setting_value) faviconUrl = row.setting_value;
      }
    }
  } catch {
    // Settings table might not exist yet during first deploy
  }

  return {
    title: {
      default: siteTitle,
      template: `%s | ${siteTitle}`,
    },
    description: siteDescription,
    manifest: "/manifest.json",
    icons: faviconUrl ? { icon: faviconUrl } : { icon: "/favicon.ico" },
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

async function getAnalyticsScript(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("settings")
      .select("setting_value")
      .eq("setting_key", "site_analytics_code")
      .single();
    return (data as { setting_value: string | null } | null)?.setting_value || null;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const analyticsScript = await getAnalyticsScript();

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
