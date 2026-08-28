# Deep Review v86 — 2026-08-28

Kettenkopf beim Start: `76ea475` (23 Commits über v85, die Begriffslisten-Arbeit
aus dem Antigravity-Worktree). Diesmal **war** der zugewiesene Worktree der Kopf —
geprüft über `git worktree list` und `git merge-base --is-ancestor 1561712 HEAD`.
Keine fremde Session aktiv: die App-Dateien im Hauptcheckout waren zuletzt am
29. Juli angefasst, der Antigravity-Worktree um 01:38 (Lauf begann 07:11).

## Wo ich gesucht habe, bevor ich etwas gefunden habe

Die offene Hebelliste aus v85 (`lm-objective` ohne Lab, 45 nicht render-fähige
Labs, Attribut-i18n, Tausendergruppierung, sechs unerreichbare Defaults) ist
Wartung. Die Frage des Auftrags ist eine andere: *reicht der Lernpfad wirklich
statt der Vorlesungen, und wie baue ich die Voraussetzungen extrem schnell auf?*

Zur ersten Hälfte habe ich gegengeprüft statt vermutet. Die neun Trace-Lectures
sind ausführbare Python-Programme; ihr `main()` **ist** das Inhaltsverzeichnis der
Vorlesung. Aus den PDFs extrahiert ergibt das 86 benannte Abschnitte über L01,
L02, L06, L08, L10, L12, L13, L14 und L17 — darunter die Kandidaten, bei denen
eine Lücke am wahrscheinlichsten gewesen wäre: `cuda_kernels` und
`pytorch_compilation` (L06), `model_pruning` (L10), `long_context`/`tasks`/
`instruction_chat` (L13), `note_about_randomness` (L02) und die fünf getrennten
Benchmark-Familien in L12. **Jeder einzelne davon hat Text in der App.** Der
Abgleich hat also nichts gefunden — und das ist ein Ergebnis: die Behauptung des
Audit-Status, alle 17 Lectures seien tief geprüft, hält einer unabhängigen
Ableitung aus dem Quellmaterial stand. Wieder [[cs336-metric-is-a-suspicion]]:
die naheliegende Kennzahl war ein Verdacht, kein Befund.

Der Befund lag in der zweiten Hälfte der Frage.

## Der Befund: der Grundlagencheck empfahl, was man schon konnte

Der optionale Grundlagencheck ist das **einzige** Feature, das die Frage „welche
Grundlagen kann ich überspringen?" beantwortet. Er beantwortete eine andere.

```js
const weakest = Object.entries(scores).sort((a,b)=>a[1]-b[1]).slice(0,3);
```

Kein Filter auf den Wert. Gemessen, nicht behauptet — durch Nachfahren der echten
Auswertung über konstruierte Antwortbögen:

| Antwortbogen | angebotene Auffrischungen |
| --- | --- |
| **alle 15 richtig** | `python 100 %`, `shapes 100 %`, `math 100 %` |
| nur `rl` falsch | `rl 0 %`, **`python 100 %`, `shapes 100 %`** |
| fünf Lücken (`python`, `shapes`, `math`, `grad`, `rl`) | drei davon; **`grad` und `rl` fielen weg** |

Ein fehlerfreier Durchgang schickte den Lesenden also in drei Konzeptseiten, die
er nachweislich beherrscht — bei den zwölf hinterlegten Auffrischungskonzepten
zusammen **57 Minuten Lesezeit**, deren Vermeidung der ganze Zweck des Checks ist.
Ein schlechter Durchgang verschwieg umgekehrt Lücken, weil drei eine feste Zahl
ist und kein Ergebnis.

Dazu die zweite Hälfte: **neun der zwölf Bereiche hingen an genau einer Frage**
mit drei Optionen. Ein Bereichsscore konnte damit nur 0 % oder 100 % sein, und
100 % kostete ein Rateglück. Über 20 000 simulierte Ratedurchgänge las die App im
Mittel **3,33 von 12 Bereichen als voll beherrscht**; in 98,2 % der Durchgänge
mindestens einen.

## Was jetzt da ist

**21 neue Fragen, jeder Bereich genau drei (36 statt 15), beide Sprachen.** Keine
Definitionsabfragen: jede rechnet etwas nach, das im Kurs vorkommt, und jede
Erklärung benennt, warum die beiden anderen Optionen die üblichen Fehler sind.

