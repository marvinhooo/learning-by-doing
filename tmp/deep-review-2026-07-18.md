# Deep Review 2026-07-18 (geplanter Claude-Run, ~07:10)

Kontext: Keine Codex-Aktivität seit dem 17.07. (HEAD unverändert auf 54ed090, keine Datei
in den letzten Stunden angefasst). Statt den unveränderten Stand erneut nur zu bewerten,
habe ich in diesem Run **die beiden priorisierten Hebel vom 17.07. direkt umgesetzt**.

## Was heute umgesetzt wurde

### 1. Gezieltes Abruftraining nach Lecture oder Assignment (Hebel 1 vom 17.07.)

Auf der Abruftraining-Seite gibt es jetzt einen optionalen **Übungsfokus** (Select über
dem Start-Button): „Alle Lectures und Assignments" (Default), eine einzelne Lecture 1–17
oder ein Assignment A1–A5. Wer gerade L1–3 für A1 vorbereitet, bekommt keine
GRPO-Karten aus L16/17 mehr gemischt.

Scope-Regeln (bewusst konsistent mit bestehenden Verträgen):
- **Lecture-Scope**: Concept-Karten der Kernkonzepte **und** der erklärten
  Voraussetzungen dieser Lecture (`lectureUsesConcept`) plus die **kuratierten**
  Formeln der Lecture — keine über Concept-Verknüpfungen eingeschleusten Gleichungen,
  analog zum Lecture-Kontext-Vertrag.
- **Assignment-Scope**: Vereinigung seiner Quell-Lectures plus Assignment- und
  Mission-Konzepte samt deren Formeln (die der Mission-Renderer ohnehin zeigt).

Unverändert geblieben (geprüft): Priorisierung „nie gesehen → zuletzt Again",
Pull-Prinzip, Bewertungsdatensatz (weiterhin nur `firstAt`/`lastAt`/`lastResult`),
keine Fälligkeit, kein Fortschritts- oder Kompetenzanspruch. Der Fokus ist flüchtiger
Sitzungszustand, wird nicht gespeichert und nicht synchronisiert.

### 2. Lecture-Seiten nennen ihr Assignment (Hebel 2 vom 17.07.)

Jede Lecture-Detailseite zeigt in der Seitenleiste ein Panel **„Was das vorbereitet /
What this prepares"** mit Direktlink(s) zum Assignment Coach — explizit als
„Orientierung, kein Gate" beschriftet. Zuordnung über die vorhandenen
`ASSIGNMENTS.sources`: L1–3→A1, L5–8→A2, L9+L11→A3, L12–14→A4 (L12 zusätzlich A5),
L15–17→A5. L4 (MoE) und L10 gehören zu keinem Assignment und zeigen korrekt kein Panel.
Damit ist der Assignment-Bezug jetzt in beide Richtungen navigierbar.

### Begleitende Änderungen

- Version-Bump auf **v42** (SW-Cache `cs336-shell-v42`, Bundle `i18n-en.js?v=42`,
  README aktualisiert), da der Service Worker `index.html` im Shell-Cache hält.
- `_site` neu gebaut (ist gitignored; CI baut beim Deploy ohnehin selbst).
- `memory.md` um zwei stabile Produktentscheidungen ergänzt (Übungsfokus-Vertrag,
  Lecture→Assignment-Orientierung), damit spätere Codex-Runs sie nicht rückbauen.

## Verifiziert (mit Beleg)

1. `node --check` auf dem extrahierten Inline-Script (1,06 MB) sauber;
   `node scripts/check-i18n.mjs` grün (72 Concepts, 79 Formeln, 72 Symbole,
   70 Glossareinträge, 26 Labs, 29 Missions, 1.047 UI-Strings) —
   inklusive aller Fake-Gate-Verbote und des Review-Policy-Schemas.
2. Browser-Smoke ohne Konsolenfehler. Scope-Zahlen plausibel:
   231 gesamt · L1=9 · L3=31 · L11=12 · A1=98 · A5=62; 23 Optionen (1+17+5).
3. Für die Scopes L3, A1 und A3 programmatisch geprüft: **alle** gezogenen
   Session-Karten liegen im jeweiligen Scope (erste L3-Karte war sinnvollerweise die
   Matmul-Voraussetzung); Button wird bei leerem Scope deaktiviert (Guard zusätzlich
   in `openFlashcards`).
