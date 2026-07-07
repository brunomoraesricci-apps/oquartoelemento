import { getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { BootScreen } from "@/components/effects/BootScreen";
import { SideRail } from "@/components/SideRail";
import { Navbar } from "@/components/Navbar";
import { DynamicHero } from "@/components/DynamicHero";
import { CategoryGrid } from "@/components/CategoryGrid";
import { FeaturedCase } from "@/components/FeaturedCase";
import { FeaturedTransmission } from "@/components/FeaturedTransmission";
import { ArchiveCard } from "@/components/ArchiveCard";
import { VideoGrid } from "@/components/VideoGrid";
import { RelatosInbox } from "@/components/RelatosInbox";
import { Timeline } from "@/components/Timeline";
import { Footer } from "@/components/Footer";
import { ReportModal } from "@/components/ReportModal";

export const metadata = buildMetadata({
  title: "O Quarto Elemento | Arquivos Investigativos",
  description: "Acesse transmissões, dossiês e relatos classificados sobre mistérios brasileiros, OVNIs, lendas, desaparecimentos e casos inexplicáveis.",
  path: "/",
});

export const dynamic = "force-dynamic";

export default function Home() {
  const content = getContent();
  const sections = {
    featuredTransmission: content.sections?.featuredTransmission !== false,
    categories: content.sections?.categories !== false,
    featuredCase: content.sections?.featuredCase !== false,
    archives: content.sections?.archives !== false,
    transmissions: content.sections?.transmissions !== false,
    reports: content.sections?.reports !== false,
    timeline: content.sections?.timeline !== false,
    newsletter: content.sections?.newsletter !== false,
  };

  return (
    <>
      <BootScreen />
      <SideRail />
      <div className="siteShell">
        <Navbar email={content.site.emailRelatos} sections={content.sections} />

        <main>
          <DynamicHero hero={content.hero} transmission={content.featuredTransmission} />

          <section className="accessStrip terminalPanel">
            <div>
              <span>Arquivo digital</span>
              <p>Acesse transmissões, envie seu relato ou explore o acervo completo.</p>
            </div>
            <div className="accessActions">
              <a className="btn btnRed" href="#transmissoes">▶ Assistir transmissões</a>
              
              <a className="btn" href="/arquivos">Explorar arquivos →</a>
            </div>
          </section>

          {sections.featuredTransmission && <FeaturedTransmission item={content.featuredTransmission} />}
          {sections.categories && <CategoryGrid categories={content.categories} />}
          {sections.featuredCase && <FeaturedCase item={{ ...content.featuredCase, slug: content.featuredArchive?.slug }} />}

          {sections.archives && (
            <section className="section">
              <div className="sectionHead">
                <h2><span>+</span> Explorar arquivos</h2>
                <a href="/arquivos" className="smallLink">Abrir acervo →</a>
              </div>
              <div className="archiveGrid">
                {content.archives.map((archive: any) => (
                  <ArchiveCard archive={archive} key={archive.code} />
                ))}
              </div>
            </section>
          )}

          {(sections.transmissions || sections.reports) && (
            <section id="transmissoes" className="section contentLayout">
              {sections.transmissions && <VideoGrid videos={content.videos} />}
              {sections.reports && <RelatosInbox relatos={content.relatos} email={content.site.emailRelatos} />}
            </section>
          )}

          {sections.timeline && <Timeline items={content.timeline} />}

          {sections.newsletter && (
            <section className="newsletter terminalPanel" id="contato">
              <div className="mail">✉</div>
              <div>
                <h2>Receba conteúdos exclusivos</h2>
                <p>Novos vídeos, bastidores e mistérios diretamente no seu e-mail.</p>
              </div>
              <form>
                <input type="email" placeholder="Seu melhor e-mail" />
                <button className="btn btnRed" type="button">Inscrever →</button>
              </form>
            </section>
          )}
        </main>

        <Footer email={content.site.emailRelatos} />
      </div>
    </>
  );
}
