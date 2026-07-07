"use client";

import { useEffect, useMemo, useState } from "react";

export function LiveArchiveHero({ lines }: { lines: string[] }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [time, setTime] = useState("");

  const currentLine = useMemo(() => lines[lineIndex % lines.length] ?? "ACCESSING_ARCHIVE...", [lines, lineIndex]);

  useEffect(() => {
    const clock = setInterval(() => {
      const d = new Date();
      setTime(d.toLocaleTimeString("pt-BR"));
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    setTyped("");
    let i = 0;
    const typer = setInterval(() => {
      i += 1;
      setTyped(currentLine.slice(0, i));
      if (i >= currentLine.length) {
        clearInterval(typer);
        setTimeout(() => setLineIndex((v) => v + 1), 1800);
      }
    }, 45);
    return () => clearInterval(typer);
  }, [currentLine]);

  return (
    <section className="hero">
      <a className="heroBanner" href="/arquivos/operacao-prato">
        <div className="heroBg" />

        <div className="corner c1" /><div className="corner c2" /><div className="corner c3" /><div className="corner c4" />

        <div className="heroHud left">
          <p>ARCHIVE // 04-1984-∞</p>
          <p>STATUS: <strong>SIGILOSO</strong></p>
          <p>NÍVEL DE ACESSO: 4</p>
          <p>AUTOR: DESCONHECIDO</p>
        </div>

        <div className="heroHud right">
          <p>REC ●</p>
          <strong>{time || "00:00:00"}</strong>
          <p>SIGNAL</p>
          <strong>ACTIVE</strong>
        </div>

        <div className="terminalLayer">
          <span>&gt; {typed}</span><i />
        </div>

        <div className="monitorTicker">
          <span>OPERAÇÃO PRATO</span>
          <span>DYATLOV PASS</span>
          <span>UBATUBA 1957</span>
          <span>RELATO RP-002</span>
          <span>TOP 10 DESAPARECIMENTOS</span>
        </div>

        <div className="heroHover">
          <span>▶</span>
          <strong>Abrir arquivo</strong>
        </div>
      </a>
    </section>
  );
}
