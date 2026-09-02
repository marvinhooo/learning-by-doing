# Deep Review v91 — 2026-09-02 — die Voraussetzung, die auf einen Link zeigte, den es nicht gab

Der zugewiesene Worktree stand wieder **nicht** auf dem Kettenkopf: `4067294` (Antigravitys
Begriffslisten) gegen `276dcb9` (v90) in `festive-kalam-e08d8c`. Sauberer Fast-Forward
([[cs336-parallel-codex-edits]]). Keine fremde Session aktiv: `index.html` im Kettenkopf-Worktree
zuletzt am 01.09. um 08:06 angefasst, der Lauf begann am 02.09. um 07:11. Baseline vor jeder
Änderung: **38 Guard-Blöcke grün.**

## Zwei Gegenproben, bevor irgendetwas gebaut wurde

**Die zweite Kennzahl war keine Lücke.** Die vier reinen Rechenaufgaben aus A2 §8 —
`data_parallel_calcs` (3 P.), `fsdp_calcs` (3), `tp_calcs` (4), `fsdp_tp_calcs` (6), zusammen
**16 Punkte bei null GPU-Stunden** — sahen nach der nächsten „Zahl, die niemand vorrechnet" aus.
Trefferzählung nach den Bezeichnern der Rechnung ([[cs336-metric-is-a-suspicion]]): `comm-crossover`
13, „Egress" 46, `N_TP`/`N_FSDP` je 6. Das Lab rechnet alle vier vollständig, inklusive der
2D-Schranke als **Produkt** der beiden Einzelschranken bei überlappenden Achsen und des
**Viertels** davon, wenn sie sich eine Leitung teilen. Kein Loch.

**Die erste war eine — und zwar eine schärfere, als die Zählung vermuten ließ.** v90 notierte als
offenen Hebel: „die 18 `ASSIGNMENT_PREREQUISITE_GUIDES` tragen als einzige Vorwissensfläche keinen
Konzeptlink." Die Gegenprobe löste den Verdacht nicht auf, sie verschärfte ihn: **die Seite
verspricht den Link im eigenen Fließtext.**

> „Diese Erklärungen kommen vor den ursprünglichen Aufgabennamen und Formeln.
> **Öffne ein verknüpftes Konzept nur, wenn du mehr Details brauchst.**"

`assignmentPrerequisitesMarkup` rendert darunter einen `<div class="compact-row-main">` ohne ein
einziges `data-open-concept`. Das ist also keine Fläche ohne Link, sondern eine Fläche, die auf
einen Link zeigt, den es nicht gibt — **18 von 18 Karten**, während **45 von 45** auf der
Lecture-Seite ihn tragen. Wer die Idee nicht schon kann, liest 60 Wörter und ist am Ende des Wegs.

## Was gebaut wurde: 39 Konzeptlinks und ein Ortsschild

Jede der 18 Karten nennt zwei bis vier Ideen. Sie bekommen jetzt in genau dieser Reihenfolge ihre
Konzeptknöpfe — 39 Links auf 33 verschiedene Konzeptseiten:

| Karte | öffnet |
| --- | --- |
| A1 · Text, Bytes und Dateien | `python-engineering` · `unicode` |
| A1 · Tensoren und PyTorch-Zustand | `shapes` · `pytorch-tensors` · `pytorch-state` |
| A1 · Vier Rechenideen | `matmul` · `logs` · `gradients` |
| A2 · Datenfluss des A1-Modells | `embeddings` · `attention` · `transformer-block` |
| A2 · GPU-Zeit, Speicher und Arbeit | `gpu-model` · `roofline` · `profiling` |
| A2 · Zahlenformate & gespeicherte Aktivierungen | `pytorch-tensors` · `checkpointing` · `resource-accounting` |
| A2 · Prozesse und gemeinsame Kommunikation | `collectives` · `distributed-runtime` |
| A3 · Potenzgesetze und Log-Log-Diagramme | `power-laws` |
| A3 · Fit, Fehler und unabhängige Prüfung | `power-laws` · `scaling-optima` |
| A3 · Kosten zählen, Vergleiche fair halten | `resource-accounting` · `scaling-practice` |
| A4 · Dokumente schrittweise lesen | `data-pipeline` · `python-engineering` |
| A4 · Filterfehler zählen | `quality-filtering` · `filtering-mechanics` |
| A4 · Mengen, Hashes und Ähnlichkeit | `dedup` · `bloom-filters` |
| A4 · Parallelität ohne verlorene Herkunft | `data-pipeline` · `training-loop` |
| A5 · Durchschnitt, Streuung und Bedingung | `probability` |
| A5 · Antwortwahrscheinlichkeit und Sampling | `sampling` · `logs` |
| A5 · Masken und mehrere kleine Batches | `rlvr-systems` · `training-loop` |
| A5 · Mehrere Zufallsstarts | `probability` · `training-loop` |

