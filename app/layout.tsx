import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LFD Payment Gateway — Shopify",
  description: "Passerelle de paiement Mobile Money pour Shopify",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
