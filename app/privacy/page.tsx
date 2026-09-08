export default function PrivacyPage() {
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
            Privacy Policy
          </h1>

          <p className="mt-6 text-sm text-white/30">
            Last updated: September 2026
          </p>

          <div className="mt-16 space-y-12 text-[15px] leading-8 text-white/45">
            <section>
              <h2 className="text-xl font-medium text-white">
                1. About this policy
              </h2>

              <p className="mt-4">
                This Privacy Policy explains how WANT processes
                information when you use the website, create an
                account, save product-monitoring requests or use
                notification features.
              </p>

              <p className="mt-4">
                Before public commercial launch, this section
                will be updated with the complete identity and
                contact details of the data controller.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                2. Information we may process
              </h2>

              <p className="mt-4">
                Depending on how you use WANT, information may
                include your account identifier, email address,
                profile information supplied through Google
                authentication, saved WANTs, product queries,
                target prices, notification preferences and
                technical information required to provide the
                service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                3. Authentication
              </h2>

              <p className="mt-4">
                WANT currently supports authentication through
                Google using Supabase authentication services.
                Authentication providers may process information
                according to their own privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                4. Product monitoring
              </h2>

              <p className="mt-4">
                When you activate a WANT, we may store the
                product requested, your target price, current
                price information, retailer information, price
                history and timestamps relating to monitoring
                activity.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                5. Notifications
              </h2>

              <p className="mt-4">
                If email notifications are enabled, WANT may
                use your account email address to send price
                alerts. Email delivery is currently provided
                through Resend.
              </p>

              <p className="mt-4">
                You can disable price-alert emails from the
                Settings page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                6. Service providers
              </h2>

              <p className="mt-4">
                WANT currently relies on third-party
                infrastructure and services including Supabase
                for database and authentication functionality,
                Vercel for hosting and server execution, Resend
                for transactional email and SerpApi for shopping
                search data.
              </p>

              <p className="mt-4">
                These providers may process technical data as
                necessary to provide their respective services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                7. Why information is used
              </h2>

              <p className="mt-4">
                Information is used to operate WANT, authenticate
                users, save and manage WANTs, perform product
                monitoring, maintain price history, send
                requested notifications, prevent abuse and
                improve reliability of the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                8. Retention
              </h2>

              <p className="mt-4">
                Information is retained for as long as needed
                to provide the service, maintain an account or
                meet applicable legal and operational
                requirements. Users can delete individual WANTs
                from their dashboard.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                9. Your choices
              </h2>

              <p className="mt-4">
                Users can pause or delete WANTs, disable email
                notifications and sign out of their account.
                Additional account-management and data-rights
                functionality may be introduced before public
                launch.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white">
                10. Changes
              </h2>

              <p className="mt-4">
                This policy may be updated as WANT evolves,
                particularly when new analytics, advertising,
                affiliate or payment functionality is added.
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