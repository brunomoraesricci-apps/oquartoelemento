"use client";

import { useMemo, useState } from "react";

type Video = {
  code: string;
  title: string;
  description?: string;
  image: string;
  youtubeUrl: string;
  slug?: string;
  category?: string;
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

export function VideoGrid({ videos }: { videos: Video[] }) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const embedUrl = useMemo(() => {
    return selectedVideo ? getYouTubeEmbedUrl(selectedVideo.youtubeUrl) : "";
  }, [selectedVideo]);

  return (
    <div>
      <div className="sectionHead">
        <h2><span>+</span> Últimas transmissões</h2>
        <a href="/transmissoes" className="smallLink">Ver todos →</a>
      </div>

      <div className="videoGrid">
        {videos.map((video) => (
          <article className="videoCard" data-code={video.code} key={video.code}>
            <button
              className="videoTrigger"
              type="button"
              onClick={() => setSelectedVideo(video)}
              aria-label={`Assistir ${video.title}`}
            >
              <div className="thumb" style={{ "--img": `url("${video.image}")` } as React.CSSProperties}>
                <span className="playButton" />
              </div>
              <h3>{video.title}</h3>
              {video.description && <p>{video.description}</p>}
            </button>
            <a className="videoDossierLink" href={`/transmissoes/${getTransmissionSlug(video)}`}>
              Abrir dossiê →
            </a>
          </article>
        ))}
      </div>

      {selectedVideo && (
        <div className="videoModal" role="dialog" aria-modal="true">
          <button className="modalBackdrop" onClick={() => setSelectedVideo(null)} aria-label="Fechar vídeo" />
          <div className="videoModalPanel">
            <div className="modalHeader">
              <div>
                <span>{selectedVideo.code}</span>
                <h2>{selectedVideo.title}</h2>
              </div>
              <button onClick={() => setSelectedVideo(null)} aria-label="Fechar">×</button>
            </div>

            <div className="youtubeFrame">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={selectedVideo.title}
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
              <a className="btn" href={`/transmissoes/${getTransmissionSlug(selectedVideo)}`}>
                Abrir dossiê →
              </a>
              <a className="btn btnRed" href={selectedVideo.youtubeUrl || "#"} target="_blank" rel="noreferrer">
                Abrir no YouTube →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
