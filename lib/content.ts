import fs from "fs";
import path from "path";

export function getContent() {
  const filePath = path.join(process.cwd(), "data", "content.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}
