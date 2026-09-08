export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-5xl px-6 py-8 md:px-10">
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

        <section className="py-24 md:py-32">
          <div className="text-xs uppercase tracking-[0.18em] text-white/30">
            About WANT
          </div>

          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.05em] md:text-7xl">
            Buying something shouldn&apos;t require
            <span className="text-white/35">
              {" "}checking the same price every day.
            </span>
          </h1>

          <p className="mt-10 max-w-2xl text-lg leading-8 text-white/45">
            WANT is a price-monitoring service built around a
            simple idea: tell us what you want to buy and the
            price you&apos;re willing to pay. WANT keeps track
            of the request so you don&apos;t have to repeat the
            same search again and again.
          </p>
        </section>

        <section className="grid gap-4 border-t border-white/[0.06] py-20 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-7">
            <div className="text-sm text-white/25">01</div>

            <h2 className="mt-8 text-xl font-medium">
              You set the target
            </h2>

            <p className="mt-3 leading-7 text-white/40">
              Instead of letting a sale decide when you buy,
              you choose the maximum price that makes sense
              for you.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-7">
            <div className="text-sm text-white/25">02</div>

            <h2 className="mt-8 text-xl font-medium">
              WANT monitors it
            </h2>

            <p className="mt-3 leading-7 text-white/40">
              We compare available product offers and record
              the prices associated with active WANTs.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-7">
            <div className="text-sm text-white/25">03</div>

            <h2 className="mt-8 text-xl font-medium">
              You decide when to buy
            </h2>

            <p className="mt-3 leading-7 text-white/40">
              When a qualifying price is found, WANT can
              notify you. The final purchase decision always
              remains yours.
            </p>
          </div>
        </section>

        <section className="border-t border-white/[0.06] py-20">
          <div className="grid gap-12 md:grid-cols-2">
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              WANT is not a store.
            </h2>

            <div className="space-y-5 leading-7 text-white/40">
              <p>
                WANT does not currently sell the products
                displayed on the platform. Product offers are
                provided by third-party retailers and shopping
                data sources.
              </p>

              <p>
                Prices, availability, shipping costs and product
                information can change after WANT has checked
                them. Always verify the final details on the
                retailer&apos;s website before purchasing.
              </p>

              <p>
                In the future, some outbound links may be
                affiliate links. If that happens, WANT may
                receive a commission when a qualifying purchase
                is made, without increasing the price paid by
                the user.
              </p>
            </div>
          </div>
        </section>

        <footer className="flex flex-col justify-between gap-4 border-t border-white/[0.06] py-8 text-xs text-white/25 sm:flex-row">
          <span>© 2026 WANT</span>

          <div className="flex gap-5">
            <a href="/privacy" className="hover:text-white">
              Privacy
            </a>

            <a href="/cookies" className="hover:text-white">
              Cookies
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