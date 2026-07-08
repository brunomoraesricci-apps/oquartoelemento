"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
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

const revealViewport = { once: true, amount: 0.18 };

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.62, ease: "easeOut" } },
};

const rowReveal: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.58, ease: "easeOut" } },
};

const railReveal: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.08 } },
};

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.44, ease: "easeOut" } },
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
  const label = categoryLabel(video.category);

  return (
    <motion.article className="streamCard streamCardPremium" variants={cardReveal}>
      <button className="streamThumb" type="button" onClick={() => onPlay(video)} aria-label={`Assistir ${video.title}`}>
        <span className="streamThumbImage" style={{ "--img": `url("${video.image}")` } as React.CSSProperties} />
        <span className="streamThumbNoise" aria-hidden="true" />
        <span className="streamPlay streamPlayPremium">▶</span>
        <span className="streamMetaStrip">
          <span>{label}</span>
          {video.duration && <span>{video.duration}</span>}
        </span>
        {video.duration && <span className="streamDuration">{video.duration}</span>}
      </button>
      <div className="streamInfo">
        <div className="streamInfoTop">
          <span>{video.code}</span>
          <b>{isRelato(video) ? "RELATO" : "TRANSMISSÃO"}</b>
        </div>
        <h3>{video.title}</h3>
        <p>{video.description || "Abrir transmissão no arquivo."}</p>
        <div className="streamActions">
          <button type="button" onClick={() => onPlay(video)}>Assistir</button>
          <a href={`/transmissoes/${videoSlug(video)}`}>Dossiê</a>
        </div>
      </div>
    </motion.article>
  );
}

function ArchiveRail({ archives }: { archives: Archive[] }) {
  if (!archives?.length) return null;

  return (
    <motion.section className="streamRow archiveStreamRow" variants={rowReveal} initial="hidden" whileInView="show" viewport={revealViewport}>
      <div className="streamRowHead">
        <div>
          <span>ARQUIVOS RECUPERADOS</span>
          <h2>Dossiês para investigação</h2>
        </div>
        <a href="/arquivos">Abrir acervo →</a>
      </div>
      <motion.div className="streamRail" variants={railReveal}>
        {archives.slice(0, 12).map((archive) => (
          <motion.a variants={cardReveal} className="streamCard streamArchiveCard" href={`/arquivos/${archive.slug || slugify(archive.title)}`} key={archive.code}>
            <span className="streamThumb">
              <span className="streamThumbImage" style={{ "--img": `url("${archive.image}")` } as React.CSSProperties} />
              <span className="archiveCode">{archive.code}</span>
            </span>
            <div className="streamInfo">
              <span>{archive.category || "ARQUIVO"}</span>
              <h3>{archive.title}</h3>
              <p>{archive.description || "Documento classificado disponível."}</p>
            </div>
          </motion.a>
        ))}
      </motion.div>
    </motion.section>
  );
}

export function StreamingHome({ content }: { content: any }) {
  const videos = useMemo<Video[]>(() => uniqueByCode([...(content.featuredTransmission ? [content.featuredTransmission] : []), ...(content.videos || [])]), [content.featuredTransmission, content.videos]);
  const [activeCategory, setActiveCategory] = useState("todos");
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [bootVisible, setBootVisible] = useState(true);
  const [scanMessage, setScanMessage] = useState("ACCESSING ARCHIVE");
  const shouldReduceMotion = useReducedMotion();

  const heroItems = useMemo(() => pickHeroItems(content, videos, activeCategory), [content, videos, activeCategory]);
  const hero = heroItems[heroIndex] || heroItems[0] || content.featuredTransmission || videos[0];

  useEffect(() => {
    setHeroIndex(0);
  }, [activeCategory, heroItems.length]);

  useEffect(() => {
    if (shouldReduceMotion) {
      setBootVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setBootVisible(false), 1500);
    return () => window.clearTimeout(timer);
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion) {
      setScanMessage("SIGNAL ACTIVE");
      return;
    }

    setScanMessage("SCANNING ARCHIVE");
    const foundTimer = window.setTimeout(() => setScanMessage("TRANSMISSION FOUND"), 520);
    const activeTimer = window.setTimeout(() => setScanMessage("SIGNAL ACTIVE"), 1280);
    return () => {
      window.clearTimeout(foundTimer);
      window.clearTimeout(activeTimer);
    };
  }, [heroIndex, activeCategory, shouldReduceMotion]);

  useEffect(() => {
    if (heroItems.length <= 1 || heroPaused) return;
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroItems.length);
    }, 8200);
    return () => window.clearInterval(timer);
  }, [heroItems.length, heroPaused]);

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
      {bootVisible && (
        <div className="immersiveBoot" aria-hidden="true">
          <div className="immersiveBootBox">
            <span>O QUARTO ELEMENTO</span>
            <b>ACCESSING ARCHIVE</b>
            <i />
            <p>ACCESS GRANTED</p>
          </div>
        </div>
      )}

      <motion.section
        className="streamHero streamHeroPremium terminalPanel"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
      >
        <div key={`hero-motion-${hero?.code || hero?.slug || heroIndex}`} className="streamHeroMotion" style={{ "--hero": `url("${hero?.image || content.hero?.image}")` } as React.CSSProperties} />
        <div className="streamHeroVeil" />
        <div key={`hero-copy-${hero?.code || hero?.slug || heroIndex}`} className="streamHeroMeta">
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
          <span>{heroPaused ? "SIGNAL HOLD" : scanMessage}</span>
          <small>{heroItems.length > 1 ? `TRANSMISSION ${heroIndex + 1}/${heroItems.length}` : "QE / STREAM MODE"}</small>
        </div>
        <div className="streamHeroScan" aria-hidden="true">
          <span>{scanMessage}</span>
          <b>{hero?.code || "QE-STREAM"}</b>
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
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </motion.section>

      <motion.section className="streamCategoryBar terminalPanel" aria-label="Categorias" variants={fadeUp} initial="hidden" whileInView="show" viewport={revealViewport}>
        <button className={activeCategory === "todos" ? "active" : ""} type="button" onClick={() => setActiveCategory("todos")}>Todos</button>
        {availableCategories.map((category) => {
          const key = categoryKey(category);
          return (
            <button className={activeCategory === key ? "active" : ""} type="button" onClick={() => setActiveCategory(key)} key={category}>
              {category}
            </button>
          );
        })}
      </motion.section>

      <motion.section className="streamIntro terminalPanel" variants={fadeUp} initial="hidden" whileInView="show" viewport={revealViewport}>
        <div>
          <span>ARQUIVO DIGITAL</span>
          <p>Explore transmissões, relatos e dossiês organizados como uma biblioteca investigativa.</p>
        </div>
        <div className="accessActions">
          <a className="btn btnRed" href="/transmissoes">Ver transmissões →</a>
          <a className="btn" href="/arquivos">Explorar arquivos →</a>
        </div>
      </motion.section>

      <div className="streamRows" id="transmissoes">
        {rows.map((row) => (
          <motion.section className="streamRow" key={`${row.eyebrow}-${row.title}`} variants={rowReveal} initial="hidden" whileInView="show" viewport={revealViewport}>
            <div className="streamRowHead">
              <div>
                <span>{row.eyebrow}</span>
                <h2>{row.title}</h2>
              </div>
              <a href="/transmissoes">Ver todos →</a>
            </div>
            <motion.div className="streamRail" variants={railReveal}>
              {row.videos.map((video) => (
                <StreamingCard video={video} onPlay={setSelectedVideo} key={`${row.title}-${video.code}`} />
              ))}
            </motion.div>
          </motion.section>
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
