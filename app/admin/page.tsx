
"use client";

import { useEffect, useMemo, useState } from "react";

type Section = "dashboard" | "transmissions" | "archives" | "reports" | "categories" | "hero" | "timeline" | "settings" | "json";

const labels: Record<Section, string> = {
  dashboard: "Dashboard",
  transmissions: "Transmissões",
  archives: "Arquivos",
  reports: "Relatos",
  categories: "Categorias",
  hero: "Hero",
  timeline: "Timeline",
  settings: "Configurações",
  json: "JSON",
};

const CATEGORY_OPTIONS = ["OVNIs e Fenômenos", "Desaparecimentos", "Lendas e Mitos", "Civilizações Perdidas", "Relatos Proibidos", "Deep Web", "Relatos"];
const STATUS_OPTIONS = ["Publicado", "Rascunho", "Oculto", "Em análise", "Recebido"];

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
    featuredArchiveSlug: "Arquivo destaque", featuredTransmissionSlug: "Transmissão destaque", featuredTransmissionYoutubeUrl: "YouTube destaque"
  };
  return map[field] ?? field;
}

function emptyTransmission(index: number) {
  return { code: `QE-TX-${String(index + 1).padStart(3, "0")}`, title: "Nova transmissão", slug: "nova-transmissao", description: "Descrição da transmissão.", image: "", youtubeUrl: "", category: "OVNIs e Fenômenos", status: "Rascunho", tags: ["Transmissão"], location: "Brasil", year: "2026", showInHero: false, heroOrder: index + 1 };
}
function emptyArchive(index: number) {
  return { code: `QE-${String(index + 1).padStart(3, "0")}`, title: "Novo arquivo", slug: "novo-arquivo", summary: "Resumo do arquivo.", description: "Descrição curta do arquivo.", longDescription: "Texto principal do dossiê.", image: "", category: "OVNIs e Fenômenos", status: "Rascunho", location: "Brasil", year: "2026", classification: "Confidencial", accessLevel: "LV.04", relatedTransmissionSlug: "", tags: ["Arquivo"] };
}
function emptyReport(index: number) {
  return { code: `RP-${String(index + 1).padStart(3, "0")}`, title: "Novo relato", subtitle: "Relato recebido", description: "Breve descrição do relato.", image: "", youtubeUrl: "", category: "Relatos", status: "Recebido", location: "Brasil", year: "2026", tags: ["Relato"] };
}
function emptyCategory(index: number) {
  return { title: "Nova categoria", slug: `nova-categoria-${index + 1}`, symbol: "◇", image: "", description: "Descrição da categoria.", active: true };
}

function TextField({ label, value, onChange, textarea = false }: { label: string; value: any; onChange: (value: string) => void; textarea?: boolean }) {
  return <label className="cmsField"><span>{label}</span>{textarea ? <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} /> : <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />}</label>;
}
function SelectField({ label, value, options, onChange }: { label: string; value: any; options: string[]; onChange: (value: string) => void }) {
  return <label className="cmsField"><span>{label}</span><select value={value ?? ""} onChange={(e) => onChange(e.target.value)}><option value="">Selecionar</option>{options.map((o) => <option value={o} key={o}>{o}</option>)}</select></label>;
}
function TagsField({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => { const tag = draft.trim(); if (!tag) return; onChange([...(value ?? []), tag]); setDraft(""); };
  return <div className="cmsField"><span>Tags</span><div className="tagEditor">{(value ?? []).map((tag) => <button type="button" key={tag} onClick={() => onChange((value ?? []).filter((t) => t !== tag))}>#{tag} ×</button>)}</div><div className="tagInput"><input value={draft} placeholder="Adicionar tag" onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} /><button type="button" onClick={add}>Adicionar</button></div></div>;
}
function UploadField({ label, value, onChange, onUpload }: { label: string; value: string; onChange: (value: string) => void; onUpload: (file: File) => Promise<string> }) {
  const [uploading, setUploading] = useState(false);
  async function upload(file?: File) { if (!file) return; setUploading(true); try { onChange(await onUpload(file)); } finally { setUploading(false); } }
  return <div className="cmsField"><span>{label}</span><div className="uploadPreview">{value ? <img src={value} alt="" /> : <div>SEM IMAGEM</div>}</div><input value={value ?? ""} onChange={(e) => onChange(e.target.value)} /><label className="uploadButton">{uploading ? "Enviando..." : "Upload"}<input type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0])} /></label></div>;
}
function PreviewCard({ item, type }: { item: any; type: string }) {
  return <aside className="cmsPreview terminalPanel"><span>{type} // Preview</span><div className="cmsPreviewImage" style={{ "--img": `url("${item?.image || "/images/identity-alt.png"}")` } as any} /><h3>{item?.title || "Sem título"}</h3><p>{item?.description || item?.summary || item?.subtitle || "Sem descrição"}</p><div className="dossierMiniMeta"><span>{item?.category || "Categoria"}</span><span>{item?.year || "Ano"}</span><span>{item?.status || "Status"}</span></div></aside>;
}

