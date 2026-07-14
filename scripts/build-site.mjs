import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "_site");
const requiredInCi = process.env.GITHUB_ACTIONS === "true";
const config = {
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || "",
  pdfBucket: "cs336-pdfs"
};

if (requiredInCi && (!config.supabaseUrl || !config.supabasePublishableKey)) {
  throw new Error("GitHub repository variables SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required.");
}
if (requiredInCi && new URL(config.supabaseUrl).protocol !== "https:") {
  throw new Error("SUPABASE_URL must use HTTPS for the GitHub Pages deployment.");
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of ["index.html", "manifest.webmanifest", "sw.js"]) {
  await cp(path.join(root, file), path.join(output, file));
}
for (const directory of ["icons", "vendor"]) {
  await cp(path.join(root, directory), path.join(output, directory), { recursive: true });
}

await writeFile(
  path.join(output, "config.js"),
  `window.CS336_CONFIG = Object.freeze(${JSON.stringify(config, null, 2)});\n`,
  "utf8"
);

const html = await readFile(path.join(output, "index.html"), "utf8");
if (!html.includes("vendor/supabase.js") || !html.includes("manifest.webmanifest")) {
  throw new Error("Built index.html is missing required cloud/PWA assets.");
}

console.log(`Built ${output}`);
