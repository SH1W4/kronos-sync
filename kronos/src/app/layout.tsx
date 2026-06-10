import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import InstallPWABanner from "@/components/pwa/InstallBanner";

export const dynamic = 'force-dynamic'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Impede zoom acidental no app
}

const appUrl = process.env.NEXTAUTH_URL || 'https://kairos-os-app.vercel.app'

export const metadata: Metadata = {
  title: {
    default: "KAIRØS OS — Sistema de Gestão para Estúdios de Tatuagem",
    template: "%s | KAIRØS OS",
  },
  description: "Plataforma de gestão completa para estúdios de tatuagem. Agenda inteligente, controle financeiro, recepção digital e business intelligence. Usado por estúdios profissionais em todo o Brasil.",
  keywords: [
    "gestão estúdio tatuagem",
    "sistema para tatuadores",
    "software estúdio tattoo",
    "agenda tatuagem",
    "controle financeiro tatuagem",
    "plataforma estúdios",
    "SaaS tatuagem",
    "gestão de artistas",
    "recepção digital estúdio",
    "KAIRØS",
    "tattoo studio management",
  ],
  manifest: "/manifest.json",
  metadataBase: new URL(appUrl),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: appUrl,
    siteName: "KAIRØS OS",
    title: "KAIRØS OS — Controle absoluto para estúdios profissionais",
    description: "Agenda, finanças, recepção digital e BI — tudo em uma plataforma feita para estúdios de tatuagem que levam seu negócio a sério.",
    images: [
      {
        url: "/brand/k_hourglass_logo.png",
        width: 512,
        height: 512,
        alt: "KAIRØS OS Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KAIRØS OS — Sistema de Gestão para Estúdios de Tatuagem",
    description: "Controle absoluto para estúdios profissionais. Agenda, finanças e inteligência de dados.",
    images: ["/brand/k_hourglass_logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kairøs",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#8b5cf6',
        },
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/artist/dashboard"
      afterSignUpUrl="/artist/dashboard"
    >
      <html lang="pt-BR" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        >
          <Providers>
            <InstallPWABanner />
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