* `python` — `"é".encode("utf-8")` ergibt 2 Bytes; und warum zwei BPE-Läufe über
  denselben Korpus verschiedene Merge-Listen liefern (Mengeniteration über
  Strings ist pro Prozess anders geordnet, Gleichstände brauchen eine Regel).
* `math` — −ln(0,25) = ln 4 ≈ 1,386 gegen ln 2 als Rateloss; und warum 0,1¹⁰⁰⁰ in
  float32 **exakt 0** wird (kleinste normale Zahl 1,18·10⁻³⁸), die Summe der
  Logarithmen dagegen −2303 bleibt.
* `grad` — ∂L/∂z_j = +y_j für j ≠ k, weil der zusammengesetzte Gradient y − onehot
  ist; und 0,8¹² ≈ 0,069 als Kettenfaktor gegen 12 · 0,8 (Ketten multiplizieren,
  Verzweigungen addieren — der Grund für den unnormalisierten Residualpfad).
* `shapes` — (B,8,T,64) nach Head-Split *und* Transposition, mit (B,T,8,64) als
  Zustand davor; und welche Maskenform auf (B,H,T,T) broadcastet.
* `systems` — 2 MFLOP über 4 MiB sind ≈ 0,48 FLOP/Byte, weit unter dem Knickpunkt.
* `data` — Jaccard = 30/170 ≈ 0,18, mit 30/100 und 30/200 als den zwei üblichen
  Fehlern; und was Precision 1,00 bei Recall 0,14 für den behaltenen Korpus heißt.
* `inference` — 32 Layer · 8 KV-Köpfe · 128 · 1024 · 2 · 2 Byte = 128 MiB **pro
  Sequenz**, die Rechnung hinter GQA.
* dazu `pytorch` (view/reshape nach transpose), `transformer` (wo Pre-Norm
  normalisiert), `scaling` (IsoFLOP-Minimum, Potenzgesetz als Gerade), `eval`
  (Parser-Null, Kontamination), `rl` (Log-Derivative Trick, Clipping).

**Angeboten wird genau das Verfehlte.** Alle Lücken, nichts sonst. Ein sauberer
Durchgang bietet keine Karte an und sagt stattdessen, wie viele Minuten
Grundlagenlektüre er erspart. Modal und Dashboard teilen dafür eine einzige
Funktion `diagnosticGaps`, damit die beiden Ansichten nie verschiedener Meinung
darüber sein können, was eine Lücke ist. Ergebnisse, die vor dieser Änderung
gespeichert wurden, tragen Prozente ohne Zählstände und lesen sich weiter.

Gerendert, deutsch, fünf Lücken:

> 5 von 12 Bereichen haben eine Frage offen gelassen. Genau die stehen unten – die
> vollständige Liste, keine Auswahl der drei schwächsten. · Python & Bytes 2/3 ·
> Tensorformen 2/3 · Numerik & Wahrscheinlichkeit 2/3 · Gradienten 2/3 · RL &
> Policy Gradient 2/3 · 7 Bereiche waren vollständig richtig. Deren
> Grundlagenkarten – etwa 32 min Lesen – kannst du übergehen.

## Prüfung

* **Guard-Suite 32 → 33 Blöcke, grün**, gemessen gegen den Stand von `HEAD` in
  einem separaten Baumverzeichnis (32) und danach (33).
* Neuer Block **`basics check`**: er lädt `diagnosticGapRows`, `diagnosticGaps`,
  `diagnosticMinutes`, `diagnosticRefresherButtons` und `diagnosticSummaryHtml`
  per `sliceDeclaration` aus `index.html` — die echten Funktionen, keine
  nachgetippte Kopie.
  * Auswahl gegen vier konstruierte Bögen: 0 Lücken → 0 Angebote, 1 → 1, **5 → 5**
    (dort zeigte die alte Fassung drei), 12 → 12; Lücken und saubere Bereiche
    partitionieren die zwölf.
  * **Rateauflösung gemessen**: 0,0350 je Bereich gegen die exakten 0,3333 einer
    Drei-Optionen-Frage — verglichen wird gegen die *exakte* Zahl des ersetzten
    Entwurfs, nicht gegen eine Schätzung davon. 13 312 von 20 000 Ratedurchgängen
    lassen jetzt gar keinen Bereich sauber.
  * **161 Ziffernfolgen über 65 numerische Strings** in beiden Fragebänken
    (`diagnostic`, `quiz`) beidseitig identisch.
  * **Zehn Ergebnispanels** (fünf Formen × zwei Sprachen) headless gerendert:
    Tag-Balance, kein `undefined`/`NaN`, kein uninterpolierter Platzhalter, kein
    Deutsch im englischen Panel — und die Zahl auf jedem Auffrischungsknopf als
    `2/3` verankert, nicht nur berechnet.
