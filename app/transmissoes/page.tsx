import { buildMetadata } from "@/lib/seo";
import TransmissoesPageClient from "@/components/TransmissoesPageClient";

export const metadata = buildMetadata({
  title: "Transmissões | Arquivo Audiovisual",
  description: "Assista transmissões, documentários e registros audiovisuais do Quarto Elemento em um arquivo investigativo digital.",
  path: "/transmissoes",
  keywords: ["transmissões", "YouTube", "documentários", "mistérios"],
});

export default function TransmissoesPage() {
  return <TransmissoesPageClient />;
}
