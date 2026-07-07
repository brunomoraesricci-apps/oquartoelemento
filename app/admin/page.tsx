"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

type Section = "dashboard" | "transmissions" | "archives" | "reports" | "categories" | "pipeline" | "hero" | "timeline" | "settings" | "json";

type FieldGroup = {
  title: string;
  description?: string;
  fields: string[];
  defaultOpen?: boolean;
};

const labels: Record<Section, string> = {
  dashboard: "Dashboard",
  transmissions: "Transmissões",
  archives: "Arquivos",
  reports: "Relatos",
  categories: "Categorias",
  pipeline: "Central de Publicação",
  hero: "Hero",
  timeline: "Timeline",
  settings: "Configurações",
  json: "Modo Dev",
};

const sidebarGroups: { title: string; items: Section[] }[] = [
  { title: "Central", items: ["dashboard"] },
  { title: "Conteúdo", items: ["transmissions", "archives", "reports", "categories"] },
  { title: "Publicação", items: ["pipeline", "hero", "timeline"] },
  { title: "Sistema", items: ["settings", "json"] },
];

const CATEGORY_OPTIONS = ["OVNIs e Fenômenos", "Desaparecimentos", "Lendas e Mitos", "Civilizações Perdidas", "Relatos Proibidos", "Deep Web", "Relatos"];
const STATUS_OPTIONS = ["Publicado", "Rascunho", "Oculto", "Em análise", "Recebido"];
const CLASSIFICATION_OPTIONS = ["Desclassificado", "Confidencial", "Restrito", "Ultrassecreto", "Arquivo incompleto", "Em investigação"];
const CHIP_FIELDS = ["tags", "relatedArchives", "relatedReportCodes"];

const transmissionGroups: FieldGroup[] = [
  { title: "Conteúdo principal", description: "Campos que aparecem diretamente para o visitante.", fields: ["code", "title", "slug", "description", "image", "youtubeUrl", "category", "status"], defaultOpen: true },
  { title: "Metadados editoriais", description: "Informações de classificação e organização do acervo.", fields: ["location", "year", "tags"] },
  { title: "Relacionamentos", description: "Conexões manuais entre transmissões, arquivos e relatos.", fields: ["relatedArchives", "relatedReportCodes"] },
  { title: "SEO e compartilhamento", description: "Preparado para Google, WhatsApp, Facebook, Discord e outras redes.", fields: ["seoTitle", "seoDescription", "ogImage"] },
  { title: "Automação futura", description: "Campos reservados para o copiloto editorial com IA.", fields: ["aiNotes"] },
  { title: "Hero", description: "Controle se esta transmissão aparece no carrossel da Home.", fields: ["showInHero", "heroOrder"] },
];

const archiveGroups: FieldGroup[] = [
  { title: "Conteúdo principal", description: "Base do dossiê exibido no site.", fields: ["code", "title", "slug", "summary", "description", "longDescription", "image", "category", "status"], defaultOpen: true },
  { title: "Classificação do arquivo", description: "Elementos de imersão do sistema investigativo.", fields: ["location", "year", "classification", "accessLevel", "tags"] },
  { title: "Relacionamentos", description: "Conecta o dossiê a uma transmissão, outros arquivos e relatos.", fields: ["relatedTransmissionSlug", "relatedArchives", "relatedReportCodes"] },
  { title: "SEO e compartilhamento", description: "Campos técnicos para indexação e prévia de links.", fields: ["seoTitle", "seoDescription", "ogImage"] },
  { title: "Automação futura", description: "Notas usadas futuramente pela IA para sugerir conteúdo e conexões.", fields: ["aiNotes"] },
];

const reportGroups: FieldGroup[] = [
  { title: "Conteúdo principal", description: "Campos do relato exibido para a comunidade.", fields: ["code", "title", "subtitle", "description", "image", "youtubeUrl", "category", "status"], defaultOpen: true },
  { title: "Metadados editoriais", description: "Contexto básico para organizar o relato no acervo.", fields: ["location", "year", "tags"] },
  { title: "Relacionamentos", description: "Amarra o relato ao dossiê e à transmissão mais relevantes.", fields: ["relatedArchiveSlug", "relatedTransmissionSlug"] },
  { title: "SEO e compartilhamento", description: "Campos opcionais caso o relato ganhe página ou destaque futuro.", fields: ["seoTitle", "seoDescription", "ogImage"] },
  { title: "Automação futura", description: "Notas para classificação automática com IA.", fields: ["aiNotes"] },
];

const categoryGroups: FieldGroup[] = [
  { title: "Conteúdo principal", description: "Definição da categoria exibida no site.", fields: ["title", "slug", "symbol", "description", "image", "status", "order", "active"], defaultOpen: true },
  { title: "SEO e compartilhamento", description: "Prévia e indexação da página de categoria.", fields: ["seoTitle", "seoDescription", "ogImage"] },
  { title: "Automação futura", description: "Notas para uso posterior pelo copiloto editorial.", fields: ["aiNotes"] },
];

const timelineGroups: FieldGroup[] = [
  { title: "Evento cronológico", fields: ["year", "title", "text"], defaultOpen: true },
];

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