**Kein Link ist geraten.** Jeder trägt ein Wort, das die Karte und die Konzeptseite wörtlich
teilen — `state_dict`, `All-Reduce`, `Speicherhierarchie`, `MinHash`, `Lograum`, `Kettenregel`,
`Residu`, `Unsicherheit`. Wo kein solcher Anker existierte, wurde **nicht verlinkt**: `a3[0]`
behält nur `power-laws`, weil die Karte „Log-Log-Diagramm" sagt und die `logs`-Seite von
Log-Sum-Exp handelt; „Holdout", „Confounder" und „Multiprocessing" haben in **keinem** der 75
Konzepte einen Treffer und bleiben deshalb allein in der Kartenprosa erklärt.

**Der zweite Teil ist das Ortsschild.** Jeder Knopf sagt, wo die Idee im Kurs zu Hause ist —
`Lecture 7`, `Modul 00` oder `Selbststudium`. Das ist die eigentliche Zeitersparnis: 31 der 39
Links zeigen auf ein Konzept, das eine Lecture wirklich lehrt (wer den Pfad gegangen ist, geht
daran vorbei), 7 auf den Prerequisite-Sprint und 1 auf ein Konzept, das **keine** Lecture
vorlegt (`sampling`). Die Dreiteilung ist keine neue Behauptung, sondern genau die, die der
Selbststudium-Abschnitt derselben Seite schon benutzt (Lecture-Konzepte, dann Modul 00, dann
keines von beiden), also kann eine Karte nicht behaupten, eine Lecture lehre etwas, das der Pfad
nie zeigt.

Der Einleitungssatz sagt jetzt in beiden Sprachen zusätzlich, was das Schild bedeutet.

## Prüfung

* **Guard-Suite 38 → 39 Blöcke, grün** (46 s). Neu: `assignment prerequisites`, **298 Checks**.
* **Beide Richtungen ausgeschrieben** ([[cs336-mutation-test-blind-spots]] Punkt 23): jeder Link
  der Tabelle existiert in der App in genau dieser Reihenfolge, **und** jede Karte der App steht
  in der Tabelle. Eine Karte ohne Konzept schlägt fehl.
* **Der Render ist die Prüfung** (Punkt 15): alle fünf Assignment-Seiten werden in beiden Sprachen
  DOM-frei gerendert, alle 78 Knöpfe als **vollständiges Markup-Fragment** zurückgelesen
  (Titel *und* Ortsschild), die Reihenfolge der `data-open-concept` gegen die Kartendaten geprüft,
  die Kartenzahl gegen `<article>`-Balance, `undefined`/`${` ausgeschlossen und im englischen
  Render kein Deutsch geduldet.
* **Der Kasten um die Knöpfe ist mitgeprüft**: ein Fragment-Vergleich ist blind für den Container,
  deshalb verlangt der Guard zusätzlich eine `accordion-actions`-Zeile pro Karte und jedes
  `data-open-concept` **darin**.
* **Das Ortsschild wird zweimal hergeleitet** und für **alle 75** Konzepte verglichen, nicht nur
  für die 33 verlinkten; und alle drei Zweige müssen unter den Links vorkommen, sonst wäre ein
  auf einen Zweig zusammengefallener Renderer weiter grün.
* **Zahlen und Shapes beidseitig** (Punkt 20): jede Ziffernfolge und jede geschriebene Shape
  (`[B,T,D]`) der deutschen Karte muss in der englischen wieder auftauchen. Diese Felder liegen
  inline als `{de,en}` und wurden bisher von **keinem** Guard auf Inhalt gelesen.
* **Die Deutscherkennung ist umlautfrei** — und das ist ein Befund: die a1-Karte zitiert „ä" als
  Beispiel für ein Zeichen, das zwei UTF-8-Bytes kostet, also ist ein englischer Text mit Umlaut
  hier *richtig*. Der Guard schneidet die Umlautklasse aus der geteilten Regex heraus, prüft
  vorher, dass sie noch dort steht, und beweist mit einem deutschen Kontrollrender, dass der Rest
  überhaupt noch Deutsch sieht.

### Mutationstest: 24 echte Mutationen, 0 entkommen

Fünf Läufe, jeder im Hintergrund ([[cs336-mutation-test-blind-spots]] Punkt 25), jeder mit
Kontrollmutation (nur ein Kommentar geändert — blieb fünfmal grün), Arbeitsbaum nach jedem Lauf
per `git status` und `git diff` nachweislich auf die zwei beabsichtigten Dateien zurückgesetzt.

