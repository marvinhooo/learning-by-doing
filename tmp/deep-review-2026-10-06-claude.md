# Deep Review v134 — Lecture 7, Folien 25 und 27

**Branch** `claude/deep-review-v134` (`951809f`), gebaut auf dem Kettenkopf v133 (`69ad5bb`).
Der zugewiesene Worktree stand auf v99; `git switch` war nicht gesperrt. Ahnenpruefung ueber alle
Branch-Spitzen vor und nach dem Lauf: kein verlorener Zweig. Codex-Worktree seit dem 5. Oktober
21:19 unberuehrt — kein aktiver Codex.

## Was gesucht wurde

Der folienweise Abgleich war fuer die Lectures 3 und 5 erledigt (v131–v133); offen standen 4, 7, 9,
11, 15 und 16. Diesmal Lecture 7 (*Parallelism basics*, 60 Folien), vollstaendig extrahiert und
gegen die App gehalten.

**Abgedeckt war mehr, als erwartet:** Collectives und die Reduce-Scatter-Zerlegung (Folien 7–9),
naives Data Parallel (12), die 16 Bytes je Parameter (14, Karte `memory-state`), die ZeRO-Mechanik
als Ablauf (16–23), der Pipeline-Bubble (30–34, Karte `pipeline-efficiency`), Tensor Parallel
(36–39), das Volumen (Karte `ring-allreduce`) und der Speicher je Rank fuer A2 (Lab `shard-ledger`).

**Die Luecke lag auf den Folien 25 und 27**, und sie war von einer Art, die die Guard-Sweeps nicht
finden konnten: nicht eine falsche Zahl, sondern eine **nie gestellte Frage**.

## Der Befund

Folie 25 stellt die Speicherfrage **umgekehrt** zu allem, was die Plattform sonst rechnet. Nicht
wie viele Bytes ein Modell braucht, sondern **wie viele Parameter in ein festes Budget passen** —
vier Zeilen fuer 8 A100 mit je 80 GB. Und sie rechnet in einem Format, das die App nirgends kannte:
reines BF16 mit **Kahan-Summation**, nur die Masterkopie FP32, also **12 statt 16 Bytes je
Parameter**.

Messung vor dem Eingriff: `Kahan` kam im ganzen Markup **kein einziges Mal** vor, `12 Bytes` ebenso
nicht, und keine der vier Zahlen der Tabelle (6,66 / 16 / 24,62 / 53,33 Milliarden) stand irgendwo.
Zwei Folien weiter behauptet die Lecture, die Stufen 1 und 2 erlaubten keine Speicherskalierung —
eine qualitative Aussage, deren Zahl fehlte.

## Die Karte `zero-stage-ceiling`

`B_rank = b_fix + b_shard/G` und `N_max = M_GPU/B_rank`. Bei 12 Bytes je Parameter
(Gewichte 2 · Gradienten 2 · Masterkopie 4 · zwei Adam-Momente je 2; Optimizerzustand also 8) und
G = 8 reproduzieren alle vier Zahlen der Folie exakt:

| Stufe | b_fix | b_shard | B_rank | N_max |
|---|---|---|---|---|
| ohne Sharding | 12 | 0 | 12 | 6,6667 Mrd |
| ZeRO-1 | 4 | 8 | 4 + 8/8 = 5 | 16 Mrd |
| ZeRO-2 | 2 | 10 | 2 + 10/8 = 3,25 | 24,6154 Mrd |
| ZeRO-3 | 0 | 12 | 12/8 = 1,5 | 53,3333 Mrd |

