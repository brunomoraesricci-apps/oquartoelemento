type FeaturedCaseData = {
  code: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  slug?: string;
};

export function FeaturedCase({ item }: { item: FeaturedCaseData }) {
  return (
    <section id="arquivos" className="featuredFile terminalPanel">
      <div className="fileCopy">
        <span className="fileCode">Caso {item.code}</span>
        <h1>{item.title}</h1>
        <p className="fileMeta">{item.subtitle}</p>
        <p>{item.description}</p>
        <a className="btn" href={`/arquivos/${item.slug ?? ""}`}>Acessar caso completo →</a>
      </div>
      <div className="fileArt" style={{ "--img": `url(${item.image})` } as React.CSSProperties} />
    </section>
  );
}
