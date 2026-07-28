# Deep Review 2026-07-20 (geplanter Claude-Run, ~07:10)

Kontext: Keine Codex-Aktivität seit dem 19.07. (mtimes = eigener Run von gestern,
HEAD unverändert auf 54ed090). Basis vor Beginn geprüft: `check-i18n` grün,
`node --check` auf Inline-Script und `i18n-en.js` sauber. Umgesetzt wurde **Hebel 2
vom 19.07.: der Fidelity-Audit der sieben Trace-Lectures (L1, L2, L6, L8, L12, L13,
L17)** gegen die pdftotext-Extrakte in `tmp/pdfs/coverage-audit-2026-07-15/`.

## Audit-Ergebnis pro Trace-Lecture

- **L1 (Tokenization): vollständig.** Character/Byte/Word/BPE-Tokenizer, Roundtrip,
  Tie-Breaking, Kompressionsrate (Bytes pro Token, DE+EN in `tokenizer-tradeoffs`)
  und Tokenfertilität sind abgedeckt; der Kursüberblicksteil der Lecture ist der
  Lernpfad selbst.
- **L2 (PyTorch/Ressourcen): vollständig bis auf Tooling-Asides.** Tensors/Storage/
  Strides, FLOPs-Accounting, Gradients, Data Loading (memmap), Optimizer, Train Loop,
  Checkpointing, Mixed Precision — alles kuratiert. `einsum` wird im `shapes`-Umfeld
  als semantischer Achsenvertrag erklärt; die einops-API-Tour und jaxtyping sind
  bewusst nicht kuratiert (Bibliotheks-Syntax, kein Konzept; A1 verlangt sie nicht).
- **L6 (Kernels/Triton): im Kern vollständig.** Benchmarking-Fallen (Warmup,
  `synchronize`), Profiling, Fusion, Triton-Grid/Masken, Kernel-Verträge vorhanden.
  `torch.compile` ist über die A2-Mission `compile-checkpoint` erreichbar; die
  PTX-Inspektion der Lecture ist ein Tooling-Aside (bewusst nicht ergänzt, um den
  Diff fokussiert zu halten — siehe Hebel unten).
- **L8 (Distributed Hands-on): vollständig.** Collectives, DDP/ZeRO/FSDP, TP/PP,
  Benchmarking, NCCL, async-Handles — alles da; einzig Gloo (CPU-Demo-Backend) ist
  unerwähnt (kein Lernverlust).
- **L12 (Evaluation): eine echte Lücke — geschlossen (siehe unten).** Das
  Evaluationsvertrags-Gerüst (Behauptung → Protokoll → Score, Kontamination, Judge-
  Bias, SE) war stark, aber die konkrete Benchmark-Landschaft der Lecture fehlte
  fast komplett (nur MMLU kam vor; Chatbot Arena, IFEval, AlpacaEval, WildBench,
  GPQA, SWE-Bench, CyBench, MLEBench, ARC-AGI, HarmBench, AIR-Bench: 0 Treffer).
- **L13 (Data): die größte Lücke des Audits — geschlossen (siehe unten).** Die
  Plattform lehrte Pipeline-Mechanik, Quality-Filtering und PII, aber die Trace-
  Lecture besteht überwiegend aus (a) der Korpus-Genealogie von BERT/BooksCorpus
  bis Nemotron-CC (18 benannte Datensätze, alle 0 Treffer), (b) einer eigenen
  Copyright/Lizenzen/Fair-Use-Sektion (0 Treffer für Copyright, Urheberrecht,
  Lizenz, Fair Use) und (c) Long-Context-/Task-Instruktions-/Instruktions-Chat-
  Daten (Flan, Alpaca, Vicuna, Self-Instruct: 0 Treffer).
- **L17 (RL-Walkthrough): vollständig.** `torch.no_grad()`-Freezing von p_old,
  raw→centered→normalized Rewards, „gleiche Rewards ⇒ kein Update", Dr.-GRPO-
  Begründung — alles in `off-policy`/`grpo-variants`/`policy-gradient` abgedeckt.

## Was heute umgesetzt wurde

### 1. Neues L13-Konzept `dataset-lineage` (Korpus-Genealogie, DE+EN)

Fünf Details entlang der Lecture-Chronologie, jeweils mit der Design-Lektion:
frühe kuratierte Ära (BERT/BooksCorpus-Rückzug, WebText/Reddit-Karma als
Herkunftssignal), Web-Skala (WARC vs. WET, CCNet/KenLM-Perplexity, C4-Handregeln),
Mischungs-Ära (GPT-3-Gewichte, The Pile/Books3, MassiveText, LLaMA-Reproduktion),
gefilterte-Web-Ära (RefinedWeb, Dolma, DCLM als Kuratierungs-Benchmark mit
fastText-Klassifikator, Nemotron-CC-Umschreiben) und Post-Pretraining-Daten
(PG-19/Proof-Pile Long Context, Super-Natural Instructions/Flan, Alpaca/Vicuna/
WizardLM synthetische Chat-Daten inkl. Teacher-Bias-Warnung). Mental Model:
„Jeder Korpus beantwortet neu, woran man gute Texte ohne Handlektüre erkennt."

