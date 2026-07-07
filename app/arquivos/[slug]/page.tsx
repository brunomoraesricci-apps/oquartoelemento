import { getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { BootScreen } from "@/components/effects/BootScreen";
import { SideRail } from "@/components/SideRail";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DossierGallery } from "@/components/DossierGallery";
import { DossierVideoHero } from "@/components/DossierVideoHero";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ShareBox } from "@/components/ShareBox";
import { ReportModal } from "@/components/ReportModal";
import { notFound } from "next/navigation";

function localSlugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getArchiveSlug(item: any) {
  return item.slug || localSlugify(item.title || item.code || "arquivo");
}

export async function generateStaticParams() {
  const content = getContent();

  return (content.archives ?? []).map((archive: any) => ({
    slug: getArchiveSlug(archive),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = getContent();
  const archive = (content.archives ?? []).find((item: any) =>
    getArchiveSlug(item) === slug ||
    item.code === slug ||
    localSlugify(item.code || "") === slug
  );

  if (!archive) {
    return buildMetadata({
      title: "Arquivo não encontrado",
      description: "O dossiê solicitado não foi localizado no Arquivo Digital do Quarto Elemento.",
      path: `/arquivos/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${archive.title} | Dossiê Desclassificado`,
    description: archive.summary ?? archive.description ?? "Dossiê investigativo catalogado no Arquivo Digital do Quarto Elemento.",
    path: `/arquivos/${slug}`,
    image: archive.image ?? "/images/banner-wide.png",
    keywords: [archive.code, archive.category, archive.location, archive.year, archive.classification, ...(archive.tags ?? [])].filter(Boolean),
  });
}

export default async function ArquivoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = getContent();

  const archive = (content.archives ?? []).find((item: any) =>
    getArchiveSlug(item) === slug ||
    item.code === slug ||
    localSlugify(item.code || "") === slug
  );

  if (!archive) {
    notFound();
  }

  const relatedTransmission = [content.featuredTransmission, ...(content.videos ?? [])].find((video: any) =>
    video.slug === archive.relatedTransmissionSlug
  );

  const relatedArchives = (content.archives ?? [])
    .filter((item: any) => item.code !== archive.code && item.category === archive.category)
    .slice(0, 3);

  return (
    <>
      <BootScreen />
      <SideRail />
      <div className="siteShell">
        <Navbar email={content.site.emailRelatos} sections={content.sections} />

        <main>
          <Breadcrumb items={[
            { label: "Arquivos", href: "/arquivos" },
            { label: archive.category ?? "Arquivo", href: `/transmissoes?categoria=${localSlugify(archive.category ?? "")}` },
            { label: archive.title },
          ]} />

          <section className="dossierHero terminalPanel">
            <DossierVideoHero
              image={archive.image}
              transmission={relatedTransmission ?? null}
            />

            <div className="dossierCopy">
              <span>{archive.code}</span>
              <h1>{archive.title}</h1>
              <p>{archive.summary ?? archive.description}</p>

              <div className="dossierMeta">
                <b>Classificação</b><em>{archive.classification ?? archive.status}</em>
                <b>Acesso</b><em>{archive.accessLevel ?? "LV.04"}</em>
                <b>Categoria</b><em>{archive.category}</em>
                <b>Local</b><em>{archive.location}</em>
                <b>Ano</b><em>{archive.year}</em>
              </div>
            </div>
          </section>

          <section className="dossierNarrative">
            <article className="terminalPanel dossierSection dossierMainText">
              <span className="sectionCode">ANÁLISE // 01</span>
              <h2>Resumo do arquivo</h2>
              <p>{archive.longDescription}</p>
              <p>
                Este arquivo foi estruturado para reunir contexto, registros, documentos e conexões com transmissões relacionadas.
                Conforme o projeto evoluir, novas evidências, relatos e anexos poderão ser adicionados pelo painel administrativo.
              </p>
            </article>

            <aside className="terminalPanel dossierSidePanel">
              <h2>Tags</h2>
              <div className="tagList">
                {(archive.tags ?? []).map((tag: string) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>

              <h2>Status</h2>
              <p>{archive.status}</p>

              <h2>Compartilhar</h2>
              <ShareBox title={archive.title} path={`/arquivos/${getArchiveSlug(archive)}`} />

              {relatedTransmission && (
                <>
                  <h2>Transmissão relacionada</h2>
                  <a className="relatedTransmissionMini" href={`/transmissoes/${relatedTransmission.slug}`}>
                    <b>{relatedTransmission.title}</b>
                    <span>Abrir dossiê da transmissão →</span>
                  </a>
                </>
              )}
            </aside>
          </section>

          <section className="dossierSections">
            {(archive.sections ?? []).map((section: any, index: number) => (
              <article className="terminalPanel dossierSection" key={`${section.title}-${index}`}>
                <span className="sectionCode">BLOCO // {String(index + 2).padStart(2, "0")}</span>
                <h2>{section.title}</h2>
                <p>{section.text}</p>
              </article>
            ))}
          </section>

          <section className="dossierGallerySection">
            <article className="terminalPanel dossierSection">
              <span className="sectionCode">ANEXOS // IMAGENS</span>
              <h2>Galeria do arquivo</h2>
              <DossierGallery images={archive.gallery ?? []} />
            </article>
          </section>

          <section className="terminalPanel submitInfoBox">
            <div>
              <span>VOCÊ TEM INFORMAÇÕES?</span>
              <h2>Este arquivo continua em investigação.</h2>
              <p>Envie relatos, imagens ou detalhes adicionais para análise do Quarto Elemento.</p>
            </div>
            <ReportModal
              email={content.site.emailRelatos}
              triggerLabel="Enviar informação"
              triggerClassName="btn btnRed"
            />
          </section>

          {relatedArchives.length > 0 && (
            <section className="section">
              <div className="sectionHead">
                <h2><span>+</span> Arquivos semelhantes</h2>
                <a href="/arquivos" className="smallLink">Abrir acervo →</a>
              </div>

              <div className="dossierRelatedGrid">
                {relatedArchives.map((item: any) => (
                  <a className="relatedDossierCard terminalPanel" href={`/arquivos/${getArchiveSlug(item)}`} key={item.code}>
                    <span>{item.code}</span>
                    <h3>{item.title}</h3>
                    <p>{item.category} • {item.year}</p>
                  </a>
                ))}
              </div>
            </section>
          )}
        </main>

        <Footer email={content.site.emailRelatos} />
      </div>
    </>
  );
}
