"use client";

import { usePathname } from "next/navigation";
import { SystemIdentity } from "@/components/SystemIdentity";
import { ReportModal } from "@/components/ReportModal";
import { GlobalSearch } from "@/components/GlobalSearch";
import content from "@/data/content.json";

type SectionsConfig = {
  featuredTransmission?: boolean;
  categories?: boolean;
  featuredCase?: boolean;
  archives?: boolean;
  transmissions?: boolean;
  reports?: boolean;
  timeline?: boolean;
  newsletter?: boolean;
  intelligence?: boolean;
};

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Navbar({ email, sections, contentData }: { email: string; sections?: SectionsConfig; contentData?: any }) {
  const pathname = usePathname();
  const isVisible = (key: keyof SectionsConfig) => sections?.[key] !== false;

  const navItems = [
    { label: "Início", href: "/", visible: true },
    { label: "Transmissões", href: "/transmissoes", visible: isVisible("transmissions") },
    { label: "Arquivos", href: "/arquivos", visible: isVisible("archives") },
    { label: "Explorar", href: "/explorar", visible: isVisible("intelligence") },
    { label: "Relatos", href: "/relatos", visible: isVisible("reports") },
    { label: "Linha do tempo", href: "/linha-do-tempo", visible: isVisible("timeline") },
    { label: "Contato", href: "/contato", visible: true },
  ];

  return (
    <header className="topbar">
      <SystemIdentity />

      <nav className="nav">
        {navItems.filter((item) => item.visible).map((item) => (
          <a
            href={item.href}
            className={isActive(pathname, item.href) ? "active" : ""}
            key={item.href}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="topActions">
        <GlobalSearch content={contentData ?? content} />
        <span className="rec">REC <i /></span>
        <ReportModal email={email} />
      </div>
    </header>
  );
}