**Pointe 1 — die Reihenfolge der Kosten sagt die Reihenfolge des Nutzens nicht voraus.** Der
Gesamtgewinn ist genau 8, also G. Aufgeteilt: 2,4 / **1,5385** / 2,1667. Die Folien 18 und 24 nennen
Stufe 1 und 2 *gratis* (je 2·#params) und Stufe 3 teurer (3·#params) — aber die **zweite gratis
Stufe bringt den kleinsten Gewinn, und die einzige Stufe, die Bandbreite kostet, bringt mehr als
sie.**

**Pointe 2 — gleiche Ersparnis, verschiedener Gewinn.** Stufe 1 nimmt 7 Bytes je Parameter weg; die
Stufen 2 und 3 nehmen **beide genau 1,75** weg, weil beide einen 2-Byte-Posten ueber 8 GPUs
verteilen (2·7/8). Dass daraus 1,5385 und 2,1667 werden, liegt allein an der dazwischen
geschrumpften Basis.

**Pointe 3 — Folie 27 als Rechnung.** `b_fix` verschwindet nicht: N_max ist in G monoton steigend,
aber durch `M_GPU/b_fix` beschraenkt. ZeRO-1 laeuft gegen **20 Mrd Parameter, fuer immer**, ZeRO-2
gegen 40; ZeRO-3 hat keine Schranke und waechst proportional zu G. Bei G = 8 hat ZeRO-1 davon schon
80,0 % erreicht, ZeRO-2 61,5 % — deshalb muss man weiter.

**Selbstcheck mit Zahlen, die im Beispiel nicht stehen:** G = 16. Die erste Zeile bewegt sich **gar
nicht** (6,6667 bleibt), ZeRO-1 geht auf 17,7778 (nur das 1,1111-Fache), ZeRO-2 auf 30,4762
(1,2381), ZeRO-3 auf 106,6667 — genau das Doppelte. Doppelte Hardware verdoppelt allein ZeRO-3.

## Die Modellgrenze als Pruefung, nicht als Behauptung

Diesmal ist die Grenze eine **Blindstelle des Beispiels selbst**, in zwei Schichten:

1. Der Optimizerzustand ist 8 Bytes gross und G ist 8, also ist `b_shard/G` in der ZeRO-1-Zeile
   genau 1 — an dieser Zeile ist nicht zu erkennen, welche der beiden Achten der Teiler war.
2. Gewichte und Gradienten sind in diesem Format **beide 2 Bytes** breit. Die Behauptung „Stufe 2
   shardet die Gradienten, Stufe 3 zusaetzlich die Parameter" ist deshalb am Beispiel **nicht
   pruefbar**: Vertauscht man die Posten, kommt fuer ZeRO-2 wieder 3,25 heraus. Und das Lab
   `shard-ledger` rechnet in FP32, wo P = G = 4N ebenfalls gleich sind. **Keine Flaeche der
   Plattform kann die Reihenfolge belegen**; sie steht als Zitat der Folien 19 und 21.

Der Guard beweist das **konstruktiv** — er tauscht die Posten und vergleicht — statt dem Fallstrick
zu glauben, und liest das `P = G = 4N` aus dem Lab statt es abzuschreiben.

## Guard `card zero ceiling` (90 → 91, 177 Pruefungen)

28 Modellzusicherungen vor dem ersten gelesenen Zeichen: jede Stufe ist eine Zerlegung derselben 12
Bytes (nichts verloren, nichts doppelt), die Leiter shardet streng mehr und behaelt streng weniger,
der Gesamtfaktor ist G **parametrisch** (bei G = 2, 4, 8, 16, 64), die Basiszeile ist von G exakt
unabhaengig und jede Sharding-Stufe streng monoton, die **Schranke in beiden Richtungen** (echt
darunter bei jedem endlichen G *und* erreicht bei G = 1e9 — ohne die zweite Haelfte liesse ein viel
zu hoher Deckel die Pruefung passieren), ZeRO-3 ohne endlichen Deckel und exakt verdoppelnd, die
Gewinnreihenfolge als Ungleichung `g1 > g3 > g2`, und die gleiche Ersparnis mit ihrer **Gegenprobe**
(bei ungleichen Byte-Breiten muessen die Removals auseinanderlaufen — sonst waere die Gleichheit
eine Koinzidenz, die der Guard ohne Grund behauptet).

Dazu Beispiel, Antwortschluessel, Fallstrick und Selbstcheck tokenweise **in Reihenfolge** in beiden
Sprachen, die leere Menge gruppierter Tausender als Pruefung statt als Formalie, sechs eingebaute
Fixtures und vier Kontrollen.

## Mutationstest

**60 Mutationen, 0 entkommen, 0 inert**, jeder Fang nachweislich aus dem neuen Block
(Schlankfassung: Setup bis `englishFormulas` plus nur der neue Block, **0,25 s statt 85 s**).
**5 Kontrollmutationen** in den bewusst nicht gebundenen Feldern (`read`, `dims`, `intuition`,
`aliases`, `purpose`) blieben gruen; Kontrolle vor und nach jedem Durchgang gruen.

Vier eigene Mutationen waren zunaechst **nicht eindeutig verankert** (`Masterkopie 4` traf auch
`memory-state`, `bewegt sich gar nicht` stand in Check *und* Antwort, die englische Fassung
dreimal) — alle vier praezisiert statt gestrichen, keine Guard-Luecke.

## Kein Browsertest (geplanter Lauf)

Ersatz: die Karte durch die App-eigenen Renderer headless gerendert (`formulaLearningSequence`,
`formulaPrimerMarkup`, `formulaNotationMarkup`, `answerDisclosure`), beide Sprachen — 4.901 und
4.641 Zeichen Lernsequenz, **alle 23 gerechneten Zahlen erreichen den Leser**, aufklappbare
Musterloesung vorhanden, 2 Primer-Begriffe, kein `undefined`, kein NaN, kein uninterpoliertes
Template. Der leere `formulaNotationMarkup` ist kein Defekt: 19 von 87 Karten loesen keinen
Notationsbegriff aus, darunter v133s eigene — diese Karte verwendet nur `+`, `/`, `·` und `<`.

## Verbleibender Rest

Der folienweise Abgleich ist nun fuer die Lectures **3, 5 und 7** erledigt. Offen bleiben
**4, 9, 11, 15 und 16**. Innerhalb von Lecture 7 ist der naechste Hebel die **Aktivierungsseite**
(Folien 40–45): `10sbh`, der Term `5as/h` und Sequence Parallel kommen im Markup nicht mit Zahlen
vor — dieselbe Art Luecke wie diese, eine Folie mit einer Rechnung, die die App nur qualitativ
fuehrt.
