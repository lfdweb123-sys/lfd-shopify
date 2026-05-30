"use client";
import { useEffect, useState } from "react";

const ORANGE = "#FF6B00";
const DARK   = "#0f0f1a";
const CARD   = "#16162a";
const BORDER = "#2a2a42";

const COUNTRIES = [
  { code: "bj", flag: "🇧🇯", name: "Bénin"        },
  { code: "tg", flag: "🇹🇬", name: "Togo"         },
  { code: "sn", flag: "🇸🇳", name: "Sénégal"      },
  { code: "ci", flag: "🇨🇮", name: "Côte d'Ivoire" },
  { code: "cm", flag: "🇨🇲", name: "Cameroun"     },
  { code: "gn", flag: "🇬🇳", name: "Guinée"       },
];

type Method = { id: string; name: string };

export default function Dashboard() {
  const [shop,   setShop]   = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  // Test paiement
  const [testAmount,  setTestAmount]  = useState("5000");
  const [testDesc,    setTestDesc]    = useState("Commande test Shopify");
  const [testCountry, setTestCountry] = useState("bj");
  const [testMethod,  setTestMethod]  = useState("");
  const [methods,     setMethods]     = useState<Method[]>([]);
  const [loadMethods, setLoadMethods] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testUrl,     setTestUrl]     = useState("");
  const [testError,   setTestError]   = useState("");

  const [msg, setMsg] = useState<{ type: "ok"|"err"; text: string } | null>(null);
  const [tab, setTab] = useState<"config"|"test"|"integration">("config");

  // Charge le shop depuis le query param
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("shop") || "";
    setShop(s);
    // Récupère la clé API sauvegardée (localStorage côté marchand uniquement)
    const saved = localStorage.getItem(`lfd_apikey_${s}`);
    if (saved) setApiKey(saved);
  }, []);

  // Charge les méthodes quand le pays change
  useEffect(() => {
    setLoadMethods(true);
    setTestMethod("");
    fetch(`/api/methods?country=${testCountry}`)
      .then(r => r.json())
      .then(d => { setMethods(d.methods || []); setTestMethod(d.methods?.[0]?.id || ""); })
      .catch(() => setMethods([]))
      .finally(() => setLoadMethods(false));
  }, [testCountry]);

  const saveApiKey = () => {
    if (!apiKey.startsWith("gw_")) {
      setMsg({ type: "err", text: "La clé doit commencer par 'gw_'" });
      return;
    }
    localStorage.setItem(`lfd_apikey_${shop}`, apiKey);
    setMsg({ type: "ok", text: "Clé API sauvegardée localement ✓" });
    setTimeout(() => setMsg(null), 3000);
  };

  const testPayment = async () => {
    if (!apiKey.startsWith("gw_")) {
      setTestError("Entrez votre clé API dans l'onglet Configuration.");
      return;
    }
    setTestLoading(true);
    setTestUrl("");
    setTestError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          amount:        parseInt(testAmount),
          description:   testDesc,
          country:       testCountry,
          method:        testMethod || undefined,
          transactionId: `shopify-test-${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (data.error) { setTestError(data.error); return; }
      setTestUrl(data.url);
    } catch (e: any) {
      setTestError(e.message);
    } finally {
      setTestLoading(false);
    }
  };

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const webhookUrl = `${appUrl}/api/webhook`;

  const inp = (style?: any): React.CSSProperties => ({
    width: "100%", padding: "12px 16px", background: DARK,
    border: `1px solid ${BORDER}`, borderRadius: 10, color: "#e2e2f0",
    fontSize: 14, boxSizing: "border-box", outline: "none", ...style,
  });

  const btn = (style?: any): React.CSSProperties => ({
    padding: "12px 24px", borderRadius: 10, border: "none",
    fontWeight: 700, fontSize: 14, cursor: "pointer",
    transition: "opacity 0.15s", ...style,
  });

  return (
    <div style={{ minHeight: "100vh", background: DARK, color: "#e2e2f0", fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* Navbar */}
      <div style={{ background: CARD, borderBottom: `1px solid ${BORDER}`, padding: "0 32px", display: "flex", alignItems: "center", gap: 16, height: 64 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>💳</div>
        <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>LFD Payment Gateway</span>
        <span style={{ color: "#555", fontSize: 20 }}>×</span>
        <span style={{ fontWeight: 600, color: "#888" }}>Shopify</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          {shop && <span style={{ fontSize: 13, color: "#666", fontFamily: "monospace" }}>{shop}</span>}
          <span style={{ background: apiKey.startsWith("gw_") ? "#14532d" : "#451a03", color: apiKey.startsWith("gw_") ? "#4ade80" : "#fb923c", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
            {apiKey.startsWith("gw_") ? "✓ Configuré" : "⚠ Non configuré"}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

        {/* Hero */}
        <div style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, #c94f00 55%, #1a0830 100%)`, borderRadius: 20, padding: "36px 44px", marginBottom: 32, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
            Passerelle de paiement Mobile Money
          </h1>
          <p style={{ margin: "0 0 20px", color: "rgba(255,255,255,0.75)", fontSize: 15 }}>
            Connecté à <strong>paymentgateway.lfdweb.com</strong> · MTN · Moov · Orange · Celtiis · 40+ providers
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {COUNTRIES.map(c => (
              <span key={c.code} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", padding: "4px 12px", borderRadius: 99, fontSize: 13 }}>
                {c.flag} {c.name}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, background: CARD, borderRadius: 12, padding: 4, border: `1px solid ${BORDER}` }}>
          {([
            { id: "config",      label: "⚙️ Configuration" },
            { id: "test",        label: "🧪 Tester un paiement" },
            { id: "integration", label: "🔌 Intégration" },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, padding: "10px", background: tab === t.id ? ORANGE : "transparent", border: "none", borderRadius: 9, color: tab === t.id ? "#fff" : "#888", fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB CONFIG ── */}
        {tab === "config" && (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 36 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>⚙️ Configuration API</h2>
            <p style={{ margin: "0 0 28px", color: "#888", fontSize: 14 }}>
              Entrez la clé API de votre compte <strong>paymentgateway.lfdweb.com</strong>.
            </p>

            {msg && (
              <div style={{ background: msg.type === "ok" ? "#14532d" : "#450a0a", color: msg.type === "ok" ? "#4ade80" : "#f87171", padding: "12px 16px", borderRadius: 10, marginBottom: 20, fontSize: 14 }}>
                {msg.text}
              </div>
            )}

            <label style={{ display: "block", marginBottom: 8, fontSize: 12, color: "#666", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
              Clé API LFD Gateway
            </label>
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="gw_votre_cle_api"
                style={inp({ flex: 1 })}
              />
              <button onClick={() => setShowKey(!showKey)}
                style={{ ...btn({ background: BORDER, color: "#e2e2f0", padding: "12px 16px" }) }}>
                {showKey ? "🙈" : "👁️"}
              </button>
            </div>

            <label style={{ display: "block", marginBottom: 8, fontSize: 12, color: "#666", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
              URL Webhook à configurer dans LFD Dashboard
            </label>
            <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
              <input readOnly value={webhookUrl} style={inp({ flex: 1, color: "#818cf8", fontFamily: "monospace", fontSize: 13 })} />
              <button onClick={() => { navigator.clipboard.writeText(webhookUrl); setMsg({ type: "ok", text: "URL copiée !" }); setTimeout(() => setMsg(null), 2000); }}
                style={btn({ background: BORDER, color: "#e2e2f0", padding: "12px 16px" })}>
                📋
              </button>
            </div>

            <button onClick={saveApiKey} disabled={!apiKey}
              style={btn({ background: apiKey ? ORANGE : "#333", color: "#fff", width: "100%", fontSize: 16, padding: "14px" })}>
              Sauvegarder
            </button>

            <div style={{ marginTop: 28, padding: 20, background: DARK, borderRadius: 12, border: `1px solid ${BORDER}` }}>
              <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 14 }}>📋 Étapes dans LFD Dashboard</p>
              {[
                "Connectez-vous sur paymentgateway.lfdweb.com",
                "Developer → Webhooks → Ajouter un webhook",
                `URL : ${webhookUrl}`,
                "Événements : payment.completed, payment.failed",
                "Hostname du webhook = hostname de votre app Vercel ✓",
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{ color: ORANGE, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: "#aaa", fontSize: 13, fontFamily: i === 2 ? "monospace" : undefined }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB TEST ── */}
        {tab === "test" && (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 36 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>🧪 Tester un paiement</h2>
            <p style={{ margin: "0 0 28px", color: "#888", fontSize: 14 }}>
              Génère un vrai lien via <code style={{ color: "#818cf8" }}>paymentgateway.lfdweb.com/api/gateway/generate-link</code>
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontSize: 12, color: "#666", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Montant (XOF)</label>
                <input type="number" value={testAmount} onChange={e => setTestAmount(e.target.value)} style={inp()} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontSize: 12, color: "#666", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Pays</label>
                <select value={testCountry} onChange={e => setTestCountry(e.target.value)} style={inp()}>
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontSize: 12, color: "#666", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Description</label>
              <input value={testDesc} onChange={e => setTestDesc(e.target.value)} style={inp()} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", marginBottom: 8, fontSize: 12, color: "#666", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Méthode de paiement {loadMethods && <span style={{ color: "#888" }}>(chargement…)</span>}
              </label>
              <select value={testMethod} onChange={e => setTestMethod(e.target.value)} style={inp()} disabled={loadMethods}>
                <option value="">— Automatique (tous les moyens) —</option>
                {methods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            {testError && (
              <div style={{ background: "#450a0a", color: "#f87171", padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: 14 }}>
                ❌ {testError}
              </div>
            )}

            {testUrl && (
              <div style={{ background: "#14532d", color: "#4ade80", padding: "16px 20px", borderRadius: 12, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>✅ Lien généré avec succès !</div>
                <a href={testUrl} target="_blank" rel="noopener" style={{ color: "#86efac", fontSize: 13, fontFamily: "monospace", wordBreak: "break-all" }}>{testUrl}</a>
                <div style={{ marginTop: 12 }}>
                  <a href={testUrl} target="_blank" rel="noopener"
                    style={{ ...btn({ background: "#166534", color: "#4ade80", display: "inline-block", textDecoration: "none", fontSize: 14 }) }}>
                    Ouvrir la page de paiement →
                  </a>
                </div>
              </div>
            )}

            <button onClick={testPayment} disabled={testLoading || !apiKey.startsWith("gw_")}
              style={btn({ background: testLoading || !apiKey.startsWith("gw_") ? "#333" : ORANGE, color: "#fff", width: "100%", fontSize: 16, padding: "14px", cursor: testLoading || !apiKey.startsWith("gw_") ? "not-allowed" : "pointer" })}>
              {testLoading ? "Génération…" : "🚀 Générer un lien de paiement test"}
            </button>
            {!apiKey.startsWith("gw_") && <p style={{ textAlign: "center", color: "#888", fontSize: 13, marginTop: 8 }}>→ Configurez votre clé API dans l'onglet Configuration</p>}
          </div>
        )}

        {/* ── TAB INTEGRATION ── */}
        {tab === "integration" && (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 36 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>🔌 Intégration dans votre boutique</h2>
            <p style={{ margin: "0 0 28px", color: "#888", fontSize: 14 }}>
              Ajoutez ce script dans votre thème Shopify pour intégrer le bouton de paiement LFD.
            </p>

            <label style={{ display: "block", marginBottom: 8, fontSize: 12, color: "#666", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Script à ajouter dans votre thème Shopify (sections/cart.liquid ou checkout)
            </label>
            <div style={{ position: "relative" }}>
              <pre style={{ background: DARK, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, fontSize: 12, color: "#a5b4fc", overflowX: "auto", margin: "0 0 8px", lineHeight: 1.7 }}>
{`<button id="lfd-pay-btn" onclick="lfdStartPayment()" style="
  background: #FF6B00; color: #fff; border: none;
  padding: 14px 32px; border-radius: 12px;
  font-size: 16px; font-weight: 700; cursor: pointer;
">
  💳 Payer par Mobile Money
</button>

<script>
async function lfdStartPayment() {
  const btn = document.getElementById('lfd-pay-btn');
  btn.textContent = 'Génération du lien…';
  btn.disabled = true;

  const res = await fetch('${appUrl}/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey:        'gw_VOTRE_CLE_API',   // ← votre clé LFD
      amount:        {{ cart.total_price }}, // montant Shopify
      description:   'Commande {{ shop.name }}',
      country:       'bj',                 // ← adapter selon vos clients
      transactionId: '{{ cart.token }}',   // ID panier Shopify
    })
  });

  const data = await res.json();
  if (data.url) {
    window.location.href = data.url; // redirect vers page LFD
  } else {
    alert('Erreur : ' + data.error);
    btn.textContent = '💳 Payer par Mobile Money';
    btn.disabled = false;
  }
}
</script>`}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `<button id="lfd-pay-btn" onclick="lfdStartPayment()" style="background:#FF6B00;color:#fff;border:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;">💳 Payer par Mobile Money</button>\n<script>\nasync function lfdStartPayment() {\n  const btn = document.getElementById('lfd-pay-btn');\n  btn.textContent = 'Génération du lien…';\n  btn.disabled = true;\n  const res = await fetch('${appUrl}/api/generate', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({\n      apiKey: 'gw_VOTRE_CLE_API',\n      amount: {{ cart.total_price }},\n      description: 'Commande {{ shop.name }}',\n      country: 'bj',\n      transactionId: '{{ cart.token }}',\n    })\n  });\n  const data = await res.json();\n  if (data.url) { window.location.href = data.url; }\n  else { alert('Erreur : ' + data.error); btn.textContent = '💳 Payer par Mobile Money'; btn.disabled = false; }\n}\n<\/script>`
                  );
                  setMsg({ type: "ok", text: "Code copié !" });
                  setTimeout(() => setMsg(null), 2000);
                }}
                style={btn({ background: ORANGE, color: "#fff", marginBottom: 24 })}>
                📋 Copier le code
              </button>
            </div>

            <div style={{ padding: 20, background: DARK, borderRadius: 12, border: `1px solid ${BORDER}` }}>
              <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 14 }}>⚠️ Important</p>
              {[
                "Remplacez 'gw_VOTRE_CLE_API' par votre vraie clé API LFD.",
                "Le webhook doit être configuré dans LFD Dashboard avec l'URL ci-dessus.",
                "L'origin passé à generate-link DOIT correspondre au hostname du webhook dans LFD Dashboard.",
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <span style={{ color: "#fb923c", fontWeight: 700 }}>→</span>
                  <span style={{ color: "#aaa", fontSize: 13 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 36, color: "#444", fontSize: 13 }}>
          LFD Payment Gateway · <a href="https://paymentgateway.lfdweb.com/api-documentation" target="_blank" style={{ color: ORANGE, textDecoration: "none" }}>Documentation API</a> · Support 24/7
        </div>
      </div>
    </div>
  );
}
