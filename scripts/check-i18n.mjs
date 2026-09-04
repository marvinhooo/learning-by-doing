import { readFile } from "node:fs/promises";
import path from "node:path";
import { runInNewContext } from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = await readFile(path.join(root, "index.html"), "utf8");
const englishSource = await readFile(path.join(root, "i18n-en.js"), "utf8");

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
  if (index >= source.length) throw new Error(`Unterminated constant ${name}`);
  return Function(`"use strict"; return (${source.slice(start, index)});`)();
}

// Returns the raw text of a top-level `const NAME = ...;` or `function NAME(...) {...}` declaration,
// so a guard can rerun the app's own code instead of a copy that may silently drift away from it.
function sliceDeclaration(text, name) {
  // `const NAME =` and `const NAME={` are the same declaration; matching only the spaced
  // form made a constant written without one look absent, with a "not found" error
  // instead of a hit. CORE_UI_TRANSLATIONS is written that way.
  const spaced = text.indexOf(`const ${name} =`), tight = text.indexOf(`const ${name}=`);
  const constIndex = Math.min(...[spaced, tight].filter(index => index >= 0), Infinity);
  if (Number.isFinite(constIndex)) {
    let index = constIndex, stack = [], quote = "", escaped = false, started = false;
    for (; index < text.length; index++) {
      const char = text[index];
      if (quote) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === quote) quote = ""; continue; }
      if (char === '"' || char === "'" || char === "`") { quote = char; continue; }
      if ("[({".includes(char)) { stack.push(char); started = true; }
      else if ("])}".includes(char)) stack.pop();
      else if (char === ";" && !stack.length && (started || index > constIndex)) break;
    }
    return text.slice(constIndex, index + 1);
  }
  const functionIndex = text.indexOf(`function ${name}(`);
  if (functionIndex < 0) throw new Error(`sliceDeclaration: ${name} not found`);
  let index = text.indexOf("{", functionIndex), depth = 0, quote = "", escaped = false;
  for (; index < text.length; index++) {
    const char = text[index];
    if (quote) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === quote) quote = ""; continue; }
    if (char === '"' || char === "'" || char === "`") { quote = char; continue; }
    if (char === "{") depth++;
    else if (char === "}") { depth--; if (!depth) break; }
  }
  return text.slice(functionIndex, index + 1);
}

// Every displayed number in the app goes through fixedNum, whose decimal separator follows
// the locale. The guards pin en-US, which makes it behave exactly like the toFixed it
// replaced -- that is why no guard value moved when the app became locale-aware.
const numberPrelude = `const localeCode = () => "en-US";\n${sliceDeclaration(source, "fixedNum")}\n`;

// ---- the decimal separator ---------------------------------------------------
// German writes decimals with a comma. Until this pass the app printed grouped integers with
// toLocaleString and decimals with toFixed, so one German table could read "1.200" for twelve
// hundred and "20.4545 %" for a fifth -- and a lab whose observe text says "read 20,4545 % in
// that column" sent the reader after a string that was not there. Every displayed number now
// goes through fixedNum, whose separator follows the locale.
{
  const decl = sliceDeclaration(source, "fixedNum");
  if (!decl.includes("toLocaleString(localeCode()")) throw new Error("fixedNum: the separator has to follow the locale, otherwise the German render drifts from its own prose again");
  // Grouping is on since v92, and that is the whole point of the helper: the app's own German
  // prose writes grouped thousands 349 times ("1.000.000 Elemente", "2.147.483.648 FLOPs"), so a
  // ledger printing 43200 beside prose saying 43.200 was the same prose-against-table mismatch
  // the decimal comma fixed. Every displayed number now groups, in both languages.
  if (decl.includes("useGrouping:false")) throw new Error("fixedNum: grouping stays on, or a lab ledger prints 43200 beside prose that writes 43.200");
  if (decl.includes("digits===undefined")) throw new Error("fixedNum: every caller names its digit count, so a default would be unreachable code");
  // Comparisons and keys keep toFixed: they must not depend on the display language. rcSame
  // is the only place that needs it, and it compares two learning rates to twelve decimals.
  const rest = source.replace(sliceDeclaration(source, "rcSame"), "");
  const strays = [...rest.matchAll(/\.toFixed\(/g)];
  if (strays.length)
    throw new Error(`decimal separator: ${strays.length} displayed number(s) still format with toFixed instead of fixedNum -- the German render would print them with a point`);
  if (!sliceDeclaration(source, "rcSame").includes(".toFixed(12)"))
    throw new Error("rcSame: the equality test must keep toFixed, a locale-aware string is not a comparison key");
}

const base = {
  nav: readConstant("NAV_ITEMS"),
  sources: readConstant("SOURCES"),
  lecturePages: readConstant("LECTURE_PAGES"),
  lectureGuides: readConstant("LECTURE_GUIDES"),
  modules: readConstant("MODULES"),
  concepts: readConstant("CONCEPTS"),
  formulas: readConstant("FORMULAS"),
  formulaRefs: readConstant("FORMULA_REFS"),
  assignments: readConstant("ASSIGNMENTS"),
  assignmentPrerequisiteGuides: readConstant("ASSIGNMENT_PREREQUISITE_GUIDES"),
  assignmentMissionGuides: readConstant("ASSIGNMENT_MISSION_GUIDES"),
  labs: readConstant("LABS"),
  diagnostic: readConstant("DIAGNOSTIC"),
  quiz: readConstant("QUIZ"),
  glossary: readConstant("GLOSSARY"),
  symbols: readConstant("SYMBOLS")
};
const reviewPolicy = readConstant("REVIEW_POLICY");
const conceptOrientationsDe = readConstant("CONCEPT_ORIENTATIONS_DE");
const conceptPrimerTerms = readConstant("CONCEPT_PRIMER_TERMS");
const formulaNotationTerms = readConstant("FORMULA_NOTATION_TERMS");
for (const concept of base.concepts) {
  const orientation = conceptOrientationsDe[concept.id];
  if (orientation && (Object.hasOwn(concept, "context") || Object.hasOwn(concept, "why"))) throw new Error(`de.concepts.${concept.id}: orientation is defined twice`);
  if (orientation) Object.assign(concept, orientation);
}
const orientedGermanIds = base.concepts.filter(concept => concept.context && concept.why).map(concept => concept.id);
if (JSON.stringify(orientedGermanIds) !== JSON.stringify(base.concepts.map(concept => concept.id))) throw new Error("de.concepts: every concept needs context and why");
const formulaAnswers = readConstant("FORMULA_ANSWERS");
const assignmentAnswers = readConstant("ASSIGNMENT_CHECK_ANSWERS");
const labAnswers = readConstant("LAB_TRANSFER_ANSWERS");
const labObjectives = readConstant("LAB_OBJECTIVES");
const glossaryDetails = readConstant("GLOSSARY_DETAILS");
base.formulas.forEach(item => { item.answer = formulaAnswers[item.id]; });
base.assignments.forEach(item => { item.checkAnswers = assignmentAnswers[item.id]; });
// Not a retyped copy: the app's own merge statement, run against the same two sources it runs on.
// The retyped duplicate that stood here reproduced the app's defect instead of exposing it -- it
// erased the inline transferAnswer of 11 labs exactly as the app did, so 16 versions of guards read
// the wiped value and saw nothing wrong. See the "lab transfer answers" block at the end.
const labMergeStatement = (() => {
  const start = source.indexOf("    LABS.forEach(item=>{");
  if (start < 0) throw new Error("labs: the transferAnswer merge statement is gone from index.html");
  const line = source.slice(start, source.indexOf("\n", start)).trim();
  if (!line.includes("transferAnswer")) throw new Error("labs: the first LABS.forEach no longer merges transferAnswer");
  return line;
})();
new Function("LABS", "LAB_TRANSFER_ANSWERS", labMergeStatement)(base.labs, labAnswers);
base.glossary.forEach(item => { item.detail = glossaryDetails[item.term]; });

const assertUnique = (items, label, key = "id") => {
  const values = items.map(item => item[key]);
  const duplicate = values.find((value, index) => values.indexOf(value) !== index);
  if (duplicate !== undefined) throw new Error(`${label}: duplicate ${key} ${duplicate}`);
};
assertUnique(base.modules, "modules");
assertUnique(base.modules, "modules", "n");
for (const kind of ["concepts", "formulas", "assignments", "labs", "glossary", "symbols"]) assertUnique(base[kind], kind);

const ids = {
  sources: new Set(Object.keys(base.sources)),
  modules: new Set(base.modules.map(item => item.id)),
  concepts: new Set(base.concepts.map(item => item.id)),
  formulas: new Set(base.formulas.map(item => item.id)),
  labs: new Set(base.labs.map(item => item.id)),
  symbols: new Set(base.symbols.map(item => item.id))
};
const requireRefs = (owner, values, target) => {
  for (const value of values || []) if (!ids[target].has(value)) throw new Error(`${owner}: unknown ${target} reference ${value}`);
};
const lectureIds = Object.keys(base.sources).filter(id => /^l\d+$/u.test(id));
if (JSON.stringify(Object.keys(base.lectureGuides)) !== JSON.stringify(lectureIds)) throw new Error("lecture guides: every lecture must appear exactly once and in source order");
if (JSON.stringify(Object.keys(base.lecturePages)) !== JSON.stringify(lectureIds)) throw new Error("lecture pages: every lecture must appear exactly once and in source order");
for (const [lectureId, pageRange] of Object.entries(base.lecturePages)) {
  const match = /^(\d+)–(\d+)$/u.exec(pageRange);
  if (!match || Number(match[1]) > Number(match[2])) throw new Error(`lecture pages.${lectureId}: invalid page range ${pageRange}`);
}
const requireBilingualText = (owner, value, minimumWords = 1) => {
  if (!value || typeof value !== "object") throw new Error(`${owner}: missing bilingual text`);
  for (const locale of ["de", "en"]) {
    const text = value[locale];
    if (typeof text !== "string" || !text.trim()) throw new Error(`${owner}.${locale}: missing text`);
    const words = text.trim().split(/\s+/u).filter(Boolean).length;
    if (words < minimumWords) throw new Error(`${owner}.${locale}: explanation is too shallow (${words}/${minimumWords} words)`);
  }
};
const requireUniqueRefs = (owner, values, required = false) => {
  if (!Array.isArray(values)) throw new Error(`${owner}: references must be an array`);
  if (required && !values.length) throw new Error(`${owner}: needs at least one reference`);
  if (new Set(values).size !== values.length) throw new Error(`${owner}: duplicate reference`);
};
for (const lectureId of lectureIds) {
  const guide = base.lectureGuides[lectureId];
  if (!guide || typeof guide !== "object" || Array.isArray(guide)) throw new Error(`lecture guides.${lectureId}: missing guide`);
  requireBilingualText(`lecture guides.${lectureId}.plain`, guide.plain, 8);
  requireBilingualText(`lecture guides.${lectureId}.why`, guide.why, 6);
  if (!Array.isArray(guide.outcomes) || !guide.outcomes.length) throw new Error(`lecture guides.${lectureId}.outcomes: needs at least one outcome`);
  guide.outcomes.forEach((outcome, index) => requireBilingualText(`lecture guides.${lectureId}.outcomes[${index}]`, outcome, 3));
  if (!Array.isArray(guide.prereqs) || !guide.prereqs.length) throw new Error(`lecture guides.${lectureId}.prereqs: needs at least one explained prerequisite`);
  guide.prereqs.forEach((prereq, index) => {
    if (!prereq || typeof prereq !== "object" || Array.isArray(prereq)) throw new Error(`lecture guides.${lectureId}.prereqs[${index}]: invalid prerequisite`);
    requireBilingualText(`lecture guides.${lectureId}.prereqs[${index}].label`, prereq.label);
    requireBilingualText(`lecture guides.${lectureId}.prereqs[${index}].explain`, prereq.explain, 5);
    if (prereq.concept !== undefined) requireRefs(`lecture guides.${lectureId}.prereqs[${index}].concept`, [prereq.concept], "concepts");
  });
  requireUniqueRefs(`lecture guides.${lectureId}.symbols`, guide.symbols || []);
  requireRefs(`lecture guides.${lectureId}.symbols`, guide.symbols || [], "symbols");
  for (const target of ["concepts", "formulas", "labs"]) {
    const refs = guide[target];
    requireUniqueRefs(`lecture guides.${lectureId}.${target}`, refs, target === "concepts");
    requireRefs(`lecture guides.${lectureId}.${target}`, refs, target);
    for (const id of refs) {
      const item = base[target].find(candidate => candidate.id === id);
      const itemSources = target === "labs"
        ? base.modules.find(module => module.id === item.module)?.sources
        : item.sources;
      if (!itemSources?.includes(lectureId)) throw new Error(`lecture guides.${lectureId}.${target}: ${id} does not cite ${lectureId}`);
    }
  }
  if (!guide.labs.length) throw new Error(`lecture guides.${lectureId}: no interactive lab, so this lecture can only be read and never practised`);
}
if (JSON.stringify(Object.keys(base.assignmentPrerequisiteGuides)) !== JSON.stringify(base.assignments.map(assignment => assignment.id))) throw new Error("assignment prerequisite guides: every assignment must appear exactly once and in source order");
for (const assignment of base.assignments) {
  const guides = base.assignmentPrerequisiteGuides[assignment.id];
  if (!Array.isArray(guides) || guides.length !== assignment.prereqs.length) throw new Error(`assignment prerequisite guides.${assignment.id}: expected one explanation per named prerequisite`);
  guides.forEach((guide, index) => {
    requireBilingualText(`assignment prerequisite guides.${assignment.id}[${index}].label`, guide.label, 2);
    requireBilingualText(`assignment prerequisite guides.${assignment.id}[${index}].explain`, guide.explain, 12);
  });
}
const objectiveLabIds = Object.keys(labObjectives);
for (const id of objectiveLabIds) {
  requireRefs(`labObjectives.${id}`, [id], "labs");
  const objective = labObjectives[id];
  if (!Array.isArray(objective.answers) || !objective.answers.length) throw new Error(`labObjectives.${id}: no answer key`);
  for (const locale of ["de", "en"]) {
    const copy = objective[locale];
    if (!copy?.title || !copy?.hint || !copy?.success || copy.questions?.length !== objective.answers.length) throw new Error(`labObjectives.${id}.${locale}: incomplete localized objective`);
    copy.questions.forEach((question, index) => {
      if (!question.prompt || !Array.isArray(question.options) || question.options.length < 2) throw new Error(`labObjectives.${id}.${locale}.questions[${index}]: incomplete question`);
      const optionValues = question.options.map(option => option[0]);
      if (new Set(optionValues).size !== optionValues.length) throw new Error(`labObjectives.${id}.${locale}.questions[${index}]: duplicate option value`);
      if (!question.options.some(option => option[0] === objective.answers[index])) throw new Error(`labObjectives.${id}.${locale}.questions[${index}]: answer is not an option`);
    });
  }
  const germanOptionValues = objective.de.questions.map(question => question.options.map(option => option[0]).sort());
  const englishOptionValues = objective.en.questions.map(question => question.options.map(option => option[0]).sort());
  if (JSON.stringify(germanOptionValues) !== JSON.stringify(englishOptionValues)) throw new Error(`labObjectives.${id}: locale option values differ`);
}
for (const module of base.modules) {
  requireRefs(`modules.${module.id}`, module.concepts, "concepts");
  requireRefs(`modules.${module.id}`, module.labs, "labs");
  requireRefs(`modules.${module.id}`, module.sources, "sources");
  for (const conceptId of module.concepts) {
    const concept = base.concepts.find(item => item.id === conceptId);
    if (concept.module !== module.id) throw new Error(`modules.${module.id}: concept ${conceptId} belongs to ${concept.module}`);
  }
}
for (const concept of base.concepts) {
  requireRefs(`concepts.${concept.id}`, [concept.module], "modules");
  requireRefs(`concepts.${concept.id}`, concept.formulas, "formulas");
  requireRefs(`concepts.${concept.id}`, concept.sources, "sources");
}
for (const formula of base.formulas) requireRefs(`formulas.${formula.id}`, formula.sources, "sources");
for (const lab of base.labs) requireRefs(`labs.${lab.id}`, [lab.module], "modules");
for (const assignment of base.assignments) {
  requireRefs(`assignments.${assignment.id}`, assignment.sources, "sources");
  requireRefs(`assignments.${assignment.id}`, assignment.concepts, "concepts");
  assertUnique(assignment.missions || [], `assignments.${assignment.id}.missions`);
  for (const mission of assignment.missions || []) {
    for (const field of ["derive", "failure"]) if (typeof mission[field] !== "string" || !mission[field].trim()) throw new Error(`assignments.${assignment.id}.missions.${mission.id}.${field}: missing learning contract`);
    if (!(mission.concepts || []).length) throw new Error(`assignments.${assignment.id}.missions.${mission.id}: no linked concepts`);
    if (!(mission.labs || []).length) throw new Error(`assignments.${assignment.id}.missions.${mission.id}: no linked labs`);
    requireRefs(`assignments.${assignment.id}.missions.${mission.id}`, mission.concepts, "concepts");
    requireRefs(`assignments.${assignment.id}.missions.${mission.id}`, mission.labs, "labs");
  }
}
for (const item of base.quiz) requireRefs(`quiz.${item.q}`, [item.m], "modules");

const sandbox = { window: {} };
runInNewContext(englishSource, sandbox, { filename: "i18n-en.js" });
const pack = sandbox.window.CS336_EN;
if (!pack || typeof pack !== "object") throw new Error("English language pack is missing");
for (const [id, translated] of Object.entries(pack.concepts || {})) {
  const orientation = pack.conceptOrientations?.[id];
  if (orientation && (Object.hasOwn(translated, "context") || Object.hasOwn(translated, "why"))) throw new Error(`en.concepts.${id}: orientation is defined twice`);
  if (orientation) Object.assign(translated, orientation);
}

const keyed = items => Object.fromEntries(items.map((item, index) => [item.id || String(index), item]));
const expectedIds = {
  nav: base.nav.map(item => item[0]),
  sources: Object.keys(base.sources),
  modules: base.modules.map(item => item.id), concepts: base.concepts.map(item => item.id), formulas: base.formulas.map(item => item.id),
  formulaRefs: Object.keys(base.formulaRefs), assignments: base.assignments.map(item => item.id), labs: base.labs.map(item => item.id),
  diagnostic: base.diagnostic.map((_, index) => String(index)), quiz: base.quiz.map((_, index) => String(index)),
  glossary: base.glossary.map(item => item.id), symbols: base.symbols.map(item => item.id)
};
for (const [kind, ids] of Object.entries(expectedIds)) {
  const actual = Object.keys(pack[kind] || {});
  if (JSON.stringify(actual) !== JSON.stringify(ids)) throw new Error(`${kind}: locale IDs do not match the German source`);
}

const requiredFields = {
  modules:["stage","title","description","outcome","prereqs"],
  concepts:["title","level","summary","context","why","mental","details","pitfalls","checks","answers"],
  formulas:["cat","title","read","purpose","dims","vars","intuition","pitfall","example","check","answer"],
  assignments:["title","stage","goal","prereqs","models","milestones","checks","hints","pitfalls","missions","done","checkAnswers"],
  labs:["title","desc","mental","formula","symbols","observe","misconception","transferQuestion","transferAnswer"], diagnostic:["q","opts","why"], quiz:["q","opts","why"],
  glossary:["def","cat","detail"], symbols:["meaning","context","dimension"]
};
for (const [kind, fields] of Object.entries(requiredFields)) {
  const sourceItems = keyed(base[kind]);
  for (const [id, translated] of Object.entries(pack[kind])) {
    if (!translated || typeof translated !== "object") throw new Error(`${kind}.${id}: translation must be an object`);
    for (const field of fields) {
      if (!Object.hasOwn(translated, field)) throw new Error(`${kind}.${id}.${field}: missing translation`);
      const original = sourceItems[id][field];
      if (typeof translated[field] === "string" && !translated[field].trim()) throw new Error(`${kind}.${id}.${field}: translation is empty`);
      if (Array.isArray(translated[field]) && translated[field].length === 0) throw new Error(`${kind}.${id}.${field}: translation array is empty`);
      if (Array.isArray(original) && translated[field].length !== original.length) throw new Error(`${kind}.${id}.${field}: array length changed`);
    }
  }
}
for (const [id, concept] of Object.entries(keyed(base.concepts))) {
  if (!concept.terms) continue;
  const translated = pack.concepts[id];
  if (!Array.isArray(translated.terms) || translated.terms.length !== concept.terms.length) throw new Error(`concepts.${id}.terms: localized primer terms do not match`);
  for (const [index, pair] of translated.terms.entries()) {
    if (!Array.isArray(pair) || pair.length !== 2 || pair.some(value => typeof value !== "string" || !value.trim())) throw new Error(`en.concepts.${id}.terms[${index}]: invalid primer term`);
  }
}

const prose = value => {
  const flattened = Array.isArray(value) ? value.flat(Infinity) : [value];
  return flattened
    .filter(item => item !== undefined && item !== null)
    .join(" ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:#\d+|#x[\da-f]+|[a-z]+);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
};
const wordCount = value => prose(value).split(/\s+/u).filter(Boolean).length;
const records = value => Array.isArray(value) ? value : Object.values(value);
const requireWords = (owner, value, minimum) => {
  const actual = wordCount(value);
  if (actual < minimum) throw new Error(`${owner}: explanation is too shallow (${actual}/${minimum} words)`);
};
const assertExplanationDepth = (locale, data) => {
  for (const concept of records(data.concepts)) {
    if (concept.details.length < 3) throw new Error(`${locale}.concepts.${concept.id || concept.title}: fewer than 3 explanatory details`);
    if (concept.pitfalls.length < 2) throw new Error(`${locale}.concepts.${concept.id || concept.title}: fewer than 2 pitfalls`);
    if (concept.checks.length < 2) throw new Error(`${locale}.concepts.${concept.id || concept.title}: fewer than 2 self-checks`);
    if (concept.checks.length !== concept.answers.length) throw new Error(`${locale}.concepts.${concept.id || concept.title}: self-check and answer count differs`);
    requireWords(`${locale}.concepts.${concept.id || concept.title}.context`, concept.context, 10);
    requireWords(`${locale}.concepts.${concept.id || concept.title}.why`, concept.why, 8);
    if (prose(concept.context).toLocaleLowerCase() === prose(concept.summary).toLocaleLowerCase()) throw new Error(`${locale}.concepts.${concept.id || concept.title}: context merely repeats summary`);
    if (prose(concept.why).toLocaleLowerCase() === prose(concept.context).toLocaleLowerCase()) throw new Error(`${locale}.concepts.${concept.id || concept.title}: why merely repeats context`);
    requireWords(`${locale}.concepts.${concept.id || concept.title}`, [concept.summary, concept.mental, concept.details], 140);
    concept.answers.forEach((answer, index) => requireWords(`${locale}.concepts.${concept.id || concept.title}.answers[${index}]`, answer, 15));
  }
  for (const formula of records(data.formulas)) {
    if (!formula.vars.length) throw new Error(`${locale}.formulas.${formula.id || formula.title}: no variables explained`);
    requireWords(`${locale}.formulas.${formula.id || formula.title}`, [formula.read, formula.purpose, formula.dims, formula.intuition, formula.pitfall, formula.example], 30);
    const example = prose(formula.example);
    if (!/\d/u.test(example)) throw new Error(`${locale}.formulas.${formula.id || formula.title}.example: no concrete number`);
    if (!/[=≈→⇒]/u.test(example)) throw new Error(`${locale}.formulas.${formula.id || formula.title}.example: no visible calculation and result`);
    requireWords(`${locale}.formulas.${formula.id || formula.title}.answer`, formula.answer, 15);
  }
  for (const entry of records(data.glossary)) {
    const owner = `${locale}.glossary.${entry.id || entry.term}`;
    requireWords(`${owner}.detail`, entry.detail, 40);
    if (prose(entry.detail).toLocaleLowerCase() === prose(entry.def).toLocaleLowerCase()) throw new Error(`${owner}: detail merely repeats the short definition`);
    if (wordCount(entry.detail) <= wordCount(entry.def)) throw new Error(`${owner}: detail is not more explanatory than the short definition`);
  }
};
assertExplanationDepth("de", base);
assertExplanationDepth("en", pack);

const abbreviationContracts = {
  A1:"Assignment 1", A2:"Assignment 2", A3:"Assignment 3", A4:"Assignment 4", A5:"Assignment 5",
  LM:"Language Model", LLM:"Large Language Model", BPE:"Byte-Pair Encoding", GPU:"Graphics Processing Unit", CPU:"Central Processing Unit",
  HBM:"High Bandwidth Memory", CUDA:"Compute Unified Device Architecture", SIMT:"Single Instruction, Multiple Threads", NCCL:"NVIDIA Collective Communications Library",
  MLP:"Multi-Layer Perceptron", MHA:"Multi-Head Attention", MQA:"Multi-Query Attention", GQA:"Grouped-Query Attention", QKV:"Query",
  RMSNorm:"Root Mean Square Normalization", RoPE:"Rotary Position Embedding", SwiGLU:"Swish-Gated Linear Unit", SiLU:"Sigmoid Linear Unit",
  RL:"Reinforcement Learning", SFT:"Supervised Fine-Tuning", RLHF:"Reinforcement Learning from Human Feedback", RLVR:"Reinforcement Learning from Verifiable Rewards",
  DPO:"Direct Preference Optimization", PPO:"Proximal Policy Optimization", GRPO:"Group Relative Policy Optimization", GSPO:"Group Sequence Policy Optimization",
  RFT:"Rejection Fine-Tuning", MoE:"Mixture of Experts", DDP:"Distributed Data Parallel", FSDP:"Fully Sharded Data Parallel", ZeRO:"Zero Redundancy Optimizer",
  KL:"Kullback-Leibler", NLL:"Negative Log-Likelihood", PPL:"Perplexity", EOS:"End of Sequence", PII:"Personally Identifiable Information",
  DSIR:"Data Selection via Importance Resampling", LSH:"Locality-Sensitive Hashing", FPR:"False Positive Rate", API:"Application Programming Interface",
  NPY:"NumPy", SLO:"Service Level Objective", SSM:"State Space Model", WSD:"Warmup-Stable-Decay", "μP":"Maximum Update Parametrization",
  RNG:"Random Number Generator", FLOP:"Floating-Point Operation", FLOPs:"Floating-Point Operations"
};
const standalone = value => new RegExp(`(^|[^\\p{L}\\p{N}_])${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|[^\\p{L}\\p{N}_])`, "u");
const termMatchIndex = (text, term) => String(term).split(/\s+\/\s+/u).map(value => value.trim()).filter(value => value.length >= 2).reduce((best, name) => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const flags = (name.match(/[A-Z]/g) || []).length >= 2 ? "u" : "iu";
  const match = new RegExp(`(^|[^\\p{L}\\p{N}_])${escaped}(?=$|[^\\p{L}\\p{N}_])`, flags).exec(text);
  return match ? Math.min(best, match.index + match[1].length) : best;
}, Number.POSITIVE_INFINITY);
const renderedPrimerTerms = (locale, concept) => {
  if (concept.terms?.length) return concept.terms.slice(0, 12).map(([term, definition]) => ({term, definition}));
  const text = prose([concept.title, concept.summary, concept.context, concept.why, concept.mental, concept.details, concept.pitfalls, concept.checks, concept.answers]);
  return (conceptPrimerTerms[locale] || []).map(([term, definition]) => ({term, definition, index:termMatchIndex(text, term)})).filter(item => Number.isFinite(item.index)).sort((a, b) => a.index - b.index).slice(0, 8);
};
const assertAbbreviationSupport = (locale, data) => {
  for (const concept of records(data.concepts)) {
    const visible = prose([concept.title, concept.summary, concept.context, concept.why, concept.mental, concept.details, concept.pitfalls, concept.checks, concept.answers]);
    const primer = renderedPrimerTerms(locale, concept);
    for (const [abbreviation, expansion] of Object.entries(abbreviationContracts)) {
      const abbreviationMatch = standalone(abbreviation).exec(visible);
      if (!abbreviationMatch) continue;
      const expansionIndex = visible.toLocaleLowerCase().indexOf(expansion.toLocaleLowerCase());
      const expandedBeforeUse = expansionIndex >= 0 && expansionIndex < abbreviationMatch.index;
      const explainedInVisiblePrimer = primer.some(item => standalone(abbreviation).test(item.term) && wordCount(item.definition) >= 3);
      if (!(expandedBeforeUse || explainedInVisiblePrimer)) throw new Error(`${locale}.concepts.${concept.id || concept.title}: ${abbreviation} is used without an explanation visible before Step by step`);
    }
  }
};
assertAbbreviationSupport("de", base);
assertAbbreviationSupport("en", pack);
const missionIds = base.assignments.flatMap(assignment => assignment.missions.map(mission => mission.id));
const missionGuideIds = Object.keys(base.assignmentMissionGuides);
if (missionIds.length !== 29 || new Set(missionIds).size !== missionIds.length) throw new Error("assignment mission guides: mission IDs must be 29 unique records");
if (JSON.stringify([...missionGuideIds].sort()) !== JSON.stringify([...missionIds].sort())) throw new Error("assignment mission guides: every mission needs exactly one plain guide");
for (const missionId of missionIds) {
  const guide = base.assignmentMissionGuides[missionId];
  for (const locale of ["de", "en"]) {
    requireWords(`assignmentMissionGuides.${missionId}.${locale}.plain`, guide?.plain?.[locale], 12);
    requireWords(`assignmentMissionGuides.${missionId}.${locale}.why`, guide?.why?.[locale], 8);
    const visible = prose([guide.plain[locale], guide.why[locale]]);
    for (const [abbreviation, expansion] of Object.entries(abbreviationContracts)) {
      const abbreviationMatch = standalone(abbreviation).exec(visible);
      if (!abbreviationMatch) continue;
      const expansionIndex = visible.toLocaleLowerCase().indexOf(expansion.toLocaleLowerCase());
      const beforeAndUse = visible.slice(0, abbreviationMatch.index + abbreviationMatch[0].length + 1);
      const explainedParenthetically = new RegExp(`(?:[\\p{L}-]+\\s+){0,7}[\\p{L}-]+\\s*\\(${abbreviation}\\)`, "u").test(beforeAndUse);
      if (!((expansionIndex >= 0 && expansionIndex < abbreviationMatch.index) || explainedParenthetically)) throw new Error(`assignmentMissionGuides.${missionId}.${locale}: ${abbreviation} is not expanded before first use`);
    }
  }
}
const primerImplementation = source.slice(source.indexOf("function conceptPrimerTerms"), source.indexOf("function conceptOrientationMarkup"));
if (primerImplementation.includes("GLOSSARY")) throw new Error("concept primer: automatic glossary matching is semantically unsafe");
for (const [locale, data] of [["de", base], ["en", pack]]) {
  const benchmarkConcept = Array.isArray(data.concepts) ? data.concepts.find(concept => concept.id === "benchmark-validity") : data.concepts["benchmark-validity"];
  const benchmarkPrimer = renderedPrimerTerms(locale, benchmarkConcept);
  if (benchmarkPrimer.some(item => item.term === "ZeRO")) throw new Error(`${locale}.concepts.benchmark-validity: Zero-shot must not trigger the unrelated ZeRO primer`);
}

const coreFormulaIds = [
  "linear-map", "embedding-lookup", "chain-rule", "softmax", "cross-entropy",
  "parameter-init", "next-token-batch", "rmsnorm", "swiglu", "rope", "attention", "residual", "kv-cache", "adamw", "gradient-clip"
];
const coreGlossaryIds = [
  "g0", "g1", "g6", "g7", "g10", "g11", "g12", "g14", "g19", "g20", "g24", "g25", "g26", "g28", "g34", "g37",
  "g40", "g42", "g45", "g46", "g51", "g54", "g55", "g56", "g57", "g58",
  "g59", "g60", "g61", "g62", "g63", "g64", "g65"
];
const assertCoreExplanations = (locale, data) => {
  const formulas = Array.isArray(data.formulas) ? keyed(data.formulas) : data.formulas;
  const glossary = Array.isArray(data.glossary) ? keyed(data.glossary) : data.glossary;
  for (const id of coreFormulaIds) {
    const formula = formulas[id];
    if (!formula) throw new Error(`${locale}.formulas.${id}: missing core explanation`);
    for (const [field, minimum] of [["read", 8], ["purpose", 8], ["dims", 8], ["intuition", 10], ["pitfall", 10], ["example", 5], ["answer", 15]]) {
      requireWords(`${locale}.formulas.${id}.${field}`, formula[field], minimum);
    }
  }
  for (const id of coreGlossaryIds) {
    const entry = glossary[id];
    if (!entry) throw new Error(`${locale}.glossary.${id}: missing core explanation`);
    requireWords(`${locale}.glossary.${id}.detail`, entry.detail, 85);
  }
};
assertCoreExplanations("de", base);
assertCoreExplanations("en", pack);

const requireTextFragments = (owner, value, fragments) => {
  const text = prose(value && typeof value === "object" && !Array.isArray(value) ? Object.values(value) : value);
  for (const fragment of fragments) if (!text.includes(fragment)) throw new Error(`${owner}: missing exact A1 contract fragment ${fragment}`);
};
const lectureLocaleText = (lectureId, locale) => {
  const guide = base.lectureGuides[lectureId];
  return prose([
    guide.plain[locale], guide.why[locale],
    guide.outcomes.map(outcome => outcome[locale]),
    guide.prereqs.flatMap(prereq => [prereq.label[locale], prereq.explain[locale]])
  ]);
};
for (const [lectureId, locale, fragments] of [
  ["l01", "de", ["Input/Output", "Byte-Pair Encoding (BPE)"]],
  ["l01", "en", ["input/output (I/O)", "Byte-Pair Encoding (BPE)"]],
  ["l03", "de", ["B Batchbeispielen", "T Tokenpositionen", "D Features", "V Vokabulartokens", "Root Mean Square Normalization (RMSNorm)", "Rotary Position Embedding (RoPE)", "Swish-Gated Linear Unit (SwiGLU)"]],
  ["l03", "en", ["B batch examples", "T token positions", "D features", "V vocabulary tokens", "Root Mean Square Normalization (RMSNorm)", "Rotary Position Embedding (RoPE)", "Swish-Gated Linear Unit (SwiGLU)"]],
  ["l04", "de", ["Multi-Layer Perceptron (MLP)"]],
  ["l04", "en", ["multi-layer perceptron (MLP)"]],
  ["l05", "de", ["Grafikprozessoren (GPUs)", "BFloat16 (BF16)", "32-Bit-Gleitkomma (FP32)"]],
  ["l05", "en", ["graphics processing units (GPUs)", "BFloat16 (BF16)", "32-bit floating point (FP32)"]],
  ["l06", "de", ["CUDA ist NVIDIAs Programmierplattform"]],
  ["l06", "en", ["CUDA is NVIDIA's GPU programming platform"]],
  ["l07", "de", ["Grafikprozessoren (GPUs)"]],
  ["l07", "en", ["graphics processing units (GPUs)"]],
  ["l08", "de", ["Distributed Data Parallel (DDP)", "Zero Redundancy Optimizer (ZeRO)", "Fully Sharded Data Parallel (FSDP)"]],
  ["l08", "en", ["Distributed Data Parallel (DDP)", "Zero Redundancy Optimizer (ZeRO)", "Fully Sharded Data Parallel (FSDP)"]],
  ["l09", "de", ["Gleitkommaoperationen (FLOPs)"]],
  ["l09", "en", ["floating-point operations (FLOPs)"]],
  ["l11", "de", ["Maximum Update Parametrization (μP)", "Warmup-Stable-Decay-Schedule (WSD)"]],
  ["l11", "en", ["Maximum Update Parametrization (μP)", "Warmup-Stable-Decay (WSD)"]],
  ["l13", "de", ["Personally Identifiable Information, PII"]],
  ["l13", "en", ["personally identifiable information (PII)"]],
  ["l14", "de", ["n ist die Zahl direkt aufeinanderfolgender Wörter"]],
  ["l14", "en", ["n is the number of consecutive words"]],
  ["l15", "de", ["Reinforcement Learning from Human Feedback (RLHF)", "Kullback-Leibler-Regularisierung (KL)", "y+ die bevorzugte Antwort", "y− die abgelehnte Antwort"]],
  ["l15", "en", ["reinforcement learning from human feedback (RLHF)", "Kullback-Leibler (KL)", "y+ is the preferred response", "y− is the rejected response"]],
  ["l16", "de", ["Group Relative Policy Optimization (GRPO)", "Proximal Policy Optimization (PPO)"]],
  ["l16", "en", ["Group Relative Policy Optimization (GRPO)", "Proximal Policy Optimization (PPO)"]],
  ["l17", "de", ["Reward 1 tritt mit 70 Prozent", "Steigung 2", "genaue Umformung kommt erst in der Formelerklärung"]],
  ["l17", "en", ["Reward 1 occurs with 70 percent", "observed slope is 2", "exact rearrangement appears only in the formula lesson"]]
]) requireTextFragments(`${locale}.lectureGuides.${lectureId}`, lectureLocaleText(lectureId, locale), fragments);
for (const locale of ["de", "en"]) {
  if (/backward|rückwärts/iu.test(lectureLocaleText("l05", locale))) throw new Error(`${locale}.lectureGuides.l05: must not promise FlashAttention backward content`);
}
const baseConcepts = keyed(base.concepts);
const baseFormulas = keyed(base.formulas);
const englishConcepts = pack.concepts;
const englishFormulas = pack.formulas;
if (!base.lectureGuides.l02.concepts.includes("parameter-initialization")) throw new Error("lecture guides.l02: parameter initialization must be a core concept");
if (!baseConcepts["parameter-initialization"].sources.includes("l02")) throw new Error("concepts.parameter-initialization: Lecture 2 source is missing");
if (base.lectureGuides.l05.concepts.includes("kernel-contracts") || base.lectureGuides.l05.labs.includes("kernel-contracts")) throw new Error("lecture guides.l05: FlashAttention backward belongs to Lecture 6/A2, not Lecture 5");
if (baseConcepts["kernel-contracts"].sources.includes("l05")) throw new Error("concepts.kernel-contracts: Lecture 5 source incorrectly promises backward content");
requireTextFragments("de.formulas.parameter-init.expr", baseFormulas["parameter-init"].expr, [
  "√(2/(d_in+d_out))", "W∈[−3σ,3σ]", "E ~ N(0,1)", "E∈[−3,3]", "g_RMS = 1"
]);
requireTextFragments("de.concepts.parameter-initialization", baseConcepts["parameter-initialization"], [
  "Der kleine Zahlenfall oben", "Varianz", "Standardabweichung", "Erst jetzt die allgemeine Schreibweise", "torch.nn.init.trunc_normal_", "std=1", "RMSNorm-Gain", "empirische Varianz"
]);
requireTextFragments("en.concepts.parameter-initialization", englishConcepts["parameter-initialization"], [
  "The small numerical case above", "variance", "standard deviation", "Only now use the general notation", "torch.nn.init.trunc_normal_", "std=1", "RMSNorm Gain", "empirical variance"
]);
for (const [locale, concept] of [["de", baseConcepts["parameter-initialization"]], ["en", englishConcepts["parameter-initialization"]]]) {
  if (!Array.isArray(concept.terms) || concept.terms.length !== 8) throw new Error(`${locale}.concepts.parameter-initialization: every symbol and prerequisite must be defined before the calculation`);
  if (/W\s*~|σ²\s*=/.test(concept.details[0])) throw new Error(`${locale}.concepts.parameter-initialization: the first worked case must not begin with general notation`);
}
requireTextFragments("de.formulas.parameter-init.example", baseFormulas["parameter-init"].example, ["2/(d_in+d_out)=2/(2+6)=2/8=0,25", "√0,25=0,5", "−3·0,5=−1,5", "+3·0,5=+1,5"]);
requireTextFragments("en.formulas.parameter-init.example", englishFormulas["parameter-init"].example, ["2/(d_in+d_out)=2/(2+6)=2/8=0.25", "√0.25=0.5", "−3·0.5=−1.5", "+3·0.5=+1.5"]);
for (const [locale, formulas] of [["de", baseFormulas], ["en", englishFormulas]]) {
  requireTextFragments(`${locale}.formulas.linear-map.example`, formulas["linear-map"].example, ["y₁=0.5+2·1+(−1)·3=−0.5", "y₂=1+2·0+(−1)·(−1)=2", "y₃=−2+2·2+(−1)·1=1"]);
  requireTextFragments(`${locale}.formulas.residual.example`, formulas.residual.example, ["x′=[1+0.1,−2+0.5]=[1.1,−1.5]"]);
  requireTextFragments(`${locale}.formulas.mfu.example`, formulas.mfu.example, locale === "de" ? ["MFU=400/1000=0,4=40%"] : ["MFU=400/1000=0.4=40%"]);
}
requireTextFragments("de.formulas.rope.expr", baseFormulas.rope.expr, [
  "i / Θ^((2k−2)/d)", "q′₂ₖ₋₁", "q′₂ₖ"
]);
requireTextFragments("de.concepts.rope", baseConcepts.rope, [
  "[0,1]", "[2,3]", "Half-Split", "self.register_buffer(..., persistent=False)", "keine nn.Parameter"
]);
requireTextFragments("en.concepts.rope", englishConcepts.rope, [
  "[0,1]", "[2,3]", "Half-Split", "self.register_buffer(..., persistent=False)", "not nn.Parameters"
]);
requireTextFragments("de.formulas.next-token-batch.expr", baseFormulas["next-token-batch"].expr, [
  "{0,…,n−m−1}", "x[s_b:s_b+m]", "x[s_b+1:s_b+m+1]"
]);
requireTextFragments("de.concepts.python-engineering", baseConcepts["python-engineering"], [
  "Byte-Pair Encoding (BPE)", "Iterator / Generator", "decode(encode(text)) = text", "Tie-Break-Regel"
]);
requireTextFragments("en.concepts.python-engineering", englishConcepts["python-engineering"], [
  "Byte-Pair Encoding (BPE)", "iterator / generator", "decode(encode(text)) = text", "tie-breaking rule"
]);
requireTextFragments("de.concepts.token-array-loading", baseConcepts["token-array-loading"], [
  "np.memmap", "mmap_mode='r'", "n−m+1", "dtype (data type)", "0≤Token-ID<V", "np.iinfo(dtype).max", "Long-Tensor (torch.long)"
]);
requireTextFragments("en.concepts.token-array-loading", englishConcepts["token-array-loading"], [
  "np.memmap", "mmap_mode='r'", "n−m+1", "dtype (data type)", "0≤token ID<V", "np.iinfo(dtype).max", "Long tensor (torch.long)"
]);
requireTextFragments("en.formulas.next-token-batch", englishFormulas["next-token-batch"], [
  "np.memmap", "n−m+1", "Y_b[:-1]=X_b[1:]", "dtype"
]);
requireTextFragments("de.formulas.transformer-ledger", baseFormulas["transformer-ledger"], [
  "2VD+L(4D²+3DF+2D)+D", "8TD²+4T²D+6TDF", "P=40+44+2=86", "F_fwd=312+120=432"
]);
requireTextFragments("en.formulas.transformer-ledger", englishFormulas["transformer-ledger"], [
  "2VD+L(4D²+3DF+2D)+D", "8TD²+4T²D+6TDF", "P=40+44+2=86", "F_fwd=312+120=432"
]);
requireTextFragments("de.concepts.kernel-contracts", baseConcepts["kernel-contracts"], [
  "program_id(0)", "program_id(1)", "[n_row_tiles,D]", "D_row=rowsum(O⊙dO)", "dS-Zeile"
]);
requireTextFragments("en.concepts.kernel-contracts", englishConcepts["kernel-contracts"], [
  "program_id(0)", "program_id(1)", "[n_row_tiles,D]", "D_row=rowsum(O⊙dO)", "dS row"
]);
requireTextFragments("de.concepts.distributed-runtime", baseConcepts["distributed-runtime"], [
  "W_total=d·t·p", "B_global=B_micro·accum·d", "async_op", "max(0,T_comm−T_overlap)"
]);
requireTextFragments("en.concepts.distributed-runtime", englishConcepts["distributed-runtime"], [
  "W_total=d·t·p", "B_global=B_micro·accum·d", "async_op", "max(0,T_comm−T_overlap)"
]);
requireTextFragments("de.concepts.scaling-optima", baseConcepts["scaling-optima"], [
  "log(L_opt−E)", "Varianz 1/r²", "Lernrate 1/r", "Warmup, Stable und Decay"
]);
requireTextFragments("en.concepts.scaling-optima", englishConcepts["scaling-optima"], [
  "log(L_opt−E)", "variance 1/r²", "learning rate 1/r", "Warmup, Stable, and Decay"
]);
requireTextFragments("de.concepts.grpo-variants", baseConcepts["grpo-variants"], [
  "Dr. GRPO", "Rejection Fine-Tuning", "MaxRL", "geometrischen Mittelwert", "keine exakte Importance-Korrektur"
]);
requireTextFragments("en.concepts.grpo-variants", englishConcepts["grpo-variants"], [
  "Dr. GRPO", "Rejection Fine-Tuning", "MaxRL", "geometric mean", "not an exact Importance correction"
]);
requireTextFragments("de.concepts.rlvr-systems", baseConcepts["rlvr-systems"], [
  "old_logprobs", "R1-Zero", "vier Werte pro Präferenzpaar", "Reference bleibt"
]);
requireTextFragments("en.concepts.rlvr-systems", englishConcepts["rlvr-systems"], [
  "old_logprobs", "R1-Zero", "four values per preference pair", "Reference stays frozen"
]);

const V = 1000, D = 64, F = 192, L = 3, T = 32;
const exactParameters = 2 * V * D + L * (4 * D ** 2 + 3 * D * F + 2 * D) + D;
const exactBlockFlops = 8 * T * D ** 2 + 4 * T ** 2 * D + 6 * T * D * F;
const exactForwardFlops = L * exactBlockFlops + 2 * T * D * V;
if (exactParameters !== 288192 || exactBlockFlops !== 3670016 || exactForwardFlops !== 15106048) throw new Error("A1 exact accounting regression");

const scores = [0.2, -0.4, 1.1], upstream = [0.3, -0.2, 0.7], maximum = Math.max(...scores);
const exponentials = scores.map(value => Math.exp(value - maximum)), normalizer = exponentials.reduce((sum, value) => sum + value, 0), probabilities = exponentials.map(value => value / normalizer);
const softmaxProjection = probabilities.reduce((sum, value, index) => sum + value * upstream[index], 0);
const scoreGradients = probabilities.map((value, index) => value * (upstream[index] - softmaxProjection));
if (Math.abs(scoreGradients.reduce((sum, value) => sum + value, 0)) > 1e-12) throw new Error("FlashAttention backward row-sum invariant regression");

for (const [id, answers] of Object.entries({
  "transformer-ledger":["288192","3670016","15106048"],
  "kernel-contracts":["3x3","3x70","ds-zero"],
  "distributed-runtime":["32","32","wait"],
  "scaling-transfer":["hidden","readout","decayed"],
  "moe-routing":["4","2","alpha"],
  "rlvr-system-transfer":["dr","surrogate","four"]
})) if (JSON.stringify(labObjectives[id]?.answers) !== JSON.stringify(answers)) throw new Error(`labObjectives.${id}: fixed answer regression`);

// The DPO lab only teaches anything as long as every wrong variant stays bit-identical to the
// correct one on at least one preference pair and exposed on at least one other. Recompute
// Equation (3) here independently of the app so a tweaked token value cannot silently break that.
const dpoBeta = readConstant("DPO_BETA");
const dpoCases = readConstant("DPO_CASES");
const dpoVariants = readConstant("DPO_VARIANTS");
if (dpoBeta !== 0.1) throw new Error(`DPO_BETA: the A5 supplement prescribes 0.1, found ${dpoBeta}`);
if (dpoVariants.filter(variant => variant.ok).length !== 1) throw new Error("DPO_VARIANTS: exactly one variant may be marked correct");
const dpoLoss = (item, variantKey) => {
  const f32 = value => Math.fround(value);
  const sum = list => list.reduce((total, value) => f32(total + value), 0);
  const side = entry => entry.theta ? { theta: sum(entry.theta), ref: sum(entry.ref), length: entry.theta.length }
    : { theta: f32(entry.thetaSum), ref: f32(entry.refSum), length: entry.length };
  const scale = (entry, key) => variantKey === "meanNormalize" ? f32(entry[key] / entry.length) : entry[key];
  const margin = entry => variantKey === "noRef" ? scale(entry, "theta") : f32(scale(entry, "theta") - scale(entry, "ref"));
  const chosen = side(item.chosen), rejected = side(item.rejected);
  let logit = f32(dpoBeta * f32(margin(chosen) - margin(rejected)));
  if (variantKey === "swapped") logit = f32(-logit);
  if (variantKey === "sigmoidThenLog") return f32(-Math.log(f32(1 / f32(1 + f32(Math.exp(f32(-logit)))))));
  return logit >= 0 ? f32(Math.log1p(f32(Math.exp(f32(-logit))))) : f32(f32(-logit) + f32(Math.log1p(f32(Math.exp(f32(logit))))));
};
for (const variant of dpoVariants) {
  if (variant.ok) continue;
  const hidden = [], exposed = [];
  for (const [caseKey, item] of Object.entries(dpoCases)) {
    (dpoLoss(item, variant.key).toFixed(6) === dpoLoss(item, "correct").toFixed(6) ? hidden : exposed).push(caseKey);
  }
  if (!hidden.length) throw new Error(`DPO_CASES: variant ${variant.key} is exposed on every preference pair, so the lab's core lesson no longer holds`);
  if (!exposed.length) throw new Error(`DPO_CASES: variant ${variant.key} is hidden on every preference pair, so nothing ever reveals it`);
}
if (dpoLoss(dpoCases.confident, "sigmoidThenLog") !== Infinity) throw new Error("DPO_CASES.confident: the sigmoid-then-log variant no longer overflows, which is the case the transfer answer explains");
if (dpoLoss(dpoCases.tied, "correct").toFixed(6) !== Math.log(2).toFixed(6)) throw new Error("DPO_CASES.tied: h is no longer exactly zero, so the loss is no longer log 2");

for (const forbidden of ["Implementierungen können andere Pairings", "Implementations may use different pairings"]) {
  if (`${prose(baseConcepts.rope)} ${prose(baseFormulas.rope)} ${prose(englishConcepts.rope)} ${prose(englishFormulas.rope)}`.includes(forbidden)) throw new Error(`A1 RoPE contract became permissive again: ${forbidden}`);
}

// The RoPE lab exists because the A1 pairing, exponent, and position source can each be wrong without
// the output looking broken. That only teaches something as long as every wrong variant stays identical
// to the A1 reference on at least one input case and is exposed on at least one other. Equation (8) is
// retyped here from the handout, independently of the app, so an edited case vector cannot quietly
// destroy the lesson. The distance-only property is asserted too: it is the reason the errors survive.
const ropeTheta = readConstant("ROPE_LAB_THETA");
const ropeCases = readConstant("ROPE_LAB_CASES");
const ropeVariants = readConstant("ROPE_LAB_VARIANTS");
if (ropeTheta !== 10000) throw new Error(`ROPE_LAB_THETA: the A1 handout uses 10000, found ${ropeTheta}`);
if (ropeVariants.filter(variant => variant.ok).length !== 1) throw new Error("ROPE_LAB_VARIANTS: exactly one variant may be marked correct");
const ropeRotate = (vector, dk, position, key) => {
  const out = vector.slice();
  for (let k = 1; k <= dk / 2; k++) {
    const angle = position / ropeTheta ** ((key === "shiftedExponent" ? 2 * k : 2 * k - 2) / dk);
    const [a, b] = key === "halfSplit" ? [k - 1, k - 1 + dk / 2] : [2 * k - 2, 2 * k - 1];
    const cos = Math.cos(angle), sin = Math.sin(angle);
    out[a] = key === "signFlip" ? vector[a] * cos + vector[b] * sin : vector[a] * cos - vector[b] * sin;
    out[b] = key === "signFlip" ? -vector[a] * sin + vector[b] * cos : vector[a] * sin + vector[b] * cos;
  }
  return out;
};
const ropeRows = (item, key) => item.positions.map((position, index) => ({
  q: ropeRotate(item.q, item.dk, key === "ignoredPositions" ? index : position, key),
  k: ropeRotate(item.k, item.dk, key === "ignoredPositions" ? index : position, key)
}));
const ropePrint = (item, key) => ropeRows(item, key).map(row => row.q.map(value => value.toFixed(6)).join(",")).join("|");
const ropeScore = (rows, a, b) => rows[a].q.reduce((sum, value, index) => sum + value * rows[b].k[index], 0);
for (const [caseKey, item] of Object.entries(ropeCases)) {
  if (item.dk % 2 || item.q.length !== item.dk || item.k.length !== item.dk) throw new Error(`ROPE_LAB_CASES.${caseKey}: q and k must both have d_k entries and d_k must be even`);
}
for (const variant of ropeVariants) {
  if (variant.ok) continue;
  const hidden = [], exposed = [];
  for (const [caseKey, item] of Object.entries(ropeCases)) {
    (ropePrint(item, variant.key) === ropePrint(item, "correct") ? hidden : exposed).push(caseKey);
  }
  if (!hidden.length) throw new Error(`ROPE_LAB_CASES: variant ${variant.key} is exposed on every input case, so the lab's core lesson no longer holds`);
  if (!exposed.length) throw new Error(`ROPE_LAB_CASES: variant ${variant.key} is hidden on every input case, so nothing ever reveals it`);
}
for (const key of ["single", "head2", "contiguous", "sliced"]) if (!ropeCases[key]) throw new Error(`ROPE_LAB_CASES.${key}: the four cases the transfer answer argues about must all exist`);
if (ropeCases.single.positions.join() !== "0") throw new Error("ROPE_LAB_CASES.single: must stay the single token at position 0 that hides every error");
if (ropeCases.head2.dk !== 2) throw new Error("ROPE_LAB_CASES.head2: d_k must stay 2, or neighbouring pairing and Half-Split stop coinciding");
if (ropeCases.contiguous.positions.some((position, index) => position !== index)) throw new Error("ROPE_LAB_CASES.contiguous: positions must equal the axis index, or the ignored-positions variant is no longer hidden");
if (ropeCases.sliced.positions[0] === 0) throw new Error("ROPE_LAB_CASES.sliced: positions must not start at zero, or nothing distinguishes token_positions from the axis index");
for (const variant of ropeVariants) {
  const rows = ropeRows(ropeCases.sliced, variant.key);
  if (Math.abs(ropeScore(rows, 0, 1) - ropeScore(rows, 1, 2)) > 1e-9) throw new Error(`ROPE_LAB_CASES.sliced: variant ${variant.key} no longer yields a distance-only score, which is the observation the lab is built on`);
}
if (Math.abs(ropeScore(ropeRows(ropeCases.sliced, "ignoredPositions"), 0, 1) - ropeScore(ropeRows(ropeCases.sliced, "correct"), 0, 1)) > 1e-9) throw new Error("ROPE_LAB_CASES.sliced: the ignored-positions score must still match the correct one, because the transfer answer explains exactly that");
if (ropePrint(ropeCases.sliced, "ignoredPositions") === ropePrint(ropeCases.sliced, "correct")) throw new Error("ROPE_LAB_CASES.sliced: the ignored-positions tensor must differ, or the transfer answer has nothing to explain");
const ropeLab = base.labs.find(lab => lab.id === "rope-rotation");
if (ropeLab?.module !== "transformer") throw new Error("labs.rope-rotation: must live in the Transformer module so Lecture 3 can cite it");
if (!base.lectureGuides.l03.labs.includes("rope-rotation")) throw new Error("lecture guides.l03: RoPE is decided in Lecture 3 and its lab belongs there");
if (!base.assignments.find(assignment => assignment.id === "a1")?.missions.find(mission => mission.id === "tensor-primitives")?.labs.includes("rope-rotation")) throw new Error("A1 tensor-primitives mission is missing the RoPE lab, so a1:rope would have no interactive object");
// --- norm-and-ffn lab: RMSNorm eq. (4) and SwiGLU eq. (7) of the A1 handout
const normEps = readConstant("NORM_LAB_EPS");
const normCases = readConstant("NORM_LAB_CASES");
const normVariants = readConstant("NORM_LAB_VARIANTS");
const ffnCases = readConstant("FFN_LAB_CASES");
const ffnVariants = readConstant("FFN_LAB_VARIANTS");
const ffnW1 = readConstant("FFN_LAB_W1"), ffnW3 = readConstant("FFN_LAB_W3"), ffnW2 = readConstant("FFN_LAB_W2");
if (normEps !== 1e-5) throw new Error(`NORM_LAB_EPS: the A1 handout fixes eps at 1e-5, found ${normEps}`);
if (normVariants.filter(variant => variant.ok).length !== 1) throw new Error("NORM_LAB_VARIANTS: exactly one variant may be marked correct");
if (ffnVariants.filter(variant => variant.ok).length !== 1) throw new Error("FFN_LAB_VARIANTS: exactly one variant may be marked correct");
const avg = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const normRows = (item, key) => {
  const flatScale = Math.sqrt(avg(item.rows.flat().map(value => value * value)) + normEps);
  return item.rows.map(row => {
    if (key === "layerNorm") {
      const mu = avg(row), centered = row.map(value => value - mu);
      const scale = Math.sqrt(avg(centered.map(value => value * value)) + normEps);
      return centered.map((value, index) => value / scale * item.gain[index]);
    }
    const meanSquare = avg(row.map(value => value * value));
    if (key === "flatMean") return row.map((value, index) => value / flatScale * item.gain[index]);
    if (key === "epsOutside") { const scale = Math.sqrt(meanSquare) + normEps; return row.map((value, index) => value / scale * item.gain[index]); }
    const scale = Math.sqrt(meanSquare + normEps);
    if (key === "noGain") return row.map(value => value / scale);
    return row.map((value, index) => value / scale * item.gain[index]);
  });
};
const normPrint = (item, key) => normRows(item, key).map(row => row.map(value => value.toFixed(6)).join(",")).join("|");
const matVec = (matrix, vector) => matrix.map(row => row.reduce((sum, weight, index) => sum + weight * vector[index], 0));
const sig = value => 1 / (1 + Math.exp(-value));
const ffnOut = (item, key) => {
  const gateIn = matVec(ffnW1, item.x), contentIn = matVec(ffnW3, item.x);
  let inner;
  if (key === "swapBranches") inner = contentIn.map((value, index) => value * sig(value) * gateIn[index]);
  else if (key === "plainGlu") inner = gateIn.map((value, index) => sig(value) * contentIn[index]);
  else if (key === "noGate") inner = gateIn.map(value => value * sig(value));
  else if (key === "reluGate") inner = gateIn.map((value, index) => Math.max(0, value) * contentIn[index]);
  else inner = gateIn.map((value, index) => value * sig(value) * contentIn[index]);
  return matVec(ffnW2, inner);
};
const ffnPrint = (item, key) => ffnOut(item, key).map(value => value.toFixed(6)).join(",");
for (const [caseKey, item] of Object.entries(normCases)) {
  if (!item.rows.length || item.rows.some(row => row.length !== item.gain.length)) throw new Error(`NORM_LAB_CASES.${caseKey}: every row must have exactly one gain entry per feature`);
}
for (const [caseKey, item] of Object.entries(ffnCases)) {
  if (item.x.length !== ffnW1[0].length || ffnW1.length !== ffnW3.length || ffnW2[0].length !== ffnW1.length) throw new Error(`FFN_LAB_CASES.${caseKey}: x, W1, W3 and W2 no longer form a d_model -> d_ff -> d_model chain`);
}
for (const [label, cases, variants, print] of [["NORM", normCases, normVariants, normPrint], ["FFN", ffnCases, ffnVariants, ffnPrint]]) {
  for (const variant of variants) {
    if (variant.ok) continue;
    const hidden = [], exposed = [];
    for (const [caseKey, item] of Object.entries(cases)) (print(item, variant.key) === print(item, "correct") ? hidden : exposed).push(caseKey);
    if (!hidden.length) throw new Error(`${label}_LAB_CASES: variant ${variant.key} is exposed on every input case, so the lab's core lesson no longer holds`);
    if (!exposed.length) throw new Error(`${label}_LAB_CASES: variant ${variant.key} is hidden on every input case, so nothing ever reveals it`);
  }
}
for (const key of ["single", "large", "tiny", "zeroMean", "trainedGain"]) if (!normCases[key]) throw new Error(`NORM_LAB_CASES.${key}: the five cases the transfer answer argues about must all exist`);
for (const key of ["ones", "zeros", "symmetric", "asymmetric"]) if (!ffnCases[key]) throw new Error(`FFN_LAB_CASES.${key}: the four cases the transfer answer argues about must all exist`);
if (normCases.single.rows.length !== 1 || normCases.single.gain.some(value => value !== 1)) throw new Error("NORM_LAB_CASES.single: must stay one row with gain one, because the whole lesson is that this case hides the axis and gain errors");
if (normCases.zeroMean.rows.some(row => Math.abs(avg(row)) > 1e-12)) throw new Error("NORM_LAB_CASES.zeroMean: every row must have mean zero, or the LayerNorm reflex stops being hidden");
if (new Set(normCases.zeroMean.rows.map(row => avg(row.map(value => value * value)).toFixed(9))).size < 2) throw new Error("NORM_LAB_CASES.zeroMean: the rows must differ in squared length, or the whole-tensor reduction stops being exposed");
if (normCases.trainedGain.gain.every(value => value === 1)) throw new Error("NORM_LAB_CASES.trainedGain: the gain must differ from one, or nothing ever exposes the forgotten gain");
for (const variant of normVariants) if (!variant.ok && normPrint(normCases.trainedGain, variant.key) === normPrint(normCases.trainedGain, "correct")) throw new Error(`NORM_LAB_CASES.trainedGain: variant ${variant.key} stays hidden, but the lab claims this case separates all four`);
if (ffnCases.zeros.x.some(value => value !== 0)) throw new Error("FFN_LAB_CASES.zeros: x must stay the zero vector, because the zero test hiding every error is the lab's sharpest point");
for (const variant of ffnVariants) if (!variant.ok && ffnPrint(ffnCases.zeros, variant.key) !== ffnPrint(ffnCases.zeros, "correct")) throw new Error(`FFN_LAB_CASES.zeros: variant ${variant.key} is exposed by the zero test, but the lab teaches that this test proves nothing`);
for (const variant of ffnVariants) if (!variant.ok && ffnPrint(ffnCases.asymmetric, variant.key) === ffnPrint(ffnCases.asymmetric, "correct")) throw new Error(`FFN_LAB_CASES.asymmetric: variant ${variant.key} stays hidden, but the lab claims this case separates all four`);
if (matVec(ffnW1, ffnCases.ones.x).some(value => value !== 1)) throw new Error("FFN_LAB_CASES.ones: W1x must be all ones, or SiLU(1) = sigma(1) no longer hides the plain-GLU variant");
const normFfnLab = base.labs.find(lab => lab.id === "norm-and-ffn");
if (normFfnLab?.module !== "transformer") throw new Error("labs.norm-and-ffn: must live in the Transformer module so Lecture 3 can cite it");
if (!base.lectureGuides.l03.labs.includes("norm-and-ffn")) throw new Error("lecture guides.l03: RMSNorm and SwiGLU are decided in Lecture 3 and their lab belongs there");
if (!base.assignments.find(assignment => assignment.id === "a1")?.missions.find(mission => mission.id === "tensor-primitives")?.labs.includes("norm-and-ffn")) throw new Error("A1 tensor-primitives mission is missing the norm-and-ffn lab, so a1:rmsnorm and a1:positionwise_feedforward would have no interactive object");
for (const required of ["8/3", "Vielfaches von 64"]) if (!normFfnLab.formula.includes(required)) throw new Error(`labs.norm-and-ffn.formula: must keep the d_ff rule (${required}), which A1 fixes explicitly`);
const normFfnRenderer = source.slice(source.indexOf("function normLabStageMarkup"), source.indexOf("function normFfnSuccessMarkup"));
for (const required of ["normLabResult(item,\"correct\")", "ffnLabResult(item,\"correct\")", "Größte Abweichung", "normFfnDff(512)", "normFfnDff(1600)"]) if (!normFfnRenderer.includes(required)) throw new Error(`norm-and-ffn renderer: must stay data-driven and keep ${required}`);
if (Math.round(8 * 1600 / 3 / 64) * 64 !== 4288) throw new Error("d_ff rounding no longer reproduces the handout's own worked example d_model=1600 -> 4288");

// --- comm-crossover lab: section 8 of the A2 handout, equations (20)-(59).
// The whole lab is one claim: which quantity survives the cancellation in T_comm/T_comp.
// Recompute the FLOP counts, the ring costs, and every crossover here from the handout,
// sharing no code with the app, and additionally brute-force each closed form.
const commBytes = readConstant("COMM_BYTES_PER_ELEMENT");
const commCases = readConstant("COMM_CASES");
const commStrategies = readConstant("COMM_STRATEGIES");
if (commBytes !== 2) throw new Error(`COMM_BYTES_PER_ELEMENT: section 8 assumes FP16, so two bytes, found ${commBytes}`);
if (JSON.stringify(commStrategies.map(entry => entry.key)) !== JSON.stringify(["dp", "fsdp", "tp"])) throw new Error("COMM_STRATEGIES: the lab compares exactly data parallel, FSDP, and tensor parallel");
for (const key of ["node", "cluster", "smallBatch", "wide"]) if (!commCases[key]) throw new Error(`COMM_CASES.${key}: the four cases the lab's observe text walks through must all exist`);
// forward: x*W1, x*W2, z*W3 -> 3 matmuls of 2*B*D*DFF; backward: dz, dx (two), dW3, dW2, dW1 -> 6 such matmuls
const commFlops = (pass, c) => (pass === "fwd" ? 6 : 12) * c.B * c.D * c.DFF;
const ringGather = (S, N, W) => N <= 1 ? 0 : (N - 1) / N * S / W;
const ringReduce = (S, N, W) => N <= 1 ? 0 : 2 * (N - 1) / N * S / W;
const commTimes = (strategy, pass, N, c) => {
  const weights = 3 * c.D * c.DFF * commBytes, activations = c.B * c.D * commBytes;
  let comm = 0;
  if (strategy === "dp" && pass === "bwd") comm = ringReduce(weights, N, c.W);
  if (strategy === "fsdp") comm = ringGather(weights, N, c.W) + (pass === "bwd" ? ringGather(weights, N, c.W) : 0);
  if (strategy === "tp") comm = ringReduce(activations, N, c.W);
  return { tComp: commFlops(pass, c) / N / c.C, tComm: comm };
};
const commClosed = (strategy, pass, c) => {
  if (strategy === "dp") return pass === "fwd" ? Infinity : 1 + c.B * c.W / c.C;
  if (strategy === "fsdp") return 1 + c.B * c.W / c.C;
  return 1 + (pass === "fwd" ? 1.5 : 3) * c.DFF * c.W / c.C;
};
const appCommTimes = (strategy, pass, N, c) => { const r = commSingleFromApp(strategy, pass, N, c); return { tComp: r.tComp, tComm: r.tComm } };
const commSingleFromApp = new Function(`"use strict"; ${[
  "COMM_BYTES_PER_ELEMENT", "commRingGather", "commRingReduce", "commWeightBytes", "commActivationBytes", "commSingle", "commLimit", "commTwoD"
].map(name => sliceDeclaration(source, name)).join("\n")} return commSingle;`)();
const appCommLimit = new Function(`"use strict"; ${sliceDeclaration(source, "commLimit")} return commLimit;`)();
const appCommTwoD = new Function(`"use strict"; ${[
  "COMM_BYTES_PER_ELEMENT", "commRingGather", "commRingReduce", "commWeightBytes", "commTwoD"
].map(name => sliceDeclaration(source, name)).join("\n")} return commTwoD;`)();
for (const [caseKey, c] of Object.entries(commCases)) {
  for (const strategy of ["dp", "fsdp", "tp"]) for (const pass of ["fwd", "bwd"]) {
    for (const N of [2, 4, 8, 16, 32, 64, 128, 256]) {
      const mine = commTimes(strategy, pass, N, c), theirs = appCommTimes(strategy, pass, N, c);
      if (Math.abs(mine.tComp - theirs.tComp) > 1e-15 || Math.abs(mine.tComm - theirs.tComm) > 1e-15) throw new Error(`comm-crossover ${caseKey}/${strategy}/${pass}/N=${N}: app disagrees with the handout recomputation`);
    }
    const closed = commClosed(strategy, pass, c), app = appCommLimit(strategy, pass, c);
    if (Math.abs(closed - app) > 1e-9 && closed !== app) throw new Error(`comm-crossover ${caseKey}/${strategy}/${pass}: closed form ${app} does not match ${closed}`);
    if (Number.isFinite(closed)) {
      let brute = 1;
      for (let N = 2; N <= 4e6; N++) { const t = commTimes(strategy, pass, N, c); if (t.tComm < t.tComp) brute = N; else break; }
      if (brute !== Math.max(1, Math.ceil(closed) - 1)) throw new Error(`comm-crossover ${caseKey}/${strategy}/${pass}: brute force stops at ${brute} but the closed form promises ${closed}`);
    }
  }
}
// The lab's four cases only teach anything if each one isolates exactly one quantity.
const dpLimitOf = key => commClosed("dp", "bwd", commCases[key]), tpLimitOf = key => commClosed("tp", "fwd", commCases[key]);
if (dpLimitOf("node") !== dpLimitOf("wide")) throw new Error("COMM_CASES.wide: a wider FFN must leave the data parallel limit untouched, which is the point of that case");
if (tpLimitOf("node") !== tpLimitOf("smallBatch")) throw new Error("COMM_CASES.smallBatch: a smaller batch must leave the tensor parallel limit untouched, which is the point of that case");
if (!(tpLimitOf("wide") > tpLimitOf("node") && dpLimitOf("smallBatch") < dpLimitOf("node"))) throw new Error("COMM_CASES: the wide case must raise the TP limit and the small-batch case must lower the DP limit");
if (commCases.cluster.W >= commCases.node.W || commCases.cluster.B !== commCases.node.B || commCases.cluster.DFF !== commCases.node.DFF) throw new Error("COMM_CASES.cluster: only the bandwidth may differ from the node case, or 'only W changes' becomes false");
if (Math.abs(commClosed("dp", "bwd", commCases.node) - commClosed("fsdp", "fwd", commCases.node)) > 1e-9) throw new Error("comm-crossover: FSDP forward and DP backward must share one limit, which is the second transfer answer");
// 2D: overlapped limits multiply, and a shared link costs a factor of four.
const twoDCase = commCases.node, tpLimit = commClosed("tp", "fwd", twoDCase), fsdpLimit = commClosed("fsdp", "fwd", twoDCase);
const alpha = 1 / (tpLimit - 1), beta = 1 / (fsdpLimit - 1), serialClosed = (1 + alpha + beta) ** 2 / (4 * alpha * beta);
let bestOverlap = 0, bestSerial = 0;
for (let t = 1; t <= 2 ** 14; t *= 2) for (let f = 1; f <= 2 ** 14; f *= 2) {
  const r = appCommTwoD(t, f, twoDCase);
  const expectedComp = 6 * twoDCase.B * twoDCase.D * twoDCase.DFF / (t * f) / twoDCase.C;
  const expectedTP = ringReduce(twoDCase.B / f * twoDCase.D * commBytes, t, twoDCase.W);
  const expectedFSDP = ringGather(3 * twoDCase.D * twoDCase.DFF * commBytes / t, f, twoDCase.W);
  if (Math.abs(r.tComp - expectedComp) > 1e-15 || Math.abs(r.tTP - expectedTP) > 1e-15 || Math.abs(r.tFSDP - expectedFSDP) > 1e-15) throw new Error(`comm-crossover 2D ${t}x${f}: app disagrees with the handout recomputation`);
  if (Math.max(r.tTP, r.tFSDP) < r.tComp) bestOverlap = Math.max(bestOverlap, t * f);
  if (r.tTP + r.tFSDP < r.tComp) bestSerial = Math.max(bestSerial, t * f);
}
if (!(bestOverlap <= tpLimit * fsdpLimit && bestSerial <= serialClosed)) throw new Error("comm-crossover 2D: a grid search beats the closed-form maximum, so one of the two formulas is wrong");
if (!(bestSerial < bestOverlap)) throw new Error("comm-crossover 2D: sharing the link must cost devices, or the third transfer answer is empty");
if (Math.abs(serialClosed / (tpLimit * fsdpLimit) - 0.25) > 0.05) throw new Error(`comm-crossover 2D: the serial optimum must stay near a quarter of the overlapped one, found ${(serialClosed / (tpLimit * fsdpLimit)).toFixed(3)}`);
const commLab = base.labs.find(lab => lab.id === "comm-crossover");
if (commLab?.module !== "distributed") throw new Error("labs.comm-crossover: must live in the Distributed module so Lectures 7 and 8 can cite it");
for (const lectureId of ["l07", "l08"]) if (!base.lectureGuides[lectureId].labs.includes("comm-crossover")) throw new Error(`lecture guides.${lectureId}: the communication limit is decided there and its lab belongs there`);
const a2Missions = base.assignments.find(assignment => assignment.id === "a2").missions;
for (const missionId of ["parallel-accounting", "sharding-fsdp"]) if (!a2Missions.find(mission => mission.id === missionId).labs.includes("comm-crossover")) throw new Error(`A2 ${missionId} mission is missing the comm-crossover lab, so the section 8 calculations would have no interactive object`);
for (const required of ["B·W/C", "D_FF·W/C", "(N−1)/N"]) if (!commLab.formula.includes(required)) throw new Error(`labs.comm-crossover.formula: must keep ${required}, which is the whole result of section 8`);
const commRenderer = source.slice(source.indexOf("function commSingleStageMarkup"), source.indexOf("function commCrossoverSuccessMarkup"));
for (const required of ["commSingle(strategy,pass,N,c)", "commLimit(strategy,pass,c)", "commTwoD(NTP,NFSDP,c)", "T_comm / T_comp"]) if (!commRenderer.includes(required)) throw new Error(`comm-crossover renderer: must stay data-driven and keep ${required}`);

// --- answer-parsing lab: A5 section 3.3 (format/answer reward) and the supplement's two parser problems.
// The graders and rules below are typed out again from the handout and share no code with the app.
const parsePrompts = readConstant("PARSE_PROMPTS");
const parseGraders = readConstant("PARSE_GRADERS");
const parseBenchmarks = readConstant("PARSE_BENCHMARKS");
const parseGold = readConstant("PARSE_GOLD_GSM8K");
const refNorm = value => {
  if (value === null || value === undefined) return null;
  const cleaned = String(value).replace(/[\s$]/g, "").replace(/,(?=\d{3}\b)/g, "").replace(/\.$/, "");
  return /^-?\d+(\.\d+)?$/.test(cleaned) ? String(Number(cleaned)) : cleaned;
};
const refNumbers = text => text.match(/-?\d(?:[\d,]*\d)?(?:\.\d+)?/g) || [];
const refGrade = (grader, text) => {
  if (grader === "r1zero") { const m = /<\/think>\s*<answer>([\s\S]*?)<\/answer>\s*$/.exec(text); return m ? { format: 1, extracted: m[1].trim() } : { format: 0, extracted: null }; }
  if (grader === "boxed") { const m = /\\boxed\{(.*?)\}/.exec(text); return m ? { format: 1, extracted: m[1].trim() } : { format: 0, extracted: null }; }
  const numbers = refNumbers(text);
  return { format: 1, extracted: numbers.length ? numbers[numbers.length - 1] : null };
};
const refRule = (benchmark, rule, item) => {
  if (benchmark === "mmlu") {
    const stated = /[Tt]he correct answer is ([A-D])\b/.exec(item.gen);
    if (rule === "stated") return stated ? stated[1] : null;
    const standalone = item.gen.match(/(?<![A-Za-z])[A-D](?![A-Za-z])/g);
    if (rule === "firstLetter") return standalone ? standalone[0] : null;
    if (rule === "lastLetter") return standalone ? standalone[standalone.length - 1] : null;
    if (stated) return stated[1];
    const hit = item.options.findIndex(option => item.gen.toLowerCase().includes(option.toLowerCase()));
    return hit >= 0 ? "ABCD"[hit] : null;
  }
  const numbers = refNumbers(item.gen);
  if (rule === "lastNumber") return numbers.length ? numbers[numbers.length - 1] : null;
  if (rule === "firstNumber") return numbers.length ? numbers[0] : null;
  if (rule === "lastDigits") { const digits = item.gen.match(/\d+/g); return digits ? digits[digits.length - 1] : null; }
  const cue = /answer is\s+(-?\d(?:[\d,]*\d)?(?:\.\d+)?)/.exec(item.gen);
  return cue ? cue[1] : null;
};
const appParseReward = new Function(`"use strict"; ${["parseNumbersIn", "parseNormalizeAnswer", "parseGrade", "parseRolloutReward"].map(name => sliceDeclaration(source, name)).join("\n")} return parseRolloutReward;`)();
const appParseRule = new Function(`"use strict"; ${["parseNumbersIn", "parseNormalizeAnswer", "parseApplyRule"].map(name => sliceDeclaration(source, name)).join("\n")} return parseApplyRule;`)();
const appParseRuleReport = new Function(`"use strict"; const PARSE_BENCHMARKS = ${JSON.stringify(parseBenchmarks)}; ${["parseNumbersIn", "parseNormalizeAnswer", "parseApplyRule", "parseRuleReport"].map(name => sliceDeclaration(source, name)).join("\n")} return parseRuleReport;`)();
if (parseGraders.length !== 3 || JSON.stringify(parseGraders.map(entry => entry.key)) !== JSON.stringify(["r1zero", "boxed", "lastNumber"])) throw new Error("PARSE_GRADERS: the lab compares exactly the two A5 reward functions and one naive grader");
if (JSON.stringify(parsePrompts.map(entry => entry.key)) !== JSON.stringify(["questionOnly", "r1zero", "r1zeroFewShot"])) throw new Error("PARSE_PROMPTS: the three prompts of prompting_baselines must all exist and stay in handout order");
const parseAccuracy = {};
for (const prompt of parsePrompts) {
  if (prompt.rollouts.length !== 6) throw new Error(`PARSE_PROMPTS.${prompt.key}: the observe text and the transfer check both count six rollouts`);
  for (const grader of parseGraders) {
    let scored = 0, formatted = 0, lost = 0;
    prompt.rollouts.forEach((rollout, index) => {
      const graded = refGrade(grader.key, rollout.text);
      const answer = graded.format === 1 && graded.extracted !== null && refNorm(graded.extracted) === refNorm(parseGold) ? 1 : 0;
      const app = appParseReward(grader.key, rollout, parseGold);
      if (app.format !== graded.format || app.answer !== answer || app.extracted !== graded.extracted) throw new Error(`answer-parsing ${prompt.key}/${grader.key}/rollout ${index}: app disagrees with the handout recomputation`);
      if (app.total !== app.answer) throw new Error("answer-parsing: A5 gives no partial credit, so the total reward must equal the answer reward");
      if (app.format === 0 && app.answer === 1) throw new Error("answer-parsing: format 0 with answer 1 would be a fourth category the handout does not have");
      scored += answer; formatted += graded.format;
      if (rollout.human && answer === 0) lost++;
    });
    parseAccuracy[`${prompt.key}/${grader.key}`] = { scored, formatted, lost, human: prompt.rollouts.filter(rollout => rollout.human).length };
  }
}
// the didactic diagonal: applying the other prompt's reward function must score zero, not crash
if (parseAccuracy["questionOnly/r1zero"].scored !== 0 || parseAccuracy["r1zero/boxed"].scored !== 0 || parseAccuracy["r1zeroFewShot/boxed"].scored !== 0) throw new Error("answer-parsing: a mismatched reward function must score zero everywhere, which is the point of the matrix");
if (parseAccuracy["questionOnly/r1zero"].human < 4) throw new Error("answer-parsing: the first transfer answer needs at least four rollouts that read as correct under the question_only prompt");
// few-shot must buy more format than substance, which is the whole transfer question
const fewShotGain = parseAccuracy["r1zeroFewShot/r1zero"].scored - parseAccuracy["r1zero/r1zero"].scored;
const humanGain = parseAccuracy["r1zeroFewShot/r1zero"].human - parseAccuracy["r1zero/r1zero"].human;
if (!(fewShotGain === 2 && humanGain === 1)) throw new Error(`answer-parsing: few-shot must add two scored rollouts but only one substantively correct one, found ${fewShotGain} and ${humanGain}`);
if (!(parseAccuracy["r1zeroFewShot/r1zero"].formatted === 6 && parseAccuracy["r1zero/r1zero"].formatted === 5)) throw new Error("answer-parsing: the format rate must rise from 5/6 to 6/6 under few-shot, or the transfer answer is wrong");
if (parseAccuracy["r1zeroFewShot/r1zero"].lost !== 1) throw new Error("answer-parsing: the „72 clips“ rollout must survive few-shot as a category 2 case");
const parseRuleStats = {};
for (const [benchmarkKey, benchmark] of Object.entries(parseBenchmarks)) {
  if (benchmark.items.length !== 8) throw new Error(`PARSE_BENCHMARKS.${benchmarkKey}: the transfer check and the ledger text both count eight answers`);
  for (const rule of benchmark.rules) {
    let parsed = 0, correct = 0;
    const appReport = appParseRuleReport(benchmarkKey, rule.key);
    benchmark.items.forEach((item, index) => {
      const mine = refRule(benchmarkKey, rule.key, item), theirs = appParseRule(benchmarkKey, rule.key, item);
      if (mine !== theirs) throw new Error(`answer-parsing ${benchmarkKey}/${rule.key}/item ${index}: app extracted ${theirs} but the handout rule gives ${mine}`);
      const gold = benchmarkKey === "mmlu" ? item.gold : refNorm(item.gold);
      const ok = mine !== null && (benchmarkKey === "mmlu" ? mine : refNorm(mine)) === gold;
      if (appReport.rows[index].correct !== ok) throw new Error(`answer-parsing ${benchmarkKey}/${rule.key}/item ${index}: app scores it ${appReport.rows[index].correct} but the handout comparison gives ${ok}`);
      if (mine === null) return;
      parsed++;
      if (ok) correct++;
    });
    if (appReport.parsed !== parsed || appReport.correct !== correct) throw new Error(`answer-parsing ${benchmarkKey}/${rule.key}: app reports ${appReport.parsed}/${appReport.correct} against the recomputed ${parsed}/${correct}`);
    parseRuleStats[`${benchmarkKey}/${rule.key}`] = { parsed, correct, all: correct / 8, onParsed: parsed ? correct / parsed : 0 };
  }
}
if (!(parseRuleStats["mmlu/stated"].parsed === 5 && Math.abs(parseRuleStats["mmlu/stated"].onParsed - 0.8) < 1e-9 && Math.abs(parseRuleStats["mmlu/stated"].all - 0.5) < 1e-9)) throw new Error("answer-parsing: the third transfer question quotes 5 of 8 parsed at 80 %, which must equal 50 % over all");
for (const [key, stats] of Object.entries(parseRuleStats)) if (stats.parsed < 8 && !(stats.onParsed > stats.all)) throw new Error(`answer-parsing ${key}: dropping unparsed cases must inflate the score, or the closing note is empty`);
if (!(parseRuleStats["gsm8k/afterCue"].onParsed > parseRuleStats["gsm8k/lastNumber"].all - 0.3 && parseRuleStats["gsm8k/afterCue"].all < parseRuleStats["gsm8k/lastNumber"].all)) throw new Error("answer-parsing: the cue rule must look respectable on parsed cases and poor overall");
const mmluFirst = parseRuleStats["mmlu/firstLetter"], mmluText = parseRuleStats["mmlu/statedElseText"];
if (!(mmluFirst.parsed === mmluText.parsed && mmluFirst.correct === mmluText.correct)) throw new Error("answer-parsing: the two MMLU rules must report identical aggregates, which is the closing note's example");
const mmluDiff = parseBenchmarks.mmlu.items.filter(item => refRule("mmlu", "firstLetter", item) !== refRule("mmlu", "statedElseText", item)).length;
if (mmluDiff !== 2) throw new Error(`answer-parsing: exactly two MMLU items must differ between the two rules, found ${mmluDiff}`);
const parseLab = base.labs.find(lab => lab.id === "answer-parsing");
if (parseLab?.module !== "evaluation") throw new Error("labs.answer-parsing: must live in the Evaluation module so Lecture 12 can cite it");
if (!base.lectureGuides.l12.labs.includes("answer-parsing")) throw new Error("lecture guides.l12: the evaluation lecture asks how outputs are scored, so its lab belongs there");
const a5Missions = base.assignments.find(assignment => assignment.id === "a5").missions;
for (const missionId of ["prompting", "supplement"]) if (!a5Missions.find(mission => mission.id === missionId).labs.includes("answer-parsing")) throw new Error(`A5 ${missionId} mission is missing the answer-parsing lab, so its parser problems would have no interactive object`);
for (const required of ["k/n", "k/n_geparst", "SE = √(p(1−p)/n)"]) if (!parseLab.formula.includes(required)) throw new Error(`labs.answer-parsing.formula: must keep ${required}, which is what the ledger prints`);
for (const required of ["k/n", "k/n_parsed", "SE = √(p(1−p)/n)"]) if (!pack.labs["answer-parsing"].formula.includes(required)) throw new Error(`labs.answer-parsing.formula (English): must keep ${required}`);
const parseRendererA = source.slice(source.indexOf("function parseGraderStageMarkup"), source.indexOf("function parseRuleStageMarkup"));
for (const required of ["parsePromptReport(promptKey,graderKey,PARSE_GOLD_GSM8K)", "row.rollout.human", "report.buckets[0]", "report.lostToParser"]) if (!parseRendererA.includes(required)) throw new Error(`answer-parsing grader renderer: must stay data-driven and keep ${required}`);
const parseRendererB = source.slice(source.indexOf("function parseRuleStageMarkup"), source.indexOf("function updateAnswerParsing"));
for (const required of ["parseRuleReport(benchmarkKey,rule.key)", "parseStandardError(report.accuracyAll,report.n)", "report.accuracyParsed", "1.96*se"]) if (!parseRendererB.includes(required)) throw new Error(`answer-parsing rule renderer: must stay data-driven and keep ${required}`);

// --- decode-sampling -------------------------------------------------------------------------
// A1 Problem (decoding) lives in two one-line transformations, so the guards below re-run the app's own
// decodeReport against a reference typed straight from equations (23) and (24) and then pin the findings
// the lab actually states. Everything compared here is a number the learner sees.
const decodeLab = base.labs.find(lab => lab.id === "decode-sampling");
if (!decodeLab) throw new Error("labs.decode-sampling: A1 Problem (decoding) has no interactive object");
if (decodeLab.module !== "training") throw new Error("labs.decode-sampling: must live in the Training module, where the sampling concept sits");
if (!base.modules.find(module => module.id === "training").labs.includes("decode-sampling")) throw new Error("modules.training: the decoding lab belongs to the module that owns autoregressive sampling");
const a1GenerationMission = base.assignments.find(assignment => assignment.id === "a1").missions.find(mission => mission.id === "generation-experiments");
if (!a1GenerationMission.labs.includes("decode-sampling")) throw new Error("A1 generation-experiments: the decoding problem would have no lab that computes temperature or top-p");
if (!base.assignments.find(assignment => assignment.id === "a5").missions.find(mission => mission.id === "prompting").labs.includes("decode-sampling")) throw new Error("A5 prompting: the rollouts are sampled, so the sampling lab belongs there");
const decodeSource = [sliceDeclaration(source, "DECODE_GROUP"), sliceDeclaration(source, "DECODE_CASES"), sliceDeclaration(source, "DECODE_TAUS"), sliceDeclaration(source, "DECODE_PS"), sliceDeclaration(source, "DECODE_VARIANTS"), sliceDeclaration(source, "decodeSoftmax"), sliceDeclaration(source, "decodeNucleus"), sliceDeclaration(source, "decodeReport"), sliceDeclaration(source, "decodeDrift")].join("\n");
const decodeApi = runInNewContext(`${numberPrelude}${decodeSource}; ({DECODE_GROUP,DECODE_CASES,DECODE_TAUS,DECODE_PS,DECODE_VARIANTS,decodeReport,decodeDrift})`, {});
const decodeCaseKeys = Object.keys(decodeApi.DECODE_CASES), decodeTauKeys = decodeApi.DECODE_TAUS.map(entry => entry.key), decodePKeys = decodeApi.DECODE_PS.map(entry => entry.key), decodeVariantKeys = decodeApi.DECODE_VARIANTS.map(entry => entry.key);
if (decodeApi.DECODE_GROUP !== 8) throw new Error("decode-sampling: the group size must stay 8, which is the A5 handout's group_size");
if (JSON.stringify(decodeCaseKeys) !== JSON.stringify(["paris", "garden", "morning", "said"])) throw new Error("decode-sampling: the four contexts are quoted in order as 1, 3, 5, 7 in the observe text, so their order is fixed");
// Reference implementation, typed from the handout rather than reused from the app.
function refDecodeSoftmax(logits, tau) {
  if (tau === 0) { const best = logits.indexOf(Math.max(...logits)); return logits.map((_, index) => index === best ? 1 : 0); }
  const scaled = logits.map(value => value / tau), max = Math.max(...scaled), exponentials = scaled.map(value => Math.exp(value - max)), total = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map(value => value / total);
}
function refDecodeNucleus(q, p, strict) {
  const order = q.map((_, index) => index).sort((a, b) => q[b] - q[a] || a - b), keep = []; let mass = 0;
  for (const index of order) {
    if (strict) { if (mass + q[index] >= p - 1e-12) break; keep.push(index); mass += q[index]; continue; }
    keep.push(index); mass += q[index]; if (mass >= p - 1e-12) break;
  }
  return { order, keep, mass };
}
function refDecode(caseKey, tauKey, pKey, variantKey) {
  const logits = decodeApi.DECODE_CASES[caseKey].logits, tau = decodeApi.DECODE_TAUS.find(entry => entry.key === tauKey).tau, p = decodeApi.DECODE_PS.find(entry => entry.key === pKey).p;
  const bases = refDecodeSoftmax(logits, 1);
  let q, nucleus;
  if (variantKey === "tempAfterSoftmax") { q = bases.slice(); nucleus = refDecodeNucleus(q, p, false); }
  else if (variantKey === "truncBeforeTemp") { const raw = refDecodeNucleus(bases, p, false); q = refDecodeSoftmax(logits, tau); nucleus = { order: raw.order, keep: raw.keep, mass: raw.keep.reduce((sum, index) => sum + q[index], 0) }; }
  else { q = refDecodeSoftmax(logits, tau); nucleus = refDecodeNucleus(q, p, variantKey === "strictPrefix"); }
  const kept = new Set(nucleus.keep);
  const final = q.map((value, index) => kept.has(index) ? (variantKey === "noRenorm" ? value : (nucleus.mass > 0 ? value / nucleus.mass : 0)) : 0);
  const total = final.reduce((sum, value) => sum + value, 0);
  const distribution = total > 0 ? final.map(value => value / total) : final;
  const entropy = distribution.reduce((sum, value) => value > 0 ? sum - value * Math.log2(value) : sum, 0);
  const pTop = total > 0 ? Math.max(...distribution) : 0;
  return { q, keep: nucleus.keep, mass: nucleus.mass, final, total, distribution, entropy, pTop, p, tau, empty: !nucleus.keep.length };
}
let decodeStates = 0;
for (const caseKey of decodeCaseKeys) for (const tauKey of decodeTauKeys) for (const pKey of decodePKeys) for (const variantKey of decodeVariantKeys) {
  const app = decodeApi.decodeReport(caseKey, tauKey, pKey, variantKey), reference = refDecode(caseKey, tauKey, pKey, variantKey);
  const label = `${caseKey}/${tauKey}/${pKey}/${variantKey}`;
  if (JSON.stringify(app.nucleus.keep) !== JSON.stringify(reference.keep)) throw new Error(`decode-sampling ${label}: the nucleus set does not match equation (24)`);
  if (Math.abs(app.nucleus.mass - reference.mass) > 1e-12) throw new Error(`decode-sampling ${label}: kept mass drifted`);
  app.final.forEach((value, index) => { if (Math.abs(value - reference.final[index]) > 1e-12) throw new Error(`decode-sampling ${label}: emitted probability ${index} drifted`); });
  if (Math.abs(app.total - reference.total) > 1e-12) throw new Error(`decode-sampling ${label}: the sum of the emitted probabilities drifted`);
  if (Math.abs(app.entropy - reference.entropy) > 1e-12) throw new Error(`decode-sampling ${label}: the entropy is not −Σ p log₂ p of the emitted distribution`);
  if (Math.abs(app.pTop - reference.pTop) > 1e-12) throw new Error(`decode-sampling ${label}: the probability of the most likely token drifted`);
  if (!reference.empty && Math.abs(app.allSame - Math.pow(reference.pTop, decodeApi.DECODE_GROUP)) > 1e-12) throw new Error(`decode-sampling ${label}: the group-collapse probability must be p_max raised to the group size`);
  const drift = decodeApi.decodeDrift(caseKey, tauKey, pKey, variantKey);
  const expected = reference.empty ? null : reference.distribution.reduce((sum, value, index) => sum + Math.abs(value - refDecode(caseKey, tauKey, pKey, "correct").distribution[index]), 0) / 2;
  if (drift === null ? expected !== null : Math.abs(drift - expected) > 1e-12) throw new Error(`decode-sampling ${label}: the distance to the correct distribution drifted`);
  if (variantKey === "correct") {
    // The defining property of equation (24): the set reaches p and is minimal in doing so.
    if (!app.nucleus.keep.length) throw new Error(`decode-sampling ${label}: top-p must never leave an empty set`);
    if (app.nucleus.mass < reference.p - 1e-9) throw new Error(`decode-sampling ${label}: the kept mass must reach p`);
    const withoutLast = app.nucleus.keep.slice(0, -1).reduce((sum, index) => sum + app.q[index], 0);
    if (app.nucleus.keep.length > 1 && withoutLast >= reference.p - 1e-12) throw new Error(`decode-sampling ${label}: the set is not the smallest one reaching p`);
    if (Math.abs(app.total - 1) > 1e-9) throw new Error(`decode-sampling ${label}: a renormalized distribution must sum to one`);
    if (reference.p === 1 && app.nucleus.keep.length !== (tauKey === "greedy" ? 1 : decodeApi.DECODE_CASES[caseKey].tokens.length)) throw new Error(`decode-sampling ${label}: p = 1.0 must not truncate, which is the A5 setting`);
  }
  decodeStates++;
}
if (decodeStates !== decodeCaseKeys.length * decodeTauKeys.length * decodePKeys.length * decodeVariantKeys.length) throw new Error("decode-sampling: not every state was checked");
// The four findings the lab states in prose must stay true of the arithmetic.
const decodeSpread = decodeCaseKeys.map(caseKey => decodeApi.decodeReport(caseKey, "t10", "p080", "correct").nucleus.keep.length);
if (JSON.stringify(decodeSpread) !== JSON.stringify([1, 3, 5, 7])) throw new Error(`decode-sampling: at p = 0.8 and τ = 1.0 the four contexts must keep 1, 3, 5, 7 tokens, found ${decodeSpread.join(", ")}`);
const decodeCoupling = ["t05", "t08", "t10", "t15"].map(tauKey => decodeApi.decodeReport("garden", tauKey, "p090", "correct").nucleus.keep.length);
if (JSON.stringify(decodeCoupling) !== JSON.stringify([2, 3, 4, 6])) throw new Error(`decode-sampling: at fixed p = 0.9 the nucleus must grow 2, 3, 4, 6 with temperature, found ${decodeCoupling.join(", ")}`);
for (const caseKey of decodeCaseKeys) for (const pKey of decodePKeys) {
  const anchor = decodeApi.decodeReport(caseKey, "t10", pKey, "correct");
  for (const tauKey of decodeTauKeys) {
    const dead = decodeApi.decodeReport(caseKey, tauKey, pKey, "tempAfterSoftmax");
    dead.final.forEach((value, index) => { if (Math.abs(value - anchor.final[index]) > 1e-12) throw new Error(`decode-sampling ${caseKey}/${tauKey}/${pKey}: temperature after the softmax must cancel out completely, which is the point of the variant`); });
  }
  const ordered = decodeApi.decodeReport(caseKey, "t10", pKey, "truncBeforeTemp");
  ordered.final.forEach((value, index) => { if (Math.abs(value - anchor.final[index]) > 1e-12) throw new Error(`decode-sampling ${caseKey}/${pKey}: at τ = 1.0 the swapped order must be indistinguishable, which is what makes it hard to spot`); });
  const loose = decodeApi.decodeReport(caseKey, "t10", pKey, "noRenorm");
  if (Math.abs(decodeApi.decodeDrift(caseKey, "t10", pKey, "noRenorm")) > 1e-12) throw new Error(`decode-sampling ${caseKey}/${pKey}: a missing renormalization must not change which tokens are drawn`);
  if (loose.total >= 1 - 1e-12 && anchor.nucleus.mass < 1 - 1e-12) throw new Error(`decode-sampling ${caseKey}/${pKey}: without renormalization the output must sum to the kept mass`);
  if (loose.total < 1 - 1e-12 && Math.abs(loose.shift + Math.log(loose.total)) > 1e-12) throw new Error(`decode-sampling ${caseKey}/${pKey}: the log-probability shift must be −ln of the emitted sum`);
}
if (!["t05", "t08", "t10"].every(tauKey => ["p050", "p080", "p090"].every(pKey => decodeApi.decodeReport("paris", tauKey, pKey, "strictPrefix").empty))) throw new Error("decode-sampling: the off-by-one must empty the nucleus exactly where the model is confident");
for (const caseKey of decodeCaseKeys) {
  const strict = decodeApi.decodeReport(caseKey, "t10", "p100", "strictPrefix"), full = decodeApi.decodeReport(caseKey, "t10", "p100", "correct");
  if (strict.nucleus.keep.length !== full.nucleus.keep.length - 1) throw new Error(`decode-sampling ${caseKey}: even at p = 1.0 the off-by-one must silently lose the least likely token`);
}
if (!sliceDeclaration(source, "decodeSoftmax").includes("tau===0")) throw new Error("decode-sampling: greedy must stay an explicit branch, because v/τ is undefined at τ = 0");
const decodeGreedy = decodeApi.decodeReport("paris", "greedy", "p100", "correct");
if (!(decodeGreedy.final.filter(value => value === 1).length === 1 && decodeGreedy.final.filter(value => value === 0).length === 7 && decodeGreedy.final.every(value => Number.isFinite(value)))) throw new Error("decode-sampling: τ → 0 must be its own one-hot path instead of dividing by zero");
if (Math.abs(decodeGreedy.allSame - 1) > 1e-12) throw new Error("decode-sampling: greedy must make all eight rollouts identical, which is what the transfer answer quotes as 100.0 %");
const decodeSampled = decodeApi.decodeReport("paris", "t10", "p100", "correct");
if (Math.abs(decodeSampled.allSame - 0.7024) > 5e-5) throw new Error(`decode-sampling: the transfer answer quotes 70.2 % for τ = 1.0, computed ${(decodeSampled.allSame * 100).toFixed(2)} %`);
for (const [labelText, text] of [["German", decodeLab.transferAnswer], ["English", pack.labs["decode-sampling"].transferAnswer]]) {
  for (const required of ["100", "70", "sampling_temperature = 1.0"]) if (!text.includes(required)) throw new Error(`labs.decode-sampling.transferAnswer (${labelText}): must keep the number ${required} it argues from`);
}
for (const [labelText, text] of [["German", decodeLab.formula], ["English", pack.labs["decode-sampling"].formula]]) {
  for (const required of ["exp(v_i/τ)", "≥ p", "log₂", "p_max^G"]) if (!text.includes(required)) throw new Error(`labs.decode-sampling.formula (${labelText}): must keep ${required}`);
}
// --- winrate-lc ------------------------------------------------------------------------------
// The A5 supplement demands the same pair of numbers three times (alpaca_eval_baseline §3.3(c),
// alpaca_eval_sft §5.3(b), dpo_training (b)): winrate and length-controlled winrate. Lecture 12
// names the metric in one line and computes nothing. These guards re-derive every state from the
// handout's own definition and then pin the findings the lab argues from.
const winrateLab = base.labs.find(lab => lab.id === "winrate-lc");
if (!winrateLab) throw new Error("labs.winrate-lc: the AlpacaEval winrate has no interactive object");
if (winrateLab.module !== "evaluation") throw new Error("labs.winrate-lc: must live in the Evaluation module, where benchmark-validity sits");
if (!base.modules.find(module => module.id === "evaluation").labs.includes("winrate-lc")) throw new Error("modules.evaluation: the winrate lab belongs to the module that owns benchmark validity");
if (!base.lectureGuides.l12.labs.includes("winrate-lc")) throw new Error("lecture guides.l12: Lecture 12 introduces AlpacaEval, so the lab that computes its metric belongs there");
const a5Supplement = base.assignments.find(assignment => assignment.id === "a5").missions.find(mission => mission.id === "supplement");
if (!a5Supplement.labs.includes("winrate-lc")) throw new Error("A5 supplement: alpaca_eval_baseline, alpaca_eval_sft and dpo_training all report a winrate, so the lab belongs to that block");
const winrateSource = ["WINRATE_REFERENCE_N", "WINRATE_ITEMS", "WINRATE_PROFILES", "WINRATE_BOUNDS", "WINRATE_BUCKET_LABELS", "WINRATE_VARIANTS", "winrateScore", "winrateBucket", "winratePooledMix", "winrateRows", "winrateReport", "winratePaired"];
const winrateApi = runInNewContext(`${numberPrelude}${winrateSource.map(name => sliceDeclaration(source, name)).join("\n")}; ({${winrateSource.join(",")}})`, {});
if (winrateApi.WINRATE_REFERENCE_N !== 805) throw new Error("winrate-lc: AlpacaEval has 805 instructions per Lecture 12, and the standard error line quotes that number");
if (winrateApi.WINRATE_ITEMS.length !== 12) throw new Error("winrate-lc: the ledger is quoted as twelve rows in the observe text and the transfer check");
const winrateProfileKeys = winrateApi.WINRATE_PROFILES.map(entry => entry.key);
if (JSON.stringify(winrateProfileKeys) !== JSON.stringify(["base", "sft", "dpo"])) throw new Error("winrate-lc: the three training stages are quoted in order base → SFT → DPO, so their order is fixed");
const winrateBoundKeys = winrateApi.WINRATE_BOUNDS.map(entry => entry.key), winrateVariantKeys = winrateApi.WINRATE_VARIANTS.map(entry => entry.key);
if (JSON.stringify(winrateVariantKeys) !== JSON.stringify(["correct", "flipped", "tiesAsWins", "rawAsLc", "lengthTrim"])) throw new Error("winrate-lc: the correct evaluation must stay first and all four silent variants must stay present");
for (const profile of winrateApi.WINRATE_PROFILES) {
  if (profile.rows.length !== 12) throw new Error(`winrate-lc ${profile.key}: every stage is judged on the same twelve instructions, otherwise the comparison is not paired`);
  for (const row of profile.rows) if (![1, 1.5, 2].includes(row[1])) throw new Error(`winrate-lc ${profile.key}: preference may only be 1.0, 1.5 or 2.0, which is the annotator's own scale`);
}

// Reference typed straight from the handout's definition: winrate is the share of own outputs the
// annotator prefers, and the length control standardizes each stage onto the pooled length mix.
const winrateRefScore = (preference, variantKey) => variantKey === "flipped" ? 2 - preference : variantKey === "tiesAsWins" ? (preference >= 1.5 ? 1 : 0) : preference - 1;
const winrateRefBucket = (delta, bound) => delta < -bound ? 0 : delta > bound ? 2 : 1;
function winrateRefReport(profileKey, boundKey, variantKey) {
  const bound = winrateApi.WINRATE_BOUNDS.find(entry => entry.key === boundKey).bound;
  const pooled = [0, 0, 0];
  for (const profile of winrateApi.WINRATE_PROFILES) for (const row of profile.rows) pooled[winrateRefBucket(row[0], bound)]++;
  const pooledTotal = pooled[0] + pooled[1] + pooled[2], weight = pooled.map(value => value / pooledTotal);
  const profile = winrateApi.WINRATE_PROFILES.find(entry => entry.key === profileKey);
  const rows = profile.rows.map((row, index) => ({ delta: row[0], ourLen: winrateApi.WINRATE_ITEMS[index].ref + row[0], refLen: winrateApi.WINRATE_ITEMS[index].ref,
    bucket: winrateRefBucket(row[0], bound), score: winrateRefScore(row[1], variantKey), kept: variantKey !== "lengthTrim" || row[0] <= bound }));
  const kept = rows.filter(row => row.kept), n = kept.length;
  const raw = n ? kept.reduce((sum, row) => sum + row.score, 0) / n : 0;
  const count = [0, 0, 0], total = [0, 0, 0];
  kept.forEach(row => { count[row.bucket]++; total[row.bucket] += row.score; });
  const rate = count.map((value, index) => value ? total[index] / value : null);
  const missing = rate.some((value, index) => value === null && weight[index] > 0);
  const lc = (variantKey === "rawAsLc" || variantKey === "lengthTrim") ? raw : missing ? null : rate.reduce((sum, value, index) => sum + weight[index] * value, 0);
  const variance = Math.max(raw * (1 - raw), 0);
  return { n, raw, lc, rate, count, weight, dropped: rows.length - n,
    meanOur: n ? kept.reduce((sum, row) => sum + row.ourLen, 0) / n : 0,
    meanRef: n ? kept.reduce((sum, row) => sum + row.refLen, 0) / n : 0,
    se: n ? Math.sqrt(variance / n) : 0, seReference: Math.sqrt(variance / winrateApi.WINRATE_REFERENCE_N) };
}
let winrateStates = 0;
for (const profileKey of winrateProfileKeys) for (const boundKey of winrateBoundKeys) for (const variantKey of winrateVariantKeys) {
  const app = winrateApi.winrateReport(profileKey, boundKey, variantKey), reference = winrateRefReport(profileKey, boundKey, variantKey);
  const label = `${profileKey}/${boundKey}/${variantKey}`;
  if (app.n !== reference.n) throw new Error(`winrate-lc ${label}: the number of evaluated comparisons drifted`);
  if (Math.abs(app.raw - reference.raw) > 1e-12) throw new Error(`winrate-lc ${label}: the winrate is no longer the share of preferred outputs`);
  if (app.lc === null ? reference.lc !== null : Math.abs(app.lc - reference.lc) > 1e-12) throw new Error(`winrate-lc ${label}: the length-controlled winrate drifted from the standardized rate`);
  if (Math.abs(app.se - reference.se) > 1e-12 || Math.abs(app.seReference - reference.seReference) > 1e-12) throw new Error(`winrate-lc ${label}: a standard error must stay √(p(1−p)/n)`);
  if (Math.abs(app.meanOur - reference.meanOur) > 1e-12 || Math.abs(app.meanRef - reference.meanRef) > 1e-12) throw new Error(`winrate-lc ${label}: the mean answer lengths drifted`);
  if (app.dropped !== reference.dropped) throw new Error(`winrate-lc ${label}: the number of discarded instructions drifted`);
  for (let index = 0; index < 3; index++) {
    if (app.count[index] !== reference.count[index]) throw new Error(`winrate-lc ${label}: bucket ${index} holds a different number of instructions`);
    if (Math.abs(app.mix.weight[index] - reference.weight[index]) > 1e-12) throw new Error(`winrate-lc ${label}: the pooled length mix must stay a property of the data, not of the evaluation`);
    const appRate = app.rate[index], referenceRate = reference.rate[index];
    if (appRate === null ? referenceRate !== null : Math.abs(appRate - referenceRate) > 1e-12) throw new Error(`winrate-lc ${label}: the rate in bucket ${index} drifted`);
  }
  if (variantKey === "correct") {
    if (app.n !== 12) throw new Error(`winrate-lc ${label}: the correct evaluation must keep every instruction`);
    if (Math.abs(app.mix.weight.reduce((sum, value) => sum + value, 0) - 1) > 1e-12) throw new Error(`winrate-lc ${label}: the pooled weights must sum to one`);
    if (Math.abs(app.share.reduce((sum, value) => sum + value, 0) - 1) > 1e-12) throw new Error(`winrate-lc ${label}: the own shares must sum to one`);
    const reconstructed = app.rate.reduce((sum, value, index) => sum + (value === null ? 0 : app.share[index] * value), 0);
    if (Math.abs(reconstructed - app.raw) > 1e-12) throw new Error(`winrate-lc ${label}: the raw winrate must equal the bucket rates weighted by the OWN share — that is the only thing the control changes`);
  }
  winrateStates++;
}
if (winrateStates !== winrateProfileKeys.length * winrateBoundKeys.length * winrateVariantKeys.length) throw new Error("winrate-lc: not every state was checked");

// The hidden/exposed contract of the four silent variants.
for (const profileKey of winrateProfileKeys) for (const boundKey of winrateBoundKeys) {
  const correct = winrateApi.winrateReport(profileKey, boundKey, "correct");
  const flipped = winrateApi.winrateReport(profileKey, boundKey, "flipped");
  if (Math.abs(flipped.raw - (1 - correct.raw)) > 1e-12) throw new Error(`winrate-lc ${profileKey}/${boundKey}: reversing the preference direction must yield exactly 1 − winrate, which is why it looks plausible`);
  const ties = winrateApi.winrateReport(profileKey, boundKey, "tiesAsWins");
  if (Math.abs((ties.raw - correct.raw) - correct.ties / (2 * correct.n)) > 1e-12) throw new Error(`winrate-lc ${profileKey}/${boundKey}: counting ties in full must lift the winrate by exactly half the tie rate`);
  const shortcut = winrateApi.winrateReport(profileKey, boundKey, "rawAsLc");
  if (Math.abs(shortcut.raw - correct.raw) > 1e-12) throw new Error(`winrate-lc ${profileKey}/${boundKey}: the skipped control must leave the winrate itself untouched, otherwise it is a different bug`);
  if (shortcut.lc !== shortcut.raw) throw new Error(`winrate-lc ${profileKey}/${boundKey}: the skipped control must report the raw value a second time`);
  const trimmed = winrateApi.winrateReport(profileKey, boundKey, "lengthTrim");
  if (trimmed.lc !== trimmed.raw) throw new Error(`winrate-lc ${profileKey}/${boundKey}: the home-made control reports one number twice, it does not standardize`);
}
if (winrateApi.winrateReport("dpo", "b200", "lengthTrim").dropped !== 7) throw new Error("winrate-lc: at ±200 the home-made control must discard seven of the DPO stage's twelve comparisons, which is the number the verdict argues from");

// The findings the lab, the observe text and the transfer answer quote.
const winrateHeadline = winrateProfileKeys.map(profileKey => winrateApi.winrateReport(profileKey, "b200", "correct"));
const winrateRawRow = winrateHeadline.map(report => Number((report.raw * 100).toFixed(1)));
const winrateLcRow = winrateHeadline.map(report => Number((report.lc * 100).toFixed(1)));
if (JSON.stringify(winrateRawRow) !== JSON.stringify([33.3, 58.3, 70.8])) throw new Error(`winrate-lc: the raw series is quoted as 33.3 / 58.3 / 70.8, computed ${winrateRawRow.join(" / ")}`);
if (JSON.stringify(winrateLcRow) !== JSON.stringify([48.1, 57.3, 51.8])) throw new Error(`winrate-lc: the length-controlled series is quoted as 48.1 / 57.3 / 51.8, computed ${winrateLcRow.join(" / ")}`);
if (!(winrateRawRow[0] < winrateRawRow[1] && winrateRawRow[1] < winrateRawRow[2])) throw new Error("winrate-lc: the raw winrate must rise at every stage, because that is the straight story the control has to contradict");
for (const boundKey of ["b100", "b200"]) {
  const sft = winrateApi.winrateReport("sft", boundKey, "correct"), dpo = winrateApi.winrateReport("dpo", boundKey, "correct");
  if (!(dpo.lc < sft.lc)) throw new Error(`winrate-lc ${boundKey}: under length control the DPO stage must not beat the SFT stage — that reversal is the whole lesson`);
}
if (winrateApi.winrateReport("base", "b400", "correct").lc !== null) throw new Error("winrate-lc: at ±400 the base stage must have an empty bucket, which is the case that shows why the real metric regresses instead of bucketing");
for (const profileKey of winrateProfileKeys) for (const boundKey of ["b100", "b200"]) {
  if (winrateApi.winrateReport(profileKey, boundKey, "correct").lc === null) throw new Error(`winrate-lc ${profileKey}/${boundKey}: only the coarsest boundary may leave a bucket empty`);
}
const winrateShortcutGap = winrateProfileKeys.map(profileKey => { const report = winrateApi.winrateReport(profileKey, "b200", "correct"); return Math.abs(report.raw - report.lc); });
if (winrateShortcutGap.indexOf(Math.min(...winrateShortcutGap)) !== 1) throw new Error("winrate-lc: the skipped control must be least visible at the SFT stage — the transfer check asks exactly that");
if (Number((winrateShortcutGap[1] * 100).toFixed(1)) !== 1.1 || Number((winrateShortcutGap[2] * 100).toFixed(1)) !== 19.0) throw new Error("winrate-lc: the verdict quotes 1.1 points at the SFT stage and 19.0 at the DPO stage");
const winrateMeanDelta = winrateHeadline.map(report => Math.round(report.meanOur - report.meanRef));
if (JSON.stringify(winrateMeanDelta) !== JSON.stringify([-148, 61, 279])) throw new Error(`winrate-lc: the mean length differences are quoted as −148 / +61 / +279, computed ${winrateMeanDelta.join(" / ")}`);
if (winrateMeanDelta[2] - winrateMeanDelta[1] !== 218) throw new Error("winrate-lc: the transfer question argues from 218 characters between the SFT and DPO stages");
const winratePairedStep = winrateApi.winratePaired("sft", "dpo", "b200", "correct");
if (winratePairedStep.discordant !== 3 || winratePairedStep.n !== 12) throw new Error(`winrate-lc: the paired SFT → DPO step must rest on 3 of 12 differently judged instructions, computed ${winratePairedStep.discordant} of ${winratePairedStep.n}`);
if (Number((1.96 * winrateHeadline[2].seReference * 100).toFixed(1)) !== 3.1) throw new Error("winrate-lc: the transfer answer argues that a single share has a 95 % half-width of a good 3 points over 805 instructions");

for (const [labelText, lab] of [["German", winrateLab], ["English", pack.labs["winrate-lc"]]]) {
  const decimal = labelText === "German" ? "," : ".";
  for (const required of [`58${decimal}3`, `70${decimal}8`, `57${decimal}3`, `51${decimal}8`, "218", "805"]) {
    if (!lab.transferAnswer.includes(required)) throw new Error(`labs.winrate-lc.transferAnswer (${labelText}): must keep the number ${required} it argues from`);
  }
  for (const required of ["preference", "w_b", "√(p(1−p)/n)"]) if (!lab.formula.includes(required)) throw new Error(`labs.winrate-lc.formula (${labelText}): must keep ${required}`);
}
for (const key of ["Win Rate gegen GPT-4 Turbo", "längenkontrollierte Win Rate", "Beitrag zur Längenkontrolle", "Derselbe Judge, drei Trainingsstände", "nicht bestimmbar", "Was diese Auswertung wirklich tut:"]) {
  if (typeof pack.ui?.[key] !== "string" || !pack.ui[key].trim() || pack.ui[key] === key) throw new Error(`ui.${key}: English translation is missing for the winrate lab`);
}
// A guard that only checks the app COMPUTES a number does not check that it SHOWS it, so these
// demand the concrete display expressions rather than the source functions.
const winrateRenderer = source.slice(source.indexOf("function winrateStageMarkup"), source.indexOf("function updateWinrateLc"));
for (const required of ["winrateReport(profileKey,boundKey,variantKey)", "winratePercent(report.raw)", "winratePercent(report.lc)", "winrateSigned((report.raw-report.lc)*100,1)",
  "winrateNumber(report.meanOur,0)", "winrateSigned(report.meanOur-report.meanRef,0)", "winratePercent(report.se)", "winratePercent(report.seReference)",
  "winratePercent(1.96*report.se)", "winratePercent(1.96*report.seReference)", "winratePercent(report.share[index])", "winratePercent(report.mix.weight[index])",
  "winrateNumber(contribution,4)", "tr(variant.verdict)", "winratePaired(previous.key,profileKey,boundKey,variantKey)", "paired.discordant", "WINRATE_PROFILES.map",
  'winrateReport(entry.key,boundKey,"correct")', "WINRATE_BUCKET_LABELS.map", 'report.mode==="missing"']) {
  if (!winrateRenderer.includes(required)) throw new Error(`winrate-lc renderer: must stay data-driven and keep ${required}`);
}
console.log(`winrate-lc OK: ${winrateStates} states, raw ${winrateRawRow.join("/")}, length-controlled ${winrateLcRow.join("/")}`);

// --- batch-windows ------------------------------------------------------------------------------
// a1:data_loading is the contract the whole A1 training run rests on, and the handout states it in
// one line: "any 1 ≤ i ≤ n − m gives a valid training sequence" — zero-based, 0 ≤ s ≤ n − m − 1.
// Every number below is typed a second time straight from that sentence and from NumPy's slicing
// rules; nothing here shares code with the app.
const batchLab = base.labs.find(lab => lab.id === "batch-windows");
if (!batchLab) throw new Error("labs.batch-windows: a1:data_loading has no interactive object");
if (batchLab.module !== "training") throw new Error("labs.batch-windows: must live in the Training module, where token-array-loading sits");
if (!base.modules.find(module => module.id === "training").labs.includes("batch-windows")) throw new Error("modules.training: the batching lab belongs to the module that owns token-array-loading");
if (!base.lectureGuides.l02.labs.includes("batch-windows")) throw new Error("lecture guides.l02: Lecture 2 curates token-array-loading, so the lab that computes it belongs there");
const batchMission = base.assignments.find(assignment => assignment.id === "a1").missions.find(mission => mission.id === "training-state");
if (!batchMission.labs.includes("batch-windows")) throw new Error("A1 training-state: the mission whose scope opens with data_loading must lead with the lab that computes it");
if (!readConstant("PROBLEM_CONCEPTS")["a1:data_loading"].includes("token-array-loading")) throw new Error("a1:data_loading: the problem must stay linked to token-array-loading, which is what the lab teaches");

const batchSource = ["BATCH_SEED", "BATCH_LEDGER_LIMIT", "BATCH_UINT16_MAX", "BATCH_SETUPS", "BATCH_START_RULES", "BATCH_TARGET_RULES", "batchRandom", "batchStarts", "batchWindow", "batchReport", "batchCoverage", "batchDtype"];
const batchApi = runInNewContext(`${numberPrelude}${batchSource.map(name => sliceDeclaration(source, name)).join("\n")}; ({${batchSource.join(",")}})`, {});
const batchSetupKeys = batchApi.BATCH_SETUPS.map(entry => entry.key);
const batchStartKeys = batchApi.BATCH_START_RULES.map(entry => entry.key);
const batchTargetKeys = batchApi.BATCH_TARGET_RULES.map(entry => entry.key);
if (JSON.stringify(batchSetupKeys) !== JSON.stringify(["toy", "small", "real"])) throw new Error("batch-windows: the three corpus sizes are quoted in order toy → small → A1 scale, so their order is fixed");
if (JSON.stringify(batchStartKeys) !== JSON.stringify(["correct", "inclusive", "tooTight", "naive"])) throw new Error("batch-windows: the correct start rule must stay first and all three wrong bounds must stay present");
if (JSON.stringify(batchTargetKeys) !== JSON.stringify(["shift", "same", "shortShift"])) throw new Error("batch-windows: the correct target rule must stay first and both silent variants must stay present");
if (batchApi.BATCH_UINT16_MAX !== 65535) throw new Error("batch-windows: np.iinfo(np.uint16).max is 65535 and the dtype panel quotes that number");
// The observe text walks the reader through "the four ledger rows" of the toy corpus and quotes the
// A1-scale batch as truncated, so the cut-off may not drift underneath either claim.
if (batchApi.BATCH_LEDGER_LIMIT !== 8) throw new Error("batch-windows: the ledger shows at most eight rows, which is what the lab note announces");
for (const setup of batchApi.BATCH_SETUPS) {
  const truncated = setup.B > batchApi.BATCH_LEDGER_LIMIT;
  if (setup.key === "real" ? !truncated : truncated) throw new Error(`batch-windows ${setup.key}: only the A1-scale batch may be truncated in the ledger — the smaller corpora must show every row the observe text counts`);
}
const batchGeometry = { toy: [10, 4, 4], small: [64, 8, 8], real: [10000000, 256, 32] };
for (const setup of batchApi.BATCH_SETUPS) {
  const [n, m, B] = batchGeometry[setup.key];
  if (setup.n !== n || setup.m !== m || setup.B !== B) throw new Error(`batch-windows ${setup.key}: the observe text and the transfer answer quote n=${n}, m=${m}, B=${B}`);
  if (setup.n < setup.m + 1) throw new Error(`batch-windows ${setup.key}: a corpus must hold at least m+1 tokens, otherwise no valid window pair exists`);
  if (setup.V - 1 > batchApi.BATCH_UINT16_MAX) throw new Error(`batch-windows ${setup.key}: every quoted vocabulary must fit into uint16, otherwise the dtype panel argues against its own example`);
}
if (batchApi.BATCH_SETUPS[0].tokens.length !== 10) throw new Error("batch-windows toy: the hand-checkable corpus is quoted as ten token IDs");
// The repeated run is deliberate: it is the case in which a VALUE comparison of Y[:-1] against X[1:]
// passes although the windows sit wrong. Without it the misconception text has no example.
if (batchApi.BATCH_SETUPS[0].tokens.slice(2, 6).some((value, _, run) => value !== run[0])) throw new Error("batch-windows toy: the window at s=2 must hold four identical token IDs, which is the case the misconception text argues from");

// Independent reference: NumPy slicing clamps, it does not raise; a start is valid exactly when
// s + m ≤ n − 1.
function batchRefStarts(setup, hi) {
  let state = batchApi.BATCH_SEED >>> 0; const out = [];
  for (let b = 0; b < setup.B; b++) { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; out.push(Math.floor((state / 4294967296) * hi)); }
  return out;
}
function batchRefReport(setupKey, startKey, targetKey) {
  const setup = batchApi.BATCH_SETUPS.find(entry => entry.key === setupKey);
  const bound = setup.n - setup.m;
  const hi = Math.max(1, { correct: bound, inclusive: bound + 1, tooTight: bound - 1, naive: setup.n }[startKey]);
  const starts = batchRefStarts(setup, hi);
  const rows = starts.map(start => {
    const xa = Math.min(start, setup.n), xb = Math.min(start + setup.m, setup.n);
    const ya = Math.min(targetKey === "same" ? start : start + 1, setup.n);
    const yb = Math.min(targetKey === "shortShift" ? start + setup.m : targetKey === "same" ? start + setup.m : start + setup.m + 1, setup.n);
    const xlen = Math.max(0, xb - xa), ylen = Math.max(0, yb - ya);
    return { start, xlen, ylen, validStart: start <= setup.n - setup.m - 1, shifted: xlen === setup.m && ylen === setup.m && ya === xa + 1 };
  });
  const invalidValues = Math.max(0, hi - bound), q = invalidValues / hi;
  const xlens = new Set(rows.map(row => row.xlen)), ylens = new Set(rows.map(row => row.ylen));
  return { setup, bound, hi, starts, rows, invalidValues, q,
    perBatch: 1 - Math.pow(1 - q, setup.B),
    top: Math.min(hi - 1, bound - 1),
    drawnInvalid: rows.filter(row => !row.validStart).length,
    shiftedRows: rows.filter(row => row.shifted).length,
    stackable: xlens.size === 1 && ylens.size === 1,
    batchesPerPass: setup.n / (setup.B * setup.m) };
}
let batchStates = 0, batchValues = 0;
for (const setupKey of batchSetupKeys) for (const startKey of batchStartKeys) for (const targetKey of batchTargetKeys) {
  const label = `${setupKey}/${startKey}/${targetKey}`;
  const app = batchApi.batchReport(setupKey, startKey, targetKey), reference = batchRefReport(setupKey, startKey, targetKey);
  if (JSON.stringify(app.starts) !== JSON.stringify(reference.starts)) throw new Error(`batch-windows ${label}: the drawn start indices drifted from the fixed random stream`);
  for (const field of ["bound", "hi", "invalidValues", "top", "drawnInvalid", "shiftedRows", "stackable"]) {
    if (app[field] !== reference[field]) throw new Error(`batch-windows ${label}: ${field} drifted (${app[field]} vs ${reference[field]})`);
    batchValues++;
  }
  if (Math.abs(app.q - reference.q) > 1e-15) throw new Error(`batch-windows ${label}: the share of invalid starts per draw must stay invalid values / draw range`);
  if (Math.abs(app.perBatch - reference.perBatch) > 1e-15) throw new Error(`batch-windows ${label}: p(batch) must stay 1 − (1 − q)^B`);
  if (Math.abs(app.batchesPerPass - reference.batchesPerPass) > 1e-9) throw new Error(`batch-windows ${label}: batches per corpus pass must stay n/(B·m)`);
  app.rows.forEach((row, index) => {
    const ref = reference.rows[index];
    if (row.xlen !== ref.xlen || row.ylen !== ref.ylen || row.validStart !== ref.validStart || row.shifted !== ref.shifted) throw new Error(`batch-windows ${label} row ${index + 1}: the window drifted`);
    batchValues += 4;
  });
  // The shift is a statement about positions, never about token values.
  if (targetKey === "shift" && app.rows.some(row => row.validStart && !row.shifted)) throw new Error(`batch-windows ${label}: a valid start under the correct target rule must always satisfy Y[:−1] = X[1:]`);
  if (targetKey !== "shift" && app.shiftedRows !== 0) throw new Error(`batch-windows ${label}: a wrong target rule must break the invariant in every row, otherwise it is not the bug the verdict describes`);
  batchStates++;
}
if (batchStates !== batchSetupKeys.length * batchStartKeys.length * batchTargetKeys.length) throw new Error("batch-windows: not every state was checked");

// The exclusive bound itself: n − m is right, n − m + 1 admits exactly one start whose Y is short.
for (const setupKey of batchSetupKeys) {
  const setup = batchApi.BATCH_SETUPS.find(entry => entry.key === setupKey);
  const correct = batchApi.batchReport(setupKey, "correct", "shift");
  if (correct.invalidValues !== 0) throw new Error(`batch-windows ${setupKey}: the correct rule must not be able to draw an invalid start at all`);
  if (correct.lastValid !== setup.n - setup.m - 1) throw new Error(`batch-windows ${setupKey}: the last valid start is n − m − 1`);
  if (correct.hi !== setup.n - setup.m) throw new Error(`batch-windows ${setupKey}: the exclusive upper bound is n − m`);
  const inclusive = batchApi.batchReport(setupKey, "inclusive", "shift");
  if (inclusive.invalidValues !== 1) throw new Error(`batch-windows ${setupKey}: n − m + 1 must admit exactly one invalid start, which is why the bug is so rare`);
  if (batchApi.batchWindow(setup, setup.n - setup.m, "shift").ylen !== setup.m - 1) throw new Error(`batch-windows ${setupKey}: at s = n − m the target window must be one element short — that is the whole off-by-one`);
  const tooTight = batchApi.batchReport(setupKey, "tooTight", "shift");
  if (tooTight.invalidValues !== 0 || tooTight.drawnInvalid !== 0) throw new Error(`batch-windows ${setupKey}: the too-narrow rule must never produce an invalid row, which is exactly what makes it undetectable`);
  if (!tooTight.missesLast) throw new Error(`batch-windows ${setupKey}: the too-narrow rule must lose the last valid start, because that is its only symptom`);
  const naive = batchApi.batchReport(setupKey, "naive", "shift");
  if (Math.abs(naive.q - setup.m / setup.n) > 1e-15) throw new Error(`batch-windows ${setupKey}: without a bound the share of affected draws is exactly m/n, which the verdict states`);
}
// The finding the whole lab is built on: at A1 scale every wrong rule still yields a flawless batch.
for (const startKey of batchStartKeys) {
  const real = batchApi.batchReport("real", startKey, "shift");
  if (!real.stackable || real.shiftedRows !== 32 || real.drawnInvalid !== 0) throw new Error(`batch-windows real/${startKey}: at A1 scale every start rule must still produce 32 flawless rows — that is the point the lab is built on`);
  if (real.signal !== "none") throw new Error(`batch-windows real/${startKey}: at A1 scale nothing may report anything, correct rule or not`);
}
if (batchApi.batchReport("toy", "inclusive", "shift").signal !== "stack") throw new Error("batch-windows toy/inclusive: on the toy corpus the off-by-one must be loud, otherwise the corpus selector teaches nothing");
if (batchApi.batchReport("toy", "tooTight", "shift").signal !== "none") throw new Error("batch-windows toy/tooTight: the too-narrow rule must stay silent even on the toy corpus");
// The short-shift rule masks the off-by-one: uniform short rows stack cleanly.
if (!batchApi.batchReport("toy", "inclusive", "shortShift").stackable) throw new Error("batch-windows toy/inclusive/shortShift: a uniformly short Y must stack, which is how one bug hides the other");
if (batchApi.batchReport("toy", "inclusive", "shift").stackable) throw new Error("batch-windows toy/inclusive/shift: under the correct target rule the off-by-one must break stacking");

// Coverage in closed form, checked against a full enumeration on the corpora small enough to walk.
for (const setupKey of batchSetupKeys) for (const startKey of batchStartKeys) {
  const setup = batchApi.BATCH_SETUPS.find(entry => entry.key === setupKey);
  const report = batchApi.batchReport(setupKey, startKey, "shift");
  const coverage = batchApi.batchCoverage(setup, report.top);
  if (coverage.full !== setup.m) throw new Error(`batch-windows ${setupKey}/${startKey}: full input coverage is m, one per start whose window contains the position`);
  if (coverage.input(setup.n - 1) !== 0) throw new Error(`batch-windows ${setupKey}/${startKey}: the very last position can never be an input, because Y would need x[n]`);
  if (coverage.targetCover(0) !== 0) throw new Error(`batch-windows ${setupKey}/${startKey}: position 0 can never be a target, because that would need a start of −1`);
  if (setup.n <= 64) {
    let below = 0, neverInput = 0, neverTarget = 0;
    for (let j = 0; j < setup.n; j++) {
      if (coverage.input(j) < setup.m) below++;
      if (coverage.input(j) === 0) neverInput++;
      if (coverage.targetCover(j) === 0) neverTarget++;
    }
    if (below !== coverage.belowFull) throw new Error(`batch-windows ${setupKey}/${startKey}: the closed form for positions below full coverage disagrees with the enumeration (${coverage.belowFull} vs ${below})`);
    if (neverInput !== coverage.neverInput || neverTarget !== coverage.neverTarget) throw new Error(`batch-windows ${setupKey}/${startKey}: the closed forms for never-input/never-target positions disagree with the enumeration`);
    batchValues += 3;
  }
  if (startKey === "correct" && coverage.belowFull !== 2 * setup.m - 1) throw new Error(`batch-windows ${setupKey}: under the correct rule exactly 2m − 1 positions sit below full coverage, independently of n`);
  if (startKey === "tooTight" && coverage.neverInput !== 2) throw new Error(`batch-windows ${setupKey}: the too-narrow rule must leave two positions that are never an input instead of one — the transfer check asks exactly that`);
}
// The dtype contract: a too-narrow integer wraps before any 0 ≤ ID < V check can see it.
for (const setup of batchApi.BATCH_SETUPS) {
  const dtype = batchApi.batchDtype(setup);
  if (dtype.bytes16 !== setup.n * 2 || dtype.bytes32 !== setup.n * 4) throw new Error(`batch-windows ${setup.key}: file size is n times the width of the dtype`);
  if (dtype.overflowTo !== 4464) throw new Error(`batch-windows ${setup.key}: an ID of 70000 written as uint16 wraps to 4464, the number the concept page quotes`);
  if (dtype.overflowV !== 70000 || dtype.overflowV - 1 <= batchApi.BATCH_UINT16_MAX) throw new Error(`batch-windows ${setup.key}: the counter-check must carry its own vocabulary, and it only says anything if that vocabulary does not fit into uint16`);
  if (!(dtype.overflowTo < dtype.overflowV)) throw new Error(`batch-windows ${setup.key}: the wrapped ID must land inside its own vocabulary bound, otherwise the example does not show why the later 0 ≤ ID < V check misses it`);
}
// The headline numbers the observe text, the alarm text and both transfer answers quote.
const batchReal = batchApi.batchReport("real", "inclusive", "shift");
if (Math.round(1 / batchReal.perBatch) !== 312493) throw new Error(`batch-windows: the quoted "one hit per 312,493 batches" drifted to ${Math.round(1 / batchReal.perBatch)}`);
if (Number((batchReal.perBatch * 100).toFixed(5)) !== 0.00032) throw new Error("batch-windows: the quoted probability of 0.00032 % per batch drifted");
if (Number(batchReal.batchesPerPass.toFixed(1)) !== 1220.7) throw new Error("batch-windows: the quoted 1,220.7 batches per corpus pass drifted");
const batchToy = batchApi.batchReport("toy", "correct", "shift");
if (JSON.stringify(batchToy.starts) !== JSON.stringify([1, 5, 2, 4])) throw new Error(`batch-windows: the observe text walks the reader through the starts 1, 5, 2, 4, computed ${batchToy.starts.join(", ")}`);
if (JSON.stringify(batchApi.batchReport("toy", "inclusive", "shift").starts) !== JSON.stringify([1, 6, 2, 5])) throw new Error("batch-windows: under the too-wide bound the same draw must yield the 6 the observe text points at");
// The prose has to keep carrying the numbers it argues from — and the German transfer answer lives in
// its own map, so checking the lab entry alone would leave it unguarded.
const batchTransferDe = readConstant("LAB_TRANSFER_ANSWERS")["batch-windows"];
const batchTransferEn = pack.labs["batch-windows"].transferAnswer;
if (!batchTransferDe || !batchTransferEn) throw new Error("batch-windows: the transfer question needs a worked answer in both languages");
for (const [labelText, lab, answer] of [["German", batchLab, batchTransferDe], ["English", pack.labs["batch-windows"], batchTransferEn]]) {
  const thousands = labelText === "German" ? "." : ",";
  const decimal = labelText === "German" ? "," : ".";
  for (const required of [`312${thousands}493`, "get_batch", "np.stack"]) {
    if (!JSON.stringify(lab).includes(required)) throw new Error(`batch-windows ${labelText}: the lab must keep quoting ${required}, because the observe text and the transfer answer argue from it`);
  }
  // Both numbers that make the "green tests, dead run" argument, in the answer itself.
  for (const required of [`312${thousands}493`, `0${decimal}00032`, `1${thousands}220${decimal}7`]) {
    if (!answer.includes(required)) throw new Error(`batch-windows ${labelText}: the transfer answer must keep quoting ${required} — without it the claim that a finite test stays green is unsupported`);
  }
  // Named field, not the stringified object: the transfer answer quotes the same exponent, so a
  // whole-object search would keep passing after the misconception lost its argument.
  if (!/10⁻⁷/.test(lab.misconception)) throw new Error(`batch-windows ${labelText}: the misconception text argues from a per-draw probability of 10⁻⁷, which is what makes a passing test meaningless`);
}
console.log(`batch-windows OK: ${batchStates} states, ${batchValues} values, one hit per ${Math.round(1 / batchReal.perBatch).toLocaleString("en-US")} batches at A1 scale`);

// ---------------------------------------------------------------------------------------------
// mixed-precision: the lab claims exact FP16/BF16 arithmetic. Every number it shows is therefore a
// falsifiable statement about IEEE 754, and each guard below pins one of them. The independent
// reference is re-typed here from the format definitions, not imported from the app.
const precSource = ["PREC_LN_EPS", "PREC_LN_BASE", "precF32Buffer", "precU32Buffer", "precBf16", "precRound",
  "PREC_DTYPES", "PREC_CASES", "PREC_SCHEMES", "precAccumulate", "precAllSchemes", "precLayerNorm",
  "PREC_SCALES", "PREC_AUTOCAST_ROWS"];
const precApi = runInNewContext(`${numberPrelude}${precSource.map(name => sliceDeclaration(source, name)).join("\n")}; ({${precSource.join(",")}})`,
  { Math, Float32Array, Uint32Array, Number });

// Independent bf16 round-to-nearest-even, written from the format definition rather than reused.
const precRefBuffer = new Float32Array(1), precRefBits = new Uint32Array(precRefBuffer.buffer);
function precRefBf16(value) {
  precRefBuffer[0] = Math.fround(value);
  const bits = precRefBits[0];
  if (((bits >>> 23) & 0xff) === 0xff) return precRefBuffer[0];
  const high = bits >>> 16, low = bits & 0xffff;
  let out = high;
  if (low > 0x8000) out = high + 1;
  else if (low === 0x8000) out = high + (high & 1);
  precRefBits[0] = (out << 16) >>> 0;
  return precRefBuffer[0];
}
const precRefRound = (dtype, value) => dtype === "fp16" ? Math.f16round(value) : dtype === "bf16" ? precRefBf16(value) : Math.fround(value);
function precRefAccumulate(value, steps, acc, val) {
  const stored = precRefRound(val, value);
  let sum = 0, stalled = 0, previous = 0;
  for (let step = 1; step <= steps; step++) {
    previous = sum;
    sum = precRefRound(acc, previous + stored);
    if (sum === previous && !stalled) stalled = step;
  }
  return { stored, sum, stalled };
}
function precRefLayerNorm(scale, dtype) {
  const r = value => precRefRound(dtype, value);
  const x = precApi.PREC_LN_BASE.map(value => r(value * scale));
  let mean = 0;
  for (const value of x) mean = r(mean + value);
  mean = r(mean / x.length);
  let sumSquares = 0;
  for (const value of x) { const centred = r(value - mean); sumSquares = r(sumSquares + r(centred * centred)); }
  const variance = r(sumSquares / x.length);
  const denominator = r(Math.sqrt(r(variance + precApi.PREC_LN_EPS)));
  return { mean, sumSquares, variance, denominator, out: x.map(value => r(r(value - mean) / denominator)) };
}
let precValues = 0;
for (const item of precApi.PREC_CASES) for (const scheme of precApi.PREC_SCHEMES) {
  const got = precApi.precAccumulate(item.key, scheme.key);
  const want = precRefAccumulate(item.value, item.steps, scheme.acc, scheme.val);
  for (const [field, expected] of [["stored", want.stored], ["sum", want.sum], ["stalledAt", want.stalled]]) {
    precValues++;
    if (!Object.is(got[field], expected)) throw new Error(`mixed-precision ${item.key}/${scheme.key}: ${field} is ${got[field]}, the reference says ${expected}`);
  }
}
for (const entry of precApi.PREC_SCALES) for (const dtype of ["fp32", "fp16", "bf16"]) {
  const got = precApi.precLayerNorm(entry.scale, dtype), want = precRefLayerNorm(entry.scale, dtype);
  for (const field of ["mean", "sumSquares", "variance", "denominator"]) {
    precValues++;
    if (!Object.is(got[field], want[field])) throw new Error(`mixed-precision layer norm ${entry.key}/${dtype}: ${field} is ${got[field]}, the reference says ${want[field]}`);
  }
  got.out.forEach((value, index) => {
    precValues++;
    if (!Object.is(value, want.out[index])) throw new Error(`mixed-precision layer norm ${entry.key}/${dtype}: out[${index}] is ${value}, the reference says ${want.out[index]}`);
  });
}
// The five schemes must stay the exact four handout lines plus the BF16 counterpart, because the
// lab's whole argument is that lines 3 and 4 of the handout are the same computation.
const precHandoutLine34 = precApi.precAccumulate("handout", "accF32");
if (precHandoutLine34.sum !== 10.00213623046875) throw new Error(`mixed-precision: lines 3 and 4 of the handout must give 10.00213623046875, got ${precHandoutLine34.sum}`);
if (precApi.precAccumulate("handout", "allF16").sum !== 9.953125) throw new Error("mixed-precision: the all-FP16 handout line must give 9.953125");
// The reversal is the lab's thesis: FP16 beats BF16 on resolution and loses to it on range. If a
// future edit makes one format win everywhere, the lab teaches a ranking that does not exist.
const precRoundExact = precApi.precAllSchemes("exact");
const precRoundReference = precRoundExact.find(entry => entry.scheme.key === "allF32").sum;
const precHiddenOnRound = precRoundExact.filter(entry => entry.scheme.key !== "allF32" && Object.is(entry.sum, precRoundReference));
if (!precHiddenOnRound.some(entry => entry.scheme.key === "allF16")) throw new Error("mixed-precision: on the round-number case all-FP16 must be bit-identical to FP32, otherwise the 'harmless test' lesson has no case");
if (precHiddenOnRound.some(entry => entry.scheme.key === "allBf16")) throw new Error("mixed-precision: all-BF16 must NOT match on the round-number case, that contrast is the resolution half of the thesis");
const precTiny = Object.fromEntries(precApi.precAllSchemes("tiny").map(entry => [entry.scheme.key, entry.sum]));
if (precTiny.allF16 !== 0) throw new Error("mixed-precision: at 1e-8 all-FP16 must underflow to exactly 0");
if (precTiny.accF32 !== 0) throw new Error("mixed-precision: at 1e-8 the FP32 accumulator must ALSO be 0 — that an accumulator cannot rescue an already-underflowed input is the lab's central counterintuitive result");
if (!(precTiny.allBf16 > 0)) throw new Error("mixed-precision: at 1e-8 BF16 must survive, that is the range half of the thesis");
// The two LayerNorm failure modes must stay at opposite ends and must stay silent, because the
// lab claims an overflow here produces zeros rather than a NaN.
// Read the scales the lab actually offers, not literals: a guard that hardcodes 300 keeps passing
// after PREC_SCALES is changed to a scale where nothing overflows, and would prove nothing.
const precScaleOf = key => {
  const entry = precApi.PREC_SCALES.find(item => item.key === key);
  if (!entry) throw new Error(`mixed-precision: the scale "${key}" must stay in PREC_SCALES, the lab's argument is built on all three`);
  return entry.scale;
};
const precLargeF16 = precApi.precLayerNorm(precScaleOf("large"), "fp16");
if (!precLargeF16.overflowed) throw new Error("mixed-precision: at the large activation scale the FP16 sum of squares must overflow");
if (!precLargeF16.collapsed) throw new Error("mixed-precision: the FP16 overflow must collapse the output to all zeros — a NaN would be the loud case and would undo the lesson");
if (precLargeF16.out.some(Number.isNaN)) throw new Error("mixed-precision: the overflow case must not produce NaN, the lab argues it stays silent");
if (precApi.precLayerNorm(precScaleOf("large"), "bf16").overflowed) throw new Error("mixed-precision: BF16 must not overflow at the large scale, that is the answer to part (b)");
if (!precApi.precLayerNorm(precScaleOf("small"), "fp16").flushed) throw new Error("mixed-precision: at the small activation scale the FP16 variance must flush to zero");
const precUnitF16 = precApi.precLayerNorm(precScaleOf("unit"), "fp16");
if (precUnitF16.overflowed || precUnitF16.flushed || precUnitF16.collapsed) throw new Error("mixed-precision: at the unit activation scale nothing may fail — that is the case a self-written test would use, and the lesson needs it to look harmless");
// The FP16 limit the prose argues from must stay the real one.
if (precApi.PREC_DTYPES.find(entry => entry.key === "fp16").maxFinite !== 65504) throw new Error("mixed-precision: the FP16 maximum must stay 65504, the overflow argument is pinned to it");
if (precApi.PREC_DTYPES.find(entry => entry.key === "bf16").mantissa >= precApi.PREC_DTYPES.find(entry => entry.key === "fp16").mantissa) throw new Error("mixed-precision: BF16 must have fewer mantissa bits than FP16, otherwise the accumulation contrast is backwards");
// autocast policy: exactly the six rows the handout asks for, and the two FP32 exceptions must be
// the reduction ops. A renderer that lost the parameter row would silently answer five of six.
if (precApi.PREC_AUTOCAST_ROWS.length !== 6) throw new Error("mixed-precision: benchmarking_mixed_precision (a) asks for exactly six dtypes");
const precPolicies = precApi.PREC_AUTOCAST_ROWS.map(row => `${row.key}:${row.policy}`).join(",");
if (precPolicies !== "params:keep,fc1:low,ln:fp32,logits:low,loss:fp32,grads:keep") throw new Error(`mixed-precision: the autocast policy must match PyTorch, got ${precPolicies}`);
// Renderer guards: the display expression, not just the source function. A lab that computes a
// number it never shows is the failure mode this repo has hit before.
const precAccumulationRenderer = sliceDeclaration(source, "precAccumulationStage");
if (!precAccumulationRenderer.includes("precNumber(report.sum)")) throw new Error("mixed-precision: the accumulation renderer must display the computed sum");
if (!precAccumulationRenderer.includes("precAllSchemes(caseKey)")) throw new Error("mixed-precision: the renderer must show all five schemes on the selected case, that comparison is where the reversal is read off");
if (!/\$\{report\.stalledAt\?`\$\{report\.stalledAt\}/.test(precAccumulationRenderer)) throw new Error("mixed-precision: the renderer must display the stalling step itself, not merely mention the field");
const precAutocastRenderer = sliceDeclaration(source, "precAutocastStage");
if (!precAutocastRenderer.includes("precNumber(low.variance)")) throw new Error("mixed-precision: the autocast renderer must display the low-precision variance");
if (!precAutocastRenderer.includes("precNumber(low.largestSquare)")) throw new Error("mixed-precision: the autocast renderer must display the largest square, the overflow is read off against it");
if (!precAutocastRenderer.includes("low.collapsed")) throw new Error("mixed-precision: the autocast renderer must report the all-zero output");
// Mode fields must be plain divs: `hidden` does not survive `.field { display: grid }`, which once
// showed both modes' selectors at the same time.
const precControls = source.slice(source.indexOf('if(id==="mixed-precision") return `'), source.indexOf('if(id==="batch-windows") return `'));
for (const id of ["precAccumulationFields", "precAutocastFields"]) {
  if (!new RegExp(`<div id="${id}"( hidden)?>`).test(precControls)) throw new Error(`mixed-precision: ${id} must be a plain div, because hidden is overridden on .field`);
}
const precLab = base.labs.find(entry => entry.id === "mixed-precision");
if (!precLab) throw new Error("mixed-precision: lab entry missing");
if (precLab.module !== "foundations") throw new Error("mixed-precision: the lab belongs to the foundations module, where the dtype concept lives");
for (const [label, lab] of [["de", precLab], ["en", pack.labs["mixed-precision"]]]) {
  if (!/autocast/.test(lab.mental)) throw new Error(`mixed-precision ${label}: the mental model must name autocast, which appeared nowhere in the app before this lab`);
  if (!/65504/.test(lab.transferAnswer)) throw new Error(`mixed-precision ${label}: the transfer answer must pin the overflow to the FP16 maximum`);
  if (!/351/.test(lab.transferAnswer)) throw new Error(`mixed-precision ${label}: the transfer answer must name the step at which BF16 stalls, that is the half of the trade-off that costs`);
}
// Reachability: L2 is the lecture that teaches float16/bfloat16/fp8 and mixed_precision_training,
// and a2:benchmark-profile is the mission that owns both handout problems.
if (!base.lectureGuides.l02.labs.includes("mixed-precision")) throw new Error("mixed-precision: Lecture 2 teaches the dtype sections, the lab must be reachable from it");
const precMission = base.assignments.find(entry => entry.id === "a2").missions.find(entry => entry.id === "benchmark-profile");
if (!precMission.labs.includes("mixed-precision")) throw new Error("mixed-precision: the a2:benchmark-profile mission owns mixed_precision_accumulation and benchmarking_mixed_precision");
if (!base.modules.find(entry => entry.id === "foundations").labs.includes("mixed-precision")) throw new Error("mixed-precision: the foundations module must list the lab");
console.log(`mixed-precision OK: ${precValues} values, handout lines 3+4 agree at ${precHandoutLine34.sum}, FP16 exact on the round case, BF16 the only survivor at 1e-8`);

// checkpoint-segments: the lab answers a2:gradient_checkpointing by computing, not by quoting. Its
// two constants are printed by the handout itself, and the whole didactic point — that the famous
// √N answer is a right formula without its premise — collapses if either constant drifts. The
// reference below is re-derived from the handout's own printed figures, not imported from the app.
const ckptSource = ["CKPT_BLOCK_RESIDUAL", "CKPT_BOUNDARY", "CKPT_DEPTHS", "CKPT_RATIOS",
  "ckptFlatPeak", "ckptFlatRow", "ckptFlatTable", "ckptBestSegments", "ckptNestedPeak", "ckptNestedRecompute"];
const ckptApi = runInNewContext(`${numberPrelude}${ckptSource.map(name => sliceDeclaration(source, name)).join("\n")}; ({${ckptSource.join(",")}})`,
  { Math });
const ckptR = ckptApi.CKPT_BLOCK_RESIDUAL, ckptC = ckptApi.CKPT_BOUNDARY;
// The handout prints "14605.25 MiB" for four blocks and "160.00 MiB" for two boundary tensors.
// Deriving the constants back out is what makes them checkable rather than asserted.
if (4 * ckptR !== 14605.25) throw new Error(`checkpoint-segments: four blocks must reproduce the handout's 14605.25 MiB, got ${4 * ckptR}`);
if (2 * ckptC !== 160) throw new Error(`checkpoint-segments: two boundary tensors must reproduce the handout's 160.00 MiB, got ${2 * ckptC}`);
if (ckptR.toFixed(2) !== "3651.31") throw new Error("checkpoint-segments: a single block must display as the handout's 3651.31 MiB");
if (ckptC !== (4 * 2048 * 2560 * 4) / (1024 * 1024)) throw new Error("checkpoint-segments: the boundary tensor must stay one [4, 2048, 2560] FP32 tensor");
// Independent reference, re-typed from the two-item model rather than reused from the app.
const ckptRefPeak = (blocks, segment, boundary) => Math.ceil(blocks / segment) * boundary + segment * ckptR;
const ckptRefNested = (blocks, boundary) => blocks <= 1 ? ckptR : boundary + ckptRefNested(Math.ceil(blocks / 2), boundary);
const ckptRefRecompute = blocks => {
  if (blocks <= 1) return 1;
  const lower = Math.floor(blocks / 2);
  return lower + ckptRefRecompute(lower) + ckptRefRecompute(blocks - lower);
};
let ckptValues = 0;
for (const depth of ckptApi.CKPT_DEPTHS) {
  for (const ratio of ckptApi.CKPT_RATIOS) {
    const table = ckptApi.ckptFlatTable(depth.blocks, ratio.boundary, ckptR);
    if (table.length !== depth.blocks) throw new Error(`checkpoint-segments: the table must offer every segment size for N=${depth.blocks}`);
    table.forEach((row, index) => {
      const segment = index + 1;
      const want = ckptRefPeak(depth.blocks, segment, ratio.boundary);
      ckptValues += 4;
      if (!Object.is(row.peak, want)) throw new Error(`checkpoint-segments N=${depth.blocks}/${ratio.key}/k=${segment}: peak is ${row.peak}, the reference says ${want}`);
      if (!Object.is(row.segments, Math.ceil(depth.blocks / segment))) throw new Error(`checkpoint-segments N=${depth.blocks}/k=${segment}: wrong number of checkpoint calls`);
      if (!Object.is(row.held, Math.ceil(depth.blocks / segment) * ratio.boundary)) throw new Error(`checkpoint-segments N=${depth.blocks}/${ratio.key}/k=${segment}: wrong boundary-tensor total`);
      if (!Object.is(row.materialized, segment * ckptR)) throw new Error(`checkpoint-segments N=${depth.blocks}/k=${segment}: wrong materialized segment`);
    });
    ckptValues += 1;
    if (!Object.is(ckptApi.ckptNestedPeak(depth.blocks, ratio.boundary, ckptR), ckptRefNested(depth.blocks, ratio.boundary))) throw new Error(`checkpoint-segments N=${depth.blocks}/${ratio.key}: nested peak disagrees with r + c·⌈log₂N⌉`);
  }
  ckptValues += 1;
  if (!Object.is(ckptApi.ckptNestedRecompute(depth.blocks), ckptRefRecompute(depth.blocks))) throw new Error(`checkpoint-segments N=${depth.blocks}: nested recomputation count disagrees with the halving recursion`);
}
// The closed form quoted in the lab's formula line must actually hold for powers of two.
for (const blocks of [2, 4, 8, 16, 32]) {
  const want = blocks * (Math.log2(blocks) / 2 + 1);
  if (ckptApi.ckptNestedRecompute(blocks) !== want) throw new Error(`checkpoint-segments: the formula line claims N·(log₂N/2 + 1) extra forwards, which fails at N=${blocks}`);
}
// The three regimes ARE the lesson. Each is derived from the lab's own data, never from a literal,
// so that retuning CKPT_RATIOS cannot leave the prose claiming a contrast the lab no longer shows.
const ckptRatioOf = key => {
  const entry = ckptApi.CKPT_RATIOS.find(item => item.key === key);
  if (!entry) throw new Error(`checkpoint-segments: the ratio "${key}" must stay in CKPT_RATIOS, the lab's three-regime argument needs all of them`);
  return entry.boundary;
};
const ckptXl = ckptApi.CKPT_DEPTHS.find(entry => entry.key === "xl");
if (!ckptXl || ckptXl.blocks !== 32) throw new Error("checkpoint-segments: the xl config with 32 blocks is the configuration the problem specifies");
const ckptBestAt = (blocks, boundary) => ckptApi.ckptBestSegments(ckptApi.ckptFlatTable(blocks, boundary, ckptR));
const ckptMeasuredBest = ckptBestAt(ckptXl.blocks, ckptRatioOf("measured"));
if (ckptMeasuredBest.join(",") !== "1") throw new Error(`checkpoint-segments: at the measured ratio the minimum must sit at the boundary k=1, got ${ckptMeasuredBest.join(",")} — the answer to part (b) depends on it`);
const ckptSqrt = Math.round(Math.sqrt(ckptXl.blocks));
const ckptTextbookBest = ckptBestAt(ckptXl.blocks, ckptRatioOf("textbook"));
if (!ckptTextbookBest.includes(ckptSqrt)) throw new Error("checkpoint-segments: under the textbook assumption c = r the √N rule of thumb must actually be optimal, otherwise the lab's contrast has no other side");
if (ckptTextbookBest.length < 2) throw new Error("checkpoint-segments: the textbook regime must show a plateau, that flatness is why one neighbour probe is not enough");
const ckptQuarterBest = ckptBestAt(ckptXl.blocks, ckptRatioOf("quarter"));
if (ckptQuarterBest.length !== 1 || ckptQuarterBest[0] === 1 || ckptQuarterBest[0] === ckptXl.blocks) throw new Error(`checkpoint-segments: the quarter ratio must produce an interior minimum, got ${ckptQuarterBest.join(",")}`);
if (ckptQuarterBest[0] !== Math.round(Math.sqrt(ckptXl.blocks * ckptRatioOf("quarter") / ckptR))) throw new Error("checkpoint-segments: the interior minimum must land on k* = √(N·c/r), that formula is what the lab teaches");
// The two factors the prose states out loud, recomputed from the lab's own table.
const ckptTable = ckptApi.ckptFlatTable(ckptXl.blocks, ckptRatioOf("measured"), ckptR);
const ckptSqrtFactor = ckptTable[ckptSqrt - 1].peak / ckptTable[0].peak;
if (ckptSqrtFactor.toFixed(2) !== "3.60") throw new Error(`checkpoint-segments: the misconception text claims the √N answer costs 3.60×, the table says ${ckptSqrtFactor.toFixed(2)}`);
if (Math.round(ckptR / ckptC) !== 46) throw new Error(`checkpoint-segments: the prose claims a factor of 46 between a block and a boundary tensor, the constants say ${Math.round(ckptR / ckptC)}`);
const ckptReachable = ckptXl.blocks * ckptR - ckptR;
const ckptFlatShare = ((ckptXl.blocks * ckptR - ckptTable[0].peak) / ckptReachable) * 100;
if (ckptFlatShare.toFixed(1) !== "97.7") throw new Error(`checkpoint-segments: the misconception text claims one level captures 97.7 % of the achievable saving, the model says ${ckptFlatShare.toFixed(1)}`);
if (ckptApi.ckptNestedRecompute(ckptXl.blocks) !== 112) throw new Error("checkpoint-segments: the misconception text names 112 extra forwards for the nested strategy");
// The lower bound is the reason the nesting payoff is small here; if a strategy could undercut one
// block's residuals, the whole part-(a)-versus-part-(b) argument would be wrong.
for (const depth of ckptApi.CKPT_DEPTHS) {
  for (const ratio of ckptApi.CKPT_RATIOS) {
    const best = Math.min(...ckptApi.ckptFlatTable(depth.blocks, ratio.boundary, ckptR).map(row => row.peak));
    if (best < ckptR) throw new Error(`checkpoint-segments N=${depth.blocks}/${ratio.key}: no strategy may fall below one block's residuals`);
    if (ckptApi.ckptNestedPeak(depth.blocks, ratio.boundary, ckptR) < ckptR) throw new Error(`checkpoint-segments N=${depth.blocks}/${ratio.key}: the nested peak may not fall below the lower bound either`);
  }
}
// Renderer guards demand the display expression, not the source function: computing a number is not
// showing it. This repo has shipped a lab whose verdicts were never rendered.
const ckptSegmentRenderer = sliceDeclaration(source, "ckptSegmentsStage");
if (!ckptSegmentRenderer.includes("ckptNumber(current.peak)")) throw new Error("checkpoint-segments: the renderer must display the peak of the selected segment size");
if (!ckptSegmentRenderer.includes("ckptNumber(current.held)") || !ckptSegmentRenderer.includes("ckptNumber(current.materialized)")) throw new Error("checkpoint-segments: both items of the peak must be shown separately, the trade-off is only visible as two rows");
if (!/rows\.map\(row\s*=>/.test(ckptSegmentRenderer)) throw new Error("checkpoint-segments: the full table must be rendered from the computed rows, not from a fixed selection");
if (!/\[segment-1,segment,segment\+1\]/.test(ckptSegmentRenderer)) throw new Error("checkpoint-segments: the neighbour probe must show both neighbours — that is literally what part (b) asks for");
if (!ckptSegmentRenderer.includes("fixedNum(optimumReal,4)")) throw new Error("checkpoint-segments: the renderer must display k* = √(N·c/r) itself, the rule-of-thumb argument is read off against it");
if (!/fixedNum\(\(boundary\/residual\),4\)/.test(ckptSegmentRenderer)) throw new Error("checkpoint-segments: the renderer must display the ratio ρ, which is the quantity the whole lab turns on");
const ckptNestingRenderer = sliceDeclaration(source, "ckptNestingStage");
if (!ckptNestingRenderer.includes("ckptNumber(nested)")) throw new Error("checkpoint-segments: the nesting renderer must display the nested peak");
if (!ckptNestingRenderer.includes("nestedForwards")) throw new Error("checkpoint-segments: the nesting renderer must display the price in extra forwards, the asymptotic claim is meaningless without it");
if (!/\$\{entry\.extra\}/.test(ckptNestingRenderer)) throw new Error("checkpoint-segments: every strategy row must carry its own recomputation price, otherwise the three strategies can be compared on memory alone");
if (!ckptNestingRenderer.includes("ckptNumber(floor)")) throw new Error("checkpoint-segments: the nesting renderer must display the lower bound");
if (!/share\(bestPeak\)/.test(ckptNestingRenderer) || !/share\(nested\)/.test(ckptNestingRenderer)) throw new Error("checkpoint-segments: both strategies' share of the achievable saving must be shown, that comparison is the point of mode (a)");
// Mode fields must be plain divs: `hidden` does not survive `.field { display: grid }`.
const ckptControls = source.slice(source.indexOf('if(id==="checkpoint-segments") return `'), source.indexOf('if(id==="winrate-lc") return `'));
if (ckptControls.length < 200) throw new Error("checkpoint-segments: the control markup was not found, this guard would otherwise pass vacuously");
if (!/<div id="ckptSegmentFields">/.test(ckptControls)) throw new Error("checkpoint-segments: ckptSegmentFields must be a plain div, because hidden is overridden on .field");
if (!/id="ckptSegment"/.test(ckptControls)) throw new Error("checkpoint-segments: the segment-size control must exist");
const ckptLab = base.labs.find(entry => entry.id === "checkpoint-segments");
if (!ckptLab) throw new Error("checkpoint-segments: lab entry missing");
if (ckptLab.module !== "gpu") throw new Error("checkpoint-segments: the lab belongs to the gpu module, where the checkpointing concept lives");
for (const [label, lab] of [["de", ckptLab], ["en", pack.labs["checkpoint-segments"]]]) {
  if (!/√\(N·c\/r\)/.test(lab.formula)) throw new Error(`checkpoint-segments ${label}: the formula line must state k* = √(N·c/r), the generalisation is the lesson`);
  // Since v92 every displayed number groups its thousands, so the prose has to as well: the
  // German card writes 3.651,31 and the English one 3,651.31. The locale-exact form is required,
  // not a loose "3651 with any separator" -- that would accept the ungrouped string the ledger
  // beside it no longer prints.
  const ckptBlockFigure = label === "de" ? "3.651,31" : "3,651.31";
  if (!lab.misconception.includes(ckptBlockFigure)) throw new Error(`checkpoint-segments ${label}: the misconception must pin the argument to the handout's block figure as ${ckptBlockFigure}`);
  if (!/3\.60|3,60/.test(lab.misconception)) throw new Error(`checkpoint-segments ${label}: the misconception must name how far off the √N answer is`);
  if (!/97[.,]7/.test(lab.misconception)) throw new Error(`checkpoint-segments ${label}: the misconception must name the share one level already captures, otherwise the nesting half is only asserted`);
  if (!/0[.,]0219/.test(lab.transferAnswer)) throw new Error(`checkpoint-segments ${label}: the transfer answer must name ρ, the one number that decides the question without a measurement`);
}
// Reachability: L5 is the lecture with the Recomputation section, and a2:compile-checkpoint is the
// mission that owns gradient_checkpointing.
if (!base.lectureGuides.l05.labs.includes("checkpoint-segments")) throw new Error("checkpoint-segments: Lecture 5 teaches recomputation, the lab must be reachable from it");
const ckptMission = base.assignments.find(entry => entry.id === "a2").missions.find(entry => entry.id === "compile-checkpoint");
if (!ckptMission.labs.includes("checkpoint-segments")) throw new Error("checkpoint-segments: the a2:compile-checkpoint mission owns gradient_checkpointing");
if (!base.modules.find(entry => entry.id === "gpu").labs.includes("checkpoint-segments")) throw new Error("checkpoint-segments: the gpu module must list the lab");
console.log(`checkpoint-segments OK: ${ckptValues} values, minimum at k=${ckptMeasuredBest.join(",")} measured against a √N plateau of ${ckptTextbookBest.join(",")}, rule of thumb off by ${ckptSqrtFactor.toFixed(2)}×`);

// shard-ledger: the lab answers a2:optimizer_state_sharding_accounting and a2:fsdp_accounting by
// computing the per-rank ledger the platform previously only printed as a formula string. Three
// claims carry the whole lab and each is checked against a reference re-derived here from Table 1
// and §2.1.2 of the handout rather than imported from the app: the optimizer state does not exist
// before the first step(), sharding one of three items saves a quarter and not a half, and the
// all-gather buffer is a floor that no world size lowers.
const shardSource = ["SHARD_D", "SHARD_DFF", "SHARD_LAYERS", "SHARD_VOCAB", "SHARD_BLOCK_LINEAR",
  "SHARD_PARAMS", "SHARD_LARGEST_MODULE", "SHARD_INFLIGHT", "SHARD_MIB", "SHARD_P", "SHARD_G", "SHARD_O",
  "SHARD_MOMENTS", "SHARD_STRATEGIES", "SHARD_WORLDS", "SHARD_PRECISIONS", "SHARD_ACTIVATIONS",
  "shardLedger", "shardRing", "shardComm", "shardMib"];
const shardApi = runInNewContext(
  `${numberPrelude}const CKPT_BLOCK_RESIDUAL = ${14605.25 / 4}, CKPT_BOUNDARY = ${(4 * 2048 * 2560 * 4) / (1024 * 1024)};
   ${shardSource.map(name => sliceDeclaration(source, name)).join("\n")}; ({${shardSource.join(",")}})`,
  { Math });

// Table 1 gives the xl row; §2.1.2 fixes the vocabulary at 10,000 for every non-leaderboard model.
if (shardApi.SHARD_D !== 2560 || shardApi.SHARD_DFF !== 10240 || shardApi.SHARD_LAYERS !== 32) throw new Error("shard-ledger: the xl row of Table 1 is d_model 2560, d_ff 10240, 32 layers");
if (shardApi.SHARD_VOCAB !== 10000) throw new Error("shard-ledger: §2.1.2 fixes the vocabulary at 10,000");
const shardRefN = 2 * 10000 * 2560 + 32 * (4 * 2560 * 2560 + 3 * 2560 * 10240 + 2 * 2560) + 2560;
if (shardApi.SHARD_PARAMS !== shardRefN) throw new Error(`shard-ledger: the xl parameter count must follow the A1 architecture, got ${shardApi.SHARD_PARAMS} want ${shardRefN}`);
if (shardApi.SHARD_P !== 4 * shardRefN || shardApi.SHARD_G !== 4 * shardRefN || shardApi.SHARD_O !== 8 * shardRefN) throw new Error("shard-ledger: FP32 AdamW is 4N parameters, 4N gradients and 8N optimizer state");
if (shardApi.SHARD_P + shardApi.SHARD_G + shardApi.SHARD_O !== 16 * shardRefN) throw new Error("shard-ledger: the three items must sum to the 16N the resource lab also carries");
// §7 wraps individual Linear and Embedding layers, so the buffer scales with the largest of them.
if (shardApi.SHARD_LARGEST_MODULE !== 2560 * 10240) throw new Error("shard-ledger: the largest sharded module in the xl config is D·D_FF, the buffer argument depends on it");
if (shardApi.SHARD_LARGEST_MODULE * 4 / (1024 * 1024) !== 100) throw new Error("shard-ledger: the largest sharded module must stay 100 MiB in FP32, the number the prose names");
if (shardApi.SHARD_INFLIGHT !== 3) throw new Error("shard-ledger: the handout's prefetch rule holds current, prefetched and in-flight, so three buffers");

// Full recomputation of every state against an independent reference.
const shardHas = { init: [1, 0, 0], firstPre: [1, 1, 0], firstPost: [1, 1, 1], steadyPre: [1, 1, 1] };
const shardShards = { ddp: [0, 0, 0], osd: [0, 0, 1], zero1: [0, 0, 1], fsdp: [1, 1, 1] };
function shardRefLedger(strategyKey, momentKey, world, bytes) {
  const has = shardHas[momentKey], sh = shardShards[strategyKey];
  const p = has[0] ? 4 * shardRefN / (sh[0] ? world : 1) : 0;
  const g = has[1] ? 4 * shardRefN / (sh[1] ? world : 1) : 0;
  const o = has[2] ? 8 * shardRefN / (sh[2] ? world : 1) : 0;
  const transient = strategyKey === "fsdp" && world > 1 ? 3 * 2560 * 10240 * bytes : 0;
  return { p, g, o, transient, persistent: p + g + o, total: p + g + o + transient };
}
const shardRefRing = (world, bytes, kind) => world <= 1 ? 0 : (kind === "ar" ? 2 : 1) * (world - 1) / world * bytes;
const shardRefComm = {
  ddp: () => [["ar", 4 * shardRefN]],
  osd: () => [["ar", 4 * shardRefN], ["ag", 4 * shardRefN]],
  zero1: () => [["rs", 4 * shardRefN], ["ag", 4 * shardRefN]],
  fsdp: b => [["ag", b * shardRefN], ["ag", b * shardRefN], ["rs", b * shardRefN]]
};
if (shardApi.SHARD_MOMENTS.length !== 4) throw new Error("shard-ledger: the handout names three moments and the lab adds the steady state, so four");
if (shardApi.SHARD_STRATEGIES.length !== 4) throw new Error("shard-ledger: the comparison needs DDP, the own sharding, ZeRO-1 and FSDP");
if (shardApi.SHARD_STRATEGIES.map(entry => entry.key).join(",") !== "ddp,osd,zero1,fsdp") throw new Error("shard-ledger: DDP must stay the first row, every saving is quoted against it");
let shardValues = 0;
for (const precision of shardApi.SHARD_PRECISIONS)
  for (const world of shardApi.SHARD_WORLDS)
    for (const moment of shardApi.SHARD_MOMENTS)
      for (const strategy of shardApi.SHARD_STRATEGIES) {
        const got = shardApi.shardLedger(strategy, moment, world, precision);
        const want = shardRefLedger(strategy.key, moment.key, world, precision.bytes);
        for (const field of ["p", "g", "o", "transient", "persistent", "total"]) {
          shardValues++;
          if (!Object.is(got[field], want[field])) throw new Error(`shard-ledger ${precision.key}/W${world}/${moment.key}/${strategy.key}: ${field} is ${got[field]}, reference says ${want[field]}`);
        }
      }
for (const precision of shardApi.SHARD_PRECISIONS)
  for (const world of shardApi.SHARD_WORLDS)
    for (const strategy of shardApi.SHARD_STRATEGIES) {
      const got = shardApi.shardComm(strategy, world, precision).total;
      const want = shardRefComm[strategy.key](precision.bytes).reduce((sum, [kind, bytes]) => sum + shardRefRing(world, bytes, kind), 0);
      shardValues++;
      if (!Object.is(got, want)) throw new Error(`shard-ledger comm ${precision.key}/W${world}/${strategy.key}: ${got} vs reference ${want}`);
    }

// The lazy-allocation claim is the lab's first lesson: AdamW's moments exist only after step().
const shardMomentOf = key => shardApi.SHARD_MOMENTS.find(entry => entry.key === key);
if (shardMomentOf("init").o || shardMomentOf("firstPre").o) throw new Error("shard-ledger: the optimizer state must be absent before the first step(), that is the whole point of the three moments");
if (!shardMomentOf("firstPost").o || !shardMomentOf("steadyPre").o) throw new Error("shard-ledger: the optimizer state must be present once the first step() has returned");
const shardDdpAt = key => shardApi.shardLedger(shardApi.SHARD_STRATEGIES[0], shardMomentOf(key), 2, shardApi.SHARD_PRECISIONS[0]).total;
if (shardDdpAt("firstPost") !== 4 * shardDdpAt("init")) throw new Error("shard-ledger: the factor of four between initialization and the first completed step is the claim the misconception makes");
if (shardDdpAt("firstPre") !== 2 * shardDdpAt("init")) throw new Error("shard-ledger: before the first step exactly parameters and gradients exist, so twice the initialization value");

// Problem (c): the own sharding and ZeRO-1 are identical in memory and differ only in bytes moved.
for (const world of shardApi.SHARD_WORLDS)
  for (const precision of shardApi.SHARD_PRECISIONS) {
    const own = shardApi.shardLedger(shardApi.SHARD_STRATEGIES[1], shardMomentOf("steadyPre"), world, precision).total;
    const zero = shardApi.shardLedger(shardApi.SHARD_STRATEGIES[2], shardMomentOf("steadyPre"), world, precision).total;
    if (own !== zero) throw new Error(`shard-ledger W${world}: the own sharding and ZeRO-1 must stay identical in memory, the difference is the collective`);
    if (world > 1) {
      const ddp = shardApi.shardComm(shardApi.SHARD_STRATEGIES[0], world, precision).total;
      if (shardApi.shardComm(shardApi.SHARD_STRATEGIES[2], world, precision).total !== ddp) throw new Error(`shard-ledger W${world}: ZeRO-1 must move exactly as many bytes as plain DDP, that is the answer to part (c)`);
      if (shardApi.shardComm(shardApi.SHARD_STRATEGIES[1], world, precision).total !== 1.5 * ddp) throw new Error(`shard-ledger W${world}: the own sharding must cost one and a half times DDP, three ring phases against two`);
    }
  }
// §7: casting before communicating is what makes FSDP cheaper than DDP rather than dearer.
const shardMixed = shardApi.SHARD_PRECISIONS.find(entry => entry.key === "mixed");
const shardFp32 = shardApi.SHARD_PRECISIONS.find(entry => entry.key === "fp32");
if (!shardMixed || shardMixed.bytes !== 2 || shardFp32.bytes !== 4) throw new Error("shard-ledger: the two precisions must stay BF16 at two bytes and FP32 at four");
for (const world of shardApi.SHARD_WORLDS.filter(value => value > 1)) {
  const ddp = shardApi.shardComm(shardApi.SHARD_STRATEGIES[0], world, shardFp32).total;
  if (shardApi.shardComm(shardApi.SHARD_STRATEGIES[3], world, shardFp32).total !== 1.5 * ddp) throw new Error(`shard-ledger W${world}: FSDP in FP32 must cost one and a half times DDP`);
  if (shardApi.shardComm(shardApi.SHARD_STRATEGIES[3], world, shardMixed).total !== 0.75 * ddp) throw new Error(`shard-ledger W${world}: FSDP with a BF16 compute dtype must fall to three quarters of DDP, that is what §7 buys`);
}
// The permanent items must not react to the precision knob; only the buffer and the wire do.
for (const world of shardApi.SHARD_WORLDS)
  for (const moment of shardApi.SHARD_MOMENTS)
    for (const strategy of shardApi.SHARD_STRATEGIES) {
      const a = shardApi.shardLedger(strategy, moment, world, shardFp32);
      const b = shardApi.shardLedger(strategy, moment, world, shardMixed);
      if (a.persistent !== b.persistent) throw new Error(`shard-ledger ${moment.key}/${strategy.key}/W${world}: mixed precision must leave the three permanent items untouched`);
    }
// The floor: the transient buffer is the one item no world size lowers.
const shardTransients = shardApi.SHARD_WORLDS.filter(value => value > 1)
  .map(world => shardApi.shardLedger(shardApi.SHARD_STRATEGIES[3], shardMomentOf("steadyPre"), world, shardFp32).transient);
if (new Set(shardTransients).size !== 1) throw new Error("shard-ledger: the all-gather buffer must be the same at every world size, otherwise it is not a floor");
if (shardTransients[0] <= 0) throw new Error("shard-ledger: FSDP must carry a transient buffer above one rank");
if (shardApi.shardLedger(shardApi.SHARD_STRATEGIES[3], shardMomentOf("steadyPre"), 1, shardFp32).transient !== 0) throw new Error("shard-ledger: at one rank nothing is gathered, so no buffer");
const shardFloorShare = world => { const row = shardApi.shardLedger(shardApi.SHARD_STRATEGIES[3], shardMomentOf("steadyPre"), world, shardFp32); return row.transient / row.total * 100; };
if (shardFloorShare(2).toFixed(2) !== "1.14") throw new Error(`shard-ledger: the prose claims the buffer is 1.14 % at two ranks, got ${shardFloorShare(2).toFixed(2)}`);
if (shardFloorShare(32).toFixed(2) !== "15.59") throw new Error(`shard-ledger: the prose claims 15.59 % at 32 ranks, got ${shardFloorShare(32).toFixed(2)}`);
if (!shardApi.SHARD_WORLDS.includes(2)) throw new Error("shard-ledger: the handout measures with two GPUs, that world size must stay selectable");
if (Math.max(...shardApi.SHARD_WORLDS) < 32) throw new Error("shard-ledger: a world size large enough to expose the floor must stay selectable");

// The activation budgets are the same two handout figures the checkpointing lab derives, so the
// FSDP-saving argument stays consistent across the two labs rather than inventing a new number.
if (!Object.is(shardApi.SHARD_ACTIVATIONS[0].mib, 32 * ckptR)) throw new Error("shard-ledger: the uncheckpointed activation budget must be the 32 blocks of the checkpointing lab");
if (!Object.is(shardApi.SHARD_ACTIVATIONS[1].mib, 32 * ckptC + ckptR)) throw new Error("shard-ledger: the checkpointed budget must be the k = 1 minimum of the checkpointing lab");
const shardPeakShare = activationMib => {
  const ddp = shardApi.shardMib(shardApi.shardLedger(shardApi.SHARD_STRATEGIES[0], shardMomentOf("steadyPre"), 2, shardFp32).total) + activationMib;
  const fsdp = shardApi.shardMib(shardApi.shardLedger(shardApi.SHARD_STRATEGIES[3], shardMomentOf("steadyPre"), 2, shardFp32).total) + activationMib;
  return { saved: ddp - fsdp, share: (ddp - fsdp) / ddp * 100 };
};
const shardPeakNone = shardPeakShare(shardApi.SHARD_ACTIVATIONS[0].mib), shardPeakCkpt = shardPeakShare(shardApi.SHARD_ACTIVATIONS[1].mib);
if (shardPeakNone.saved.toFixed(2) !== shardPeakCkpt.saved.toFixed(2)) throw new Error("shard-ledger: the absolute saving must not depend on the activation budget, that identity is the lesson");
if (shardPeakNone.share.toFixed(1) !== "15.2") throw new Error(`shard-ledger: the misconception claims 15.2 % of the peak without checkpointing, got ${shardPeakNone.share.toFixed(1)}`);
if (shardPeakCkpt.share.toFixed(1) !== "44.1") throw new Error(`shard-ledger: the misconception claims 44.1 % of the peak with one level, got ${shardPeakCkpt.share.toFixed(1)}`);

// Renderer: computing a number is not displaying it. These demand the concrete display expressions.
const shardLedgerRenderer = source.slice(source.indexOf("function shardLedgerStage()"), source.indexOf("function shardCommStage()"));
if (shardLedgerRenderer.length < 400) throw new Error("shard-ledger: the ledger renderer was not found, this guard would otherwise pass vacuously");
if (!/rows\.map\(row\s*=>/.test(shardLedgerRenderer)) throw new Error("shard-ledger: every strategy row must be rendered from the computed table, not written out");
if (!shardLedgerRenderer.includes("shardNumber(shardMib(l.total))")) throw new Error("shard-ledger: the renderer must display each strategy's total, not only compute it");
if (!shardLedgerRenderer.includes("shardNumber(shardMib(l.transient))")) throw new Error("shard-ledger: the renderer must display the transient buffer per row, the floor argument is unreadable without it");
if (!shardLedgerRenderer.includes("shardNumber(naive)")) throw new Error("shard-ledger: the renderer must display the naive (P+G+O)/W value the floor is contrasted against");
if (!/shardShare\(floorShare\)/.test(shardLedgerRenderer)) throw new Error("shard-ledger: the renderer must display the buffer's share of the rank total");
if (!/SHARD_ACTIVATIONS\.map\(/.test(shardLedgerRenderer)) throw new Error("shard-ledger: the peak comparison must be rendered from both activation budgets");
if (!/shardShare\(saved\s*\/\s*ddpPeak\s*\*\s*100\)/.test(shardLedgerRenderer)) throw new Error("shard-ledger: the peak section must display the saved share, which is the answer fsdp_accounting (a) asks for");
const shardCommRenderer = source.slice(source.indexOf("function shardCommStage()"), source.indexOf("function shardStageMarkup()"));
if (shardCommRenderer.length < 300) throw new Error("shard-ledger: the communication renderer was not found");
if (!shardCommRenderer.includes("fixedNum(ratio,3)")) throw new Error("shard-ledger: the communication renderer must display the ratio against DDP, the 1.500 and 0.750 are the whole comparison");
if (!/result\.parts\.map\(/.test(shardCommRenderer)) throw new Error("shard-ledger: each strategy's collectives must be listed from its own definition");
if (!/memoryRows/.test(shardCommRenderer)) throw new Error("shard-ledger: the communication mode must also show the memory column, that is how the own sharding and ZeRO-1 are shown to be equal");
// v57's trap: `hidden` does nothing on a .field, whose display is grid. Mode fields need a plain div.
const shardControls = source.slice(source.indexOf('if(id==="shard-ledger") return `'), source.indexOf('if(id==="checkpoint-segments") return `'));
if (shardControls.length < 200) throw new Error("shard-ledger: the control markup was not found");
if (!/<div id="shardMomentFields">/.test(shardControls)) throw new Error("shard-ledger: shardMomentFields must be a plain div, hidden has no effect on a .field");
for (const control of ["shardMode", "shardMoment", "shardWorld", "shardPrecision"])
  if (!new RegExp(`id="${control}"`).test(shardControls)) throw new Error(`shard-ledger: the ${control} control must exist`);

// Prose: the claims that make the lab an argument rather than a table.
const shardLab = base.labs.find(entry => entry.id === "shard-ledger");
if (!shardLab) throw new Error("shard-ledger: lab entry missing");
if (shardLab.module !== "distributed") throw new Error("shard-ledger: the lab belongs to the distributed module, where DDP, ZeRO and FSDP live");
for (const [label, lab] of [["de", shardLab], ["en", pack.labs["shard-ledger"]]]) {
  if (!/step\(\)/.test(lab.mental)) throw new Error(`shard-ledger ${label}: the mental model must pin the lazy allocation to step()`);
  if (!/exp_avg/.test(lab.misconception)) throw new Error(`shard-ledger ${label}: the misconception must name the tensors AdamW allocates late`);
  if (!/1[.,]14/.test(lab.misconception)) throw new Error(`shard-ledger ${label}: the misconception must name the buffer's share at two ranks`);
  if (!/15[.,]59/.test(lab.misconception)) throw new Error(`shard-ledger ${label}: the misconception must name the share at which the handout's permission expires`);
  if (!/44[.,]1/.test(lab.misconception) || !/15[.,]2/.test(lab.misconception)) throw new Error(`shard-ledger ${label}: the misconception must contrast both peak shares, the identical saving is the point`);
  if (!/16N/.test(lab.formula)) throw new Error(`shard-ledger ${label}: the formula line must state the 16N sum`);
  if (!/FSDP/.test(lab.transferAnswer)) throw new Error(`shard-ledger ${label}: the transfer answer must name FSDP, the strategy visible even at the wrong moment`);
  if (!/Parameter|parameter/.test(lab.transferAnswer)) throw new Error(`shard-ledger ${label}: the transfer answer must explain the visibility through the parameters, which exist from the constructor`);
}
// Reachability: L8 is the lecture that teaches ZeRO and FSDP, a2:sharding-fsdp owns all four problems.
if (!base.lectureGuides.l08.labs.includes("shard-ledger")) throw new Error("shard-ledger: Lecture 8 teaches ZeRO and FSDP, the lab must be reachable from it");
const shardMission = base.assignments.find(entry => entry.id === "a2").missions.find(entry => entry.id === "sharding-fsdp");
if (!shardMission.labs.includes("shard-ledger")) throw new Error("shard-ledger: the a2:sharding-fsdp mission owns optimizer_state_sharding_accounting and fsdp_accounting");
if (shardMission.labs[0] !== "shard-ledger") throw new Error("shard-ledger: the lab built for this mission must lead its list, the other three are borrowed");
if (!base.modules.find(entry => entry.id === "distributed").labs.includes("shard-ledger")) throw new Error("shard-ledger: the distributed module must list the lab");
console.log(`shard-ledger OK: ${shardValues} values, ${shardDdpAt("init") / (1024 * 1024)} MiB at init against ${shardDdpAt("firstPost") / (1024 * 1024)} MiB after the first step, buffer floor ${shardFloorShare(2).toFixed(2)} % at W=2 and ${shardFloorShare(32).toFixed(2)} % at W=32`);


// ---------------------------------------------------------------------------
// offpolicy-clip: assignment 5 equations (56)-(63).
// The lab's whole claim is that three wrong implementations are invisible on the
// states you would actually test, so the guards check the hiding contract itself,
// not just that some number is produced.
const offNames = ["OFF_REWARDS", "OFF_STD_EPS", "OFF_TOKENS_PER_RESPONSE", "offAdvantages", "OFF_DRIFTS", "OFF_EPSILONS",
  "OFF_VARIANTS", "offTokenTerm", "offObjective", "OFF_SEQS", "OFF_SEQ_VARIANTS", "offSeqWeight", "offGspoRow"];
const offApi = runInNewContext(`${numberPrelude}${offNames.map(name => sliceDeclaration(source, name)).join("\n")}; ({${offNames.join(",")}})`, {});
const offShow = value => value.toFixed(6);
let offValues = 0;

// The group is the one the lab `grpo` already uses, so the advantage row is recognisable.
if (JSON.stringify(offApi.OFF_REWARDS) !== JSON.stringify([1, 1, 0, 0])) throw new Error("offpolicy-clip: the reward group must stay [1,1,0,0], the lab claims it is the same group as `grpo`");
const offAdv = offApi.offAdvantages();
if (offAdv.adv.length !== offApi.OFF_REWARDS.length) throw new Error("offpolicy-clip: one advantage per response");
if (!(offAdv.adv[0] > 0 && offAdv.adv[3] < 0)) throw new Error("offpolicy-clip: the group must contain both signs of advantage, otherwise the sign branch of equation (58) is untestable");

// Recompute equations (57) and (60) independently of the app and compare every state.
const offRefTerm = (delta, adv, eps, key) => {
  const w = Math.exp(delta), lo = 1 - eps, hi = 1 + eps, clipped = Math.min(Math.max(w, lo), hi);
  if (key === "noclip") return { v: adv * w, masked: false };
  if (key === "symmetric") return { v: adv * clipped, masked: w < lo || w > hi };
  if (key === "positiveOnly") return { v: Math.min(w, hi) * adv, masked: !(w < hi) };
  return { v: Math.min(adv * w, adv * clipped), masked: adv >= 0 ? !(w < hi) : !(w > lo) };
};
for (const drift of offApi.OFF_DRIFTS)
  for (const epsilon of offApi.OFF_EPSILONS)
    for (const variant of offApi.OFF_VARIANTS) {
      const got = offApi.offObjective(drift, epsilon.eps, variant.key);
      let total = 0, masked = 0, tokens = 0;
      drift.rows.forEach((deltas, index) => {
        let sum = 0;
        for (const delta of deltas) {
          const term = offRefTerm(delta, offAdv.adv[index], epsilon.eps, variant.key);
          sum += term.v; tokens++; if (term.masked) masked++;
        }
        total += sum / deltas.length;
      });
      offValues += 2;
      if (!Object.is(got.loss, -total / drift.rows.length)) throw new Error(`offpolicy-clip ${drift.key}/${epsilon.key}/${variant.key}: loss differs from the reference built from equation (57)`);
      if (got.masked !== masked) throw new Error(`offpolicy-clip ${drift.key}/${epsilon.key}/${variant.key}: masked-token count differs from the reference built from equation (60)`);
    }

// The hiding contract of mode A. These two states are the ones a student actually tests.
const offCorrect = offApi.OFF_VARIANTS.find(entry => entry.ok);
const offWrong = offApi.OFF_VARIANTS.filter(entry => !entry.ok);
if (offWrong.length < 3) throw new Error("offpolicy-clip: the lab needs at least three non-correct token-level variants");
const offLoss = (driftKey, epsKey, variantKey) => offApi.offObjective(offApi.OFF_DRIFTS.find(d => d.key === driftKey), offApi.OFF_EPSILONS.find(e => e.key === epsKey).eps, variantKey).loss;
for (const hiding of ["fresh", "mild"])
  for (const variant of offWrong)
    if (offShow(offLoss(hiding, "e20", variant.key)) !== offShow(offLoss(hiding, "e20", offCorrect.key)))
      throw new Error(`offpolicy-clip: state "${hiding}" must hide ${variant.key} - the lab's central claim is that the states you test cannot tell the versions apart`);
for (const exposing of ["mixed", "stale"])
  for (const variant of offWrong)
    if (offShow(offLoss(exposing, "e20", variant.key)) === offShow(offLoss(exposing, "e20", offCorrect.key)))
      throw new Error(`offpolicy-clip: state "${exposing}" must expose ${variant.key}, otherwise no state in the lab separates it`);

// "fresh" is only an honest illustration of the first inner step if every ratio really is one.
const offFresh = offApi.OFF_DRIFTS.find(entry => entry.key === "fresh");
if (offFresh.rows.flat().some(delta => delta !== 0)) throw new Error("offpolicy-clip: the `fresh` state must have every log ratio exactly zero, that is what makes it the first inner step");
if (offApi.offObjective(offFresh, 0.2, offCorrect.key).masked !== 0) throw new Error("offpolicy-clip: nothing may be masked while every ratio is one");

// "mixed" must contain all four combinations of advantage sign and band side, or the sign branch is never tested.
const offMixed = offApi.OFF_DRIFTS.find(entry => entry.key === "mixed");
const offCombos = new Set();
offMixed.rows.forEach((deltas, index) => {
  for (const delta of deltas) {
    const w = Math.exp(delta);
    if (w > 1.2) offCombos.add(`${offAdv.adv[index] >= 0 ? "pos" : "neg"}-above`);
    if (w < 0.8) offCombos.add(`${offAdv.adv[index] >= 0 ? "pos" : "neg"}-below`);
  }
});
for (const combo of ["pos-above", "pos-below", "neg-above", "neg-below"])
  if (!offCombos.has(combo)) throw new Error(`offpolicy-clip: the "mixed" state must contain the case ${combo} at eps=0.2, the lab says all four occur`);

// PPO's default has to remain selectable, the lab names it.
if (!offApi.OFF_EPSILONS.some(entry => entry.eps === 0.2)) throw new Error("offpolicy-clip: eps = 0.2 is the PPO default the lab cites and must stay available");

// ---- GSPO, equation (63)
for (const seq of offApi.OFF_SEQS) {
  const len = seq.deltas.length;
  const want = Math.exp(seq.deltas.reduce((a, b) => a + b, 0) / len);
  offValues++;
  if (!Object.is(offApi.offSeqWeight(seq.deltas, "gspo").weight, want)) throw new Error(`offpolicy-clip ${seq.key}: the correct sequence weight must be the log-space geometric mean`);
}
// The naive product has to be genuinely float32, otherwise the numerical lesson is fiction.
const offProductDecl = sliceDeclaration(source, "offSeqWeight");
if (!offProductDecl.includes("Math.fround")) throw new Error("offpolicy-clip: the product variant must round to float32, that is the entire point of the case at L = 512");
// The hiding contract of mode B, derived rather than asserted per case.
const offSeqHide = (seqKey, variantKey) => offShow(offApi.offSeqWeight(offApi.OFF_SEQS.find(s => s.key === seqKey).deltas, variantKey).weight) === offShow(offApi.offSeqWeight(offApi.OFF_SEQS.find(s => s.key === seqKey).deltas, "gspo").weight);
for (const variantKey of ["product", "arithmetic", "noExponent"])
  if (!offSeqHide("single", variantKey)) throw new Error(`offpolicy-clip: at L = 1 every path must agree, ${variantKey} does not`);
if (offSeqHide("long", "product")) throw new Error("offpolicy-clip: the float32 product must differ at L = 512, otherwise the stability lesson has no evidence");
if (!offSeqHide("uniform", "arithmetic")) throw new Error("offpolicy-clip: with identical deltas the arithmetic mean must equal the geometric one, the Jensen gap is zero there");
if (offSeqHide("mixedSeq", "arithmetic")) throw new Error("offpolicy-clip: with spread deltas the arithmetic mean must differ, that is the Jensen claim");
if (offSeqHide("uniform", "noExponent")) throw new Error("offpolicy-clip: the raw product must already differ at L = 8");

// The denormal stall is the lab's sharpest claim: the intermediate product neither survives nor reaches zero.
const offLong = offApi.OFF_SEQS.find(entry => entry.key === "long");
const offLongRun = offApi.offSeqWeight(offLong.deltas, "product");
if (!(offLongRun.product > 0 && offLongRun.product < 1e-38)) throw new Error("offpolicy-clip: at L = 512 the float32 product must stall inside the denormal range, neither zero nor normal");
// ... and because it stalls, the answer stops depending on the data. Same length, different drift, same result.
const offAltDeltas = offLong.deltas.map((value, index) => value - 0.05 + 0.02 * Math.sin(index));
if (offShow(offApi.offSeqWeight(offAltDeltas, "product").weight) === offShow(offApi.offSeqWeight(offAltDeltas, "gspo").weight)) throw new Error("offpolicy-clip: the naive product must be wrong for the alternative drift too");
if (Math.abs(offApi.offSeqWeight(offAltDeltas, "product").weight - offLongRun.weight) > 0.01) throw new Error("offpolicy-clip: the stalled product must be nearly independent of the deltas, that is what the third check answers");

// The clipping band must actually bind somewhere in GSPO mode, otherwise the eps control is dead.
const offMixedSeq = offApi.OFF_SEQS.find(entry => entry.key === "mixedSeq");
const offBinds = offApi.OFF_EPSILONS.some(entry => offApi.offGspoRow(offMixedSeq, entry.eps, "gspo", offAdv.adv[0]).masked);
if (!offBinds) throw new Error("offpolicy-clip: at least one eps must clip the sequence weight in GSPO mode, otherwise the eps control shows nothing");

// Renderer guards: a number that is computed but never shown teaches nothing.
const offClipRenderer = sliceDeclaration(source, "offClipStage");
for (const required of ["offNumber(100*correct.maskedFrac,1)", "correct.masked", "correct.tokens", "offNumber(report.loss)", "offNumber(t.w,4)", "OFF_VARIANTS.map"])
  if (!offClipRenderer.includes(required)) throw new Error(`offpolicy-clip clip renderer: must stay data-driven and show ${required}`);
const offGspoRenderer = sliceDeclaration(source, "offGspoStage");
for (const required of ["productRun.product.toExponential(4)", "productRun.product<1e-38", "offNumber(row.value)", "row.masked", "OFF_SEQ_VARIANTS.map", "offNumber(1-eps,2)"])
  if (!offGspoRenderer.includes(required)) throw new Error(`offpolicy-clip gspo renderer: must stay data-driven and show ${required}`);

// Registration: the lab has to be reachable from the lecture that teaches clipping and from its mission.
const offLab = base.labs.find(entry => entry.id === "offpolicy-clip");
if (!offLab) throw new Error("offpolicy-clip: lab missing from LABS");
if (offLab.module !== "rlvr") throw new Error("offpolicy-clip: the lab belongs to the rlvr module");
const offLecture = base.lectureGuides.l16;
if (!offLecture.labs.includes("offpolicy-clip")) throw new Error("offpolicy-clip: Lecture 16 teaches `PPO (Clip the ratios at some eps)` and must carry the lab");
const offMission = base.assignments.find(entry => entry.id === "a5").missions.find(entry => entry.id === "off-policy");
if (offMission.labs[0] !== "offpolicy-clip") throw new Error("offpolicy-clip: the lab belongs first in the a5:off-policy mission, it is the one built for it");
if (!source.includes('"checkpoint-segments","shard-ledger","offpolicy-clip"')) throw new Error("offpolicy-clip: the lab must offer an objective short check");
console.log(`offpolicy-clip OK: ${offValues} values, every wrong version hidden on fresh+mild and exposed on mixed+stale, float32 product stalls at ${offLongRun.product.toExponential(4)} and returns ${offShow(offLongRun.weight)} instead of ${offShow(offApi.offSeqWeight(offLong.deltas, "gspo").weight)}`);


// ---------------------------------------------------------------------------
// advantage-normalizers: assignment 5, section 5, equations (34) to (43).
// The lab claims two things that a guard has to hold to: the four settings of
// section 5.4 are indistinguishable on exactly the groups you would test on,
// and each normalizer is a reweighting over prompts rather than a rescaling.
const advNames = ["ADV_EPS", "ADV_LENGTHS", "ADV_MAX_LEN", "ADV_Z", "ADV_GROUPS", "ADV_VARIANTS",
  "ADV_LOSS_NORMS", "ADV_EPS_MODES", "advMean", "advSampleStd", "advAdvantages", "advSeqWeights",
  "advPrunedShare", "ADV_LADDER", "ADV_CONVENTIONS", "advPromptWeight", "advEqualAdvantagePair"];
const advApi = runInNewContext(`${numberPrelude}${advNames.map(name => sliceDeclaration(source, name)).join("\n")}; ({${advNames.join(",")}})`, {});
const advShow = value => (Number.isNaN(value) ? "NaN" : value.toFixed(6));
let advValues = 0;

// The setup the lab claims: one prompt, G = 8 binary rollouts, Z = B*G*L.
if (advApi.ADV_LENGTHS.length !== 8) throw new Error("advantage-normalizers: the group must hold G = 8 rollouts, the lab prints that number everywhere");
if (advApi.ADV_Z !== advApi.ADV_LENGTHS.length * advApi.ADV_MAX_LEN) throw new Error("advantage-normalizers: Z must stay B*G*L with B = 1, that is the constant the handout defines");
if (advApi.ADV_MAX_LEN !== 512) throw new Error("advantage-normalizers: the handout fixes the max generation length at 512");
if (advApi.ADV_EPS !== 1e-6) throw new Error("advantage-normalizers: advantage_eps must stay 1e-6, the transfer answer quotes numbers computed with it");
if (advApi.ADV_LENGTHS[1] / advApi.ADV_LENGTHS[0] !== 5) throw new Error("advantage-normalizers: response 2 must be exactly five times response 1, the third short-check answer is that factor");
for (const group of advApi.ADV_GROUPS) {
  if (group.rewards.length !== advApi.ADV_LENGTHS.length) throw new Error(`advantage-normalizers ${group.key}: one reward per response`);
  if (group.rewards.some(reward => reward !== 0 && reward !== 1)) throw new Error(`advantage-normalizers ${group.key}: A5 rewards are binary`);
}

// Section 5.4 lists the four settings verbatim; the triples may not drift.
const advExpectedSettings = { grpo: ["mean", "std"], drgrpo: ["mean", "none"], rft: ["none", "none"], maxrl: ["mean", "mean"] };
if (advApi.ADV_VARIANTS.length !== 4) throw new Error("advantage-normalizers: section 5.4 defines exactly four settings");
for (const variant of advApi.ADV_VARIANTS) {
  const want = advExpectedSettings[variant.key];
  if (!want) throw new Error(`advantage-normalizers: unknown variant ${variant.key}`);
  if (variant.baseline !== want[0] || variant.normalizer !== want[1])
    throw new Error(`advantage-normalizers ${variant.key}: section 5.4 fixes baseline="${want[0]}" and advantage_normalizer="${want[1]}"`);
}

// Recompute equations (34) to (37) independently and compare every state.
const advRefMean = values => values.reduce((a, b) => a + b, 0) / values.length;
const advRefStd = values => {
  const m = advRefMean(values);
  return Math.sqrt(values.reduce((sum, value) => sum + (value - m) ** 2, 0) / (values.length - 1));
};
const advRefAdvantages = (rewards, key, eps) => {
  const [baselineKind, normalizerKind] = advExpectedSettings[key];
  const mu = advRefMean(rewards);
  const b = baselineKind === "mean" ? mu : 0;
  const c = normalizerKind === "std" ? advRefStd(rewards) + eps : normalizerKind === "mean" ? mu + eps : 1;
  return rewards.map(reward => (reward - b) / c);
};
for (const group of advApi.ADV_GROUPS)
  for (const epsMode of advApi.ADV_EPS_MODES)
    for (const variant of advApi.ADV_VARIANTS) {
      const got = advApi.advAdvantages(group.rewards, variant.key, epsMode.eps);
      const want = advRefAdvantages(group.rewards, variant.key, epsMode.eps);
      got.adv.forEach((value, index) => {
        advValues++;
        if (!Object.is(value, want[index]))
          throw new Error(`advantage-normalizers ${group.key}/${variant.key}/${epsMode.key}: advantage ${index} is ${value}, the reference from section 5 says ${want[index]}`);
      });
      for (const lossNorm of advApi.ADV_LOSS_NORMS) {
        const weights = advApi.advSeqWeights(got.adv, lossNorm.key);
        weights.forEach((weight, index) => {
          advValues++;
          const reference = lossNorm.key === "constant"
            ? got.adv[index] * advApi.ADV_LENGTHS[index] / advApi.ADV_Z
            : got.adv[index] / got.adv.length;
          if (!Object.is(weight, reference))
            throw new Error(`advantage-normalizers ${group.key}/${variant.key}/${lossNorm.key}: sequence weight ${index} differs from the reference`);
        });
      }
    }

// The central claim: the group you test on decides whether the settings differ at all.
const advSignature = (groupKey, variantKey) =>
  advApi.advAdvantages(advApi.ADV_GROUPS.find(entry => entry.key === groupKey).rewards, variantKey, advApi.ADV_EPS).adv.map(advShow).join("|");
const advDistinct = groupKey => new Set(advApi.ADV_VARIANTS.map(variant => advSignature(groupKey, variant.key))).size;
if (advDistinct("allWrong") !== 1)
  throw new Error("advantage-normalizers: on the all-wrong group all four settings must agree exactly, that is the first short-check answer");
if (advDistinct("allRight") !== 2)
  throw new Error("advantage-normalizers: on the all-correct group exactly RFT may differ, three of four settings see no signal");
if (advSignature("allRight", "rft") === advSignature("allRight", "grpo"))
  throw new Error("advantage-normalizers: RFT must still learn on the all-correct group, that is the lecture-16 question about learning from positives only");
for (const groupKey of ["hard", "mixed", "easy"])
  if (advDistinct(groupKey) !== 4)
    throw new Error(`advantage-normalizers ${groupKey}: a mixed group must separate all four settings, otherwise no state in the lab does`);

// Equation (43) against (41): dividing by mu is what actually reweights by difficulty.
const advAt = (groupKey, variantKey, index) =>
  advApi.advAdvantages(advApi.ADV_GROUPS.find(entry => entry.key === groupKey).rewards, variantKey, advApi.ADV_EPS).adv[index];
if (!(advAt("hard", "maxrl", 1) > advAt("hard", "grpo", 1) && advAt("hard", "grpo", 1) > advAt("hard", "drgrpo", 1)))
  throw new Error("advantage-normalizers: on the hard group MaxRL must exceed GRPO must exceed Dr. GRPO at the one correct response");
if (advShow(advAt("hard", "grpo", 1)) !== advShow(-advAt("easy", "grpo", 0)))
  throw new Error("advantage-normalizers: the GRPO magnitude at the minority response must mirror between eta = 1/8 and eta = 7/8, the lab tells the reader to check exactly that");
if (advShow(advAt("hard", "maxrl", 1)) === advShow(-advAt("easy", "maxrl", 0)))
  throw new Error("advantage-normalizers: MaxRL must not mirror, it is the only normalizer that is monotone in difficulty");

// Section 5.4 pruning: a zero advantage carries no gradient.
const advPruned = (groupKey, variantKey) =>
  advApi.advPrunedShare(advApi.advAdvantages(advApi.ADV_GROUPS.find(entry => entry.key === groupKey).rewards, variantKey, advApi.ADV_EPS).adv);
if (advPruned("hard", "rft") !== 7 / 8) throw new Error("advantage-normalizers: RFT must prune 87.5 % of the hard group, the transfer answer quotes that number");
if (advPruned("allRight", "rft") !== 0) throw new Error("advantage-normalizers: RFT prunes nothing when every rollout is correct");
for (const variantKey of ["grpo", "drgrpo", "maxrl"])
  for (const groupKey of ["allWrong", "allRight"])
    if (advPruned(groupKey, variantKey) !== 1)
      throw new Error(`advantage-normalizers ${groupKey}/${variantKey}: a uniform group must prune completely under baseline="mean"`);

// advantage_eps: it may change nothing except turning 0/0 into a finite zero.
const advNaNs = (groupKey, variantKey, eps) =>
  advApi.advAdvantages(advApi.ADV_GROUPS.find(entry => entry.key === groupKey).rewards, variantKey, eps).adv.filter(Number.isNaN).length;
for (const group of advApi.ADV_GROUPS)
  for (const variant of advApi.ADV_VARIANTS)
    if (advNaNs(group.key, variant.key, advApi.ADV_EPS) !== 0)
      throw new Error(`advantage-normalizers ${group.key}/${variant.key}: with the guard term nothing may be NaN`);
if (advNaNs("allWrong", "grpo", 0) !== 8 || advNaNs("allWrong", "maxrl", 0) !== 8)
  throw new Error("advantage-normalizers: without the guard term the all-wrong group must produce NaN, that is why the handout requires advantage_eps");
if (advNaNs("allRight", "grpo", 0) !== 8) throw new Error("advantage-normalizers: without the guard term a zero std must produce NaN on the all-correct group too");
if (advNaNs("allRight", "maxrl", 0) !== 0) throw new Error("advantage-normalizers: dividing by mu = 1 is finite, only the std vanishes on the all-correct group");
for (const groupKey of ["hard", "mixed", "easy"])
  for (const variantKey of ["grpo", "maxrl"])
    if (advNaNs(groupKey, variantKey, 0) !== 0)
      throw new Error(`advantage-normalizers ${groupKey}/${variantKey}: the guard term must be irrelevant wherever the denominator is nonzero`);

// think_about_length_normalization: the whole difference is the token count, and
// the pair being compared must really share an advantage - on a skewed group the
// first two responses do not, which is why the pair is picked from the data.
for (const group of advApi.ADV_GROUPS) {
  const adv = advApi.advAdvantages(group.rewards, "drgrpo", advApi.ADV_EPS).adv;
  const pair = advApi.advEqualAdvantagePair(adv);
  const uniform = new Set(group.rewards).size === 1;
  if (uniform) {
    if (pair) throw new Error(`advantage-normalizers ${group.key}: a uniform group has no nonzero advantage, so no length pair may be claimed`);
    continue;
  }
  if (!pair) throw new Error(`advantage-normalizers ${group.key}: a mixed group must offer two responses of different length with the same nonzero advantage, otherwise the length line has nothing to stand on`);
  if (adv[pair.short] !== adv[pair.long] || adv[pair.short] === 0)
    throw new Error(`advantage-normalizers ${group.key}: the pair the lab prints must really share a nonzero advantage`);
  if (advApi.ADV_LENGTHS[pair.long] <= advApi.ADV_LENGTHS[pair.short])
    throw new Error(`advantage-normalizers ${group.key}: the second member of the pair must be the longer response`);
  const constant = advApi.advSeqWeights(adv, "constant"), sequence = advApi.advSeqWeights(adv, "sequence");
  advValues += 2;
  if (constant[pair.long] / constant[pair.short] !== 5)
    throw new Error(`advantage-normalizers ${group.key}: with a constant Z the long response must weigh exactly five times the short one`);
  if (sequence[pair.long] / sequence[pair.short] !== 1)
    throw new Error(`advantage-normalizers ${group.key}: with the sequence mean both responses must weigh exactly the same, that is what cancels the length`);
}

// derive_difficulty_reweightings, equations (41) to (43) with Z = G and G to infinity.
for (const convention of advApi.ADV_CONVENTIONS)
  for (const eta of advApi.ADV_LADDER) {
    advValues += 3;
    if (advApi.advPromptWeight(eta, "none", convention.size) !== 1)
      throw new Error("advantage-normalizers: Dr. GRPO must reweight nothing, its answer to (a) is w = 1");
    if (!Object.is(advApi.advPromptWeight(eta, "mean", convention.size), 1 / eta))
      throw new Error("advantage-normalizers: the MaxRL weight must be exactly 1/eta, that is the answer to (c)");
    const population = 1 / Math.sqrt(eta * (1 - eta));
    const want = convention.size === Infinity ? population : population / Math.sqrt(convention.size / (convention.size - 1));
    if (!Object.is(advApi.advPromptWeight(eta, "std", convention.size), want))
      throw new Error("advantage-normalizers: the GRPO weight must be 1/std, that is the answer to (b)");
  }
for (const convention of advApi.ADV_CONVENTIONS) {
  if (advShow(advApi.advPromptWeight(0.125, "std", convention.size)) !== advShow(advApi.advPromptWeight(0.875, "std", convention.size)))
    throw new Error("advantage-normalizers: 1/std must be mirror-symmetric in eta, that is the second short-check answer");
  if (advApi.advPromptWeight(0.125, "mean", convention.size) / advApi.advPromptWeight(0.875, "mean", convention.size) !== 7)
    throw new Error("advantage-normalizers: MaxRL must weigh the hard group exactly seven times the easy one");
  const weights = advApi.ADV_LADDER.map(eta => advApi.advPromptWeight(eta, "std", convention.size));
  if (Math.min(...weights) !== weights[advApi.ADV_LADDER.indexOf(0.5)])
    throw new Error("advantage-normalizers: 1/std must be smallest at eta = 0.5, the lab claims it penalises the groups with the most signal");
}
// The convention cancels in the relative column, which is why the derivation may use either.
for (const eta of advApi.ADV_LADDER) {
  const relative = advApi.ADV_CONVENTIONS.map(convention =>
    advApi.advPromptWeight(eta, "std", convention.size) / advApi.advPromptWeight(0.5, "std", convention.size));
  if (advShow(relative[0]) !== advShow(relative[1]))
    throw new Error("advantage-normalizers: sample and population std may differ only by a constant factor, the lab claims it cancels in the relative column");
}
for (const eta of advApi.ADV_LADDER)
  if (!advApi.ADV_LADDER.some(other => Math.abs(other + eta - 1) < 1e-12))
    throw new Error(`advantage-normalizers: the ladder must be symmetric about eta = 0.5, ${eta} has no mirror row and the symmetry claim would have nothing to point at`);
for (const eta of [0.125, 0.875])
  if (!advApi.ADV_LADDER.includes(eta))
    throw new Error(`advantage-normalizers: eta = ${eta} must stay in the ladder, both the short check and the transfer answer name it`);
if (advApi.ADV_CONVENTIONS.find(entry => entry.key === "sample").size !== 8)
  throw new Error("advantage-normalizers: the finite convention must be the G = 8 the variant mode computes with");

// Renderer guards: a number that is computed but never shown teaches nothing.
const advVariantRenderer = sliceDeclaration(source, "advVariantStage");
for (const required of ["advNumber(100*report.pruned,1)", "advNumber(report.weights[0],8)", "advNumber(report.weights[1],8)",
  "advNumber(report.run.normalizer,6)", "advNumber(grpoRun.std,6)", "ADV_VARIANTS.map", "tr(report.variant.verdict)",
  "advNumber(grpoRun.adv[minorityIndex])", "advNumber(lengthRatio.weights[lengthPair.long]/lengthRatio.weights[lengthPair.short],4)", "advEqualAdvantagePair(lengthRatio.run.adv)", "${nanCount?`<br><strong>"])
  if (!advVariantRenderer.includes(required)) throw new Error(`advantage-normalizers variant renderer: must stay data-driven and show ${required}`);
const advWeightRenderer = sliceDeclaration(source, "advWeightStage");
for (const required of ["advPromptWeight(eta,column.key,size)", "advNumber(weight/refWeights[index],3)", "ADV_LADDER.map",
  "advNumber(symmetricLow)", "advNumber(symmetricHigh)", "advNumber(maxLow,4)", "advNumber(maxHigh,4)", "advNumber(factor)"])
  if (!advWeightRenderer.includes(required)) throw new Error(`advantage-normalizers weight renderer: must stay data-driven and show ${required}`);
// Every verdict, label, and hint the data carries has to reach the screen.
const advPanel = source.slice(source.indexOf('if(id==="advantage-normalizers") return'), source.indexOf('if(id==="shard-ledger") return'));
for (const required of ["ADV_GROUPS.map", "ADV_LOSS_NORMS.map", "ADV_EPS_MODES.map", "ADV_LADDER.map", "ADV_CONVENTIONS.map"])
  if (!advPanel.includes(required)) throw new Error(`advantage-normalizers panel: the control ${required} must be built from the data`);
if (!advVariantRenderer.includes("tr(group.hint)")) throw new Error("advantage-normalizers: every group hint must be rendered, otherwise it is dead data");

// Registration: reachable from the lectures that name these variants and from its mission.
const advLab = base.labs.find(entry => entry.id === "advantage-normalizers");
if (!advLab) throw new Error("advantage-normalizers: lab missing from LABS");
if (advLab.module !== "rlvr") throw new Error("advantage-normalizers: the lab belongs to the rlvr module");
if (!base.modules.find(entry => entry.id === "rlvr").labs.includes("advantage-normalizers")) throw new Error("advantage-normalizers: the rlvr module must list the lab");
if (!base.lectureGuides.l16.labs.includes("advantage-normalizers")) throw new Error("advantage-normalizers: Lecture 16 compares GRPO variants by baseline, normalizer, and denominator and must carry the lab");
if (!base.lectureGuides.l17.labs.includes("advantage-normalizers")) throw new Error("advantage-normalizers: Lecture 17 names Dr. GRPO for exactly this normalization and must carry the lab");
const advMission = base.assignments.find(entry => entry.id === "a5").missions.find(entry => entry.id === "variants");
if (advMission.labs[0] !== "advantage-normalizers") throw new Error("advantage-normalizers: the lab belongs first in the a5:variants mission, the other three are borrowed");
if (!sliceDeclaration(source, "OBJECTIVE_LAB_IDS").includes('"advantage-normalizers"')) throw new Error("advantage-normalizers: the lab must offer an objective short check");
for (const key of ["Vier Varianten auf denselben acht Rollouts", "Welches Gewicht jeder Normalisierer einem Prompt gibt",
  "Die Std ist symmetrisch, das Gruppenmittel nicht", "Warum die Konvention die Antwort nicht ändert", "Was der Loss-Nenner mit der Länge macht"])
  if (typeof pack.ui?.[key] !== "string" || !pack.ui[key].trim() || pack.ui[key] === key)
    throw new Error(`ui.${key}: English translation is missing for the advantage-normalizers lab`);
console.log(`advantage-normalizers OK: ${advValues} values, all four settings identical on the all-wrong group and distinct on every mixed one, GRPO weighs eta=0.125 and eta=0.875 alike at ${advShow(advApi.advPromptWeight(0.125, "std", Infinity))} while MaxRL splits them 8 to ${advApi.advPromptWeight(0.875, "mean", Infinity).toFixed(4)}`);

// microbatch-denominator: assignment 5, sections 4.2.3 and 4.2.4. The lab makes three
// claims a guard has to hold to: at k = 1 every scale rule collapses to the same number,
// the correct rule is a property of the pair (rule, loss_normalization) and not of the
// rule alone, and an uneven split stops being a rescaling and destroys the baseline.
const mbdNames = ["MBD_BATCH", "MBD_GROUP_SIZE", "MBD_MAX_LEN", "MBD_Z", "MBD_SEQ", "MBD_SPLITS",
  "MBD_RULES", "MBD_NORMS", "mbdTokenSum", "mbdSeqMean", "mbdAggregate", "mbdScale",
  "mbdWholeBatch", "mbdWeights", "mbdAccumulated", "mbdUniformFactor", "mbdGroupDrift"];
const mbdApi = runInNewContext(`${numberPrelude}${mbdNames.map(name => sliceDeclaration(source, name)).join("\n")}; ({${mbdNames.join(",")}})`, {});
const mbdShow = value => (Number.isNaN(value) ? "NaN" : value.toFixed(10));
let mbdValues = 0;

// The setup the lab prints everywhere: B = n_prompts * group_size, Z = B*G*L with L = 512.
if (mbdApi.MBD_SEQ.length !== mbdApi.MBD_BATCH) throw new Error("microbatch-denominator: one entry per response in the rollout batch");
if (mbdApi.MBD_BATCH !== 8 || mbdApi.MBD_GROUP_SIZE !== 4) throw new Error("microbatch-denominator: the lab states two prompts with G = 4 rollouts each, so B = 8");
if (mbdApi.MBD_MAX_LEN !== 512) throw new Error("microbatch-denominator: the handout fixes the max generation length at 512");
if (mbdApi.MBD_Z !== mbdApi.MBD_BATCH * mbdApi.MBD_MAX_LEN) throw new Error("microbatch-denominator: Z must stay B*G*L, that is the constant the handout defines");
if (mbdApi.MBD_Z !== 4096) throw new Error("microbatch-denominator: the panel prints Z = 4096, the short-check answer names it");
{
  const prompts = [...new Set(mbdApi.MBD_SEQ.map(seq => seq.prompt))];
  if (prompts.length !== mbdApi.MBD_BATCH / mbdApi.MBD_GROUP_SIZE) throw new Error("microbatch-denominator: the batch must hold exactly B/G prompt groups");
  for (const prompt of prompts) {
    const members = mbdApi.MBD_SEQ.filter(seq => seq.prompt === prompt);
    if (members.length !== mbdApi.MBD_GROUP_SIZE) throw new Error(`microbatch-denominator: prompt ${prompt} must carry G = ${mbdApi.MBD_GROUP_SIZE} rollouts`);
    // baseline="mean" is the entire premise of the baseline mode.
    if (members.reduce((sum, seq) => sum + seq.A, 0) !== 0)
      throw new Error(`microbatch-denominator: the advantages of prompt ${prompt} must sum to exactly zero, otherwise the baseline mode has nothing to lose`);
    if (new Set(members.map(seq => seq.A)).size !== members.length)
      throw new Error(`microbatch-denominator: prompt ${prompt} needs G distinct advantages, equal ones would hide a reweighting`);
  }
  if (new Set(mbdApi.MBD_SEQ.map(seq => seq.n)).size < 3)
    throw new Error("microbatch-denominator: the responses must differ in length, otherwise sequence and constant normalisation cannot come apart");
}
// Every split must cover the batch exactly once, and the two ragged ones must really be ragged.
for (const split of mbdApi.MBD_SPLITS) {
  const flat = split.groups.flat();
  if (flat.length !== mbdApi.MBD_BATCH || new Set(flat).size !== mbdApi.MBD_BATCH)
    throw new Error(`microbatch-denominator ${split.key}: every response must sit in exactly one microbatch`);
  if (flat.some(index => index < 0 || index >= mbdApi.MBD_BATCH)) throw new Error(`microbatch-denominator ${split.key}: index out of range`);
}
{
  const sizes = key => mbdApi.MBD_SPLITS.find(split => split.key === key).groups.map(group => group.length);
  const even = mbdApi.MBD_SPLITS.filter(split => new Set(split.groups.map(group => group.length)).size === 1);
  const ragged = mbdApi.MBD_SPLITS.filter(split => new Set(split.groups.map(group => group.length)).size > 1);
  if (even.length !== 4) throw new Error("microbatch-denominator: the lab needs the four even splits k = 1, 2, 4, 8, they are where a wrong rule is a pure factor");
  if (ragged.length !== 2) throw new Error("microbatch-denominator: the lab needs exactly two uneven splits, one in batch order and one sorted by length");
  if (sizes("k1").join() !== "8") throw new Error("microbatch-denominator: k1 must be the single microbatch a unit test uses");
  for (const key of ["k3", "k3sorted"])
    if (sizes(key).join() !== "3,3,2") throw new Error(`microbatch-denominator ${key}: both uneven splits must carry the same sizes 3,3,2 so that only the membership differs`);
  // The length-sorted split must actually be sorted by response length, otherwise its
  // claim -- the boundaries now cut through both prompt groups -- is unearned.
  const sorted = mbdApi.MBD_SPLITS.find(split => split.key === "k3sorted").groups.flat();
  const lengths = sorted.map(index => mbdApi.MBD_SEQ[index].n);
  if (lengths.some((value, index) => index > 0 && value < lengths[index - 1]))
    throw new Error("microbatch-denominator k3sorted: the responses must be in non-decreasing length order, that is what the label claims");
  for (const key of ["k3", "k3sorted"]) {
    const split = mbdApi.MBD_SPLITS.find(entry => entry.key === key);
    const cut = split.groups.some(group => new Set(group.map(index => mbdApi.MBD_SEQ[index].prompt)).size > 1)
      || split.groups.filter(group => group.some(index => mbdApi.MBD_SEQ[index].prompt === 0)).length > 1;
    if (!cut) throw new Error(`microbatch-denominator ${key}: an uneven split has to cut a prompt group, otherwise no baseline can break`);
  }
}
if (mbdApi.MBD_RULES.length !== 3 || mbdApi.MBD_NORMS.length !== 2)
  throw new Error("microbatch-denominator: three scale rules against the two loss_normalization settings, that is the whole grid");
if (!mbdApi.MBD_RULES.some(rule => rule.key === "share" && /len\(inputs_microbatch\)/u.test(rule.label)))
  throw new Error("microbatch-denominator: the handout's own line has to appear verbatim as one of the three rules");

// The scale rules themselves, straight from section 4.2.4.
for (const split of mbdApi.MBD_SPLITS)
  for (const group of split.groups) {
    if (mbdApi.mbdScale("share", group.length, split.groups.length) !== group.length / mbdApi.MBD_BATCH)
      throw new Error("microbatch-denominator: the share rule must be len(microbatch)/len(batch)");
    if (mbdApi.mbdScale("steps", group.length, split.groups.length) !== 1 / split.groups.length)
      throw new Error("microbatch-denominator: the steps rule must be 1/gradient_accumulation_steps");
    if (mbdApi.mbdScale("none", group.length, split.groups.length) !== 1)
      throw new Error("microbatch-denominator: the unscaled rule must not scale");
  }

// The grid, against a reference written from the two aggregation definitions.
const mbdRefTokenSum = seq => -seq.A * seq.P;
const mbdRefAggregate = (indices, normKey) => normKey === "sequence"
  ? indices.reduce((sum, j) => sum + mbdRefTokenSum(mbdApi.MBD_SEQ[j]) / mbdApi.MBD_SEQ[j].n, 0) / indices.length
  : indices.reduce((sum, j) => sum + mbdRefTokenSum(mbdApi.MBD_SEQ[j]), 0) / mbdApi.MBD_Z;
const mbdRefScale = (ruleKey, size, k) => ruleKey === "share" ? size / mbdApi.MBD_BATCH : ruleKey === "steps" ? 1 / k : 1;
const mbdRefWeights = (normKey, ruleKey, groups) => {
  const out = new Array(mbdApi.MBD_BATCH);
  for (const group of groups) {
    const c = mbdRefScale(ruleKey, group.length, groups.length);
    for (const j of group) out[j] = normKey === "sequence" ? c * mbdApi.MBD_BATCH / group.length : c;
  }
  return out;
};
const mbdRefAccumulated = (normKey, ruleKey, groups) =>
  groups.reduce((sum, group) => sum + mbdRefScale(ruleKey, group.length, groups.length) * mbdRefAggregate(group, normKey), 0);
const mbdCorrect = { sequence: "share", constant: "none" };
const mbdSeen = {};
for (const norm of mbdApi.MBD_NORMS)
  for (const split of mbdApi.MBD_SPLITS)
    for (const rule of mbdApi.MBD_RULES) {
      const weights = mbdApi.mbdWeights(norm.key, rule.key, split.groups);
      const want = mbdRefWeights(norm.key, rule.key, split.groups);
      weights.forEach((value, index) => {
        mbdValues++;
        if (!Object.is(value, want[index]))
          throw new Error(`microbatch-denominator ${norm.key}/${split.key}/${rule.key}: weight ${index} is ${value}, the reference says ${want[index]}`);
      });
      const accumulated = mbdApi.mbdAccumulated(norm.key, rule.key, split.groups);
      mbdValues++;
      if (mbdShow(accumulated) !== mbdShow(mbdRefAccumulated(norm.key, rule.key, split.groups)))
        throw new Error(`microbatch-denominator ${norm.key}/${split.key}/${rule.key}: the accumulated loss differs from the reference`);
      // The weights are the gradient. If they do not rebuild the accumulated scalar, the
      // whole lab -- which reads correctness off the weights -- is talking about nothing.
      const rebuilt = weights.reduce((sum, weight, j) => {
        const seq = mbdApi.MBD_SEQ[j];
        return sum + weight * (norm.key === "sequence" ? 1 / (mbdApi.MBD_BATCH * seq.n) : 1 / mbdApi.MBD_Z) * mbdRefTokenSum(seq);
      }, 0);
      if (mbdShow(rebuilt) !== mbdShow(accumulated))
        throw new Error(`microbatch-denominator ${norm.key}/${split.key}/${rule.key}: the per-response weights do not reproduce the accumulated loss, so they are not the gradient`);
      const exact = mbdShow(accumulated) === mbdShow(mbdApi.mbdWholeBatch(norm.key));
      const uniformOne = weights.every(value => value === 1);
      if (exact !== uniformOne)
        throw new Error(`microbatch-denominator ${norm.key}/${split.key}/${rule.key}: equality with the whole batch and w = 1 everywhere must be the same statement`);
      mbdSeen[`${norm.key}/${split.key}/${rule.key}`] = { weights, accumulated, exact, factor: mbdApi.mbdUniformFactor(weights) };
    }
// Claim 1: at k = 1 nothing can be told apart. This is what makes the unit test blind.
for (const norm of mbdApi.MBD_NORMS) {
  const values = mbdApi.MBD_RULES.map(rule => mbdShow(mbdSeen[`${norm.key}/k1/${rule.key}`].accumulated));
  if (new Set(values).size !== 1)
    throw new Error(`microbatch-denominator ${norm.key}: at k = 1 all three rules must return the same number, that is the first short-check answer`);
  if (!mbdSeen[`${norm.key}/k1/${mbdApi.MBD_RULES[0].key}`].exact)
    throw new Error(`microbatch-denominator ${norm.key}: at k = 1 that shared number must be the whole-batch loss`);
}
// Claim 2: correctness belongs to the pair, not to the rule. Each normalisation has exactly
// one rule that survives every split, and the two normalisations disagree about which.
for (const norm of mbdApi.MBD_NORMS) {
  const always = mbdApi.MBD_RULES.filter(rule => mbdApi.MBD_SPLITS.every(split => mbdSeen[`${norm.key}/${split.key}/${rule.key}`].exact));
  if (always.length !== 1 || always[0].key !== mbdCorrect[norm.key])
    throw new Error(`microbatch-denominator ${norm.key}: exactly one rule may be correct on every split, and it must be "${mbdCorrect[norm.key]}"`);
}
if (mbdCorrect.sequence === mbdCorrect.constant)
  throw new Error("microbatch-denominator: the two normalisations must require different rules, otherwise the second short-check question is empty");
// The handout's own line, applied under a constant Z, must be wrong by exactly the factor k.
for (const split of mbdApi.MBD_SPLITS) {
  const k = split.groups.length;
  const state = mbdSeen[`constant/${split.key}/share`];
  const expected = split.groups.every(group => group.length === mbdApi.MBD_BATCH / k) ? 1 / k : null;
  if (expected !== null && state.factor !== expected)
    throw new Error(`microbatch-denominator constant/${split.key}/share: the handout line must be off by exactly 1/k = ${expected}, that is the second short-check answer`);
}
// Claim 3: on an even split every wrong rule is a plain factor; on an uneven one the
// sequence rules stop being a factor at all.
for (const split of mbdApi.MBD_SPLITS) {
  const evenSplit = new Set(split.groups.map(group => group.length)).size === 1;
  for (const norm of mbdApi.MBD_NORMS)
    for (const rule of mbdApi.MBD_RULES) {
      const state = mbdSeen[`${norm.key}/${split.key}/${rule.key}`];
      if (evenSplit && state.factor === null)
        throw new Error(`microbatch-denominator ${norm.key}/${split.key}/${rule.key}: on an even split every rule must stay a uniform factor`);
    }
  if (!evenSplit) {
    if (mbdSeen[`sequence/${split.key}/steps`].factor !== null)
      throw new Error(`microbatch-denominator sequence/${split.key}/steps: on an uneven split dividing by k must stop being a uniform factor, the third short-check answer rests on it`);
    if (mbdSeen[`sequence/${split.key}/none`].factor !== null)
      throw new Error(`microbatch-denominator sequence/${split.key}/none: on an uneven split the unscaled rule must stop being a uniform factor`);
    if (mbdSeen[`constant/${split.key}/share`].factor !== null)
      throw new Error(`microbatch-denominator constant/${split.key}/share: on an uneven split the share rule must stop being a uniform factor`);
    // Dividing by k does not depend on the microbatch size, so under a constant Z it stays
    // a clean rescaling even here. The lab must not claim otherwise.
    if (mbdSeen[`constant/${split.key}/steps`].factor !== 1 / split.groups.length)
      throw new Error(`microbatch-denominator constant/${split.key}/steps: dividing by k must remain the uniform factor 1/k even on an uneven split`);
  }
}
if (mbdSeen["sequence/k2/none"].factor !== 2 || mbdSeen["sequence/k4/none"].factor !== 4 || mbdSeen["sequence/k8/none"].factor !== 8)
  throw new Error("microbatch-denominator: leaving the microbatch loss unscaled must multiply the sequence gradient by exactly k");
// The baseline mode. A uniform weight vector cannot break the identity; a non-uniform one
// inside a prompt group must, and the lab shows exactly that residual.
for (const norm of mbdApi.MBD_NORMS)
  for (const split of mbdApi.MBD_SPLITS)
    for (const rule of mbdApi.MBD_RULES) {
      const state = mbdSeen[`${norm.key}/${split.key}/${rule.key}`];
      const drifts = mbdApi.mbdGroupDrift(state.weights);
      if (drifts.length !== mbdApi.MBD_BATCH / mbdApi.MBD_GROUP_SIZE) throw new Error("microbatch-denominator: one drift row per prompt group");
      for (const entry of drifts) {
        mbdValues++;
        const want = mbdApi.MBD_SEQ.reduce((sum, seq, j) => sum + (seq.prompt === entry.prompt ? state.weights[j] * seq.A : 0), 0);
        if (mbdShow(entry.drift) !== mbdShow(want)) throw new Error(`microbatch-denominator ${norm.key}/${split.key}/${rule.key}: drift of group ${entry.prompt} differs from the reference`);
        if (entry.plain !== 0) throw new Error("microbatch-denominator: without accumulation every group must sum to zero, that is what baseline=\"mean\" guarantees");
      }
      const broken = drifts.filter(entry => entry.drift.toFixed(6) !== "0.000000").length;
      if (state.factor !== null && broken !== 0)
        throw new Error(`microbatch-denominator ${norm.key}/${split.key}/${rule.key}: a uniform weight vector may never break the baseline, it only rescales`);
      if (state.factor === null && broken === 0)
        throw new Error(`microbatch-denominator ${norm.key}/${split.key}/${rule.key}: a non-uniform weight vector must break at least one group, otherwise the baseline mode shows nothing`);
    }
// The two uneven splits have to break different groups -- that is the point of showing both.
{
  const affected = key => mbdApi.mbdGroupDrift(mbdSeen[`sequence/${key}/steps`].weights)
    .filter(entry => entry.drift.toFixed(6) !== "0.000000").map(entry => entry.prompt).join();
  if (affected("k3") === affected("k3sorted"))
    throw new Error("microbatch-denominator: batch order and length order must break different prompt groups, otherwise the second uneven split is decoration");
  if (affected("k3") !== "1") throw new Error("microbatch-denominator k3: in batch order only the second prompt group may straddle a boundary");
  if (affected("k3sorted") !== "0,1") throw new Error("microbatch-denominator k3sorted: sorting by length must break both prompt groups");
}

// Renderer guards: a number that is computed but never shown teaches nothing.
const mbdLedgerRenderer = sliceDeclaration(source, "mbdLedgerStage");
for (const required of ["aggregate = ${mbdNumber(aggregate,8)}", "c = ${mbdNumber(c,6)}", "${tr(\"Beitrag\")} = ${mbdNumber(c*aggregate,8)}",
  "<strong>${mbdNumber(report.accumulated,10)}</strong>", "<strong>${mbdNumber(report.reference,10)}</strong>",
  "<strong>${mbdNumber(report.ratio,8)}</strong>", "<strong>${report.factor===null?tr(\"keiner\"):mbdNumber(report.factor,6)}</strong>",
  "<strong>w = ${mbdNumber(weights[j],6)}</strong>", "ℓ = ${mbdNumber(mbdSeqMean(seq),6)}",
  "split.groups.map", "MBD_SEQ.map", "${tr(split.hint)}", "${tr(rule.source)}", "<span>${tr(verdict)}</span>"])
  if (!mbdLedgerRenderer.includes(required)) throw new Error(`microbatch-denominator ledger renderer: must stay data-driven and show ${required}`);
const mbdBaselineRenderer = sliceDeclaration(source, "mbdBaselineStage");
for (const required of ["<strong>Σ w·A = ${mbdNumber(entry.drift,6)}</strong>", "Σ A = ${mbdNumber(entry.plain,6)}",
  "mbdNumber(weights[item.j],6)", "${esc(terms)}", "drifts.map",
  "<strong>${broken.length} ${tr(\"von\")} ${drifts.length}</strong>",
  "<strong>${worst===null?mbdNumber(0,6):mbdNumber(worst.drift,6)}</strong>",
  "G = ${MBD_GROUP_SIZE}", "<span>${tr(verdict)}</span>"])
  if (!mbdBaselineRenderer.includes(required)) throw new Error(`microbatch-denominator baseline renderer: must stay data-driven and show ${required}`);
// Both stages must be reachable, and every label the data carries has to reach the screen.
const mbdStageSwitch = sliceDeclaration(source, "mbdStageMarkup");
if (!/mbdMode.*baseline.*mbdBaselineStage\(values\).*mbdLedgerStage\(values\)/su.test(mbdStageSwitch))
  throw new Error("microbatch-denominator: the mode selector must reach both stages");
const mbdPanel = source.slice(source.indexOf('if(id==="microbatch-denominator") return'), source.indexOf('if(id==="advantage-normalizers") return'));
for (const required of ["MBD_NORMS.map", "MBD_SPLITS.map", "MBD_RULES.map", "id=\"mbdMode\"", "id=\"mbdStage\"", "id=\"mbdCheck\""])
  if (!mbdPanel.includes(required)) throw new Error(`microbatch-denominator panel: must build ${required} from the data`);
// The short check has to be answerable and has to persist, like every other objective lab.
const mbdCheckSource = sliceDeclaration(source, "checkMicrobatchDenominator");
for (const required of ['single==="allEqual"', 'pairing==="alreadyShare"', 'ragged==="baselineBroken"',
  'user.labChecks["microbatch-denominator"]=true', "saveUser(true)"])
  if (!mbdCheckSource.includes(required)) throw new Error(`microbatch-denominator short check: must contain ${required}`);
if (!sliceDeclaration(source, "OBJECTIVE_LAB_IDS").includes('"microbatch-denominator"'))
  throw new Error("microbatch-denominator: the lab must be registered as an objective lab, otherwise its check never counts");
// Registration. No lecture guide may claim it: no lecture PDF teaches gradient accumulation
// for the RLVR loss, and inventing one would break the PDF fidelity of the lecture path.
{
  const mission = base.assignments.find(assignment => assignment.id === "a5").missions.find(entry => entry.id === "on-policy-grpo");
  if (mission.labs[0] !== "microbatch-denominator")
    throw new Error("microbatch-denominator: the lab has to lead the mission whose scope contains grpo_train_step_standard_on_policy");
  if (!mission.scope.includes("aggregate_loss_across_microbatch_sequence") || !mission.scope.includes("grpo_train_step_standard_on_policy"))
    throw new Error("microbatch-denominator: the mission it is registered in must be the one that owns both problems");
  if (!base.modules.find(module => module.id === "rlvr").labs.includes("microbatch-denominator"))
    throw new Error("microbatch-denominator: the lab must be listed in the rlvr module");
  for (const lecture of Object.values(base.lectureGuides || {}))
    if ((lecture.labs || []).includes("microbatch-denominator"))
      throw new Error("microbatch-denominator: no lecture guide may list this lab, no lecture PDF teaches gradient accumulation for the RLVR loss");
}
console.log(`microbatch-denominator OK: ${mbdValues} values, all three rules identical at k=1 (${mbdShow(mbdSeen["sequence/k1/share"].accumulated)}), "share" correct only under sequence and "none" only under constant, uneven split turns sequence/steps into weights ${[...new Set(mbdSeen["sequence/k3/steps"].weights.map(value => value.toFixed(6)))].join(" and ")} with a baseline residual of ${mbdApi.mbdGroupDrift(mbdSeen["sequence/k3/steps"].weights).map(entry => entry.drift.toFixed(6)).join(" / ")}`);

// The shell precaches the language bundle by URL, so a version that differs from the one the page
// requests means the service worker caches a file nobody asks for and the page fetches an uncached one.
const shellSource = await readFile(path.join(root, "sw.js"), "utf8");
const pageBundle = source.match(/i18n-en\.js\?v=(\d+)/)?.[1], shellBundle = shellSource.match(/i18n-en\.js\?v=(\d+)/)?.[1];
if (!pageBundle || pageBundle !== shellBundle) throw new Error(`service worker: index.html requests i18n-en.js?v=${pageBundle} while the shell precaches v=${shellBundle}`);
const decodeRenderer = source.slice(source.indexOf("function decodeStageMarkup"), source.indexOf("function updateDecodeSampling"));
for (const required of ["decodeReport(caseKey,tauKey,pKey,variantKey)", "decodeDrift(caseKey,tauKey,pKey,variantKey)", "report.nucleus.keep.length", "decodeNumber(report.nucleus.mass,4)", "decodeNumber(report.total,4)", "decodeNumber(report.shift,4)", "decodeNumber(report.entropy,3)", "decodePercent(report.pTop)", "decodePercent(report.allSame)", "decodeNumber(drift,4)", 'decodeReport(key,tauKey,pKey,"correct")', "Object.entries(DECODE_CASES).map", "report.empty"]) if (!decodeRenderer.includes(required)) throw new Error(`decode-sampling renderer: must stay data-driven and keep ${required}`);

const orientationRenderer = source.slice(source.indexOf("function conceptOrientationMarkup"), source.indexOf("function conceptContinuation"));
for (const required of ["Worum geht es?", "Wo ordnet sich das ein?", "Warum ist das wichtig?", "Begriffe vor dem ersten Schritt", "c.summary", "c.context", "c.why", "conceptPrimerTerms(c)"]) if (!orientationRenderer.includes(required)) throw new Error(`concept orientation renderer: missing ${required}`);
const conceptRenderer = source.slice(source.indexOf("function renderConceptDetail"), source.indexOf("function renderFormulaDetail"));
const orientationIndex = conceptRenderer.indexOf("conceptOrientationMarkup(c,lectureId)"), mentalIndex = conceptRenderer.indexOf("So kannst du dir das vorstellen"), exampleIndex = conceptRenderer.indexOf("conceptExamplePrimer(c,lectureId)"), detailIndex = conceptRenderer.indexOf("c.details.map");
if (!(orientationIndex >= 0 && orientationIndex < mentalIndex && mentalIndex < exampleIndex && exampleIndex < detailIndex)) throw new Error("concept renderer: orientation, mental model, and concrete example must appear before technical details");
for (const required of ["formulaIds=conceptFormulaIds(c,lectureId)", "formulaIds.map", "Kuratierte Formelerklärungen dieser Lecture"]) if (!conceptRenderer.includes(required)) throw new Error(`concept renderer: lecture formula curation is missing ${required}`);
const conceptPositionRenderer = source.slice(source.indexOf("function conceptLecturePositionMarkup"), source.indexOf("function conceptContinuation"));
for (const required of ["lectureLearningPages(lectureId)", "Page ${current} / ${total}", "Seite ${current} / ${total}", "Your position in this lecture", "Deine Position in dieser Lecture", "Page in the lecture guide", "Seite im Lecture-Guide", "step===index", "is-current"]) if (!conceptPositionRenderer.includes(required)) throw new Error(`concept position renderer: missing ${required}`);
for (const required of ["lecturePages=lectureLearningPages(lectureId)", "conceptIndex+1", "lecturePages.length", "conceptLecturePositionMarkup(c,lectureId)"]) if (!conceptRenderer.includes(required)) throw new Error(`concept renderer: prominent lecture position is missing ${required}`);
const conceptContinuationRenderer = source.slice(source.indexOf("function conceptContinuation"), source.indexOf("function conceptCard"));
for (const required of ["pages=lectureLearningPages(lectureId)", "Next page · ${index+2} / ${pages.length}", "Nächste Seite · ${index+2} / ${pages.length}", "First page · 1 / ${pages.length}", "Erste Seite · 1 / ${pages.length}"]) if (!conceptContinuationRenderer.includes(required)) throw new Error(`concept continuation: page number is missing ${required}`);
const lecturePageSequenceRenderer = source.slice(source.indexOf("function lectureLearningPages"), source.indexOf("function lectureForConcept"));
for (const required of ["guide.prereqs.map", "!guide.concepts.includes(id)", "new Set", "...prerequisitePages", "...guide.concepts"]) if (!lecturePageSequenceRenderer.includes(required)) throw new Error(`lecture page sequence: missing ${required}`);
const conceptExampleRenderer = source.slice(source.indexOf("function conceptExamplePrimer"), source.indexOf("function conceptContinuation"));
for (const required of ["curatedFormulaId||c.formulas?.[0]", "c.checks?.[0]", "c.answers?.[0]", "One concrete situation first", "Zuerst eine konkrete Situation", "Worked explanation", "Nachvollziehbare Erklärung", "this lecture adds no extra formula card"]) if (!conceptExampleRenderer.includes(required)) throw new Error(`concept example fallback: missing ${required}`);
const formulaSequenceRenderer = source.slice(source.indexOf("function formulaLearningSequence"), source.indexOf("function formulaAccordion"));
const sequencePositions = ["f.purpose", "f.vars.map", "formulaNotationMarkup(f)", "f.example", "formulaMarkup(f)"].map(value => formulaSequenceRenderer.indexOf(value));
if (!(sequencePositions.every(index => index >= 0) && sequencePositions.every((index, position) => position === 0 || sequencePositions[position - 1] < index))) throw new Error("formula renderer: question, names, notation help, worked example, and general equation are in the wrong order");
if (!Array.isArray(formulaNotationTerms) || !formulaNotationTerms.length) throw new Error("formula notation: glossary is missing");
const notationNeedles = formulaNotationTerms.map(item => item.needle);
if (new Set(notationNeedles).size !== notationNeedles.length) throw new Error("formula notation: duplicate detection token");
for (const [index, item] of formulaNotationTerms.entries()) {
  for (const field of ["needle", "label", "de", "en"]) if (typeof item[field] !== "string" || !item[field].trim()) throw new Error(`formula notation[${index}].${field}: missing text`);
}
for (const needle of ["~", "N(", "∈", "√", "Σ", "∏", "⊙", "ᵀ", "∂", "∇", "≈", "⇔", "⇒", "→", "←", "∩", "∪", "⌈", "∞", "^", "²", "′", "÷", "exp(", "log", "softmax(", "clip("]) {
  if (base.formulas.some(formula => prose(formula.expr).includes(needle)) && !notationNeedles.includes(needle)) throw new Error(`formula notation: no explanation registered for ${needle}`);
}
const notationRenderer = source.slice(source.indexOf("function formulaNotationTerms"), source.indexOf("function formulaSummaryPrimer"));
for (const required of ["FORMULA_NOTATION_TERMS", "item.needle", "declared.includes", "How to read the extra notation used later", "So liest du die zusätzlichen Zeichen der späteren Regel"]) if (!notationRenderer.includes(required)) throw new Error(`formula notation renderer: missing ${required}`);
const parameterDeclared = baseFormulas["parameter-init"].vars.flat().join(" ");
const parameterNotation = formulaNotationTerms.filter(item => prose(baseFormulas["parameter-init"].expr).includes(item.needle) && !parameterDeclared.includes(item.needle) && !parameterDeclared.includes(item.label)).map(item => item.needle);
for (const required of ["√", "~", "N(", "∈"]) if (!parameterNotation.includes(required)) throw new Error(`formula notation: parameter initialization does not explain ${required} before the rule`);
const formulaPrimerRenderer = source.slice(source.indexOf("function formulaPrimerTerms"), source.indexOf("function formulaPrimerMarkup"));
if (!formulaPrimerRenderer.includes('term!=="2D"')) throw new Error("formula primer: arithmetic 2D must not be auto-expanded as two-dimensional");
const formulaAccordionRenderer = source.slice(source.indexOf("function formulaAccordion"), source.indexOf("function symbolAccordion"));
const formulaSummary = formulaAccordionRenderer.slice(0, formulaAccordionRenderer.indexOf("</summary>"));
if (formulaSummary.includes("formulaMarkup(f)") || formulaSummary.includes("f.expr")) throw new Error("formula accordion: a closed card must not expose the equation before its explanation");
if (!(formulaSummary.includes("formulaSummaryPrimer(f)") && formulaSummary.indexOf("formulaSummaryPrimer(f)") < formulaSummary.indexOf("f.purpose"))) throw new Error("formula accordion: acronym expansions must be visible before the closed-card question");
const formulaSummaryPrimerRenderer = source.slice(source.indexOf("function formulaSummaryPrimer"), source.indexOf("function formulaLearningSequence"));
for (const required of ["const terms=formulaPrimerTerms(f);", ".split(\":\")[0]", "Names used below", "Namen in dieser Karte"]) if (!formulaSummaryPrimerRenderer.includes(required)) throw new Error(`formula summary primer: missing ${required}`);
if (formulaSummaryPrimerRenderer.includes(".slice(")) throw new Error("formula summary primer: must not hide later abbreviations used by the purpose text");
const formulaDetailRenderer = source.slice(source.indexOf("function renderFormulaDetail"), source.indexOf("function renderAssignmentDetail"));
if (!(formulaDetailRenderer.indexOf("formulaLearningSequence(f)") >= 0 && formulaDetailRenderer.indexOf("formulaLearningSequence(f)") < formulaDetailRenderer.indexOf("f.intuition"))) throw new Error("formula detail: beginner sequence must precede intuition and technical checks");
if (formulaDetailRenderer.slice(0, formulaDetailRenderer.indexOf("formulaLearningSequence(f)")).includes("f.purpose")) throw new Error("formula detail: the purpose must not appear before acronym and term explanations");
const labPrimerRenderer = source.slice(source.indexOf("function labPrimerMarkup"), source.indexOf("function renderLabDetail"));
const labSummary = labPrimerRenderer.slice(0, labPrimerRenderer.indexOf("</summary>"));
if (labSummary.includes("lab.formula") || !(labPrimerRenderer.indexOf("lab.symbols.map") < labPrimerRenderer.indexOf("lab.formula"))) throw new Error("lab primer: names must appear before the general formula and the closed card must hide it");
const assignmentMissionRenderer = source.slice(source.indexOf("function assignmentMissionMarkup"), source.indexOf("function formulaMarkup"));
for (const required of ["ASSIGNMENT_MISSION_GUIDES[mission.id]", "localeValue(guide.plain)", "localeValue(guide.why)", "concept.formulas", "data-open-formula", "Problems in this block", "problemMapMarkup(a.id,mission.scope)"]) if (!assignmentMissionRenderer.includes(required)) throw new Error(`assignment topic renderer: missing ${required}`);
const missionOrder = ["localeValue(guide.plain)", "localeValue(guide.why)", "concepts.map", "data-open-formula", "mission.derive", "problemMapMarkup(a.id,mission.scope)"].map(value => assignmentMissionRenderer.indexOf(value));
if (!(missionOrder.every(index => index >= 0) && missionOrder.every((index, position) => position === 0 || missionOrder[position - 1] < index))) throw new Error("assignment topic renderer: plain goal and relevance must precede explanations, formulas, technical task, and raw Handout names");
const handoutProblems = readConstant("HANDOUT_PROBLEMS");
const scopedProblemKeys = new Set(base.assignments.flatMap(a => (a.missions || []).flatMap(mission => String(mission.scope).split("·").map(part => `${a.id}:${part.trim()}`).filter(key => !key.endsWith(":")))));
for (const key of scopedProblemKeys) if (!handoutProblems[key]) throw new Error(`handout problems: mission scope references ${key}, which has no points/kind entry`);
for (const key of Object.keys(handoutProblems)) if (!scopedProblemKeys.has(key)) throw new Error(`handout problems: ${key} is not referenced by any mission scope`);
for (const [key, entry] of Object.entries(handoutProblems)) {
  if (!Array.isArray(entry) || (entry.length !== 4 && entry.length !== 6)) throw new Error(`handout problems: ${key} must be [points, modes, gpuHours, title] or [points, modes, gpuHours, title, adapters, tests]`);
  if (!(typeof entry[0] === "number" && entry[0] > 0)) throw new Error(`handout problems: ${key} needs a positive point value`);
  if (!/^[cwr]{1,3}$/.test(entry[1])) throw new Error(`handout problems: ${key} has invalid work modes "${entry[1]}"`);
  if (typeof entry[2] !== "number" || entry[2] < 0) throw new Error(`handout problems: ${key} has an invalid GPU-hour budget`);
  if (typeof entry[3] !== "string" || !entry[3].trim()) throw new Error(`handout problems: ${key} needs the original handout title`);
  if (entry.length === 6) {
    // Both are quoted verbatim from the handout, so they must stay syntactically exact: adapter hooks
    // are bare identifiers (the "adapters." prefix is added when rendering) and tests are the argument
    // part of the printed "uv run pytest ..." command.
    if (typeof entry[4] !== "string" || (entry[4] && !/^[A-Za-z0-9_]+(,[A-Za-z0-9_]+)*$/.test(entry[4]))) throw new Error(`handout problems: ${key} has invalid adapter hooks "${entry[4]}"`);
    if (typeof entry[5] !== "string" || (entry[5] && !/^(-k [A-Za-z0-9_]+|tests\/[A-Za-z0-9_]+\.py)(,(-k [A-Za-z0-9_]+|tests\/[A-Za-z0-9_]+\.py))*$/.test(entry[5]))) throw new Error(`handout problems: ${key} has invalid test commands "${entry[5]}"`);
    if (!entry[4] && !entry[5]) throw new Error(`handout problems: ${key} declares a verification handle but leaves both fields empty`);
  }
}
const verifiable = Object.values(handoutProblems).filter(entry => entry.length === 6);
// The handouts name an adapter hook and/or a pytest command for these problems. Losing them would quietly
// remove the bridge from an explanation to a passing test, so guard the floor found when they were extracted.
if (verifiable.length < 50) throw new Error(`handout problems: only ${verifiable.length} problems carry the handout's adapter/test handles, expected at least 50`);
if (verifiable.filter(entry => entry[5]).length < 50) throw new Error("handout problems: every problem with a verification handle must keep its pytest command");
// The A5 supplement is a separate PDF, and its handles were missed when the others were first extracted.
// Pin them verbatim so a future pass cannot drop the supplement again.
const supplementHandles = {
  "a5:mmlu_baseline": ["run_parse_mmlu_response", "-k test_parse_mmlu_response"],
  "a5:gsm8k_baseline": ["run_parse_gsm8k_response", "-k test_parse_gsm8k_response"],
  "a5:data_loading": ["get_packed_sft_dataset,run_iterate_batches", "-k test_packed_sft_dataset,-k test_iterate_batches"],
  "a5:dpo_loss": ["run_compute_per_instance_dpo_loss", "-k test_per_instance_dpo_loss"]
};
for (const [key, [adapters, tests]] of Object.entries(supplementHandles)) {
  const entry = handoutProblems[key];
  if (entry?.[4] !== adapters || entry?.[5] !== tests) throw new Error(`handout problems: ${key} must keep the A5 supplement's verbatim adapter/test handles`);
}
// A pytest command without the adapter name leaves the reader with a test but no function to write. Wherever
// the handout prints both — it does for every A4 implementation problem — both must survive together.
const testWithoutAdapter = Object.entries(handoutProblems).filter(([, entry]) => entry.length === 6 && entry[5] && !entry[4]).map(([key]) => key);
for (const key of testWithoutAdapter) if (key.startsWith("a4:")) throw new Error(`handout problems: ${key} names a pytest command but no adapter hook, although the A4 handout prints one`);
const problemMapRenderer = source.slice(source.indexOf("function problemVerifyMarkup"), source.indexOf("function assignmentEffortMarkup"));
for (const required of ["p.adapters", "p.tests", "adapters.${esc(name)}", "uv run pytest ${esc(args)}", "problemVerifyMarkup(assignmentId,p)", "PROBLEM_CONCEPTS[`${assignmentId}:${p.id}`]", "data-open-concept"]) if (!problemMapRenderer.includes(required)) throw new Error(`problem map: verification handles and per-problem concepts must stay rendered (missing ${required})`);
if (!(problemMapRenderer.indexOf("Konzept") < problemMapRenderer.indexOf("Adapter"))) throw new Error("problem map: the concept explanation must be offered before the adapter and test handles");

// Per-problem concepts only narrow what a block already offers; they must never point at material this
// assignment does not reach. Allowed for a problem: any concept from one of its assignment's own blocks,
// from the assignment's linked list, or from the shared foundations module.
const problemConcepts = readConstant("PROBLEM_CONCEPTS");
const conceptIds = new Set(base.concepts.map(concept => concept.id));
const foundationConcepts = base.modules.find(module => module.id === "foundations")?.concepts || [];
const missionOfProblem = new Map();
const reachableByAssignment = new Map();
for (const assignment of base.assignments) {
  const reachable = new Set([...foundationConcepts, ...(assignment.concepts || [])]);
  for (const mission of assignment.missions || []) {
    (mission.concepts || []).forEach(id => reachable.add(id));
    for (const part of String(mission.scope).split("·").map(value => value.trim()).filter(Boolean)) {
      missionOfProblem.set(`${assignment.id}:${part}`, mission);
    }
  }
  reachableByAssignment.set(assignment.id, reachable);
}
for (const [key, ids] of Object.entries(problemConcepts)) {
  if (!handoutProblems[key]) throw new Error(`problem concepts: ${key} is not a handout problem`);
  if (!Array.isArray(ids) || !ids.length || ids.length > 3) throw new Error(`problem concepts: ${key} must name one to three concepts`);
  if (new Set(ids).size !== ids.length) throw new Error(`problem concepts: ${key} repeats a concept`);
  const reachable = reachableByAssignment.get(key.slice(0, key.indexOf(":")));
  for (const id of ids) {
    if (!conceptIds.has(id)) throw new Error(`problem concepts: ${key} points at unknown concept ${id}`);
    if (!reachable.has(id)) throw new Error(`problem concepts: ${key} points at ${id}, which this assignment never reaches`);
  }
  const mission = missionOfProblem.get(key);
  if (mission && ids.length >= (mission.concepts || []).length && (mission.scope.split("·").length > 1)) throw new Error(`problem concepts: ${key} does not narrow its block, which already lists ${(mission.concepts || []).length} concepts`);
}
// Single-problem blocks are already exact, so they are deliberately absent; every other problem needs a link.
const missingProblemConcepts = [...scopedProblemKeys].filter(key => !problemConcepts[key] && String(missionOfProblem.get(key)?.scope || "").split("·").length > 1);
if (missingProblemConcepts.length) throw new Error(`problem concepts: ${missingProblemConcepts.length} problems in multi-problem blocks have no concept link (${missingProblemConcepts.slice(0, 3).join(", ")})`);
console.log(`handout problems OK: ${scopedProblemKeys.size} problems, ${Object.values(handoutProblems).reduce((sum, entry) => sum + entry[0], 0)} points, ${Object.values(handoutProblems).reduce((sum, entry) => sum + entry[2], 0)} GPU hours, ${verifiable.length} with adapter/test handles, ${Object.keys(problemConcepts).length} with a per-problem concept link`);

// The lecture page derives which problems a lecture opens by checking whether every concept a problem turns
// on is already covered. That derivation is only honest while the renderer, the deciding-concept source, and
// the reachability of those concepts all hold, so each of the three is guarded here.
const outlookRenderer = source.slice(source.indexOf("function problemDecidingConcepts"), source.indexOf("function renderLectureDetail"));
for (const required of ["PROBLEM_CONCEPTS[`${assignmentId}:${problemId}`]", "mission.concepts", 'byId(MODULES,"foundations")', "LECTURE_IDS.slice(0,index)", "gap.length!==1", "data-open-assignment", "data-open-concept", "problemModeLabels"]) if (!outlookRenderer.includes(required)) throw new Error(`lecture outlook: the derivation must stay data-driven (missing ${required})`);
for (const framing of ["never a gate", "kein Gate"]) if (!outlookRenderer.includes(framing)) throw new Error(`lecture outlook: the section must keep stating that it is orientation, not a gate (missing "${framing}")`);
const lectureTemplate = source.slice(source.indexOf("function renderLectureDetail"), source.indexOf("function renderModuleDetail"));
if (!lectureTemplate.includes("${lectureProblemOutlookMarkup(id)}")) throw new Error("lecture outlook: the lecture page must render the problem outlook");
if (!(lectureTemplate.indexOf("lectureProblemOutlookMarkup(id)") < lectureTemplate.indexOf('"Original material"'))) throw new Error("lecture outlook: the outlook belongs in the reading flow before the original material");

// The dashboard's opening panel tells the learner which sections to look for by quoting their headings.
// A renamed heading would turn that into a wrong instruction on the very first page, so the quotes are
// checked against the headings the renderers actually emit, in both languages.
const dashboard = source.slice(source.indexOf("function renderDashboard"), source.indexOf("function diagnosticSummaryHtml"));
for (const heading of ["Welche Assignment-Probleme das jetzt öffnet", "Which assignment problems this opens up", "Was dieses Assignment braucht, aber keine Lecture liefert", "What this assignment needs but no lecture hands you"]) {
  if (!dashboard.includes(heading)) throw new Error(`dashboard workflow: the opening panel no longer points at "${heading}"`);
  if (source.split(heading).length - 1 < 2) throw new Error(`dashboard workflow: the panel quotes "${heading}", but no renderer emits that heading any more`);
}
for (const framing of ["keine Termine und nichts, was freigeschaltet werden muss", "no deadlines here and nothing that has to be unlocked"]) if (!dashboard.includes(framing)) throw new Error(`dashboard workflow: the panel must keep stating that nothing is scheduled or gated (missing "${framing}")`);

// Mirrors the app's derivation. A deciding concept that neither a lecture nor the shared foundations teaches
// would hide its problem from every lecture page forever, so the few assignment-only concepts are listed
// explicitly: adding to that list has to be a decision, not an accident.
const lectureTaughtConcepts = new Set(Object.values(base.lectureGuides).flatMap(guide => guide.concepts || []));
const selfStudyConcepts = ["lm-objective", "causal-mask", "cross-entropy", "adamw", "clipping", "sampling"];
for (const id of selfStudyConcepts) {
  if (!conceptIds.has(id)) throw new Error(`lecture outlook: assignment-only concept ${id} no longer exists`);
  if (lectureTaughtConcepts.has(id)) throw new Error(`lecture outlook: ${id} is taught by a lecture now and must leave the assignment-only list`);
}
// The counterpart for labs. A lab whose subject is an assignment-only concept must stay off every
// lecture page for the same reason the concept does: no lecture PDF teaches it, and listing it there
// would claim a coverage the sources do not carry. Each entry names the concept that decides it, so
// the guard fails the moment a lecture starts teaching that concept and the decision has to be retaken.
for (const [lab, concept] of [["optimizer", "adamw"], ["loss-and-clip", "clipping"], ["decode-sampling", "sampling"]]) {
  if (!selfStudyConcepts.includes(concept))
    throw new Error(`lecture path: ${concept} left the assignment-only list, so the placement of ${lab} has to be decided again`);
  for (const [lectureId, guide] of Object.entries(base.lectureGuides))
    if ((guide.labs || []).includes(lab))
      throw new Error(`lecture path: ${lectureId} lists ${lab}, but no lecture PDF teaches ${concept} -- it belongs to the assignment page`);
}
// The two placements this leaves are the ones a lecture really curates: the lecture that teaches the
// concept must also offer the lab that practises it, or the concept is read-only on that page.
for (const [lab, concept, lectureId] of [["shapes", "shapes", "l02"], ["scaling", "isoflops", "l09"]]) {
  if (!(base.lectureGuides[lectureId].concepts || []).includes(concept))
    throw new Error(`lecture path: ${lectureId} no longer curates ${concept}, so ${lab} has lost its reason to sit there`);
  if (!(base.lectureGuides[lectureId].labs || []).includes(lab))
    throw new Error(`lecture path: ${lectureId} curates ${concept} but offers no way to practise it -- ${lab} belongs on that page`);
}

const decidingConcepts = new Map([...scopedProblemKeys].map(key => {
  const named = problemConcepts[key];
  return [key, named && named.length ? named : (missionOfProblem.get(key)?.concepts || [])];
}));
for (const [key, ids] of decidingConcepts) {
  if (!ids.length) throw new Error(`lecture outlook: ${key} has no deciding concepts, so no lecture can ever list it`);
  for (const id of ids) if (!lectureTaughtConcepts.has(id) && !foundationConcepts.includes(id) && !selfStudyConcepts.includes(id)) throw new Error(`lecture outlook: ${key} turns on ${id}, which no lecture and no foundation covers`);
}
const openedAt = new Map();
let outlookCovered = new Set(foundationConcepts);
for (const lectureId of Object.keys(base.lectureGuides)) {
  const before = new Set(outlookCovered);
  (base.lectureGuides[lectureId].concepts || []).forEach(id => outlookCovered.add(id));
  for (const [key, ids] of decidingConcepts) {
    if (!ids.every(id => outlookCovered.has(id)) || ids.every(id => before.has(id))) continue;
    if (openedAt.has(key)) throw new Error(`lecture outlook: ${key} is announced as newly approachable twice (${openedAt.get(key)}, ${lectureId})`);
    openedAt.set(key, lectureId);
  }
}
const approachable = [...decidingConcepts].filter(([, ids]) => ids.every(id => outlookCovered.has(id)));
if (approachable.length < 100) throw new Error(`lecture outlook: only ${approachable.length} problems ever become approachable, which means the lecture concept lists have drifted`);
console.log(`lecture outlook OK: ${openedAt.size} problems announced by a lecture, ${approachable.length} of ${decidingConcepts.size} approachable after Lecture 17`);

// The counterpart on the assignment page: it names exactly the deciding concepts the lecture path never
// hands over, so the reader learns about them before the problem instead of during it. It has to stay
// derived, has to sit above the topic blocks (it is a prerequisite, not a footnote), and its result has to
// keep matching the assignment-only list above — a silently empty section would be the worst outcome.
const selfStudyRenderer = source.slice(source.indexOf("function assignmentSelfStudyConcepts"), source.indexOf("function renderAssignmentDetail"));
for (const required of ["problemDecidingConcepts(a.id,problem.id,mission)", 'byId(MODULES,"foundations")', "LECTURE_IDS.forEach", "taught.has(conceptId)", "data-open-concept", "missionProblems(a.id,mission.scope)"]) if (!selfStudyRenderer.includes(required)) throw new Error(`assignment self-study: the derivation must stay data-driven (missing ${required})`);
const assignmentTemplate = source.slice(source.indexOf("function renderAssignmentDetail"), source.indexOf("function copyText"));
if (!assignmentTemplate.includes("${assignmentSelfStudyMarkup(a)}")) throw new Error("assignment self-study: the assignment page must render the section");
if (!(assignmentTemplate.indexOf("assignmentSelfStudyMarkup(a)") < assignmentTemplate.indexOf('"What is required?"'))) throw new Error("assignment self-study: the section belongs above the topic blocks, next to the other prerequisites");
const selfStudyByAssignment = new Map();
for (const [key, ids] of decidingConcepts) {
  const assignmentId = key.split(":")[0];
  for (const id of ids) {
    if (lectureTaughtConcepts.has(id) || foundationConcepts.includes(id)) continue;
    if (!selfStudyByAssignment.has(assignmentId)) selfStudyByAssignment.set(assignmentId, new Set());
    selfStudyByAssignment.get(assignmentId).add(id);
  }
}
const surfaced = new Set([...selfStudyByAssignment.values()].flatMap(ids => [...ids]));
if (!surfaced.size) throw new Error("assignment self-study: no assignment surfaces a self-study concept any more, so the section renders nowhere");
for (const id of surfaced) if (!selfStudyConcepts.includes(id)) throw new Error(`assignment self-study: ${id} is needed by a problem but missing from the assignment-only list`);
console.log(`assignment self-study OK: ${surfaced.size} concepts no lecture teaches, surfaced on ${selfStudyByAssignment.size} assignment pages`);
// The practice link beside a self-study concept. Until v92 this was a second hand-kept table
// (SELF_STUDY_LABS, five pairs) describing the same relation as LAB_CONCEPTS, and two tables of
// the same fact drift. It now reads the shared map, so what the concept page offers and what the
// self-study section offers can never disagree -- and the one concept with no experiment stays a
// recorded decision rather than a gap that appeared quietly.
{
  const practiceApi = runInNewContext(
    `${sliceDeclaration(source, "LAB_CONCEPTS")}
     const LABS = ${JSON.stringify(base.labs.map(lab => ({ id: lab.id })))};
     ${sliceDeclaration(source, "conceptLabs")}
     ({LAB_CONCEPTS, conceptLabs})`, {});
  const labIds = new Set(base.labs.map(lab => lab.id));
  const conceptIds = new Set(base.concepts.map(concept => concept.id));
  for (const [labId, concepts] of Object.entries(practiceApi.LAB_CONCEPTS)) {
    if (!labIds.has(labId)) throw new Error(`lab concepts: ${labId} is not a lab, so its entry points nowhere`);
    if (!Array.isArray(concepts) || !concepts.length) throw new Error(`lab concepts: ${labId} names no concept`);
    for (const conceptId of concepts) if (!conceptIds.has(conceptId)) throw new Error(`lab concepts: ${labId} names ${conceptId}, which is not a concept`);
    if (new Set(concepts).size !== concepts.length) throw new Error(`lab concepts: ${labId} names the same concept twice`);
  }
  for (const lab of base.labs) if (!practiceApi.LAB_CONCEPTS[lab.id]) throw new Error(`lab concepts: ${lab.id} has no entry, so no concept page can offer it`);
  const withLab = selfStudyConcepts.filter(id => practiceApi.conceptLabs(id).length);
  const withoutLab = selfStudyConcepts.filter(id => !practiceApi.conceptLabs(id).length);
  for (const conceptId of withLab) {
    const first = practiceApi.conceptLabs(conceptId)[0];
    if (!labIds.has(first.id)) throw new Error(`assignment self-study: ${conceptId} points at ${first.id}, which is not a lab -- the button would be dead`);
  }
  // v96 closed the last one: `lm-objective` now has `target-shift`. All six self-study
  // concepts offer the lab that computes them, and that is the documented state -- a
  // concept dropping back out of it is a regression, not a decision that quietly drifted.
  if (withoutLab.length)
    throw new Error(`assignment self-study: the concepts with no practice lab are ${JSON.stringify(withoutLab)}, and since v96 every one of them has one -- decide the placement rather than letting the list drift`);
  if (withLab.length !== selfStudyConcepts.length)
    throw new Error(`assignment self-study: ${withLab.length} of ${selfStudyConcepts.length} self-study concepts offer a lab, which is fewer than the documented state`);
  // and the renderer has to actually use the derivation, or the table above proves nothing
  const renderer = source.slice(source.indexOf("function assignmentSelfStudyConcepts"), source.indexOf("function renderAssignmentDetail"));
  for (const required of ["conceptLabs(conceptId)[0]", "data-open-lab", "entry.lab"])
    if (!renderer.includes(required))
      throw new Error(`assignment self-study: the practice link must stay derived from LAB_CONCEPTS (missing ${required})`);
  if (source.includes("SELF_STUDY_LABS"))
    throw new Error("assignment self-study: the replaced five-pair table is back, so the same relation is written down twice again");
  console.log(`assignment self-study practice OK: all ${withLab.length} of ${selfStudyConcepts.length} concepts no lecture teaches offer the lab that computes them, none left without one, all of it derived from the one LAB_CONCEPTS map`);
}

const transformerModule = base.modules.find(module => module.id === "transformer");
const initIndex = transformerModule?.concepts.indexOf("parameter-initialization") ?? -1;
const rmsIndex = transformerModule?.concepts.indexOf("rmsnorm") ?? -1;
if (!(initIndex >= 0 && initIndex < rmsIndex)) throw new Error("A1 initialization concept must precede RMSNorm in the Transformer module");
for (const [moduleId, first, second] of [
  ["gpu", "flash-attention", "kernel-contracts"],
  ["distributed", "collectives", "distributed-runtime"],
  ["scaling", "scaling-practice", "scaling-optima"],
  ["rlvr", "off-policy", "grpo-variants"]
]) {
  const concepts = base.modules.find(module => module.id === moduleId)?.concepts || [];
  if (!(concepts.indexOf(first) >= 0 && concepts.indexOf(first) < concepts.indexOf(second))) throw new Error(`${moduleId}: prerequisite order ${first} before ${second} is missing`);
}
const a1 = base.assignments.find(assignment => assignment.id === "a1");
const a1Mission = id => a1?.missions.find(mission => mission.id === id);
if (!a1Mission("tensor-primitives")?.concepts.includes("parameter-initialization")) throw new Error("A1 tensor-primitives mission is missing parameter initialization");
if (!a1Mission("training-state")?.concepts.includes("token-array-loading")) throw new Error("A1 training-state mission is missing memory-mapped token-array loading");
const textTokenizer = a1Mission("text-tokenizer");
if (!textTokenizer?.labs.includes("bpe-encode")) throw new Error("A1 text-tokenizer mission is missing the encoding lab; a1:tokenizer would have no interactive object");
const encodeLab = base.labs.find(lab => lab.id === "bpe-encode");
if (encodeLab?.module !== "tokenization") throw new Error("labs.bpe-encode: must live in the tokenization module so Lecture 1 can cite it");
if (!/encode_iterable/.test(source)) throw new Error("encode_iterable is required by the A1 tokenizer problem and must appear in the platform");
for (const field of ["mental", "misconception"]) {
  if (!/rang/i.test(encodeLab?.[field] || "")) throw new Error(`labs.bpe-encode.${field}: must state that encoding applies merges in creation rank order`);
}


// --- lsh-bands ---------------------------------------------------------------
// Lecture 14 computes get_prob_collision(sim, b, r) in its own trace and inspects it for
// three settings; A4 minhash_deduplication makes the reader choose (b) hashes, (c) bands
// and (d) the n-gram length with one sentence of guidance. The platform printed the
// formula on a card and evaluated it nowhere. These guards hold the evaluation.
const lshNames = ["LSH_BANDS", "LSH_ROWS", "LSH_TAUS", "LSH_SIMS", "LSH_LECTURE_SIMS", "LSH_LECTURE_SETTINGS",
  "LSH_CORPUS_DOCS", "LSH_PAIRS", "LSH_NS", "LSH_DOC_PAIRS",
  "lshProbMatch", "lshProbCollision", "lshThreshold", "lshPairTotal", "lshCorpusReport",
  "lshWords", "lshNgrams", "lshJaccard", "lshPairReport"];
const lshApi = runInNewContext(`${numberPrelude}${lshNames.map(name => sliceDeclaration(source, name)).join("\n")}; ({${lshNames.join(",")}})`, {});
const lshShow = value => Number(value).toFixed(6);
let lshValues = 0;

// The two lines of the lecture trace, typed here from the PDF and not from the app.
const refMatch = (s, r) => Math.pow(s, r);
const refCollision = (s, b, r) => 1 - Math.pow(1 - refMatch(s, r), b);
for (const b of lshApi.LSH_BANDS) for (const r of lshApi.LSH_ROWS) for (const s of lshApi.LSH_SIMS) {
  lshValues += 2;
  if (lshShow(lshApi.lshProbMatch(s, r)) !== lshShow(refMatch(s, r))) throw new Error(`lsh-bands: s^r differs from the reference at s=${s}, r=${r}`);
  if (lshShow(lshApi.lshProbCollision(s, b, r)) !== lshShow(refCollision(s, b, r))) throw new Error(`lsh-bands: the collision probability differs from the reference at s=${s}, b=${b}, r=${r}`);
}
// The lecture's own conclusions, checked as properties rather than quoted as prose:
// more bands move the curve left (easier to match), more rows move it right (harder).
for (const r of lshApi.LSH_ROWS) for (const s of lshApi.LSH_SIMS) {
  for (let i = 1; i < lshApi.LSH_BANDS.length; i++)
    if (!(lshApi.lshProbCollision(s, lshApi.LSH_BANDS[i], r) >= lshApi.lshProbCollision(s, lshApi.LSH_BANDS[i - 1], r)))
      throw new Error("lsh-bands: more bands must never lower the collision probability, that is the lecture's 'moves the curve to the left'");
}
for (const b of lshApi.LSH_BANDS) for (const s of lshApi.LSH_SIMS) {
  for (let i = 1; i < lshApi.LSH_ROWS.length; i++)
    if (!(lshApi.lshProbCollision(s, b, lshApi.LSH_ROWS[i]) <= lshApi.lshProbCollision(s, b, lshApi.LSH_ROWS[i - 1])))
      throw new Error("lsh-bands: more rows per band must never raise the collision probability, that is the lecture's 'moves the curve to the right'");
}
// Every setting the lecture inspects has to be selectable, otherwise the lab claims a
// fidelity to lecture 14 that the controls do not offer.
for (const [b, r] of lshApi.LSH_LECTURE_SETTINGS) {
  if (!lshApi.LSH_BANDS.includes(b) || !lshApi.LSH_ROWS.includes(r))
    throw new Error(`lsh-bands: lecture setting b=${b}, r=${r} is not reachable from the controls`);
}
for (const s of lshApi.LSH_LECTURE_SIMS) {
  if (!lshApi.LSH_SIMS.includes(s)) throw new Error(`lsh-bands: the lecture inspects s=${s} and the table does not show it`);
}
// The handout's example signature length has to be reachable as a real split, and it is
// the whole point that several splits of the same k exist.
const lshHundred = lshApi.LSH_BANDS.filter(b => lshApi.LSH_ROWS.includes(100 / b));
if (lshHundred.length < 5) throw new Error("lsh-bands: k = 100 must decompose into at least five selectable (b, r) splits, that is the handout's own example");
// s* is the similarity at which one band matches with probability 1/b. It is not a cutoff:
// the lab says P(s*) is about 0.64, so that has to hold everywhere it can be selected.
for (const b of lshApi.LSH_BANDS) for (const r of lshApi.LSH_ROWS) {
  lshValues++;
  const star = lshApi.lshThreshold(b, r);
  if (lshShow(lshApi.lshProbMatch(star, r)) !== lshShow(1 / b)) throw new Error(`lsh-bands: at s* a fixed band must match with probability exactly 1/b (b=${b}, r=${r})`);
  const at = lshApi.lshProbCollision(star, b, r);
  if (!(at > 0.63 && at < 0.76)) throw new Error(`lsh-bands: P(s*) = ${at} contradicts the lab's claim that s* is not a hard boundary`);
}
// The constructed pair profile has to be internally consistent: it claims to cover every
// pair of LSH_CORPUS_DOCS documents, and the lab prints both numbers next to each other.
if (lshApi.lshPairTotal() !== (lshApi.LSH_CORPUS_DOCS * (lshApi.LSH_CORPUS_DOCS - 1)) / 2)
  throw new Error("lsh-bands: the pair profile must cover exactly C(N,2) pairs, otherwise the two printed numbers contradict each other");

// The corpus report. Recall has to rise with b at fixed r -- that is the recall half of
// the handout's one sentence -- and the cost has to rise with it, which is the half the
// handout does not state and the whole reason the lab exists.
const lshSeen = {};
for (const entry of lshApi.LSH_TAUS) for (const b of lshApi.LSH_BANDS) for (const r of lshApi.LSH_ROWS) {
  const report = lshApi.lshCorpusReport(b, r, entry.tau);
  lshSeen[`${entry.key}/${b}/${r}`] = report;
  lshValues += report.rows.length + 6;
  const wantTrue = lshApi.LSH_PAIRS.filter(pair => pair.s > entry.tau).reduce((sum, pair) => sum + pair.count, 0);
  if (report.trueTotal !== wantTrue) throw new Error(`lsh-bands ${entry.key}: the duplicate population must follow tau`);
  if (wantTrue === 0) throw new Error(`lsh-bands ${entry.key}: a threshold with no duplicates above it makes the recall line meaningless`);
  const wantCandidates = report.rows.reduce((sum, row) => sum + row.count * lshApi.lshProbCollision(row.s, b, r), 0);
  if (lshShow(report.candidates) !== lshShow(wantCandidates)) throw new Error(`lsh-bands ${entry.key}/${b}/${r}: candidates differ from the reference`);
  if (lshShow(report.retrieved + report.missed) !== lshShow(report.trueTotal)) throw new Error(`lsh-bands ${entry.key}/${b}/${r}: found and missed must add up to the duplicate population`);
  if (lshShow(report.candidates - report.wasted) !== lshShow(report.retrieved)) throw new Error(`lsh-bands ${entry.key}/${b}/${r}: candidates minus discarded must be the retrieved duplicates`);
  if (!(report.recall >= 0 && report.recall <= 1)) throw new Error(`lsh-bands ${entry.key}/${b}/${r}: recall outside [0,1]`);
}
for (const entry of lshApi.LSH_TAUS) for (const r of lshApi.LSH_ROWS) {
  for (let i = 1; i < lshApi.LSH_BANDS.length; i++) {
    const now = lshSeen[`${entry.key}/${lshApi.LSH_BANDS[i]}/${r}`], before = lshSeen[`${entry.key}/${lshApi.LSH_BANDS[i - 1]}/${r}`];
    if (now.recall < before.recall) throw new Error("lsh-bands: more bands must never lower recall");
    if (now.candidates < before.candidates) throw new Error("lsh-bands: more bands must never lower the number of candidate pairs -- recall and cost move together, that is the point of the second ledger line");
  }
}
// The three numbers the short check and the transfer answer name, at the handout's k = 100
// and the usual tau = 0.8. A guard that reads them from the lab is the only thing that
// keeps those texts true after a data change.
{
  const strict = lshSeen["t08/2/50"], loose = lshSeen["t08/50/2"], middle = lshSeen["t08/10/10"];
  if (strict.recall >= 0.5) throw new Error("lsh-bands: the strictest k=100 split has to lose most duplicates, otherwise the first short-check answer is wrong");
  if (loose.recall !== 1) throw new Error("lsh-bands: the loosest k=100 split has to retrieve every duplicate, otherwise the first short-check answer is wrong");
  if (!(loose.candidates > 1000 * strict.candidates)) throw new Error("lsh-bands: the loosest split must cost orders of magnitude more candidate pairs than the strictest, that is what the first short-check answer contrasts");
  if (!(middle.recall > 0.9 && middle.candidates < 1000)) throw new Error("lsh-bands: lecture 14's own b=10/r=10 has to be the readable middle ground");
  for (const [label, value] of [["13.61", 100 * strict.recall], ["100.00", 100 * loose.recall],
    ["18.37", strict.candidates], ["198086.99", loose.candidates], ["164.87", middle.candidates]])
    if (value.toFixed(2) !== label) throw new Error(`lsh-bands: the short check and the transfer answer print ${label}, the lab computes ${value.toFixed(2)}`);
  if (lshShow(lshApi.lshThreshold(4, 25)) !== "0.946058" || lshShow(lshApi.lshThreshold(50, 2)) !== "0.141421")
    throw new Error("lsh-bands: the transfer answer quotes s* for b=4 and b=50, both must come out of lshThreshold");
  if (lshSeen["t08/4/25"].missed.toFixed(2) !== "90.12" || (100 * lshSeen["t08/4/25"].recall).toFixed(2) !== "33.24")
    throw new Error("lsh-bands: the transfer answer quotes 33.24 % recall and 90.12 missed duplicates at b=4, r=25");
}

// Mode B. The similarity is a similarity of n-grams, so the same pair may cross tau on n
// alone -- and the normalization contract has to be worth a number, not a sentence.
const lshNs = lshApi.LSH_NS;
const lshPair = key => lshApi.LSH_DOC_PAIRS.find(entry => entry.key === key);
function lshRefJaccard(a, b, n, normalized) {
  const prep = text => normalized
    ? text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean)
    : text.trim().split(/\s+/).filter(Boolean);
  const grams = w => { const out = new Set(); for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(" ")); return out; };
  const setA = grams(prep(a)), setB = grams(prep(b));
  let inter = 0; setA.forEach(x => { if (setB.has(x)) inter++; });
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
}
for (const pair of lshApi.LSH_DOC_PAIRS) for (const normalized of [true, false]) for (const entry of lshApi.LSH_TAUS) {
  const report = lshApi.lshPairReport(pair, normalized, entry.tau);
  if (report.cells.length !== lshNs.length) throw new Error("lsh-bands: one cell per n-gram length");
  for (const cell of report.cells) {
    lshValues++;
    if (lshShow(cell.j) !== lshShow(lshRefJaccard(pair.a, pair.b, cell.n, normalized)))
      throw new Error(`lsh-bands ${pair.key}: Jaccard at n=${cell.n} differs from the reference`);
    if (cell.duplicate !== (cell.j > entry.tau)) throw new Error(`lsh-bands ${pair.key}: the duplicate verdict must be strict J > tau, as the handout writes it`);
    if (cell.union < cell.inter) throw new Error(`lsh-bands ${pair.key}: union below intersection`);
  }
}
{
  const at = (key, n, normalized) => lshApi.lshPairReport(lshPair(key), normalized, 0.8).cells.find(cell => cell.n === n);
  // The license template is the handout's own motivating example, and it is the pair that
  // flips on n alone at the threshold everyone picks first.
  if (!(at("license", 1, true).duplicate && at("license", 2, true).duplicate && !at("license", 3, true).duplicate && !at("license", 5, true).duplicate))
    throw new Error("lsh-bands license: at tau = 0.8 the template pair must be a duplicate at n = 1 and 2 and not at n = 3 and 5, the second short-check answer rests on it");
  if (lshShow(at("license", 1, true).j) !== "0.837838" || lshShow(at("license", 3, true).j) !== "0.787234")
    throw new Error("lsh-bands license: the transfer answer prints 0.837838 and 0.787234");
  // A word permutation is invisible to unigrams and total at n = 5. Both ends have to be
  // exact, otherwise the row shows a gradient instead of the structural point.
  if (lshShow(at("permuted", 1, true).j) !== "1.000000" || lshShow(at("permuted", 5, true).j) !== "0.000000")
    throw new Error("lsh-bands permuted: a pure word permutation must be exactly 1 at n = 1 and exactly 0 at n = 5");
  // The normalization contract of A4 3.2, as a number: with it the pair is the same
  // document at every n, without it the pair shares almost nothing.
  for (const n of lshNs) {
    if (lshShow(at("accents", n, true).j) !== "1.000000") throw new Error(`lsh-bands accents: under the A4 normalization contract the pair must be identical at n = ${n}`);
    if (at("accents", n, false).j >= 0.2) throw new Error(`lsh-bands accents: without normalization the same pair must fall apart at n = ${n}`);
  }
  // The handout writes "exceed a given threshold", so the comparison is strict. No cell
  // sits on a threshold by accident, so the boundary has to be built on purpose.
  const boundary = at("license", 3, true).j;
  const boundaryCell = lshApi.lshPairReport(lshPair("license"), true, boundary).cells.find(cell => cell.n === 3);
  if (lshShow(boundaryCell.j) !== lshShow(boundary)) throw new Error("lsh-bands: the boundary probe must land on the same cell");
  if (boundaryCell.duplicate) throw new Error("lsh-bands: a pair whose Jaccard equals tau exactly must not be a duplicate, the handout says the similarity has to exceed the threshold");
  // Every pair has to earn its row: at least one has to be undecided across n, and no pair
  // may be constant across all four n, otherwise the mode shows nothing about n.
  for (const pair of lshApi.LSH_DOC_PAIRS) {
    if (pair.key === "accents") continue;
    const values = lshNs.map(n => lshShow(at(pair.key, n, true).j));
    if (new Set(values).size === 1) throw new Error(`lsh-bands ${pair.key}: a pair whose Jaccard does not move with n teaches nothing about n`);
  }
}

// Renderer guards. A number that is computed but never shown teaches nothing, and the
// guard has to demand the place, not the occurrence -- so it asks for whole fragments.
const lshCurveRenderer = sliceDeclaration(source, "lshCurveStage");
for (const required of [
  "<strong>k = ${b} · ${r} = ${k}</strong>",
  "<strong>s* = (1/${b})^(1/${r}) = ${lshNumber(star)}</strong>",
  "<strong>P(s*) = ${lshNumber(lshProbCollision(star,b,r))}</strong>",
  "<td>${lshNumber(lshProbMatch(s,r),8)}</td>",
  "<td>${lshNumber(lshProbCollision(s,b,r))}</td>",
  "<strong>${LSH_CORPUS_DOCS}</strong>",
  "<strong>${lshPairTotal()}</strong>",
  "<strong>P = ${lshNumber(row.p)} → ${lshNumber(row.expected,2)} ${tr(\"Kandidaten\")}</strong>",
  "<strong>${report.trueTotal}</strong>",
  "<strong>${lshNumber(report.retrieved,2)}</strong>",
  "<strong>${lshNumber(report.missed,2)}</strong>",
  "<strong>${lshNumber(100*report.recall,2)} %</strong>",
  "<strong>${lshNumber(report.candidates,2)}</strong>",
  "<strong>${lshNumber(report.wasted,2)}</strong>",
  "LSH_SIMS.map", "report.rows.map", "${tr(row.label)}", "${tr(verdict)}"
]) if (!lshCurveRenderer.includes(required)) throw new Error(`lsh-bands curve renderer: must stay data-driven and show ${required}`);
const lshShingleRenderer = sliceDeclaration(source, "lshShingleStage");
for (const required of [
  "<strong>${report.wordsA.length} / ${report.wordsB.length} ${tr(\"Wörter\")}</strong>",
  "<td>${lshNumber(cell.j)}<br>",
  "${cell.inter}/${cell.union} · ${cell.duplicate?tr(\"Duplikat\"):tr(\"behalten\")}",
  "data-pair=\"${report.pair.key}\"",
  "${tr(report.pair.note)}", "LSH_NS.map",
  "${reports.map(report=>`<tr><th scope=\"row\" data-pair=\"${report.pair.key}\">${tr(report.pair.label)}</th>",
  "${reports.map(report=>`<div class=\"calculation-row\"><span>${tr(report.pair.label)}</span><strong>${report.wordsA.length}",
  "<strong>${tr(flip.pair.label)}</strong> · τ = ${lshNumber(tau,1)}"
]) if (!lshShingleRenderer.includes(required)) throw new Error(`lsh-bands shingle renderer: must stay data-driven and show ${required}`);
// Both stages must be reachable, and the mode switch must hide the controls that do not
// belong to the current stage -- a select that changes nothing is a false affordance.
const lshStageSwitch = sliceDeclaration(source, "lshStageMarkup");
if (!/lshMode.*shingles.*lshShingleStage\(\).*lshCurveStage\(\)/su.test(lshStageSwitch))
  throw new Error("lsh-bands: the mode selector must reach both stages");
const lshUpdate = sliceDeclaration(source, "updateLshBands");
for (const required of ["lshBandField", "lshRowField", "lshNormField", "lshStageMarkup()"])
  if (!lshUpdate.includes(required)) throw new Error(`lsh-bands: the mode switch must control ${required}`);
const lshPanel = source.slice(source.indexOf('if(id==="lsh-bands") return'), source.indexOf('if(id==="advantage-normalizers") return'));
for (const required of ["LSH_BANDS.map", "LSH_ROWS.map", "LSH_TAUS.map", "id=\"lshMode\"", "id=\"lshStage\"", "id=\"lshCheck\"", "id=\"lshNorm\""])
  if (!lshPanel.includes(required)) throw new Error(`lsh-bands panel: must build ${required} from the data`);
// The short check has to be answerable and has to persist, like every other objective lab.
const lshCheckSource = sliceDeclaration(source, "checkLshBands");
for (const required of ['cost==="pairOfNumbers"', 'gram==="halfDecision"', 'silent==="noSignal"',
  'user.labChecks["lsh-bands"]=true', "saveUser(true)"])
  if (!lshCheckSource.includes(required)) throw new Error(`lsh-bands short check: must contain ${required}`);
if (!sliceDeclaration(source, "OBJECTIVE_LAB_IDS").includes('"lsh-bands"'))
  throw new Error("lsh-bands: the lab must be registered as an objective lab, otherwise its check never counts");
// Registration. Lecture 14 may claim it, because lecture 14 computes this curve itself.
{
  const mission = base.assignments.find(assignment => assignment.id === "a4").missions.find(entry => entry.id === "dedup");
  if (mission.labs[0] !== "lsh-bands") throw new Error("lsh-bands: the lab has to lead the mission whose scope contains minhash_deduplication");
  if (!mission.scope.includes("minhash_deduplication")) throw new Error("lsh-bands: the mission it leads must be the one that owns the problem");
  if (!base.modules.find(module => module.id === "data").labs.includes("lsh-bands")) throw new Error("lsh-bands: the lab must be listed in the data module");
  if (!(base.lectureGuides?.l14?.labs || []).includes("lsh-bands"))
    throw new Error("lsh-bands: lecture 14 evaluates get_prob_collision in its own trace, so its guide has to carry the lab");
  for (const [id, lecture] of Object.entries(base.lectureGuides || {}))
    if (id !== "l14" && (lecture.labs || []).includes("lsh-bands"))
      throw new Error(`lsh-bands: ${id} must not claim the lab, only lecture 14 derives the banding probability`);
}
console.log(`lsh-bands OK: ${lshValues} values, lecture 14's own b=10/r=10 reproduced, k=100 splits run from ${(100 * lshSeen["t08/2/50"].recall).toFixed(2)} % recall at ${lshSeen["t08/2/50"].candidates.toFixed(2)} candidate pairs to ${(100 * lshSeen["t08/50/2"].recall).toFixed(2)} % at ${lshSeen["t08/50/2"].candidates.toFixed(2)}, and the handout's own license pair crosses tau = 0.8 on the n-gram length alone`);

const assignmentSource = keyed(base.assignments);
for (const [assignmentId, translated] of Object.entries(pack.assignments)) {
  translated.missions.forEach((mission, index) => {
    const original = assignmentSource[assignmentId].missions[index];
    for (const field of ["id", "scope", "concepts", "labs"]) {
      if (JSON.stringify(mission[field]) !== JSON.stringify(original[field])) throw new Error(`assignments.${assignmentId}.missions[${index}].${field}: semantic links changed in translation`);
    }
  });
}

const formulaSource = keyed(base.formulas);
for (const id of ["causal-attention","mfu","arithmetic-intensity","ring-allreduce"]) {
  if (!pack.formulas[id]?.expr || pack.formulas[id].expr === formulaSource[id].expr) throw new Error(`formulas.${id}.expr: English expression is missing`);
}
if (pack.ui?.["Ich weiß es nicht"] !== "I don't know") throw new Error("Diagnostic unknown label is not translated");
for (const key of [
  "Text inklusive Whitespace und Unicode",
  "Roundtrip-Invariante",
  "Serving-Konfiguration",
  "Vollständiger KV-Cache",
  "Vom Reward zum Tokengewicht",
  "Original-Handout-Scope",
  "Arbeitsreihenfolge auf hoher Ebene",
  "Fester Mini-Rollout",
  "Gathered log p und response_mask",
  "Präferenzpaar und Variante",
  "Präferenzpaar (x, y_w, y_l)",
  "DPO-Loss aus Gleichung (3) in simulierter float32-Arithmetik",
  "Die vier Sequenz-Logwahrscheinlichkeiten",
  "Margen, Logit und Loss unter der gewählten Variante",
  "Marge_w der bevorzugten Antwort",
  "Marge_l der abgelehnten Antwort",
  "Referenz nach Gleichung (3)",
  "Was ein einzelnes Testpaar beweisen kann"
]) {
  if (typeof pack.ui?.[key] !== "string" || !pack.ui[key].trim() || pack.ui[key] === key) throw new Error(`ui.${key}: English translation is missing`);
}
const patterns = pack.ui?.__patterns;
if (!Array.isArray(patterns) || patterns.length === 0) throw new Error("Dynamic UI translation patterns are missing");
for (const entry of patterns) {
  if (!entry || typeof entry.source !== "string" || typeof entry.target !== "string") throw new Error("Invalid UI translation pattern");
  new RegExp(entry.source, entry.flags || "");
}
const allowedReviewKeys = ["firstAt", "lastAt", "lastResult"];
const reviewFirst = reviewPolicy.next({}, "good", Date.parse("2026-01-01T00:00:00.000Z"));
const reviewSecond = reviewPolicy.next({...reviewFirst, streak:99, retainedAt:"legacy", firstGoodSessionId:"legacy"}, "again", Date.parse("2026-01-01T00:01:00.000Z"), "ignored-session");
for (const [label, record] of [["first", reviewFirst], ["second", reviewSecond]]) {
  if (JSON.stringify(Object.keys(record)) !== JSON.stringify(allowedReviewKeys)) throw new Error(`review policy.${label}: ratings may only store practice history, never mastery evidence`);
}
if (!reviewPolicy.attempted(reviewFirst) || !reviewPolicy.attempted(reviewSecond)) throw new Error("review policy: valid practice attempts are not recognized");
if (reviewPolicy.attempted({...reviewFirst, lastResult:"arbitrary"})) throw new Error("review policy: arbitrary values must fail closed");
for (const required of [
  "function lectureUsesConcept", "data-lecture-context", "const [view,type,id,lectureId]",
  "detail?.type===\"concept\"&&detail.lectureId", "Prerequisite or refresher for Lecture",
  "Voraussetzung oder Vertiefung für Lecture", "lectureForConcept(c.id,appState.detail?.lectureId)",
  "conceptOrientationMarkup(c,lectureId)", "conceptContinuation(c,lectureId)",
  "conceptCard(concept,id)", "lecturePrerequisitesMarkup(guide,id)"
]) if (!source.includes(required)) throw new Error(`lecture context routing: missing ${required}`);
for (const forbidden of [
  "Learn → Recall → Apply Gate",
  "data-mission-evidence",
  "data-module-evidence",
  "conceptReflection",
  "hypothesisText",
  "Kompetenzstufe",
  "Als angewandt markieren",
  "REVIEW_GAP_FORMAT",
  "firstGoodSessionId",
  "lastGoodSessionId",
  "retainedAt",
  "retentionAnchorAt",
  "reviewSessionId",
  "DIAGNOSTIC_TRANSFER_CHECKS",
  "openPathModules",
  "lectureCoverageOpen",
  "assignmentMissionFocus",
  ".progress-strip",
  ".progress-track",
  ".progress-bar"
]) {
  if (source.includes(forbidden) || englishSource.includes(forbidden)) throw new Error(`Fake learning gate is still present in the UI source or language pack: ${forbidden}`);
}

const englishValues = [];
const collect = value => {
  if (typeof value === "string") englishValues.push(value);
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === "object") Object.values(value).forEach(collect);
};
Object.entries(pack).filter(([key]) => key !== "ui").forEach(([, value]) => collect(value));
Object.entries(pack.ui).forEach(([key, value]) => {
  if (key === "__patterns") value.forEach(entry => englishValues.push(entry.target));
  else if (typeof value === "string") englishValues.push(value);
});
const germanResidue = /[äöüßÄÖÜ]|\b(?:und|zuerst|warum|welche|erkläre|beispiel|typischer|fehler|antwort|sequenzlänge|modellparameter|datenpipeline|ausführlich|wissenslücke|musterlösung)\b/i;
const leaked = englishValues.filter(value => germanResidue.test(value));
if (leaked.length) throw new Error(`German residue in English pack: ${leaked.slice(0, 3).join(" | ")}`);

// --- quality-threshold -------------------------------------------------------
// A4 section 2.6 states four thresholds verbatim and leaves the tokenisation open; lecture 13
// names the fourth of them in its own MassiveWeb section, lecture 14 names 0.17 and 0.8 for one
// and the same fastText classifier and prints GPT-3's keep_document rule. Before this lab the
// platform had zero occurrences of mean_word_length, "stop word", alphabetic, pareto,
// keep_document and no computed confusion matrix at all -- Precision=TP/(TP+FP) existed only as
// a formula card. These guards hold the evaluation and the claims made about it.
const qtNames = ["QT_DOCS", "QT_TOKENIZERS", "QT_RULES", "QT_RULESETS", "QT_AUDIT", "QT_GROUPS",
  "QT_TAUS", "QT_PARETO_A", "QT_KEEP_RULES", "QT_BREAKDOWNS",
  "qtTokenize", "qtMeasure", "qtActiveRules", "qtVerdict", "qtConfusion", "qtTokenizerDiff",
  "qtParetoKeep", "qtDetReport", "qtStochReport", "qtNumber", "qtPercent", "qtRatio"];
const qtApi = runInNewContext(`${numberPrelude}${qtNames.map(name => sliceDeclaration(source, name)).join("\n")}; ({${qtNames.join(",")}})`, {});
const qtShow = value => (value === null ? "n/a" : Number(value).toFixed(8));
let qtValues = 0;

// The four rules, typed here from the handout and not read from the app. "remove documents that
// contain less than 50 or more than 100,000 words / have a mean word length outside the range of
// 3 to 10 characters / have more than 30% of lines ending with an ellipsis / contain less than
// 80% of words with at least one alphabetic character."
const qtRefTokens = (text, mode) => {
  if (mode !== "punct") return text.split(/\s+/).filter(token => token.length > 0);
  const out = []; let buffer = "", kind = null;
  for (const char of text) {
    const next = /\s/.test(char) ? null : /[A-Za-z0-9]/.test(char) ? "w" : "p";
    if (next !== kind) { if (buffer) out.push(buffer); buffer = ""; kind = next; }
    if (next) buffer += char;
  }
  if (buffer) out.push(buffer);
  return out;
};
const qtRefMeasure = (text, mode) => {
  const words = qtRefTokens(text, mode);
  let chars = 0; for (const word of words) chars += [...word].length;
  const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
  let ellipsisLines = 0; for (const line of lines) if (line.slice(-3) === "...") ellipsisLines++;
  let alphaWords = 0; for (const word of words) if (/[a-zA-Z]/.test(word)) alphaWords++;
  return { n: words.length, meanLen: words.length ? chars / words.length : 0, lines: lines.length,
    ellipsisLines, ellipsisFrac: lines.length ? ellipsisLines / lines.length : 0,
    alphaWords, alphaFrac: words.length ? alphaWords / words.length : 0 };
};
const qtRefFired = (m, dropped) => {
  const checks = { count: m.n >= 50 && m.n <= 100000, meanlen: m.meanLen >= 3 && m.meanLen <= 10,
    ellipsis: m.ellipsisFrac <= 0.30, alpha: m.alphaFrac >= 0.80 };
  return Object.keys(checks).filter(key => key !== dropped && !checks[key]);
};
// numpy.random.pareto(a) is the Lomax form, so P(X > t) = (1+t)^(-a); GPT-3 compares against
// t = 1 - score, which makes the keep probability (2 - score)^(-9).
const qtRefPareto = score => 1 / Math.pow(1 + (1 - score), 9);

if (qtApi.QT_DOCS.length !== 8) throw new Error("quality-threshold: the rules mode must keep its eight documents, the transfer answer counts them");
if (qtApi.QT_AUDIT.length !== 12) throw new Error("quality-threshold: the audit set must keep its twelve documents");
if (qtApi.QT_PARETO_A !== 9) throw new Error("quality-threshold: GPT-3's rule draws pareto(9); another shape is a different rule");
// A rule stated with ">=" cannot be tested against ">" unless some document sits exactly on a
// threshold, so one was placed there on purpose; without it the mutation changes no bit.
const qtOnTau = qtApi.QT_AUDIT.filter(doc => qtApi.QT_TAUS.some(entry => entry.tau === doc.score));
if (!qtOnTau.length) throw new Error("quality-threshold: at least one audit document must sit exactly on a selectable threshold, otherwise the boundary of score >= tau is never exercised");
for (const doc of qtOnTau) {
  const entry = qtApi.QT_TAUS.find(item => item.tau === doc.score);
  const report = qtApi.qtDetReport(entry.tau, qtApi.QT_AUDIT);
  const strict = qtApi.QT_AUDIT.filter(item => item.score > entry.tau).length;
  if (report.keptDocs === strict) throw new Error("quality-threshold: the document on the threshold must be kept, the handout rule is score >= tau");
}

// The thresholds themselves, probed at their exact boundaries instead of matched as strings.
const qtRule = key => qtApi.QT_RULES.find(rule => rule.key === key);
const qtProbe = (key, patch) => qtRule(key).test({ n: 100, meanLen: 5, ellipsisFrac: 0, alphaFrac: 1, ...patch });
if (!qtProbe("count", { n: 50 }) || qtProbe("count", { n: 49 })) throw new Error("quality-threshold: the lower word bound must be exactly 50, that is the handout's 'less than 50'");
if (!qtProbe("count", { n: 100000 }) || qtProbe("count", { n: 100001 })) throw new Error("quality-threshold: the upper word bound must be exactly 100000");
if (!qtProbe("meanlen", { meanLen: 3 }) || qtProbe("meanlen", { meanLen: 2.999 })) throw new Error("quality-threshold: the mean word length range must start at exactly 3");
if (!qtProbe("meanlen", { meanLen: 10 }) || qtProbe("meanlen", { meanLen: 10.001 })) throw new Error("quality-threshold: the mean word length range must end at exactly 10");
if (!qtProbe("ellipsis", { ellipsisFrac: 0.30 }) || qtProbe("ellipsis", { ellipsisFrac: 0.301 })) throw new Error("quality-threshold: the ellipsis rule must fire above exactly 30 %, the handout says 'more than 30%'");
if (!qtProbe("alpha", { alphaFrac: 0.80 }) || qtProbe("alpha", { alphaFrac: 0.799 })) throw new Error("quality-threshold: the alphabetic share must be exactly 80 %, lecture 13 names that number too");

// Every measured quantity and every verdict against the independent reference.
const qtRulesetDrop = {};
qtApi.QT_RULESETS.forEach(entry => { qtRulesetDrop[entry.key] = entry.drop; });
for (const tokenizer of qtApi.QT_TOKENIZERS) for (const doc of qtApi.QT_DOCS) {
  const got = qtApi.qtMeasure(doc.text, tokenizer.key), want = qtRefMeasure(doc.text, tokenizer.key);
  for (const field of ["n", "meanLen", "lines", "ellipsisLines", "ellipsisFrac", "alphaWords", "alphaFrac"]) {
    qtValues++;
    if (qtShow(got[field]) !== qtShow(want[field]))
      throw new Error(`quality-threshold: ${field} of ${doc.key} under ${tokenizer.key} differs from the reference`);
  }
  for (const ruleset of qtApi.QT_RULESETS) {
    const verdict = qtApi.qtVerdict(doc, tokenizer.key, ruleset);
    const fired = qtRefFired(want, qtRulesetDrop[ruleset.key]);
    qtValues += 2;
    if (verdict.fired.map(rule => rule.key).join(",") !== fired.join(","))
      throw new Error(`quality-threshold: the rules firing on ${doc.key}/${tokenizer.key}/${ruleset.key} differ from the reference`);
    if (verdict.keep !== (fired.length === 0))
      throw new Error(`quality-threshold: the verdict on ${doc.key}/${tokenizer.key}/${ruleset.key} differs from the reference`);
  }
}
const qtSeen = {};
for (const tokenizer of qtApi.QT_TOKENIZERS) for (const ruleset of qtApi.QT_RULESETS) {
  const got = qtApi.qtConfusion(tokenizer.key, ruleset);
  let tp = 0, fp = 0, fn = 0, tn = 0;
  for (const doc of qtApi.QT_DOCS) {
    const removed = qtRefFired(qtRefMeasure(doc.text, tokenizer.key), qtRulesetDrop[ruleset.key]).length > 0;
    const shouldRemove = doc.human === "drop";
    if (removed && shouldRemove) tp++; else if (removed) fp++; else if (shouldRemove) fn++; else tn++;
  }
  qtValues += 7;
  if (got.tp !== tp || got.fp !== fp || got.fn !== fn || got.tn !== tn)
    throw new Error(`quality-threshold: the confusion matrix for ${tokenizer.key}/${ruleset.key} differs from the reference`);
  if (qtShow(got.precision) !== qtShow(tp + fp ? tp / (tp + fp) : null))
    throw new Error(`quality-threshold: precision for ${tokenizer.key}/${ruleset.key} differs from the reference`);
  if (qtShow(got.recall) !== qtShow(tp + fn ? tp / (tp + fn) : null))
    throw new Error(`quality-threshold: recall for ${tokenizer.key}/${ruleset.key} differs from the reference`);
  if (qtShow(got.keepRate) !== qtShow((tn + fn) / qtApi.QT_DOCS.length))
    throw new Error(`quality-threshold: the keep rate for ${tokenizer.key}/${ruleset.key} differs from the reference`);
  qtSeen[`${tokenizer.key}/${ruleset.key}`] = got;
}

// The claim of the lab note and of the transfer answer: switching the tokenisation moves two
// verdicts and two reason codes while no rule and no threshold changes.
const qtDiff = qtApi.qtTokenizerDiff(qtApi.QT_RULESETS[0]);
if (qtDiff.flipped !== 2 || qtDiff.reasonOnly !== 2)
  throw new Error(`quality-threshold: the lab claims two changed verdicts and two changed reason codes, the data give ${qtDiff.flipped} and ${qtDiff.reasonOnly}`);
const qtWs = qtSeen["whitespace/all"], qtPunct = qtSeen["punct/all"];
if (qtShow(qtWs.recall) !== qtShow(qtPunct.recall))
  throw new Error("quality-threshold: the point of the comparison is that recall stays put while precision and keep rate move");
if (!(qtPunct.precision < qtWs.precision) || !(qtPunct.keepRate < qtWs.keepRate))
  throw new Error("quality-threshold: the punctuation tokenisation must cost precision and data, otherwise the transfer answer is wrong");
if (qtShow(qtWs.precision) !== qtShow(0.75) || qtShow(qtPunct.precision) !== qtShow(0.5)
  || qtShow(qtWs.keepRate) !== qtShow(0.5) || qtShow(qtPunct.keepRate) !== qtShow(0.25))
  throw new Error("quality-threshold: the transfer answer quotes 0.7500/50.00 % against 0.5000/25.00 %; the data no longer say that");
// The two documents that flip are the ones the transfer answer names by hand.
const qtFlipped = qtApi.QT_DOCS.filter(doc =>
  qtApi.qtVerdict(doc, "whitespace", qtApi.QT_RULESETS[0]).keep !== qtApi.qtVerdict(doc, "punct", qtApi.QT_RULESETS[0]).keep).map(doc => doc.key);
if (qtFlipped.join(",") !== "codedoc,forum")
  throw new Error(`quality-threshold: the transfer answer names the technical documentation and the forum post as the flips, the data flip ${qtFlipped.join(",")}`);
for (const key of qtFlipped) {
  const doc = qtApi.QT_DOCS.find(entry => entry.key === key);
  if (doc.human !== "keep") throw new Error(`quality-threshold: ${key} only makes the point if a human would keep it`);
  if (!qtApi.qtVerdict(doc, "punct", qtApi.QT_RULESETS[0]).fired.some(rule => rule.key === "alpha"))
    throw new Error(`quality-threshold: ${key} must lose on the alphabetic share, that is the sentence in the transfer answer`);
}
// The bridge into mode B: a document that passes every rule under both tokenisations and that a
// human would still throw away. Without it the classifier has no motivation in this lab.
const qtBridge = qtApi.QT_DOCS.filter(doc => doc.human === "drop"
  && qtApi.qtVerdict(doc, "whitespace", qtApi.QT_RULESETS[0]).keep
  && qtApi.qtVerdict(doc, "punct", qtApi.QT_RULESETS[0]).keep);
if (!qtBridge.length) throw new Error("quality-threshold: at least one document must survive all four rules and still be junk, otherwise mode B has no reason to exist");
// The rule you cannot see by hand: the upper word bound never fires on a hand-inspected sample.
if (qtApi.QT_DOCS.some(doc => qtApi.qtMeasure(doc.text, "whitespace").n > 100000 || qtApi.qtMeasure(doc.text, "punct").n > 100000))
  throw new Error("quality-threshold: no constructed document may reach the 100000 word bound, the lab says that rule stays invisible here");
// Exactly one of the four rules is independent of the tokenisation, and it is the line-based one.
for (const doc of qtApi.QT_DOCS) {
  const a = qtRefMeasure(doc.text, "whitespace"), b = qtRefMeasure(doc.text, "punct");
  if (qtShow(a.ellipsisFrac) !== qtShow(b.ellipsisFrac))
    throw new Error("quality-threshold: the ellipsis rule counts lines, so it must not move with the tokenisation");
}
// Two different switch-offs that report the same four numbers and still lose different
// documents -- lecture 12's "look at the individual instances" as a case you can compute.
const qtSummary = key => { const c = qtSeen[`whitespace/${key}`]; return `${c.tp}/${c.fp}/${c.fn}/${c.tn}`; };
const qtKept = key => qtApi.QT_DOCS.filter(doc =>
  qtApi.qtVerdict(doc, "whitespace", qtApi.QT_RULESETS.find(entry => entry.key === key)).keep).map(doc => doc.key).join(",");
let qtTwins = 0;
for (let i = 0; i < qtApi.QT_RULESETS.length; i++) for (let j = i + 1; j < qtApi.QT_RULESETS.length; j++) {
  const a = qtApi.QT_RULESETS[i].key, b = qtApi.QT_RULESETS[j].key;
  if (qtSummary(a) === qtSummary(b) && qtKept(a) !== qtKept(b)) qtTwins++;
}
if (!qtTwins) throw new Error("quality-threshold: two rule sets must report the same confusion matrix while losing different documents, that is the observe instruction");

// Mode B: every threshold against the reference, on the whole set and on both origin groups.
const qtSubsets = [["all", qtApi.QT_AUDIT], ...qtApi.QT_GROUPS.map(group => [group.key, qtApi.QT_AUDIT.filter(doc => doc.group === group.key)])];
const qtDet = {};
for (const entry of qtApi.QT_TAUS) for (const [name, subset] of qtSubsets) {
  const got = qtApi.qtDetReport(entry.tau, subset);
  let tp = 0, fp = 0, fn = 0, tn = 0, keptTokens = 0, totalTokens = 0;
  for (const doc of subset) {
    totalTokens += doc.tokens;
    const kept = doc.score >= entry.tau, good = doc.truth === "high";
    if (kept) keptTokens += doc.tokens;
    if (kept && good) tp++; else if (kept) fp++; else if (good) fn++; else tn++;
  }
  qtValues += 7;
  if (got.tp !== tp || got.fp !== fp || got.fn !== fn || got.tn !== tn)
    throw new Error(`quality-threshold: the confusion matrix at ${entry.key}/${name} differs from the reference`);
  if (qtShow(got.precision) !== qtShow(tp + fp ? tp / (tp + fp) : null))
    throw new Error(`quality-threshold: precision at ${entry.key}/${name} differs from the reference`);
  if (qtShow(got.recall) !== qtShow(tp + fn ? tp / (tp + fn) : null))
    throw new Error(`quality-threshold: recall at ${entry.key}/${name} differs from the reference`);
  if (got.keptTokens !== keptTokens || qtShow(got.tokenShare) !== qtShow(keptTokens / totalTokens))
    throw new Error(`quality-threshold: the token share at ${entry.key}/${name} differs from the reference`);
  qtDet[`${entry.key}/${name}`] = got;
}
// Check question 1: several thresholds with the same perfect precision and different recall.
const qtPerfect = qtApi.QT_TAUS.filter(entry => qtShow(qtDet[`${entry.key}/all`].precision) === qtShow(1));
if (qtPerfect.length < 3) throw new Error("quality-threshold: at least three thresholds must report precision 1.000000, otherwise the first short check has no case");
const qtRecalls = new Set(qtPerfect.map(entry => qtShow(qtDet[`${entry.key}/all`].recall)));
if (qtRecalls.size !== qtPerfect.length)
  throw new Error("quality-threshold: the thresholds with perfect precision must differ in recall, that is the whole point of the first short check");
const qtShares = new Set(qtPerfect.map(entry => qtShow(qtDet[`${entry.key}/all`].tokenShare)));
if (qtShares.size !== qtPerfect.length)
  throw new Error("quality-threshold: the thresholds with perfect precision must differ in token share as well");
for (const [key, recall, share] of [["t050", 0.5714285714285714, 0.3592814371257485], ["t080", 0.2857142857142857, 0.20958083832335328], ["t095", 0.14285714285714285, 0.08383233532934131]]) {
  if (qtShow(qtDet[`${key}/all`].recall) !== qtShow(recall) || qtShow(qtDet[`${key}/all`].tokenShare) !== qtShow(share))
    throw new Error(`quality-threshold: the first short check quotes recall and token share at ${key}; the data no longer say that`);
}
// Check question 3: the setting with the perfect overall precision empties one origin group.
const qtCollapse = qtApi.QT_TAUS.filter(entry => qtApi.QT_GROUPS.some(group => qtShow(qtDet[`${entry.key}/${group.key}`].recall) === qtShow(0))
  && qtShow(qtDet[`${entry.key}/all`].precision) === qtShow(1));
if (!qtCollapse.length) throw new Error("quality-threshold: no threshold combines perfect overall precision with a subgroup recall of zero, the third short check has no case");
if (!qtCollapse.some(entry => entry.key === "t050"))
  throw new Error("quality-threshold: the third short check names tau = 0.50 as the collapsing setting");
if (qtShow(qtDet["t050/informal"].recall) !== qtShow(0) || qtShow(qtDet["t050/formal"].recall) !== qtShow(1))
  throw new Error("quality-threshold: at tau = 0.50 the informal group must be at recall 0.000000 and the formal one at 1.000000");
if (qtDet["t050/informal"].precision !== null)
  throw new Error("quality-threshold: with nothing kept, precision must stay undefined rather than be printed as a number");
// Lecture 14 quotes 0.17 and 0.8 for one and the same classifier; both must be reachable, and
// the lower one must be the reading that keeps every usable document.
for (const tau of [0.17, 0.8, 0.5]) if (!qtApi.QT_TAUS.some(entry => entry.tau === tau))
  throw new Error(`quality-threshold: tau = ${tau} must stay selectable, the lab and the lecture both name it`);
for (const group of qtApi.QT_GROUPS) if (qtShow(qtDet[`t017/${group.key}`].recall) !== qtShow(1))
  throw new Error("quality-threshold: at tau = 0.17 no usable document may be lost in either group, that is the lecture's 'math' reading");

// GPT-3's rule, against the survival function typed from the lecture line.
for (const doc of qtApi.QT_AUDIT) {
  qtValues++;
  if (qtShow(qtApi.qtParetoKeep(doc.score)) !== qtShow(qtRefPareto(doc.score)))
    throw new Error(`quality-threshold: the keep probability of ${doc.key} differs from (2 - score)^(-9)`);
}
if (qtShow(qtApi.qtParetoKeep(0)) !== qtShow(1 / 512) || qtShow(qtApi.qtParetoKeep(1)) !== qtShow(1))
  throw new Error("quality-threshold: the lab prints P(keep) = 0.001953125 at score 0 and 1 at score 1");
if (!(qtApi.qtParetoKeep(0) > 0)) throw new Error("quality-threshold: the stochastic rule never rejects with certainty, that is what the lab says about it");
if (qtShow(qtApi.qtParetoKeep(0.5)).slice(0, 8) !== "0.026012")
  throw new Error("quality-threshold: the lab quotes P(keep) = 0.026012 at score 0.50 against the reflex of half a document");
for (const [name, subset] of qtSubsets) {
  const got = qtApi.qtStochReport(subset);
  let expDocs = 0, expTokens = 0, expGood = 0, totalTokens = 0, goodDocs = 0;
  for (const doc of subset) {
    const p = qtRefPareto(doc.score);
    expDocs += p; expTokens += p * doc.tokens; totalTokens += doc.tokens;
    if (doc.truth === "high") { expGood += p; goodDocs++; }
  }
  qtValues += 4;
  if (qtShow(got.expDocs) !== qtShow(expDocs) || qtShow(got.expTokens) !== qtShow(expTokens)
    || qtShow(got.expGood) !== qtShow(expGood) || got.goodDocs !== goodDocs)
    throw new Error(`quality-threshold: the expected values for ${name} differ from the reference`);
}
if (!(qtApi.qtStochReport(qtApi.QT_AUDIT).expDocs < qtDet["t080/all"].keptDocs))
  throw new Error("quality-threshold: the lab says the rule without a threshold is stricter than tau = 0.80 in expected documents");

// Registration. Lectures 13 and 14 are the only two that teach these rules and this threshold;
// the trace of lecture 13 names the 80 % alphabetic rule and lecture 14 names 0.17 / 0.8 and
// keep_document. Any further lecture would be a claim the PDFs do not carry.
const qtLab = base.labs.find(lab => lab.id === "quality-threshold");
if (!qtLab) throw new Error("quality-threshold: the lab is gone");
if (qtLab.module !== "data") throw new Error("quality-threshold: the lab belongs to the data module");
const qtLectures = Object.entries(base.lectureGuides).filter(([, guide]) => (guide.labs || []).includes("quality-threshold")).map(([id]) => id).sort();
if (qtLectures.join(",") !== "l13,l14")
  throw new Error(`quality-threshold: exactly lectures 13 and 14 may carry this lab, found ${qtLectures.join(",") || "none"}`);
if (!base.modules.find(entry => entry.id === "data").labs.includes("quality-threshold"))
  throw new Error("quality-threshold: the data module must list the lab");
const qtAssignment = base.assignments.find(assignment => assignment.id === "a4");
for (const missionId of ["safety-filters", "quality-classifier"]) {
  const mission = qtAssignment.missions.find(entry => entry.id === missionId);
  if (!mission) throw new Error(`quality-threshold: mission ${missionId} is gone`);
  if (mission.labs[0] !== "quality-threshold")
    throw new Error(`quality-threshold: the lab must lead the labs of ${missionId}; it is the only one built for those problems`);
}
if (!sliceDeclaration(source, "OBJECTIVE_LAB_IDS").includes('"quality-threshold"'))
  throw new Error("quality-threshold: the lab must offer an objective short check");

// Renderers. A guard that only asks whether a number is computed does not ask whether it is
// shown, so every one of these demands the full markup fragment at its place.
const qtRulesRenderer = sliceDeclaration(source, "renderQualityThresholdRules");
const qtScoreRenderer = sliceDeclaration(source, "renderQualityThresholdScore");
const qtMarkupChecks = [
  [qtRulesRenderer, '<td>${rule.value(verdict.m)}<br><span class="small muted">${off?tr("Regel aus"):fired?tr("greift"):tr("passiert")}</span></td>', "the measured value and the per-rule state must reach the table"],
  [qtRulesRenderer, '<div class="calculation-row"><span>Precision = TP/(TP+FP)</span><strong>${qtRatio(confusion.precision)}</strong></div>', "the rules mode must print precision"],
  [qtRulesRenderer, '<div class="calculation-row"><span>Recall = TP/(TP+FN)</span><strong>${qtRatio(confusion.recall)}</strong></div>', "the rules mode must print recall"],
  [qtRulesRenderer, '<div class="calculation-row"><span>${tr("Behaltequote")}</span><strong>${qtPercent(confusion.keepRate)} %</strong></div>', "the rules mode must print the keep rate"],
  [qtRulesRenderer, '<div class="calculation-row"><span>${tr(other.label)}</span><strong>P = ${qtRatio(otherConfusion.precision)} · R = ${qtRatio(otherConfusion.recall)} · ${qtPercent(otherConfusion.keepRate)} %</strong></div>', "the other tokenisation must be shown next to the current one, otherwise the comparison is invisible"],
  [qtRulesRenderer, '<div class="calculation-row"><span>${tr("Dokumente mit anderem Urteil")}</span><strong>${diff.flipped} ${tr("von")} ${QT_DOCS.length}</strong></div>', "the number of changed verdicts must be shown"],
  [qtRulesRenderer, '<div class="calculation-row"><span>${tr("Dokumente mit gleichem Urteil, anderem Reason Code")}</span><strong>${diff.reasonOnly} ${tr("von")} ${QT_DOCS.length}</strong></div>', "the number of changed reason codes must be shown"],
  [qtRulesRenderer, '<pre data-no-i18n>${esc(doc.text)}</pre>', "the documents themselves must be readable, every number above is measured on them"],
  [qtRulesRenderer, 'Positivklasse ausdrücklich', "the positive class of the rules mode must stay named"],
  [qtScoreRenderer, 'P(keep) = ${qtNumber(qtParetoKeep(doc.score),6)}', "the stochastic rule must print a keep probability per document"],
  [qtScoreRenderer, '<div class="calculation-row"><span>Precision = TP/(TP+FP)</span><strong>${qtRatio(report.precision,6)}</strong></div>', "the score mode must print precision"],
  [qtScoreRenderer, '<div class="calculation-row"><span>Recall = TP/(TP+FN)</span><strong>${qtRatio(report.recall,6)}</strong></div>', "the score mode must print recall"],
  [qtScoreRenderer, '<div class="calculation-row"><span>${tr("Behaltene Tokens")}</span><strong>${report.keptTokens} ${tr("von")} ${report.totalTokens} = ${qtPercent(report.tokenShare)} %</strong></div>', "the score mode must print the token share, that is the number the training run feels"],
  [qtScoreRenderer, '<div class="calculation-row"><span>${tr("Erwartete behaltene Dokumente")}</span><strong>${qtNumber(report.expDocs,6)} ${tr("von")} ${report.total}</strong></div>', "the expected number of kept documents must be shown"],
  [qtScoreRenderer, '<div class="calculation-row"><span>${tr("Zum Vergleich")}: ${tr(tauEntry.label)}</span><strong>${comparison.keptDocs} ${tr("Dokumente")} · ${qtPercent(comparison.tokenShare)} %</strong></div>', "under the stochastic rule the threshold must stay comparable, otherwise the dial is dead"],
  [qtScoreRenderer, 'konstruierte Annotationen', "the audit set must stay declared as constructed"]
];
for (const [renderer, fragment, why] of qtMarkupChecks) {
  if (!renderer.includes(fragment)) throw new Error(`quality-threshold: ${why}`);
}
// Layout. The eight documents are shown verbatim and must not wrap -- the ellipsis rule counts
// lines. They therefore need their own horizontal scroller, and .lab-stage needs min-width: 0,
// because as a grid item its automatic minimum size would otherwise let them widen the whole
// page. That was a latent bug of the shared class; no earlier lab put non-wrapping content in it.
const qtStyle = source.slice(source.indexOf("<style>"), source.indexOf("</style>"));
if (!/\.lab-stage \{[^}]*min-width: 0;/.test(qtStyle))
  throw new Error("quality-threshold: .lab-stage needs min-width: 0, otherwise non-wrapping content widens the whole page instead of scrolling inside itself");
if (!/\.qt-doc pre \{[^}]*overflow-x: auto;/.test(qtStyle))
  throw new Error("quality-threshold: the document blocks need their own horizontal scroller");
if (!/\.qt-doc pre \{[^}]*white-space: pre;/.test(qtStyle))
  throw new Error("quality-threshold: the documents must not wrap, the ellipsis rule counts line ends");
if (!sliceDeclaration(source, "renderQualityThresholdRules").includes(`<details class="qt-doc">`))
  throw new Error("quality-threshold: the documents must be rendered in the class the stylesheet scopes");

// The subgroup ledger has to be reachable from the controls, not only from the data.
if (!qtScoreRenderer.includes('breakdown.key==="group"'))
  throw new Error("quality-threshold: the score mode must be able to split by origin group");
if (!qtApi.QT_BREAKDOWNS.some(entry => entry.key === "group"))
  throw new Error("quality-threshold: the origin split must stay selectable");
if (!qtApi.QT_KEEP_RULES.some(entry => entry.key === "pareto"))
  throw new Error("quality-threshold: GPT-3's rule must stay selectable");

console.log(`quality-threshold OK: ${qtValues} values, ${qtDiff.flipped} verdicts and ${qtDiff.reasonOnly} reason codes move on the tokenisation alone (P ${qtWs.precision.toFixed(4)} -> ${qtPunct.precision.toFixed(4)} at unchanged recall ${qtWs.recall.toFixed(4)}), ${qtPerfect.length} thresholds share precision 1.000000 with recalls ${qtPerfect.map(entry => qtDet[`${entry.key}/all`].recall.toFixed(6)).join("/")}, and tau = 0.50 leaves the informal group at recall ${qtDet["t050/informal"].recall.toFixed(6)}`);

const missionCount = base.assignments.reduce((total, assignment) => total + (assignment.missions || []).length, 0);
console.log(`i18n OK: ${expectedIds.concepts.length} concepts, ${expectedIds.formulas.length} formulas, ${expectedIds.symbols.length} symbols, ${expectedIds.glossary.length} glossary entries, ${expectedIds.labs.length} labs, ${missionCount} missions, ${Object.keys(pack.ui).length - 1} UI strings`);

// --- compression-ratio -------------------------------------------------------
// Lecture 1 defines get_compression_ratio(string, indices) = num_bytes/num_tokens in its own
// trace, calls it for four tokenizer designs and writes "assert compression_ratio == 1" on the
// byte tokenizer. A1 section 2.7 asks for that same number twice (matched and crossed tokenizer),
// for a throughput estimate extrapolated to the Pile (825 GB) and for the uint16 justification.
// Before this lab the platform had zero occurrences of "bytes/token", "compression" and
// "bytes/second"; tokenizer-tradeoffs was prose only. The BPE below is written here from A1's
// contract and not read from the app, so a change to the app's trainer has to show up as a diff.
const crNames = ["CR_DESIGNS", "CR_TEXTS", "CR_CORPORA", "CR_MERGE_STEPS", "CR_RATES",
  "CR_PILE_BYTES", "CR_DATASET_BYTES", "CR_TOKEN_BUDGET", "CR_UINT16_BYTES",
  "CR_DEMO_CORPUS", "CR_DEMO_MERGES",
  "crBytes", "crRatio", "crPretokens", "crCharacterTokens", "crByteTokens", "crWordTokens",
  "crApplyMerge", "crTrainBpe", "crEncodeBpe", "crTokenize", "crBpeCache", "crTokenizerFor",
  "crBudget", "crNumber", "crPercent", "crGiB", "crMiB", "crMillions", "crHours"];
const crApi = runInNewContext(`${numberPrelude}${crNames.map(name => sliceDeclaration(source, name)).join("\n")}; ({${crNames.join(",")}})`, { TextEncoder });
const crShow = value => Number(value).toFixed(8);
let crValues = 0;

// Independent reference: byte-level BPE, tokens as Latin-1 strings over byte values so that "<"
// is byte-lexicographic order, which is what A1's tie-break compares.
const crRefBytes = text => [...new TextEncoder().encode(text)].map(value => String.fromCharCode(value));
const crRefPieces = text => text.match(/ ?[^\s]+|\s+/g) || [];
const crRefApply = (tokens, first, second) => {
  const out = [];
  for (let index = 0; index < tokens.length; index++) {
    if (index < tokens.length - 1 && tokens[index] === first && tokens[index + 1] === second) { out.push(first + second); index++; }
    else out.push(tokens[index]);
  }
  return out;
};
const crRefTrain = (corpus, requested) => {
  let words = crRefPieces(corpus).map(piece => crRefBytes(piece));
  const merges = [];
  for (let step = 0; step < requested; step++) {
    const counts = new Map();
    for (const word of words) for (let index = 0; index < word.length - 1; index++) {
      const key = word[index].length + "|" + word[index] + word[index + 1], seen = counts.get(key);
      if (seen) seen.count++; else counts.set(key, { first: word[index], second: word[index + 1], count: 1 });
    }
    let best = null;
    for (const entry of counts.values()) {
      if (!best || entry.count > best.count || (entry.count === best.count && entry.first + entry.second > best.first + best.second)) best = entry;
    }
    if (!best || best.count < 2) break;
    merges.push([best.first, best.second]);
    words = words.map(word => crRefApply(word, best.first, best.second));
  }
  return merges;
};
const crRefEncode = (text, merges) => {
  let total = 0;
  for (const piece of crRefPieces(text)) {
    let tokens = crRefBytes(piece);
    for (const [first, second] of merges) tokens = crRefApply(tokens, first, second);
    total += tokens.length;
  }
  return total;
};

// The definition itself. Lecture 1 divides bytes by tokens, in that order.
if (crShow(crApi.crRatio(20, 8)) !== crShow(20 / 8))
  throw new Error("compression-ratio: the ratio must be num_bytes / num_tokens, lecture 1 divides in that order");
if (crApi.CR_UINT16_BYTES !== 2)
  throw new Error("compression-ratio: uint16 is two bytes per ID; another width makes the file-size row a different claim");
if (crApi.CR_PILE_BYTES !== 825 * Math.pow(1024, 3))
  throw new Error("compression-ratio: A1 names the Pile at 825 GB, the extrapolation quotes that size");

// Mode A. num_bytes is UTF-8 length, never the character count -- the two agree on ASCII only.
const crAscii = crApi.CR_TEXTS.find(entry => entry.key === "ascii");
const crCjk = crApi.CR_TEXTS.find(entry => entry.key === "cjk");
if (!crAscii || !crCjk) throw new Error("compression-ratio: mode A needs its ASCII and its non-ASCII string, the comparison rests on them");
if (crApi.crBytes(crAscii.text).length !== [...crAscii.text].length)
  throw new Error("compression-ratio: the ASCII string must have one byte per character, otherwise it is not the ASCII case");
if (crApi.crBytes(crCjk.text).length === [...crCjk.text].length)
  throw new Error("compression-ratio: the non-ASCII string must cost more bytes than characters, that is the whole point of the row");
// Lecture 1's own two strings have to stay in the lab; they are what makes it PDF-faithful.
if (!crApi.CR_TEXTS.some(entry => entry.text.includes("supercalifragilisticexpialidocious")))
  throw new Error("compression-ratio: lecture 1's word-tokenizer string must stay selectable");
if (!crApi.CR_TEXTS.some(entry => entry.text.startsWith("Hello,")))
  throw new Error("compression-ratio: lecture 1's own tokenization string must stay selectable");

const crDemo = crRefTrain(crApi.CR_DEMO_CORPUS, crApi.CR_DEMO_MERGES);
const crAppDemo = crApi.crTrainBpe(crApi.CR_DEMO_CORPUS, crApi.CR_DEMO_MERGES);
if (crAppDemo.length !== crDemo.length)
  throw new Error("compression-ratio: the app's trainer and the reference disagree on the demo corpus");
const crByteRow = [], crCharRow = [];
for (const entry of crApi.CR_TEXTS) {
  const numBytes = crApi.crBytes(entry.text).length;
  for (const design of crApi.CR_DESIGNS) {
    const numTokens = crApi.crTokenize(entry.text, design.key, crAppDemo);
    const reference = design.key === "character" ? [...entry.text].length
      : design.key === "byte" ? numBytes
      : design.key === "word" ? (entry.text.match(/[\p{L}\p{N}_]+|[\s\S]/gu) || []).length
      : crRefEncode(entry.text, crDemo);
    if (numTokens !== reference)
      throw new Error(`compression-ratio: ${design.key} on ${entry.key} gives ${numTokens}, the reference gives ${reference}`);
    crValues++;
  }
  // Lecture 1 writes "assert compression_ratio == 1" here, so this is exact, not approximate.
  const byteRatio = crApi.crRatio(numBytes, crApi.crTokenize(entry.text, "byte", crAppDemo));
  if (byteRatio !== 1)
    throw new Error(`compression-ratio: the byte tokenizer must give exactly 1 on ${entry.key}, lecture 1 asserts it`);
  crByteRow.push(crApi.crNumber(byteRatio, 2));
  crCharRow.push(crApi.crNumber(crApi.crRatio(numBytes, crApi.crTokenize(entry.text, "character", crAppDemo)), 2));
}
// The observe instruction claims the two designs are indistinguishable on some strings and
// separated on others. Both halves must be true, or the instruction sends the reader nowhere.
const crHidden = crApi.CR_TEXTS.filter((entry, index) => crByteRow[index] === crCharRow[index]);
const crExposed = crApi.CR_TEXTS.filter((entry, index) => crByteRow[index] !== crCharRow[index]);
if (!crHidden.length || !crExposed.length)
  throw new Error(`compression-ratio: byte and character must coincide on at least one string and differ on at least one; got ${crHidden.length} hidden and ${crExposed.length} exposed`);

// Mode B. Every cell of the 2x2 against the reference, at every selectable merge count.
const crCell = {};
for (const step of crApi.CR_MERGE_STEPS) {
  for (const trainedOn of crApi.CR_CORPORA) {
    const model = crApi.crTokenizerFor(trainedOn.key, step.merges);
    const reference = crRefTrain(trainedOn.train, step.merges);
    if (model.learned !== reference.length)
      throw new Error(`compression-ratio: ${trainedOn.key} at ${step.merges} learns ${model.learned} merges, the reference learns ${reference.length}`);
    if (model.vocab !== 256 + reference.length)
      throw new Error(`compression-ratio: V must be 256 + learned merges, byte-level BPE starts from the full byte alphabet`);
    for (const target of crApi.CR_CORPORA) {
      const numBytes = crApi.crBytes(target.held).length;
      const numTokens = crApi.crEncodeBpe(target.held, model.merges);
      if (numTokens !== crRefEncode(target.held, reference))
        throw new Error(`compression-ratio: encoding ${target.key} with the ${trainedOn.key} tokenizer at ${step.merges} differs from the reference`);
      crCell[`${step.key}/${trainedOn.key}/${target.key}`] = { numBytes, numTokens, ratio: crApi.crRatio(numBytes, numTokens) };
      crValues++;
    }
    // A tokenizer measured on its own training text flatters itself; the lab says it measures
    // held-out text only, so the held-out text must not be a slice of the training text.
    if (trainedOn.train.includes(trainedOn.held))
      throw new Error(`compression-ratio: the held-out text of ${trainedOn.key} must not appear in its training text`);
  }
}
// Merge saturation: past the point where no pair repeats, a larger request buys nothing. That is
// the claim under "requested against learned", and it is what makes V an upper bound.
const crLast = crApi.CR_MERGE_STEPS[crApi.CR_MERGE_STEPS.length - 1];
const crSaturated = crApi.CR_CORPORA.filter(entry =>
  crApi.crTokenizerFor(entry.key, crLast.merges).learned < crLast.merges);
if (crSaturated.length !== crApi.CR_CORPORA.length)
  throw new Error("compression-ratio: at the largest merge count every corpus must have run out of repeated pairs, otherwise the saturation note is unsupported");
if (crApi.CR_MERGE_STEPS.every(step => crApi.crTokenizerFor(crApi.CR_CORPORA[0].key, step.merges).learned === crApi.crTokenizerFor(crApi.CR_CORPORA[0].key, crApi.CR_MERGE_STEPS[0].merges).learned))
  throw new Error("compression-ratio: the merge dial must still change something at the low end, otherwise it is a dead control");

// The two surcharges quoted in check question 2 and in the observe instruction. They are the
// point of the mode: the same swap, two different prices, and the direction is what decides.
const crDefault = crApi.CR_MERGE_STEPS.find(step => step.key === "m128");
if (!crDefault) throw new Error("compression-ratio: the check questions quote the 128-merge setting, it must stay selectable");
const crPenalty = {};
for (const target of crApi.CR_CORPORA) {
  const matched = crCell[`${crDefault.key}/${target.key}/${target.key}`];
  const other = crApi.CR_CORPORA.find(entry => entry.key !== target.key);
  const crossed = crCell[`${crDefault.key}/${other.key}/${target.key}`];
  if (crossed.numTokens <= matched.numTokens)
    throw new Error(`compression-ratio: the crossed tokenizer must cost more tokens on ${target.key}, otherwise the matched/crossed framing is wrong`);
  crPenalty[target.key] = crApi.crPercent(crossed.numTokens / matched.numTokens - 1);
}
if (crPenalty.stories !== "36.63" || crPenalty.web !== "12.79")
  throw new Error(`compression-ratio: check question 2 quotes +36.63 % and +12.79 %; the data give +${crPenalty.stories} % and +${crPenalty.web} %`);
if (crPenalty.stories === crPenalty.web)
  throw new Error("compression-ratio: the two surcharges must differ, the whole answer is that the price belongs to the measured text");

// The budget rows quoted in check question 3 and in the transfer answer.
const crStoriesMatched = crCell[`${crDefault.key}/stories/stories`], crStoriesCrossed = crCell[`${crDefault.key}/web/stories`];
const crBudgetMatched = crApi.crBudget(crStoriesMatched.numBytes, crStoriesMatched.numTokens);
const crBudgetCrossed = crApi.crBudget(crStoriesCrossed.numBytes, crStoriesCrossed.numTokens);
if (crApi.crGiB(crBudgetMatched.budgetBytes) !== "0.616" || crApi.crGiB(crBudgetCrossed.budgetBytes) !== "0.451")
  throw new Error(`compression-ratio: check question 3 quotes 0.616 GiB against 0.451 GiB; the data give ${crApi.crGiB(crBudgetMatched.budgetBytes)} and ${crApi.crGiB(crBudgetCrossed.budgetBytes)}`);
const crLessText = crApi.crPercent(1 - crBudgetCrossed.budgetBytes / crBudgetMatched.budgetBytes);
if (crLessText !== "26.81")
  throw new Error(`compression-ratio: the transfer answer quotes 26.81 % less text, the data give ${crLessText} %`);
// The budget is a token count, so the same budget must give the same tokens and different bytes.
if (crApi.crNumber(crBudgetMatched.budgetBytes) === crApi.crNumber(crBudgetCrossed.budgetBytes))
  throw new Error("compression-ratio: a fixed token budget must buy different amounts of text, that is the sentence the lab is built on");

// The uint16 break-even. The file is 2 * num_tokens bytes, so it grows exactly when r < 2 --
// this is the whole answer to A1 2.7 (d)'s second half and the first half of the transfer answer.
let crBelowTwo = 0, crAboveTwo = 0;
for (const key of Object.keys(crCell)) {
  const cell = crCell[key], budget = crApi.crBudget(cell.numBytes, cell.numTokens);
  const grows = budget.uint16Growth > 1;
  if (cell.ratio < 2 !== grows)
    throw new Error(`compression-ratio: ${key} has r = ${cell.ratio} and growth ${budget.uint16Growth}; the file must grow exactly when r < 2`);
  if (cell.ratio < 2) crBelowTwo++; else crAboveTwo++;
  if (crShow(budget.uint16Bytes) !== crShow(2 * budget.datasetTokens))
    throw new Error("compression-ratio: the uint16 file size must be 2 bytes per stored ID");
  crValues++;
}
if (!crBelowTwo || !crAboveTwo)
  throw new Error(`compression-ratio: both sides of the 2-bytes-per-token break-even must occur in the table; got ${crBelowTwo} below and ${crAboveTwo} above`);
if (crApi.crNumber(crBudgetMatched.uint16Growth, 3) !== "0.990" || crApi.crNumber(crBudgetCrossed.uint16Growth, 3) !== "1.353")
  throw new Error(`compression-ratio: the transfer answer quotes 0.990x and 1.353x; the data give ${crApi.crNumber(crBudgetMatched.uint16Growth, 3)} and ${crApi.crNumber(crBudgetCrossed.uint16Growth, 3)}`);

// Throughput. A1 asks for the rate as the reader's own estimate, so only the arithmetic is fixed.
for (const rate of crApi.CR_RATES) {
  if (crShow(crApi.crHours(crApi.CR_PILE_BYTES, rate.rate)) !== crShow(crApi.CR_PILE_BYTES / rate.rate / 3600))
    throw new Error("compression-ratio: the Pile runtime must be bytes / throughput / 3600");
  crValues++;
}
const crSlowest = crApi.CR_RATES.reduce((slow, entry) => entry.rate < slow.rate ? entry : slow);
if (crApi.crNumber(crApi.crHours(crApi.CR_PILE_BYTES, crSlowest.rate), 2) !== "246.07")
  throw new Error("compression-ratio: at the slowest selectable rate the Pile must take 246.07 h, that is the number the extrapolation exists for");

// Renderer guards: computing a number is not showing it. Each of these demands the display
// expression at its own place, not merely the presence of the source function.
const crDesignRenderer = sliceDeclaration(source, "renderCompressionDesigns");
const crBudgetRenderer = sliceDeclaration(source, "renderCompressionBudget");
if (!crDesignRenderer.includes("crNumber(row.ratio)"))
  throw new Error("compression-ratio: the design table must print the ratio of each row");
if (!crDesignRenderer.includes('crNumber(chosen.ratio)'))
  throw new Error("compression-ratio: the ledger must print the ratio of the selected design");
if (!crDesignRenderer.includes('crTokenize(item.text,"byte",demo)'))
  throw new Error("compression-ratio: the comparison row must recompute the byte tokenizer over all four strings");
if (!crDesignRenderer.includes('crTokenize(item.text,"character",demo)'))
  throw new Error("compression-ratio: the comparison row must recompute the character tokenizer over all four strings");
if (!crBudgetRenderer.includes("crNumber(cell.ratio)"))
  throw new Error("compression-ratio: the matrix must print the ratio of every cell");
if (!crBudgetRenderer.includes("crPercent(crossed.numTokens/matched.numTokens-1)"))
  throw new Error("compression-ratio: the matrix must print the surcharge of the wrong choice, that is check question 2");
if (!crBudgetRenderer.includes("crNumber(matchedBudget.uint16Growth,3)") || !crBudgetRenderer.includes("crNumber(crossedBudget.uint16Growth,3)"))
  throw new Error("compression-ratio: the budget ledger must print the ratio to the raw text size for both tokenizers");
if (!crBudgetRenderer.includes("crPercent(1-crossedBudget.budgetBytes/matchedBudget.budgetBytes)"))
  throw new Error("compression-ratio: the budget ledger must print how much less text the same token budget buys, that is check question 3");
if (!crBudgetRenderer.includes("crNumber(crHours(CR_PILE_BYTES,rateEntry.rate),2)"))
  throw new Error("compression-ratio: the throughput ledger must print the hours on the Pile");
if (!crBudgetRenderer.includes("model.requested") || !crBudgetRenderer.includes("model.learned"))
  throw new Error("compression-ratio: requested and learned merges must be shown side by side, the saturation note reads them off");
if (!crBudgetRenderer.includes("target.held") || crBudgetRenderer.includes("crEncodeBpe(target.train"))
  throw new Error("compression-ratio: the matrix must measure the held-out text, never the training text");

// PDF fidelity: lecture 1 is the only lecture that computes this number, so it is the only guide
// that may carry the lab. A4's tokenize-train mission may cite it, that is a mission, not a lecture.
const crLectures = Object.entries(base.lectureGuides || {}).filter(([, guide]) => (guide.labs || []).includes("compression-ratio")).map(([id]) => id);
if (crLectures.join(",") !== "l01")
  throw new Error(`compression-ratio: only lecture 1 computes get_compression_ratio, so only l01 may carry the lab; found ${crLectures.join(",") || "none"}`);
const crMissions = base.assignments.flatMap(assignment => (assignment.missions || [])
  .filter(mission => (mission.labs || []).includes("compression-ratio")).map(mission => `${assignment.id}:${mission.id}`));
if (!crMissions.includes("a1:text-tokenizer"))
  throw new Error("compression-ratio: tokenizer_experiments lives in a1:text-tokenizer, the lab must be cited there");
if (!crMissions.includes("a4:tokenize-train"))
  throw new Error("compression-ratio: a4:tokenize-train hangs on tokenizer-tradeoffs and had no lab of its own, the lab must be cited there");

console.log(`compression-ratio OK: ${crValues} values, byte row ${crByteRow.join("/")} against character row ${crCharRow.join("/")} (${crHidden.length} strings hidden, ${crExposed.length} exposed), the same swap costs +${crPenalty.stories} % on stories and +${crPenalty.web} % on web, and a fixed budget of ${crApi.crMillions(crApi.CR_TOKEN_BUDGET)} M tokens buys ${crApi.crGiB(crBudgetMatched.budgetBytes)} GiB against ${crApi.crGiB(crBudgetCrossed.budgetBytes)} GiB (${crLessText} % less) at uint16 growth ${crApi.crNumber(crBudgetMatched.uint16Growth, 3)}x / ${crApi.crNumber(crBudgetCrossed.uint16Growth, 3)}x`);
// Mode A's BPE row is measured on the demo corpus's own near-twin, so the lab warns about it in
// so many words. The warning is a claim about numbers and has to stay true.
const crDesignNote = crApi.CR_TEXTS.find(entry => entry.key === "ascii");
const crDemoWord = (crDesignNote.text.match(/[\p{L}\p{N}_]+|[\s\S]/gu) || []).length;
const crDemoBpe = crRefEncode(crDesignNote.text, crDemo);
if (!(crDemoBpe < crDemoWord))
  throw new Error("compression-ratio: the lab warns that BPE beats the word tokenizer on the ASCII string because it is a near-twin of the demo corpus; the numbers no longer say that");
if (!sliceDeclaration(source, "renderCompressionDesigns").includes("misstrauisch"))
  throw new Error("compression-ratio: the warning about the near-twin corpus must be rendered, not just true");

// ---- resume-contract ---------------------------------------------------------
// Two A1 contracts that hang on one number, the step counter t: the three-branch schedule of
// A1 4.4 (get_lr_cosine_schedule) and the checkpoint of A1 5.2 (save/load_checkpoint).
const rcNames = ["RC_SCHEDULE", "RC_STEPS", "RC_VARIANTS", "rcSchedule", "rcBranch", "rcSame", "rcHiddenSteps",
  "RC_RUN", "RC_CHECKPOINTS", "RC_CONTENTS", "rcGradients", "RC_GRADIENTS", "rcRunSchedule", "rcBiasFactor",
  "rcAdamStep", "rcRun", "rcResume", "rcExp", "rcNumber"];
const rcApi = new Function(`"use strict"; ${numberPrelude} ${rcNames.map(name => sliceDeclaration(source, name)).join("\n")} return {${rcNames.join(",")}};`)();

// A1 4.4, typed again from the handout rather than reused from the app.
const rcRef = (t) => {
  const { aMax, aMin, tWarm, tCosine } = rcApi.RC_SCHEDULE;
  if (t < tWarm) return t / tWarm * aMax;
  if (t > tCosine) return aMin;
  return aMin + 0.5 * (1 + Math.cos((t - tWarm) / (tCosine - tWarm) * Math.PI)) * (aMax - aMin);
};
let rcValues = 0;
for (let t = 0; t <= rcApi.RC_SCHEDULE.tCosine + 2000; t += 7) {
  if (!Object.is(rcApi.rcSchedule("correct", t), rcRef(t)))
    throw new Error(`resume-contract: the correct schedule departs from A1 4.4 at t=${t}: ${rcApi.rcSchedule("correct", t)} instead of ${rcRef(t)}`);
  rcValues++;
}
// The two boundaries the concept page claims in prose. Both must be exact, not close.
const { aMax: rcAMax, aMin: rcAMin, tWarm: rcTw, tCosine: rcTc } = rcApi.RC_SCHEDULE;
if (!Object.is(rcApi.rcSchedule("correct", rcTw), rcAMax))
  throw new Error("resume-contract: at t = T_w the cosine branch must return exactly alpha_max, otherwise the transition is not continuous");
if (!Object.is(rcApi.rcSchedule("correct", rcTc), rcAMin))
  throw new Error("resume-contract: at t = T_c the decay must land exactly on alpha_min");
for (const t of [rcTc + 1, rcTc + 500, rcTc + 4000]) {
  if (!Object.is(rcApi.rcSchedule("correct", t), rcAMin))
    throw new Error(`resume-contract: the post-annealing branch is missing at t=${t}`);
}
// Every wrong variant must be hidden somewhere and exposed somewhere, and no two may be exposed
// by the same set of steps -- that is the didactic claim of the mode, not a nice-to-have.
const rcWrong = rcApi.RC_VARIANTS.filter(variant => !variant.ok);
if (rcWrong.length < 4) throw new Error("resume-contract: the schedule mode needs at least four wrong implementations");
if (rcApi.RC_VARIANTS.filter(variant => variant.ok).length !== 1)
  throw new Error("resume-contract: exactly one variant may be marked correct");
const rcExposure = new Map();
for (const variant of rcWrong) {
  const hidden = rcApi.rcHiddenSteps(variant.key).map(step => step.t);
  const exposed = rcApi.RC_STEPS.map(step => step.t).filter(t => !hidden.includes(t));
  if (!hidden.length)
    throw new Error(`resume-contract: ${variant.key} is exposed at every step, so it teaches nothing about tests that pass`);
  if (!exposed.length)
    throw new Error(`resume-contract: ${variant.key} is hidden at every step, so the lab can never show it is wrong`);
  const signature = exposed.join(",");
  if (rcExposure.has(signature))
    throw new Error(`resume-contract: ${variant.key} and ${rcExposure.get(signature)} are exposed by the same steps, so one of them is redundant`);
  rcExposure.set(signature, variant.key);
  rcValues += rcApi.RC_STEPS.length;
}
// The sharpest single claim: the missing third branch survives every step inside the decay and is
// visible only beyond T_c. If a step past T_c ever leaves the list, this claim dies silently.
const rcClampExposed = rcApi.RC_STEPS.filter(step => !rcApi.rcSame(rcApi.rcSchedule("noPostClamp", step.t), rcApi.rcSchedule("correct", step.t)));
if (rcClampExposed.length !== 1 || rcClampExposed[0].t <= rcTc)
  throw new Error("resume-contract: the missing post-annealing branch must be exposed by exactly one selectable step, and that step must lie beyond T_c");
if (!(rcApi.rcSchedule("noPostClamp", rcClampExposed[0].t) > rcAMin))
  throw new Error("resume-contract: past T_c the unclamped cosine must rise above alpha_min, that is the whole point of the variant");
if (!rcApi.RC_STEPS.some(step => step.t === rcTw) || !rcApi.RC_STEPS.some(step => step.t === rcTc))
  throw new Error("resume-contract: both boundaries T_w and T_c must stay selectable, they are where schedulers actually break");
// The observe text says the rate past T_c is "nearly twice alpha_min". A guard that only compares
// the app against constants read from the app itself would let the constants drift under that
// sentence, so this one checks the sentence.
if (!(rcApi.rcSchedule("noPostClamp", rcClampExposed[0].t) / rcAMin > 1.5))
  throw new Error("resume-contract: the lab says the unclamped rate past T_c is nearly twice alpha_min; with these constants it is not");

// The resume run carries its own miniature schedule. It is the same three-branch definition, so it
// gets the same independent reference -- otherwise mode B's learning rates rest on nothing.
const rcRunRef = (t) => {
  const { aMax, aMin, tWarm, tCosine } = rcApi.RC_RUN;
  if (t < tWarm) return t / tWarm * aMax;
  if (t > tCosine) return aMin;
  return aMin + 0.5 * (1 + Math.cos((t - tWarm) / (tCosine - tWarm) * Math.PI)) * (aMax - aMin);
};
for (let t = 0; t <= rcApi.RC_RUN.steps + 5; t++) {
  if (!Object.is(rcApi.rcRunSchedule(t), rcRunRef(t)))
    throw new Error(`resume-contract: the resume run's schedule departs from A1 4.4 at t=${t}: ${rcApi.rcRunSchedule(t)} instead of ${rcRunRef(t)}`);
  rcValues++;
}
if (!Object.is(rcApi.rcRunSchedule(rcApi.RC_RUN.tWarm), rcApi.RC_RUN.aMax) || !Object.is(rcApi.rcRunSchedule(rcApi.RC_RUN.tCosine), rcApi.RC_RUN.aMin))
  throw new Error("resume-contract: the resume run's schedule must hit alpha_max at T_w and alpha_min at T_c like the big one");

// AdamW exactly as A1 Algorithm 1 writes it: the bias correction is folded into alpha_t, and the
// decoupled weight decay uses alpha, not alpha_t. Note that t starts at 1.
const { beta1: rcB1, beta2: rcB2, decay: rcLam, eps: rcEps } = rcApi.RC_RUN;
if (!Object.is(rcApi.rcBiasFactor(1), Math.sqrt(1 - rcB2) / (1 - rcB1)))
  throw new Error("resume-contract: the bias factor at t = 1 must be sqrt(1-beta2)/(1-beta1)");
// A1 names (0.9, 0.999) as the typical setting, and the lab quotes the resulting first-step factor
// 0.316228 as a literal in its symbol list. Both must stay true of the actual constants.
if (rcB1 !== 0.9 || rcB2 !== 0.999)
  throw new Error("resume-contract: the run uses A1's typical betas (0.9, 0.999); the symbol list quotes the factor they produce");
if (rcApi.rcNumber(rcApi.rcBiasFactor(1)) !== "0.316228")
  throw new Error(`resume-contract: the symbol list states the t = 1 bias factor as 0.316228, the constants now give ${rcApi.rcNumber(rcApi.rcBiasFactor(1))}`);
for (const t of [1, 2, 7, 21, 30]) {
  if (!Object.is(rcApi.rcBiasFactor(t), Math.sqrt(1 - Math.pow(rcB2, t)) / (1 - Math.pow(rcB1, t))))
    throw new Error(`resume-contract: the bias factor departs from A1 Algorithm 1 at t=${t}`);
  rcValues++;
}
{
  const probe = rcApi.rcAdamStep({ theta: 1, m: 0, v: 0 }, 0.5, 1e-3, 1);
  const alphaT = 1e-3 * Math.sqrt(1 - rcB2) / (1 - rcB1);
  const expected = (1 - 1e-3 * rcLam) * 1 - alphaT * ((1 - rcB1) * 0.5) / (Math.sqrt((1 - rcB2) * 0.25) + rcEps);
  if (!Object.is(probe.theta, expected))
    throw new Error("resume-contract: one AdamW step must follow A1 Algorithm 1, with the weight decay scaled by alpha rather than alpha_t");
  rcValues++;
}
// The resume experiment. Every claim the renderer prints is checked at every selectable checkpoint,
// never only at the one where it happens to hold.
for (const checkpoint of rcApi.RC_CHECKPOINTS) {
  const report = rcApi.rcResume(checkpoint.key);
  const full = report.rows.find(row => row.content.key === "full");
  const moments = report.rows.find(row => row.content.key === "noOptimizer");
  const counter = report.rows.find(row => row.content.key === "noIteration");
  if (!full || !moments || !counter) throw new Error("resume-contract: the four checkpoint contents must stay available");
  if (full.deviation !== 0)
    throw new Error(`resume-contract: a complete checkpoint must reproduce the uninterrupted run exactly, not to ${full.deviation} at ${checkpoint.key}`);
  if (!report.rows.every(row => Object.is(row.loaded, report.saved.theta)))
    throw new Error(`resume-contract: all four contents must load the identical theta at ${checkpoint.key}, that is what the loading note claims`);
  if (!(counter.deviation > moments.deviation))
    throw new Error(`resume-contract: at ${checkpoint.key} the forgotten step counter must cost more than the forgotten moments; the renderer claims this ordering holds at all four`);
  if (!report.rows.filter(row => !row.content.ok).every(row => row.deviation > 0))
    throw new Error(`resume-contract: every incomplete checkpoint must deviate at ${checkpoint.key}`);
  // The counter is lost exactly when iteration was not saved, the moments exactly when the
  // optimizer was not saved -- derived from the rows, not asserted in prose.
  if (counter.first.scheduleStep !== 1 || counter.first.factor !== full.first.factor)
    throw new Error(`resume-contract: without iteration the schedule must restart at step 1 while AdamW keeps its own counter (${checkpoint.key})`);
  if (moments.first.scheduleStep !== full.first.scheduleStep || !Object.is(moments.first.factor, rcApi.rcBiasFactor(1)))
    throw new Error(`resume-contract: without the optimizer the schedule must be right while the bias correction restarts at t = 1 (${checkpoint.key})`);
  if (!(moments.first.factor > full.first.factor))
    throw new Error(`resume-contract: a restarted bias correction must make the next step larger, not smaller (${checkpoint.key})`);
  rcValues += report.rows.length * 4;
}
// Showing two counters is only worth the space if they really come apart. noIteration moves the
// schedule counter alone, noOptimizer the AdamW counter alone -- checked, not assumed.
for (const checkpoint of rcApi.RC_CHECKPOINTS) {
  const report = rcApi.rcResume(checkpoint.key);
  const counter = report.rows.find(row => row.content.key === "noIteration");
  const moments = report.rows.find(row => row.content.key === "noOptimizer");
  if (counter.first.adamStep !== report.reference.adamStep || counter.first.scheduleStep === report.reference.scheduleStep)
    throw new Error(`resume-contract: at ${checkpoint.key} a lost iteration must move the schedule counter and leave AdamW's own counter alone`);
  if (moments.first.scheduleStep !== report.reference.scheduleStep || moments.first.adamStep === report.reference.adamStep)
    throw new Error(`resume-contract: at ${checkpoint.key} a lost optimizer must move AdamW's counter and leave the schedule counter alone`);
  rcValues += 4;
}
if (rcApi.RC_GRADIENTS.length !== rcApi.RC_RUN.steps)
  throw new Error("resume-contract: the gradient stream must cover the whole run, both branches replay the same batches");
// The intro sentence of mode B names these four numbers as literals, so they may not drift.
if (rcApi.RC_RUN.theta0 !== 1 || rcApi.RC_RUN.steps !== 30 || rcApi.RC_RUN.tWarm !== 5 || rcApi.RC_RUN.tCosine !== 30)
  throw new Error("resume-contract: the mode B intro states theta0 = 1, 30 steps, T_w = 5 and T_c = 30 in words; the constants must match");
if (rcApi.RC_CHECKPOINTS.some(checkpoint => checkpoint.step >= rcApi.RC_RUN.steps || checkpoint.step < 1))
  throw new Error("resume-contract: every checkpoint must leave at least one step to run afterwards");

// Renderer guards. Per the house rule they demand the complete markup fragment, so they check the
// place a number is printed rather than the mere occurrence of an identifier.
const rcSchedRenderer = sliceDeclaration(source, "renderResumeSchedule");
const rcResumeRenderer = sliceDeclaration(source, "renderResumeCheckpoint");
for (const [fragment, why] of [
  ['<td>${rcExp(row.value)}</td>', "the learning rate of every variant must be printed in the table"],
  ['<td>${row.same?tr("nicht zu unterscheiden"):`${rcNumber(100*(row.ratio-1),2)} %`}</td>', "the comparison against A1 must be printed per row"],
  ['<strong>α_t = ${rcExp(chosen.value)}</strong>', "the selected implementation's result must be printed"],
  ['<strong>${rcExp(correct)}</strong>', "the A1 reference must be printed beside it"],
  ['${hidden.map(item=>"t = "+item.t).join(" · ")||tr("keiner")}', "the steps at which the variant stays hidden must be printed"]
]) {
  if (!rcSchedRenderer.includes(fragment)) throw new Error(`resume-contract: ${why}`);
}
for (const [fragment, why] of [
  ['<td>${rcNumber(row.loaded,8)}</td>', "theta right after loading must be printed for every content"],
  ['<td>${rcExp(row.first.alpha)}</td>', "the first learning rate after the resume must be printed"],
  ['<td>${row.deviation===0?tr("exakt null"):rcExp(row.deviation)}</td>', "the deviation from branch A must be printed"],
  ['<strong>${tr("Schedule-Schritt")} ${chosen.first.scheduleStep} · ${tr("AdamW-Schritt")} ${chosen.first.adamStep} · α = ${rcExp(chosen.first.alpha)} · ${tr("Bias-Faktor")} ${rcNumber(chosen.first.factor)}</strong>', "both step counters, the learning rate and the bias factor this checkpoint uses must be printed"],
  ['<strong>${tr("Schedule-Schritt")} ${report.reference.scheduleStep} · ${tr("AdamW-Schritt")} ${report.reference.adamStep} · α = ${rcExp(report.reference.alpha)} · ${tr("Bias-Faktor")} ${rcNumber(report.reference.factor)}</strong>', "the uninterrupted run's two counters must be printed beside them"],
  ['${tr("Vergessene Momente kosten hier")} ${rcExp(optimizerRow.deviation)}', "the two deviations that carry the ordering claim must be printed"],
  ['${rcNumber(counterRow.deviation/optimizerRow.deviation,2)}', "the ratio between them must be printed"]
]) {
  if (!rcResumeRenderer.includes(fragment)) throw new Error(`resume-contract: ${why}`);
}
// Lecture 2's own checkpoint dict has model and optimizer and no iteration -- verified against
// `Trace - lecture_02.pdf`. The lab points at that row, so the note and the row must both stay.
if (!rcResumeRenderer.includes("Lecture 2 speichert in ihrem eigenen Abschnitt checkpointing() genau zwei Felder: model.state_dict() und optimizer.state_dict()"))
  throw new Error("resume-contract: the note tying row two to Lecture 2's own checkpointing() section must be rendered");
if (!rcResumeRenderer.includes("${lecture}"))
  throw new Error("resume-contract: the Lecture 2 note must actually be placed in the output");
if (rcApi.RC_CONTENTS[1].key !== "noIteration")
  throw new Error("resume-contract: the note calls the model+optimizer checkpoint row two, so it must stay in second place");
if (rcApi.RC_CONTENTS[1].saves !== "model.state_dict(), optimizer.state_dict()")
  throw new Error("resume-contract: row two must save exactly what Lecture 2 saves, model and optimizer and nothing else");
// The loading note states a computed fact; it must be derived from the rows, never hard-coded.
if (!rcResumeRenderer.includes("const identical=report.rows.every(row=>rcNumber(row.loaded,8)===rcNumber(report.saved.theta,8));"))
  throw new Error("resume-contract: the claim that all four rows load the same theta must be computed from the rows");

// Registration. Lecture 2 is the one lecture that actually saves a checkpoint (its own
// checkpointing() section writes model and optimizer via torch.save -- and no iteration, which is
// exactly the gap this lab prices). The schedule contract itself is assignment material, so no
// other lecture may claim the lab.
const rcGuides = readConstant("LECTURE_GUIDES");
const rcLectures = Object.entries(rcGuides).filter(([, guide]) => (guide.labs || []).includes("resume-contract")).map(([id]) => id);
if (rcLectures.length !== 1 || rcLectures[0] !== "l02")
  throw new Error(`resume-contract: the lab belongs to Lecture 2 alone, found ${JSON.stringify(rcLectures)}`);
const rcModules = readConstant("MODULES");
if (!rcModules.find(entry => entry.id === "training")?.labs.includes("resume-contract"))
  throw new Error("resume-contract: the lab must be listed in the training module");
const rcAssignments = readConstant("ASSIGNMENTS");
for (const missionId of ["optimization", "training-state"]) {
  const mission = rcAssignments.find(entry => entry.id === "a1").missions.find(entry => entry.id === missionId);
  if (!mission.labs.includes("resume-contract"))
    throw new Error(`resume-contract: mission a1:${missionId} owns one of the two contracts and must list the lab`);
}
const rcLabs = readConstant("LABS");
const rcEntry = rcLabs.find(entry => entry.id === "resume-contract");
if (!rcEntry) throw new Error("resume-contract: missing from LABS");
if (rcEntry.module !== "training") throw new Error("resume-contract: the lab belongs to the training module");
if (!sliceDeclaration(source, "OBJECTIVE_LAB_IDS").includes('"resume-contract"'))
  throw new Error("resume-contract: the lab must be registered in OBJECTIVE_LAB_IDS");
// The stored answers and the answers the check accepts must be the same three.
const rcAccepted = sliceDeclaration(source, "checkResumeContract");
for (const answer of ["postAnnealing", "nothing", "counter"]) {
  if (!rcAccepted.includes(`"${answer}"`))
    throw new Error(`resume-contract: the quick check must accept ${answer}`);
  if (!sliceDeclaration(source, "restorePassedLab").includes(answer))
    throw new Error(`resume-contract: the restore preset must carry ${answer}`);
}
if (!sliceDeclaration(source, "initLab").includes('if(id==="resume-contract")'))
  throw new Error("resume-contract: the lab must be wired up in initLab");
// Both adapter hooks must be reachable from the lab's own control panel, so the reader can find
// the two handout problems this lab was built for.
const rcControls = source.slice(source.indexOf('if(id==="resume-contract") return `'));
for (const hook of ["get_lr_cosine_schedule", "run_save_checkpoint"]) {
  if (!rcControls.slice(0, rcControls.indexOf("\n")).includes(hook))
    throw new Error(`resume-contract: the mode selector must name ${hook}`);
}
const rcReport20 = rcApi.rcResume("k20");
const rcCounter20 = rcReport20.rows.find(row => row.content.key === "noIteration");
const rcMoments20 = rcReport20.rows.find(row => row.content.key === "noOptimizer");
console.log(`resume-contract OK: ${rcValues} values, the three branches exact at T_w (${rcApi.rcExp(rcApi.rcSchedule("correct", rcTw))}) and T_c (${rcApi.rcExp(rcApi.rcSchedule("correct", rcTc))}), the missing clamp hidden at ${rcApi.rcHiddenSteps("noPostClamp").length} of ${rcApi.RC_STEPS.length} steps and rising to ${rcApi.rcExp(rcApi.rcSchedule("noPostClamp", rcClampExposed[0].t))} past T_c, all four checkpoints load the identical theta, and a forgotten step counter costs ${rcApi.rcNumber(rcCounter20.deviation / rcMoments20.deviation, 2)}x the forgotten moments`);

// ---- ablation-controls -------------------------------------------------------
// A1 7.3 prescribes four ablations, each a one-line change, each asking for a learning curve.
// Before this lab the platform had zero occurrences of postNorm/preNorm as computed identifiers,
// exactly one occurrence of "NoPE" (the raw handout title), and no computed FFN_SiLU baseline at
// all -- d_ff = 4*d_model, FFN_SiLU and "ungated" had 0 hits. These guards hold two things: the
// parameter arithmetic that decides whether each comparison is controlled, and the residual-path
// arithmetic that decides what the interventions actually change.
const abNames = ["AB_ROUND64", "AB_ARCHS", "AB_VARIANTS", "abFfnParams", "abParams", "abFfnFlops",
  "abIdealFf", "abResidue", "abNumber", "AB_DEPTH", "AB_DIM", "AB_EPS", "AB_THETA", "AB_GAINS",
  "AB_PLACEMENTS", "AB_X0", "abRms", "abLen", "abRotate", "abRotateT", "abNorm", "abNormJ",
  "abStep", "abJvp", "abVjp", "abStream", "abLambda"];
const abRenderNames = ["abInt", "renderAblationParams", "renderAblationStream"];
const abStubs = `
  const esc = value => String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const localeCode = () => "en-US";
  const localizedUi = value => String(value);
${sliceDeclaration(source, "fixedNum")}
`;
const abAll = [...abNames, ...abRenderNames];
const abApi = runInNewContext(`${abStubs}${abAll.map(name => sliceDeclaration(source, name)).join("\n")}; ({${abAll.join(",")}})`, {});
let abValues = 0;

// A1 3.4 and A1 7.2.1 both state d_ff themselves. The rounding rule has to reproduce both.
if (abApi.AB_ROUND64(8 * 1600 / 3) !== 4288)
  throw new Error("ablation-controls: A1 3.4 calls d_ff 'the nearest multiple of 64 to 8/3 x 1,600' and prints 4288");
if (abApi.AB_ROUND64(8 * 512 / 3) !== 1344)
  throw new Error("ablation-controls: A1 7.2.1 states d_ff 1344 for d_model 512");
// The two configurations A1 states itself must carry the handout's own numbers, not merely the rule.
if (abApi.AB_ARCHS.find(arch => arch.key === "ts")?.F !== 1344)
  throw new Error("ablation-controls: the A1 7.2.1 configuration must carry the handout's d_ff 1344");
if (abApi.AB_ARCHS.find(arch => arch.key === "xl")?.F !== 4288)
  throw new Error("ablation-controls: the A1 3.4 configuration must carry the handout's d_ff 4288");
if (abApi.AB_ARCHS.find(arch => arch.key === "ts")?.D !== 512 || abApi.AB_ARCHS.find(arch => arch.key === "xl")?.D !== 1600)
  throw new Error("ablation-controls: the two handout configurations must keep their d_model");
for (const arch of abApi.AB_ARCHS) {
  if (arch.F !== abApi.AB_ROUND64(8 * arch.D / 3))
    throw new Error(`ablation-controls: ${arch.key} does not follow the handout's own d_ff rule`);
  if (arch.F % 64 !== 0) throw new Error(`ablation-controls: ${arch.key} has a d_ff that is not a multiple of 64`);
}

// The A1 parameter contract, typed again from the handout instead of reused from the app.
const abRefParams = (arch, variant) => {
  const embed = 2 * arch.V * arch.D;
  const attn = 4 * arch.D * arch.D;
  const ffn = variant === "silu" ? 2 * arch.D * (4 * arch.D) : 3 * arch.D * arch.F;
  const norms = variant === "noNorm" ? 0 : 2 * arch.D;
  const final = variant === "noNorm" ? 0 : arch.D;
  return embed + arch.L * (attn + ffn + norms) + final;
};
for (const arch of abApi.AB_ARCHS) {
  const base = abApi.abParams(arch, "base");
  for (const variant of abApi.AB_VARIANTS) {
    const mine = abApi.abParams(arch, variant.key), reference = abRefParams(arch, variant.key);
    if (mine !== reference)
      throw new Error(`ablation-controls: ${arch.key}/${variant.key} gives ${mine} instead of ${reference}`);
    abValues++;
    const delta = mine - base;
    // Post-norm moves the norm and NoPE removes a parameter-free rotation: both must be exactly zero,
    // because that is the whole claim the ledger makes about them being controlled comparisons.
    if ((variant.key === "postNorm" || variant.key === "noPE") && delta !== 0)
      throw new Error(`ablation-controls: ${variant.key} must leave the parameter count exactly unchanged, not by ${delta}`);
    if (variant.key === "noNorm" && delta !== -(2 * arch.L * arch.D + arch.D))
      throw new Error(`ablation-controls: layer_norm_ablation must remove exactly 2LD + D gains at ${arch.key}`);
    // The entire SwiGLU/SiLU mismatch is the rounding remainder, times 3*d_model, times L.
    if (variant.key === "silu" && delta !== -Math.round(arch.L * 3 * arch.D * abApi.abResidue(arch)))
      throw new Error(`ablation-controls: the FFN_SiLU delta at ${arch.key} is not L*3*d_model*remainder`);
  }
  // Without rounding both sides are 8*d_model^2 per block -- that is why A1 can call them matched.
  if (3 * arch.D * abApi.abIdealFf(arch) !== 8 * arch.D * arch.D || 2 * arch.D * (4 * arch.D) !== 8 * arch.D * arch.D)
    throw new Error(`ablation-controls: the idealised SwiGLU and FFN_SiLU widths must both come to 8*d_model^2 at ${arch.key}`);
  // The lab claims the match is exact exactly when d_model is divisible by 24.
  const exact = abApi.abParams(arch, "silu") === base;
  if (exact !== (arch.D % 24 === 0))
    throw new Error(`ablation-controls: the parameter match must be exact precisely when d_model % 24 === 0, broken at ${arch.key}`);
}
// Both directions of the rounding must occur, otherwise the ledger cannot show the sign flip it claims.
const abSigns = new Set(abApi.AB_ARCHS.map(arch => Math.sign(abApi.abResidue(arch))));
if (!abSigns.has(1) || !abSigns.has(-1) || !abSigns.has(0))
  throw new Error("ablation-controls: the configuration list must round up, round down, and land exactly, or the sign flip is not visible");
// The forward FLOPs of the two feed-forward variants follow the same 8*d_model^2 identity.
for (const arch of abApi.AB_ARCHS) {
  if (abApi.abFfnFlops(arch, "silu") !== 16 * arch.D * arch.D)
    throw new Error(`ablation-controls: FFN_SiLU forward FLOPs per token must be 16*d_model^2 at ${arch.key}`);
  if (abApi.abFfnFlops(arch, "base") !== 6 * arch.D * arch.F)
    throw new Error(`ablation-controls: SwiGLU forward FLOPs per token must be 6*d_model*d_ff at ${arch.key}`);
}

// The numbers the lab quotes in prose about the TinyStories configuration.
const abTs = abApi.AB_ARCHS.find(arch => arch.key === "ts");
if (!abTs) throw new Error("ablation-controls: the A1 7.2.1 configuration must stay selectable");
if (abApi.abParams(abTs, "noNorm") - abApi.abParams(abTs, "base") !== -4608)
  throw new Error("ablation-controls: the observe text quotes -4,608 for layer_norm_ablation at d_model 512");
if (3 * abTs.D * abTs.F - 2 * abTs.D * 4 * abTs.D !== -32768)
  throw new Error("ablation-controls: the transfer answer quotes 32,768 parameters per block at d_model 512");
if (abApi.abParams(abTs, "silu") - abApi.abParams(abTs, "base") !== 131072)
  throw new Error("ablation-controls: the transfer answer quotes +131,072 parameters in total at d_model 512");
if (abApi.abNumber(100 * (abApi.abParams(abTs, "silu") - abApi.abParams(abTs, "base")) / abApi.abParams(abTs, "base"), 2) !== "0.58")
  throw new Error("ablation-controls: the transfer answer quotes +0.58 % for the FFN_SiLU model at d_model 512");
if (abApi.abNumber(abApi.abIdealFf(abTs), 2) !== "1,365.33" || abApi.abNumber(abApi.abResidue(abTs), 2) !== "-21.33")
  throw new Error("ablation-controls: the transfer answer quotes 8/3*512 = 1365.33 and a remainder of -21.33");

// --- the residual path -------------------------------------------------------
// Q is a rotation, so I + cQ is conformal and every factor below is exact rather than measured.
for (const gain of abApi.AB_GAINS) {
  const lambda = abApi.abLambda(gain.c);
  if (Math.abs(lambda - Math.sqrt(1 + 2 * gain.c * Math.cos(abApi.AB_THETA) + gain.c * gain.c)) > 1e-12)
    throw new Error(`ablation-controls: lambda must be sqrt(1 + 2c cos theta + c^2) at c = ${gain.c}`);
  const runs = {};
  for (const placement of abApi.AB_PLACEMENTS) runs[placement.key] = abApi.abStream(placement.key, gain.c);
  abValues += 3 * (abApi.AB_DEPTH + 1);
  // Post-norm rescales the main path, so the stream has RMS one at every single depth.
  for (const value of runs.post.rms) {
    if (abApi.abNumber(value, 4) !== "1.0000")
      throw new Error(`ablation-controls: under post-norm every depth must show RMS 1.0000, found ${abApi.abNumber(value, 4)} at c = ${gain.c}`);
  }
  // Without a norm both the stream and the gradient scale by exactly lambda per block.
  for (let depth = 1; depth <= abApi.AB_DEPTH; depth++) {
    const step = runs.none.rms[depth] / runs.none.rms[depth - 1];
    if (Math.abs(step - lambda) > 1e-4)
      throw new Error(`ablation-controls: without a norm each block must multiply the stream by lambda, found ${step} at c = ${gain.c}`);
  }
  if (Math.abs(runs.none.gradFactor - Math.pow(lambda, abApi.AB_DEPTH)) > 1e-3 * Math.pow(lambda, abApi.AB_DEPTH))
    throw new Error(`ablation-controls: the gradient without a norm must grow by lambda^L at c = ${gain.c}`);
  // Pre-norm grows by the radial part of a contribution of fixed length: c*cos(theta) per block.
  const preStep = runs.pre.rms[abApi.AB_DEPTH] - runs.pre.rms[abApi.AB_DEPTH - 1];
  if (Math.abs(preStep - gain.c * Math.cos(abApi.AB_THETA)) > 0.12 * gain.c)
    throw new Error(`ablation-controls: under pre-norm the late growth per block must approach c*cos(theta) at c = ${gain.c}`);
  if (runs.pre.rms[abApi.AB_DEPTH] >= runs.none.rms[abApi.AB_DEPTH])
    throw new Error(`ablation-controls: the pre-norm stream must stay below the unnormalised one at c = ${gain.c}`);
  // The one test that separates all three placements: the stream direction through one block.
  for (let depth = 0; depth < abApi.AB_DEPTH; depth++) {
    if (Math.abs(runs.pre.radial[depth] - 1) > 1e-4)
      throw new Error(`ablation-controls: pre-norm must pass the stream direction at factor 1, found ${runs.pre.radial[depth]} at c = ${gain.c}`);
    if (runs.post.radial[depth] > 1e-4)
      throw new Error(`ablation-controls: post-norm must delete the stream direction down to the RMSNorm epsilon, found ${runs.post.radial[depth]} at c = ${gain.c}`);
    if (Math.abs(runs.none.radial[depth] - lambda) > 1e-9)
      throw new Error(`ablation-controls: without a norm the stream direction must be scaled by exactly lambda at c = ${gain.c}`);
  }
  // The epsilon is what keeps post-norm off exact zero; if it were gone the claim would change.
  if (abApi.AB_EPS <= 0) throw new Error("ablation-controls: the RMSNorm epsilon must stay positive, the lab names it as the reason post-norm is not exactly zero");
}
// The two numbers the quick check and the observe text quote by name.
const abOne = abApi.AB_GAINS.find(entry => entry.c === 1), abTwo = abApi.AB_GAINS.find(entry => entry.c === 2);
if (!abOne || !abTwo) throw new Error("ablation-controls: c = 1 and c = 2 must stay selectable, the quick check quotes both");
if (abApi.abNumber(Math.pow(abApi.abLambda(1), abApi.AB_DEPTH), 0) !== "729")
  throw new Error("ablation-controls: the quick check quotes 729 for c = 1 across twelve blocks");
if (abApi.abNumber(Math.pow(abApi.abLambda(2), abApi.AB_DEPTH), 0) !== "117,649")
  throw new Error("ablation-controls: the quick check quotes 117,649 for c = 2 across twelve blocks");
// The observe text names the smallest gain by value, so it has to stay selectable at that value.
const abQuarterGain = abApi.AB_GAINS.find(entry => entry.key === "g025");
if (!abQuarterGain || abQuarterGain.c !== 0.25)
  throw new Error("ablation-controls: the observe text quotes c = 0.25 by name, so that gain must stay selectable");
const abQuarter = abApi.abStream("none", abQuarterGain.c), abQuarterPre = abApi.abStream("pre", abQuarterGain.c);
if (abApi.abNumber(abQuarter.rms[abApi.AB_DEPTH], 2) !== "5.11" || abApi.abNumber(abQuarterPre.rms[abApi.AB_DEPTH], 2) !== "2.66")
  throw new Error("ablation-controls: the observe text quotes 5.11 without a norm and 2.66 under pre-norm at c = 0.25");
if (abApi.AB_GAINS.find(entry => entry.key === "g1")?.c !== 1 || abApi.AB_GAINS.find(entry => entry.key === "g2")?.c !== 2)
  throw new Error("ablation-controls: the quick check quotes c = 1 and c = 2 by name, so both gains must keep their value");
if (abApi.AB_DEPTH !== 12) throw new Error("ablation-controls: the prose says twelve blocks throughout");
if (abApi.abNumber(abApi.abRms(abApi.AB_X0), 4) !== "1.0000")
  throw new Error("ablation-controls: the starting vector is introduced as having RMS one");

// --- an independently typed reference for the whole stack --------------------
// Retyped from the definition rather than reused, so a change to the app's own arithmetic
// has something to disagree with.
const abRefTheta = Math.PI / 3, abRefDim = 4, abRefEps = 1e-5;
const abRefRms = x => Math.sqrt(x.reduce((a, b) => a + b * b, 0) / abRefDim + abRefEps);
const abRefLen = x => Math.sqrt(x.reduce((a, b) => a + b * b, 0));
const abRefRot = x => {
  const co = Math.cos(abRefTheta), si = Math.sin(abRefTheta);
  return [co * x[0] - si * x[1], si * x[0] + co * x[1], co * x[2] - si * x[3], si * x[2] + co * x[3]];
};
const abRefRotT = v => {
  const co = Math.cos(abRefTheta), si = Math.sin(abRefTheta);
  return [co * v[0] + si * v[1], -si * v[0] + co * v[1], co * v[2] + si * v[3], -si * v[2] + co * v[3]];
};
const abRefNorm = x => { const r = abRefRms(x); return x.map(v => v / r); };
const abRefNormJ = (x, v) => {
  const r = abRefRms(x), dot = x.reduce((a, b, i) => a + b * v[i], 0);
  return x.map((xi, i) => v[i] / r - xi * dot / (abRefDim * r * r * r));
};
const abRefStep = (placement, c, x) => {
  const f = abRefRot(placement === "pre" ? abRefNorm(x) : x), u = x.map((v, i) => v + c * f[i]);
  return placement === "post" ? abRefNorm(u) : u;
};
const abRefJvp = (placement, c, x, d) => {
  if (placement === "pre") { const f = abRefRot(abRefNormJ(x, d)); return d.map((v, i) => v + c * f[i]); }
  const f = abRefRot(d), u1 = d.map((v, i) => v + c * f[i]);
  if (placement === "none") return u1;
  const fx = abRefRot(x), u = x.map((v, i) => v + c * fx[i]);
  return abRefNormJ(u, u1);
};
const abRefVjp = (placement, c, x, v) => {
  if (placement === "pre") { const back = abRefRotT(v).map(u => u * c); const through = abRefNormJ(x, back); return v.map((u, i) => u + through[i]); }
  if (placement === "none") { const back = abRefRotT(v).map(u => u * c); return v.map((u, i) => u + back[i]); }
  const fx = abRefRot(x), u = x.map((t, i) => t + c * fx[i]), a = abRefNormJ(u, v), back = abRefRotT(a).map(t => t * c);
  return a.map((t, i) => t + back[i]);
};
const abRefStream = (placement, c, depth, x0) => {
  const xs = [x0.slice()];
  for (let l = 0; l < depth; l++) xs.push(abRefStep(placement, c, xs[l]));
  const gs = new Array(depth + 1); gs[depth] = [1, 0, 0, 0];
  for (let l = depth - 1; l >= 0; l--) gs[l] = abRefVjp(placement, c, xs[l], gs[l + 1]);
  return { rms: xs.map(abRefRms), grad: gs.map(abRefLen),
    radial: xs.slice(0, depth).map(x => abRefLen(abRefJvp(placement, c, x, x)) / abRefLen(x)) };
};
if (abApi.AB_THETA !== abRefTheta || abApi.AB_DIM !== abRefDim || abApi.AB_EPS !== abRefEps)
  throw new Error("ablation-controls: the stack's constants no longer match the reference the guards were written against");
const abRefX0 = (() => { const raw = [1, 0.5, -0.5, 1], r = abRefRms(raw); return raw.map(v => v / r); })();
if (abApi.AB_X0.some((value, index) => Math.abs(value - abRefX0[index]) > 1e-12))
  throw new Error("ablation-controls: the starting vector is not the one the reference and the prose describe");
for (const gain of abApi.AB_GAINS) {
  for (const placement of abApi.AB_PLACEMENTS) {
    const mine = abApi.abStream(placement.key, gain.c);
    const reference = abRefStream(placement.key, gain.c, abApi.AB_DEPTH, abRefX0);
    for (const field of ["rms", "grad", "radial"]) {
      mine[field].forEach((value, index) => {
        if (Math.abs(value - reference[field][index]) > 1e-9 * Math.max(1, Math.abs(reference[field][index])))
          throw new Error(`ablation-controls: ${placement.key}/${field}[${index}] at c = ${gain.c} gives ${value} instead of ${reference[field][index]}`);
        abValues++;
      });
    }
  }
}

// --- what the renderers actually put on the page -----------------------------
// A guard that only checks the computation does not check that the reader ever sees it, and a
// guard that only greps the source does not check it either when the same call appears twice.
const abParamHtml = {}, abStreamHtml = {};
for (const arch of abApi.AB_ARCHS) for (const variant of abApi.AB_VARIANTS)
  abParamHtml[`${arch.key}/${variant.key}`] = abApi.renderAblationParams(arch.key, variant.key);
for (const placement of abApi.AB_PLACEMENTS) for (const gain of abApi.AB_GAINS)
  abStreamHtml[`${placement.key}/${gain.key}`] = abApi.renderAblationStream(placement.key, gain.key);
for (const [state, html] of Object.entries(abParamHtml)) {
  if (/undefined|NaN|\[object/.test(html)) throw new Error(`ablation-controls: ${state} renders an undefined or NaN value`);
  const arch = abApi.AB_ARCHS.find(entry => entry.key === state.split("/")[0]);
  // Every row's parameter total, and the rounding remainder that explains the whole mismatch.
  for (const variant of abApi.AB_VARIANTS) {
    if (!html.includes(`<td>${abApi.abInt(abApi.abParams(arch, variant.key))}</td>`))
      throw new Error(`ablation-controls: ${state} does not show the parameter total of the ${variant.key} row`);
    const delta = abApi.abParams(arch, variant.key) - abApi.abParams(arch, "base");
    // Every row that does move must print its own relative delta, not a placeholder.
    if (delta !== 0 && !html.includes(`<td>${abApi.abNumber(100 * delta / abApi.abParams(arch, "base"), 6)} %</td>`))
      throw new Error(`ablation-controls: ${state} does not show the relative delta of the ${variant.key} row`);
  }
  // Both ledger rows that carry the remainder, anchored on their markup: the remainder is the
  // entire explanation of the word "approximately", and it is stated twice on purpose.
  if (!html.includes(`= ${abApi.abNumber(abApi.abResidue(arch), 4)}</strong>`))
    throw new Error(`ablation-controls: ${state} does not show the rounding remainder in the d_ff row`);
  if (!html.includes(`\u00b7 ${abApi.abNumber(abApi.abResidue(arch), 4)}</strong>`))
    throw new Error(`ablation-controls: ${state} does not show the remainder again as 3*d_model*remainder`);
  if (!html.includes(abApi.abInt(3 * arch.D * arch.F - 2 * arch.D * 4 * arch.D)))
    throw new Error(`ablation-controls: ${state} does not show the per-block difference between SwiGLU and FFN_SiLU`);
  if (!html.includes(abApi.abInt(abApi.abFfnFlops(arch, "silu"))))
    throw new Error(`ablation-controls: ${state} does not show the FFN_SiLU forward FLOPs`);
  if (!html.includes(abApi.abInt(2 * arch.L * arch.D + arch.D)))
    throw new Error(`ablation-controls: ${state} does not show the gains layer_norm_ablation removes`);
  // The count of self-controlled ablations has to be the count of exactly-zero rows, not of rows.
  const controlled = abApi.AB_VARIANTS.filter(variant => variant.key !== "base"
    && abApi.abParams(arch, variant.key) === abApi.abParams(arch, "base")).length;
  const abControlSentence = html.match(/<span>(\d+) der vier Eingriffe/);
  if (!abControlSentence)
    throw new Error(`ablation-controls: ${state} does not state how many of the four ablations are self-controlled`);
  if (Number(abControlSentence[1]) !== controlled)
    throw new Error(`ablation-controls: ${state} states ${abControlSentence[1]} self-controlled ablations, the ledger has ${controlled}`);
  // The divisibility sentence must follow the configuration.
  // The stub localizedUi is the identity, so the guard reads the German source wording.
  const abSaysExact = html.includes("durch 24 teilbar \u2013 der Abgleich ist exakt.");
  const abSaysRounded = html.includes("nicht durch 24 teilbar; d_ff wird gerundet");
  if (abSaysExact === abSaysRounded)
    throw new Error(`ablation-controls: ${state} must state exactly one of the two verdicts about d_model % 24`);
  if (abSaysExact !== (arch.D % 24 === 0))
    throw new Error(`ablation-controls: ${state} states the wrong verdict about d_model % 24`);
}
for (const [state, html] of Object.entries(abStreamHtml)) {
  if (/undefined|NaN|\[object/.test(html)) throw new Error(`ablation-controls: ${state} renders an undefined or NaN value`);
  const gain = abApi.AB_GAINS.find(entry => entry.key === state.split("/")[1]);
  const lambda = abApi.abLambda(gain.c);
  // All three placements must stand next to each other, at every listed depth.
  for (const placement of abApi.AB_PLACEMENTS) {
    const run = abApi.abStream(placement.key, gain.c);
    for (const depth of [0, 2, 4, 6, 8, 10, 12]) {
      if (!html.includes(`data-stream="${placement.key}-${depth}">${abApi.abNumber(run.rms[depth], 4)}<`))
        throw new Error(`ablation-controls: ${state} does not show the RMS of ${placement.key} at depth ${depth}`);
      if (!html.includes(`data-grad="${placement.key}-${depth}">${abApi.abNumber(run.grad[depth], 6)}<`))
        throw new Error(`ablation-controls: ${state} does not show the gradient norm of ${placement.key} at depth ${depth}`);
    }
    if (!html.includes(abApi.abNumber(run.radial[6], 6)))
      throw new Error(`ablation-controls: ${state} does not show the radial test of ${placement.key}`);
  }
  // Anchored on the markup of the row itself: counting occurrences would be satisfied by the
  // gradient factor, which without a norm happens to be lambda^L as well.
  if (!html.includes(`\u03bb\u00b9\u00b2 = ${abApi.abNumber(Math.pow(lambda, abApi.AB_DEPTH), 6)}</strong>`))
    throw new Error(`ablation-controls: ${state} does not show lambda^L in its own ledger row`);
  // The guard's localizedUi stub is the identity, so this reads the German source wording.
  if (!html.includes(`hier also ${abApi.abNumber(Math.pow(lambda, abApi.AB_DEPTH), 6)} `))
    throw new Error(`ablation-controls: ${state} does not repeat lambda^L in the answer about the learning rate`);
  if (!html.includes(abApi.abNumber(gain.c * Math.cos(abApi.AB_THETA), 6)))
    throw new Error(`ablation-controls: ${state} does not show the pre-norm growth per block`);
  if (!html.includes(abApi.abNumber(lambda, 6)))
    throw new Error(`ablation-controls: ${state} does not show lambda itself`);
}

// --- registration ------------------------------------------------------------
const abGuides = readConstant("LECTURE_GUIDES");
const abLectures = Object.entries(abGuides).filter(([, guide]) => (guide.labs || []).includes("ablation-controls")).map(([id]) => id);
if (JSON.stringify(abLectures) !== JSON.stringify(["l03"]))
  throw new Error(`ablation-controls: lecture 3 is the one that teaches pre- vs post-norm and the gated activations, found ${JSON.stringify(abLectures)}`);
const abModules = readConstant("MODULES");
if (!abModules.find(entry => entry.id === "transformer")?.labs.includes("ablation-controls"))
  throw new Error("ablation-controls: the lab must be listed in the transformer module");
if (!abModules.find(entry => entry.id === "transformer")?.sources.includes("l03"))
  throw new Error("ablation-controls: the transformer module must cite lecture 3, otherwise the lab sits in the wrong module");
const abAssignments = readConstant("ASSIGNMENTS");
const abMission = abAssignments.find(entry => entry.id === "a1").missions.find(mission => mission.id === "generation-experiments");
if (!abMission || abMission.labs[0] !== "ablation-controls")
  throw new Error("ablation-controls: a1:generation-experiments owns all four ablation problems and must lead with this lab");
for (const problem of ["layer_norm_ablation", "pre_norm_ablation", "no_pos_emb", "swiglu_ablation"]) {
  if (!abMission.scope.includes(problem))
    throw new Error(`ablation-controls: the mission scope must still name ${problem}`);
  // Every ablation must be named on the ledger itself, so the reader can find the problem it answers.
  if (!abApi.AB_VARIANTS.some(variant => variant.problem === `a1:${problem}`))
    throw new Error(`ablation-controls: the ledger must carry a row for the handout problem ${problem}`);
  if (!Object.values(abParamHtml).every(html => html.includes(`a1:${problem}`)))
    throw new Error(`ablation-controls: every rendered ledger must name a1:${problem}`);
}
const abLabs = readConstant("LABS");
const abEntry = abLabs.find(entry => entry.id === "ablation-controls");
if (!abEntry) throw new Error("ablation-controls: missing from LABS");
if (abEntry.module !== "transformer") throw new Error("ablation-controls: the lab belongs to the transformer module");
if (!sliceDeclaration(source, "OBJECTIVE_LAB_IDS").includes('"ablation-controls"'))
  throw new Error("ablation-controls: the lab must be registered in OBJECTIVE_LAB_IDS");
const abAccepted = sliceDeclaration(source, "checkAblationControls");
for (const answer of ["twoExact", "rounding", "exponent"]) {
  if (!abAccepted.includes(`"${answer}"`)) throw new Error(`ablation-controls: the quick check must accept ${answer}`);
  if (!sliceDeclaration(source, "restorePassedLab").includes(answer))
    throw new Error(`ablation-controls: the restore preset must carry ${answer}`);
}
if (!sliceDeclaration(source, "initLab").includes('if(id==="ablation-controls")'))
  throw new Error("ablation-controls: the lab must be wired up in initLab");
const abControls = source.slice(source.indexOf('if(id==="ablation-controls") return `'));
const abControlLine = abControls.slice(0, abControls.indexOf("\n"));
for (const hook of ["layer_norm_ablation", "pre_norm_ablation", "no_pos_emb", "swiglu_ablation"]) {
  if (!abControlLine.includes(hook))
    throw new Error(`ablation-controls: the control panel must name the handout problem ${hook}`);
}
console.log(`ablation-controls OK: ${abValues} values, d_ff reproduced at both of A1's own anchors (${abApi.AB_ROUND64(8 * 512 / 3)} and ${abApi.AB_ROUND64(8 * 1600 / 3)}), post-norm and NoPE exactly parameter-neutral at all ${abApi.AB_ARCHS.length} configurations, the SwiGLU/FFN_SiLU match exact precisely at d_model % 24 === 0, and the stream direction through one block reading 1 / 0 / lambda for pre-norm / post-norm / no norm (lambda^12 = ${abApi.abNumber(Math.pow(abApi.abLambda(1), 12), 0)} at c = 1)`);

// ---- position-signal ---------------------------------------------------------
// A1 7.3 Ablation 2 asks for a learning curve for no_pos_emb and states in the same
// paragraph that a causal decoder "can in theory infer relative or absolute position
// information without being provided with position embeddings explicitly". Before this
// lab the platform mentioned NoPE only as a raw handout title and as one row label in
// the v73 ledger: "Kazemnejad", "absolute Position" and "1/t" had 0 hits, and nothing
// computed a score under two competing position schemes. These guards hold two things:
// L3's design goal read as two separate tests, and the 1/t channel the causal mask alone
// makes readable -- including where it dies in a given precision.
const psNames = ["PS_D", "PS_THETA", "PS_PE_BASE", "PS_HORIZON", "PS_CONTEXT", "PS_CONTENTS",
  "PS_LEARNED", "PS_TABLES", "PS_OFFSETS", "PS_PAIRS", "PS_SCHEMES", "PS_BREAKS", "PS_PRECS",
  "psDot", "psAngle", "psRope", "psPe", "psAdd", "psNorm", "psScore", "psRopeClosed", "psTerms",
  "psSpread", "psRoundBits", "psFirstCollision", "psContextCollisions", "psDistinctInContext"];
const psRenderNames = ["psNumber", "psInt", "psSci", "renderPositionRelative", "renderPositionSignal"];
const psStubs = `
  const esc = value => String(value ?? "").replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const localeCode = () => "en-US";
  const localizedUi = value => String(value);
${sliceDeclaration(source, "fixedNum")}
`;
const psAll = [...psNames, ...psRenderNames];
const psApi = runInNewContext(`${psStubs}${psAll.map(name => sliceDeclaration(source, name)).join("\n")}; ({${psAll.join(",")}})`, {});
let psValues = 0;

// --- A1's own RoPE angle rule, typed again from the handout ---------------------
// A1: theta_{i,k} = i / Theta^((2k-2)/d), k from one, adjacent pairs.
const psRefAngle = (i, k) => i / Math.pow(psApi.PS_THETA, (2 * k - 2) / psApi.PS_D);
for (let i = 0; i <= 12; i++) for (let k = 1; k <= psApi.PS_D / 2; k++) {
  if (Math.abs(psApi.psAngle(i, k) - psRefAngle(i, k)) > 1e-15)
    throw new Error(`position-signal: the RoPE angle at i=${i}, k=${k} does not follow A1's rule`);
  psValues++;
}
// At d = 4 and Theta = 100 the two pairs must rotate by i and i/10 -- the reason the lab
// can show both a fast and a slow pair inside a handful of positions.
if (psApi.psAngle(3, 1) !== 3 || Math.abs(psApi.psAngle(3, 2) - 0.3) > 1e-15)
  throw new Error("position-signal: at d = 4 and Theta = 100 the pairs must rotate by i and i/10");

// --- reference implementations, typed from the sources rather than reused --------
const psRefDot = (a, b) => a.reduce((sum, v, i) => sum + v * b[i], 0);
function psRefRope(x, i) {
  const out = x.slice();
  for (let k = 1; k <= psApi.PS_D / 2; k++) {
    const a = 2 * (k - 1), b = a + 1, th = psRefAngle(i, k);
    out[a] = x[a] * Math.cos(th) - x[b] * Math.sin(th);
    out[b] = x[a] * Math.sin(th) + x[b] * Math.cos(th);
  }
  return out;
}
function psRefPe(i, table) {
  if (table === "learned") return psApi.PS_LEARNED[i].slice();
  const out = [];
  for (let m = 0; m < psApi.PS_D / 2; m++) {
    const w = i / Math.pow(psApi.PS_PE_BASE, 2 * m / psApi.PS_D);
    out.push(Math.sin(w), Math.cos(w));
  }
  return out;
}
function psRefScore(scheme, q, k, i, j, table) {
  if (scheme === "nope") return psRefDot(q, k);
  if (scheme === "rope") return psRefDot(psRefRope(q, i), psRefRope(k, j));
  const ui = psRefPe(i, table), uj = psRefPe(j, table);
  return psRefDot(q.map((v, n) => v + ui[n]), k.map((v, n) => v + uj[n]));
}

// --- L3's design goal, read as the two separate tests it actually is -------------
// "a relative position embedding should be some f(x,i) s.t. <f(x,i),f(y,j)> = g(x,y,i-j)"
// Test one: same distance, shifted positions -> the score may not move.
// Test two: different distance -> the score has to move. NoPE passes one and fails two,
// which is the whole reason the ablation looks harmless on a single score.
let psAbsFailures = 0, psRopeMax = 0;
for (const content of psApi.PS_CONTENTS) for (const table of psApi.PS_TABLES) {
  for (const offset of psApi.PS_OFFSETS) {
    const pairs = psApi.PS_PAIRS[offset.delta];
    if (!pairs || pairs.length !== 4)
      throw new Error(`position-signal: offset ${offset.delta} must carry four position pairs`);
    for (const [i, j] of pairs) {
      if (j - i !== offset.delta)
        throw new Error(`position-signal: pair ${i}/${j} does not have distance ${offset.delta}`);
      for (const scheme of psApi.PS_SCHEMES) {
        const mine = psApi.psScore(scheme.key, content.q, content.k, i, j, table.key);
        const reference = psRefScore(scheme.key, content.q, content.k, i, j, table.key);
        if (Math.abs(mine - reference) > 1e-12)
          throw new Error(`position-signal: ${scheme.key} at ${i}/${j} gives ${mine} instead of ${reference}`);
        psValues++;
      }
    }
    // The four pairs share one distance but sit at different absolute positions.
    const spreads = psApi.PS_SCHEMES.map(scheme =>
      psApi.psSpread(pairs.map(([i, j]) => psApi.psScore(scheme.key, content.q, content.k, i, j, table.key))));
    // NoPE: exactly zero, and exactly zero for the wrong reason -- there is no position in it.
    if (spreads[0] !== 0)
      throw new Error("position-signal: the NoPE spread across equal distances must be exactly zero");
    // RoPE: zero up to the floating-point remainder, because the identity is exact.
    if (spreads[2] > 1e-12)
      throw new Error(`position-signal: the RoPE spread across equal distances must vanish, got ${spreads[2]}`);
    psRopeMax = Math.max(psRopeMax, spreads[2]);
    // Additive: must actually fail, otherwise the lab shows a difference that is not there.
    if (!(spreads[1] > 1e-6))
      throw new Error(`position-signal: the additive spread must be non-zero at ${content.key}/${table.key}/${offset.delta}`);
    psAbsFailures++;
    psValues += 3;
  }
  // Test two: vary the distance from a fixed starting point.
  const sens = psApi.PS_SCHEMES.map(scheme =>
    psApi.psSpread(psApi.PS_OFFSETS.map(offset => psApi.psScore(scheme.key, content.q, content.k, 0, offset.delta, table.key))));
  if (sens[0] !== 0)
    throw new Error("position-signal: under NoPE a single score must carry no distance at all");
  if (!(sens[2] > 0.1))
    throw new Error("position-signal: RoPE has to move when the distance moves, otherwise it carries no position");
  psValues += 3;
}
if (psAbsFailures !== 16)
  throw new Error(`position-signal: the additive scheme must fail the first test in all 16 states, got ${psAbsFailures}`);

// The RoPE identity itself: rotating both and dotting equals one rotation by the difference.
let psClosedMax = 0;
for (const content of psApi.PS_CONTENTS) for (const offset of psApi.PS_OFFSETS)
  for (const [i, j] of psApi.PS_PAIRS[offset.delta]) {
    const direct = psApi.psScore("rope", content.q, content.k, i, j, "sine");
    const closed = psApi.psRopeClosed(content.q, content.k, j - i);
    if (Math.abs(direct - closed) > 1e-12)
      throw new Error(`position-signal: the closed form disagrees with rotate-then-dot at ${i}/${j}`);
    psClosedMax = Math.max(psClosedMax, Math.abs(direct - closed));
    psValues++;
  }
// A rotation preserves length exactly; that is the reason the score can stay comparable.
for (const content of psApi.PS_CONTENTS) for (let i = 0; i <= 12; i++) {
  if (Math.abs(psApi.psNorm(psApi.psRope(content.q, i)) - psApi.psNorm(content.q)) > 1e-12)
    throw new Error(`position-signal: RoPE must not change the length of q at position ${i}`);
  psValues++;
}
// The four terms have to add up to the additive score, otherwise the cross-term story is decoration.
for (const content of psApi.PS_CONTENTS) for (const table of psApi.PS_TABLES)
  for (const [i, j] of psApi.PS_PAIRS[2]) {
    const terms = psApi.psTerms(content.q, content.k, i, j, table.key);
    const total = terms[0] + terms[1] + terms[2] + terms[3];
    if (Math.abs(total - psRefScore("abs", content.q, content.k, i, j, table.key)) > 1e-12)
      throw new Error(`position-signal: the four terms must add up to the additive score at ${i}/${j}`);
    // The content term is the same in every row -- so the whole difference is the cross terms.
    if (Math.abs(terms[0] - psRefDot(content.q, content.k)) > 1e-12)
      throw new Error("position-signal: the first term must be the plain content score");
    psValues += 2;
  }
// The integer table exists so a reader can check a row by hand: A1's own d=4 with the
// learned table at distance two has to give these four scores and a spread of exactly 6.
const psHandRows = psApi.PS_PAIRS[2].map(([i, j]) => psApi.psScore("abs", [1, 0, 1, 0], [1, 1, 1, 1], i, j, "learned"));
if (JSON.stringify(psHandRows) !== JSON.stringify([10, 6, 12, 11]))
  throw new Error(`position-signal: the hand-checkable row must read 10/6/12/11, got ${psHandRows}`);
if (psApi.psSpread(psHandRows) !== 6)
  throw new Error("position-signal: the hand-checkable spread must be exactly 6");

// --- the NoPE mechanism: what the causal mask alone makes readable ---------------
// Uniform weights over the t visible positions put exactly 1/t into a marked channel,
// so the absolute position follows from a reciprocal -- no embedding, no learned weight.
for (let t = 1; t <= 64; t++) {
  if (Math.abs(1 / t - 1 / t) > 0) throw new Error("unreachable");
  // the increment law the lab prints
  const exact = 1 / t - 1 / (t + 1), law = 1 / (t * (t + 1));
  if (Math.abs(exact - law) > 1e-15)
    throw new Error(`position-signal: the increment law fails at t=${t}`);
  psValues++;
}
// Rounding to p significand bits, typed again here.
function psRefRound(x, p) {
  if (x === 0 || !isFinite(x)) return x;
  const s = x < 0 ? -1 : 1, a = Math.abs(x);
  let e = Math.floor(Math.log2(a));
  while (Math.pow(2, e) > a) e--;
  while (Math.pow(2, e + 1) <= a) e++;
  const scale = Math.pow(2, p - 1 - e), m = a * scale;
  let r = Math.floor(m);
  const frac = m - r;
  if (frac > 0.5) r += 1; else if (frac === 0.5 && r % 2 === 1) r += 1;
  return s * r / scale;
}
for (const prec of psApi.PS_PRECS) {
  for (let t = 1; t <= 512; t++) {
    if (psApi.psRoundBits(1 / t, prec.bits) !== psRefRound(1 / t, prec.bits))
      throw new Error(`position-signal: rounding to ${prec.bits} bits disagrees at t=${t}`);
    psValues++;
  }
  // A collision needs the gap to fall under one ulp: 1/(t(t+1)) < (1/t)*2^-(p-1),
  // i.e. t+1 > 2^(p-1). The bound is proved, so nothing may collide below it.
  const bound = Math.pow(2, prec.bits - 1);
  for (let t = 1; t < Math.min(bound - 1, 4096); t++) {
    if (psApi.psRoundBits(1 / t, prec.bits) === psApi.psRoundBits(1 / (t + 1), prec.bits))
      throw new Error(`position-signal: ${prec.key} collides at t=${t}, below the proved bound ${bound}`);
  }
}
// Round-half-to-even is the correct rule, but no 1/t in this lab's range ever lands on a
// tie -- a tie needs 1/t to be exactly representable in p+1 bits, and reciprocals of
// non-powers-of-two are infinite binary fractions. So the tie branch cannot be exercised by
// the lab's own data, and the guard says so instead of pretending otherwise. Its correctness
// is still held, on inputs that do tie.
function psFracAt(x, p) {
  const a = Math.abs(x);
  let e = Math.floor(Math.log2(a));
  while (Math.pow(2, e) > a) e--;
  while (Math.pow(2, e + 1) <= a) e++;
  const m = a * Math.pow(2, p - 1 - e);
  return m - Math.floor(m);
}
for (const prec of psApi.PS_PRECS) {
  for (let t = 1; t <= psApi.PS_HORIZON; t++) {
    if (psFracAt(1 / t, prec.bits) === 0.5)
      throw new Error(`position-signal: 1/${t} ties in ${prec.key}; the tie branch is no longer unreachable and the lab has to say which way it rounds`);
  }
}
// Ties do occur for other inputs, and there the rule has to be the IEEE one: half to even.
for (const prec of psApi.PS_PRECS) {
  // a = (2N+1)/2^p with N in [2^(p-1), 2^p) lands exactly one bit past the significand.
  const base = Math.pow(2, prec.bits - 1);
  for (let n = base; n < base + 64; n++) {
    const tie = (2 * n + 1) / Math.pow(2, prec.bits);
    if (psFracAt(tie, prec.bits) !== 0.5) continue;
    if (psApi.psRoundBits(tie, prec.bits) !== psRefRound(tie, prec.bits))
      throw new Error(`position-signal: rounding a tie in ${prec.key} must go to even`);
    const rounded = psApi.psRoundBits(tie, prec.bits) * Math.pow(2, prec.bits - 1);
    if (Math.abs(rounded - Math.round(rounded)) > 1e-9 || Math.round(rounded) % 2 !== 0)
      throw new Error(`position-signal: a tie in ${prec.key} must round to an even significand`);
    psValues++;
  }
}
// The context window is counted over the pairs that lie inside it, so t runs to 255 and not
// to 256. In these three formats the boundary pair happens to be indistinguishable either
// way -- stated here as a checked fact, so nobody reads the range as arbitrary.
for (const prec of psApi.PS_PRECS) {
  if (psApi.psRoundBits(1 / psApi.PS_CONTEXT, prec.bits) === psApi.psRoundBits(1 / (psApi.PS_CONTEXT + 1), prec.bits))
    throw new Error(`position-signal: ${prec.key} collides at the context boundary, so the counted range now matters and must be restated`);
}
// fp32 is A1's default and must survive the whole search horizon; bf16 must not.
const psFirst = Object.fromEntries(psApi.PS_PRECS.map(prec => [prec.key, psApi.psFirstCollision(prec.bits)]));
if (psFirst.fp32 !== null)
  throw new Error("position-signal: fp32 must not lose the channel inside the search horizon");
if (psFirst.bf16 !== 190)
  throw new Error(`position-signal: in bf16 the channel must first collide at t = 190, got ${psFirst.bf16}`);
if (psFirst.fp16 !== 1464)
  throw new Error(`position-signal: in fp16 the channel must first collide at t = 1464, got ${psFirst.fp16}`);
// The point of the whole mode: bf16 dies inside A1's own context length of 256.
if (psApi.PS_CONTEXT !== 256)
  throw new Error("position-signal: A1 7.2.1 states 'Context length 256' and the lab must use it");
if (psFirst.bf16 >= psApi.PS_CONTEXT)
  throw new Error("position-signal: the bf16 collision has to fall inside A1's context length, otherwise the finding is academic");
const psCtx = psApi.psContextCollisions(8), psDistinct = psApi.psDistinctInContext(8);
if (psCtx !== 22)
  throw new Error(`position-signal: bf16 must lose 22 neighbour pairs within 256 positions, got ${psCtx}`);
if (psDistinct !== 234)
  throw new Error(`position-signal: bf16 must keep 234 of 256 positions distinguishable, got ${psDistinct}`);
if (psApi.psContextCollisions(11) !== 0 || psApi.psDistinctInContext(11) !== 256)
  throw new Error("position-signal: fp16 must keep all 256 positions apart -- the inversion against bf16 is the point");
if (psApi.psContextCollisions(24) !== 0 || psApi.psDistinctInContext(24) !== 256)
  throw new Error("position-signal: fp32 must keep all 256 positions apart");
psValues += 6;

// --- renderer guards, anchored to the rendered line rather than to a bare number --
// v73's lesson, one turn sharper: a guard that searches for a number does not check the
// row the number is supposed to stand in. Every check below pins the concrete cell.
const psRelativeHtml = {};
for (const content of psApi.PS_CONTENTS) for (const table of psApi.PS_TABLES) for (const offset of psApi.PS_OFFSETS)
  psRelativeHtml[`${content.key}|${table.key}|${offset.key}`] =
    psApi.renderPositionRelative(content.key, table.key, offset.key);
const psSignalHtml = {};
for (const brk of psApi.PS_BREAKS) for (const prec of psApi.PS_PRECS)
  psSignalHtml[`${brk.key}|${prec.key}`] = psApi.renderPositionSignal(brk.key, prec.key);
if (Object.keys(psRelativeHtml).length !== 16 || Object.keys(psSignalHtml).length !== 6)
  throw new Error("position-signal: the lab must render 16 + 6 states");
for (const [key, html] of [...Object.entries(psRelativeHtml), ...Object.entries(psSignalHtml)]) {
  if (/undefined|NaN|\[object/.test(html))
    throw new Error(`position-signal: state ${key} renders undefined/NaN`);
}
// Both spread cells of every mode-A state, in the cell they belong to.
for (const [key, html] of Object.entries(psRelativeHtml)) {
  if (!html.includes('<td data-spread="nope">exakt null</td>'))
    throw new Error(`position-signal: ${key} must show the NoPE spread as exactly zero in its own cell`);
  if (!html.includes('<td data-sensspread="nope">exakt null</td>'))
    throw new Error(`position-signal: ${key} must show NoPE carrying no distance in its own cell`);
  if (/<td data-sensspread="rope">exakt null<\/td>/.test(html))
    throw new Error(`position-signal: ${key} must not claim RoPE ignores the distance`);
}
// The hand-checkable state has to print its four scores and its spread of 6.
const psHandHtml = psRelativeHtml["weKnow|learned|o2"];
for (const [pair, value] of [["0-2", "10.000000"], ["1-3", "6.000000"], ["3-5", "12.000000"], ["6-8", "11.000000"]]) {
  if (!psHandHtml.includes(`<td data-equal="abs-${pair.replace("-", "-")}">${value}</td>`))
    throw new Error(`position-signal: the hand-checkable additive cell ${pair} must read ${value}`);
}
if (!psHandHtml.includes('<td data-spread="abs">6.00e+0</td>'))
  throw new Error("position-signal: the hand-checkable additive spread must render as 6 in its own cell");
// Mode B: the marker channel, the recovered position, and the three numbers that carry the finding.
const psMarked = psSignalHtml["marked|bf16"];
if (!psMarked.includes('<td data-marker="3">0.333333</td>'))
  throw new Error("position-signal: the marker channel must read 1/3 at position 3");
if (!psMarked.includes('<td data-recovered="3">3.0000</td>'))
  throw new Error("position-signal: position 3 must be recovered as exactly 3");
if (!psMarked.includes('<strong data-first="1">190</strong>'))
  throw new Error("position-signal: the bf16 state must print the first collision as 190 in its own row");
if (!psMarked.includes('<strong data-ctxcoll="1">22</strong>'))
  throw new Error("position-signal: the bf16 state must print 22 colliding neighbour pairs in its own row");
if (!psMarked.includes('<strong data-distinct="1">234 von 256</strong>'))
  throw new Error("position-signal: the bf16 state must print 234 of 256 distinguishable positions in its own row");
const psFlat = psSignalHtml["flat|bf16"];
if (!psFlat.includes('<td data-marker="3">1.000000</td>'))
  throw new Error("position-signal: without a marker the channel must read one at every position");
if (!psFlat.includes('<td data-recovered="3">nicht rekonstruierbar</td>'))
  throw new Error("position-signal: without a marker no position may be claimed as recovered");
if (psFlat.includes('data-first="1">190<'))
  throw new Error("position-signal: the control state must not report a collision point");
const psFp32 = psSignalHtml["marked|fp32"];
if (!/<strong data-first="1">keines bis zum Suchhorizont 4,096<\/strong>/.test(psFp32))
  throw new Error("position-signal: fp32 must report that it survives the whole horizon, in its own row");

// --- registration: the lab has to be reachable from lecture, module and problem ----
const psLabs = readConstant("LABS");
const psEntry = psLabs.find(entry => entry.id === "position-signal");
if (!psEntry) throw new Error("position-signal: missing from LABS");
if (psEntry.module !== "transformer")
  throw new Error("position-signal: the lab belongs to the transformer module");
// Lecture 3 is the one that derives RoPE from <f(x,i),f(y,j)> = g(x,y,i-j); no other lecture may own this lab.
const psGuides = readConstant("LECTURE_GUIDES");
const psOwning = Object.entries(psGuides).filter(([, guide]) => (guide.labs || []).includes("position-signal")).map(([id]) => id);
if (JSON.stringify(psOwning) !== JSON.stringify(["l03"]))
  throw new Error(`position-signal: lecture 3 derives RoPE and must be the only owner, found ${JSON.stringify(psOwning)}`);
const psModules = readConstant("MODULES");
if (!psModules.find(entry => entry.id === "transformer")?.labs.includes("position-signal"))
  throw new Error("position-signal: the lab must be listed in the transformer module");
const psAssignments = readConstant("ASSIGNMENTS");
const psMission = psAssignments.find(entry => entry.id === "a1").missions.find(mission => mission.id === "generation-experiments");
if (!psMission || !psMission.labs.includes("position-signal"))
  throw new Error("position-signal: a1:generation-experiments owns no_pos_emb and must carry this lab");
if (!psMission.scope.includes("no_pos_emb"))
  throw new Error("position-signal: the mission scope must still name no_pos_emb");
const psProblems = readConstant("HANDOUT_PROBLEMS");
if (!psProblems["a1:no_pos_emb"])
  throw new Error("position-signal: the handout problem a1:no_pos_emb must still exist");
if (!sliceDeclaration(source, "OBJECTIVE_LAB_IDS").includes('"position-signal"'))
  throw new Error("position-signal: the lab must be registered in OBJECTIVE_LAB_IDS");
const psAccepted = sliceDeclaration(source, "checkPositionSignal");
for (const answer of ["ropeOnly", "maskAndToken", "t190"]) {
  if (!psAccepted.includes(`"${answer}"`))
    throw new Error(`position-signal: the quick check must accept ${answer}`);
  if (!sliceDeclaration(source, "restorePassedLab").includes(answer))
    throw new Error(`position-signal: the restore preset must carry ${answer}`);
}
if (!sliceDeclaration(source, "initLab").includes('if(id==="position-signal")'))
  throw new Error("position-signal: the lab must be wired up in initLab");
// The control panel has to name the handout problem, so the reader can find what this answers.
const psControls = source.slice(source.indexOf('if(id==="position-signal") return `'));
const psControlLine = psControls.slice(0, psControls.indexOf("\n"));
if (!psControlLine.includes("no_pos_emb"))
  throw new Error("position-signal: the control panel must name the handout problem no_pos_emb");

console.log(`position-signal OK: ${psValues} values, L3's design goal split into its two tests (NoPE passes the first with an exact 0 and fails the second with an exact 0, the additive scheme fails the first in all ${psAbsFailures} states, RoPE passes both with a residue under ${psRopeMax.toExponential(1)}), the rotate-then-dot identity closed to ${psClosedMax.toExponential(1)}, and the 1/t channel of a causal mask dying at t = ${psFirst.bf16} in bf16 against ${psFirst.fp16} in fp16 -- ${psCtx} neighbour pairs lost and ${psDistinct} of ${psApi.PS_CONTEXT} positions left inside A1's own context length`);


// ---- pipeline-yield ----------------------------------------------------------
// A4 Problem (filter_data) (a) asks for "A written breakdown of what proportion of the
// discarded examples are removed by each filter step" and (b) for "How long does it take
// to filter the provided WET files (originally 2,500 raw WET files)? How long would it
// take to filter the entire Common Crawl dump?". Both hang on the same quantity: how many
// documents a stage actually gets to see. Before this lab "Kaskade", "cascade",
// "Zurechnung" and "per stage" had 0 hits, and no lab computed a stage count at all.
// These guards hold the one structural fact the lab claims -- the kept set is an
// intersection and therefore order-free, while attribution and cost are not -- against a
// reference typed from the definitions rather than reused from the app.
const fcNames = ["FC_STAGES", "FC_SIGNATURES", "FC_COST", "FC_ORDERS", "FC_MEASURES",
  "FC_SAMPLE_SHARE", "FC_A4_FILES", "FC_DOCS_PER_FILE", "FC_WORKERS", "FC_PUBLISHED",
  "fcTotal", "fcKept", "fcRejected", "fcIsolated", "fcAttribution", "fcReaching",
  "fcCascadeCost", "fcFullCost", "fcMeasureCost", "fcPermutations", "fcAllOrders",
  "fcCostExtremes", "fcAttributionRange", "fcRuleKey"];
const fcRenderNames = ["fcNum", "fcInt", "fcPct", "renderPipelineAttribution",
  "renderPipelineCost", "pipelineYieldSuccessMarkup"];
const fcStubs = `
  const esc = value => String(value ?? "").replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const localeCode = () => "en-US";
  const localizedUi = value => String(value);
${sliceDeclaration(source, "fixedNum")}
`;
const fcAll = [...fcNames, ...fcRenderNames];
const fcApi = runInNewContext(`${fcStubs}${fcAll.map(name => sliceDeclaration(source, name)).join("\n")}; ({${fcAll.join(",")}})`, {});
let fcValues = 0;

// --- reference, typed from the definitions and not from the app -------------------
// A document survives iff it passes every stage, so the kept set is the intersection of
// the pass sets. Everything below is counted off the explicit failure signatures.
const fcKeys = ["L", "G", "Q", "D"];
const fcRefTotal = fcApi.FC_SIGNATURES.reduce((sum, entry) => sum + entry.n, 0);
const fcRefKept = fcApi.FC_SIGNATURES.filter(entry => entry.sig === "").reduce((sum, entry) => sum + entry.n, 0);
const fcRefRejected = fcRefTotal - fcRefKept;
if (fcRefTotal !== 10000) throw new Error(`pipeline-yield: the corpus must hold 10000 documents, found ${fcRefTotal}`);
if (fcApi.fcTotal() !== fcRefTotal || fcApi.fcKept() !== fcRefKept || fcApi.fcRejected() !== fcRefRejected)
  throw new Error("pipeline-yield: corpus totals disagree with the signature table");
// Each signature must be a subset of the four stages, spelled in canonical order, and
// each combination must appear exactly once -- otherwise a count could hide in a duplicate.
const fcSeen = new Set();
for (const entry of fcApi.FC_SIGNATURES) {
  if (!/^[LGQD]*$/.test(entry.sig)) throw new Error(`pipeline-yield: signature ${entry.sig} names a stage that does not exist`);
  if (entry.sig !== fcKeys.filter(key => entry.sig.includes(key)).join(""))
    throw new Error(`pipeline-yield: signature ${entry.sig} is not written in canonical stage order`);
  if (fcSeen.has(entry.sig)) throw new Error(`pipeline-yield: signature ${entry.sig} appears twice`);
  if (!Number.isInteger(entry.n) || entry.n <= 0) throw new Error(`pipeline-yield: signature ${entry.sig} must carry a positive whole count`);
  fcSeen.add(entry.sig);
}
if (fcSeen.size !== 16)
  throw new Error(`pipeline-yield: all 16 failure combinations must be spelled out, found ${fcSeen.size}`);
fcValues += 3;

// The keep rate is set, but it is set to a published number and must stay on it.
// L13: RefinedWeb "Release 600B (out of 5T) tokens".
const fcRefined = fcApi.FC_PUBLISHED.find(entry => entry.key === "refined");
if (!fcRefined || fcRefined.out !== 600 || fcRefined.inp !== 5000)
  throw new Error("pipeline-yield: RefinedWeb's published yield is 600B out of 5T and must be quoted as such");
const fcDclm = fcApi.FC_PUBLISHED.find(entry => entry.key === "dclm");
if (!fcDclm || fcDclm.out !== 3800 || fcDclm.inp !== 240000)
  throw new Error("pipeline-yield: DCLM-baseline's published yield is 3.8T out of a 240T pool");
if (fcRefKept / fcRefTotal !== fcRefined.out / fcRefined.inp)
  throw new Error("pipeline-yield: the corpus keep rate is chosen to sit on RefinedWeb's published share and must stay there");
if (!(fcDclm.out / fcDclm.inp < fcRefined.out / fcRefined.inp))
  throw new Error("pipeline-yield: the classifier-filtered pipeline must be the more aggressive of the two");
fcValues += 4;

// --- isolated rejection, and why it cannot answer A4's question -------------------
const fcRefIsolated = {};
for (const key of fcKeys) {
  fcRefIsolated[key] = fcApi.FC_SIGNATURES.filter(entry => entry.sig.includes(key)).reduce((sum, entry) => sum + entry.n, 0);
  if (fcApi.fcIsolated(key) !== fcRefIsolated[key])
    throw new Error(`pipeline-yield: isolated rejection for ${key} disagrees with the signature table`);
  fcValues++;
}
const fcIsoSum = fcKeys.reduce((sum, key) => sum + fcRefIsolated[key], 0);
// Inclusion-exclusion: counting each stage alone counts a document once per reason.
const fcOverlap = fcApi.FC_SIGNATURES.filter(entry => entry.sig).reduce((sum, entry) => sum + entry.n * (entry.sig.length - 1), 0);
if (fcIsoSum - fcRefRejected !== fcOverlap)
  throw new Error(`pipeline-yield: the overcount must equal the number of extra reasons, ${fcIsoSum - fcRefRejected} != ${fcOverlap}`);
if (!(fcIsoSum > fcRefRejected))
  throw new Error("pipeline-yield: without overlapping reasons the lab has nothing to show -- the isolated shares must overcount");
if (fcOverlap !== 4420) throw new Error(`pipeline-yield: the overcount is 4420 documents, found ${fcOverlap}`);
const fcIsoShare = 100 * fcIsoSum / fcRefRejected;
if (fcIsoShare.toFixed(4) !== "150.2273")
  throw new Error(`pipeline-yield: the isolated shares must sum to 150.2273 % of the discards, found ${fcIsoShare.toFixed(4)}`);
fcValues += 3;

// --- attribution: order-free total, order-dependent split -------------------------
// Reference attribution: charge a document to the first stage in the order it fails.
function fcRefAttribution(order) {
  const out = Object.fromEntries(fcKeys.map(key => [key, 0]));
  for (const entry of fcApi.FC_SIGNATURES) {
    for (const key of order) { if (entry.sig.includes(key)) { out[key] += entry.n; break; } }
  }
  return out;
}
// Reference reaching: a stage sees whatever every earlier stage let through.
function fcRefReaching(order) {
  const out = {};
  for (let i = 0; i < order.length; i++) {
    const before = order.slice(0, i);
    out[order[i]] = fcApi.FC_SIGNATURES.filter(entry => !before.some(key => entry.sig.includes(key)))
      .reduce((sum, entry) => sum + entry.n, 0);
  }
  return out;
}
const fcOrders = fcApi.fcAllOrders();
if (fcOrders.length !== 24) throw new Error(`pipeline-yield: there are 24 orders of four stages, found ${fcOrders.length}`);
if (new Set(fcOrders.map(order => order.join(""))).size !== 24)
  throw new Error("pipeline-yield: the permutation helper must produce 24 distinct orders");
const fcSpread = Object.fromEntries(fcKeys.map(key => [key, { low: Infinity, high: -Infinity }]));
for (const order of fcOrders) {
  const attribution = fcApi.fcAttribution(order), reference = fcRefAttribution(order);
  const reaching = fcApi.fcReaching(order), reachRef = fcRefReaching(order);
  let sum = 0;
  for (const key of fcKeys) {
    if (attribution[key] !== reference[key])
      throw new Error(`pipeline-yield: attribution for ${key} in ${order.join("")} disagrees with the reference`);
    if (reaching[key] !== reachRef[key])
      throw new Error(`pipeline-yield: reaching count for ${key} in ${order.join("")} disagrees with the reference`);
    sum += attribution[key];
    fcSpread[key].low = Math.min(fcSpread[key].low, attribution[key]);
    fcSpread[key].high = Math.max(fcSpread[key].high, attribution[key]);
  }
  // The claim the whole lab rests on: the split moves, the total never does.
  if (sum !== fcRefRejected)
    throw new Error(`pipeline-yield: order ${order.join("")} attributes ${sum} documents, but ${fcRefRejected} are discarded`);
  // The first stage always sees everything; no stage ever sees more than the one before it.
  if (reaching[order[0]] !== fcRefTotal)
    throw new Error(`pipeline-yield: the first stage of ${order.join("")} must see the whole corpus`);
  for (let i = 1; i < order.length; i++) {
    if (!(reaching[order[i]] <= reaching[order[i - 1]]))
      throw new Error(`pipeline-yield: a stage cannot see more documents than the stage before it (${order.join("")})`);
  }
  // A stage placed first is charged exactly what it rejects alone.
  if (attribution[order[0]] !== fcRefIsolated[order[0]])
    throw new Error(`pipeline-yield: a stage running first must be charged its isolated rejection (${order.join("")})`);
  fcValues += 2;
}
for (const key of fcKeys) {
  const range = fcApi.fcAttributionRange(key);
  if (range.low !== fcSpread[key].low || range.high !== fcSpread[key].high)
    throw new Error(`pipeline-yield: the reported range for ${key} disagrees with the brute-force spread`);
  // A stage that never moved would make the lab's point vanish.
  if (!(range.high > range.low))
    throw new Error(`pipeline-yield: stage ${key} must actually move across the 24 orders`);
  // The maximum is reached by placing the stage first, the minimum by placing it last.
  if (range.high !== fcRefIsolated[key])
    throw new Error(`pipeline-yield: the largest attribution for ${key} must be its isolated rejection`);
  fcValues += 2;
}
// The three numbers the prose and the quick check quote by name.
if (fcSpread.Q.low !== 1800 || fcSpread.Q.high !== 4500)
  throw new Error(`pipeline-yield: the quality classifier ranges from 1800 to 4500, found ${fcSpread.Q.low}..${fcSpread.Q.high}`);
if ((100 * fcSpread.Q.low / fcRefRejected).toFixed(4) !== "20.4545" || (100 * fcSpread.Q.high / fcRefRejected).toFixed(4) !== "51.1364")
  throw new Error("pipeline-yield: the classifier's share of the discards must run from 20.4545 % to 51.1364 %");
if ((fcSpread.G.high / fcSpread.G.low).toFixed(6) !== "3.857143")
  throw new Error("pipeline-yield: the Gopher rules must swing by a factor of 3.857143");
fcValues += 3;

// --- cost: order-dependent, with the same output ----------------------------------
function fcRefCost(order) {
  const reaching = fcRefReaching(order);
  return order.reduce((sum, key) => sum + fcApi.FC_COST[key] * reaching[key], 0);
}
const fcScored = fcOrders.map(order => ({ order, cost: fcRefCost(order) }));
let fcLow = fcScored[0], fcHigh = fcScored[0];
for (const entry of fcScored) {
  if (entry.cost < fcLow.cost) fcLow = entry;
  if (entry.cost > fcHigh.cost) fcHigh = entry;
  if (Math.abs(fcApi.fcCascadeCost(entry.order) - entry.cost) > 1e-9)
    throw new Error(`pipeline-yield: cascade cost for ${entry.order.join("")} disagrees with the reference`);
  fcValues++;
}
const fcExtremes = fcApi.fcCostExtremes();
if (fcExtremes.low.order.join("") !== fcLow.order.join("") || fcExtremes.high.order.join("") !== fcHigh.order.join(""))
  throw new Error(`pipeline-yield: the reported extremes ${fcExtremes.low.order.join("")}/${fcExtremes.high.order.join("")} are not the brute-force extremes`);
if (fcLow.order.join("") !== "GLQD" || fcHigh.order.join("") !== "DQLG")
  throw new Error(`pipeline-yield: the cheapest order is GLQD and the dearest DQLG, found ${fcLow.order.join("")}/${fcHigh.order.join("")}`);
if ((fcHigh.cost / fcLow.cost).toFixed(6) !== "1.887338")
  throw new Error(`pipeline-yield: the spread between cheapest and dearest order is 1.887338, found ${(fcHigh.cost / fcLow.cost).toFixed(6)}`);
fcValues += 3;

// c/p, the rule that weighs price against selectivity, must pick the brute-force optimum.
const fcRuleOrder = fcKeys.slice().sort((a, b) =>
  (fcApi.FC_COST[a] / (fcRefIsolated[a] / fcRefTotal)) - (fcApi.FC_COST[b] / (fcRefIsolated[b] / fcRefTotal)));
if (fcRuleOrder.join("") !== fcLow.order.join(""))
  throw new Error(`pipeline-yield: c/p orders to ${fcRuleOrder.join("")} but the cheapest order is ${fcLow.order.join("")}`);
for (const key of fcKeys) {
  if (Math.abs(fcApi.fcRuleKey(key) - fcApi.FC_COST[key] / (fcRefIsolated[key] / fcRefTotal)) > 1e-12)
    throw new Error(`pipeline-yield: the c/p key for ${key} is not price over rejected share`);
  fcValues++;
}
// Sorting by price alone must land somewhere else -- otherwise the lab's point is empty.
const fcPriceOrder = fcKeys.slice().sort((a, b) => fcApi.FC_COST[a] - fcApi.FC_COST[b]);
if (fcPriceOrder.join("") === fcLow.order.join(""))
  throw new Error("pipeline-yield: price alone must not already produce the optimum, or the lab claims nothing");
if (!(fcRefCost(fcPriceOrder) > fcLow.cost))
  throw new Error("pipeline-yield: ordering by price alone must cost strictly more than the optimum");
fcValues += 2;

// The four named orders must be exactly the ones the prose calls them.
const fcNamed = Object.fromEntries(fcApi.FC_ORDERS.map(entry => [entry.key, entry.order.join("")]));
if (fcNamed.a4 !== "LGQD") throw new Error("pipeline-yield: the a4 order must follow the sequence the handout introduces the filters in");
if (fcNamed.cost !== fcPriceOrder.join("")) throw new Error("pipeline-yield: the cost order must be the one price alone produces");
if (fcNamed.rule !== fcRuleOrder.join("")) throw new Error("pipeline-yield: the rule order must be the one c/p produces");
if (fcNamed.worst !== fcHigh.order.join("")) throw new Error("pipeline-yield: the worst order must be the brute-force dearest");
// Every named order keeps the same corpus -- that is the whole claim.
for (const entry of fcApi.FC_ORDERS) {
  const attribution = fcApi.fcAttribution(entry.order);
  if (fcKeys.reduce((sum, key) => sum + attribution[key], 0) !== fcRefRejected)
    throw new Error(`pipeline-yield: named order ${entry.key} does not discard the same documents`);
  fcValues++;
}
fcValues += 4;

// --- measurement designs, and A4's two halves pulling apart -----------------------
const fcFull = fcKeys.reduce((sum, key) => sum + fcApi.FC_COST[key] * fcRefTotal, 0);
if (Math.abs(fcApi.fcFullCost() - fcFull) > 1e-9)
  throw new Error("pipeline-yield: evaluating every stage on every document must cost the full price four times over");
// Running everything on everything must be the same whatever order is named.
for (const entry of fcApi.FC_ORDERS) {
  if (Math.abs(fcApi.fcMeasureCost(entry.order, "full") - fcFull) > 1e-9)
    throw new Error("pipeline-yield: the full-signature run cannot depend on the order");
}
const fcRuleCascade = fcRefCost(fcRuleOrder);
const fcFullRatio = fcFull / fcRuleCascade;
if (fcFullRatio.toFixed(6) !== "2.392822")
  throw new Error(`pipeline-yield: the full signature costs 2.392822x the cheapest cascade, found ${fcFullRatio.toFixed(6)}`);
const fcSampleCost = fcApi.FC_SAMPLE_SHARE * fcFull + (1 - fcApi.FC_SAMPLE_SHARE) * fcRuleCascade;
if (Math.abs(fcApi.fcMeasureCost(fcRuleOrder, "sample") - fcSampleCost) > 1e-9)
  throw new Error("pipeline-yield: the sampled design must mix the two costs by the sample share");
if ((fcSampleCost / fcRuleCascade).toFixed(6) !== "1.013928")
  throw new Error(`pipeline-yield: a 1 % sample costs 1.013928x the cascade, found ${(fcSampleCost / fcRuleCascade).toFixed(6)}`);
if (fcApi.FC_SAMPLE_SHARE !== 0.01)
  throw new Error("pipeline-yield: the sampled design is stated as 1 % and must stay 1 %");
// The resolution only exists if the sample really is far cheaper than the full pass.
if (!(fcSampleCost < fcFull && fcSampleCost / fcRuleCascade < fcFullRatio))
  throw new Error("pipeline-yield: the sampled design must be the cheap way to buy an order-free split");
fcValues += 4;

// --- A4 (b): the runtime the handout asks for ------------------------------------
if (fcApi.FC_A4_FILES !== 2500)
  throw new Error("pipeline-yield: A4 names 2,500 raw WET files and the lab must use that number");
const fcPerDoc = fcRuleCascade / fcRefTotal;
const fcHoursAt = workers => fcPerDoc * fcApi.FC_DOCS_PER_FILE * fcApi.FC_A4_FILES / workers / 1000 / 3600;
for (const workers of fcApi.FC_WORKERS) {
  if (!Number.isInteger(workers) || workers < 1)
    throw new Error("pipeline-yield: the worker counts must be whole processes");
  if (Math.abs(fcHoursAt(workers) * workers - fcHoursAt(1)) > 1e-9)
    throw new Error("pipeline-yield: the runtime table must scale strictly with the number of processes");
  fcValues++;
}
if (fcHoursAt(1).toFixed(6) !== "27.861111")
  throw new Error(`pipeline-yield: one process needs 27.861111 h for A4's 2,500 files, found ${fcHoursAt(1).toFixed(6)}`);
if (fcHoursAt(8).toFixed(6) !== "3.482639")
  throw new Error(`pipeline-yield: eight processes need 3.482639 h, found ${fcHoursAt(8).toFixed(6)}`);
fcValues += 2;
// The reference above proves the arithmetic; these read the numbers the table actually
// prints, so the rendered runtime cannot drift away from it.
const fcRunHtml = fcApi.renderPipelineCost("rule", "short");
const fcCell = (html, attribute, key) => {
  const match = html.match(new RegExp(`data-${attribute}="${key}">([^<]*)`));
  if (!match) throw new Error(`pipeline-yield: the rendered table has no ${attribute} cell for ${key}`);
  return match[1];
};
for (const workers of fcApi.FC_WORKERS) {
  const printed = fcCell(fcRunHtml, "fchours", workers).replace(" h", "");
  if (printed !== fcApi.fcNum(fcHoursAt(workers), 6))
    throw new Error(`pipeline-yield: the runtime printed for ${workers} processes (${printed}) is not the computed one`);
  const perFile = fcCell(fcRunHtml, "fcperfile", workers).replace(" s", "");
  if (perFile !== fcApi.fcNum(fcPerDoc * fcApi.FC_DOCS_PER_FILE / 1000, 4))
    throw new Error(`pipeline-yield: the per-file time printed for ${workers} processes is not the computed one`);
  fcValues += 2;
}
if (fcCell(fcRunHtml, "fcperdoc", "1").replace(" ms", "") !== fcApi.fcNum(fcPerDoc, 6))
  throw new Error("pipeline-yield: the per-document cost printed in the ledger is not the computed one");
if (fcCell(fcRunHtml, "fcthroughput", "1").split(" ")[0] !== fcApi.fcNum(1000 / fcPerDoc, 4))
  throw new Error("pipeline-yield: the throughput printed in the ledger is not 1000 / the per-document cost");
// The whole point of the worker column is that it divides; a sublinear stand-in would
// still look plausible in the table.
const fcHoursPrinted = workers => Number(fcCell(fcRunHtml, "fchours", workers).replace(" h", ""));
for (const workers of fcApi.FC_WORKERS) {
  // The printed values carry six decimals, so the slack has to grow with the multiplier.
  if (Math.abs(fcHoursPrinted(workers) * workers - fcHoursPrinted(1)) > 5e-7 * (workers + 1))
    throw new Error(`pipeline-yield: the printed runtime for ${workers} processes does not divide the single-process runtime`);
  fcValues++;
}

// --- rendered states: 4x4 attribution plus 4x3 cost ------------------------------
const fcStates = [];
for (const order of fcApi.FC_ORDERS) {
  for (const stage of fcApi.FC_STAGES)
    fcStates.push([`A:${order.key}/${stage.key}`, fcApi.renderPipelineAttribution(order.key, stage.key)]);
  for (const measure of fcApi.FC_MEASURES)
    fcStates.push([`B:${order.key}/${measure.key}`, fcApi.renderPipelineCost(order.key, measure.key)]);
}
if (fcStates.length !== 28)
  throw new Error(`pipeline-yield: the lab must expose 28 states, found ${fcStates.length}`);
for (const [name, html] of fcStates) {
  if (/undefined|NaN/.test(html)) throw new Error(`pipeline-yield: state ${name} renders undefined or NaN`);
  if (/\$\{/.test(html)) throw new Error(`pipeline-yield: state ${name} leaves a template literal unresolved`);
  for (const table of html.split("<table").slice(1)) {
    const columns = (table.match(/<th scope="col"/g) || []).length;
    if (!columns) throw new Error(`pipeline-yield: a table in ${name} has no header`);
    // Split on "<tr" rather than "<tr>": rows carrying class="is-active" are still rows,
    // and gluing them onto the header would hide exactly the states the controls select.
    for (const row of table.split("<tr").slice(2)) {
      const cells = (row.match(/<t[dh][ >]/g) || []).length;
      if (cells && cells !== columns)
        throw new Error(`pipeline-yield: a row in ${name} does not match its header width (${cells} cells against ${columns} columns)`);
    }
  }
  fcValues++;
}
// Every mode-A state must show the two numbers that never move, and every mode-B state
// must show that the kept count is the same in each of the four orders.
const fcKeptText = fcApi.fcInt(fcRefKept), fcRejText = fcApi.fcInt(fcRefRejected);
for (const [name, html] of fcStates) {
  if (name.startsWith("A:")) {
    if (!html.includes(`data-fckept="1">${fcKeptText}`))
      throw new Error(`pipeline-yield: ${name} must report the invariant kept count`);
    if (!html.includes(`data-fcattrsum="1"><strong>${fcRejText}`))
      throw new Error(`pipeline-yield: ${name} must report the invariant attributed total`);
  } else {
    for (const entry of fcApi.FC_ORDERS) {
      if (!html.includes(`data-fcorderkept="${entry.key}">${fcKeptText}`))
        throw new Error(`pipeline-yield: ${name} must show that order ${entry.key} keeps the same documents`);
    }
  }
  fcValues++;
}

// --- prose numerals: they do not move when the code does, so each one gets a guard ---
const fcDe = value => String(value).replace(".", ",");
const fcAttrHtml = fcApi.renderPipelineAttribution("a4", "Q");
const fcCostHtml = fcApi.renderPipelineCost("a4", "short");
const fcQLowPct = fcDe((100 * fcSpread.Q.low / fcRefRejected).toFixed(4));
const fcQHighPct = fcDe((100 * fcSpread.Q.high / fcRefRejected).toFixed(4));
const fcProse = [
  [fcAttrHtml, `zwischen ${fcQLowPct} % und ${fcQHighPct} % der verworfenen Dokumente`],
  [fcAttrHtml, `um den Faktor ${fcDe((fcSpread.G.high / fcSpread.G.low).toFixed(6))}`],
  [fcAttrHtml, `also ${fcDe((100 * fcRefined.out / fcRefined.inp).toFixed(6))} %`],
  [fcAttrHtml, `${fcDe(String(fcDclm.out / 1000))}T aus ${fcDclm.inp / 1000}T, also ${fcDe((100 * fcDclm.out / fcDclm.inp).toFixed(6))} %`],
  [fcCostHtml, `den Faktor ${fcDe(fcFullRatio.toFixed(6))} gegenüber der billigsten Kaskade`],
  [fcCostHtml, `kostet das den Faktor ${fcDe((fcSampleCost / fcRuleCascade).toFixed(6))}`],
];
for (const [html, needle] of fcProse) {
  if (!html.includes(needle))
    throw new Error(`pipeline-yield: the prose must quote the computed number -- missing ${JSON.stringify(needle)}`);
  fcValues++;
}
// The numbers the lab card and the quick check quote outside any render.
const fcLabs = readConstant("LABS");
const fcLab = fcLabs.find(entry => entry.id === "pipeline-yield");
if (!fcLab) throw new Error("pipeline-yield: the lab must exist in LABS");
// The card is German prose, so its thousands separators are German ones -- the rendered
// tables above go through the app's own locale helper instead.
const fcDeInt = value => Number(value).toLocaleString("de-DE");
const fcCardProse = [
  [fcLab.desc, fcDe((fcSpread.G.high / fcSpread.G.low).toFixed(6))],
  [fcLab.desc, fcDe((fcHigh.cost / fcLow.cost).toFixed(6))],
  [fcLab.observe, fcDeInt(fcRefKept)],
  [fcLab.observe, fcDeInt(fcRefRejected)],
  [fcLab.observe, fcDe(fcIsoShare.toFixed(4))],
  [fcLab.observe, fcDeInt(fcOverlap)],
  [fcLab.observe, fcDe(fcFullRatio.toFixed(6))],
  [fcLab.observe, fcDe((fcSampleCost / fcRuleCascade).toFixed(6))],
  [fcLab.misconception, fcDe(fcIsoShare.toFixed(4))],
  [fcLab.misconception, fcDe((fcSpread.G.high / fcSpread.G.low).toFixed(6))],
  [fcLab.transferAnswer, fcDeInt(fcOverlap)],
  [fcLab.transferAnswer, fcDe((100 * fcRefAttribution(["D", "Q", "L", "G"]).Q / fcRefRejected).toFixed(4))],
];
// Every remaining numeral the card quotes, each tied back to the value it names. A number
// in prose does not move when the code does, so none of them may sit here unguarded.
const fcA4Attr = fcRefAttribution(["L", "G", "Q", "D"]);
const fcWorstAttr = fcRefAttribution(["D", "Q", "L", "G"]);
fcCardProse.push(
  // the classifier's floor and ceiling, and the shares they correspond to
  [fcLab.observe, fcDeInt(fcSpread.Q.low)],
  [fcLab.observe, fcDeInt(fcSpread.Q.high)],
  [fcLab.observe, fcDe((100 * fcSpread.Q.low / fcRefRejected).toFixed(4))],
  [fcLab.observe, fcDe((100 * fcSpread.Q.high / fcRefRejected).toFixed(4))],
  [fcLab.observe, fcDe((fcHigh.cost / fcLow.cost).toFixed(6))],
  // the two attributions the card contrasts by name
  // These numbers occur more than once in the same paragraph, so each needle carries the
  // words around it -- a bare numeral would still be found after one site was changed.
  [fcLab.observe, `Reihenfolge ${fcDeInt(fcA4Attr.Q)} Dokumente`],
  [fcLab.observe, `dagegen ${fcDeInt(fcWorstAttr.Q)}`],
  [fcLab.transferAnswer, `Handout-Reihenfolge ${fcDeInt(fcA4Attr.Q)} Dokumente`],
  [fcLab.transferAnswer, `laufen lässt, ${fcDeInt(fcWorstAttr.Q)} (`],
  [fcLab.transferAnswer, `von ${fcDeInt(fcSpread.Q.low)} bis ${fcDeInt(fcSpread.Q.high)}`],
  [fcLab.transferAnswer, `${fcDeInt(fcRefKept)} behaltene und ${fcDeInt(fcRefRejected)} verworfene`],
  // the two isolated counts the answer says are the ones worth reporting
  [fcLab.transferAnswer, `hier ${fcDeInt(fcRefIsolated.L)} für Language`],
  [fcLab.transferAnswer, `und ${fcDeInt(fcRefIsolated.Q)} für den Classifier`],
  // the two shares the question puts in the student's mouth
  [fcLab.transferQuestion, fcDe((100 * fcA4Attr.L / fcRefRejected).toFixed(4))],
  [fcLab.transferQuestion, fcDe((100 * fcWorstAttr.Q / fcRefRejected).toFixed(4))],
  [fcLab.transferQuestion, `${fcDe(String(100 * fcA4Attr.Q / fcRefRejected))} %`],
  [fcLab.transferAnswer, `${fcDe(String(100 * fcA4Attr.Q / fcRefRejected))} %`],
  // the success panel repeats the three numbers the quick check turns on
  [fcApi.pipelineYieldSuccessMarkup(), fcDe(fcIsoShare.toFixed(4))],
  [fcApi.pipelineYieldSuccessMarkup(), fcDe((100 * fcSpread.Q.low / fcRefRejected).toFixed(4))],
  [fcApi.pipelineYieldSuccessMarkup(), fcDe((100 * fcSpread.Q.high / fcRefRejected).toFixed(4))],
  [fcApi.pipelineYieldSuccessMarkup(), fcDe(fcFullRatio.toFixed(6))],
  [fcApi.pipelineYieldSuccessMarkup(), fcDe((fcSampleCost / fcRuleCascade).toFixed(6))],
);
for (const [text, needle] of fcCardProse) {
  if (!text.includes(needle))
    throw new Error(`pipeline-yield: the card prose must quote the computed number -- missing ${JSON.stringify(needle)}`);
  fcValues++;
}
// The two honesty paragraphs must keep saying what is set rather than measured.
if (!fcAttrHtml.includes("gesetzt, nicht gemessen"))
  throw new Error("pipeline-yield: mode A must keep saying that the 16 counts are set and not measured");
if (!fcCostHtml.includes("gesetzt, nicht gemessen"))
  throw new Error("pipeline-yield: mode B must keep saying that the prices are set and not measured");
if (!fcCostHtml.includes("nicht wie lange dein Skript braucht"))
  throw new Error("pipeline-yield: mode B must keep disclaiming that it predicts a real script's runtime");
fcValues += 3;

// --- registration -----------------------------------------------------------------
if (fcLab.module !== "data")
  throw new Error("pipeline-yield: the lab belongs to the data module, which cites A4, L13 and L14");
const fcModules = readConstant("MODULES");
if (!fcModules.find(entry => entry.id === "data")?.labs.includes("pipeline-yield"))
  throw new Error("pipeline-yield: the lab must be listed in the data module");
const fcGuides = readConstant("LECTURE_GUIDES");
const fcLectures = Object.keys(fcGuides).filter(id => (fcGuides[id].labs || []).includes("pipeline-yield"));
// L13 is the lecture that walks the published Common Crawl pipelines and quotes their
// yields; it is the only lecture whose material this lab computes.
if (fcLectures.length !== 1 || fcLectures[0] !== "l13")
  throw new Error(`pipeline-yield: the lab belongs to exactly l13, not ${JSON.stringify(fcLectures)}`);
const fcAssignments = readConstant("ASSIGNMENTS");
const fcMission = fcAssignments.find(entry => entry.id === "a4").missions.find(mission => mission.id === "pipeline-audit");
if (!fcMission || !fcMission.labs.includes("pipeline-yield"))
  throw new Error("pipeline-yield: a4:pipeline-audit owns both problems and must carry this lab");
// This mission had no lab of its own before v77; the new lab takes the lead.
if (fcMission.labs[0] !== "pipeline-yield")
  throw new Error("pipeline-yield: the lab that computes the mission's two deliverables must lead it");
for (const problem of ["filter_data", "inspect_filtered_data"]) {
  if (!fcMission.scope.includes(problem))
    throw new Error(`pipeline-yield: the mission scope must still name ${problem}`);
}
const fcProblems = readConstant("HANDOUT_PROBLEMS");
for (const id of ["a4:filter_data", "a4:inspect_filtered_data"]) {
  if (!fcProblems[id]) throw new Error(`pipeline-yield: the handout problem ${id} must still exist`);
}
if (!sliceDeclaration(source, "OBJECTIVE_LAB_IDS").includes('"pipeline-yield"'))
  throw new Error("pipeline-yield: the lab must be registered in OBJECTIVE_LAB_IDS");
const fcAccepted = sliceDeclaration(source, "checkPipelineYield");
for (const answer of ["orderOnly", "multipleReasons", "sampleCheap"]) {
  if (!fcAccepted.includes(`"${answer}"`))
    throw new Error(`pipeline-yield: the quick check must accept ${answer}`);
  if (!sliceDeclaration(source, "restorePassedLab").includes(answer))
    throw new Error(`pipeline-yield: the restore preset must carry ${answer}`);
}
if (!sliceDeclaration(source, "initLab").includes('if(id==="pipeline-yield")'))
  throw new Error("pipeline-yield: the lab must be wired up in initLab");
const fcControls = source.slice(source.indexOf('if(id==="pipeline-yield") return `'));
const fcControlLine = fcControls.slice(0, fcControls.indexOf("\n"));
for (const problem of ["filter_data", "inspect_filtered_data"]) {
  if (!fcControlLine.includes(problem))
    throw new Error(`pipeline-yield: the control panel must name the handout problem ${problem}`);
}
if (!fcControlLine.includes("2,500 raw WET files"))
  throw new Error("pipeline-yield: the control panel must quote A4's own file count");

console.log(`pipeline-yield OK: ${fcValues} values, A4's breakdown deliverable resolved -- the kept ${fcRefKept} and the discarded ${fcRefRejected} stand still across all 24 orders while the quality classifier's share of the discards runs from ${(100 * fcSpread.Q.low / fcRefRejected).toFixed(4)} % to ${(100 * fcSpread.Q.high / fcRefRejected).toFixed(4)} %, the isolated shares sum to ${fcIsoShare.toFixed(4)} % because ${fcOverlap} documents carry more than one reason, cost swings by ${(fcHigh.cost / fcLow.cost).toFixed(6)} between ${fcLow.order.join("")} and ${fcHigh.order.join("")} for the same corpus, and an order-free split costs ${fcFullRatio.toFixed(6)}x on everything against ${(fcSampleCost / fcRuleCascade).toFixed(6)}x on a 1 % sample`);

// ---- stability-edge ----------------------------------------------------------
// A1 Problem (learning_rate) (b) states the folk wisdom that the best learning rate is
// "at the edge of stability" and asks how the divergence point relates to the best value.
// A1 Problem (batch_size_experiment) asks for batch sizes "all the way from 1 to the GPU
// memory limit" and writes that "The learning rates should be optimized again if necessary".
// L9 defines "Critical batch = min number of examples for target loss / min number of steps
// for target loss", L1 cites McCandlish+ 2018 for it. Before this lab "edge of stability",
// "curvature", "Hessian", "eigenvalue" and "condition number" had 0 hits, and "critical batch
// size" appeared in exactly one learning-goal sentence without ever being computed. These
// guards hold the two exact quantities: the divergence threshold that follows from curvature
// alone, and the hyperbola that ties steps against examples.
const seNames = ["SE_SPECTRA", "SE_PROBES", "SE_SWEEP", "SE_OVERSHOOTS", "SE_GROWTH_TARGET",
  "SE_S_MIN", "SE_E_MIN", "SE_BATCHES", "SE_TUNING", "SE_TUNE_REF", "seEtaDiv", "seEtaOpt",
  "seFactor", "seWorst", "seProbeEta", "seStepsToGrow", "seStepsToShrink", "seBCrit",
  "seSteps", "seExamples", "seLrFraction"];
const seRenderNames = ["seNum", "seInt", "seSci", "sePct", "renderStabilityThreshold",
  "renderStabilityBatch", "stabilityEdgeSuccessMarkup"];
const seStubs = `
  const esc = value => String(value ?? "").replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const localeCode = () => "en-US";
  const localizedUi = value => String(value);
${sliceDeclaration(source, "fixedNum")}
`;
const seAll = [...seNames, ...seRenderNames];
const seApi = runInNewContext(`${seStubs}${seAll.map(name => sliceDeclaration(source, name)).join("\n")}; ({${seAll.join(",")}})`, {});
let seValues = 0;

// --- Mode A, reference typed from the update rule rather than reused -------------
// A gradient step on f(theta) = 1/2 sum lambda_i theta_i^2 is theta_i <- (1 - eta*lambda_i) theta_i.
// It contracts exactly when |1 - eta*lambda_i| < 1, i.e. eta < 2/lambda_i.
for (const spec of seApi.SE_SPECTRA) {
  const { lmax, lmin } = spec, kappa = lmax / lmin;
  const refDiv = 2 / lmax, refOpt = 2 / (lmax + lmin);
  if (Math.abs(seApi.seEtaDiv(lmax) - refDiv) > 1e-15)
    throw new Error(`stability-edge: ${spec.key} divergence threshold is not 2/lambda_max`);
  if (Math.abs(seApi.seEtaOpt(lmax, lmin) - refOpt) > 1e-15)
    throw new Error(`stability-edge: ${spec.key} best learning rate is not 2/(lambda_max+lambda_min)`);
  // eta_opt is the value that balances both directions: |1-eta*lmax| == |1-eta*lmin|.
  if (Math.abs(Math.abs(1 - refOpt * lmax) - Math.abs(1 - refOpt * lmin)) > 1e-15)
    throw new Error(`stability-edge: ${spec.key} eta_opt must equalise both directions`);
  // The claim the whole lab turns on: the ratio is kappa/(kappa+1) and nothing else.
  if (Math.abs(refOpt / refDiv - kappa / (kappa + 1)) > 1e-15)
    throw new Error(`stability-edge: ${spec.key} eta_opt/eta_div must be kappa/(kappa+1)`);
  if (Math.abs(seApi.seWorst(refOpt, lmax, lmin) - (kappa - 1) / (kappa + 1)) > 1e-15)
    throw new Error(`stability-edge: ${spec.key} contraction at eta_opt must be (kappa-1)/(kappa+1)`);
  seValues += 5;
  // The sweep has to change behaviour exactly at the threshold, not near it.
  for (const mult of seApi.SE_SWEEP) {
    const worst = seApi.seWorst(mult * refDiv, lmax, lmin);
    const expected = mult < 1 ? "converges" : mult > 1 ? "diverges" : "neither";
    const actual = worst < 1 ? "converges" : worst > 1 ? "diverges" : "neither";
    if (expected !== actual)
      throw new Error(`stability-edge: ${spec.key} at ${mult}x the threshold should ${expected}, got ${actual}`);
    seValues++;
  }
  // At exactly the threshold the amplitude is preserved -- neither convergence nor blow-up.
  if (seApi.seWorst(refDiv, lmax, lmin) !== 1)
    throw new Error(`stability-edge: ${spec.key} must sit at exactly 1 on the threshold itself`);
  seValues++;
}
// kappa = 1 is the case that refutes the folk wisdom: the optimum is at half the threshold.
const seIso = seApi.SE_SPECTRA.find(s => s.key === "iso");
if (seApi.seEtaOpt(seIso.lmax, seIso.lmin) / seApi.seEtaDiv(seIso.lmax) !== 0.5)
  throw new Error("stability-edge: at kappa = 1 the best learning rate must be half the threshold");
// ... and it reaches the minimum in one step, which is why its contraction is exactly zero.
if (seApi.seWorst(seApi.seEtaOpt(seIso.lmax, seIso.lmin), seIso.lmax, seIso.lmin) !== 0)
  throw new Error("stability-edge: at kappa = 1 the optimal step must land exactly on the minimum");
seValues += 2;

// --- how long a divergent run stays invisible ------------------------------------
const seGrowRef = {};
for (const over of seApi.SE_OVERSHOOTS) {
  const g = Math.abs(1 - 2 * over);
  const ref = Math.ceil(Math.log(seApi.SE_GROWTH_TARGET) / Math.log(g));
  if (seApi.seStepsToGrow(g, seApi.SE_GROWTH_TARGET) !== ref)
    throw new Error(`stability-edge: steps to grow at ${over}x do not follow log(target)/log(growth)`);
  seGrowRef[over] = ref;
  seValues++;
}
if (seGrowRef[1.01] !== 349 || seGrowRef[2] !== 7)
  throw new Error("stability-edge: 1 % over the threshold must need 349 steps and 2x only 7");
// A run below the threshold never grows, so the function has to say so instead of returning a number.
if (seApi.seStepsToGrow(0.99, seApi.SE_GROWTH_TARGET) !== null)
  throw new Error("stability-edge: a contracting factor must not report a growth horizon");
seValues += 3;

// --- Mode B, reference typed from L9's definition --------------------------------
// L9: critical batch = min examples / min steps. McCandlish+ 2018 then gives
// S/S_min = 1 + B_crit/B and E/E_min = 1 + B/B_crit.
const seBCritRef = seApi.SE_E_MIN / seApi.SE_S_MIN;
if (seApi.seBCrit() !== seBCritRef || seBCritRef !== 256)
  throw new Error("stability-edge: the critical batch size must be E_min/S_min = 256");
seValues++;
for (const entry of seApi.SE_BATCHES) {
  const B = entry.B;
  const refSteps = seApi.SE_S_MIN * (1 + seBCritRef / B);
  const refExamples = seApi.SE_E_MIN * (1 + B / seBCritRef);
  if (seApi.seSteps(B) !== refSteps || seApi.seExamples(B) !== refExamples)
    throw new Error(`stability-edge: B = ${B} does not follow McCandlish's two relations`);
  // The two relations have to be consistent with the definition E = B*S, which is not
  // assumed anywhere in the code -- it is the cross-check that they describe one model.
  if (Math.abs(refExamples - B * refSteps) > 1e-9)
    throw new Error(`stability-edge: B = ${B} breaks E = B * S`);
  // Both are integers here, so a rounding slip cannot hide in the table.
  if (!Number.isInteger(refSteps) || !Number.isInteger(refExamples))
    throw new Error(`stability-edge: B = ${B} must give whole steps and whole examples`);
  // The hyperbola, which is the single statement both relations amount to.
  const hyperbola = (refSteps / seApi.SE_S_MIN - 1) * (refExamples / seApi.SE_E_MIN - 1);
  if (Math.abs(hyperbola - 1) > 1e-12)
    throw new Error(`stability-edge: B = ${B} does not sit on (S/S_min - 1)(E/E_min - 1) = 1`);
  if (Math.abs(seApi.seLrFraction(B) - B / (B + seBCritRef)) > 1e-15)
    throw new Error(`stability-edge: B = ${B} optimal learning rate fraction is not B/(B+B_crit)`);
  seValues += 5;
}
// The critical batch size is exactly the point that costs twice both minima.
if (seApi.seSteps(seBCritRef) !== 2 * seApi.SE_S_MIN || seApi.seExamples(seBCritRef) !== 2 * seApi.SE_E_MIN)
  throw new Error("stability-edge: at B = B_crit the run must cost exactly twice both minima");
seValues += 2;
// The exchange rate has to get monotonically worse -- that is L9's "diminishing returns".
let sePrevRate = 0;
for (const B of [64, 128, 256, 512, 1024, 2048]) {
  const sFactor = seApi.seSteps(2 * B) / seApi.seSteps(B);
  const eFactor = seApi.seExamples(2 * B) / seApi.seExamples(B);
  const rate = (eFactor - 1) / (1 - sFactor);
  if (rate <= sePrevRate)
    throw new Error(`stability-edge: the exchange rate must worsen monotonically, but ${B} did not`);
  sePrevRate = rate;
  seValues += 3;
}
// The two doublings the prose quotes by name.
const seLow = { s: seApi.seSteps(128) / seApi.seSteps(64), e: seApi.seExamples(128) / seApi.seExamples(64) };
const seHigh = { s: seApi.seSteps(2048) / seApi.seSteps(1024), e: seApi.seExamples(2048) / seApi.seExamples(1024) };
if (Math.abs(seLow.s - 0.6) > 1e-12 || Math.abs(seLow.e - 1.2) > 1e-12)
  throw new Error("stability-edge: the prose claims 64 -> 128 costs 60 % steps at 120 % examples");
if (Math.abs(seHigh.s - 0.9) > 1e-12 || Math.abs(seHigh.e - 1.8) > 1e-12)
  throw new Error("stability-edge: the prose claims 1024 -> 2048 costs 90 % steps at 180 % examples");
seValues += 4;
// The confound: a learning rate tuned at one batch size and held fixed.
const seRefFraction = seApi.seLrFraction(seApi.SE_TUNE_REF);
const seMismatch = B => seRefFraction / seApi.seLrFraction(B);
if (Math.abs(seMismatch(1) - 257 / 3) > 1e-12)
  throw new Error("stability-edge: at B = 1 the fixed learning rate must sit 257/3 above its own optimum");
if (Math.abs(1 / seMismatch(1024) - 2.4) > 1e-12)
  throw new Error("stability-edge: at B = 1024 the fixed learning rate must sit 2.4 below its own optimum");
if (seMismatch(seApi.SE_TUNE_REF) !== 1)
  throw new Error("stability-edge: the batch size the learning rate was tuned at must be hit exactly");
// Direction matters: below the tuning point too large, above it too small.
for (const entry of seApi.SE_BATCHES) {
  const expected = entry.B < seApi.SE_TUNE_REF ? 1 : entry.B > seApi.SE_TUNE_REF ? -1 : 0;
  const actual = Math.sign(seMismatch(entry.B) - 1);
  if (expected !== actual)
    throw new Error(`stability-edge: the fixed learning rate must be too large below B = ${seApi.SE_TUNE_REF} and too small above it, but B = ${entry.B} broke that`);
  seValues++;
}
seValues += 3;

// --- the numbers the prose quotes have to be the numbers the tables render --------
// Prose numerals are their own failure mode: they do not move when the code does.
const seRatioText = {};
for (const spec of seApi.SE_SPECTRA) {
  seRatioText[spec.key] = seApi.sePct(seApi.seEtaOpt(spec.lmax, spec.lmin) / seApi.seEtaDiv(spec.lmax), 4);
}
if (seRatioText.iso !== "50.0000 %" || seRatioText.mild !== "90.9091 %"
  || seRatioText.ill !== "99.0099 %" || seRatioText.extreme !== "99.9001 %")
  throw new Error("stability-edge: the four ratios the prose quotes must be what sePct renders");
seValues += 4;
const seThresholdHtml = seApi.renderStabilityThreshold("ill", "over");
const seBatchHtml = seApi.renderStabilityBatch("b1", "fixed");
for (const needle of ["99.0099 %", "50.0000 %", "90.9091 %", "99.9001 %", "349"]) {
  if (!seThresholdHtml.includes(needle))
    throw new Error(`stability-edge: mode A must render ${needle}, which its prose quotes`);
  seValues++;
}
for (const needle of ["85.6667", "2.4000", "256", "4,000", "1,024,000", "512,000"]) {
  if (!seBatchHtml.includes(needle))
    throw new Error(`stability-edge: mode B must render ${needle}, which its prose quotes`);
  seValues++;
}
// The honest paragraph has to stay: both modes are models, not measurements.
if (!seThresholdHtml.includes("keine Vorhersage f\u00fcr deinen Lauf"))
  throw new Error("stability-edge: mode A must keep saying that 2/lambda_max is no prediction");
if (!seBatchHtml.includes("sind hier gesetzt, nicht gemessen"))
  throw new Error("stability-edge: mode B must keep saying that B_crit is set and not measured");
seValues += 2;

// --- the sweep has to contain the threshold itself, or the "neither" case is untested ---
if (seApi.SE_SWEEP.filter(m => m === 1).length !== 1)
  throw new Error("stability-edge: the sweep must contain exactly the threshold itself, where the amplitude is preserved");
if (!seApi.SE_SWEEP.some(m => m < 1) || !seApi.SE_SWEEP.some(m => m > 1))
  throw new Error("stability-edge: the sweep must straddle the threshold in both directions");
seValues += 3;

// --- every probe has to be the learning rate its label promises -------------------
for (const spec of seApi.SE_SPECTRA) {
  const refDiv = 2 / spec.lmax, refOpt = 2 / (spec.lmax + spec.lmin);
  const expected = { opt: refOpt, half: 0.5 * refDiv, near: 0.99 * refDiv, over: 1.01 * refDiv };
  for (const probe of seApi.SE_PROBES) {
    if (Math.abs(seApi.seProbeEta(probe.key, spec.lmax, spec.lmin) - expected[probe.key]) > 1e-15)
      throw new Error(`stability-edge: probe ${probe.key} does not deliver the learning rate its label promises`);
    seValues++;
  }
  // "near" has to stay stable and "over" has to diverge -- otherwise the two labels lie.
  if (!(seApi.seWorst(expected.near, spec.lmax, spec.lmin) < 1))
    throw new Error(`stability-edge: the probe just below the threshold must stay stable at ${spec.key}`);
  if (!(seApi.seWorst(expected.over, spec.lmax, spec.lmin) > 1))
    throw new Error(`stability-edge: the probe just above the threshold must diverge at ${spec.key}`);
  seValues += 2;
}

// --- steps to shrink: the loss is quadratic in theta, so a factor r on theta is r^2 on the loss ---
for (const r of [0.5, 0.8, 0.9, 0.980198019801980, 0.998001998001998]) {
  const ref = Math.ceil(Math.log(1 / 1e-3) / (2 * Math.log(1 / r)));
  if (seApi.seStepsToShrink(r, 1e-3) !== ref)
    throw new Error(`stability-edge: steps to shrink at r = ${r} must account for the loss being quadratic in theta`);
  seValues++;
}
// A factor of exactly 1 never shrinks, and 0 lands in a single step.
if (seApi.seStepsToShrink(1, 1e-3) !== null)
  throw new Error("stability-edge: a factor of 1 must never reach the target");
if (seApi.seStepsToShrink(0, 1e-3) !== 1)
  throw new Error("stability-edge: a factor of 0 must land in a single step");
seValues += 2;

// --- prose numerals: they do not move when the code does, so each one gets a guard ---
const seDe = value => String(value).replace(".", ",");
const seProse = [
  [seThresholdHtml, `Bei κ = 1 sind das ${(100 * (seApi.seEtaOpt(1, 1) / seApi.seEtaDiv(1))).toFixed(0)} %`],
  [seThresholdHtml, `Bei κ = 100 sind es ${seDe((100 * (seApi.seEtaOpt(100, 1) / seApi.seEtaDiv(100))).toFixed(4))} %, bei κ = 1000 sind es ${seDe((100 * (seApi.seEtaOpt(1000, 1) / seApi.seEtaDiv(1000))).toFixed(4))} %`],
  [seThresholdHtml, `bis zum Faktor ${seApi.SE_GROWTH_TARGET} sind das ${seGrowRef[1.01]} Schritte`],
  [seThresholdHtml, `nach ${seGrowRef[2]} Schritten offensichtlich`],
  [seThresholdHtml, `mit ${seDe(Math.abs(1 - 2 * 1.01).toFixed(2))} pro Schritt`],
  [seBatchHtml, `fallen die Schritte auf ${(100 * seLow.s).toFixed(0)} % und die Beispiele steigen nur auf ${(100 * seLow.e).toFixed(0)} %`],
  [seBatchHtml, `fallen die Schritte nur noch auf ${(100 * seHigh.s).toFixed(0)} %, die Beispiele steigen aber auf ${(100 * seHigh.e).toFixed(0)} %`],
  [seBatchHtml, `um den Faktor ${seDe(seMismatch(1).toFixed(4))} über seiner eigenen optimalen Lernrate`],
  [seBatchHtml, `B = 1024 um den Faktor ${seDe((1 / seMismatch(1024)).toFixed(1))} darunter`],
];
for (const [html, needle] of seProse) {
  if (!html.includes(needle))
    throw new Error(`stability-edge: the prose must quote the computed number -- missing ${JSON.stringify(needle)}`);
  seValues++;
}
// The two ratios the spectrum notes quote as fractions rather than percentages.
const seMildNote = seApi.SE_SPECTRA.find(s => s.key === "mild").note;
const seIllNote = seApi.SE_SPECTRA.find(s => s.key === "ill").note;
if (!seMildNote.includes("10/11 der Schwelle"))
  throw new Error("stability-edge: the kappa = 10 note must quote 10/11, the value kappa/(kappa+1) takes there");
if (!seIllNote.includes("100/101 der Schwelle"))
  throw new Error("stability-edge: the kappa = 100 note must quote 100/101, the value kappa/(kappa+1) takes there");
seValues += 2;


// --- registration -----------------------------------------------------------------
const seLabs = readConstant("LABS");
const seLab = seLabs.find(entry => entry.id === "stability-edge");
if (!seLab) throw new Error("stability-edge: the lab must exist in LABS");
if (seLab.module !== "training")
  throw new Error("stability-edge: the lab belongs to the training module, which cites A1 and L2");
const seModules = readConstant("MODULES");
if (!seModules.find(entry => entry.id === "training")?.labs.includes("stability-edge"))
  throw new Error("stability-edge: the lab must be listed in the training module");
const seGuides = readConstant("LECTURE_GUIDES");
const seLectures = Object.keys(seGuides).filter(id => (seGuides[id].labs || []).includes("stability-edge"));
// L2 is the lecture that implements SGD as p.data -= lr * grad, which is the update this
// lab decides the stability of. Any other lecture would be a claim the sources do not carry.
if (seLectures.length !== 1 || seLectures[0] !== "l02")
  throw new Error(`stability-edge: the lab belongs to exactly l02, not ${JSON.stringify(seLectures)}`);
const seAssignments = readConstant("ASSIGNMENTS");
const seMission = seAssignments.find(entry => entry.id === "a1").missions.find(mission => mission.id === "generation-experiments");
if (!seMission || !seMission.labs.includes("stability-edge"))
  throw new Error("stability-edge: a1:generation-experiments owns both problems and must carry this lab");
// v73 reserves the lead of this mission for the lab covering all four ablations, v74 put
// position-signal second. This lab answers two different problems and must not take the lead.
if (seMission.labs[0] !== "ablation-controls")
  throw new Error("stability-edge: ablation-controls must keep the lead of a1:generation-experiments");
for (const problem of ["learning_rate", "batch_size_experiment"]) {
  if (!seMission.scope.includes(problem))
    throw new Error(`stability-edge: the mission scope must still name ${problem}`);
}
const seProblems = readConstant("HANDOUT_PROBLEMS");
for (const id of ["a1:learning_rate", "a1:batch_size_experiment"]) {
  if (!seProblems[id]) throw new Error(`stability-edge: the handout problem ${id} must still exist`);
}
if (!sliceDeclaration(source, "OBJECTIVE_LAB_IDS").includes('"stability-edge"'))
  throw new Error("stability-edge: the lab must be registered in OBJECTIVE_LAB_IDS");
const seAccepted = sliceDeclaration(source, "checkStabilityEdge");
for (const answer of ["kappaRatio", "doubleBoth", "perRunOffset"]) {
  if (!seAccepted.includes(`"${answer}"`))
    throw new Error(`stability-edge: the quick check must accept ${answer}`);
  if (!sliceDeclaration(source, "restorePassedLab").includes(answer))
    throw new Error(`stability-edge: the restore preset must carry ${answer}`);
}
if (!sliceDeclaration(source, "initLab").includes('if(id==="stability-edge")'))
  throw new Error("stability-edge: the lab must be wired up in initLab");
const seControls = source.slice(source.indexOf('if(id==="stability-edge") return `'));
const seControlLine = seControls.slice(0, seControls.indexOf("\n"));
for (const problem of ["learning_rate", "batch_size_experiment"]) {
  if (!seControlLine.includes(problem))
    throw new Error(`stability-edge: the control panel must name the handout problem ${problem}`);
}

console.log(`stability-edge OK: ${seValues} values, the folk wisdom from A1 (b) resolved into kappa/(kappa+1) -- ${seRatioText.iso} at kappa = 1 against ${seRatioText.extreme} at kappa = 1000 -- a run 1 % past the threshold staying invisible for ${seGrowRef[1.01]} steps against ${seGrowRef[2]} at twice the threshold, and L9's critical batch size of ${seBCritRef} costing exactly twice both minima while one doubling moves from ${(100 * seLow.s).toFixed(0)} %/${(100 * seLow.e).toFixed(0)} % steps-per-examples at 64 to ${(100 * seHigh.s).toFixed(0)} %/${(100 * seHigh.e).toFixed(0)} % at 1024, and a learning rate tuned once at B = ${seApi.SE_TUNE_REF} sitting ${seMismatch(1).toFixed(4)}x too high at B = 1`);

// ---- decay-horizon -----------------------------------------------------------
// A1 4.4 gives the cosine schedule five parameters and three branches; A1 §5 adds
// "When using N training steps, we suggest adjusting the cosine learning rate decay
// schedule to terminate its decay (i.e., reach the minimum learning rate) at precisely
// step N." Lecture 11 turns the same property into a cost: "This turns the cost of
// fitting a scaling law from n to n^2.. Can we avoid this? (partial) solution in
// miniCPM - WSD learning rate", with "Decay ~ 10%". Before this lab the app named T_c
// 52 times but never varied it: "Lauflaenge" had one hit, "n^2", "from scratch",
// "Neustart", "Stuetzstelle" and "Skalierungskurve" had none. These guards hold the two
// structural claims -- that T_c = N is a constrained optimum, and that cosine costs
// (K+1)/2 while WSD's advantage is capped at exactly 1/d -- against a reference typed
// from those definitions rather than reused from the app.
const dhNames = ["DH_A_MAX", "DH_A_MIN", "DH_T_W", "DH_N", "DH_HORIZONS", "DH_PROBES",
  "DH_DECAY_SHARES", "DH_LADDER_STEP", "DH_LADDERS", "dhLr", "dhBranch", "dhBudget",
  "dhFloorSteps", "dhExecuted", "dhEndsAtFloor", "dhLadderCost"];
const dhRenderNames = ["dhInt", "dhExp", "dhPct", "renderDecayHorizonRun",
  "renderDecayHorizonSweep", "decayHorizonSuccessMarkup"];
const dhStubs = `
  const esc = value => String(value ?? "").replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const localeCode = () => "en-US";
  const localizedUi = value => String(value);
${sliceDeclaration(source, "fixedNum")}
`;
const dhAll = [...dhNames, ...dhRenderNames];
const dhApi = runInNewContext(`${dhStubs}${dhAll.map(name => sliceDeclaration(source, name)).join("\n")}; ({${dhAll.join(",")}})`, {});
let dhValues = 0;

// --- reference, typed from A1 4.4 and not from the app ----------------------------
const DH_REF_MAX = 1e-3, DH_REF_MIN = 1e-4, DH_REF_TW = 200, DH_REF_N = 5000;
function dhRefLr(t, tc) {
  if (t < DH_REF_TW) return (t / DH_REF_TW) * DH_REF_MAX;
  if (t > tc) return DH_REF_MIN;
  return DH_REF_MIN + 0.5 * (1 + Math.cos(Math.PI * (t - DH_REF_TW) / (tc - DH_REF_TW))) * (DH_REF_MAX - DH_REF_MIN);
}
function dhRefBudget(tc) { let sum = 0; for (let t = 0; t <= DH_REF_N; t++) sum += dhRefLr(t, tc); return sum; }

if (dhApi.DH_A_MAX !== DH_REF_MAX || dhApi.DH_A_MIN !== DH_REF_MIN || dhApi.DH_T_W !== DH_REF_TW)
  throw new Error("decay-horizon: the fixed run must use the same alpha_max, alpha_min and T_w as the resume-contract lab");
// A1 §5 computes its own suggested run as "32 x 5000 x 256"; N is quoted, not invented.
if (dhApi.DH_N !== 5000) throw new Error(`decay-horizon: A1's own step count is 5000, found ${dhApi.DH_N}`);
// The schedule the lab draws must be the same one the resume-contract lab validates.
const dhRc = readConstant("RC_SCHEDULE");
if (dhRc.aMax !== dhApi.DH_A_MAX || dhRc.aMin !== dhApi.DH_A_MIN || dhRc.tWarm !== dhApi.DH_T_W || dhRc.tCosine !== dhApi.DH_N)
  throw new Error("decay-horizon: the two schedule labs must describe the same run, otherwise their numbers cannot be compared");

// All three branches of A1 4.4, including the one the optimizer lab used to be missing.
for (const horizon of dhApi.DH_HORIZONS) {
  for (const t of [0, 1, 99, 199, 200, 201, 1000, 2500, 4000, 5000, 6000, 12000]) {
    const got = dhApi.dhLr(t, horizon.tc), want = dhRefLr(t, horizon.tc);
    if (Math.abs(got - want) > 1e-18) throw new Error(`decay-horizon: alpha(${t}) at T_c=${horizon.tc} disagrees with A1 4.4`);
    dhValues++;
  }
  // the branch boundaries have to agree from both sides, or the schedule jumps
  if (Math.abs(dhApi.dhLr(dhApi.DH_T_W, horizon.tc) - dhApi.DH_A_MAX) > 1e-18)
    throw new Error(`decay-horizon: at t = T_w both branches must give alpha_max (T_c=${horizon.tc})`);
  if (Math.abs(dhApi.dhLr(horizon.tc, horizon.tc) - dhApi.DH_A_MIN) > 1e-18)
    throw new Error(`decay-horizon: at t = T_c the cosine must land exactly on alpha_min (T_c=${horizon.tc})`);
  if (dhApi.dhLr(horizon.tc + 1, horizon.tc) !== dhApi.DH_A_MIN)
    throw new Error(`decay-horizon: past T_c the third branch must hold alpha_min (T_c=${horizon.tc})`);
  if (dhApi.dhBranch(horizon.tc + 1, horizon.tc) !== "post" || dhApi.dhBranch(0, horizon.tc) !== "warmup" || dhApi.dhBranch(horizon.tc, horizon.tc) !== "cosine")
    throw new Error(`decay-horizon: the branch labels must follow A1's three cases (T_c=${horizon.tc})`);
}

// The claim the first callout makes: the warm-up branch does not know T_c, so no horizon
// is distinguishable up to and including t = T_w. This is the whole trap.
for (let t = 0; t <= dhApi.DH_T_W; t++) {
  const values = new Set(dhApi.DH_HORIZONS.map(horizon => dhApi.dhLr(t, horizon.tc)));
  if (values.size !== 1) throw new Error(`decay-horizon: the horizons must be indistinguishable at t = ${t}`);
  dhValues++;
}
// The callout names t = 0 and t = T_w as the two blind points and t = N as the last step,
// so those three have to be columns of the probe table rather than nearby steps.
for (const [key, t] of [["first", 0], ["handover", dhApi.DH_T_W], ["last", dhApi.DH_N]]) {
  const probe = dhApi.DH_PROBES.find(item => item.key === key);
  if (!probe || probe.t !== t) throw new Error(`decay-horizon: the probe "${key}" must sit exactly at t = ${t}`);
}
if (new Set(dhApi.DH_HORIZONS.map(horizon => dhApi.dhLr(dhApi.DH_T_W + 1, horizon.tc))).size !== dhApi.DH_HORIZONS.length)
  throw new Error("decay-horizon: one step past T_w every horizon must already differ, otherwise the trap has no exit");
const dhSpread = dhApi.dhLr(2500, 10000) / dhApi.dhLr(2500, 2500);
if (dhNumber(dhSpread) !== "8.831251")
  throw new Error(`decay-horizon: at t = 2500 the horizons must spread by 8.831251, found ${dhNumber(dhSpread)}`);
function dhNumber(value, digits) { return Number(value).toFixed(digits === undefined ? 6 : digits); }

// --- the constrained optimum ------------------------------------------------------
// Two facts decide it, and the lab claims both: the budget grows strictly with T_c, and
// exactly the horizons with T_c <= N end on the floor. Brute-forced, not asserted.
const dhGrid = [];
for (let tc = dhApi.DH_T_W + 1; tc <= 3 * dhApi.DH_N; tc += 7) dhGrid.push(tc);
if (!dhGrid.includes(dhApi.DH_N)) dhGrid.push(dhApi.DH_N);
dhGrid.sort((a, b) => a - b);
let dhPrev = -Infinity;
for (const tc of dhGrid) {
  const budget = dhApi.dhBudget(tc);
  if (Math.abs(budget - dhRefBudget(tc)) > 1e-12) throw new Error(`decay-horizon: the budget at T_c=${tc} disagrees with the reference`);
  if (budget <= dhPrev) throw new Error(`decay-horizon: the step-size budget must grow strictly with T_c, it does not at ${tc}`);
  dhPrev = budget;
  if (dhApi.dhEndsAtFloor(tc) !== (tc <= dhApi.DH_N))
    throw new Error(`decay-horizon: a run ends exactly on alpha_min precisely when T_c <= N, which fails at ${tc}`);
  dhValues++;
}
const dhAdmissible = dhGrid.filter(tc => dhApi.dhEndsAtFloor(tc));
const dhBest = dhAdmissible.reduce((best, tc) => (dhApi.dhBudget(tc) > dhApi.dhBudget(best) ? tc : best), dhAdmissible[0]);
if (dhBest !== dhApi.DH_N)
  throw new Error(`decay-horizon: A1's tip must come out as the argmax of the budget under the floor constraint, found ${dhBest}`);
if (dhApi.dhFloorSteps(dhApi.DH_N) !== 0 || dhApi.dhFloorSteps(2500) !== 2500 || dhApi.dhFloorSteps(10000) !== 0)
  throw new Error("decay-horizon: the third-branch step count must be max(0, N - T_c)");

// The five rows of the horizon table, each value against the reference.
const dhExpected = {
  half:   { tc: 2500,  aN: DH_REF_MIN, floor: 2500, executed: 1,          ratio: "0.589424" },
  early:  { tc: 4000,  aN: DH_REF_MIN, floor: 1000, executed: 1,          ratio: "0.835769" },
  tip:    { tc: 5000,  aN: DH_REF_MIN, floor: 0,    executed: 1,          ratio: "1.000000" },
  late:   { tc: 6250,  aN: null,       floor: 0,    executed: 4800/6050,  ratio: "1.191190" },
  double: { tc: 10000, aN: null,       floor: 0,    executed: 4800/9800,  ratio: "1.512128" }
};
const dhTipBudget = dhApi.dhBudget(dhApi.DH_N);
for (const horizon of dhApi.DH_HORIZONS) {
  const want = dhExpected[horizon.key];
  if (!want) throw new Error(`decay-horizon: unexpected horizon ${horizon.key}`);
  if (horizon.tc !== want.tc) throw new Error(`decay-horizon: horizon ${horizon.key} must be T_c = ${want.tc}`);
  if (want.aN !== null && Math.abs(dhApi.dhLr(dhApi.DH_N, horizon.tc) - want.aN) > 1e-18)
    throw new Error(`decay-horizon: horizon ${horizon.key} must end exactly on alpha_min`);
  if (dhApi.dhFloorSteps(horizon.tc) !== want.floor)
    throw new Error(`decay-horizon: horizon ${horizon.key} must spend ${want.floor} steps in the third branch`);
  if (Math.abs(dhApi.dhExecuted(horizon.tc) - want.executed) > 1e-12)
    throw new Error(`decay-horizon: horizon ${horizon.key} must execute ${want.executed} of its planned decay`);
  if (dhNumber(dhApi.dhBudget(horizon.tc) / dhTipBudget) !== want.ratio)
    throw new Error(`decay-horizon: horizon ${horizon.key} must carry budget ratio ${want.ratio}, found ${dhNumber(dhApi.dhBudget(horizon.tc) / dhTipBudget)}`);
  dhValues += 4;
}
// The two numbers the "constrained optimum" paragraph names, and the third it derives.
if (dhNumber(dhApi.dhLr(dhApi.DH_N, 6250) / DH_REF_MIN) !== "1.915144")
  throw new Error("decay-horizon: T_c = 6250 must end at 1.915144 x alpha_min");
if (dhNumber(dhApi.dhLr(dhApi.DH_N, 10000) / DH_REF_MIN) !== "5.644232")
  throw new Error("decay-horizon: T_c = 10000 must end at 5.644232 x alpha_min");
if (dhNumber(100 * (1 - dhApi.dhBudget(4000) / dhTipBudget), 4) !== "16.4231")
  throw new Error("decay-horizon: T_c = 4000 must give away 16.4231 % of the budget");

// --- mode B: the closed form and the ceiling --------------------------------------
if (dhApi.DH_LADDER_STEP !== 2000) throw new Error("decay-horizon: the ladder step is 2000");
// The K column and the three decay shares are named in the prose and in the observe text,
// so neither may drift: K = 100 is the row that shows the advantage still short of 1/d.
if (JSON.stringify(dhApi.DH_LADDERS) !== JSON.stringify([2, 5, 10, 20, 100]))
  throw new Error(`decay-horizon: the ladder is 2, 5, 10, 20, 100, found ${dhApi.DH_LADDERS}`);
if (JSON.stringify(dhApi.DH_DECAY_SHARES.map(share => share.d)) !== JSON.stringify([0.05, 0.1, 0.2]))
  throw new Error("decay-horizon: the three decay shares are 5 %, 10 % (L11's own) and 20 %");
// The three numbers the observe text tells the reader to watch while d moves.
for (const [d, want] of [[0.05, "4.489796"], [0.1, "3.793103"], [0.2, "2.894737"]]) {
  const cost = dhApi.dhLadderCost(10, d);
  if (dhNumber(cost.cosine / cost.wsd) !== want)
    throw new Error(`decay-horizon: at K = 10 and d = ${d} the advantage is ${want}, found ${dhNumber(cost.cosine / cost.wsd)}`);
  dhValues++;
}
// L11 quotes "Decay ~ 10%"; the two neighbours exist so that the 1/d ceiling can move.
if (!dhApi.DH_DECAY_SHARES.some(share => share.d === 0.1))
  throw new Error("decay-horizon: L11's own decay share of 10 % must be one of the settings");
for (const share of dhApi.DH_DECAY_SHARES) {
  let previousRatio = 0;
  for (let K = 1; K <= 400; K++) {
    const cost = dhApi.dhLadderCost(K, share.d);
    const ideal = dhApi.DH_LADDER_STEP * K;
    const cosine = dhApi.DH_LADDER_STEP * K * (K + 1) / 2;
    if (cost.ideal !== ideal || cost.cosine !== cosine)
      throw new Error(`decay-horizon: K = ${K} must cost ${ideal} as one run and ${cosine} as ${K} runs`);
    // the identity the "fourth column" paragraph claims, exactly and independently of d
    if (Math.abs(cost.cosine / cost.ideal - (K + 1) / 2) > 1e-12)
      throw new Error(`decay-horizon: cosine against one run must be exactly (K+1)/2 at K = ${K}`);
    if (Math.abs(cost.wsd - ((1 - share.d) * ideal + share.d * cosine)) > 1e-9)
      throw new Error(`decay-horizon: the WSD cost must be one trunk plus K decays at K = ${K}`);
    // the ceiling: the advantage rises with K and never reaches 1/d
    const ratio = cost.cosine / cost.wsd;
    if (K > 1 && ratio <= previousRatio) throw new Error(`decay-horizon: the WSD advantage must rise with K, it does not at ${K}`);
    if (ratio >= 1 / share.d) throw new Error(`decay-horizon: the WSD advantage must stay under 1/d = ${1 / share.d} at K = ${K}`);
    previousRatio = ratio;
    dhValues += 3;
  }
  // and it does approach the ceiling rather than some smaller number
  if (dhApi.dhLadderCost(200000, share.d).cosine / dhApi.dhLadderCost(200000, share.d).wsd < 0.999 / share.d)
    throw new Error(`decay-horizon: the WSD advantage must approach 1/d for large K (d = ${share.d})`);
}
// (K+1)/2 must not move when d moves -- without this the "does not depend on d" claim is prose.
for (const K of dhApi.DH_LADDERS) {
  const ratios = new Set(dhApi.DH_DECAY_SHARES.map(share => dhNumber(dhApi.dhLadderCost(K, share.d).cosine / dhApi.dhLadderCost(K, share.d).ideal)));
  if (ratios.size !== 1) throw new Error(`decay-horizon: cosine against one run must not depend on d (K = ${K})`);
  dhValues++;
}
const dhTen = dhApi.dhLadderCost(10, 0.1);
if (dhNumber(dhTen.cosine / dhTen.ideal) !== "5.500000" || dhNumber(dhTen.wsd / dhTen.ideal) !== "1.450000" || dhNumber(dhTen.cosine / dhTen.wsd) !== "3.793103")
  throw new Error("decay-horizon: at K = 10 and d = 10 % the three ratios are 5.500000, 1.450000 and 3.793103");
if (dhTen.cosine !== 110000 || dhTen.ideal !== 20000 || dhTen.wsd !== 29000)
  throw new Error("decay-horizon: at K = 10 the three routes cost 20000, 110000 and 29000 steps");

// --- what the two modes actually print --------------------------------------------
// Read back from the rendered markup rather than recomputing, so that a change in the
// renderer alone cannot pass unnoticed.
function dhCell(html, attribute, key) {
  const match = html.match(new RegExp(`data-${attribute}="${key}"[^>]*>([^<]*)<`));
  if (!match) throw new Error(`decay-horizon: the render carries no ${attribute}="${key}" cell`);
  return match[1].trim();
}
function dhRows(html, heading) {
  const table = html.slice(html.indexOf(heading));
  // Split on "<tr" and not "<tr>": a row carrying class="is-active" is still a row.
  return table.slice(0, table.indexOf("</table>")).split("<tr").slice(1);
}
for (const horizon of dhApi.DH_HORIZONS) {
  for (const probe of dhApi.DH_PROBES) {
    const html = dhApi.renderDecayHorizonRun(horizon.key, probe.key);
    if (/undefined|NaN/.test(html)) throw new Error(`decay-horizon: run:${horizon.key}:${probe.key} renders undefined or NaN`);
    // the probe table: every horizon at every step, straight off the reference
    for (const row of dhApi.DH_HORIZONS) for (const column of dhApi.DH_PROBES) {
      const printed = dhCell(html, "dhprobe", `${row.key}-${column.key}`);
      if (printed !== Number(dhRefLr(column.t, row.tc)).toExponential(6))
        throw new Error(`decay-horizon: printed alpha for ${row.key} at ${column.key} is ${printed}`);
      dhValues++;
    }
    // the horizon table
    for (const row of dhApi.DH_HORIZONS) {
      const want = dhExpected[row.key];
      if (dhCell(html, "dhfloor", row.key) !== Number(want.floor).toLocaleString("en-US"))
        throw new Error(`decay-horizon: printed third-branch steps for ${row.key} disagree`);
      if (dhCell(html, "dhbudgetratio", row.key) !== want.ratio)
        throw new Error(`decay-horizon: printed budget ratio for ${row.key} disagrees`);
      if (dhCell(html, "dhendratio", row.key) !== `${dhNumber(dhRefLr(dhApi.DH_N, row.tc) / DH_REF_MIN)} ×`)
        throw new Error(`decay-horizon: printed end ratio for ${row.key} disagrees`);
      if (dhCell(html, "dhexec", row.key) !== `${dhNumber(100 * Math.min(1, (dhApi.DH_N - DH_REF_TW) / (row.tc - DH_REF_TW)))} %`)
        throw new Error(`decay-horizon: printed executed share for ${row.key} disagrees`);
      dhValues += 4;
    }
    // the selected row must be the one the controls picked, in both tables
    const probeRows = dhRows(html, "Dieselben fünf Läufe").filter(row => row.startsWith(" class=\"is-active\""));
    if (probeRows.length !== 1 || !probeRows[0].includes(`data-dhprobe="${horizon.key}-`))
      throw new Error(`decay-horizon: the probe table must mark exactly the chosen horizon (${horizon.key})`);
    // the ledger follows the probe, not only the horizon
    if (dhCell(html, "dhpicklr", "1") !== Number(dhRefLr(probe.t, horizon.tc)).toExponential(6))
      throw new Error(`decay-horizon: the ledger learning rate must follow the chosen step (${horizon.key}/${probe.key})`);
    if (dhCell(html, "dhpickfloor", "1").split(" ")[0] !== Number(dhExpected[horizon.key].floor).toLocaleString("en-US"))
      throw new Error(`decay-horizon: the ledger third-branch count must follow the chosen horizon (${horizon.key})`);
    const branchWord = { warmup: "Warmup", cosine: "Cosine", post: "Post-Annealing" }[dhApi.dhBranch(probe.t, horizon.tc)];
    if (!dhCell(html, "dhpickbranch", "1").startsWith(branchWord))
      throw new Error(`decay-horizon: the ledger must name the branch A1 4.4 applies at t = ${probe.t}`);
    // the closing callout has to agree with the two conditions rather than with the label
    const endsClean = dhApi.dhEndsAtFloor(horizon.tc) && dhApi.dhFloorSteps(horizon.tc) === 0;
    if (html.includes("callout accent") !== endsClean)
      throw new Error(`decay-horizon: only the horizon that satisfies both conditions may close on the accent callout (${horizon.key})`);
    dhValues += 4;
  }
}
// The prose numbers of mode A. Each needle carries the words around it, because the same
// digits also appear in the tables above and a bare number would let a mutation hide there.
// The prose is German source text, so its decimals are commas; the guard therefore renders
// the lab under the German locale and checks that the table prints the very same string.
const dhDeApi = runInNewContext(`${dhStubs.replace('"en-US"', '"de-DE"')}${dhAll.map(name => sliceDeclaration(source, name)).join("\n")}; ({${dhAll.join(",")}})`, {});
const dhRunHtml = dhDeApi.renderDecayHorizonRun("tip", "last");
for (const [needle, why] of [
  ["schon der Faktor <strong data-dhspread=\"1\">8,831251</strong>", "the spread at t = 2500 must be printed next to its own sentence"],
  ["T_c = 6.250 – bringt zwar 1,191190 mal so viel Budget", "the budget a longer horizon buys must be named in the optimum paragraph"],
  ["endet aber bei 1,915144 α_min statt auf dem Boden", "the price a longer horizon pays must be named in the optimum paragraph"],
  ["verschenkt aber 16,4231 % des Budgets an 1.000 Schritte", "the budget a shorter horizon gives away must be named in the optimum paragraph"],
  ["unter allen Horizonten, die am Ende exakt auf α_min landen, ist T_c = N derjenige mit dem größten Budget", "the optimum paragraph must state the constraint, not only the numbers"]
]) {
  if (!dhRunHtml.includes(needle)) throw new Error(`decay-horizon: ${why}`);
  dhValues++;
}
// The point of the localised formatter: under the German locale the number in the prose and
// the number in the table have to be the same string, or the reader is sent to look for
// "1,191190" in a column that prints "1.191190".
for (const [attribute, key, prose] of [["dhbudgetratio", "late", "1,191190"], ["dhendratio", "late", "1,915144 ×"]]) {
  if (dhCell(dhRunHtml, attribute, key) !== prose)
    throw new Error(`decay-horizon: under the German locale the table must print ${prose}, found ${dhCell(dhRunHtml, attribute, key)}`);
  dhValues++;
}
if (dhCell(dhApi.renderDecayHorizonRun("tip", "last"), "dhbudgetratio", "late") !== "1.191190")
  throw new Error("decay-horizon: under the English locale the same cell must print a decimal point");

// --- what mode B prints ------------------------------------------------------------
for (const share of dhApi.DH_DECAY_SHARES) {
  for (const K of dhApi.DH_LADDERS) {
    const html = dhApi.renderDecayHorizonSweep(share.key, String(K));
    if (/undefined|NaN/.test(html)) throw new Error(`decay-horizon: sweep:${share.key}:${K} renders undefined or NaN`);
    for (const row of dhApi.DH_LADDERS) {
      const cost = dhApi.dhLadderCost(row, share.d);
      if (dhCell(html, "dhideal", row) !== Number(cost.ideal).toLocaleString("en-US")) throw new Error(`decay-horizon: printed one-run cost at K = ${row} disagrees`);
      if (dhCell(html, "dhcosine", row) !== Number(cost.cosine).toLocaleString("en-US")) throw new Error(`decay-horizon: printed cosine cost at K = ${row} disagrees`);
      if (dhCell(html, "dhwsd", row) !== Number(cost.wsd).toLocaleString("en-US")) throw new Error(`decay-horizon: printed WSD cost at K = ${row} disagrees`);
      if (dhCell(html, "dhcosideal", row) !== dhNumber((row + 1) / 2)) throw new Error(`decay-horizon: the printed cosine ratio at K = ${row} must be (K+1)/2`);
      if (dhCell(html, "dhcoswsd", row) !== dhNumber(cost.cosine / cost.wsd)) throw new Error(`decay-horizon: the printed WSD advantage at K = ${row} disagrees`);
      // the printed advantage must obey the ceiling the paragraph claims
      if (Number(dhCell(html, "dhcoswsd", row)) >= 1 / share.d) throw new Error(`decay-horizon: the printed advantage at K = ${row} breaks the 1/d ceiling`);
      dhValues += 6;
    }
    if (dhCell(html, "dhlimit", "1") !== dhNumber(1 / share.d)) throw new Error(`decay-horizon: the printed ceiling must be 1/d for ${share.key}`);
    if (dhCell(html, "dhpickratio", "1") !== `${dhNumber(dhApi.dhLadderCost(K, share.d).cosine / dhApi.dhLadderCost(K, share.d).wsd)} × · Grenze 1/d = ${dhNumber(1 / share.d)}`)
      throw new Error(`decay-horizon: the ledger advantage must follow both controls (${share.key}/${K})`);
    const active = dhRows(html, "Was K Stützstellen kosten").filter(row => row.startsWith(" class=\"is-active\""));
    if (active.length !== 1 || !active[0].includes(`data-dhideal="${K}"`))
      throw new Error(`decay-horizon: the ladder table must mark exactly the chosen K (${K})`);
    // the bridge back to mode A quotes the same row mode A computes
    if (dhCell(html, "dhbridgeratio", "1") !== dhNumber(dhRefLr(dhApi.DH_N, 10000) / DH_REF_MIN))
      throw new Error("decay-horizon: the bridge must quote the T_c = 2N row of mode A");
    dhValues += 3;
  }
}
const dhSweepHtml = dhDeApi.renderDecayHorizonSweep("d10", "10");
for (const [needle, why] of [
  ["Der Quotient ist deshalb exakt (K+1)/2 – bei K = 10 also 5,500000", "the closed form must be printed with its value at K = 10"],
  ["bei K = 20 schon 10,500000, bei K = 100 genau 50,500000", "the closed form must be printed at K = 20 and K = 100 as well"],
  ["die vierte Spalte bewegt sich nicht um eine Stelle", "the d-independence claim must stand in the prose"],
  ["sie nähert sich für große K genau 1/d an und erreicht diesen Wert nie", "the ceiling claim must stand in the prose"],
  ["WSD kauft einen Faktor, keine Ordnung", "the lab must say what L11's sentence does not promise"],
  ["trotzdem der Unterschied zwischen einer machbaren und einer nicht machbaren Erhebung", "and must still say that the capped factor is worth having at the K a real sweep uses"]
]) {
  if (!dhSweepHtml.includes(needle)) throw new Error(`decay-horizon: ${why}`);
  dhValues++;
}
// Same agreement test as in mode A: the number the prose names and the number the column
// prints must be the same string under the German locale.
if (dhCell(dhSweepHtml, "dhcosideal", 10) !== "5,500000")
  throw new Error(`decay-horizon: the German column must print 5,500000, found ${dhCell(dhSweepHtml, "dhcosideal", 10)}`);
// The success note repeats numbers; every one of them has to be a number the lab computes.
const dhSuccess = dhDeApi.decayHorizonSuccessMarkup();
for (const value of ["1,191190", "1,915144", "16,4231", "5,500000", "1,450000"]) {
  if (!dhSuccess.includes(value)) throw new Error(`decay-horizon: the success note names ${value}, which must come from the tables`);
  dhValues++;
}

// --- the optimizer lab draws the same three branches --------------------------------
// Until this version its schedule() had two branches and pinned T_c to the width of the
// chart, so the third branch of A1 4.4 could not be drawn at all while the app's own
// resume-contract quiz asked about it.
const optSchedule = runInNewContext(`${numberPrelude}${sliceDeclaration(source, "schedule")}; schedule`, {});
if (optSchedule.length !== 5) throw new Error("optimizer: A1 4.4's schedule takes t, T_w, alpha_max, T_c and alpha_min");
for (const [tc, min] of [[100, 1e-4], [60, 2e-4], [40, 1e-3]]) {
  for (const t of [0, 5, 9, 10, 11, 30, tc - 1, tc, tc + 1, 100]) {
    const got = optSchedule(t, 10, 1e-2, tc, min);
    const want = t < 10 ? (t / 10) * 1e-2 : (t > tc ? min : min + 0.5 * (1e-2 - min) * (1 + Math.cos(Math.PI * (t - 10) / (tc - 10))));
    if (Math.abs(got - want) > 1e-15) throw new Error(`optimizer: schedule(${t}) at T_c=${tc} does not follow A1 4.4`);
    dhValues++;
  }
  if (optSchedule(tc + 1, 10, 1e-2, tc, min) !== min) throw new Error(`optimizer: past T_c the schedule must hold alpha_min (T_c=${tc})`);
  if (Math.abs(optSchedule(tc, 10, 1e-2, tc, min) - min) > 1e-18) throw new Error(`optimizer: at T_c the cosine must land on alpha_min (T_c=${tc})`);
}
if (!source.includes('<input id="optCosine" type="range"')) throw new Error("optimizer: T_c must be a control and not a constant");
// alpha_min is a tenth of alpha_max, so at the small end of the slider a four-decimal
// rendering would print it as 0.0000 -- the number the printed formula depends on.
// The panel tells the reader alpha_min is a tenth of alpha_max; the code must agree.
if (!source.includes("lrMin=.1*max")) throw new Error("optimizer: alpha_min is a tenth of alpha_max, as the panel says");
if (!source.includes("η_min ist auf 0,1·η_max gesetzt")) throw new Error("optimizer: the panel must say which value alpha_min is fixed to");
if (source.includes("${fixedNum(lrMin,4)}"))
  throw new Error("optimizer: alpha_min must not be printed with four decimals, it rounds to zero on the small half of the slider");
if ((source.match(/\$\{lrMin\.toExponential\(2\)\}/g) || []).length !== 2)
  throw new Error("optimizer: both branches of the printed formula must spell alpha_min out");
// Repairing schedule() is not enough: both call sites have to hand it the chosen horizon,
// otherwise the lab keeps drawing the pinned curve while the function is correct.
const optUpdate = sliceDeclaration(source, "updateOptimizer");
const optCalls = optUpdate.match(/schedule\([^)]*\)/g) || [];
if (optCalls.length !== 2) throw new Error(`optimizer: the lab calls schedule() twice, for the dot and for the curve, found ${optCalls.length}`);
for (const call of optCalls) {
  if (!call.includes("cosineEnd") || !call.includes("lrMin"))
    throw new Error(`optimizer: every schedule() call must pass the chosen T_c and alpha_min, found ${call}`);
}
if (!source.includes('warm=Math.min(+document.getElementById("optWarmup").value,cosineEnd-1)'))
  throw new Error("optimizer: the warm-up must be clamped against T_c and not against the width of the chart");

console.log(`decay-horizon OK: ${dhValues} values, A1 §5's tip resolved into a constrained optimum -- all five horizons identical up to t = T_w and spread by 8.831251 at t = 2500, T_c = N the argmax of the step-size budget among the horizons that end on alpha_min (6250 buys 1.191190x and ends at 1.915144 alpha_min, 4000 gives away 16.4231 %), and L11's "n to n^2" as (K+1)/2 = 5.500000 at K = 10 against a WSD advantage of 3.793103 that is capped at exactly 1/d`);


// ---- run-budget-ledger ---------------------------------------------------------------
// A3 is the one assignment whose handout contract the app never stated. Before this lab
// "max_runtime_seconds", "total_train_tokens", "hidden_size", "n_evals", "43200",
// "12 B200" and "12 n_layer" had zero hits in index.html, while the A3 mission
// "Budgetledger & Run-Design" asks the reader to build exactly that table and points at
// two labs that model something else. A1, A2 and A5 all carry a handout-exact contract;
// A3 carried none.
//
// The reference below is typed from A3 §3.1-§3.3, not read back out of the app:
//   §3.1 "Queued and running experiments reserve their full max_runtime_seconds against
//        your 12-hour scaling-law budget. When an experiment completes or fails, the API
//        recomputes your budget using the actual reported runtime for that experiment,
//        clipped to be at least 1 second and at most max_runtime_seconds. ... If a run
//        times out, it is charged as max_runtime_seconds."
//   §3.2 "The API fixes seq_len to 512"; "hidden_size must equal num_attention_heads *
//        head_dim, num_attention_heads must be divisible by num_key_value_heads, and
//        total_train_tokens must be divisible by 512 * train_batch_size"; the reservation
//        "must be between 1 second and 12 hours"; total_budget_seconds 43200.
//   §3.3 "To estimate the number of non-embedding parameters for a given model
//        hyperparameter configuration, use 12 n_layer d_model^2."
const rbNames = ["RB_BUDGET_SECONDS", "RB_TARGET_HOURS", "RB_SEQ_LEN", "RB_BATCH", "RB_VOCAB",
  "RB_TOKENS_PER_STEP", "RB_MAX_RESERVE", "RB_ARCHS", "RB_TOKEN_CHOICES", "RB_COUNTS",
  "RB_RESERVES", "RB_CAMPAIGN", "RB_SPREADS", "rbArch", "rbTokenChoice", "rbReserve",
  "rbSpread", "rbHandoutParams", "rbBlockParams", "rbTotalParams", "rbParams", "rbFlops",
  "rbConstraints", "rbCharge", "rbInFlight", "rbCampaign"];
const rbApi = runInNewContext(`${numberPrelude}${rbNames.map(name => sliceDeclaration(source, name)).join("\n")}; ({${rbNames.join(",")}})`, {});
let rbValues = 0;
function fixedNumber(value, digits) {
  return Number(value).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false });
}

// --- the constants, straight from the handout -----------------------------------------
if (rbApi.RB_BUDGET_SECONDS !== 12 * 3600)
  throw new Error(`run-budget-ledger: A3's scaling-law budget is 12 B200-hours = 43200 s, found ${rbApi.RB_BUDGET_SECONDS}`);
if (rbApi.RB_TARGET_HOURS !== 48)
  throw new Error("run-budget-ledger: the run being predicted is 48 B200-hours, and 12 is a quarter of it");
if (rbApi.RB_BUDGET_SECONDS / 3600 / rbApi.RB_TARGET_HOURS !== 0.25)
  throw new Error("run-budget-ledger: A3 calls the fitting budget 25 % of the big run, the two numbers must keep that ratio");
if (rbApi.RB_SEQ_LEN !== 512) throw new Error("run-budget-ledger: the API fixes seq_len to 512");
if (rbApi.RB_MAX_RESERVE !== 12 * 3600)
  throw new Error("run-budget-ledger: max_runtime_seconds tops out at 12 hours");
if (rbApi.RB_TOKENS_PER_STEP !== rbApi.RB_SEQ_LEN * rbApi.RB_BATCH)
  throw new Error("run-budget-ledger: one optimizer step consumes 512 * train_batch_size tokens");

// --- A3 §3.2's own example request has to pass its own rules --------------------------
const rbExample = rbApi.RB_ARCHS.find(entry => entry.key === "example");
const rbHandoutExample = { d: 448, heads: 7, headDim: 64, kv: 7, layers: 9, ffn: 1280 };
for (const [field, want] of Object.entries(rbHandoutExample)) {
  if (rbExample[field] !== want)
    throw new Error(`run-budget-ledger: the example config is printed in A3 §3.2 with ${field} = ${want}, found ${rbExample[field]}`);
}
if (rbApi.RB_VOCAB !== 32000) throw new Error("run-budget-ledger: the API models use a 32K vocabulary");
const rbExampleTokens = rbApi.RB_TOKEN_CHOICES.find(entry => entry.key === "t1");
if (rbExampleTokens.tokens !== 1048576)
  throw new Error("run-budget-ledger: the example request trains on 1_048_576 tokens");
for (const check of rbApi.rbConstraints(rbExample, rbExampleTokens.tokens, 30)) {
  if (!check.ok) throw new Error(`run-budget-ledger: A3's own example request fails the rule ${check.key}, so the rule is wrong`);
  rbValues++;
}

// --- each broken config has to break exactly one rule, or it teaches two things at once
const rbBreaks = { mismatch: "hidden", kv: "kv" };
for (const arch of rbApi.RB_ARCHS) {
  const failed = rbApi.rbConstraints(arch, rbExampleTokens.tokens, 900).filter(check => !check.ok).map(check => check.key);
  const want = rbBreaks[arch.key] ? [rbBreaks[arch.key]] : [];
  if (JSON.stringify(failed) !== JSON.stringify(want))
    throw new Error(`run-budget-ledger: ${arch.key} must break exactly ${want.join(",") || "no rule"}, it breaks ${failed.join(",") || "none"}`);
  rbValues++;
}
// the round token count is rejected by the divisibility rule and by nothing else
const rbRound = rbApi.RB_TOKEN_CHOICES.find(entry => entry.key === "round");
if (rbRound.tokens % rbApi.RB_TOKENS_PER_STEP === 0)
  throw new Error("run-budget-ledger: the round token count exists to be indivisible by 512 * train_batch_size");
if (rbRound.tokens % rbApi.RB_TOKENS_PER_STEP !== 57600)
  throw new Error(`run-budget-ledger: 100000000 mod 65536 is 57600, found ${rbRound.tokens % rbApi.RB_TOKENS_PER_STEP}`);
for (const choice of rbApi.RB_TOKEN_CHOICES) {
  const failed = rbApi.rbConstraints(rbExample, choice.tokens, 900).filter(check => !check.ok).map(check => check.key);
  const want = choice.key === "round" ? ["tokens"] : [];
  if (JSON.stringify(failed) !== JSON.stringify(want))
    throw new Error(`run-budget-ledger: token choice ${choice.key} must break exactly ${want.join(",") || "no rule"}`);
  rbValues++;
}
// the reservation bound is a rule too, and it has to bite on both sides
if (rbApi.rbConstraints(rbExample, rbExampleTokens.tokens, 0).find(check => check.key === "runtime").ok)
  throw new Error("run-budget-ledger: a reservation under 1 second must be rejected");
if (rbApi.rbConstraints(rbExample, rbExampleTokens.tokens, rbApi.RB_MAX_RESERVE + 1).find(check => check.key === "runtime").ok)
  throw new Error("run-budget-ledger: a reservation over 12 hours must be rejected");

// --- 12 n_layer d_model^2 is a derivation, not a convention ---------------------------
// At d_ff = 8/3 d_model the four attention matrices (4d^2) plus the SwiGLU network
// (3 d d_ff = 8d^2) come to exactly 12d^2 per block. The formula additionally drops the
// 2d RMSNorm gains per block -- so it is the matrix share, not the block count.
for (const arch of rbApi.RB_ARCHS) {
  if (rbApi.rbHandoutParams(arch) !== 12 * arch.layers * arch.d ** 2)
    throw new Error(`run-budget-ledger: ${arch.key} must use A3 §3.3's own formula`);
  const balanced = { ...arch, ffn: (8 * arch.d) / 3 };
  const matrices = balanced.layers * (4 * balanced.d ** 2 + 3 * balanced.d * balanced.ffn);
  if (Math.abs(rbApi.rbHandoutParams(arch) - matrices) > 1e-6)
    throw new Error(`run-budget-ledger: at d_ff = 8/3 d_model the handout formula must be the exact matrix count for ${arch.key}`);
  // and the exact block count is that plus the norm gains the formula leaves out
  if (rbApi.rbBlockParams(balanced) !== matrices + 2 * balanced.layers * balanced.d)
    throw new Error(`run-budget-ledger: the exact block count must exceed the matrix count by the 2 L d norm gains (${arch.key})`);
  if (rbApi.rbTotalParams(arch) !== rbApi.rbBlockParams(arch) + 2 * rbApi.RB_VOCAB * arch.d + arch.d)
    throw new Error(`run-budget-ledger: the total must add both embedding matrices and the final norm (${arch.key})`);
  rbValues += 3;
}
// the four ratios the prose names, each read off the same functions the screen uses
const rbRatios = { example: ["1.047991", "2.370763"], wide: ["1.000244", "1.325770"] };
for (const [key, [exact, total]] of Object.entries(rbRatios)) {
  const arch = rbApi.RB_ARCHS.find(entry => entry.key === key), handout = rbApi.rbHandoutParams(arch);
  if (fixedNumber(rbApi.rbBlockParams(arch) / handout, 6) !== exact)
    throw new Error(`run-budget-ledger: ${key} must sit at ${exact} against A3's estimate, found ${fixedNumber(rbApi.rbBlockParams(arch) / handout, 6)}`);
  if (fixedNumber(rbApi.rbTotalParams(arch) / handout, 6) !== total)
    throw new Error(`run-budget-ledger: counting embeddings on ${key} must change N by ${total}, found ${fixedNumber(rbApi.rbTotalParams(arch) / handout, 6)}`);
  rbValues += 2;
}
// the embedding distortion has to shrink as the model grows -- that is why A3 drops it
const rbByWidth = [...rbApi.RB_ARCHS].filter(arch => arch.key !== "mismatch" && arch.key !== "kv")
  .sort((left, right) => left.d - right.d);
for (let index = 1; index < rbByWidth.length; index++) {
  const before = rbApi.rbTotalParams(rbByWidth[index - 1]) / rbApi.rbHandoutParams(rbByWidth[index - 1]);
  const after = rbApi.rbTotalParams(rbByWidth[index]) / rbApi.rbHandoutParams(rbByWidth[index]);
  if (after >= before)
    throw new Error("run-budget-ledger: the embedding share must fall with model width, otherwise dropping it would not protect the exponent");
  rbValues++;
}
// C = 6ND, and the counting convention moves it by exactly the same factor
if (rbApi.rbFlops(rbApi.rbHandoutParams(rbExample), rbExampleTokens.tokens) !== 6 * 21676032 * 1048576)
  throw new Error("run-budget-ledger: C must be 6ND on A3's own example request");

// --- the charging rule, brute-forced against the reference -----------------------------
const rbRefCharge = (need, reserve) => (need > reserve ? reserve : Math.min(Math.max(need, 1), reserve));
for (let reserve = 1; reserve <= 4000; reserve += 7) {
  for (const need of [0, 1, 2, reserve - 1, reserve, reserve + 1, 2 * reserve, 12 * 3600]) {
    if (need < 0) continue;
    const got = rbApi.rbCharge(need, reserve);
    if (got.charged !== rbRefCharge(need, reserve))
      throw new Error(`run-budget-ledger: charge(${need}, ${reserve}) disagrees with A3 §3.1`);
    if (got.timedOut !== need > reserve)
      throw new Error(`run-budget-ledger: a run times out exactly when it needs more than it reserved (${need}, ${reserve})`);
    // A3's two halves: never more than the reservation, and a timeout costs all of it
    if (got.charged > reserve) throw new Error("run-budget-ledger: a run can never be charged more than it reserved");
    if (got.timedOut && got.charged !== reserve)
      throw new Error("run-budget-ledger: a timeout is charged the full max_runtime_seconds");
    if (!got.timedOut && got.charged !== Math.max(need, 1))
      throw new Error("run-budget-ledger: a completed run is charged its runtime, clipped up to 1 second");
    rbValues++;
  }
}
// the asymmetry the lab is built on: reserving above the need never costs more, and
// reserving below it costs the reservation and returns nothing
for (const need of [2, 60, 900, 3000, 7200]) {
  const generous = rbApi.rbCharge(need, 12 * 3600);
  if (generous.charged !== Math.max(need, 1) || generous.timedOut)
    throw new Error(`run-budget-ledger: a reservation far above the need must still charge only the runtime (need ${need})`);
  const tight = rbApi.rbCharge(need, Math.max(1, need - 1));
  if (!tight.timedOut || tight.charged !== Math.max(1, need - 1))
    throw new Error(`run-budget-ledger: a reservation one second below the need must time out and be charged in full (need ${need})`);
  rbValues += 2;
}

// --- the campaign, and the row where paying less buys nothing --------------------------
if (rbApi.RB_CAMPAIGN !== 12) throw new Error("run-budget-ledger: the campaign is twelve runs");
for (const spread of rbApi.RB_SPREADS) {
  if (spread.needs.length !== rbApi.RB_CAMPAIGN)
    throw new Error(`run-budget-ledger: the spread ${spread.key} must describe all twelve runs`);
}
const rbExpected = {
  "flat|r600": { charged: 7200, completed: 0, reserved: 7200, inFlight: 72 },
  "flat|r900": { charged: 10800, completed: 12, reserved: 10800, inFlight: 48 },
  "flat|r3600": { charged: 10800, completed: 12, reserved: 43200, inFlight: 12 },
  "flat|r10800": { charged: 10800, completed: 12, reserved: 129600, inFlight: 4 },
  "ladder|r900": { charged: 9000, completed: 6, reserved: 10800, inFlight: 48 },
  "tail|r3600": { charged: 14400, completed: 12, reserved: 43200, inFlight: 12 }
};
for (const [key, want] of Object.entries(rbExpected)) {
  const [spread, reserve] = key.split("|");
  const plan = rbApi.rbCampaign(reserve, spread);
  for (const [field, value] of Object.entries(want)) {
    if (plan[field] !== value)
      throw new Error(`run-budget-ledger: ${key} must have ${field} = ${value}, found ${plan[field]}`);
    rbValues++;
  }
}
// The whole point of mode B: at 600 s the uniform campaign is cheaper and worthless, and
// at 3600 s and 10800 s the charge is identical while the concurrency limit is not.
const rbCheap = rbApi.rbCampaign("r600", "flat"), rbRight = rbApi.rbCampaign("r900", "flat");
if (!(rbCheap.charged < rbRight.charged && rbCheap.completed === 0 && rbRight.completed === rbApi.RB_CAMPAIGN))
  throw new Error("run-budget-ledger: the cheaper reservation has to be the one that returns nothing, or the lab has no lesson");
const rbHour = rbApi.rbCampaign("r3600", "flat"), rbThree = rbApi.rbCampaign("r10800", "flat");
if (rbHour.charged !== rbThree.charged)
  throw new Error("run-budget-ledger: reserving three times as long must charge the same, the price is paid in concurrency");
if (!(rbThree.inFlight < rbHour.inFlight && rbThree.reserved > rbApi.RB_BUDGET_SECONDS))
  throw new Error("run-budget-ledger: three-hour reservations must bind more than the whole budget and cut the concurrency limit");
for (const reserve of rbApi.RB_RESERVES) {
  if (rbApi.rbInFlight(reserve.seconds) !== Math.floor(rbApi.RB_BUDGET_SECONDS / reserve.seconds))
    throw new Error(`run-budget-ledger: the concurrency limit is floor(43200 / max_runtime_seconds), wrong at ${reserve.seconds}`);
  rbValues++;
}
// the transferAnswer names two of these limits, and they have to be the ones that hold
if (rbApi.rbInFlight(7200) !== 6 || rbApi.rbInFlight(1800) !== 24)
  throw new Error("run-budget-ledger: the transfer answer quotes 6 concurrent runs at 7200 s and 24 at 1800 s");
// Every reservation the panel offers divides 43200 exactly, so on those five values
// rounding up and rounding down agree and the check above cannot tell them apart. A
// reservation that does not divide the budget is what makes the direction observable:
// a partial reservation is one the budget cannot hold, so the limit rounds down.
for (const reserve of [5000, 7000, 11000, 43199]) {
  const want = Math.floor(rbApi.RB_BUDGET_SECONDS / reserve);
  if (rbApi.rbInFlight(reserve) !== want)
    throw new Error(`run-budget-ledger: ${reserve} s does not divide the budget, so the limit must round down to ${want}, found ${rbApi.rbInFlight(reserve)}`);
  if (rbApi.rbInFlight(reserve) * reserve > rbApi.RB_BUDGET_SECONDS)
    throw new Error(`run-budget-ledger: ${rbApi.rbInFlight(reserve)} reservations of ${reserve} s would exceed the budget, which is the 400 the API returns`);
  rbValues += 2;
}

console.log(`run-budget-ledger OK: ${rbValues} values, A3's handout contract made checkable -- its own §3.2 example request passes all four consistency rules while each broken config breaks exactly one, a timeout is charged its full reservation while a generous one costs nothing (the 600 s campaign is cheaper at 7200 s and returns 0 of 12 completed runs), 3600 s and 10800 s charge the same 10800 s at 12 against 4 concurrent reservations, and 12 n_layer d_model^2 comes out as the exact matrix share at d_ff = 8/3 d_model with the embeddings dropped because their share falls with width (2.370763x at d_model 448 against 1.325770x at 1024)`);

// ---- every string a renderer translates has to have an English entry ----------------
// The i18n guard above holds the declarative content: concepts, formulas, labs, missions.
// It never looked at the strings the renderers hand to tr(), and those are most of the
// text a lab actually prints. A missing entry there is silent -- translateUiValue falls
// back to the German source -- so an English reader got a German paragraph and nothing
// said so. Three of them were the "Noch nicht." hint of a short check in stability-edge,
// pipeline-yield and decay-horizon: the text a reader sees at the moment they are stuck.
const sameInBothLanguages = ["in FP32", "Position", "Gain", "Connected Components",
  "Forward Pass", "Backward Pass", "12 · n_layer · d_model²", "L · (4d² + 3d·d_ff + 2d)"];
// One call picks its literal by the language it is announcing, so each branch is already
// in the language that will read it and neither can have a ui entry. Both branches are
// listed, so removing one of them still fails here.
const languageConditionalStrings = ["Language changed to English.", "Sprache auf Deutsch geändert."];
const renderedStrings = new Set();
// Not every translated string is the whole argument. `tr(over ? "..." : "...")` hands one
// of two literals to the same call, and matching only `tr("...")` walked straight past
// both -- target-config printed two fully German paragraphs of its budget verdict that
// way, and every guard here stayed green. So the argument list is scanned as a whole:
// take everything up to the matching close paren and collect every double-quoted literal
// inside it. A `tr(entry.note)` carries no literal and is still out of reach; the
// headless render of a lab in English is what covers that.
// A call whose argument builds a template literal is out of scope: its `${...}` holes carry
// their own parens and quotes, and following them needs a parser, not a scanner. Those
// calls keep the old exact-literal treatment. Every conditional of plain literals -- the
// shape that hid the untranslated text -- is backtick-free and is read in full.
function translatedArgument(start) {
  let index = start, depth = 1, quote = "", escaped = false, body = "";
  while (index < source.length && depth) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
    } else if (char === "`") return "";
    else if (char === '"' || char === "'") quote = char;
    else if (char === "(") depth++;
    else if (char === ")") { depth--; if (!depth) break; }
    body += char; index++;
  }
  if (depth) throw new Error("renderer i18n: a tr() call never closes");
  return body;
}
for (const opener of source.matchAll(/\b(?:tr|localizedUi)\(/g)) {
  // A literal on the right of a comparison is what the condition tests, not what the call
  // prints -- `tr(mode === "en" ? ... : ...)` must not enter the list. Drop those first.
  const body = translatedArgument(opener.index + opener[0].length)
    .replace(/[=!]==?\s*"(?:[^"\\]|\\.)*"/g, "")
    .replace(/"(?:[^"\\]|\\.)*"\s*[=!]==?/g, "");
  for (const literal of body.matchAll(/"((?:[^"\\]|\\.)*)"/g)) {
    // Only a literal the call could actually hand on counts: the whole argument, or a
    // branch of a conditional. A literal sitting in a nested call -- `tr(x.split(" . ")[0])`
    // -- is that call's argument, not translated text.
    const before = body.slice(0, literal.index).replace(/[\s(]+$/u, "");
    if (before && !before.endsWith("?") && !before.endsWith(":")) continue;
    renderedStrings.add(JSON.parse(`"${literal[1]}"`));
  }
}
for (const value of renderedStrings) {
  if (pack.ui[value] !== undefined || sameInBothLanguages.includes(value) || languageConditionalStrings.includes(value)) continue;
  throw new Error(`renderer i18n: "${value.slice(0, 70)}" reaches the screen through tr() with no English entry -- an English reader would read it in German`);
}
// the exception list stays honest in both directions
for (const value of sameInBothLanguages) {
  if (!renderedStrings.has(value))
    throw new Error(`renderer i18n: "${value}" is listed as identical in both languages, but no renderer prints it any more`);
  if (pack.ui[value] !== undefined)
    throw new Error(`renderer i18n: "${value}" has an English entry now, take it off the identical-in-both-languages list`);
}
for (const value of languageConditionalStrings) {
  if (!renderedStrings.has(value))
    throw new Error(`renderer i18n: "${value}" is listed as a language-conditional branch, but no renderer prints it any more`);
  if (pack.ui[value] !== undefined)
    throw new Error(`renderer i18n: "${value}" has an English entry now, so it is not a language-conditional branch any more`);
}
console.log(`renderer i18n OK: ${renderedStrings.size} strings pass through tr() including both branches of every conditional, every one translated except ${sameInBothLanguages.length} that are the same word in English and ${languageConditionalStrings.length} that pick their own language`);


// ---- target-config -------------------------------------------------------------------
// A3 §3.3 ends on a question the app answered nowhere: "If you were to train a model with
// your predicted optimal number of parameters, what hyperparameters would you use? To
// estimate the number of non-embedding parameters for a given model hyperparameter
// configuration, use 12 n_layer d_model^2." `scaling-fit` fits N_opt against C,
// `run-budget-ledger` validates a finished request -- between them sat the step that
// decides A3's 50-point problem: turning one continuous number into a discrete, sendable
// configuration. Before this lab "aspect ratio", "d_model / n_layer" and any inverse of
// the parameter formula had zero hits in index.html.
//
// Two properties carry the lab and both are exact arithmetic, not modelling:
//   A. N = 12 L d^2 is one equation in two unknowns, so a shape has to be chosen; both
//      unknowns are then discrete (L integer, d a multiple of head_dim), and the grid of
//      reachable N is percent-wide because N grows with d^2.
//   B. C = 6ND has to be recomputed with the N actually submitted. Left at its predicted
//      value, D carries the N deviation one-for-one into wall-clock time -- and A3's
//      budget is wall-clock, so the run is truncated rather than billed.
const tcNames = ["TC_TARGET_SECONDS", "TC_HANDOUT_N", "TC_SEQ_LEN", "TC_BATCH",
  "TC_TOKENS_PER_STEP", "TC_CHINCHILLA_RATIO", "TC_TARGETS", "TC_RHOS", "TC_HEAD_DIMS",
  "tcTarget", "tcRho", "tcHeadDim", "tcContinuousShape", "tcCandidates", "tcHeadDivisors",
  "TC_THROUGHPUTS", "TC_PICK_TARGET", "TC_PICKS", "TC_RULES", "tcThroughput", "tcPick",
  "tcRule", "tcSnapTokens", "tcPlan"];
const tcApi = runInNewContext(`${numberPrelude}${tcNames.map(name => sliceDeclaration(source, name)).join("\n")}; ({${tcNames.join(",")}})`, {});
let tcValues = 0;

// --- the constants, straight from the handout -----------------------------------------
if (tcApi.TC_TARGET_SECONDS !== 48 * 3600)
  throw new Error(`target-config: A3's target run is 48 B200-hours = 172800 s, found ${tcApi.TC_TARGET_SECONDS}`);
if (tcApi.TC_TARGET_SECONDS !== rbApi.RB_TARGET_HOURS * 3600)
  throw new Error("target-config: the target run has to be the same 48 hours run-budget-ledger names");
if (tcApi.TC_SEQ_LEN !== rbApi.RB_SEQ_LEN || tcApi.TC_BATCH !== rbApi.RB_BATCH)
  throw new Error("target-config: seq_len and train_batch_size have to agree with run-budget-ledger, or two labs print different token grids for the same API");
if (tcApi.TC_TOKENS_PER_STEP !== 512 * tcApi.TC_BATCH)
  throw new Error("target-config: one optimizer step consumes 512 * train_batch_size tokens");
// A3 §3.3 prescribes the count; it must be the identical function run-budget-ledger uses.
for (const [layers, width] of [[9, 448], [16, 1024], [17, 2048], [12, 1600]])
  if (tcApi.TC_HANDOUT_N(layers, width) !== rbApi.rbHandoutParams({ layers, d: width }))
    throw new Error(`target-config: 12 n_layer d_model^2 disagrees with run-budget-ledger at L=${layers}, d=${width}`);

// --- A. the inversion and the grid it lands on ----------------------------------------
// The continuous solution has to satisfy the equation it inverts, exactly.
for (const target of tcApi.TC_TARGETS) for (const rho of tcApi.TC_RHOS) {
  const shape = tcApi.tcContinuousShape(target.n, rho.rho);
  const back = 12 * shape.layers * shape.width * shape.width;
  if (Math.abs(back / target.n - 1) > 1e-12)
    throw new Error(`target-config: the inverse of N = 12 L d^2 does not reproduce N at ${target.key}/${rho.key}`);
  if (Math.abs(shape.width / shape.layers - rho.rho) > 1e-9)
    throw new Error(`target-config: the continuous solution does not hold the chosen shape at ${target.key}/${rho.key}`);
  tcValues += 2;
}

let tcNearestMin = Infinity, tcNearestMax = 0, tcWorst = 0, tcMixedNearest = 0, tcCombinations = 0;
let tcPrimeHeads = 0, tcThinned = 0;
for (const target of tcApi.TC_TARGETS) for (const rho of tcApi.TC_RHOS) {
  const reach = {};
  for (const head of tcApi.TC_HEAD_DIMS) {
    const plan = tcApi.tcCandidates(target.n, rho.rho, head.headDim);
    if (plan.rows.length !== 4)
      throw new Error(`target-config: rounding two knobs has to produce four corners, found ${plan.rows.length} at ${target.key}/${rho.key}/${head.key}`);
    for (const row of plan.rows) {
      // Every corner has to be a configuration the API's own rule accepts.
      if (!Number.isInteger(row.layers) || row.layers < 1)
        throw new Error("target-config: n_layer has to be a positive integer");
      if (!Number.isInteger(row.heads) || row.width !== row.heads * head.headDim)
        throw new Error(`target-config: hidden_size must equal num_attention_heads * head_dim, ${row.width} != ${row.heads} * ${head.headDim}`);
      if (row.params !== tcApi.TC_HANDOUT_N(row.layers, row.width))
        throw new Error("target-config: a corner's N has to be A3's own count of that corner");
      // The direction of the two roundings fixes the side N lands on -- and nothing else does.
      if (!row.widthUp && !row.layersUp && row.ratio >= 1)
        throw new Error(`target-config: rounding both knobs down has to land below N_pred, found ${row.ratio} at ${target.key}/${rho.key}/${head.key}`);
      if (row.widthUp && row.layersUp && row.ratio <= 1)
        throw new Error(`target-config: rounding both knobs up has to land above N_pred, found ${row.ratio} at ${target.key}/${rho.key}/${head.key}`);
      tcWorst = Math.max(tcWorst, Math.abs(row.ratio - 1));
      tcValues++;
    }
    const best = plan.rows[0];
    // The nearest corner is the nearest one -- the sort is the lab's whole claim about it.
    for (const row of plan.rows)
      if (Math.abs(row.ratio - 1) < Math.abs(best.ratio - 1) - 1e-15)
        throw new Error(`target-config: the highlighted corner is not the nearest at ${target.key}/${rho.key}/${head.key}`);
    if (best.ratio === 1)
      throw new Error("target-config: a corner hitting N_pred exactly would remove the lab's subject");
    tcNearestMin = Math.min(tcNearestMin, Math.abs(best.ratio - 1));
    tcNearestMax = Math.max(tcNearestMax, Math.abs(best.ratio - 1));
    if ((best.widthUp ? 1 : 0) + (best.layersUp ? 1 : 0) === 1) tcMixedNearest++;
    tcCombinations++;
    // The divisor list is the set of legal num_key_value_heads, no more and no less.
    const divisors = tcApi.tcHeadDivisors(best.heads);
    for (const value of divisors)
      if (best.heads % value !== 0) throw new Error(`target-config: ${value} does not divide ${best.heads}`);
    for (let value = 1; value <= best.heads; value++)
      if (best.heads % value === 0 && !divisors.includes(value))
        throw new Error(`target-config: the divisor list of ${best.heads} is missing ${value}`);
    if (divisors.length === 2) tcPrimeHeads++;
    reach[head.key] = new Set(plan.rows.map(row => row.params));
    tcValues += divisors.length;
  }
  // head_dim does not appear in 12 L d^2, and still decides which N are reachable.
  const wide = reach.h128, narrow = reach.h64;
  if ([...wide].every(value => narrow.has(value)) && [...narrow].every(value => wide.has(value)))
    throw new Error(`target-config: head_dim 64 and 128 reach the identical set of N at ${target.key}/${rho.key}, so the lab's third claim is empty there`);
  if ([...wide].some(value => !narrow.has(value))) tcThinned++;
}
if (tcCombinations !== 18)
  throw new Error(`target-config: the shape grid is 3 targets x 3 shapes x 2 head dims = 18, found ${tcCombinations}`);
// The three numbers the prose names, measured rather than asserted.
if (fixedNumber(tcNearestMin * 100, 2) !== "0.16" || fixedNumber(tcNearestMax * 100, 2) !== "2.93")
  throw new Error(`target-config: the prose says the nearest corner sits between 0.16 % and 2.93 % away, measured ${fixedNumber(tcNearestMin * 100, 4)} % to ${fixedNumber(tcNearestMax * 100, 4)} %`);
if (fixedNumber(tcWorst * 100, 2) !== "24.90")
  throw new Error(`target-config: the prose says the worst corner is 24.90 % off, measured ${fixedNumber(tcWorst * 100, 4)} %`);
if (tcMixedNearest !== 11)
  throw new Error(`target-config: the prose says 11 of 18 nearest corners are mixed, counted ${tcMixedNearest}`);
if (!tcPrimeHeads)
  throw new Error("target-config: no shape lands on a prime head count, so the grouped-query row never shows what it exists to show");

// --- B. what the rounding costs in the 48-hour budget ---------------------------------
// The three offered picks have to be corners of the shape mode, not free-standing numbers.
const tcReachable = tcApi.tcCandidates(tcApi.TC_PICK_TARGET, 128, 64).rows;
for (const pick of tcApi.TC_PICKS) {
  if (!tcReachable.some(row => row.width === pick.width && row.layers === pick.layers))
    throw new Error(`target-config: pick ${pick.key} is not one of the corners mode A computes for N_pred = ${tcApi.TC_PICK_TARGET}`);
  if (pick.width % pick.headDim !== 0)
    throw new Error(`target-config: pick ${pick.key} violates hidden_size = num_attention_heads * head_dim`);
}
// The deviations the pick notes state in words.
const tcDeviation = key => tcApi.TC_HANDOUT_N(tcApi.tcPick(key).layers, tcApi.tcPick(key).width) / tcApi.TC_PICK_TARGET - 1;
for (const [key, want] of [["near", "0.66"], ["low", "-5.26"], ["high", "7.05"]])
  if (fixedNumber(tcDeviation(key) * 100, 2) !== want)
    throw new Error(`target-config: pick ${key} is described as ${want} % from N_pred, measured ${fixedNumber(tcDeviation(key) * 100, 4)} %`);

let tcKeepShare = new Map(), tcTokenLoss = 0, tcWorstN = 0;
for (const throughput of tcApi.TC_THROUGHPUTS) for (const pick of tcApi.TC_PICKS) for (const rule of tcApi.TC_RULES) {
  const plan = tcApi.tcPlan(pick.key, rule.key, throughput.key);
  // Whatever else moves, the submitted token count is always one the API accepts.
  if (plan.tokens % tcApi.TC_TOKENS_PER_STEP !== 0)
    throw new Error(`target-config: total_train_tokens ${plan.tokens} is not divisible by 512 * train_batch_size`);
  if (!Number.isInteger(plan.steps) || plan.steps < 1)
    throw new Error("target-config: the optimizer-step count has to be a positive integer");
  // Rounding down is what keeps the run inside the budget; rounding up would leave it.
  if (plan.tokens > plan.rawTokens || plan.rawTokens - plan.tokens >= tcApi.TC_TOKENS_PER_STEP)
    throw new Error("target-config: the token count has to be the largest valid one at or below D");
  tcTokenLoss = Math.max(tcTokenLoss, (plan.rawTokens - plan.tokens) / plan.rawTokens);

  if (rule.key === "rederive") {
    // The whole point of mode B: a recomputed D lands on the budget whatever N was chosen
    // and whatever the throughput was -- short only by the last partial optimizer step.
    if (plan.share > 1)
      throw new Error(`target-config: a recomputed D must never exceed the budget, found ${plan.share} at ${pick.key}/${throughput.key}`);
    if (1 - plan.share > tcApi.TC_TOKENS_PER_STEP / plan.rawTokens)
      throw new Error(`target-config: a recomputed D has to land on the budget up to the token grid, found ${plan.share} at ${pick.key}/${throughput.key}`);
  } else {
    // And a D left at its predicted value carries the N deviation, exactly.
    const ratio = plan.params / tcApi.TC_PICK_TARGET;
    if (Math.abs(plan.share / ratio - 1) > tcApi.TC_TOKENS_PER_STEP / plan.rawTokens)
      throw new Error(`target-config: a left-over D has to shift the budget by exactly the N ratio, ${plan.share} against ${ratio}`);
    const seen = tcKeepShare.get(pick.key);
    // ...and that is a statement about N alone, so the throughput must not move it.
    if (seen !== undefined && fixedNumber(plan.hours, 3) !== fixedNumber(seen, 3))
      throw new Error(`target-config: the left-over-D overrun must not depend on throughput, ${plan.hours} against ${seen} at ${pick.key}`);
    tcKeepShare.set(pick.key, plan.hours);
    if (ratio > 1 && plan.share <= 1)
      throw new Error(`target-config: an oversized N with a left-over D has to exceed the budget at ${pick.key}`);
    if (ratio < 1 && plan.share >= 1)
      throw new Error(`target-config: an undersized N with a left-over D has to leave budget unused at ${pick.key}`);
    tcWorstN = Math.max(tcWorstN, Math.abs(ratio - 1));
  }
  // D/N is the cross-check the lab offers against Hoffmann's own fit.
  if (!(plan.tokensPerParam > 0) || !Number.isFinite(plan.tokensPerParam))
    throw new Error("target-config: tokens per parameter has to be a finite positive number");
  tcValues += 6;
}
// The asymmetry the lab is built on: the checked rounding is the harmless one.
if (tcTokenLoss >= 4e-6)
  throw new Error(`target-config: the token grid is claimed to cost under four parts per million, measured ${tcTokenLoss}`);
if (tcWorstN / tcTokenLoss < 100)
  throw new Error("target-config: the unchecked N rounding has to cost orders of magnitude more than the checked token rounding, or the lab's central claim is wrong");
if (fixedNumber(tcKeepShare.get("high"), 2) !== "51.39" || fixedNumber(tcKeepShare.get("high") - 48, 2) !== "3.39")
  throw new Error(`target-config: the prose says the upper corner overruns to 51.39 hours, 3.39 over, measured ${fixedNumber(tcKeepShare.get("high"), 4)}`);
if (!(tcKeepShare.get("low") < 48))
  throw new Error("target-config: the lower corner has to leave budget unused rather than overrun it");
// Hoffmann's ratio is a reference the lab quotes, and the middle setting has to reach it.
const tcMiddle = tcApi.tcPlan("near", "rederive", "t5");
if (Math.abs(tcMiddle.tokensPerParam / tcApi.TC_CHINCHILLA_RATIO - 1) > 0.05)
  throw new Error(`target-config: the middle setting is described as landing near Hoffmann's 20 tokens per parameter, measured ${fixedNumber(tcMiddle.tokensPerParam, 4)}`);
// The throughput sweep the prose calls "more than a factor of two and a half".
const tcSpread = tcApi.tcPlan("near", "rederive", "t8").tokensPerParam / tcApi.tcPlan("near", "rederive", "t3").tokensPerParam;
if (!(tcSpread > 2.5))
  throw new Error(`target-config: tokens per parameter is claimed to travel more than 2.5x across the throughputs, measured ${fixedNumber(tcSpread, 4)}`);

console.log(`target-config OK: ${tcValues} values, A3 §3.3's closing question made computable -- the inverse of 12 n_layer d_model^2 reproduces N exactly while the grid it lands on never does (nearest corner 0.16 % to 2.93 % off over 18 combinations, worst corner 24.90 %, and 11 of 18 nearest corners mixed so no rounding rule predicts them), head_dim thins the reachable set in ${tcThinned} of the 9 target/shape pairs without appearing in the formula and leaves ${tcPrimeHeads} shapes with a prime head count and no grouped-query option, and a left-over D carries the N deviation one-for-one into wall clock (${fixedNumber(tcKeepShare.get("high"), 4)} h against the recomputed 48) while the token grid the API actually checks costs under ${fixedNumber(tcTokenLoss * 1e6, 2)} parts per million`);



// ---- run-plan --------------------------------------------------------------------------
// A3 §3.3 opens its write-up checklist with "Given your fixed scaling laws budget of 12
// B200-hours, how did you decide which runs to query?" -- the first point, before the
// fitting method and before the prediction. The app answered every later point and not
// this one: `run-budget-ledger` checks what the API accepts and charges, `scaling` and
// `scaling-fit` work on data that is already there, `target-config` converts a finished N.
// Which runs you buy decided nothing anywhere.
//
// Three properties carry the lab, and all three are arithmetic rather than opinion:
//   A. Every settable plan costs the same. The ladder is scaled so that
//      k * sum_j C_j / throughput is exactly the 43,200 s, so any difference in the result
//      is a difference in shape, never in spending.
//   B. A grid that picks the same index in every tier returns the prior's exponent, and
//      returns it exactly. Every measured minimum is then the same factor times
//      N_prior ∝ sqrt(C), so the least-squares slope in log space is 0.5 by construction --
//      with a perfect fit and no visible symptom. 63 of the 108 plans end that way.
//   C. The price of a wrong size is scale-free. Along the frontier the reducible loss is a
//      pure power law in C, so the compute-equivalent waste depends only on N/N_opt --
//      not on the budget, the target, or the assumed throughput.
const rpNames = ["RP_LOSS_E", "RP_LOSS_A", "RP_ALPHA", "RP_LOSS_B", "RP_BETA", "rpLoss",
  "RP_N_COEFF", "RP_N_EXPONENT", "rpOptimalN", "rpFrontierLoss", "RP_FIT_SECONDS",
  "RP_TARGET_SECONDS", "RP_THROUGHPUT", "RP_FIT_FLOPS", "RP_TARGET_FLOPS", "RP_PRIOR_RATIO",
  "rpPriorN", "RP_SPANS", "RP_TIERS", "RP_PER_TIER", "RP_STEPS", "rpSpan", "rpTiersOf",
  "rpPerTier", "rpStep", "rpLadder", "rpFit", "rpWasteFactor", "rpPlan", "RP_FACTORS",
  "rpFactor", "RP_WASTE_LEVELS", "rpBandEdge"];
const rpApi = runInNewContext(`${numberPrelude}${rpNames.map(name => sliceDeclaration(source, name)).join("\n")}; ({${rpNames.join(",")}})`, {});
let rpValues = 0;

// --- the two numbers the assignment fixes ---------------------------------------------
if (rpApi.RP_FIT_SECONDS !== 12 * 3600)
  throw new Error(`run-plan: A3 §3 gives 12 B200-hours for fitting, found ${rpApi.RP_FIT_SECONDS} s`);
if (rpApi.RP_TARGET_SECONDS !== tcApi.TC_TARGET_SECONDS)
  throw new Error("run-plan: the target run has to be the same 48 hours target-config and run-budget-ledger name");
if (rpApi.RP_TARGET_SECONDS !== 4 * rpApi.RP_FIT_SECONDS)
  throw new Error("run-plan: the whole point is that the target run is four times the entire measurement budget");

// --- the truth of the lab is a derivation, not a fitted number -------------------------
// N_opt(C) is claimed to be the closed-form argmin of Hoffmann's parametric loss under
// D = C/(6N). A closed form that is not the argmin would make every number downstream a
// story, so it is checked against a search rather than trusted.
if (Math.abs(rpApi.RP_N_EXPONENT - rpApi.RP_BETA / (rpApi.RP_ALPHA + rpApi.RP_BETA)) > 1e-15)
  throw new Error("run-plan: the compute-optimal exponent has to be beta/(alpha+beta)");
if (fixedNumber(rpApi.RP_N_EXPONENT, 2) !== "0.45")
  throw new Error(`run-plan: Hoffmann et al. report a = 0.46 for this fit; the derivation gives ${fixedNumber(rpApi.RP_N_EXPONENT, 6)}`);
for (const compute of [1e17, 1e18, 1e19, 1e20, 1e21]) {
  const closed = rpApi.rpOptimalN(compute);
  let bestParams = 0, bestLoss = Infinity;
  for (let exponent = Math.log10(closed) - 1; exponent <= Math.log10(closed) + 1; exponent += 0.0002) {
    const params = Math.pow(10, exponent), value = rpApi.rpLoss(params, compute / (6 * params));
    if (value < bestLoss) { bestLoss = value; bestParams = params; }
    rpValues++;
  }
  if (Math.abs(bestParams / closed - 1) > 5e-4)
    throw new Error(`run-plan: the closed form misses the searched argmin at C = ${compute}: ${closed} against ${bestParams}`);
  if (rpApi.rpFrontierLoss(compute) > bestLoss + 1e-12)
    throw new Error("run-plan: the frontier loss has to be the loss at the closed-form optimum");
}
// The prior is the 20-tokens-per-parameter rule, and its exponent has to be exactly 0.5 --
// property B rests on that and on nothing else.
for (const compute of [1e17, 1e19, 1e21]) {
  if (Math.abs(rpApi.rpPriorN(compute) - Math.sqrt(compute / (6 * rpApi.RP_PRIOR_RATIO))) > 1e-6)
    throw new Error("run-plan: the prior has to be N = sqrt(C / (6 * 20))");
  if (Math.abs(rpApi.rpPriorN(4 * compute) / rpApi.rpPriorN(compute) - 2) > 1e-12)
    throw new Error("run-plan: a prior with exponent 0.5 has to double when C quadruples");
}

// --- property A: every plan costs the same --------------------------------------------
const rpPlans = [];
for (const span of rpApi.RP_SPANS) for (const tiers of rpApi.RP_TIERS)
  for (const per of rpApi.RP_PER_TIER) for (const step of rpApi.RP_STEPS)
    rpPlans.push(rpApi.rpPlan(span.key, tiers.key, per.key, step.key));
if (rpPlans.length !== 108)
  throw new Error(`run-plan: the plan grid is 3 spans x 3 tier counts x 3 run counts x 4 grid steps = 108, found ${rpPlans.length}`);
for (const plan of rpPlans) {
  rpValues++;
  if (Math.abs(plan.ladder.seconds - rpApi.RP_FIT_SECONDS) > 1e-6)
    throw new Error(`run-plan: a plan costs ${plan.ladder.seconds} s instead of the budget it is scaled to fill`);
  if (plan.ladder.rows.length !== plan.tiers.tiers)
    throw new Error("run-plan: the ladder has to hold one row per tier");
  const ratio = plan.ladder.rows[plan.ladder.rows.length - 1].compute / plan.ladder.rows[0].compute;
  if (Math.abs(ratio / plan.span.span - 1) > 1e-9)
    throw new Error(`run-plan: the ladder's own span is ${ratio}, not the chosen ${plan.span.span}`);
  for (const row of plan.ladder.rows) {
    if (row.sizes.length !== plan.per.perTier)
      throw new Error("run-plan: every tier has to offer exactly the runs the plan paid for");
    if (Math.abs(row.sizes[1] / row.sizes[0] - plan.step.step) > 1e-9)
      throw new Error("run-plan: neighbouring sizes have to sit one grid step apart");
    if (row.measured !== row.sizes[row.pick])
      throw new Error("run-plan: the measured minimum has to be a grid point, not an interpolation");
    let bestSlot = 0, bestLoss = Infinity;
    row.sizes.forEach((params, slot) => {
      const value = rpApi.rpLoss(params, row.compute / (6 * params));
      if (value < bestLoss) { bestLoss = value; bestSlot = slot; }
    });
    if (bestSlot !== row.pick)
      throw new Error("run-plan: the chosen index has to be the lowest-loss run of that tier");
    if (row.edge !== (row.pick === 0 || row.pick === plan.per.perTier - 1))
      throw new Error("run-plan: the edge flag has to mean the minimum sits on the boundary of the grid");
  }
  // A bigger tier really does cost proportionally more wall clock -- the reason span is
  // the expensive axis and not just the wide one.
  for (const row of plan.ladder.rows)
    if (Math.abs(row.seconds - row.compute / rpApi.RP_THROUGHPUT) > 1e-9)
      throw new Error("run-plan: a tier's runtime has to be its compute divided by the throughput");
}
// Buying more of anything shrinks the largest tier, so the extrapolation gets longer. This
// is the trade the lab is about; if it ever stopped holding the prose would be wrong.
for (const span of rpApi.RP_SPANS) for (const tiers of rpApi.RP_TIERS) for (const step of rpApi.RP_STEPS) {
  const few = rpApi.rpPlan(span.key, tiers.key, "p3", step.key), many = rpApi.rpPlan(span.key, tiers.key, "p7", step.key);
  if (!(many.ladder.topCompute < few.ladder.topCompute && many.ladder.reach > few.ladder.reach))
    throw new Error(`run-plan: more runs per tier has to shrink the top tier and lengthen the extrapolation at ${span.key}/${tiers.key}/${step.key}`);
}

// --- property B: a locked grid hands back the prior, exactly ---------------------------
const rpPrior = rpPlans.filter(plan => plan.prior);
// The slope is 0.5 by construction, not by approximation: a constant index makes every
// measured N the same factor times a prior proportional to sqrt(C). Floating point puts a
// few last bits on it -- 41 of the 63 land on 0.5 bit for bit, the rest within 3e-15 --
// while the nearest plan that really measured something sits 0.0164 away. Thirteen orders
// of magnitude of gap is what makes a tolerance here a reading aid rather than a fudge.
let rpPriorGap = 0, rpMeasuredGap = Infinity;
for (const plan of rpPlans) {
  const gap = Math.abs(plan.fit.slope - 0.5);
  if (plan.prior) rpPriorGap = Math.max(rpPriorGap, gap); else rpMeasuredGap = Math.min(rpMeasuredGap, gap);
  if (plan.prior && fixedNumber(plan.fit.slope, 6) !== "0.500000")
    throw new Error("run-plan: a plan that handed back the prior has to print 0.500000 on the screen");
  if ((plan.ladder.distinct === 1) !== plan.prior)
    throw new Error(`run-plan: one distinct grid index and an exactly-0.5 slope have to be the same states, split at ${plan.span.key}/${plan.tiers.key}/${plan.per.key}/${plan.step.key}`);
}
if (!(rpPriorGap < 1e-14 && rpMeasuredGap > 1e-2))
  throw new Error(`run-plan: the two families have to stay separated by orders of magnitude, measured ${rpPriorGap} against ${rpMeasuredGap}`);
if (rpPrior.length !== 63)
  throw new Error(`run-plan: the prose says 63 of 108 plans hand back the prior, counted ${rpPrior.length}`);
for (const [stepKey, want] of [["g200", 27], ["g160", 24], ["g125", 6], ["g110", 6]]) {
  const seen = rpPrior.filter(plan => plan.step.key === stepKey).length;
  if (seen !== want)
    throw new Error(`run-plan: grid step ${stepKey} is said to hand back the prior in ${want} of 27 plans, counted ${seen}`);
}
for (const [spanKey, want] of [["s4", 27], ["s16", 20], ["s64", 16]]) {
  const seen = rpPrior.filter(plan => plan.span.key === spanKey).length;
  if (seen !== want)
    throw new Error(`run-plan: span ${spanKey} is said to hand back the prior in ${want} of 36 plans, counted ${seen}`);
}
// Span is the strongest single lever and still cannot rescue a coarse grid -- both halves
// of that sentence are checked, because dropping either would make the advice a rule.
if (!(rpPrior.filter(plan => plan.span.key === "s64").length < rpPrior.filter(plan => plan.span.key === "s4").length))
  throw new Error("run-plan: a wider span has to leave fewer plans stuck on the prior");
if (!rpPlans.some(plan => plan.span.key === "s64" && plan.prior))
  throw new Error("run-plan: the widest span still has to contain plans that hand back the prior, or the lab teaches a rule that is not true");

// --- what the same money buys ----------------------------------------------------------
const rpDeviations = rpPlans.map(plan => Math.abs(plan.deviation));
const rpBest = rpPlans.reduce((left, right) => right.waste < left.waste ? right : left);
const rpWorst = rpPlans.reduce((left, right) => right.waste > left.waste ? right : left);
if (fixedNumber(Math.min(...rpDeviations) * 100, 2) !== "0.22" || fixedNumber(Math.max(...rpDeviations) * 100, 2) !== "52.17")
  throw new Error(`run-plan: the prose says the deviations run from 0.22 % to 52.17 %, measured ${fixedNumber(Math.min(...rpDeviations) * 100, 2)} % to ${fixedNumber(Math.max(...rpDeviations) * 100, 2)} %`);
if (fixedNumber(rpBest.waste * 100, 4) !== "0.0002" || fixedNumber(rpWorst.waste * 100, 4) !== "15.6024")
  throw new Error(`run-plan: the prose says the waste runs from 0.0002 % to 15.6024 %, measured ${fixedNumber(rpBest.waste * 100, 4)} % to ${fixedNumber(rpWorst.waste * 100, 4)} %`);
if (!(rpWorst.waste / rpBest.waste > 1e4))
  throw new Error("run-plan: the prose claims more than four orders of magnitude between the cheapest and the most expensive plan at the same price");
if (rpBest.tiers.tiers !== 3)
  throw new Error(`run-plan: the prose says the best plan has only three tiers, found ${rpBest.tiers.tiers}`);
if (rpBest.span.span !== 64 || rpWorst.span.span !== 4)
  throw new Error("run-plan: the best plan has to be the widest span and the worst the narrowest, or the lever arm claim is empty");
if (rpWorst.step.step !== 1.25 || rpWorst.per.perTier !== 7)
  throw new Error("run-plan: the worst plan is described as the one with the smallest span and a coarse grid");
// More tiers are the weakest of the three levers. Checked as a median rather than a rule,
// because there is no plan-by-plan ordering here and claiming one would be false.
const rpMedian = plans => {
  const sorted = plans.map(plan => Math.abs(plan.deviation)).sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
};
if (!(rpMedian(rpPlans.filter(plan => plan.span.key === "s64")) < rpMedian(rpPlans.filter(plan => plan.span.key === "s4"))))
  throw new Error("run-plan: span has to move the median deviation, or the first advice of the lab is unfounded");

// --- the boundary minima this fit deliberately keeps ------------------------------------
// `scaling-fit` excludes edge minima; A3 §2.1 recommends "simply take the run with the
// lowest training loss for each compute budget". Two labs in the same app cannot state
// opposite rules on a hunch, so the tie is measured: dropping the marked tiers from the fit
// changes 11 of the 108 plans and makes 10 of those worse, and it leaves 18 more with
// fewer than two tiers, which cannot be fitted at all.
let rpEdgeChanged = 0, rpEdgeWorse = 0, rpEdgeUnfittable = 0;
for (const plan of rpPlans) {
  const inner = plan.ladder.rows.filter(row => !row.edge);
  if (inner.length < 2) { rpEdgeUnfittable++; continue; }
  const pruned = rpApi.rpFit(inner);
  const waste = rpApi.rpWasteFactor(pruned.predicted / rpApi.rpOptimalN(rpApi.RP_TARGET_FLOPS));
  rpValues++;
  if (Math.abs(waste - plan.waste) < 1e-12) continue;
  rpEdgeChanged++;
  if (waste > plan.waste) rpEdgeWorse++;
}
if (rpEdgeChanged !== 11 || rpEdgeWorse !== 10 || rpEdgeUnfittable !== 18)
  throw new Error(`run-plan: the boundary paragraph says 11 plans change, 10 of them for the worse, and 18 more lose their fit; measured ${rpEdgeChanged} / ${rpEdgeWorse} / ${rpEdgeUnfittable}`);
// The claim underneath it: a marked row is the grid point nearest the truth, not a wrong
// one. If a boundary tier ever had an interior neighbour closer to N_opt, the advice to
// widen the window rather than delete the row would be the wrong advice.
for (const plan of rpPlans) for (const row of plan.ladder.rows) {
  if (!row.edge) continue;
  const nearest = row.sizes.reduce((left, right) =>
    Math.abs(Math.log(right / row.truth)) < Math.abs(Math.log(left / row.truth)) ? right : left);
  if (nearest !== row.measured)
    throw new Error("run-plan: a boundary minimum has to be the grid point closest to the truth, or deleting the row would be the right move");
  rpValues++;
}

// Which side of the grid the minima fall on, and why the other branch is untested. The
// Chinchilla prior overestimates the compute-optimal size in 460 of the 468 tier rows, and
// undershoots by at most 1.59 % in the other 8, so a minimum can only escape downwards:
// 87 of the 468 rows sit on the bottom edge and none on the top. Mutation testing confirmed the consequence -- dropping the top-edge
// half of the edge test is inert on this data, the same shape of blind spot v81 found in
// run-budget-ledger. Counted here so the branch is knowingly untested rather than silently.
let rpBottomEdge = 0, rpTopEdge = 0, rpTierRows = 0, rpAbovePrior = 0;
for (const plan of rpPlans) for (const row of plan.ladder.rows) {
  rpTierRows++;
  if (row.pick === 0) rpBottomEdge++;
  if (row.pick === plan.per.perTier - 1) rpTopEdge++;
  if (row.truth > row.prior) rpAbovePrior++;
}
// The prior overestimates in 460 of the 468 rows, and in the 8 where it does not -- the
// smallest tiers, where the two curves cross at C = 5.5e16 -- it is under by 1.59 %, far
// less than the narrowest grid step. That is why no minimum ever reaches the top edge, and
// why the claim is a measurement here and not "the prior is always too big".
if (rpAbovePrior !== 8 || rpTierRows - rpAbovePrior !== 460)
  throw new Error(`run-plan: the prior is expected to overestimate in 460 of 468 tier rows, measured ${rpTierRows - rpAbovePrior}`);
if (rpTierRows !== 468 || rpBottomEdge !== 87 || rpTopEdge !== 0)
  throw new Error(`run-plan: 87 of 468 tier minima sit on the bottom edge and none on the top; measured ${rpBottomEdge} and ${rpTopEdge} of ${rpTierRows}`);

// --- property C: the price of a wrong size is scale-free -------------------------------
if (rpApi.rpWasteFactor(1) !== 0)
  throw new Error("run-plan: the optimum has to cost nothing");
// Measured against a bisection on the frontier at four budgets four orders of magnitude
// apart: the closed form is only allowed to be the shortcut, never a different number.
for (const compute of [1e18, 1e20, rpApi.RP_TARGET_FLOPS, 1e23]) {
  const truth = rpApi.rpOptimalN(compute);
  for (const factor of [0.25, 0.5, 0.9, 1.5, 4]) {
    const params = truth * factor, reached = rpApi.rpLoss(params, compute / (6 * params));
    let low = compute / 1e8, high = compute;
    for (let step = 0; step < 300; step++) {
      const middle = Math.sqrt(low * high);
      if (rpApi.rpFrontierLoss(middle) > reached) low = middle; else high = middle;
    }
    const measured = 1 - Math.sqrt(low * high) / compute;
    rpValues++;
    if (Math.abs(measured - rpApi.rpWasteFactor(factor)) > 1e-9)
      throw new Error(`run-plan: the closed-form waste ${rpApi.rpWasteFactor(factor)} disagrees with the bisected ${measured} at C = ${compute}`);
  }
}
for (const [factor, want] of [[0.5, "13.9178"], [2, "13.5679"], [1.1, "0.2806"], [0.9, "0.3442"]]) {
  if (fixedNumber(rpApi.rpWasteFactor(factor) * 100, 4) !== want)
    throw new Error(`run-plan: a factor of ${factor} is described as costing ${want} %, measured ${fixedNumber(rpApi.rpWasteFactor(factor) * 100, 4)} %`);
}
// Almost symmetric, and the popular "err on the large side" is the cheaper direction by a
// margin small enough that the lab has to say so rather than turn it into a rule.
if (!(rpApi.rpWasteFactor(2) < rpApi.rpWasteFactor(0.5)))
  throw new Error("run-plan: too large has to be the cheaper direction, or the asymmetry paragraph points the wrong way");
if (!(rpApi.rpWasteFactor(0.5) / rpApi.rpWasteFactor(2) < 1.05))
  throw new Error("run-plan: the asymmetry is described as tiny; a factor above 1.05 would make it a rule worth following");
for (const [level, low, high] of [[0.01, "0.8355", "1.1977"], [0.02, "0.7751", "1.2918"], [0.05, "0.6665", "1.5053"], [0.10, "0.5592", "1.8004"]]) {
  if (!rpApi.RP_WASTE_LEVELS.includes(level))
    throw new Error(`run-plan: the tolerance table no longer offers the ${level} threshold the prose names`);
  if (fixedNumber(rpApi.rpBandEdge(level, -1), 4) !== low || fixedNumber(rpApi.rpBandEdge(level, 1), 4) !== high)
    throw new Error(`run-plan: the ${level} band is described as ${low}x to ${high}x, measured ${fixedNumber(rpApi.rpBandEdge(level, -1), 4)}x to ${fixedNumber(rpApi.rpBandEdge(level, 1), 4)}x`);
  const inside = rpApi.rpBandEdge(level, 1) * 0.999, outside = rpApi.rpBandEdge(level, 1) * 1.001;
  if (!(rpApi.rpWasteFactor(inside) < level && rpApi.rpWasteFactor(outside) > level))
    throw new Error(`run-plan: the ${level} band edge does not separate inside from outside`);
}
// The flat frontier is why so many badly fitted plans still land respectably -- and why
// exactly one does not. Both halves are the point of mode B.
const rpTolerable = rpPlans.filter(plan => plan.waste < 0.10).length;
if (rpTolerable !== 107)
  throw new Error(`run-plan: the prose says 107 of 108 plans stay under ten percent waste, counted ${rpTolerable}`);
for (const factorEntry of rpApi.RP_FACTORS) {
  const params = rpApi.rpOptimalN(rpApi.RP_TARGET_FLOPS) * factorEntry.factor;
  if (!(rpApi.rpLoss(params, rpApi.RP_TARGET_FLOPS / (6 * params)) > rpApi.rpFrontierLoss(rpApi.RP_TARGET_FLOPS)))
    throw new Error(`run-plan: ${factorEntry.key} has to cost loss against the optimum`);
  rpValues++;
}

console.log(`run-plan OK: ${rpValues} values, A3 §3.3's first write-up question made computable -- all 108 plans cost the identical ${rpApi.RP_FIT_SECONDS} s while their predictions for the 48-hour run land ${fixedNumber(Math.min(...rpDeviations) * 100, 2)} % to ${fixedNumber(Math.max(...rpDeviations) * 100, 2)} % off (${fixedNumber(rpBest.waste * 100, 4)} % to ${fixedNumber(rpWorst.waste * 100, 4)} % of that run thrown away, and the best plan buys span rather than tiers), a grid that picks one index in every tier returns the prior's 0.5 exactly in ${rpPrior.length} of the 108 -- 27 of 27 at step 2.00 against 6 of 27 at 1.10 -- and the price of a wrong size is scale-free, agreeing with a bisection on the frontier across five orders of magnitude of budget (0.8355x to 1.1977x for under one percent)`);

// ---- chain-carry -------------------------------------------------------------------------
// A3 §3.3 is answered in four steps and the app computed each one alone: `run-plan` buys the
// runs and predicts N_pred, `scaling-fit` fits, `target-config` snaps N_pred onto a reachable
// 12 n_layer d_model^2, `run-budget-ledger` checks the contract. The number A3 actually grades
// appeared nowhere: how far the submitted N_final sits from the true optimum. run-plan measures
// N_pred against the truth, target-config measures its corners against N_pred -- the two errors
// meet in no line of either lab.
//
// Four properties carry this lab, and each is a count or an identity rather than a reading:
//   A. It is the same arithmetic, not a second copy of it. The chain calls rpPlan and
//      tcCandidates, so a number here that disagrees with the lab it came from is a bug in
//      one of the three, and this guard is where that shows.
//   B. The errors compose multiplicatively. waste(f1*f2) is not waste(f1) + waste(f2), and on
//      the plans that undershoot it is not even above waste(f1) -- the grid takes part of the
//      plan error back. Both directions occur, so neither is an artefact of one plan.
//   C. The four rounding rules are selection functions, and selection functions are exactly
//      where a lab can print a truthful number under a lying label. Each is checked against
//      its definition over every combination, not only at the states the anchors visit.
//   D. The recommendation is a count with no exception: the rule that reads run-plan's own
//      grid-lock diagnosis is worse than the nearest corner in none of the combinations. That
//      it can be is not luck -- every grid-locked fit returns the prior, and the prior
//      overestimates over this whole compute range.
const ccNames = ["RP_LOSS_E", "RP_LOSS_A", "RP_ALPHA", "RP_LOSS_B", "RP_BETA", "rpLoss",
  "RP_N_COEFF", "RP_N_EXPONENT", "rpOptimalN", "rpFrontierLoss", "RP_FIT_SECONDS",
  "RP_TARGET_SECONDS", "RP_THROUGHPUT", "RP_FIT_FLOPS", "RP_TARGET_FLOPS", "RP_PRIOR_RATIO",
  "rpPriorN", "RP_SPANS", "RP_TIERS", "RP_PER_TIER", "RP_STEPS", "rpSpan", "rpTiersOf",
  "rpPerTier", "rpStep", "rpLadder", "rpFit", "rpWasteFactor", "rpPlan", "TC_HANDOUT_N",
  "TC_RHOS", "TC_HEAD_DIMS", "tcRho", "tcHeadDim", "tcContinuousShape", "tcCandidates",
  "CC_PLANS", "CC_RULES", "ccPlanOf", "ccRuleOf", "ccTruth", "ccCorners", "ccPickCorner",
  "ccChain", "CC_SWEEP_CACHE", "ccSweepData"];
const ccApi = runInNewContext(`${numberPrelude}${ccNames.map(name => sliceDeclaration(source, name)).join("\n")}; ({${ccNames.join(",")}})`, {});
let ccValues = 0;

// --- A. the chain is wired, not retold -------------------------------------------------
// Each named plan has to be one of run-plan's own 108, and the chain's first stage has to be
// rpPlan's own answer to the bit and not a number that merely resembles it.
for (const entry of ccApi.CC_PLANS) {
  const plan = ccApi.rpPlan(entry.span, entry.tiers, entry.per, entry.step);
  const chain = ccApi.ccChain(entry.key, "r128", "h64", "near");
  if (chain.planFactor !== plan.factor)
    throw new Error(`chain-carry: ${entry.key} reports a plan factor run-plan does not compute`);
  if (chain.planWaste !== plan.waste)
    throw new Error(`chain-carry: ${entry.key} reports a plan waste run-plan does not compute`);
  if (chain.plan.prior !== plan.prior)
    throw new Error(`chain-carry: ${entry.key} disagrees with run-plan about whether the fit is grid-locked`);
  ccValues += 3;
}
if (ccApi.ccTruth() !== ccApi.rpOptimalN(ccApi.RP_TARGET_FLOPS))
  throw new Error("chain-carry: the truth has to be run-plan's own optimum at the same 48-hour budget");
// And the second stage has to be target-config's grid, corner for corner.
for (const rho of ccApi.TC_RHOS) for (const head of ccApi.TC_HEAD_DIMS) {
  const predicted = ccApi.rpPlan("s64", "t3", "p7", "g125").fit.predicted;
  const mine = ccApi.ccCorners(predicted, rho.key, head.key);
  const theirs = ccApi.tcCandidates(predicted, rho.rho, head.headDim);
  if (JSON.stringify(mine.rows) !== JSON.stringify(theirs.rows))
    throw new Error(`chain-carry: the corners at ${rho.key}/${head.key} are not target-config's`);
  ccValues += mine.rows.length;
}

// --- C. the four rules, checked against their definitions over every combination --------
// A selection function can be bent so that the label lies while every arithmetic anchor
// holds. Each rule is therefore re-derived here from the corner list itself.
const ccCombos = [];
for (const span of ccApi.RP_SPANS) for (const tiers of ccApi.RP_TIERS)
  for (const per of ccApi.RP_PER_TIER) for (const step of ccApi.RP_STEPS) {
    const plan = ccApi.rpPlan(span.key, tiers.key, per.key, step.key);
    for (const rho of ccApi.TC_RHOS) for (const head of ccApi.TC_HEAD_DIMS) {
      const corners = ccApi.tcCandidates(plan.fit.predicted, rho.rho, head.headDim);
      if (corners.rows.length < 2) continue;
      ccCombos.push({ plan, corners: corners.rows });
    }
  }
if (ccCombos.length !== 648)
  throw new Error(`chain-carry: the sweep is 108 plans over 6 shapes, found ${ccCombos.length}`);
const ccTruthN = ccApi.ccTruth();
const ccWasteOf = row => ccApi.rpWasteFactor(row.params / ccTruthN);
for (const { plan, corners } of ccCombos) {
  const sorted = [...corners].sort((left, right) => left.params - right.params);
  const picks = {
    near: ccApi.ccPickCorner(corners, plan.prior, "near"),
    down: ccApi.ccPickCorner(corners, plan.prior, "down"),
    up: ccApi.ccPickCorner(corners, plan.prior, "up"),
    diag: ccApi.ccPickCorner(corners, plan.prior, "diag")
  };
  if (picks.down !== sorted[0]) throw new Error("chain-carry: \"always round down\" does not return the smallest corner");
  if (picks.up !== sorted[sorted.length - 1]) throw new Error("chain-carry: \"always round up\" does not return the largest corner");
  // The nearest corner is the one target-config sorts to the front -- and it has to really
  // minimise the distance to N_pred, or the label and the row would come apart.
  const closest = Math.min(...corners.map(row => Math.abs(row.ratio - 1)));
  if (Math.abs(picks.near.ratio - 1) > closest + 1e-15)
    throw new Error("chain-carry: \"the nearest corner\" is not the corner nearest N_pred");
  if (picks.diag !== (plan.prior ? picks.down : picks.near))
    throw new Error("chain-carry: the diagnostic rule has to be round-down on a grid-locked fit and nearest otherwise");
  ccValues += 4;
}

// --- D. why the diagnosis is allowed to know anything ----------------------------------
// A grid-locked fit returns the prior exactly, and the prior assumes exponent 0.5 while the
// truth grows with beta/(alpha+beta). Above the crossing point of the two curves the prior
// overestimates -- so the direction is derived, not observed. The count has to agree with it.
const ccLocked = ccCombos.filter(entry => entry.plan.prior);
const ccFree = ccCombos.filter(entry => !entry.plan.prior);
const ccLockedHigh = ccLocked.filter(entry => entry.plan.factor > 1).length;
const ccFreeHigh = ccFree.filter(entry => entry.plan.factor > 1).length;
if (ccLockedHigh !== ccLocked.length)
  throw new Error(`chain-carry: the rule leans on every grid-locked fit overestimating, but ${ccLocked.length - ccLockedHigh} do not`);
if (ccFreeHigh === 0 || ccFreeHigh === ccFree.length)
  throw new Error("chain-carry: the measuring fits have to show both signs, or a blanket rounding rule would be justified after all");
if (ccApi.rpPriorN(ccApi.RP_TARGET_FLOPS) <= ccApi.rpOptimalN(ccApi.RP_TARGET_FLOPS))
  throw new Error("chain-carry: at the 48-hour budget the prior has to sit above the truth -- that is what makes rounding down the correction");
// Mutation testing turned up the reason the count alone is not enough: on the grid-locked
// rows `factor > 1` and `factor > 0` select the same 378, because the smallest of them is
// 1.1629. The comparison is untestable there by construction, so the margin is asserted
// directly and the branch is knowingly checked rather than silently assumed.
const ccLockedFactors = ccLocked.map(entry => entry.plan.factor);
if (Math.min(...ccLockedFactors) < 1.05)
  throw new Error(`chain-carry: the grid-locked fits are claimed to overestimate with room to spare, smallest is ${fixedNumber(Math.min(...ccLockedFactors), 4)}`);
if (!ccFree.some(entry => entry.plan.factor < 1))
  throw new Error("chain-carry: the measuring fits have to include underestimates, or the same comparison would be untestable everywhere");
// The degeneracy is a finding about the data, not a blemish to hide: a grid-locked fit no
// longer depends on the data, so the 378 combinations collapse onto very few predictions.
// The lab prints the number; the guard is what keeps it honest.
const ccLockedDistinct = new Set(ccLocked.map(entry => Math.round(entry.plan.factor * 1e6))).size;
if (ccLockedDistinct > 5)
  throw new Error(`chain-carry: the grid-locked cases were said to collapse onto very few predictions, found ${ccLockedDistinct}`);
ccValues += ccCombos.length;

// --- B. the errors multiply, and the sum is the wrong arithmetic ------------------------
// Two directions have to occur among the 648, or "the grid can take the plan error back"
// would be a claim about one lucky plan.
let ccCancel = 0, ccCompound = 0, ccBelowPlan = 0, ccAddOverstates = 0;
for (const { plan, corners } of ccCombos) {
  const corner = ccApi.ccPickCorner(corners, plan.prior, "near");
  const total = plan.factor * corner.ratio;
  if (Math.abs(Math.log(total)) < Math.abs(Math.log(plan.factor))) ccCancel++; else ccCompound++;
  const real = ccApi.rpWasteFactor(total);
  if (real < plan.waste) ccBelowPlan++;
  // How wrong the addition is depends on the case, and a maximum over ratios explodes
  // wherever the real waste is near zero. The legible statement is a count: in how many
  // combinations does the sum overstate the real waste by more than half again.
  const added = plan.waste + ccApi.rpWasteFactor(corner.ratio);
  if (added > 1.5 * real) ccAddOverstates++;
}
if (!ccCancel || !ccCompound)
  throw new Error("chain-carry: both composition directions have to occur, or the multiplicative claim rests on one case");
if (!ccBelowPlan)
  throw new Error("chain-carry: on some plan the real waste has to fall below the plan's own, or the grid never takes anything back");
// The composed factor really is the product, checked where the two stages are far apart.
{
  const chain = ccApi.ccChain("worst", "r128", "h64", "near");
  if (Math.abs(chain.totalFactor - chain.planFactor * chain.gridFactor) > 1e-12)
    throw new Error("chain-carry: the total factor has to be the product of the two stages");
  if (!(chain.totalWaste < chain.planWaste))
    throw new Error("chain-carry: the worst plan is the lab's example of the grid taking error back");
  if (!(chain.addedWaste > chain.totalWaste))
    throw new Error("chain-carry: and the naive sum has to sit above both, or the point of the second ledger is gone");
  ccValues += 3;
}

// --- the ranking the lab recommends, as counts -----------------------------------------
const ccSummary = ccApi.ccSweepData().summary;
const ccBy = key => ccSummary.find(entry => entry.rule.key === key);
if (ccBy("diag").worse !== 0)
  throw new Error(`chain-carry: the recommended rule is claimed never worse than the nearest corner, found ${ccBy("diag").worse}`);
if (ccBy("diag").better === 0)
  throw new Error("chain-carry: a rule that is never worse and never better would not be worth a lab");
if (ccBy("down").worse === 0 || ccBy("up").worse === 0)
  throw new Error("chain-carry: the two blanket rules have to be worse somewhere, or the diagnosis buys nothing");
if (!(ccBy("down").worst > ccBy("near").worst))
  throw new Error("chain-carry: always rounding down is claimed to own the worst single case");
if (!(ccBy("diag").mean < ccBy("near").mean))
  throw new Error("chain-carry: the recommended rule has to win on the mean as well");
// The sweep and the single chain have to be the same arithmetic: a summary computed from a
// second, drifting copy would rank rules the mode-A ledger does not.
for (const entry of ccApi.CC_PLANS) for (const rule of ccApi.CC_RULES) {
  const chain = ccApi.ccChain(entry.key, "r128", "h64", rule.key);
  const direct = ccApi.rpWasteFactor(chain.chosen.row.params / ccTruthN);
  if (chain.totalWaste !== direct)
    throw new Error(`chain-carry: ${entry.key}/${rule.key} shows a waste its own corner does not produce`);
  ccValues++;
}

// --- the numbers the lab card promises -------------------------------------------------
// A renderer's prose is held by `renderer i18n`: change a German string and its English
// entry stops matching. The lab *card* has no such tether -- its fields are looked up by
// lab id, so a number in `observe` or `transferAnswer` can drift away from the arithmetic
// and nothing notices. Mutation testing walked straight through that gap. Both languages
// carry the same claims in their own number format, so both are bound here.
{
  const cardStart = source.indexOf('        id:"chain-carry",title:');
  if (cardStart < 0) throw new Error("chain-carry: the lab card is gone");
  const germanCard = source.slice(cardStart, source.indexOf("\n      },", cardStart));
  const enStart = englishSource.indexOf('"chain-carry": {');
  if (enStart < 0) throw new Error("chain-carry: the English lab card is gone");
  const englishCard = englishSource.slice(enStart, englishSource.indexOf("\n    },", enStart));

  const german = (value, digits) => Number(value).toLocaleString("de-DE",
    { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false });
  const best = ccApi.ccChain("best", "r128", "h64", "near");
  const worst = ccApi.ccChain("worst", "r128", "h64", "near");
  const claims = [
    [best.planWaste * 100, 4, "the best plan's own waste"],
    [best.totalWaste * 100, 4, "what the grid alone makes of it"],
    [worst.planWaste * 100, 4, "the worst plan's own waste"],
    [worst.totalWaste * 100, 4, "and what the nearest corner brings it down to"],
    [Math.min(...ccLockedFactors), 4, "the smallest grid-locked overestimate"],
    [Math.max(...ccLockedFactors), 4, "the largest grid-locked overestimate"],
    [ccApi.RP_N_EXPONENT, 6, "the true compute-optimal exponent"]
  ];
  for (const [value, digits, why] of claims) {
    if (!germanCard.includes(german(value, digits)))
      throw new Error(`chain-carry: the German card names ${why} but not as ${german(value, digits)}`);
    if (!englishCard.includes(fixedNumber(value, digits)))
      throw new Error(`chain-carry: the English card names ${why} but not as ${fixedNumber(value, digits)}`);
    ccValues += 2;
  }
  for (const [count, why] of [[ccBy("diag").better, "how often the diagnostic rule wins"],
    [ccCombos.length, "how many combinations were checked"]]) {
    if (!germanCard.includes(String(count)) || !englishCard.includes(String(count)))
      throw new Error(`chain-carry: both cards have to name ${why} as ${count}`);
    ccValues += 2;
  }
  // The claim that survives every rewrite of the numbers: the rule is never worse. If that
  // ever stops being 0 the sentence in both cards is false, whatever figures stand beside it.
  if (ccBy("diag").worse !== 0)
    throw new Error("chain-carry: both cards claim the rule is worse in none of the combinations");
}

// --- the English side of the prose carries the same numbers ----------------------------
// `renderer i18n` proves an English entry exists; `english render` proves no German is left
// on the screen. Neither looks at the figures inside the English text, so a translated
// sentence can quote a number the app never computes and both stay green -- mutation
// testing walked through exactly there. Every number in a German string this lab prints has
// to reappear in its English entry, and no number may be invented on either side. German
// writes the decimal separator as a comma and English as a point; nothing else differs,
// because none of these strings groups thousands.
// Where one lab's code block ends: at the next lab header, not at a hard-coded distant one.
// Both number-parity guards below used to slice from their own header all the way to
// `ablation-controls`, which meant they silently covered every lab that happened to be
// written between the two -- three of them by v96. That passed only as long as those labs
// obeyed a rule they were never asked about; the first lab to group a thousand in German
// broke a guard that has nothing to do with it.
function labCodeBlock(name) {
  const start = source.indexOf(`    // ---- Lab: ${name} `);
  if (start < 0) throw new Error(`${name}: the lab's code block is gone`);
  const next = source.indexOf("    // ---- Lab: ", start + 1);
  return source.slice(start, next < 0 ? source.length : next);
}

{
  const labCode = labCodeBlock("chain-carry");

  const germanStrings = new Set();
  for (const hit of labCode.matchAll(/tr\("((?:[^"\\]|\\.)*)"\)/g)) germanStrings.add(hit[1]);
  for (const hit of labCode.matchAll(/tr\([^)]*?\?"((?:[^"\\]|\\.)*)":"((?:[^"\\]|\\.)*)"\)/g)) {
    germanStrings.add(hit[1]); germanStrings.add(hit[2]);
  }
  for (const hit of labCode.matchAll(/(?:label|note):"((?:[^"\\]|\\.)*)"/g)) germanStrings.add(hit[1]);

  const numerals = text => (text.match(/\d+(?:[.,]\d+)*/g) || []);
  let checked = 0, numeric = 0;
  for (const german of germanStrings) {
    if (!/\d/.test(german)) continue;
    const english = pack.ui?.[german];
    if (typeof english !== "string")
      throw new Error(`chain-carry: the string "${german.slice(0, 60)}" has no English entry`);
    if (/\d{1,3}(?:\.\d{3})+/.test(german))
      throw new Error(`chain-carry: "${german.slice(0, 60)}" groups thousands, which this comparison does not model`);
    const want = numerals(german).map(token => token.replace(",", ".")).sort();
    const got = numerals(english).sort();
    if (JSON.stringify(want) !== JSON.stringify(got))
      throw new Error(`chain-carry: the English entry for "${german.slice(0, 50)}" carries ${JSON.stringify(got)} where the German carries ${JSON.stringify(want)}`);
    numeric++;
    checked += want.length;
  }
  if (numeric < 20)
    throw new Error(`chain-carry: only ${numeric} numeric strings found, the extraction is not seeing the lab's prose`);
  ccValues += checked;
}
console.log(`chain-carry OK: ${ccValues} values, A3's four steps joined into the number it grades -- N_final against the truth, which neither run-plan nor target-config computes; the two errors multiply rather than add (the naive sum overstates the real waste by more than half again in ${ccAddOverstates} of ${ccCombos.length} combinations, and in ${ccBelowPlan} of them the grid pulls the result below the plan's own error -- ${ccCancel} corners move toward the truth against ${ccCompound} away), all four rounding rules re-derived from the corner list in every combination, and the rule that reads run-plan's grid-lock diagnosis better in ${ccBy("diag").better} and worse in ${ccBy("diag").worse} -- earned because ${ccLockedHigh} of ${ccLocked.length} grid-locked fits overestimate (collapsing onto ${ccLockedDistinct} distinct predictions) while the measuring ones split ${ccFreeHigh} of ${ccFree.length}`);

// ---- causal-invariance ---------------------------------------------------------
// `causal-mask` decides two of A1's largest problems -- scaled_dot_product_attention and
// multihead_self_attention -- and no lecture teaches it, so it reaches the reader only
// through the assignment page's self-study section. Its concept page names four wrong
// implementations and A1's own mission names the test ("test causal invariance -- a change
// to a future token must not alter earlier logits"). Nothing computed either half.
//
// The reference below is typed from those definitions rather than reused from the app: a
// mask that is allowed where j <= i, added to the scores before softmax, and an invariance
// probe that changes one token and measures the largest movement at earlier positions.
const cmApi = renderApi(["CM_VOCAB", "CM_HEAD_DIM", "CM_LOGIT_SCALE", "CM_SENTINEL",
  "CM_SEQUENCE", "CM_LENGTHS", "CM_VARIANTS", "CM_DEPTHS", "cmLengthOf", "cmVariantOf",
  "cmDepthOf", "cmTokens", "cmQK", "cmRawScores", "cmAllowed", "cmSoftmax", "cmAttention",
  "cmMass", "cmLoss", "cmRowSumDeviation", "cmNaNCount", "cmInvariance", "cmUnmaskedGap",
  "cmCoverage", "cmProbeSweep", "cmNum", "cmSci", "cmRead",
  "renderCausalInvarianceTests", "renderCausalInvarianceLoss", "cmStageMarkup"], {});
let cmValues = 0, cmMarginLow = 0;

// --- the mask itself, typed from the concept page's own sentence ---------------------
// "M[i,j] = allowed exactly when j <= i". Every variant is a named deviation from it, and
// each deviation is spelled out here instead of read back from the app.
const cmRefAllowed = {
  correct: (i, j) => j <= i,
  after: (i, j) => j <= i,
  flipped: (i, j) => j >= i,
  "strict-inf": (i, j) => j < i,
  "strict-big": (i, j) => j < i
};
for (const variant of cmApi.CM_VARIANTS) {
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    if (cmApi.cmAllowed(variant.key, i, j) !== cmRefAllowed[variant.key](i, j))
      throw new Error(`causal-invariance: ${variant.key} disagrees with its own definition at i=${i}, j=${j}`);
    cmValues++;
  }
}
// The two j < i variants must build the identical triangle -- the whole point is that they
// differ only in the sentinel, so a reader cannot tell them apart from the mask picture.
for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++)
  if (cmApi.cmAllowed("strict-inf", i, j) !== cmApi.cmAllowed("strict-big", i, j))
    throw new Error("causal-invariance: the two j < i variants must share one triangle, or the lab's point is gone");

// --- softmax, typed again ------------------------------------------------------------
function cmRefSoftmax(row) {
  const top = Math.max(...row);
  if (!Number.isFinite(top)) return row.map(() => NaN);
  const weights = row.map(value => Math.exp(value - top));
  const total = weights.reduce((sum, value) => sum + value, 0);
  return weights.map(value => value / total);
}
// --- the three tests, each re-derived from what it claims to measure -------------------
for (const length of cmApi.CM_LENGTHS.map(entry => entry.length)) {
  const scores = cmApi.cmRawScores(length);
  for (const variant of cmApi.CM_VARIANTS) {
    const built = cmApi.cmAttention(length, variant.key);
    for (let i = 0; i < length; i++) {
      let want;
      if (variant.key === "after") {
        want = cmRefSoftmax(scores[i]).map((weight, j) => (j <= i ? weight : 0));
      } else {
        const sentinel = variant.key === "strict-big" ? -1e9 : -Infinity;
        want = cmRefSoftmax(scores[i].map((value, j) =>
          cmRefAllowed[variant.key](i, j) ? value : value + sentinel));
      }
      for (let j = 0; j < length; j++) {
        const got = built[i][j];
        const ok = Number.isFinite(want[j]) ? Math.abs(got - want[j]) < 1e-12 : !Number.isFinite(got);
        if (!ok) throw new Error(`causal-invariance: ${variant.key} row ${i} col ${j} at T=${length} is ${got}, the definition gives ${want[j]}`);
        cmValues++;
      }
    }
  }
}

// --- the coverage matrix: the claim the lab is built on --------------------------------
// Each cell is asserted by name. A lab that quietly re-labels one of these is a lab that
// teaches the wrong debugging rule, and no arithmetic guard above would notice.
const cmVerdicts = (length, depth, probe) => Object.fromEntries(cmApi.cmCoverage(length, depth, probe)
  .map(entry => [entry.variant.key, {
    rowSum: entry.rowSum > 1e-9 ? "fail" : "pass",
    finite: entry.nan > 0 ? "fail" : "pass",
    invariance: entry.invariance.verdict,
    loss: entry.loss.mean
  }]));
for (const { length } of cmApi.CM_LENGTHS) {
  for (let probe = 1; probe < length; probe++) {
    const full = cmVerdicts(length, "all", probe);
    // The correct mask passes all three, always.
    for (const test of ["rowSum", "finite", "invariance"])
      if (full.correct[test] !== "pass")
        throw new Error(`causal-invariance: the correct mask fails ${test} at T=${length}, p=${probe}`);
    // The flipped triangle is the one the named test really catches.
    if (full.flipped.invariance !== "fail")
      throw new Error(`causal-invariance: the flipped triangle has to fail causal invariance at T=${length}, p=${probe}`);
    // Masking after softmax is perfectly causal and breaks only the row sum. This is the
    // first of the two the named test misses, and the reason the row sum stands beside it.
    if (full.after.invariance !== "pass" || full.after.rowSum !== "fail" || full.after.finite !== "pass")
      throw new Error(`causal-invariance: "masked after softmax" must pass invariance and fail only the row sum at T=${length}, p=${probe}`);
    // The loud sentinel fails on finiteness and has no invariance verdict at all -- a NaN
    // model cannot be probed, and reporting that as a pass would be the worse lie.
    if (full["strict-inf"].finite !== "fail" || full["strict-inf"].invariance !== "none")
      throw new Error(`causal-invariance: the -Infinity variant must fail finiteness and return no invariance verdict at T=${length}, p=${probe}`);
    if (Number.isFinite(full["strict-inf"].loss))
      throw new Error("causal-invariance: the -Infinity variant cannot have a finite loss");
    // The silent sentinel passes both structural tests and fails only the full-depth probe.
    if (full["strict-big"].rowSum !== "pass" || full["strict-big"].finite !== "pass")
      throw new Error(`causal-invariance: the -1e9 variant has to pass both structural tests, or it would not be silent`);
    if (full["strict-big"].invariance !== "fail")
      throw new Error(`causal-invariance: the -1e9 variant has to fail the full-depth probe at T=${length}, p=${probe}`);
    cmValues += 8;
  }
}
// --- the depth split: the finding that makes the lab worth doing ------------------------
// Broken is row 0 alone, so a probe that looks only at p-1 sees the violation at p = 1 and
// never again. Both halves are asserted: it must fire at p = 1 and be silent past it, or
// the narrow test would be either useless or equivalent and the lesson would be empty.
let cmNarrowBlind = 0, cmWideCaught = 0;
for (const { length } of cmApi.CM_LENGTHS) {
  const sweep = cmApi.cmProbeSweep(length, "strict-big");
  for (const row of sweep) {
    if (row.all.verdict !== "fail")
      throw new Error(`causal-invariance: the full-depth probe has to catch the -1e9 variant at p=${row.probe}, T=${length}`);
    cmWideCaught++;
    const expected = row.probe === 1 ? "fail" : "pass";
    if (row.prev.verdict !== expected)
      throw new Error(`causal-invariance: the p-1 probe at p=${row.probe}, T=${length} is ${row.prev.verdict}, the geometry says ${expected}`);
    if (row.probe > 1) {
      if (row.prev.worst !== 0)
        throw new Error(`causal-invariance: the p-1 probe has to be exactly blind past p = 1, measured ${row.prev.worst}`);
      cmNarrowBlind++;
    }
    cmValues += 2;
  }
}
if (!cmNarrowBlind) throw new Error("causal-invariance: the narrow probe is never blind, so the depth split teaches nothing");
// And the two depths have to agree on the correct mask, or the split would look like noise.
for (const { length } of cmApi.CM_LENGTHS) for (let probe = 1; probe < length; probe++)
  for (const depth of ["all", "prev"])
    if (cmApi.cmInvariance(length, "correct", probe, depth).verdict !== "pass")
      throw new Error("causal-invariance: the correct mask has to pass at both depths");

// --- why the 1e-9 threshold is not a tuning knob ------------------------------------------
// Mutation testing loosened it to 1e-3 and nothing moved. That is not a missing guard but a
// property of the arithmetic, and the honest response is to measure the property rather than
// to swap the mutation for a luckier one. Masking is exact: a forbidden position contributes
// exactly zero to the mass, so a passing probe reads 0 and not "almost 0". There is no grey
// zone in float64 at all, and every threshold strictly between 0 and the smallest real
// violation gives identical verdicts. If that ever stops holding -- an approximation creeping
// into the mask, a sentinel that no longer cancels -- this fails and the constant has to be
// argued for instead of assumed.
{
  const violations = [], passes = [];
  for (const { length } of cmApi.CM_LENGTHS) for (const variant of cmApi.CM_VARIANTS)
    for (let probe = 1; probe < length; probe++) for (const depth of ["all", "prev"]) {
      const result = cmApi.cmInvariance(length, variant.key, probe, depth);
      if (result.verdict === "fail") violations.push(result.worst);
      else if (result.verdict === "pass") passes.push(result.worst);
    }
  if (!violations.length || !passes.length)
    throw new Error("causal-invariance: the probe has to produce both verdicts, or the threshold is untestable by construction");
  for (const value of passes)
    if (value !== 0)
      throw new Error(`causal-invariance: a passing probe measured ${value} rather than exactly 0 -- masking is supposed to be exact, and the threshold would become a real choice`);
  const smallest = Math.min(...violations);
  if (!(smallest > 1e-3))
    throw new Error(`causal-invariance: the smallest real violation is ${smallest}, close enough to the threshold that its value starts to matter`);
  cmValues += violations.length + passes.length;
  cmMarginLow = smallest;
}

// --- why row 0 is broken: shift invariance, derived rather than observed -----------------
// softmax(x + c) = softmax(x). A fully masked row adds the same constant everywhere, so it
// returns the *unmasked* distribution. The gap has to be floating-point noise and nothing
// more -- if it were a real difference the lab's explanation would be wrong.
for (const { length } of cmApi.CM_LENGTHS) {
  const gap = cmApi.cmUnmaskedGap(length);
  if (!(gap.gap < 1e-6))
    throw new Error(`causal-invariance: row 0 under -1e9 is claimed to be the unmasked row, measured gap ${gap.gap}`);
  if (gap.gap === 0)
    throw new Error("causal-invariance: an exactly zero gap would mean the sentinel was never added");
  // and it really is a distribution over the whole sequence, future included
  const total = gap.masked.reduce((sum, value) => sum + value, 0);
  if (Math.abs(total - 1) > 1e-12)
    throw new Error("causal-invariance: the silently unmasked row still has to sum to 1, that is why it is silent");
  if (!(gap.masked[length - 1] > 0.01))
    throw new Error("causal-invariance: row 0 has to put real mass on the last position, or 'it reads the future' is overstated");
  cmValues += 3;
}
// The same row with -Infinity is NaN. The pair is the lab's argument for the loud sentinel.
for (const { length } of cmApi.CM_LENGTHS) {
  if (!(cmApi.cmNaNCount(length, "strict-inf") >= length))
    throw new Error("causal-invariance: the -Infinity variant has to produce a whole NaN row");
  if (cmApi.cmNaNCount(length, "strict-big") !== 0)
    throw new Error("causal-invariance: the -1e9 variant must produce no NaN at all, that is the point");
  cmValues += 2;
}

// --- the loss ranking: the lab's headline, and the claim most worth disbelieving ---------
// Three of the four broken masks look better than the correct one, and the fourth has no
// loss at all. Re-derived from the definition: the logit of a token is the attention mass
// on positions holding it, and the loss is the negative log of the softmax of that.
function cmRefLoss(length, variantKey) {
  const tokens = cmApi.CM_SEQUENCE.slice(0, length);
  const attention = cmApi.cmAttention(length, variantKey);
  const per = [];
  for (let i = 0; i < length - 1; i++) {
    const mass = new Array(cmApi.CM_VOCAB).fill(0);
    for (let j = 0; j < length; j++) mass[tokens[j]] += attention[i][j];
    const distribution = cmRefSoftmax(mass.map(value => value * cmApi.CM_LOGIT_SCALE));
    per.push(-Math.log(distribution[tokens[i + 1]]));
  }
  return per;
}
let cmLooksBetter = 0, cmEvaluable = 0;
for (const { length } of cmApi.CM_LENGTHS) {
  const correct = cmApi.cmLoss(length, "correct");
  for (const variant of cmApi.CM_VARIANTS) {
    const reference = cmRefLoss(length, variant.key), built = cmApi.cmLoss(length, variant.key);
    for (let i = 0; i < reference.length; i++) {
      const ok = Number.isFinite(reference[i])
        ? Math.abs(built.per[i] - reference[i]) < 1e-12
        : !Number.isFinite(built.per[i]);
      if (!ok) throw new Error(`causal-invariance: ${variant.key} loss at position ${i}, T=${length} is ${built.per[i]}, the definition gives ${reference[i]}`);
      cmValues++;
    }
    if (variant.key === "correct" || !built.finite) continue;
    cmEvaluable++;
    if (built.mean < correct.mean) cmLooksBetter++;
    else throw new Error(`causal-invariance: ${variant.key} is claimed to look better than the correct mask at T=${length}, measured ${built.mean} against ${correct.mean}`);
  }
  // The headline, stated as the lab states it: the correct mask is the worst of the finite ones.
  const finite = cmApi.CM_VARIANTS.map(variant => cmApi.cmLoss(length, variant.key))
    .filter(entry => entry.finite).map(entry => entry.mean);
  if (correct.mean !== Math.max(...finite))
    throw new Error(`causal-invariance: at T=${length} the correct mask is not the highest loss, so the lab's warning is false`);
  cmValues++;
}
if (cmLooksBetter !== cmEvaluable || !cmEvaluable)
  throw new Error("causal-invariance: the claim is that every evaluable broken variant looks better, and it has to be all of them");
// The leak has to be a large effect, or "not narrowly" in the prose is an overstatement.
const cmLeakRatio = cmApi.cmLoss(6, "correct").mean / cmApi.cmLoss(6, "flipped").mean;
if (!(cmLeakRatio > 2))
  throw new Error(`causal-invariance: the flipped triangle is claimed to be far better on loss, measured only ${cmLeakRatio}x`);
cmValues++;

// --- where NaN is allowed to reach the screen, and where it is not ----------------------
// `render coverage` can only say "a NaN appears somewhere" for this lab, because every state
// lists the -Infinity variant in a table. The useful half is which cell holds it. A NaN that
// escaped into another variant's row would be a wrong number under a correct label.
{
  const cmStates = [];
  for (const mode of ["tests", "loss"]) for (const variant of cmApi.CM_VARIANTS)
    for (const length of cmApi.CM_LENGTHS) for (const depth of cmApi.CM_DEPTHS)
      for (const probe of ["1", "2", "3"])
        cmStates.push({ cmMode: mode, cmVariant: variant.key, cmLength: length.key,
          cmProbe: probe, cmDepth: depth.key, cmLossLength: length.key });
  const cmOwner = suffix => (suffix.startsWith("strict-inf") ? "strict-inf" : suffix.split("-")[0]);
  for (const state of cmStates) {
    const html = cmApi.cmStageMarkup(state);
    for (const cell of html.matchAll(/<(?:td|strong) data-(cmcovloss|cmlossmean|cmlossdelta|cmper)="([^"]+)"[^>]*>([^<]*)</g)) {
      if (cell[3].includes("NaN") && cmOwner(cell[2]) !== "strict-inf")
        throw new Error(`causal-invariance: NaN reached ${cell[1]} for ${cell[2]} at ${JSON.stringify(state)}, where the arithmetic is finite`);
      cmValues++;
    }
    // and the loud variant's loss really is on screen as NaN, in both modes
    if (!/data-(?:cmcovloss|cmlossmean)="strict-inf"[^>]*>NaN</.test(html))
      throw new Error(`causal-invariance: the -Infinity variant's NaN has to be visible at ${JSON.stringify(state)}`);
    cmValues++;
  }
}

// --- the numbers the lab card promises --------------------------------------------------
// Card fields are looked up by lab id and have no translation tether of their own, so both
// language cards are bound to the arithmetic here (the class v84 opened on chain-carry).
{
  const cardStart = source.indexOf('        id:"causal-invariance",title:');
  if (cardStart < 0) throw new Error("causal-invariance: the lab card is gone");
  const germanCard = source.slice(cardStart, source.indexOf("\n      },", cardStart));
  const enStart = englishSource.indexOf('"causal-invariance": {');
  if (enStart < 0) throw new Error("causal-invariance: the English lab card is gone");
  const englishCard = englishSource.slice(enStart, englishSource.indexOf("\n    },", enStart));
  // The card writes small counts as words, the way the rest of the prose does. Binding the
  // word rather than a digit keeps the tether real: if the arithmetic ever produces a fifth
  // broken variant, the sentence stops matching and has to be rewritten.
  const cmWords = { de: ["null", "ein", "zwei", "drei", "vier", "fünf", "sechs"],
    en: ["zero", "one", "two", "three", "four", "five", "six"] };
  const broken = cmApi.CM_VARIANTS.filter(variant => variant.key !== "correct").length;
  const missed = ["after", "strict-big"].length;
  const lookBetter = cmLooksBetter / cmApi.CM_LENGTHS.length;
  for (const [count, why] of [[broken, "how many broken variants there are"],
    [missed, "how many the named test misses"], [lookBetter, "how many look better on loss"]]) {
    if (!Number.isInteger(count) || count >= cmWords.de.length)
      throw new Error(`causal-invariance: ${why} came out as ${count}, which the card's wording does not cover`);
    for (const [card, label, lang] of [[germanCard, "German", "de"], [englishCard, "English", "en"]])
      if (!card.includes(cmWords[lang][count]))
        throw new Error(`causal-invariance: the ${label} card has to name ${why} as "${cmWords[lang][count]}"`);
    cmValues += 2;
  }
  // The card's own warning, held against the arithmetic rather than against its wording.
  if (cmApi.cmLoss(6, "correct").mean !== Math.max(...cmApi.CM_VARIANTS
    .map(variant => cmApi.cmLoss(6, variant.key)).filter(entry => entry.finite).map(entry => entry.mean)))
    throw new Error("causal-invariance: both cards claim the correct mask carries the highest loss");
}

// --- the English side of the prose carries the same numbers ------------------------------
// `renderer i18n` proves an English entry exists, `english render` proves no German is left.
// Neither looks at the figures inside the English text, so a translated sentence could quote
// a number the app never computes and both stay green.
{
  const labCode = labCodeBlock("causal-invariance");
  const germanStrings = new Set();
  for (const hit of labCode.matchAll(/tr\("((?:[^"\\]|\\.)*)"\)/g)) germanStrings.add(hit[1]);
  for (const hit of labCode.matchAll(/(?:label|note):"((?:[^"\\]|\\.)*)"/g)) germanStrings.add(hit[1]);
  const numerals = text => (text.match(/\d+(?:[.,]\d+)*/g) || []);
  let cmNumericStrings = 0;
  for (const german of germanStrings) {
    if (!/\d/.test(german)) continue;
    const english = pack.ui?.[german];
    if (typeof english !== "string")
      throw new Error(`causal-invariance: the string "${german.slice(0, 60)}" has no English entry`);
    if (/\d{1,3}(?:\.\d{3})+/.test(german))
      throw new Error(`causal-invariance: "${german.slice(0, 60)}" groups thousands, which this comparison does not model`);
    const want = numerals(german).map(token => token.replace(",", ".")).sort();
    const got = numerals(english).sort();
    if (JSON.stringify(want) !== JSON.stringify(got))
      throw new Error(`causal-invariance: the English entry for "${german.slice(0, 50)}" carries ${JSON.stringify(got)} where the German carries ${JSON.stringify(want)}`);
    cmNumericStrings++;
    cmValues += want.length;
  }
  if (cmNumericStrings < 8)
    throw new Error(`causal-invariance: only ${cmNumericStrings} numeric strings found, the extraction is not seeing the lab's prose`);
}

// --- registration: the lab has to be reachable where the reader actually is ---------------
// It answers an A1 question no lecture opens, so it belongs both to the module that carries
// the concept and to the mission whose failure note names the test.
{
  const transformer = base.modules.find(module => module.id === "transformer");
  if (!transformer.labs.includes("causal-invariance"))
    throw new Error("causal-invariance: the transformer module has to offer the lab, or the concept stays read-only");
  if (!transformer.concepts.includes("causal-mask"))
    throw new Error("causal-invariance: the transformer module no longer carries causal-mask, so the placement has to be decided again");
  const mission = base.assignments.find(a => a.id === "a1").missions.find(m => m.id === "attention-lm");
  if (!mission.labs.includes("causal-invariance"))
    throw new Error("causal-invariance: A1's attention-lm mission names the invariance test and has to offer the lab that runs it");
  if (!/kausale Invarianz/.test(mission.failure))
    throw new Error("causal-invariance: the mission's failure note no longer names the test, so the lab has lost its reason to sit there");
  // and it must stay off every lecture page, for the same reason its concept does
  for (const [lectureId, guide] of Object.entries(base.lectureGuides))
    if ((guide.labs || []).includes("causal-invariance"))
      throw new Error(`causal-invariance: ${lectureId} lists the lab, but no lecture PDF teaches causal-mask -- it belongs to the assignment page`);
}
console.log(`causal-invariance OK: ${cmValues} values, A1's own first trace made computable -- the causal-invariance test its mission names catches ${1} of the ${cmApi.CM_VARIANTS.length - 1} wrong masks the concept page lists, passes "masked after softmax" completely (a normalization error, not a causality one) and returns no verdict at all on the -Infinity variant, while the -1e9 twin passes both structural tests and is caught only at full depth -- exactly blind to a p-1 probe in ${cmNarrowBlind} of ${cmWideCaught} probe positions because row 0 alone is broken, and it is broken because softmax(x+c)=softmax(x) hands a fully masked row the unmasked distribution back; and the loss ranks the correct mask last of all ${cmApi.CM_VARIANTS.length} at every length, the leak alone looking ${cmLeakRatio.toFixed(4)}x better; every passing probe reads exactly 0 against a smallest real violation of ${cmMarginLow.toFixed(4)}, so the 1e-9 threshold is a formality rather than a tuned constant`);

// ---- English numerals: every figure a German string prints, the English one prints too ---
// `renderer i18n` proves an English entry exists. `english render` proves no German is left
// on the screen. Neither looks *inside* the English text, so a translated sentence could
// quote a figure the app never computes and both stay green -- and because English is the
// default language, such a number would be shown to the primary reader and to no one else.
// v84 closed that hole for one lab. This closes it for every string that reaches tr().
//
// Comparing decimal numbers across the two locales is the hard part: German writes 13,9178
// where English writes 13.9178, but a comma is also an ordinary list separator inside
// [2,3,5,4] and max(1,2). Rather than guess which role a separator plays, the comparison
// drops separators entirely and matches the *digit runs*. A locale swap leaves those
// identical; a changed, invented, or dropped figure does not. It stays blind to exactly one
// class -- a digit sequence regrouped without changing its digits, such as 1,23 against
// 12,3 -- which is why the numbers a lab's claim rests on also carry their own anchors.
{
  const germanStrings = new Set();
  for (const hit of source.matchAll(/tr\("((?:[^"\\]|\\.)*)"\)/g)) germanStrings.add(hit[1]);
  for (const hit of source.matchAll(/tr\([^)]*?\?"((?:[^"\\]|\\.)*)":"((?:[^"\\]|\\.)*)"\)/g)) {
    germanStrings.add(hit[1]); germanStrings.add(hit[2]);
  }
  const digitRuns = text => (text.match(/\d+/g) || []).slice().sort();
  // Strings with no English entry at all are `renderer i18n`'s business, not this guard's:
  // it already fails on any of them that is not deliberately identical in both languages.
  let numericStrings = 0, comparedRuns = 0, untranslated = 0;
  for (const german of germanStrings) {
    if (!/\d/.test(german)) continue;
    const english = pack.ui?.[german];
    if (typeof english !== "string") { untranslated++; continue; }
    numericStrings++;
    const want = digitRuns(german), got = digitRuns(english);
    if (JSON.stringify(want) !== JSON.stringify(got))
      throw new Error(`english numerals: the entry for "${german.slice(0, 60)}" prints ${JSON.stringify(got)} where the German prints ${JSON.stringify(want)} -- an English reader would be shown a figure the app never computed`);
    comparedRuns += want.length;
  }
  if (numericStrings < 300)
    throw new Error(`english numerals: only ${numericStrings} numeric strings found, the extraction is not seeing the app's prose any more`);
  console.log(`english numerals OK: ${numericStrings} translated strings carry numbers, ${comparedRuns} digit runs identical on both sides (${untranslated} numeric strings are held by renderer i18n instead, having no separate English entry)`);
}

// ---- render coverage: the seven labs that read their sliders from the DOM ------------
// Ten of the eighteen lab guards render their markup and read the numbers back out of it.
// Seven could not. Their stage functions reached for document.getElementById themselves,
// so nothing short of a browser could call them, and the guards under them proved only
// what the lab computes -- never that the computed number reaches the screen.
//
// Every stage function now takes an optional slider binding, read through one helper per
// lab; called without an argument the helper still reads the DOM, which is why not one
// value in this file moved when the seven were converted. Four properties follow, and
// each catches a class of fault the compute guards are blind to:
//
//   1. Every state renders -- and the sandbox holds no `document` at all, so a function
//      that forgot to thread the binding through throws here instead of quietly reading
//      a slider the guard never set.
//   2. The render is a function of the mode and of that mode's own controls, no more and
//      no less. A stage reading the wrong slider id shows up as a control leaking into a
//      mode whose panel hides it; a stage ignoring its own control shows up as a dead
//      one. This is the link between panel and renderer, and neither side can drift alone.
//   3. NaN reaches the screen exactly where the lab's own arithmetic produces one, and
//      nowhere else. advantage-normalizers needs NaN on the screen -- it is the reason
//      the handout requires advantage_eps -- while for the other six a NaN is a bug.
//   4. The number each lab's claim rests on is really on the screen, read back out of the
//      markup at the state that produces it -- the same numbers these guards print.

// Declarations enter the sandbox in source order: only functions hoist, so a const that
// another const reads has to be initialised before it is read.
function declarationStart(name) {
  const constIndex = source.indexOf(`const ${name} =`);
  const functionIndex = source.indexOf(`function ${name}(`);
  const found = [constIndex, functionIndex].filter(index => index >= 0);
  if (!found.length) throw new Error(`render coverage: no declaration for ${name}`);
  return Math.min(...found);
}
// `prose: false` drops every translated string and leaves only what the lab computed --
// the two labs whose prose talks *about* NaN then stop colliding with a NaN that is a value.
function renderApi(names, globals, prose = true) {
  const ordered = [...names].sort((a, b) => declarationStart(a) - declarationStart(b));
  const stubs = `
    const esc = value => String(value ?? "").replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
    const localeCode = () => "en-US";
    const localizedUi = value => ${prose ? "String(value)" : '""'};
${sliceDeclaration(source, "fixedNum")}
`;
  return runInNewContext(`${stubs}${ordered.map(name => sliceDeclaration(source, name)).join("\n")}; ({${ordered.join(",")}})`, globals);
}
// The controls inside one collapsible panel group, by balancing <div> from the element
// that carries the group id. DOM ids are unique -- a separate guard holds that.
function panelGroupControls(group) {
  const marker = source.indexOf(`id="${group}"`);
  if (marker < 0) throw new Error(`render coverage: the panel has no group ${group}`);
  const start = source.lastIndexOf("<div", marker);
  const tags = /<\/?div\b/g;
  tags.lastIndex = start;
  let depth = 0, end = source.length, match;
  while ((match = tags.exec(source))) {
    depth += match[0] === "<div" ? 1 : -1;
    if (!depth) { end = match.index; break; }
  }
  return [...source.slice(start, end).matchAll(/id="(\w+)"/g)].map(hit => hit[1]).filter(id => id !== group);
}

const renderLabs = [
  {
    id: "sft-packing", entry: "spStageMarkup", mode: "spMode", update: "updateSftPacking",
    names: ["SP_TEMPLATES", "SP_CORPORA", "SP_SEQS", "SP_TRIMS", "spTemplateOf", "spCorpusOf",
      "spSeqOf", "spDocuments", "spLossLedger", "spStream", "spPackStats", "SP_HANDOUT",
      "spRuleRow", "spNum", "spPct", "spShare", "spRead",
      "renderSftPackingLoss", "renderSftPackingChunks", "spStageMarkup"],
    options: {
      spMode: ["loss", "pack"], spCorpus: "SP_CORPORA", spTemplate: "SP_TEMPLATES",
      spCorpusB: "SP_CORPORA", spTemplateB: "SP_TEMPLATES", spSeq: "SP_SEQS", spTrim: "SP_TRIMS"
    },
    // Mode A prices one document against the mask and never cuts a block; mode B cuts blocks
    // and never mentions the mask. Each mode carries its own corpus and template control, so a
    // renderer reaching across would show up here as a control leaking into the other panel.
    controls: {
      spCorpus: ["loss"], spTemplate: ["loss"],
      spCorpusB: ["pack"], spTemplateB: ["pack"], spSeq: ["pack"], spTrim: ["pack"]
    },
    // A trimmed single-document stream can produce zero complete blocks, and a zero denominator
    // there would be a division by zero rather than a finding. spShare says so in words instead,
    // which is why no state of this lab may show a NaN.
    nan: () => false,
    anchors: [
      // The finding of mode A, in the concept page's own example: A5's loader puts five sixths
      // of the target positions on template and prompt, and the masked loss the concept page
      // describes would run over 101 of the 633.
      [{ spMode: "loss", spCorpus: "concept", spTemplate: "t32", spCorpusB: "ultra", spTemplateB: "t32", spSeq: "m512", spTrim: "raw" },
        '<strong data-spheadshare="1">532 · 84.0442 %</strong>',
        "the concept page's own example has to print its head share, not merely compute it"],
      [{ spMode: "loss", spCorpus: "concept", spTemplate: "t32", spCorpusB: "ultra", spTemplateB: "t32", spSeq: "m512", spTrim: "raw" },
        '<strong data-spfactor="1">5.2673 ×</strong>',
        "and the ratio beside it, which is the entire argument for the mask"],
      [{ spMode: "loss", spCorpus: "concept", spTemplate: "t32", spCorpusB: "ultra", spTemplateB: "t32", spSeq: "m512", spTrim: "raw" },
        '<strong data-spmasked="1">101</strong>',
        "the masked alternative has to stand next to it as a number, or the comparison is prose"],
      // The structural half of mode A: no field, and no token marking the boundary a mask needs.
      [{ spMode: "loss", spCorpus: "concept", spTemplate: "t32", spCorpusB: "ultra", spTemplateB: "t32", spSeq: "m512", spTrim: "raw" },
        '<strong data-spmaskfield="1">keines</strong>',
        "the reason there is no mask is a missing field, and the ledger has to say so"],
      // The share is a property of the corpus, not of the method -- a second corpus proves it.
      [{ spMode: "loss", spCorpus: "ultra", spTemplate: "t32", spCorpusB: "ultra", spTemplateB: "t32", spSeq: "m512", spTrim: "raw" },
        '<strong data-spheadshare="1">1996 · 41.1207 %</strong>',
        "a corpus with longer responses has to move the head share, or it would read as a constant"],
      // Mode B: the handout's own example cannot tell the two length rules apart.
      [{ spMode: "pack", spCorpus: "concept", spTemplate: "t32", spCorpusB: "ultra", spTemplateB: "t32", spSeq: "m512", spTrim: "raw" },
        '<strong data-sphandoutnaive="1">2</strong>',
        "the handout's example under the naive rule"],
      [{ spMode: "pack", spCorpus: "concept", spTemplate: "t32", spCorpusB: "ultra", spTemplateB: "t32", spSeq: "m512", spTrim: "raw" },
        '<strong data-sphandoutcorrect="1">2</strong>',
        "and under the correct one -- the same number, which is why the example settles nothing"],
      // The trim control is the whole point of mode B: it turns an invisible bug visible.
      [{ spMode: "pack", spCorpus: "concept", spTemplate: "t32", spCorpusB: "ultra", spTemplateB: "t32", spSeq: "m512", spTrim: "raw" },
        '<td data-spraw="ultra-m512">9 / 9 · ✓</td>',
        "untrimmed, the two rules agree and the table has to show them agreeing"],
      [{ spMode: "pack", spCorpus: "concept", spTemplate: "t32", spCorpusB: "ultra", spTemplateB: "t32", spSeq: "m512", spTrim: "raw" },
        '<td data-spcut="ultra-m512">9 / 8 · ✗</td>',
        "and trimmed they part -- both halves of the row, or the finding is half read"],
      [{ spMode: "pack", spCorpus: "concept", spTemplate: "t32", spCorpusB: "ultra", spTemplateB: "t32", spSeq: "m512", spTrim: "cut" },
        '<strong data-sprulediffers="1">ja — der letzte Block der naiven Regel bräuchte Token n, und den gibt es nicht</strong>',
        "the verdict line has to follow the trim control, not only the table"],
      // The three context classes at the length A5 recommends, all three read back: they sum to
      // the target positions, and the third is the smallest.
      [{ spMode: "pack", spCorpus: "concept", spTemplate: "t32", spCorpusB: "ultra", spTemplateB: "t32", spSeq: "m512", spTrim: "raw" },
        '<strong data-spforeign="1">2220 · 48.1771 %</strong>',
        "at m = 512 nearly half the targets carry a foreign document in their context"],
      [{ spMode: "pack", spCorpus: "concept", spTemplate: "t32", spCorpusB: "ultra", spTemplateB: "t32", spSeq: "m512", spTrim: "raw" },
        '<strong data-spheadless="1">1876 · 40.7118 %</strong>',
        "and the second class beside it, or the trade-off has only one side on screen"],
      [{ spMode: "pack", spCorpus: "concept", spTemplate: "t32", spCorpusB: "ultra", spTemplateB: "t32", spSeq: "m512", spTrim: "raw" },
        '<strong data-spclean="1">512 · 11.1111 %</strong>',
        "the third class is the one the whole mode is about and has to be printed, not implied"],
      // The trade-off itself: shortening the block moves the two classes in opposite directions.
      [{ spMode: "pack", spCorpus: "concept", spTemplate: "t32", spCorpusB: "ultra", spTemplateB: "t32", spSeq: "m512", spTrim: "raw" },
        '<td data-sptradeforeign="m64">4.9167 %</td>',
        "short blocks buy their way out of foreign context"],
      [{ spMode: "pack", spCorpus: "concept", spTemplate: "t32", spCorpusB: "ultra", spTemplateB: "t32", spSeq: "m512", spTrim: "raw" },
        '<td data-sptradeheadless="m64">92.4167 %</td>',
        "and pay for it in the next column -- both cells of the row, or the trade is invisible"]
    ]
  },
  {
    id: "mask-pii", entry: "piiStageMarkup", mode: "piiMode", update: "updateMaskPii",
    names: ["PII_MARKED", "PII_KINDS", "PII_MARKS", "PII_VARIANTS", "PII_SETTINGS",
      "piiKindOf", "piiVariantOf", "piiSettingOf", "piiDocs", "piiSpans", "piiScore",
      "piiLedger", "piiCountTrap", "piiRead", "piiStageMarkup"],
    options: {
      piiMode: ["detect", "cost"], piiKind: "PII_KINDS",
      piiVariant: ["strict", "loose", "digits", "naive", "ranged"], piiSetting: "PII_SETTINGS"
    },
    // The variant select is rebuilt from the kind, so a variant key that does not belong to
    // the selected kind falls back to that kind's first pattern -- which is why piiVariant is
    // declared as moving mode A rather than as moving nothing.
    controls: {
      piiKind: ["detect"], piiVariant: ["detect"], piiSetting: ["cost"]
    },
    nan: () => false,
    anchors: [
      // The finding: the range check strikes one false alarm and cannot strike the other.
      [{ piiMode: "detect", piiKind: "ip", piiVariant: "naive", piiSetting: "strict" },
        '<strong data-piipr="naive">66.6667 % · 100.0000 %</strong>',
        "the naive dotted quad loses a third of its precision to two false alarms"],
      [{ piiMode: "detect", piiKind: "ip", piiVariant: "ranged", piiSetting: "strict" },
        '<strong data-piipr="ranged">80.0000 % · 100.0000 %</strong>',
        "and the obvious repair buys back only one of the two, at unchanged recall"],
      // The span, not the find: the same address is a false positive and a miss at once.
      [{ piiMode: "detect", piiKind: "email", piiVariant: "loose", piiSetting: "strict" },
        '<strong data-piipr="loose">33.3333 % · 33.3333 %</strong>',
        "a pattern that finds every address and passes no test has to say so in both numbers"],
      [{ piiMode: "detect", piiKind: "email", piiVariant: "strict", piiSetting: "strict" },
        '<strong data-piipr="strict">100.0000 % · 100.0000 %</strong>',
        "while the tighter one costs nothing at all -- the reader has to be able to see that"],
      // Mode B: redaction makes the corpus grow, and masking less destroys more.
      [{ piiMode: "cost", piiKind: "email", piiVariant: "strict", piiSetting: "strict" },
        '<strong data-piitrap="1">12 · 0</strong>',
        "counting after the replacement is the implementation trap and belongs on the screen"],
      [{ piiMode: "cost", piiKind: "email", piiVariant: "strict", piiSetting: "loose" },
        '<strong data-piidestroyed="1">34 Zeichen</strong>',
        "the loose setting destroys more legitimate text than the tight one"],
      [{ piiMode: "cost", piiKind: "email", piiVariant: "strict", piiSetting: "strict" },
        '<strong data-piidestroyed="1">19 Zeichen</strong>',
        "and the tight setting beside it has to print the smaller number, or the claim is unreadable"]
    ]
  },
  {
    id: "target-shift", entry: "tsStageMarkup", mode: "tsMode", update: "updateTargetShift",
    names: ["TS_CORPORA", "TS_RULES", "TS_SIZES", "TS_BLOCKS", "TS_DRAWS", "tsCorpusOf",
      "tsRuleOf", "tsSizeOf", "tsBlockOf", "tsDrawsOf", "tsPairs", "tsFit", "tsLoss",
      "tsDeterministic", "tsGenerate", "tsRepeatShare", "tsRow", "tsBounds", "tsMissShare",
      "tsRead", "tsStageMarkup"],
    options: {
      tsMode: ["rules", "bounds"], tsCorpus: "TS_CORPORA", tsRule: "TS_RULES",
      tsSize: "TS_SIZES", tsBlock: "TS_BLOCKS", tsDraws: "TS_DRAWS"
    },
    // Mode A knows nothing about shard sizes and mode B nothing about the pairing rule.
    // A control leaking across the two would let the index arithmetic depend on which text
    // the reader happened to leave selected.
    controls: {
      tsCorpus: ["rules"], tsRule: ["rules"],
      tsSize: ["bounds"], tsBlock: ["bounds"], tsDraws: ["bounds"]
    },
    // One NaN is real and on screen: the backward rule on the doubling corpus has no context
    // for its own seed token, so the repetition share of an empty generation is undefined.
    // The lab prints that in words rather than as NaN, so no state may show a bare NaN.
    nan: () => false,
    anchors: [
      // The finding itself: the rule that learns nothing prints the best loss on the screen.
      [{ tsMode: "rules", tsCorpus: "mixed", tsRule: "next", tsSize: "n10k", tsBlock: "m256", tsDraws: "d1000" },
        '<strong data-tsrule="same">0.000000 · 0.440664 · 4/4 · 0, 0, 0, 0, 0, 0, 0, 0</strong>',
        "the zero loss and the constant generation have to stand in the same row, or the row proves nothing"],
      [{ tsMode: "rules", tsCorpus: "mixed", tsRule: "next", tsSize: "n10k", tsBlock: "m256", tsDraws: "d1000" },
        '<strong data-tsrule="next">0.440664 · — · 1/4 · 1, 2, 3, 1, 2, 3, 1, 2</strong>',
        "and the correct rule beside it has to print a loss above zero"],
      // The quiet rule: close enough to the correct one that a loss curve does not separate them.
      [{ tsMode: "rules", tsCorpus: "mixed", tsRule: "prev", tsSize: "n10k", tsBlock: "m256", tsDraws: "d1000" },
        '<strong data-tsrule="prev">0.466802 · 0.026138 · 1/4 · 2, 1, 0, 2, 1, 0, 2, 1</strong>',
        "the backward shift's loss is the lab's second claim and has to be readable, not merely computed"],
      // The repetition share, in the state that makes the point.
      [{ tsMode: "rules", tsCorpus: "mixed", tsRule: "same", tsSize: "n10k", tsBlock: "m256", tsDraws: "d1000" },
        '<strong data-tsrepeat="1">100.0000 %</strong>',
        "a loss of zero without the repetition beside it is only half the finding"],
      // The gap column: the second claim rests on this number, and until v99 it stood only in
      // the prose. On the doubling corpus the skip rule is the one that hides.
      [{ tsMode: "rules", tsCorpus: "rep", tsRule: "next", tsSize: "n10k", tsBlock: "m256", tsDraws: "d1000" },
        '<strong data-tsrule="skip">0.606843 · 0.001330 · 3/4 · 1, 1, 1, 1, 1, 1, 1, 1</strong>',
        "the gap the prose quotes has to be the gap the row prints, in the text where it is smallest"],
      // Mode B: exactly one broken start, and the miss share the transfer answer quotes.
      [{ tsMode: "bounds", tsCorpus: "mixed", tsRule: "next", tsSize: "n10k", tsBlock: "m256", tsDraws: "d1000" },
        '<strong data-tsbroken="1">1</strong>',
        "the whole index argument rests on this being one, so it has to be on the screen"],
      [{ tsMode: "bounds", tsCorpus: "mixed", tsRule: "next", tsSize: "n10k", tsBlock: "m256", tsDraws: "d1000" },
        '<strong data-tsmiss="1">90.2468 %</strong>',
        "the figure the transfer answer quotes has to be the figure the panel prints"],
      [{ tsMode: "bounds", tsCorpus: "mixed", tsRule: "next", tsSize: "n100k", tsBlock: "m256", tsDraws: "d1000" },
        '<strong data-tsmiss="1">99.0024 %</strong>',
        "and the larger shard has to print the worse number, which is the counterintuitive half"]
    ]
  },
  {
    id: "causal-invariance", entry: "cmStageMarkup", mode: "cmMode", update: "updateCausalInvariance",
    names: ["CM_VOCAB", "CM_HEAD_DIM", "CM_LOGIT_SCALE", "CM_SENTINEL", "CM_SEQUENCE",
      "CM_LENGTHS", "CM_VARIANTS", "CM_DEPTHS", "cmLengthOf", "cmVariantOf", "cmDepthOf",
      "cmTokens", "cmQK", "cmRawScores", "cmAllowed", "cmSoftmax", "cmAttention", "cmMass",
      "cmLoss", "cmRowSumDeviation", "cmNaNCount", "cmInvariance", "cmUnmaskedGap",
      "cmCoverage", "cmProbeSweep", "cmNum", "cmSci", "cmRead",
      "renderCausalInvarianceTests", "renderCausalInvarianceLoss", "cmStageMarkup"],
    options: {
      cmMode: ["tests", "loss"], cmVariant: "CM_VARIANTS", cmLength: "CM_LENGTHS",
      cmProbe: ["1", "2", "3", "4", "5"], cmDepth: "CM_DEPTHS", cmLossLength: "CM_LENGTHS"
    },
    // Mode A probes one implementation; mode B prices all five and has no probe at all.
    // Nothing mode A sets may reach the loss table, or the ranking would quietly depend on
    // the variant the reader happened to leave selected.
    controls: {
      cmVariant: ["tests"], cmLength: ["tests"], cmProbe: ["tests"], cmDepth: ["tests"],
      cmLossLength: ["loss"]
    },
    // NaN is a value in this lab, not a fault, and it is on screen in *every* state: both
    // modes carry a table listing all five variants, and the -Infinity variant's loss is a
    // NaN by construction -- that is the lab's argument for the loud sentinel. A blanket
    // `true` would make this property vacuous, so the guard block below pins down the other
    // half instead: which cells are allowed to hold it, and that no other cell does.
    nan: () => true,
    anchors: [
      // The finding, read back off the screen: the silent variant is caught at full depth
      // and reports exactly nothing to a p-1 probe at the same position.
      [{ cmMode: "tests", cmVariant: "strict-big", cmLength: "t6", cmProbe: "5", cmDepth: "prev", cmLossLength: "t6" },
        '<td data-cmsweepprev="5">0.00e+0 ✓</td>',
        "the narrow probe has to print its own blindness, not merely have it"],
      [{ cmMode: "tests", cmVariant: "strict-big", cmLength: "t6", cmProbe: "5", cmDepth: "prev", cmLossLength: "t6" },
        '<td data-cmsweepall="5">1.67e-1 ✗</td>',
        "and the full-depth probe beside it has to show the violation the narrow one missed"],
      // The two structural tests pass for that variant, which is what makes it silent.
      [{ cmMode: "tests", cmVariant: "strict-big", cmLength: "t6", cmProbe: "5", cmDepth: "all", cmLossLength: "t6" },
        '<td data-cmcovsum="strict-big">✓</td>',
        "a silent variant that failed a visible test would not be silent"],
      [{ cmMode: "tests", cmVariant: "strict-big", cmLength: "t6", cmProbe: "5", cmDepth: "all", cmLossLength: "t6" },
        '<td data-cmcovnan="strict-big">✓</td>',
        "and it has to reach the screen as a pass on finiteness too"],
      // Masking after softmax: the other one the named test misses, and the row that proves
      // the invariance column and the row-sum column are read together rather than in turn.
      [{ cmMode: "tests", cmVariant: "after", cmLength: "t6", cmProbe: "5", cmDepth: "all", cmLossLength: "t6" },
        '<td data-cmcovinv="after">✓</td>',
        "the test A1 names passes a wrong implementation, and the screen has to say so"],
      [{ cmMode: "tests", cmVariant: "after", cmLength: "t6", cmProbe: "5", cmDepth: "all", cmLossLength: "t6" },
        '<td data-cmcovsum="after">✗</td>',
        "while the row sum beside it fails -- one cell without the other teaches the wrong rule"],
      // The -Infinity twin: no verdict, not a pass. The distinction is the honest part.
      [{ cmMode: "tests", cmVariant: "strict-inf", cmLength: "t6", cmProbe: "5", cmDepth: "all", cmLossLength: "t6" },
        '<td data-cmcovinv="strict-inf">—</td>',
        "a NaN model cannot be probed, and printing a pass there would be the worse lie"],
      // Row 0 under the finite sentinel really is the unmasked row, on screen.
      [{ cmMode: "tests", cmVariant: "strict-big", cmLength: "t6", cmProbe: "5", cmDepth: "all", cmLossLength: "t6" },
        '<strong data-cmsilentgap="1">1.43e-8</strong>',
        "the gap to the unmasked row is the whole derivation and has to be legible"],
      // Mode B's headline: the correct mask last, and the leak far ahead.
      [{ cmMode: "loss", cmVariant: "correct", cmLength: "t6", cmProbe: "5", cmDepth: "all", cmLossLength: "t6" },
        '<td data-cmlossmean="correct">3.307207</td>',
        "the number the warning rests on has to be on the screen, not only in the guard"],
      [{ cmMode: "loss", cmVariant: "correct", cmLength: "t6", cmProbe: "5", cmDepth: "all", cmLossLength: "t6" },
        '<td data-cmlossmean="flipped">1.492323</td>',
        "and the leaking mask's loss beside it, or 'looks better' is a claim without a figure"],
      [{ cmMode: "loss", cmVariant: "correct", cmLength: "t6", cmProbe: "5", cmDepth: "all", cmLossLength: "t6" },
        '<td data-cmlossbetter="flipped">ja</td>',
        "the verdict column is a selection, which is where a true number can carry a lying label"],
      [{ cmMode: "loss", cmVariant: "correct", cmLength: "t6", cmProbe: "5", cmDepth: "all", cmLossLength: "t6" },
        '<td data-cmlossbetter="after">ja</td>',
        "and the second one the named test misses looks better too"]
    ]
  },
  {
    id: "run-plan", entry: "rpStageMarkup", mode: "rpMode", update: "updateRunPlan",
    names: ["RP_LOSS_E", "RP_LOSS_A", "RP_ALPHA", "RP_LOSS_B", "RP_BETA", "rpLoss",
      "RP_N_COEFF", "RP_N_EXPONENT", "rpOptimalN", "rpFrontierLoss", "RP_FIT_SECONDS",
      "RP_TARGET_SECONDS", "RP_THROUGHPUT", "RP_FIT_FLOPS", "RP_TARGET_FLOPS",
      "RP_PRIOR_RATIO", "rpPriorN", "RP_SPANS", "RP_TIERS", "RP_PER_TIER", "RP_STEPS",
      "rpSpan", "rpTiersOf", "rpPerTier", "rpStep", "rpLadder", "rpFit", "rpWasteFactor",
      "rpPlan", "RP_FACTORS", "rpFactor", "RP_WASTE_LEVELS", "rpBandEdge", "rpInt", "rpSci",
      "rpPct", "rpSigned", "rpRead", "renderRunPlanLadder", "renderRunPlanTolerance",
      "rpStageMarkup"],
    options: {
      rpMode: ["ladder", "tolerance"], rpSpan: "RP_SPANS", rpTiers: "RP_TIERS",
      rpPer: "RP_PER_TIER", rpStep: "RP_STEPS", rpFactor: "RP_FACTORS"
    },
    // Mode A buys a plan and reads what it was worth; mode B prices a deviation without
    // any plan at all. Nothing the plan sets may reach the tolerance table, or the claim
    // that the price is scale-free would quietly depend on the ladder.
    controls: {
      rpSpan: ["ladder"], rpTiers: ["ladder"], rpPer: ["ladder"], rpStep: ["ladder"],
      rpFactor: ["tolerance"]
    },
    anchors: [
      // The whole lab rests on every plan costing the same. Two plans as different as the
      // grid allows have to print the identical second count, and it has to be on screen.
      [{ rpMode: "ladder", rpSpan: "s64", rpTiers: "t4", rpPer: "p5", rpStep: "g110", rpFactor: "f200" },
        '<strong data-rpcost="1">4 × 5 Runs = 43,200.0000 s</strong>',
        "the budget line is what makes the comparison fair and has to be read, not assumed"],
      [{ rpMode: "ladder", rpSpan: "s4", rpTiers: "t6", rpPer: "p7", rpStep: "g125", rpFactor: "f200" },
        '<strong data-rpcost="1">6 × 7 Runs = 43,200.0000 s</strong>',
        "and the worst plan in the lab has to print the same cost as the best one"],
      // Mode A's fitted exponent, at the setting the lab's own observe text names.
      [{ rpMode: "ladder", rpSpan: "s64", rpTiers: "t4", rpPer: "p5", rpStep: "g110", rpFactor: "f200" },
        '<strong data-rpslope="1">a = 0.451874</strong>',
        "a grid fine enough to change its mind recovers the truth, and the number has to reach the screen"],
      [{ rpMode: "ladder", rpSpan: "s64", rpTiers: "t4", rpPer: "p5", rpStep: "g110", rpFactor: "f200" },
        '<td data-rppick="1">1</td>',
        "and it recovers it because the chosen index travels across the tiers"],
      // Mutation testing found this one: the measured column could print the truth instead,
      // and every other anchor still held -- while the grid error beside it kept reporting a
      // deviation the table no longer showed. The measurement and its error are read back
      // together, in a state where the two numbers are far apart.
      [{ rpMode: "ladder", rpSpan: "s64", rpTiers: "t4", rpPer: "p5", rpStep: "g110", rpFactor: "f200" },
        '<td data-rpmeasured="2">9.6212e+7</td>',
        "the measured column has to hold the grid point the tier actually picked"],
      [{ rpMode: "ladder", rpSpan: "s64", rpTiers: "t4", rpPer: "p5", rpStep: "g110", rpFactor: "f200" },
        '<td data-rprowdev="2">−4.15 %</td>',
        "and its error column has to be that same point measured against the truth beside it"],
      [{ rpMode: "ladder", rpSpan: "s64", rpTiers: "t4", rpPer: "p5", rpStep: "g160", rpFactor: "f200" },
        '<td data-rpmeasured="3">2.3283e+8</td>',
        "a locked grid measures the prior itself, and the number on screen has to show that"],
      [{ rpMode: "ladder", rpSpan: "s64", rpTiers: "t4", rpPer: "p5", rpStep: "g160", rpFactor: "f200" },
        '<td data-rprowdev="3">+24.03 %</td>',
        "24 % off in the top tier, which is what a fit of exactly 0.5 is built out of"],
      // The same plan with a coarser grid: the index locks and the fit becomes the prior.
      // Both halves are anchored, because the exponent alone could move for other reasons.
      [{ rpMode: "ladder", rpSpan: "s64", rpTiers: "t4", rpPer: "p5", rpStep: "g160", rpFactor: "f200" },
        '<strong data-rpslope="1">a = 0.500000</strong>',
        "one step coarser and the same ladder returns the prior's exponent"],
      [{ rpMode: "ladder", rpSpan: "s64", rpTiers: "t4", rpPer: "p5", rpStep: "g160", rpFactor: "f200" },
        '<td data-rppick="3">2</td>',
        "because every tier now picks the same grid index"],
      [{ rpMode: "ladder", rpSpan: "s64", rpTiers: "t4", rpPer: "p5", rpStep: "g160", rpFactor: "f200" },
        "Dieser Plan hat deinen Prior zurückgegeben, nicht die Daten.",
        "and the verdict has to say so, or the reader sees a clean fit and no warning"],
      [{ rpMode: "ladder", rpSpan: "s64", rpTiers: "t4", rpPer: "p5", rpStep: "g110", rpFactor: "f200" },
        "Dieses Raster hat sich unterwegs umentschieden",
        "the verdict has to follow the grid, not the mode"],
      // An edge minimum is what scaling-fit warns about; here it has to be visible in the
      // row it happened in, not only in the explaining paragraph.
      [{ rpMode: "ladder", rpSpan: "s4", rpTiers: "t6", rpPer: "p3", rpStep: "g125", rpFactor: "f200" },
        '<td data-rppick="5">0 ⚠</td>',
        "a minimum on the boundary of the grid has to be marked in its own row"],
      // What the plan was worth, in both currencies, at the two ends of the range.
      [{ rpMode: "ladder", rpSpan: "s4", rpTiers: "t6", rpPer: "p7", rpStep: "g125", rpFactor: "f200" },
        '<strong data-rpwaste="1">15.6024 %</strong>',
        "the worst plan's price is the number the lever paragraph names"],
      [{ rpMode: "ladder", rpSpan: "s64", rpTiers: "t3", rpPer: "p7", rpStep: "g125", rpFactor: "f200" },
        '<strong data-rpdev="1">1.0022 × · +0.22 %</strong>',
        "and the best plan's deviation is the other end of that same range"],
      // Mode B: the price table and the band, both scale-free numbers.
      [{ rpMode: "tolerance", rpSpan: "s64", rpTiers: "t4", rpPer: "p5", rpStep: "g110", rpFactor: "f200" },
        '<td data-rptolshare="f200">13.5679 %</td>',
        "twice the optimal size costs 13.5679 % of the run"],
      [{ rpMode: "tolerance", rpSpan: "s64", rpTiers: "t4", rpPer: "p5", rpStep: "g110", rpFactor: "f200" },
        '<td data-rptolshare="f050">13.9178 %</td>',
        "and half of it costs 13.9178 %, which is the whole asymmetry paragraph on one line"],
      [{ rpMode: "tolerance", rpSpan: "s64", rpTiers: "t4", rpPer: "p5", rpStep: "g110", rpFactor: "f200" },
        '<td data-rpband="0.01">0.8355 × bis 1.1977 ×</td>',
        "the one-percent band is the accuracy the assignment actually demands"],
      [{ rpMode: "tolerance", rpSpan: "s64", rpTiers: "t4", rpPer: "p5", rpStep: "g110", rpFactor: "f050" },
        '<strong data-rptolwaste="1">13.9178 %</strong>',
        "and the chosen row has to reach the ledger above the table"]
    ]
  },
  {
    id: "chain-carry", entry: "ccStageMarkup", mode: "ccMode", update: "updateChainCarry",
    names: ["RP_LOSS_E", "RP_LOSS_A", "RP_ALPHA", "RP_LOSS_B", "RP_BETA", "rpLoss",
      "RP_N_COEFF", "RP_N_EXPONENT", "rpOptimalN", "rpFrontierLoss", "RP_FIT_SECONDS",
      "RP_TARGET_SECONDS", "RP_THROUGHPUT", "RP_FIT_FLOPS", "RP_TARGET_FLOPS",
      "RP_PRIOR_RATIO", "rpPriorN", "RP_SPANS", "RP_TIERS", "RP_PER_TIER", "RP_STEPS",
      "rpSpan", "rpTiersOf", "rpPerTier", "rpStep", "rpLadder", "rpFit", "rpWasteFactor",
      "rpPlan", "TC_HANDOUT_N", "TC_RHOS", "TC_HEAD_DIMS", "tcRho", "tcHeadDim",
      "tcContinuousShape", "tcCandidates", "CC_PLANS", "CC_RULES", "ccPlanOf", "ccRuleOf",
      "ccTruth", "ccCorners", "ccPickCorner", "ccChain", "CC_SWEEP_CACHE", "ccSweepData",
      "ccInt", "ccSci", "ccPct", "ccSigned", "ccRead", "renderChainCarryChain",
      "renderChainCarrySweep", "ccStageMarkup"],
    options: {
      ccMode: ["chain", "sweep"], ccPlan: "CC_PLANS", ccRho: "TC_RHOS",
      ccHead: "TC_HEAD_DIMS", ccRule: "CC_RULES", ccSweepRule: "CC_RULES"
    },
    // Mode A follows one plan through to one submitted number; mode B sweeps every plan
    // against every shape and compares the four rules. Nothing the single chain sets may
    // reach the sweep, or the claim that the sweep ranks the rules would depend on which
    // chain happened to be on screen.
    controls: {
      ccPlan: ["chain"], ccRho: ["chain"], ccHead: ["chain"], ccRule: ["chain"],
      ccSweepRule: ["sweep"]
    },
    anchors: [
      // The whole lab rests on the two factors multiplying. This one string carries f1,
      // f2 and their product together, so a renderer that composed them any other way --
      // adding them, dropping one, using N_pred where N_final belongs -- changes it.
      [{ ccMode: "chain", ccPlan: "worst", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        '<strong data-cctotal="1">0.478316 × 1.009748 = 0.482978 ×</strong>',
        "the plan factor, the grid factor and their product have to be on screen together"],
      // Waste is not the sum of the two reported wastes, and on the worst plan it is not
      // even above the plan's own. Both halves are read back in the same state, because
      // either number alone proves nothing about the relation between them.
      [{ ccMode: "chain", ccPlan: "worst", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        '<strong data-ccplanwaste="1">15.6024 %</strong>',
        "run-plan's own number for this plan has to be the one this lab shows"],
      [{ ccMode: "chain", ccPlan: "worst", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        '<strong data-ccwaste="2">15.2279 %</strong>',
        "and the real waste has to fall below it -- the grid took part of the plan error back"],
      [{ ccMode: "chain", ccPlan: "worst", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        '<strong data-ccadded="1">15.6054 %</strong>',
        "while the sum a reader would form from two separate labs is a third, larger number"],
      // The other end of the same claim: a plan whose own error is negligible, where the
      // grid is the entire error rather than a correction to it.
      [{ ccMode: "chain", ccPlan: "best", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        '<strong data-ccplanwaste="1">0.0002 %</strong>',
        "the best plan's own error is three ten-thousandths of the run"],
      [{ ccMode: "chain", ccPlan: "best", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        '<strong data-ccwaste="2">0.0191 %</strong>',
        "and the grid alone multiplies it by roughly ninety -- the dominance has flipped"],
      // The corner the rule picks, read back as an identity and not only as a number:
      // width and layers together pin which row of the table was selected.
      [{ ccMode: "chain", ccPlan: "worst", ccRho: "r128", ccHead: "h64", ccRule: "up", ccSweepRule: "diag" },
        '<strong data-ccfinal="1">N_final = 431,947,776 · d_model = 1,664 · n_layer = 13</strong>',
        "rounding up on the worst plan has to land on the furthest corner"],
      [{ ccMode: "chain", ccPlan: "worst", ccRho: "r128", ccHead: "h64", ccRule: "up", ccSweepRule: "diag" },
        '<strong data-ccwaste="1">12.2680 %</strong>',
        "and that corner is the cheapest of the four, three points below the nearest one"],
      // The diagnostic rule: it has to move on a grid-locked plan and stand still on a
      // measuring one. Both directions are anchored, or a rule that ignores the diagnosis
      // and a rule that always rounds down would be indistinguishable here.
      [{ ccMode: "chain", ccPlan: "locked", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        '<strong data-ccwaste="1">4.3934 %</strong>',
        "the nearest corner on a grid-locked plan rounds around an already inflated N_pred"],
      [{ ccMode: "chain", ccPlan: "locked", ccRho: "r128", ccHead: "h64", ccRule: "diag", ccSweepRule: "diag" },
        '<strong data-ccfinal="1">N_final = 1,146,617,856 · d_model = 2,304 · n_layer = 18</strong>',
        "and the diagnostic rule has to take the lower corner there"],
      [{ ccMode: "chain", ccPlan: "locked", ccRho: "r128", ccHead: "h64", ccRule: "diag", ccSweepRule: "diag" },
        '<strong data-ccwaste="1">3.2639 %</strong>',
        "which buys 1.13 points of the run for reading a number that is already on screen"],
      [{ ccMode: "chain", ccPlan: "best", ccRho: "r128", ccHead: "h64", ccRule: "diag", ccSweepRule: "diag" },
        '<strong data-ccfinal="1">N_final = 805,306,368 · d_model = 2,048 · n_layer = 16</strong>',
        "on a measuring plan the same rule has to fall back to the nearest corner"],
      // The verdict follows the gap to the cheapest corner, not the mode or the plan.
      [{ ccMode: "chain", ccPlan: "locked", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        "Diese Regel lässt hier etwas liegen.",
        "a rule that misses the cheapest corner has to say so"],
      [{ ccMode: "chain", ccPlan: "locked", ccRho: "r128", ccHead: "h64", ccRule: "diag", ccSweepRule: "diag" },
        "Diese Regel trifft hier die billigste Ecke.",
        "and the same lab has to change that verdict when the rule does hit it"],
      // The grid-locked explanation is the lab's recommendation; it has to follow the
      // plan's diagnosis, not the rounding rule the reader happens to have selected.
      [{ ccMode: "chain", ccPlan: "locked", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        "Dieser Plan ist rasterfest",
        "the grid-locked reading has to appear on the grid-locked plan"],
      [{ ccMode: "chain", ccPlan: "best", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        "Dieser Plan hat wirklich gemessen",
        "and the measuring reading on the measuring one"],
      // Mode B: the ranking of the four rules, and the one column the recommendation
      // rests on -- how often each rule is worse than the nearest corner.
      // Mutation testing found these two: the grid column could print the total and the
      // total column the grid, and every ledger anchor still held -- the table would then
      // have shown a corner 2 % from N_pred sitting 52 % from the truth, in the same cell.
      // Two dependent cells of one row have to be read back together, in a state where the
      // two numbers are far apart, or neither proves the relation between them.
      [{ ccMode: "chain", ccPlan: "worst", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        '<td data-ccrowgrid="1664-12">1.009748 ×</td><td data-ccrowtotal="1664-12">0.482978 ×</td>',
        "the grid factor and the total factor of one row have to be that row's two numbers"],
      [{ ccMode: "chain", ccPlan: "worst", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        '<td data-ccrowgrid="1664-13">1.093894 ×</td><td data-ccrowtotal="1664-13">0.523226 ×</td><td data-ccrowwaste="1664-13">12.2680 % ◀</td>',
        "and on the cheapest row all three have to agree, marker included"],
      [{ ccMode: "chain", ccPlan: "locked", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        '<td data-ccrowgrid="2304-18">0.955515 ×</td><td data-ccrowtotal="2304-18">1.388920 ×</td>',
        "a grid factor below one against a total above one is the composition in one row"],
      [{ ccMode: "sweep", ccPlan: "best", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        '<strong data-ccsweepn="1">648</strong>',
        "the sweep has to cover every plan against every shape"],
      [{ ccMode: "sweep", ccPlan: "best", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        '<strong data-ccsweepcmp="1">309 besser · 339 gleich · 0 schlechter</strong>',
        "the diagnostic rule is strictly better -- never worse is the claim, and it is a count"],
      [{ ccMode: "sweep", ccPlan: "best", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        '<td data-ccruleworse="down">196</td>',
        "while always rounding down is worse in 196 of them"],
      [{ ccMode: "sweep", ccPlan: "best", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        '<td data-ccruleworse="up">449</td>',
        "and always rounding up in 449 -- the two blanket rules are not free"],
      [{ ccMode: "sweep", ccPlan: "best", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        '<td data-ccruleworst="down">25.8705 %</td>',
        "rounding down also owns the worst single case in the lab"],
      [{ ccMode: "sweep", ccPlan: "best", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        '<td data-ccrulemean="diag">2.2232 %</td>',
        "and the diagnostic rule owns the lowest mean"],
      // Why the diagnosis knows anything: the grid-locked cases all point one way. The
      // degenerate part of that is printed beside it rather than left implicit.
      [{ ccMode: "sweep", ccPlan: "best", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        '<strong data-cclockedhigh="1">378 von 378</strong>',
        "every grid-locked combination overestimates -- that is what makes the rule safe"],
      [{ ccMode: "sweep", ccPlan: "best", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        '<strong data-ccfreehigh="1">78 von 270</strong>',
        "and the measuring ones do not, so no blanket direction is available there"],
      [{ ccMode: "sweep", ccPlan: "best", ccRho: "r128", ccHead: "h64", ccRule: "near", ccSweepRule: "diag" },
        '<strong data-cclockeddistinct="1">3</strong>',
        "the 378 collapse onto 3 distinct predictions, and the lab has to print that itself"]
    ],
    forbid: [
      // The measuring plan must not be rounded down by the diagnostic rule; anchoring the
      // corner it does take leaves open that the low corner is printed somewhere too.
      [{ ccMode: "chain", ccPlan: "best", ccRho: "r128", ccHead: "h64", ccRule: "diag", ccSweepRule: "diag" },
        '<strong data-ccfinal="1">N_final = 761,266,176',
        "the diagnostic rule must not round a measuring plan down"]
    ]
  },
  {
    id: "target-config", entry: "tcStageMarkup", mode: "tcMode", update: "updateTargetConfig",
    names: ["TC_TARGET_SECONDS", "TC_HANDOUT_N", "TC_SEQ_LEN", "TC_BATCH", "TC_TOKENS_PER_STEP",
      "TC_CHINCHILLA_RATIO", "TC_TARGETS", "TC_RHOS", "TC_HEAD_DIMS", "tcTarget", "tcRho",
      "tcHeadDim", "tcContinuousShape", "tcCandidates", "tcHeadDivisors", "TC_THROUGHPUTS",
      "TC_PICK_TARGET", "TC_PICKS", "TC_RULES", "tcThroughput", "tcPick", "tcRule",
      "tcSnapTokens", "tcPlan", "tcInt", "tcSci", "tcSigned", "tcRead",
      "renderTargetShape", "renderTargetBudget", "tcStageMarkup"],
    options: {
      tcMode: ["shape", "budget"], tcTarget: "TC_TARGETS", tcRho: "TC_RHOS",
      tcHeadDim: "TC_HEAD_DIMS", tcPick: "TC_PICKS", tcRule: "TC_RULES",
      tcThroughput: "TC_THROUGHPUTS"
    },
    // mode A turns N into a shape, mode B turns the shape back into a token count; the
    // fit's prediction and the measured throughput never belong to the same question
    controls: {
      tcTarget: ["shape"], tcRho: ["shape"], tcHeadDim: ["shape"],
      tcPick: ["budget"], tcRule: ["budget"], tcThroughput: ["budget"]
    },
    anchors: [
      [{ tcMode: "shape", tcTarget: "n850", tcRho: "r128", tcHeadDim: "h64", tcPick: "near", tcRule: "keep", tcThroughput: "t5" },
        '<strong data-tccont="1">d_model = (128 · 850,000,000 / 12)^(1/3) = 2,085.207 · n_layer = 2,085.207 / 128 = 16.291</strong>',
        "the continuous solution is the whole subject of mode A and has to be on the screen, not just used"],
      [{ tcMode: "shape", tcTarget: "n850", tcRho: "r128", tcHeadDim: "h64", tcPick: "near", tcRule: "keep", tcThroughput: "t5" },
        '<td data-tcparams="2048-17">855,638,016</td>',
        "the nearest reachable N is the number the reader carries into mode B"],
      [{ tcMode: "shape", tcTarget: "n850", tcRho: "r128", tcHeadDim: "h64", tcPick: "near", tcRule: "keep", tcThroughput: "t5" },
        '<strong data-tcdivisors="1">1 · 2 · 4 · 8 · 16 · 32</strong>',
        "the legal num_key_value_heads follow from a head count the reader never chose"],
      // A prime head count is the case the grouped-query row exists for. It has to reach
      // the screen as a verdict, not only as a divisor list of length two.
      [{ tcMode: "shape", tcTarget: "n850", tcRho: "r64", tcHeadDim: "h128", tcPick: "near", tcRule: "keep", tcThroughput: "t5" },
        '<strong data-tcdivisors="1">1 · 13</strong>',
        "a prime head count leaves exactly two divisors"],
      [{ tcMode: "shape", tcTarget: "n850", tcRho: "r64", tcHeadDim: "h128", tcPick: "near", tcRule: "keep", tcThroughput: "t5" },
        "die Kopfzahl ist prim",
        "and the row has to say what that means, or the divisor list is a number without a consequence"],
      // head_dim does not appear in 12 L d^2; the render still has to follow it.
      [{ tcMode: "shape", tcTarget: "n1400", tcRho: "r256", tcHeadDim: "h64", tcPick: "near", tcRule: "keep", tcThroughput: "t5" },
        '<td data-tcparams="3136-12">1,416,167,424</td>',
        "at head_dim 64 the width axis steps in 64s and 3,136 is reachable"],
      [{ tcMode: "shape", tcTarget: "n1400", tcRho: "r256", tcHeadDim: "h128", tcPick: "near", tcRule: "keep", tcThroughput: "t5" },
        '<td data-tcparams="3072-12">1,358,954,496</td>',
        "at head_dim 128 it is not, and a different corner becomes the nearest one"],
      // Mode B: the two rules have to print different token counts and different verdicts.
      // The ledger's N_final has to be the N of the chosen pick. Pinning it to N_pred still
      // moves the render -- the deviation next to it keeps changing -- so only reading the
      // number itself back catches a row that quietly reports the prediction instead of the
      // configuration being submitted.
      [{ tcMode: "budget", tcTarget: "n850", tcRho: "r128", tcHeadDim: "h64", tcPick: "high", tcRule: "keep", tcThroughput: "t5" },
        '<strong data-tcnfinal="1">909,950,976 · 1.070531 × N_pred · +7.0531 %</strong>',
        "the submitted N and its deviation have to be the same configuration's numbers"],
      [{ tcMode: "budget", tcTarget: "n850", tcRho: "r128", tcHeadDim: "h64", tcPick: "low", tcRule: "keep", tcThroughput: "t5" },
        '<strong data-tcnfinal="1">805,306,368 · 0.947419 × N_pred · −5.2581 %</strong>',
        "and they have to follow the pick, not stay on the prediction"],
      [{ tcMode: "budget", tcTarget: "n850", tcRho: "r128", tcHeadDim: "h64", tcPick: "high", tcRule: "keep", tcThroughput: "t5" },
        '<strong data-tctokens="1">total_train_tokens = 16,941,121,536 = 258,501 · 65,536</strong>',
        "a left-over D is the token count computed for N_pred, not for the model being submitted"],
      [{ tcMode: "budget", tcTarget: "n850", tcRho: "r128", tcHeadDim: "h64", tcPick: "high", tcRule: "keep", tcThroughput: "t5" },
        "51.3853",
        "and it turns the 7.05 % parameter overshoot into 3.39 hours past a budget that truncates"],
      [{ tcMode: "budget", tcTarget: "n850", tcRho: "r128", tcHeadDim: "h64", tcPick: "high", tcRule: "keep", tcThroughput: "t5" },
        "Dieser Lauf passt nicht in das Budget.",
        "the verdict has to follow the number, not the chosen pick"],
      [{ tcMode: "budget", tcTarget: "n850", tcRho: "r128", tcHeadDim: "h64", tcPick: "high", tcRule: "rederive", tcThroughput: "t5" },
        '<strong data-tctokens="1">total_train_tokens = 15,824,977,920 = 241,470 · 65,536</strong>',
        "recomputing D from the submitted N is the one keystroke that fixes it"],
      [{ tcMode: "budget", tcTarget: "n850", tcRho: "r128", tcHeadDim: "h64", tcPick: "high", tcRule: "rederive", tcThroughput: "t5" },
        "Dieser Lauf passt in das Budget.",
        "and the verdict has to flip with it"],
      // The throughput table is the lab's own evidence that a better measurement does not
      // repair a left-over D: its last column stands still while the others move.
      [{ tcMode: "budget", tcTarget: "n850", tcRho: "r128", tcHeadDim: "h64", tcPick: "near", tcRule: "rederive", tcThroughput: "t3" },
        '<td data-tcdriftperparam="t3">11.8014</td>',
        "tokens per parameter at the lowest throughput"],
      [{ tcMode: "budget", tcTarget: "n850", tcRho: "r128", tcHeadDim: "h64", tcPick: "near", tcRule: "rederive", tcThroughput: "t3" },
        '<td data-tcdriftperparam="t8">31.4704</td>',
        "and at the highest, in the same render -- the sweep is on the screen at every throughput"],
      [{ tcMode: "budget", tcTarget: "n850", tcRho: "r128", tcHeadDim: "h64", tcPick: "near", tcRule: "rederive", tcThroughput: "t3" },
        '<td data-tcdriftkeep="t3">48.3184 h</td>',
        "while the left-over-D column barely moves across the same three throughputs"]
    ]
  },
  {
    id: "run-budget-ledger", entry: "rbStageMarkup", mode: "rbMode", update: "updateRunBudgetLedger",
    names: ["RB_BUDGET_SECONDS", "RB_TARGET_HOURS", "RB_SEQ_LEN", "RB_BATCH", "RB_VOCAB",
      "RB_TOKENS_PER_STEP", "RB_MAX_RESERVE", "RB_ARCHS", "RB_TOKEN_CHOICES", "RB_COUNTS",
      "RB_RESERVES", "RB_CAMPAIGN", "RB_SPREADS", "rbArch", "rbTokenChoice", "rbReserve",
      "rbSpread", "rbHandoutParams", "rbBlockParams", "rbTotalParams", "rbParams", "rbFlops",
      "rbConstraints", "rbCharge", "rbInFlight", "rbCampaign", "rbInt", "rbSci", "rbHours",
      "rbRead", "renderRunBudgetConfig", "renderRunBudgetCampaign", "rbStageMarkup"],
    options: {
      rbMode: ["config", "campaign"], rbArch: "RB_ARCHS", rbTokens: "RB_TOKEN_CHOICES",
      rbCount: "RB_COUNTS", rbReserve: "RB_RESERVES", rbSpread: "RB_SPREADS"
    },
    // mode A is the request the API validates, mode B is the budget it charges; neither
    // control may leak into the other, and the panel groups have to agree
    controls: {
      rbArch: ["config"], rbTokens: ["config"], rbCount: ["config"],
      rbReserve: ["campaign"], rbSpread: ["campaign"]
    },
    anchors: [
      [{ rbMode: "config", rbArch: "example", rbTokens: "t1", rbCount: "handout", rbReserve: "r900", rbSpread: "flat" }, "21,676,032",
        "A3 §3.3's own estimate for the handout's own example config is the anchor the whole counting table hangs on"],
      [{ rbMode: "config", rbArch: "example", rbTokens: "t1", rbCount: "handout", rbReserve: "r900", rbSpread: "flat" }, "2.370763",
        "counting the embeddings changes C by this factor, which is why A3 says non-embedding"],
      // The counting table highlights the chosen row, so rbCount moves the render even
      // when the ledger below ignores it. These two read the ledger itself back: the N
      // the reader would carry into the fit, and the C that follows from it.
      [{ rbMode: "config", rbArch: "example", rbTokens: "t1", rbCount: "total", rbReserve: "r900", rbSpread: "flat" },
        '<strong data-rbparams="1">51,388,736</strong>',
        "the ledger's N has to follow the chosen counting convention, not just highlight a row"],
      [{ rbMode: "config", rbArch: "example", rbTokens: "t1", rbCount: "total", rbReserve: "r900", rbSpread: "flat" },
        "6 · 51,388,736 · 1,048,576",
        "and C = 6ND has to be computed from that same N, or the two rows contradict each other"],
      [{ rbMode: "config", rbArch: "example", rbTokens: "t1", rbCount: "exact", rbReserve: "r900", rbSpread: "flat" },
        '<strong data-rbparams="1">22,716,288</strong>',
        "A1's exact block count is the third convention and must reach the ledger too"],
      [{ rbMode: "config", rbArch: "wide", rbTokens: "t1", rbCount: "handout", rbReserve: "r900", rbSpread: "flat" }, "1.000244",
        "at d_ff = 8/3 d_model the handout's estimate is the exact block count, and that number has to be on the screen"],
      [{ rbMode: "config", rbArch: "example", rbTokens: "round", rbCount: "handout", rbReserve: "r900", rbSpread: "flat" }, "100000000 mod 65536 = 57600",
        "the divisibility rule has to be shown with its remainder, or the reader cannot see why a round token count is rejected"],
      [{ rbMode: "config", rbArch: "mismatch", rbTokens: "t1", rbCount: "handout", rbReserve: "r900", rbSpread: "flat" }, "512 gegen 7 · 64 = 448",
        "the hidden_size rule has to print both sides, it is the one an edited config breaks first"],
      [{ rbMode: "campaign", rbArch: "example", rbTokens: "t1", rbCount: "handout", rbReserve: "r600", rbSpread: "flat" }, "kein abgeschlossener Lauf · 0 von 12",
        "twelve runs that all time out must say so instead of printing a cost per completed run"],
      [{ rbMode: "campaign", rbArch: "example", rbTokens: "t1", rbCount: "handout", rbReserve: "r10800", rbSpread: "flat" }, "129,600 s",
        "three-hour reservations bind three times the budget, and that bound total is the point of mode B"]
    ],
    forbid: [
      [{ rbMode: "campaign", rbArch: "example", rbTokens: "t1", rbCount: "handout", rbReserve: "r600", rbSpread: "flat" }, "Infinity",
        "a campaign with no completed run must not divide by zero on the screen"]
    ]
  },
  {
    id: "offpolicy-clip", entry: "offStageMarkup", mode: "offMode", update: "updateOffPolicyClip",
    names: ["OFF_REWARDS", "OFF_STD_EPS", "offAdvantages", "OFF_DRIFTS", "OFF_EPSILONS", "OFF_VARIANTS",
      "offTokenTerm", "offObjective", "OFF_SEQS", "OFF_SEQ_VARIANTS", "offSeqWeight", "offGspoRow",
      "offNumber", "offFind", "offRead", "offSelection", "offClipStage", "offGspoStage", "offStageMarkup"],
    options: { offMode: ["clip", "gspo"], offDrift: "OFF_DRIFTS", offSeq: "OFF_SEQS", offEps: "OFF_EPSILONS" },
    // token-level clipping reads the drift, GSPO reads the sequence; eps binds in both
    controls: { offDrift: ["clip"], offSeq: ["gspo"], offEps: ["clip", "gspo"] },
    anchors: [
      [{ offMode: "gspo", offDrift: "mixed", offSeq: "long", offEps: "e20" }, "0.778801",
        "the log-space geometric mean is the answer the GSPO row has to print"],
      [{ offMode: "gspo", offDrift: "mixed", offSeq: "long", offEps: "e20" }, "0.818434",
        "the float32 product's wrong answer has to stand next to it, or the lesson has no evidence"],
      [{ offMode: "gspo", offDrift: "mixed", offSeq: "long", offEps: "e20" }, "2.8026e-45",
        "the stalled intermediate product is the reason for that wrong answer and must be shown, not only computed"],
      [{ offMode: "clip", offDrift: "mixed", offSeq: "long", offEps: "e20" }, "33.3 %",
        "the share of masked tokens is the quantity the lab tells you to log"]
    ]
  },
  {
    id: "advantage-normalizers", entry: "advStageMarkup", mode: "advMode", update: "updateAdvantageNormalizers",
    names: ["ADV_EPS", "ADV_LENGTHS", "ADV_MAX_LEN", "ADV_Z", "ADV_GROUPS", "ADV_VARIANTS", "ADV_LOSS_NORMS",
      "ADV_EPS_MODES", "advMean", "advSampleStd", "advAdvantages", "advSeqWeights", "advPrunedShare",
      "ADV_LADDER", "ADV_CONVENTIONS", "advPromptWeight", "advEqualAdvantagePair", "advNumber", "advFind",
      "advRead", "advSelection", "advVariantStage", "advWeightStage", "advStageMarkup"],
    options: {
      advMode: ["variant", "weight"], advConvention: "ADV_CONVENTIONS", advEps: "ADV_EPS_MODES",
      advGroup: "ADV_GROUPS", advLossNorm: "ADV_LOSS_NORMS", advRef: "ADV_LADDER"
    },
    controls: {
      advGroup: ["variant"], advLossNorm: ["variant"], advEps: ["variant"],
      advConvention: ["weight"], advRef: ["weight"]
    },
    // Turning the guard term off on a zero-variance group is 0/0. The lab is built to show
    // that, so here the screen must carry NaN precisely when the arithmetic does.
    nan: (state, api) => state.advMode === "variant" && api.ADV_VARIANTS.some(variant =>
      api.advAdvantages(api.ADV_GROUPS.find(group => group.key === state.advGroup).rewards, variant.key,
        api.ADV_EPS_MODES.find(mode => mode.key === state.advEps).eps).adv.some(Number.isNaN)),
    anchors: [
      [{ advMode: "weight", advConvention: "sample", advEps: "guard", advGroup: "mixed", advLossNorm: "constant", advRef: "0.125" }, "1.1429",
        "MaxRL's split between the two equal-advantage responses has to be printed, it is the whole comparison"],
      [{ advMode: "weight", advConvention: "population", advEps: "guard", advGroup: "mixed", advLossNorm: "constant", advRef: "0.125" }, "3.023716",
        "the weight GRPO gives both members of the equal-advantage pair has to be printed"],
      // A row whose advantages are NaN used to print "no gradient: 0.0 %" -- the reading a
      // healthy group gives -- in the one state built to show why advantage_eps exists. The
      // same group with the guard term on prints 100.0 %, so the number flipped the lesson.
      [{ advMode: "variant", advConvention: "sample", advEps: "none", advGroup: "allWrong", advLossNorm: "constant", advRef: "0.125" }, "Gradient undefiniert · 0/0",
        "a row of NaN advantages must say the gradient is undefined, not report a share of pruned rollouts"],
      [{ advMode: "variant", advConvention: "sample", advEps: "guard", advGroup: "allWrong", advLossNorm: "constant", advRef: "0.125" }, "ohne Gradient: 100.0 %",
        "with the guard term the same group prunes completely, and that is the number the row must print"]
    ],
    // and the misleading pair must not come back
    forbid: [
      [{ advMode: "variant", advConvention: "sample", advEps: "none", advGroup: "allWrong", advLossNorm: "constant", advRef: "0.125" }, "ohne Gradient: 0.0 %",
        "a NaN advantage is not a rollout that still carries a gradient"]
    ]
  },
  {
    id: "microbatch-denominator", entry: "mbdStageMarkup", mode: "mbdMode", update: "updateMicrobatchDenominator",
    names: ["MBD_BATCH", "MBD_GROUP_SIZE", "MBD_MAX_LEN", "MBD_Z", "MBD_SEQ", "MBD_SPLITS", "MBD_RULES",
      "MBD_NORMS", "mbdTokenSum", "mbdSeqMean", "mbdAggregate", "mbdScale", "mbdWholeBatch", "mbdWeights",
      "mbdAccumulated", "mbdUniformFactor", "mbdGroupDrift", "mbdNumber", "mbdFind", "mbdRead",
      "mbdSelection", "mbdReport", "mbdLedgerStage", "mbdBaselineStage", "mbdStageMarkup"],
    options: { mbdMode: ["ledger", "baseline"], mbdNorm: "MBD_NORMS", mbdRule: "MBD_RULES", mbdSplit: "MBD_SPLITS" },
    controls: { mbdNorm: ["ledger", "baseline"], mbdRule: ["ledger", "baseline"], mbdSplit: ["ledger", "baseline"] },
    anchors: [
      [{ mbdMode: "ledger", mbdNorm: "sequence", mbdRule: "share", mbdSplit: "k1" }, "0.0234375000",
        "at k = 1 every rule has to print the same number, that is the state the unit test runs in"],
      [{ mbdMode: "ledger", mbdNorm: "sequence", mbdRule: "steps", mbdSplit: "k3" }, "0.888889",
        "the uneven split has to print the weight it gives the short microbatch"],
      [{ mbdMode: "ledger", mbdNorm: "sequence", mbdRule: "steps", mbdSplit: "k3" }, "1.333333",
        "and the weight it gives the long one -- the pair is the whole point of the uneven split"]
    ]
  },
  {
    id: "checkpoint-segments", entry: "ckptStageMarkup", mode: "ckptMode", update: "updateCheckpointSegments",
    names: ["CKPT_BLOCK_RESIDUAL", "CKPT_BOUNDARY", "CKPT_DEPTHS", "CKPT_RATIOS", "ckptRead", "ckptSetup",
      "ckptFlatPeak", "ckptFlatRow", "ckptFlatTable", "ckptBestSegments", "ckptNestedPeak",
      "ckptNestedRecompute", "ckptNumber", "ckptFactor", "ckptSegmentsStage", "ckptNestingStage", "ckptStageMarkup"],
    options: {
      ckptMode: ["segments", "nesting"], ckptBlocks: "CKPT_DEPTHS", ckptRatio: "CKPT_RATIOS",
      // the segment select is rebuilt to 1..N whenever the block count changes
      ckptSegment: (state, api) => Array.from(
        { length: api.CKPT_DEPTHS.find(entry => entry.key === state.ckptBlocks).blocks },
        (value, index) => String(index + 1))
    },
    controls: { ckptBlocks: ["segments", "nesting"], ckptRatio: ["segments", "nesting"], ckptSegment: ["segments"] },
    anchors: [
      [{ ckptMode: "segments", ckptBlocks: "xl", ckptRatio: "measured", ckptSegment: "6" }, "3.60×",
        "the factor by which the sqrt(N) rule of thumb misses the real minimum has to be printed"]
    ]
  },
  {
    id: "mixed-precision", entry: "precStageMarkup", mode: "precMode", update: "updateMixedPrecision",
    names: ["PREC_LN_EPS", "PREC_LN_BASE", "precF32Buffer", "precU32Buffer", "precBf16", "precRound",
      "PREC_DTYPES", "PREC_CASES", "PREC_SCHEMES", "precAccumulate", "precAllSchemes", "precLayerNorm",
      "PREC_SCALES", "PREC_AUTOCAST_ROWS", "precNumber", "precPercent", "precRead",
      "precAccumulationStage", "precAutocastStage", "precStageMarkup"],
    options: {
      precMode: ["autocast", "accumulate"], precCast: ["fp16", "bf16"], precScale: "PREC_SCALES",
      precCase: "PREC_CASES", precScheme: "PREC_SCHEMES"
    },
    controls: { precCast: ["autocast"], precScale: ["autocast"], precCase: ["accumulate"], precScheme: ["accumulate"] },
    anchors: [
      [{ precMode: "accumulate", precCast: "fp16", precScale: "unit", precCase: "handout", precScheme: "allF32" }, "10.00213623046875",
        "the handout's own accumulation result has to appear, it is what the lab is checked against"]
    ]
  },
  {
    id: "winrate-lc", entry: "winrateStageMarkup", mode: null, update: "updateWinrateLc",
    names: ["WINRATE_REFERENCE_N", "WINRATE_ITEMS", "WINRATE_PROFILES", "WINRATE_BOUNDS", "WINRATE_BUCKET_LABELS",
      "WINRATE_VARIANTS", "winrateScore", "winrateBucket", "winratePooledMix", "winrateRows", "winrateReport",
      "winratePaired", "winrateNumber", "winratePercent", "winrateSigned", "winrateRead", "winrateStageMarkup"],
    options: { winrateBound: "WINRATE_BOUNDS", winrateProfile: "WINRATE_PROFILES", winrateVariant: "WINRATE_VARIANTS" },
    controls: { winrateBound: [null], winrateProfile: [null], winrateVariant: [null] },
    anchors: [
      [{ winrateBound: "b200", winrateProfile: "base", winrateVariant: "correct" }, "48.1",
        "the length-controlled rate at the 200-token bound has to be printed"],
      [{ winrateBound: "b200", winrateProfile: "base", winrateVariant: "correct" }, "33.3",
        "and the raw rate beside it, or there is nothing to compare it against"]
    ]
  },
  {
    id: "batch-windows", entry: "batchStageMarkup", mode: null, update: "updateBatchWindows",
    names: ["BATCH_SEED", "BATCH_LEDGER_LIMIT", "BATCH_UINT16_MAX", "BATCH_SETUPS", "BATCH_START_RULES",
      "BATCH_TARGET_RULES", "batchRandom", "batchStarts", "batchWindow", "batchTokens", "batchReport",
      "batchCoverage", "batchDtype", "batchNumber", "batchDecimal", "batchPercent", "batchOneIn",
      "batchSliceLabel", "batchRead", "batchStageMarkup"],
    options: { batchSetup: "BATCH_SETUPS", batchStart: "BATCH_START_RULES", batchTarget: "BATCH_TARGET_RULES" },
    controls: { batchSetup: [null], batchStart: [null], batchTarget: [null] },
    anchors: [
      [{ batchSetup: "real", batchStart: "inclusive", batchTarget: "shift" }, "312,493",
        "how rarely the off-by-one start rule is caught at A1 scale is the number the lab exists for"]
    ]
  },
  {
    id: "baseline-variance", entry: "bvStageMarkup", mode: "bvMode", update: "updateBaselineVariance",
    names: ["BV_P_LADDER", "BV_N_LADDER", "bvScore", "bvReward", "bvOutcomes", "bvMean",
      "bvVarSingle", "bvVar", "bvClosedMean", "bvClosedVarPlain", "bvClosedVarBaseline",
      "bvClosedGainMean", "BV_BASELINES", "BV_MODES", "bvNumber", "bvFind", "bvPick",
      "bvLabel", "bvCell", "bvRead", "bvSelection", "bvLedgerStage", "bvCrossoverStage",
      "bvStageMarkup"],
    options: {
      bvMode: ["ledger", "crossover"], bvN: "BV_N_LADDER", bvP: "BV_P_LADDER",
      bvBaseline: "BV_BASELINES", bvCompare: ["mean", "optimal", "half", "max"]
    },
    // Mode A works one (p, b) case in full; mode B sweeps every p and has no single case at
    // all. Nothing mode A selects may reach the sweep, or the crossover the reader reads off
    // would silently depend on the case left standing in the other panel. n is the one control
    // both modes show, and it has to move both.
    controls: { bvN: ["ledger", "crossover"], bvP: ["ledger"], bvBaseline: ["ledger"], bvCompare: ["crossover"] },
    anchors: [
      // Part (a) on screen: with no baseline the variance is p(1-p)^3, and outcome A = 0
      // contributes literally nothing because its reward is zero.
      [{ bvMode: "ledger", bvN: "1", bvP: "0.9", bvBaseline: "none", bvCompare: "mean" },
        '<strong data-bv-var1="0.0008999999999999993">0.0009000000</strong>',
        "the reference variance of part (a) is what every later comparison is measured against"],
      [{ bvMode: "ledger", bvN: "1", bvP: "0.9", bvBaseline: "none", bvCompare: "mean" },
        '<strong data-bv-outcome0="0">0.000000</strong>',
        "the wrong answer reporting nothing at all is the reason the plain estimator spreads"],
      // Part (c), the finding: at p = 0.9 the population mean costs 64 times the variance of
      // no baseline, while the expectation beside it does not move by a digit.
      [{ bvMode: "ledger", bvN: "1", bvP: "0.9", bvBaseline: "mean", bvCompare: "mean" },
        '<strong data-bv-var1="0.0576">0.0576000000</strong>',
        "the population-mean variance at p = 0.9 is the number the lab card quotes"],
      [{ bvMode: "ledger", bvN: "1", bvP: "0.9", bvBaseline: "mean", bvCompare: "mean" },
        '<strong data-bv-ratio="64.00000000000004">64.000000×</strong>',
        "64 times is the claim in both language cards and has to be legible on screen, not only true"],
      [{ bvMode: "ledger", bvN: "1", bvP: "0.9", bvBaseline: "mean", bvCompare: "mean" },
        '<strong data-bv-mean="0.08999999999999998">0.0900000000</strong>',
        "unbiasedness is the other half of the lesson: the expectation has to stand still while the variance moves"],
      // The ratio is a property of p alone -- n divides both sides -- so it has to survive n.
      [{ bvMode: "ledger", bvN: "16", bvP: "0.75", bvBaseline: "mean", bvCompare: "mean" },
        '<strong data-bv-ratio="4">4.000000×</strong>',
        "the ratio may not move with n, or the reader would read the sample count as part of the finding"],
      [{ bvMode: "ledger", bvN: "16", bvP: "0.75", bvBaseline: "mean", bvCompare: "mean" },
        '<strong data-bv-varn="0.0029296875">0.0029296875</strong>',
        "while the variance beside it does divide by n -- one cell without the other teaches the wrong rule"],
      // The variance-optimal baseline: both outcomes collapse onto the same number, so the
      // estimator is deterministic. This is the answer to question 2 of the quick check.
      [{ bvMode: "ledger", bvN: "1", bvP: "0.75", bvBaseline: "optimal", bvCompare: "mean" },
        '<strong data-bv-outcome1="0.1875">0.187500</strong>',
        "at b = 1 - p the two outcomes have to print the same value, or the zero variance is unexplained"],
      [{ bvMode: "ledger", bvN: "1", bvP: "0.75", bvBaseline: "optimal", bvCompare: "mean" },
        '<strong data-bv-outcome0="0.1875">0.187500</strong>',
        "and the second of the two, since a single cell does not show the collapse"],
      [{ bvMode: "ledger", bvN: "1", bvP: "0.75", bvBaseline: "optimal", bvCompare: "mean" },
        '<strong data-bv-var1="0">0.0000000000</strong>',
        "the minimum of the variance over b is exactly zero, and that has to be on the screen"],
      // Mode B: four baselines, four different answers to "does a baseline reduce variance".
      [{ bvMode: "crossover", bvN: "1", bvP: "0.5", bvBaseline: "none", bvCompare: "mean" },
        '<strong data-bv-crossover="0.6666666666666666">0.666667</strong>',
        "p = 2/3 is the threshold the lab card names and the sweep has to print it"],
      [{ bvMode: "crossover", bvN: "1", bvP: "0.5", bvBaseline: "none", bvCompare: "mean" },
        '<strong data-bv-worse="2">2 von 6</strong>',
        "the count of harmful rows has to agree with the threshold beside it"],
      [{ bvMode: "crossover", bvN: "1", bvP: "0.5", bvBaseline: "none", bvCompare: "mean" },
        'gleich · Δ = 0.0000000000',
        "exactly at the threshold the baseline is a wash, and rounding that to \"better\" would be the wrong lesson"],
      [{ bvMode: "crossover", bvN: "1", bvP: "0.5", bvBaseline: "none", bvCompare: "optimal" },
        '<strong data-bv-worse="0">0 von 6</strong>',
        "the variance-optimal baseline is the only one that is never worse, which is what makes the other three a warning"],
      [{ bvMode: "crossover", bvN: "1", bvP: "0.5", bvBaseline: "none", bvCompare: "half" },
        '<strong data-bv-crossover="0.75">0.750000</strong>',
        "a fixed baseline has its own threshold -- three different numbers is the point of the mode"],
      [{ bvMode: "crossover", bvN: "1", bvP: "0.5", bvBaseline: "none", bvCompare: "max" },
        '<strong data-bv-crossover="0.5">0.500000</strong>',
        "and the maximum-reward baseline a third one"],
      // Two columns of the same row, and the mutation that swapped one of them survived every
      // ledger anchor: the sweep recomputing its reference column from the selected baseline
      // prints Delta = 0 in every row, and the threshold beside it is a declared field, so it
      // does not move either. Both numbers of the row that decides are read back.
      [{ bvMode: "crossover", bvN: "1", bvP: "0.5", bvBaseline: "none", bvCompare: "mean" },
        "Var(b=0) = 0.0009000000 · Var(b) = 0.0576000000",
        "the row where the population mean costs the most has to print both of its numbers, not only their difference"],
      [{ bvMode: "crossover", bvN: "1", bvP: "0.5", bvBaseline: "none", bvCompare: "mean" },
        '<strong data-bv-gain="-0.0567">schlechter · Δ = -0.0567000000</strong>',
        "and the signed gap beside them, or a sweep of zeroes would read as agreement"]
    ]
  },
];

let renderStates = 0, renderChecks = 0, renderNaN = 0;
for (const lab of renderLabs) {
  const api = renderApi(lab.names, {});
  const valuesOnly = renderApi(lab.names, {}, false);
  const optionsFor = (id, state) => {
    const spec = lab.options[id];
    if (Array.isArray(spec)) return spec;
    if (typeof spec === "function") return spec(state, api);
    return api[spec].map(entry => (entry && typeof entry === "object" ? entry.key : String(entry)));
  };
  const ids = Object.keys(lab.options);
  let states = [{}];
  for (const id of ids) {
    const next = [];
    for (const state of states) for (const value of optionsFor(id, state)) next.push({ ...state, [id]: value });
    states = next;
  }

  // 1. every state renders, in a sandbox that has no document to fall back on
  // 3. and NaN appears exactly where the lab's own arithmetic produces one
  const rendered = new Map();
  for (const state of states) {
    const html = api[lab.entry](state);
    if (typeof html !== "string" || !html.length)
      throw new Error(`${lab.id}: ${JSON.stringify(state)} renders nothing`);
    if (/undefined|\[object Object\]/.test(html))
      throw new Error(`${lab.id}: ${JSON.stringify(state)} renders undefined or [object Object]`);
    const wantsNaN = lab.nan ? lab.nan(state, api) : false;
    if (valuesOnly[lab.entry](state).includes("NaN") !== wantsNaN)
      throw new Error(wantsNaN
        ? `${lab.id}: ${JSON.stringify(state)} divides by zero but shows no NaN`
        : `${lab.id}: ${JSON.stringify(state)} renders NaN where the arithmetic is finite`);
    if (wantsNaN) renderNaN++;
    rendered.set(JSON.stringify(state), html);
    renderStates++;
  }

  // 2. the render depends on the mode and on that mode's own controls -- no more, no less
  for (const mode of (lab.mode ? optionsFor(lab.mode, {}) : [null])) {
    const inMode = lab.mode ? states.filter(state => state[lab.mode] === mode) : states;
    const live = ids.filter(id => id !== lab.mode && lab.controls[id].includes(mode));
    const byLiveValues = new Map();
    for (const state of inMode) {
      const key = live.map(id => state[id]).join("|");
      const html = rendered.get(JSON.stringify(state));
      const seen = byLiveValues.get(key);
      if (!seen) byLiveValues.set(key, { state, html });
      else if (seen.html !== html) {
        const culprit = ids.find(id => state[id] !== seen.state[id]);
        throw new Error(`${lab.id}${lab.mode ? `/${mode}` : ""}: the render moves with ${culprit}, a control this mode does not show`);
      }
      renderChecks++;
    }
    for (const id of live) {
      const moves = inMode.some(state =>
        new Set(optionsFor(id, state).map(value => api[lab.entry]({ ...state, [id]: value }))).size > 1);
      if (!moves) throw new Error(`${lab.id}${lab.mode ? `/${mode}` : ""}: the control ${id} is offered but changes nothing`);
      renderChecks++;
    }
  }

  // a control that goes inert in some mode has to be one the panel hides there, and the
  // update function has to be what hides it -- otherwise the reader turns a dead knob
  if (lab.mode) {
    const modes = optionsFor(lab.mode, {});
    const inert = ids.filter(id => id !== lab.mode && lab.controls[id].length < modes.length);
    const update = sliceDeclaration(source, lab.update);
    const hidden = new Set();
    for (const group of [...update.matchAll(/getElementById\("(\w+)"\)\.hidden/g)].map(match => match[1]))
      for (const id of panelGroupControls(group)) hidden.add(id);
    for (const id of inert)
      if (!hidden.has(id)) throw new Error(`${lab.id}: ${id} does nothing in at least one mode, but no panel group hides it there`);
    for (const id of hidden)
      if (!inert.includes(id)) throw new Error(`${lab.id}: the panel hides ${id} in one mode, but the render never depended on it`);
    renderChecks += inert.length;
  }

  // 4. the numbers the lab's own claim rests on, read back out of the markup
  const at = state => {
    const html = rendered.get(JSON.stringify(state));
    if (!html) throw new Error(`${lab.id}: the state ${JSON.stringify(state)} is not one the panel can produce`);
    return html;
  };
  for (const [state, needle, why] of lab.anchors) {
    if (!at(state).includes(needle))
      throw new Error(`${lab.id}: ${why} -- "${needle}" is missing from the render at ${JSON.stringify(state)}`);
    renderChecks++;
  }
  for (const [state, needle, why] of lab.forbid || []) {
    if (at(state).includes(needle))
      throw new Error(`${lab.id}: ${why} -- "${needle}" is back in the render at ${JSON.stringify(state)}`);
    renderChecks++;
  }

  // the app itself still calls these without an argument. Same states, read through a
  // document stub instead of the binding: both paths have to print the same markup.
  for (const [state] of lab.anchors) {
    const domApi = renderApi(lab.names, {
      document: {
        getElementById(id) {
          if (!(id in state)) throw new Error(`${lab.id}: the renderer reads ${id}, which is not a control of this lab`);
          return { value: state[id] };
        }
      }
    });
    if (domApi[lab.entry]() !== at(state))
      throw new Error(`${lab.id}: reading the DOM and reading the binding disagree at ${JSON.stringify(state)}`);
    renderChecks++;
  }
}
console.log(`render coverage OK: ${renderStates} states across ${renderLabs.length} labs render without a DOM, ${renderChecks} checks -- every mode's own controls move it, every hidden one leaves it alone, and NaN reaches the screen in exactly the ${renderNaN} states whose denominator is zero`);

// ---- baseline variance: assignment 5, problem (baseline_calcs) -----------------------
// The handout fixes a policy over A in {0,1} with pi_theta(A=1) = p = sigma(theta) and
// r(A) = 1{A=1}, then asks three things: (a) the variance of (1/n) sum_i r(A_i) grad log
// pi(A_i), (b) the variance once a baseline b is subtracted, and (c) what the "population
// mean" baseline b = p does to that variance compared with no baseline at all. Lectures 15
// and 16 say only that policy-gradient "variances are too high", and lecture 17's own summary
// says baselines reduce it -- until this lab, nothing in the app computed a variance, so the
// unqualified sentence stood unchecked. Everything below is derived here from the handout's
// statement and then held against the app; the only things imported are the functions
// under test.
const bvApi = renderApi(renderLabs.find(lab => lab.id === "baseline-variance").names, {});
// Typed from the handout, not reused: a single sigmoid gives d/dtheta log pi(A=1) = 1 - p and
// d/dtheta log pi(A=0) = -p, so the summand is a two-point random variable and both its mean
// and its variance are sums of two terms.
const bvRefValues = (p, b) => [
  { prob: p, value: (1 - b) * (1 - p) },
  { prob: 1 - p, value: (0 - b) * (-p) }
];
const bvRefMean = (p, b) => bvRefValues(p, b).reduce((sum, o) => sum + o.prob * o.value, 0);
const bvRefVar = (p, b, n) => {
  const mean = bvRefMean(p, b);
  return bvRefValues(p, b).reduce((sum, o) => sum + o.prob * (o.value - mean) ** 2, 0) / n;
};
// The three expressions the deliverables ask for, transcribed from the derivation rather than
// from the app's own bvClosed* -- so a drift in either one shows up as a disagreement.
const bvRefClosedMean = p => p * (1 - p);
const bvRefClosedPlain = (p, n) => p * (1 - p) ** 3 / n;
const bvRefClosedBaseline = (p, b, n) => (p * (1 - p) * ((1 - b) ** 2 * (1 - p) + b * b * p) - p * p * (1 - p) ** 2) / n;
const bvRefGainMean = (p, n) => p * p * (1 - p) * (2 - 3 * p) / n;

const bvClose = (a, b, tol = 1e-12) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
let bvChecks = 0;
const bvBaselines = bvApi.BV_BASELINES;
if (bvBaselines.length !== 5 || JSON.stringify(bvBaselines.map(entry => entry.key)) !== JSON.stringify(["none", "mean", "optimal", "half", "max"]))
  throw new Error("baseline variance: the five baselines the lab offers are part of its argument and may not change silently");
if (JSON.stringify(bvApi.BV_P_LADDER) !== JSON.stringify([0.1, 0.25, 0.5, 2 / 3, 0.75, 0.9]))
  throw new Error("baseline variance: the p ladder has to contain the three crossovers 0.5, 2/3 and 0.75 exactly, or the sweep cannot show them");
if (JSON.stringify(bvApi.BV_N_LADDER) !== JSON.stringify([1, 4, 16, 64]))
  throw new Error("baseline variance: the n ladder is pinned so the ratio-is-independent-of-n property stays visible");

// 1. The app's enumeration, the handout recomputation and the closed forms agree everywhere --
//    on a fine grid of p, on every baseline the lab offers plus free values of b, and on every n.
for (let i = 1; i < 200; i++) {
  const p = i / 200;
  for (const b of [...bvBaselines.map(entry => entry.value(p)), -0.5, 0.25, 1.5, 2]) {
    for (const n of bvApi.BV_N_LADDER) {
      if (!bvClose(bvApi.bvVar(p, b, n), bvRefVar(p, b, n)))
        throw new Error(`baseline variance: the app disagrees with the handout recomputation at p=${p}, b=${b}, n=${n}`);
      if (!bvClose(bvRefVar(p, b, n), bvRefClosedBaseline(p, b, n)))
        throw new Error(`baseline variance: the closed form of deliverable (b) is not the enumeration at p=${p}, b=${b}`);
      if (!bvClose(bvApi.bvClosedVarBaseline(p, b, n), bvRefClosedBaseline(p, b, n)))
        throw new Error(`baseline variance: the app's printed closed form drifted from the deliverable at p=${p}, b=${b}`);
      bvChecks += 3;
    }
    // (b)'s discussion: every action-independent baseline leaves the expectation alone. This is
    // the whole licence for subtracting one, and it is the half the folk wisdom gets right.
    if (!bvClose(bvApi.bvMean(p, b), bvRefClosedMean(p)))
      throw new Error(`baseline variance: b=${b} moves the expectation at p=${p} -- the estimator would be biased`);
    bvChecks++;
  }
  // (a): with no baseline the variance is p(1-p)^3.
  if (!bvClose(bvApi.bvVar(p, 0, 1), bvRefClosedPlain(p, 1)) || !bvClose(bvApi.bvClosedVarPlain(p, 1), bvRefClosedPlain(p, 1)))
    throw new Error(`baseline variance: deliverable (a) does not come out as p(1-p)^3 at p=${p}`);
  // (c): Var(b=0) - Var(b=p) = p^2 (1-p) (2-3p).
  if (!bvClose(bvApi.bvVar(p, 0, 1) - bvApi.bvVar(p, p, 1), bvRefGainMean(p, 1)) || !bvClose(bvApi.bvClosedGainMean(p, 1), bvRefGainMean(p, 1)))
    throw new Error(`baseline variance: deliverable (c) does not come out as p^2(1-p)(2-3p) at p=${p}`);
  bvChecks += 2;
}

// 2. The variance-optimal baseline is 1 - p and not the mean reward, and there the variance is
//    exactly zero -- both outcomes collapse onto the true gradient p(1-p). This is the claim the
//    lab card makes and the answer to question 2 of its quick check, so it is measured rather
//    than asserted: a fine scan over b has its minimum at 1 - p in every state.
let bvZeroStates = 0;
for (let i = 1; i < 200; i++) {
  const p = i / 200;
  let best = null;
  for (let k = -400; k <= 400; k++) {
    const b = k / 200, value = bvRefVar(p, b, 1);
    if (best === null || value < best.value) best = { b, value };
  }
  if (Math.abs(best.b - (1 - p)) > 1 / 200 + 1e-9)
    throw new Error(`baseline variance: the variance minimum at p=${p} is at b=${best.b}, not at 1-p`);
  if (bvRefVar(p, 1 - p, 1) > 1e-24) throw new Error(`baseline variance: b = 1-p does not drive the variance to zero at p=${p}`);
  const outcomes = bvApi.bvOutcomes(p, 1 - p);
  if (!bvClose(outcomes[0].value, outcomes[1].value) || !bvClose(outcomes[0].value, bvRefClosedMean(p)))
    throw new Error(`baseline variance: at b = 1-p the two outcomes must both equal the true gradient at p=${p}`);
  bvZeroStates++;
  bvChecks += 3;
}
// The mean reward is optimal at exactly one p, and the lab card names it.
const bvMeanOptimalAt = [...Array(199).keys()].map(i => (i + 1) / 200).filter(p => bvRefVar(p, p, 1) <= 1e-24);
if (JSON.stringify(bvMeanOptimalAt) !== JSON.stringify([0.5]))
  throw new Error(`baseline variance: the population mean reaches the minimum at ${bvMeanOptimalAt.join(", ")}, but the card says p = 0.5`);

// 3. Each baseline's declared crossover is the p where it really stops helping, measured by
//    scanning the sign of Var(b=0) - Var(b) rather than by trusting the field. A null crossover
//    has to mean the difference never turns negative anywhere.
for (const entry of bvBaselines) {
  const harmful = [...Array(999).keys()].map(i => (i + 1) / 1000)
    .filter(p => bvRefVar(p, 0, 1) - bvRefVar(p, entry.value(p), 1) < -1e-15);
  if (entry.crossover === null) {
    if (harmful.length) throw new Error(`baseline variance: ${entry.key} is declared never harmful but costs variance at p=${harmful[0]}`);
  } else {
    const first = Math.min(...harmful), last = Math.max(...harmful);
    if (!harmful.length || Math.abs(first - entry.crossover) > 2 / 1000 || Math.abs(last - 0.999) > 1e-9)
      throw new Error(`baseline variance: ${entry.key} declares its crossover at ${entry.crossover} but turns harmful from ${first} to ${last}`);
    if (bvRefVar(entry.crossover, 0, 1) - bvRefVar(entry.crossover, entry.value(entry.crossover), 1) > 1e-12)
      throw new Error(`baseline variance: ${entry.key} is not a wash at its own declared crossover ${entry.crossover}`);
  }
  bvChecks += 2;
}

// 4. The numbers the two language cards print are the computed ones. renderer i18n proves an
//    English entry exists and english render proves no German is left, but neither looks at what
//    the numbers in either card say -- a card may quote a figure the app never computes.
const bvLab = base.labs.find(lab => lab.id === "baseline-variance");
if (!bvLab) throw new Error("baseline variance: the lab is gone");
const bvEnglish = pack.labs?.["baseline-variance"];
if (!bvEnglish) throw new Error("baseline variance: the English card is gone");
const bvRatioAtNine = bvRefVar(0.9, 0.9, 1) / bvRefVar(0.9, 0, 1);
if (Math.round(bvRatioAtNine) !== 64 || Math.abs(bvRatioAtNine - 64) > 1e-9)
  throw new Error(`baseline variance: the cards quote 64 times, the computation says ${bvRatioAtNine}`);
const bvMeanCrossover = bvBaselines.find(entry => entry.key === "mean").crossover;
if (Math.abs(bvMeanCrossover - 2 / 3) > 1e-12) throw new Error("baseline variance: the cards quote 2/3 as the threshold");
for (const [where, text, ratio, threshold, optimal] of [
  ["de.transferAnswer", bvLab.transferAnswer, "64-Fache", "2/3", "b = 1 − p"],
  ["en.transferAnswer", bvEnglish.transferAnswer, "64 times", "2/3", "b = 1 − p"],
  ["de.misconception", bvLab.misconception, null, "p = 2/3", "b = 1 − p"],
  ["en.misconception", bvEnglish.misconception, null, "p = 2/3", "b = 1 − p"]
]) {
  if (ratio && !text.includes(ratio)) throw new Error(`baseline variance: ${where} no longer names the computed ratio (${ratio})`);
  if (!text.includes(threshold)) throw new Error(`baseline variance: ${where} no longer names the computed threshold (${threshold})`);
  if (!text.includes(optimal)) throw new Error(`baseline variance: ${where} no longer names the variance-optimal baseline`);
  bvChecks += 3;
}
for (const [where, text, mark] of [["de.misconception", bvLab.misconception, "p = 0,5"], ["en.misconception", bvEnglish.misconception, "p = 0.5"]])
  if (!text.includes(mark)) throw new Error(`baseline variance: ${where} no longer names the one p at which the population mean is optimal`);
// b = 1-p and the zero variance are properties of this two-point model; the rule that carries
// beyond it is that the optimal baseline is the score-squared-weighted mean reward. That
// sentence holds no number, so no number binds it -- the one claim of the card that
// generalises is pinned by name instead ([[cs336-mutation-test-blind-spots]] point 19).
for (const [where, text, rule] of [["de.misconception", bvLab.misconception, "Quadrat des Scores"], ["en.misconception", bvEnglish.misconception, "square of the score"]]) {
  if (!text.includes(rule)) throw new Error(`baseline variance: ${where} must keep naming the rule that survives outside the two-point model -- without it the card teaches b = 1-p as a general answer`);
  bvChecks++;
}

// 5. Placement. The lab answers a five-point problem of A5 and corrects an unqualified sentence
//    on lecture 17's own page, so it has to be reachable from both -- and from the module that
//    carries the concept. A lab that only the assignment page offers arrives at the problem
//    instead of before it.
const bvGuide = base.lectureGuides.l17;
if (!(bvGuide.labs || []).includes("baseline-variance"))
  throw new Error("baseline variance: lecture 17 teaches policy-gradient and its summary says baselines reduce variance -- the lab that qualifies that belongs on its page");
if (!(bvGuide.concepts || []).includes("policy-gradient"))
  throw new Error("baseline variance: lecture 17 no longer curates policy-gradient, so the placement has to be decided again");
if (!(base.modules.find(module => module.id === "rlvr")?.labs || []).includes("baseline-variance"))
  throw new Error("baseline variance: the rlvr module must offer the lab");
const bvMission = base.assignments.find(item => item.id === "a5")?.missions.find(mission => mission.id === "pg-math");
if (!bvMission || bvMission.scope !== "baseline_calcs")
  throw new Error("baseline variance: the pg-math block of A5 is the home of problem baseline_calcs");
if (!(bvMission.labs || []).includes("baseline-variance"))
  throw new Error("baseline variance: the block whose evidence line promises variances computed by hand must offer the lab that computes them");
if (!(pack.assignments?.a5?.missions?.find(mission => mission.id === "pg-math")?.labs || []).includes("baseline-variance"))
  throw new Error("baseline variance: the English block lists different labs than the German one");

// 6. The claim this lab exists to qualify. The concept page used to say a baseline lowers the
//    variance "drastisch", full stop; both languages now carry the condition, and the condition
//    is the computed one.
const bvConcept = base.concepts.find(concept => concept.id === "policy-gradient");
const bvTerm = (bvConcept.terms || []).find(term => /Baseline-Subtraktion/.test(term[0]));
const bvTermEn = (pack.concepts?.["policy-gradient"]?.terms || []).find(term => /Baseline subtraction/.test(term[0]));
if (!bvTerm || !bvTermEn) throw new Error("baseline variance: the baseline term of the policy-gradient concept is gone");
if (/drastisch senkt/.test(bvTerm[1]) || /while reducing variance\./.test(bvTermEn[1]))
  throw new Error("baseline variance: the concept page states the unconditional variance claim again -- A5 (c) refutes it above p = 2/3");
for (const [where, text] of [["de", bvTerm[1]], ["en", bvTermEn[1]]])
  if (!text.includes("2/3") || !text.includes("1 − p"))
    throw new Error(`baseline variance: the ${where} concept term must name the computed threshold and the variance-optimal baseline`);
bvChecks += 6;

// 7. Two places the render can go wrong without any printed number moving, both found by the
//    mutation run rather than by reasoning.
//    (a) The row labelled "the same number from the closed form" agrees with the enumeration by
//        construction -- that is its whole point -- so a renderer that quietly prints the
//        enumeration twice is invisible on screen. The value is guarded above; what is left is
//        the call site, which is the shape of [[cs336-mutation-test-blind-spots]] point 4.
const bvLedgerSource = sliceDeclaration(source, "bvLedgerStage");
if (!/bvCell\("closed",\s*bvClosedVarBaseline\(p,\s*b,\s*n\),\s*10\)/.test(bvLedgerSource))
  throw new Error("baseline variance: the row that claims to come from the closed form has to be rendered from bvClosedVarBaseline(p,b,n) -- it agrees with the enumeration by construction, so no printed value can catch this");
if (!/bvCell\("var1",\s*varSingle,\s*10\)/.test(bvLedgerSource) || !/bvCell\("varn",\s*varN,\s*10\)/.test(bvLedgerSource))
  throw new Error("baseline variance: the two variance cells have to keep reading the enumeration, or the comparison with the closed form is a comparison of one number with itself");
//    (b) The sweep's reference column is Var(b=0) and must not depend on the selected baseline.
//        Recomputing it from that baseline prints Delta = 0 in every row -- and the threshold
//        beside it is a declared field, so it stands still. Read the column back across all
//        four baselines instead of trusting the difference.
const bvSweepRows = (compare, n) => [...bvApi.bvStageMarkup({ bvMode: "crossover", bvN: n, bvP: "0.5", bvBaseline: "none", bvCompare: compare })
  .matchAll(/Var\(b=0\) = ([\d.]+) · Var\(b\) = ([\d.]+)/g)].map(hit => [hit[1], hit[2]]);
for (const n of bvApi.BV_N_LADDER) {
  const columns = ["mean", "optimal", "half", "max"].map(compare => bvSweepRows(compare, String(n)));
  for (const rows of columns) {
    if (rows.length !== bvApi.BV_P_LADDER.length) throw new Error(`baseline variance: the sweep prints ${rows.length} rows, not one per probability`);
    rows.forEach(([plain], index) => {
      const expected = bvApi.bvNumber(bvRefVar(bvApi.BV_P_LADDER[index], 0, n), 10);
      if (plain !== expected) throw new Error(`baseline variance: the sweep's reference column reads ${plain} at p=${bvApi.BV_P_LADDER[index]}, n=${n}, but Var(b=0) is ${expected}`);
    });
  }
  const reference = JSON.stringify(columns[0].map(row => row[0]));
  for (const rows of columns)
    if (JSON.stringify(rows.map(row => row[0])) !== reference)
      throw new Error(`baseline variance: the sweep's reference column moves with the selected baseline at n=${n} -- then every row would read a difference of zero`);
  // and the two columns really are two: the population mean differs from no baseline in five
  // of the six rows (they coincide only at the crossover).
  const differing = columns[0].filter(([plain, adjusted]) => plain !== adjusted).length;
  if (differing !== bvApi.BV_P_LADDER.length - 1)
    throw new Error(`baseline variance: the two sweep columns agree in ${bvApi.BV_P_LADDER.length - differing} rows, but only the crossover row may agree`);
  bvChecks += 3;
}

console.log(`baseline variance OK: ${bvChecks} checks, A5 (baseline_calcs) made computable -- the app's enumeration, the handout recomputation and the three closed forms agree over 199 probabilities and 9 baselines, every action-independent baseline leaves E[g] at p(1-p) while the variance runs from 0 to 64x that of no baseline at p = 0.9, the variance minimum sits at b = 1-p with an exact zero in all ${bvZeroStates} probabilities (the population mean reaches it only at p = 0.5), and the four offered baselines stop helping at measured thresholds of 2/3, 3/4, 1/2 and never`);

// ---- panel i18n: the German a lab panel prints straight into the DOM -----------------
// The renderer guard above holds every string a lab hands to tr(). A lab panel is the
// other half, and it never goes through tr(): its markup is a template literal whose
// text nodes reach the DOM as written, and only the language walker translates them
// afterwards -- by exact lookup in the same ui pack, or by one of its patterns. A text
// node with no entry therefore stays German on an English screen, exactly the way the
// three "Noch nicht." hints did before v80, and nothing said so.
//
// This guard reads what the panel really prints. It rebuilds each panel's static text,
// runs it through the app's own translateUiValue with the language pinned to English,
// and requires that no German is left. Reusing the app's translator rather than the ui
// map alone is the point: a pattern that only half-translates a sentence has to fail
// here too, and an exact entry that exists under a slightly different string does not
// rescue it.
const panelTranslator = (() => {
  const stubs = `
    let currentLanguage = "en", exactUiTranslations = {}, compiledUiPatterns = [];
${sliceDeclaration(source, "CORE_UI_TRANSLATIONS")}
${sliceDeclaration(source, "patternSpec")}
${sliceDeclaration(source, "compileUiPatterns")}
${sliceDeclaration(source, "translateExact")}
${sliceDeclaration(source, "translateUiValue")}
    function __install(ui, patterns) {
      exactUiTranslations = { ...CORE_UI_TRANSLATIONS, ...Object.fromEntries(Object.entries(ui)
        .filter(([from, to]) => typeof from === "string" && typeof to === "string")) };
      compiledUiPatterns = compileUiPatterns(patterns);
    }
  `;
  const api = runInNewContext(`${stubs}; ({ __install, translateUiValue })`, {});
  api.__install(pack.ui, pack.ui.__patterns);
  return api.translateUiValue;
})();
// The translator has to be live before it is trusted: a string the app is known to
// translate must come back changed, and one it cannot must come back untouched.
if (panelTranslator("Noch nicht.") === "Noch nicht.")
  throw new Error("panel i18n: the translator is not wired -- a string with a known entry came back unchanged");
if (panelTranslator(" zzz-not-a-string-any-panel-prints") !== " zzz-not-a-string-any-panel-prints")
  throw new Error("panel i18n: the translator changed a string that has no entry, so a pass proves nothing");

// A text node counts as German prose when it carries a word only the German side uses.
// Identifiers, shapes, units and API field names are the same in both languages and are
// deliberately not required to have an entry.
// Words that exist only on the German side. Deliberately conservative: "die", "was",
// "war", "hat", "man" and "all" are English words too, and a list that contains them
// reports every translated sentence as untranslated. An umlaut or an eszett is the
// second, independent signal.
const GERMAN_WORDS = /[äöüÄÖÜß]|(^|[^\p{L}])(der|das|den|dem|des|ein|eine|einen|einem|einer|und|oder|nicht|ist|sind|wird|werden|haben|warum|welche|welcher|welches|mit|von|aus|auf|nach|unter|zwischen|durch|ohne|schon|nur|auch|aber|dann|wenn|weil|dass|sich|kann|muss|soll|darf|jede|jeder|jedes|wie|wo|beim|zum|zur|im|vom|eines|dieser|diese|dieses|jetzt|immer|wieder|kein|keine|keinen)($|[^\p{L}])/iu;
const decodeEntities = value => value
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");

// The static text of one panel template: everything outside a ${...} interpolation.
function panelStaticText(start) {
  let index = start, depth = 0, body = "";
  while (index < source.length) {
    const char = source[index];
    if (char === "\\") { body += source[index] + source[index + 1]; index += 2; continue; }
    if (char === "$" && source[index + 1] === "{") { depth++; index += 2; body += " "; continue; }
    if (depth) {
      if (char === "{") depth++;
      else if (char === "}") depth--;
      index++; continue;
    }
    if (char === "`") break;
    body += char; index++;
  }
  if (index >= source.length) throw new Error("panel i18n: a panel template never closes");
  return body;
}

const panelHits = [...source.matchAll(/if\(id==="([a-z0-9-]+)"\) return `/gu)];
if (panelHits.length < 40)
  throw new Error(`panel i18n: only ${panelHits.length} lab panels found, the markup builder must have changed shape`);
let panelNodes = 0, panelGerman = 0;
const panelLabs = new Set();
for (const hit of panelHits) {
  const body = panelStaticText(hit.index + hit[0].length);
  for (const node of body.matchAll(/>([^<>]+)</gu)) {
    const text = decodeEntities(node[1].replace(/\s+/gu, " ").trim());
    if (text.length < 3 || !GERMAN_WORDS.test(text)) continue;
    panelGerman++;
    panelLabs.add(hit[1]);
    const english = panelTranslator(text);
    if (GERMAN_WORDS.test(english))
      throw new Error(`panel i18n: the ${hit[1]} panel prints "${text.slice(0, 80)}" and an English reader still reads German there`);
    panelNodes++;
  }
}
console.log(`panel i18n OK: ${panelGerman} German text nodes across ${panelLabs.size} lab panels reach the DOM without tr(), every one of them translated`);


// ---- English render: what a lab actually prints to an English reader ------------------
// The two i18n guards above read source: `renderer i18n` collects the literals a renderer
// hands to tr(), `panel i18n` rebuilds the static panel text. Both are blind to a string
// that reaches tr() as a value rather than a literal -- `tr(entry.note)`, `tr(row.label)`
// -- and until this pass they were blind to a conditional as well. The one check nothing
// can slip past is the render itself: build every state of every lab that can render
// without a DOM, run it through the real translator, and look at what comes out.
const englishRender = lab => {
  const ordered = [...lab.names].sort((a, b) => declarationStart(a) - declarationStart(b));
  const stubs = `
    const esc = value => String(value ?? "").replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
    const localeCode = () => "en-US";
${sliceDeclaration(source, "fixedNum")}
`;
  return runInNewContext(`${stubs}${ordered.map(name => sliceDeclaration(source, name)).join("\n")}; ({${ordered.join(",")}})`,
    { localizedUi: panelTranslator });
};
let englishStates = 0, englishLabs = 0;
for (const lab of renderLabs) {
  const api = englishRender(lab);
  const render = api[lab.entry];
  // The state list is built exactly the way render coverage builds it -- same option
  // specs, including the ones that are functions of the state already chosen -- so the
  // two guards can never disagree about which states a lab has.
  const optionsFor = (id, state) => {
    const spec = lab.options[id];
    if (Array.isArray(spec)) return spec;
    if (typeof spec === "function") return spec(state, api);
    return api[spec].map(entry => (entry && typeof entry === "object" ? entry.key : String(entry)));
  };
  let states = [{}];
  for (const id of Object.keys(lab.options)) {
    const next = [];
    for (const state of states) for (const value of optionsFor(id, state)) next.push({ ...state, [id]: value });
    states = next;
  }
  for (const state of states) {
    const html = render(state);
    if (!html) throw new Error(`english render: ${lab.id} renders nothing at ${JSON.stringify(state)}`);
    if (html.includes("${"))
      throw new Error(`english render: ${lab.id} prints an uninterpolated \${...} at ${JSON.stringify(state)} -- a literal inside a double-quoted tr() argument is never substituted`);
    for (const node of html.matchAll(/>([^<>]+)</gu)) {
      const text = decodeEntities(node[1].replace(/\s+/gu, " ").trim());
      if (text.length >= 3 && GERMAN_WORDS.test(text))
        throw new Error(`english render: ${lab.id} prints "${text.slice(0, 90)}" and an English reader reads it in German at ${JSON.stringify(state)}`);
    }
    englishStates++;
  }
  englishLabs++;
}
console.log(`english render OK: ${englishStates} states across ${englishLabs} labs rendered through the real translator, no German left on the screen and no uninterpolated placeholder`);

// ---- basics check: what it offers is what was actually missed ---------------------------
// The optional basics check is the only feature that answers "which foundations can I skip?",
// and until v86 it answered a different question. `slice(0, 3)` took the three lowest area
// scores whatever they were, so a run with every answer correct still offered three refreshers
// -- each labelled 100% -- and a run with five gaps showed three of them and dropped two in
// silence. Nine of the twelve areas also rested on a single three-option question, so an area
// verdict was one question: guessing read 3.33 of 12 areas as fully mastered.
//
// This block runs the app's own `diagnosticGapRows` and `diagnosticGaps` -- sliced out of
// index.html, not retyped -- against constructed answer sheets, so it fails if the selection
// ever drifts back toward a fixed number of suggestions.
{
  const diagnosticAreas = readConstant("DIAGNOSTIC_AREAS");
  const bcContext = {
    DIAGNOSTIC: base.diagnostic,
    DIAGNOSTIC_AREAS: diagnosticAreas,
    Object, Math, Array, JSON
  };
  runInNewContext(
    sliceDeclaration(source, "diagnosticAreaQuestionCount") + "\n" +
    sliceDeclaration(source, "diagnosticGapRows") + "\n" +
    sliceDeclaration(source, "diagnosticGaps") + "\n" +
    "this.gaps = diagnosticGaps;",
    bcContext
  );
  const diagnosticGaps = bcContext.gaps;

  // 1. every area is decided by more than one question, and names a refresher that exists
  const PER_AREA = 3;
  const areaKeys = diagnosticAreas.map(area => area.key);
  if (new Set(areaKeys).size !== areaKeys.length) throw new Error("basics check: an area key appears twice");
  const sourceAreas = [...new Set(base.diagnostic.map(question => question.area))];
  for (const key of sourceAreas)
    if (!areaKeys.includes(key)) throw new Error(`basics check: question area "${key}" has no entry in DIAGNOSTIC_AREAS, so its result would render as a bare key`);
  for (const area of diagnosticAreas) {
    const asked = base.diagnostic.filter(question => question.area === area.key).length;
    if (asked !== PER_AREA)
      throw new Error(`basics check: area "${area.key}" is decided by ${asked} question(s); with fewer than ${PER_AREA} a single guess reads as a cleared area`);
    if (!area.name?.de || !area.name?.en)
      throw new Error(`basics check: area "${area.key}" is missing a name in one language`);
    if (!base.concepts.some(concept => concept.id === area.concept))
      throw new Error(`basics check: area "${area.key}" points at concept "${area.concept}", which does not exist`);
  }
  const bcQuestions = base.diagnostic.length;
  if (bcQuestions !== areaKeys.length * PER_AREA)
    throw new Error(`basics check: ${bcQuestions} questions across ${areaKeys.length} areas is not ${PER_AREA} each`);

  // 2. the selection is the set of missed areas -- all of it, and nothing else
  const sheet = missedAreas => {
    const counts = {}, scores = {};
    for (const key of areaKeys) {
      const correct = missedAreas.includes(key) ? PER_AREA - 1 : PER_AREA;
      counts[key] = { correct, total: PER_AREA };
      scores[key] = Math.round(correct / PER_AREA * 100);
    }
    return { scores, counts };
  };
  const offered = missedAreas => diagnosticGaps(sheet(missedAreas)).gaps.map(row => row.area.key).sort();
  const cases = [
    [],
    ["rl"],
    ["python", "shapes", "math", "grad", "rl"],   // the five-gap case that used to show three
    areaKeys.slice()
  ];
  let bcChecks = 0;
  for (const missed of cases) {
    const got = offered(missed), want = missed.slice().sort();
    if (JSON.stringify(got) !== JSON.stringify(want))
      throw new Error(`basics check: missing ${want.length} areas (${want.join(", ") || "none"}) offers ${got.length} refreshers (${got.join(", ") || "none"})`);
    const clear = diagnosticGaps(sheet(missed)).clear.map(row => row.area.key);
    if (clear.length + got.length !== areaKeys.length)
      throw new Error("basics check: gaps and cleared areas do not partition the twelve areas");
    bcChecks += 2;
  }
  // a perfect run must offer nothing at all -- the defect this block exists for
  if (offered([]).length !== 0)
    throw new Error("basics check: a run with every answer correct still offers a refresher");
  // and the source must not carry a fixed-size suggestion list any more
  const bcRegion = ["diagnosticSummaryHtml", "openDiagnostic", "diagnosticGaps", "diagnosticGapRows"]
    .map(name => sliceDeclaration(source, name)).join("\n");
  if (/\.slice\(0\s*,\s*\d+\)/.test(bcRegion))
    throw new Error("basics check: a fixed-size slice is back in the result path, so the list is a top-N again rather than what was missed");

  // 3. an old stored result carries percentages but no counts; it still has to render
  const legacy = { scores: Object.fromEntries(areaKeys.map((key, index) => [key, index < 4 ? 0 : 100])) };
  const legacyGaps = diagnosticGaps(legacy);
  if (legacyGaps.gaps.length !== 4 || legacyGaps.rows.length !== areaKeys.length)
    throw new Error("basics check: a result stored before per-area counts existed no longer reads back as four gaps");
  bcChecks += 1;

  // 4. how often a pure guess reads an area as cleared -- measured, not asserted from theory.
  // With one question an area cleared on a 1-in-3 guess; with three it takes 1 in 27.
  const bcTrials = 20000;
  let bcCleared = 0, bcCleanRuns = 0;
  let bcSeed = 20260828;
  const bcRandom = () => (bcSeed = (bcSeed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let trial = 0; trial < bcTrials; trial++) {
    const counts = {}, scores = {};
    for (const key of areaKeys) {
      const asked = base.diagnostic.filter(question => question.area === key);
      const correct = asked.filter(question => Math.floor(bcRandom() * question.opts.length) === question.a).length;
      counts[key] = { correct, total: asked.length };
      scores[key] = Math.round(correct / asked.length * 100);
    }
    const cleared = diagnosticGaps({ scores, counts }).clear.length;
    bcCleared += cleared;
    if (!cleared) bcCleanRuns++;
  }
  const bcFalseClear = bcCleared / bcTrials;
  // Compared against the exact figure for the design this replaced, not against a guess about
  // it: one three-option question clears an area with probability 1/3, three of them with 1/27.
  const bcPerArea = bcFalseClear / areaKeys.length;
  if (!(bcPerArea < 1 / 9))
    throw new Error(`basics check: a guessed area still clears with probability ${bcPerArea.toFixed(4)}; one question per area was 0.3333, so the verdict has not become meaningfully harder to guess`);
  if (bcPerArea > 2 / 27 || bcPerArea < 1 / 81)
    throw new Error(`basics check: the measured guess rate ${bcPerArea.toFixed(4)} is nowhere near the 1/27 the three-question design predicts -- either the questions or the scoring changed shape`);

  // 5. in the two banks where a number *is* the answer, both languages print the same figures.
  // Prose is deliberately out of scope: a translation legitimately writes "2D" where the German
  // writes "zweidimensional", and 92 such pairs exist across concepts, formulas and labs.
  const bcRuns = text => (String(text).match(/\d+/g) || []).slice().sort();
  let bcNumeric = 0, bcCompared = 0;
  for (const bank of ["diagnostic", "quiz"]) {
    base[bank].forEach((question, index) => {
      const english = pack[bank]?.[String(index)];
      if (!english) throw new Error(`basics check: ${bank} question ${index} has no English entry`);
      const pairs = [[question.q, english.q], [question.why, english.why],
        ...question.opts.map((option, at) => [option, english.opts[at]])];
      for (const [german, translated] of pairs) {
        if (!/\d/.test(german) && !/\d/.test(translated)) continue;
        bcNumeric++;
        const want = bcRuns(german), got = bcRuns(translated);
        if (JSON.stringify(want) !== JSON.stringify(got))
          throw new Error(`basics check: ${bank}[${index}] prints ${JSON.stringify(got)} in English where the German prints ${JSON.stringify(want)} -- the answer to a fixed-answer question would differ by language`);
        bcCompared += want.length;
      }
    });
  }
  if (bcNumeric < 40)
    throw new Error(`basics check: only ${bcNumeric} numeric strings found across both question banks, the extraction is not seeing them`);

  // 6. the panel this all feeds actually renders, in both languages, for every shape of result.
  // `english render` reaches lab panels only, so without this the new markup would be held by
  // nothing at all -- the blind spot that costs the most is a guard that cannot render.
  const bcRender = {
    CONCEPTS: base.concepts, DIAGNOSTIC: base.diagnostic, DIAGNOSTIC_AREAS: diagnosticAreas,
    GERMAN_I18N_DATA: { concepts: Object.fromEntries(base.concepts.map(concept => [concept.id, concept])) },
    Object, Math, Array, JSON, String, Number, Boolean
  };
  runInNewContext(
    "var currentLanguage='de';var user={diagnostic:null};\n" +
    // `esc` cannot be sliced -- its body carries a regex containing a quote, which the slicer
    // reads as an unterminated string. It escapes markup and is not what this block tests, so a
    // faithful one-liner stands in for it; every function that decides anything is the real one.
    "const esc = value => String(value ?? \"\").replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));\n" +
    sliceDeclaration(source, "localeValue") + "\n" +
    "const byId=(list,id)=>list.find(item=>item.id===id);\n" +
    sliceDeclaration(source, "countWords") + "\n" +
    sliceDeclaration(source, "conceptReadingWords") + "\n" +
    sliceDeclaration(source, "diagnosticAreaQuestionCount") + "\n" +
    sliceDeclaration(source, "diagnosticGapRows") + "\n" +
    sliceDeclaration(source, "diagnosticGaps") + "\n" +
    sliceDeclaration(source, "diagnosticMinutes") + "\n" +
    sliceDeclaration(source, "diagnosticRefresherButtons") + "\n" +
    sliceDeclaration(source, "diagnosticSummaryHtml") + "\n" +
    "this.render=(language,record)=>{currentLanguage=language;user={diagnostic:record};return diagnosticSummaryHtml()};",
    bcRender
  );
  const bcRecords = [null, sheet([]), sheet(["rl"]), sheet(["python", "shapes", "math", "grad", "rl"]),
    sheet(areaKeys.slice()), { scores: Object.fromEntries(areaKeys.map((key, index) => [key, index < 4 ? 0 : 100])) }];
  let bcRendered = 0;
  for (const language of ["de", "en"]) for (const record of bcRecords) {
    const html = bcRender.render(language, record);
    if (record === null) {
      if (html !== "") throw new Error("basics check: an unrun check still renders a result panel");
      continue;
    }
    if (!html) throw new Error(`basics check: the ${language} result panel renders nothing`);
    if (/undefined|NaN|\$\{/.test(html))
      throw new Error(`basics check: the ${language} result panel prints "${html.match(/undefined|NaN|\$\{/)[0]}" -- ${html.slice(Math.max(0, html.search(/undefined|NaN|\$\{/) - 60), html.search(/undefined|NaN|\$\{/) + 60)}`);
    const opens = (html.match(/<(?!\/)[a-z]/g) || []).length, closes = (html.match(/<\//g) || []).length;
    if (opens !== closes)
      throw new Error(`basics check: the ${language} result panel leaves ${opens - closes} tags unbalanced`);
    if (language === "en") for (const node of html.matchAll(/>([^<>]+)</gu)) {
      const text = decodeEntities(node[1].replace(/\s+/gu, " ").trim());
      if (text.length >= 3 && GERMAN_WORDS.test(text))
        throw new Error(`basics check: the English result panel prints "${text.slice(0, 90)}" and an English reader reads it in German`);
    }
    bcRendered++;
  }
  // The numbers on the buttons are read, not just computed: a guard that only checks the values
  // inside diagnosticGaps stays green while the markup prints them the wrong way round.
  {
    const html = bcRender.render("de", sheet(["python", "grad"]));
    const printed = [...html.matchAll(/·\s*(\d+)\/(\d+)/g)].map(hit => `${hit[1]}/${hit[2]}`);
    if (JSON.stringify(printed) !== JSON.stringify(["2/3", "2/3"]))
      throw new Error(`basics check: the two refresher buttons print ${JSON.stringify(printed)} where a sheet missing one of three questions in each area must print ["2/3","2/3"]`);
    bcRendered += 0;
  }
  if (bcRendered !== (bcRecords.length - 1) * 2)
    throw new Error("basics check: not every result shape was rendered in both languages");

  console.log(`basics check OK: ${bcQuestions} questions across ${areaKeys.length} areas, ${PER_AREA} each -- what the result offers is exactly what was missed in all ${cases.length} constructed sheets (a clean run offers 0, the five-gap sheet offers 5 where the old fixed slice showed 3), a pre-v86 stored result still reads back, a guessed area now clears with probability ${bcPerArea.toFixed(4)} against the exact 0.3333 of one three-option question -- ${bcFalseClear.toFixed(2)} of ${areaKeys.length} areas per guessed run, and ${bcCleanRuns} of ${bcTrials} guessed runs clear nothing at all, ${bcCompared} digit runs over ${bcNumeric} numeric strings are identical in both languages, and all ${bcRendered} result panels (${bcRecords.length - 1} shapes in two languages, plus the unrun check that renders nothing) come out balanced with no German left in the English one, each refresher button printing its own 2/3 rather than the inverse`);
}

// ---- review order: what you missed comes back next, not in six weeks --------------------
// The recall deck is the only feature that answers "what should I go over again?", and until
// v87 it answered the opposite. `priority` gave an unrated card 0 and every rated card 1, 2 or
// 3, so *any* rating -- "Noch nicht" included -- sent a card behind all 237 others. The three
// buttons therefore changed nothing a reader could observe until the entire deck had been
// drawn once: 238 cards at ten a session is 24 sessions. A card missed on day one came back
// on day twenty-four, and the deck's own description ("priorisiert neue sowie zuletzt mit
// 'Noch nicht' bewertete Karten") described a behaviour the code did not have.
//
// Two properties have to hold together, which is why a plain reordering is not enough: the
// backlog returns in the very next session, and new material never stalls behind it. This
// block runs the app's own `prioritizedReviewCards` and `REVIEW_POLICY` -- sliced out of
// index.html, not retyped -- and pins both, plus the exact number of the version replaced.
{
  const roNames = ["CONCEPTS", "FORMULAS", "MODULES", "REVIEW_POLICY", "stableReviewKey",
    "reviewConceptCardId", "buildReviewCards", "scopedReviewCards", "prioritizedReviewCards", "reviewStats"];
  const roContext = { Object, Math, Array, JSON, Date, Number, Set, String, Infinity };
  runInNewContext(
    `const byId=(list,id)=>list.find(entry=>entry&&entry.id===id);
     const GERMAN_I18N_DATA={concepts:{}};const LECTURE_GUIDES={};const ASSIGNMENTS=[];
     const lectureUsesConcept=()=>false;let reviewScope="all";let user={reviewState:{}};
     ${roNames.map(name => sliceDeclaration(source, name)).join("\n")}
     this.api={buildReviewCards,prioritizedReviewCards,reviewStats,REVIEW_POLICY,
       setState:next=>{user.reviewState=next}};`,
    roContext
  );
  const { buildReviewCards, prioritizedReviewCards, reviewStats, REVIEW_POLICY: policy, setState } = roContext.api;
  const roDeck = buildReviewCards();
  const SESSION = 10;
  const roEpoch = Date.UTC(2026, 0, 1);
  const rated = (result, at) => policy.next(undefined, result, at);

  // 1. The order itself: what was missed, then what was hard, then what is new, then what is
  //    known. The middle boundary is the whole finding -- before v87 "new" sat in front.
  {
    const state = {};
    setState(state);
    state[roDeck[100].id] = rated("good", roEpoch);
    state[roDeck[101].id] = rated("hard", roEpoch);
    state[roDeck[102].id] = rated("again", roEpoch);
    const shape = prioritizedReviewCards(Infinity).map(card => state[card.id]?.lastResult || "new");
    const expected = ["again", "hard", "new"];
    expected.forEach((want, index) => {
      if (shape[index] !== want)
        throw new Error(`review order: position ${index + 1} of the deck is "${shape[index]}", not "${want}" -- a rated card must not sit behind an unseen one`);
    });
    if (shape[shape.length - 1] !== "good")
      throw new Error(`review order: the last card is "${shape[shape.length - 1]}", not "good" -- what you already know belongs at the back`);
  }

  // 2. The number the replaced version produced, recomputed rather than remembered: with the
  //    old priority a just-missed card ranked dead last, so it returned only after the deck
  //    had been drawn once. Comparing against the exact old figure keeps the claim honest.
  const oldPriority = record => (!policy.attempted(record) ? 0 : record.lastResult === "again" ? 1 : record.lastResult === "hard" ? 2 : 3);
  const oldRank = (() => {
    const state = {};
    const missed = roDeck[0].id;
    state[missed] = rated("again", roEpoch);
    const entries = roDeck.map((card, order) => ({ card, order, record: state[card.id] }));
    entries.sort((a, b) => (oldPriority(a.record) - oldPriority(b.record)) || (policy.time(a.record?.lastAt) - policy.time(b.record?.lastAt)) || (a.order - b.order));
    return entries.findIndex(entry => entry.card.id === missed) + 1;
  })();
  const oldReturnSession = Math.ceil(oldRank / SESSION);
  if (oldRank !== roDeck.length)
    throw new Error(`review order: the replaced ordering is expected to rank a missed card last of ${roDeck.length}; it ranked ${oldRank}. Re-derive the claim before changing the number.`);
  const newRank = (() => {
    const state = {};
    setState(state);
    state[roDeck[0].id] = rated("again", roEpoch);
    return prioritizedReviewCards(Infinity).findIndex(card => card.id === roDeck[0].id) + 1;
  })();
  if (newRank !== 1)
    throw new Error(`review order: a just-missed card ranks ${newRank}, not first`);

  // 3. Sessions, driven the way a reader drives them. Four rating habits, including the two
  //    that break a naive fix: rate everything "again" (a pure-backlog deck would stop dead)
  //    and rate everything "good" (the backlog must not invent work).
  const drive = (rate, sessions) => {
    const state = {};
    setState(state);
    let clock = roEpoch, missed = null, comeback = null, minNew = Infinity, short = null;
    const touched = new Set();
    for (let session = 1; session <= sessions; session++) {
      const cards = prioritizedReviewCards(SESSION);
      if (cards.length !== Math.min(SESSION, roDeck.length)) short = session;
      if (new Set(cards.map(card => card.id)).size !== cards.length)
        throw new Error(`review order: session ${session} showed the same card twice`);
      minNew = Math.min(minNew, cards.filter(card => !policy.attempted(state[card.id])).length);
      for (const card of cards) {
        if (missed && card.id === missed && comeback === null && session > 1) comeback = session;
        const result = rate(card, session);
        if (result !== "good" && !missed) missed = card.id;
        state[card.id] = policy.next(state[card.id], result, clock);
        clock += 60000;
        touched.add(card.id);
      }
      clock += 86400000;
    }
    return { touched: touched.size, comeback, minNew, short, state };
  };
  const RESERVED = Math.floor(SESSION / 2);
  const roAlways = drive(() => "again", 30);
  const roMixed = (() => { let n = 0; return drive(() => (n++ % 3 === 0 ? "again" : "good"), 30); })();
  const roGood = drive(() => "good", 30);
  for (const [label, run] of [["alles Noch-nicht", roAlways], ["jede dritte verfehlt", roMixed], ["alles gewusst", roGood]]) {
    if (run.short !== null)
      throw new Error(`review order (${label}): session ${run.short} was short of ${SESSION} cards while the deck still held some`);
  }
  for (const [label, run] of [["alles Noch-nicht", roAlways], ["jede dritte verfehlt", roMixed]]) {
    if (run.comeback !== 2)
      throw new Error(`review order (${label}): the first missed card returned in session ${run.comeback}, not the next one`);
    if (run.minNew < RESERVED)
      throw new Error(`review order (${label}): one session carried only ${run.minNew} unseen cards; ${RESERVED} of ${SESSION} stay reserved so a backlog can never stop new material`);
  }
  if (roGood.touched !== roDeck.length)
    throw new Error(`review order: a reader who knows everything saw ${roGood.touched} of ${roDeck.length} cards in 30 sessions`);

  // 4. The reservation is for unseen cards only, so it has to lapse once none are left --
  //    otherwise a worked-through deck would pad the session with cards already known.
  {
    const state = {};
    setState(state);
    roDeck.forEach((card, index) => { state[card.id] = rated(index < 20 ? "again" : "good", roEpoch + index * 1000); });
    const session = prioritizedReviewCards(SESSION);
    const open = session.filter(card => state[card.id].lastResult === "again").length;
    if (open !== SESSION)
      throw new Error(`review order: with 20 cards outstanding and nothing unseen, the session held ${open} of them instead of ${SESSION}`);
  }

  // 5. A record written before v87 carries the same three fields, so it has to keep sorting.
  //    Nothing migrates it -- if it ever stopped being read, a reader's history would vanish
  //    silently rather than loudly.
  {
    const state = {};
    setState(state);
    const legacy = { firstAt: "2026-07-01T08:00:00.000Z", lastAt: "2026-07-02T08:00:00.000Z", lastResult: "again" };
    state[roDeck[7].id] = legacy;
    if (!policy.attempted(legacy)) throw new Error("review order: a stored pre-v87 record no longer counts as attempted");
    if (prioritizedReviewCards(Infinity)[0].id !== roDeck[7].id)
      throw new Error("review order: a stored pre-v87 'again' record does not reach the front");
    if (reviewStats("all").again !== 1) throw new Error("review order: the deck summary lost a stored rating");
  }

  // 6. The number reaches the screen. The closing panel is where a reader learns that the
  //    cards they fumbled are coming straight back; a correct sort behind silent prose would
  //    still leave them believing the old behaviour.
  const roPanel = (results, language) => {
    const panelContext = {
      currentLanguage: language,
      reviewSessionResults: results,
      updateReviewDeckUi() {},
      requestAnimationFrame() {},
      document: { getElementById: () => null },
      openModal(title, eyebrow, body) { panelContext.captured = { title, eyebrow, body }; }
    };
    runInNewContext(sliceDeclaration(source, "finishReviewSession") + "\nfinishReviewSession();", panelContext);
    return panelContext.captured.body;
  };
  let roPanels = 0;
  for (const language of ["de", "en"]) {
    const withGaps = roPanel({ again: 3, hard: 1, good: 6 }, language);
    const clean = roPanel({ again: 0, hard: 0, good: 10 }, language);
    for (const [label, body] of [["mit Lücken", withGaps], ["ohne Lücken", clean]]) {
      if (/undefined|NaN|\$\{/.test(body))
        throw new Error(`review order: the ${language} closing panel (${label}) printed an unresolved value`);
      const open = (body.match(/<(\w+)[^>]*>/g) || []).length, close = (body.match(/<\/(\w+)>/g) || []).length;
      if (open - close !== (body.match(/<(br|hr|img|input)\b/g) || []).length)
        throw new Error(`review order: the ${language} closing panel (${label}) is unbalanced`);
      roPanels++;
    }
    // 3 again + 1 hard is the 4 that come back; the clean panel must not claim a backlog.
    if (!withGaps.includes("4"))
      throw new Error(`review order: the ${language} closing panel does not print the 4 cards that return next session`);
    if (/\b4\b/.test(clean))
      throw new Error(`review order: the ${language} closing panel claims a backlog after a clean session`);
    if (language === "de" && !/nächsten Sitzung vorn/.test(withGaps))
      throw new Error("review order: the German closing panel no longer says where the missed cards went");
    if (language === "en" && !/next session/.test(withGaps))
      throw new Error("review order: the English closing panel no longer says where the missed cards went");
  }

  console.log(`review order OK: ${roDeck.length} cards, a session of ${SESSION} -- a card rated "Noch nicht" now ranks ${newRank} of ${roDeck.length} and returns in session 2, where the replaced ordering ranked it ${oldRank} of ${roDeck.length} and brought it back in session ${oldReturnSession}; the deck reads again -> hard -> new -> good, ${RESERVED} of ${SESSION} seats stay reserved for unseen cards so even a reader who rates every card "Noch nicht" still meets ${roAlways.minNew} new ones per session and ${roAlways.touched} cards in 30, the reservation lapses on a worked-through deck (20 outstanding fill all ${SESSION} seats), a stored pre-v87 record still sorts to the front, and ${roPanels} closing panels print the returning count in both languages`);
}

// ---- readme counts: the front page has to count the same app ---------------------------
// The README advertised 48 labs while the app carried 57 -- a number that had simply stopped
// being updated. It is the first thing a reader sees, so it is worth holding to the same
// standard as the app's own prose: every count in that sentence is read back out of the data.
{
  const readme = await readFile(path.join(root, "README.md"), "utf8");
  const glossary = readConstant("GLOSSARY"), symbols = readConstant("SYMBOLS");
  const claims = [
    ["Konzepte", base.concepts.length], ["Formeln", base.formulas.length],
    ["Symbole", symbols.length], ["Glossarbegriffe", glossary.length],
    ["interaktive Labs", base.labs.length]
  ];
  for (const [noun, actual] of claims) {
    const hit = readme.match(new RegExp(`(\\d+)\\s+${noun}\\b`));
    if (!hit) throw new Error(`readme counts: the README no longer states a number of ${noun}`);
    if (Number(hit[1]) !== actual)
      throw new Error(`readme counts: the README advertises ${hit[1]} ${noun}, the app carries ${actual}`);
  }
  console.log(`readme counts OK: ${claims.map(([noun, actual]) => `${actual} ${noun}`).join(", ")} -- every number on the front page read back out of the app`);
}

// ---- lab transfer answers: the explanation the "Lösungsidee" toggle actually opens onto -------
// The transfer answer lives in two homes -- the LAB_TRANSFER_ANSWERS map, and an inline
// `transferAnswer:` on the lab object that every lab written since v72 uses. The merge assigned
// unconditionally, so it did not join the two homes, it erased one: the 11 labs the map does not
// name ended with `transferAnswer === undefined`, and `esc(undefined)` is the empty string. Their
// "Lösungsidee anzeigen" opened onto an empty paragraph. The English overlay reinstalled the field
// from the pack, so the loss was German-only -- invisible to every guard that reads the English
// side. This block runs the app's own merge and its own disclosure renderer, in both languages,
// and recomputes what the replaced merge did rather than restating it.
{
  const labsDecl = sliceDeclaration(source, "LABS");
  const mapDecl = sliceDeclaration(source, "LAB_TRANSFER_ANSWERS");
  const merge = labMergeStatement;

  const runMerge = statement => {
    const box = {};
    runInNewContext(`${labsDecl}\n${mapDecl}\n${statement}\nglobalThis.OUT = LABS;`, box);
    return box.OUT;
  };
  const merged = runMerge(merge);
  if (merged.length !== base.labs.length) throw new Error("lab transfer answers: the sliced LABS is not the app's LABS");

  // The app's own renderer, not a copy: the lab page must keep printing this field through
  // answerDisclosure, or the guard would be proving something the reader never sees.
  const labDetail = sliceDeclaration(source, "renderLabDetail");
  if (!labDetail.includes("answerDisclosure(lab.transferAnswer,"))
    throw new Error("lab transfer answers: renderLabDetail no longer prints transferAnswer through answerDisclosure");
  const renderBox = {};
  // esc is a one-line arrow whose body carries a character class with a quote in it, which
  // sliceDeclaration's quote tracking cannot follow -- so take its line, and check it is one line.
  const escStart = source.indexOf("const esc = value =>");
  const escLine = source.slice(escStart, source.indexOf("\n", escStart));
  if (!escLine.endsWith(";") || !escLine.includes("value ?? \"\""))
    throw new Error("lab transfer answers: esc is no longer the one-line arrow that turns a missing answer into an empty string");
  runInNewContext(`${escLine}\n${sliceDeclaration(source, "answerDisclosure")}\nglobalThis.OUT = answerDisclosure;`, renderBox);
  const disclosure = renderBox.OUT;
  const printedBody = markup => (markup.match(/<p>([\s\S]*)<\/p>/) || [, ""])[1].trim();

  // One home per lab. Two entries for the same id would let the map and the inline text drift
  // apart with only the merge order deciding which one a reader gets.
  const mapBox = {};
  runInNewContext(`${mapDecl}\nglobalThis.OUT = LAB_TRANSFER_ANSWERS;`, mapBox);
  const mapKeys = new Set(Object.keys(mapBox.OUT));
  const rawBox = {};
  runInNewContext(`${labsDecl}\nglobalThis.OUT = LABS;`, rawBox);
  const inlineIds = rawBox.OUT.filter(lab => Object.hasOwn(lab, "transferAnswer")).map(lab => lab.id);
  const both = inlineIds.filter(id => mapKeys.has(id));
  if (both.length) throw new Error(`lab transfer answers: ${both.join(", ")} carry an answer in both homes -- only the merge order decides which one is shown`);
  for (const id of mapKeys) if (!base.labs.some(lab => lab.id === id)) throw new Error(`lab transfer answers: the map answers ${id}, which is not a lab`);

  // German: what the reader opens has to contain the answer, measured on the printed paragraph.
  let printed = 0;
  for (const lab of merged) {
    const body = printedBody(disclosure(lab.transferAnswer, "Lösungsidee anzeigen"));
    if (!body) throw new Error(`lab transfer answers: ${lab.id} opens "Lösungsidee anzeigen" onto an empty paragraph in German`);
    if (/undefined|\[object Object\]/.test(body)) throw new Error(`lab transfer answers: ${lab.id} prints an unresolved value in German`);
    if (body.length < 80) throw new Error(`lab transfer answers: ${lab.id} prints only ${body.length} characters in German`);
    printed++;
  }

  // English: the overlay only copies fields that are listed, so the list is part of the contract.
  const i18nFields = readConstant("I18N_FIELDS");
  if (!(i18nFields.labs || []).includes("transferAnswer"))
    throw new Error("lab transfer answers: I18N_FIELDS.labs no longer carries transferAnswer, so the English overlay would leave the German text standing");
  for (const lab of merged) {
    const english = pack.labs?.[lab.id]?.transferAnswer;
    if (typeof english !== "string" || !english.trim())
      throw new Error(`en.labs.${lab.id}.transferAnswer is missing -- the English reader gets the German answer or none`);
    const body = printedBody(disclosure(english, "Show explanation"));
    if (!body || /undefined/.test(body)) throw new Error(`lab transfer answers: ${lab.id} prints no English explanation`);
    printed++;
  }

  // The number of the replaced version, recomputed instead of remembered: the unconditional
  // assignment has to be shown to leave exactly the inline labs empty. If that stops being true,
  // this fails rather than carrying a stale claim forward.
  const replaced = runMerge("LABS.forEach(item=>{ item.transferAnswer=LAB_TRANSFER_ANSWERS[item.id]; });");
  const lost = replaced.filter(lab => !String(lab.transferAnswer ?? "").trim()).map(lab => lab.id);
  if (lost.length !== inlineIds.length || lost.some(id => !inlineIds.includes(id)))
    throw new Error(`lab transfer answers: the replaced merge is expected to erase exactly the ${inlineIds.length} inline answers, it erased ${lost.length} (${lost.join(", ")})`);
  if (!lost.length) throw new Error("lab transfer answers: no lab keeps its answer inline any more, so this block no longer proves anything -- retake the decision");

  console.log(`lab transfer answers OK: ${merged.length} labs, ${printed} disclosures printed in both languages -- ${inlineIds.length} of them keep their answer inline (${lost.slice(0, 3).join(", ")}, …) where the replaced unconditional merge erased all ${lost.length} to undefined and printed an empty paragraph in German while English still read from the pack, the two homes never name the same lab, and no printed answer is shorter than 80 characters`);
}

// A formula card is where an equation gets built from its purpose, its named quantities and one small
// calculation. Two surfaces put one in front of a reader who walks Lecture 1 to Lecture 17: the lecture
// page prints its own curated list, and a concept page prints that concept's formulas filtered to the
// same list -- falling back to the concept's first formula when the lecture curates none of them.
// A card outside both surfaces exists, but the path never leads there: it is reachable only from the
// formula index or from an assignment page, so the reader meets it at the problem instead of before it.
// Before v89 that was true of eleven of the 79 cards, MFU among them, although Lecture 2 gives MFU its
// own section heading and its formula. The functions below are the app's own, sliced out of index.html
// rather than retyped, so this block cannot pass against a copy that has drifted away from the renderer.
{
  const pathApi = runInNewContext(
    `${["LECTURE_GUIDES", "lectureLearningPages", "conceptFormulaIds"].map(name => sliceDeclaration(source, name)).join("\n")}
     const LECTURE_IDS = Object.keys(LECTURE_GUIDES);
     ({LECTURE_GUIDES, LECTURE_IDS, lectureLearningPages, conceptFormulaIds})`, {});
  const formulaById = new Map(base.formulas.map(formula => [formula.id, formula]));
  const conceptById = new Map(base.concepts.map(concept => [concept.id, concept]));

  // Both surfaces have to keep printing, or the reachability argument below describes a renderer that
  // no longer exists. The primer fallback is read as text for the same reason: it is the only thing
  // that puts a card on a page whose lecture curates none of that concept's formulas.
  const lectureRenderer = sliceDeclaration(source, "renderLectureDetail");
  if (!lectureRenderer.includes("guide.formulas.map(formulaId=>byId(FORMULAS,formulaId))"))
    throw new Error("lecture formulas: the lecture page no longer prints its curated formulas");
  const primerRenderer = sliceDeclaration(source, "conceptExamplePrimer");
  if (!primerRenderer.includes("conceptFormulaIds(c,lectureId)[0]") || !primerRenderer.includes("curatedFormulaId||c.formulas?.[0]"))
    throw new Error("lecture formulas: the concept primer no longer falls back to the concept's first formula, so pages whose lecture curates nothing would show no worked example");
  const conceptRenderer = sliceDeclaration(source, "renderConceptDetail");
  if (!conceptRenderer.includes("conceptFormulaIds(c,lectureId)"))
    throw new Error("lecture formulas: the concept page no longer filters its formulas through the lecture curation");

  // Surface one: what a lecture page itself prints.
  const reachable = new Map();
  const note = (id, where) => { if (!reachable.has(id)) reachable.set(id, []); reachable.get(id).push(where); };
  for (const lectureId of pathApi.LECTURE_IDS) {
    const curated = pathApi.LECTURE_GUIDES[lectureId].formulas || [];
    if (new Set(curated).size !== curated.length) throw new Error(`lecture formulas: ${lectureId} curates the same formula twice`);
    for (const id of curated) {
      if (!formulaById.has(id)) throw new Error(`lecture formulas: ${lectureId} curates ${id}, which is not a formula`);
      note(id, lectureId);
    }
    // Surface two: every learning page of that lecture, through the app's own filter and fallback.
    for (const conceptId of pathApi.lectureLearningPages(lectureId)) {
      const concept = conceptById.get(conceptId);
      if (!concept) throw new Error(`lecture formulas: ${lectureId} leads to ${conceptId}, which is not a concept`);
      const curatedHere = pathApi.conceptFormulaIds(concept, lectureId);
      const printed = curatedHere.length ? curatedHere : (concept.formulas?.[0] ? [concept.formulas[0]] : []);
      for (const id of printed) note(id, `${lectureId}:${conceptId}`);
    }
  }

  // The two cards the path deliberately does not carry. Each names the concept whose subject it is, and
  // that concept has to stay one no lecture teaches: the moment a lecture picks it up, this fails and the
  // placement is decided again instead of silently staying off the path.
  const offPath = [
    ["causal-attention", "causal-mask", "no lecture PDF teaches the causal mask; A1 does, and the assignment page carries it"],
    ["gradient-clip", "clipping", "no lecture PDF teaches clipping; the gradients concept lists the card as a companion"]
  ];
  for (const [formulaId, conceptId] of offPath) {
    if (!formulaById.has(formulaId)) throw new Error(`lecture formulas: the off-path card ${formulaId} no longer exists`);
    if (!selfStudyConcepts.includes(conceptId))
      throw new Error(`lecture formulas: ${conceptId} left the assignment-only list, so ${formulaId} has to be placed on that lecture now`);
    if (reachable.has(formulaId))
      throw new Error(`lecture formulas: ${formulaId} is on the path via ${reachable.get(formulaId).join(", ")} -- it must leave the off-path list`);
  }
  const unreachable = base.formulas.filter(formula => !reachable.has(formula.id)).map(formula => formula.id);
  const declared = offPath.map(([id]) => id);
  for (const id of unreachable)
    if (!declared.includes(id))
      throw new Error(`lecture formulas: ${id} is on no lecture page and no learning page -- walking Lecture 1 to 17 never shows it. Curate it where its source teaches it, or declare it off-path with a reason`);

  // The cards v89 put back, each on the lecture whose own source derives it. Losing one would return a
  // reader to the state where the card exists but the path never reaches it.
  const restored = [
    ["l02", "mfu", "Lecture 2 has the section \"Model FLOPs utilization (MFU)\" and mfu = actual_flop_per_sec / promised_flop_per_sec"],
    ["l02", "training-flops", "Lecture 2: \"Total: 6 (# data points) (# parameters) FLOPs\""],
    ["l02", "linear-map", "Lecture 2 builds nn.Linear and counts its operations"],
    ["l02", "linear-params", "Lecture 2: \"(D K) is the number of parameters\", actual_num_flops = 2 * B * D * K"],
    ["l03", "softmax", "Lecture 3: \"Recall the softmax calculation\" and softmaxes ill-behaved through exponentials"],
    ["l10", "mlp-arithmetic-intensity", "Lecture 10 derives flops == 2*B*D*F over bytes_transferred == 2*B*D + 2*D*F + 2*B*F"],
    ["l10", "attention-arithmetic-intensity", "Lecture 10: assert intensity == S*T / (S + T)"],
    ["l10", "ssm-recurrence", "Lecture 10 has the section \"State-space models\""],
    ["l10", "diffusion-generation", "Lecture 10 has the section \"Diffusion models\""],
    ["l14", "ngram-filter", "Lecture 14: \"Algorithmic tools: n-gram models (KenLM), classifiers (fastText), importance resampling (DSIR)\""],
    ["l14", "fasttext-filter", "Lecture 14 has the section fasttext_main() and \"fastText classifier: bag of word embeddings\""],
    ["l14", "importance-resampling", "Lecture 14 has the section dsir_main() and \"Do importance resampling with p, q, and raw samples\""]
  ];
  for (const [lectureId, formulaId] of restored) {
    if (!(pathApi.LECTURE_GUIDES[lectureId].formulas || []).includes(formulaId))
      throw new Error(`lecture formulas: ${lectureId} no longer curates ${formulaId}, although its own source derives it`);
    if (!reachable.has(formulaId)) throw new Error(`lecture formulas: ${formulaId} is curated but still unreachable`);
  }

  // Adding a card to a lecture also decides which one becomes that page's worked example, because the
  // primer takes the first curated formula in the concept's own order. These three moved, and each moved
  // onto the equation its lecture actually derives -- pinned here so a later edit cannot shift them back
  // unnoticed.
  for (const [lectureId, conceptId, expected] of [
    ["l02", "resource-accounting", "training-flops"],
    ["l02", "training-loop", "mfu"],
    ["l03", "probability", "softmax"],
    ["l10", "alternative-sequence-models", "ssm-recurrence"],
    ["l14", "filtering-mechanics", "ngram-filter"],
    ["l02", "shapes", "matmul"]
  ]) {
    const concept = conceptById.get(conceptId);
    const primer = pathApi.conceptFormulaIds(concept, lectureId)[0] || concept.formulas?.[0];
    if (primer !== expected)
      throw new Error(`lecture formulas: the worked example on ${lectureId}'s ${conceptId} page is ${primer}, expected ${expected}`);
  }

  const lecturePageOnly = [...reachable].filter(([, where]) => where.every(entry => !entry.includes(":"))).map(([id]) => id);
  console.log(`lecture formulas OK: ${reachable.size} of ${base.formulas.length} cards reachable by walking Lecture 1 to 17 (${unreachable.length} declared off-path: ${unreachable.join(", ")}), ${restored.length} of them curated by v89 onto the lecture whose own source derives them, ${lecturePageOnly.length} carried by a lecture page alone (${lecturePageOnly.join(", ")}), and 6 worked-example primers pinned`);
}

// ---- assignment prerequisites: the promised link actually exists ------------------------------
// The assignment page has always told the reader to "open the linked concept", and for eighteen
// versions not one of its eighteen prerequisite cards carried a link -- while all 45 lecture
// prerequisites did. This block holds the repaired half in both directions: every link declared
// here exists in the app and every link in the app is declared here, each one anchored on a term
// its card and its concept genuinely share, and each one really printed by the real renderer in
// both languages with the right home label beside it.
{
  // esc is a one-line arrow whose character class carries a quote, which sliceDeclaration's quote
  // tracking cannot follow -- so take its line, the same way the lab transfer guard does.
  const apEscStart = source.indexOf("const esc = value =>");
  const apEscLine = source.slice(apEscStart, source.indexOf("\n", apEscStart));
  if (!apEscLine.endsWith(";") || !apEscLine.includes("&quot;"))
    throw new Error("assignment prerequisites: esc is no longer the one-line arrow the buttons are escaped with");
  const apApi = runInNewContext(
    `let CONCEPTS = [], MODULES = [], currentLanguage = "de";
     ${apEscLine}
     ${["byId", "localeValue", "lectureNumber", "LECTURE_GUIDES", "ASSIGNMENT_PREREQUISITE_GUIDES", "prerequisiteConceptHome", "assignmentPrerequisitesMarkup"]
       .map(name => sliceDeclaration(source, name)).join("\n")}
     const LECTURE_IDS = Object.keys(LECTURE_GUIDES);
     const load = (concepts, modules, language) => { CONCEPTS = concepts; MODULES = modules; currentLanguage = language; };
     ({GUIDES: ASSIGNMENT_PREREQUISITE_GUIDES,
       render: (assignment, concepts, modules, language) => { load(concepts, modules, language); return assignmentPrerequisitesMarkup(assignment); },
       home: (conceptId, concepts, modules, language) => { load(concepts, modules, language); return prerequisiteConceptHome(conceptId); },
       escape: value => esc(value)})`, {});

  // The shared detector opens with an umlaut class, and these cards legitimately quote "ä" as the
  // worked example of a character that costs two UTF-8 bytes -- an English card carrying it is
  // correct, not untranslated. Only the umlaut signal is dropped; the function words stay, taken
  // from the same source so the two lists can never drift apart, and the control render below
  // proves what is left still sees German.
  if (!GERMAN_WORDS.source.startsWith("[\u00e4\u00f6\u00fc\u00c4\u00d6\u00dc\u00df]|"))
    throw new Error("assignment prerequisites: the shared German detector no longer starts with its umlaut class, so dropping that branch is no longer a safe edit");
  const AP_GERMAN_WORDS = new RegExp(GERMAN_WORDS.source.slice("[\u00e4\u00f6\u00fc\u00c4\u00d6\u00dc\u00df]|".length), GERMAN_WORDS.flags);

  // Retyped independently of index.html: card position, the concepts it may open, and the word the
  // card and the concept have to share. A wrong id passes a bare "does this concept exist?" test;
  // it does not pass a shared term.
  const AP_LINKS = [
    ["a1", 0, "Text, Bytes und Dateien", [["python-engineering", "Bytes"], ["unicode", "UTF-8"]]],
    ["a1", 1, "Tensoren und PyTorch-Zustand", [["shapes", "Shape"], ["pytorch-tensors", "Broadcasting"], ["pytorch-state", "state_dict"]]],
    ["a1", 2, "Vier Rechenideen", [["matmul", "Matrixmultiplikation"], ["logs", "Softmax"], ["gradients", "Kettenregel"]]],
    ["a2", 0, "Datenfluss des A1-Modells", [["embeddings", "Embedding"], ["attention", "Attention"], ["transformer-block", "Feed-Forward"]]],
    ["a2", 1, "GPU-Zeit, Speicher und Arbeit", [["gpu-model", "Speicherhierarchie"], ["roofline", "FLOPs"], ["profiling", "Synchronisation"]]],
    ["a2", 2, "Zahlenformate und gespeicherte Aktivierungen", [["pytorch-tensors", "FP16"], ["checkpointing", "Aktivierung"], ["resource-accounting", "Speicher"]]],
    ["a2", 3, "Prozesse und gemeinsame Kommunikation", [["collectives", "All-Reduce"], ["distributed-runtime", "World Size"]]],
    ["a3", 0, "Potenzgesetze und Log-Log-Diagramme", [["power-laws", "Potenzgesetz"]]],
    ["a3", 1, "Fit, Fehler und unabhängige Prüfung", [["power-laws", "Residu"], ["scaling-optima", "Unsicherheit"]]],
    ["a3", 2, "Kosten zählen und Vergleiche fair halten", [["resource-accounting", "FLOPs"], ["scaling-practice", "Skalierung"]]],
    ["a4", 0, "Dokumente schrittweise lesen", [["data-pipeline", "HTML"], ["python-engineering", "Streaming"]]],
    ["a4", 1, "Filterfehler zählen", [["quality-filtering", "Recall"], ["filtering-mechanics", "Confusion"]]],
    ["a4", 2, "Mengen, Hashes und Ähnlichkeit", [["dedup", "MinHash"], ["bloom-filters", "Hash"]]],
    ["a4", 3, "Parallelität ohne verlorene Herkunft", [["data-pipeline", "Pipeline"], ["training-loop", "Seed"]]],
    ["a5", 0, "Durchschnitt, Streuung und Bedingung", [["probability", "Erwartungswert"]]],
    ["a5", 1, "Antwortwahrscheinlichkeit und Sampling", [["sampling", "Sampling"], ["logs", "Lograum"]]],
    ["a5", 2, "Masken und mehrere kleine Batches", [["rlvr-systems", "Response"], ["training-loop", "Microbatch"]]],
    ["a5", 3, "Mehrere Zufallsstarts", [["probability", "Streuung"], ["training-loop", "Seed"]]]
  ];

  const apConceptText = id => {
    const concept = base.concepts.find(item => item.id === id);
    if (!concept) return null;
    return JSON.stringify(concept) + JSON.stringify(conceptOrientationsDe[id] || {});
  };
  const apGermanConcepts = base.concepts;
  const apEnglishConcepts = base.concepts.map(concept => ({ ...concept, ...(pack.concepts[concept.id] || {}) }));
  const apGermanModules = base.modules;
  const apEnglishModules = base.modules.map(module => ({ ...module, ...(pack.modules[module.id] || {}) }));
  const apFoundations = base.modules.find(module => module.id === "foundations");
  if (!apFoundations) throw new Error("assignment prerequisites: the prerequisite sprint module is gone, so the home label cannot be derived");
  const apLectureConcepts = new Set(Object.values(base.lectureGuides).flatMap(guide => guide.concepts || []));

  // Direction one: every declared link exists in the app, in the declared order.
  let apChecks = 0, apLinkCount = 0;
  const apKinds = { lecture: 0, foundations: 0, "self-study": 0 };
  for (const [assignmentId, index, germanLabel, links] of AP_LINKS) {
    const card = (apApi.GUIDES[assignmentId] || [])[index];
    if (!card) throw new Error(`assignment prerequisites: ${assignmentId}[${index}] has no card any more`);
    if (card.label.de !== germanLabel)
      throw new Error(`assignment prerequisites: ${assignmentId}[${index}] is "${card.label.de}", not the declared "${germanLabel}" -- the table is describing a different card`);
    const declared = links.map(([conceptId]) => conceptId);
    if (JSON.stringify(card.concepts) !== JSON.stringify(declared))
      throw new Error(`assignment prerequisites: ${assignmentId}[${index}] links ${JSON.stringify(card.concepts)}, declared ${JSON.stringify(declared)}`);
    if (new Set(declared).size !== declared.length)
      throw new Error(`assignment prerequisites: ${assignmentId}[${index}] opens the same concept twice`);
    // A digit run or a written-out tensor shape in the German card that the English one does not
    // repeat would only ever be shown to the English reader, and no other guard reads these inline
    // bilingual fields (v84, point 20). Numbers spelled as words ("zwei Bytes" against "two bytes")
    // are deliberately outside this model, the same way the thousands grouping is: a word list
    // would be a translation dictionary, not a check.
    const apTokens = text => [...(String(text).match(/\[[^\]]*\]|\d+/gu) || [])].sort();
    for (const field of ["label", "explain"]) {
      const german = apTokens(card[field].de), english = apTokens(card[field].en);
      if (JSON.stringify(german) !== JSON.stringify(english))
        throw new Error(`assignment prerequisites: ${assignmentId}[${index}].${field} names ${JSON.stringify(german)} in German and ${JSON.stringify(english)} in English`);
      apChecks++;
    }
    const cardText = `${card.label.de} ${card.explain.de}`;
    for (const [conceptId, anchor] of links) {
      const conceptText = apConceptText(conceptId);
      if (!conceptText) throw new Error(`assignment prerequisites: ${assignmentId}[${index}] points at "${conceptId}", which is not a concept -- the button would be dead`);
      if (!cardText.includes(anchor))
        throw new Error(`assignment prerequisites: ${assignmentId}[${index}] no longer says "${anchor}", so its link to ${conceptId} has lost the term the two shared`);
      if (!conceptText.includes(anchor))
        throw new Error(`assignment prerequisites: concept ${conceptId} no longer says "${anchor}", so it is not the page ${assignmentId}[${index}] promises`);
      apChecks += 2;
      apLinkCount++;
      apKinds[apApi.home(conceptId, apGermanConcepts, apGermanModules, "de").kind]++;
    }
  }
  // Direction two: no link in the app is missing from the table. The half that already exists always
  // feels like the whole one (v89), so both are written out.
  for (const [assignmentId, cards] of Object.entries(apApi.GUIDES)) {
    cards.forEach((card, index) => {
      if (!Array.isArray(card.concepts) || !card.concepts.length)
        throw new Error(`assignment prerequisites: ${assignmentId}[${index}] carries no concept, so the reader is told to open a link that is not there`);
      if (!AP_LINKS.some(row => row[0] === assignmentId && row[1] === index))
        throw new Error(`assignment prerequisites: ${assignmentId}[${index}] is not in the table, so its links are unanchored`);
    });
  }
  if (apLinkCount !== AP_LINKS.reduce((sum, row) => sum + row[3].length, 0)) throw new Error("assignment prerequisites: link count disagrees with the table");
  // All three homes have to occur, or a renderer collapsed to one branch would still pass.
  for (const [kind, count] of Object.entries(apKinds))
    if (!count) throw new Error(`assignment prerequisites: no link is at home in "${kind}", so that branch of the home label is never exercised`);

  // The home label, derived a second way and compared against the app's own function.
  for (const concept of base.concepts) {
    const lectureId = Object.keys(base.lectureGuides).find(id => (base.lectureGuides[id].concepts || []).includes(concept.id));
    const expected = lectureId ? `Lecture ${Number(lectureId.slice(1))}`
      : apFoundations.concepts.includes(concept.id) ? "Modul 00" : "Selbststudium";
    const got = apApi.home(concept.id, apGermanConcepts, apGermanModules, "de");
    if (got.label !== expected)
      throw new Error(`assignment prerequisites: ${concept.id} is labelled "${got.label}", expected "${expected}"`);
    apChecks++;
  }

  // The section stays where a prerequisite belongs, and keeps saying what it now delivers.
  const apTemplate = source.slice(source.indexOf("function renderAssignmentDetail"), source.indexOf("function copyText"));
  if (!apTemplate.includes("${assignmentPrerequisitesMarkup(a)}")) throw new Error("assignment prerequisites: the assignment page no longer renders the section");
  if (!(apTemplate.indexOf("assignmentPrerequisitesMarkup(a)") < apTemplate.indexOf('"What is required?"')))
    throw new Error("assignment prerequisites: the section belongs above the topic blocks");
  for (const promise of ["Öffne ein verknüpftes Konzept nur, wenn du mehr Details brauchst", "Open a linked concept only when you need more detail"])
    if (!apTemplate.includes(promise)) throw new Error(`assignment prerequisites: the page stopped promising the link ("${promise.slice(0, 40)}")`);

  // The render is the test (v82): the buttons are read back out of the real markup, in both
  // languages, rather than out of the source that produces it.
  let apButtons = 0;
  for (const assignment of base.assignments) {
    for (const language of ["de", "en"]) {
      const concepts = language === "en" ? apEnglishConcepts : apGermanConcepts;
      const modules = language === "en" ? apEnglishModules : apGermanModules;
      const markup = apApi.render(assignment, concepts, modules, language);
      const cards = apApi.GUIDES[assignment.id];
      const rendered = [...markup.matchAll(/data-open-concept="([a-z0-9-]+)"/gu)].map(hit => hit[1]);
      const wanted = cards.flatMap(card => card.concepts);
      if (JSON.stringify(rendered) !== JSON.stringify(wanted))
        throw new Error(`assignment prerequisites: ${assignment.id}/${language} renders ${JSON.stringify(rendered)}, expected ${JSON.stringify(wanted)}`);
      for (const card of cards) {
        for (const field of ["label", "explain"]) {
          const text = apApi.escape(card[field][language]);
          if (!markup.includes(text))
            throw new Error(`assignment prerequisites: ${assignment.id}/${language} does not print the ${field} of "${card.label.de}"`);
        }
        for (const conceptId of card.concepts) {
          const concept = concepts.find(item => item.id === conceptId);
          const home = apApi.home(conceptId, concepts, modules, language);
          const button = `<button class="button ghost small" data-open-concept="${conceptId}">${apApi.escape(concept.title)} · ${apApi.escape(home.label)}</button>`;
          if (!markup.includes(button))
            throw new Error(`assignment prerequisites: ${assignment.id}/${language} does not print the whole button for ${conceptId} (${button.slice(0, 120)})`);
          apButtons++;
          apChecks++;
        }
      }
      // The buttons have to sit in the actions row the rest of the app styles, not loose in the
      // card body -- a whole-fragment button check is blind to the box around it.
      const rows = (markup.match(/<div class="accordion-actions">/gu) || []).length;
      if (rows !== cards.filter(card => card.concepts.length).length)
        throw new Error(`assignment prerequisites: ${assignment.id}/${language} puts its links in ${rows} action rows, expected one per card`);
      for (const conceptId of cards.flatMap(card => card.concepts))
        if (!new RegExp(`<div class="accordion-actions">(?:(?!</div>).)*data-open-concept="${conceptId}"`, "u").test(markup))
          throw new Error(`assignment prerequisites: ${assignment.id}/${language} renders ${conceptId} outside the action row`);
      const opens = (markup.match(/<article/gu) || []).length, closes = (markup.match(/<\/article>/gu) || []).length;
      if (opens !== cards.length || closes !== cards.length)
        throw new Error(`assignment prerequisites: ${assignment.id}/${language} renders ${opens}/${closes} cards for ${cards.length} prerequisites`);
      if (markup.includes("undefined") || markup.includes("${"))
        throw new Error(`assignment prerequisites: ${assignment.id}/${language} leaves an undefined value or an uninterpolated placeholder on the screen`);
      if (language === "en") {
        const residue = markup.replace(/<[^>]*>/gu, " ").split(/\s{2,}/u).map(part => part.trim()).filter(part => part && AP_GERMAN_WORDS.test(part));
        if (residue.length) throw new Error(`assignment prerequisites: ${assignment.id}/en still shows German -- ${residue[0].slice(0, 90)}`);
      }
      apChecks += 3;
    }
  }
  // A control the other way round: with the German pack the English render must fail the same
  // scan, or the scan is blind and every "no German left" above means nothing.
  {
    const germanMarkup = apApi.render(base.assignments[0], apGermanConcepts, apGermanModules, "de");
    const germanResidue = germanMarkup.replace(/<[^>]*>/gu, " ").split(/\s{2,}/u).map(part => part.trim()).filter(part => part && AP_GERMAN_WORDS.test(part));
    if (!germanResidue.length) throw new Error("assignment prerequisites: the German detector sees nothing in the German render, so it cannot be trusted on the English one");
    apChecks++;
  }
  const apHomes = Object.entries(apKinds).map(([kind, count]) => `${count} ${kind}`).join(", ");
  console.log(`assignment prerequisites OK: ${apChecks} checks -- ${apLinkCount} concept links across ${AP_LINKS.length} cards, each anchored on a term its card and its concept share, all ${apButtons} buttons read back out of the real markup in both languages (${apHomes}), where before this the page told the reader to open a link that no card carried`);
}

// ---- number helpers: a default digit count only where a caller omits it ----------------------
// Sixteen lab helpers took (value, digits) and nine of them resolved `digits===undefined?N:digits`
// although no call site ever omitted the argument. A default nobody reaches is not harmless: it
// reads like a documented precision, so the next reader trusts a number that the branch never
// produces. This block holds the invariant in both directions -- a helper carries a default
// exactly when some caller relies on it -- and it forbids handing such a helper to a callback,
// where an array index would silently arrive as the digit count.
{
  const nhPattern = /function (\w+)\(value,\s*digits\)\{([^\n]*?)\}\n/gu;
  const nhHelpers = [];
  for (const hit of source.matchAll(nhPattern)) {
    const [, name, body] = hit;
    if (!/fixedNum\(|Number\(value\)|toLocaleString/u.test(body) && !nhHelpers.some(helper => body.includes(`${helper.name}(`))) continue;
    nhHelpers.push({ name, body, hasDefault: /digits===undefined\?\d+:digits/u.test(body) });
  }
  if (nhHelpers.length < 12) throw new Error(`number helpers: only ${nhHelpers.length} (value, digits) helpers found, which is too few to be the real set`);
  // One grouping rule for every displayed number. Before v92 fixedNum suppressed the thousands
  // separator while the eleven integer helpers and the seven older locale-aware ones kept it, so a
  // single German ledger could read "43.200 s" one row above "43200,0000 s". No formatter may opt
  // out any more -- and the app's own prose groups its thousands 349 times, so this is the side
  // the mismatch had to be resolved to.
  const nhOptOut = (source.match(/useGrouping\s*:\s*false/gu) || []).length;
  if (nhOptOut) throw new Error(`number helpers: ${nhOptOut} formatter(s) still switch the thousands separator off, so one table would group and the next would not`);
  // One call site's argument count, read by walking the parentheses rather than by splitting on
  // commas -- a template literal argument carries commas of its own.
  const nhArgCount = (text, open) => {
    let index = open, depth = 1, quote = "", escaped = false, commas = 0, empty = true;
    for (; index < text.length && depth; index++) {
      const char = text[index];
      if (quote) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === quote) quote = ""; continue; }
      if (char === '"' || char === "'" || char === "`") { quote = char; empty = false; continue; }
      if ("[({".includes(char)) depth++;
      else if ("])}".includes(char)) { depth--; if (!depth) break; }
      else if (char === "," && depth === 1) commas++;
      if (!/\s/u.test(char)) empty = false;
    }
    return empty ? 0 : commas + 1;
  };
  let nhChecks = 0, nhWithDefault = 0, nhCalls = 0;
  for (const helper of nhHelpers) {
    let oneArg = 0, total = 0;
    for (const hit of source.matchAll(new RegExp(`(?<![\\w.$])${helper.name}\\(`, "gu"))) {
      if (source.slice(Math.max(0, hit.index - 9), hit.index).includes("function")) continue;
      total++;
      if (nhArgCount(source, hit.index + hit[0].length) === 1) oneArg++;
    }
    if (!total) throw new Error(`number helpers: ${helper.name} is never called, so it is dead code`);
    if (helper.hasDefault && !oneArg)
      throw new Error(`number helpers: ${helper.name} resolves a default digit count that no caller reaches -- it documents a precision the branch never produces`);
    if (!helper.hasDefault && oneArg)
      throw new Error(`number helpers: ${helper.name} is called with one argument ${oneArg} time(s) but has no default, so it would format with undefined digits`);
    const bare = [...source.matchAll(new RegExp(`(?<![\\w.$])${helper.name}(?!\\s*\\()`, "gu"))].length;
    if (bare) throw new Error(`number helpers: ${helper.name} appears ${bare} time(s) without a call -- handed to a callback, an array index arrives as the digit count`);
    nhWithDefault += helper.hasDefault ? 1 : 0;
    nhCalls += total;
    nhChecks += 3;
  }
  console.log(`number helpers OK: ${nhChecks} checks -- ${nhHelpers.length} (value, digits) helpers over ${nhCalls} call sites, ${nhWithDefault} carry a default digit count and every one of them is reached by a one-argument caller, the other ${nhHelpers.length - nhWithDefault} carry none and are never called with one argument, and none is ever passed as a callback`);
}

// ---- attribute i18n: what a screen reader hears in English ----------------------------------
// The language walker translates text nodes and, since it was extended, the six attributes in
// I18N_ATTRIBUTES too -- but only by looking the value up in the same ui pack. A German
// aria-label with no entry therefore survives the switch to English, silently: nothing on the
// visible page changes, and only a screen-reader user notices. Twelve lab stages announced
// themselves in German that way ("Interaktive Rechnung zur Kompressionsrate"). This block reads
// the attributes out of the markup, pushes them through the app's own translator, and requires
// English on the other side.
{
  // Written without spaces around "=", which readConstant cannot find; sliceDeclaration can.
  const atAttributes = runInNewContext(`${sliceDeclaration(source, "I18N_ATTRIBUTES")}; I18N_ATTRIBUTES`, {});
  if (!Array.isArray(atAttributes) || !atAttributes.includes("aria-label") || !atAttributes.includes("placeholder"))
    throw new Error("attribute i18n: I18N_ATTRIBUTES no longer covers the attributes a reader actually hears");
  // The walker has to run over attributes at all, and the observer has to keep doing it for
  // markup rendered after the switch -- both are what makes an entry reach the screen.
  const atLocalize = sliceDeclaration(source, "localizeElementAttributes");
  if (!atLocalize.includes("I18N_ATTRIBUTES.forEach") || !atLocalize.includes("element.setAttribute(attribute,next)"))
    throw new Error("attribute i18n: localizeElementAttributes no longer writes the translated value back");
  if (!sliceDeclaration(source, "localizeSubtree").includes("localizeElementAttributes(node,reverse)"))
    throw new Error("attribute i18n: the subtree walker no longer localizes attributes, so only the first element would be reached");
  if (!sliceDeclaration(source, "startI18nObserver").includes("attributeFilter:I18N_ATTRIBUTES"))
    throw new Error("attribute i18n: the observer no longer watches the localized attributes");
  // Only static values can be read here; a value carrying ${...} is built at render time and is
  // held by `renderer i18n` and `english render` instead. Both halves are named so neither is
  // mistaken for the whole.
  const atStatic = new Map(), atDynamic = new Set();
  for (const attribute of atAttributes) {
    for (const hit of source.matchAll(new RegExp(`${attribute}="([^"]*)"`, "gu"))) {
      const value = hit[1].trim();
      if (!value) continue;
      if (value.includes("${")) { atDynamic.add(value); continue; }
      if (!/\p{L}/u.test(value)) continue;
      if (!atStatic.has(value)) atStatic.set(value, attribute);
    }
  }
  if (atStatic.size < 30) throw new Error(`attribute i18n: only ${atStatic.size} static attribute values found, so this guard would pass vacuously`);
  const atGerman = [...atStatic].filter(([value]) => GERMAN_WORDS.test(value));
  if (!atGerman.length) throw new Error("attribute i18n: no German attribute value found at all, which means the detector stopped seeing them");
  const atLeft = [];
  for (const [value, attribute] of atGerman) {
    const english = panelTranslator(value);
    if (english === value || GERMAN_WORDS.test(english)) atLeft.push(`[${attribute}] ${value}`);
  }
  if (atLeft.length)
    throw new Error(`attribute i18n: ${atLeft.length} attribute value(s) stay German for an English reader -- ${atLeft.slice(0, 3).join(" · ")}`);
  // And the control: the translator has to be seeing these strings at all, not returning
  // everything unchanged for some unrelated reason.
  if (panelTranslator("Interaktive Rechnung zur Kompressionsrate") === "Interaktive Rechnung zur Kompressionsrate")
    throw new Error("attribute i18n: the translator returns a known lab-stage label unchanged, so the pass above proves nothing");
  console.log(`attribute i18n OK: ${atStatic.size} static values across ${atAttributes.length} localized attributes, ${atGerman.length} of them German and every one translated by the app's own translator (${atDynamic.size} more are built at render time and held by renderer i18n / english render)`);
}

// ---- formula sources: a card may only name a lecture that carries it ------------------------
// v89 closed one direction ("a lecture that curates a card must be cited by it") and named the
// other as open. This is the other: a card's sources field is a claim about where the equation
// comes from, and five cards claimed a lecture that neither shows nor mentions them --
// cross-entropy and transformer-params pointed at Lecture 2 (0 hits for "cross entropy"; L2
// counts parameters exactly, never 12 L d^2), embedding-params at Lecture 3 (whose twenty
// "embedding" hits are all position embeddings), logistic at Lecture 14 (0 hits for "logistic"
// and "sigmoid"), and speedup at Lecture 7 (0 hits for "speedup" or "Amdahl"). Only
// memory-state's claim on Lecture 2 was real, and Lecture 2 now curates it.
{
  const fsFormulas = base.formulas;
  const fsGuides = base.lectureGuides;
  const fsConceptsOf = id => base.concepts.filter(concept => (concept.formulas || []).includes(id)).map(concept => concept.id);
  // Two citations are carried by the lecture's own slides rather than by its curated list or a
  // shared concept. Each is written down with what the slides actually say, so the exception is
  // a decision on record instead of a hole.
  const fsProseBacked = new Map([
    ["linear-map:l03", 'Lecture 3: "Linear layers (and layernorm) have no bias" and "More generally: dropping bias terms"'],
    ["compute-optimal-predictions:l09", 'Lecture 9 is the compute-optimal lecture itself ("Picking optimal data mixture", "selecting the optimal batch")']
  ]);
  let fsBacked = 0, fsProse = 0, fsCited = 0;
  const fsUnbacked = [];
  for (const formula of fsFormulas) {
    for (const sourceId of formula.sources || []) {
      if (!/^l\d+$/u.test(sourceId)) continue;
      fsCited++;
      const guide = fsGuides[sourceId];
      if (!guide) throw new Error(`formula sources: ${formula.id} cites ${sourceId}, which is not a lecture`);
      const curates = (guide.formulas || []).includes(formula.id);
      const teaches = fsConceptsOf(formula.id).some(conceptId => (guide.concepts || []).includes(conceptId));
      if (curates || teaches) { fsBacked++; continue; }
      const key = `${formula.id}:${sourceId}`;
      if (fsProseBacked.has(key)) { fsProse++; continue; }
      fsUnbacked.push(key);
    }
  }
  if (fsUnbacked.length)
    throw new Error(`formula sources: ${fsUnbacked.length} card(s) name a lecture that neither curates them nor teaches a concept that links them, and that is not on the recorded prose list -- ${fsUnbacked.join(", ")}`);
  // Both directions, so the exception list cannot outlive what it excuses.
  for (const key of fsProseBacked.keys()) {
    const [formulaId, lectureId] = key.split(":");
    const formula = fsFormulas.find(entry => entry.id === formulaId);
    if (!formula) throw new Error(`formula sources: the recorded exception ${key} names a card that no longer exists`);
    if (!(formula.sources || []).includes(lectureId)) throw new Error(`formula sources: ${formulaId} no longer cites ${lectureId}, so the recorded exception is stale`);
    if ((fsGuides[lectureId].formulas || []).includes(formulaId)) throw new Error(`formula sources: ${lectureId} now curates ${formulaId}, so the prose exception should be dropped`);
  }
  // And the five repaired cards stay repaired: none of them may cite a lecture again without
  // that lecture carrying them, which the rule above already enforces -- pinned by name here so
  // a reintroduced claim reads as a regression rather than a new decision.
  for (const [formulaId, forbidden] of [["cross-entropy", "l02"], ["embedding-params", "l03"],
    ["transformer-params", "l02"], ["logistic", "l14"], ["speedup", "l07"]]) {
    const formula = fsFormulas.find(entry => entry.id === formulaId);
    if (!formula) throw new Error(`formula sources: ${formulaId} is gone`);
    if ((formula.sources || []).includes(forbidden))
      throw new Error(`formula sources: ${formulaId} cites ${forbidden} again, although that lecture's own slides never derive it`);
  }
  if (!(fsGuides.l02.formulas || []).includes("memory-state"))
    throw new Error("formula sources: Lecture 2 must curate memory-state -- its trace computes 4 * (params + activations + gradients + optimizer states), which is exactly that card");
  console.log(`formula sources OK: ${fsCited} lecture citations across ${fsFormulas.length} cards -- ${fsBacked} carried by the lecture's curated list or by a concept it teaches, ${fsProse} by the lecture's own slides on a recorded list, 0 unbacked, and the five repaired claims stay repaired while Lecture 2 now shows memory-state`);
}

// ---- concept experiments: the page where reading turns into doing ---------------------------
// The method on the front page is five steps, and step 2 is "do that lecture's lab". A concept
// page was the one surface that offered none: `data-open-lab` appeared four times in the whole
// markup and renderConceptDetail was not one of them, so every route that ends on a concept --
// a prerequisite card, the basics check's refresher, the self-study section -- ended in reading.
// The reason was a data gap: labs carry no concept list, and the containers that hold both hold
// many of each. LAB_CONCEPTS closes it, and this block holds three things: the table may only
// narrow what the app's own structure already says, the concept page really renders it, and the
// concepts still without an experiment are counted rather than hidden.
{
  const clApi = runInNewContext(
    `${sliceDeclaration(source, "LAB_CONCEPTS")}
     const LABS = ${JSON.stringify(base.labs.map(lab => ({ id: lab.id, title: lab.title, desc: lab.desc, time: lab.time })))};
     ${sliceDeclaration(source, "conceptLabs")}
     ({LAB_CONCEPTS, conceptLabs})`, {});

  // An independent witness (v89, point 24): every pair has to co-occur in a lecture guide, a
  // module or an assignment mission. The table is allowed to say which of a container's concepts
  // a lab computes; it is not allowed to invent a pairing the app never made.
  const clContainers = [];
  for (const [lectureId, guide] of Object.entries(base.lectureGuides)) clContainers.push([`lecture ${lectureId}`, guide.labs || [], guide.concepts || []]);
  for (const module of base.modules) clContainers.push([`module ${module.id}`, module.labs || [], module.concepts || []]);
  for (const assignment of base.assignments) for (const mission of assignment.missions || []) clContainers.push([`${assignment.id}:${mission.id}`, mission.labs || [], mission.concepts || []]);
  if (clContainers.length < 30) throw new Error("concept experiments: too few containers found to check co-location against");
  let clPairs = 0;
  for (const [labId, concepts] of Object.entries(clApi.LAB_CONCEPTS)) {
    for (const conceptId of concepts) {
      clPairs++;
      const where = clContainers.find(([, labs, list]) => labs.includes(labId) && list.includes(conceptId));
      if (!where) throw new Error(`concept experiments: ${labId} claims to compute ${conceptId}, but no lecture, module or mission puts the two together -- the table may narrow the app's structure, not invent a link`);
    }
  }

  // The render, in both languages, for all 75 concepts.
  const clEsc = source.slice(source.indexOf("const esc = value =>"), source.indexOf("\n", source.indexOf("const esc = value =>")));
  const clRender = runInNewContext(
    `let currentLanguage = "de";
     ${clEsc}
     ${sliceDeclaration(source, "LAB_CONCEPTS")}
     ${sliceDeclaration(source, "conceptLabs")}
     const LAB_OBJECTIVES = ${JSON.stringify(labObjectives)};
     ${sliceDeclaration(source, "OBJECTIVE_LAB_IDS")}
     ${sliceDeclaration(source, "labHasObjectiveCheck")}
     ${sliceDeclaration(source, "labCheckPassed")}
     ${sliceDeclaration(source, "labCard")}
     ${sliceDeclaration(source, "conceptLabsMarkup")}
     let LABS = [], user = { labChecks: {} };
     ({set:(labs,language)=>{LABS=labs;currentLanguage=language;},markup:concept=>conceptLabsMarkup(concept)})`,
    {});
  const clGermanLabs = base.labs;
  const clEnglishLabs = base.labs.map(lab => ({ ...lab, ...(pack.labs[lab.id] || {}) }));
  let clWith = 0, clWithout = 0, clButtons = 0, clChecks = 0;
  for (const concept of base.concepts) {
    const expected = base.labs.filter(lab => (clApi.LAB_CONCEPTS[lab.id] || []).includes(concept.id)).map(lab => lab.id);
    if (expected.length) clWith++; else clWithout++;
    for (const language of ["de", "en"]) {
      clRender.set(language === "en" ? clEnglishLabs : clGermanLabs, language);
      const markup = clRender.markup(concept);
      const rendered = [...markup.matchAll(/data-open-lab="([a-z0-9-]+)"/gu)].map(hit => hit[1]);
      if (JSON.stringify(rendered) !== JSON.stringify(expected))
        throw new Error(`concept experiments: ${concept.id}/${language} renders ${JSON.stringify(rendered)}, expected ${JSON.stringify(expected)}`);
      if (!expected.length && markup !== "")
        throw new Error(`concept experiments: ${concept.id}/${language} has no experiment but still prints a section`);
      if (expected.length) {
        const labs = language === "en" ? clEnglishLabs : clGermanLabs;
        for (const labId of expected) {
          const lab = labs.find(entry => entry.id === labId);
          if (!markup.includes(`<span class="compact-row-title">${clRender.markup && ""}${lab.title.replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]))}</span>`))
            throw new Error(`concept experiments: ${concept.id}/${language} does not print the title of ${labId}`);
          clButtons++;
        }
        if (markup.includes("undefined") || markup.includes("${"))
          throw new Error(`concept experiments: ${concept.id}/${language} leaves an undefined value or an uninterpolated placeholder on the screen`);
        if (language === "en") {
          const residue = markup.replace(/<[^>]*>/gu, " ").split(/\s{2,}/u).map(part => part.trim()).filter(part => part && GERMAN_WORDS.test(part));
          if (residue.length) throw new Error(`concept experiments: ${concept.id}/en still shows German -- ${residue[0].slice(0, 80)}`);
        }
      }
      clChecks += 2;
    }
  }
  // The call site, not only the function (v78's lesson): a correct markup helper nobody calls
  // renders nothing.
  const clConceptPage = sliceDeclaration(source, "renderConceptDetail");
  if (!clConceptPage.includes("${conceptLabsMarkup(c)}"))
    throw new Error("concept experiments: the concept page does not call conceptLabsMarkup, so the section exists but is never rendered");
  if (!(clConceptPage.indexOf("conceptLabsMarkup(c)") > clConceptPage.indexOf("Common misconceptions")))
    throw new Error("concept experiments: the experiments belong after the misconceptions, where the reading ends");
  // Every lab stays reachable from at least one concept, so the map cannot quietly orphan one.
  const clReached = new Set(Object.entries(clApi.LAB_CONCEPTS).filter(([, list]) => list.length).map(([labId]) => labId));
  if (clReached.size !== base.labs.length)
    throw new Error(`concept experiments: only ${clReached.size} of ${base.labs.length} labs are reachable from a concept page`);
  const clOrphans = base.concepts.filter(concept => !base.labs.some(lab => (clApi.LAB_CONCEPTS[lab.id] || []).includes(concept.id))).map(concept => concept.id);
  if (clWithout !== clOrphans.length) throw new Error("concept experiments: the two counts of concepts without an experiment disagree");
  if (clWith < 50) throw new Error(`concept experiments: only ${clWith} concepts offer an experiment, which is below what the map is supposed to deliver`);
  console.log(`concept experiments OK: ${clChecks} checks -- ${clPairs} lab/concept pairs, every one of them co-located by a lecture, module or mission rather than invented, ${clWith} of ${base.concepts.length} concept pages now offer the experiment that computes them (${clButtons} buttons read back out of the real markup in both languages), all ${base.labs.length} labs reachable from a concept, and the remaining ${clWithout} concepts print no section at all rather than an empty one (${clOrphans.slice(0, 6).join(", ")}${clOrphans.length > 6 ? ", …" : ""})`);
}

// ---- lab render sweep: every lab, through the real app, without a browser -------------------
// `render coverage` above proves four sharp properties, but only for the thirteen labs whose
// stage functions were converted to take an injected slider binding. The other 45 read the DOM
// themselves, so no guard could call them at all -- and "the guard is green" said nothing about
// them (v80, point 7). Converting 45 more labs by hand is a large change to the app; this block
// takes the other route and gives the guard a DOM instead. The whole page script is evaluated
// with a small stub (getElementById, value, innerHTML, hidden, options), which is enough for
// labMarkup() and initLab() to run exactly as the browser runs them.
//
// What that immediately found: `fmtNum` in the resources lab read `returnfixedNum(...)` --
// `return` and the helper name with no space between them, so the identifier did not exist and
// the lab threw a ReferenceError for every value at or above one million. Every realistic model
// is above one million. It was live on the deployed site and no guard could see it, because no
// guard could render that lab.
{
  const lrScript = source.slice(source.indexOf("<script>") + 8, source.lastIndexOf("</script>"));
  const lrBody = lrScript.replace(/\n\s*init\(\);\s*$/u, "\n");
  if (lrBody === lrScript) throw new Error("lab render sweep: the trailing init() call could not be separated, so evaluating the page would touch the DOM");

  function lrSandbox(language) {
    const registry = new Map();
    const make = id => ({
      id, value: "", _html: "", textContent: "", hidden: false, checked: false, disabled: false, inert: false,
      get innerHTML() { return this._html; }, set innerHTML(value) { this._html = String(value); },
      get options() { return [...String(this._html).matchAll(/<option[^>]*value="([^"]*)"/gu)].map(hit => ({ value: hit[1] })); },
      style: {}, classList: { add() {}, remove() {}, toggle() {}, contains: () => false }, dataset: {},
      onclick: null, oninput: null, onchange: null, onsubmit: null,
      addEventListener() {}, removeEventListener() {}, focus() {}, click() {},
      setAttribute() {}, getAttribute: () => null, hasAttribute: () => false, removeAttribute() {},
      querySelector: () => null, querySelectorAll: () => [], closest: () => null,
      appendChild() {}, remove() {}, insertAdjacentHTML() {}, scrollIntoView() {}
    });
    const doc = {
      documentElement: make("html"), body: make("body"), head: make("head"), visibilityState: "visible",
      activeElement: null, title: "", cookie: "",
      getElementById(id) { if (!registry.has(id)) registry.set(id, make(id)); return registry.get(id); },
      querySelector: () => make("q"), querySelectorAll: () => [], createElement: tag => make(tag),
      createTreeWalker: () => ({ nextNode: () => null }), addEventListener() {}, removeEventListener() {}
    };
    const store = new Map();
    const storage = { getItem: key => (store.has(key) ? store.get(key) : null), setItem: (key, value) => store.set(key, String(value)), removeItem: key => store.delete(key), clear: () => store.clear(), key: () => null, get length() { return store.size; } };
    const win = {
      document: doc, localStorage: storage, sessionStorage: storage, addEventListener() {}, removeEventListener() {},
      matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
      location: { href: "http://localhost/", hash: "", search: "", pathname: "/", origin: "http://localhost", replace() {}, assign() {} },
      history: { pushState() {}, replaceState() {}, state: null },
      navigator: { onLine: true, serviceWorker: { register: () => Promise.resolve() }, clipboard: { writeText: () => Promise.resolve() }, language: language === "en" ? "en" : "de" },
      requestAnimationFrame: () => 0, cancelAnimationFrame() {}, setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
      fetch: () => Promise.resolve({ ok: false, json: () => Promise.resolve({}), text: () => Promise.resolve("") }),
      MutationObserver: class { observe() {} disconnect() {} }, IntersectionObserver: class { observe() {} disconnect() {} unobserve() {} },
      Node: { ELEMENT_NODE: 1, TEXT_NODE: 3 }, NodeFilter: { SHOW_ELEMENT: 1, SHOW_TEXT: 4 },
      crypto: { randomUUID: () => "00000000-0000-4000-8000-000000000000", getRandomValues: array => array }
    };
    const box = {
      window: win, document: doc, localStorage: storage, sessionStorage: storage, navigator: win.navigator,
      location: win.location, history: win.history, setTimeout: win.setTimeout, clearTimeout: win.clearTimeout,
      setInterval: win.setInterval, clearInterval: win.clearInterval, requestAnimationFrame: win.requestAnimationFrame,
      fetch: win.fetch, MutationObserver: win.MutationObserver, IntersectionObserver: win.IntersectionObserver,
      Node: win.Node, NodeFilter: win.NodeFilter, crypto: win.crypto, console, TextEncoder, TextDecoder
    };
    box.globalThis = box;
    runInNewContext(englishSource, box, { filename: "i18n-en.js" });
    runInNewContext(`${lrBody}\nglobalThis.__API={LABS,labMarkup,initLab,setLanguage:l=>{currentLanguage=l;refreshLanguageResources();}};`, box, { filename: "index.html script" });
    box.__API.setLanguage(language);
    return { api: box.__API, doc };
  }

  // The eight labs with no addressable stage: seven are objective-check labs with no computed
  // panel at all, and policy-loss-tracer's stage div carries no id because its pipeline is a
  // fixed worked example. Written out so "not swept" stays a decision rather than a silence.
  const LR_NO_STAGE = ["pytorch-debugger", "policy-loss-tracer", "transformer-ledger", "kernel-contracts",
    "distributed-runtime", "scaling-transfer", "moe-routing", "rlvr-system-transfer"];
  // One lab's branch of initLab, cut by balancing braces from `if(id==="<lab>")`.
  const lrBranch = labId => {
    const marker = source.indexOf(`if(id==="${labId}"){`);
    if (marker < 0) return "";
    let index = source.indexOf("{", marker), depth = 0, quote = "", escaped = false;
    for (; index < source.length; index++) {
      const char = source[index];
      if (quote) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === quote) quote = ""; continue; }
      if (char === '"' || char === "'" || char === "`") { quote = char; continue; }
      if (char === "{") depth++;
      else if (char === "}") { depth--; if (!depth) break; }
    }
    return source.slice(marker, index + 1);
  };
  const lrTagBalance = markup => {
    for (const tag of ["div", "table", "tr", "td", "th", "strong", "span", "section", "h2", "h3", "h4", "ul", "ol", "li", "dl", "dt", "dd", "em", "code"]) {
      const open = (markup.match(new RegExp(`<${tag}[\\s>]`, "gu")) || []).length;
      const close = (markup.match(new RegExp(`</${tag}>`, "gu")) || []).length;
      if (open !== close) return `${tag}: ${open} open, ${close} closed`;
    }
    return "";
  };
  // Both languages at once, so a state can be compared across them. "undefined" is not a
  // forbidden word: the app translates "nicht definiert" to "undefined", and decode-sampling
  // prints exactly that when top-p leaves no token. The defect is an *extra* one, so the English
  // render may carry it only as often as the German render says "nicht definiert" -- and the
  // German render may never carry it at all.
  const lrDe = lrSandbox("de"), lrEn = lrSandbox("en");
  let lrLabs = 0, lrStates = 0, lrMoving = 0, lrControls = 0;
  const lrDead = new Set();

  // ---- the anchor half: a figure a claim rests on has to be on the screen ----------------
  // `render coverage` reads the load-bearing number back out of the real markup, but only for
  // the 16 labs whose stage functions take an injected binding. For the other 45 nothing tied
  // the prose to the render: a lab card could tell the reader to look for "20,4545 % in that
  // column" while the column printed something else, and every guard stayed green. That is not
  // hypothetical -- v92 fixed exactly that mismatch once, by hand, for the numbers the app
  // computes; the hard-coded prose was never swept.
  //
  // Converting 45 stage functions is a large change to the app that would only repeat what
  // this sweep already proves structurally. This is the narrower cut: every figure of three or
  // more digits that a lab's own card prints must appear in at least one state that lab can
  // reach. Two digits are deliberately out -- "12 Schichten" is prose, not a claim resting on
  // a computed value, and a two-digit rule would drown in false alarms.
  const lrJoinDigits = text => { let value = String(text), previous; do { previous = value; value = value.replace(/(\d)[.,\u00a0\u202f\u2009'](\d)/g, "$1$2"); } while (value !== previous); return value; };
  const lrFigures = text => [...new Set(lrJoinDigits(String(text)).match(/\d\d\d+/gu) || [])];
  const LR_PROSE_FIELDS = ["desc", "mental", "observe", "misconception", "transferAnswer"];
  // Figures that are references rather than screen values. Each one was checked by hand; the
  // list is held in both directions below, so an entry that becomes reachable has to be
  // removed rather than left standing.
  const LR_OFF_SCREEN = [
    ["bpe", "mental", "256", "the 256 possible byte values are a fact about bytes, not a number the panel computes"],
    ["decay-horizon", "transferAnswer", "583333", "the answer substitutes into (3.000-200)/(5.000-200) in place; the table prints the share at N, not at the reader's abort step"],
    ["position-signal", "transferAnswer", "8192", "an explicit counterfactual -- 'at 8192 almost nothing of this channel would be left' -- and the lab deliberately runs at 256"],
    ["checkpoint-segments", "observe", "566", "sqrt(32) is where the rule of thumb sits, and the point of the sentence is that the plateau *contains* it; the table prints integer k, not the root"],
    ["winrate-lc", "transferAnswer", "218", "the difference of two figures the same sentence quotes from the screen (+279 against +61), worked out in place rather than read off"],
    ["run-budget-ledger", "transferAnswer", "24000", "the total the fellow student's arithmetic charges, summed inside the argument; the ledger prints the reservations it is made of, not the sum"],
    ["chain-carry", "transferAnswer", "11629", "an extreme over all 378 grid-locked combinations, which no single state shows -- the panel prints one combination at a time"],
    ["chain-carry", "transferAnswer", "14536", "the other end of that same range over all combinations; the nearest reachable state prints 1,453582"]
  ];
  const lrUnanchored = [], lrStaleExceptions = [];
  let lrAnchored = 0, lrProductLabs = 0, lrProductStates = 0;
  let lrSeen = "";
  for (const lab of lrDe.api.LABS) {
    const markup = lrDe.api.labMarkup(lab.id);
    if (typeof markup !== "string" || !markup.trim()) throw new Error(`lab render sweep: ${lab.id} has no control markup`);
    const stageTag = (markup.match(/<div[^>]*class="lab-stage"[^>]*>/u) || [])[0] || "";
    const stageId = (stageTag.match(/id="(\w+)"/u) || [])[1] || null;
    if (!stageId) {
      if (!LR_NO_STAGE.includes(lab.id)) throw new Error(`lab render sweep: ${lab.id} has no addressable stage and is not on the recorded list -- add it deliberately or give the stage an id`);
      continue;
    }
    if (LR_NO_STAGE.includes(lab.id)) throw new Error(`lab render sweep: ${lab.id} is on the no-stage list but now has one (${stageId}) -- sweep it instead of excusing it`);
    lrLabs++;
    lrSeen = "";
    // A lab's stage controls are the ones its own initLab branch wires up. The <select>s of an
    // objective short check are controls too but are not supposed to move the stage -- all five
    // of scaling-fit's are answer pickers, and its branch wires none of them.
    const wiredIds = new Set([...(lrBranch(lab.id).match(/"(\w+)"/gu) || [])].map(token => token.slice(1, -1)));
    const selects = [...markup.matchAll(/<select[^>]*id="(\w+)"([\s\S]*?)<\/select>/gu)].filter(hit => wiredIds.has(hit[1])).map(hit => {
      const options = [...hit[2].matchAll(/<option([^>]*)>([^<]*)</gu)].map(option => ({
        value: (option[1].match(/value="([^"]*)"/u) || [, option[2].trim()])[1],
        selected: /\bselected\b/u.test(option[1])
      }));
      return { id: hit[1], options: options.map(option => option.value), initial: (options.find(option => option.selected) || options[0] || { value: "" }).value };
    });
    for (const box of [lrDe, lrEn]) for (const select of selects) box.doc.getElementById(select.id).value = select.initial;
    const renderBoth = () => {
      const out = {};
      for (const [language, box] of [["de", lrDe], ["en", lrEn]]) {
        box.api.initLab(lab.id);
        out[language] = box.doc.getElementById(stageId).innerHTML;
      }
      return out;
    };
    const check = (out, state) => {
      lrSeen += lrJoinDigits(out.de) + " ";
      lrStates += 2;
      for (const language of ["de", "en"]) {
        const markupOut = out[language];
        if (!markupOut || !markupOut.trim()) throw new Error(`lab render sweep: ${lab.id}/${language} renders nothing at ${state}`);
        if (markupOut.includes("${")) throw new Error(`lab render sweep: ${lab.id}/${language} leaves an uninterpolated placeholder at ${state}`);
        const imbalance = lrTagBalance(markupOut);
        if (imbalance) throw new Error(`lab render sweep: ${lab.id}/${language} renders unbalanced markup at ${state} -- ${imbalance}`);
      }
      const germanUndefined = (out.de.match(/undefined/gu) || []).length;
      if (germanUndefined) throw new Error(`lab render sweep: ${lab.id}/de prints "undefined" ${germanUndefined} time(s) at ${state}`);
      const allowed = (out.de.match(/nicht definiert/gu) || []).length;
      const english = (out.en.match(/undefined/gu) || []).length;
      if (english > allowed) throw new Error(`lab render sweep: ${lab.id}/en prints "undefined" ${english} time(s) at ${state}, but the German render says "nicht definiert" only ${allowed} time(s) -- the extra one is a missing value, not a translation`);
      const visible = out.en.replace(/<pre[^>]*data-no-i18n[\s\S]*?<\/pre>/gu, " ").replace(/<[^>]*>/gu, " ");
      const residue = visible.split(/\s{2,}/u).map(part => part.trim()).filter(part => part && GERMAN_WORDS.test(part));
      if (residue.length) throw new Error(`lab render sweep: ${lab.id}/en still shows German at ${state} -- ${residue[0].slice(0, 90)}`);
    };
    const base = renderBoth();
    check(base, "defaults");
    let moved = 0;
    for (const select of selects) {
      lrControls++;
      let differs = false;
      for (const option of select.options) {
        if (option === select.initial) continue;
        for (const box of [lrDe, lrEn]) box.doc.getElementById(select.id).value = option;
        const out = renderBoth();
        check(out, `${select.id}=${option}`);
        if (out.de !== base.de) differs = true;
      }
      for (const box of [lrDe, lrEn]) box.doc.getElementById(select.id).value = select.initial;
      if (differs) moved++;
    }
    // Some labs hold part of their state outside the controls: dedup-pipeline walks seven steps
    // through a prev/next button pair, and its threshold only changes what is on screen from
    // step five on. A sweep that never leaves the first step would call that threshold dead. So
    // when nothing moved, advance the lab through the buttons its own branch wires and try the
    // selects again -- the claim then reads "some reachable state makes this control matter".
    if (selects.length && !moved) {
      for (let step = 0; step < 6 && !moved; step++) {
        for (const box of [lrDe, lrEn]) {
          const next = box.doc.getElementById([...wiredIds].find(id => /next$/iu.test(id)) || "");
          if (typeof next?.onclick === "function") next.onclick();
        }
        const stepped = renderBoth();
        check(stepped, `step ${step + 1}`);
        for (const select of selects) {
          for (const option of select.options) {
            if (option === select.initial) continue;
            for (const box of [lrDe, lrEn]) box.doc.getElementById(select.id).value = option;
            const out = renderBoth();
            check(out, `step ${step + 1} · ${select.id}=${option}`);
            if (out.de !== stepped.de) moved = 1;
          }
          for (const box of [lrDe, lrEn]) box.doc.getElementById(select.id).value = select.initial;
        }
      }
      lrMoving += moved;
    }
    renderBoth();
    // Every lab whose own initLab wires a select must have at least one that changes the stage
    // in some state it can actually reach. A control the app binds and the renderer ignores is a
    // dead knob, and the reader who turns it learns the wrong thing about what the lab depends on.
    if (selects.length && !moved) lrDead.add(lab.id);
    lrMoving += moved;

    // --- the anchor check for this lab ---------------------------------------------------
    // Everything the sweep already rendered counts first, so the common case costs nothing.
    // Only a lab that still has an unaccounted figure pays for a wider search -- its sliders
    // at three positions, then the product of its selects, stopping the moment the last
    // figure turns up. Measured: 8 of 53 labs need the wider search at all.
    const labFigures = [];
    for (const field of LR_PROSE_FIELDS)
      for (const figure of lrFigures(lab[field] ?? "")) labFigures.push({ field, figure });
    let outstanding = labFigures.filter(entry => !lrSeen.includes(entry.figure));
    if (outstanding.length) {
      lrProductLabs++;
      const record = () => {
        lrProductStates++;
        try { lrDe.api.initLab(lab.id); } catch { return; }
        lrSeen += lrJoinDigits(lrDe.doc.getElementById(stageId).innerHTML) + " ";
        outstanding = outstanding.filter(entry => !lrSeen.includes(entry.figure));
      };
      const ranges = [...markup.matchAll(/<input[^>]*id="(\w+)"[^>]*>/gu)]
        .filter(hit => /type="range"/u.test(hit[0]) && wiredIds.has(hit[1]))
        .map(hit => {
          const min = Number((hit[0].match(/min="(-?[\d.]+)"/u) || [, "0"])[1]);
          const max = Number((hit[0].match(/max="(-?[\d.]+)"/u) || [, "10"])[1]);
          const value = (hit[0].match(/value="(-?[\d.]+)"/u) || [, String(min)])[1];
          return { id: hit[1], values: [...new Set([String(min), String(Math.round((min + max) / 2)), String(max), value])] };
        });
      for (const range of ranges) {
        for (const value of range.values) { if (!outstanding.length) break; lrDe.doc.getElementById(range.id).value = value; record(); }
        lrDe.doc.getElementById(range.id).value = range.values[range.values.length - 1];
      }
      if (outstanding.length) {
        let combos = [[]];
        for (const select of selects) {
          const next = [];
          for (const prefix of combos) for (const option of select.options) { if (next.length >= 4000) break; next.push([...prefix, option]); }
          combos = next;
          if (combos.length >= 4000) break;
        }
        for (const combo of combos) {
          if (!outstanding.length) break;
          combo.forEach((value, index) => { lrDe.doc.getElementById(selects[index].id).value = value; });
          record();
        }
      }
      for (const select of selects) for (const box of [lrDe, lrEn]) box.doc.getElementById(select.id).value = select.initial;
      renderBoth();
    }
    for (const entry of labFigures) {
      const excused = LR_OFF_SCREEN.find(row => row[0] === lab.id && row[1] === entry.field && row[2] === entry.figure);
      const onScreen = lrSeen.includes(entry.figure);
      if (excused && onScreen) lrStaleExceptions.push(`${lab.id}.${entry.field} ${entry.figure}`);
      else if (!excused && !onScreen) lrUnanchored.push(`${lab.id}.${entry.field} ${entry.figure}`);
      else if (!excused) lrAnchored++;
    }
  }
  if (lrUnanchored.length)
    throw new Error(`lab prose anchors: ${lrUnanchored.length} figure(s) a lab card prints never reach that lab's screen in any state it can reach -- ${lrUnanchored.join(", ")} -- either the prose quotes a number the lab does not compute, or the number moved and the prose did not`);
  if (lrStaleExceptions.length)
    throw new Error(`lab prose anchors: ${lrStaleExceptions.length} recorded off-screen figure(s) are on the screen after all -- ${lrStaleExceptions.join(", ")} -- take them off the list rather than leaving it to rot`);
  for (const [labId, field, figure] of LR_OFF_SCREEN) {
    const lab = base.labs.find(entry => entry.id === labId);
    if (!lab) throw new Error(`lab prose anchors: the off-screen list names ${labId}, which is not a lab`);
    if (!lrFigures(lab[field] ?? "").includes(figure))
      throw new Error(`lab prose anchors: ${labId}.${field} no longer prints ${figure}, so its entry on the off-screen list is dead`);
  }
  console.log(`lab prose anchors OK: ${lrAnchored} figures of three digits or more, printed on ${base.labs.length - LR_NO_STAGE.length} lab cards, each read back out of a state that lab can actually reach -- ${lrProductLabs} of them needed a wider search than the sweep's own states (${lrProductStates} extra renders), and ${LR_OFF_SCREEN.length} figures are recorded by name as references rather than screen values, checked in both directions`);
  if (lrDead.size) throw new Error(`lab render sweep: ${lrDead.size} lab(s) bind a select that changes nothing on their stage -- ${[...lrDead].join(", ")}`);
  if (lrLabs + LR_NO_STAGE.length !== base.labs.length)
    throw new Error(`lab render sweep: ${lrLabs} swept plus ${LR_NO_STAGE.length} excused is not ${base.labs.length} labs`);
  if (lrLabs < 45) throw new Error(`lab render sweep: only ${lrLabs} labs swept, which is below what the stub is supposed to reach`);
  // The sweep has to be seeing real output, not an empty stage it calls clean.
  if (lrStates < 500 || lrControls < 100) throw new Error(`lab render sweep: only ${lrStates} renders over ${lrControls} controls, too few for the sweep to mean anything`);
  console.log(`lab render sweep OK: ${lrStates} renders across ${lrLabs} of ${base.labs.length} labs in both languages, driven through the page's own labMarkup and initLab against a stubbed DOM -- every state balanced, free of "undefined" and of uninterpolated placeholders, no German left in the English render, and ${lrMoving} of ${lrControls} controls demonstrably move their lab (${LR_NO_STAGE.length} labs have no computed stage and are excused by name)`);
}

// ---- sft packing: the loader A5 §4.2.1 asks for, against the recipe the page describes ----
// The lab's whole point is that two loaders sit in the same assignment and are not the same
// thing, so this block re-derives both sides from the definitions instead of calling the app:
// document lengths, the two candidate __len__ rules and the three context classes are typed
// out again here, and only then compared against what the app computes and prints.
{
  const spApi = renderApi(renderLabs.find(lab => lab.id === "sft-packing").names, {});
  let spChecks = 0;
  const spFail = message => { throw new Error(`sft packing: ${message}`); };

  // --- the model, retyped ------------------------------------------------------------------
  // A serialised document is template + prompt + response + exactly one separator token.
  const ownDocs = (corpusKey, templateTokens) =>
    spApi.SP_CORPORA.find(entry => entry.key === corpusKey).docs
      .map(([prompt, response]) => templateTokens + prompt + response + 1);
  // Chunk j takes inputs [j*m, j*m+m) and labels one further, so the last complete example is
  // the one whose labels still fit: ⌊(n-1)/m⌋, not ⌊n/m⌋.
  const ownChunks = (n, m) => Math.floor((n - 1) / m);
  // Walk the stream position by position and give every target position its class, by the
  // definitions rather than by the app's early-exit bookkeeping.
  const ownClasses = (lengths, m) => {
    const owner = [];
    lengths.forEach((length, index) => { for (let step = 0; step < length; step++) owner.push(index); });
    const firstOf = new Map();
    owner.forEach((document, position) => { if (!firstOf.has(document)) firstOf.set(document, position); });
    const chunks = ownChunks(owner.length, m);
    let foreign = 0, headless = 0, clean = 0, aligned = 0;
    for (let chunk = 0; chunk < chunks; chunk++) {
      const from = chunk * m;
      if (firstOf.get(owner[from]) === from) aligned++;
      for (let position = from; position < from + m; position++) {
        const crossed = owner.slice(from, position + 1).some(document => document !== owner[from]);
        if (crossed) foreign++;
        else if (firstOf.get(owner[position]) < from) headless++;
        else clean++;
      }
    }
    return { chunks, positions: chunks * m, foreign, headless, clean, aligned, n: owner.length };
  };

  const spTemplates = spApi.SP_TEMPLATES, spCorpora = spApi.SP_CORPORA, spSeqs = spApi.SP_SEQS;
  const spTrimKeys = spApi.SP_TRIMS.map(entry => entry.key);

  // --- 1. the panel offers exactly the options the constants define, in both directions -----
  // The panel fills each select by mapping over a constant, so what has to be checked is that
  // it maps over the right one -- and that the constant still carries distinct, non-empty keys.
  for (const [id, name, constant] of [["spCorpus", "SP_CORPORA", spCorpora], ["spCorpusB", "SP_CORPORA", spCorpora],
    ["spTemplate", "SP_TEMPLATES", spTemplates], ["spTemplateB", "SP_TEMPLATES", spTemplates],
    ["spSeq", "SP_SEQS", spSeqs], ["spTrim", "SP_TRIMS", spApi.SP_TRIMS]]) {
    const marker = source.indexOf(`id="${id}"`);
    if (marker < 0) spFail(`the panel has no control ${id}`);
    const block = source.slice(marker, source.indexOf("</select>", marker));
    if (!block.includes(`${name}.map(`)) spFail(`${id} is not filled from ${name}`);
    const keys = constant.map(entry => entry.key);
    if (new Set(keys).size !== keys.length || keys.some(key => !key)) spFail(`${name} no longer carries distinct keys`);
    spChecks++;
  }

  // --- 2. loss mass, recomputed --------------------------------------------------------------
  let spHeadShares = [];
  for (const corpus of spCorpora) for (const template of spTemplates) {
    const mine = ownDocs(corpus.key, template.tokens);
    const theirs = spApi.spDocuments(corpus.key, template.key);
    if (theirs.length !== mine.length) spFail(`${corpus.key}/${template.key}: document count disagrees`);
    theirs.forEach((doc, index) => {
      if (doc.total !== mine[index]) spFail(`${corpus.key}/${template.key}: document ${index} length ${doc.total} against ${mine[index]}`);
      if (doc.head + doc.tail !== doc.total) spFail(`${corpus.key}/${template.key}: head and tail do not add up to the document`);
      if (doc.head !== doc.template + doc.prompt) spFail(`${corpus.key}/${template.key}: the head is not template plus prompt`);
      if (doc.tail !== doc.response + 1) spFail(`${corpus.key}/${template.key}: the tail forgets the separator token`);
      spChecks++;
    });
    const ledger = spApi.spLossLedger(corpus.key, template.key);
    const total = mine.reduce((sum, value) => sum + value, 0);
    if (ledger.total !== total) spFail(`${corpus.key}/${template.key}: stream length ${ledger.total} against ${total}`);
    if (Math.abs(ledger.headShare + ledger.tailShare - 1) > 1e-12) spFail(`${corpus.key}/${template.key}: the two shares do not add up to one`);
    if (Math.abs(ledger.factor - ledger.head / ledger.tail) > 1e-12) spFail(`${corpus.key}/${template.key}: the ratio disagrees with its own two numbers`);
    spHeadShares.push({ corpus: corpus.key, template: template.key, share: ledger.headShare });
    spChecks += 3;
  }
  // The head share is a property of the corpus, not of the template: across the three template
  // sizes one corpus moves by less than two points, while the corpora are more than forty apart.
  let spTemplateSpread = 0;
  for (const corpus of spCorpora) {
    const shares = spHeadShares.filter(row => row.corpus === corpus.key).map(row => row.share);
    spTemplateSpread = Math.max(spTemplateSpread, Math.max(...shares) - Math.min(...shares));
    spChecks++;
  }
  const spConceptShare = spHeadShares.find(row => row.corpus === "concept" && row.template === "t32").share;
  const spUltraShare = spHeadShares.find(row => row.corpus === "ultra" && row.template === "t32").share;
  const spCorpusSpread = spConceptShare - spUltraShare;
  if (!(spCorpusSpread > 0.4))
    spFail("the two corpora have to be more than forty points apart, or the share would read as a constant of the method");
  // "a few percentage points" against "more than forty": the claim is the ratio, so guard it.
  if (spTemplateSpread > 0.05)
    spFail(`the template size moves the head share by ${(spTemplateSpread * 100).toFixed(4)} points, which is no longer "a few"`);
  if (!(spCorpusSpread > 10 * spTemplateSpread))
    spFail("the corpus no longer dominates the template, so the lab's claim about where the share comes from is wrong");
  spChecks += 3;

  // --- 3. the corpus quotes the concept page, and the page still says it --------------------
  const spConcept = readConstant("CONCEPTS").find(entry => entry.id === "sft");
  if (!spConcept) spFail("the sft concept is gone");
  const spConceptText = JSON.stringify(spConcept);
  for (const needle of ["500-Token-Prompt", "100 Antwort-Tokens"])
    if (!spConceptText.includes(needle)) spFail(`the concept page no longer contains "${needle}", so the lab quotes a sentence that is not there any more`);
  // and the other direction: the corpus the lab labels as that quote really carries 500/100.
  const spQuoted = spCorpora.find(entry => entry.key === "concept");
  if (spQuoted.docs.length !== 1 || spQuoted.docs[0][0] !== 500 || spQuoted.docs[0][1] !== 100)
    spFail("the corpus that claims to be the concept page's example is not 500/100 any more");
  // The note says it quotes the page verbatim, so the quotation marks have to hold a sentence
  // the page really contains -- otherwise the lab could drift while the page stands still.
  const spQuote = spQuoted.note.match(/„([^“]+)“/);
  if (!spQuote) spFail("the corpus note no longer carries a quotation from the concept page");
  if (!spConceptText.includes(spQuote[1]))
    spFail(`the lab quotes "${spQuote[1].slice(0, 60)}", which the concept page does not say`);
  // The page has to make the difference the lab computes, in both directions and in both
  // languages: the mask is what decides, A5 asks for none, and the claim the lab refutes --
  // that packed conversations do not influence each other -- must not be back.
  for (const needle of ["A5 §4.2.1", "entscheidet allein die Attention-Maske", "keine blockdiagonale Maske"])
    if (!spConceptText.includes(needle)) spFail(`the concept page no longer says "${needle}", so it would describe a packing A5 does not ask for`);
  if (spConceptText.includes("ohne dass sich die Gespräche gegenseitig beeinflussen"))
    spFail("the concept page claims packed conversations do not influence each other again, which is exactly what the lab computes to be false for this loader");
  const spConceptEnglish = JSON.stringify(pack.concepts.sft);
  for (const needle of ["A5 §4.2.1", "decided by the attention mask alone", "no block-diagonal mask"])
    if (!spConceptEnglish.includes(needle)) spFail(`the English concept page no longer says "${needle}", so the default reader would get the recipe A5 does not ask for`);
  if (spConceptEnglish.includes("without cross-dialogue attention leakage"))
    spFail("the English concept page claims packed dialogues do not leak into each other again");
  spChecks += 9;

  // --- 4. the two length rules ---------------------------------------------------------------
  // The derived statement first: they differ exactly when m divides n. Brute force, both ways.
  let spDividers = 0;
  for (let m = 2; m <= 40; m++) for (let n = 1; n <= 400; n++) {
    const differs = Math.floor(n / m) !== ownChunks(n, m);
    if (differs !== (n % m === 0)) spFail(`the rules differ at n=${n}, m=${m} but n is ${n % m === 0 ? "" : "not "}a multiple of m`);
    if (differs) spDividers++;
    spChecks++;
  }
  if (!spDividers) spFail("no pair of n and m separated the two rules, so the sweep proves nothing");
  // The handout's own illustration cannot separate them -- that is the finding.
  if (spApi.SP_HANDOUT.n !== 11 || spApi.SP_HANDOUT.m !== 4) spFail("the handout example is no longer token_ids [0 … 10] at seq_length 4");
  const spHandout = spApi.spRuleRow(spApi.SP_HANDOUT.n, spApi.SP_HANDOUT.m);
  if (spHandout.naive !== 2 || spHandout.correct !== 2 || spHandout.differs)
    spFail("the handout example no longer returns two blocks under both rules, which is the whole reason it settles nothing");
  if (Math.floor(12 / 4) === ownChunks(12, 4)) spFail("n = 12 at m = 4 has to be the first case beyond the handout example where the rules part");
  spChecks += 3;
  // And over the nine settings the panel offers: none untrimmed separates them, all nine trimmed do.
  let spAgree = 0, spPart = 0;
  for (const corpus of spCorpora) for (const seq of spSeqs) {
    const raw = spApi.spRuleRow(spApi.spStream(corpus.key, "t32", seq.key, "raw").n, seq.m);
    const cut = spApi.spStream(corpus.key, "t32", seq.key, "cut");
    const cutRule = spApi.spRuleRow(cut.n, seq.m);
    if (raw.differs) spFail(`${corpus.key}/${seq.key}: an untrimmed stream separated the rules, so the lab's "none of the nine" is wrong`);
    if (!cutRule.differs) spFail(`${corpus.key}/${seq.key}: a trimmed stream did not separate the rules, so the trim control proves nothing`);
    if (cut.n % seq.m !== 0) spFail(`${corpus.key}/${seq.key}: trimming did not land on a multiple of m`);
    if (cut.cut < 0 || cut.cut >= seq.m) spFail(`${corpus.key}/${seq.key}: the trim removed ${cut.cut} tokens, which is not a remainder`);
    spAgree++; spPart++; spChecks += 4;
  }
  if (spAgree !== 9 || spPart !== 9) spFail(`the panel no longer offers nine settings (${spAgree})`);

  // --- 5. the three context classes ----------------------------------------------------------
  let spSettings = 0, spCleanMax = 0, spDegenerate = 0;
  const spMono = [];
  for (const corpus of spCorpora) for (const template of spTemplates) for (const trim of spTrimKeys) {
    const row = [];
    for (const seq of spSeqs) {
      const stream = spApi.spStream(corpus.key, template.key, seq.key, trim);
      const theirs = spApi.spPackStats(stream.lengths, stream.m);
      const mine = ownClasses(stream.lengths, seq.m);
      for (const field of ["chunks", "positions", "foreign", "headless", "clean"])
        if (theirs[field] !== mine[field])
          spFail(`${corpus.key}/${template.key}/${seq.key}/${trim}: ${field} is ${theirs[field]} in the app and ${mine[field]} when recomputed`);
      if (theirs.foreign + theirs.headless + theirs.clean !== theirs.positions)
        spFail(`${corpus.key}/${template.key}/${seq.key}/${trim}: the three classes do not partition the target positions`);
      // clean positions exist only inside blocks whose boundary falls on a document start
      if ((theirs.clean > 0) !== (mine.aligned > 0))
        spFail(`${corpus.key}/${template.key}/${seq.key}/${trim}: clean positions appear without a block aligned to a document start`);
      if (theirs.positions) {
        if (corpus.docs.length > 1) spCleanMax = Math.max(spCleanMax, theirs.clean / theirs.positions);
        row.push({ m: seq.m, foreign: theirs.foreign / theirs.positions, headless: theirs.headless / theirs.positions });
      } else spDegenerate++;
      spSettings++; spChecks += 7;
    }
    if (corpus.docs.length > 1 && row.length === spSeqs.length) spMono.push({ corpus: corpus.key, template: template.key, trim, row });
  }
  if (spSettings !== spCorpora.length * spTemplates.length * spSeqs.length * spTrimKeys.length)
    spFail(`the class sweep covered ${spSettings} settings instead of the full grid`);
  if (!spDegenerate) spFail("no setting produced zero complete blocks, so the guard against dividing by zero is never exercised");
  // The trade-off the lab claims: with more than one document, shortening the block trades
  // foreign context for a missing start. Both directions, strictly, in every such setting.
  for (const entry of spMono) {
    for (let index = 1; index < entry.row.length; index++) {
      if (!(entry.row[index].foreign > entry.row[index - 1].foreign))
        spFail(`${entry.corpus}/${entry.template}/${entry.trim}: foreign context does not rise with m, so the trade-off the lab describes is not there`);
      if (!(entry.row[index].headless < entry.row[index - 1].headless))
        spFail(`${entry.corpus}/${entry.template}/${entry.trim}: the missing-start share does not fall with m`);
      spChecks += 2;
    }
  }
  // The eight-document corpus is the one the prose bounds, and the bound has to be tight.
  let spUltraMax = 0;
  for (const template of spTemplates) for (const seq of spSeqs) for (const trim of spTrimKeys) {
    const stream = spApi.spStream("ultra", template.key, seq.key, trim);
    const stats = spApi.spPackStats(stream.lengths, stream.m);
    spUltraMax = Math.max(spUltraMax, stats.clean / stats.positions);
    spChecks++;
  }
  if (spUltraMax > 0.125 + 1e-12) spFail(`the eight-document corpus reaches ${(spUltraMax * 100).toFixed(4)} % clean positions, above the 12.5000 % the lab prints`);
  if (spUltraMax < 0.125 - 1e-12) spFail(`the eight-document corpus tops out at ${(spUltraMax * 100).toFixed(4)} %, so printing 12.5000 % overstates the bound`);
  if (!(spCleanMax < 0.5)) spFail("a multi-document setting sees more than half its positions cleanly, which the lab's argument denies");

  // --- 6. the lab is where the reader needs it ------------------------------------------------
  const spLabConcepts = readConstant("LAB_CONCEPTS")["sft-packing"];
  if (!spLabConcepts || !spLabConcepts.includes("sft")) spFail("the lab is not attached to the sft concept");
  const spProblemConcepts = readConstant("PROBLEM_CONCEPTS");
  const spOwners = Object.entries(spProblemConcepts).filter(([, list]) => list.includes("sft")).map(([id]) => id);
  if (!spOwners.length) spFail("no handout problem is decided by the sft concept any more");
  // The two loaders of A5 have to be two problems, or the lab's premise is gone.
  for (const problem of ["a5:data_loading", "a5:tokenize_prompt_and_output"])
    if (!handoutProblems[problem]) spFail(`${problem} is gone from the handout list, and the lab's premise is that both loaders exist`);
  const spCheckAnswer = sliceDeclaration(source, "checkSftPacking");
  for (const key of ["nofield", "multiple", "aligned"])
    if (!spCheckAnswer.includes(`"${key}"`)) spFail(`the short check no longer accepts ${key}`);
  if (!source.includes('id="spCheckContext"')) spFail("the third short check is gone");
  spChecks += 5;

  console.log(`sft packing OK: ${spChecks} checks -- A5 §4.2.1's loader recomputed against the recipe the concept page describes: the page's own 500/100 example puts ${(spConceptShare * 100).toFixed(4)} % of the target positions on template and prompt where a masked loss would train on ${spApi.spLossLedger("concept", "t32").tail}, and the share is a property of the corpus (${(spUltraShare * 100).toFixed(4)} % at UltraChat lengths) rather than of the template (${(spTemplateSpread * 100).toFixed(4)} points at worst across all three sizes, against ${(spCorpusSpread * 100).toFixed(4)} between the corpora); ⌊n/m⌋ and ⌊(n − 1)/m⌋ differ exactly when m divides n -- proven over ${spDividers} separating pairs in a sweep of 15,561, missed by the handout's own token_ids [0 … 10] at seq_length 4, and by all nine untrimmed settings the panel offers while all nine trimmed ones catch it; and over ${spSettings} settings the three context classes partition every target position, clean ones appear only in blocks aligned to a document start (at most ${(spUltraMax * 100).toFixed(4)} % in the eight-document corpus), and shortening the block trades foreign context for a missing start in every multi-document setting`);
}

// ---- content numerals: the same rule, applied to the structured packs --------------------
// `english numerals` covers every string that reaches the screen through tr(), which is the
// renderer's own prose. It does not see the content packs -- a lab's desc, mental model,
// symbol table, transfer answer, a concept's details, a formula's worked example. Those are
// the strings that carry the numbers a claim actually rests on, and a figure invented there
// would be shown to the English reader and to no one else. Same comparison as above: digit
// runs with separators dropped, so a locale swap is invisible and a changed figure is not.
{
  // Both locales group and point differently -- 3.000 against 3,000, 0,5 against 0.5 -- so
  // every separator standing between two digits is dropped before the runs are read. What
  // survives is the digit sequence itself. Single digits are left out: a lone 0 or 4 is
  // routinely spelled out in one language and written in the other ("auf 0" against "zero
  // out"), and a dictionary of number words is not a guard. Two digits and up cannot be a
  // spelled-out word, which is where invented figures actually live.
  const joinDigits = text => { let value = String(text), previous; do { previous = value; value = value.replace(/(\d)[.,\u00a0\u202f\u2009'](\d)/g, "$1$2"); } while (value !== previous); return value; };
  const digitRuns = text => [...new Set(joinDigits(text).match(/\d\d+/g) || [])].sort();
  const flatten = value => Array.isArray(value) ? value.flatMap(flatten) : (typeof value === "string" ? [value] : []);
  let cnFields = 0, cnRuns = 0, cnNumeric = 0;
  for (const [kind, fields] of Object.entries(requiredFields)) {
    const sourceItems = keyed(base[kind]);
    for (const [id, translated] of Object.entries(pack[kind])) {
      for (const field of [...fields, "terms"]) {
        const original = sourceItems[id]?.[field], english = translated[field];
        if (original === undefined || english === undefined) continue;
        const want = flatten(original).join(" "), got = flatten(english).join(" ");
        cnFields++;
        if (!/\d/.test(want) && !/\d/.test(got)) continue;
        cnNumeric++;
        const wantRuns = digitRuns(want), gotRuns = digitRuns(got);
        if (JSON.stringify(wantRuns) !== JSON.stringify(gotRuns))
          throw new Error(`content numerals: ${kind}.${id}.${field} prints ${JSON.stringify(gotRuns.slice(0, 12))} where the German prints ${JSON.stringify(wantRuns.slice(0, 12))} -- an English reader would be shown a figure the app never computed`);
        cnRuns += wantRuns.length;
      }
    }
  }
  if (cnNumeric < 200) throw new Error(`content numerals: only ${cnNumeric} numeric fields found, the walk is not seeing the packs any more`);
  console.log(`content numerals OK: ${cnRuns} digit runs identical on both sides across ${cnNumeric} numeric fields of ${cnFields} translated content fields -- the packs the renderer guard never looked inside`);
}

// ---- worked steps: the same worked example on both sides ---------------------------------
// `content numerals` compares the digit runs of a whole field as a set. That leaves two holes,
// and this pass found both standing open.
//
// The first is masking. A concept's `terms` is one field holding eight term/definition pairs,
// so a figure dropped from the fifth pair stays in the field's set as long as the same digits
// appear in any other pair. The ring all-reduce term printed "2·(4-1)·100 / 4 = 2 · 3 · 25 =
// 150 MB" in German and "= 150 MB" in English; the intermediate 25 survived in the set because
// another term mentioned 25 MB buckets. This guard walks the leaves in parallel instead.
//
// The second is arithmetic that carries no two-digit number. Digit runs shorter than two digits
// are deliberately ignored (a lone 1 is spelled out in one language and written in the other),
// which makes "A = 1 - 0,125 = +0,875" and "A = +0.875" identical to the older guard -- the
// English reader was handed the result of a subtraction the app never showed. So this guard
// counts steps rather than figures.
//
// A step is a relation between numbers. The text is cut into maximal runs of purely
// mathematical characters, and a run counts once per relation sign it carries if it also
// carries a digit. A letter ends the run, which is what keeps the count language-independent:
// "C = throughput · 172800 s" and "C = Durchsatz · 172800 s" are both zero steps, while
// "= 1 - 0.125 = +0.875" is two in either language. The earlier draft used a character window
// around each equals sign instead, and ten of its seventeen hits were artefacts of German
// words being longer than English ones -- the run rule has none.
{
  const wsMath = new Set("0123456789+-−–·*/^()[]{}%√⌊⌋⌈⌉≤≥<>,.    '=≈");
  const wsSteps = text => {
    // 1e-6 is one number; without this the exponent's letter would cut the run in half.
    const s = String(text).replace(/(\d)e([+-−]?\d)/g, "$1^$2");
    let total = 0, run = "";
    const flush = () => { const relations = (run.match(/[=≈]/g) || []).length; if (relations && /\d/.test(run)) total += relations; run = ""; };
    for (const char of s) { if (wsMath.has(char)) run += char; else flush(); }
    flush();
    return total;
  };
  const wsJoin = text => { let value = String(text), previous; do { previous = value; value = value.replace(/(\d)[.,   '](\d)/g, "$1$2"); } while (value !== previous); return value; };
  const wsRuns = text => [...new Set(wsJoin(text).match(/\d\d+/g) || [])].sort();
  const wsLeaves = (value, trail, out) => {
    if (typeof value === "string") { out.push([trail, value]); return; }
    if (Array.isArray(value)) value.forEach((entry, index) => wsLeaves(entry, `${trail}[${index}]`, out));
  };
  let wsPairs = 0, wsWorked = 0, wsTotal = 0, wsSkipped = 0, wsFigures = 0;
  for (const [kind, fields] of Object.entries(requiredFields)) {
    const sourceItems = keyed(base[kind]);
    for (const [id, translated] of Object.entries(pack[kind])) {
      for (const field of [...fields, "terms"]) {
        const original = sourceItems[id]?.[field], english = translated[field];
        if (original === undefined || english === undefined) continue;
        const german = [], foreign = [];
        wsLeaves(original, field, german); wsLeaves(english, field, foreign);
        // A shape change is already an error for `requiredFields`; here it only means the two
        // sides cannot be walked in parallel. Counting the skips keeps a reshaped pack from
        // quietly emptying the guard.
        if (german.length !== foreign.length) { wsSkipped++; continue; }
        for (let index = 0; index < german.length; index++) {
          const [trail, de] = german[index], en = foreign[index][1];
          wsPairs++;
          const deSteps = wsSteps(de), enSteps = wsSteps(en);
          if (deSteps) { wsWorked++; wsTotal += deSteps; }
          if (deSteps !== enSteps)
            throw new Error(`worked steps: ${kind}.${id}.${trail} computes ${deSteps} step(s) in German and ${enSteps} in English -- one of the two readers is shown a worked example the other one gets handed as a result\n  DE: ${de.slice(0, 240)}\n  EN: ${en.slice(0, 240)}`);
          const deRuns = wsRuns(de), enRuns = wsRuns(en);
          if (JSON.stringify(deRuns) !== JSON.stringify(enRuns))
            throw new Error(`worked steps: ${kind}.${id}.${trail} prints ${JSON.stringify(enRuns.slice(0, 12))} where the German prints ${JSON.stringify(deRuns.slice(0, 12))} -- the field-level set comparison hides this whenever a sibling entry repeats the same digits\n  DE: ${de.slice(0, 240)}\n  EN: ${en.slice(0, 240)}`);
          wsFigures += deRuns.length;
        }
      }
    }
  }
  if (wsWorked < 300) throw new Error(`worked steps: only ${wsWorked} leaves carry a computed step, the walk is not reaching the packs any more`);
  if (wsSkipped) throw new Error(`worked steps: ${wsSkipped} field(s) could not be walked in parallel, so their worked examples are unchecked`);
  console.log(`worked steps OK: ${wsPairs} leaf strings walked side by side, ${wsWorked} of them carrying ${wsTotal} computed steps -- every step present in both languages, and ${wsFigures} figures compared per entry rather than per field, where a sibling term used to hide a dropped one`);
}

// ---- cache version: four places name it, and nothing held them together --------------------
// The shell cache name, the two `?v=` query strings and the README sentence all carry the same
// number, and it is bumped by hand on every pass that touches `i18n-en.js`. Twice now the
// README ran a version behind (v74 against sw.js v75, and again at v76). A stale README is
// harmless; a stale `?v=` is not -- the browser then keeps serving yesterday's translations
// against today's markup, which is exactly the failure the query string exists to prevent.
{
  const swSource = await readFile(path.join(root, "sw.js"), "utf8");
  const readmeSource = await readFile(path.join(root, "README.md"), "utf8");
  const cacheName = swSource.match(/const CACHE_NAME = "cs336-shell-v(\d+)"/);
  if (!cacheName) throw new Error("cache version: sw.js no longer declares a cs336-shell-v<n> cache name");
  const version = cacheName[1];
  const queries = [
    ["sw.js", [...swSource.matchAll(/i18n-en\.js\?v=(\d+)/g)].map(hit => hit[1])],
    ["index.html", [...source.matchAll(/i18n-en\.js\?v=(\d+)/g)].map(hit => hit[1])]
  ];
  let pinned = 0;
  for (const [file, found] of queries) {
    if (!found.length) throw new Error(`cache version: ${file} loads i18n-en.js without a ?v= query, so a stale bundle would survive the bump`);
    for (const seen of found) {
      if (seen !== version) throw new Error(`cache version: ${file} asks for i18n-en.js?v=${seen} while the shell cache is v${version} -- one of the two is stale and the browser decides which`);
      pinned++;
    }
  }
  const readme = readmeSource.match(/Service-Worker-Cache und Sprachbundle verwenden aktuell Version (\d+)\./);
  if (!readme) throw new Error("cache version: the README sentence naming the version is gone, so nothing states it in prose any more");
  if (readme[1] !== version) throw new Error(`cache version: the README says version ${readme[1]} while sw.js is at v${version}`);
  // The bump has to be monotone against what is published, or a returning visitor keeps the
  // cached shell. origin/main is not readable here, so the floor is the one thing this file
  // can know: the version never goes back below the highest one this repo has ever named.
  const everNamed = [...(await readFile(path.join(root, "activity.md"), "utf8")).matchAll(/Cache-Bump auf v(\d+)/g)].map(hit => Number(hit[1]));
  const highest = Math.max(0, ...everNamed);
  if (Number(version) < highest) throw new Error(`cache version: sw.js is at v${version} while activity.md already records a bump to v${highest} -- a version that goes backwards leaves the old shell cached`);
  console.log(`cache version OK: v${version} named identically in ${pinned + 2} places (the shell cache name, ${pinned} bundle queries and the README sentence), and never below the v${highest} activity.md already records`);
}

// ---- target shift: the pairing rule, recomputed from the definition ----------------------
// `lm-objective` was the last self-study concept without a lab. Its page names the pitfall
// -- "not shifting input and target: the model then learns to copy the visible current
// token" -- and names no figure. The figure is the whole point, because it is zero: the
// broken pairing has the best loss of the four.
//
// Everything below is typed a second time from the definition rather than read out of the
// app: the pairs, the counted conditional, its cross-entropy, the greedy roll-out and the
// index bound. Where the two disagree, one of them is wrong and the guard says which value.
{
  const tsApi = runInNewContext(`${numberPrelude}
${sliceDeclaration(source, "TS_CORPORA")}
${sliceDeclaration(source, "TS_RULES")}
${sliceDeclaration(source, "TS_SIZES")}
${sliceDeclaration(source, "TS_BLOCKS")}
${sliceDeclaration(source, "TS_DRAWS")}
${sliceDeclaration(source, "tsPairs")}
${sliceDeclaration(source, "tsFit")}
${sliceDeclaration(source, "tsLoss")}
${sliceDeclaration(source, "tsDeterministic")}
${sliceDeclaration(source, "tsGenerate")}
${sliceDeclaration(source, "tsRepeatShare")}
${sliceDeclaration(source, "tsRow")}
${sliceDeclaration(source, "tsBounds")}
${sliceDeclaration(source, "tsMissShare")}
({TS_CORPORA,TS_RULES,TS_SIZES,TS_BLOCKS,TS_DRAWS,tsPairs,tsLoss,tsDeterministic,tsGenerate,tsRepeatShare,tsRow,tsBounds,tsMissShare})`, {});
  const tsFail = message => { throw new Error(`target shift: ${message}`); };
  // This lab keeps its transfer answer inline on the card rather than in the shared pack;
  // `lab transfer answers` holds that both homes never name the same lab, so reading one is
  // enough -- but reading the wrong one silently returns an empty string and every quote
  // check below would pass vacuously. Hence the explicit failure.
  const tsAnswerText = () => {
    const inline = base.labs.find(lab => lab.id === "target-shift")?.transferAnswer;
    const shared = readConstant("LAB_TRANSFER_ANSWERS")["target-shift"];
    const text = inline || shared;
    if (!text) tsFail("the lab has no transfer answer in either home");
    return text;
  };
  let tsChecks = 0;

  // --- 1. the loss, typed again --------------------------------------------------------
  // The smallest training loss a pairing admits is the empirical conditional entropy of the
  // target given the context. Counted here with plain objects and summed in a different
  // order than the app does it, so an agreement is evidence rather than a shared bug.
  const retypedLoss = (tokens, offset) => {
    const rows = {};
    let n = 0;
    for (let t = 0; t < tokens.length; t++) {
      const u = t + offset;
      if (u < 0 || u >= tokens.length) continue;
      const context = tokens[t], target = tokens[u];
      rows[context] = rows[context] || {};
      rows[context][target] = (rows[context][target] || 0) + 1;
      n++;
    }
    if (!n) return NaN;
    // Σ_c Σ_y count(c,y) · −log(count(c,y)/count(c)), i.e. grouped by context rather than
    // walked pair by pair. Same number, different summation order.
    let total = 0;
    for (const row of Object.values(rows)) {
      const counts = Object.values(row), mass = counts.reduce((a, b) => a + b, 0);
      for (const count of counts) total += count * -Math.log(count / mass);
    }
    return total / n;
  };
  for (const corpus of tsApi.TS_CORPORA) for (const rule of tsApi.TS_RULES) {
    const mine = retypedLoss(corpus.tokens, rule.offset), theirs = tsApi.tsLoss(tsApi.tsPairs(corpus.tokens, rule.offset));
    if (!(Math.abs(mine - theirs) < 1e-12)) tsFail(`${corpus.key}/${rule.key}: the app computes ${theirs} where the definition gives ${mine}`);
    tsChecks++;
  }

  // --- 2. the finding: the copy rule is exactly zero, everywhere ------------------------
  // Not "small". Exactly zero, in every corpus, because the map x[t] -> x[t] is a function.
  // If this ever became merely tiny, the lab's claim that it holds at every model size and
  // in every text would be a rhetorical flourish rather than an identity.
  for (const corpus of tsApi.TS_CORPORA) {
    const row = tsApi.tsRow(corpus.tokens, tsApi.TS_RULES.find(rule => rule.key === "same"));
    if (row.loss !== 0) tsFail(`${corpus.key}: the unshifted rule computes ${row.loss} rather than an exact zero`);
    if (row.sharp.sharp !== row.sharp.contexts) tsFail(`${corpus.key}: the unshifted rule leaves ${row.sharp.contexts - row.sharp.sharp} ambiguous context(s), which cannot happen for a copy`);
    if (row.repeat !== 1) tsFail(`${corpus.key}: the unshifted rule generates a repetition share of ${row.repeat} rather than 1`);
    // and every other rule has to be strictly above it, or "best loss" means nothing
    for (const rule of tsApi.TS_RULES.filter(entry => entry.key !== "same")) {
      const other = tsApi.tsRow(corpus.tokens, rule);
      if (!(other.loss > 0)) tsFail(`${corpus.key}/${rule.key}: a rule that is not the copy reaches ${other.loss}`);
    }
    tsChecks += 3 + tsApi.TS_RULES.length - 1;
  }

  // --- 3. the ranking the lab prints ---------------------------------------------------
  // The first draft of the short check asked which wrong rule is "hardest to spot from the
  // loss" and answered "the backward shift". The sweep said no: on the doubling corpus the
  // skip rule sits 0.001330 from the correct one, closer than the backward shift ever gets.
  // So the claim that survives is the weaker and more useful one -- *which* rule hides is a
  // property of the text, not of the rule -- and the guard pins the map corpus by corpus so
  // the answer cannot quietly become universal again.
  const tsClosest = { mixed: "prev", tiny: "prev", rep: "skip" };
  for (const corpus of tsApi.TS_CORPORA) {
    const rows = tsApi.TS_RULES.map(rule => tsApi.tsRow(corpus.tokens, rule));
    const best = rows.reduce((a, b) => b.loss < a.loss ? b : a);
    if (best.rule.key !== "same") tsFail(`${corpus.key}: the lowest loss belongs to ${best.rule.key}, so the lab's headline claim does not hold here`);
    const correct = rows.find(row => row.rule.key === "next").loss;
    const gaps = rows.filter(row => row.rule.key !== "next")
      .map(row => [row.rule.key, Math.abs(row.loss - correct)]).sort((a, b) => a[1] - b[1]);
    if (gaps[0][0] !== tsClosest[corpus.key])
      tsFail(`${corpus.key}: the wrong rule closest to the correct one is ${gaps[0][0]}, not the ${tsClosest[corpus.key]} the lab names`);
    // the copy is never the closest -- that is the half of the claim that does hold everywhere
    if (gaps[gaps.length - 1][0] !== "same")
      tsFail(`${corpus.key}: the unshifted rule is not the furthest from the correct one, so "furthest and yet best" is no longer true`);
    tsChecks += 3;
  }
  // and the map has to have both answers in it, or naming a corpus proves nothing
  if (new Set(Object.values(tsClosest)).size < 2)
    tsFail("every corpus names the same closest rule, so the lab's \"it depends on the text\" is untestable here");
  // the number the prose quotes, measured rather than trusted
  const tsRepRows = tsApi.TS_RULES.map(rule => tsApi.tsRow(tsApi.TS_CORPORA.find(entry => entry.key === "rep").tokens, rule));
  const tsRepCorrect = tsRepRows.find(row => row.rule.key === "next").loss;
  const tsRepGap = Math.abs(tsRepRows.find(row => row.rule.key === "skip").loss - tsRepCorrect);
  const tsRepPrinted = tsRepGap.toFixed(6).replace(".", ",");
  if (tsRepPrinted !== "0,001330") tsFail(`the skip rule sits ${tsRepPrinted} from the correct one on the doubling corpus, not the 0,001330 the prose quotes`);
  if (!tsAnswerText().includes("0,001330")) tsFail("the transfer answer no longer quotes the gap the claim rests on");
  tsChecks += 2;

  // --- 4. the honest edge, kept honest -------------------------------------------------
  // One state has no generation at all: on the doubling corpus the backward rule never sees
  // the seed token as a context. The lab prints that in words. A guard that did not name the
  // case would let it silently turn into a NaN on the screen.
  const tsDoubling = tsApi.TS_CORPORA.find(corpus => corpus.key === "rep");
  const tsStalled = tsApi.tsRow(tsDoubling.tokens, tsApi.TS_RULES.find(rule => rule.key === "prev"));
  if (tsStalled.generated.tokens.length) tsFail("the doubling corpus no longer produces the stalled generation the lab describes in words");
  if (Number.isFinite(tsStalled.repeat)) tsFail("a stalled generation has to leave the repetition share undefined rather than inventing one");
  tsChecks += 2;

  // --- 5. the index bound, as integers -------------------------------------------------
  // A1's get_batch returns x[i:i+m] and x[i+1:i+m+1]. The target therefore reaches x[i+m],
  // so i + m <= n - 1. The naive bound i <= n - m admits exactly one more start, and it is
  // always exactly one -- that is what makes the hit probability fall as the shard grows.
  // The step matters more than the range. A first draft walked n in steps of 7, so every n
  // it visited had the same residue mod 7 -- and a paired mutation that broke the bound only
  // at n % 7 === 3 walked straight through it. A sweep whose step shares a factor with the
  // property under test covers one residue class and calls it a range. Step 1 has none.
  let tsSweep = 0;
  for (let n = 20; n <= 260; n += 1) for (let m = 2; m < n; m += 3) {
    const bounds = tsApi.tsBounds(n, m);
    if (bounds.valid !== n - m) tsFail(`n=${n} m=${m}: ${bounds.valid} valid starts where i + m <= n - 1 gives ${n - m}`);
    if (bounds.broken !== 1) tsFail(`n=${n} m=${m}: ${bounds.broken} broken starts -- the argument rests on it always being one`);
    if (bounds.lastStart + m !== bounds.readIndex) tsFail(`n=${n} m=${m}: the broken start's target does not read x[n]`);
    // brute force, the other direction: exactly one start in [0, n-m] has i + m > n - 1
    let counted = 0;
    for (let i = 0; i <= n - m; i++) if (i + m > n - 1) counted++;
    if (counted !== 1) tsFail(`n=${n} m=${m}: the brute-force count finds ${counted} broken starts`);
    tsSweep++; tsChecks += 4;
  }
  if (tsSweep < 1000) tsFail(`the bound sweep covered only ${tsSweep} combinations`);

  // --- 6. the two figures the transfer answer quotes -----------------------------------
  // Both directions: the answer text has to carry them, and they have to be what the model
  // computes. A quoted number that drifted from the arithmetic is the failure this catches.
  const tsAnswer = tsAnswerText();
  for (const [sizeKey, blockKey, draws, expected] of [["n10k", "m256", 1000, "90,2468"], ["n100k", "m256", 1000, "99,0024"]]) {
    const size = tsApi.TS_SIZES.find(entry => entry.key === sizeKey), block = tsApi.TS_BLOCKS.find(entry => entry.key === blockKey);
    const miss = tsApi.tsMissShare(tsApi.tsBounds(size.n, block.m), draws);
    const printed = (miss * 100).toFixed(4).replace(".", ",");
    if (printed !== expected) tsFail(`n=${size.n} m=${block.m}: ${draws} draws miss the broken start with ${printed} %, not the ${expected} % the answer quotes`);
    if (!tsAnswer.includes(`${expected} %`)) tsFail(`the transfer answer no longer quotes ${expected} %, so the reader is sent after a figure it does not carry`);
    tsChecks += 2;
  }
  // and the miss share has to grow with the shard, which is the counterintuitive half
  const tsMissByShard = tsApi.TS_SIZES.map(size => tsApi.tsMissShare(tsApi.tsBounds(size.n, 256), 1000));
  for (let index = 1; index < tsMissByShard.length; index++)
    if (!(tsMissByShard[index] > tsMissByShard[index - 1]))
      tsFail("a larger shard does not make the broken start harder to hit, which is the lab's second claim");
  tsChecks += tsMissByShard.length - 1;

  // --- 7. the lab is where the reader needs it -----------------------------------------
  const tsLabConcepts = readConstant("LAB_CONCEPTS")["target-shift"];
  if (!tsLabConcepts || !tsLabConcepts.includes("lm-objective")) tsFail("the lab is not attached to the lm-objective concept");
  const tsCheck = sliceDeclaration(source, "checkTargetShift");
  for (const key of ["deterministic", "depends", "single"])
    if (!tsCheck.includes(`"${key}"`)) tsFail(`the short check no longer accepts ${key}`);
  if (!source.includes('id="tsCheckBound"')) tsFail("the third short check is gone");
  // The mutation test found this gap: checking the keys the *checker* accepts says nothing
  // about the keys the *panel* offers. Rename one option value and the question becomes
  // unanswerable while every assertion above still passes. Both sides, per select.
  const tsPanel = source.slice(source.indexOf('if(id==="target-shift") return `'), source.indexOf('if(id==="causal-invariance") return `'));
  for (const [selectId, accepted] of [["tsCheckZero", ["deterministic", "small", "vocab"]],
                                      ["tsCheckQuiet", ["depends", "prev", "same"]],
                                      ["tsCheckBound", ["single", "m", "grow"]]]) {
    const start = tsPanel.indexOf(`id="${selectId}"`);
    if (start < 0) tsFail(`the ${selectId} select is gone from the panel`);
    const offered = [...tsPanel.slice(start, tsPanel.indexOf("</select>", start)).matchAll(/<option value="([^"]*)"/g)]
      .map(hit => hit[1]).filter(Boolean);
    if (JSON.stringify(offered) !== JSON.stringify(accepted))
      tsFail(`${selectId} offers ${JSON.stringify(offered)} while the guard expects ${JSON.stringify(accepted)} -- a renamed option value leaves the question unanswerable without breaking anything else`);
    tsChecks += offered.length;
  }
  // and the one the checker treats as correct has to be among the offered ones
  for (const [selectId, correct] of [["tsCheckZero", "deterministic"], ["tsCheckQuiet", "depends"], ["tsCheckBound", "single"]]) {
    const start = tsPanel.indexOf(`id="${selectId}"`);
    if (!tsPanel.slice(start, tsPanel.indexOf("</select>", start)).includes(`value="${correct}"`))
      tsFail(`${selectId} does not offer ${correct}, which the checker accepts as the right answer`);
    tsChecks++;
  }
  tsChecks += 5;

  console.log(`target shift OK: ${tsChecks} checks -- A1's get_batch and the next-token objective recomputed from the definition: the unshifted pairing reaches an exact 0.000000 in all ${tsApi.TS_CORPORA.length} texts because its map is a function, and its greedy roll-out repeats the same token 100 % of the time, so the best loss of the four belongs to the rule that learns nothing; which wrong rule then hides closest to the correct one is a property of the text and not of the rule (the skip rule sits ${tsRepPrinted} away on the doubling corpus, the backward shift elsewhere) while the copy is the furthest away in all three and still the best; and the naive bound i <= n - m admits exactly one start too many over ${tsSweep} (n, m) combinations -- brute-forced in both directions -- so 1,000 drawn batches miss it with 90.2468 % at n = 10,000 and 99.0024 % at n = 100,000, the larger shard being the harder one`);
}

// ---- mask pii: the three maskers A4 asks for, recomputed from the corpus ------------------
// `a4:mask_pii` (3 points) was the last problem outside A5 whose deciding concept had no lab
// that computes anything. A4 checks the maskers with test_mask_emails, test_mask_phones and
// test_mask_ips -- against the *masked string*, not against a verdict of "found or not". Two
// separate things follow from that, and neither had a number in the app:
//
//   1. A span that overshoots is a miss, however clearly a reader would call it a find. The
//      loose email pattern finds all three addresses and passes no test at all.
//   2. The obvious repair to the IP pattern -- checking 0-255 -- removes exactly one of its
//      two false alarms. The other one is a version number, which is a syntactically valid
//      dotted quad; no pattern can exclude it, only context can.
//
// The corpus carries its own truth inline ({e|...}, {p|...}, {i|...}), so text and labels
// cannot drift apart, and this guard re-derives the offsets a second time rather than reading
// the app's parser.
{
  const piiApi = runInNewContext(`${numberPrelude}
${sliceDeclaration(source, "PII_MARKED")}
${sliceDeclaration(source, "PII_KINDS")}
${sliceDeclaration(source, "PII_MARKS")}
${sliceDeclaration(source, "PII_VARIANTS")}
${sliceDeclaration(source, "PII_SETTINGS")}
${sliceDeclaration(source, "piiKindOf")}
${sliceDeclaration(source, "piiVariantOf")}
${sliceDeclaration(source, "piiSettingOf")}
${sliceDeclaration(source, "piiDocs")}
${sliceDeclaration(source, "piiSpans")}
${sliceDeclaration(source, "piiScore")}
${sliceDeclaration(source, "piiLedger")}
${sliceDeclaration(source, "piiCountTrap")}
({PII_MARKED,PII_KINDS,PII_VARIANTS,PII_SETTINGS,piiDocs,piiSpans,piiScore,piiLedger,piiCountTrap})`, {});
  const piiFail = message => { throw new Error(`mask pii: ${message}`); };
  let piiChecks = 0;

  // --- 1. the corpus, parsed a second time ---------------------------------------------
  // A hand-counted offset was the first mistake made while building this lab, so the guard
  // does not accept the app's parse: it strips the markers with a regex instead and requires
  // both the plain text and every span to agree character for character.
  const piiRetyped = piiApi.PII_MARKED.map(marked => {
    const truth = [];
    let text = "", rest = marked;
    const kindOf = { e: "email", p: "phone", i: "ip" };
    while (rest.length) {
      const open = rest.indexOf("{");
      if (open < 0 || rest[open + 2] !== "|") { text += rest; break; }
      text += rest.slice(0, open);
      const close = rest.indexOf("}", open), body = rest.slice(open + 3, close);
      truth.push({ kind: kindOf[rest[open + 1]], start: text.length, end: text.length + body.length, text: body });
      text += body;
      rest = rest.slice(close + 1);
    }
    return { text, truth };
  });
  const piiDocsApp = piiApi.piiDocs();
  if (piiDocsApp.length !== piiRetyped.length) piiFail(`the app reads ${piiDocsApp.length} documents where the markup holds ${piiRetyped.length}`);
  for (let index = 0; index < piiRetyped.length; index++) {
    if (piiDocsApp[index].text !== piiRetyped[index].text)
      piiFail(`document ${index}: the app's plain text differs from the one the markers describe`);
    if (JSON.stringify(piiDocsApp[index].truth) !== JSON.stringify(piiRetyped[index].truth))
      piiFail(`document ${index}: the app's spans are ${JSON.stringify(piiDocsApp[index].truth)} where the markers give ${JSON.stringify(piiRetyped[index].truth)}`);
    // and no marked span may contain a marker leftover, which would mean the parse ran twice
    for (const entry of piiRetyped[index].truth)
      if (/[{}|]/.test(entry.text)) piiFail(`document ${index}: the span ${JSON.stringify(entry.text)} still carries markup`);
    piiChecks += 2 + piiRetyped[index].truth.length;
  }
  const piiTruthCount = piiRetyped.reduce((sum, doc) => sum + doc.truth.length, 0);
  if (piiTruthCount < 8) piiFail(`only ${piiTruthCount} marked spans, the corpus has lost its labels`);

  // --- 2. every pattern scored against that truth, independently ------------------------
  // Same rule as the test: a match counts only when its span equals a marked one exactly.
  const piiRescore = (kind, variantKey) => {
    const variant = piiApi.PII_VARIANTS[kind].find(entry => entry.key === variantKey);
    let tp = 0, fp = 0, fn = 0, found = 0;
    for (const doc of piiRetyped) {
      const truth = doc.truth.filter(entry => entry.kind === kind);
      const taken = new Set();
      for (const span of piiApi.piiSpans(variant, doc.text)) {
        found++;
        const hit = truth.findIndex((entry, index) => !taken.has(index) && entry.start === span.start && entry.end === span.end);
        if (hit >= 0) { taken.add(hit); tp++; } else fp++;
      }
      fn += truth.length - taken.size;
    }
    return { found, tp, fp, fn };
  };
  for (const [kind, variants] of Object.entries(piiApi.PII_VARIANTS)) for (const variant of variants) {
    const mine = piiRescore(kind, variant.key), theirs = piiApi.piiScore(kind, variant.key);
    for (const field of ["found", "tp", "fp", "fn"])
      if (mine[field] !== theirs[field]) piiFail(`${kind}/${variant.key}: the app reports ${field}=${theirs[field]} where the rescoring gives ${mine[field]}`);
    piiChecks += 4;
  }

  // --- 3. the two findings, as claims that can fail -------------------------------------
  // The range check buys precision and costs no recall, and it cannot reach the version
  // number. Both halves, by name -- a repair that removed both false alarms would make the
  // lab's whole argument wrong, and the guard has to notice that too.
  const piiNaive = piiApi.piiScore("ip", "naive"), piiRanged = piiApi.piiScore("ip", "ranged");
  if (!(piiRanged.precision > piiNaive.precision)) piiFail("the range check no longer buys any precision");
  if (piiRanged.recall !== piiNaive.recall) piiFail("the range check changed the recall, which the lab says it does not");
  if (piiRanged.recall !== 1) piiFail(`both IP patterns should find every marked address; recall is ${piiRanged.recall}`);
  if (piiRanged.fp !== 1) piiFail(`the range check leaves ${piiRanged.fp} false alarm(s), and the lab's point is that exactly one survives`);
  if (!piiRanged.falsePositives.includes("1.2.3.4"))
    piiFail(`the surviving false alarm is ${JSON.stringify(piiRanged.falsePositives)}, not the version number the lab names`);
  if (piiNaive.falsePositives.filter(entry => entry === "999.999.999.999").length !== 1)
    piiFail("the naive pattern no longer masks the impossible address, so the pair the lab contrasts is gone");
  // the version number really is a valid dotted quad -- that is *why* no pattern can help
  if (!/^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/.test("1.2.3.4"))
    piiFail("1.2.3.4 is not a valid dotted quad, so the lab's explanation of the surviving false alarm collapses");
  piiChecks += 7;

  // The loose email pattern: the same address is a false positive and a miss at once, which
  // is what "the mistake is the span, not the find" means. Anything else and the short check
  // answer would be wrong.
  const piiLoose = piiApi.piiScore("email", "loose"), piiStrictMail = piiApi.piiScore("email", "strict");
  if (piiStrictMail.precision !== 1 || piiStrictMail.recall !== 1) piiFail("the tight email pattern no longer scores perfectly, so it is not the reference any more");
  if (piiLoose.found !== piiStrictMail.found)
    piiFail(`the loose pattern reports ${piiLoose.found} matches against ${piiStrictMail.found} -- the lab's claim is that it finds every address and still fails`);
  for (const missed of piiLoose.missed)
    if (!piiLoose.falsePositives.some(entry => entry.startsWith(missed)))
      piiFail(`the loose pattern missed ${JSON.stringify(missed)} without a false positive that overshoots it, so the mistake is not the span`);
  piiChecks += 2 + piiLoose.missed.length;

  // --- 4. what masking costs the text ---------------------------------------------------
  // Both counterintuitive halves: the corpus grows, and masking fewer instances destroys more.
  for (const setting of piiApi.PII_SETTINGS) {
    const ledger = piiApi.piiLedger(setting.key);
    if (!(ledger.net > 0)) piiFail(`${setting.key}: masking shrinks the corpus by ${-ledger.net} characters, and the lab says it grows`);
    if (!(ledger.touched > 0 && ledger.touched <= ledger.documents)) piiFail(`${setting.key}: ${ledger.touched} of ${ledger.documents} documents touched`);
    piiChecks += 2;
  }
  const piiTight = piiApi.piiLedger("strict"), piiSloppy = piiApi.piiLedger("loose");
  if (!(piiSloppy.instances < piiTight.instances)) piiFail("the loose setting no longer masks fewer instances than the tight one");
  if (!(piiSloppy.destroyed > piiTight.destroyed)) piiFail("the loose setting no longer destroys more legitimate text, which is the whole point of the comparison");
  const piiTrap = piiApi.piiCountTrap("strict");
  if (piiTrap.after !== 0) piiFail(`counting in the masked text finds ${piiTrap.after} matches; the placeholder is supposed to be invisible to every pattern`);
  if (piiTrap.before !== piiTight.instances) piiFail(`the trap counts ${piiTrap.before} before replacing where the ledger reports ${piiTight.instances} instances`);
  // and the placeholders themselves must not be matchable, or the trap is an accident
  for (const kind of piiApi.PII_KINDS) for (const [, variants] of Object.entries(piiApi.PII_VARIANTS)) for (const variant of variants)
    if (piiApi.piiSpans(variant, kind.token).length)
      piiFail(`the placeholder ${kind.token} is matched by ${variant.key}, so masking twice would not be idempotent`);
  piiChecks += 4 + piiApi.PII_KINDS.length * 6;

  // --- 5. the figures the answer quotes, and the wiring ---------------------------------
  const piiAnswer = base.labs.find(lab => lab.id === "mask-pii")?.transferAnswer || "";
  for (const [value, digits] of [[piiNaive.precision, 4], [piiRanged.precision, 4], [piiLoose.precision, 4]]) {
    const printed = `${(value * 100).toFixed(digits).replace(".", ",")} %`;
    if (!piiAnswer.includes(printed)) piiFail(`the transfer answer no longer quotes ${printed}, so the reader is sent after a figure it does not carry`);
    piiChecks++;
  }
  if (!piiAnswer.includes(`${piiTrap.after} statt ${piiTrap.before}`)) piiFail("the transfer answer no longer quotes the counting trap's two numbers");
  const piiLabConcepts = readConstant("LAB_CONCEPTS")["mask-pii"];
  if (!piiLabConcepts || !piiLabConcepts.includes("pii-harm")) piiFail("the lab is not attached to the pii-harm concept");
  if (!handoutProblems["a4:mask_pii"]) piiFail("a4:mask_pii is gone from the handout list, and the lab's premise is that problem");
  const piiPanel = source.slice(source.indexOf('if(id==="mask-pii") return `'), source.indexOf('if(id==="target-shift") return `'));
  for (const [selectId, accepted] of [["piiCheckRange", ["context", "greedy", "order"]],
                                      ["piiCheckSpan", ["span", "count", "order"]],
                                      ["piiCheckCount", ["zero", "same", "more"]]]) {
    const start = piiPanel.indexOf(`id="${selectId}"`);
    if (start < 0) piiFail(`the ${selectId} select is gone from the panel`);
    const offered = [...piiPanel.slice(start, piiPanel.indexOf("</select>", start)).matchAll(/<option value="([^"]*)"/g)].map(hit => hit[1]).filter(Boolean);
    if (JSON.stringify(offered) !== JSON.stringify(accepted))
      piiFail(`${selectId} offers ${JSON.stringify(offered)} while the guard expects ${JSON.stringify(accepted)}`);
    piiChecks += offered.length;
  }
  const piiCheck = sliceDeclaration(source, "checkMaskPii");
  for (const key of ["context", "span", "zero"])
    if (!piiCheck.includes(`"${key}"`)) piiFail(`the short check no longer accepts ${key}`);
  piiChecks += 5;

  console.log(`mask pii OK: ${piiChecks} checks -- A4's three maskers scored against a corpus whose ${piiTruthCount} spans are re-derived from the markup rather than read out of the app: a match counts only when its span equals the marked one, which is the test's rule and not a reader's, so the loose email pattern finds all ${piiLoose.found} addresses and still scores ${(piiLoose.precision * 100).toFixed(4)} % against the tight pattern's 100.0000 % -- every miss it reports is the same address a false positive overshot; the 0-255 range check lifts IP precision from ${(piiNaive.precision * 100).toFixed(4)} % to ${(piiRanged.precision * 100).toFixed(4)} % at unchanged recall and cannot reach the surviving false alarm, because "1.2.3.4" is a valid dotted quad and only context says otherwise; and masking grows the corpus in all ${piiApi.PII_SETTINGS.length} settings (+${piiTight.net} characters, ${(piiTight.growth * 100).toFixed(4)} %) while the loose setting masks ${piiSloppy.instances} instances against ${piiTight.instances} and destroys ${piiSloppy.destroyed} characters of legitimate text against ${piiTight.destroyed}, and counting after the replacement returns ${piiTrap.after} instead of ${piiTrap.before}`);
}
