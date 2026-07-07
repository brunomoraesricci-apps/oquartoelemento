import { getPublicContentAsync } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { BootScreen } from "@/components/effects/BootScreen";
import { SideRail } from "@/components/SideRail";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/pages/PageHeader";

export const metadata = buildMetadata({
  title: "Linha do Tempo | Arquivos Cronológicos",
  description: "Eventos, casos e registros organizados cronologicamente no Arquivo Digital do Quarto Elemento.",
  path: "/linha-do-tempo",
  keywords: ["linha do tempo", "cronologia", "mistérios"],
});

export const dynamic = "force-dynamic";

export default async function LinhaDoTempoPage() {
  const content = await getPublicContentAsync();
  const archives = content.archives ?? [];

  return (
    <>
      <BootScreen />
      <SideRail />
      <div className="siteShell">
        <Navbar email={content.site.emailRelatos} sections={content.sections} contentData={content} />
        <main>
          <PageHeader
            eyebrow="Cronologia"
            title="Linha do Tempo"
            description="Eventos, casos e registros organizados por período dentro do Arquivo Digital."
          />

          <section className="timelineFilters terminalPanel">
            <span>Filtro rápido</span>
            <div>
              <a href="/linha-do-tempo">Todos</a>
              {content.categories?.slice(0, 6).map((category: any) => (
                <a href={`/transmissoes?categoria=${category.slug}`} key={category.title}>{category.title}</a>
              ))}
            </div>
          </section>

          <section className="cinematicTimeline">
            {content.timeline.map((item: any, index: number) => {
              const relatedArchive =
                archives.find((archive: any) => archive.slug === item.archiveSlug || archive.slug === item.contentSlug) ??
                archives[index % Math.max(1, archives.length)];

              return (
                <article className="timelineDossier" key={`${item.year}-${item.title}-${index}`}>
                  <div className="timelineYear">{item.year}</div>
                  <div className="timelineConnector" />
                  <a className="timelineCard terminalPanel" href={relatedArchive ? `/arquivos/${relatedArchive.slug}` : "#"}>
                    <span>{item.isAuto ? "AUTO" : "REGISTRO"} // {String(index + 1).padStart(2, "0")}</span>
                    <h2>{item.title}</h2>
                    <p>{item.text}</p>
                    <b>{relatedArchive ? "Abrir arquivo relacionado →" : "Registro em análise"}</b>
                  </a>
                </article>
              );
            })}
          </section>
        </main>
        <Footer email={content.site.emailRelatos} categories={content.categories} />
      </div>
    </>
  );
}