* `node --check` auf `i18n-en.js` und `sw.js`, VM-Parse des Inline-Scripts,
  **621 DOM-IDs, 0 Duplikate**, `check-term-examples.py` weiter bei 0 Verstößen.
* **Mutationstest: 16 echte Mutationen, 16 gefangen**, jede Fehlermeldung passend
  zu ihrer Mutation. Eine 17. war eine Kontrolle, die grün bleiben musste
  (Umlaute aus einer deutschen Frage entfernen) und blieb es — der Runner meldet
  also nicht wahllos „gefangen".

### Die eine Entkommene, und warum sie jetzt zu ist

`m12` drehte `${row.correct}/${row.total}` zu `${row.total}/${row.correct}`: die
Knöpfe druckten `3/2` statt `2/3`, und der ganze Block blieb grün. Genau das
Muster aus [[cs336-mutation-test-blind-spots]] — der Guard prüfte das *Berechnete*
und nicht das *Gedruckte*. Der Block verankert die Zahl jetzt im gerenderten
Markup; `m12` wird seither gefangen.

## Was ich sonst geändert habe

**Sprachbundle 73 → 74** (`index.html`, `sw.js`, README). Ohne das hätte ein
Client mit gecachtem `i18n-en.js?v=73` die 21 neuen Fragen auf Englisch **in
Deutsch** gelesen: der englische Pack fällt bei fehlendem Eintrag auf die deutsche
Quelle zurück. Die Versionsnummer stand seit v73 still, obwohl v74–v85 den Pack
verändert haben; bisher wurden aber nur vorhandene Strings editiert, keine neuen
Einträge angelegt.

## Was ich nicht gemacht habe

* **Kein Browsertest.** `preview_start` ist in geplanten Läufen gesperrt
  ([[cs336-unattended-no-preview]]); Ersatz ist das headless Rendern oben.
* **Keine repo-weite Ziffernprüfung über die Prosa.** Ich habe sie gebaut und
  verworfen: über `concepts`, `formulas` und `labs` meldet sie **92 Abweichungen,
  von denen keine ein Fehler ist** — die englische Fassung schreibt „2D", wo die
  deutsche „zweidimensional" schreibt, und „32-bit", wo die deutsche das Wort
  auflöst. Ein Guard, der 92-mal falsch anschlägt, wird abgeschaltet statt
  gelesen. Beschränkt auf `diagnostic` und `quiz` — die zwei Bänke, in denen eine
  Zahl *die Antwort ist* — sind es **0 Abweichungen**, und genau dort steht sie
  jetzt.
* **Die offenen Hebel aus v85 sind unverändert offen.**

## Beobachtet, nicht angefasst

`README.md` nennt „48 interaktive Labs", „75 Konzepte, 79 Formeln, 72 Symbole,
70 Glossarbegriffe". Die App führt **57 Labs**; die anderen vier Zahlen stimmen.
Der Lab-Stand ist seit mehreren Versionen veraltet. Nicht Teil dieser Änderung,
deshalb hier gemeldet statt still korrigiert.

## Nächste Hebel

1. **`lm-objective` hat als einziges Selbststudium-Konzept kein Lab** (offen seit
   v85).
2. **Die restlichen 45 Labs render-fähig machen** (offen seit v82) — `english
   render` erreicht 12 von 57.
3. **Attribut-i18n** (`aria-label`, `title`, `placeholder`), offen seit v81.
4. **README-Lab-Zahl**, siehe oben.
5. **Tausendergruppierung vereinheitlichen** (v79), **sechs unerreichbare
   Defaults** (v79).
