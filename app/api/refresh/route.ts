import {
  NextRequest,
  NextResponse,
} from "next/server";

import { Resend } from "resend";

import { supabaseServer } from "@/lib/supabase-server";
import { searchAllProviders } from "@/lib/providers";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

function isAuthorized(
  request: NextRequest
) {
  const authHeader =
    request.headers.get(
      "authorization"
    );

  return (
    authHeader ===
    `Bearer ${process.env.CRON_SECRET}`
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
}) {
  const { error } =
    await resend.emails.send({
      from: "WANT <onboarding@resend.dev>",

      to: email,

      subject: `🔥 ${product} reached your target`,

      html: `
        <div
          style="
            background:#050505;
            color:#ffffff;
            font-family:Arial,Helvetica,sans-serif;
            padding:40px;
          "
        >
          <div
            style="
              max-width:600px;
              margin:auto;
            "
          >
            <div
              style="
                font-size:22px;
                font-weight:700;
                margin-bottom:40px;
              "
            >
              WANT
            </div>

            <div
              style="
                color:#9ca3af;
                font-size:12px;
                text-transform:uppercase;
                letter-spacing:2px;
                margin-bottom:12px;
              "
            >
              Target reached
            </div>

            <h1
              style="
                font-size:34px;
                margin:0 0 16px 0;
              "
            >
              ${product}
            </h1>

            <p
              style="
                color:#9ca3af;
                font-size:16px;
                line-height:1.6;
              "
            >
              WANT found an offer at or below the price you were waiting for.
            </p>

            <div
              style="
                margin-top:32px;
                padding:24px;
                border:1px solid #262626;
                border-radius:18px;
              "
            >
              <div
                style="
                  color:#737373;
                  font-size:13px;
                "
              >
                Best price
              </div>

              <div
                style="
                  font-size:36px;
                  font-weight:700;
                  margin-top:6px;
                "
              >
                €${price.toFixed(2)}
              </div>

              <div
                style="
                  color:#737373;
                  margin-top:8px;
                  font-size:14px;
                "
              >
                Your target: €${targetPrice.toFixed(2)}
              </div>

              <div
                style="
                  color:#737373;
                  margin-top:4px;
                  font-size:14px;
                "
              >
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

            <p
              style="
                color:#525252;
                font-size:12px;
                margin-top:40px;
              "
            >
              WANT — The internet searches. You decide.
            </p>
          </div>
        </div>
      `,
    });

  if (error) {
    throw new Error(
      error.message ||
        "Could not send email."
    );
  }
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
        const offers =
          await searchAllProviders(
            want.product
          );

        if (
          offers.length === 0
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

        const bestOffer =
          offers[0];

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

        const checkedAt =
          new Date().toISOString();

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
                checkedAt,

              updated_at:
                checkedAt,
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
                checkedAt,
            });

        if (historyError) {
          console.error(
            `PRICE HISTORY ERROR for WANT ${want.id}:`,
            historyError
          );
        } else {
          historyInserted++;
        }

        let emailSent = false;
        let notificationsEnabled = false;

        const {
          data: profile,
          error: profileError,
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

        if (profileError) {
          console.error(
            `PROFILE SETTINGS ERROR for ${want.user_id}:`,
            profileError
          );
        }

        notificationsEnabled =
          profile?.email_notifications ===
          true;

        const lastNotifiedPrice =
          want.last_notified_price !==
          null
            ? Number(
                want.last_notified_price
              )
            : null;

        const shouldNotify =
          notificationsEnabled &&
          reachedTarget &&
          (
            lastNotifiedPrice ===
              null ||
            bestOffer.price <
              lastNotifiedPrice
          );

        if (shouldNotify) {
          const {
            data: userData,
            error: userError,
          } =
            await supabaseServer
              .auth
              .admin
              .getUserById(
                want.user_id
              );

          if (userError) {
            console.error(
              `USER LOOKUP ERROR for ${want.user_id}:`,
              userError
            );
          }

          if (
            !userError &&
            userData.user?.email
          ) {
            await sendTargetEmail({
              email:
                userData.user.email,

              product:
                want.product,

              price:
                bestOffer.price,

              targetPrice:
                targetPrice!,

              store:
                bestOffer.store,

              url:
                bestOffer.url,
            });

            const {
              error:
                notificationUpdateError,
            } =
              await supabaseServer
                .from("wants")
                .update({
                  last_notified_price:
                    bestOffer.price,

                  last_notified_at:
                    new Date().toISOString(),
                })
                .eq(
                  "id",
                  want.id
                );

            if (
              notificationUpdateError
            ) {
              console.error(
                `NOTIFICATION UPDATE ERROR for WANT ${want.id}:`,
                notificationUpdateError
              );
            } else {
              notified++;
              emailSent = true;
            }
          }
        }

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
            checkedAt,

          historySaved:
            !historyError,
        });
      } catch (error) {
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
    !isAuthorized(request)
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
    !isAuthorized(request)
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