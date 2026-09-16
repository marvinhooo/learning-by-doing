# Deep Review v113 — 2026-09-16 — das Lab, das rechnen ließ, ohne zu rechnen

Fortsetzung von [v112](deep-review-2026-09-15-claude.md). Der zugewiesene Worktree stand auf
**v99** (`2ed21e7`), der Kettenkopf auf **v112** (`371338a`, Branch `claude/deep-review-v112`).
Die Ahnenpruefung ueber alle Branch-Spitzen ergab **keinen verlorenen Zweig**: jede der 74
Spitzen liegt in `371338a`. `main` steht weiter auf **v50** und ist als Vergleichspunkt
wertlos — die Pruefung gegen `main` meldet 74 „verlorene" Zweige, die Pruefung gegen den
Kettenkopf keinen einzigen. **Kein Codex auf diesem Repo**: der Haupt-Checkout traegt weiter
Zeitstempel vom 29. Juli. `origin/main` steht auf `2ed21e7`; **v100 bis v113 sind ungepusht.**

Auftrag unveraendert: derselbe Wissensstand wie aus der Vorlesung, und die Assignments loesen
koennen.

## Der Befund

v112 hinterliess als Hebel 6 die Frage, ob `moe-routing`s Capacity-Rechnung „eine eigene Flaeche
verdient". Die Kennzahl war wieder der Verdacht, nicht der Befund
([[cs336-metric-is-a-suspicion]]) — also erst nachsehen, was das Lab dem Leser wirklich anbietet.

Seine `observe`-Zeile lautete: **„Nutze T=8, k=2, E=4 und c=1.0. Berechne Capacity, Overflow bei
sechs Assignments zu Expert 0 und den Aux-Loss bei uniformem Routing."** Und keine Flaeche der App
zeigte eine dieser drei Zahlen. Die einzige Interaktion war ein Formular mit drei Dropdowns, in
dem genau diese drei Zahlen als Option dastanden — **ein Lab, das zum Rechnen aufforderte und als
einzige Rueckmeldung ein Ratefeld anbot.** Das ist die Stelle, an der der Auftrag „interaktive
Bereiche, in denen ich Loesungen verstehen kann" am deutlichsten nicht eingeloest war.

Und wie in v112 lag der Guardfehler an derselben Stelle: weil das Lab keine rechnende Buehne
hatte, stand es auf `LR_NO_STAGE` und wurde vom Render-Sweep **nie gerendert**.

## Was gebaut wurde

Das Lab rechnet jetzt. Vier Regler ueber einem festen Mini-Batch aus 8 Token und 4 Experts, und
jede Router-Zeile ist dieselbe Permutation von `[0,40 0,30 0,15 0,15]` — daraus folgt, dass jede
Zeile auf 1 summiert und **keine Top-k-Wahl an einer Tie-Break-Regel haengt**.

| Regler | Stellungen |
| --- | --- |
| Routing | ausgeglichen · schief (Expert 0 zieht 6 von 16) · kollabiert (jedes Token waehlt Expert 0) |
| Experts je Token | k = 2 · k = 1 (Switch) |
| Capacity Factor c | 1 · 0,5 · **1,25** · 1,5 · 2 |
| Expert-zu-Geraet | blockweise · reihum |

Die Buehne rechnet sechs Abschnitte aus: die Router-Tabelle mit markierter Top-k-Wahl und einem
`✕` an jedem Assignment, das die Capacity abweist; das Expert-Ledger mit Assignments,
verarbeiteten Token, Overflow, `f_e` und `P_e`; den Balance-Loss; die Capacity-Bilanz; die
Geraeteauslastung; und die Top-k-Normalisierung.

### Die drei Zahlen der Aufgabe sind jetzt Ablesungen

| | Zustand | was die Buehne zeigt |
| --- | --- | --- |
| Capacity | ausgeglichen, k=2, c=1 | `ceil(1,0·8·2/4)` = **4** |
| Overflow | schief, k=2, c=1 | Expert 0 haelt **6**, gibt **2** ab |
| L_balance | ausgeglichen | **1,000000·α** — nicht null |

Der Antwortschluessel des Kurzchecks wird aus genau diesen Zustaenden **gerechnet** statt
eingetippt ([[cs336-mutation-test-blind-spots]]): ein an alte Zahlen geheftetes Schluesselfeld
koennte sonst den falschen Weg zertifizieren.

### Was die Regler sichtbar machen

- **α ist der Boden, nicht null.** Ausgeglichenes Routing liefert exakt α, schiefes 1,046875·α,
  kollabiertes 1,278125·α. Der Irrtum, den die `misconception` benennt, ist damit begehbar.
