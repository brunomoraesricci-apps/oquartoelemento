"use client";

import { useState } from "react";
import { TransmissionModal, isValidYouTubeUrl, type ModalTransmission } from "@/components/TransmissionModal";
import { ReportModal } from "@/components/ReportModal";

type Report = {
  code: string;
  title: string;
  description?: string;
  subtitle?: string;
  image?: string;
  youtubeUrl?: string;
  category?: string;
  location?: string;
  year?: string;
  status?: string;
  tags?: string[];
};

export function ReportCards({ reports, email }: { reports: Report[]; email: string }) {
  const [selectedReport, setSelectedReport] = useState<ModalTransmission | null>(null);

  return (
    <>
      <section className="reportsIntro terminalPanel">
        <div>
          <span>Canal de recebimento</span>
          <h2>Você presenciou algo inexplicável?</h2>
          <p>
            Envie seu relato com o máximo de detalhes possível. Os registros aprovados podem virar publicações,
            transmissões ou dossiês futuros no Quarto Elemento.
          </p>
        </div>
        <ReportModal
          email={email}
          triggerLabel="Enviar novo relato"
          triggerClassName="btn btnRed"
        />
      </section>

      <section className="reportsVideoGrid">
        {reports.map((report) => {
          const hasVideo = isValidYouTubeUrl(report.youtubeUrl);

          return (
            <article className="reportVideoCard terminalPanel" key={report.code}>
              <button
                type="button"
                className="reportVideoImage"
                style={{ "--img": `url("${report.image || "/images/identity-alt.png"}")` } as React.CSSProperties}
                onClick={() => hasVideo && setSelectedReport({
                  code: report.code,
                  title: report.title,
                  youtubeUrl: report.youtubeUrl,
                })}
                aria-label={hasVideo ? `Assistir ${report.title}` : report.title}
              >
                {hasVideo ? <span>▶</span> : <em>SEM VÍDEO</em>}
              </button>

              <div className="reportVideoCopy">
                <div className="archiveMeta">
                  <span>{report.code}</span>
                  <span>{report.status ?? "Relato"}</span>
                </div>
                <h2>{report.title}</h2>
                <p>{report.description ?? report.subtitle}</p>

                <div className="dossierMiniMeta">
                  <span>{report.location ?? "Brasil"}</span>
                  <span>{report.year ?? "s/d"}</span>
                  <span>{report.category ?? "Relato"}</span>
                </div>

                {hasVideo && (
                  <button className="btn btnRed" type="button" onClick={() => setSelectedReport({
                    code: report.code,
                    title: report.title,
                    youtubeUrl: report.youtubeUrl,
                  })}>
                    Assistir relato →
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {selectedReport && (
        <TransmissionModal
          transmission={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </>
  );
}
