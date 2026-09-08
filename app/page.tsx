"use client";

import { useEffect, useState } from "react";

import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

const suggestions = [
  "PS5 Pro under €650",
  "iPhone 17 Pro under €900",
  "RTX 5070 under €550",
  "OLED monitor under €700",
];

const examples = [
  {
    product: "RTX 5070",
    target: "€550",
    description:
      "Tell WANT the exact price you're willing to pay.",
  },
  {
    product: "iPhone 17 Pro",
    target: "€900",
    description:
      "WANT checks available offers so you don't have to.",
  },
  {
    product: "PS5 Pro",
    target: "€650",
    description:
      "Set your target once and keep it in your dashboard.",
  },
];

const popularProducts = [
  {
    name: "RTX 5070",
    slug: "rtx-5070",
    category: "Graphics card",
  },
  {
    name: "iPhone 17 Pro",
    slug: "iphone-17-pro",
    category: "Smartphone",
  },
  {
    name: "PS5 Pro",
    slug: "ps5-pro",
    category: "Gaming",
  },
  {
    name: "AirPods Pro",
    slug: "airpods-pro",
    category: "Audio",
  },
  {
    name: "MacBook Air M4",
    slug: "macbook-air-m4",
    category: "Laptop",
  },
  {
    name: "OLED Monitor",
    slug: "oled-monitor",
    category: "Display",
  },
];

