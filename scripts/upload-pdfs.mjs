import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const supabaseUrl = process.env.SUPABASE_URL;
const adminKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_PDF_BUCKET || "cs336-pdfs";

if (!supabaseUrl || !adminKey) {
  throw new Error("Set SUPABASE_URL and SUPABASE_SECRET_KEY in the current shell. Never commit the secret key.");
}

const sources = [path.join(root, "CS336 lectures")];
const rootEntries = await readdir(root);
for (const entry of rootEntries) if (entry.toLowerCase().endsWith(".pdf")) sources.push(path.join(root, entry));

async function collectPdfFiles(entry, files = []) {
  const info = await stat(entry);
  if (info.isDirectory()) {
    for (const child of await readdir(entry)) await collectPdfFiles(path.join(entry, child), files);
  } else if (entry.toLowerCase().endsWith(".pdf")) files.push(entry);
  return files;
}

const files = [];
for (const source of sources) await collectPdfFiles(source, files);

for (const file of files) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  const encodedPath = relative.split("/").map(encodeURIComponent).join("/");
  const headers = {
    apikey: adminKey,
    "content-type": "application/pdf",
    "x-upsert": "true"
  };
  if (!adminKey.startsWith("sb_secret_")) headers.authorization = `Bearer ${adminKey}`;
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${encodedPath}`, {
    method: "POST",
    headers,
    body: await readFile(file)
  });
  if (!response.ok) throw new Error(`Upload failed for ${relative}: ${response.status} ${await response.text()}`);
  console.log(`Uploaded ${relative}`);
}

console.log(`Uploaded ${files.length} private PDFs to ${bucket}.`);
