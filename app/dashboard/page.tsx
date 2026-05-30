"use client";
import { useEffect, useState } from "react";

const ORANGE = "#FF6B00";
const DARK   = "#0f0f1a";
const CARD   = "#16162a";
const BORDER = "#2a2a42";

const COUNTRIES = [
  { code: "bj", flag: "🇧🇯", name: "Bénin"         },
  { code: "tg", flag: "🇹🇬", name: "Togo"          },
  { code: "sn", flag: "🇸🇳", name: "Sénégal"       },
  { code: "ci", flag: "🇨🇮", name: "Côte d'Ivoire"  },
  { code: "cm", flag: "🇨🇲", name: "Cameroun"      },
  { code: "gn", flag: "🇬🇳", name: "Guinée"        },
];

export default function Dashboard() {
  const [shop,    setShop]    = useState("");
  const [apiKey,  setApiKey]  = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState<{ type: "ok"|"err"; text: string } | null>(null);

  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("shop") || "";
    setShop(s);
    const saved = localStorage.getItem(`lfd_apikey_${s}`);
    if (saved) setApiKey(saved);
  }, []);

  const saveApiKey = () => {
    if (!apiKey.startsWith("gw_")) {
      setMsg({ type: "err", text: "La clé doit commencer par 'gw_'" });
      return;
    }
    localStorage.setItem(`lfd_apikey_${shop}`, apiKey);
    setMsg({ type: "ok", text: "Clé API sauvegardée ✓" });
    setTimeout(() => setMsg(null), 3000);
  };

  const appUrl    = typeof window !== "undefined" ? window.location.origin : "";
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
          <span style={{
            background: apiKey.startsWith("gw_") ? "#14532d" : "#451a03",
            color:      apiKey.startsWith("gw_") ? "#4ade80" : "#fb923c",
            padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600,
          }}>
            {apiKey.startsWith("gw_") ? "✓ Configuré" : "⚠ Non configuré"}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>

        {/* Hero */}
        <div style={{
          background: `linear-gradient(135deg, ${ORANGE} 0%, #c94f00 55%, #1a0830 100%)`,
          borderRadius: 20, padding: "36px 44px", marginBottom: 32,
          position: "relative", overflow: "hidden",
        }}>
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

        {/* Config card */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 36 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>⚙️ Configuration API</h2>
          <p style={{ margin: "0 0 28px", color: "#888", fontSize: 14 }}>
            Entrez la clé API de votre compte <strong>paymentgateway.lfdweb.com</strong>.
          </p>

          {msg && (
            <div style={{
              background: msg.type === "ok" ? "#14532d" : "#450a0a",
              color:      msg.type === "ok" ? "#4ade80" : "#f87171",
              padding: "12px 16px", borderRadius: 10, marginBottom: 20, fontSize: 14,
            }}>
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
              style={btn({ background: BORDER, color: "#e2e2f0", padding: "12px 16px" })}>
              {showKey ? "🙈" : "👁️"}
            </button>
          </div>

          <label style={{ display: "block", marginBottom: 8, fontSize: 12, color: "#666", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
            URL Webhook — à configurer dans LFD Dashboard
          </label>
          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            <input
              readOnly value={webhookUrl}
              style={inp({ flex: 1, color: "#818cf8", fontFamily: "monospace", fontSize: 13 })}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(webhookUrl);
                setMsg({ type: "ok", text: "URL copiée !" });
                setTimeout(() => setMsg(null), 2000);
              }}
              style={btn({ background: BORDER, color: "#e2e2f0", padding: "12px 16px" })}>
              📋
            </button>
          </div>

          <button
            onClick={saveApiKey}
            disabled={!apiKey}
            style={btn({ background: apiKey ? ORANGE : "#333", color: "#fff", width: "100%", fontSize: 16, padding: "14px", cursor: apiKey ? "pointer" : "not-allowed" })}>
            Sauvegarder
          </button>

          {/* Steps */}
          <div style={{ marginTop: 28, padding: 20, background: DARK, borderRadius: 12, border: `1px solid ${BORDER}` }}>
            <p style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 14 }}>📋 Étapes dans LFD Dashboard</p>
            {[
              "Connectez-vous sur paymentgateway.lfdweb.com",
              "Developer → Webhooks → Ajouter un webhook",
              `URL : ${webhookUrl}`,
              "Événements : payment.completed, payment.failed",
              "Le hostname du webhook doit correspondre à celui de votre app Vercel ✓",
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                <span style={{ color: ORANGE, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                <span style={{ color: "#aaa", fontSize: 13, fontFamily: i === 2 ? "monospace" : undefined }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 36, color: "#444", fontSize: 13 }}>
          LFD Payment Gateway ·{" "}
          <a href="https://paymentgateway.lfdweb.com/api-documentation" target="_blank" style={{ color: ORANGE, textDecoration: "none" }}>
            Documentation API
          </a>{" "}
          · Support 24/7
        </div>
      </div>
    </div>
  );
}