"use client";

import { useEffect, useMemo, useState } from "react";

type SearchItem = {
  type: "Transmissão" | "Arquivo" | "Categoria" | "Relato";
  title: string;
  description?: string;
  href: string;
  meta?: string;
  tags?: string[];
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function GlobalSearch({ content }: { content: any }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const items = useMemo<SearchItem[]>(() => {
    const transmissions = [content.featuredTransmission, ...(content.videos ?? [])].map((item: any) => ({
      type: "Transmissão" as const,
      title: item.title,
      description: item.description,
      href: `/transmissoes/${item.slug}`,
      meta: `${item.category ?? "Transmissão"} • ${item.year ?? "Arquivo"}`,
      tags: item.tags ?? [],
    }));

    const archives = (content.archives ?? []).map((item: any) => ({
      type: "Arquivo" as const,
      title: item.title,
      description: item.summary ?? item.description,
      href: `/arquivos/${item.slug}`,
      meta: `${item.category ?? "Arquivo"} • ${item.location ?? ""} • ${item.year ?? ""}`,
      tags: item.tags ?? [],
    }));

    const categories = (content.categories ?? []).map((item: any) => ({
      type: "Categoria" as const,
      title: item.title,
      description: item.description,
      href: `/transmissoes?categoria=${item.slug}`,
      meta: "Categoria",
      tags: [item.title],
    }));

    const reports = (content.relatos ?? []).map((item: any) => ({
      type: "Relato" as const,
      title: item.title,
      description: item.subtitle,
      href: "/relatos",
      meta: item.code,
      tags: ["Relato"],
    }));

    return [...transmissions, ...archives, ...categories, ...reports];
  }, [content]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (q.length < 2 || !isOpen) return [];

    return items
      .filter((item) => {
        const haystack = normalize([
          item.type,
          item.title,
          item.description,
          item.meta,
          ...(item.tags ?? []),
        ].join(" "));
        return haystack.includes(q);
      })
      .slice(0, 8);
  }, [items, query, isOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="globalSearch">
      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Pesquisar arquivos..."
        aria-label="Pesquisar arquivos"
      />

      {results.length > 0 && (
        <div className="searchResults">
          {results.map((item) => (
            <a href={item.href} key={`${item.type}-${item.title}`} onClick={() => setIsOpen(false)}>
              <span>{item.type}</span>
              <strong>{item.title}</strong>
              <p>{item.meta}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
