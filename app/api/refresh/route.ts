import {
  NextRequest,
  NextResponse,
} from "next/server";

import { supabaseServer } from "@/lib/supabase-server";
import { searchAllProviders } from "@/lib/providers";

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

async function runRefresh() {
  try {
    const {
      data: wants,
      error,
    } = await supabaseServer
      .from("wants")
      .select(
        `
        id,
        product,
        target_price,
        best_price,
        status
        `
      )
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
        reachedTargets: 0,
        results: [],
      });
    }

    let updated = 0;
    let reachedTargets = 0;

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
            id: want.id,
            product:
              want.product,
            status:
              "no_offers",
          });

          continue;
        }

        const bestOffer =
          offers[0];

        const reachedTarget =
          want.target_price !==
            null &&
          bestOffer.price <=
            Number(
              want.target_price
            );

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

              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              want.id
            );

        if (updateError) {
          results.push({
            id: want.id,
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

        if (reachedTarget) {
          reachedTargets++;
        }

        results.push({
          id: want.id,

          product:
            want.product,

          status:
            "updated",

          bestPrice:
            bestOffer.price,

          targetPrice:
            want.target_price,

          reachedTarget,

          title:
            bestOffer.title,

          store:
            bestOffer.store,

          url:
            bestOffer.url,
        });
      } catch (error) {
        results.push({
          id: want.id,

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

      reachedTargets,

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
  if (!isAuthorized(request)) {
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
  if (!isAuthorized(request)) {
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