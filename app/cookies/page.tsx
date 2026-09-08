export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">
        <header className="flex items-center justify-between">
          <a
            href="/"
            className="text-xl font-semibold tracking-[-0.04em]"
          >
            WANT
          </a>

          <a
            href="/"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            Back home
          </a>
        </header>

        <article className="py-24">
          <div className="text-xs uppercase tracking-[0.18em] text-white/30">
            Legal
          </div>

          <h1 className="mt-5 text-5xl font-semibold tracking-[-0.05em] md:text-7xl">
            Cookie Policy
          </h1>

          <p className="mt-6 text-sm text-white/30">
            Last updated: September 2026
          </p>

          <div className="mt-16 space-y-12 text-[15px] leading-8 text-white/45">
            <section>
              <h2 className="text-xl font-medium text-white">
                What are cookies?
              </h2>

              <p className="mt-4">
                Cookies and similar technologies are small
                pieces of information stored or accessed by a
                website to support functionality such as
                authentication, security and user preferences.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                Essential functionality
              </h2>

              <p className="mt-4">
                WANT may use technologies necessary to keep
                users authenticated, protect sessions and
                provide core account functionality. These
                technologies are required for features such as
                signing in and accessing My Wants.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                Analytics and advertising
              </h2>

              <p className="mt-4">
                WANT does not currently describe optional
                advertising or behavioural tracking cookies in
                this policy because those systems have not yet
                been added to the MVP.
              </p>

              <p className="mt-4">
                If analytics, advertising or other optional
                tracking technologies are introduced, this
                policy and the site&apos;s consent controls
                will be updated accordingly before relying on
                them where consent is required.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                Third-party services
              </h2>

              <p className="mt-4">
                Third-party services used by WANT may use their
                own technical storage or session mechanisms when
                necessary to provide authentication, hosting or
                other service functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                Managing cookies
              </h2>

              <p className="mt-4">
                Most browsers allow users to inspect, delete or
                block cookies. Blocking essential storage may
                prevent sign-in or other account features from
                operating correctly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                Future updates
              </h2>

              <p className="mt-4">
                Before public launch, WANT will verify the
                cookies and similar technologies actually used
                in production and update this page and any
                consent interface where necessary.
              </p>
            </section>
          </div>
        </article>

        <footer className="flex flex-col justify-between gap-4 border-t border-white/[0.06] py-8 text-xs text-white/25 sm:flex-row">
          <span>© 2026 WANT</span>

          <div className="flex gap-5">
            <a href="/about" className="hover:text-white">
              About
            </a>

            <a href="/privacy" className="hover:text-white">
              Privacy
            </a>

            <a href="/terms" className="hover:text-white">
              Terms
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}