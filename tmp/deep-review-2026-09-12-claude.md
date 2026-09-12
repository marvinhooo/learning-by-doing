# Deep Review v108 — 2026-09-12 — die Einbahnstraße im Tafelwerk

Fortsetzung von [v107](deep-review-2026-09-11-claude.md). Der zugewiesene Worktree stand auf
**v99** (`2ed21e7`), der Kettenkopf auf **v107** (`cccf802`, Branch
`claude/wonderful-poincare-a87812`) — Fast-Forward, kein Merge. Kein Codex aktiv (der
Kopf-Worktree wurde zuletzt am 11. September geschrieben und ist sauber; der Haupt-Checkout
trägt Zeitstempel aus dem Juli). `origin/main` steht weiter auf `2ed21e7`; **v100 bis v108
sind ungepusht**.

Auftrag unverändert: derselbe Wissensstand wie aus der Vorlesung, und die Assignments lösen
können.

## Die Wahl, und die Vorprüfung

v107 nannte `renderFormulaDetail` als größten strukturellen Posten: 79 Formelkarten ohne
Konzept- oder Labknopf. Nach [[cs336-metric-is-a-suspicion]] war das erst der Verdacht.
Die Vorprüfung stellte drei Fragen.

**Erstens: fehlen Inhalte oder fehlt ein Weg?** Alle 79 Karten tragen `purpose`, `read`,
`example`, `intuition`, `dims`, `pitfall`, `check` und — über `FORMULA_ANSWERS`, das
`FORMULAS.forEach` beim Start einhängt — eine Musterlösung; kein Feld fehlt, kein
`example` ohne Ziffer. (Der erste Zählversuch meldete „79 Karten ohne Antwort", weil er
die Zuweisung aus Zeile 4347 nicht mitausgeführt hatte — Muster 4 aus
[[cs336-guard-verification-lessons]]: erst belegen, dass die Prüfung reale Daten sieht.)
Die Karten sind also vollständig. Was fehlt, ist der Weg hinaus.

**Zweitens: ist es wirklich eine Sackgasse?** `renderFormulaDetail` endet nach dem
Selbstcheck. Kein `data-open-concept`, kein `data-open-lab` — und, was schwerer wiegt,
die Funktion rief **`bindOpeners` gar nicht auf**. Ein Knopf, den man dort einbaut, ohne
das zu bemerken, sähe aus wie ein Weg und wäre keiner.

**Drittens: braucht der Rückweg eine neue Tabelle?** Nein. `CONCEPTS[].formulas` ist die
vom Autor gesetzte Beziehung, die `conceptFormulaIds` auf der Konzeptseite längst in der
Gegenrichtung rendert. Sie umzudrehen erfindet nichts, und `conceptLabs` — die Inversion
von `LAB_CONCEPTS`, die `concept experiments` seit v92 auf Ko-Lokation prüft — trägt sie
den letzten Schritt zum Experiment. Gemessen:

| | |
| --- | --- |
| Formelkarten mit mindestens einem Konzept | **79 von 79** |
| davon mit mindestens einem Lab | **77** |
| ohne Lab | **2** (`ssm-recurrence`, `diffusion-generation`) |

Die beiden hängen an `alternative-sequence-models` — einem der drei Konzepte, die
`concept experiments` bereits ausdrücklich als „ohne Experiment" führt. Das Repo hatte
den Fall also schon entschieden ([[cs336-metric-is-a-suspicion]], v79-Lehre).

Damit ist der Befund schärfer als die Kennzahl: nicht „79 Karten ohne Knopf", sondern
**die Daten für den Rückweg liegen vollständig vor und werden auf genau einer Seite nicht
gerendert**.

## Was gebaut wurde

