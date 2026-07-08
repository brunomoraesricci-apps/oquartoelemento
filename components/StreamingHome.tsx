"use client";

import { useEffect, useMemo, useState } from "react";
import { TransmissionModal } from "@/components/TransmissionModal";

type Video = {
  code: string;
  title: string;
  description?: string;
  image: string;
  youtubeUrl?: string;
  slug?: string;
  category?: string;
  duration?: string;
  views?: string;
  date?: string;
  tags?: string[];
  contentType?: string;
};

type Archive = {
  code: string;
  title: string;
  description?: string;
  image: string;
  slug?: string;
  category?: string;
};

type Category = {
  title: string;
  slug?: string;
  symbol?: string;
  active?: boolean;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function videoSlug(video: Video) {
  return video.slug || slugify(video.title);
}

function categoryLabel(value?: string) {
  const text = String(value || "").trim();
  if (/^relatos?$/i.test(text) || /relatos?\s+proibidos?/i.test(text)) return "Relatos Proibidos";
  return text || "Sem categoria";
}

function categoryKey(value?: string) {
  return slugify(categoryLabel(value));
}

function isRelato(video: Video) {
  return video.contentType === "relato" || /relato/i.test(video.category || "") || /relato/i.test(video.title || "");
}

function uniqueByCode(items: Video[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.code || item.slug || item.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildRows(videos: Video[], archives: Archive[], activeCategory: string) {
  const visibleVideos = activeCategory === "todos"
    ? videos
    : videos.filter((video) => categoryKey(video.category) === activeCategory || (activeCategory === "relatos-proibidos" && isRelato(video)));

  const rows: { title: string; eyebrow: string; videos: Video[] }[] = [];

  rows.push({
    title: activeCategory === "todos" ? "Transmissões recentes" : "Mais recentes nesta categoria",
    eyebrow: "RECENTES",
    videos: uniqueByCode(visibleVideos).slice(0, 14),
  });

  const top10 = visibleVideos.filter((video) => /top\s*10/i.test(video.title) || video.tags?.some((tag) => /top\s*10/i.test(tag)));
  if (activeCategory === "todos" && top10.length > 0) {
    rows.push({
      title: "Top 10 e listas investigativas",
      eyebrow: "COLEÇÃO",
      videos: uniqueByCode(top10).slice(0, 12),
    });
  }

  if (activeCategory === "todos") {
    const groups = new Map<string, Video[]>();
    visibleVideos.forEach((video) => {
      if (isRelato(video)) return;
      const label = categoryLabel(video.category || "Transmissões");
      groups.set(label, [...(groups.get(label) || []), video]);
    });

    Array.from(groups.entries()).forEach(([category, items]) => {
      if (items.length > 0) {
        rows.push({
          title: category,
          eyebrow: "DOSSIÊ POR TEMA",
          videos: uniqueByCode(items).slice(0, 16),
        });
      }
    });

    const relatos = visibleVideos.filter(isRelato);
    if (relatos.length > 0) rows.push({ title: "Relatos Proibidos", eyebrow: "TESTEMUNHOS", videos: uniqueByCode(relatos).slice(0, 12) });
  }

  return rows.filter((row) => row.videos.length > 0);
}

function pickHeroItems(content: any, videos: Video[], activeCategory: string) {
  const configured = content.hero?.carouselItems?.length ? content.hero.carouselItems : [];
  const merged = uniqueByCode([...(configured || []), ...(content.featuredTransmission ? [content.featuredTransmission] : []), ...videos]);

  if (activeCategory === "todos") return merged.slice(0, 8);

  const filtered = merged.filter((item) => categoryKey(item.category) === activeCategory || (activeCategory === "relatos-proibidos" && isRelato(item)));
  return filtered.length ? filtered.slice(0, 8) : merged.slice(0, 8);
}

function StreamingCard({ video, onPlay }: { video: Video; onPlay: (video: Video) => void }) {
  return (
    <article className="streamCard">
      <button className="streamThumb" type="button" onClick={() => onPlay(video)} aria-label={`Assistir ${video.title}`}>
        <span className="streamThumbImage" style={{ "--img": `url("${video.image}")` } as React.CSSProperties} />
        <span className="streamPlay">▶</span>
        {video.duration && <span className="streamDuration">{video.duration}</span>}
      </button>
      <div className="streamInfo">
        <span>{video.code}</span>
        <h3>{video.title}</h3>
        <p>{video.description || "Abrir transmissão no arquivo."}</p>
        <div className="streamActions">
          <button type="button" onClick={() => onPlay(video)}>Assistir</button>
          <a href={`/transmissoes/${videoSlug(video)}`}>Dossiê</a>
        </div>
      </div>
    </article>
  );
}

function ArchiveRail({ archives }: { archives: Archive[] }) {
  if (!archives?.length) return null;

  return (
    <section className="streamRow archiveStreamRow">
      <div className="streamRowHead">
        <div>
          <span>ARQUIVOS RECUPERADOS</span>
          <h2>Dossiês para investigação</h2>
        </div>
        <a href="/arquivos">Abrir acervo →</a>
      </div>
      <div className="streamRail">
        {archives.slice(0, 12).map((archive) => (
          <a className="streamCard streamArchiveCard" href={`/arquivos/${archive.slug || slugify(archive.title)}`} key={archive.code}>
            <span className="streamThumb">
              <span className="streamThumbImage" style={{ "--img": `url("${archive.image}")` } as React.CSSProperties} />
              <span className="archiveCode">{archive.code}</span>
            </span>
            <div className="streamInfo">
              <span>{archive.category || "ARQUIVO"}</span>
              <h3>{archive.title}</h3>
              <p>{archive.description || "Documento classificado disponível."}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export function StreamingHome({ content }: { content: any }) {
  const videos = useMemo<Video[]>(() => uniqueByCode([...(content.featuredTransmission ? [content.featuredTransmission] : []), ...(content.videos || [])]), [content.featuredTransmission, content.videos]);
  const [activeCategory, setActiveCategory] = useState("todos");
  const [heroIndex, setHeroIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const heroItems = useMemo(() => pickHeroItems(content, videos, activeCategory), [content, videos, activeCategory]);
  const hero = heroItems[heroIndex] || heroItems[0] || content.featuredTransmission || videos[0];

  useEffect(() => {
    setHeroIndex(0);
  }, [activeCategory, heroItems.length]);

  useEffect(() => {
    if (heroItems.length <= 1) return;
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroItems.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [heroItems.length]);

  const availableCategories = useMemo(() => {
    const fromVideos = videos.map((video) => categoryLabel(video.category)).filter(Boolean);
    const base = (content.categories || [])
      .filter((category: Category) => category.active !== false)
      .map((category: Category) => categoryLabel(category.title));
    return Array.from(new Set([...fromVideos, ...base])).filter((category) => category && category !== "Sem categoria");
  }, [content.categories, videos]);

  const rows = useMemo(() => buildRows(videos, content.archives || [], activeCategory), [videos, content.archives, activeCategory]);

  return (
    <>
      <section className="streamHero terminalPanel">
        <div className="streamHeroMotion" style={{ "--hero": `url("${hero?.image || content.hero?.image}")` } as React.CSSProperties} />
        <div className="streamHeroVeil" />
        <div className="streamHeroMeta">
          <span>TRANSMISSÃO EM DESTAQUE</span>
          <h1>{hero?.title || "O Quarto Elemento"}</h1>
          <p>{hero?.description || content.hero?.description}</p>
          <div className="streamHeroActions">
            <button className="btn btnRed" type="button" onClick={() => setSelectedVideo(hero)}>▶ Assistir transmissão</button>
            <a className="btn" href={`/transmissoes/${videoSlug(hero)}`}>Abrir dossiê →</a>
          </div>
        </div>
        <div className="streamHeroSignal">
          <b>REC ●</b>
          <span>SIGNAL ACTIVE</span>
          <small>QE / STREAM MODE</small>
        </div>

        {heroItems.length > 1 && (
          <>
            <button
              className="streamHeroNav streamHeroNavPrev"
              type="button"
              aria-label="Transmissão anterior"
              onClick={() => setHeroIndex((current) => (current - 1 + heroItems.length) % heroItems.length)}
            >
              ‹
            </button>
            <button
              className="streamHeroNav streamHeroNavNext"
              type="button"
              aria-label="Próxima transmissão"
              onClick={() => setHeroIndex((current) => (current + 1) % heroItems.length)}
            >
              ›
            </button>
            <div className="streamHeroDots" aria-label="Itens em destaque">
              {heroItems.map((item: Video, index: number) => (
                <button
                  type="button"
                  key={`${item.code || item.slug || item.title}-${index}`}
                  className={index === heroIndex ? "active" : ""}
                  aria-label={`Abrir destaque ${index + 1}`}
                  onClick={() => setHeroIndex(index)}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="streamCategoryBar terminalPanel" aria-label="Categorias">
        <button className={activeCategory === "todos" ? "active" : ""} type="button" onClick={() => setActiveCategory("todos")}>Todos</button>
        {availableCategories.map((category) => {
          const key = categoryKey(category);
          return (
            <button className={activeCategory === key ? "active" : ""} type="button" onClick={() => setActiveCategory(key)} key={category}>
              {category}
            </button>
          );
        })}
      </section>

      <section className="streamIntro terminalPanel">
        <div>
          <span>ARQUIVO DIGITAL</span>
          <p>Explore transmissões, relatos e dossiês organizados como uma biblioteca investigativa.</p>
        </div>
        <div className="accessActions">
          <a className="btn btnRed" href="/transmissoes">Ver transmissões →</a>
          <a className="btn" href="/arquivos">Explorar arquivos →</a>
        </div>
      </section>

      <div className="streamRows" id="transmissoes">
        {rows.map((row) => (
          <section className="streamRow" key={`${row.eyebrow}-${row.title}`}>
            <div className="streamRowHead">
              <div>
                <span>{row.eyebrow}</span>
                <h2>{row.title}</h2>
              </div>
              <a href="/transmissoes">Ver todos →</a>
            </div>
            <div className="streamRail">
              {row.videos.map((video) => (
                <StreamingCard video={video} onPlay={setSelectedVideo} key={`${row.title}-${video.code}`} />
              ))}
            </div>
          </section>
        ))}

        <ArchiveRail archives={content.archives || []} />
      </div>

      {selectedVideo && (
        <TransmissionModal
          transmission={{ code: selectedVideo.code, title: selectedVideo.title, youtubeUrl: selectedVideo.youtubeUrl }}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </>
  );
}
