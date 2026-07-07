import { getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { BootScreen } from "@/components/effects/BootScreen";
import { SideRail } from "@/components/SideRail";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArchiveCard } from "@/components/ArchiveCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ShareBox } from "@/components/ShareBox";
import { notFound } from "next/navigation";

function localSlugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getTransmissionSlug(item: any) {
  return item.slug || localSlugify(item.title || item.code || "transmissao");
}

function getYouTubeEmbedUrl(url?: string) {
  if (!url || url === "#") return "";

  try {
    const parsed = new URL(url);
    let videoId = "";

    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.replace("/", "");
    }

    if (parsed.hostname.includes("youtube.com")) {
      videoId = parsed.searchParams.get("v") ?? "";

      if (!videoId && parsed.pathname.includes("/shorts/")) {
        videoId = parsed.pathname.split("/shorts/")[1]?.split("/")[0] ?? "";
      }

      if (!videoId && parsed.pathname.includes("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1]?.split("/")[0] ?? "";
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : "";
  } catch {
    return "";
  }
}

export async function generateStaticParams() {
  const content = getContent();
  const transmissions = [content.featuredTransmission, ...(content.videos ?? [])];

  return transmissions.map((item: any) => ({
    slug: getTransmissionSlug(item),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = getContent();
  const transmission = [content.featuredTransmission, ...(content.videos ?? [])].find((item: any) =>
    getTransmissionSlug(item) === slug
  );

  if (!transmission) {
    return buildMetadata({
      title: "Transmissão não encontrada",
      description: "O arquivo audiovisual solicitado não foi localizado no sistema do Quarto Elemento.",
      path: `/transmissoes/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${transmission.title} | Transmissão Classificada`,
    description: transmission.description ?? "Transmissão catalogada no arquivo audiovisual do Quarto Elemento.",
    path: `/transmissoes/${slug}`,
    image: transmission.image ?? "/images/banner-wide.png",
    keywords: [transmission.category, transmission.location, transmission.year, ...(transmission.tags ?? [])].filter(Boolean),
  });
}

export default async function TransmissionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = getContent();
  const allTransmissions = [content.featuredTransmission, ...(content.videos ?? [])];

  const transmission = allTransmissions.find((item: any) =>
    getTransmissionSlug(item) === slug ||
    item.code === slug ||
    localSlugify(item.code || "") === slug
  );

  if (!transmission) {
    notFound();
  }

  const embedUrl = getYouTubeEmbedUrl(transmission.youtubeUrl);
  const relatedArchives = (content.archives ?? []).filter((archive: any) =>
    transmission.relatedArchives?.includes(archive.code)
  );

  const nextTransmission = allTransmissions.find((item: any) => getTransmissionSlug(item) !== getTransmissionSlug(transmission));

  return (
    <>
      <BootScreen />
      <SideRail />
      <div className="siteShell">
        <Navbar email={content.site.emailRelatos} sections={content.sections} />

        <main>
          <Breadcrumb items={[
            { label: "Transmissões", href: "/transmissoes" },
            { label: transmission.category ?? "Arquivo", href: `/transmissoes?categoria=${localSlugify(transmission.category ?? "")}` },
            { label: transmission.title },
          ]} />

          <section className="transmissionDetailHero terminalPanel">
            <div className="transmissionDetailVisual" style={{ "--img": `url("${transmission.image}")` } as React.CSSProperties}>
              <div className="detailStamp">TRANSMISSÃO CLASSIFICADA</div>
            </div>

            <div className="transmissionDetailCopy">
              <span>{transmission.code}</span>
              <h1>{transmission.title}</h1>
              <p>{transmission.description}</p>

              <div className="transmissionDetailMeta">
                <b>Categoria</b><em>{transmission.category ?? "Arquivo"}</em>
                <b>Publicado</b><em>{transmission.publishedAt ?? "Arquivo recente"}</em>
                <b>Status</b><em>Disponível</em>
              </div>
            </div>
          </section>

          <section className="transmissionPlayer terminalPanel">
            <div className="transmissionPlayerHeader">
              <span>PLAYER // YOUTUBE EMBED</span>
              {transmission.youtubeUrl && transmission.youtubeUrl !== "#" ? (
                <a href={transmission.youtubeUrl} target="_blank" rel="noreferrer">Abrir no YouTube →</a>
              ) : (
                <span>URL NÃO CADASTRADA</span>
              )}
            </div>

            <div className="youtubeFrame pagePlayer">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={transmission.title}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="invalidVideo">
                  <p>URL do YouTube inválida ou não preenchida no Admin.</p>
                </div>
              )}
            </div>
          </section>

          <section className="transmissionContentGrid">
            <article className="terminalPanel dossierSection">
              <h2>Descrição da transmissão</h2>
              <p>{transmission.description}</p>
              <p>
                Este registro faz parte do Arquivo Digital do Quarto Elemento. Nas próximas versões, esta página poderá receber texto expandido,
                fontes, capítulos, imagens de apoio e ligações automáticas com dossiês relacionados.
              </p>
            </article>

            <aside className="terminalPanel transmissionAside">
              <h2>Tags do arquivo</h2>
              <div className="tagList">
                {(transmission.tags ?? []).map((tag: string) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>

              <h2>Compartilhar</h2>
              <p>Use esta página como o dossiê oficial da transmissão.</p>
              <ShareBox title={transmission.title} path={`/transmissoes/${getTransmissionSlug(transmission)}`} />
            </aside>
          </section>

          {relatedArchives.length > 0 && (
            <section className="section">
              <div className="sectionHead">
                <h2><span>+</span> Arquivos relacionados</h2>
                <a href="/arquivos" className="smallLink">Abrir acervo →</a>
              </div>
              <div className="archiveGrid">
                {relatedArchives.map((archive: any) => (
                  <ArchiveCard archive={archive} key={archive.code} />
                ))}
              </div>
            </section>
          )}

          {nextTransmission && (
            <section className="nextFile terminalPanel">
              <span>Próximo arquivo</span>
              <h2>{nextTransmission.title}</h2>
              <a className="btn btnRed" href={`/transmissoes/${getTransmissionSlug(nextTransmission)}`}>
                Continuar investigação →
              </a>
            </section>
          )}
        </main>

        <Footer email={content.site.emailRelatos} />
      </div>
    </>
  );
}