- **`formulaConcepts(f)`** — die Inversion von `CONCEPTS[].formulas`, drei Zeilen.
- **`formulaRouteMarkup(f)`** — eine Sektion „Vom Lesen zum Können / Wo diese Regel gelehrt
  wird — und wo du sie ausrechnest": je Konzept eine Zeile mit Titel, Heimat-Badge
  (`prerequisiteConceptHome`: „Lecture 3", „Modul 00", „Selbststudium") und Summary, darunter
  die Experimente dieses Konzepts als „Üben: …"-Knöpfe. Beide Sprachen inline, wie der Rest
  von `renderFormulaDetail`.
- **Aufgerufen** nach dem Selbstcheck, dort wo das Lesen endet — dieselbe Stelle, an der die
  Konzeptseite ihre Experimente anbietet.
- **`bindOpeners(el)`** in `renderFormulaDetail`, ohne das jeder neue Knopf tot wäre.

Wirkung, aus den Daten: **133 Konzeptzeilen und 157 Übungsknöpfe** auf 79 Karten; **59 der
63 Labs** und **69 der 75 Konzepte** sind jetzt von einer Formelkarte aus erreichbar. Die
vier nicht erreichbaren Labs (`bpe`, `bpe-encode`, `data-pipeline`, `pipeline-yield`) hängen
an Konzepten, die keine Formel führen — die Module `tokenization` und `data` haben
`formulas:[]`. Das ist keine Lücke, sondern die Wahrheit über das Tafelwerk.

## Prüfung

- **Guard-Suite 59 → 60 Blöcke grün**, Cache-Bump auf **v88** (4 Stellen). Laborzahl,
  Konzeptzahl und Formelzahl unverändert — es kam kein Inhalt dazu, ein Weg wurde geöffnet.
- Neuer Block **`formula route`** (790 Checks). Er hält sechs Dinge:
  1. **Die Inversion, in beiden Richtungen je Karte.** Die gerenderten
     `data-open-concept`-Werte müssen exakt der Liste der Konzepte entsprechen, die die Formel
     nennen — in der Reihenfolge von `CONCEPTS`. Ein fehlendes und ein überzähliges Konzept
     sind damit derselbe Fehlschlag.
  2. **Die Labs pro Zeile, nicht als Menge.** Die Erwartung läuft im Prüfer selbst über
     `LAB_CONCEPTS`, statt die App-Funktion `conceptLabs` aufzurufen: eine geteilte Ableitung
     bewegt beide Seiten gemeinsam und belegt nichts ([[cs336-guard-verification-lessons]],
     v88-Lehre).
  3. **Der Ort statt des Vorkommens** (Hausregel seit v68): verlangt wird das vollständige
     Markup-Fragment — `<span class="compact-row-title">TITEL</span><span class="badge">HEIMAT</span>`
     und `…data-open-lab="ID">Üben: TITEL</button>` — gegen das wirklich gerenderte HTML in
     beiden Sprachen.
  4. **Das Badge unabhängig nachgerechnet.** Alle 75 Heimat-Etiketten werden im Prüfer aus den
     Lecture- und Modullisten neu abgeleitet, statt aus der App zurückgelesen.
  5. **Die Ausnahme in beide Richtungen** ([[cs336-mutation-test-blind-spots]]): die Menge der
     Karten ohne Experiment wird *abgeleitet*, nicht gelistet, und der Block **bricht ab, wenn
     sie leer ist** — sonst wäre der Zweig „Zeile ohne Übungsknopf" nie durchlaufen und die
     Prüfung inert.
  6. **Aufrufstelle und Verdrahtung.** `${formulaRouteMarkup(f)}` muss im Renderer stehen und
     **nach** dem Selbstcheck; und `renderFormulaDetail` muss `bindOpeners(el)` rufen. Der
     letzte Punkt ist der eigentliche Fund dieses Laufs: ohne ihn wären alle 290 Knöpfe tot
     gewesen, und kein bestehender Guard hätte das gesehen.
- **Kein Browsertest** — in geplanten Läufen gesperrt ([[cs336-unattended-no-preview]]).
  Ersatz: die Sektion wird für alle 79 Karten in beiden Sprachen headless gerendert und auf
  Tag-Balance, `undefined`, uninterpolierte Platzhalter und deutsche Rückstände im englischen
  Render geprüft.
- **Mutationstest: 19 Mutationen, 19 gefangen, 0 entkommen, 0 inert** — und alle 19 vom neuen
  Block **allein** (die Kopie der Suite mit den älteren Blöcken auf `void` statt `throw`, das
  Verfahren aus v101). Nur eine wurde in der vollen Suite von einem älteren Block zuerst
  gefangen (`home_ignores_foundations` von `assignment prerequisites`). Kontrolle vor und nach
  jedem Lauf grün.
  - Drei Mutationen waren im ersten Lauf **inert**, alle aus derselben Ursache: der Anker
    (`<span class="compact-row-summary">${esc(c.summary)}</span>`) steht auch in `conceptCard`.
    Das ist Muster (8) aus [[cs336-guard-verification-lessons]] — der Harness zählt die Treffer
    und meldet Mehrdeutigkeit, statt das falsche Markup zu mutieren. Mit dem längeren, für
    `formulaRouteMarkup` eindeutigen Fragment neu gefahren und alle drei gefangen.

## Was offen bleibt

1. **Drei Labs ohne rechnende Fläche**, nach entschiedenen Punkten: `policy-loss-tracer` **1**,
   `scaling-transfer` **0**, `moe-routing` **0**. Unverändert; keines trägt ein ganzes Problem.
2. **Der Rückweg im Akkordeon.** Die Formelliste (`formulaAccordion`) bietet weiterhin nur
   „Vollständig öffnen"; der Übungsknopf steht nur auf der Detailseite. Das ist bewusst so
   gelassen — die Detailseite war die benannte Sackgasse —, aber es ist der nächste kleine
   Hebel derselben Art.
3. **Vier Labs bleiben von keiner Formelkarte erreichbar** (`bpe`, `bpe-encode`,
   `data-pipeline`, `pipeline-yield`), weil ihre Konzepte keine Formel führen: die Module
   `tokenization` und `data` haben `formulas:[]`. Zu prüfen wäre, ob das Tafelwerk dort
   wirklich nichts zu sagen hat (Kompressionsrate, Yield einer Pipeline sind rechenbar) — das
   wäre dann ein Inhalts- und kein Wegehebel.
4. Der Browsertest steht seit v71 aus; er sollte beim nächsten beaufsichtigten Lauf für die
   zuletzt gebauten Flächen (`kernel-contracts`, `distributed-runtime`, `transformer-ledger`,
   `rlvr-system-transfer`) und für die neue Formel-Sektion nachgeholt werden, 360 px und beide
   Sprachen.
5. `origin/main` steht auf `2ed21e7`; **v100 bis v108 sind ungepusht**.
