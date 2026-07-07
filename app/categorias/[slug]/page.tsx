import { getPublicContentAsync } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { BootScreen } from "@/components/effects/BootScreen";
import { SideRail } from "@/components/SideRail";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArchiveCard } from "@/components/ArchiveCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function localSlugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getPublicContentAsync();
  const category = (content.categories ?? []).find((item: any) => (item.slug ?? localSlugify(item.title)) === slug);

  if (!category) {
    return buildMetadata({
      title: "Categoria não encontrada",
      description: "A categoria solicitada não foi localizada no sistema do Quarto Elemento.",
      path: `/categorias/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${category.title} | Categoria Investigativa`,
    description: category.description ?? `Transmissões e arquivos catalogados em ${category.title}.`,
    path: `/categorias/${slug}`,
    image: category.image ?? "/images/banner-wide.png",
    keywords: [category.title, "categoria", "arquivo investigativo"],
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getPublicContentAsync();
  const category = (content.categories ?? []).find((item: any) => (item.slug ?? localSlugify(item.title)) === slug);

  if (!category) notFound();

  const transmissions = [content.featuredTransmission, ...(content.videos ?? [])].filter((item: any) =>
    localSlugify(item.category ?? "") === slug
  );

  const archives = (content.archives ?? []).filter((item: any) =>
    localSlugify(item.category ?? "") === slug
  );

  return (
    <>
      <BootScreen />
      <SideRail />
      <div className="siteShell">
        <Navbar email={content.site.emailRelatos} sections={content.sections} contentData={content} />
        <main>
          <Breadcrumb items={[{ label: "Categorias" }, { label: category.title }]} />

          <section className="categoryHero terminalPanel" style={{ "--img": `url("${category.image}")` } as React.CSSProperties}>
            <div>
              <span>Categoria</span>
              <h1>{category.title}</h1>
              <p>{category.description}</p>
            </div>
            <aside>
              <b>{transmissions.length}</b>
              <small>Transmissões</small>
              <b>{archives.length}</b>
              <small>Arquivos</small>
            </aside>
          </section>

          <section className="section">
            <div className="sectionHead">
              <h2><span>+</span> Transmissões</h2>
              <a href={`/transmissoes?categoria=${slug}`} className="smallLink">Ver todas →</a>
            </div>
            {transmissions.length > 0 ? (
              <div className="categoryTransmissionGrid">
                {transmissions.map((item: any) => (
                  <a className="categoryTransmissionCard terminalPanel" href={`/transmissoes/${item.slug}`} key={item.code}>
                    <div style={{ "--img": `url("${item.image}")` } as React.CSSProperties} />
                    <span>{item.code}</span>
                    <h3>{item.title}</h3>
                  </a>
                ))}
              </div>
            ) : (
              <div className="emptyFilter terminalPanel">
                Nenhuma transmissão cadastrada. <a href={`/transmissoes?categoria=${slug}`}>Abrir transmissões filtradas →</a>
              </div>
            )}
          </section>

          <section className="section">
            <div className="sectionHead">
              <h2><span>+</span> Arquivos</h2>
              <a href="/arquivos" className="smallLink">Abrir acervo →</a>
            </div>
            {archives.length > 0 ? (
              <div className="archiveGrid">
                {archives.map((archive: any) => (
                  <ArchiveCard archive={archive} key={archive.code} />
                ))}
              </div>
            ) : (
              <div className="emptyFilter terminalPanel">
                Nenhum arquivo cadastrado nesta categoria.
              </div>
            )}
          </section>
        </main>
        <Footer email={content.site.emailRelatos} categories={content.categories} />
      </div>
    </>
  );
}
