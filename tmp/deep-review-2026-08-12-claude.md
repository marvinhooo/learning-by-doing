# Deep Review 2026-08-12 — Die Schwelle hört auf, eine Formelkarte zu sein (v70)

## Auftrag

Geplanter Lauf des Standing Brief: „nimm mal das aktuelle Repo und schaue was kannst du nochmal deutlich
verbessern … wird sich wirklich an den Vorlesungen und den Assignments entlang gehangelt?" Unbeaufsichtigt.
Gestapelt auf `17f9be5` (v69, Report), Worktree per `git merge --ff-only` gehoben. Keine parallele
Codex-Session: die App-Dateien im Eltern-Checkout stammen vom 29.07., die im Tip-Worktree vom 11.08. 07:35,
also vom vorherigen geplanten Lauf.

## Vorprüfung — die Kennzahl war diesmal nicht der Beleg

Die von v69 notierten Hebel waren `a4:quality_classifier` (15 P.) und `a4:gopher_quality_filters` (3 P.),
beide ausdrücklich mit „erst prüfen". Die Prüfung nach der Hausregel — **nicht nach Themenwörtern, sondern
nach den Bezeichnern der Rechnung** — fiel eindeutig aus:

| gesucht in `index.html` | Treffer vorher |
|---|---|
| `precision` / `Precision` (Prosa) | 54 / 55 |
| `mean_word_length`, `stop word`, `symbol_to_word` | **je 0** |
| `alphabetic`, `ellipsis` | **je 0** |
| `truePositive`, `falsePositive`, `confusionMatrix`, `keepRate` | **je 0** |
| `pareto`, `keep_document`, `score(x)` | **je 0** |
| `15000`, `p(en)`, `OpenMathText` | **je 0** |

Prosa war also reichlich da und **nichts davon wurde gerechnet**. Das bekannte Warnsignal stand doppelt:
die Formelkarte `precision-recall` rendert `Precision=TP/(TP+FP); Recall=TP/(TP+FN)` als Zeichenkette mit
einem statischen Beispiel (TP=8, FN=2, FP=2), und das Lab `data-pipeline` rendert `quality_pass(d) = 1[q(d) ≥ τ]`
ebenfalls als Zeichenkette — dasselbe Muster wie `parallelism` vor v65, `rlvr-system-transfer` vor v66 und
`lsh` vor v69. Beide A4-Missionen (`safety-filters`, `quality-classifier`) führten ausschließlich geborgte Labs.

**Der Fund war schärfer als die Kennzahl, und er liegt in den Lectures:**

- **Lecture 13** nennt die vierte Gopher-Regel in ihrem eigenen MassiveWeb-Abschnitt wörtlich:
  „Quality filtering using manual rules (not classifier) - e.g., **80% words contain at least one
  alphabetic character**" (Zeile 346). Genau die Zahl, die die Plattform 0× führte.
- **Lecture 14** nennt für **einen einzigen** fastText-Klassifikator **zwei** Schwellen:
  „threshold is **0.17 if math, 0.8 if no math**" (Zeile 284) — und druckt GPT-3s Behalteregel als
  lauffähigen Code: `def keep_document(score): return np.random.pareto(9) > 1 - score` (Zeile 298/299).

