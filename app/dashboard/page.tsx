"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

type Want = {
  id: string;
  original_query: string;
  product: string;
  target_price: number | null;
  currency: string;
  condition: string;
  status: string;
  best_price: number | null;
  best_offer_title: string | null;
  best_offer_store: string | null;
  best_offer_url: string | null;
  created_at: string;
  updated_at: string | null;
};

export default function DashboardPage() {
  const [user, setUser] =
    useState<User | null>(null);

  const [wants, setWants] =
    useState<Want[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState<
      "success" | "error" | "info"
    >("info");

  const [
    actionLoadingId,
    setActionLoadingId,
  ] = useState<string | null>(
    null
  );

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      const currentUser =
        session?.user ?? null;

      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("wants")
        .select(`
          id,
          original_query,
          product,
          target_price,
          currency,
          condition,
          status,
          best_price,
          best_offer_title,
          best_offer_store,
          best_offer_url,
          created_at,
          updated_at
        `)
        .eq(
          "user_id",
          currentUser.id
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (error) {
        console.error(
          "DASHBOARD ERROR:",
          error
        );

        setMessageType(
          "error"
        );

        setMessage(
          "Could not load your WANTs."
        );
      }

      if (
        !error &&
        data
      ) {
        setWants(
          data as Want[]
        );
      }

      setLoading(false);
    }

    loadDashboard();
  }, []);

  function showMessage(
    type:
      | "success"
      | "error"
      | "info",
    text: string
  ) {
    setMessageType(type);
    setMessage(text);
  }

  async function pauseWant(
    id: string
  ) {
    setActionLoadingId(id);
    setMessage("");

    const { error } =
      await supabase
        .from("wants")
        .update({
          status:
            "inactive",

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          id
        );

    if (error) {
      showMessage(
        "error",
        "Could not pause this WANT."
      );

      setActionLoadingId(null);
      return;
    }

    setWants(
      (current) =>
        current.map(
          (want) =>
            want.id === id
              ? {
                  ...want,
                  status:
                    "inactive",
                }
              : want
        )
    );

    showMessage(
      "success",
      "WANT paused."
    );

    setActionLoadingId(null);
  }

  async function reactivateWant(
    id: string
  ) {
    setActionLoadingId(id);
    setMessage("");

    const { error } =
      await supabase
        .from("wants")
        .update({
          status:
            "active",

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          id
        );

    if (error) {
      showMessage(
        "error",
        "Could not reactivate this WANT."
      );

      setActionLoadingId(null);
      return;
    }

    setWants(
      (current) =>
        current.map(
          (want) =>
            want.id === id
              ? {
                  ...want,
                  status:
                    "active",
                }
              : want
        )
    );

    showMessage(
      "success",
      "WANT reactivated."
    );

    setActionLoadingId(null);
  }

  async function deleteWant(
    want: Want
  ) {
    const confirmed =
      window.confirm(
        `Delete "${want.product}"?\n\nThis will permanently remove this WANT and stop all future price checks.`
      );

    if (!confirmed) {
      return;
    }

    setActionLoadingId(
      want.id
    );

    setMessage("");

    const { error } =
      await supabase
        .from("wants")
        .delete()
        .eq(
          "id",
          want.id
        );

    if (error) {
      console.error(
        "DELETE WANT ERROR:",
        error
      );

      showMessage(
        "error",
        "Could not delete this WANT."
      );

      setActionLoadingId(null);
      return;
    }

    setWants(
      (current) =>
        current.filter(
          (item) =>
            item.id !==
            want.id
        )
    );

    showMessage(
      "success",
      `${want.product} deleted.`
    );

    setActionLoadingId(null);
  }

  const activeCount =
    useMemo(
      () =>
        wants.filter(
          (want) =>
            want.status ===
            "active"
        ).length,
      [wants]
    );

  const reachedCount =
    useMemo(
      () =>
        wants.filter(
          (want) =>
            want.best_price !==
              null &&
            want.target_price !==
              null &&
            Number(
              want.best_price
            ) <=
              Number(
                want.target_price
              )
        ).length,
      [wants]
    );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
          <div className="text-sm text-white/40">
            Loading your WANTs...
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">

          <a
            href="/"
            className="text-xl font-semibold"
          >
            WANT
          </a>

          <div className="mt-20 max-w-xl">

            <div className="text-xs uppercase tracking-[0.18em] text-white/30">
              My WANTs
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
              Sign in to see your WANTs.
            </h1>

            <p className="mt-5 text-lg text-white/40">
              Your active buying targets will appear here.
            </p>

            <a
              href="/"
              className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Go home →
            </a>

          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">

        <header className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <a
              href="/"
              className="text-xl font-semibold tracking-tight"
            >
              WANT
            </a>

            <a
              href="/dashboard"
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white"
            >
              My Wants
            </a>

          </div>

          <div className="text-right">

            <div className="text-sm font-medium">

              {user.user_metadata
                ?.full_name ||
                user.user_metadata
                  ?.name ||
                user.email}

            </div>

            <div className="text-xs text-white/35">

              {activeCount} active WANT
              {activeCount === 1
                ? ""
                : "s"}

            </div>

          </div>

        </header>

        <section className="mt-16">

          <div className="text-xs uppercase tracking-[0.18em] text-white/30">
            My WANTs
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
            What you&apos;re waiting for.
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-white/40">
            WANT tracks your buying targets, updates prices automatically and keeps the best deal ready for you.
          </p>

        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

            <div className="text-xs uppercase tracking-widest text-white/25">
              Total WANTs
            </div>

            <div className="mt-4 text-3xl font-semibold">
              {wants.length}
            </div>

          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

            <div className="text-xs uppercase tracking-widest text-white/25">
              Active
            </div>

            <div className="mt-4 text-3xl font-semibold">
              {activeCount}
            </div>

          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

            <div className="text-xs uppercase tracking-widest text-white/25">
              Reached target
            </div>

            <div className="mt-4 text-3xl font-semibold">
              {reachedCount}
            </div>

          </div>

        </section>

        {message && (
          <div
            className={`mt-6 rounded-2xl border px-5 py-4 text-sm ${
              messageType ===
              "success"
                ? "border-green-500/15 bg-green-500/5 text-green-400"
                : messageType ===
                  "error"
                ? "border-red-500/15 bg-red-500/5 text-red-400"
                : "border-white/10 bg-white/[0.02] text-white/50"
            }`}
          >
            {message}
          </div>
        )}

        <section className="mt-8">

          {wants.length ===
            0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-10 text-center">

              <div className="text-xl font-medium">
                No WANTs yet.
              </div>

              <p className="mt-2 text-sm text-white/35">
                Search for something and activate your first WANT.
              </p>

              <a
                href="/"
                className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
              >
                Find something →
              </a>

            </div>
          )}

          <div className="grid gap-5">

            {wants.map(
              (want) => {

                const reached =
                  want.best_price !==
                    null &&
                  want.target_price !==
                    null &&
                  Number(
                    want.best_price
                  ) <=
                    Number(
                      want.target_price
                    );

                const searchUrl =
                  `/search?q=${encodeURIComponent(
                    want.original_query
                  )}`;

                const busy =
                  actionLoadingId ===
                  want.id;

                return (
                  <article
                    key={
                      want.id
                    }
                    className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-6 md:p-7"
                  >

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-3">

                          <a
                            href={
                              searchUrl
                            }
                            className="text-xl font-semibold transition hover:text-white/70"
                          >
                            {
                              want.product
                            }
                          </a>

                          <span
                            className={`rounded-full px-3 py-1 text-xs ${
                              want.status ===
                              "active"
                                ? "bg-green-400/10 text-green-400"
                                : "bg-white/5 text-white/35"
                            }`}
                          >
                            {
                              want.status
                            }
                          </span>

                          {reached && (
                            <span className="rounded-full bg-green-400/10 px-3 py-1 text-xs text-green-400">
                              Target reached
                            </span>
                          )}

                        </div>

                        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4 text-sm">

                          <div>

                            <div className="text-white/30">
                              Target
                            </div>

                            <div className="mt-1 font-medium">

                              {want.target_price !==
                              null
                                ? `€${Number(
                                    want.target_price
                                  ).toFixed(
                                    2
                                  )}`
                                : "None"}

                            </div>

                          </div>

                          <div>

                            <div className="text-white/30">
                              Best found
                            </div>

                            <div
                              className={`mt-1 font-medium ${
                                reached
                                  ? "text-green-400"
                                  : ""
                              }`}
                            >

                              {want.best_price !==
                              null
                                ? `€${Number(
                                    want.best_price
                                  ).toFixed(
                                    2
                                  )}`
                                : "Searching..."}

                            </div>

                          </div>

                          <div>

                            <div className="text-white/30">
                              Condition
                            </div>

                            <div className="mt-1 font-medium capitalize">
                              {
                                want.condition
                              }
                            </div>

                          </div>

                          <div>

                            <div className="text-white/30">
                              Monitoring
                            </div>

                            <div className="mt-1 font-medium">
                              {want.status ===
                              "active"
                                ? "On"
                                : "Paused"}
                            </div>

                          </div>

                        </div>

                        {want.best_offer_title && (
                          <div className="mt-6 rounded-2xl border border-white/[0.07] bg-black/20 p-5">

                            <div className="text-xs uppercase tracking-[0.15em] text-white/25">
                              Best offer
                            </div>

                            <div className="mt-3 text-base font-medium">
                              {
                                want.best_offer_title
                              }
                            </div>

                            {want.best_offer_store && (
                              <div className="mt-1 text-sm text-white/35">
                                {
                                  want.best_offer_store
                                }
                              </div>
                            )}

                            <div className="mt-4 flex flex-wrap items-center gap-3">

                              {want.best_offer_url && (
                                <a
                                  href={
                                    want.best_offer_url
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:scale-[1.02]"
                                >
                                  View deal →
                                </a>
                              )}

                              <a
                                href={
                                  searchUrl
                                }
                                className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
                              >
                                Compare offers
                              </a>

                            </div>

                          </div>
                        )}

                      </div>

                      <div className="flex shrink-0 flex-wrap gap-3">

                        {!want.best_offer_title && (
                          <a
                            href={
                              searchUrl
                            }
                            className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
                          >
                            View offers
                          </a>
                        )}

                        {want.status ===
                        "active" ? (
                          <button
                            onClick={() =>
                              pauseWant(
                                want.id
                              )
                            }
                            disabled={
                              busy
                            }
                            className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/50 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {busy
                              ? "..."
                              : "Pause"}
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              reactivateWant(
                                want.id
                              )
                            }
                            disabled={
                              busy
                            }
                            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {busy
                              ? "..."
                              : "Reactivate"}
                          </button>
                        )}

                        <button
                          onClick={() =>
                            deleteWant(
                              want
                            )
                          }
                          disabled={
                            busy
                          }
                          className="rounded-full border border-red-500/15 px-5 py-2.5 text-sm text-red-400/70 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {busy
                            ? "..."
                            : "Delete"}
                        </button>

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </div>

        </section>

      </div>

    </main>
  );
}