// app/api/webhook/route.ts
// Reçoit les webhooks de paymentgateway.lfdweb.com
// et les forward vers votre plateforme via PLATFORM_WEBHOOK_URL.
//
// ⚙️  Variables d'env requises :
//   PLATFORM_WEBHOOK_URL = URL de votre backend LFD pour recevoir les events
//   PLATFORM_WEBHOOK_SECRET = Secret optionnel pour authentifier les appels
//
// Si vous préférez traiter les webhooks directement sur paymentgateway.lfdweb.com,
// vous n'avez pas besoin de ce fichier du tout — configurez le webhook
// directement avec l'URL de votre plateforme dans LFD Dashboard.

import { NextRequest, NextResponse } from "next/server";
import { parseWebhook } from "@/lib/lfd";

export async function POST(req: NextRequest) {
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { isSuccess, isFailed, transactionId, reference, amount, method, provider } =
    parseWebhook(payload);

  console.log("[LFD Webhook]", { isSuccess, isFailed, transactionId, reference, amount });

  if (!isSuccess && !isFailed) {
    return NextResponse.json({ received: true, status: "ignored" });
  }

  // ─── Option A : Forward vers votre plateforme ────────────────────────────
  // Si votre plateforme a déjà un endpoint webhook, on lui transmet l'event.
  const platformUrl = process.env.PLATFORM_WEBHOOK_URL;
  if (platformUrl) {
    try {
      await fetch(platformUrl, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.PLATFORM_WEBHOOK_SECRET
            ? { "x-webhook-secret": process.env.PLATFORM_WEBHOOK_SECRET }
            : {}),
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8_000),
      });
    } catch (err) {
      console.error("[LFD Webhook] Forward échoué :", err);
      // On retourne quand même 200 à LFD pour éviter les retries
    }
  }
  // ─── Option B : Votre logique métier ici ─────────────────────────────────
  // Si vous voulez traiter directement ici (sans forward) :
  //
  // if (isSuccess) {
  //   // Appel API votre plateforme pour valider la commande transactionId
  //   await fetch(`https://votre-plateforme.com/api/orders/${transactionId}/confirm`, {
  //     method: "POST",
  //     headers: { "Authorization": `Bearer ${process.env.PLATFORM_API_KEY}` },
  //   });
  // }
  // ─────────────────────────────────────────────────────────────────────────

  return NextResponse.json({
    received:      true,
    status:        isSuccess ? "success" : "failed",
    transactionId,
    reference,
  });
}

// Health check
export async function GET() {
  return NextResponse.json({ status: "ok", gateway: "lfd-payment-shopify" });
}
