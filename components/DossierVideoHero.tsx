"use client";

import { useState } from "react";
import { TransmissionModal, type ModalTransmission } from "@/components/TransmissionModal";

export function DossierVideoHero({
  image,
  transmission,
}: {
  image: string;
  transmission?: ModalTransmission | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!transmission) {
    return (
      <div className="dossierImage" style={{ "--img": `url("${image}")` } as React.CSSProperties}>
        <div className="dossierSeal">DOCUMENTO CLASSIFICADO</div>
      </div>
    );
  }

  return (
    <>
      <button
        className="dossierImage dossierVideoTrigger"
        style={{ "--img": `url("${image}")` } as React.CSSProperties}
        onClick={() => setIsOpen(true)}
        type="button"
        aria-label={`Assistir ${transmission.title}`}
      >
        <div className="dossierSeal">TRANSMISSÃO RELACIONADA</div>
        <div className="dossierPlay">
          <span>▶</span>
          <strong>Abrir vídeo</strong>
        </div>
      </button>

      {isOpen && (
        <TransmissionModal
          transmission={transmission}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
