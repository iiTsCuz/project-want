import type {
  Offer,
  SearchProvider,
} from "./types";

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
  immersive_product_page_token?: string;
};

type SerpApiResponse = {
  shopping_results?: SerpApiShoppingResult[];
  error?: string;
};

/*
 * WANT TRUSTED STORES
 *
 * Mostriamo SOLO merchant che abbiamo deciso
 * esplicitamente di considerare affidabili.
 *
 * Nota:
 * Amazon ed eBay possono includere venditori marketplace,
 * quindi non li etichettiamo ancora come "verified seller".
 */
const TRUSTED_STORES = [
  "amazon",
  "ebay",
  "unieuro",
  "mediaworld",
  "euronics",
];

function normalizeStoreName(
  value?: string
) {
  return (value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function isTrustedStore(
  store?: string
) {
  const normalized =
    normalizeStoreName(
      store
    );

  if (!normalized) {
    return false;
  }

  return TRUSTED_STORES.some(
    (
      trustedStore
    ) =>
      normalized.includes(
        trustedStore
      )
  );
}

function looksLikeInstallment(
  priceText?: string
) {
  if (!priceText) {
    return false;
  }

  const text =
    priceText.toLowerCase();

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

  return installmentWords.some(
    (
      word
    ) =>
      text.includes(
        word
      )
  );
}

function median(
  values: number[]
) {
  const sorted = [
    ...values,
  ].sort(
    (
      a,
      b
    ) =>
      a - b
  );

  const middle =
    Math.floor(
      sorted.length /
        2
    );

  if (
    sorted.length %
      2 ===
    0
  ) {
    return (
      sorted[
        middle - 1
      ] +
      sorted[
        middle
      ]
    ) / 2;
  }

  return sorted[
    middle
  ];
}

export const serpApiProvider: SearchProvider =
  {
    name: "serpapi",

    async search(
      query: string
    ): Promise<Offer[]> {
      const apiKey =
        process.env.SERPAPI_KEY;

      if (!apiKey) {
        throw new Error(
          "SERPAPI_KEY is missing."
        );
      }

      const params =
        new URLSearchParams(
          {
            engine:
              "google_shopping",

            q:
              query,

            api_key:
              apiKey,

            gl:
              "it",

            hl:
              "it",

            location:
              "Italy",
          }
        );

      const response =
        await fetch(
          `https://serpapi.com/search.json?${params.toString()}`,
          {
            cache:
              "no-store",
          }
        );

      if (
        !response.ok
      ) {
        throw new Error(
          `SerpApi request failed: ${response.status}`
        );
      }

      const data: SerpApiResponse =
        await response.json();

      if (
        data.error
      ) {
        throw new Error(
          data.error
        );
      }

      const results =
        data.shopping_results ??
        [];

      /*
       * FILTRO BASE
       *
       * - titolo valido
       * - product_id presente
       * - prezzo numerico positivo
       * - niente rate
       * - solo store approvati
       */
      const validResults =
        results.filter(
          (
            item
          ) => {
            const hasValidPrice =
              typeof item.extracted_price ===
                "number" &&
              Number.isFinite(
                item.extracted_price
              ) &&
              item.extracted_price >
                0;

            const hasProduct =
              Boolean(
                item.title
              ) &&
              Boolean(
                item.product_id
              );

            const trustedStore =
              isTrustedStore(
                item.source
              );

            const installment =
              looksLikeInstallment(
                item.price
              );

            return (
              hasProduct &&
              hasValidPrice &&
              trustedStore &&
              !installment
            );
          }
        );

      /*
       * FILTRO ANTI-OUTLIER
       *
       * Se abbiamo abbastanza risultati,
       * rimuoviamo prezzi enormemente fuori scala.
       */
      const prices =
        validResults.map(
          (
            item
          ) =>
            item.extracted_price as number
        );

      const medianPrice =
        prices.length >= 5
          ? median(
              prices
            )
          : null;

      const cleanedResults =
        validResults.filter(
          (
            item
          ) => {
            if (
              medianPrice ===
              null
            ) {
              return true;
            }

            const price =
              item.extracted_price as number;

            const suspiciouslyLow =
              price <
              medianPrice *
                0.2;

            const suspiciouslyHigh =
              price >
              medianPrice *
                5;

            return (
              !suspiciouslyLow &&
              !suspiciouslyHigh
            );
          }
        );

      /*
       * CONVERSIONE IN OFFER
       */
      const offers: Offer[] =
        cleanedResults.map(
          (
            item,
            index
          ) => ({
            id:
              item.product_id ||
              `serpapi-${item.position ?? index}-${item.title}`,

            title:
              item.title!,

            price:
              item.extracted_price!,

            currency:
              "EUR",

            store:
              item.source ||
              "Unknown store",

            url:
              item.product_link ||
              item.link ||
              "#",

            image:
              item.thumbnail ||
              item.serpapi_thumbnail ||
              null,

            provider:
              "serpapi",

            resolverToken:
              item.immersive_product_page_token ||
              null,
          })
        );

      /*
       * PIÙ ECONOMICO PRIMA
       */
      return offers.sort(
        (
          a,
          b
        ) =>
          a.price -
          b.price
      );
    },
  };