| Mutation | gefangen von |
| --- | --- |
| a1[0] öffnet ein Konzept, das seine Begriffe nicht teilt | Tabellenvergleich |
| a1[1] verliert seine Links | Richtung zwei |
| eine Karte verlinkt dasselbe Konzept zweimal | Duplikatsprüfung |
| der Knopf lässt das Ortsschild weg | Knopf-Rückleser |
| der Knopf druckt die ID statt des Titels | Knopf-Rückleser |
| das Ortsschild kommt immer vom ersten Konzept der Karte | Knopf-Rückleser |
| die Links rendern in umgekehrter Reihenfolge | Reihenfolge-Rückleser |
| die Zusammenfassung wiederholt das Label | Kartentext-Anker |
| Modul 00 gewinnt gegen die Lecture | zweite Herleitung (`pytorch-tensors`) |
| Selbststudium wird als Sprint beschriftet | zweite Herleitung (`lm-objective`) |
| die Lecture-Nummer ist um eins verschoben | zweite Herleitung |
| die Seite verspricht den Link nicht mehr | Versprechensanker (DE) |
| der Abschnitt wird nicht mehr gerendert | Platzierungsanker |
| die Knöpfe fallen aus der Karte | Reihenfolge-Rückleser |
| die Knöpfe verlassen die Aktionszeile | `accordion-actions`-Zähler |
| der englische Render fällt auf das deutsche Ortsschild zurück | Knopf-Rückleser (EN) |
| der englische Render druckt das deutsche `explain` | Kartentext-Anker (EN) |
| der englische Render druckt das deutsche Label | Kartentext-Anker (EN) |
| die a2[1]-Karte nennt die Speicherhierarchie nicht mehr | Anker Karte↔Konzept |
| die a1[1]-Karte nennt Broadcasting nicht mehr | Anker Karte↔Konzept |
| die a4[2]-Karte nennt MinHash nicht mehr | Anker Karte↔Konzept |
| die Konzeptseite `scaling-optima` nennt Unsicherheit nicht mehr | Anker Karte↔Konzept |
| die englische a1[0]-Karte ändert einen Bytewert | Ziffernparität |
| die englische a1[1]-Karte ändert eine Shape | Shape-Parität |
| *Kontrolle (5×): nur ein Kommentar geändert* | *grün geblieben* |

**Drei Entkommene, alle behandelt statt weggeschrieben.**

1. **Die Knöpfe ließen sich aus der Aktionszeile herauslösen** — ein Vergleich des
   Knopf-Fragments ist blind für den Kasten darum. Der Guard zählt jetzt die Zeilen und verlangt
   jedes `data-open-concept` innerhalb einer.
2. **Eine geänderte Ziffer im englischen Kartentext blieb grün.** Diese inline-zweisprachigen
   Felder liest kein anderer Guard auf Inhalt. Jetzt gilt v84s Ziffernregel auch hier, erweitert
   um geschriebene Shapes, weil `[B,T,D]` → `[B,T,D,H]` keine Ziffer bewegt.
3. **Ein Synonymtausch im englischen `explain` bleibt ungefangen** — und das ist eine bewusste
   Grenze, keine Lücke: „An iterator **yields** values" gegen „**hands over** values" ist
   Übersetzungstreue, für die es im ganzen Repo keinen Prüfer gibt. Ersetzt wurde die Mutation
   durch die beobachtbare Variante an derselben Stelle (der englische Render druckt das deutsche
   Feld), und die wird gefangen. Aus demselben Grund bleibt „zwei Bytes"/„two bytes" außerhalb des
   Modells: ausgeschriebene Zahlen bräuchten ein Wörterbuch, keinen Guard — der Kommentar im
   Block sagt das ausdrücklich, wie schon bei der Tausendergruppierung.

## Was ich nicht gemacht habe

* **Kein Browsertest.** In geplanten Läufen ist `preview_start` gesperrt
  ([[cs336-unattended-no-preview]]). Ersatz ist der Render aller fünf Assignment-Seiten in beiden
  Sprachen ohne DOM, mit Tag-Balance, `undefined`/`${`-Scan und Deutschprüfung.
* **Kein Cache-Bump.** `index.html` wird network-first ausgeliefert, `i18n-en.js` ist unverändert.
* **Keine Labs an die Voraussetzungskarten gehängt.** Das gehört auf die Konzeptseite (siehe unten)
  und nicht dupliziert an 18 Karten.

## Nächste Hebel

1. **Neu und der größte: eine Konzeptseite bietet kein einziges Experiment an.** `data-open-lab`
   kommt im ganzen Markup **viermal** vor, und `renderConceptDetail` gehört zu keiner dieser
   Stellen — die 75 Konzeptseiten enden mit Selbstcheck und Formeln. Genau deshalb musste der
   Selbststudium-Abschnitt sich seinen eigenen „Üben"-Knopf über `SELF_STUDY_LABS` bauen (fünf
   handgepflegte Paare). Wer jetzt über eine Voraussetzungskarte, über den Grundlagencheck oder
   über den Selbststudium-Abschnitt auf einer Konzeptseite landet, liest — und die Methode auf der
   Startseite sagt in Schritt 2 ausdrücklich, dass hier „gelesen" von „kann ich" getrennt wird.
   `LABS` trägt kein `concepts`-Feld; das ist die Datenlücke, die zuerst zu schließen ist.
2. **Die Quellenangaben der vier Karten, die keine Lecture stützt** (offen aus v89/v90).
3. **Die restlichen Labs render-fähig machen** — `render coverage` erreicht 13 von 58.
4. **Attribut-i18n** (`aria-label`, `title`, `placeholder`) — offen seit v81.
5. **Tausendergruppierung vereinheitlichen** — offen seit v79.
6. **Sechs unerreichbare Defaults** in den Lab-Helfern — offen seit v79.
