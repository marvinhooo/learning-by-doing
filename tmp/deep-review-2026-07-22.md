# Deep Review 2026-07-22 (geplanter Claude-Run)

Kontext: Keine Codex-Aktivität seit dem 20.07. (HEAD unverändert auf `54ed090`, keine
Fremd-Edits in den letzten Stunden — nur meine eigenen von heute). Basis vor Beginn
geprüft: `check-i18n` grün, `node --check` auf dem Inline-Script sauber. Der
Fidelity-Audit aller 17 Lectures gegen die PDFs ist seit dem 20.07. abgeschlossen;
dieser Run setzt daher den **ältesten offenen, mehrfach vertagten Hebel** um und
liefert zusätzlich eine begründete Empfehlung für den nächsten großen Schritt.

## Ausgangsbewertung: Wo steht die Plattform?

Die Lernhilfe ist inhaltlich und didaktisch bereits sehr stark. Sie deckt lückenlos
ab, was ein zeiteffizientes, tiefes Selbststudium braucht:

- **Aktives Erinnern** (Abrufkarten mit Fokus-Scope, fest auswertbare Kernfragen)
- **Gerechnete Beispiele vor der Notation** (Formeln: Zweck → Namen → Zahlenfall → Gleichung)
- **Just-in-time-Voraussetzungen** (pro Lecture erklärt, mit Beispiel und Konzept-Link)
- **Predict-Observe-Labs** (erst vorhersagen, einen Parameter ändern, mit Formel erklären)
- **Assignment Coach** (Voraussetzungen, Themenblöcke, mentale Modelle, Implementierungs-
  reihenfolge, gestufte Hinweise, Fehlerbilder, Definition of Done)

Der Engpass für das Ziel „extrem schnell und effizient, aber gleicher Wissensstand"
ist deshalb **nicht mehr fehlender Inhalt**, sondern zwei Dinge: (1) fehlende
**Zeit-Orientierung** für die Sessionplanung und (2) ein noch nicht gebauter,
proaktiver **Prerequisite-Schnellstart**. Punkt 1 ist heute umgesetzt, Punkt 2 ist
als Empfehlung ausgearbeitet (bewusst nicht ohne Freigabe gebaut).

## Was heute umgesetzt wurde: neutraler Zeitrahmen pro Lecture

Neuer Helfer `lectureTimeEstimate(id)` (index.html) plus Anzeige an vier Stellen.
Der Wert beantwortet direkt „Wie viel Zeit kostet mich der Guide-Weg — und wie viel
spare ich gegenüber den Vorlesungen?"

**Ehrlich und self-updating statt willkürlich:**
- **Lesezeit** = tatsächliches Textvolumen der kuratierten Inhalte (Guide-Text +
  Kernkonzepte) bei ~140 Wörtern/Min, auf 5-Min-Schritte gerundet (Minimum 5). Weil
  die Zahl aus dem echten Inhalt berechnet wird, veraltet sie nicht, wenn ein späterer
  Run Konzepte ergänzt — sie wächst automatisch mit.
- **Experimentzeit** = Summe der `time`-Felder der Labs dieser Lecture (dieselbe
  neutrale Info, die die Labs ohnehin einzeln zeigen — klare Präzedenz).

**Sprachstabil:** Der Lesewert wird immer gegen die deutsche Quelle gerechnet
(`stable()` auf die `{de,en}`-Guide-Felder, Konzepte aus `GERMAN_I18N_DATA.concepts`).
Grund: Die Konzept-Objekte werden beim Sprachwechsel **in place** getauscht, und
Englisch nutzt mehr (kürzere) Wörter — ohne Fixierung wackelte die Gesamtsumme beim
Umschalten um ~15 % (EN 235 vs. DE 205). Jetzt identisch in beiden Sprachen.

**Anzeige (bewusst als Orientierung, nie als Soll):**
- Lecture-Pfadkarte: `≈ x min Lesen · y min Experimente · typischer Fokus, kein Soll`
- Lecture-Detail „Auf einen Blick": zwei Zeilen inkl. Caveat „nie Soll, Termin oder
  Abschluss-Gate"
- Dashboard-Karten (erste drei Lectures): Kurzsumme `≈ z min`
- Kursweg-Kopf: Gesamtsumme, die mit der Suche mitfiltert

**Das quantifizierte Zeitersparnis-Argument (das eigentliche Nutzerziel):**
Der ganze kuratierte Pfad = **≈ 205 min Lesen + 271 min Experimente ≈ 7,9 Stunden**
fokussierte Arbeit. Zum Vergleich: 17 Vorlesungen à ~80 min sind über 22 Stunden Video —
plus Mitschrift und Wiederholung. Die Plattform macht damit sichtbar, dass derselbe
Stoff in gut einem Drittel der Zeit erarbeitbar ist, ohne Tiefe zu opfern.

