# Deep Review v103 — 2026-09-07 — das Gate, das keins war

Fortsetzung von [v102](deep-review-2026-09-06-claude.md). Der zugewiesene Worktree stand auf
**v99** (`2ed21e7`), der Kettenkopf auf **v102** (`6060aee`, Branch
`claude/reverent-wilbur-774587`) — Fast-Forward, kein Merge. Kein Codex aktiv (letzter
Dateischreibvorgang im Kopf-Worktree 2026-09-06 08:23, Commit 08:27; Haupt-Checkout Juli).
`origin/main` steht weiter auf `2ed21e7`, **v100 bis v103 sind ungepusht**.

Auftrag ist unverändert der Gesamtauftrag: derselbe Wissensstand wie aus der Vorlesung, und die
Assignments lösen können.

## Die Suche

v102 hinterließ als naheliegenden nächsten Zuschnitt die Formelkarten-Sackgasse und hatte sie
selbst als schwachen Hebel gemessen. Statt sie zu nehmen, wurden fünf Deckungsfragen neu
gerechnet. Vier ergaben **keinen Befund** und sind damit endgültig geschlossen:

| Kandidat | Messung | Befund |
| --- | --- | --- |
| Probleme, deren entscheidende Konzepte kein Lab haben | 124 von 124 Problemen geprüft | **0** — jedes Problem hat auf jedem seiner entscheidenden Konzepte ein Lab |
| Konzepte ganz ohne Lab | 3 (`dataset-lineage`, `copyright-licensing`, `alternative-sequence-models`) | entscheiden weiterhin **null** Probleme |
| A2 §8, die reinen Rechenaufgaben ohne Test | 31 Punkte ohne jeden Testbefehl | `comm-crossover` deckt die vier Aufgaben ausdrücklich ab — **kein Befund** |
| Voraussetzungskarten ohne Anschluss | 18 Assignment-Karten, 45 Lecture-Karten | jede trägt einen Konzeptlink |

Der fünfte Faden trug, und er kam aus einer Zeile, die der Guard selbst schreibt:
`lab render sweep` deckte **55 von 63 Labs** ab, und die Ausnahmeliste `LR_NO_STAGE` sagt
wörtlich, sieben davon seien „objective-check labs with no computed panel at all". Das ist
keine Kennzahl, sondern ein Geständnis im Code. Die Frage war nur, **welches** dieser sieben
Labs Punkte trägt.

| Lab ohne rechnende Fläche | einziges Lab seines Konzepts? | entschiedene Punkte |
| --- | --- | --- |
| **`kernel-contracts`** | **ja** | **20** (a2:flash_forward 15, a2:flash_backward 5) |
| `pytorch-debugger` | für `pytorch-state` ja | 16,5 |
| `distributed-runtime` | ja | 10 |
| `transformer-ledger` | ja | 8 |
| `rlvr-system-transfer` | ja | 2,5 |
| `policy-loss-tracer` | ja | 1 |
| `scaling-transfer` | **nein** — `target-config` und `run-budget-ledger` rechnen dasselbe Konzept | 50, aber gedeckt |

## Der Befund

`kernel-contracts` war ein Quiz über einen festen Fall: drei Auswahlfragen, kein Regler, keine
gerechnete Zeile. Sein eigener Beobachtungsauftrag sagte „Nutze R=37, D=70, BR=16 und BD=32.
Leite beide Gridachsen, die Partial-Shape und die dS-Zeilensumme her" — und bot nichts an,
woran die Herleitung zu prüfen gewesen wäre.

Schwerer wiegt die dritte Frage. Das Lab hieß **„2D-Triton & Flash-Backward Gate"**, und als
richtige Antwort galt die Invariante **rowsum(dS) ≈ 0** je erlaubter Queryzeile. Die Invariante
ist wahr: sie folgt daraus, dass softmax(x+c) = softmax(x) ist, die Jacobi-Matrix der Softmax
also Zeilensumme null hat. Genau deshalb ist sie **kein Gate**. In ihrer Herleitung kommt kein
Skalenfaktor vor — sie bindet die *Form* von dS und nichts an seiner *Skala*.

Nachgerechnet an drei Fällen (quadratisch, nichtquadratisch, kausal maskiert), mit allen
Gradienten unabhängig durch zentrale finite Differenzen von L = Σ(O⊙dO) gegengeprüft:

