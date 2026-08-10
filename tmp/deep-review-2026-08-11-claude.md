# Deep Review 2026-08-11 — Der Microbatch-Nenner wird ein Gradient

Basis `98623c7` (v67), Worktree `unruffled-nash-6d745e`, Branch `claude/brave-saha-7f2404`,
per `git merge --ff-only` auf die Kette gehoben. Ergebnis: **v68**, Commit `a7030dc`, nicht gepusht.

## Hebelwahl und Vorprüfung

Der von v66/v67 notierte Hebel war `a5:on-policy-grpo` (23,5 Punkte, 7 Probleme) — **mit dem
ausdrücklichen Vermerk „erst prüfen, ob `policy-loss-tracer` den Vertrag deckt"**. Die Vorprüfung
war wieder nötig und hat den Hebel diesmal nicht widerlegt, aber verschoben:

- `policy-loss-tracer` ist ein **statisches** Lab. Es zeigt Shift, Maske, Lossvorzeichen und
  Sequenz- gegen Tokenaggregation an festen Zahlen, ohne Regler. Es deckt
  `compute_policy_gradient_loss_on_policy` gut ab.
- `grpo` deckt `compute_group_normalized_rewards_grpo` ab (Mittel, Std-Konvention, Aggregation
  inkl. festem Nenner) und sagt in seiner eigenen Notiz, dass „Microbatching im vollständigen
  Training zusätzlich hinzukommt".
- Die Lücke lag also **nicht** bei den beiden 1-Punkt-Problemen, sondern beim 5-Punkt-Problem
  `grpo_train_step_standard_on_policy` und dem 0,5-Punkt-Problem
  `aggregate_loss_across_microbatch_sequence`.

Beleg nach der Regel aus [[cs336-metric-is-a-suspicion]] — Trefferzählung nach den Bezeichnern
der Rechnung, nicht nach Themenwörtern:

| Bezeichner | Treffer in `index.html` (v67) |
|---|---|
| `len(inputs_microbatch)` | 0 |
| `normalization_constant` | 0 |
| `max_grad_norm` | 0 |
| `gradient_accumulation_steps` | 1 (Kommentar über Pruning in `advantage-normalizers`) |
| „Gewicht je Sequenz" / „effektives Gewicht" | 0 / 1 |
| `microbatch` | 11 — davon der weit überwiegende Teil **Pipeline-Parallelität aus A2**, ein anderer Begriff |

Das Handout schreibt die Anforderung in einem Satz hin („to ensure that the microbatch-accumulated
gradient is equivalent to computing the gradient on the whole batch"), druckt **eine** Zeile
Reweighting für `loss_normalization="sequence"` und sagt zur Konstanten nur, der Code werde sich
„slightly" ändern. Was er genau ändern muss, stand nirgends — weder im Handout noch in der Plattform.

## Gebaut: Lab #43 `microbatch-denominator`

Modul `rlvr`, 15 min, registriert an **erster Stelle** der Mission `a5:on-policy-grpo`, im Modul
und im Labs-Index. **Bewusst kein `LECTURE_GUIDES`-Eintrag:** keine Lecture-PDF lehrt Gradient
Accumulation für den RLVR-Loss (L16 0 Treffer auf „accumulat", L7 nennt „microbatch" zweimal im
Pipeline-Sinn). Ein Guard hält das fest.

Ein Rollout-Batch, B = 8 Antworten (2 Prompts × G = 4), Advantages fertig aus
`compute_group_normalized_rewards` mit `baseline="mean"` (summieren sich je Gruppe auf null),
Z = B·G·L = 4096 mit L = 512 wie im Handout.
**3 Faktorregeln × 2 Normalisierungen × 6 Aufteilungen × 2 Modi = 72 Zustände.**

### Modus A — Ist der akkumulierte Gradient der Batchgradient?

Zeigt je Microbatch `aggregate`, den Faktor c und den Beitrag; darunter die akkumulierte Summe
gegen denselben Batch in einem einzigen Rückwärtspass, das Verhältnis, und **das Gewicht w jeder
einzelnen Antwort relativ zum Batchgradienten**. w = 1 überall ist genau dann wahr, wenn die
beiden Gradienten dasselbe Objekt sind — ein Guard prüft, dass diese beiden Aussagen wirklich
äquivalent sind, und dass die Gewichte den akkumulierten Skalar rekonstruieren (sonst wären sie
nicht der Gradient, und das ganze Lab redete über nichts).

Drei Befunde, alle exakt:

1. **Bei k = 1 sind alle drei Faktoren dieselbe Zahl**, in beiden Normalisierungen: der einzige
   Microbatch *ist* der Batch, also |mb|/B = 1/k = 1. Genau in diesem Zustand läuft
   `test_grpo_train_step_standard_on_policy`. Der Test kann die Frage strukturell nicht stellen.
2. **Richtig ist nicht die Regel, sondern das Paar.** `loss * (len(mb)/len(inputs))` — die Zeile
   aus dem Handout — ist unter „sequence" auf allen sechs Aufteilungen korrekt und unter
   „constant" um exakt 1/k zu klein. Umgekehrt ist *gar nicht skalieren* unter „constant" auf
   allen sechs Aufteilungen korrekt und unter „sequence" um exakt k zu groß (2 / 4 / 8 bei
   k = 2 / 4 / 8). Beide Fehler sind gleichmäßig, also reine Skalierungen — und **eine
   Lernratensuche absorbiert sie vollständig.** Das verbindet den Fehler direkt mit
   `grpo_learning_rate` (3 Punkte, 4 B200-Stunden): der Sweep findet eine Lernrate, die den
   falschen Nenner ausgleicht, und belegt damit gar nichts.
