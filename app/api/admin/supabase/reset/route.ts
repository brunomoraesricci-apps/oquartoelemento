import { NextResponse } from "next/server";
import { resetSupabaseEditorialArchive } from "@/lib/supabaseContent";

export const dynamic = "force-dynamic";

const REQUIRED_CONFIRMATION = "LIMPAR ACERVO QUARTO ELEMENTO";
const REQUIRED_FULL_CONFIRMATION = "LIMPAR TUDO QUARTO ELEMENTO";

export async function POST(request: Request) {
  const startedAt = Date.now();

  try {
    const body = await request.json().catch(() => ({}));
    const confirmation = String(body?.confirmation ?? "").trim();
    const fullReset = Boolean(body?.fullReset);

    const expected = fullReset ? REQUIRED_FULL_CONFIRMATION : REQUIRED_CONFIRMATION;
    if (confirmation !== expected) {
      return NextResponse.json(
        {
          ok: false,
          message: `Confirmação inválida. Digite exatamente: ${expected}`,
          expected,
        },
        { status: 400 }
      );
    }

    const result = await resetSupabaseEditorialArchive({
      fullReset,
      keepSettings: true,
      reason: fullReset ? "manual-full-reset-from-content-studio" : "manual-editorial-reset-from-content-studio",
    });

    return NextResponse.json({
      ...result,
      durationMs: Date.now() - startedAt,
    });
  } catch (error: any) {
    console.error("[QE RESET] FAILED", error?.supabase ?? error);
    return NextResponse.json(
      {
        ok: false,
        message: error?.message ?? "Erro ao limpar acervo no Supabase.",
        table: error?.table ?? null,
        supabase: error?.supabase ?? null,
        durationMs: Date.now() - startedAt,
      },
      { status: 500 }
    );
  }
}
