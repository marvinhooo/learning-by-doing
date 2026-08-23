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
  // Grouping stays off so the English render is byte-identical to what toFixed produced; the
  // seven older locale-aware helpers group, which only shows on values with a thousands part.
  if (!decl.includes("useGrouping:false")) throw new Error("fixedNum: grouping stays off, so the English render matches what toFixed printed");
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
base.labs.forEach(item => { item.transferAnswer = labAnswers[item.id]; });
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
  if (concept.terms?.length) return concept.terms.slice(0, 8).map(([term, definition]) => ({term, definition}));
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
  if (!/3651[.,]31/.test(lab.misconception)) throw new Error(`checkpoint-segments ${label}: the misconception must pin the argument to the handout's block figure`);
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
const orientationIndex = conceptRenderer.indexOf("conceptOrientationMarkup(c,lectureId)"), mentalIndex = conceptRenderer.indexOf("Mentales Modell"), exampleIndex = conceptRenderer.indexOf("conceptExamplePrimer(c,lectureId)"), detailIndex = conceptRenderer.indexOf("c.details.map");
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
if (abApi.abNumber(abApi.abIdealFf(abTs), 2) !== "1365.33" || abApi.abNumber(abApi.abResidue(abTs), 2) !== "-21.33")
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
if (abApi.abNumber(Math.pow(abApi.abLambda(2), abApi.AB_DEPTH), 0) !== "117649")
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
        '<strong data-tccont="1">d_model = (128 · 850,000,000 / 12)^(1/3) = 2085.207 · n_layer = 2085.207 / 128 = 16.291</strong>',
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
  }
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
