import { NextResponse } from "next/server";
import { getSupabaseStatus } from "@/lib/supabaseContent";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getSupabaseStatus());
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error?.message ?? "Erro ao consultar Supabase." }, { status: 500 });
  }
}