export default function Home() {
  const [want, setWant] = useState("");

  const [user, setUser] =
    useState<User | null>(null);

  const [loadingUser, setLoadingUser] =
    useState(true);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      setUser(
        session?.user ?? null
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
            session?.user ?? null
          );

          setLoadingUser(false);
        }
      );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function signInWithGoogle() {
    const { error } =
      await supabase.auth.signInWithOAuth({
        provider: "google",

        options: {
          redirectTo:
            window.location.origin,
        },
      });

    if (error) {
      alert(
        "Login error: " +
          error.message
      );
    }
  }

  async function signOut() {
    await supabase.auth.signOut();

    setUser(null);
  }

  function searchWant() {
    if (!want.trim()) return;

    window.location.href =
      `/search?q=${encodeURIComponent(
        want.trim()
      )}`;
  }

  function useExample(
    value: string
  ) {
    setWant(value);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const displayName =
    user?.user_metadata
      ?.full_name ||
    user?.user_metadata
      ?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const avatar =
    user?.user_metadata
      ?.avatar_url;

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#050505]/85 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">

          <a
            href="/"
            className="text-xl font-semibold tracking-[-0.04em]"
          >
            WANT
          </a>

          <nav className="hidden items-center gap-7 text-sm text-white/40 md:flex">

            <a
              href="#popular-products"
              className="transition hover:text-white"
            >
              Popular
            </a>

            <a
              href="#how-it-works"
              className="transition hover:text-white"
            >
              How it works
            </a>

            <a
              href="#why-want"
              className="transition hover:text-white"
            >
              Why WANT
            </a>

          </nav>

          <div className="flex items-center gap-3">

            {user && (
              <a
                href="/dashboard"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                My Wants
              </a>
            )}

            {loadingUser ? (
              <div className="text-sm text-white/30">
                Loading...
              </div>
            ) : !user ? (
              <button
                onClick={
                  signInWithGoogle
                }
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 transition hover:bg-white/10"
              >
                Sign in
              </button>
            ) : (
              <div className="flex items-center gap-3">

                <div className="hidden text-right sm:block">

                  <div className="text-sm font-medium">
                    {displayName}
                  </div>

                  <div className="text-xs text-white/35">
                    Signed in
                  </div>

                </div>

                {avatar ? (
                  <img
                    src={
                      avatar
                    }
                    alt="Profile"
                    className="h-10 w-10 rounded-full border border-white/10"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
                    {displayName
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <button
                  onClick={
                    signOut
                  }
                  className="hidden rounded-full border border-white/10 px-4 py-2 text-xs text-white/50 transition hover:bg-white/10 hover:text-white sm:block"
                >
                  Sign out
                </button>

              </div>
            )}

          </div>

        </div>

      </header>

      {/* HERO */}

      <section className="mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center justify-center px-6 py-24 text-center md:px-10">

        <div className="mb-7 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.15em] text-white/50">
          Your personal price watcher
        </div>

        <h1 className="max-w-5xl text-5xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-7xl md:text-8xl">
          Stop checking prices.
          <br />

          <span className="text-white/35">
            WANT watches them for you.
          </span>
        </h1>

        <p className="mt-8 max-w-2xl text-base leading-7 text-white/45 md:text-lg">
          Tell WANT what you want and how much you&apos;re
          willing to pay. We find current offers, track your
          target and keep watching while you get on with your
          day.
        </p>

        <div className="mt-12 w-full max-w-3xl">

          <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-3 shadow-2xl">

            <textarea
              value={
                want
              }
              onChange={(
                e
              ) =>
                setWant(
                  e.target.value
                )
              }
              onKeyDown={(
                e
              ) => {
                if (
                  e.key ===
                    "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();

                  searchWant();
                }
              }}
              placeholder="I want an RTX 5070 under €550..."
              className="min-h-[130px] w-full resize-none bg-transparent px-5 py-5 text-lg text-white outline-none placeholder:text-white/20"
            />

            <div className="flex flex-col gap-3 border-t border-white/10 px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">

              <span className="px-2 text-left text-xs text-white/25">
                Describe it naturally. WANT handles the rest.
              </span>

              <button
                disabled={
                  !want.trim()
                }
                onClick={
                  searchWant
                }
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-25"
              >
                Find it for me →
              </button>

            </div>

          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">

            {suggestions.map(
              (
                item
              ) => (
                <button
                  key={
                    item
                  }
                  onClick={() =>
                    setWant(
                      item
                    )
                  }
                  className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-xs text-white/40 transition hover:border-white/25 hover:text-white"
                >
                  {item}
                </button>
              )
            )}

          </div>

        </div>

        <div className="mt-16 text-xs text-white/25">
          Search once. Set your price. Let WANT keep watching.
        </div>

      </section>

      {/* POPULAR PRODUCTS */}

      <section
        id="popular-products"
        className="border-t border-white/[0.06]"
      >
        <div className="mx-auto max-w-7xl px-6 py-28 md:px-10">

          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">

            <div>

              <div className="text-xs uppercase tracking-[0.18em] text-white/30">
                Popular products
              </div>

              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
                See what people
                <br />

                <span className="text-white/35">
                  are waiting to buy.
                </span>
              </h2>

            </div>

            <p className="max-w-md leading-7 text-white/40">
              Compare current prices, check available offers
              and create your own target price for products
              people are watching right now.
            </p>

          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {popularProducts.map(
              (
                product
              ) => (
                <a
                  key={
                    product.slug
                  }
                  href={`/products/${product.slug}`}
                  className="group rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-7 transition hover:border-white/20 hover:bg-white/[0.045]"
                >

                  <div className="flex items-start justify-between gap-6">

                    <div>

                      <div className="text-xs uppercase tracking-[0.15em] text-white/25">
                        {product.category}
                      </div>

                      <h3 className="mt-4 text-2xl font-medium tracking-tight">
                        {product.name}
                      </h3>

                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/35 transition group-hover:border-white/25 group-hover:text-white">
                      →
                    </div>

                  </div>

                  <p className="mt-10 text-sm leading-6 text-white/35">
                    Compare current offers and set the price
                    you&apos;re willing to pay.
                  </p>

                  <div className="mt-6 text-sm text-white/25 transition group-hover:text-white/60">
                    Open price tracker
                  </div>

                </a>
              )
            )}

          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}

      <section
        id="how-it-works"
        className="border-t border-white/[0.06]"
      >
        <div className="mx-auto max-w-7xl px-6 py-28 md:px-10">

          <div className="max-w-2xl">

            <div className="text-xs uppercase tracking-[0.18em] text-white/30">
              How it works
            </div>

            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
              One request.
              <br />

              <span className="text-white/35">
                Then WANT does the checking.
              </span>
            </h2>

          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-3">

            <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-8">

              <div className="text-sm text-white/25">
                01
              </div>

              <h3 className="mt-10 text-xl font-medium">
                Tell us what you want
              </h3>

              <p className="mt-4 leading-7 text-white/40">
                Write naturally. Tell WANT the product and
                the maximum price you&apos;re willing to pay.
              </p>

            </div>

            <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-8">

              <div className="text-sm text-white/25">
                02
              </div>

              <h3 className="mt-10 text-xl font-medium">
                We check the market
              </h3>

              <p className="mt-4 leading-7 text-white/40">
                WANT compares available offers and records
                the best prices it finds for your request.
              </p>

            </div>

            <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-8">

              <div className="text-sm text-white/25">
                03
              </div>

              <h3 className="mt-10 text-xl font-medium">
                Your target stays active
              </h3>

              <p className="mt-4 leading-7 text-white/40">
                Save the WANT and let the system keep checking
                instead of repeating the same search yourself.
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* EXAMPLES */}

      <section className="border-t border-white/[0.06]">

        <div className="mx-auto max-w-7xl px-6 py-28 md:px-10">

          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">

            <div>

              <div className="text-xs uppercase tracking-[0.18em] text-white/30">
                Set your price
              </div>

              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
                Buy on your terms.
              </h2>

            </div>

            <p className="max-w-md leading-7 text-white/40">
              Instead of asking whether today&apos;s price is
              good, decide what the product is worth to you.
            </p>

          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">

            {examples.map(
              (
                example
              ) => (
                <button
                  key={
                    example.product
                  }
                  onClick={() =>
                    useExample(
                      `${example.product} under ${example.target}`
                    )
                  }
                  className="group rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-7 text-left transition hover:border-white/20 hover:bg-white/[0.04]"
                >

                  <div className="text-sm text-white/30">
                    Target
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-5">

                    <div>

                      <div className="text-xl font-medium">
                        {example.product}
                      </div>

                      <div className="mt-2 text-sm text-white/35">
                        {example.description}
                      </div>

                    </div>

                    <div className="text-3xl font-semibold tracking-tight">
                      {example.target}
                    </div>

                  </div>

                  <div className="mt-8 text-sm text-white/25 transition group-hover:text-white/60">
                    Try this WANT →
                  </div>

                </button>
              )
            )}

          </div>

        </div>
      </section>

      {/* WHY WANT */}

      <section
        id="why-want"
        className="border-t border-white/[0.06]"
      >
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-28 md:grid-cols-2 md:px-10">

          <div>

            <div className="text-xs uppercase tracking-[0.18em] text-white/30">
              Why WANT
            </div>

            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
              Search engines find products.
              <br />

              <span className="text-white/35">
                WANT remembers what you want.
              </span>
            </h2>

          </div>

          <div className="space-y-8 md:pt-12">

            <div className="border-b border-white/[0.07] pb-8">

              <h3 className="text-lg font-medium">
                Your price, not theirs.
              </h3>

              <p className="mt-3 leading-7 text-white/40">
                Set the price you&apos;re comfortable paying
                instead of endlessly checking whether a sale
                is really a good deal.
              </p>

            </div>

            <div className="border-b border-white/[0.07] pb-8">

              <h3 className="text-lg font-medium">
                One place for everything you&apos;re waiting for.
              </h3>

              <p className="mt-3 leading-7 text-white/40">
                Keep active buying targets together in My Wants
                and see the latest price we&apos;ve recorded.
              </p>

            </div>

            <div>

              <h3 className="text-lg font-medium">
                Less searching. Better timing.
              </h3>

              <p className="mt-3 leading-7 text-white/40">
                WANT is built around a simple idea: you
                shouldn&apos;t have to repeat the same product
                search every day.
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* FINAL CTA */}

      <section className="border-t border-white/[0.06]">

        <div className="mx-auto max-w-7xl px-6 py-32 text-center md:px-10">

          <div className="text-xs uppercase tracking-[0.18em] text-white/30">
            Your next purchase
          </div>

          <h2 className="mx-auto mt-6 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.05em] md:text-7xl">
            What are you waiting
            <br />

            <span className="text-white/35">
              to buy?
            </span>
          </h2>

          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="mt-10 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:scale-[1.03]"
          >
            Create a WANT →
          </button>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="border-t border-white/[0.06]">

        <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">

          <div className="flex flex-col justify-between gap-10 md:flex-row">

            <div>

              <div className="text-xl font-semibold tracking-[-0.04em]">
                WANT
              </div>

              <p className="mt-3 max-w-sm text-sm leading-6 text-white/30">
                A smarter way to keep track of the things you
                want to buy and the price you want to pay.
              </p>

            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm text-white/35">

              <a
                href="/about"
                className="transition hover:text-white"
              >
                About
              </a>

              <a
                href="/privacy"
                className="transition hover:text-white"
              >
                Privacy
              </a>

              <a
                href="/cookies"
                className="transition hover:text-white"
              >
                Cookies
              </a>

              <a
                href="/terms"
                className="transition hover:text-white"
              >
                Terms
              </a>

            </div>

          </div>

          <div className="mt-10 flex flex-col justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-white/20 sm:flex-row">

            <span>
              © 2026 WANT
            </span>

            <span>
              Prices and availability may change after they are
              displayed.
            </span>

          </div>

        </div>

      </footer>

    </main>
  );
}