| Backward-Variante | rowsum(dS) | Kosinus zu dQ_ref | Längenverhältnis | größter dQ-Fehler |
| --- | --- | --- | --- | --- |
| korrekt | 6,2e−17 | 1,000000000000 | 1,000000 | 0 |
| D-Term vergessen | 3,9e−01 · **gefangen** | 0,8286 · gefangen | 1,0447 | 0,0954 |
| rowsum(dO⊙dO) statt rowsum(O⊙dO) | 3,1e+00 · **gefangen** | 0,1837 · gefangen | 4,2267 | 0,7670 |
| **1/√d in dQ,dK vergessen** | **6,2e−17 · blind** | **1,000000000000 · blind** | **2,000000** | 0,1893 |
| **1/√d zweimal angewendet** | **6,2e−17 · blind** | **1,000000000000 · blind** | **0,500000** | 0,0946 |

Drei Dinge daran:

1. Die Blindheit ist **nicht knapp, sondern bitgenau**. Bei den Skalenvarianten ist dS
   dasselbe Array wie bei der korrekten Implementierung; die Residuen sind identisch, nicht nur
   ähnlich. Über sechs Toleranzen von 1e−14 bis 1e−4 in beide Richtungen gehalten — die
   Blindheit ist strukturell und keine getunte Konstante.
2. **Eine Richtungsprüfung ist ebenso blind.** Weil ein vergessener Skalenfaktor ein
   *einheitlicher* Faktor ist, ist der Kosinus zur Referenz exakt eins. Wer statt der
   Zeilensumme „zeigt der Gradient wenigstens in die richtige Richtung" prüft, hat dieselbe
   Lücke.
3. Das Längenverhältnis ist **exakt √d beziehungsweise 1/√d**, in allen drei Fällen. Bei A2s
   eigener Head-Dimension 64 ist der Gradient damit um den **Faktor 8** daneben — und
   `test_flash_forward_pass` besteht trotzdem, weil der Forward unberührt ist.

Dazu die dritte blinde Stelle: **dV = Pᵀ·dO benutzt dS überhaupt nicht.** Der dV-Fehler ist bei
allen fünf Varianten exakt null. Eine Prüfung, die mit dV beginnt, kann keinen einzigen
dS-Fehler finden.

