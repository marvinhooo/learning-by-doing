# Deep Review v114 — 2026-09-17 — die Konzeptseite wusste nicht, wofür man sie liest

Fortsetzung von [v113](deep-review-2026-09-16-claude.md). Der zugewiesene Worktree stand auf
**v99** (`2ed21e7`), der Kettenkopf auf **v113** (`4b82854`, Branch `claude/deep-review-v113`).
Die Ahnenprüfung über alle Branch-Spitzen ergab **keinen verlorenen Zweig**. **Kein Codex auf
diesem Repo**: der Haupt-Checkout trägt Zeitstempel vom 29. Juli, der v113-Worktree vom 16.
September. `origin/main` steht auf `2ed21e7`; **v100 bis v114 sind ungepusht.**

Auftrag unverändert: derselbe Wissensstand wie aus der Vorlesung, und die Assignments lösen
können.

## Der Befund

v113 hinterließ als Hebel 1 den Übungsknopf im Formel-Akkordeon. Beim Nachsehen fand sich eine
Einbahnstraße derselben Art, aber auf der Fläche, die der Lernpfad ständig benutzt.

`PROBLEM_CONCEPTS` ist eine Behauptung in **einer** Richtung: „dieses Problem hängt an diesen
Ideen". 211 Verknüpfungen über alle 124 Handout-Probleme, und die Assignment-Seite rendert sie
genau so — jede Problemzeile bietet die Konzepte an, die sie entscheiden. **Rückwärts hat sie nie
jemand gelesen.** Eine Konzeptseite endete deshalb im Lesen: Orientierung, mentales Modell,
gerechnetes Beispiel, Regeln, Fehlannahmen, Experimente, Selbstcheck, Formelkarten — und dann
nichts. Die eine Frage, die aus Lesen Fortschritt macht, konnte sie nicht beantworten: **was genau
kann ich damit abgeben?**

Das ist die Stelle, an der „wird sich wirklich an den Assignments entlanggehangelt?" mit Nein zu
beantworten war — nicht weil die Verbindung fehlte, sondern weil sie nur in der Richtung gerendert
wurde, in der der Leser sie nicht braucht.

## Was gebaut wurde

`conceptProblemMarkup` rendert auf **allen 75 Konzeptseiten** die Probleme, die genau dieses
Konzept entscheiden — nach Assignment gruppiert.

| | |
| --- | --- |
| Problemzeilen | 215 über 62 Konzepte |
| je Zeile | Problem-ID, Handout-Titel, Art der Arbeit (Code · Schreiben · Messen), GPU-Budget, Punkte |
| Prüfhandles | `adapters.<hook>` und `uv run pytest …`, wörtlich aus dem Handout |
| „Braucht außerdem" | die übrigen Konzepte desselben Problems — was noch fehlt, steht daneben |
| je Block | Anzahl und Punktsumme, plus Knopf in den Assignment Coach |

Die Seite, auf der man steht, wird **nicht** noch einmal angeboten; genau dafür bekam
`problemVerifyMarkup` einen `omitConceptId`-Modus, der das Label von „Konzept" auf „Braucht
außerdem" umstellt.

**Die 13 Konzepte ohne Abgabe schweigen nicht.** Sie sagen, dass kein Themenblock der 5
Assignments sie listet und keines der 124 Probleme sie nennt — beide Zahlen gerechnet, nicht
getippt. MQA und GQA etwa kommen in A1 und A2 **nullmal** vor; `attention-variants` ist echter
Vorlesungsstoff ohne Abgabe, keine Lücke.

### Die Umkehrung war selbst der Prüfstand

„59 von 75 Konzepten entscheiden nichts" ist als Satz unglaubwürdig. Drei Konzepte, deren
Gegenstand ein Handout **im eigenen Problemtitel** führt, waren von keinem Themenblock gelistet
und konnten deshalb von keinem Problem genannt werden:

| Konzept | Wortlaut des Handouts |
| --- | --- |
| `pre-post-norm` | A1 §7.5: *„Modify your pre-norm Transformer implementation into a post-norm one"* |
| `embeddings` | A1 §3.5: *„vocab_size … the dimensionality of the token embedding matrix"* |
| `perplexity-eval` | A1 §1: *„submit your attained perplexities to a leaderboard"*; A4 §5: *„minimizes validation perplexity on the C4 100 domains subset of the Paloma benchmark"* |

