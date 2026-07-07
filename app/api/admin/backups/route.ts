import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import fs from "fs";
import path from "path";
import { listSupabaseBackups } from "@/lib/supabaseContent";

const backupsDir = path.join(process.cwd(), "data", "backups");

function listLocalBackups() {
  if (!fs.existsSync(backupsDir)) return [];
  return fs
    .readdirSync(backupsDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const fullPath = path.join(backupsDir, file);
      const stat = fs.statSync(fullPath);
      return {
        file,
        createdAt: stat.mtime.toISOString(),
        size: stat.size,
        source: "filesystem",
      };
    })
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function GET() {
  try {
    const supabaseBackups = await listSupabaseBackups(20);
    if (supabaseBackups.length) return NextResponse.json({ backups: supabaseBackups, source: "supabase" });

    return NextResponse.json({ backups: listLocalBackups(), source: "filesystem" });
  } catch (error) {
    return NextResponse.json({ backups: [], error: "Unable to list backups" }, { status: 200 });
  }
}
