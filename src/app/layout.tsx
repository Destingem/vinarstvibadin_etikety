import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const displaySerif = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://etiketa.wine"),
  title: {
    default: "etiketa.wine pro ceska vinarstvi",
    template: "%s | etiketa.wine",
  },
  description:
    "Compliance-first digitalni etikety, QR a verejne labely pro ceska vinarstvi.",
  applicationName: "etiketa.wine",
  keywords: [
    "etiketa.wine",
    "vinarstvi",
    "digitalni etiketa",
    "QR etiketa",
    "vino",
    "Cesko",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    url: "/",
    siteName: "etiketa.wine",
    title: "etiketa.wine",
    description:
      "Compliance-first digitalni etikety, QR a verejne labely pro ceska vinarstvi.",
  },
  twitter: {
    card: "summary",
    title: "etiketa.wine",
    description:
      "Compliance-first digitalni etikety, QR a verejne labely pro ceska vinarstvi.",
  },
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
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${displaySerif.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
