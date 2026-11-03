import type { Metadata, Viewport } from "next";
import { Manrope, Bodoni_Moda } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/lib/site-config";

// Self-hosted open source fonts per directive.
// Manrope = interface copy. Bodoni Moda = editorial headlines.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07070A" },
    { media: "(prefers-color-scheme: light)", color: "#07070A" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.seo.siteUrl),
  title: {
    default: siteConfig.seo.defaultTitle,
    template: `%s | ${siteConfig.parentName}`,
  },
  description: siteConfig.seo.defaultDescription,
  keywords: [
    "Dubai nightlife",
    "Avenue Club Dubai",
    "Ora Club Dubai",
    "Black Tape Dubai",
    "Dubai VIP tables",
    "Arabic nights Dubai",
    "Hip hop Dubai",
    "Business Bay nightclub",
    "Sheikh Zayed Road nightlife",
    "Al Habtoor City nightlife",
  ],
  authors: [{ name: siteConfig.parentName }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: {
      "en": "/",
      "ar": "/ar",
      "x-default": "/",
    },
  },
  openGraph: {
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
    url: siteConfig.seo.siteUrl,
    siteName: siteConfig.seo.siteName,
    locale: "en_AE",
    alternateLocale: ["ar_AE"],
    type: "website",
    images: [{ url: siteConfig.seo.defaultOgImage, width: 1200, height: 630, alt: siteConfig.parentName }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
    images: [siteConfig.seo.defaultOgImage],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark" data-scroll-behavior="smooth">
      <head>
        {/* JSON-LD: Organization + WebSite (parent) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: siteConfig.parentName,
                  url: siteConfig.seo.siteUrl,
                  description: siteConfig.seo.defaultDescription,
                  areaServed: "Dubai, United Arab Emirates",
                },
                {
                  "@type": "WebSite",
                  name: siteConfig.seo.siteName,
                  url: siteConfig.seo.siteUrl,
                  inLanguage: ["en", "ar"],
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${manrope.variable} ${bodoni.variable} font-sans antialiased bg-background text-foreground`}
      >
        {/* Skip to content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-sm focus:border focus:border-accent focus:bg-background focus:px-4 focus:py-2 focus:font-mono-tight focus:text-xs focus:uppercase focus:tracking-[0.15em] focus:text-accent"
        >
          Skip to content
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
