import { getContent } from "@/lib/content";
import { BootScreen } from "@/components/effects/BootScreen";
import { SideRail } from "@/components/SideRail";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/pages/PageHeader";
import { ArchiveSearchPanel } from "@/components/pages/ArchiveSearchPanel";

export const dynamic = "force-dynamic";

export default function ArquivosPage() {
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
            eyebrow="Base de dados"
            title="Arquivos"
            description="Dossiês, casos, relatos e transmissões catalogados como registros confidenciais dentro do sistema do Quarto Elemento."
          />

          <ArchiveSearchPanel />

          <section className="dossierArchiveList">
            {archives.map((archive: any) => (
              <article className="dossierListCard terminalPanel" key={archive.code}>
                <a
                  className="dossierListImage"
                  href={`/arquivos/${archive.slug}`}
                  style={{ "--img": `url("${archive.image}")` } as React.CSSProperties}
                >
                  <span>{archive.code}</span>
                </a>

                <div className="dossierListCopy">
                  <div className="archiveMeta">
                    <span>{archive.classification ?? archive.status}</span>
                    <span>{archive.accessLevel ?? "LV.04"}</span>
                  </div>

                  <h2>{archive.title}</h2>
                  <p>{archive.summary ?? archive.description}</p>

                  <div className="dossierMiniMeta">
                    <span>{archive.category}</span>
                    <span>{archive.location}</span>
                    <span>{archive.year}</span>
                  </div>

                  <a className="btn btnRed" href={`/arquivos/${archive.slug}`}>
                    Abrir arquivo →
                  </a>
                </div>
              </article>
            ))}
          </section>
        </main>
        <Footer email={content.site.emailRelatos} />
      </div>
    </>
  );
}