### 2. Neues L13-Konzept `copyright-licensing` (DE+EN)

Vier Details: Schutzumfang (automatisch, Ausdruck ≠ Idee, niedrige Schwelle,
Public Domain/Gutenberg), Lizenzen (Versprechen nicht zu klagen, Creative Commons,
Google–Reddit/OpenAI–Shutterstock-Deals, Terms of Service), die vier Fair-Use-
Faktoren mit Beispielen (Authors Guild v. Google, Parodie) und die Foundation-
Model-Abwägung (Kopieren vor Training, Transformativität vs. Marktwirkung und
Memorierung) — ausdrücklich als Einordnung, keine Rechtsberatung. Pitfalls decken
den „kein ©-Vermerk"-Irrtum und den Books3-Fehler (öffentlich ≠ gemeinfrei) ab.

Beide Konzepte sind Kernkonzepte der Lecture-13-Seite (jetzt „5 Kernideen"),
Teil des Data-Moduls, im Übungsfokus L13/A4-nah enthalten; l13-Guide bekam zwei
neue Outcomes und einen erweiterten Plain-Text.

### 3. Benchmark-Landschaft als viertes Detail von `benchmark-validity` (DE+EN)

Konkrete Namen je Kategorie mit Halbsatz-Einordnung: Wissen (MMLU, MMLU-Pro, GPQA,
Humanity's Last Exam), Instruction Following (IFEval, AlpacaEval, WildBench,
Chatbot Arena mit Elo-artiger Paarvergleichsrangliste), Agents (SWE-Bench, CyBench,
MLEBench — Modell **plus** Scaffolding), Pure Reasoning (ARC-AGI) und Safety
(HarmBench, AIR-Bench inkl. harmloser Kontrollfälle), plus Sättigungs-/
Kontaminationshinweis.

### Begleitende Änderungen

Version-Bump auf **v44** (SW-Cache `cs336-shell-v44`, Bundle `i18n-en.js?v=44`,
README), `_site` neu gebaut, `memory.md` um zwei Produktentscheidungen ergänzt.

## Verifiziert (mit Beleg)

1. `check-i18n` grün: **74 Concepts** (vorher 72), 79 Formeln, 72 Symbole,
   70 Glossareinträge, 26 Labs, 29 Missions, 1.047 UI-Strings — inkl. Tiefen-,
   Paritäts- und Abkürzungsprüfungen der neuen Texte. `node --check` auf
   Inline-Script (1,08 MB) und `i18n-en.js` sauber.
2. Browser-Smoke (lokaler Server, beide Sprachen) ohne Konsolenfehler:
   `#detail/concept/dataset-lineage` rendert EN („Corpus Lineage…", „Core concept
   4 of 5 in Lecture 13") und DE („Korpus-Genealogie…", „Kernkonzept 4 von 5");
   `#detail/concept/copyright-licensing` rendert als Kernkonzept 5 von 5;
   `benchmark-validity` enthält MMLU/Chatbot Arena/SWE-Bench/ARC-AGI/HarmBench;
   Lecture-13-Seite zeigt „5 Kernideen", beide neuen Outcomes und den erweiterten
   Plain-Text (Screenshot im Run geprüft).

## Zustand des Arbeitsbaums

Weiterhin **bewusst uncommitted** (Regel: committen nur auf Zuruf). Der Diff
enthält jetzt die Stände vom 18.–20.07. Commit-Vorschlag für heute:
`feat: L13 corpus lineage and copyright, L12 benchmark landscape` — danach Push
für den Pages-Deploy (v44 invalidiert installierte PWA-Shells korrekt).

## Nächste Hebel (priorisiert)

1. **Neutraler Zeitaufwand pro Lecture** — weiterhin der älteste offene Punkt
   (15.07.); braucht ehrliche Kuratierung pro Lecture und einen eigenen Run,
   nie als Soll/Termindruck (Memory-Regel).
2. **Optional, klein:** `dataset-lineage` zusätzlich in die A4-Konzeptliste
   aufnehmen (Data-Assignment profitiert von der Korpus-Einordnung), plus je ein
   Satz zu `torch.compile` als Baseline in `triton-kernels` und PTX als
   Inspektionswerkzeug. Bewusst nicht heute: Diff klein halten.
3. **Audit-Status:** Alle 17 Lectures sind damit einmal tief gegen die PDFs
   gehalten (L3/L4/L9/L15 am 18.07., L5/L7/L14 am 19.07., Traces heute).
   Künftige Runs können auf gezielte Stichproben statt Vollaudits wechseln.
