import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import fs from "fs";
import path from "path";
import { normalizeContent } from "@/lib/contentModel";

const contentPath = path.join(process.cwd(), "data", "content.json");
const backupsDir = path.join(process.cwd(), "data", "backups");

function ensureBackupsDir() {
  if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
}

function createBackup(reason = "manual-save") {
  if (!fs.existsSync(contentPath)) return null;
  ensureBackupsDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupsDir, `content-${timestamp}-${reason}.json`);
  fs.copyFileSync(contentPath, backupPath);
  return path.basename(backupPath);
}

export async function GET() {
  try {
    const raw = fs.readFileSync(contentPath, "utf-8");
    return NextResponse.json(normalizeContent(JSON.parse(raw)));
  } catch (error) {
    return NextResponse.json({ error: "Unable to read content.json" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation to avoid saving an empty/wrong file accidentally.
    if (!body?.site || !Array.isArray(body?.categories) || !Array.isArray(body?.videos)) {
      return NextResponse.json({ error: "Invalid content structure" }, { status: 400 });
    }

    const backupFile = createBackup("before-save");
    const normalized = normalizeContent(body);
    fs.writeFileSync(contentPath, JSON.stringify(normalized, null, 2), "utf-8");

    return NextResponse.json({
      ok: true,
      savedAt: new Date().toISOString(),
      backupFile,
    });
  } catch (error) {
    return NextResponse.json({ error: "Unable to save content.json" }, { status: 500 });
  }
}