Zeitrahmen pro Lecture (Lesen + Experimente, in Min):
`L1 10+12 · L2 25+26 · L3 20+12 · L4 10+10 · L5 10+20 · L6 10+22 · L7 10+12 ·
L8 10+10 · L9 5+14 · L10 15+12 · L11 10+12 · L12 5+8 · L13 15+12 · L14 15+45 ·
L15 10+0 · L16 15+28 · L17 10+16`. Plausibel: L14 (Data, 3 Labs) am schwersten,
L12/L9 am leichtesten, L15 (RLHF, keine Labs) korrekt ohne Experimentzeile.

### Begleitende Änderungen
- Version-Bump auf **v45** (`cs336-shell-v45`, `i18n-en.js?v=45`, README), damit der
  Service Worker installierte PWA-Shells invalidiert.
- `_site` neu gebaut (gitignored; CI baut beim Deploy selbst).
- `memory.md` um eine stabile Produktentscheidung ergänzt (Zeitrahmen-Vertrag).

## Verifiziert (mit Beleg)

1. `node --check` auf dem extrahierten Inline-Script (1,08 MB) sauber; `check-i18n`
   grün (unverändert 74 Concepts, 79 Formeln, 72 Symbole, 70 Glossar, 26 Labs,
   29 Missions, 1.047 UI-Strings — die neuen Strings sind Inline-Ternaries, keine
   Bundle-Keys, daher keine Zählungsänderung).
2. Browser-Smoke (lokaler Server, Cache/SW gebustet) **ohne Konsolenfehler**.
3. **Sprachstabilität programmatisch bestätigt:** Gesamt-Lesezeit EN = DE = 205 min
   (`match:true`) nach dem `GERMAN_I18N_DATA`-Fix; vorher 235 vs. 205.
4. Rendering geprüft: Kursweg-Kopf zeigt „17 / 17 Lectures · ≈ 205 min Lesen +
   271 min Experimente"; L2-Pfadkarte „≈ 25 min Lesen · 26 min Experimente ·
   typischer Fokus, kein Soll"; L2-Detail „Auf einen Blick" beide Zeilen inkl.
   „nie Soll, Termin oder Abschluss-Gate". Screenshot im Run.
5. Konform zu den Memory-Regeln: keine Fälligkeit, kein Fortschritts-/Kompetenz-
   anspruch; Framing sagt „Orientierung, kein Soll" explizit ([[cs336-no-deadline-learning]]).

## Zustand des Arbeitsbaums

Weiterhin **bewusst uncommitted** (Regel: committen nur auf Zuruf). Heute geändert:
`index.html`, `sw.js`, `README.md`, `memory.md`. (`i18n-en.js` und
`scripts/check-i18n.mjs` waren schon vor diesem Run modifiziert — Stand 20.07.,
ebenfalls uncommitted.) Commit-Vorschlag:
`feat: neutral per-lecture time orientation (v45)` — danach Push für den Pages-Deploy.

## Nächster großer Hebel (Empfehlung, braucht Freigabe)

**Optionaler „Grundlagen-Schnellstart" für die Voraussetzungen.** Der Nutzer fragt
explizit: „wie kann ich extrem schnell und effizient die nötigen prerequisites
aufbauen?" Heute sind Voraussetzungen nur **reaktiv** (in jeder Lecture, wo sie
gebraucht werden) und die Diagnose schlägt Themen vor, führt aber nirgends konkret hin.

Vorschlag: eine **eine** optionale, geordnete On-Ramp, die die kursweiten Foundations
(Python-Datenverträge, Tensor-Shapes, Gradienten/Kettenregel, Wahrscheinlichkeit/
Softmax, Logarithmen, Matmul, Ressourcen-Accounting) in **Abhängigkeitsreihenfolge**
bündelt — aus bereits existierenden Prerequisite-Konzepten, also kein neuer Inhalt,
nur eine neue Zusammenstellung. Die Diagnose würde von „Vorgeschlagene Auffrischungen:
python 40 %" direkt in genau diese Karten verlinken. Das ergänzt die just-in-time-
Prereqs (bleiben), widerspricht also nicht der bestehenden Produktentscheidung.

Bewusst **nicht** heute gebaut: Es ist eine neue Ansicht/Navigation und berührt den
„Lernpfad ist die einzige kanonische Übersicht"-Vertrag — das gehört mit Martins
Freigabe entschieden, nicht autonom in einem geplanten Run. Aufwand gering (Wieder-
verwendung vorhandener Konzepte + ein Routing-Eintrag + Diagnose-Deeplinks).

Kleinere bewusst offene Reste (unverändert): `dataset-lineage` optional in die
A4-Konzeptliste, je ein Satz zu `torch.compile`/PTX in den L6-Konzepten,
Gloo-Erwähnung in L8 — alles Kosmetik, kein Lernverlust.
