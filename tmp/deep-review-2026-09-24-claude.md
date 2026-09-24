# Deep Review 2026-09-24 — v122

Branch `claude/dreamy-cray-97d7fd`, gebaut auf dem Kettenkopf v121 (`c230c69`).
Ahnenprüfung **vor** dem Lauf: der zugewiesene Worktree stand auf v99 (`2ed21e7`),
**22 Commits hinter dem Kopf**; die Prüfung über alle Spitzen fand v100–v121 als
zusammenhängende Kette, kein verlorener Zweig — auch der Haupt-Checkout (`1461c41`) ist im
Kopf enthalten. Auf v121 vorgespult, dort gearbeitet. Codex-Prüfung: der Haupt-Checkout ist
seit dem 29. Juli unberührt, keine aktive Sitzung.

Baseline: 75 Guard-Blöcke grün, 77 s. Danach: **76 grün**.

## Der Hebel, den v121 als größten offenen genannt hatte

> „`card numerals` fragt, wie eine Zahl geschrieben ist — nicht, ob sie stimmt. Die
> gerechneten Beispiele der übrigen 81 Formelkarten sind von keinem Guard gegen ihre eigene
> Arithmetik gehalten. Das ist die Fläche, auf der der nächste echte Inhaltsfehler liegt."

Alle 82 nachgerechnet: Mittelwert/Varianz in Populations- *und* Stichprobenform, die
Bytezählung von Lecture 1s `„Hello, 🌍! 你好!"` (13 Zeichen, 20 Bytes, 7+4+2+3+3+1), die
Kaskadenausbeute mit ihren vier Verwerfungsanteilen (51,02 / 38,27 / 7,65 / 3,06 %, Summe
100 %), Bloom (`k*=6,93`, `f≈0,0082`), GRPO mit Sample- *und* Populations-Std,
`flash-backward` Zeile für Zeile, bis PPO-Clip.

**Kein einziger Rechenfehler.** Die Kennzahl war Verdacht, nicht Befund. Der Befund liegt
eine Ebene daneben — und das ist im Rückblick die Konsequenz aus derselben Karte: v121 hat
die *Schreibweise* von 27 Karten repariert und dabei den Test geschrieben, der sie hält.
Der Test hält sie nicht ganz.

## `{2,}` heißt zwei Kommas

`card numerals` prüft die Kollision mit

```js
german.match(/\d+(?:,\d+){2,}/gu)
```

`{2,}` verlangt **zwei** `,\d+`-Gruppen — drei Zahlen und mehr. Der Defekt, aus dem der Test
entstand, war `logsumexp`s `[1,0,368]`, und der trug zufällig genau zwei. Das Muster wurde
daran angepasst. **Eine Liste mit genau ZWEI Elementen wurde nie angesehen** — und das ist
die Form, die die meisten Listen der App haben.

Der Test lief dabei nicht nur unvollständig, sondern praktisch leer: die Baseline meldet
**5 Komma-Läufe, alle 5 als Tensor-Shape entschuldigt.** Seine Leerlauf-Schranke
(`cnumRuns < 4`) war erfüllt, ohne dass ein einziger nicht-entschuldigter Lauf existierte.

## 16 Kollisionen in 5 Feldern

Jede in einem String, der das Komma **auch** als Dezimaltrenner benutzt — also genau die
Bedingung, unter der `card numerals` einen Lauf meldet, wenn er drei Zahlen lang ist:

| Feld | gedruckt | gemeint | daneben im selben String |
|---|---|---|---|
| `formulas.mean-var.example` | `Zahlen [1,3]` | `[1; 3]` | `√2≈1,414` |
| `formulas.z-loss.example` | `z_t=[0,0]` | `[0; 0]` | `0,693`, `0,480`, `0,048` |
| `formulas.logistic.example` | `x=[2,1]`, `w=[1,−1]` | `[2; 1]`, `[1; −1]` | `0,368`, `0,731`, `73,1` |
| `formulas.flash-backward.example` | `V=[1,2]ᵀ`, `[0,ln2]`, `P=[1/3,2/3]`, `[3,6]`, `[−2/3,2/3]` (8 Listen) | Semikolon | `dQ≈0,462` |
| `concepts.rope.answers[1]` | `[0,1]`, `[2,3]`, `[0,2]`, `[1,3]` | Semikolon | `=0,2` |

Zwei davon sind nicht nur unschön, sondern **rechnerisch tragend**:

- `z-loss` `z_t=[0,0]`: ohne die zwei Nullen ist nicht nachvollziehbar, warum
  `log(exp(0)+exp(0))` gleich `log 2` ist. Der Leser sieht einen Skalar und kann den
  nächsten Schritt nicht rekonstruieren.
