# Deep Review v96 — 2026-09-04 — der englische Leser bekam das Ergebnis, der deutsche den Rechenweg

Der zugewiesene Worktree stand auf `4067294`. Der scheinbare Kettenkopf war `649c409`
in `recursing-tesla-8fd256`, sauberer Fast-Forward ([[cs336-parallel-codex-edits]]). Die
fremde Session war zuletzt am 03.09. um 22:24 aktiv, ihr Arbeitsbaum sauber; nichts dort
wurde angefasst. Baseline: **45 Guard-Blöcke grün** (47 s).

Dass es 45 und nicht 46 waren, ist der zweite Befund dieses Laufs. Dazu unten.

## Die Gegenprobe zuerst, und sie fiel negativ aus

Die Startseite verspricht, jede Formelerklärung „setzt einen kleinen Zahlenfall vollständig
ein und rechnet ihn vor". Nach [[cs336-metric-is-a-suspicion]] wurde das gemessen, bevor
irgendetwas gebaut wurde: **alle 79 Formelkarten** tragen ein `example`, jedes mit Ziffern,
78 davon mit mindestens einem Gleichheitszeichen. Das Versprechen hält. Kein Hebel.

## Der Hebel stand im v94-Report

Offener Punkt eins dort: `content numerals` prüft, dass keine Zahl fehlt — aber nicht, dass
ein vorgerechnetes Beispiel in beiden Sprachen **gleich viele Schritte** zeigt. Zwei Lücken,
und beide standen im Bestand offen.

**Erstens die Maskierung.** `content numerals` vergleicht Ziffernmengen **je Feld**, und
`concepts.X.terms` ist ein Feld mit acht Begriffspaaren. Der Ring-All-Reduce-Begriff druckte

> deutsch: `2·(4-1)·100 / 4 = 2 · 3 · 25 = 150 MB`
> englisch: `2·(4-1)·100 / 4 = 150 MB`

Die verlorene `25` blieb in der Feldmenge stehen, weil ein Nachbarbegriff 25-MB-Buckets
nennt. Dieselbe Maskierung verdeckte in `perplexity-eval` eine verlorene `10`.

**Zweitens einstellige Arithmetik.** Beide Zahlenguards lassen Ziffernfolgen unter zwei
Stellen bewusst weg (ein einzelnes „0" wird in einer Sprache ausgeschrieben, in der anderen
geschrieben — ein Wörterbuch ist kein Guard). Damit sind

> deutsch: `A = 1 - 0,125 = +0,875`
> englisch: `A = +0.875`

für beide Guards identisch. **Der englische Leser bekam das Ergebnis einer Subtraktion, die
die App ihm nie zeigt** — und Englisch ist die Standardsprache.

## Das Schrittmodell musste zweimal gebaut werden

Der erste Entwurf zählte Gleichheitszeichen mit einer Ziffer im Zeichenfenster und meldete
**17 Treffer, von denen 10 Artefakte waren** — sie lagen ausschließlich daran, dass deutsche
Wörter länger sind als englische: `C = Durchsatz · 172800` gegen `C = throughput · 172800`
schiebt die Ziffer über die Fenstergrenze.

Das zweite Modell ist sprachunabhängig: den Text in **maximale Läufe rein mathematischer
Zeichen** schneiden und einen Lauf je Relationszeichen zählen, wenn er auch eine Ziffer
trägt. Ein Buchstabe beendet den Lauf. Damit sind beide Durchsatz-Sätze null Schritte und
`= 1 - 0.125 = +0.875` sind zwei — in jeder Sprache. **Null Fehlalarme** über 6.845
Blattpaare.

## Die elf Funde

Zehn auf der englischen Standardseite:

| Stelle | was der englische Leser bekam |
| --- | --- |
| `concepts.collectives` (Ring All-Reduce) | das Ergebnis statt `2 · 3 · 25 = 150` |
| `concepts.grpo` (prompt-lokale Baseline) | `A = +0.875` ohne `1 - 0.125` |
| `concepts.grpo` (Null-Signal-Gruppen) | „reward variance is zero" statt `σ_G = 0` — und damit die Varianz statt der Standardabweichung |
| `concepts.rmsnorm` (Epsilon) | `√(0 + 1e-6) = 0.001` ohne `rms(x) =` und ohne „statt 0" |
| `concepts.scaling-practice` | „from 12 to 96 layers" statt `L = 12` auf `L = 96` |
| `concepts.quality-filtering` | „raising τ to 0.8" statt `τ = 0,8` |
| `concepts.rl-setup` | „1/0 for final correctness" statt `R = 1` |
| `concepts.perplexity-eval` | die 10-malige Kontamination fiel ganz weg |
| `formulas.ngram-filter.answer` | `p(w|h)=0` zu Prosa verkürzt |
| `labs.dedup-pipeline.transferAnswer` | `2/6≈0.333` ohne das `J=` davor |

