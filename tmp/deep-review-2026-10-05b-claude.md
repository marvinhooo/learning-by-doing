# Deep Review v133 — 2026-10-05

Branch `claude/deep-review-v133` (`fbb2c05`), gebaut auf dem Kettenkopf v132 (`6bc305b`).
Der zugewiesene Worktree stand auf v99; die Ahnenpruefung ueber alle Branch-Spitzen fand
keinen verlorenen Zweig. Haupt-Checkout seit 29. Juli unberuehrt, kein Codex aktiv.

## Was gesucht wurde

Der Hebel aus v131/v132 war der **folienweise Abgleich** einer Lecture gegen ihren Guide —
die Pruefung, die Guard-Sweeps grundsaetzlich nicht leisten, weil sie nur pruefen, was
schon da ist. Lecture 5 war abgeglichen; offen waren 3, 4, 7, 9, 11, 15, 16. Gewaehlt wurde
**Lecture 3 (68 Folien)**, weil sie der Architekturkern von Assignment 1 ist.

## Was abgedeckt war

Pre-/Post-Norm und Double-Norm (Folien 10-13), RMSNorm gegen LayerNorm und das Weglassen
der Bias-Terme (14-19), der Aktivierungs-Zoo und die GLU-Varianten (20-26), serielle gegen
parallele Bloecke (27-28), Positions-Embeddings und RoPE (30-35), die Hyperparameter-Konsense
(36-52) und die Stabilitaetstricks z-loss, QK-Norm, Logit Soft-Capping (53-57) — teils bis
auf die Zahl. Die 2/3-Regel der Folie 23 steht als Parametergleichheit ausgerechnet:
3 · 768 · 2.048 = 2 · 768 · 3.072 = 4.718.592, also dieselbe Parameterzahl bei F = 8D/3
gegen F = 4D.

## Die Luecke: Folien 59 bis 62

Lecture 3 begruendet Multi-Query und Grouped-Query Attention **nicht** mit der Cachegroesse.
Sie rechnet die Arithmetic Intensity des Decodings aus und schreibt sie als **zwei Summanden**:
den mit der Sequenz wachsenden KV-Cache und die bei jedem Schritt erneut gelesenen, aber
ueber den Batch geteilten Gewichte. Weniger KV-Heads teilen nur den ersten.

Die Plattform argumentierte die Varianten ausschliesslich in Bytes: `attention-variants`
bezifferte den Cache (128 MB gegen 32 MB) und nannte den Rest „Speicherbandbreite".
`n/d` kam im ganzen Markup nicht vor.

## Die neue Karte

`decode-intensity-heads` (DE/EN, Antwortschluessel, Quellen l03 + l10):

    AI(H_kv) = ( n·H_kv/(d·h) + 1/b )^-1  <  b

Beispiel bei d = 2.048, h = 32 (d_head = 64), n = 4.096, b = 5:
Grundbaustein n/(d·h) = 0,0625, Gewichtsterm 1/b = 0,2.

| Variante | H_kv | Cache-Term | Summe | AI | Faktor | versprochen |
|---|---|---|---|---|---|---|
| MHA | 32 | 2 (= n/d) | 2,2 | 0,4545 | — | — |
| GQA | 4 | 0,25 | 0,45 | 2,2222 | 4,8889 | 8 |
| MQA | 1 | 0,0625 | 0,2625 | 3,8095 | 8,381 | 32 |

**Die Pointe:** Der versprochene Faktor kommt nicht an, und zwar nicht knapp. MQA teilt
den ersten Summanden durch h, nicht die Summe — der Gewichtsterm deckelt den gesamten
Gewinn auf **b·n/d + 1 = 11**. Die 32 war nie zu haben, die 11 schon, und MQA holt davon
76,19 %. Gleich gross sind die beiden Kosten bei H_kv = d·h/(n·b) = **3,2**, zwischen den
erreichbaren Teilern 2 und 4 — weshalb GQA mit H_kv = 4 schon knapp hinter dem Knick liegt
und der letzte Schritt auf H_kv = 1 nur noch 1,7143 bringt.

Der Selbstcheck erzeugt Zahlen, die im Beispiel nicht stehen: Batch auf b = 10 verdoppelt
bewegt MHA um 4,76 %, laesst MQA aber von 3,8095 auf 6,1538 springen und den Faktor von
8,381 auf 12,923, den Deckel von 11 auf 21. **Batching und MQA sind Ergaenzungen, keine
Alternativen** — der Batch verkleinert genau den Summanden, der MQAs Gewinn deckelt.

