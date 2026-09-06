"use client";

import { useEffect, useState } from "react";
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
  created_at: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [wants, setWants] = useState<Want[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("wants")
        .select(
          "id, original_query, product, target_price, currency, condition, status, best_price, created_at"
        )
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setWants(data);
      }

      setLoading(false);
    }

    loadDashboard();
  }, []);

  async function deactivateWant(id: string) {
    setMessage("");

    const { error } = await supabase
      .from("wants")
      .update({ status: "inactive" })
      .eq("id", id);

    if (error) {
      setMessage("Could not deactivate this WANT.");
      return;
    }

    setWants((current) =>
      current.map((want) =>
        want.id === id ? { ...want, status: "inactive" } : want
      )
    );

    setMessage("WANT paused.");
  }

  async function reactivateWant(id: string) {
    setMessage("");

    const { error } = await supabase
      .from("wants")
      .update({ status: "active" })
      .eq("id", id);

    if (error) {
      setMessage("Could not reactivate this WANT.");
      return;
    }

    setWants((current) =>
      current.map((want) =>
        want.id === id ? { ...want, status: "active" } : want
      )
    );

    setMessage("WANT reactivated.");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="text-white/40">Loading your WANTs...</div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <a href="/" className="text-xl font-semibold">
            WANT
          </a>

          <div className="mt-20 max-w-xl">
            <h1 className="text-4xl font-semibold">
              Sign in to see your WANTs.
            </h1>

            <p className="mt-4 text-white/40">
              Your active buying targets will appear here.
            </p>

            <a
              href="/"
              className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-black"
            >
              Go home
            </a>
          </div>
        </div>
      </main>
    );
  }

  const activeCount = wants.filter((want) => want.status === "active").length;

  const reachedCount = wants.filter(
    (want) =>
      want.best_price !== null &&
      want.target_price !== null &&
      want.best_price <= want.target_price
  ).length;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-xl font-semibold tracking-tight">
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
              {user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email}
            </div>

            <div className="text-xs text-white/35">
              {activeCount} active WANT{activeCount === 1 ? "" : "s"}
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
            WANT keeps your buying targets in one place and tracks them over time.
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
          <div className="mt-6 text-sm text-white/50">
            {message}
          </div>
        )}

        <section className="mt-8">
          <div className="grid gap-4">
            {wants.map((want) => {
              const reached =
                want.best_price !== null &&
                want.target_price !== null &&
                want.best_price <= want.target_price;

              const searchUrl = `/search?q=${encodeURIComponent(
                want.original_query
              )}`;

              return (
                <div
                  key={want.id}
                  className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <a
                          href={searchUrl}
                          className="text-xl font-semibold transition hover:text-white/70"
                        >
                          {want.product}
                        </a>

                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            want.status === "active"
                              ? "bg-green-400/10 text-green-400"
                              : "bg-white/5 text-white/35"
                          }`}
                        >
                          {want.status}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-6 text-sm">
                        <div>
                          <div className="text-white/30">Target</div>

                          <div className="mt-1 font-medium">
                            {want.target_price !== null
                              ? `€${Number(want.target_price).toFixed(2)}`
                              : "None"}
                          </div>
                        </div>

                        <div>
                          <div className="text-white/30">Best found</div>

                          <div
                            className={`mt-1 font-medium ${
                              reached ? "text-green-400" : ""
                            }`}
                          >
                            {want.best_price !== null
                              ? `€${Number(want.best_price).toFixed(2)}`
                              : "Searching..."}
                          </div>
                        </div>

                        <div>
                          <div className="text-white/30">Condition</div>

                          <div className="mt-1 font-medium capitalize">
                            {want.condition}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href={searchUrl}
                        className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
                      >
                        View offers
                      </a>

                      {want.status === "active" ? (
                        <button
                          onClick={() => deactivateWant(want.id)}
                          className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/50 transition hover:bg-white/10 hover:text-white"
                        >
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => reactivateWant(want.id)}
                          className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
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