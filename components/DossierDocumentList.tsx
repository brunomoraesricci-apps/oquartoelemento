type DocumentItem = {
  title: string;
  type: string;
  status: string;
};

export function DossierDocumentList({ documents }: { documents: DocumentItem[] }) {
  return (
    <div className="documentList">
      {documents.map((document, index) => (
        <article className="documentItem" key={`${document.title}-${index}`}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div>
            <b>{document.title}</b>
            <p>{document.type}</p>
          </div>
          <em>{document.status}</em>
        </article>
      ))}
    </div>
  );
}
