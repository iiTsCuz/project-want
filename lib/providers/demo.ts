import type { Offer, SearchProvider } from "./types";

export const demoProvider: SearchProvider = {
  name: "demo",

  async search(query: string): Promise<Offer[]> {
    return [
      {
        id: "demo-1",
        title: `${query} - Example offer 1`,
        price: 579.99,
        currency: "EUR",
        store: "Demo Store",
        url: "#",
        image: null,
      },
      {
        id: "demo-2",
        title: `${query} - Example offer 2`,
        price: 599,
        currency: "EUR",
        store: "Demo Shop",
        url: "#",
        image: null,
      },
      {
        id: "demo-3",
        title: `${query} - Example offer 3`,
        price: 629.9,
        currency: "EUR",
        store: "Demo Market",
        url: "#",
        image: null,
      },
    ];
  },
};