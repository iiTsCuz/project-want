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

export default function Home() {
  const [want, setWant] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoadingUser(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      alert("Login error: " + error.message);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  function searchWant() {
    if (!want.trim()) return;

    window.location.href = `/search?q=${encodeURIComponent(want.trim())}`;
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const avatar = user?.user_metadata?.avatar_url;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-7 md:px-10">
        <header className="flex items-center justify-between">
          <a href="/" className="text-xl font-semibold tracking-[-0.04em]">
            WANT
          </a>

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
              <div className="text-sm text-white/30">Loading...</div>
            ) : !user ? (
              <button
                onClick={signInWithGoogle}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 transition hover:bg-white/10"
              >
                Sign in
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-medium">{displayName}</div>
                  <div className="text-xs text-white/35">Signed in</div>
                </div>

                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile"
                    className="h-10 w-10 rounded-full border border-white/10"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                <button
                  onClick={signOut}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/50 transition hover:bg-white/10 hover:text-white"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center py-20 text-center">
          <div className="mb-7 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.15em] text-white/50">
            Your AI buying agent
          </div>

          <h1 className="max-w-5xl text-5xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-7xl md:text-8xl">
            Stop searching.
            <br />
            <span className="text-white/40">
              Tell us what you want.
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-base leading-7 text-white/45 md:text-lg">
            Tell WANT what you&apos;re looking for and your target price.
            We search the internet until we find the right deal.
          </p>

          <div className="mt-12 w-full max-w-3xl">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-3 shadow-2xl">
              <textarea
                value={want}
                onChange={(e) => setWant(e.target.value)}
                placeholder="I want an RTX 5070 under €550..."
                className="min-h-[130px] w-full resize-none bg-transparent px-5 py-5 text-lg text-white outline-none placeholder:text-white/20"
              />

              <div className="flex flex-col gap-3 border-t border-white/10 px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="px-2 text-left text-xs text-white/25">
                  Describe it naturally. WANT handles the rest.
                </span>

                <button
                  disabled={!want.trim()}
                  onClick={searchWant}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-25"
                >
                  Find it for me →
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {suggestions.map((item) => (
                <button
                  key={item}
                  onClick={() => setWant(item)}
                  className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-xs text-white/40 transition hover:border-white/25 hover:text-white"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-16 flex items-center gap-3 text-xs text-white/25">
            <div className="flex">
              <div className="h-6 w-6 rounded-full border border-black bg-white/20" />
              <div className="-ml-2 h-6 w-6 rounded-full border border-black bg-white/30" />
              <div className="-ml-2 h-6 w-6 rounded-full border border-black bg-white/40" />
            </div>

            <span>The internet searches. You decide.</span>
          </div>
        </section>

        <footer className="flex items-center justify-between border-t border-white/[0.06] pt-5 text-xs text-white/20">
          <span>© 2026 WANT</span>
          <span>Built for people who hate searching.</span>
        </footer>
      </div>
    </main>
  );
}