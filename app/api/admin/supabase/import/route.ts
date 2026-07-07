import { NextResponse } from "next/server";
import { getContent } from "@/lib/content";
import { importContentIntoSupabase } from "@/lib/supabaseContent";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const content = getContent();
    const results = await importContentIntoSupabase(content);
    return NextResponse.json({ ok: true, importedAt: new Date().toISOString(), results });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error?.message ?? "Erro ao importar conteúdo para Supabase." }, { status: 500 });
  }
}
