"use client";

export type ModalTransmission = {
  code: string;
  title: string;
  youtubeUrl?: string;
};

export function getYouTubeEmbedUrl(url?: string) {
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

    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : "";
  } catch {
    return "";
  }
}

export function isValidYouTubeUrl(url?: string) {
  return Boolean(getYouTubeEmbedUrl(url));
}

export function TransmissionModal({
  transmission,
  onClose,
}: {
  transmission: ModalTransmission;
  onClose: () => void;
}) {
  const embedUrl = getYouTubeEmbedUrl(transmission.youtubeUrl);

  return (
    <div className="videoModal" role="dialog" aria-modal="true">
      <button className="modalBackdrop" onClick={onClose} aria-label="Fechar vídeo" />
      <div className="videoModalPanel">
        <div className="modalHeader">
          <div>
            <span>{transmission.code}</span>
            <h2>{transmission.title}</h2>
          </div>
          <button onClick={onClose} aria-label="Fechar">×</button>
        </div>

        <div className="youtubeFrame">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={transmission.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="invalidVideo">
              <p>URL do YouTube inválida ou não preenchida no Admin.</p>
            </div>
          )}
        </div>

        <div className="modalFooter">
          {transmission.youtubeUrl && transmission.youtubeUrl !== "#" ? (
            <a className="btn btnRed" href={transmission.youtubeUrl} target="_blank" rel="noreferrer">
              Abrir no YouTube →
            </a>
          ) : (
            <span className="disabledYoutube">Link do YouTube não cadastrado</span>
          )}
        </div>
      </div>
    </div>
  );
}
