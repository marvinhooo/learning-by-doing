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
  const constIndex = text.indexOf(`const ${name} =`);
  if (constIndex >= 0) {
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
const decodeApi = runInNewContext(`${decodeSource}; ({DECODE_GROUP,DECODE_CASES,DECODE_TAUS,DECODE_PS,DECODE_VARIANTS,decodeReport,decodeDrift})`, {});
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
const winrateApi = runInNewContext(`${winrateSource.map(name => sliceDeclaration(source, name)).join("\n")}; ({${winrateSource.join(",")}})`, {});
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
const batchApi = runInNewContext(`${batchSource.map(name => sliceDeclaration(source, name)).join("\n")}; ({${batchSource.join(",")}})`, {});
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

const missionCount = base.assignments.reduce((total, assignment) => total + (assignment.missions || []).length, 0);
console.log(`i18n OK: ${expectedIds.concepts.length} concepts, ${expectedIds.formulas.length} formulas, ${expectedIds.symbols.length} symbols, ${expectedIds.glossary.length} glossary entries, ${expectedIds.labs.length} labs, ${missionCount} missions, ${Object.keys(pack.ui).length - 1} UI strings`);
