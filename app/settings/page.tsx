"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | "info"
  >("info");

  useEffect(() => {
    async function loadSettings() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email_notifications")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileError) {
        setMessageType("error");
        setMessage("Could not load your settings.");
        setLoading(false);
        return;
      }

      if (!profile) {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: currentUser.id,
            email: currentUser.email,
            email_notifications: true,
          });

        if (insertError) {
          setMessageType("error");
          setMessage("Could not create your settings profile.");
          setLoading(false);
          return;
        }

        setEmailNotifications(true);
      } else {
        setEmailNotifications(profile.email_notifications ?? true);
      }

      setLoading(false);
    }

    loadSettings();
  }, []);

  async function saveSettings() {
    if (!user) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      email_notifications: emailNotifications,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setMessageType("error");
      setMessage("Could not save settings.");
      setSaving(false);
      return;
    }

    setMessageType("success");
    setMessage("Settings saved.");
    setSaving(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "User";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
          <div className="text-sm text-white/40">
            Loading settings...
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
          <a
            href="/"
            className="text-xl font-semibold tracking-tight"
          >
            WANT
          </a>

          <section className="mt-20 max-w-xl">
            <div className="text-xs uppercase tracking-[0.18em] text-white/30">
              Account
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
              Sign in to manage settings.
            </h1>

            <p className="mt-4 text-lg text-white/40">
              Manage notifications and your WANT account.
            </p>

            <a
              href="/"
              className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-black"
            >
              Go home →
            </a>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
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
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              My Wants
            </a>

            <a
              href="/settings"
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white"
            >
              Settings
            </a>
          </div>

          <div className="text-right">
            <div className="text-sm font-medium">
              {displayName}
            </div>

            <div className="text-xs text-white/35">
              Account
            </div>
          </div>
        </header>

        <section className="mt-16">
          <div className="text-xs uppercase tracking-[0.18em] text-white/30">
            Account
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
            Settings
          </h1>

          <p className="mt-4 text-lg text-white/40">
            Manage how WANT tracks products and notifies you.
          </p>
        </section>

        <section className="mt-10 grid gap-5">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs uppercase tracking-widest text-white/25">
              Account
            </div>

            <div className="mt-4 text-lg font-medium">
              {displayName}
            </div>

            <div className="mt-1 text-sm text-white/35">
              {user.email}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between gap-8">
              <div>
                <div className="text-lg font-medium">
                  Email notifications
                </div>

                <div className="mt-1 max-w-xl text-sm leading-6 text-white/35">
                  Receive an email when an active WANT reaches your target
                  price or finds a new lower price after a previous alert.
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEmailNotifications((current) => !current)
                }
                className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                  emailNotifications
                    ? "bg-green-400"
                    : "bg-white/10"
                }`}
                aria-pressed={emailNotifications}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-black transition-all ${
                    emailNotifications
                      ? "left-7"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="mt-4 text-xs text-white/25">
              Status:{" "}
              <span
                className={
                  emailNotifications
                    ? "text-green-400"
                    : "text-white/40"
                }
              >
                {emailNotifications ? "On" : "Off"}
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs uppercase tracking-widest text-white/25">
              Monitoring
            </div>

            <div className="mt-4 text-lg font-medium">
              Daily automatic checks
            </div>

            <div className="mt-1 text-sm leading-6 text-white/35">
              WANT currently checks every active target once per day in the
              cloud, even when your computer is off.
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs uppercase tracking-widest text-white/25">
              Price alerts
            </div>

            <div className="mt-4 text-lg font-medium">
              Smart anti-spam alerts
            </div>

            <div className="mt-1 text-sm leading-6 text-white/35">
              After an alert is sent, WANT will not send the same price again.
              A new notification is sent only when it finds an even lower
              qualifying price.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving
                ? "Saving..."
                : "Save settings"}
            </button>

            <button
              onClick={signOut}
              className="rounded-full border border-white/10 px-6 py-3 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              Sign out
            </button>
          </div>

          {message && (
            <div
              className={`rounded-2xl border px-5 py-4 text-sm ${
                messageType === "success"
                  ? "border-green-500/15 bg-green-500/5 text-green-400"
                  : messageType === "error"
                  ? "border-red-500/15 bg-red-500/5 text-red-400"
                  : "border-white/10 bg-white/[0.02] text-white/50"
              }`}
            >
              {message}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}