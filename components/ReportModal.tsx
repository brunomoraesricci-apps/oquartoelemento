"use client";

import { useRef, useState } from "react";

export function ReportModal({
  email,
  triggerClassName = "btn btnRed",
  triggerLabel = "Enviar relato",
  showIcon = true,
}: {
  email: string;
  triggerClassName?: string;
  triggerLabel?: string;
  showIcon?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [fileError, setFileError] = useState("");
  const [fileName, setFileName] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileError("");
    setFileName("");

    if (!file) return;

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      event.target.value = "";
      setFileError("O anexo deve ter no máximo 10MB.");
      return;
    }

    setFileName(file.name);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nome = String(formData.get("nome") ?? "");
    const userEmail = String(formData.get("email") ?? "");
    const descricao = String(formData.get("descricao") ?? "");

    const subject = encodeURIComponent("Relato enviado pelo site O Quarto Elemento");
    const body = encodeURIComponent(
      [
        "Novo relato recebido pelo site:",
        "",
        `Nome: ${nome}`,
        `E-mail: ${userEmail}`,
        "",
        "Descrição:",
        descricao,
        "",
        fileName
          ? `Anexo informado: ${fileName}\n\nObservação: por limitação do envio via navegador, anexe o arquivo manualmente nesta mensagem. Na versão com backend, o anexo será enviado automaticamente.`
          : "",
      ].join("\n")
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  return (
    <>
      <button className={triggerClassName} type="button" onClick={() => setIsOpen(true)}>
        {showIcon && <span>✉</span>} {triggerLabel}
      </button>

      {isOpen && (
        <div className="reportModal" role="dialog" aria-modal="true">
          <button className="modalBackdrop" onClick={() => setIsOpen(false)} aria-label="Fechar relato" />

          <div className="reportModalPanel">
            <div className="modalHeader">
              <div>
                <span>QE REPORT CHANNEL</span>
                <h2>Enviar relato</h2>
              </div>
              <button onClick={() => setIsOpen(false)} aria-label="Fechar">×</button>
            </div>

            <form className="reportModalForm" ref={formRef} onSubmit={handleSubmit}>
              <label>Nome</label>
              <input name="nome" placeholder="Seu nome ou identificação" required />

              <label>E-mail</label>
              <input name="email" type="email" placeholder="seuemail@email.com" required />

              <label>Descrição do relato</label>
              <textarea
                name="descricao"
                placeholder="Conte o que aconteceu, quando, onde e qualquer detalhe importante..."
                required
              />

              <label>Anexo</label>
              <input name="anexo" type="file" onChange={handleFileChange} />
              <small className={fileError ? "fileWarning" : ""}>
                {fileError || (fileName ? `Arquivo selecionado: ${fileName}` : "Opcional. Limite máximo: 10MB.")}
              </small>

              <div className="reportModalActions">
                <button className="btn" type="button" onClick={() => setIsOpen(false)}>
                  Cancelar
                </button>
                <button className="btn btnRed" type="submit">
                  Transmitir relato →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