- `logistic` `x=[2,1]`: `wᵀx = 1·2+(−1)·1` braucht zwei Komponenten. Als Dezimalzahl
  gelesen ist der Rohwert nicht herleitbar.

## Der schärfste Fall: dieselbe Zeichenfolge, zwei Bedeutungen, ein Satz

`concepts.rope.answers[1]`, deutsch:

> Für k=1 ist θ_(2,1)=2/100^0=2 und rotiert die benachbarten 0-basierten Koordinaten
> **[0,1]**. Für k=2 ist θ_(2,2)=2/100^(2/4)=**0,2** und rotiert [2,3]. Ein
> Half-Split-Pairing **[0,2]** und [1,3] erfüllt den A1-Vertrag nicht.

`0,2` ist die Dezimalzahl. `[0,2]` ist das Koordinatenpaar. **Dreißig Zeichen
auseinander, in einem Satz.** Und das ist die Antwort auf

> „Welche Winkel und Koordinatenpaare verlangt A1 für d=4, Θ=100 und Position i=2?"

Die zwei Dinge, die der Leser unterscheiden soll, waren gleich geschrieben — in der Antwort
auf die Frage, die genau diese Unterscheidung verlangt.

## Die Zusicherung war wieder der Grund

```js
requireTextFragments("de.concepts.rope", baseConcepts.rope, ["[0,1]", "[2,3]", …]);
requireTextFragments("en.concepts.rope", englishConcepts.rope, ["[0,1]", "[2,3]", …]);
```

Ein Fragment, für **beide** Sprachen in derselben Schreibweise festgeschrieben — derselbe
Fehler, den v121 bei `linear-map` und `residual` gefunden hat, zwei Zeilen unter
`parameter-init`s korrekt nach Locale getrennter Fassung. Vier Zeilen über dieser Stelle
unterscheidet `residual` längst richtig (`[1,1; −1,5]` gegen `[1.1, −1.5]`). Der Vertrag
zertifizierte die Kollision.

## Repariert

**11 deutsche Strings**, Komma als Dezimaltrenner und Semikolon als Listentrenner, und ihre
**11 englischen Zwillinge** mit einem Leerzeichen hinter dem Trenner — nötig, weil
`content numerals` jedes Trennzeichen zwischen zwei Ziffern fallen lässt: `[1; 3]` gegen
`[1,3]` hätte deutsch nichts und englisch die Phantomzahl `13` ergeben und den Guard
gebrochen. Dasselbe Verfahren wie v121.

Dazu die drei rope-Geschwister (`concepts.rope.details[0]`, `concepts.rope.mental`,
`formulas.rope.pitfall`), die dieselben Paare tragen: sonst schreibt die Antwort `[0; 1]`
und die Erklärung derselben Sache `[0,1]`.

`θ_(2,1)` und `θ_(2,2)` behalten ihr Komma — ein tiefgestelltes Indexpaar ist keine
Werteliste, und die Klasse wird im Guard erkannt und gezählt.

## Der Einzelfall, dessen Fehllesung eine gültige Rechnung ist

`formulas.distributed-critical-path.example` schrieb `T_step≈100+max(0,40−25)=115 ms`.

Deutsch gelesen ist `max(0,40−25)` das Maximum von `0,40−25 = −24,6` — ein **vollständiger
arithmetischer Ausdruck, der eine Zahl liefert**, an der Stelle, an der die Prosa den Leser
zum Rechnen auffordert. Ein fehlgelesener Shape `(B,T,8,64)` ergibt nichts; diese
Fehllesung ist unter Arithmetik geschlossen und deshalb schärfer.

Der String schreibt keine andere Dezimalzahl, also entschuldigt der string-lokale Ausweis
ihn — genau die Grenze, die v120 für die Bedienfelder notiert hat. Genau **eine** Fundstelle
in der ganzen App (gemessen über `max|min|clip|clamp`), von Hand korrigiert, und sie wird
jetzt auch ohne Dezimalzahl in der Nähe gemeldet.

## Der neue Guard: `card comma lists`

1743 Einkomma-Paare über 2296 Strings in allen 9 Content-Paketen.

**Der Zwilling wird an den eigenen Trennzeichen verankert** — 1446 so bestätigt, 249 über
den unverankerten Rückfall, wo die Übersetzung den Satz umgebaut hat. Das ist die
tragende Erkenntnis des Laufs: ohne Verankerung ist `rope.answers` **nicht entscheidbar**.
Eine Suche nach `0.2` irgendwo im englischen Zwilling findet die dortige legitime
Dezimalzahl und bürgt damit für das Paar `[0,2]` daneben. Der Defekt zertifiziert sich
selbst aus dem Bericht heraus. Die umschließende Klammer ist in beiden Sprachen dasselbe
Zeichen und damit das einzige über eine Übersetzung hinweg vergleichbare Stück Kontext.

