"use client";

import { useMemo, useState } from "react";
import { TransmissionModal } from "@/components/TransmissionModal";

type HeroItem = {
  code: string;
  title: string;
  description: string;
  image: string;
  slug: string;
  youtubeUrl?: string;
  category?: string;
};

type HeroConfig = {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  featuredArchiveSlug: string;
  featuredTransmissionSlug: string;
  featuredTransmissionYoutubeUrl?: string;
  carouselItems?: HeroItem[];
  miniLinks?: { label: string; href: string }[];
};

export function DynamicHero({ hero, transmission }: { hero: HeroConfig; transmission?: any }) {
  const items = useMemo(() => {
    const carousel = hero.carouselItems?.length ? hero.carouselItems : [];
    if (carousel.length > 0) return carousel;

    return [{
      code: transmission?.code ?? "QE-TX",
      title: transmission?.title ?? hero.title,
      description: transmission?.description ?? hero.description,
      image: transmission?.image ?? hero.image,
      slug: transmission?.slug ?? hero.featuredTransmissionSlug,
      youtubeUrl: transmission?.youtubeUrl ?? hero.featuredTransmissionYoutubeUrl,
      category: transmission?.category ?? "Transmissão",
    }];
  }, [hero, transmission]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const active = items[activeIndex] ?? items[0];

  function previous() {
    setActiveIndex((current) => current === 0 ? items.length - 1 : current - 1);
  }

  function next() {
    setActiveIndex((current) => current === items.length - 1 ? 0 : current + 1);
  }

  return (
    <>
      <section className="hero dynamicHero carouselHero terminalPanel">
        <div
          className="heroAnimatedBg"
          key={active.image}
          style={{ "--hero": `url("${active.image}")` } as React.CSSProperties}
        />
        <div className="heroCorners" />

        <div className="heroDataLeft heroPromptBlock">
          <p>ARCHIVE // {active.code}</p>
          <p>STATUS: <b>SIGILOSO</b></p>
          <p>CATEGORIA: {active.category ?? "TRANSMISSÃO"}</p>
          <p>AUTOR: DESCONHECIDO</p>
        </div>

        <div className="heroDataRight heroPromptBlock">
          <p>REC ●</p>
          <p>SIGNAL</p>
          <b>ACTIVE</b>
        </div>

        <div className="heroCenter heroCarouselCenter">
          <span className="terminalTyping">{hero.eyebrow}</span>
          <h1>{active.title}</h1>
          <p>{active.description}</p>

          <div className="heroActions">
            <button className="btn btnRed" type="button" onClick={() => setVideoOpen(true)}>
              Assistir transmissão →
            </button>
            <a className="btn" href={`/transmissoes/${active.slug}`}>
              Abrir dossiê →
            </a>
          </div>
        </div>

        {items.length > 1 && (
          <>
            <button className="heroArrow left" type="button" onClick={previous} aria-label="Transmissão anterior">‹</button>
            <button className="heroArrow right" type="button" onClick={next} aria-label="Próxima transmissão">›</button>

            <div className="heroCarouselDots">
              {items.map((item, index) => (
                <button
                  key={`${item.code}-${index}`}
                  type="button"
                  className={index === activeIndex ? "active" : ""}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Ver ${item.title}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="heroMiniLinks">
          {items.slice(0, 5).map((item, index) => (
            <button
              type="button"
              className={index === activeIndex ? "active" : ""}
              onClick={() => setActiveIndex(index)}
              key={`${item.code}-mini`}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className="terminalLine heroPromptLine">&gt; SIGNAL: ACTIVE <i /></div>
      </section>

      {videoOpen && (
        <TransmissionModal
          transmission={{
            code: active.code,
            title: active.title,
            youtubeUrl: active.youtubeUrl,
          }}
          onClose={() => setVideoOpen(false)}
        />
      )}
    </>
  );
}
