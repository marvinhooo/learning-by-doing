# Deep Review v116 — 2026-09-19 — was das Assignment braucht, bevor der Kurs es lehrt

Fortsetzung von [v115](deep-review-2026-09-18-claude.md). Der zugewiesene Worktree stand auf **v99**
(`2ed21e7`), der Kettenkopf auf **v115** (`e86c8a6`, Branch `claude/hungry-vaughan-05fb46`). Die
Ahnenprüfung über alle Branch-Spitzen ergab **keinen verlorenen Zweig** — weder vor noch nach dem
Lauf. **Kein Codex auf diesem Repo**: der Haupt-Checkout trägt Zeitstempel vom 29. Juli.
`origin/main` steht auf `2ed21e7`; **v100 bis v116 sind ungepusht.**

Auftrag unverändert: derselbe Wissensstand wie aus der Vorlesung, und die Assignments lösen können.

## Der Befund

v115 hinterließ als Hebel 1 die neun A1-Probleme, die erst in Lecture 11/12 öffnen. Nachgerechnet
sind es **zehn**, und der Befund ist schärfer als die Zahl.

Die Assignment-Seite eröffnet mit **„Keine versteckten Voraussetzungen"** und löst das mit zwei
Abschnitten ein: den handgeschriebenen Voraussetzungen und `assignmentSelfStudyConcepts` — *„Was
dieses Assignment braucht, aber keine Lecture liefert"*. Dieser zweite prüft **„lehrt es irgendeine
Lecture?"**. Damit ist er blind für die andere Art, wie der Pfad einen Leser hängen lässt: ein
Konzept, das eine Lecture sehr wohl lehrt — nur lange nach dem Assignment, das daran hängt.

**A1 ist dieser Fall, und zwar als einziges Assignment des Kurses.** A1 nennt als eigene
Vorbereitung `l01–l03`. Drei seiner entscheidenden Konzepte wohnen dahinter:

| Konzept | Zuhause | Abstand zu Lecture 3 | entscheidet |
| --- | --- | --- | --- |
| `schedules` | Lecture 11 | 8 Lectures | 3 Probleme · 5 Punkte |
| `benchmark-validity` | Lecture 12 | 9 Lectures | 8 Probleme · 16 Punkte |
| `perplexity-eval` | Lecture 12 | 9 Lectures | 1 Problem · 6 Punkte |

Zusammen **10 der 38 A1-Probleme, 18 Punkte** (`leaderboard` und `learning_rate` hängen an je zwei
dieser Konzepte, deshalb 10 und nicht 12). Von den anderen vier Assignments hat **keines** ein
einziges spät ankommendes Konzept — A1 trägt die Lücke allein.

Was der Leser dabei tatsächlich erlebt, mit den Funktionen der App nachgerechnet:

- Nach **l03** meldet der Lecture-Ausblick **„A1 · 28/38 Probleme"**. Die fehlenden zehn werden
  nicht benannt. `learning_rate_schedule` und `learning_rate_tuning` tauchen auf dem ganzen Weg von
  l01 bis l10 in **keiner** „fehlt noch"-Liste auf: die Liste zeigt nur Probleme, die zusätzlich an
  einem Konzept *dieser* Lecture hängen, und das tun sie nicht.
- Auf der A1-Seite stehen alle 38 Probleme mit ihren Konzeptknöpfen. `schedules` ist also
  erreichbar — aber nichts sagt, dass diese Seite acht Lectures vor ihrem Zuhause liegt und jetzt
  gebraucht wird.
- Der Abschnitt, dessen ganze Aufgabe diese Warnung ist, schwieg über genau die drei Konzepte mit
  der längsten Wartezeit.

### Gegen die Quelle geprüft, nicht nur gegen die Kennzahl

Die Zahl allein wäre ein Verdacht. Das Handout entscheidet es: `cs336_assignment1_basics.pdf` sagt
vor dem Leaderboard selbst **„We will explore this idea further in the scaling laws unit of the
course."** A1 verlangt also wissentlich Stoff, den der Kurs später erklärt. Damit ist klar, was
**nicht** zu tun ist: die Konzepte in l03 umzuhängen wäre eine Fälschung der Vorlesung. Richtig ist,
es auszusprechen.

