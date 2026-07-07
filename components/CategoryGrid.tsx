type Category = {
  title: string;
  symbol: string;
  image: string;
};

function categorySlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section id="categorias" className="section">
      <div className="sectionHead">
        <h2><span>+</span> Navegue por categorias</h2>
        <a href="#" className="smallLink">Ver todas →</a>
      </div>

      <div className="categoryGrid">
        {categories.map((category) => (
          <a className="categoryCard" style={{ "--img": `url(${category.image})` } as React.CSSProperties} href={`/categorias/${categorySlug(category.title)}`} key={category.title}>
            <i>{category.symbol}</i>
            <b>{category.title}</b>
          </a>
        ))}
      </div>
    </section>
  );
}