A1s Ablationsblock verlangte „implementiere Post-Norm" und bot als Erklärung Sampling,
Training-Loop und Benchmark-Validität an — nicht die Seite, die Pre-Norm gegen Post-Norm erklärt.

Vier neue Problem-Konzept-Links, drei Themenblock-Einträge. **Gemessen null Verzögerung:** kein
einziges der 124 Probleme öffnet dadurch später. Das war das Gate — `perplexity-eval` wohnt in
Lecture 12, und ein Link dorthin hätte A1s Leaderboard hinter Lecture 12 schieben können. Er tut
es nicht, weil `benchmark-validity` dieselbe Schranke schon setzt.

## Der Fehler, den die Umkehrung nebenbei fand

Der Lecture-Ausblick seedet „abgedeckt" mit dem Foundations-Modul und den Lectures. **Sechs
Konzepte stehen in keinem von beiden** — `lm-objective`, `causal-mask`, `cross-entropy`, `adamw`,
`clipping`, `sampling` — und die App **sagt das selbst**, auf der Assignment-Seite: „Was dieses
Assignment braucht, aber keine Lecture liefert" listet exakt diese.

Der Ausblick, der dieselben Daten liest, behandelte sie als für immer fehlend:

| | vorher | jetzt |
| --- | --- | --- |
| Probleme, die irgendeine Lecture öffnet | **113** von 124 | **124** von 124 |
| A1 nach Lecture 17 | **29 von 38** | **38 von 38** |

Verloren waren unter anderem `a1:adamw`, `a1:cross_entropy`, `a1:gradient_clipping`,
`a1:decoding`, `a1:generate` — der Kern von A1. Die Reparatur ist die Regel, die das
Foundations-Modul längst bekommt, auf jedes Konzept ohne Lecture-Heimat angewandt: **was keine
Lecture lehrt, kann keine Lecture blockieren.** Sie **öffnet kein Problem früher** (alle 113 stehen
unverändert), und ein Problem, das gar keine Lecture braucht, wird gezählt, ohne dass Lecture 1
behauptet, es geöffnet zu haben — die Ankündigungsliste prüft „war vorher noch nicht vollständig",
und das ist es hier nie.

## Prüfung

- **Guard-Suite 65 → 67 Blöcke grün**, Exit 0. `concept deliverables` (**657 Checks**): die
  erwartete Umkehrung **nicht** aus dem Renderer, sondern durch Ablaufen der Blöcke neu gebaut und
  gegen das **gerenderte Markup** in beiden Richtungen gehalten; jede Punktsumme aus
  `HANDOUT_PROBLEMS` nachaddiert — die Gesamtzeile **und** jeder Blockkopf; die 13 Konzepte ohne
  Abgabe namentlich festgeschrieben und in beiden Richtungen gegen die Themenblöcke geprüft.
  `lecture outlook coverage` (**151 Checks**): jedes Assignment erreicht 38/38 · 27/27 · 2/2 ·
  13/13 · 44/44, die Selbststudiumsliste der Assignment-Seite muss **dieselbe** lecture-lose Menge
  sein statt einer zweiten Meinung, und der Seed darf nur hinzufügen.
- **Mutationstest gegen die Schlankfassung** ([[cs336-guard-suite-slim-harness]]): **24 Mutationen,
  24 gefangen, 0 entkommen, 0 inert**, Kontrolle vor und nach dem Lauf grün. Zwei Mutationen
  entkamen im ersten Durchgang, und beide schlossen eine echte Lücke:
  1. **Die Punktsumme je Assignment-Block war ungeprüft.** Nur die Gesamtzeile wurde zurückgelesen,
     und die wird separat gerechnet — eine Summe kann stimmen, während jeder ihrer Teile falsch ist.
  2. **Eine später gelehrte Verknüpfung, die ein Problem verzögert, war unsichtbar.** Der Vergleich
     „mit den vier neuen Links gegen ohne sie" lässt eine **fünfte** auf beiden Seiten stehen. Jetzt
     ist die **Form** der Ableitung festgeschrieben — wie viele der 124 Probleme jede der 17
     Lectures öffnet. Die Probemutation (`benchmark-validity` an `a1:softmax`) verschiebt sie und
     wird gefangen.
