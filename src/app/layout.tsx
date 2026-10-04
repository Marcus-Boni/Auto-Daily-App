import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import brand from "@/lib/brand.json";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7f6" },
    { media: "(prefers-color-scheme: dark)", color: "#131a17" },
  ],
};

const siteUrl = getSiteUrl(process.env.SITE_URL);

export const metadata: Metadata = {
  metadataBase: siteUrl ?? new URL("http://localhost:3000"),
  title: `${brand.name} | ${brand.tagline}`,
  applicationName: brand.name,
  description: brand.description,
  alternates: siteUrl ? { canonical: "/" } : undefined,
  openGraph: {
    url: siteUrl?.href,
    type: "website",
    locale: "pt_BR",
    siteName: brand.name,
    title: `${brand.name} | ${brand.tagline}`,
    description: brand.description,
    images: [
      {
        url: "/brand/social-preview.png",
        width: 1200,
        height: 630,
        alt: `${brand.name}: ${brand.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: brand.name,
    description: brand.description,
    images: ["/brand/social-preview.png"],
  },
  keywords: [
    "daily scrum",
    "standup",
    "azure devops",
    "optsolv",
    "time tracker",
    "hugging face",
    "ai",
  ],
  authors: [{ name: "Marcus Boni" }],
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: brand.name,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
