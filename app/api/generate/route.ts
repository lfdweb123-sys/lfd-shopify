// app/api/generate/route.ts
// Génère un lien de paiement LFD pour une commande Shopify.
// Aucune base de données — tout passe par paymentgateway.lfdweb.com

import { NextRequest, NextResponse } from "next/server";
import { lfdGenerateLink } from "@/lib/lfd";

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    apiKey:       string;  // Clé API LFD du marchand (fournie par votre plateforme)
    amount:       number;
    description:  string;
    country?:     string;
    method?:      string;
    transactionId: string; // ID commande Shopify ou autre référence
  };

  if (!body.apiKey?.startsWith("gw_")) {
    return NextResponse.json({ error: "Clé API LFD invalide" }, { status: 400 });
  }
  if (!body.amount || !body.transactionId) {
    return NextResponse.json({ error: "amount et transactionId requis" }, { status: 400 });
  }

  try {
    const result = await lfdGenerateLink({
      apiKey:        body.apiKey,
      amount:        body.amount,
      description:   body.description || `Commande Shopify`,
      country:       body.country || "bj",
      method:        body.method,
      transactionId: body.transactionId,
      appUrl:        process.env.SHOPIFY_APP_URL!,
    });

    return NextResponse.json(result, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