- **Capacity ist nicht Balance.** Bei c = 0,5 verwirft **auch perfekt ausgeglichenes Routing
  8 von 16 Assignments**. Wer Overflow fuer ein Symptom von Unwucht haelt, sieht hier das
  Gegenbeispiel.
- **Der Puffer kostet, was er rettet.** Neben den verworfenen Token steht, wie viele der
  `E·capacity` Plaetze leer mitbewegt werden — bei c = 2 sind das 16 von 32.
- **Expertlast ist nicht Geraetelast.** Dieselben Expertlasten, zwei Zuordnungen: blockweise
  `10 · 6 → max 10`, reihum `9 · 7 → max 9`. Die Lastzahl je Expert aendert sich nicht, nur wer
  auf demselben Link zusammenfaellt. Das ist die Antwort auf die Transferfrage, gerechnet.

### Die Invariante hat drei Faelle, nicht zwei

Die naheliegende Formulierung — „ausgeglichen heisst gleicher Straggler, unausgeglichen heisst
verschiedener" — ist **falsch**, und der erste Guardentwurf haette sie zertifiziert. Gemessen
ueber alle 60 Zustaende:

| | Zustaende |
| --- | --- |
| ausgeglichen, Zuordnung **kann** den Straggler nicht bewegen | 10 |
| unausgeglichen, Zuordnung bewegt ihn | 15 |
| unausgeglichen, Zuordnung bewegt ihn **nicht** | **5** |

Die fuenf Ausnahmen sind kein Rauschen: es sind genau die Zustaende, in denen **ein einziger
Expert alle 16 Assignments haelt** — sein Geraet ist der Straggler, wo immer man ihn hinlegt. Der
Guard fordert diese Charakterisierung, statt die Ausnahmen zu dulden, und die Buehne erklaert den
Fall dem Leser in eigenen Worten ([[cs336-mutation-test-blind-spots]]: die Grenze eines Modells
gehoert in den Guard geschrieben).

## Zwei Fehler, die erst der Mutationstest bzw. der Probelauf zeigte

**1. Das `ceil` der Karte rundete nirgends.** Die Mutation `ceil → floor` war **inert**. Der Grund
ist gemessen, nicht vermutet: `c·T·k/E` ist bei T=8 und E=4 gleich `2ck`, und jeder angebotene
Faktor war ein Vielfaches von 0,5 — **alle acht erreichbaren Capacities waren ganze Zahlen.** Ein
Leser konnte nie sehen, dass Capacity aufrundet. Behoben durch **c = 1,25** — Switch Transformers
eigenen Default —, der bei k=1 auf `ceil(2,5) = 3` fuehrt. Der Guard fordert jetzt, dass
mindestens ein Zustand rundet *und* dass er nach oben rundet.

**2. Zwei gleiche Zahlen druckten sich verschieden.** Im schiefen Routing sind `P_2` und `P_3`
beide exakt 7/32 — aber sie entstehen aus verschieden geordneten Summen, und eine davon landet auf
`0,21874999999999997`. Untereinander in derselben Spalte las der Leser **0,2187 und 0,2188**. Das
war im Probelauf sichtbar, nicht in irgendeiner Kennzahl. `moeNumber` schnappt jetzt auf 1e-12,
und der Guard ist **auf das Paar gerichtet, das wirklich auseinanderlaeuft** — er fordert zuerst,
dass ein solches Paar existiert, und zusaetzlich, dass ein blankes `fixedNum` es noch immer
verschieden druckt. Sonst bewacht er nichts ([[cs336-mutation-test-blind-spots]]).

## Ein Badge, das nie erscheinen konnte

Beim Kartieren fiel ein eigenstaendiger Fehler auf: `labHasObjectiveCheck` las nur
`OBJECTIVE_LAB_IDS`, waehrend `moe-routing` und `scaling-transfer` ihren Kurzcheck ueber
`LAB_OBJECTIVES` beziehen. Beide Labs **setzten `user.labChecks[id]` beim Bestehen, konnten aber
nie „✓ objektiver Kurzcheck bestanden" anzeigen** — die Lab-Karte nannte sie „gefuehrtes
Experiment". Ausgerechnet die zwei Labs, die nichts *als* ein Kurzcheck waren. Das Praedikat liest
jetzt beide Listen; das repariert `scaling-transfer` mit.

## Pruefung

- **Guard-Suite 65 Bloecke gruen** (vorher 64), Exit 0. Neuer Block `moe-routing`, **1444 Checks**:
  jede Zuteilung als explizite Liste neu gebaut statt aus dem laufenden Sitzplatzzaehler, `kept`
  ueber `min()` statt ueber den Zaehler geschlossen, und jedes `P_e` **aus der Routing-Spezifikation
  statt aus der gerenderten Tabelle** gelesen — eine falsche Tabelle kann so nicht mit sich selbst
  uebereinstimmen. Alle 60 Zustaende.
