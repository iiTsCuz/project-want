import {
  NextRequest,
  NextResponse,
} from "next/server";

import { Resend } from "resend";

import { supabaseServer } from "@/lib/supabase-server";
import { searchAllProviders } from "@/lib/providers";

function isAuthorized(
  request: NextRequest
) {
  const cronSecret =
    process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error(
      "CRON_SECRET is missing."
    );

    return false;
  }

  const authHeader =
    request.headers.get(
      "authorization"
    );

  return (
    authHeader ===
    `Bearer ${cronSecret}`
  );
}

async function sendTargetEmail({
  email,
  product,
  price,
  targetPrice,
  store,
  url,
}: {
  email: string;
  product: string;
  price: number;
  targetPrice: number;
  store: string;
  url: string;
}): Promise<boolean> {
  /*
   * IMPORTANTE:
   *
   * Resend viene inizializzato SOLO quando
   * dobbiamo realmente inviare un'email.
   *
   * In questo modo Vercel può compilare
   * /api/refresh anche se la variabile non
   * viene valutata durante la fase di build.
   */
  const resendApiKey =
    process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.error(
      "RESEND_API_KEY is missing. Email skipped."
    );

    return false;
  }

  const resend =
    new Resend(
      resendApiKey
    );

  const { error } =
    await resend.emails.send({
      from:
        "WANTPILOT <onboarding@resend.dev>",

      to:
        email,

      subject:
        `🔥 ${product} reached your target`,

      html: `
        <div style="
          background:#050505;
          color:#ffffff;
          font-family:Arial,Helvetica,sans-serif;
          padding:40px;
        ">
          <div style="
            max-width:600px;
            margin:auto;
          ">

            <div style="
              font-size:22px;
              font-weight:700;
              margin-bottom:40px;
            ">
              WANTPILOT
            </div>

            <div style="
              color:#9ca3af;
              font-size:12px;
              text-transform:uppercase;
              letter-spacing:2px;
              margin-bottom:12px;
            ">
              Target reached
            </div>

            <h1 style="
              font-size:34px;
              margin:0 0 16px 0;
            ">
              ${product}
            </h1>

            <p style="
              color:#9ca3af;
              font-size:16px;
              line-height:1.6;
            ">
              WANTPILOT found an offer at or below the price you were waiting for.
            </p>

            <div style="
              margin-top:32px;
              padding:24px;
              border:1px solid #262626;
              border-radius:18px;
            ">

              <div style="
                color:#737373;
                font-size:13px;
              ">
                Best price
              </div>

              <div style="
                font-size:36px;
                font-weight:700;
                margin-top:6px;
              ">
                €${price.toFixed(2)}
              </div>

              <div style="
                color:#737373;
                margin-top:8px;
                font-size:14px;
              ">
                Your target: €${targetPrice.toFixed(2)}
              </div>

              <div style="
                color:#737373;
                margin-top:4px;
                font-size:14px;
              ">
                Store: ${store}
              </div>

            </div>

            <a
              href="${url}"
              style="
                display:inline-block;
                background:#ffffff;
                color:#000000;
                text-decoration:none;
                font-weight:700;
                padding:14px 22px;
                border-radius:999px;
                margin-top:28px;
              "
            >
              View deal →
            </a>

            <p style="
              color:#525252;
              font-size:12px;
              margin-top:40px;
            ">
              WANTPILOT — Stop checking prices. We watch them for you.
            </p>

          </div>
        </div>
      `,
    });

  if (error) {
    console.error(
      "RESEND EMAIL ERROR:",
      error
    );

    return false;
  }

  return true;
}