function label(field: string) {
  const map: Record<string, string> = {
    title: "Título", slug: "Slug", code: "Código", description: "Descrição curta", longDescription: "Texto principal",
    summary: "Resumo", image: "Imagem / Thumbnail", youtubeUrl: "YouTube URL", category: "Categoria", status: "Status",
    tags: "Tags", location: "Local", year: "Ano", subtitle: "Subtítulo", classification: "Classificação",
    accessLevel: "Nível de acesso", relatedTransmissionSlug: "Transmissão relacionada", showInHero: "Exibir no Hero",
    heroOrder: "Ordem no Hero", emailRelatos: "E-mail de relatos", youtubeUrlSite: "URL YouTube", instagramUrl: "URL Instagram",
    text: "Texto", eyebrow: "Texto superior", primaryActionLabel: "Botão principal", secondaryActionLabel: "Botão secundário",
    featuredArchiveSlug: "Arquivo destaque", featuredTransmissionSlug: "Transmissão destaque", featuredTransmissionYoutubeUrl: "YouTube destaque",
    seoTitle: "SEO: título", seoDescription: "SEO: descrição", ogImage: "OpenGraph: imagem", aiNotes: "IA: notas para automação", aiSourceUrl: "IA: URL fonte", aiGenerated: "Gerado por IA", aiReviewed: "Revisado",
    relatedArchives: "Arquivos relacionados", relatedReportCodes: "Relatos relacionados", relatedArchiveSlug: "Arquivo relacionado", active: "Categoria ativa", order: "Ordem", symbol: "Símbolo"
  };
  return map[field] ?? field;
}

function emptyTransmission(index: number) {
  return { code: `QE-TX-${String(index + 1).padStart(3, "0")}`, title: "Nova transmissão", slug: "nova-transmissao", description: "Descrição da transmissão.", image: "", youtubeUrl: "", category: "OVNIs e Fenômenos", status: "Rascunho", tags: ["Transmissão"], location: "Brasil", year: "2026", relatedArchives: [], relatedReportCodes: [], seoTitle: "", seoDescription: "", ogImage: "", aiNotes: "", showInHero: false, heroOrder: index + 1 };
}
function emptyArchive(index: number) {
  return { code: `QE-${String(index + 1).padStart(3, "0")}`, title: "Novo arquivo", slug: "novo-arquivo", summary: "Resumo do arquivo.", description: "Descrição curta do arquivo.", longDescription: "Texto principal do dossiê.", image: "", category: "OVNIs e Fenômenos", status: "Rascunho", location: "Brasil", year: "2026", classification: "Confidencial", accessLevel: "LV.04", relatedTransmissionSlug: "", relatedArchives: [], relatedReportCodes: [], seoTitle: "", seoDescription: "", ogImage: "", aiNotes: "", tags: ["Arquivo"] };
}
function emptyReport(index: number) {
  return { code: `RP-${String(index + 1).padStart(3, "0")}`, title: "Novo relato", subtitle: "Relato recebido", description: "Breve descrição do relato.", image: "", youtubeUrl: "", category: "Relatos", status: "Recebido", location: "Brasil", year: "2026", relatedArchiveSlug: "", relatedTransmissionSlug: "", seoTitle: "", seoDescription: "", ogImage: "", aiNotes: "", tags: ["Relato"] };
}
function emptyCategory(index: number) {
  return { title: "Nova categoria", slug: `nova-categoria-${index + 1}`, symbol: "◇", image: "", description: "Descrição da categoria.", status: "Publicado", order: index + 1, seoTitle: "", seoDescription: "", ogImage: "", aiNotes: "", active: true };
}


type QePackageBlock = { type: string; data: Record<string, any> };
type QePackageResult = { version: string; blocks: QePackageBlock[]; errors: string[] };

const BLOCK_TYPES = ["TRANSMISSION", "ARCHIVE", "REPORT", "CATEGORY", "HERO", "TIMELINE"];

