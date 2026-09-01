# Deep Review v90 — 2026-09-01 — die Baseline, die die Varianz erhöht

Kettenkopf war wieder **nicht** der zugewiesene Worktree: dieser stand auf `4067294`
(Antigravitys Begriffslisten), der Kopf auf `0a6cc96` (v89) in `gallant-payne-ea183a`.
Sauberer Fast-Forward ([[cs336-parallel-codex-edits]]). Keine fremde Session aktiv:
`index.html` zuletzt am 31.08. um 07:38 angefasst, der Lauf begann am 01.09. um 07:10.
Baseline vor jeder Änderung: **37 Guard-Blöcke grün.**

## Zwei Gegenproben, bevor irgendetwas gebaut wurde

**Die erste Kennzahl war keine Lücke.** Der Guard meldet „113 of 124 approachable after
Lecture 17". Elf Probleme (27 Punkte) werden also von keiner Lecture geöffnet. Gemessen:
alle elf hängen an genau den fünf Selbststudium-Konzepten (`causal-mask`, `cross-entropy`,
`adamw`, `clipping`, `sampling`), die das Repo **längst ausdrücklich entschieden hat** —
die Assignment-Seiten führen sie in einem eigenen Abschnitt, vier davon mit Lab. Kein Loch.
Wieder [[cs336-metric-is-a-suspicion]]: erst nachsehen, ob der Fall schon entschieden ist.

**Die zweite ebenfalls nicht.** Zehn der 58 Labs liegen neben dem Lecture-Pfad. Fünf sind
die deklarierten Selbststudium-Labs, die übrigen fünf hängen an Modul- und Missionsseiten.
Alle 58 haben eine Fläche; nichts ist unerreichbar.

## Der Befund: 5 Punkte, die niemand vorrechnet

`a5:baseline_calcs` — **„Compute the variance of the policy gradient estimator", 5 Punkte,
reine Herleitung, null GPU-Stunden.** Das Handout fixiert ein binäres Toy-Problem:

> π_θ(A=1) = p = σ(θ) über 𝒜 = {0,1}, Reward r(A) = 1{A=1}
> (a) Varianz von (1/n)Σ r(Aᵢ)∇_θ log π_θ(Aᵢ)?
> (b) Varianz mit abgezogener Baseline b?
> (c) Was macht b = p — immer kleiner, immer größer, oder von p abhängig?

Die Mission `pg-math` verspricht als Nachweis wörtlich: „Du kannst Erwartungswert und
**Varianz** verschiedener Baselines von Hand berechnen." Ihr einziges Lab war `grpo`, das
Advantages und Aggregationsgewichte rechnet — **keine Varianz**.

**Die Trefferzählung nach den Bezeichnern der Rechnung** ([[cs336-metric-is-a-suspicion]]:
nicht nach Themenwörtern suchen):

| gesucht | Treffer in `index.html` |
| --- | --- |
| `Baseline` | 66 |
| `Varianz` | 75 |
| `pgVar`, `baselineVar`, `estimatorVariance`, `logDeriv` | **je 0** |
| irgendeine Stelle, die eine Schätzervarianz ausrechnet | **0** |

Reichlich Prosa, keine Rechnung — genau das bekannte Warnsignal.

## Was die Rechnung ergibt, und warum sie unbequem ist

Der Score des Sigmoids nimmt zwei Werte an: ∇_θ log π = 1−p bei A=1 und −p bei A=0. Damit
ist der Summand eine Zweipunktvariable, und alles ist exakt:

* **(a)** Var₁(b=0) = p(1−p)³
* **(b)** Var₁(b) = p(1−p)[(1−b)²(1−p) + b²p] − p²(1−p)², und E[ĝ] = p(1−p) **für jedes b**
* **(c)** Var₁(0) − Var₁(p) = **p²(1−p)(2−3p)**

Der letzte Ausdruck wechselt bei **p = 2/3** das Vorzeichen. Oberhalb davon ist das
Populationsmittel **schlechter als gar keine Baseline** — bei p = 0,9 um das **64-Fache**
(0,0576 gegen 0,0009). Und das Minimum über b liegt nicht beim mittleren Reward, sondern
bei **b = 1 − p**; dort nehmen beide Ausgänge denselben Wert p(1−p) an, die Varianz ist
**exakt null**, der Schätzer deterministisch. Das Populationsmittel trifft dieses Minimum
an genau einer Stelle: p = 0,5.

Die vier angebotenen Baselines haben vier verschiedene Antworten auf „senkt eine Baseline
die Varianz?" — Schwellen bei **2/3** (b = p), **3/4** (b = 0,5), **1/2** (b = 1) und
**nie** (b = 1−p).

### Was die App vorher behauptet hat

Drei Stellen sagten den unqualifizierten Satz:

