import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../../../index.html", import.meta.url), "utf8");

function readConstant(name) {
  const marker = `const ${name} =`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Missing constant ${name}`);
  let index = markerIndex + marker.length;
  while (/\s/.test(source[index])) index++;
  const start = index;
  const stack = [];
  let quote = "";
  let escaped = false;
  for (; index < source.length; index++) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if ("[({".includes(char)) stack.push(char);
    else if ("])}".includes(char)) stack.pop();
    else if (char === ";" && stack.length === 0) break;
  }
  return Function(`"use strict"; return (${source.slice(start, index)});`)();
}

const names = process.argv.slice(2);
const selected = names.length ? names : ["SOURCES", "MODULES", "CONCEPTS", "FORMULAS", "LABS", "ASSIGNMENTS", "DIAGNOSTIC", "QUIZ", "GLOSSARY", "SYMBOLS"];
const data = Object.fromEntries(selected.map(name => [name, readConstant(name)]));
process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
