import {
  NextRequest,
  NextResponse,
} from "next/server";

type ShoppingResult = {
  title?: string;
  source?: string;
  extracted_price?: number;
  immersive_product_page_token?: string;
};

type ShoppingResponse = {
  shopping_results?: ShoppingResult[];
  error?: string;
};

type Seller = {
  name?: string;
  link?: string;
  direct_link?: string;
  base_price?: string;
  total_price?: string;
};

type ImmersiveResponse = {
  sellers_results?: {
    online_sellers?: Seller[];
  };
  error?: string;
};

export async function GET(
  request: NextRequest
) {
  const apiKey =
    process.env.SERPAPI_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "SERPAPI_KEY is missing.",
      },
      {
        status: 500,
      }
    );
  }

  const { searchParams } =
    new URL(request.url);

  const q =
    searchParams.get("q")?.trim() ||
    "RTX 5070";

  try {
    /*
     * 1) Prima ricerca normale Google Shopping
     */
    const shoppingParams =
      new URLSearchParams({
        engine:
          "google_shopping",
        q,
        api_key:
          apiKey,
        gl:
          "it",
        hl:
          "it",
        location:
          "Italy",
      });

    const shoppingResponse =
      await fetch(
        `https://serpapi.com/search.json?${shoppingParams.toString()}`,
        {
          cache:
            "no-store",
        }
      );

    if (!shoppingResponse.ok) {
      return NextResponse.json(
        {
          error:
            "Shopping request failed.",
          status:
            shoppingResponse.status,
        },
        {
          status: 500,
        }
      );
    }

    const shoppingData: ShoppingResponse =
      await shoppingResponse.json();

    if (shoppingData.error) {
      return NextResponse.json(
        {
          error:
            shoppingData.error,
        },
        {
          status: 500,
        }
      );
    }

    const firstOffer =
      shoppingData.shopping_results?.[0];

    if (!firstOffer) {
      return NextResponse.json(
        {
          error:
            "No shopping results found.",
        },
        {
          status: 404,
        }
      );
    }

    const token =
      firstOffer.immersive_product_page_token;

    if (!token) {
      return NextResponse.json(
        {
          error:
            "First result has no immersive token.",
          firstOffer,
        },
        {
          status: 404,
        }
      );
    }

    /*
     * 2) Risoluzione prodotto / seller
     */
    const immersiveParams =
      new URLSearchParams({
        engine:
          "google_immersive_product",
        page_token:
          token,
        api_key:
          apiKey,
        more_stores:
          "true",
      });

    const immersiveResponse =
      await fetch(
        `https://serpapi.com/search.json?${immersiveParams.toString()}`,
        {
          cache:
            "no-store",
        }
      );

    if (!immersiveResponse.ok) {
      return NextResponse.json(
        {
          error:
            "Immersive request failed.",
          status:
            immersiveResponse.status,
        },
        {
          status: 500,
        }
      );
    }

    const immersiveData: ImmersiveResponse =
      await immersiveResponse.json();

    if (immersiveData.error) {
      return NextResponse.json(
        {
          error:
            immersiveData.error,
        },
        {
          status: 500,
        }
      );
    }

    const sellers =
      immersiveData.sellers_results
        ?.online_sellers ??
      [];

    return NextResponse.json({
      query:
        q,

      firstOffer: {
        title:
          firstOffer.title ??
          null,

        source:
          firstOffer.source ??
          null,

        price:
          firstOffer.extracted_price ??
          null,
      },

      sellerCount:
        sellers.length,

      sellers:
        sellers.map(
          (
            seller,
            index
          ) => ({
            index,

            name:
              seller.name ??
              null,

            basePrice:
              seller.base_price ??
              null,

            totalPrice:
              seller.total_price ??
              null,

            link:
              seller.link ??
              null,

            directLink:
              seller.direct_link ??
              null,
          })
        ),
    });
  } catch (error) {
    console.error(
      "RESOLVE TEST ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Resolve test failed.",
      },
      {
        status: 500,
      }
    );
  }
}