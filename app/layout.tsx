import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FortiGate IoC Manager",
  description: "Gestionnaire d'Indicateurs de Compromission pour FortiGate - Sécurisez votre infrastructure avec une gestion centralisée des menaces",
  keywords: "FortiGate, IoC, Indicators of Compromise, Cybersecurity, Threat Intelligence, Security Management",
  authors: [{ name: "FortiGate Security Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "FortiGate IoC Manager",
    description: "Gestionnaire d'Indicateurs de Compromission pour FortiGate",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="msapplication-TileColor" content="#dc2626" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-gray-50 text-gray-900 font-sans`}
      >
        <div id="root" className="h-full">
          {children}
        </div>
        
        {/* Loading overlay for better UX */}
        <div id="loading-overlay" className="fixed inset-0 bg-white z-50 flex items-center justify-center hidden">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
            <p className="text-gray-600 font-medium">Chargement...</p>
          </div>
        </div>
      </body>
    </html>
  );
}