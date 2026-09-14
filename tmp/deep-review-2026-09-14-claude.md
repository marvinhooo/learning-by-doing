# Deep Review v111 — 2026-09-14 — die zweite Schreibweise derselben Entscheidung

Fortsetzung von [v110](deep-review-2026-09-13-claude.md). Der zugewiesene Worktree stand auf
**v99** (`2ed21e7`), der Kettenkopf auf **v110** (`930a562`, Branch `claude/deep-review-v110`,
Worktree `determined-mcnulty-3a62c9`). Neuer Branch `claude/deep-review-v111` auf dem Kopf.
Die Ahnenpruefung ueber alle Branch-Spitzen ergab diesmal **keinen verlorenen Zweig**: jede
Spitze liegt in `930a562`. Kein Codex aktiv — der Haupt-Checkout traegt Zeitstempel vom
29. Juli. `origin/main` steht weiter auf `2ed21e7`; **v100 bis v111 sind ungepusht.**

Auftrag unveraendert: derselbe Wissensstand wie aus der Vorlesung, und die Assignments loesen
koennen.

## Der Befund: gemessen, nicht uebernommen

v110 nannte den halb gelaufenen `toExponential`-Sweep als groessten Hebel und schaetzte
„2 von 12 Fundstellen locale-bewusst". Die Zahl war der Verdacht, nicht der Befund
([[cs336-metric-is-a-suspicion]]) — also erst messen. Der `lab render sweep` besitzt bereits
eine vollstaendige DOM-Attrappe; darauf laesst sich ein Probelauf setzen, der **jeden Lab-Zustand
in beiden Sprachen rendert** und den sichtbaren Text liest.

**948 Zustaende gerendert. Auf v110 druckten 14 Labs in 254 deutschen Zustaenden eine
Exponentialzahl mit Dezimalpunkt.**

| Lab | Zustaende | was der deutsche Leser sah |
| --- | --- | --- |
| `comm-crossover` | 36 | `3.299e+1` |
| `run-plan` | 24 | `6.5054e+1` |
| `causal-invariance`, `norm-and-ffn`, `resume-contract`, `run-budget-ledger` | je 22 | `3.583993e-4` |
| `decay-horizon` | 21 | `1.000000e-4` |
| `chain-carry` | 19 | `8.2555e+8` |
| `optimizer`, `resources` | je 19 | `6.14e+1` |
| `mixed-precision` | 16 | `2.235174e-1` |
| `scaling` | 10 | `1.80e+2` |
| `offpolicy-clip`, `target-config` | je 1 | `6.7032e-1` |

Das ist nicht Kosmetik. Im Deutschen ist der Punkt der **Tausendertrenner**: `8.2555e+8` ist
fuer diesen Leser nicht nur fremd formatiert, sondern um Groessenordnungen missverstehbar —
und die betroffenen Labs sind ausgerechnet `resources`, `chain-carry`, `comm-crossover`,
`run-budget-ledger` und `scaling`, deren ganzer Gegenstand die Groessenordnung ist. Daneben
schrieb die eigene Prosa der App die Zahl mit Komma: derselbe Prosa-gegen-Tabelle-Bruch, den
v92 fuer `toFixed` geschlossen hat.

### Warum es so lange stehen blieb

Der Guard aus dem Dezimal-Sweep ist exakt — fuer **eine** Schreibweise. Er greppt nach
`.toFixed(` und **sagt nicht, wie viele Fundstellen er erwartet**. Genau der blinde Fleck aus
[[cs336-mutation-test-blind-spots]]: ein musterbasierter Guard schweigt ueber jede Schreibweise,
die er nicht kennt. `toExponential` war die zweite Schreibweise derselben Entscheidung.

## Was gebaut wurde

Ein Helfer, und alles geht durch ihn:

```js
function expNum(value,digits){
  const text=digits===undefined?Number(value).toExponential():Number(value).toExponential(digits);
  return localeCode()==="de-DE"?text.replace(".",","):text;}
```

- **26 Aufrufstellen** umgestellt, darunter die sieben benannten Helfer `rcExp`, `dhExp`,
  `rbSci`, `tcSci`, `rpSci`, `ccSci`, `cmSci` und die Inline-Stellen in `optimizer`,
  `resources`, `comm-crossover`, `scaling` und `norm-and-ffn`.