4. Sprachwechsel EN↔DE behält Übungsfokus (`l02` blieb ausgewählt, Label wechselte auf
   „PyTorch, Ressourcen & Training"), Zählungen und Route; Lecture-15-Panel auf Deutsch
   korrekt („Was das vorbereitet" → „A5 · Alignment & RL", Klick führte zu
   `#detail/assignment/a1` bzw. a5-Route zurücknavigierbar).
5. Session-Ende aktualisiert die Deck-Anzeige jetzt über denselben Helfer
   (`updateReviewDeckUi`) und bleibt damit scope-konsistent.

## Zustand des Arbeitsbaums

Änderungen sind **bewusst uncommitted** (Regel: committen nur auf Zuruf):
`index.html`, `sw.js`, `README.md`, `memory.md` modifiziert; `tmp/` und `.claude/`
weiterhin untracked. Vorschlag für den Commit:
`feat: scoped retrieval practice and lecture-to-assignment links` — danach Push wie
gewohnt für den Pages-Deploy (v42 invalidiert installierte PWA-Shells korrekt).

## Nachtrag (zweiter Durchgang am 18.07., auf Martins Zuruf)

Auftrag: strikt an den Lectures entlang, und alle verwendeten Formeln/Symbole ohne
Vorwissen lesbar machen. Umgesetzt:

### A. „Symbole dieser Lecture – kurz erklärt" auf jeder Lecture-Seite

Neuer kuratierter Abschnitt zwischen „Das brauchst du vorher" und den Kernkonzepten:
kompakte Akkordeons aus dem bestehenden Tafelwerk (`LECTURE_GUIDES[..].symbols`),
handverlesen pro Lecture (L2: 15 Symbole, L3: 18, L10: 11, …; L13 bewusst keine).
Kein Auto-Matching über Buchstaben — die Auswahl ist explizit, `check-i18n` validiert
jetzt jede Referenz (`ids.symbols` + `requireUniqueRefs`/`requireRefs` pro Guide).
Buchstabenkollisionen (z. B. `D` Trainingstokens neben `D, d_model` auf der
L9-Seite) stehen absichtlich nebeneinander; die Kontextzeile klärt die Lesart.
„Auf einen Blick" zählt die erklärten Symbole mit.

### B. Fidelity-Audit gegen die PDFs (pdftotext; Stichprobe L3, L4, L9, L15)

1. **L3-Lücke gefunden und geschlossen:** Das 2025-Architecture-PDF hat eine eigene
   „Stability tricks"-Sektion (z-loss, QK-Norm, Logit-Soft-Capping) plus
   Konsens-Hyperparameter — die Plattform lehrte das nur unter L4 (MoE).
   Schlimmer: Die Formeln `z-loss` und `logit-soft-cap` (Quelle l03) waren von
   **keiner** Lecture kuratiert, also über den Lernpfad unerreichbar. Fix: Konzept
   `architecture-stability-shapes` nach `pre-post-norm` in L3, beide Formeln in
   L3 kuratiert, Symbole `s69`/`s70` ergänzt. L4 behält das Konzept (Router-z-loss).
2. **L9-Lücke gefunden und geschlossen:** „Critical Batch Size" kam auf der ganzen
   Plattform nicht vor (0 Treffer), obwohl das Kaplan-PDF eine eigene Sektion hat.
   Fix: neuer Detail-Absatz im Konzept `power-laws` (DE+EN: Definition, Gradient
   Noise Scale, LR-Kopplung, abnehmende Erträge) plus neues L9-Lernziel.
3. **L15 geprüft, kein Fix nötig:** Safety-Tuning, Über-Verweigerung und die
   „Fine-tuning auf unbekannte Fakten → Halluzination"-Folklore sind im
   `sft`-Konzept bereits abgedeckt; GQA/MQA aus dem L3-PDF liegt korrekt in
   `attention-variants`.

### Verifiziert (zweiter Durchgang)

- `check-i18n` grün (inkl. neuer Symbolvalidierung), Inline-Script `node --check`
  sauber, `_site` neu gebaut.
- Browser: L3 zeigt die Sektion mit 18 Symbolen, EN-Labels („Context",
  „Dimension or warning") korrekt lokalisiert, 8 Formelkarten inkl. z-loss und
  Soft-Capping, 9 Kernkonzepte inkl. Stabilität; L9 zeigt N/D/D,d_model/C/FLOP
  samt neuem Lernziel; `power-laws` enthält den Critical-Batch-Size-Absatz in
  beiden Sprachen. Null Konsolenfehler. (Hinweis: Leere Screenshots nach Scrollen
  sind ein Capture-Artefakt des Preview-Panes, kein App-Bug — bei hohem Viewport
  rendert alles.)
- memory.md um drei Produktentscheidungen ergänzt (Symbolkuratierung,
  L3-Stabilität, L9-Batchgröße).

## Nächste Hebel (neu priorisiert)

1. **Neutraler Zeitaufwand pro Lecture** („~x min Guide + y min Experimente";
   Labs zeigen Minuten bereits) — als Information für die Sessionplanung, nie als Soll.
   Letzter noch offener Punkt vom 15.07.
2. **Übungsfokus-Schnellzugriff aus dem Kontext**: Ein „Diese Lecture üben"-Link auf
   Lecture-/Assignment-Seiten könnte den Fokus vorbelegen (ein Klick statt Select-Suche).
   Bewusst noch nicht gebaut, um den heutigen Diff klein zu halten; technisch trivial
   (reviewScope setzen + `#quiz`).
3. **L4/L10 ohne Assignment-Panel** ist korrekt, aber auf diesen zwei Seiten könnte eine
   Zeile wie „vertieft Konzepte, die in keinem Assignment direkt geprüft werden"
   die Lücke erklären statt sie nur leer zu lassen. Kosmetik, kein Muss.