async function runRefresh() {
  try {
    const {
      data: wants,
      error,
    } = await supabaseServer
      .from("wants")
      .select(`
        id,
        user_id,
        product,
        target_price,
        best_price,
        status,
        last_notified_price,
        last_notified_at
      `)
      .eq(
        "status",
        "active"
      );

    if (error) {
      return NextResponse.json(
        {
          error:
            error.message,
        },
        {
          status: 500,
        }
      );
    }

    if (
      !wants ||
      wants.length === 0
    ) {
      return NextResponse.json({
        checked: 0,
        updated: 0,
        notified: 0,
        historyInserted: 0,
        results: [],
      });
    }

    let updated = 0;
    let notified = 0;
    let historyInserted = 0;

    const results = [];

    for (const want of wants) {
      try {
        /*
         * CERCA OFFERTE
         */
        const offers =
          await searchAllProviders(
            want.product
          );

        if (
          offers.length ===
          0
        ) {
          results.push({
            id:
              want.id,

            product:
              want.product,

            status:
              "no_offers",
          });

          continue;
        }

        /*
         * I provider restituiscono già
         * normalmente i risultati ordinati,
         * ma ordiniamo di nuovo per sicurezza.
         */
        const bestOffer =
          [...offers].sort(
            (
              a,
              b
            ) =>
              a.price -
              b.price
          )[0];

        const targetPrice =
          want.target_price !==
          null
            ? Number(
                want.target_price
              )
            : null;

        const reachedTarget =
          targetPrice !== null &&
          bestOffer.price <=
            targetPrice;

        const now =
          new Date().toISOString();

        /*
         * AGGIORNA WANT
         */
        const {
          error:
            updateError,
        } =
          await supabaseServer
            .from("wants")
            .update({
              best_price:
                bestOffer.price,

              best_offer_title:
                bestOffer.title,

              best_offer_store:
                bestOffer.store,

              best_offer_url:
                bestOffer.url,

              last_checked_at:
                now,

              updated_at:
                now,
            })
            .eq(
              "id",
              want.id
            );

        if (updateError) {
          results.push({
            id:
              want.id,

            product:
              want.product,

            status:
              "update_failed",

            error:
              updateError.message,
          });

          continue;
        }

        updated++;

        /*
         * SALVA STORICO PREZZO
         */
        let historySaved =
          false;

        const {
          error:
            historyError,
        } =
          await supabaseServer
            .from(
              "want_price_history"
            )
            .insert({
              want_id:
                want.id,

              price:
                bestOffer.price,

              store:
                bestOffer.store,

              offer_title:
                bestOffer.title,

              offer_url:
                bestOffer.url,

              checked_at:
                now,
            });

        if (historyError) {
          console.error(
            `PRICE HISTORY ERROR (${want.id}):`,
            historyError
          );
        } else {
          historyInserted++;
          historySaved = true;
        }

        /*
         * PREFERENZE EMAIL
         */
        let emailSent =
          false;

        let notificationsEnabled =
          true;

        const {
          data: profile,
          error:
            profileError,
        } =
          await supabaseServer
            .from("profiles")
            .select(
              "email_notifications"
            )
            .eq(
              "id",
              want.user_id
            )
            .maybeSingle();

        if (
          !profileError &&
          profile
        ) {
          notificationsEnabled =
            profile.email_notifications !==
            false;
        }

        const lastNotifiedPrice =
          want.last_notified_price !==
          null
            ? Number(
                want.last_notified_price
              )
            : null;

        /*
         * Inviamo l'alert:
         *
         * - se le notifiche sono abilitate
         * - se il target è stato raggiunto
         * - se non abbiamo mai notificato
         *   oppure il prezzo è ancora sceso
         */
        const shouldNotify =
          notificationsEnabled &&
          reachedTarget &&
          (
            lastNotifiedPrice ===
              null ||
            bestOffer.price <
              lastNotifiedPrice
          );

        if (
          shouldNotify &&
          targetPrice !==
            null
        ) {
          const {
            data:
              userData,
            error:
              userError,
          } =
            await supabaseServer
              .auth
              .admin
              .getUserById(
                want.user_id
              );

          if (
            userError
          ) {
            console.error(
              `USER EMAIL ERROR (${want.id}):`,
              userError
            );
          }

          const email =
            userData.user
              ?.email;

          if (email) {
            const sent =
              await sendTargetEmail({
                email,

                product:
                  want.product,

                price:
                  bestOffer.price,

                targetPrice,

                store:
                  bestOffer.store,

                url:
                  bestOffer.url,
              });

            /*
             * Segniamo come notificato
             * SOLTANTO se Resend ha
             * realmente inviato l'email.
             */
            if (sent) {
              const {
                error:
                  notificationUpdateError,
              } =
                await supabaseServer
                  .from(
                    "wants"
                  )
                  .update({
                    last_notified_price:
                      bestOffer.price,

                    last_notified_at:
                      now,
                  })
                  .eq(
                    "id",
                    want.id
                  );

              if (
                notificationUpdateError
              ) {
                console.error(
                  `NOTIFICATION UPDATE ERROR (${want.id}):`,
                  notificationUpdateError
                );
              } else {
                notified++;
                emailSent =
                  true;
              }
            }
          }
        }

        /*
         * RISULTATO DEBUG/API
         */
        results.push({
          id:
            want.id,

          product:
            want.product,

          status:
            "updated",

          bestPrice:
            bestOffer.price,

          targetPrice,

          reachedTarget,

          notificationsEnabled,

          emailSent,

          store:
            bestOffer.store,

          title:
            bestOffer.title,

          lastCheckedAt:
            now,

          historySaved,
        });
      } catch (error) {
        console.error(
          `REFRESH WANT ERROR (${want.id}):`,
          error
        );

        results.push({
          id:
            want.id,

          product:
            want.product,

          status:
            "search_failed",

          error:
            error instanceof Error
              ? error.message
              : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      checked:
        wants.length,

      updated,

      notified,

      historyInserted,

      results,
    });
  } catch (error) {
    console.error(
      "REFRESH ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Refresh failed.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(
  request: NextRequest
) {
  if (
    !isAuthorized(
      request
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  return runRefresh();
}

export async function POST(
  request: NextRequest
) {
  if (
    !isAuthorized(
      request
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  return runRefresh();
}