- Die **drei bereits locale-bewussten Stellen** (`fbExp` und zwei bare Returns) trugen ihre
  eigene `.replace(".", …)`-Zeile; sie sind in den Helfer gefaltet, damit es **eine** Stelle
  gibt, die das entscheidet, und nicht vier.

### Vier weitere Zahlen, die ohne Helfer beim Leser ankamen

Derselbe Probelauf, breiter gestellt, fand vier Lecks, die keine Exponentialzahlen sind. Jedes
ist eine andere Schreibweise von „eine Zahl hat keinen Helfer passiert":

1. **`shard-ledger`** druckte fuer den Nullfall das **String-Literal `"0.00"`** — in derselben
   Zeile, in der `shardNumber` gerade `12.995,95` geschrieben hatte. Die schaerfste Stelle des
   Laufs: ein Komma und ein Punkt als Dezimaltrenner nebeneinander in einer Zeile. Der ternaere
   Operator war ueberfluessig, `shardMib(0)` ist 0.
2. **`roofline`** schickte seine y-Ticks durch `fixedNum` und interpolierte die x-Ticks roh —
   der Tick `0.25` und ein Peak von `2000` TFLOP/s kamen unformatiert an.
3. **`precNumber`** (mixed-precision) zeigt absichtlich die volle JS-Repraesentation, denn dass
   fp32 die 0,01 nicht halten kann, ist der Gegenstand des Labs. Die Ziffern bleiben, das
   Trennzeichen gehoert dem Leser: `0.009999999776482582` → `0,009999999776482582`.
4. **`norm-and-ffn`** interpolierte `NORM_LAB_EPS` roh: `0.00001` stand in derselben Zeile wie
   Gains, die `1,000000` geschrieben waren.

Dazu zwei Stellen in fest eingetippter Prosa: `filtering-mechanics` trug A4s DSIR-Beispiel
(`w_A=0.30/0.60=0.50`) als Literal **ausserhalb von `tr()`**, und ein deutscher Satz in
`microbatch-denominator` schrieb `w = 1.000000`, waehrend der Nachbarsatz desselben Labs
`1,000000` schreibt. Beim zweiten musste der **Uebersetzungsschluessel in `i18n-en.js`
mitwandern**, sonst faellt der englische Satz aus.

### Was bewusst stehen bleibt

Die allgemeine Behauptung „jeder Punkt, den ein deutscher Leser sieht, ist ein Tausendertrenner"
ist in dieser App **falsch, und zwar absichtlich**. Der Probelauf listet nach der Reparatur noch
19 Labs — und alle davon sind richtig so: Handout-Abschnitte (`A1 §7.2.1`, `A2 §8.2`, `A5 §4.2.1`),
die englischen Korpusproben, die `compression-ratio` und `quality-threshold` komprimieren, und
`mask-pii`s IP-Adresse `1.2.3.4`. Diese Grenze steht jetzt **im Guard geschrieben**
([[cs336-mutation-test-blind-spots]]: die Grenze eines Modells gehoert in den Guard), statt
darauf zu warten, wiederentdeckt zu werden.

## Der Guard: er zaehlt, und er rendert

Der alte Guard schwieg, weil er nicht zaehlte. Der neue tut beides:

**Quellenseite** — `expNum` muss der Locale folgen; es darf **genau 2** rohe
`.toExponential(`-Aufrufe in der ganzen Datei geben, **beide in `expNum`**; `toPrecision` und
die scientific notation von `toLocaleString` sind die zwei Geschwister-Schreibweisen, die
dasselbe Loch wieder oeffnen wuerden, und werden ausdruecklich ausgeschlossen. Die sieben
Einzelreparaturen sind **namentlich angeheftet**, weil eine fest eingetippte Zahl fuer kein
Muster sichtbar ist.

**Renderseite** — im `lab render sweep`, der ohnehin jeden Zustand in beiden Sprachen baut:
kein deutscher Render darf eine Exponentialzahl mit Punkt zeigen, **und kein englischer eine mit
Komma**. Eine Invariante hat zwei Richtungen, und geprueft ist meist nur eine; hier sind es
beide. Attribute sind bewusst ausgenommen: `data-bv-crossover` und seinesgleichen tragen rohe
Werte als maschinenlesbare Anker, und dort ist der rohe Wert genau richtig.

## Pruefung

