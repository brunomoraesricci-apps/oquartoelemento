import { ReportModal } from "@/components/ReportModal";

type Relato = {
  code: string;
  title: string;
  subtitle?: string;
  description?: string;
  status?: string;
  location?: string;
  year?: string;
};

export function RelatosInbox({ relatos, email }: { relatos: Relato[]; email: string }) {
  return (
    <aside className="relatosPanel relatosPanelCompact terminalPanel">
      <div className="sectionHead compact">
        <h2><span>+</span> Relatos recebidos</h2>
        <a href="/relatos" className="smallLink">Ver todos →</a>
      </div>

      <div className="relatoCompactList">
        {relatos.slice(0, 4).map((relato) => (
          <a className="relatoCompactItem" href="/relatos" key={relato.code}>
            <span>{relato.code}</span>
            <div>
              <h3>{relato.title}</h3>
              <p>{relato.location ?? "Brasil"} • {relato.year ?? "s/d"} • {relato.status ?? "Recebido"}</p>
            </div>
          </a>
        ))}
      </div>

      <ReportModal email={email} triggerClassName="btn btnRed full" triggerLabel="Enviar seu relato" />
    </aside>
  );
}