3. **`loss / gradient_accumulation_steps` ist bei gleich großen Microbatches korrekt** — und nur
   dort. Acht Antworten lassen sich nicht in drei gleiche Microbatches teilen; bei [3,3,2]
   entstehen die Gewichte 0,888889 und 1,333333, und der Batchloss kippt von **0,0234375 auf
   −0,0347222** (Verhältnis −1,481481). Das Vorzeichen ist datenspezifisch, die Ungleichheit
   nicht: ab hier ist der Fehler **keine Skalierung mehr**, und die Zeile „Gleichmäßiger Faktor
   über alle Antworten" zeigt „keiner".

### Modus B — Bleibt die Baseline eine Baseline?

`baseline="mean"` garantiert Σ_{j∈Gruppe} A_j = 0, und genau daran hängt, dass die Baseline die
Varianz senkt, **ohne das Ziel zu verändern**. Die Accumulation multipliziert jede Antwort mit
ihrem Gewicht w. Sind die Gewichte innerhalb einer Gruppe verschieden, überlebt die Identität
nicht: Σ w_j·A_j ≠ 0. Der Rest ist ein Anteil im Update, der **nicht mehr vom Reward abhängt** —
er verschiebt die Wahrscheinlichkeit *jeder* Antwort auf diesen Prompt in dieselbe Richtung, der
richtigen wie der falschen.

Zahlen: bei [3,3,2] in Batchreihenfolge mit `loss/k` bleibt **−0,888889** auf Promptgruppe 2
stehen, Gruppe 1 bleibt intakt (ihre vier Antworten landen zufällig alle im selben Gewicht).
Ohne Skalierung sind es **−2,666667**. Unter „constant" mit der Handout-Zeile **+0,25**.

Die zweite ungerade Aufteilung ist **nach Antwortlänge sortiert** — dieselben Größen [3,3,2],
aber die übliche und sinnvolle Optimierung, vor dem Aufteilen zu sortieren, damit weniger Padding
entsteht. Sie zerlegt **beide** Promptgruppen (je +0,222222 mit `loss/k`), und zwar
längenkorreliert: die langen Antworten bekommen das größere Gewicht. Ein Guard verlangt, dass die
beiden ungeraden Aufteilungen **verschiedene** Gruppen brechen, sonst wäre die zweite Dekoration.

Ein Guard hält beide Richtungen fest: ein gleichmäßiger Gewichtsvektor darf die Baseline **nie**
brechen, ein ungleichmäßiger **muss** mindestens eine Gruppe brechen.

### Bewusst nicht gemacht

- **Kein AdamW-/Clipping-Modus.** Erst geplant, dann verworfen: Adam ist gegenüber einer globalen
  Gradientenskalierung invariant (bis auf ε) — das ist richtig und stützt die Aussage —, aber es
  ist als diagonaler Präkonditionierer **auch** gegenüber einer koordinatenweisen positiven
  Umskalierung weitgehend invariant. Eine Lehre „Adam schluckt die Skalierung, aber nicht die
  Form" wäre in der naheliegenden Konstruktion (orthogonale, gleich große Beiträge je Antwort)
  ein Artefakt der Konstruktion gewesen, nicht der Sache. Die belastbare Aussage — ein
  gleichmäßiger Faktor ist genau das, was eine Lernratensuche absorbiert — steht jetzt als
  Verdict und in der Transferantwort, ohne Simulation.
- **Kein `LECTURE_GUIDES`-Eintrag** (siehe oben).
- **Keine Regler für Modellgröße oder G** — alle Verhältnisse sind maßstabsinvariant, und die
  Advantages sind bewusst Eingabe, nicht Rechenergebnis: die Gruppennormalisierung gehört
  `grpo` und `advantage-normalizers`, ein Duplikat wäre schlimmer als ein ausgelassener Lauf.

