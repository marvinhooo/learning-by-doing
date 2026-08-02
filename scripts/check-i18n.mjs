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