- **Der Balance-Loss ist in beiden Richtungen gehalten**: exakt α bei ausgeglichenem Routing fuer
  beide k, strikt darueber fuer jedes andere Routing, und in **keinem** der 60 Zustaende darunter.
- **Render-Sweep 1350 Renders ueber 63 von 64 Labs** (vorher 1314 / 62), `LR_NO_STAGE` von 2 auf
  **1**. 179 von 245 Controls bewegen ihr Lab nachweislich — alle vier neuen Regler sind darunter.
- **Mutationstest: 20 Mutationen, 20 gefangen, 0 entkommen, 0 inert.** Kontrolle vor und nach jedem
  Lauf gruen. Jeder Fang traegt den Namen des neuen Blocks, gemessen auf der schlanken Harness
  ([[cs336-guard-suite-slim-harness]]): **0,24 s statt 70 s**. Der Lauf hatte einen Zwischenstand
  mit 1 inerter Mutation; sie ist nicht weggeredet, sondern als Inhaltsluecke behoben worden (c =
  1,25, siehe oben).
- **120 Renders (60 Zustaende x DE/EN)**: 0 Platzhalter, 0 `undefined`, 0 negative Nullen, 0
  deutsche Punkt-Dezimalzahlen, 0 englische Komma-Dezimalzahlen, 0 deutsche Rueckstaende im
  englischen Render.
- **Cache-Bump auf v93** (4 Stellen), weil `index.html` und `i18n-en.js` beide angefasst sind.
- **Kein Browsertest** — in geplanten Laeufen gesperrt ([[cs336-unattended-no-preview]]). Ersatz
  ist der headless Probelauf oben, in DE und EN.

### Ein Guard, der im falschen Block stand

Der moeNumber-Guard wurde zuerst an einen Ankerkommentar gehaengt, den der
`policy-loss-tracer`-Block **wortgleich** traegt — `String.replace` nimmt das erste Vorkommen, und
der Block landete mitten in fremdem Code. Die schlanke Harness enthaelt `policy-loss-tracer` nicht
und meldete trotzdem gruen; erst die volle Suite haette es gefunden. **Die Schlankfassung ist
schnell, aber sie ist kein Beleg dafuer, dass eine Aenderung dort gelandet ist, wo sie hingehoert**
— nach jeder Einfuegung per Anker gehoert die volle Suite dazwischen.

## Was offen bleibt

1. **Der Rueckweg im Akkordeon** (aus v108–v112 unveraendert): `formulaAccordion` bietet weiter nur
   „Vollstaendig oeffnen"; der Uebungsknopf steht nur auf der Detailseite.
2. **`embedding-params` haengt weiter an einem Fallback** und hat keine Lecture, die `V·D`
   herleitet (Lecture 3s Parameterbilanz oder A1 §7.2.1 waeren der Ort).
3. **`l13` hat keine eigenen Karten fuer Qualitaetsregeln.** Nachgesehen: die Gopher-Regeln sind
   inhaltlich abgedeckt (Lab `quality-threshold` rechnet alle vier aus A4 §2.6), aber `l13` traegt
   nur `cascade-yield` und `corpus-throughput` als Formelkarten. Der Hebel ist eine Karte im
   Tafelwerk, keine Inhaltsluecke — kleiner als v112 ihn notiert hat.
4. **Die Tausendergruppierung** bleibt der naechste Hebel derselben Art: ein deutscher Render, der
   `43200` statt `43.200` zeigt, faellt heute durch kein Netz. Der neue Block ist davon nicht
   betroffen (groesste gedruckte Zahl: 32), der Sweep erreicht jetzt 63 Labs; es fehlt weiter die
   Klassifikation der legitimen Ausnahmen, dieselbe Handarbeit je Satz wie in
   [[cs336-german-decimal-sweep]].
5. **`GERMAN_WORDS` ist blind fuer deutsche Substantive ohne Umlaut.** Unveraendert aus v112. Ein
   Abgleich der Panel-Textknoten gegen das `ui`-Woerterbuch waere die Pruefung, die sie alle findet.
6. **Ein Lab ohne gerechnete Buehne** bleibt: `scaling-transfer` ist ein Fragenformular und hat
   nichts, was es rechnen koennte. `LR_NO_STAGE` ist damit auf seinem Boden angekommen.
7. Der Browsertest steht seit v71 aus; beim naechsten beaufsichtigten Lauf fuer die in v110–v113
   angefassten Flaechen nachholen, 360 px, DE und EN.
8. `origin/main` steht auf `2ed21e7`; **v100 bis v113 sind ungepusht.**