### Die Übungen lagen schon da — nur der Weg fehlte

Bemerkenswert: `decay-horizon` heißt wörtlich *„warum A1 T_c = N verlangt"* und liegt auf **l02**,
`stability-edge` ebenfalls. Die Experimente sind also längst an der richtigen Stelle. Es waren die
**Konzeptseiten**, die erst in Lecture 11/12 in den Pfad traten.

## Was gebaut wurde

`assignmentLateConcepts(a)` und `assignmentLateMarkup(a)` — ein Abschnitt **„Was dieses Assignment
braucht, bevor der Kurs es lehrt"** / *„What this assignment needs before the course teaches it"*,
direkt hinter dem Selbststudium-Abschnitt, den er ergänzt, und **vor** den Themenblöcken.

Nichts ist neu erfunden und kein Konzept wurde verschoben: dieselben zwei Tabellen, die die App
schon vorwärts rendert — woran ein Problem hängt, und welche Lecture ein Konzept beherbergt —
werden gegen die vom Assignment **selbst deklarierten** `sources` gelesen.

Jede Zeile nennt Ankunfts-Lecture als Badge, den Abstand zur letzten Vorbereitungs-Lecture, die
Probleme samt Punkten, und die Experimente:

- **`schedules`** bietet drei Labs an, die der Leser bei l02 schon getroffen haben kann.
- **`benchmark-validity`** und **`perplexity-eval`** bieten keins und sagen warum: *„Alle 4
  Experimente zu diesem Konzept liegen selbst hinter derselben Grenze – hier trägt die Konzeptseite
  allein."* Ein Lab hinter derselben Grenze wird **nicht** als Übung angeboten; `seed-variance` ist
  für A5 geschrieben und liegt auf l12.

### Der Fehler, den der eigene Guard fand

Die erste Fassung der Regel sortierte jedes Konzept ohne Lecture-Zuhause als „lehrt niemand". Der
Partitionstest des neuen Blocks fiel sofort durch: `python-engineering` lehrt keine Lecture, steht
aber in **Modul 00**. Es sind **vier** Schicksale, nicht drei. Daraus folgte ein echter Fehler:
`lectureProblemOutlook` zählt Modul 00 als von Anfang an abgedeckt, `assignmentLateConcepts` tat es
nicht — zwei Flächen derselben Seite hätten sich widersprechen können. Die Klausel ist ergänzt.

Sie feuert **heute nicht**, und der Grund ist gemessen statt behauptet: alle **6** Modul-00-Konzepte
mit Lecture-Zuhause wohnen in Lecture 2, also an oder vor der Grenze jedes Assignments. Statt eines
toten Zweigs hält ein Guard die Übereinstimmung — und er ist **beweisbar scharf**: eine Mutation,
die `resource-accounting` konsistent nach l11 umhängt, wird von genau dieser Prüfung gefangen.

## Prüfung

- **Guard-Suite 69 → 70 Blöcke grün**, Exit 0.
  - `late concepts` (**186 Checks**): die Auswahlregel aus `LECTURE_GUIDES` und der Problemtabelle
    **neu gerechnet** statt der App geglaubt, in **beiden Richtungen** (weder ein fehlendes noch ein
    überzähliges Konzept kommt durch); die **vier Schicksale** eines entscheidenden Konzepts —
    rechtzeitig, Modul 00, zu spät, niemand — als **disjunkt und vollständig** über *alle*
    Assignments bewiesen, was die eigentliche Behauptung ist: es gibt keinen stillen fünften Fall
    mehr; jeder Abstand, jede Zahl, jedes Problem-ID **aus dem gerenderten Markup zurückgelesen**,
    in beiden Sprachen; jeder Zweig als erreicht gemessen (1 Assignment rendert, 4 schweigen; 1
    Konzept mit Labs, 2 ohne, in beiden grammatischen Numeri); die Aufrufstelle **zwischen** dem
    Abschnitt, den sie ergänzt, und den Problemen, vor denen sie warnt; der Binder; und die Zahlen
    des Quellkommentars nachgerechnet.
