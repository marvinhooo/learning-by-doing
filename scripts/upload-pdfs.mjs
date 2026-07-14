import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cleanEnvironmentValue = value => {
  const trimmed = String(value || "").trim();
  const quote = trimmed[0];
  return (quote === '"' || quote === "'") && trimmed.at(-1) === quote ? trimmed.slice(1, -1) : trimmed;
};
const supabaseUrl = cleanEnvironmentValue(process.env.SUPABASE_URL);
const adminKey = cleanEnvironmentValue(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
const bucket = process.env.SUPABASE_PDF_BUCKET || "cs336-pdfs";

if (!supabaseUrl || !adminKey) {
  throw new Error("Set SUPABASE_URL and SUPABASE_SECRET_KEY in the current shell. Never commit the secret key.");
}
if (adminKey.startsWith("sb_publishable_")) {
  throw new Error("SUPABASE_SECRET_KEY contains a publishable key. Copy an sb_secret_... key from Project Settings > API Keys > Secret keys.");
}
const usesOpaqueSecretKey = adminKey.startsWith("sb_secret_");
const usesLegacyServiceRoleKey = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(adminKey);
if (!usesOpaqueSecretKey && !usesLegacyServiceRoleKey) {
  throw new Error("SUPABASE_SECRET_KEY has an unknown or incomplete format. Expected sb_secret_... without a variable name, or a legacy service_role JWT.");
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
  if (usesLegacyServiceRoleKey) headers.authorization = `Bearer ${adminKey}`;
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${encodedPath}`, {
    method: "POST",
    headers,
    body: await readFile(file)
  });
  if (!response.ok) throw new Error(`Upload failed for ${relative}: ${response.status} ${await response.text()}`);
  console.log(`Uploaded ${relative}`);
}

console.log(`Uploaded ${files.length} private PDFs to ${bucket}.`);
