// lib/shopify.ts
// OAuth Shopify sans base de données.
// Le shop et l'accessToken sont stockés dans un cookie chiffré.

import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";
import { cookies } from "next/headers";

export const shopify = shopifyApi({
  apiKey:       process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: [
    "read_orders",
    "write_orders",
    "read_payment_customizations",
    "write_payment_customizations",
  ],
  hostName:       process.env.SHOPIFY_APP_URL!.replace(/https?:\/\//, ""),
  apiVersion:     LATEST_API_VERSION,
  isEmbeddedApp:  false,
});

/** Lit le shop depuis le cookie de session (stocké après OAuth) */
export function getShopFromCookie(): string {
  const jar = cookies();
  return jar.get("lfd_shop")?.value || "";
}

/** Lit la clé API LFD depuis les variables d'env.
 *  En prod, chaque marchand a sa clé stockée dans votre plateforme.
 *  Ici on la lit depuis SHOPIFY_LFD_API_KEY (config globale)
 *  ou depuis le query param `apiKey` passé lors de l'install.
 */
export function getLFDApiKey(shopApiKey?: string): string {
  return shopApiKey || process.env.LFD_API_KEY || "";
}