function normalizeKey(key: string) {
  return key.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function normalizeValue(key: string, raw: string) {
  const value = raw.trim();
  const lines = value.split("\n").map((line) => line.trim()).filter(Boolean);
  const arrayKeys = ["tags", "related_archives", "related_reports", "related_report_codes", "keywords"];
  if (arrayKeys.includes(key)) {
    if (lines.some((line) => line.startsWith("-"))) return lines.map((line) => line.replace(/^-\s*/, "")).filter(Boolean);
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  if (lines.length && lines.every((line) => line.startsWith("-"))) return lines.map((line) => line.replace(/^-\s*/, "")).filter(Boolean);
  if (["hero", "show_in_hero", "active"].includes(key)) return ["true", "sim", "yes", "1", "published", "publicado"].includes(value.toLowerCase());
  return value;
}

function parseQePackage(input: string): QePackageResult {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const result: QePackageResult = { version: "1.0", blocks: [], errors: [] };
  let currentType = "";
  let currentData: Record<string, any> = {};
  let currentKey = "";
  let buffer: string[] = [];

  const flushField = () => {
    if (!currentType || !currentKey) return;
    currentData[currentKey] = normalizeValue(currentKey, buffer.join("\n"));
    currentKey = "";
    buffer = [];
  };
  const closeBlock = () => {
    flushField();
    if (currentType) result.blocks.push({ type: currentType, data: currentData });
    currentType = "";
    currentData = {};
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || /^=+$/.test(line)) continue;
    const upper = line.toUpperCase();
    const headerMatch = line.match(/^(QE_PACKAGE_VERSION|VERSION)\s*:\s*(.+)$/i);
    if (!currentType && headerMatch) { result.version = headerMatch[2].trim(); continue; }
    if (BLOCK_TYPES.includes(upper)) { if (currentType) closeBlock(); currentType = upper; currentData = {}; continue; }
    if (currentType && upper === `END_${currentType}`) { closeBlock(); continue; }
    if (!currentType) continue;
    const fieldMatch = rawLine.match(/^\s*([A-Za-z0-9_ -]+)\s*:\s*(.*)$/);
    if (fieldMatch) {
      flushField();
      currentKey = normalizeKey(fieldMatch[1]);
      buffer = fieldMatch[2] ? [fieldMatch[2]] : [];
    } else if (currentKey) {
      buffer.push(rawLine);
    }
  }
  if (currentType) closeBlock();
  if (!result.blocks.length) result.errors.push("Nenhum bloco válido encontrado. Use TRANSMISSION, ARCHIVE, REPORT, CATEGORY, HERO ou TIMELINE.");
  return result;
}

function getField(data: Record<string, any>, ...keys: string[]) {
  for (const key of keys) {
    const normalized = normalizeKey(key);
    if (data[normalized] !== undefined && data[normalized] !== "") return data[normalized];
  }
  return undefined;
}

function asArray(value: any): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (!value) return [];
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function upsertBySlug(list: any[], item: any) {
  const slug = item.slug || slugify(item.title || "novo-item");
  const normalized = { ...item, slug };
  const index = list.findIndex((existing) => existing.slug === slug || existing.code === item.code);
  if (index >= 0) {
    const next = [...list];
    next[index] = { ...next[index], ...normalized };
    return next;
  }
  return [...list, normalized];
}

function blockToContent(block: QePackageBlock, content: any) {
  const data = block.data;
  if (block.type === "TRANSMISSION") {
    const item = emptyTransmission(content.videos?.length ?? 0);
    return {
      ...item,
      code: getField(data, "code") ?? item.code,
      title: getField(data, "title") ?? item.title,
      slug: getField(data, "slug") ?? slugify(getField(data, "title") ?? item.title),
      description: getField(data, "description", "summary") ?? item.description,
      image: getField(data, "image", "thumbnail") ?? item.image,
      youtubeUrl: getField(data, "youtube", "youtube_url", "youtubeUrl") ?? item.youtubeUrl,
      category: getField(data, "category") ?? item.category,
      status: getField(data, "status") ?? "Publicado",
      location: getField(data, "location") ?? item.location,
      year: getField(data, "year") ?? item.year,
      tags: asArray(getField(data, "tags", "keywords")),
      relatedArchives: asArray(getField(data, "related_archives")),
      relatedReportCodes: asArray(getField(data, "related_reports", "related_report_codes")),
      seoTitle: getField(data, "seo_title") ?? "",
      seoDescription: getField(data, "seo_description") ?? "",
      ogImage: getField(data, "og_image") ?? getField(data, "image", "thumbnail") ?? "",
      aiNotes: getField(data, "ai_notes") ?? "Importado via QE Content Package.",
      showInHero: Boolean(getField(data, "hero", "show_in_hero")),
      heroOrder: Number(getField(data, "hero_order") ?? item.heroOrder),
    };
  }
  if (block.type === "ARCHIVE") {
    const item = emptyArchive(content.archives?.length ?? 0);
    return {
      ...item,
      code: getField(data, "code") ?? item.code,
      title: getField(data, "title") ?? item.title,
      slug: getField(data, "slug") ?? slugify(getField(data, "title") ?? item.title),
      summary: getField(data, "summary") ?? item.summary,
      description: getField(data, "description") ?? getField(data, "summary") ?? item.description,
      longDescription: getField(data, "long_description", "longDescription", "body") ?? item.longDescription,
      image: getField(data, "image", "thumbnail") ?? item.image,
      category: getField(data, "category") ?? item.category,
      status: getField(data, "status") ?? "Publicado",
      location: getField(data, "location") ?? item.location,
      year: getField(data, "year") ?? item.year,
      classification: getField(data, "classification") ?? item.classification,
      accessLevel: getField(data, "access_level", "accessLevel") ?? item.accessLevel,
      relatedTransmissionSlug: getField(data, "related_transmission", "related_transmission_slug") ?? "",
      relatedArchives: asArray(getField(data, "related_archives")),
      relatedReportCodes: asArray(getField(data, "related_reports", "related_report_codes")),
      seoTitle: getField(data, "seo_title") ?? "",
      seoDescription: getField(data, "seo_description") ?? "",
      ogImage: getField(data, "og_image") ?? getField(data, "image", "thumbnail") ?? "",
      aiNotes: getField(data, "ai_notes") ?? "Importado via QE Content Package.",
      tags: asArray(getField(data, "tags", "keywords")),
    };
  }
  if (block.type === "REPORT") {
    const item = emptyReport(content.relatos?.length ?? 0);
    return {
      ...item,
      code: getField(data, "code") ?? item.code,
      title: getField(data, "title") ?? item.title,
      slug: getField(data, "slug") ?? slugify(getField(data, "title") ?? item.title),
      subtitle: getField(data, "subtitle") ?? item.subtitle,
      description: getField(data, "description") ?? item.description,
      image: getField(data, "image", "thumbnail") ?? item.image,
      youtubeUrl: getField(data, "youtube", "youtube_url", "youtubeUrl") ?? item.youtubeUrl,
      category: getField(data, "category") ?? item.category,
      status: getField(data, "status") ?? item.status,
      location: getField(data, "location") ?? item.location,
      year: getField(data, "year") ?? item.year,
      relatedArchiveSlug: getField(data, "related_archive", "related_archive_slug") ?? "",
      relatedTransmissionSlug: getField(data, "related_transmission", "related_transmission_slug") ?? "",
      seoTitle: getField(data, "seo_title") ?? "",
      seoDescription: getField(data, "seo_description") ?? "",
      ogImage: getField(data, "og_image") ?? getField(data, "image", "thumbnail") ?? "",
      aiNotes: getField(data, "ai_notes") ?? "Importado via QE Content Package.",
      tags: asArray(getField(data, "tags", "keywords")),
    };
  }
  if (block.type === "CATEGORY") {
    const item = emptyCategory(content.categories?.length ?? 0);
    return {
      ...item,
      title: getField(data, "title") ?? item.title,
      slug: getField(data, "slug") ?? slugify(getField(data, "title") ?? item.title),
      symbol: getField(data, "symbol") ?? item.symbol,
      image: getField(data, "image") ?? item.image,
      description: getField(data, "description") ?? item.description,
      status: getField(data, "status") ?? "Publicado",
      order: Number(getField(data, "order") ?? item.order),
      seoTitle: getField(data, "seo_title") ?? "",
      seoDescription: getField(data, "seo_description") ?? "",
      ogImage: getField(data, "og_image") ?? getField(data, "image") ?? "",
      aiNotes: getField(data, "ai_notes") ?? "Importado via QE Content Package.",
      active: getField(data, "active") ?? true,
    };
  }
  if (block.type === "TIMELINE") return { year: getField(data, "year") ?? "2026", title: getField(data, "title") ?? "Novo evento", text: getField(data, "text", "description") ?? "Evento importado via pacote." };
  if (block.type === "HERO") return { title: getField(data, "title"), subtitle: getField(data, "subtitle"), description: getField(data, "description"), image: getField(data, "image"), featuredArchiveSlug: getField(data, "featured_archive", "featured_archive_slug"), featuredTransmissionSlug: getField(data, "featured_transmission", "featured_transmission_slug"), featuredTransmissionYoutubeUrl: getField(data, "youtube", "youtube_url") };
  return null;
}

function applyQePackage(content: any, parsed: QePackageResult) {
  const clone = structuredClone(content);
  const summary = { transmissions: 0, archives: 0, reports: 0, categories: 0, hero: 0, timeline: 0 };
  for (const block of parsed.blocks) {
    const item = blockToContent(block, clone);
    if (!item) continue;
    if (block.type === "TRANSMISSION") { clone.videos = upsertBySlug(clone.videos ?? [], item); summary.transmissions += 1; }
    if (block.type === "ARCHIVE") { clone.archives = upsertBySlug(clone.archives ?? [], item); summary.archives += 1; }
    if (block.type === "REPORT") { clone.relatos = upsertBySlug(clone.relatos ?? [], item); summary.reports += 1; }
    if (block.type === "CATEGORY") { clone.categories = upsertBySlug(clone.categories ?? [], item); summary.categories += 1; }
    if (block.type === "TIMELINE") { clone.timeline = [...(clone.timeline ?? []), item]; summary.timeline += 1; }
    if (block.type === "HERO") { clone.hero = { ...(clone.hero ?? {}), ...Object.fromEntries(Object.entries(item).filter(([, value]) => value !== undefined && value !== "")) }; summary.hero += 1; }
  }
  return { content: clone, summary };
}

const SAMPLE_QE_PACKAGE = `QE_PACKAGE_VERSION: 1.0

TRANSMISSION
TITLE: Top 10 Mistérios Brasileiros
SLUG: top-10-misterios-brasileiros
CATEGORY: OVNIs e Fenômenos
YEAR: 2026
STATUS: Publicado
YOUTUBE: https://youtube.com/watch?v=EXEMPLO
IMAGE: /images/top10-brasil.jpg
HERO: true
DESCRIPTION:
Uma transmissão documental sobre alguns dos maiores mistérios já registrados no Brasil.
TAGS:
- ovni
- mistérios brasileiros
- operação prato
SEO_TITLE: Top 10 Mistérios Brasileiros | O Quarto Elemento
SEO_DESCRIPTION: Explore casos inexplicáveis, arquivos classificados e mistérios brasileiros no O Quarto Elemento.
RELATED_ARCHIVES:
- operacao-prato
- incidente-de-ubatuba
AI_NOTES:
Pacote gerado via ChatGPT e revisado manualmente antes da publicação.
END_TRANSMISSION

ARCHIVE
TITLE: Operação Prato
SLUG: operacao-prato
CATEGORY: OVNIs e Fenômenos
YEAR: 1977
LOCATION: Pará, Brasil
CLASSIFICATION: Desclassificado
ACCESS_LEVEL: LV.04
SUMMARY:
Dossiê sobre uma das investigações ufológicas mais famosas da história brasileira.
DESCRIPTION:
Arquivo investigativo relacionado à série de eventos observados na região amazônica durante a década de 1970.
IMAGE: /images/operacao-prato.jpg
RELATED_TRANSMISSION: top-10-misterios-brasileiros
TAGS:
- ovni
- amazônia
- forças armadas
END_ARCHIVE`;

function TextField({ label, value, onChange, textarea = false }: { label: string; value: any; onChange: (value: string) => void; textarea?: boolean }) {
  return <label className="cmsField"><span>{label}</span>{textarea ? <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} /> : <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />}</label>;
}
function SelectField({ label, value, options, onChange }: { label: string; value: any; options: string[]; onChange: (value: string) => void }) {
  return <label className="cmsField"><span>{label}</span><select value={value ?? ""} onChange={(e) => onChange(e.target.value)}><option value="">Selecionar</option>{options.map((o) => <option value={o} key={o}>{o}</option>)}</select></label>;
}
function ChipsField({ label, value, onChange, placeholder = "Adicionar item" }: { label: string; value: string[]; onChange: (value: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const add = () => { const item = draft.trim(); if (!item) return; onChange(Array.from(new Set([...(value ?? []), item]))); setDraft(""); };
  return <div className="cmsField"><span>{label}</span><div className="tagEditor">{(value ?? []).map((item) => <button type="button" key={item} onClick={() => onChange((value ?? []).filter((t) => t !== item))}>#{item} ×</button>)}</div><div className="tagInput"><input value={draft} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} /><button type="button" onClick={add}>Adicionar</button></div></div>;
}
function TagsField({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  return <ChipsField label="Tags" value={value} onChange={onChange} placeholder="Adicionar tag" />;
}
function UploadField({ label, value, onChange, onUpload }: { label: string; value: string; onChange: (value: string) => void; onUpload: (file: File) => Promise<string> }) {
  const [uploading, setUploading] = useState(false);
  async function upload(file?: File) { if (!file) return; setUploading(true); try { onChange(await onUpload(file)); } finally { setUploading(false); } }
  return <div className="cmsField"><span>{label}</span><div className="uploadPreview">{value ? <img src={value} alt="" /> : <div>SEM IMAGEM</div>}</div><input value={value ?? ""} onChange={(e) => onChange(e.target.value)} /><label className="uploadButton">{uploading ? "Enviando..." : "Upload"}<input type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0])} /></label></div>;
}
function PreviewCard({ item, type }: { item: any; type: string }) {
  return <aside className="cmsPreview terminalPanel"><span>{type} // Preview</span><div className="cmsPreviewImage" style={{ "--img": `url("${item?.image || "/images/identity-alt.png"}")` } as any} /><h3>{item?.title || "Sem título"}</h3><p>{item?.description || item?.summary || item?.subtitle || "Sem descrição"}</p><div className="dossierMiniMeta"><span>{item?.category || "Categoria"}</span><span>{item?.year || "Ano"}</span><span>{item?.status || "Status"}</span></div></aside>;
}

function FieldAccordion({ group, children }: { group: FieldGroup; children: ReactNode }) {
  return <details className="cmsAccordion" open={group.defaultOpen}><summary><div><b>{group.title}</b>{group.description && <small>{group.description}</small>}</div><span>ABRIR</span></summary><div className="cmsAccordionBody">{children}</div></details>;
}

function AutomationPanel() {
  return <section className="terminalPanel cmsAutomationPanel"><span>Automação</span><h3>Copiloto editorial</h3><p>Estrutura preparada para IA. Em uma próxima fase, este painel poderá gerar SEO, tags, relações, resumos e classificações a partir de um link do YouTube.</p><button className="btn" type="button" disabled>Processar IA em breve</button></section>;
}

function renderField(field: string, selectedItem: any, updateField: (field: string, value: any) => void, type: string, content: any, uploadImage: (file: File) => Promise<string>) {
  if (field === "category") {
    const options = type === "category" ? CATEGORY_OPTIONS : Array.from(new Set([...(content.categories ?? []).map((c: any) => c.title), ...CATEGORY_OPTIONS]));
    return <SelectField key={field} label={label(field)} value={selectedItem[field]} options={options as string[]} onChange={(v) => updateField(field, v)} />;
  }
  if (field === "status") return <SelectField key={field} label={label(field)} value={selectedItem[field]} options={STATUS_OPTIONS} onChange={(v) => updateField(field, v)} />;
  if (field === "classification") return <SelectField key={field} label={label(field)} value={selectedItem[field]} options={CLASSIFICATION_OPTIONS} onChange={(v) => updateField(field, v)} />;
  if (field === "tags") return <TagsField key={field} value={selectedItem[field] ?? []} onChange={(v) => updateField(field, v)} />;
  if (CHIP_FIELDS.includes(field)) return <ChipsField key={field} label={label(field)} value={selectedItem[field] ?? []} onChange={(v) => updateField(field, v)} />;
  if (["image", "ogImage"].includes(field)) return <UploadField key={field} label={label(field)} value={selectedItem[field] ?? ""} onChange={(v) => updateField(field, v)} onUpload={uploadImage} />;
  if (["showInHero", "active"].includes(field)) return <label key={field} className="cmsCheck"><input type="checkbox" checked={Boolean(selectedItem[field])} onChange={(e) => updateField(field, e.target.checked)} /><span>{label(field)}</span></label>;
  return <TextField key={field} label={label(field)} value={selectedItem[field]} textarea={["description", "summary", "longDescription", "subtitle", "text", "seoDescription", "aiNotes"].includes(field)} onChange={(v) => updateField(field, v)} />;
}

function CollectionManager({ title, type, items, onAdd, onUpdate, onRemove, groups, content, uploadImage }: any) {
  const [selected, setSelected] = useState(0);
  const [search, setSearch] = useState("");
  const filtered = items.map((item: any, index: number) => ({ item, index })).filter(({ item }: any) => `${item.title ?? ""} ${item.code ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  const selectedItem = items[selected] ?? items[0];
  function updateField(field: string, value: any) { const next = { ...selectedItem, [field]: value }; if (field === "title" && !selectedItem.slug) next.slug = slugify(value); onUpdate(selected, next); }
  return <div className="cmsManager"><div className="cmsList terminalPanel"><div className="cmsListHead"><div><span>Content Studio</span><h2>{title}</h2></div><button className="btn btnRed" type="button" onClick={onAdd}>Adicionar</button></div><input className="cmsSearch" placeholder="Pesquisar por título ou código..." value={search} onChange={(e) => setSearch(e.target.value)} /><div className="cmsItems">{filtered.map(({ item, index }: any) => <button type="button" className={index === selected ? "active" : ""} key={`${item.code}-${index}`} onClick={() => setSelected(index)}><span>{item.code ?? item.slug ?? "QE"}</span><b>{item.title}</b><small>{item.status ?? item.category ?? "Ativo"}</small></button>)}</div></div>{selectedItem && <div className="cmsEditor terminalPanel"><div className="cmsEditorHead"><div><span>{selectedItem.code ?? selectedItem.slug}</span><h2>{selectedItem.title}</h2></div><button className="btn danger" type="button" onClick={() => onRemove(selected)}>Remover</button></div><div className="cmsEditorGrid"><div>{groups.map((group: FieldGroup) => <FieldAccordion group={group} key={group.title}>{group.fields.map((field) => renderField(field, selectedItem, updateField, type, content, uploadImage))}</FieldAccordion>)}</div><div className="cmsRightRail"><PreviewCard item={selectedItem} type={title} /><AutomationPanel /></div></div></div>}</div>;
}


function ContentPipelinePanel({ content, onApply }: { content: any; onApply: (nextContent: any, message: string) => void }) {
  const [packageText, setPackageText] = useState("");
  const [preview, setPreview] = useState<QePackageResult | null>(null);
  const [appliedSummary, setAppliedSummary] = useState<any | null>(null);
  const parsed = preview ?? parseQePackage(packageText);
  const counts = parsed.blocks.reduce((acc: any, block) => { acc[block.type] = (acc[block.type] ?? 0) + 1; return acc; }, {});
  function validate() { setPreview(parseQePackage(packageText)); setAppliedSummary(null); }
  function apply() {
    const nextParsed = parseQePackage(packageText);
    setPreview(nextParsed);
    if (nextParsed.errors.length) return;
    const result = applyQePackage(content, nextParsed);
    setAppliedSummary(result.summary);
    onApply(result.content, `Pacote aplicado: ${nextParsed.blocks.length} bloco(s) importado(s). Revise e clique em Salvar alterações.`);
  }
  return <div className="pipelineGrid"><section className="terminalPanel packageImporter"><div className="cmsEditorHead"><div><span>QE Content Pipeline</span><h2>Central de Publicação</h2></div><button className="btn" type="button" onClick={() => { setPackageText(SAMPLE_QE_PACKAGE); setPreview(null); setAppliedSummary(null); }}>Carregar exemplo</button></div><p className="cmsHint">Cole aqui o pacote gerado pelo ChatGPT. O Content Studio interpreta o texto, cria um preview e distribui os dados para Transmissões, Arquivos, Relatos, Categorias, Hero e Timeline.</p><textarea className="packageEditor" value={packageText} placeholder="Cole o QE Content Package aqui..." onChange={(e) => { setPackageText(e.target.value); setPreview(null); setAppliedSummary(null); }} /><div className="packageActions"><button className="btn" type="button" onClick={validate}>Validar pacote</button><button className="btn btnRed" type="button" onClick={apply} disabled={!packageText.trim()}>Processar pacote</button></div></section><aside className="terminalPanel packagePreview"><span>Preview de importação</span><h3>{parsed.errors.length ? "Pacote pendente" : "Pacote detectado"}</h3>{parsed.errors.length ? <div className="packageErrors">{parsed.errors.map((error) => <p key={error}>⚠ {error}</p>)}</div> : <div className="packageCounts"><p>Versão: <b>{parsed.version}</b></p><p>Transmissões: <b>{counts.TRANSMISSION ?? 0}</b></p><p>Arquivos: <b>{counts.ARCHIVE ?? 0}</b></p><p>Relatos: <b>{counts.REPORT ?? 0}</b></p><p>Categorias: <b>{counts.CATEGORY ?? 0}</b></p><p>Hero: <b>{counts.HERO ?? 0}</b></p><p>Timeline: <b>{counts.TIMELINE ?? 0}</b></p></div>}{parsed.blocks.length > 0 && <div className="packageBlockList">{parsed.blocks.map((block, index) => <div key={`${block.type}-${index}`}><small>{block.type}</small><b>{getField(block.data, "title") ?? getField(block.data, "slug") ?? `Bloco ${index + 1}`}</b></div>)}</div>}{appliedSummary && <div className="packageApplied"><b>Pacote aplicado localmente.</b><p>Use “Salvar alterações” no topo para gravar o JSON.</p></div>}</aside></div>;
}

export default function AdminPage() {
  const [content, setContent] = useState<any | null>(null);
  const [active, setActive] = useState<Section>("dashboard");
  const [status, setStatus] = useState("");
  useEffect(() => { fetch("/api/admin/content", { cache: "no-store" }).then((r) => r.json()).then(setContent); }, []);
  const stats = useMemo(() => content ? { transmissions: [content.featuredTransmission, ...(content.videos ?? [])].filter(Boolean).length, archives: content.archives?.length ?? 0, reports: content.relatos?.length ?? 0, categories: content.categories?.length ?? 0 } : null, [content]);
  if (!content) return <main className="adminPage"><h1>Carregando Content Studio...</h1></main>;
  function update(path: string, value: any) { const clone = structuredClone(content); const parts = path.split("."); let target = clone; parts.slice(0, -1).forEach((p) => { target[p] = target[p] ?? {}; target = target[p]; }); target[parts[parts.length - 1]] = value; setContent(clone); }
  function updateArray(collection: string, index: number, value: any) { const clone = structuredClone(content); clone[collection][index] = value; setContent(clone); }
  function addItem(collection: string, item: any) { const clone = structuredClone(content); clone[collection] = [...(clone[collection] ?? []), item]; setContent(clone); }
  function removeItem(collection: string, index: number) { const clone = structuredClone(content); clone[collection] = clone[collection].filter((_: any, i: number) => i !== index); setContent(clone); }
  async function uploadImage(file: File) { const fd = new FormData(); fd.append("file", file); const res = await fetch("/api/admin/upload", { method: "POST", body: fd }); const data = await res.json(); return data.url; }
  async function saveContent() { const clone = structuredClone(content); const heroSelected = [clone.featuredTransmission, ...(clone.videos ?? [])].filter((item: any) => item?.showInHero); clone.hero = clone.hero ?? {}; clone.hero.carouselSelectedSlugs = heroSelected.sort((a: any, b: any) => Number(a.heroOrder ?? 99) - Number(b.heroOrder ?? 99)).map((item: any) => item.slug); clone.hero.carouselItems = heroSelected.map((item: any) => ({ code: item.code, title: item.title, description: item.description, image: item.image, slug: item.slug, youtubeUrl: item.youtubeUrl, category: item.category })); const res = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(clone) }); setStatus(res.ok ? `Conteúdo salvo (${new Date().toLocaleTimeString()}).` : "Erro ao salvar conteúdo."); if (res.ok) setContent(clone); }
  function downloadJson() { const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "content.json"; a.click(); URL.revokeObjectURL(url); }
  return <main className="adminPage cmsPage"><header className="cmsTop"><div><span>QE Archive System</span><h1>Content Studio</h1><p>Gerencie o acervo sem editar código. A complexidade técnica fica recolhida; o foco fica no conteúdo.</p></div><div className="cmsTopActions"><button className="btn btnRed" onClick={saveContent}>Salvar alterações</button><button className="btn" onClick={downloadJson}>Baixar JSON</button><button className="btn" onClick={() => setActive("pipeline")}>Importar pacote</button><a className="btn" href="/">Ver site</a></div></header><section className="cmsShell"><aside className="cmsSidebar terminalPanel">{sidebarGroups.map((group) => <div className="cmsNavGroup" key={group.title}><span>{group.title}</span>{group.items.map((s) => <button className={active === s ? "active" : ""} key={s} onClick={() => setActive(s)}>{labels[s]}</button>)}</div>)}</aside><section className="cmsContent">{active === "dashboard" && stats && <div className="adminDashboard"><div className="adminDashGrid"><div><b>{stats.transmissions}</b><span>Transmissões</span></div><div><b>{stats.archives}</b><span>Arquivos</span></div><div><b>{stats.reports}</b><span>Relatos</span></div><div><b>{stats.categories}</b><span>Categorias</span></div></div><section className="terminalPanel cmsHeroSummary"><span>Status editorial</span><h2>Acervo pronto para automação</h2><p>O modelo de dados já separa conteúdo principal, SEO, relacionamentos e agora aceita pacotes editoriais QE gerados pelo ChatGPT.</p></section><section className="terminalPanel adminQuickPanel"><h3>Checklist antes do deploy</h3><p>1. Revisar Hero e transmissões exibidas.</p><p>2. Conferir thumbnails e links do YouTube.</p><p>3. Validar categorias, tags e relacionamentos.</p><p>4. Revisar campos SEO/IA antes de publicar.</p></section></div>}
  {active === "transmissions" && <CollectionManager title="Transmissões" type="transmission" items={content.videos ?? []} content={content} uploadImage={uploadImage} groups={transmissionGroups} onAdd={() => addItem("videos", emptyTransmission(content.videos?.length ?? 0))} onUpdate={(i: number, v: any) => updateArray("videos", i, v)} onRemove={(i: number) => removeItem("videos", i)} />}
  {active === "archives" && <CollectionManager title="Arquivos" type="archive" items={content.archives ?? []} content={content} uploadImage={uploadImage} groups={archiveGroups} onAdd={() => addItem("archives", emptyArchive(content.archives?.length ?? 0))} onUpdate={(i: number, v: any) => updateArray("archives", i, v)} onRemove={(i: number) => removeItem("archives", i)} />}
  {active === "reports" && <CollectionManager title="Relatos" type="report" items={content.relatos ?? []} content={content} uploadImage={uploadImage} groups={reportGroups} onAdd={() => addItem("relatos", emptyReport(content.relatos?.length ?? 0))} onUpdate={(i: number, v: any) => updateArray("relatos", i, v)} onRemove={(i: number) => removeItem("relatos", i)} />}
  {active === "pipeline" && <ContentPipelinePanel content={content} onApply={(nextContent, message) => { setContent(nextContent); setStatus(message); }} />}
  {active === "categories" && <CollectionManager title="Categorias" type="category" items={content.categories ?? []} content={content} uploadImage={uploadImage} groups={categoryGroups} onAdd={() => addItem("categories", emptyCategory(content.categories?.length ?? 0))} onUpdate={(i: number, v: any) => updateArray("categories", i, v)} onRemove={(i: number) => removeItem("categories", i)} />}
  {active === "timeline" && <CollectionManager title="Timeline" type="archive" items={content.timeline ?? []} content={content} uploadImage={uploadImage} groups={timelineGroups} onAdd={() => addItem("timeline", { year: "2026", title: "Novo evento", text: "Descrição do evento." })} onUpdate={(i: number, v: any) => updateArray("timeline", i, v)} onRemove={(i: number) => removeItem("timeline", i)} />}
  {active === "hero" && <div className="cmsEditor terminalPanel"><div className="cmsEditorHead"><div><span>Publicação</span><h2>Hero principal</h2></div></div><div className="cmsEditorGrid"><div>{["eyebrow", "title", "subtitle", "description", "image", "primaryActionLabel", "secondaryActionLabel", "featuredArchiveSlug", "featuredTransmissionSlug", "featuredTransmissionYoutubeUrl"].map((f) => f === "image" ? <UploadField key={f} label={label(f)} value={content.hero?.[f] ?? ""} onChange={(v) => update(`hero.${f}`, v)} onUpload={uploadImage} /> : <TextField key={f} label={label(f)} value={content.hero?.[f] ?? ""} textarea={f === "description"} onChange={(v) => update(`hero.${f}`, v)} />)}<div className="cmsField"><span>Carrossel do Hero</span><p className="cmsHint">Marque “Exibir no Hero” nas transmissões para controlar o carrossel.</p></div></div><PreviewCard item={{ title: content.hero?.title, description: content.hero?.description, image: content.hero?.image, category: "Hero", status: "Ativo" }} type="Hero" /></div></div>}
  {active === "settings" && <div className="cmsEditor terminalPanel"><div className="cmsEditorHead"><div><span>Sistema</span><h2>Configurações do site</h2></div></div><div className="cmsEditorGrid single"><div><TextField label="Título do site" value={content.site?.title} onChange={(v) => update("site.title", v)} /><TextField label="Tagline" value={content.site?.tagline} onChange={(v) => update("site.tagline", v)} /><TextField label="Descrição" value={content.site?.description} textarea onChange={(v) => update("site.description", v)} /><TextField label="E-mail de relatos" value={content.site?.emailRelatos} onChange={(v) => update("site.emailRelatos", v)} /><TextField label="URL YouTube" value={content.site?.youtubeUrl} onChange={(v) => update("site.youtubeUrl", v)} /><TextField label="URL Instagram" value={content.site?.instagramUrl} onChange={(v) => update("site.instagramUrl", v)} /></div></div></div>}
  {active === "json" && <div className="cmsEditor terminalPanel"><div className="cmsEditorHead"><div><span>Modo desenvolvedor</span><h2>JSON completo</h2></div></div><p className="cmsHint devHint">Use apenas para backup, conferência avançada ou correções pontuais. O fluxo principal agora é pelo Content Studio.</p><textarea className="jsonEditor" value={JSON.stringify(content, null, 2)} onChange={(e) => { try { setContent(JSON.parse(e.target.value)); } catch { setStatus("JSON inválido."); } }} /></div>}
  {status && <p className="adminStatus">{status}</p>}</section></section></main>;
}
