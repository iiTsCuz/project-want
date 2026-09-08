export type Offer = {
  id: string;

  title: string;

  price: number;

  currency: string;

  store: string;

  /*
   * URL di fallback.
   *
   * Per SerpApi può essere ancora la pagina Google Shopping.
   * Il pulsante "View" non lo userà direttamente quando
   * abbiamo un resolverToken.
   */
  url: string;

  image?: string | null;

  /*
   * Identifica da quale provider arriva l'offerta.
   *
   * Ci servirà quando WANT avrà più fonti:
   * SerpApi, Amazon, eBay, Awin, ecc.
   */
  provider?: string;

  /*
   * Token usato per risolvere il venditore reale
   * solo quando l'utente clicca sull'offerta.
   *
   * Nel caso di SerpApi contiene
   * immersive_product_page_token.
   */
  resolverToken?: string | null;
};

export type SearchProvider = {
  name: string;

  search: (
    query: string
  ) => Promise<Offer[]>;
};