- **Guard-Suite 63 Bloecke gruen** (vorher 62), Exit 0. `lab render sweep`: **1304 Renders**
  ueber 61 von 64 Labs in beiden Sprachen. Cache-Bump auf **v91** (4 Stellen), README mit.
- **Probelauf nach der Reparatur**: 948 Zustaende, **0 deutsche Punkt-Exponentialzahlen,
  0 englische Komma-Exponentialzahlen**.
- **Mutationstest: 14 Mutationen.** Erster Lauf **11 gefangen, 3 entkommen, 0 inert** — und die
  drei Entkommenen waren genau die fest eingetippten Zahlen (`NORM_LAB_EPS`, das DSIR-Beispiel,
  der Loss-Koeffizient), die kein Muster sieht. Das hat die namentlichen Anker erzwungen; im
  zweiten Lauf **14 von 14 gefangen, 0 entkommen, 0 inert**. Kontrolle vor und nach jedem Lauf
  gruen.
- **Der Render-Guard wurde als sehend belegt, getrennt von der Guard-Reihenfolge.** Mutation M3
  (Sprachen in `expNum` vertauscht) wurde in der Suite von einem **frueheren** Block gefangen
  (`position-signal`), der Fang gehoerte also nicht beweisbar dem neuen Block
  ([[cs336-guard-suite-slim-harness]]). Gegenprobe auf einer Kopie mit vertauschtem Helfer:
  **16 Labs / 287 Zustaende** zeigen den falschen Trenner — **symmetrisch in beiden Richtungen**,
  Kontrolle ohne Mutation 0/0. Der Guard sieht ihn also selbst.
- **Ein Guard fing zuerst seine eigene Dokumentation.** Die Geschwisterpruefung auf die
  scientific notation schlug an, weil mein erklaerender Kommentar in `index.html` die
  Code-Schreibweise woertlich enthielt. Der Kommentar ist umformuliert; die Pruefung bleibt auf
  der Code-Schreibweise scharf. Ein Muster-Guard, der die ganze Datei liest, liest auch sich selbst.
- **Kein Browsertest** — in geplanten Laeufen gesperrt ([[cs336-unattended-no-preview]]).
  Ersatz ist der headless Probelauf oben, in DE und EN.

| | v110 | v111 |
| --- | --- | --- |
| Guard-Bloecke | 61 → 62 | **63** |
| deutsche Zustaende mit Punkt-Exponentialzahl | 254 | **0** |
| Stellen, die `toExponential` roh aufrufen | 26 | **0** |
| Renders im Sweep | 1304 | 1304 |

## Was offen bleibt

1. **Der Rueckweg im Akkordeon** (aus v108/v109/v110 unveraendert): `formulaAccordion` bietet
   weiter nur „Vollstaendig oeffnen"; der Uebungsknopf steht nur auf der Detailseite.
2. **`embedding-params` haengt weiter an einem Fallback** und hat keine Lecture, die `V·D`
   herleitet (Lecture 3s Parameterbilanz oder A1 §7.2.1 waeren der Ort).
3. **`l13` hat keine eigenen Karten fuer Qualitaetsregeln**, obwohl Gopher-Schwellen zaehlbar
   sind — derselbe Inhaltshebel wie v109 und v110.
4. **Drei Labs ohne rechnende Flaeche**: `policy-loss-tracer` 1 Punkt, `scaling-transfer` 0,
   `moe-routing` 0. Unveraendert seit v107.
5. **Der naechste Hebel derselben Art**: der Probelauf dieses Laufs kann mehr, als dieser Guard
   nutzt. Er rendert 948 Zustaende und liest den sichtbaren Text — damit liesse sich auch die
   **Tausendergruppierung** in beiden Richtungen halten (ein deutscher Render, der `43200`
   statt `43.200` zeigt, faellt heute durch kein Netz). Der Sweep dafuer ist gebaut; es fehlt
   die Klassifikation der legitimen Ausnahmen, dieselbe Handarbeit je Satz wie in
   [[cs336-german-decimal-sweep]].
6. Der Browsertest steht seit v71 aus; beim naechsten beaufsichtigten Lauf fuer die in v110/v111
   angefassten Flaechen nachholen, 360 px, DE und EN.
7. `origin/main` steht auf `2ed21e7`; **v100 bis v111 sind ungepusht.**
