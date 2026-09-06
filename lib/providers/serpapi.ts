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
      throw new Error(`SerpApi request failed: ${response.status}`);
    }

    const data: SerpApiResponse = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    const results = data.shopping_results ?? [];

    return results
      .filter(
        (item) =>
          item.title &&
          typeof item.extracted_price === "number" &&
          (item.product_link || item.link)
      )
      .map((item, index) => ({
        id:
          item.product_id ||
          `serpapi-${item.position ?? index}-${item.title}`,
        title: item.title!,
        price: item.extracted_price!,
        currency: "EUR",
        store: item.source || "Google Shopping",
        url: item.product_link || item.link || "#",
        image: item.thumbnail || item.serpapi_thumbnail || null,
      }));
  },
};