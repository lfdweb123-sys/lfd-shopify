import { redirect } from "next/navigation";

export default function Home({ searchParams }: { searchParams: { shop?: string } }) {
  const shop = searchParams.shop;
  if (shop) redirect(`/api/auth?shop=${shop}`);
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f1a", color: "#e2e2f0", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>💳</div>
        <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 800 }}>LFD Payment Gateway</h1>
        <p style={{ color: "#888" }}>Installez cette app depuis votre boutique Shopify.</p>
        <a href="https://paymentgateway.lfdweb.com" style={{ color: "#FF6B00", textDecoration: "none", fontSize: 14 }}>paymentgateway.lfdweb.com →</a>
      </div>
    </div>
  );
}
