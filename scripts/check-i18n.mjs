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

// ---------------------------------------------------------------------------------------------
// mixed-precision: the lab claims exact FP16/BF16 arithmetic. Every number it shows is therefore a
// falsifiable statement about IEEE 754, and each guard below pins one of them. The independent
// reference is re-typed here from the format definitions, not imported from the app.
const precSource = ["PREC_LN_EPS", "PREC_LN_BASE", "precF32Buffer", "precU32Buffer", "precBf16", "precRound",
  "PREC_DTYPES", "PREC_CASES", "PREC_SCHEMES", "precAccumulate", "precAllSchemes", "precLayerNorm",
  "PREC_SCALES", "PREC_AUTOCAST_ROWS"];
const precApi = runInNewContext(`${precSource.map(name => sliceDeclaration(source, name)).join("\n")}; ({${precSource.join(",")}})`,
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
const ckptApi = runInNewContext(`${ckptSource.map(name => sliceDeclaration(source, name)).join("\n")}; ({${ckptSource.join(",")}})`,
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
if (!ckptSegmentRenderer.includes("optimumReal.toFixed(4)")) throw new Error("checkpoint-segments: the renderer must display k* = √(N·c/r) itself, the rule-of-thumb argument is read off against it");
if (!/\(boundary\/residual\)\.toFixed\(4\)/.test(ckptSegmentRenderer)) throw new Error("checkpoint-segments: the renderer must display the ratio ρ, which is the quantity the whole lab turns on");
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
  `const CKPT_BLOCK_RESIDUAL = ${14605.25 / 4}, CKPT_BOUNDARY = ${(4 * 2048 * 2560 * 4) / (1024 * 1024)};
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
if (!shardCommRenderer.includes("ratio.toFixed(3)")) throw new Error("shard-ledger: the communication renderer must display the ratio against DDP, the 1.500 and 0.750 are the whole comparison");
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
const offApi = runInNewContext(`${offNames.map(name => sliceDeclaration(source, name)).join("\n")}; ({${offNames.join(",")}})`, {});
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
const advApi = runInNewContext(`${advNames.map(name => sliceDeclaration(source, name)).join("\n")}; ({${advNames.join(",")}})`, {});
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
const mbdApi = runInNewContext(`${mbdNames.map(name => sliceDeclaration(source, name)).join("\n")}; ({${mbdNames.join(",")}})`, {});
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
if (!/mbdMode.*baseline.*mbdBaselineStage\(\).*mbdLedgerStage\(\)/su.test(mbdStageSwitch))
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
const lshApi = runInNewContext(`${lshNames.map(name => sliceDeclaration(source, name)).join("\n")}; ({${lshNames.join(",")}})`, {});
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
const qtApi = runInNewContext(`${qtNames.map(name => sliceDeclaration(source, name)).join("\n")}; ({${qtNames.join(",")}})`, {});
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