- **150 Renders (75 Konzepte × DE/EN)**: 0 Platzhalter, 0 `undefined`/`NaN`, Tag-Balance überall,
  0 deutsche Rückstände im englischen Render. Der Scanner wurde vorher als sehend belegt — und war
  es **zuerst nicht**: seine Tag-Regex kannte `</h2>` nicht, weil sie Ziffern im Tagnamen ausschloss,
  und meldete deshalb alle 75 Seiten als kaputt. Eine Prüfung, die auf *allen* Fällen anschlägt, ist
  so verdächtig wie eine, die auf keinem anschlägt.
- **Cache-Bump auf v94** (4 Stellen: `sw.js` ×2, `index.html`, `README.md`).
- **Kein Browsertest** — in geplanten Läufen gesperrt ([[cs336-unattended-no-preview]]).

### Ein Apostroph, der einen Guard zerstörte

Der neue Guard schnitt `lectureProblemOutlook` per `sliceDeclaration`. Der Schnitt lief **bis zum
Dateiende** — 1,3 MB statt 1,3 kB — und meldete sich als `SyntaxError: Identifier 'LAB_CONCEPTS'
has already been declared`, was über die Ursache nichts sagt. Grund war ein **Apostroph in einem
Kommentar**, den ich selbst gerade eingefügt hatte („no lecture's outlook"): der Scanner liest ihn
als String-Anfang. Der Kommentar ist umformuliert, und der Guard benennt den überlangen Schnitt
jetzt selbst — **vor** dem Code, der daran stirbt.

## Was offen bleibt

1. **Der Rückweg im Akkordeon** (aus v108–v113 unverändert, und schärfer als bisher notiert):
   `formulaAccordion` enthält **alles**, was `renderFormulaDetail` enthält, **außer**
   `formulaRouteMarkup`. Der einzige Knopf hinaus heißt „Vollständig öffnen" / „Open full
   explanation" — er verspricht mehr Erklärung und liefert Navigation, also hat der Leser einen
   aktiven Grund, ihn **nicht** zu drücken. Gemessen: **294 Akkordeon-Instanzen** (82 Tafelwerk,
   74 auf 17 Lecture-Seiten, 138 auf Konzeptseiten) gegen 82 Detailseiten. Der Weg zum Übungslab
   ist damit auf der häufigsten Fläche unsichtbar. Fix: Route ins Akkordeon, und das Label ehrlich
   machen („als eigene Seite öffnen").
2. **9 Probleme von A1 öffnen erst in Lecture 11/12**, weil sie an `benchmark-validity` (l12) und
   `schedules` (l11) hängen, während A1 von l01–l03 vorbereitet wird. Nach der Reparatur oben ist
   das sichtbar und nicht mehr verdeckt; ob es richtig ist, ist eine Inhaltsfrage, die dieser Lauf
   nicht entschieden hat.
3. **Die Tausendergruppierung** — unverändert aus v113: ein deutscher Render, der `43200` statt
   `43.200` zeigt, fällt durch kein Netz; die legitimen Ausnahmen sind nicht klassifiziert.
4. **`GERMAN_WORDS` ist blind für deutsche Substantive ohne Umlaut.** Unverändert seit v112.
5. **`l13` fehlt eine Formelkarte** für die Gopher-Qualitätsregeln (Lab `quality-threshold` rechnet
   sie, das Tafelwerk zeigt sie nicht).
6. `scaling-transfer` bleibt das eine Lab ohne rechnende Bühne; `LR_NO_STAGE` ist auf seinem Boden.
7. Der Browsertest steht seit v71 aus; beim nächsten beaufsichtigten Lauf für die in v110–v114
   angefassten Flächen nachholen, 360 px, DE und EN.
8. `origin/main` steht auf `2ed21e7`; **v100 bis v114 sind ungepusht.**
