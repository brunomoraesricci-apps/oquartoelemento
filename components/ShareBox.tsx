"use client";

import { useState } from "react";

const PUBLIC_BASE_URL = "https://oquartoelemento.com.br";

export function ShareBox({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${PUBLIC_BASE_URL}${path}`;

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="shareBox">
      <button type="button" onClick={copyLink}>
        <span className="shareIcon">🔗</span>
        {copied ? "Link copiado" : "Copiar link"}
      </button>
      <a href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noreferrer">
        <span className="shareIcon">☘</span>
        WhatsApp
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noreferrer">
        <span className="shareIcon">f</span>
        Facebook
      </a>
      <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noreferrer">
        <span className="shareIcon">𝕏</span>
        X
      </a>
    </div>
  );
}