function CollectionManager({ title, type, items, onAdd, onUpdate, onRemove, fields, content, uploadImage }: any) {
  const [selected, setSelected] = useState(0);
  const [search, setSearch] = useState("");
  const filtered = items.map((item: any, index: number) => ({ item, index })).filter(({ item }: any) => `${item.title ?? ""} ${item.code ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  const selectedItem = items[selected] ?? items[0];
  function updateField(field: string, value: any) { const next = { ...selectedItem, [field]: value }; if (field === "title" && !selectedItem.slug) next.slug = slugify(value); onUpdate(selected, next); }
  return <div className="cmsManager"><div className="cmsList terminalPanel"><div className="cmsListHead"><div><span>QE Archive CMS</span><h2>{title}</h2></div><button className="btn btnRed" type="button" onClick={onAdd}>Adicionar</button></div><input className="cmsSearch" placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} /><div className="cmsItems">{filtered.map(({ item, index }: any) => <button type="button" className={index === selected ? "active" : ""} key={`${item.code}-${index}`} onClick={() => setSelected(index)}><span>{item.code ?? item.slug ?? "QE"}</span><b>{item.title}</b><small>{item.status ?? item.category ?? "Ativo"}</small></button>)}</div></div>{selectedItem && <div className="cmsEditor terminalPanel"><div className="cmsEditorHead"><div><span>{selectedItem.code}</span><h2>{selectedItem.title}</h2></div><button className="btn danger" type="button" onClick={() => onRemove(selected)}>Remover</button></div><div className="cmsEditorGrid"><div>{fields.map((field: string) => { if (field === "category") { const options = type === "category" ? CATEGORY_OPTIONS : Array.from(new Set([...(content.categories ?? []).map((c: any) => c.title), ...CATEGORY_OPTIONS])); return <SelectField key={field} label={label(field)} value={selectedItem[field]} options={options as string[]} onChange={(v) => updateField(field, v)} />; } if (field === "status") return <SelectField key={field} label={label(field)} value={selectedItem[field]} options={STATUS_OPTIONS} onChange={(v) => updateField(field, v)} />; if (field === "tags") return <TagsField key={field} value={selectedItem[field] ?? []} onChange={(v) => updateField(field, v)} />; if (field === "image") return <UploadField key={field} label={label(field)} value={selectedItem[field] ?? ""} onChange={(v) => updateField(field, v)} onUpload={uploadImage} />; if (field === "showInHero") return <label className="cmsCheck" key={field}><input type="checkbox" checked={Boolean(selectedItem[field])} onChange={(e) => updateField(field, e.target.checked)} /><span>{label(field)}</span></label>; return <TextField key={field} label={label(field)} value={selectedItem[field]} textarea={["description", "summary", "longDescription", "subtitle", "text"].includes(field)} onChange={(v) => updateField(field, v)} />; })}</div><PreviewCard item={selectedItem} type={title} /></div></div>}</div>;
}

export default function AdminPage() {
  const [content, setContent] = useState<any | null>(null);
  const [active, setActive] = useState<Section>("dashboard");
  const [status, setStatus] = useState("");
  useEffect(() => { fetch("/api/admin/content", { cache: "no-store" }).then((r) => r.json()).then(setContent); }, []);
  const stats = useMemo(() => content ? { transmissions: [content.featuredTransmission, ...(content.videos ?? [])].filter(Boolean).length, archives: content.archives?.length ?? 0, reports: content.relatos?.length ?? 0, categories: content.categories?.length ?? 0 } : null, [content]);
  if (!content) return <main className="adminPage"><h1>Carregando CMS...</h1></main>;
  function update(path: string, value: any) { const clone = structuredClone(content); const parts = path.split("."); let target = clone; parts.slice(0, -1).forEach((p) => { target[p] = target[p] ?? {}; target = target[p]; }); target[parts[parts.length - 1]] = value; setContent(clone); }
  function updateArray(collection: string, index: number, value: any) { const clone = structuredClone(content); clone[collection][index] = value; setContent(clone); }
  function addItem(collection: string, item: any) { const clone = structuredClone(content); clone[collection] = [...(clone[collection] ?? []), item]; setContent(clone); }
  function removeItem(collection: string, index: number) { const clone = structuredClone(content); clone[collection] = clone[collection].filter((_: any, i: number) => i !== index); setContent(clone); }
  async function uploadImage(file: File) { const fd = new FormData(); fd.append("file", file); const res = await fetch("/api/admin/upload", { method: "POST", body: fd }); const data = await res.json(); return data.url; }
  async function saveContent() { const clone = structuredClone(content); const heroSelected = [clone.featuredTransmission, ...(clone.videos ?? [])].filter((item: any) => item?.showInHero); clone.hero = clone.hero ?? {}; clone.hero.carouselSelectedSlugs = heroSelected.sort((a: any, b: any) => Number(a.heroOrder ?? 99) - Number(b.heroOrder ?? 99)).map((item: any) => item.slug); clone.hero.carouselItems = heroSelected.map((item: any) => ({ code: item.code, title: item.title, description: item.description, image: item.image, slug: item.slug, youtubeUrl: item.youtubeUrl, category: item.category })); const res = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(clone) }); setStatus(res.ok ? `Conteúdo salvo (${new Date().toLocaleTimeString()}).` : "Erro ao salvar conteúdo."); if (res.ok) setContent(clone); }
  function downloadJson() { const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "content.json"; a.click(); URL.revokeObjectURL(url); }
  return <main className="adminPage cmsPage"><header className="cmsTop"><div><span>QE Archive System</span><h1>Painel Administrativo</h1><p>Gerencie todo o conteúdo do Quarto Elemento sem editar código.</p></div><div className="cmsTopActions"><button className="btn btnRed" onClick={saveContent}>Salvar alterações</button><button className="btn" onClick={downloadJson}>Baixar JSON</button><a className="btn" href="/">Ver site</a></div></header><section className="cmsShell"><aside className="cmsSidebar terminalPanel">{(Object.keys(labels) as Section[]).map((s) => <button className={active === s ? "active" : ""} key={s} onClick={() => setActive(s)}>{labels[s]}</button>)}</aside><section className="cmsContent">{active === "dashboard" && stats && <div className="adminDashboard"><div className="adminDashGrid"><div><b>{stats.transmissions}</b><span>Transmissões</span></div><div><b>{stats.archives}</b><span>Arquivos</span></div><div><b>{stats.reports}</b><span>Relatos</span></div><div><b>{stats.categories}</b><span>Categorias</span></div></div><section className="terminalPanel cmsHeroSummary"><span>Hero atual</span><h2>{content.hero?.carouselItems?.[0]?.title ?? content.hero?.title}</h2><p>{content.hero?.description}</p></section><section className="terminalPanel adminQuickPanel"><h3>Checklist antes do deploy</h3><p>1. Revisar Hero e transmissões exibidas.</p><p>2. Conferir thumbnails e links do YouTube.</p><p>3. Validar categorias e tags.</p></section></div>}
  {active === "transmissions" && <CollectionManager title="Transmissões" type="transmission" items={content.videos ?? []} content={content} uploadImage={uploadImage} fields={["code", "title", "slug", "description", "image", "youtubeUrl", "category", "status", "location", "year", "tags", "showInHero", "heroOrder"]} onAdd={() => addItem("videos", emptyTransmission(content.videos?.length ?? 0))} onUpdate={(i: number, v: any) => updateArray("videos", i, v)} onRemove={(i: number) => removeItem("videos", i)} />}
  {active === "archives" && <CollectionManager title="Arquivos" type="archive" items={content.archives ?? []} content={content} uploadImage={uploadImage} fields={["code", "title", "slug", "summary", "description", "longDescription", "image", "category", "status", "location", "year", "classification", "accessLevel", "relatedTransmissionSlug", "tags"]} onAdd={() => addItem("archives", emptyArchive(content.archives?.length ?? 0))} onUpdate={(i: number, v: any) => updateArray("archives", i, v)} onRemove={(i: number) => removeItem("archives", i)} />}
  {active === "reports" && <CollectionManager title="Relatos" type="report" items={content.relatos ?? []} content={content} uploadImage={uploadImage} fields={["code", "title", "subtitle", "description", "image", "youtubeUrl", "category", "status", "location", "year", "tags"]} onAdd={() => addItem("relatos", emptyReport(content.relatos?.length ?? 0))} onUpdate={(i: number, v: any) => updateArray("relatos", i, v)} onRemove={(i: number) => removeItem("relatos", i)} />}
  {active === "categories" && <CollectionManager title="Categorias" type="category" items={content.categories ?? []} content={content} uploadImage={uploadImage} fields={["title", "slug", "symbol", "description", "image"]} onAdd={() => addItem("categories", emptyCategory(content.categories?.length ?? 0))} onUpdate={(i: number, v: any) => updateArray("categories", i, v)} onRemove={(i: number) => removeItem("categories", i)} />}
  {active === "timeline" && <CollectionManager title="Timeline" type="archive" items={content.timeline ?? []} content={content} uploadImage={uploadImage} fields={["year", "title", "text"]} onAdd={() => addItem("timeline", { year: "2026", title: "Novo evento", text: "Descrição do evento." })} onUpdate={(i: number, v: any) => updateArray("timeline", i, v)} onRemove={(i: number) => removeItem("timeline", i)} />}
  {active === "hero" && <div className="cmsEditor terminalPanel"><div className="cmsEditorHead"><div><span>Home</span><h2>Hero principal</h2></div></div><div className="cmsEditorGrid"><div>{["eyebrow", "title", "subtitle", "description", "image", "primaryActionLabel", "secondaryActionLabel", "featuredArchiveSlug", "featuredTransmissionSlug", "featuredTransmissionYoutubeUrl"].map((f) => f === "image" ? <UploadField key={f} label={label(f)} value={content.hero?.[f] ?? ""} onChange={(v) => update(`hero.${f}`, v)} onUpload={uploadImage} /> : <TextField key={f} label={label(f)} value={content.hero?.[f] ?? ""} textarea={f === "description"} onChange={(v) => update(`hero.${f}`, v)} />)}<div className="cmsField"><span>Carrossel do Hero</span><p className="cmsHint">Marque “Exibir no Hero” nas transmissões para controlar o carrossel.</p></div></div><PreviewCard item={{ title: content.hero?.title, description: content.hero?.description, image: content.hero?.image, category: "Hero", status: "Ativo" }} type="Hero" /></div></div>}
  {active === "settings" && <div className="cmsEditor terminalPanel"><div className="cmsEditorHead"><div><span>Configuração</span><h2>Site</h2></div></div><div className="cmsEditorGrid single"><div><TextField label="Título do site" value={content.site?.title} onChange={(v) => update("site.title", v)} /><TextField label="Tagline" value={content.site?.tagline} onChange={(v) => update("site.tagline", v)} /><TextField label="Descrição" value={content.site?.description} textarea onChange={(v) => update("site.description", v)} /><TextField label="E-mail de relatos" value={content.site?.emailRelatos} onChange={(v) => update("site.emailRelatos", v)} /><TextField label="URL YouTube" value={content.site?.youtubeUrl} onChange={(v) => update("site.youtubeUrl", v)} /><TextField label="URL Instagram" value={content.site?.instagramUrl} onChange={(v) => update("site.instagramUrl", v)} /></div></div></div>}
  {active === "json" && <div className="cmsEditor terminalPanel"><div className="cmsEditorHead"><div><span>Modo avançado</span><h2>JSON completo</h2></div></div><textarea className="jsonEditor" value={JSON.stringify(content, null, 2)} onChange={(e) => { try { setContent(JSON.parse(e.target.value)); } catch { setStatus("JSON inválido."); } }} /></div>}
  {status && <p className="adminStatus">{status}</p>}</section></section></main>;
}
