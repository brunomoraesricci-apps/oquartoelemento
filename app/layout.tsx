import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "O Quarto Elemento | Arquivo Digital de Mistérios",
  description: "Mistérios, casos reais, lendas e relatos organizados como arquivos confidenciais.",
  openGraph: {
    title: "O Quarto Elemento",
    description: "O desconhecido é real.",
    type: "website",
    locale: "pt_BR",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#050302",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
