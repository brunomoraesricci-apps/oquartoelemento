import { getContentAsync } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { BootScreen } from "@/components/effects/BootScreen";
import { SideRail } from "@/components/SideRail";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/pages/PageHeader";
import { IntelligenceCenter } from "@/components/IntelligenceCenter";

export const metadata = buildMetadata({
  title: "Explorar | Centro de Inteligência",
  description: "Pesquise, filtre e navegue por transmissões, categorias, relatos, dossiês e conexões do Quarto Elemento.",
  path: "/explorar",
  keywords: ["centro de inteligência", "busca", "acervo"],
});

export const dynamic = "force-dynamic";

export default async function ExplorarPage() {
  const content = await getContentAsync();

  return (
    <>
      <BootScreen />
      <SideRail />
      <div className="siteShell">
        <Navbar email={content.site.emailRelatos} sections={content.sections} contentData={content} />
        <main>
          <PageHeader
            eyebrow="Centro de inteligência"
            title="Explorar"
            description="Pesquise, filtre e navegue por arquivos, transmissões, categorias, relatos e conexões do Quarto Elemento."
          />

          <IntelligenceCenter content={content} />
        </main>
        <Footer email={content.site.emailRelatos} categories={content.categories} />
      </div>
    </>
  );
}
