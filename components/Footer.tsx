import content from "@/data/content.json";
import { categoryTransmissionPath } from "@/lib/routes";

export function Footer({ email, categories: categoriesInput }: { email: string; categories?: any[] }) {
  const categories = (categoriesInput ?? content.categories ?? []).slice(0, 6);

  return (
    <footer className="footer">
      <div className="footerBrand">
        <img src="/images/identity-alt.png" alt="O Quarto Elemento" />
        <p>Um arquivo digital dedicado a explorar mistérios, casos reais, lendas e relatos proibidos.</p>
      </div>

      <div>
        <h3>Navegação</h3>
        <a href="/">Início</a>
        <a href="/transmissoes">Transmissões</a>
        <a href="/arquivos">Arquivos</a>
        <a href="/explorar">Explorar</a>
        <a href="/relatos">Relatos</a>
        <a href="/linha-do-tempo">Linha do tempo</a>
        <a href="/contato">Contato</a>
      </div>

      <div>
        <h3>Categorias</h3>
        {categories.map((category: any) => (
          <a href={categoryTransmissionPath(category)} key={category.title}>{category.title}</a>
        ))}
      </div>

      <div>
        <h3>Contato</h3>
        <p>{email}</p>
        <a className="footerButton" href="/contato">Enviar mensagem</a>
      </div>

      <div className="footerEnd">END OF FILE // VERDADE ALÉM DO ALCANCE</div>
    </footer>
  );
}
