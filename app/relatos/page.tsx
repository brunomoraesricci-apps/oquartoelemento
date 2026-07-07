import { getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { BootScreen } from "@/components/effects/BootScreen";
import { SideRail } from "@/components/SideRail";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/pages/PageHeader";
import { ReportCards } from "@/components/ReportCards";

export const metadata = buildMetadata({
  title: "Relatos | Banco de Evidências",
  description: "Registros e relatos da comunidade relacionados a transmissões, mistérios e futuros dossiês do Quarto Elemento.",
  path: "/relatos",
  keywords: ["relatos", "evidências", "comunidade"],
});

export const dynamic = "force-dynamic";

export default function RelatosPage() {
  const content = getContent();
  const reports = content.relatos ?? [];

  return (
    <>
      <BootScreen />
      <SideRail />
      <div className="siteShell">
        <Navbar email={content.site.emailRelatos} sections={content.sections} />
        <main>
          <PageHeader
            eyebrow="Arquivo comunitário"
            title="Relatos"
            description="Registros enviados pela comunidade e relacionados a publicações, transmissões e futuros dossiês do Quarto Elemento."
          />

          <ReportCards reports={reports} email={content.site.emailRelatos} />
        </main>
        <Footer email={content.site.emailRelatos} />
      </div>
    </>
  );
}