## Guards

`card decode intensity` (88 -> 89, 186 Pruefungen). 22 Modellzusicherungen vor dem ersten
gelesenen Zeichen; die wichtigste ist die Ungleichung **ceilFactor < h**: Sie ist die Pointe
und scheitert, wenn jemand die Zahlen so waehlt, dass sie verschwindet. Dazu der Cache-Term
als reiner Faktor in H_kv und der Gewichtsterm unabhaengig davon, beides in beide Richtungen;
der Umschlagpunkt nachweislich keine ganze Zahl und zwischen zwei Teilern von h; und keine
zwei Groessen mit demselben Wert ausser den drei Koinzidenzen, die die Karte ausschreibt.

**Die Modellgrenze steht als Pruefung, nicht als Behauptung.** Der Fallstrick sagt, die
Lecture-10-Karte `attention-arithmetic-intensity` (AI_attn = S·T_q/(S+T_q)) enthalte H_kv
gar nicht und koenne MQA prinzipiell nicht sehen. Der Guard liest das aus *jener* Karte
(expr, latex, read, dims, vars, beide Sprachen); eine Mutation, die H_kv in ihr englisches
`read` schreibt, wird gefangen.

Mutationstest: **68 Mutationen, 0 entkommen, 0 inert**, jeder Fang nachweislich aus dem
neuen Block (Schlankfassung 0,26 s statt 92 s), 4 Kontrollen in den bewusst nicht gebundenen
Feldern gruen, Kontrolle vor und nach jedem Durchgang gruen.

Zwei eigene Messinstrumente waren zuerst falsch, nicht der Code: exakte Gleichheit fuer
`2 + 0,2` scheiterte an der eigenen Binaerrundung, und die Tausender-Folge aus v132 ist
separator-blind — ihr Muster liest das deutsche `0,0625` als gruppierte Zahl `0,062` mit
uebriger 5. Beide praezisiert.

## Nebenbefund: `cascade-yield` rendert seit immer verstuemmelt

Beim Pruefen, welche Schreibweise ein `<` in `expr` folgen soll, kam heraus: `formulaMarkup`
ist `String(f.expr).replace(/ /g," ")` — **ohne Escaping** — und landet in
`<div class="formula-display">`. Vier Karten schreiben deshalb `&lt;`; die Konvention ist
tragend und war unerzwungen. `cascade-yield` trug im Index seines dritten Teils ein nacktes
`<i`, und `<` vor einem Buchstaben oeffnet ein Tag. Gegen den tatsaechlichen Wrapper mit
Pythons `html.parser` geprueft: Der Parser nimmt `<i} y_j) · (1 − yᵢ)</div` als **ein**
Bogus-Element — sichtbar bleibt `… = N · (∏_{j`, der Rest verschwindet, und das `</div>`
wird mitgeschluckt, sodass das Element nie schliesst.

Ein Zeichen geaendert. Neuer Guard `expr markup safety` (89 -> 90, 90 Pruefungen) prueft die
**Klasse** in beiden Sprachen und verlangt zusaetzlich, dass die Karten mit echtem Vergleich
die Entity behalten — sonst wacht die Regel ueber einer leeren Menge. 5 Mutationen, alle 5
gefangen, Kontrolle gruen.

## Verifikation

- Volle Suite: **90 Bloecke, Exitcode 0.**
- **Kein Browsertest** (in geplanten Laeufen gesperrt). Ersatz: die Karte durch
  `formulaLearningSequence`, `formulaPrimerMarkup`, `formulaNotationMarkup`,
  `answerDisclosure` und `selfCheckMarkup` der App selbst headless gerendert, beide Sprachen,
  7.792 und 7.380 Zeichen, alle 13 Tagarten ausbalanciert, 4 Primer-Begriffe, aufklappbare
  Musterloesung vorhanden, alle fuenf gerechneten Zahlen erreichen den Leser, kein
  `undefined`, kein NaN, kein uninterpoliertes Template.
- Zaehler nachgezogen: README 86 Formeln, Quellkommentar der Accordion-Route
  (86/274/86/78/110/278). Cache-Bump auf v110.

## Naechster Hebel

Derselbe folienweise Abgleich fuer die Lectures **4, 7, 9, 11, 15 und 16** — die
Slide-Decks liegen vor, die uebrigen acht Lectures nur als Trace-PDFs. Lecture 7
(Parallelism basics, 60 Folien) ist der naechstgroesste Kandidat, weil die PRD dort
ohnehin „Critical Batch und weitere Parallelism-Topologien" offen fuehrt.
