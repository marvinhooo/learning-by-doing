# Deep Review 2026-09-23 (zweiter Lauf) — v121

Branch `claude/wonderful-thompson-4204ed`, gebaut auf dem Kettenkopf v120 (`29427f2`).
Ahnenprüfung **vor** dem Lauf: der zugewiesene Worktree stand auf v99 (`2ed21e7`),
**22 Commits hinter dem Kopf**; die Prüfung über alle Spitzen fand v100–v120 als
zusammenhängende Kette, kein verlorener Zweig — auch der Haupt-Checkout (`1461c41`,
Codex' Lecture-Position-Arbeit) ist im Kopf enthalten. Auf v120 vorgespult, dort gearbeitet.
Codex-Prüfung: der Haupt-Checkout ist seit dem 29. Juli unberührt, keine aktive Sitzung.

Baseline: 73 Guard-Blöcke grün, 107 s. Danach: **75 grün**.

## Der geschlossene Hebel: offener Hebel 2 (und 4 dazu)

Die Liste sagte: „Die Formelkarten-Beispiele — jetzt der größte offene Hebel, und ein
musterbasierter Sweep kann ihn nicht fahren." Gemessen hatte v120 dort 29 skalare und
33 geklammerte Stellen über 11 Karten. Der Hebel war deutlich größer, und zwar in einer
Richtung, die die Messung nicht sehen konnte.

## Was drei Sweeps nicht gesehen haben

Der Dezimal-Sweep (v92) und der Exponential-Sweep (v110) prüfen die **Bühne**, der
Bedienfeld-Sweep (v120) das **Panel**. Alle drei sehen auf ein Lab.

Keiner hat je auf eine **Karte** gesehen: das gerechnete Beispiel einer Formel, die
`details` eines Konzepts, die Beispielzeile eines Begriffs, das mentale Modell oder die
Transferantwort eines Labs. Dort entscheidet **kein Helfer** ein Trennzeichen — der Text
steht so da, wie er getippt wurde, und wird so gerendert.

Gemessen über alle 9 Content-Pakete: **2296 Kartenstrings mit Ziffern, 452 Zahlen mit
einem Punkt zwischen Ziffern.**

## Halb konvertiert ist schlimmer als gar nicht

Der eigentliche Befund war nicht die englische Schreibweise, sondern die **Kollision**,
die eine frühere halbe Konvertierung erzeugt hatte. Auf Deutsch ist das Komma
Dezimaltrenner *und* Listentrenner. Wo die Dezimalen zu Kommas geworden waren und die
Listentrenner nicht, entstand eine Zeichenfolge, die niemand parsen kann:

| Karte | gedruckt | gemeint |
|---|---|---|
| `logsumexp` | `exp(z−m)≈[1,0,368]` | `[1; 0,368]` |
| `softmax` | `≈[1,0,368,0,135]`, `p≈[1/1,503,0,368/1,503,…]=[0,665,0,245,0,090]` | drei Elemente |
| `temperature` | `z/T=[2/2,1/2]=[1,0,5]` | `[1; 0,5]` |
| `causal-attention` | `≈[0,018,0,982,0]` | `[0,018; 0,982; 0]` |
| `cross-entropy` | `z₂=[log 3,0]≈[1,099,0]` | `[log 3; 0]` |
| `gradient-clip` | `[6,8]` → `[0,6,0,8]` | `[0,6; 0,8]` |
| `fasttext-filter` | `softmax([1,2])≈[0,269,0,731]` | `[0,269; 0,731]` |
| `kl` | `p=(0,75,0,25), q=(0,5,0,5)` | zwei Paare |

`logsumexp` ist die Karte, deren Thema der Verlust von Genauigkeit ist.

Dazu die nie konvertierte Hälfte: `rmsnorm` „mitteln → 12.5, Wurzel → 3.536",
`swiglu` `[0.731,−0.269]`, `moe-balance` `f=[0.75,0.25]`, `rope` `[−0.416,0.909]`,
`attention` `[0.25,0.75]`, `embedding-lookup` `[0.1,0.2]`, `residual`, `linear-map`,
`scaling-optimal-fit`, `moe-output`, `online-softmax`, `matmul`.

Und ein Einzelfall, der in die andere Richtung liest: **`adamw`** schreibt, Weight Decay
ziehe „0,001·0,1·10,0 = 0,001 ab (auf 9.999)". Auf Deutsch ist `9.999` neuntausend­neun­hundert­neun­und­neunzig — ein Fehler um den Faktor tausend, in dem einen Satz, dessen
drei andere Zahlen korrekt deutsch geschrieben sind.

Schließlich die Lab-Transferantworten, die v120s Panel-Sweep nicht erreichen konnte,
obwohl er dieselben Labs repariert hat: `quality-threshold` („Precision von 0.7500 bei
50.00 %" neben dem bereits korrekten „1,000000"), `lsh-bands` (neun Zahlen, darunter
`198086.99` ohne jede Gruppierung), `compression-ratio` (sechs).

## Die Notationsentscheidung

Komma als Dezimaltrenner, **Semikolon als Listentrenner**: `[0,849; 1,131]`. Die Klammern
bewegen sich mit den Skalaren — nur die Skalare zu ändern hätte Sätze erzeugt, die sich
selbst widersprechen (`0,55` neben `[0.75,0.25]`). **35 deutsche Strings über 27 Karten.**

Jede Rechnung wurde dabei nachgerechnet, nicht nur umgeschrieben: SiLU(1)=0,7311,
softmax([1;2])=[0,269; 0,731], 0,75·ln1,5=0,3041, ‖[6;8]‖=10, (0,25)^(1/25)=0,94606.

## Die englische Seite trug dieselbe Kollision, ungesehen

`content numerals` vergleicht die Ziffernläufe beider Sprachen, **nachdem** jedes
Trennzeichen zwischen zwei Ziffern gefallen ist. Englisch `b=[0.5,1,−2]` kollabiert damit
zur Phantomzahl `051` — und Deutsch, das dieselbe Zeichenfolge trug, zur selben. Sie
stimmten überein, und der Guard war grün.

Deutsch allein zu reparieren zerbrach diese Übereinstimmung und legte die englische Hälfte
frei: **26 Felder** druckten Läufe wie `102040`, `025075`, `0011`, `15030368` — „a figure
the app never computed", in den Worten dieses Guards selbst. **30 englische Listen** tragen
jetzt ein Leerzeichen hinter dem Trenner; das ist gewöhnliche englische Typografie und
beseitigt die Mehrdeutigkeit auch dort.

## Der Guard, der den Defekt zertifiziert hatte

Der erste Lauf nach der Reparatur brach an einer Zusicherung ab:

```
requireTextFragments(`${locale}.formulas.linear-map.example`, …,
  ["y₁=0.5+2·1+(−1)·3=−0.5", …]);
```

Ein Fragment, für **beide** Sprachen festgeschrieben. Zwei Zeilen darüber unterscheiden
`parameter-init` und `mfu` längst korrekt nach Locale (`0,25` gegen `0.25`). Genau diese
beiden Karten — `linear-map` und `residual` — waren die, die ihre englische Notation
behalten hatten. Die Prüfung war der Grund, nicht der Zufall.

## Der Klassifizierer, und warum er den Zwilling braucht

Die allgemeine Behauptung — jeder Punkt zwischen Ziffern ist auf Deutsch ein
Tausendertrenner — ist hier falsch, und auf dieser Fläche **systematisch nicht
strukturell entscheidbar**: `3.536`, `1.368`, `1.048` sehen exakt aus wie deutsche
Tausendergruppen. v120 hat das für die Bedienfelder als Grenze notiert.

Der Ausweg ist der **englische Zwilling**. Alle 452 Stellen haben nachweislich einen
eigenen englischen Wert am selben Pfad (keine einzige Rückfallebene), und Englisch ist in
dieser Frage eindeutig: eine Gruppe trägt ein Komma, eine Dezimale einen Punkt. Also wird
jede deutsche Gruppierung **gegen ihren Zwilling bestätigt** statt angenommen:
**405 Gruppierungen, 405 bestätigt.**

Das ist der Test, der `compression-ratio`s `1.353×` und `1.658×` gefunden hat —
Kompressionsverhältnisse, die als Tausendergruppen geschrieben waren und die kein
musterbasierter Guard je hätte von einer Gruppe trennen können.

Vier Klassen überleben, jede strukturell erkannt und **gezählt**, jede in beiden
Richtungen gehalten: 39 Handout-Verweise (`A1 §7.2.1`, auch die bloße Form `A1 4.4`),
4 Argumentwerte aus dem Python des Handouts (`sampling_temperature = 1.0`), 2
Modellversionen (am Parameterzähler dahinter erkannt, `3.3 70B` — **nicht** am
großgeschriebenen Wort davor, denn „Precision 1.000000" war genau das), 2 zitierte
dotted quads.

## Drei Klauseln, die der Mutationstest tragend nennt — und eine, die es hier nicht ist

| Mutation | Ergebnis |
|---|---|
| M1 `logsumexp` `[1,0,368]` zurück | gefangen |
| M2 `adamw` `9.999` zurück | gefangen |
| M3–M9 (rmsnorm, moe-balance, quality-threshold, lsh-bands, compression, temperature, softmax) | 7/7 gefangen |
| M14 dotted-quad-Regel wieder vor die Gruppierung | gefangen |
| M15 `compression growth`: wieder die gekreuzte Zelle | gefangen |
| M16 die Identität `2/r` zerstört | gefangen |
| **M13b** Kollisionstest geblendet **+** `[1,0,368]` zurück | **entkommen — tragend** |
| **M12c** Zwillingsbestätigung gestrichen **+** `3,536` → `3.536` | **entkommen — tragend** |
| **M11b** Zitatklausel gestrichen **+** `9.999` zurück | **entkommen — tragend** |
| M10b/M10c führende-Null-Klausel gelockert + `0.849` / `0.731` zurück | **gefangen — hier abgesichert** |
| *Kontrolle:* ein legitimer Verweis `A1 §9.9.9` eingefügt | bleibt grün |
| *Kontrolle:* ein zitiertes `„10.0.0.1"` eingefügt | bleibt grün |
| *Kontrolle:* unverändert, vor und nach dem Lauf | bleibt grün |

**16 Mutationen, 15 tragend oder gefangen, 1 inert mit gemessenem Grund, 3 grüne Kontrollen.**

Der gemessene Grund für die eine: die **führende-Null-Klausel**, die v120 auf den
Bedienfeldern als tragend bewiesen hat, ist auf der Kartenfläche **redundant** — dort
gibt es einen englischen Zwilling, und der weist `0.731` ohnehin zurück (er schreibt
`0.731` als Dezimale und hat weder `0,731` noch `731`). Sie bleibt richtig und billig und
ist dort tragend, wo es keinen Zwilling gibt. Das ist kein Versagen, sondern die Grenze
des Modells, und sie steht im Guard.

Zwei Mutationen wurden dabei zuerst als „entkommen" gemeldet und waren es auch: der erste
Entwurf hatte **keinen Kollisionstest** (der Defekt, von dem dieser Lauf ausging, trägt gar
keinen Punkt) und eine **Invarianz-Ausnahme ohne Zitatklausel**, die `adamw`s `9.999`
mit derselben Begründung durchwinkte, mit der sie mask-piis IP-Literal durchwinkt.
Beide Lücken sind geschlossen; M13b und M11b beweisen es als Paar.

Ein dritter Fehler kam aus der Reihenfolge: die dotted-quad-Regel stand **vor** der
Gruppierung und verschluckte `1.073.741.824`, `2.147.483.648`, `4.294.967.296` — 21 der
größten Zahlen der App — und nahm sie damit aus der Zwillingsbestätigung heraus. Der Guard
meldete „23 dotted quads", wo 2 existieren. Sichtbar wurde das nur, weil die Klasse
gezählt wird.

## Kein Notationsfehler: die Zahl, zu der die Antwort den Leser schickt

`compression-ratio`s Transferantwort lehrt eine Identität — die uint16-Datei wächst um
`2/r`, also genau dann, wenn `r < 2` — und gibt dem Leser drei Zellen der Lab-Zeile
„Verhältnis zur Rohtextgröße" zum Nachprüfen. Zwei stimmten. Die dritte nannte den
**passenden** Tokenizer auf dem Webtext (`r = 1,3605`) und zitierte dann `1,658×` — das ist
die **gekreuzte** Zelle derselben Zeile (`r = 1,2062`). Die passende liest `1,470×`.

Wer die Division nachrechnet, die der Satz gerade erklärt hat, bekommt eine dritte Antwort
und keinen Weg zu entscheiden, was kaputt ist. Nachgerechnet durch den Tokenizer der App
selbst; korrigiert in beiden Sprachen. Der neue Block `compression growth` beweist die
Identität auf **allen vier** Zellen in beiden Richtungen und verlangt, dass jede Zahl
**ihrem eigenen** Verhältnis folgt — die Paarung war das, was versagt hatte.

Gefunden hat das nicht der Notations-Sweep: der fragt, wie eine Zahl geschrieben ist, nie
ob es die richtige ist. Gefunden hat es die Nachrechnung beim Lesen.

## Kein Browsertest

In geplanten Läufen gesperrt. Ersatz: **164 Renders** — alle 82 Formelkarten als
vollständiges Akkordeon in beiden Sprachen, durch die Renderkette der App selbst —
geprüft auf Tag-Balance über neun Tags, Platzhalter, `[object Object]`, überlebende
Kollisionsläufe und deutsche Dezimalpunkte. **0 Probleme.** Der Scanner ist vorher als
sehend belegt: mit zwei injizierten Defekten meldet er genau diese zwei und danach wieder
null. Zusätzlich geprüft, dass kein Renderer der App auf `;` splittet (die beiden
Komma-Splits treffen `adapters`/`tests` von Problemen, keine Kartenprosa).

## Zahlen

- Guard-Suite **73 → 75 Blöcke grün**: `card numerals` (452 Zahlen über 2296 Strings in
  9 Paketen) und `compression growth`.
- **35 deutsche Strings über 27 Karten** repariert, **30 englische Listen** mit Trennerabstand.
- Cache-Bump auf **v98** (4 Stellen: `sw.js` zweimal, `index.html`, `README.md`).

## Offene Hebel

1. **Erledigt:** die Kartenfläche ist geschlossen, in beiden Sprachen, und wird gezählt
   gehalten. Damit ist auch der v120-Hebel 4 zur Hälfte erledigt (der Punkt-Scan läuft
   jetzt auf den Kartenfeldern, die er vorher nicht sah).
2. `l13` fehlt weiterhin eine Formelkarte für die Gopher-Qualitätsregeln. **Jetzt der
   größte offene inhaltliche Hebel.**
3. Der Korpus-Detektor läuft an 5 Flächen; Konzept- und Lecture-Seiten könnten denselben
   Scan bekommen.
4. **Neu, aus diesem Lauf:** `card numerals` fragt, wie eine Zahl geschrieben ist — nicht,
   ob sie stimmt. `compression growth` zeigt, was eine Nachrechnung findet, und wurde für
   *eine* Karte geschrieben. Die gerechneten Beispiele der übrigen 81 Formelkarten sind
   von keinem Guard gegen ihre eigene Arithmetik gehalten. Das ist die Fläche, auf der der
   nächste echte Inhaltsfehler liegt.
5. `activity.md` endet bei v115; **v116–v120 stehen nur in `tmp/`**. Mit diesem Lauf sind
   v116–v121 nachgetragen.
6. Browsertest steht seit v71 aus (in geplanten Läufen gesperrt).
7. `origin/main` auf `2ed21e7`; **v100–v121 ungepusht.**
