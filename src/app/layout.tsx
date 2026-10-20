import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";

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

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  applicationName: "Grand Tour",
  title: {
    default: "Grand Tour",
    template: "%s · Grand Tour",
  },
  description:
    "Craft a beautiful, interactive travel route map — drawn by AI or by hand — and share it with a single link.",
  icons: {
    icon: [
      { url: "/icons/mark.svg", type: "image/svg+xml" },
      { url: "/icons/32", sizes: "32x32", type: "image/png" },
    ],
    apple: { url: "/icons/180", sizes: "180x180" },
  },
  openGraph: { siteName: "Grand Tour", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F1E8" },
    { media: "(prefers-color-scheme: dark)", color: "#0E1420" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
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
          <UnitsProvider>{children}</UnitsProvider>
          <Toaster position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
