"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BootScreen } from "@/components/effects/BootScreen";
import { SideRail } from "@/components/SideRail";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/pages/PageHeader";
import { TransmissionModal, isValidYouTubeUrl, type ModalTransmission } from "@/components/TransmissionModal";

function localSlugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getTransmissionSlug(video: any) {
  return video.slug || localSlugify(video.title || video.code || "transmissao");
}

function isRelatoVideo(video: any) {
  const contentType = localSlugify(video?.contentType ?? video?.content_type ?? "");
  const category = localSlugify(video?.category ?? video?.category_slug ?? "");
  const title = localSlugify(video?.title ?? "");

  return (
    contentType === "relato" ||
    contentType === "report" ||
    category === "relatos" ||
    category === "relato" ||
    category === "relatos-proibidos" ||
    title.includes("relato-proibido")
  );
}

function normalizeCategoryLabel(value: any, video?: any) {
  if (video && isRelatoVideo(video)) return "Relatos Proibidos";

  const label = String(value ?? "").trim();
  const normalized = localSlugify(label);

  if (["relato", "relatos", "relatos-proibidos", "relato-proibido"].includes(normalized)) {
    return "Relatos Proibidos";
  }

  return label;
}

function TransmissoesContent({ content }: { content: any }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("categoria") ?? "todos";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTransmission, setSelectedTransmission] = useState<ModalTransmission | null>(null);

  // V8: a página de Transmissões é o catálogo audiovisual completo.
  // Relatos Proibidos também são vídeos no modelo unificado, então não devem ser removidos daqui.
  const transmissions = [content.featuredTransmission, ...(content.videos ?? [])]
    .filter(Boolean);

  const categoryOptions = useMemo(() => {
    const fromCategories = (content.categories ?? [])
      .map((category: any) => normalizeCategoryLabel(category.title))
      .filter(Boolean)
      .map((label: string) => ({
        label,
        value: localSlugify(label),
      }));

    const fromVideos = transmissions
      .map((video: any) => normalizeCategoryLabel(video.category, video))
      .filter(Boolean)
      .map((category: string) => ({
        label: category,
        value: localSlugify(category),
      }));

    const map = new Map<string, string>();
    [...fromCategories, ...fromVideos].forEach((item) => map.set(item.value, item.label));

    return [{ label: "Todos", value: "todos" }, ...Array.from(map.entries()).map(([value, label]) => ({ value, label }))];
  }, [transmissions]);

  function categoryMatches(video: any, value: string) {
    if (value === "relatos-proibidos") return isRelatoVideo(video);

    const normalized = localSlugify(normalizeCategoryLabel(video.category, video));
    return normalized === value;
  }

  const filteredTransmissions = selectedCategory === "todos"
    ? transmissions
    : transmissions.filter((video: any) => categoryMatches(video, selectedCategory));

  function getCategoryCount(value: string) {
    if (value === "todos") return transmissions.length;
    return transmissions.filter((video: any) => categoryMatches(video, value)).length;
  }

  return (
    <>
      <BootScreen />
      <SideRail />
      <div className="siteShell">
        <Navbar email={content.site.emailRelatos} sections={content.sections} contentData={content} />
        <main>
          <PageHeader
            eyebrow="Módulo de transmissões"
            title="Transmissões"
            description="Documentários, investigações e registros audiovisuais catalogados como transmissões do Arquivo Digital."
          />

          <section className="categoryFilter terminalPanel">
            <span>Filtrar categoria // {filteredTransmissions.length} registro(s)</span>
            <div>
              {categoryOptions.map((category) => (
                <button
                  key={category.value}
                  className={selectedCategory === category.value ? "active" : ""}
                  type="button"
                  onClick={() => setSelectedCategory(category.value)}
                >
                  {category.label} ({getCategoryCount(category.value)})
                </button>
              ))}
            </div>
          </section>

          <section className="transmissionArchiveList">
            {filteredTransmissions.map((video: any) => {
              const slug = getTransmissionSlug(video);
              const youtubeIsValid = isValidYouTubeUrl(video.youtubeUrl);

              return (
                <article className="transmissionDossierCard terminalPanel" key={`${video.code}-${slug}`}>
                  <button
                    className="transmissionDossierImage"
                    type="button"
                    onClick={() => setSelectedTransmission(video)}
                    style={{ "--img": `url("${video.image}")` } as React.CSSProperties}
                    aria-label={`Assistir ${video.title}`}
                  >
                    <span>▶</span>
                  </button>

                  <div className="transmissionDossierCopy">
                    <div className="archiveMeta">
                      <span>{video.code}</span>
                      <span>{video.category ?? "Transmissão"}</span>
                    </div>

                    <h2>{video.title}</h2>
                    <p>{video.description}</p>

                    <div className="premiumMeta">
                      <span>{video.year ?? "Arquivo"}</span>
                      <span>{video.location ?? "Quarto Elemento"}</span>
                    </div>

                    <div className="tagList mini">
                      {(video.tags ?? ["Arquivo"]).slice(0, 4).map((tag: string) => (
                        <span key={tag}>#{tag}</span>
                      ))}
                    </div>

                    <div className="transmissionDossierActions">
                      <a className="btn btnRed" href={`/transmissoes/${slug}`}>Abrir dossiê →</a>

                      {youtubeIsValid ? (
                        <a className="btn" href={video.youtubeUrl} target="_blank" rel="noreferrer">
                          YouTube →
                        </a>
                      ) : (
                        <button className="btn" type="button" onClick={() => setSelectedTransmission(video)}>
                          YouTube não cadastrado
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {filteredTransmissions.length === 0 && (
              <div className="emptyFilter terminalPanel">
                Nenhuma transmissão encontrada para esta categoria.
              </div>
            )}
          </section>
        </main>

        <Footer email={content.site.emailRelatos} categories={content.categories} />
      </div>

      {selectedTransmission && (
        <TransmissionModal
          transmission={selectedTransmission}
          onClose={() => setSelectedTransmission(null)}
        />
      )}
    </>
  );
}


export default function TransmissoesPage({ content }: { content: any }) {
  return (
    <Suspense fallback={
      <div className="bootScreen bootScreenRoute">
        <div className="bootBox">
          <span>OPENING FILE...</span>
          <i />
          <p>&gt; SIGNAL ACTIVE // ROUTE VERIFIED</p>
        </div>
      </div>
    }>
      <TransmissoesContent content={content} />
    </Suspense>
  );
}
