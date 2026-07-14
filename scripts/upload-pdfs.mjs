import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_PDF_BUCKET || "cs336-pdfs";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the current shell. Never commit the service role key.");
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
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${encodedPath}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/pdf",
      "x-upsert": "true"
    },
    body: await readFile(file)
  });
  if (!response.ok) throw new Error(`Upload failed for ${relative}: ${response.status} ${await response.text()}`);
  console.log(`Uploaded ${relative}`);
}

console.log(`Uploaded ${files.length} private PDFs to ${bucket}.`);
