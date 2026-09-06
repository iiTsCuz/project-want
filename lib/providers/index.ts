import { serpApiProvider } from "./serpapi";
import type { Offer, SearchProvider } from "./types";

const providers: SearchProvider[] = [
  serpApiProvider,
];

export async function searchAllProviders(
  query: string
): Promise<Offer[]> {
  const results = await Promise.allSettled(
    providers.map((provider) => provider.search(query))
  );

  const offers = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );

  return offers.sort((a, b) => a.price - b.price);
}