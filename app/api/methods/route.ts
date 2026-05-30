// app/api/methods/route.ts
// Proxy public vers paymentgateway.lfdweb.com/api/gateway/methods/:country
// Pas de clé API requise — endpoint public LFD.

import { NextRequest, NextResponse } from "next/server";
import { lfdMethods } from "@/lib/lfd";

export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country") || "bj";
  try {
    const data = await lfdMethods(country);
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control":               "public, max-age=300",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
