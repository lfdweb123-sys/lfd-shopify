// lib/lfd.ts
const BASE = "https://paymentgateway.lfdweb.com/api/gateway";

export async function lfdGenerateLink(opts: {
  apiKey: string;
  amount: number;
  description: string;
  country?: string;
  method?: string;
  transactionId: string;
  appUrl: string;
}) {
  const res = await fetch(`${BASE}/generate-link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": opts.apiKey,
    },
    body: JSON.stringify({
      amount:      opts.amount,
      description: opts.description,
      country:     opts.country || "bj",
      ...(opts.method ? { method: opts.method } : {}),
      origin:      opts.appUrl,
      sendWebhook: true,
      metadata: {
        transactionId: opts.transactionId,
        origin:        opts.appUrl,
        sendWebhook:   true,
      },
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LFD Gateway ${res.status}: ${err}`);
  }

  return res.json() as Promise<{ success: boolean; url: string; pid: string }>;
}

export async function lfdMethods(country = "bj") {
  const res = await fetch(`${BASE}/methods/${country}`, {
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error(`LFD methods ${res.status}`);
  return res.json();
}

export async function lfdVerify(apiKey: string, id: string) {
  const res = await fetch(`${BASE}/verify/${id}`, {
    headers: { "x-api-key": apiKey },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`LFD verify ${res.status}`);
  return res.json();
}

export function parseWebhook(payload: any) {
  const tx    = payload?.transaction ?? {};
  const event = payload?.event ?? "";
  const raw   = (tx?.status || event || "").toLowerCase();

  return {
    isSuccess:     ["successful","success","completed","paid","payment.completed"].includes(raw),
    isFailed:      ["failed","failure","cancelled","rejected","payment.failed"].includes(raw),
    transactionId: (tx?.metadata?.transactionId ?? null) as string | null,
    reference:     ((tx?.reference || tx?.id) ?? null) as string | null,
    amount:        (tx?.amount ?? null) as number | null,
    method:        (tx?.method ?? null) as string | null,
    provider:      (tx?.provider ?? null) as string | null,
    payload:       tx,
  };
}