## Verifikation

- **Unabhängige Referenz** (`scratchpad/ref.mjs`), aus §4.2.3/§4.2.4 neu getippt, ohne in die
  Plattformimplementierung zu sehen: 36 Zustände, **0 Linearitätsabweichungen** (die
  Gewichtsdarstellung rekonstruiert den akkumulierten Skalar exakt).
- **Guards:** `396` Werte gegen dieselbe Referenz, plus Struktur-, Registrierungs- und
  Renderer-Guards. `check-i18n` grün: **43 Labs, 2462 UI-Strings**.
- **Echtes DOM:** 1362 Prüfungen in EN und 1326 in DE über alle 72 Zustände, **0 Abweichungen**;
  jeder Microbatch-`aggregate`, jeder Faktor, jeder Beitrag, akkumulierter Loss, Referenz,
  Verhältnis, gleichmäßiger Faktor, alle 8 Gewichte, alle 8 Sequenzmittel und beide Driftzeilen.
- **Rückstandsscan:** 37 deutsche Suchstrings über alle 72 Zustände im EN-Modus, **0 Treffer**.
  Zwei fehlende Schlüssel wurden dabei gefunden und ergänzt (`Verhältnis`, `Microbatch`).
- **Kurzcheck:** 27/27 Kombinationen, genau eine akzeptiert, **0 Leckage**, und die
  Persistenzprüfung liest nachweislich einen existierenden Schlüssel
  (`cs336-lernwerk-v2:guest`) — Selbstprüfung der Prüfung, nach der Lehre aus v61.
- **Layout:** `scrollWidth` = `clientWidth` in allen 72 Zuständen bei 375 px und bei 1280 px
  (`window.innerWidth` jeweils gegengeprüft), keine Touch-Ziele unter 44 px, Konsole leer.
- **Reload-Restore:** Kurzcheck-Ergebnis und alle drei Antworten überleben den Neuladen.
- **Erreichbarkeit:** Labs-Index (43 Karten), Modul `rlvr`, Mission `a5:on-policy-grpo`, Route.
- **Mutationstest: 56 Mutationen, alle 56 gefangen, 0 escaped, 0 inert.**

### Neue Ausprägung der Guard-Lehre

Im ersten Mutationslauf: 50 gefangen, **3 escaped, 2 inert** — beides dieselbe alte Ursache in
neuem Gewand.

- *Escaped:* die Renderer-Guards verlangten `mbdNumber(entry.drift,6)` und `broken.length`.
  Beide Bezeichner stehen **ein zweites Mal in derselben Funktion**, in der Filterbedingung
  bzw. in der Verdict-Bedingung. Das Entfernen der Anzeige ließ den Guard grün.
- *Inert:* `mbdNumber(report.accumulated,10)` kam zweimal in `index.html` vor — im Markup und in
  der Gleichheitsprüfung `mbdNumber(...)===mbdNumber(...)` —, also fand der Harness keinen
  eindeutigen Anker und meldete korrekt `INERT` statt „bestanden".
- Beides ist Muster (5) „Vorkommen statt Ort", **zum dritten Mal in Folge**. Konsequenz und neue
  Hausregel: **Renderer-Guards verlangen das vollständige Markup-Fragment**
  (`"<strong>Σ w·A = ${mbdNumber(entry.drift,6)}</strong>"`), nicht den Ausdruck allein — dann ist
  der Anker automatisch eindeutig und der Guard prüft den Ort, nicht das Vorkommen.
- Ein dritter Escape (`${esc(terms)}`) war die klassische Quelle-statt-Anzeige-Lücke: der Guard
  verlangte die Konstruktion der Termzeile, nicht ihre Ausgabe.

Nach der Verschärfung: 56/56.

### Nebenbefund

Beim Schreiben fielen zwei tote Daten im eigenen Entwurf auf und wurden vor der Verifikation
geschlossen: `MBD_RULES[].source` und die Konstante `MBD_GROUP_SIZE` waren definiert, aber von
keinem Renderer angezeigt. Beide werden jetzt gerendert, beide von einem Guard gehalten.

## Nächste Hebel

1. `a4:pipeline-audit` / `a4:tokenize-train` (je 10 Punkte, teilen sich nur `data-pipeline`).
2. `a1:checkpointing` / der Resume-Vertrag von `training-state` (seit v57 offen, 1 Punkt, aber
   echter Testvertrag: Optimizer-Momente, Scheduler-Phase, Stepzähler, RNG).
3. Vorprüfen, bevor gebaut wird — die Kennzahl hat inzwischen viermal einen Kandidaten genannt,
   den erst die Frage nach der fehlenden Zahl bestätigt oder widerlegt hat.
