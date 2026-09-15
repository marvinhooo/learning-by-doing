# Deep Review v112 — 2026-09-15 — das Lab, das nichts ausrechnete

Fortsetzung von [v111](deep-review-2026-09-14-claude.md). Der zugewiesene Worktree stand auf
**v99** (`2ed21e7`), der Kettenkopf auf **v111** (`5a44807`, Branch `claude/deep-review-v111`).
Neuer Branch `claude/deep-review-v112` auf dem Kopf. Die Ahnenpruefung ueber alle Branch-Spitzen
ergab **keinen verlorenen Zweig**: jede Spitze liegt in `5a44807`. Kein Codex auf diesem Repo —
der laufende `codex exec` gehoert dem AiBot-Projekt, der CS336-Haupt-Checkout traegt weiter
Zeitstempel vom 29. Juli. `origin/main` steht auf `2ed21e7`; **v100 bis v112 sind ungepusht.**

Auftrag unveraendert: derselbe Wissensstand wie aus der Vorlesung, und die Assignments loesen
koennen.

## Der Befund: zwei offene Hebel waren einer

v111 hinterliess zwei getrennte Eintraege: „drei Labs ohne rechnende Flaeche" (Hebel 4) und „die
Tausendergruppierung, der naechste Hebel derselben Art" (Hebel 5). Die Kennzahl war wieder der
Verdacht, nicht der Befund ([[cs336-metric-is-a-suspicion]]) — also erst nachsehen, was die drei
Labs wirklich sind.

**`scaling-transfer` und `moe-routing` haben eine Flaeche**: beide stehen in `LAB_OBJECTIVES` und
rendern ein Fragenformular. Sie sind vom Sweep ausgenommen, weil sie keine *gerechnete* Buehne
haben — das ist richtig so. **`policy-loss-tracer` steht in keiner der beiden Listen.** Seine
Buehne war eine fest eingetippte Shape-Tabelle, seine Herleitung eine Prosaliste mit
eingetippten Zahlen, und sein einziger Messpunkt ein Kurzcheck mit drei Dropdowns.

Und daraus folgt der zweite Teil: weil das Lab auf `LR_NO_STAGE` stand, hat der Render-Sweep es
**nie gerendert**. Gemessen im Panel des Labs:

| | v111 | v112 |
| --- | --- | --- |
| Literale Punktzahlen im Panel | **23** | 17, **alle davon `fixedNum`-Argumente** |
| davon fuer einen Leser sichtbar | 23 | **0** |

`LR_NO_STAGE` war nicht nur „kein Stage" — es war ein **Loch im Render-Guard**, und in genau
diesem Loch stand die Schreibweise, die v92 und v111 ueberall sonst geschlossen haben. Die zwei
offenen Hebel waren derselbe Hebel: dem Lab eine rechnende Flaeche zu geben nimmt es von der
Ausnahmeliste und stellt es damit unter den Guard.

## Was gebaut wurde

Das Lab rechnet jetzt. Der Mini-Rollout bleibt unveraendert — er war gut entworfen, das
Paddinglabel mit `log p = −9,00` ist eine bewusst gestellte Falle. Neu sind drei Regler und eine
Buehne, die jeden Zustand ausrechnet:

- **Maskenausrichtung** — `richtig` (Labelachse) gegen die zwei Verwechslungen, die A5
  tatsaechlich produziert. Die Optionen sind genau die drei Antworten des eigenen Kurzchecks,
  jetzt begehbar statt nur abgefragt.
- **Vorzeichen** — `ℓ = −A·log p` gegen `+A·log p`.
- **Reduktion** — Sequenzmittel gegen globales Tokenmittel; beide stehen immer nebeneinander,
  der Regler setzt nur die Marke.

Die Buehne stapelt `full tokens` / `input_ids` / `labels` / `response_mask` / `ℓ` spaltenweise
uebereinander, sodass der Shift als Versatz sichtbar ist, und zaehlt darunter, was die Maske
wirklich erwischt hat. Was die drei Einstellungen kosten, ist keine Behauptung mehr:

| Zustand | erfasste Antworttoken | Padding | Prompt | L_seq | L_tok |
| --- | --- | --- | --- | --- | --- |
| richtig | 3 von 3 | 0 | 0 | −0,1500 | 0,0000 |
| Maske auf der Eingabeachse | **1 von 3** | **1** | 0 | **−4,3000** | −4,3000 |
| jedes Nicht-Padding-Label | 3 von 3 | 0 | **2** | −0,1083 | −0,0400 |

Die Eingabeachsen-Maske verliert zwei Antworttoken *und* laedt das Paddinglabel mit `log p = −9`
in den Loss — der Batchloss springt um eine Groessenordnung. Das ist der Fehler, den die
`misconception` des Labs benennt und den es bis jetzt nur behauptet hat.

### Die Transferfrage steht als Invariante, nicht als Prosa

Das Lab fragt, warum Sequenz- und Tokenmittel auseinandergehen, obwohl dieselben drei
Antworttoken benutzt werden. Die Antwort ist im Guard als Invariante in **beiden Richtungen**
festgehalten: die beiden Reduktionen stimmen genau dann ueberein, wenn jede Antwort gleich viele
maskierte Token beitraegt — und nur dann. Der Eingabeachsen-Zustand belegt die eine Richtung
(je ein Token, beide −4,3000), der Standardfall die andere (2 gegen 1 Token, −0,15 gegen 0).

### Die Null, die keine war

Der Standardfall druckt als globales Tokenmittel eine **Restsumme von 3,7e−17**, nicht 0. Ohne
Bereinigung schreibt `toLocaleString` das im Vorzeichen-Zustand als **„−0,00"** — direkt neben
eine Herleitung, die 0 verspricht. `pltNumber` raeumt das weg. Der erste Mutationstest hat
gezeigt, dass mein Guard dafuer an der **falschen Stelle** stand (siehe unten).

