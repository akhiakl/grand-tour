import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";

import { ServiceWorker } from "@/components/service-worker";
import { SiteAnalytics } from "@/components/site-analytics";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { UnitsProvider } from "@/components/units/units-provider";
import { siteUrl } from "@/lib/http";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  const appName = (await getTranslations("Common"))("appName");
  return {
    metadataBase: siteUrl(),
    applicationName: appName,
    title: { default: appName, template: t("titleTemplate") },
    description: t("description"),
    icons: {
      icon: [
        { url: "/icons/mark.svg", type: "image/svg+xml" },
        { url: "/icons/32", sizes: "32x32", type: "image/png" },
      ],
      apple: { url: "/icons/180", sizes: "180x180" },
    },
    openGraph: { siteName: appName, type: "website" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F1E8" },
    { media: "(prefers-color-scheme: dark)", color: "#0E1420" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${fraunces.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider>
            <UnitsProvider>{children}</UnitsProvider>
            <Toaster position="bottom-center" />
            <ServiceWorker />
          </NextIntlClientProvider>
        </ThemeProvider>
        <SiteAnalytics />
      </body>
    </html>
  );
}
