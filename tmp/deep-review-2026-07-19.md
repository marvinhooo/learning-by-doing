# Deep Review 2026-07-19 (geplanter Claude-Run, ~07:10)

Kontext: Keine Codex-Aktivität seit dem 18.07.; die uncommitteten Änderungen im
Arbeitsbaum stammen aus dem eigenen Run vom 18.07. (bewusst uncommitted gelassen).
Basis vor Beginn geprüft: `node --check` auf dem Inline-Script sauber, `check-i18n`
grün. Ich habe darauf aufgesetzt und **die offenen Hebel vom 18.07. umgesetzt plus
den PDF-Fidelity-Audit auf L5/L7/L14 ausgedehnt**.

## Was heute umgesetzt wurde

### 1. Übungsfokus-Schnellzugriff (Hebel 2 vom 18.07.)

Jede Lecture-Detailseite hat jetzt ein Seitenleisten-Panel **„Diese Lecture üben /
Practice this lecture"**, jede Assignment-Seite ein Panel **„Für dieses Assignment
üben / Practice for this assignment"**. Ein Klick auf „Fokussiert üben / Start
focused practice" setzt den Übungsfokus vor und öffnet `#quiz` — ein Klick statt
Select-Suche. Technisch: `data-practice-scope`-Buttons, ein neuer Handler in
`bindOpeners` (setzt `reviewScope`, ruft `navigate("quiz")`). Alle Verträge
unverändert: Fokus bleibt flüchtiger Sitzungszustand, filtert nur Karten, keine
Readiness-Wertung (Beschriftung sagt das explizit).

### 2. L4/L10-Hinweiszeile (Hebel 3 vom 18.07.)

Lectures ohne Assignment-Zuordnung (L4 MoE, L10 Inference) zeigen statt gar keinem
„Was das vorbereitet"-Panel jetzt eine erklärende Zeile: „Kein Assignment greift
direkt auf diese Lecture zu. Sie vertieft Konzepte, die der Kurs durchgehend nutzt –
nützlicher Hintergrund, nichts zum Abgeben." (EN analog.) Die Lücke ist damit
erklärt statt nur leer.

### 3. Fidelity-Audit L5 (GPUs), L7 (Parallelism), L14 — mit drei Content-Fixes

Grundlage: pdftotext-Extrakte in `tmp/pdfs/coverage-audit-2026-07-15/`,
seitenweise gegen die kuratierten Konzepte gehalten.

- **L5-Lücke geschlossen — Tensor Cores:** „Tensor Core" kam plattformweit **null**
  Mal vor, obwohl das GPUs-PDF (S. 16, 25) sie als Kern der Matmul-Beschleunigung
  behandelt (>10× schneller als andere Float-Ops, Low-Precision-Raten). Fix: neues
  viertes Detail in `gpu-model` (DE+EN): spezialisierte Matmul-Schaltkreise,
  Größenordnungsvorsprung, „Peak-FLOPs gelten nur für Matmuls im passenden dtype".