Die Lecture *rechnet* also, die Plattform *druckte*. Und A4 verlangt genau diese Wahl: §2.6 gibt vier
Schwellen wörtlich vor und überlässt die Tokenisierung dem Leser („you might find NLTK useful … though
you're not required to use it"); `quality_classifier` vergibt 15 Punkte, schreibt „Setting the quality
threshold trades off precision and recall" und nennt keine einzige Zahl.

## Was gebaut wurde — Lab #45 `quality-threshold`

„Die Schwelle entscheidet: Gopher-Regeln, Score und Confusion Matrix", 16 min, Modul `data`, registriert in
l13, l14, dem Modul und **an erster Stelle** der Missionen `a4:safety-filters` und `a4:quality-classifier`.
Zwei Modi, 30 Zustände. Die Dokumente und die Auditmenge sind konstruiert und im Lab als solche
ausgewiesen; die Messungen und die Confusion Matrix darüber sind echt.

### Modus A — die vier Gopher-Regeln, 8 Dokumente × 2 Tokenisierungen × 5 Regelsätze

Gerechnet wird an dem Text, der darunter steht: Wortzahl, mittlere Wortlänge, Anteil der Zeilen auf drei
Punkten, Anteil alphabetischer Wörter — dazu Confusion Matrix mit ausdrücklicher Positivklasse
(„der Filter entfernt das Dokument") und Behaltequote.

**Der Regler ist die Lehre.** Ohne dass eine Regel oder eine Schwelle angefasst wird:

| | Precision | Recall | Behaltequote |
|---|---|---|---|
| `text.split()` | **0.7500** | 0.7500 | **50.00 %** |
| Satzzeichen als eigene Tokens | **0.5000** | 0.7500 | **25.00 %** |

**Der Recall bleibt gleich, die Precision halbiert sich, und die Hälfte des Korpus ist weg.** Zwei der acht
Dokumente wechseln ihr Urteil (die technische Doku und der Forumsbeitrag — beide würde ein Mensch behalten,
beide fallen über den alphabetischen Anteil, weil Klammern und Satzzeichen eigene Tokens werden), zwei
weitere behalten ihr Urteil und wechseln nur den **Reason Code**. Der Reason-Code-Log, den die Mission
`safety-filters` ausdrücklich verlangt, ist damit selbst tokenisierungsabhängig.

Vier weitere Befunde, alle nachrechenbar:

1. **Die Linkliste hat unter `text.split()` sechs Wörter mit einer mittleren Wortlänge von 69.5.** Beide
   Zahlen beschreiben die Seite nicht — unter der zweiten Tokenisierung sind es 102 Tokens mit 4.0882.
   Die *Messgrößen selbst* sind Artefakte der Tokenisierung, nicht nur die Urteile.
2. **Die Ellipsen-Regel ist die einzige der vier, die sich nicht bewegt** — sie zählt Zeilen, keine Tokens.
3. **Die Obergrenze von 100 000 Wörtern greift auf keinem der acht Dokumente.** Genau die Regel, die vor
   der pathologischen 2-MB-Seite schützt, ist in einer Handstichprobe von 20 Dokumenten unsichtbar — und
   Handout-Teil (b) verlangt genau so eine Stichprobe.
4. **Zwei verschiedene Regel-Abschaltungen melden dieselben vier Kennzahlen und verlieren verschiedene
   Dokumente** (ohne Ellipsen-Regel bzw. ohne alphabetischen Anteil: beide TP=2/FP=1/FN=2/TN=3 bei 62.50 %).
   Lecture 12s „always look at the individual instances" als Fall statt als Merksatz.

Und der Cookie-Hinweis passiert **alle vier Regeln unter beiden Tokenisierungen** und ist trotzdem Müll —
die Brücke in Modus B. Ohne ihn hätte der Klassifikator in diesem Lab keinen Grund.

### Modus B — die Klassifikator-Schwelle, 12 Auditdokumente × 5 τ × 2 Behalteregeln × 2 Auswertungen

**Kernbefund, der die erste Kurzcheckfrage trägt:**

| τ | Precision | Recall | Tokenanteil |
|---|---|---|---|
| 0,17 (Lecture 14, „math") | 0.777778 | **1.000000** | 78.44 % |
| 0,30 | 0.857143 | 0.857143 | 65.87 % |
| 0,50 („classified positive") | **1.000000** | 0.571429 | 35.93 % |
| 0,80 (Lecture 14, „no math") | **1.000000** | 0.285714 | 20.96 % |
| 0,95 | **1.000000** | 0.142857 | 8.38 % |

**Drei Schwellen, dieselbe perfekte Precision, drei völlig verschiedene Korpora.** Eine Precision von 1,000
belegt gar nichts: sie sagt nur, dass unter dem Behaltenen kein Müll war, und schweigt über alles, was
weggeworfen wurde. Precision allein kann keine Schwelle wählen — das ist der Fehler, der in A4 15 Punkte kostet.

**Der zweite Befund ist der teurere.** Nach Herkunftsgruppe getrennt, bei τ = 0,50:

| | TP·FP·FN·TN | Precision | Recall | Tokens |
|---|---|---|---|---|
| formell / enzyklopädisch | 4 · 0 · 0 · 2 | 1.000000 | 1.000000 | 61.86 % |
| informell / gesprochen | 0 · 0 · 3 · 3 | **n/a** | **0.000000** | **0.00 %** |

Die Einstellung mit der makellosen Gesamt-Precision **entfernt eine ganze Herkunftsgruppe vollständig**, und
keine Gesamtkennzahl meldet es. Die Precision der Gruppe ist dabei nicht null, sondern **undefiniert** — die
Plattform zeigt `n/a` statt einer Zahl, weil 0/0 keine ist. Das ist genau die `failure`-Zeile der Mission
(„Ein guter Durchschnittsscore kann Minderheitendomänen verbergen") und Lecture 14s Warnung „could
accidentally filter out dialects of English" als Zahl. Bei τ = 0,17 — Lecture 14s „math"-Lesart — steht der
Recall in **beiden** Gruppen auf 1.000000.

**GPT-3s Regel, exakt statt simuliert.** numpy zieht bei `pareto(a)` die Lomax-Form, also ist
P(X > t) = (1+t)^(−a); mit t = 1 − score ist die Behaltewahrscheinlichkeit **exakt (2 − score)^(−9)**. Kein
Sampling nötig, um zu sagen, was die Regel tut:

- score 0,50 → **0.026012**, nicht ein halbes Dokument. Die Regel ist viel strenger, als sie klingt.
- score 0,00 → **0.001953125**. Sie verwirft **nichts** sicher.
- Über die Auditmenge: **1.328914** erwartete Dokumente von 12 und 12.36 % der Tokens — strenger als
  τ = 0,80 (2 Dokumente), obwohl sie überhaupt keine Schwelle hat.

Der τ-Regler bleibt auch in diesem Modus aktiv: eine Vergleichszeile zeigt, was die gewählte Schwelle
stattdessen behalten hätte. Ein Regler, der nichts bewegt, wäre tote Bedienung.

## Verifikation

- **Unabhängige Referenz, dreimal getippt.** Die vier Regeln und die Lomax-Überlebensfunktion wurden separat
  aus dem A4-Handout und der Lecture-14-Zeile geschrieben: einmal im Scratchpad-Referenzskript, einmal in
  `check-i18n.mjs` (mit einer anderen Tokenisierungs-Implementierung — Zeichenscan statt Regex), einmal im
  Browser-Prüfskript. Die App-Funktionen werden per `sliceDeclaration` aus `index.html` gezogen.
  **501 Werte im Scratchpad, 471 im Checker, 0 Abweichungen.**
- **Echtes DOM, alle 30 Zustände, beide Sprachen, zeichengenau.** Jede angezeigte Zahl und jedes Urteilswort
  gegen die Referenz: **820 Werte in Modus A (DE), 416 in Modus B (DE), 1100 in EN — 0 Abweichungen.**
  Adressierbar wurde das über `data-doc` und `data-audit` auf den Zeilenköpfen.
- **Rückstandsscan.** 4743 Textknoten im EN-Modus über alle 30 Zustände: **0 deutsche Rückstände.** Die acht
  Dokumente bleiben bewusst englisch und liegen in `<pre data-no-i18n>`. 110 neue UI-Strings, vollständiger
  EN-Lab-Eintrag.
- **Kurzcheck vollständig.** Alle 27 Kombinationen, **mit Reset vor jedem Versuch statt danach**: genau eine
  angenommen, 0 Leckage, unvollständige Antworten persistieren nichts. Die Persistenzprüfung hat vorher
  belegt, dass sie unter `cs336-lernwerk-v2:guest` reale Daten sieht (15 Schlüssel).
- **Reload-Restore** stellt alle drei Selects und das Erfolgsmarkup wieder her.
- **Layout** bei 375, 360 und 1280 px über alle 30 Zustände **mit geöffneten Dokumentblöcken**: kein
  Overflow, alle sichtbaren Bedienelemente ≥ 44 px, Konsole leer. Acht weitere Labs auf Regression geprüft.
- **65 Guard-Mutationen, alle 65 gefangen, 0 escaped, 0 inert.**

### Zwei Funde der Verifikation

**(1) Ein Randfall, den die eigenen Daten nie erreichten.** Die Regel `score >= τ` ließ sich nicht gegen
`>` testen: kein Auditdokument lag auf einer wählbaren Schwelle, die Mutation änderte kein Bit und war damit
**untauglich, nicht bestanden** — dieselbe Klasse wie der v69-Fund zur `j > tau`-Regel. Behoben, indem der
Randfall **absichtlich gebaut** wurde: ein Dokument sitzt jetzt exakt auf 0,50. Alle Kennzahlen bleiben
dadurch unverändert (0,55 und 0,50 liegen bei jedem τ auf derselben Seite), und ein eigener Guard verlangt,
dass es überhaupt ein solches Dokument gibt.

**(2) Ein latenter, älterer Layout-Bug — gefunden nur mit geöffneten `<details>`.** Der Zustands-Sweep war
grün, weil die Dokumentblöcke zugeklappt starten. Mit allen acht geöffnet schob die Seite bei 360 px auf
**870 px**. Die Ursache lag nicht bei den `<pre>`-Blöcken, sondern eine Ebene höher: **`.lab-stage` ist ein
Grid-Item und hatte `min-width: auto`**, also durfte es über seine Spalte hinauswachsen, statt seinen Inhalt
scrollen zu lassen — `max-width: 100%` und `overflow-x: auto` auf dem `<pre>` blieben deshalb wirkungslos.
Die Kette wurde Element für Element vermessen, statt nach herausragenden Rechtecken zu suchen (die Methode,
die 2026-08-09 auf die falsche Spur führte). Fix: `min-width: 0` auf `.lab-stage` plus ein eigener
Scroller auf `.qt-doc pre` bei erhaltenem `white-space: pre` — die Zeilen dürfen **nicht** umbrechen, weil
die Ellipsen-Regel Zeilenenden zählt. Der Bug betraf die geteilte Klasse und war nur nie sichtbar geworden,
weil kein früheres Lab nicht-umbrechenden Inhalt in die Stage gelegt hat; acht andere Labs wurden nach dem
Fix gegengeprüft. Vier Mutationen halten ihn jetzt fest.

**Ein Messartefakt am Rand, bestätigt:** nach `resize_window` meldet die Pane `window.innerWidth` noch den
alten Wert, während `clientWidth` schon stimmt — jede Layoutaussage aus diesem Zwischenzustand ist falsch.
Erst ein `location.reload()` **nach** dem Resize macht beide konsistent. Bei 1280 px bleibt eine Differenz
von 15 px zwischen `innerWidth` und `clientWidth` bestehen; das ist die Scrollbar und kein Overflow.

## Getroffene Entscheidungen (unbeaufsichtigt)

- **Zwei Modi in einem Lab statt zweier Labs.** Regelfilter und Klassifikator stellen dieselbe Frage — was
  hat diese Entscheidung weggeworfen und was hat sie gekostet — und der Cookie-Hinweis, der alle vier Regeln
  passiert, ist die Brücke. Getrennt wären es zwei halbe Antworten.
- **Die Tokenisierung heißt nicht „nltk".** Die zweite Option ist als „Satzzeichen als eigene Tokens"
  benannt und im Lab ausdrücklich als *eine* verteidigbare Wahl deklariert. Eine Behauptung über das exakte
  Verhalten von `nltk.word_tokenize` wäre ungedeckt gewesen — die Lehre (die Tokenisierung gehört zum
  Filter) bleibt davon unberührt.
- **Keine Aussage darüber, was `test_gopher` prüft.** Die Testdatei liegt nicht im Repo; wie in v69.
- **Die vier Schwellen sind keine Regler.** Sie stehen wörtlich im Handout. Verstellbar ist, welche Regeln
  aktiv sind — das beantwortet die Frage, welche Regel die Arbeit tut, ohne den Vertrag zu verfälschen.
- **Konstruierte Dokumente und Auditmenge, im Lab deklariert.** Es gibt keinen echten fastText-Lauf im Repo.
  Die menschliche Lesart ist als Autorenannotation ausgewiesen — sie ist genau das, was Handout-Teil (b) von
  Hand verlangt.
- **Keine LECTURE_GUIDES über l13/l14 hinaus.** Ein Guard verbietet es den übrigen fünfzehn, und die
  Mutation dagegen wurde gefangen.
- **Keine Zeit-, Termin- oder Streak-Mechanik.** Wie festgehalten.

## Stand

- Commit auf `claude/sweet-haslett-6b74b7`, gestapelt auf `17f9be5` (v69). **Nicht gepusht.**
- Geändert: `index.html`, `i18n-en.js`, `scripts/check-i18n.mjs`, `sw.js` (Cache `cs336-shell-v70`),
  `README.md` (45 Labs, Version 70).
- `check-i18n` grün: **45 Labs, 2650 UI-Strings**, `quality-threshold OK: 471 values`.
- **Achtung beim Testen:** nach dem Versionssprung `getRegistrations().unregister()` + `caches.delete()`,
  sonst zeigt der Browser den alten Stand.

## Nächste Hebel

1. **`a4:pipeline-audit` / `a4:tokenize-train`** (je 10 P.) — seit v68 notiert, überwiegend Schreib- und
   Messaufgaben; vor dem Bauen prüfen, welche Zahl dort überhaupt fehlt.
2. **`a1:checkpointing` / der Resume-Vertrag** (1 P., aber echter Testvertrag: Optimizer-Momente,
   Scheduler-Phase, Stepzähler, RNG — der stille Vertrag, den ein kurzer Test bestätigt und ein echter
   Wiederanlauf bricht).
3. **`a4:harmful_content` / `a4:language_identification`** (6 + 6 P.) — jetzt naheliegend, weil
   `quality-threshold` die Confusion Matrix eingeführt hat, an der beide hängen; Lecture 14 nennt für
   Language ID fünf eigene Caveats (kurze Sequenzen, Low-Resource, Dialekte, ähnliche Sprachen,
   Code-Switching) und FineWeb die Schwelle `p(en) > 0.65`, die im Repo weiterhin 0 Treffer hat.