Entschuldigt, strukturell erkannt und **gezählt**:

- **34** Strings, die das Komma nie als Dezimaltrenner benutzen — PyTorch-Shapes
  `(B,T,8,64)`, Python-Quelltext `(x for x in [1,2])`, Matrixadressen `(0,1)`, das
  Einheitsintervall `[0,1)`, aus dem englischen Handout zitierte Zahlen `„8/3 × 1,600"`.
  Davon 32 als Liste durch einen verankerten Zwilling erkannt.
- **10** Regex-Quantoren `\d{1,3}` — Syntax, keine Größe.
- **2** tiefgestellte Indexpaare `θ_(2,1)`.
- **2** Paare ohne Zwilling, beide in `expr` — dem einzigen nicht übersetzten Feld, das
  internationale Notation trägt (`N(0,1)`, `E∈[−3,3]`). Ein Paar ohne Zwilling **außerhalb**
  von `expr` lässt den Guard fehlschlagen: dort wäre es eine Übersetzungslücke, die eine
  Stelle vor diesem Test versteckt.

Die erste Klasse ist **string-lokal und damit wissentlich blind**, denn die Gewohnheit eines
Lesers ist es nicht. Das steht als Grenze im Guard, nicht in diesem Bericht.

### Sehend bei jedem Lauf, nicht nur unter Mutation

Der Block trägt eine **Fixture**: eine Kollision, die gefangen werden *muss*, und ein
Kontroll-Shape, das grün bleiben *muss* — beide durch denselben Codepfad wie das Korpus.
Damit ist das Leerlaufen des Blocks selbst ein Fehler. Das war nötig, weil der Block im
Normalfall 0 Kollisionen findet und ohne Fixture über eine leere Menge liefe — genau das,
was `card numerals`' Kollisionstest mit seinen 5 entschuldigten Läufen getan hat.

Die Fixture hat sich sofort bezahlt: ein früher Entwurf hatte eine Grenzprüfung, die eine
Dezimalzahl **am Satzende** (`1,414.`) zurückwies. Damit galt `mean-var` als Karte, die
überhaupt keine Dezimalzahl schreibt — und der String, von dem dieser Lauf ausging, wäre
entschuldigt worden.

## Mutationstest

Gefahren gegen eine schlanke Harness (Setup bis `englishFormulas` plus nur den neuen Block):
**0,24 s statt 78 s.**

| Mutation | Ergebnis |
|---|---|
| M1–M6, M4b, M5b: jeder reparierte String einzeln zurück | 8/8 **gefangen** |
| M9 Grenzprüfung bricht + `[1,3]` zurück | gefangen |
| M11 Indexpaar-Klausel gestrichen (ohne Defekt) | gefangen — sie verhindert 2 Falschmeldungen |
| M12 Notations-Klasse gestrichen (ohne Defekt) | gefangen von der Kontroll-Fixture — sie verhindert 34 |
| C1'' ein Shape neben eine Dezimalzahl gesetzt | gefangen — das **ist** die Kollision |
| **M7' Verankerung nur für die Entscheidung umgangen + `[0,2]` zurück** | **entkommen — tragend** |
| **M8 Arithmetik-Klausel gestrichen + `max(0,40−25)` zurück** | **entkommen — tragend** |
| **M10' Fixture *und* Schranken geblendet + Grenze gebrochen + `[1,3]` zurück** | **entkommen — tragend** |
| *Kontrolle:* Shape in matmul, das keine Dezimalzahl schreibt | bleibt grün |
| *Kontrolle:* eine legitime Dezimalzahl in beiden Sprachen ergänzt | bleibt grün |
| *Kontrolle:* eine legitime Semikolon-Liste in beiden Sprachen ergänzt | bleibt grün |
| *Kontrolle:* unverändert | bleibt grün |

**19 Mutationen, 0 inert.**

Drei erste Ergebnisse waren Lehrgeld und stehen als Lektion in `memory.md`:

