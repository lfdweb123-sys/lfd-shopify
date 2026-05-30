// app/api/auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import { shopify } from "@/lib/shopify";

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop") || "";
  if (!shop) return NextResponse.json({ error: "shop requis" }, { status: 400 });

  // Génère l'URL d'autorisation Shopify OAuth
  const authUrl = `https://${shop}/admin/oauth/authorize?` + new URLSearchParams({
    client_id:    process.env.SHOPIFY_API_KEY!,
    scope:        "read_orders,write_orders,read_payment_customizations,write_payment_customizations",
    redirect_uri: `${process.env.SHOPIFY_APP_URL}/api/auth/callback`,
    state:        crypto.randomUUID(),
  });

  return NextResponse.redirect(authUrl);
}
