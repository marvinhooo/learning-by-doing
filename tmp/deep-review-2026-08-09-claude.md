# Deep Review 2026-08-09 — Off-Policy: Ratio, Clipping & GSPO (v66)

Basis `f4e5be3` (v65), Worktree `unruffled-nash-6d745e`, Branch `claude/wonderful-jennings-ae0f73`.
Commit **`b95f067`**, **nicht gepusht**.

## 1. Die notierte Prioritätenliste war falsch — Korrektur vorweg

Der v65-Report nannte als nächsten Hebel: *„A3 insgesamt — `budget-design`/`fit-validate`/
`target-decision` tragen je 50 Punkte und teilen sich geborgte Labs, 150 Punkte und der größte
verbleibende Block."* Die Vorprüfung hat das in beiden Hälften widerlegt:

* **A3 hat 55 Punkte, nicht 150.** Alle drei Missionen tragen denselben `scope:"scaling_laws"`,
  also wurde das eine 50-Punkte-Problem dreifach gezählt. A3 besteht aus genau zwei Problemen
  (`chinchilla_isoflops` 5 P., `scaling_laws` 50 P.).
* **Die Labs sind nicht geborgt.** `scaling`, `scaling-fit` und `scaling-transfer` liegen alle im
  Modul `scaling`, sind also für A3 gebaut; `a3:target-decision` hat mit `scaling-transfer` sogar
  ein exklusives Lab, und damit ist das 50-Punkte-Problem abgedeckt.

Das ist dieselbe Fehlerklasse, die schon beim Fehlalarm `a2:parallel-accounting` (v63) auftrat:
**eine Kennzahl pro Mission über ein Problem, das in mehreren Missionen steht.** Die Achse
„Punkte pro Mission" ist nur dann aussagekräftig, wenn man vorher dedupliziert.

Neu abgeleitete Rangliste (Missionen ohne exklusives Lab, nach Punkten):

| Punkte | Probleme | Mission | zitierte Labs |
|---|---|---|---|
| 28,5 | 7 | **a5:off-policy** | grpo (4×), rlvr-system-transfer (2×) |
| 26 | 5 | a2:parallel-accounting | bereits als Fehlalarm geklärt (v63) |
| 25 | 9 | a5:variants | grpo, rlvr-system-transfer, evaluation |
| 23,5 | 7 | a5:on-policy-grpo | policy-loss-tracer, grpo |

## 2. Die echte Lücke

`a5:off-policy` überstand die Gegenprobe, und zwar schärfer als die Kennzahl vermuten ließ.
Die Prosa war reichlich vorhanden — **GSPO 40 Treffer**, Dr. GRPO 11, importance 59 —, aber
**nichts rechnete**:

