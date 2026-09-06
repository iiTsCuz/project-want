export type Offer = {
  id: string;
  title: string;
  price: number;
  currency: string;
  store: string;
  url: string;
  image?: string | null;
};

export type SearchProvider = {
  name: string;
  search: (query: string) => Promise<Offer[]>;
};