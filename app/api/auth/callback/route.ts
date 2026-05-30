// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const shop = searchParams.get("shop") || "";
  const code = searchParams.get("code") || "";

  if (!shop || !code) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  // Échange le code contre un access token
  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id:     process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }),
  });

  const { access_token } = await tokenRes.json();

  // Redirige vers le dashboard — on passe shop en cookie
  const res = NextResponse.redirect(
    `${process.env.SHOPIFY_APP_URL}/dashboard?shop=${shop}`
  );

  // Cookie simple (httpOnly, 30 jours)
  res.cookies.set("lfd_shop", shop, {
    httpOnly: true,
    secure:   true,
    sameSite: "lax",
    maxAge:   60 * 60 * 24 * 30,
    path:     "/",
  });

  // On ne stocke pas l'access_token — votre plateforme LFD gère les marchands
  return res;
}