* **Lecture 17s eigene Zusammenfassung** — „zeigt, warum Baselines die Varianz senken".
  Das bleibt stehen: die Lecture sagt es wirklich, und die Plattform bildet die Quelle ab.
* **L15/L16 im Original** — „Attempt 1: Policy gradients (variances are too high)",
  qualitativ, ohne Zahl.
* **Die Konzeptseite `policy-gradient`** — „…lässt den Erwartungswert unverändert, **aber
  die Varianz drastisch senkt**". Das ist keine Quellenwiedergabe, sondern eine eigene
  Behauptung der App, und (c) widerlegt sie. Sie wurde in beiden Sprachen präzisiert:
  senkend nur unterhalb p = 2/3, varianzoptimal b = 1 − p.

## Was gebaut wurde: Lab `baseline-variance`

„Policy-Gradient-Varianz: welche Baseline wirklich hilft", 14 min, Modul `rlvr`.

**Modus A — ein Fall vollständig (Teile a und b).** Regler: p aus einer Leiter, die die drei
Schwellen exakt enthält (0,1 · 0,25 · 0,5 · 2/3 · 0,75 · 0,9), fünf Baselines, n ∈ {1,4,16,64}.
Angezeigt: beide Ausgänge einzeln (Wahrscheinlichkeit, Reward, Score, Beitrag), E[ĝ], der
wahre Gradient p(1−p) daneben, Var₁, Var_n, **dieselbe Zahl aus der geschlossenen Form**
und das Verhältnis zu b = 0.

**Modus B — hilft die Baseline überhaupt? (Teil c).** Für jede der vier Baselines die ganze
p-Leiter mit Var(b=0), Var(b), Δ und dem Urteil besser/gleich/schlechter; die Zeile auf der
Schwelle ist markiert und liest ausdrücklich **gleich**, nicht gerundet „besser".

Erreichbar von **Lecture 17**, vom Modul `rlvr` und vom A5-Block `pg-math` — also **vor** dem
Problem, nicht erst daneben.

## Prüfung

* **Guard-Suite 37 → 38 Blöcke, grün.** Neu: `baseline variance`, 24.306 Checks. Das Lab
  ist zusätzlich der **13.** im `render coverage`-Harness (8.617 Zustände, war 7.657).
* Der Block rechnet die Herleitung **aus dem Handout neu getippt** nach und hält drei
  unabhängige Wege gegeneinander: die Aufzählung der App, die Nachrechnung des Guards und
  die drei geschlossenen Formen — über 199 Wahrscheinlichkeiten, 9 Baselines, 4 Stichproben-
  zahlen.
* Gemessen statt behauptet: das Varianzminimum wird über ein feines b-Raster **gesucht**
  (es liegt in allen 199 Fällen bei 1−p mit Wert 0), und jede deklarierte Schwelle wird
  durch einen Vorzeichenscan über 999 p-Werte **belegt**.
* Die Zahlen beider Sprachkarten (64, 2/3, 0,5) sind an die berechneten Werte gebunden
  ([[cs336-mutation-test-blind-spots]] Punkte 19/20), ebenso die präzisierte Konzeptzeile.

### Mutationstest: 30 echte Mutationen, 0 entkommen

Vier Läufe, jeder im Hintergrund ([[cs336-mutation-test-blind-spots]] Punkt 25), jeder mit
Kontrollmutation (nur ein Kommentar geändert — muss grün bleiben), Arbeitsbaum nach jedem
Lauf per `git status` nachweislich wiederhergestellt.

| Mutation | gefangen von |
| --- | --- |
| Score-Vorzeichen des A=0-Zweigs | `baseline-variance` (Var₁ bei p = 0,9) |
| Reward der falschen Aktion | `baseline-variance` (Referenzvarianz) |
| Varianz zentriert nicht | `baseline-variance` |
| Schätzervarianz teilt nicht mehr durch n | `baseline-variance` (Var_n-Zelle) |
| geschlossene Form (a) mit falscher Potenz | `baseline variance` (Nachrechnung) |
| geschlossene Form (b) verliert den zweiten Zweig | `baseline variance` |
| geschlossene Form (c) dreht die Schwelle | `baseline variance` |
| varianzoptimale Baseline wird zum mittleren Reward | `baseline-variance` (beide Ausgangszeilen) |
| Baseline b = p deklariert Schwelle 0,5 statt 2/3 | `baseline-variance` |
| Baseline b = 0,5 deklariert Schwelle 2/3 statt 3/4 | `baseline-variance` |
| Ledger druckt das Kehrverhältnis | `baseline-variance` (64×) |
| Ledger-Zelle „geschlossene Form" echot die Aufzählung | `baseline variance` (Aufrufstelle) |
| dieselbe Zelle verliert n | `baseline variance` (Aufrufstelle) |
| Var₁-Zelle echot die geschlossene Form | `baseline-variance` |
| Sweep vergleicht die Baseline mit sich selbst | `baseline-variance` (beide Spalten der Zeile) |
| Sweep-Referenzspalte behält ihr eigenes n | `baseline variance` (Spaltenrückleser) |
| Zählung der schädlichen Zeilen dreht ihr Vorzeichen | `baseline-variance` |
| Schwellenzeile ist kein „gleich" mehr | `baseline-variance` |
| Renderer liest einen Regler, den sein Modus verbirgt | `render coverage` (Panel↔Renderer) |
| Lecture 17 bietet das Lab nicht mehr an | `baseline variance` (Platzierung) |
| A5-Block bietet das Lab nicht mehr an | `assignments` (Sprachpaarung) |
| Konzeptseite behauptet wieder unqualifiziert | `baseline variance` |
| englische Karte nennt ein Verhältnis, das nichts rechnet | `baseline variance` |
| englische Karte nennt eine Schwelle, die nichts rechnet | `baseline variance` |
| deutsche Karte verliert die Gewichtungsregel | `baseline variance` |
| englische Karte verliert die Gewichtungsregel | `baseline variance` |
| *Kontrolle (4×): nur ein Kommentar geändert* | *grün geblieben* |

