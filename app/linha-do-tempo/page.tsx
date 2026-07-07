import { getContent } from "@/lib/content";
import { BootScreen } from "@/components/effects/BootScreen";
import { SideRail } from "@/components/SideRail";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/pages/PageHeader";

export const dynamic = "force-dynamic";

export default function LinhaDoTempoPage() {
  const content = getContent();
  const archives = content.archives ?? [];

  return (
    <>
      <BootScreen />
      <SideRail />
      <div className="siteShell">
        <Navbar email={content.site.emailRelatos} sections={content.sections} />
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
              const relatedArchive = archives[index % Math.max(1, archives.length)];

              return (
                <article className="timelineDossier" key={`${item.year}-${item.title}`}>
                  <div className="timelineYear">{item.year}</div>
                  <div className="timelineConnector" />
                  <a className="timelineCard terminalPanel" href={relatedArchive ? `/arquivos/${relatedArchive.slug}` : "#"}>
                    <span>REGISTRO // {String(index + 1).padStart(2, "0")}</span>
                    <h2>{item.title}</h2>
                    <p>{item.text}</p>
                    <b>{relatedArchive ? "Abrir arquivo relacionado →" : "Registro em análise"}</b>
                  </a>
                </article>
              );
            })}
          </section>
        </main>
        <Footer email={content.site.emailRelatos} />
      </div>
    </>
  );
}
