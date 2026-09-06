import { NextRequest, NextResponse } from "next/server";
import { searchAllProviders } from "@/lib/providers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json(
      { error: "Missing search query." },
      { status: 400 }
    );
  }

  try {
    const offers = await searchAllProviders(q);

    return NextResponse.json({
      query: q,
      count: offers.length,
      offers,
    });
  } catch {
    return NextResponse.json(
      { error: "Search failed." },
      { status: 500 }
    );
  }
}