1. **Zwei Mutationen wurden von einer Leerlauf-Schranke gefangen** (`pairs < 1500`,
   `anchoredList < 20`), nicht von der Klausel, die sie prüfen sollten. Das sieht wie ein
   Erfolg aus und beweist nichts über die Klausel. Erst mit abgeschalteten Schranken (M7',
   M10') zeigt sich, dass Verankerung und Fixture tragend sind.
2. **Eine Kontrolle war falsch gebaut**, nicht zu groß: ein Shape `(B,T,8,64)` neben
   `mean-var`s `1,414` gesetzt **ist** die Kollision — `8,64` liest sich als
   acht-Komma-sechs-vier. Der Guard hatte recht. Die Kontrolle gehört dorthin, wo Shapes
   wirklich leben: in einen String ohne Dezimalzahl (`matmul`).
3. **Eine Kontrolle, die nur eine Sprache ändert, prüft die Übersetzungslücke**, nicht das,
   was sie prüfen soll. Sie muss symmetrisch in beide Sprachen eingreifen.

## Kein Browsertest

In geplanten Läufen gesperrt. Ersatz: **778 Renders** — alle `example`- und
`pitfall`-Felder der 82 Formelkarten und alle `mental`/`details`/`answers` der Konzepte, in
beiden Sprachen, durch `formulaText`, `esc` und `selfCheckMarkup` **der App selbst**
(geschnitten, nicht kopiert). Geprüft auf Tag-Balance über sieben Tags, Platzhalter,
`[object Object]` und überlebende Kollisionen. **0 Probleme, 9/9 geänderte Felder im
gerenderten Deutsch nachgewiesen.**

Der Scanner ist vorher als sehend belegt: mit zwei injizierten Defekten meldet er genau
diese zwei (und verliert genau die zwei Nachweise), danach wieder null.

Sechs zunächst gemeldete „Platzhalter" waren Prosa: `NaN` in `causal-mask.details` und
`clipping.details` ist der Fachbegriff, „undefined or extreme weights" in
`importance-resampling.pitfall` gewöhnliches Englisch. Der Scanner wurde entsprechend
verengt, nicht der Text geändert.

Zusätzlich strukturell geprüft: **kein `split(";")` existiert in der App**; die zwei
`split(",")` treffen `adapters`/`tests` von Assignment-Problemen, keine Kartenprosa. Die
neuen Semikolons können also von keinem Renderer zerlegt werden.

## Zahlen

- Guard-Suite **75 → 76 Blöcke grün**: `card comma lists`.
- **11 deutsche Strings** und **11 englische Zwillinge** repariert, über 5 Kollisionsfelder,
  3 rope-Geschwister und 1 Arithmetik-Aufruf.
- 1 locale-blinde Zusicherung nach Sprache getrennt.
- **82/82 gerechnete Beispiele arithmetisch nachgerechnet, 0 Fehler.**
- Cache-Bump auf **v99** (4 Stellen).

## Offene Hebel

1. **Erledigt:** die zweielementige Liste ist geschlossen, in beiden Sprachen, verankert und
   gezählt gehalten. Die Arithmetik der 82 Beispiele ist geprüft — wer dort erneut sucht,
   sucht am falschen Ort.
2. `l13` fehlt weiterhin eine Formelkarte für die Gopher-Qualitätsregeln. **Weiter der
   größte offene inhaltliche Hebel**, jetzt seit v121 unverändert offen.
3. **Neu, und die ehrlichste Grenze dieses Laufs:** die Notations-Klasse ist string-lokal.
   Ein Leser, der gerade `1,414` gelesen hat, liest zwei Karten später `matmul`s
   `A=[[1,2],[3,4]]` mit derselben Gewohnheit. Gemessen sind **34 Strings** in dieser Klasse,
   darunter echte Intervalle (`symbols.s24` `[0,1)`, `symbols.s68` `[0,1]`), die deutsche
   Konvention ohnehin mit Semikolon schreibt, Matrixadressen in `causal-mask` und das
   Skalarprodukt-Beispiel in `concepts.attention`. Das ist eine Entscheidung über den
   Lesefluss, nicht über Korrektheit — sie gehört dem Nutzer, nicht einem unbeaufsichtigten
   Lauf. Die Liste steht hier vollständig zur Entscheidung bereit.
4. Der Korpus-Detektor läuft an 5 Flächen; Konzept- und Lecture-Seiten könnten denselben
   Scan bekommen (offen seit v121).
5. `compression growth` zeigt, was eine Nachrechnung findet, und wurde für *eine* Karte
   geschrieben. Die Arithmetik ist jetzt einmal von Hand geprüft, aber **von keinem Guard
   gehalten** — eine künftige Änderung an einem Beispiel wird nicht nachgerechnet. Das ist
   der nächste strukturelle Hebel: die Beispiele, deren Rechnung maschinell reproduzierbar
   ist (softmax, LSE, RMSNorm, SiLU, RoPE, AdamW, Kaskade, Bloom, GRPO), gegen ihre eigene
   Formel halten statt gegen ihre Schreibweise.
6. Browsertest steht seit v71 aus (in geplanten Läufen gesperrt).
7. `origin/main` auf `2ed21e7`; **v100–v122 ungepusht.**
