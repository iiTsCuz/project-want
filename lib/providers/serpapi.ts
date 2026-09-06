import type { Offer, SearchProvider } from "./types";

type SerpApiShoppingResult = {
  position?: number;
  title?: string;
  product_id?: string;
  product_link?: string;
  link?: string;
  source?: string;
  price?: string;
  extracted_price?: number;
  thumbnail?: string;
  serpapi_thumbnail?: string;
};

type SerpApiResponse = {
  shopping_results?: SerpApiShoppingResult[];
  error?: string;
};

function looksLikeInstallment(priceText?: string) {
  if (!priceText) return false;

  const text = priceText.toLowerCase();

  const installmentWords = [
    "/mese",
    "al mese",
    "mensile",
    "mensili",
    "/month",
    "per month",
    "monthly",
    "rate da",
    "rata da",
  ];

  return installmentWords.some((word) => text.includes(word));
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);

  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

export const serpApiProvider: SearchProvider = {
  name: "serpapi",

  async search(query: string): Promise<Offer[]> {
    const apiKey = process.env.SERPAPI_KEY;

    if (!apiKey) {
      throw new Error("SERPAPI_KEY is missing.");
    }

    const params = new URLSearchParams({
      engine: "google_shopping",
      q: query,
      api_key: apiKey,
      gl: "it",
      hl: "it",
      location: "Italy",
    });

    const response = await fetch(
      `https://serpapi.com/search.json?${params.toString()}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `SerpApi request failed: ${response.status}`
      );
    }

    const data: SerpApiResponse = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    const results = data.shopping_results ?? [];

    const validResults = results.filter((item) => {
      const hasValidPrice =
        typeof item.extracted_price === "number" &&
        Number.isFinite(item.extracted_price) &&
        item.extracted_price > 0;

      const hasLink = Boolean(
        item.product_link || item.link
      );

      return (
        Boolean(item.title) &&
        hasValidPrice &&
        hasLink &&
        !looksLikeInstallment(item.price)
      );
    });

    const prices = validResults.map(
      (item) => item.extracted_price as number
    );

    const medianPrice =
      prices.length >= 5
        ? median(prices)
        : null;

    const cleanedResults = validResults.filter((item) => {
      if (medianPrice === null) {
        return true;
      }

      const price = item.extracted_price as number;

      const suspiciouslyLow =
        price < medianPrice * 0.2;

      const suspiciouslyHigh =
        price > medianPrice * 5;

      return !suspiciouslyLow && !suspiciouslyHigh;
    });

    const offers: Offer[] = cleanedResults.map(
      (item, index) => ({
        id:
          item.product_id ||
          `serpapi-${item.position ?? index}-${item.title}`,

        title: item.title!,

        price: item.extracted_price!,

        currency: "EUR",

        store:
          item.source ||
          "Google Shopping",

        url:
          item.product_link ||
          item.link ||
          "#",

        image:
          item.thumbnail ||
          item.serpapi_thumbnail ||
          null,
      })
    );

    return offers.sort(
      (a, b) => a.price - b.price
    );
  },
};