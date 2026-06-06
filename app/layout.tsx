import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sora, Plus_Jakarta_Sans } from "next/font/google";
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
  title: "Mai-Milu | Bali Carpool Community",
  description:
    "Platform carpooling untuk menghubungkan pengemudi dan penumpang di Bali.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mai-Milu",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#1d4ed8",
    "msapplication-TileImage": "/icon-144x144.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
