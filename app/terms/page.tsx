export default function TermsPage() {
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
            Terms of Use
          </h1>

          <p className="mt-6 text-sm text-white/30">
            Last updated: September 2026
          </p>

          <div className="mt-16 space-y-12 text-[15px] leading-8 text-white/45">
            <section>
              <h2 className="text-xl font-medium text-white">
                1. The WANT service
              </h2>

              <p className="mt-4">
                WANT is a product discovery and price-monitoring
                service. Users can submit product requests,
                specify target prices and save monitoring
                requests known as WANTs.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                2. WANT is not the retailer
              </h2>

              <p className="mt-4">
                Unless explicitly stated otherwise, WANT does
                not sell, fulfil or ship the products displayed
                on the service.
              </p>

              <p className="mt-4">
                Purchases are completed on third-party retailer
                websites and are subject to the retailer&apos;s
                own terms, pricing, delivery conditions,
                warranties and return policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                3. Prices and availability
              </h2>

              <p className="mt-4">
                WANT attempts to provide useful and current
                product information, but prices and availability
                can change at any time.
              </p>

              <p className="mt-4">
                The price shown by the retailer at the time of
                purchase is the price that applies. Users should
                verify the product, seller, total price,
                shipping and other conditions before completing
                a purchase.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                4. Price alerts
              </h2>

              <p className="mt-4">
                Price alerts are provided as a convenience.
                WANT does not guarantee that every price change
                will be detected, that an offer will remain
                available after an alert or that a product will
                reach a user&apos;s target price.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                5. Accounts
              </h2>

              <p className="mt-4">
                Users are responsible for the activity associated
                with their account and for maintaining control
                over access to the authentication method used
                to sign in.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                6. Acceptable use
              </h2>

              <p className="mt-4">
                Users must not attempt to interfere with the
                service, bypass security controls, abuse
                automated endpoints, overload infrastructure or
                use WANT in a way that violates applicable law
                or third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                7. Third-party websites
              </h2>

              <p className="mt-4">
                WANT may link to external retailers and other
                third-party websites. WANT is not responsible
                for the content, availability, security or
                business practices of those websites.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                8. Affiliate disclosure
              </h2>

              <p className="mt-4">
                WANT may participate in affiliate programmes.
                When affiliate links are used, WANT may receive
                compensation if a user makes a qualifying
                purchase after following one of those links.
              </p>

              <p className="mt-4">
                Affiliate relationships do not guarantee that a
                particular retailer will be shown as the best
                offer.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                9. Service changes
              </h2>

              <p className="mt-4">
                WANT may change, add, remove or discontinue
                features as the service evolves.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                10. Contact and legal information
              </h2>

              <p className="mt-4">
                Complete operator identity, legal contact
                information and any additional mandatory
                disclosures will be added before the public
                commercial launch of WANT.
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

            <a href="/cookies" className="hover:text-white">
              Cookies
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}