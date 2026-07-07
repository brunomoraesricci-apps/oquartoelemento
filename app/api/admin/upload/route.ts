import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function safeFileName(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  const base = path
    .basename(fileName, ext)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .toLowerCase();

  return `${base || "upload"}-${Date.now()}${ext}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Envie apenas imagens." }, { status: 400 });
    }

    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Imagem muito grande. Limite: 8MB." }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    fs.mkdirSync(uploadsDir, { recursive: true });

    const fileName = safeFileName(file.name);
    const filePath = path.join(uploadsDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      ok: true,
      url: `/uploads/${fileName}`,
      fileName,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao salvar imagem." }, { status: 500 });
  }
}