Die elfte lief andersherum: die **deutsche** RoPE-Erklärung schrieb „vom ersten Paar (1,0)",
was auf Deutsch wie eine Dezimalzahl liest und `k = 1` gar nicht nennt. Dort war das
Englische die vollständigere Fassung, und die deutsche Seite wurde nachgezogen.

## Prüfung

- **Guard-Suite 45 → 47 Blöcke grün** (der zweite kam über den Merge, siehe unten).
- Neuer Block `worked steps`: **6.845 Blattstrings paarweise**, 597 davon mit zusammen
  **1.718 Rechenschritten**, dazu **2.343 Ziffernfolgen je Eintrag** statt je Feld.
- `node scripts/build-site.mjs` grün, `node --check` auf dem Prüfskript, Cache-Bump auf v79.
- **Kein Browsertest** — in geplanten Läufen gesperrt ([[cs336-unattended-no-preview]]).

### Mutationstest: 11 Inhaltsmutationen, 11 gefangen

Jede der elf reparierten Stellen wurde zurückgedreht; alle elf fallen mit einer Meldung, die
zur Mutation passt. Kontrollmutation (nur ein Kommentar) grün, Arbeitsbaum nach jedem Lauf
geprüft.

**Zwei guard-schwächende Mutationen entkamen und wurden gepaart aufgelöst statt
weggeschrieben** ([[cs336-mutation-test-blind-spots]]: eine inerte Mutation ist erst geklärt,
wenn ihr Grund gemessen ist):

1. `if (false && deSteps !== enSteps)` — der Schrittvergleich abgeschaltet, Suite bleibt grün.
   Gepaart gemessen: **mit m01 (Ring All-Reduce) fällt sie weiterhin**, weil die Ziffernhälfte
   dort greift; **mit m02 (GRPO-Subtraktion) läuft sie grün durch**. Damit ist genau beziffert,
   was die Mutation kostet — einstellige Arithmetik —, und dass ein Guard die Löschung seiner
   eigenen Zusicherung grundsätzlich nicht selbst fangen kann.
