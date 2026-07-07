"use client";

import { useEffect, useState } from "react";

const statuses = ["AUTH", "SYNC", "ACTIVE", "READY"];

export function SystemIdentity() {
  const [statusIndex, setStatusIndex] = useState(0);
  const [time, setTime] = useState("");

  useEffect(() => {
    const statusTimer = setInterval(() => {
      setStatusIndex((current) => (current + 1) % statuses.length);
    }, 1600);

    const clockTimer = setInterval(() => {
      setTime(new Date().toLocaleTimeString("pt-BR"));
    }, 1000);

    return () => {
      clearInterval(statusTimer);
      clearInterval(clockTimer);
    };
  }, []);

  return (
    <a className="systemIdentity" href="/" aria-label="O Quarto Elemento Archive System">
      <div className="systemSigil">△</div>
      <div className="systemMain">
        <strong>QUARTO<br />ELEMENTO</strong>
        <span>ARCHIVE SYSTEM</span>
      </div>
      <div className="systemMeta">
        <span>NODE: BR-01</span>
        <span>ACCESS: LV.04</span>
        <span className="systemStatus">{statuses[statusIndex]}</span>
        <span>{time || "00:00:00"}</span>
      </div>
    </a>
  );
}