- **L5-Lücke geschlossen — Wave Quantization / „Matrix Mystery":** Die
  Performance-Cliffs des PDFs (S. 41–44: Tile-Teilbarkeit, Alignment, zusätzliche
  Block-Welle bei 1792→1793) fehlten. Fix: Tile-Detail von `fusion-tiling` (DE+EN)
  erweitert um Leistungssprünge statt glatter Kurven inkl. Begriff Wave Quantization.
  Für A2-Profiling direkt relevant (erklärt „warum ist die größere Matrix schneller?").
- **L7 weitgehend vollständig:** Reduce-Scatter+All-Gather-Äquivalenz, ZeRO 1–3
  inkl. Kommunikationskosten, Micro-Batches/Bubble, Tensor-/Sequenz-Parallelismus,
  Aktivierungsspeicher und 3D-Regeln sind alle abgedeckt (21–29 Treffer je Begriff).
  Einzige Mini-Lücke — **Zero-Bubble-Pipelining** (PDF S. 35) — geschlossen: ein
  Satz im Pipeline-Detail von `model-parallelism` (Backward in Aktivierungs- und
  Gewichtsgradienten teilen, Gewichtsgradienten in Leerlauffenster schieben).
- **L14 nur verifiziert (bereits am 16./17.07. auditiert):** KenLM-Log10-Korrektur
  (`PPL=10^(−score/N)`) und Bloom-FPR-Nenner („nur tatsächlich negative Queries")
  sind unverändert vorhanden.

### Begleitende Änderungen

- Version-Bump auf **v43** (SW-Cache `cs336-shell-v43`, Bundle `i18n-en.js?v=43`,
  README), da Shell-gecachte Dateien geändert wurden; `_site` neu gebaut.
- `memory.md` um zwei Produktentscheidungen ergänzt (Schnellzugriff+L4/L10-Zeile,
  L5/L7-Kuratierung mit PDF-Seitenbelegen).

## Verifiziert (mit Beleg)

1. `check-i18n` grün (72 Concepts, 79 Formeln, 72 Symbole, 70 Glossareinträge,
   26 Labs, 29 Missions, 1.047 UI-Strings) — inkl. DE/EN-Arraylängen-Parität der
   erweiterten Details. `node --check` auf Inline-Script (1,06 MB) und `i18n-en.js`
   sauber.
2. Browser-Smoke ohne Konsolenfehler. Schnellzugriff L5: Klick → `#quiz`, Select
   steht auf „Lecture 5 · GPUs", 17 Karten im Fokus. Schnellzugriff A2: Klick →
   `#quiz`, „A2 · Systems", 55 Karten. L10 zeigt die neue Hinweiszeile plus
   Übungspanel; L7 auf Deutsch korrekt („Diese Lecture üben" / „Fokussiert üben").
3. Neue Inhalte gerendert geprüft: `gpu-model` (EN: Tensor Cores, „order of
   magnitude", „advertised peak performance"), `fusion-tiling` (EN „performance
   cliffs"/„Wave Quantization", DE „Leistungssprünge"), `model-parallelism`
   (DE „Zero-Bubble-Pipelining"). Sprachwechsel EN↔DE behielt die Route.

## Zustand des Arbeitsbaums

Weiterhin **bewusst uncommitted** (Regel: committen nur auf Zuruf). Der Diff
enthält jetzt die Stände vom 18.07. **und** 19.07.: `index.html`, `i18n-en.js`,
`sw.js`, `README.md`, `memory.md`, `scripts/check-i18n.mjs`. Commit-Vorschlag,
gern auch als zwei Commits (18.07-Stand / 19.07-Stand):
`feat: practice-focus shortcuts and GPU-lecture fidelity fixes` — danach Push für
den Pages-Deploy (v43 invalidiert installierte PWA-Shells korrekt).

## Nächste Hebel (priorisiert)

1. **Neutraler Zeitaufwand pro Lecture** („~x min Guide + y min Experimente";
   Labs zeigen Minuten bereits). Letzter noch offener Punkt vom 15.07. Bewusst
   erneut zurückgestellt: Die Angabe braucht eine ehrliche Kuratierung pro Lecture
   (nicht bloß Wortzahl÷Lesegeschwindigkeit) und sollte laut Memory-Regel nie als
   Soll oder Termindruck erscheinen — das verdient einen eigenen fokussierten Run.
2. **Fidelity-Audit der restlichen Trace-Lectures** (L1, L2, L6, L8, L12, L13, L17
   wurden seit dem Coverage-Pass vom 15.07. nicht mehr tief gegen die PDFs
   gehalten; Stichprobe L5/L7 fand heute drei echte Lücken — die Traces könnten
   ähnliche haben).
3. **Kosmetik:** `test.ipynb` aus dem 17.07.-Report existiert nicht mehr (erledigt);
   keine weiteren offenen Kleinigkeiten bekannt.
