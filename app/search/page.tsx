"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";
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
};

function parseWant(query: string) {
  const priceMatch = query.match(
    /(?:under|sotto|below|<)\s*€?\s*(\d+(?:[.,]\d+)?)\s*€?/i
  );

  const targetPrice = priceMatch
    ? Number(priceMatch[1].replace(",", "."))
    : null;

  const cleanedProduct = query
    .replace(
      /(?:under|sotto|below|<)\s*€?\s*\d+(?:[.,]\d+)?\s*€?/i,
      ""
    )
    .replace(/\s*€\s*$/g, "")
    .trim();

  return {
    product: cleanedProduct || query,
    targetPrice,
    currency: "EUR",
    condition: "new",
  };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const parsed = useMemo(
    () => parseWant(query),
    [query]
  );

  const [user, setUser] =
    useState<User | null>(null);

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [activating, setActivating] =
    useState(false);

  const [activated, setActivated] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState<
      "success" | "error" | "info"
    >("info");

  const [offers, setOffers] =
    useState<Offer[]>([]);

  const [loadingOffers, setLoadingOffers] =
    useState(true);

  const [offersError, setOffersError] =
    useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user ?? null);
      setLoadingUser(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoadingUser(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function loadOffers() {
      if (!parsed.product) {
        setLoadingOffers(false);
        return;
      }

      setLoadingOffers(true);
      setOffersError("");

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(
            parsed.product
          )}`
        );

        if (!response.ok) {
          throw new Error("Search failed.");
        }

        const data = await response.json();

        const receivedOffers: Offer[] =
          data.offers || [];

        setOffers(
          [...receivedOffers].sort(
            (a, b) => a.price - b.price
          )
        );
      } catch (error) {
        console.error(
          "SEARCH ERROR:",
          error
        );

        setOffersError(
          "Could not load offers."
        );
      } finally {
        setLoadingOffers(false);
      }
    }

    loadOffers();
  }, [parsed.product]);

  const bestOffer = useMemo(() => {
    if (offers.length === 0) {
      return null;
    }

    return [...offers].sort(
      (a, b) => a.price - b.price
    )[0];
  }, [offers]);

  async function activateWant() {
    setMessage("");

    if (!user) {
      setMessageType("error");
      setMessage(
        "Sign in first to activate this WANT."
      );
      return;
    }

    if (!bestOffer) {
      setMessageType("error");
      setMessage(
        "Wait for the search to finish first."
      );
      return;
    }

    setActivating(true);

    try {
      const {
        data: existingWant,
        error: existingError,
      } = await supabase
        .from("wants")
        .select("id")
        .eq("user_id", user.id)
        .eq("original_query", query)
        .eq("status", "active")
        .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existingWant) {
        const { error: updateError } =
          await supabase
            .from("wants")
            .update({
              product: parsed.product,
              target_price:
                parsed.targetPrice,
              best_price:
                bestOffer.price,
              best_offer_title:
                bestOffer.title,
              best_offer_store:
                bestOffer.store,
              best_offer_url:
                bestOffer.url,
              updated_at:
                new Date().toISOString(),
            })
            .eq("id", existingWant.id);

        if (updateError) {
          throw updateError;
        }

        setActivated(true);
        setMessageType("info");

        setMessage(
          `This WANT is already active. Best offer updated: €${bestOffer.price.toFixed(
            2
          )} at ${bestOffer.store}.`
        );

        return;
      }

      const { error: insertError } =
        await supabase
          .from("wants")
          .insert({
            user_id: user.id,
            original_query: query,
            product: parsed.product,
            target_price:
              parsed.targetPrice,
            currency:
              parsed.currency,
            condition:
              parsed.condition,
            status: "active",

            best_price:
              bestOffer.price,

            best_offer_title:
              bestOffer.title,

            best_offer_store:
              bestOffer.store,

            best_offer_url:
              bestOffer.url,

            updated_at:
              new Date().toISOString(),
          });

      if (insertError) {
        throw insertError;
      }

      setActivated(true);
      setMessageType("success");

      setMessage(
        `WANT activated. Best offer: €${bestOffer.price.toFixed(
          2
        )} at ${bestOffer.store}.`
      );
    } catch (error) {
      console.error(
        "ACTIVATE WANT ERROR:",
        error
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error";

      setMessageType("error");

      setMessage(
        `Could not save WANT: ${errorMessage}`
      );
    } finally {
      setActivating(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">

        <header className="flex items-center justify-between">
          <a
            href="/"
            className="text-xl font-semibold tracking-tight"
          >
            WANT
          </a>

          <div className="flex items-center gap-3">

            {!loadingUser && user && (
              <a
                href="/dashboard"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                My Wants
              </a>
            )}

            {!loadingUser && user ? (
              <div className="text-right">
                <div className="text-sm font-medium">
                  {user.user_metadata
                    ?.full_name ||
                    user.user_metadata
                      ?.name ||
                    user.email}
                </div>

                <div className="text-xs text-white/35">
                  Signed in
                </div>
              </div>
            ) : (
              <a
                href="/"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Sign in
              </a>
            )}

          </div>
        </header>

        <section className="mt-16">

          <div className="text-xs uppercase tracking-[0.18em] text-white/30">
            WANT understood
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
            {parsed.product}
          </h1>

          <p className="mt-4 text-lg text-white/40">
            We turned your request into a live buying target.
          </p>

        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-4">

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <div className="text-xs uppercase tracking-widest text-white/25">
              Product
            </div>

            <div className="mt-4 text-lg font-medium">
              {parsed.product}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <div className="text-xs uppercase tracking-widest text-white/25">
              Target price
            </div>

            <div className="mt-4 text-2xl font-semibold">
              {parsed.targetPrice !== null
                ? `€${parsed.targetPrice}`
                : "Not specified"}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <div className="text-xs uppercase tracking-widest text-white/25">
              Condition
            </div>

            <div className="mt-4 text-lg font-medium">
              New
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <div className="text-xs uppercase tracking-widest text-white/25">
              Status
            </div>

            <div className="mt-4 flex items-center gap-2 text-lg font-medium">

              <span
                className={`h-2 w-2 rounded-full ${
                  activated
                    ? "bg-green-400"
                    : "bg-white/30"
                }`}
              />

              {activated
                ? "Active"
                : "Ready"}

            </div>
          </div>

        </section>

        <section className="mt-8 rounded-[32px] border border-white/10 bg-white/[0.025] p-7 md:p-9">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="text-sm text-white/30">
                Best price right now
              </div>

              <div className="mt-2 text-4xl font-semibold">

                {loadingOffers
                  ? "Searching..."
                  : bestOffer
                  ? `€${bestOffer.price.toFixed(
                      2
                    )}`
                  : "No offers found"}

              </div>

              <div className="mt-2 max-w-3xl text-sm text-white/30">

                {bestOffer
                  ? `${bestOffer.store} · ${bestOffer.title}`
                  : "WANT will compare available offers."}

              </div>

              {bestOffer &&
                parsed.targetPrice !== null &&
                bestOffer.price <=
                  parsed.targetPrice && (
                  <div className="mt-3 inline-flex rounded-full bg-green-400/10 px-3 py-1 text-xs font-medium text-green-400">
                    Target reached
                  </div>
                )}

            </div>

            <button
              onClick={activateWant}
              disabled={
                activating ||
                activated ||
                loadingOffers ||
                !bestOffer
              }
              className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {activating
                ? "Activating..."
                : activated
                ? "WANT activated ✓"
                : "Activate this WANT"}
            </button>

          </div>

          {message && (
            <div
              className={`mt-5 text-sm ${
                messageType === "success"
                  ? "text-green-400"
                  : messageType === "error"
                  ? "text-red-400"
                  : "text-white/50"
              }`}
            >
              {message}
            </div>
          )}

        </section>

        <section className="mt-8">

          <div className="mb-4 flex items-center justify-between">

            <h2 className="text-xl font-semibold">
              Offers
            </h2>

            <span className="text-sm text-white/30">
              {loadingOffers
                ? "Searching..."
                : `${offers.length} found`}
            </span>

          </div>

          {offersError && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-400">
              {offersError}
            </div>
          )}

          {!offersError &&
            !loadingOffers &&
            offers.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/40">
                No offers found.
              </div>
            )}

          <div className="grid gap-4">

            {offers.map((offer) => {

              const underTarget =
                parsed.targetPrice !==
                  null &&
                offer.price <=
                  parsed.targetPrice;

              return (
                <div
                  key={offer.id}
                  className="flex flex-col gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between"
                >

                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/[0.06] text-xs text-white/30">

                      {offer.image ? (
                        <img
                          src={offer.image}
                          alt={offer.title}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        "IMG"
                      )}

                    </div>

                    <div className="min-w-0">

                      <div className="font-medium">
                        {offer.title}
                      </div>

                      <div className="mt-1 text-sm text-white/35">
                        {offer.store}
                      </div>

                    </div>

                  </div>

                  <div className="flex shrink-0 items-center gap-4">

                    <div className="text-right">

                      <div className="text-xl font-semibold">
                        €{offer.price.toFixed(2)}
                      </div>

                      <div
                        className={`mt-1 text-xs ${
                          underTarget
                            ? "text-green-400"
                            : "text-white/30"
                        }`}
                      >
                        {underTarget
                          ? "Target reached"
                          : parsed.targetPrice !== null
                          ? `€${(
                              offer.price -
                              parsed.targetPrice
                            ).toFixed(
                              2
                            )} above target`
                          : "No target price"}
                      </div>

                    </div>

                    <a
                      href={offer.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
                    >
                      View
                    </a>

                  </div>

                </div>
              );
            })}

          </div>

        </section>

      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#050505] text-white">
          <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
            <div className="text-sm text-white/40">
              Loading WANT...
            </div>
          </div>
        </main>
      }
    >
      <SearchContent />
    </Suspense>
  );
}