* `Math.min(ratio`, `1+eps`, `1-eps`, `cliprange` → **je 0 Treffer** in der gesamten Plattform.
* `rlvr-system-transfer` ist ein Zuordnungs-Lab („Ordne … zu") und rendert `W=exp(ΣΔlogπ)` und
  `s_GSPO=exp(mean Δlogπ)` als **Zeichenketten** — strukturell dieselbe Situation wie
  `parallelism` mit `M_rank ≈ (P+G+O)/4` vor v65.
* Die Mission selbst fordert wörtlich „rechne Token- sowie Sequenz-Importance Ratios in Logspace
  für positive und negative Advantages **inklusive Clipping-Fällen**" — und kein Objekt der
  Plattform konnte das.
* **Lecture 16 nennt es ausdrücklich** (Folienzeile „Attempt 3: PPO (Clip the ratios at some
  eps)", PPO 28 Treffer) und führt als Outcome „Importance Ratio, Clipping aus PPO und
  Response-Maske im Loss lokalisieren" — ohne Objekt dafür. Die Registrierung in `l16` ist damit
  PDF-treu. **GSPO steht nicht in L16** (0 Treffer) und bleibt reine A5-Materie.

Betroffene Testverträge: `test_compute_policy_gradient_loss_off_policy`,
`test_compute_policy_gradient_loss_off_policy_gspo`, `test_grpo_train_step_off_policy`.

## 3. Gebaut: Lab #41 `offpolicy-clip`

Modul `rlvr`, 16 min, registriert in `l16`, `MODULES.rlvr` und an **erster Stelle** der Mission
`a5:off-policy`. Durchgehend die Rewards `[1, 1, 0, 0]` — dieselbe Gruppe wie im Lab `grpo`,
damit die Advantage-Zeile ±0,866024 wiedererkennbar ist.

### Modus A — Token-Level-Clipping, Gleichungen (57)–(60)

4 Policy-Stände × 3 ε × 4 Rechenwege. Rechenwege: korrekt (min über beide Terme), Methode
`noclip` (Gleichung 56 — **keine kaputte Implementierung, sondern die andere vom Handout
verlangte Methode**, als Antwort auf „grpo" trotzdem falsch), `symmetric` (Clipping ohne das
min), `positiveOnly` (ohne die Fallunterscheidung aus Gleichung 58).

**Die Lehre ist, was sich versteckt** (bei ε = 0,2, Anzeigegenauigkeit):

| Rechenweg | fresh | mild | mixed | stale |
|---|---|---|---|---|
| noclip | versteckt | versteckt | entlarvt | entlarvt |
| symmetric | versteckt | versteckt | entlarvt | entlarvt |
| positiveOnly | versteckt | versteckt | entlarvt | entlarvt |

* **`fresh` ist kein konstruierter Sonderfall**, sondern der erste innere Schritt *jedes*
  Off-Policy-Batches: `old_log_probs` wurden gerade eben mit demselben Modell berechnet, jedes
  delta ist exakt null, jedes Ratio exakt eins — alle vier Zeilen liefern `0.000000`.
* **`mild` versteckt ebenfalls alles**, weil kein Ratio das Band verlässt und das Clipping damit
  vollständig inaktiv ist (alle vier: `-0.005692`).
* Erst **`mixed`** trennt (korrekt `0.024540` gegen `0.000769` / `-0.000703` / `-0.000134`), und
  zwar nur, weil dieser Zustand **alle vier Kombinationen aus Advantage-Vorzeichen und Bandseite**
  enthält — genau die Struktur, die die Einseitigkeit des min sichtbar macht.
* Die **Maskenzeile nach Gleichung (60)** ist als Logging-Größe ausgewiesen: 0 % bei fresh/mild,
  33,3 % bei mixed, 41,7 % bei stale/ε = 0,1. Solange sie null ist, ist jede Aussage über die
  Korrektheit des Clippings unbelegt.

### Modus B — GSPO, Gleichungen (62)–(63)

4 Antwortlängen × 4 Rechenwege. Der schärfste Befund des Laufs:

**Das naive float32-Produkt läuft weder über noch auf null — es bleibt am Denormalrand stehen.**
Bei L = 512 und delta = −0,25 bleibt das Zwischenprodukt bei **2,8026e−45** hängen (zwei
kleinste Denormale; `f32(2,8e−45 · 0,7788)` rundet auf sich selbst zurück, ein Fixpunkt). Die
L-te Wurzel daraus ergibt **0,818434 statt 0,778801** — eine plausibel aussehende Zahl.
Entscheidend: sie hängt nur noch von dieser Untergrenze und von L ab, **nicht mehr von den
Daten**. Mit anderem Drift derselben Länge kommt praktisch dieselbe Zahl heraus (0,817326).
Genau das meint die Handout-Zeile „Remember to compute the geometric mean in a numerically
stable way".

| Rechenweg | single (L=1) | uniform (L=8) | mixedSeq (L=8) | long (L=512) |
|---|---|---|---|---|
| product (float32) | versteckt | versteckt | versteckt | **entlarvt** |
| arithmetic | versteckt | versteckt | **entlarvt** | versteckt |
| noExponent | versteckt | entlarvt | entlarvt | entlarvt |

Jeder Rechenweg hat eine eigene Signatur; bei L = 1 fallen alle vier zusammen (der geometrische
Mittelwert eines Terms ist der Term), und `arithmetic` trennt sich erst, wenn die deltas streuen
(Jensen — das arithmetische Mittel ist nie kleiner).

## 4. Zwei eigene Fehler, von der Verifikation gefunden

1. **Der ε-Regler war im GSPO-Modus tot.** Ich habe `offGspoRow` gerechnet, aber nur `s`
   angezeigt — der geclippte Beitrag und die Maske wurden nie gerendert, also änderte ε im
   ganzen Modus nichts Sichtbares (dieselbe Klasse wie die toten `verdict`-Texte von
   `decode-sampling`). Zusätzlich lag **jedes** s unter 1, sodass die obere Bandgrenze bei
   positivem Advantage nie greifen konnte. Behoben: `mixedSeq` auf Netto-Aufwärtsdrift geändert
   (Σ delta = +1,2 → s = 1,161834), Beitrag und Maske werden gerendert. Jetzt clippt ε = 0,1
   sichtbar (Beitrag 0,952626, maskiert) und ε = 0,2/0,3 nicht. Ein Guard hält fest, dass
   mindestens ein ε im GSPO-Modus wirklich bindet.
2. **Deutscher Pluralfehler** („Hier versteckt sich 3 falsche Fassungen") — auf getrennte
   Singular-/Pluralsätze umgestellt.

## 5. Nebenbefund und behoben: latenter Responsive-Bug

`.self-check-question` hatte kein `overflow-wrap`. Meine Transferfrage beginnt mit dem
44 Zeichen langen Bezeichner `test_compute_policy_gradient_loss_off_policy`, der bei 375 px nicht
umbricht und die Seite auf 395 px schob. **Der Bug ist älter als dieser Lauf** — jede
Transferfrage mit einem langen Bezeichner hätte ihn ausgelöst; nur hatte bisher keine einen.
`overflow-wrap: anywhere` ergänzt; nachgeprüft, dass `shard-ledger`, `checkpoint-segments`,
`grpo`, `dpo-loss` und `winrate-lc` bei 375 px unverändert sauber bleiben.

Wichtig für künftige Läufe: die Ursache war **nicht** im Lab-Inhalt. Erst das elementweise
Ausblenden mit Messung nach jedem Schritt hat sie gefunden — die naive Suche nach Elementen,
deren `right` über den Viewport ragt, meldete nur das globale `#toast` und damit eine falsche
Spur.

## 6. Verifikation

* **3249 Werte** der App gegen eine unabhängig aus (56)–(63) getippte Referenz, **0 Abweichungen**
  (App-Funktionen per `sliceDeclaration` aus `index.html` gezogen, nicht kopiert).
* **384 gerechnete Zahlen je Sprache** über 24 Zustände durch das echte DOM, DE gegen EN
  **0 Abweichungen**. Nur die berechneten Werte verglichen — die ε-Labels unterscheiden sich
  bewusst (deutsche Prosa mit Dezimalkomma, gerechnete Ausgabe mit Punkt, Hausregel).
* **Rückstandsscan**: 67 Textknoten im EN-Modus, **0 deutsche Rückstände**.
* **Kurzcheck**: 27/27 Kombinationen, genau 1 akzeptiert, 26 abgewiesen, **0 Persistenz-Leckage**
  — und die Persistenzprüfung hat vorab belegt, dass sie den Schlüssel
  `cs336-lernwerk-v2:guest` wirklich liest, bevor ihr Ergebnis zählte.
* Restore nach Reload (Banner + drei Felder), Konsole leer.
* Layout: kein Overflow bei 375 px und 1280 px, Touch-Ziele 44–46 px. Vor jeder Messung
  `resize_window` gesetzt und `window.innerWidth` gegengeprüft.
* `check-i18n` grün: **41 Labs, 2315 UI-Strings**, 124 Probleme / 523 Punkte / 47 GPU-h.
* **25 Guard-Mutationen, alle 25 gefangen, 0 escaped, 0 inert.**

### Eine Mutation ist zuerst entkommen

Der Guard verlangte `productRun.product` im GSPO-Renderer. Die Mutation entfernte den
Anzeige-Ausdruck, aber der Bezeichner stand noch in der Denormal-Bedingung derselben Funktion —
**Vorkommen statt Ort geprüft**, exakt die bekannte Fehlerklasse (5). Verschärft auf
`productRun.product.toExponential(4)` **und** `productRun.product<1e-38`; danach 25/25.

## 7. Bewusst nicht gemacht

* **Kein Eintrag von GSPO in `LECTURE_GUIDES` über l16 hinaus** — L16 nennt Clipping wörtlich,
  GSPO aber gar nicht (0 Treffer). Die Trennung bleibt ehrlich.
* **Kein CISPO-Rechenweg**, obwohl §6.2.2 ihn erwähnt: das Handout stellt ihn ausdrücklich als
  optional dar.
* **Kein Surrogate-Objective aus `derive_surrogate_objectives`** (Gleichung 55) — das ist eine
  Herleitung auf Papier, kein Zahlenvertrag, und ein Regler dafür wäre Behauptung statt Rechnung.
* **Keine echten Rollout-Daten**: die deltas sind konstruiert und im Lab als solche deklariert.

## 8. Nächste Hebel

1. `a5:variants` (25 P., 9 Probleme) — Dr. GRPO, MaxRL und RFT haben je einen exakten
   Normalisierer-Vertrag (`compute_group_normalized_rewards_drgrpo` / `_maxrl`,
   `aggregate_loss_across_microbatch_constant`); `grpo` deckt die Aggregation ab, aber die
   **Varianten-Normalisierer** rechnet nichts. `derive_difficulty_reweightings` (6 P.) hängt
   direkt daran.
2. `a5:on-policy-grpo` (23,5 P.) — vor dem Bauen prüfen, ob `policy-loss-tracer` den Vertrag
   nicht schon deckt; das ist die Achse, auf der A3 und `parallel-accounting` Fehlalarme waren.
3. `a4:pipeline-audit` / `a4:tokenize-train` (je 10 P., nur `data-pipeline`).
4. `a1:checkpointing` (seit v57 offen, 1 Punkt, aber echter Testvertrag).

**Methodischer Merksatz aus diesem Lauf:** eine Mission ohne exklusives Lab ist ein *Verdacht*,
kein Befund. Erst die Frage „welche Zahl verlangt das Handout, die die Plattform nirgends
rechnet?" trennt echte Lücken von Zählartefakten — dreimal in Folge (A3, `parallel-accounting`,
und beinahe `off-policy`) hat die Vorprüfung das Ergebnis der Kennzahl korrigiert.
