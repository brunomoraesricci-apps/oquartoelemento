import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Admin | Sistema Interno",
  description: "Painel interno de administração do Arquivo Digital do Quarto Elemento.",
  path: "/admin",
  noIndex: true,
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
