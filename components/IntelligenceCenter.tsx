"use client";

import { useMemo, useState } from "react";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function localSlugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function IntelligenceCenter({ content }: { content: any }) {
  const transmissions = [content.featuredTransmission, ...(content.videos ?? [])];
  const archives = content.archives ?? [];
  const categories = content.categories ?? [];
  const reports = content.relatos ?? [];

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("todos");
  const [type, setType] = useState("todos");
  const [year, setYear] = useState("");
  const [state, setState] = useState("");
  const [localityCodes, setLocalityCodes] = useState<string[]>([]);

  const searchableItems = useMemo(() => {
    const archiveItems = archives.map((item: any) => ({
      kind: "Arquivo",
      title: item.title,
      description: item.summary ?? item.description,
      category: item.category,
      type: item.type ?? "Arquivo",
      year: item.year,
      state: item.location,
      tags: item.tags ?? [],
      href: `/arquivos/${item.slug}`,
      image: item.image,
      code: item.code,
      views: item.views ?? 0,
    }));

    const transmissionItems = transmissions.map((item: any) => ({
      kind: "Transmissão",
      title: item.title,
      description: item.description,
      category: item.category,
      type: "Transmissão",
      year: item.year ?? item.publishedAt,
      state: item.location,
      tags: item.tags ?? [],
      href: `/transmissoes/${item.slug}`,
      image: item.image,
      code: item.code,
      views: item.views ?? "0",
    }));

    const reportItems = reports.map((item: any) => ({
      kind: "Relato",
      title: item.title,
      description: item.description ?? item.subtitle,
      category: item.category ?? "Relato",
      type: "Relato",
      year: item.year,
      state: item.location,
      tags: item.tags ?? ["Relato"],
      href: "/relatos",
      image: "/images/identity-alt.png",
      code: item.code,
      views: 0,
    }));

    return [...archiveItems, ...transmissionItems, ...reportItems];
  }, [archives, transmissions]);

  const filtered = useMemo(() => {
    return searchableItems.filter((item: any) => {
      const haystack = normalize([
        item.title,
        item.description,
        item.category,
        item.type,
        item.year,
        item.state,
        ...(item.tags ?? []),
      ].join(" "));

      const matchesQuery = query.trim().length === 0 || haystack.includes(normalize(query));
      const matchesCategory = category === "todos" || normalize(item.category ?? "") === normalize(category);
      const matchesType = type === "todos" || normalize(item.type ?? item.kind) === normalize(type);
      const matchesYear = year.trim().length === 0 || String(item.year ?? "").includes(year.trim());
      const matchesState =
        state.trim().length === 0 ||
        normalize(String(item.state ?? "")).includes(normalize(state)) ||
        localityCodes.includes(item.code);

      return matchesQuery && matchesCategory && matchesType && matchesYear && matchesState;
    });
  }, [searchableItems, query, category, type, year, state, localityCodes]);

  function openRandomArchive() {
    const list = archives.length > 0 ? archives : searchableItems;
    const item = list[Math.floor(Math.random() * list.length)];
    if (item) {
      window.location.href = item.slug ? `/arquivos/${item.slug}` : item.href;
    }
  }

  const popular = [...searchableItems]
    .sort((a: any, b: any) => Number(String(b.views).replace(/\D/g, "") || 0) - Number(String(a.views).replace(/\D/g, "") || 0))
    .slice(0, 4);

  const latest = [...searchableItems].slice(0, 4);

  return (
    <>
      <section className="intelligenceStats">
        <div><b>{archives.length}</b><span>Arquivos</span></div>
        <div><b>{transmissions.length}</b><span>Transmissões</span></div>
        <div><b>{categories.length}</b><span>Categorias</span></div>
        <div><b>{reports.length}</b><span>Relatos</span></div>
      </section>

      <section className="advancedSearch terminalPanel">
        <div className="advancedSearchHeader">
          <span>Pesquisa avançada</span>
          <button className="btn btnRed" type="button" onClick={openRandomArchive}>Abrir arquivo aleatório</button>
        </div>

        <div className="advancedSearchGrid">
          <input placeholder="Pesquisar..." value={query} onChange={(event) => setQuery(event.target.value)} />

          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="todos">Todas as categorias</option>
            {categories.map((item: any) => (
              <option value={item.title} key={item.title}>{item.title}</option>
            ))}
          </select>

          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="todos">Todos os tipos</option>
            <option value="Arquivo">Arquivo</option>
            <option value="Caso">Caso</option>
            <option value="Transmissão">Transmissão</option>
          </select>

          <input placeholder="Ano" value={year} onChange={(event) => setYear(event.target.value)} />
          <input placeholder="Local/Estado" value={state} onChange={(event) => setState(event.target.value)} />
        </div>

        <p className="searchCount">{filtered.length} registro(s) encontrado(s)</p>

        <div className="advancedResults">
          {filtered.slice(0, 9).map((item: any) => (
            <a className="advancedResultCard" href={item.href} key={`${item.kind}-${item.code}-${item.title}`}>
              <div style={{ "--img": `url("${item.image}")` } as React.CSSProperties} />
              <span>{item.kind} // {item.code}</span>
              <h3>{item.title}</h3>
              <p>{item.category} • {item.year ?? "s/d"}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="intelligenceGrid">
        <article className="terminalPanel intelligenceBlock">
          <div className="sectionHead">
            <h2><span>+</span> Mais acessados</h2>
          </div>
          {popular.map((item: any, index: number) => (
            <a className="rankedItem" href={item.href} key={`${item.title}-${index}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{item.title}</b>
              <small>{item.kind}</small>
            </a>
          ))}
        </article>

        <article className="terminalPanel intelligenceBlock">
          <div className="sectionHead">
            <h2><span>+</span> Últimos adicionados</h2>
          </div>
          {latest.map((item: any, index: number) => (
            <a className="rankedItem" href={item.href} key={`${item.title}-${index}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{item.title}</b>
              <small>{item.kind}</small>
            </a>
          ))}
        </article>
      </section>

      <section className="localityPanel terminalPanel">
        <div className="sectionHead">
          <h2><span>+</span> Explorar por localidade</h2>
          <button className="smallLink mapClear" type="button" onClick={() => { setState(""); setLocalityCodes([]); }}>Limpar filtro →</button>
        </div>

        <div className="localityGrid">
          {(content.discovery?.featuredStates ?? []).map((pin: any) => {
            const codes = pin.archiveCodes ?? [];
            const amount = searchableItems.filter((item: any) =>
              normalize(String(item.state ?? "")).includes(normalize(pin.label)) ||
              codes.includes(item.code)
            ).length;

            return (
              <button
                type="button"
                className={normalize(state) === normalize(pin.label) ? "localityCard active" : "localityCard"}
                key={pin.state}
                onClick={() => {
                  setState(pin.label);
                  setLocalityCodes(codes);
                }}
              >
                <span>{pin.state}</span>
                <b>{pin.label}</b>
                <small>{amount} registro(s)</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="connectionPanel terminalPanel">
        <div>
          <span>Conexões encontradas</span>
          <h2>Arquivos ligados por categoria, localização e tags.</h2>
          <p>Esta área prepara a futura navegação inteligente entre casos relacionados.</p>
        </div>
        <div className="connectionList">
          {archives.slice(0, 4).map((archive: any, index: number) => (
            <a href={`/arquivos/${archive.slug}`} key={archive.code}>
              <b>{archive.title}</b>
              <span>{90 - index * 7}% conexão</span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
