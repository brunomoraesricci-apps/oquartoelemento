import { getContentAsync } from "@/lib/content";
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

export default async function RelatosPage() {
  const content = await getContentAsync();
  const reports = (content.videos ?? []).filter((video: any) => video.contentType === "relato" || String(video.category ?? "").toLowerCase().includes("relato"));

  return (
    <>
      <BootScreen />
      <SideRail />
      <div className="siteShell">
        <Navbar email={content.site.emailRelatos} sections={content.sections} contentData={content} />
        <main>
          <PageHeader
            eyebrow="Arquivo comunitário"
            title="Relatos"
            description="Registros enviados pela comunidade e relacionados a publicações, transmissões e futuros dossiês do Quarto Elemento."
          />

          <ReportCards reports={reports} email={content.site.emailRelatos} />
        </main>
        <Footer email={content.site.emailRelatos} categories={content.categories} />
      </div>
    </>
  );
}
