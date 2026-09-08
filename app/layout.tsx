import type { Metadata } from "next";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

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
  metadataBase: new URL(
    "https://www.wantpilot.app"
  ),

  title: {
    default:
      "WANTPILOT — Track prices and buy when the price is right",
    template:
      "%s | WANTPILOT",
  },

  description:
    "Tell WANTPILOT what you want to buy and the price you are willing to pay. Compare current offers, track prices and get notified when your target is reached.",

  applicationName:
    "WANTPILOT",

  keywords: [
    "price tracker",
    "price alerts",
    "price comparison",
    "shopping deals",
    "track product prices",
    "price drop alerts",
    "WANTPILOT",
  ],

  authors: [
    {
      name: "WANTPILOT",
    },
  ],

  creator:
    "WANTPILOT",

  publisher:
    "WANTPILOT",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url:
      "https://www.wantpilot.app",
    siteName:
      "WANTPILOT",

    title:
      "WANTPILOT — Stop checking prices",

    description:
      "Set the price you want to pay. WANTPILOT compares offers and keeps checking prices for you.",
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "WANTPILOT — Stop checking prices",

    description:
      "Set your target price and let WANTPILOT keep checking the market for you.",
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,

      "max-video-preview":
        -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}