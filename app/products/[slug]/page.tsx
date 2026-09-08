import type { Metadata } from "next";

import ProductPageClient from "./ProductPageClient";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const PRODUCT_NAMES: Record<string, string> = {
  "rtx-5070": "RTX 5070",
  "rtx-5070-ti": "RTX 5070 Ti",
  "rtx-5080": "RTX 5080",
  "rtx-5090": "RTX 5090",

  "ps5": "PS5",
  "ps5-pro": "PS5 Pro",

  "iphone-17": "iPhone 17",
  "iphone-17-pro": "iPhone 17 Pro",
  "iphone-17-pro-max": "iPhone 17 Pro Max",

  "iphone-16": "iPhone 16",
  "iphone-16-pro": "iPhone 16 Pro",
  "iphone-16-pro-max": "iPhone 16 Pro Max",

  "airpods-pro": "AirPods Pro",
  "airpods-pro-2": "AirPods Pro 2",

  "macbook-air-m4": "MacBook Air M4",
  "macbook-pro-m4": "MacBook Pro M4",

  "oled-monitor": "OLED Monitor",
};

const UPPERCASE_WORDS = new Set([
  "rtx",
  "gtx",
  "ps5",
  "ps4",
  "oled",
  "qled",
  "ssd",
  "cpu",
  "gpu",
  "ram",
  "usb",
  "4k",
  "8k",
  "hdr",
  "wifi",
]);

function formatProductName(slug: string) {
  const decoded = decodeURIComponent(slug).toLowerCase();

  if (PRODUCT_NAMES[decoded]) {
    return PRODUCT_NAMES[decoded];
  }

  return decoded
    .split("-")
    .filter(Boolean)
    .map((word) => {
      if (UPPERCASE_WORDS.has(word)) {
        return word.toUpperCase();
      }

      if (/^m\d$/i.test(word)) {
        return word.toUpperCase();
      }

      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(" ");
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  const product = formatProductName(slug);

  const canonical = `/products/${encodeURIComponent(slug)}`;

  const title =
    `${product} Price Tracker – Compare Prices & Set Alerts`;

  const description =
    `Compare current ${product} prices, find available offers and set your target price. WANT keeps checking prices so you don't have to.`;

  return {
    title,
    description,

    alternates: {
      canonical,
    },

    openGraph: {
      type: "website",
      title: `${product} Price Tracker | WANT`,
      description:
        `Compare current ${product} offers and set the price you want to pay.`,
      url: canonical,
      siteName: "WANT",
    },

    twitter: {
      card: "summary_large_image",
      title: `${product} Price Tracker | WANT`,
      description:
        `Compare ${product} prices and create a price alert with WANT.`,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const product = formatProductName(slug);

  return (
    <ProductPageClient
      product={product}
    />
  );
}