"use client";

import { useMemo, useState } from "react";

type FeaturedTransmissionData = {
  code: string;
  title: string;
  subtitle: string;
  description: string;
  duration?: string;
  youtubeUrl: string;
  image: string;
  slug?: string;
};

function localSlugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getTransmissionSlug(video: { slug?: string; title: string }) {
  return video.slug || localSlugify(video.title);
}

function getYouTubeEmbedUrl(url: string) {
  if (!url) return "";

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

    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : "";
  } catch {
    return "";
  }
}

export function FeaturedTransmission({ item }: { item: FeaturedTransmissionData }) {
  const [isOpen, setIsOpen] = useState(false);

  const embedUrl = useMemo(() => {
    return getYouTubeEmbedUrl(item.youtubeUrl);
  }, [item.youtubeUrl]);

  return (
    <>
      <section className="featuredTransmission terminalPanel">
        <button
          className="transmissionVisual transmissionVisualButton"
          style={{ "--img": `url("${item.image}")` } as React.CSSProperties}
          onClick={() => setIsOpen(true)}
          type="button"
          aria-label={`Assistir ${item.title}`}
        >
          <div className="playLarge">▶</div>
          {item.duration && <span>{item.duration}</span>}
        </button>

        <div className="transmissionCopy">
          <span className="fileCode">{item.code}</span>
          <p className="kicker">{item.subtitle}</p>
          <h2>{item.title}</h2>
          <p>{item.description}</p>
          <div className="transmissionActions">
            <button className="btn btnRed" type="button" onClick={() => setIsOpen(true)}>
              Assistir transmissão →
            </button>
            <a className="btn" href={`/transmissoes/${getTransmissionSlug(item)}`}>
              Abrir dossiê →
            </a>
          </div>
        </div>
      </section>

      {isOpen && (
        <div className="videoModal" role="dialog" aria-modal="true">
          <button className="modalBackdrop" onClick={() => setIsOpen(false)} aria-label="Fechar vídeo" />
          <div className="videoModalPanel">
            <div className="modalHeader">
              <div>
                <span>{item.code}</span>
                <h2>{item.title}</h2>
              </div>
              <button onClick={() => setIsOpen(false)} aria-label="Fechar">×</button>
            </div>

            <div className="youtubeFrame">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={item.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="invalidVideo">
                  <p>URL do YouTube inválida ou não preenchida.</p>
                </div>
              )}
            </div>

            <div className="modalFooter">
              <a className="btn" href={`/transmissoes/${getTransmissionSlug(item)}`}>
                Abrir dossiê →
              </a>
              <a className="btn btnRed" href={item.youtubeUrl || "#"} target="_blank" rel="noreferrer">
                Abrir no YouTube →
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