**Zwei Entkommene aus dem ersten Lauf, beide repariert** — und beide gehören zu Klassen,
die in [[cs336-mutation-test-blind-spots]] schon stehen:

1. **Die Zeile „Dieselbe Zahl aus der geschlossenen Form" ließ sich auf die Aufzählung
   umbiegen.** Auf dem Schirm ändert sich dabei kein Byte — die beiden stimmen ja überein,
   das ist der Inhalt der Zeile. Punkt 4 („die Funktion war geprüft, ihre Aufrufstelle
   nicht"): Der Guard schneidet jetzt `bvLedgerStage` aus der Quelle und hält fest, dass die
   Zelle wirklich `bvClosedVarBaseline(p,b,n)` rendert. Zusätzlich eine **beobachtbare**
   Variante derselben Stelle (n fällt weg), die ebenfalls gefangen wird.
2. **Der Sweep ließ sich dazu bringen, seine Referenzspalte aus der gewählten Baseline zu
   rechnen.** Dann steht in jeder Zeile Δ = 0 — und der Anker „gleich · Δ = 0,0000000000"
   der Schwellenzeile passt weiterhin, weil er jetzt überall passt; die Schwelle daneben ist
   ein deklariertes Feld und bewegt sich auch nicht. Punkt 17/21 in neuer Form: **zwei
   abhängige Spalten, nur eine verankert.** Jetzt liest der Guard die Referenzspalte über
   alle vier Baselines zurück, vergleicht sie mit der eigenen Nachrechnung und verlangt,
   dass die beiden Spalten in genau fünf der sechs Zeilen verschieden sind.

**Eine inerte Mutation, und ihr Grund war ein Prosafehler.** Die Mutation „die
Einordnungsklausel verliert die allgemeine Regel" blieb grün, obwohl ein Guard genau diese
Regel verlangt — weil der Satz **zweimal** in derselben Karte stand und die zweite Stelle
die erste deckte (Punkt 6: mehrdeutige Prosa-Muster). Das ist kein bestandener Test: Die
Wiederholung wurde entfernt, danach fängt der Guard die Mutation in beiden Sprachen.

## Was ich nicht gemacht habe

* **Kein Browsertest.** In geplanten Läufen ist `preview_start` gesperrt
  ([[cs336-unattended-no-preview]]). Ersatz ist, dass alle 960 Zustände des Labs ohne DOM
  gerendert und durch den echten Übersetzer geschickt werden.
* **Lecture 17s Zusammenfassung nicht geändert.** Sie sagt, was die Lecture sagt; die
  Korrektur gehört ins Lab auf derselben Seite, nicht in die Quellenwiedergabe.
* **`lm-objective` weiterhin ohne Lab** — unverändert 0 der 124 Probleme.

## Nächste Hebel

1. **Die Quellenangaben der vier Karten, die keine Lecture stützt** (offen aus v89):
   `cross-entropy`→L02 hat dort null Treffer, `embedding-params`→L03, `transformer-params`
   gehört A3; echt ist nur `memory-state`→L02.
2. **Die restlichen Labs render-fähig machen** — `render coverage` erreicht jetzt 13 von 58.
3. **Attribut-i18n** (`aria-label`, `title`, `placeholder`) — offen seit v81.
4. **Tausendergruppierung vereinheitlichen** — offen seit v79.
5. **Sechs unerreichbare Defaults** in den Lab-Helfern — offen seit v79.
6. **Neu:** Die 18 Assignment-Voraussetzungen (`ASSIGNMENT_PREREQUISITE_GUIDES`) tragen als
   einzige Vorwissensfläche **keinen Konzeptlink** — die 45 Lecture-Voraussetzungen tragen
   ihn alle. Wer dort etwas nicht kann, liest einen Absatz und hat keinen Weg weiter.