Gegenprobe nach der v100-Regel („deckt ein anderes Lab das Konzept schon ab?"): **negativ**.
`kernel-contracts` ist das einzige Lab von `kernel-contracts`, und `online-softmax-kata` und
`triton-tile` rechnen den Forward beziehungsweise das 1D-Grid.

## Was gebaut wurde

`kernel-contracts` bleibt dasselbe Lab und bekommt eine rechnende Fläche in zwei Modi — kein
neues Lab, weil das Konzept schon seins hatte und ihm nur die Rechnung fehlte. Der Titel heißt
jetzt **„2D-Triton & das Backward-Gate, das keins ist"**.

**Modus A — Grid, Randtiles, Partial-Buffer.** Drei Matrixformen × drei Tilegrößen. Beide
Gridachsen werden getrennt aufgerundet, dazu die gültigen Zeilen und Spalten im jeweils letzten
Tile, die gestarteten Lanes gegen die gültigen Elemente und der Anteil maskierter Lanes. Für
A2s eigenen Fall: 3×3 Programs, Partial-Buffer [3,70], 4.608 Lanes für 2.590 gültige Elemente,
**43,7934 % maskiert**.

**Modus B — das Gate.** Drei Fälle × fünf Varianten, jede gegen dieselben drei Prüfungen, mit
einer Übersichtstabelle, die alle fünf nebeneinander stellt. Genau dort steht die Pointe als
Muster statt als Behauptung: zwei Zeilen lesen „Zeilensumme besteht · Richtung besteht ·
Referenz fällt durch".

Der Kurzcheck wurde umgeschrieben. Die dritte Frage lautet nicht mehr „welche Invariante gilt",
sondern **„welchen Fehler kann rowsum(dS) ≈ 0 grundsätzlich nicht sehen"**.

**Prosa in beiden Sprachen korrigiert.** Die Konzeptseite `kernel-contracts` nannte die
Invariante in `checks[1]`/`answers[1]` ohne Einschränkung als die Zeilenprüfung für dS. Sie
trägt jetzt ein viertes `details`-Element, das die Herleitung samt ihrer Grenze ausschreibt,
und einen zusätzlichen Pitfall. `mental`, `misconception`, `formula`, `observe` und die
Symbolliste des Labs nennen den blinden Fleck ebenfalls.

## Prüfung

- **Guard-Suite 54 → 55 Blöcke grün**, Build grün, Cache-Bump auf **v83** (4 Stellen),
  `LR_NO_STAGE` 8 → 7, **`lab render sweep` 55 → 56 von 63 Labs**, `panel i18n` 54 → 55 Panels.
  Laborzahl unverändert 63 — es kam kein Lab dazu, eines wurde rechnend.
- Neuer Block **`flash backward gate`** (292 Checks) auf einem **anderen Rechenweg als die
  App**: jeder Gradient wird durch **zentrale finite Differenzen** von L = Σ(O⊙dO)
  neu gebildet, wo die App die geschlossene Form nimmt (Übereinstimmung besser als 1e−7 auf
  dQ, dK und dV in allen drei Fällen). Die Gridachsen werden **Tile für Tile hochgezählt**
  statt aus `ceil()` gelesen, über 18 Form/Tile-Achsen. Der Fallgenerator wird als exakt
  reproduzierbar und ganzzahlig geprüft.
- **Mutationstest: 18 Mutationen, 17 gefangen, 1 inert.** Der erste Lauf ließ **sechs**
  entkommen; fünf davon waren echte Lücken im Guard und wurden geschlossen:
  - **vier Render-Lücken derselben Art** — der Block prüfte die *gerechnete* Zahl und nie die
    *gedruckte* Zelle. Zwei Zellen des Ledgers zu vertauschen (dV-Fehler zeigt dQ, Referenz-
    Verdikt zeigt Zeilensummen-Verdikt) und den Partial-Buffer nach der falschen Achse zu
    indizieren blieben unsichtbar. Jede Zelle ist jetzt an den Ausdruck gebunden, den sie
    interpoliert — und die Formliste enthält nachweislich ein Paar, dessen Achsen
    *verschieden* viele Tiles brauchen, weil [rowTiles,D] und [colTiles,D] auf einem
    quadratischen Grid gleich aussehen.
  - **eine Definitionslücke**: das Residuum als Summe statt als Maximum der Beträge zu bilden
    fiel nicht auf. Zwei Zeilen mit +a und −a hätten sich zu null gekürzt und ein sauberes
    Backward gemeldet. Die Definition ist jetzt direkt festgenagelt, und der Block weist nach,
    dass er die beiden Definitionen überhaupt unterscheiden kann.
  - Dabei war **die Zusicherung falsch statt der Code**: die erste Fassung behauptete, die
    Summe könne das Maximum nicht überschreiten. Mehrere gleichsinnige Zeilen tun genau das.
  - **Die kausale Maske abzuschalten** blieb unbemerkt, weil jede andere Aussage des Blocks
    auch für unmaskierte Attention gilt. Der Block verlangt jetzt einen maskierten Fall,
    zählt die genullten Gewichte ab und hält die Invariante ausdrücklich *unter* der Maske.
- Die eine **inerte Mutation ist gemessen, nicht angenommen**: den MINSTD-Multiplikator zu
  ändern verschiebt **12 von 15 angezeigten dQ-Fehlern** und lässt **jedes Verdikt unverändert**
  (rowPass, dirPass, refPass, dV-Bewegung identisch; die Skalenverhältnisse bleiben exakt
  {2; 0,5}; jede falsche Variante bleibt falsch). Der Fall ist absichtlich beliebig — was
  gelten muss, sind Eigenschaften des Backward-Passes und nicht des Falls. Die eine
  Eigenschaft, die ein entarteter Fall brechen würde, prüft der Block ohnehin.
- Kontrolle vor und nach allen Läufen grün. **Kein Browsertest** — in geplanten Läufen gesperrt.

## Was offen bleibt

1. **Sechs Labs ohne rechnende Fläche** sind noch auf `LR_NO_STAGE`, zusammen rund 38 Punkte.
   Der nächste in der Reihenfolge ist `pytorch-debugger` (16,5 Punkte, einziges Lab von
   `pytorch-state`), danach `distributed-runtime` (10) und `transformer-ledger` (8).
2. Die drei Konzepte ohne Lab entscheiden weiterhin **null** Probleme.
3. `renderFormulaDetail` bleibt eine Sackgasse: 79 Formelkarten ohne Konzept- oder Labknopf.
4. `origin/main` steht auf `2ed21e7`; **v100 bis v103 sind ungepusht**.
