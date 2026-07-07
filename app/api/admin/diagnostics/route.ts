import { NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabasePublicClient, getSupabaseConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const VERSION = "v7.0.0";
const SCHEMA_VERSION = "005";

type TableCheck = {
  table: string;
  label: string;
  required: boolean;
};

const TABLES: TableCheck[] = [
  { table: "qe_categories", label: "Categorias", required: true },
  { table: "qe_transmissions", label: "Vídeos / Transmissões", required: true },
  { table: "qe_archives", label: "Arquivos / Dossiês", required: true },
  { table: "qe_site_settings", label: "Configurações", required: true },
  { table: "qe_timeline_events", label: "Timeline", required: true },
  { table: "qe_backups", label: "Backups", required: true },
  { table: "qe_sources", label: "Sources", required: true },
  { table: "qe_entities", label: "Grafo: Entidades", required: false },
  { table: "qe_content_entities", label: "Grafo: Conteúdo x Entidades", required: false },
  { table: "qe_content_relations", label: "Grafo: Relações", required: false },
  { table: "qe_migrations", label: "Migrações", required: false },
  { table: "qe_reports", label: "Relatos legados", required: false },
];

async function countTable(client: any, table: string) {
  const startedAt = Date.now();
  const { count, error } = await client.from(table).select("id", { count: "exact", head: true });
  if (error) {
    return {
      ok: false,
      count: null,
      durationMs: Date.now() - startedAt,
      message: error.message,
      code: error.code,
      hint: error.hint,
    };
  }
  return { ok: true, count: count ?? 0, durationMs: Date.now() - startedAt };
}

export async function GET() {
  const config = getSupabaseConfig();
  const client = createSupabaseAdminClient() ?? createSupabasePublicClient();

  const base = {
    version: VERSION,
    schemaVersion: SCHEMA_VERSION,
    checkedAt: new Date().toISOString(),
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
    supabase: {
      configured: config.configured,
      adminConfigured: config.adminConfigured,
      mode: config.mode,
      urlConfigured: Boolean(config.url),
      publishableKeyConfigured: Boolean(config.publishableKey),
      serviceRoleKeyConfigured: Boolean(config.serviceRoleKey),
    },
  };

  if (!client) {
    return NextResponse.json({
      ok: false,
      ...base,
      tables: [],
      migrations: { applied: false, count: 0, message: "Supabase client não foi criado. Confira as variáveis de ambiente." },
      counts: {},
      recommendations: [
        "Configure NEXT_PUBLIC_SUPABASE_URL.",
        "Configure NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
        "Configure SUPABASE_SERVICE_ROLE_KEY para operações administrativas.",
      ],
    });
  }

  const checks = await Promise.all(TABLES.map(async (item) => {
    const result = await countTable(client, item.table);
    return { ...item, ...result };
  }));

  const migrationsTable = checks.find((item) => item.table === "qe_migrations");
  let migrations = {
    applied: Boolean(migrationsTable?.ok),
    count: migrationsTable?.count ?? 0,
    latest: undefined as string | undefined,
    message: migrationsTable?.ok ? undefined : "Tabela qe_migrations ainda não existe.",
  };

  if (migrationsTable?.ok) {
    const { data, error } = await client
      .from("qe_migrations")
      .select("version, description, executed_at")
      .order("executed_at", { ascending: false })
      .limit(1);

    if (!error && data?.[0]) {
      migrations.latest = `${data[0].version} · ${data[0].description ?? "sem descrição"}`;
    }
  }

  const counts = Object.fromEntries(checks.map((item) => [item.table, item.count]));
  const requiredFailed = checks.filter((item) => item.required && !item.ok);
  const recommendations: string[] = [];

  if (!config.adminConfigured) recommendations.push("Configure SUPABASE_SERVICE_ROLE_KEY na Vercel para salvar, resetar e criar backups.");
  if (!migrations.applied) recommendations.push("Execute docs/SUPABASE_V6_4_DIAGNOSTICS.sql para ativar o controle de migrações.");
  for (const table of requiredFailed) recommendations.push(`Tabela obrigatória indisponível: ${table.table}.`);
  if ((counts.qe_backups ?? 0) === 0 && checks.find((item) => item.table === "qe_backups")?.ok) recommendations.push("Nenhum backup registrado ainda. Um backup será criado no próximo salvamento/reset.");
  if ((counts.qe_sources ?? 0) === 0 && checks.find((item) => item.table === "qe_sources")?.ok) recommendations.push("Nenhuma source cadastrada ainda. Use Nova Publicação por URL para popular qe_sources.");
  if (!checks.find((item) => item.table === "qe_entities")?.ok) recommendations.push("Execute docs/SUPABASE_V7_0_KNOWLEDGE_GRAPH.sql para ativar as tabelas do Knowledge Graph.");
  if (!recommendations.length) recommendations.push("Nenhuma pendência crítica detectada.");

  return NextResponse.json({
    ok: requiredFailed.length === 0 && config.configured,
    ...base,
    tables: checks,
    migrations,
    counts,
    recommendations,
  });
}
