import { getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { BootScreen } from "@/components/effects/BootScreen";
import { SideRail } from "@/components/SideRail";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/pages/PageHeader";

export const metadata = buildMetadata({
  title: "Contato | Canal Institucional",
  description: "Entre em contato com O Quarto Elemento para parcerias, correções, sugestões e mensagens institucionais.",
  path: "/contato",
});

export const dynamic = "force-dynamic";

export default function ContatoPage() {
  const content = getContent();

  return (
    <>
      <BootScreen />
      <SideRail />
      <div className="siteShell">
        <Navbar email={content.site.emailRelatos} sections={content.sections} />

        <main>
          <PageHeader
            eyebrow="Canal de contato"
            title="Contato"
            description="Envie uma mensagem para o Quarto Elemento. Para relatos, use o campo específico e inclua o máximo de detalhes possível."
          />

          <section className="contactGrid">
            <form className="contactForm terminalPanel">
              <label>Nome</label>
              <input placeholder="Seu nome ou identificação" />

              <label>E-mail</label>
              <input placeholder="seuemail@email.com" />

              <label>Assunto</label>
              <select>
                <option>Contato geral</option>
                <option>Relato para análise</option>
                <option>Parceria</option>
                <option>Correção ou sugestão</option>
              </select>

              <label>Mensagem</label>
              <textarea placeholder="Digite sua mensagem..." />

              <a
                className="btn btnRed"
                href={`mailto:${content.site.emailRelatos}?subject=Contato pelo site O Quarto Elemento`}
              >
                Enviar por e-mail →
              </a>
            </form>

            <aside className="contactSide terminalPanel">
              <h2>Canais oficiais</h2>
              <div className="contactRow">
                <span>Relatos</span>
                <a href={`mailto:${content.site.emailRelatos}`}>{content.site.emailRelatos}</a>
              </div>
              <div className="contactRow">
                <span>Contato</span>
                <a href="mailto:contato@oquartoelemento.com.br">contato@oquartoelemento.com.br</a>
              </div>
              <div className="contactRow">
                <span>Parcerias</span>
                <a href="mailto:parceria@oquartoelemento.com.br">parceria@oquartoelemento.com.br</a>
              </div>
            </aside>
          </section>
        </main>

        <Footer email={content.site.emailRelatos} />
      </div>
    </>
  );
}
