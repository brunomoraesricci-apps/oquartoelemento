import { getPublicContentAsync } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { BootScreen } from "@/components/effects/BootScreen";
import { SideRail } from "@/components/SideRail";
import { Navbar } from "@/components/Navbar";
import { StreamingHome } from "@/components/StreamingHome";
import { Timeline } from "@/components/Timeline";
import { Footer } from "@/components/Footer";

export const metadata = buildMetadata({
  title: "O Quarto Elemento | Arquivos Investigativos",
  description: "Acesse transmissões, dossiês e relatos classificados sobre mistérios brasileiros, OVNIs, lendas, desaparecimentos e casos inexplicáveis.",
  path: "/",
});

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getPublicContentAsync();
  const showTimeline = content.sections?.timeline !== false;

  return (
    <>
      <BootScreen />
      <SideRail />
      <div className="siteShell">
        <Navbar email={content.site.emailRelatos} sections={content.sections} contentData={content} />

        <main>
          <StreamingHome content={content} />
          {showTimeline && <Timeline items={content.timeline} />}
        </main>

        <Footer email={content.site.emailRelatos} categories={content.categories} />
      </div>
    </>
  );
}