- **Mutationstest gegen die Schlankfassung** (0,26 s je Lauf statt 69 s, Kontrolle vor und nach dem
  Lauf grün): **26 Mutationen, 23 gefangen, 3 entkommen — alle drei mit gemessenem Grund:**
  1. `!lectureId||` entfernen ist **wirkungsgleich**: `indexOf(undefined)` ist −1 und damit ≤ jeder
     Grenze. Echte inerte Mutation, keine Guard-Lücke.
  2. Die Modul-00-Klausel ist heute unerreichbar (siehe oben) — gehalten durch die
     Übereinstimmungsprüfung, deren Schärfe separat belegt ist.
  3. Die Deduplizierung ist unerreichbar, weil kursweit **genau ein** Problem doppelt gelistet ist
     (`A3:scaling_laws`, unter drei Blöcken) und A3 kein spätes Konzept hat. Auch das ist jetzt
     festgenagelt: eine Mutation, die `leaderboard` doppelt listet, wird gefangen.
  - Zwei Mutationen wurden zunächst **falsch zugerechnet**: sie fielen in älteren Prüfungen
    (`modules.foundations`, `lecture guides.l11.concepts`), nicht im neuen Block. Erst eine
    vollständig konsistente Umhängung erreichte die neue Prüfung. Ein Fang gilt erst, wenn er
    beweisbar dem neuen Block gehört.
- **Der Sprachtest war zuerst blind.** Die erste Fassung suchte neun deutsche Wörter im englischen
  Render — und schwieg, als die gesamte Eyebrow auf Deutsch stand, weil keines der neun darin
  vorkam. Ersetzt durch eine **gezählte** Invariante: jedes wortführende Textsegment der beiden
  Renders muss sich unterscheiden, und die legitimen Ausnahmen sind **abgeleitet** statt gelistet
  (das Badge, das absichtlich in beiden Sprachen „Lecture n" heißt, und ein Konzepttitel, den das
  englische Paket unverändert lässt). Sie fängt jetzt beide vorher blinden Fälle. **Ihre Grenze
  steht im Guard**: sie vergleicht ganze Segmente, fängt also einen vertauschten Ternary-Zweig, aber
  keinen englischen Halbsatz mitten in einem längeren deutschen Literal.
- **Kein Browsertest** — in geplanten Läufen gesperrt. Ersatz: Render aller Zustände in DE und EN,
  geprüft auf Tag-Balance über acht Tags, Platzhalter, `undefined` und Abschnittsgestalt: **0
  Probleme**. Der Scanner war vorher als **sehend** belegt — drei von vier absichtlich eingebauten
  Fehlern meldete er, der vierte war genau die Sprachlücke oben und führte zu ihrer Reparatur.
- `node --check` auf dem extrahierten Inline-Script (2,7 MB) und auf `sw.js`; `i18n-en.js` geladen.
- **Cache-Bump auf v96** (4 Stellen: `sw.js` ×2, `index.html`, `README.md`).

## Was offen bleibt

1. **Die Lecture-Seite sagt es noch nicht.** Nach l03 steht weiter „A1 · 28/38" ohne Hinweis, dass
   zehn Probleme auf Lecture 11/12 warten und die Konzeptseiten schon jetzt lesbar sind. Die
   A1-Seite beantwortet es vollständig und ist von l03 einen Klick entfernt, aber die Fläche, auf
   der die Frage entsteht, schweigt. **Jetzt Hebel 1.**
2. **Die Tausendergruppierung** — ein deutscher Render, der `43200` statt `43.200` zeigt, fällt
   durch kein Netz; die legitimen Ausnahmen sind nicht klassifiziert.
3. **`GERMAN_WORDS` ist blind für deutsche Substantive ohne Umlaut.** Unverändert seit v112.
4. **`l13` fehlt eine Formelkarte** für die Gopher-Qualitätsregeln.
5. `scaling-transfer` bleibt das eine Lab ohne rechnende Bühne.
6. Der Browsertest steht seit v71 aus; beim nächsten beaufsichtigten Lauf für die in v110–v116
   angefassten Flächen nachholen, 360 px, DE und EN. Der neue Abschnitt ist dabei zuerst dran.
7. `origin/main` steht auf `2ed21e7`; **v100 bis v116 sind ungepusht.**
