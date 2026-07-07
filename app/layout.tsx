import type { Viewport } from "next";
import { buildMetadata } from "@/lib/seo";
import "./globals.css";

export const metadata = buildMetadata();

export const viewport: Viewport = {
  themeColor: "#050302",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