2. `if (wsWorked < 0)` — die Untergrenze entfernt. Ebenfalls tragend: ein auf `[]` geleerter
   Feldwalk fällt mit der Grenze („only 0 leaves carry a computed step") und läuft ohne sie
   grün durch.

## Der zweite Befund: eine ganze Kette war verloren

`grep` auf einen Guard, den [[cs336-audit-status]] als vorhanden führte, fand ihn nicht.
Die Ursache ist die Ahnenreihe:

```
8303fab  Merge: die zweite v94-Kette      parents: fb3fb82  f9dce9c
649c409  fix: die Tabelle im Codepunkt…   parents:          f9dce9c
```

`8303fab` war die **Vereinigung** der beiden parallelen v94-Ketten. `649c409` wurde daneben
auf nur einer von beiden gebaut und ist **kein Nachfahre des Merges**. Der zugewiesene
Worktree stand also nicht nur nicht auf dem Kopf — der jüngste Commit *war* nicht der Kopf.
Verloren war damit alles aus `fb3fb82`:

- der Guard-Block **`lab render sweep`** (1.032 Renders über 51 der 59 Labs in beiden
  Sprachen, durch die echten `labMarkup`/`initLab` gegen einen DOM-Stub),
- **der Absturz, den dieser Guard gefunden hatte**: `fmtNum` im Lab `resources` stand als
  `returnfixedNum(...)` — `return` und der Helfername ohne Leerzeichen. Der Bezeichner
  existiert nicht, das Lab wirft eine ReferenceError für jeden Wert ab einer Million, und
  jedes realistische Modell ist darüber. **Der Fehler steht bis heute auf `origin/main`.**
- die neu gefasste Hexadezimal-Begriffserklärung mit den ausgeschriebenen Potenzen von 16.

`8303fab` ist gemergt. Der einzige Konflikt lag in derselben Begriffsliste und wurde als
**Vereinigung** aufgelöst: die verbesserte Codepunkt-Erklärung samt Obergrenze 1.114.111 und
U+10FFFF aus `649c409`, die verbesserte Hexadezimal-Erklärung mit 963 hex = 9·256 + 6·16 + 3
aus `fb3fb82`. Beide Seiten hatten *verschiedene* Begriffe derselben Liste verbessert.

Die Guardzahlen dazu, gemessen statt geglaubt: `649c409` führt **45** Blöcke, `8303fab` **46**,
der Stand nach diesem Lauf **47**.

## Der dritte Befund, und warum er hier nicht repariert wird

Die sieben Kurzcheck-Auswahlfelder in drei Labs boten ihre Antworten als feste Literale an —
`0.25 / 0.50 / 0.75` für das Gruppenmittel, `0.500 / 0.577 / 1.000` für die
Standardabweichung. Die Ledgerzeile daneben rechnet dieselben Zahlen durch `fixedNum` und
druckt dem deutschen Leser `0,500`. Er sollte also `0,500` auf dem Schirm gegen `0.500` in
der Liste abgleichen. **Das ist repariert**: die Beschriftung läuft jetzt durch `fixedNum`,
der verglichene Wert steht unverändert im `value`-Attribut, also ändert sich keine
Antwortprüfung und kein gespeicherter Schlüssel. `lab render sweep` rendert diese drei Labs
in beiden Sprachen und hält das jetzt fest.

Die **Bestandsaufnahme darüber hinaus ist gemessen, aber nicht gefixt**: 70 weitere
englische Dezimalpunkte stehen in deutscher Prosa, verteilt auf 19 Stellen — Formelbeispiele
(`0.75·0.60+0.25·0.40=0.55`), Labantworten, die zitieren, was der Ledger druckt
(`Recall 0.571429` gegen den gerenderten `0,571429`), und fünf `tr()`-Sätze.

Vier mechanische Anläufe wurden **verworfen**, jeder aus einem gemessenen Grund:

1. **Naiv ersetzen** trennt `0.5` in `b=[0.5,1,−2]` nicht von der Listenkomma-Rolle. Ergebnis
   wäre `[0,5,1,−2]` — unlesbar.
2. **Klammerspannen ausnehmen** liefert Sätze, die *halb* konvertiert sind:
   `0.5·2.924+(−1)·(−0,538)` — zwei Schreibweisen in einer Zeile ist schlechter als eine
   falsche.
3. **Alles-oder-nichts je String** löst das für die eindeutigen Fälle, aber die
   Klammer-Heuristik hält `P(keep) = 0.001953125` fälschlich für eine Liste und der
   Formelkarte `1.503` für eine Tausendergruppe.
4. **Jeden übrigen Punkt als Veto** scheitert an der eigenen Regexgrenze: `≈1.503.` am
   Satzende wird gar nicht erst erkannt und entgeht deshalb auch dem Veto.

Der Kern ist keine Implementierungsschwäche, sondern die Sache selbst: **das Komma ist im
Deutschen Dezimaltrenner und Listentrenner zugleich**, und welche Rolle es an einer Stelle
spielt, entscheidet der Satz, nicht ein Muster. Ein halb durchgezogener Sweep hätte *neue*
Widersprüche in die deutsche Prosa geschrieben — zwischen einer Formelkarte und dem Lab, das
dieselben Zahlen zitiert. Das ist dieselbe bewusste Grenze wie in v85, v91 und v94: ein
Wörterbuch ist kein Guard.

Die Ausbeute des Anlaufs bleibt trotzdem: die Schärfe des Befundes. `1.368` und `1.920`
stehen in derselben Formelansicht und sehen gleich aus — das erste ist e⁻¹+1, das zweite
1920 Parameter. Ein deutscher Leser kann die beiden nicht unterscheiden.

## Nächste Hebel

1. **Die 70 englischen Dezimalpunkte in deutscher Prosa**, 19 Stellen, oben aufgelistet.
   Sie brauchen Handarbeit je Satz — Vektorliterale müssen dabei ihren Trenner wechseln
   (`[0,5; 1; −2]`) oder als Code stehen bleiben. Erst *danach* trägt ein Guard.
2. **`lm-objective` ist das letzte Selbststudium-Konzept ohne Lab** (offen seit v85).
3. **`a4:mask_pii` (3 P.)** ist das letzte Problem außerhalb von A5 ohne rechnendes Lab.
4. **`render coverage` erreicht 14 von 59 Labs**; `lab render sweep` deckt inzwischen 51,
   prüft aber Struktur statt Zahlen.
5. **Der README-Versionsstand hat keinen Guard** (offen seit v94).
