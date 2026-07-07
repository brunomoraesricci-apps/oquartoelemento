type Archive = {
  code: string;
  title: string;
  type: string;
  category: string;
  location: string;
  year: string;
  status: string;
  description: string;
  image: string;
  slug?: string;
};

export function ArchiveCard({ archive }: { archive: Archive }) {
  return (
    <a className="archiveCard" href={`/arquivos/${archive.slug ?? "#"}`}>
      <div className="archiveImage" style={{ "--img": `url(${archive.image})` } as React.CSSProperties} />
      <div className="archiveBody">
        <div className="archiveMeta">
          <span>{archive.code}</span>
          <span>{archive.status}</span>
        </div>
        <h3>{archive.title}</h3>
        <p>{archive.description}</p>
        <div className="archiveTags">
          <span>{archive.type}</span>
          <span>{archive.category}</span>
          <span>{archive.location} • {archive.year}</span>
        </div>
      </div>
      <div className="archiveHover">Abrir dossiê →</div>
    </a>
  );
}
