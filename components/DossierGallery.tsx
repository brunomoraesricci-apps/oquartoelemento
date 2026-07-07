export function DossierGallery({ images }: { images: string[] }) {
  const validImages = images.filter(Boolean);

  if (validImages.length === 0) {
    return (
      <div className="emptyGallery">
        <span>SEM IMAGENS CATALOGADAS</span>
      </div>
    );
  }

  return (
    <div className="dossierGallery">
      {validImages.slice(0, 4).map((image, index) => (
        <div
          className="galleryImage"
          style={{ "--img": `url("${image}")` } as React.CSSProperties}
          key={`${image}-${index}`}
        >
          <span>IMG-{String(index + 1).padStart(2, "0")}</span>
        </div>
      ))}
    </div>
  );
}
