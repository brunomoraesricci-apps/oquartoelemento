import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import fs from "fs";
import path from "path";

const backupsDir = path.join(process.cwd(), "data", "backups");

export async function GET() {
  try {
    if (!fs.existsSync(backupsDir)) {
      return NextResponse.json({ backups: [] });
    }

    const backups = fs
      .readdirSync(backupsDir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        const fullPath = path.join(backupsDir, file);
        const stat = fs.statSync(fullPath);
        return {
          file,
          createdAt: stat.mtime.toISOString(),
          size: stat.size,
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 10);

    return NextResponse.json({ backups });
  } catch (error) {
    return NextResponse.json({ error: "Unable to list backups" }, { status: 500 });
  }
}
