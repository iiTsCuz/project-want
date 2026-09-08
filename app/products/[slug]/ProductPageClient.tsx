"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

type Offer = {
  id: string;
  title: string;
  price: number;
  currency: string;
  store: string;
  url: string;
  image?: string | null;
  provider?: string;
  resolverToken?: string | null;
};

type ProductPageClientProps = {
  product: string;
};

export default function ProductPageClient({
  product,
}: ProductPageClientProps) {
  const [offers, setOffers] =
    useState<Offer[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [user, setUser] =
    useState<User | null>(null);

  const [
    loadingUser,
    setLoadingUser,
  ] = useState(true);

  const [
    targetPrice,
    setTargetPrice,
  ] = useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      setUser(
        session?.user ??
          null
      );

      setLoadingUser(false);
    }

    loadUser();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session
        ) => {
          setUser(
            session?.user ??
              null
          );

          setLoadingUser(
            false
          );
        }
      );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!product) {
      return;
    }

    async function loadOffers() {
      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            `/api/search?q=${encodeURIComponent(
              product
            )}`
          );

        if (!response.ok) {
          throw new Error(
            "Search failed."
          );
        }

        const data =
          await response.json();

        const receivedOffers: Offer[] =
          data.offers || [];

        setOffers(
          [...receivedOffers].sort(
            (
              a,
              b
            ) =>
              a.price -
              b.price
          )
        );
      } catch (err) {
        console.error(
          "PRODUCT SEARCH ERROR:",
          err
        );

        setError(
          "Could not load current offers."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOffers();
  }, [product]);

  const bestOffer =
    useMemo(() => {
      if (
        offers.length ===
        0
      ) {
        return null;
      }

      return offers[0];
    }, [offers]);

  const averagePrice =
    useMemo(() => {
      if (
        offers.length ===
        0
      ) {
        return null;
      }

      const total =
        offers.reduce(
          (
            sum,
            offer
          ) =>
            sum +
            offer.price,
          0
        );

      return (
        total /
        offers.length
      );
    }, [offers]);

  const highestOffer =
    useMemo(() => {
      if (
        offers.length ===
        0
      ) {
        return null;
      }

      return Math.max(
        ...offers.map(
          (offer) =>
            offer.price
        )
      );
    }, [offers]);

  const priceSpread =
    bestOffer &&
    highestOffer !== null
      ? highestOffer -
        bestOffer.price
      : null;

  function trackPrice() {
    const normalized =
      targetPrice
        .replace(",", ".")
        .replace("€", "")
        .trim();

    const value =
      Number(normalized);

    if (
      !Number.isFinite(
        value
      ) ||
      value <= 0
    ) {
      return;
    }

    const query =
      `${product} under €${value}`;

    window.location.href =
      `/search?q=${encodeURIComponent(
        query
      )}`;
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* HEADER */}

      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">

          <a
            href="/"
            className="text-xl font-semibold tracking-[-0.04em]"
          >
            WANT
          </a>

          <div className="flex items-center gap-3">

            {!loadingUser &&
              user && (
                <a
                  href="/dashboard"
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  My Wants
                </a>
              )}

            {!loadingUser &&
              !user && (
                <a
                  href="/"
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  Sign in
                </a>
              )}

          </div>
        </div>
      </header>

      {/* HERO */}

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-20 md:px-10 md:pt-28">

        <div className="text-xs uppercase tracking-[0.18em] text-white/30">
          WANT Price Tracker
        </div>

        <h1 className="mt-5 max-w-5xl text-5xl font-semibold tracking-[-0.05em] md:text-7xl">
          {product}
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/40">
          Compare current offers for {product} and choose
          the price you&apos;re willing to pay. WANT can
          keep checking it for you.
        </p>

      </section>

      {/* PRICE SUMMARY */}

      <section className="mx-auto max-w-7xl px-6 md:px-10">

        <div className="grid gap-4 md:grid-cols-3">

          <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-7">

            <div className="text-xs uppercase tracking-[0.15em] text-white/30">
              Best price now
            </div>

            <div className="mt-5 text-4xl font-semibold tracking-tight">
              {loading
                ? "..."
                : bestOffer
                ? `€${bestOffer.price.toFixed(
                    2
                  )}`
                : "—"}
            </div>

            {bestOffer && (
              <div className="mt-2 text-sm text-white/35">
                {bestOffer.store}
              </div>
            )}

          </div>

          <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-7">

            <div className="text-xs uppercase tracking-[0.15em] text-white/30">
              Average price
            </div>

            <div className="mt-5 text-4xl font-semibold tracking-tight">
              {averagePrice !==
              null
                ? `€${averagePrice.toFixed(
                    2
                  )}`
                : "—"}
            </div>

            <div className="mt-2 text-sm text-white/35">
              Across {offers.length} current offers
            </div>

          </div>

          <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-7">

            <div className="text-xs uppercase tracking-[0.15em] text-white/30">
              Price spread
            </div>

            <div className="mt-5 text-4xl font-semibold tracking-tight">
              {priceSpread !==
              null
                ? `€${priceSpread.toFixed(
                    2
                  )}`
                : "—"}
            </div>

            <div className="mt-2 text-sm text-white/35">
              Difference between lowest and highest
            </div>

          </div>

        </div>

      </section>

      {/* PRICE ALERT */}

      <section className="mx-auto max-w-7xl px-6 py-8 md:px-10">

        <div className="rounded-[32px] border border-white/[0.08] bg-white/[0.025] p-7 md:p-9">

          <div className="grid gap-8 md:grid-cols-2 md:items-center">

            <div>

              <div className="text-xs uppercase tracking-[0.15em] text-white/30">
                Price alert
              </div>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                What price are you waiting for?
              </h2>

              <p className="mt-3 max-w-lg leading-7 text-white/40">
                Set your target price and WANT will turn it
                into a buying target you can monitor from
                your dashboard.
              </p>

            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              <div className="flex flex-1 items-center rounded-full border border-white/10 bg-black/30 px-5">

                <span className="text-white/30">
                  €
                </span>

                <input
                  value={
                    targetPrice
                  }
                  onChange={(
                    event
                  ) =>
                    setTargetPrice(
                      event.target.value
                    )
                  }
                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      trackPrice();
                    }
                  }}
                  inputMode="decimal"
                  placeholder={
                    bestOffer
                      ? Math.floor(
                          bestOffer.price *
                            0.9
                        ).toString()
                      : "500"
                  }
                  className="w-full bg-transparent px-3 py-4 text-lg outline-none placeholder:text-white/20"
                />

              </div>

              <button
                onClick={
                  trackPrice
                }
                disabled={
                  !targetPrice.trim()
                }
                className="rounded-full bg-white px-7 py-4 text-sm font-semibold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-30"
              >
                Track this price →
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* CURRENT OFFERS */}

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10">

        <div className="flex items-end justify-between gap-5">

          <div>

            <div className="text-xs uppercase tracking-[0.18em] text-white/30">
              Live market
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
              Current offers
            </h2>

          </div>

          {!loading && (
            <div className="text-sm text-white/30">
              {offers.length} found
            </div>
          )}

        </div>

        {loading && (
          <div className="mt-10 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 text-white/40">
            WANT is checking current prices...
          </div>
        )}

        {error && (
          <div className="mt-10 rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-red-400">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          offers.length ===
            0 && (
            <div className="mt-10 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 text-white/40">
              No matching offers found right now.
            </div>
          )}

        <div className="mt-10 grid gap-4">

          {offers
            .slice(
              0,
              12
            )
            .map(
              (
                offer,
                index
              ) => (
                <article
                  key={
                    offer.id
                  }
                  className="flex flex-col gap-5 rounded-[24px] border border-white/[0.08] bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between"
                >

                  <div className="flex min-w-0 items-center gap-5">

                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/[0.05]">

                      {offer.image ? (
                        <img
                          src={
                            offer.image
                          }
                          alt={
                            offer.title
                          }
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <span className="text-xs text-white/20">
                          WANT
                        </span>
                      )}

                    </div>

                    <div className="min-w-0">

                      {index ===
                        0 && (
                        <span className="rounded-full bg-green-400/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-green-400">
                          Best price
                        </span>
                      )}

                      <h3 className="mt-2 font-medium">
                        {
                          offer.title
                        }
                      </h3>

                      <div className="mt-1 text-sm text-white/35">
                        {
                          offer.store
                        }
                      </div>

                    </div>

                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-5 sm:justify-end">

                    <div className="text-right">

                      <div className="text-2xl font-semibold">
                        €
                        {offer.price.toFixed(
                          2
                        )}
                      </div>

                    </div>

                    <a
                      href={
                        offer.url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
                    >
                      View deal →
                    </a>

                  </div>

                </article>
              )
            )}

        </div>

      </section>

      {/* PRICE INTELLIGENCE */}

      <section className="border-t border-white/[0.06]">

        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 md:grid-cols-2 md:px-10">

          <div>

            <div className="text-xs uppercase tracking-[0.18em] text-white/30">
              Price intelligence
            </div>

            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
              Don&apos;t just find it.
              <br />

              <span className="text-white/35">
                Know when to buy it.
              </span>
            </h2>

          </div>

          <div className="space-y-7 leading-7 text-white/40">

            <p>
              WANT compares available offers for{" "}
              {product} and sorts them by price, helping
              you understand how much current sellers
              differ.
            </p>

            {bestOffer &&
              averagePrice !==
                null && (
                <p>
                  The lowest offer currently found is{" "}
                  <strong className="font-medium text-white/70">
                    €
                    {bestOffer.price.toFixed(
                      2
                    )}
                  </strong>
                  , compared with an average of{" "}
                  <strong className="font-medium text-white/70">
                    €
                    {averagePrice.toFixed(
                      2
                    )}
                  </strong>{" "}
                  across the offers WANT found.
                </p>
              )}

            <p>
              A low price today doesn&apos;t necessarily
              mean you have to buy today. Set the amount
              you&apos;re comfortable paying and keep the
              purchase as an active WANT.
            </p>

            <p>
              Prices and availability may change after
              they are displayed. Always verify the
              product, seller and final price before
              purchasing.
            </p>

          </div>

        </div>

      </section>

      {/* FAQ */}

      <section className="border-t border-white/[0.06]">

        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10">

          <div className="text-xs uppercase tracking-[0.18em] text-white/30">
            FAQ
          </div>

          <h2 className="mt-4 text-4xl font-semibold tracking-tight">
            About {product} prices
          </h2>

          <div className="mt-12 max-w-3xl divide-y divide-white/[0.07]">

            <div className="py-7">

              <h3 className="font-medium">
                How does WANT find {product} prices?
              </h3>

              <p className="mt-3 leading-7 text-white/40">
                WANT searches available shopping offers
                and compares the prices returned for the
                product.
              </p>

            </div>

            <div className="py-7">

              <h3 className="font-medium">
                Does WANT sell {product}?
              </h3>

              <p className="mt-3 leading-7 text-white/40">
                No. WANT is a price-monitoring and product
                discovery service. Purchases take place
                through third-party retailers.
              </p>

            </div>

            <div className="py-7">

              <h3 className="font-medium">
                Can WANT notify me when {product} becomes
                cheaper?
              </h3>

              <p className="mt-3 leading-7 text-white/40">
                Yes. Choose the price you&apos;re willing
                to pay and create a WANT. Active WANTs can
                be monitored from your dashboard.
              </p>

            </div>

            <div className="py-7">

              <h3 className="font-medium">
                Are the prices guaranteed?
              </h3>

              <p className="mt-3 leading-7 text-white/40">
                No. Retailer prices and availability can
                change at any time. Always verify the
                final price and product details before
                purchasing.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* FINAL CTA */}

      <section className="border-t border-white/[0.06]">

        <div className="mx-auto max-w-7xl px-6 py-28 text-center md:px-10">

          <div className="text-xs uppercase tracking-[0.18em] text-white/30">
            Stop checking manually
          </div>

          <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.045em] md:text-6xl">
            Waiting for a better {product} price?
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-white/40">
            Choose your target and let WANT keep the
            purchase on your radar.
          </p>

          <button
            onClick={() =>
              window.scrollTo({
                top: 300,
                behavior:
                  "smooth",
              })
            }
            className="mt-8 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:scale-[1.03]"
          >
            Set my target →
          </button>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="border-t border-white/[0.06]">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-6 py-10 text-xs text-white/25 sm:flex-row md:px-10">

          <span>
            © 2026 WANT
          </span>

          <div className="flex flex-wrap gap-5">

            <a
              href="/about"
              className="hover:text-white"
            >
              About
            </a>

            <a
              href="/privacy"
              className="hover:text-white"
            >
              Privacy
            </a>

            <a
              href="/cookies"
              className="hover:text-white"
            >
              Cookies
            </a>

            <a
              href="/terms"
              className="hover:text-white"
            >
              Terms
            </a>

          </div>

        </div>

      </footer>

    </main>
  );
}