### Zwei deutsche Woerter, die der Panel-Guard nicht sehen kann

`Maskenausrichtung` und `Reduktion` haetten einem englischen Leser auf Deutsch gegenuebergestanden,
**ohne dass ein Guard anschlaegt**: `GERMAN_WORDS` trifft nur Umlaute und eine Funktionswortliste,
und ein deutsches Substantiv ohne Umlaut ist fuer diese Pruefung unsichtbar
([[cs336-mutation-test-blind-spots]]). Beide sind uebersetzt; die Luecke im Detektor bleibt und
gehoert notiert.

## Pruefung

- **Guard-Suite 64 Bloecke gruen** (vorher 63), Exit 0. Neuer Block `policy-loss-tracer`, **96
  Checks**: jede Maske aus den Token-IDs neu klassifiziert statt aus den gespeicherten Laengen
  (beide Richtungen gefordert), beide Reduktionen ueber alle 12 Zustaende unabhaengig
  nachgerechnet, die Richtung der Methode selbst geprueft (eine wahrscheinlichere Antwort muss
  den Loss dorthin bewegen, wohin ihr Advantage zeigt — fuer beide Vorzeichen).
- **Der Antwortschluessel ist als Behauptung behandelt**: die Kurzcheck-Optionen muessen gleich
  dem sein, was das Lab jetzt ausrechnet ([[cs336-mutation-test-blind-spots]]) — ein an alte
  Zahlen geheftetes Schluesselfeld wuerde sonst den falschen Weg zertifizieren.
- **Render-Sweep 1314 Renders ueber 62 von 64 Labs** (vorher 1304 / 61), `LR_NO_STAGE` von 3 auf
  2. 175 von 238 Controls bewegen ihr Lab nachweislich.
- **Mutationstest: 15 Mutationen.** Erster Lauf **13 gefangen, 2 entkommen, 0 inert**; nach dem
  Schaerfen **15 von 15, 0 entkommen, 0 inert**. Kontrolle vor und nach jedem Lauf gruen. Jeder
  Fang traegt den Namen des neuen Blocks, gemessen auf der schlanken Harness
  ([[cs336-guard-suite-slim-harness]]): **0,28 s statt 55 s**.
- **Die zwei Entkommenen waren beide echte Luecken**, und beide vom bekannten Typ:
  1. Die Restsumme ist im Standardfall **positiv**, und eine positive Restsumme druckt
     `toLocaleString` von selbst als „0.00". Nur der Zustand mit gedrehtem Vorzeichen
     unterscheidet `pltNumber` von einem blanken `fixedNum`. Der Guard zielte auf den Zustand,
     in dem nichts zu sehen ist — eine Invariante hat zwei Richtungen, und geprueft war die
     stumme. Jetzt sucht er ueber alle 12 Zustaende und **fordert, dass ein negativer Rest
     existiert**, sonst bewacht er nichts.
  2. Die drei Labelzaehler konnten alle gleich der maskierten Gesamtzahl sein und plausibel
     aussehen. Jetzt ist gefordert, dass sie die maskierten Token **partitionieren**.
- **24 Renders (12 Zustaende x DE/EN)**: 0 deutsche Punkt-Dezimalzahlen, 0 englische
  Komma-Dezimalzahlen, 0 negative Nullen.
- **Kein Browsertest** — in geplanten Laeufen gesperrt ([[cs336-unattended-no-preview]]).
  Ersatz ist der headless Probelauf oben, in DE und EN.

## Was offen bleibt

1. **Der Rueckweg im Akkordeon** (aus v108–v111 unveraendert): `formulaAccordion` bietet weiter
   nur „Vollstaendig oeffnen"; der Uebungsknopf steht nur auf der Detailseite.
2. **`embedding-params` haengt weiter an einem Fallback** und hat keine Lecture, die `V·D`
   herleitet (Lecture 3s Parameterbilanz oder A1 §7.2.1 waeren der Ort).
3. **`l13` hat keine eigenen Karten fuer Qualitaetsregeln**, obwohl Gopher-Schwellen zaehlbar
   sind — derselbe Inhaltshebel wie v109–v111.
4. **Die Tausendergruppierung** bleibt der naechste Hebel derselben Art wie v111: ein deutscher
   Render, der `43200` statt `43.200` zeigt, faellt heute durch kein Netz. Der Sweep dafuer ist
   gebaut und erreicht jetzt 62 Labs; es fehlt weiter die Klassifikation der legitimen Ausnahmen,
   dieselbe Handarbeit je Satz wie in [[cs336-german-decimal-sweep]].
5. **`GERMAN_WORDS` ist blind fuer deutsche Substantive ohne Umlaut.** Dieser Lauf hat zwei davon
   von Hand gefunden (`Maskenausrichtung`, `Reduktion`). Ein Abgleich der Panel-Textknoten gegen
   das `ui`-Woerterbuch — statt gegen eine Wortliste — waere die Pruefung, die sie alle findet.
6. **Zwei Labs ohne gerechnete Buehne** bleiben bewusst: `scaling-transfer` und `moe-routing`
   sind Fragenformulare. Ob `moe-routing`s Capacity/Overflow-Rechnung eine eigene Flaeche
   verdient, ist der naechste Inhaltshebel im RLVR/Architektur-Teil.
7. Der Browsertest steht seit v71 aus; beim naechsten beaufsichtigten Lauf fuer die in v110–v112
   angefassten Flaechen nachholen, 360 px, DE und EN.
8. `origin/main` steht auf `2ed21e7`; **v100 bis v112 sind ungepusht.**
