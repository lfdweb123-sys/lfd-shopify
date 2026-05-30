# LFD Payment Gateway — Shopify App

Plugin Shopify pour **paymentgateway.lfdweb.com** · Zéro base de données.

## Architecture

```
Shopify → Cette app (Next.js / Vercel)
               │
               ├── /api/generate  ──► paymentgateway.lfdweb.com/api/gateway/generate-link
               ├── /api/methods   ──► paymentgateway.lfdweb.com/api/gateway/methods/:country
               ├── /api/webhook   ◄── paymentgateway.lfdweb.com (webhook LFD)
               └── /dashboard     ──► Interface admin
```

Votre plateforme LFD gère tout — cette app est juste un pont.

---

## Déploiement Vercel (3 min)

### 1. Déployer

```bash
npm install
npx vercel --prod
# → https://lfd-shopify-xxx.vercel.app
```

### 2. Variables d'environnement sur Vercel

| Variable | Valeur |
|---|---|
| `SHOPIFY_API_KEY` | partners.shopify.com → votre app → Credentials |
| `SHOPIFY_API_SECRET` | idem |
| `SHOPIFY_APP_URL` | `https://lfd-shopify-xxx.vercel.app` |

### 3. Shopify Partner Dashboard

- **URL app** : `https://lfd-shopify-xxx.vercel.app`
- **URL redirection** : `https://lfd-shopify-xxx.vercel.app/api/auth/callback`
- **Scopes** : `read_orders,write_orders,read_payment_customizations,write_payment_customizations`

### 4. LFD Dashboard → Developer → Webhooks

```
URL        : https://lfd-shopify-xxx.vercel.app/api/webhook
Événements : payment.completed, payment.failed
```

⚠️ Le hostname du webhook DOIT correspondre à `SHOPIFY_APP_URL`.

---

## Endpoints

| Route | Description |
|---|---|
| `GET /` | Redirect OAuth si `?shop=` présent |
| `GET /api/auth?shop=` | Démarre OAuth Shopify |
| `GET /api/auth/callback` | Callback OAuth |
| `POST /api/generate` | Génère un lien LFD |
| `GET /api/methods?country=bj` | Méthodes de paiement disponibles |
| `POST /api/webhook` | Reçoit les webhooks LFD |
| `GET /dashboard?shop=` | Interface admin |
