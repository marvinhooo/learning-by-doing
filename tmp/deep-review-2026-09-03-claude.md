# Deep Review v94 — 2026-09-03 — zwei Loader in einem Assignment, und die Konzeptseite beschrieb den falschen

Der zugewiesene Worktree stand wieder **nicht** auf dem Kettenkopf: `4067294` gegen `b056c10`
(v93) in `lucid-turing-e88a7f`. Sauberer Fast-Forward ([[cs336-parallel-codex-edits]]). Die
fremde Session war zuletzt am 02.09. um 10:54 aktiv und hat dort eine ungebundene Änderung an
`index.html` stehen; sie wurde nicht angefasst. Baseline vor jeder Änderung: **43 Guard-Blöcke
grün** (50 s).

## Die Gegenprobe, und wo sie hinführte

Die offenen Hebel aus v93 waren allesamt Guard-Arbeit. Also habe ich stattdessen die Frage
gemessen, die der Auftrag stellt — *kann ich die Assignments danach lösen?* —, und zwar über
alle 124 Handout-Probleme: welches Problem hat für seine entscheidenden Konzepte **kein**
Lab, das sie durchrechnet?

| Assignment | Probleme / Punkte | ohne Lab |
| --- | --- | --- |
| A1 | 38 / 109 | 0 |
| A2 | 27 / 137 | 0 |
| A3 | 2 / 55 | 0 |
| A4 | 13 / 71 | 1 (`mask_pii`, 3 P.) |
| A5 | 44 / 151 | 2 (`look_at_sft` 4 P., `sft` 6 P.) |

Das ist eine sehr gute Abdeckung — und trotzdem war die Zahl nur ein Verdacht
([[cs336-metric-is-a-suspicion]]). Zehn der dreizehn ungedeckten Punkte hängen am selben
Konzept `sft`, und daran hängt außerdem `a5:data_loading` (3 P.) und alles Nachgelagerte bis
DPO. Also habe ich nicht das Lab gebaut, sondern zuerst das Handout gelesen.

## Der Befund: das Handout verlangt etwas anderes als die Konzeptseite beschreibt

A5-Supplement §4.2.1, wörtlich: alle Dokumente werden zu **einem** Tokenstrom verkettet, mit
dem end-of-text-Token getrennt, in aufeinanderfolgende Blöcke der Länge m geschnitten, der
unvollständige Rest fällt weg. Die vorgeschriebene Schnittstelle:

> `def __getitem__(self, i)` … *returns a dictionary with `input_ids` and `labels`, both PyTorch
> tensors of shape `(seq_length,)`.*

Und der Trainingscode, den §4.2.2 vorgibt, ist `loss = F.cross_entropy(...)` über genau diese
beiden Tensoren. **Kein Maskenfeld. Keine blockdiagonale Maske.**

Die Konzeptseite `sft` beschrieb daneben das Lehrbuchrezept:

> „Antwortmaskierung (Target-Only Loss): Das Berechnen des Cross-Entropy-Losses ausschließlich
> über die Antwort-Tokens … Für einen 500-Token-Prompt und eine 100-Token-Antwort wird der
> Gradient nur über die 100 Antwort-Tokens akkumuliert."

und, im Begriff „Sequence Packing im SFT", die Bedingung, die der A5-Loader gerade nicht
erfüllt: „… mit Block-Diagonaler Attention-Maske … **ohne dass sich die Gespräche gegenseitig
beeinflussen**."

Beides stand nebeneinander in derselben Plattform, ohne eine Zahl dazu. Und die
Verwechslungsgefahr ist keine Spekulation, sondern eingebaut: **dasselbe Assignment enthält
beide Loader.** A5 §5 (RLVR) verlangt `tokenize_prompt_and_output` ausdrücklich *mit*
`response_mask` — die fünf Treffer von `response_mask` in der App gehören alle dorthin. Wer die
Konzeptseite liest und dann §4.2.1 implementiert, baut ein anderes Rezept als das, welches
`test_packed_sft_dataset` prüft.

## Das Lab `sft-packing`

Zwei Modi, beide exakte Ganzzahlarithmetik über drei Korpora, drei Templategrößen, drei
Sequenzlängen.

### Modus A — wohin der Loss ohne Maske zeigt

Das Beispiel, das die Konzeptseite selbst nennt, durch den Loader gerechnet, den A5 vorschreibt
(Template 32 Tokens):

| | Positionen | Anteil |
| --- | --- | --- |
| Template + Prompt | 532 | **84,0442 %** |
| Antwort + Endetoken | 101 | 15,9558 % |
| Verhältnis | | **5,2673 ×** |

Ein maskierter Loss liefe über 101 der 633 Positionen. Aber die Zahl ist **keine Konstante des
Verfahrens** — bei UltraChat-Längen sind es 41,1207 %, und über die drei Templategrößen bewegt
sie sich um höchstens 4,0582 Punkte, während die Korpora 42,9235 Punkte auseinanderliegen. Man
muss also nicht wissen, wie viele Tokens der eigene Tokenizer für das Alpaca-Template ausgibt.

Der zweite Teil des Modus ist strukturell und nicht numerisch: es gibt **kein Feld** für eine
Maske, und die Grenze, die eine Maske bräuchte, trägt im Strom **kein eigenes Zeichen** —
„### Response:" ist gewöhnlicher Text, das Endetoken trennt Dokumente und nicht Prompt von
Antwort. Die Antwortmaske ist in dieser Schnittstelle nicht implementierbar, ohne genau das zu
ändern, was der Test prüft.

### Modus B — was das Packen mit den Dokumenten macht

**Die Längenregel.** `__len__` ist `⌊(n − 1)/m⌋` und nicht `⌊n/m⌋`, weil die Labels eines Blocks
ein Token weiter reichen als seine Eingaben. Die beiden Regeln unterscheiden sich **genau dann,
wenn m die Zahl n teilt** — über 15.561 Paare brute-force nachgewiesen. Und deshalb fällt der
Fehler nicht auf:

- Das Beispiel, das das Handout selbst druckt (`token_ids [0 … 10]`, `seq_length 4`), gibt unter
  **beiden** Regeln zwei Blöcke zurück. Es kann die Frage nicht klären.
- Keine der **neun** Kombinationen aus Korpus und Sequenzlänge, die das Lab anbietet, trennt sie.
- Ein Schalter kürzt den Strom auf ein Vielfaches von m. Dann trennen **alle neun**.

Ein grüner Test auf beliebigen Daten sagt über diesen Fehler nichts. Er wartet auf den einen
Datensatz, dessen Länge zufällig aufgeht.

**Die drei Kontextklassen.** Jede Zielposition fällt in genau eine, und die drei sind disjunkt
und vollständig — liegt vor ihr im Block eine Dokumentgrenze, steht fremder Text in ihrem
Kontext; liegt keine vor ihr und begann ihr Dokument trotzdem vor dem Block, fehlt ihr der
eigene Anfang; sonst sieht sie ihr Dokument ganz. Acht Beispiele in UltraChat-Länge:

| m | fremdes Dokument im Kontext | ohne eigenen Anfang | sieht das eigene ganz |
| --- | --- | --- | --- |
| 64 | 4,9167 % | **92,4167 %** | 2,6667 % |
| 256 | 20,3993 % | 74,0451 % | 5,5556 % |
| 512 | **48,1771 %** | 40,7118 % | 11,1111 % |

Die ersten beiden Spalten tauschen gegeneinander, in jeder geprüften Einstellung mit mehr als
einem Dokument streng monoton. Die dritte bleibt klein, und das ist keine Einstellungssache:
ein Block beginnt genau dann sauber, wenn seine Grenze auf einen Dokumentanfang fällt — das
entscheidet die Summe der vorangehenden Dokumentlängen, nicht m. Im Acht-Dokumente-Korpus
erreicht sie in keiner der achtzehn Einstellungen mehr als **12,5000 %**.

Bei m = 512, der Länge, die A5 empfiehlt, sehen also **48,1771 %** der Trainingsziele ein
fremdes Gespräch in ihrem Kontext. Genau das, was die Konzeptseite ausgeschlossen hat.

### Eine Behauptung, die die Messung nicht überlebt hat

Der erste Entwurf des Kurzchecks fragte, welche der drei Klassen „in jeder Einstellung die
kleinste" sei. Die Auszählung über alle 54 Einstellungen sagte nein: im Ein-Dokument-Korpus bei
m = 512 sind es 100 % sauber, bei m = 64 ist die fremde Klasse mit 0 % die kleinste, und im
Sechs-Dokumente-Korpus bei m = 512 ist es die zweite. Die Frage steht jetzt auf der Aussage, die
hält — *wovon* es abhängt — und der Guard hält die Schranke von beiden Seiten, damit sie nicht
überzeichnet.

### Was das Lab nicht behauptet

- **Gezählt werden Zielpositionen, nicht Nats.** Ein Template, das in jedem Dokument identisch
  wiederkehrt, ist nach wenigen Schritten fast sicher vorhergesagt; sein Anteil an der
  Gradientenmasse fällt schneller als sein Anteil an den Positionen. Der Prompt ist damit nicht
  entschuldigt — er ist in jedem Dokument neu.
- **Die Tokenzahlen sind ein gesetztes Modell**, kein Messwert. Die Templatespalte zeigt, wie
  wenig das an der Aussage ändert ([[cs336-mutation-test-blind-spots]]: die Grenze eines Modells
  gehört in den Guard, und sie steht dort).
- **Das ist keine Kritik am Handout.** Genau so werden Sprachmodelle vortrainiert; die Kosten der
  Alternative nennt A5 zu Recht nicht. Die Aussage ist enger: wer die Konzeptseite liest und dann
  implementiert, baut das andere Rezept.

Die Konzeptseite sagt jetzt in beiden Sprachen, dass allein die Maske entscheidet und dass A5
§4.2.1 keine verlangt. Die alte Behauptung ist raus, und ein Guard hält beide Richtungen.

## Der zweite Guard, und was er im Bestand fand

`english numerals` (v85) prüft Zahlen — aber nur in Strings, die durch `tr()` laufen, also in der
Prosa des Renderers. Die **Inhaltspakete** sieht er nicht: Labkarten (`desc`, `mental`,
`symbols`, `transferAnswer`), Konzeptbegriffe, Formelantworten, Assignmentfelder. Das sind genau
die Stellen, an denen die Zahlen stehen, auf denen eine Behauptung ruht. Der Mutationstest
zeigte es unmittelbar: eine geänderte Zahl im englischen `transferAnswer` des neuen Labs blieb
grün.

`content numerals` schließt das über alle 840 numerischen übersetzten Inhaltsfelder. Drei
Entscheidungen im Vergleich, jede erzwungen von einem Fehlalarm:

1. **Trenner zwischen Ziffern werden entfernt**, bevor die Folgen gelesen werden — `3.000` gegen
   `3,000`, `0,5` gegen `0.5`. Sonst meldet jede Tausendergruppierung einen Unterschied.
2. **Verglichen werden Mengen, nicht Multimengen.** Eine Übersetzung, die eine Zahl einmal mehr
   wiederholt, ist kein Fehler. Ohne diese Änderung blieben 19 Fehlalarme stehen, mit ihr 9.
3. **Nur Folgen ab zwei Ziffern.** Eine einzelne Ziffer wird routinemäßig in einer Sprache
   ausgeschrieben („auf 0" gegen „zero out"); ein Wörterbuch für Zahlwörter ist kein Guard. Das
   ist dieselbe bewusste Grenze wie in v85 und v91.

So gemessen blieben **acht echte Divergenzen** — Stellen, an denen der englische Leser, und
Englisch ist die Standardsprache, andere Zahlen sieht als der deutsche:

| Stelle | was der englische Leser sah |
| --- | --- |
| `concepts.data-pipeline` | ein anderes Unicode-Beispiel (U+0065/U+0301 statt U+0061/U+0308) |
| `concepts.bloom-filters` (FPR) | die beiden Zwischenwerte 0,4966 und 0,5034 fehlten |
| `concepts.dedup` (LSH) | 0,1074 und 0,3211 fehlten — genau die, die `1e71662` deutsch ergänzt hatte |
| `concepts.benchmark-validity` | √(0,16/100) und √0,0016 fehlten |
| `concepts.kv-serving` | „die vollen 100 %" fehlte, ersetzt durch eine andere Aussage |
| `concepts.rlvr-systems` | FP8/BF16 fehlte |
| `concepts.bloom-filters` (kein False Negative) | „100 % true recall" stand nur englisch |
| `concepts.roofline` | „float32" stand nur englisch |
| `formulas.importance-resampling` | der ganze Schlusssatz mit den normalisierten Gewichten 0,2 und 0,8 fehlte |

Bemerkenswert ist das Muster: die englische Fassung **kürzt vorgerechnete Beispiele**. Genau die
Zwischenschritte, die die Plattform als ihr Prinzip ausgibt („setzt einen kleinen Zahlenfall
vollständig ein und rechnet ihn vor"), fielen in der Übersetzung weg. Alle neun sind repariert.

## Prüfung

- **Guard-Suite 43 → 45 Blöcke, grün.** Neu: `sft packing` (**16.177 Checks**) und
  `content numerals`.
- **Das Modell ist neu getippt**, nicht aus der App gelesen: Dokumentlängen, beide Längenregeln
  und die drei Kontextklassen stehen im Guard ein zweites Mal, die Klassen dort sogar über einen
  explizit aufgebauten Besitzer-Array statt über die Buchhaltung der App.
- **Beide Richtungen** ([[cs336-mutation-test-blind-spots]]): die Teilbarkeitsaussage wird in
  beide Richtungen geprüft (jedes trennende Paar ist ein Vielfaches, jedes Vielfache trennt), und
  die Zitatprüfung geht ebenfalls beidseitig — die Konzeptseite muss den Satz tragen, **und** das
  Zitat des Labs muss auf ihr stehen.
- **Der Render ist die Prüfung**: `render coverage` 8.617 → **9.589 Zustände über 14 Labs**
  (9.976 Checks), das neue Lab mit allen vier Eigenschaften von Tag eins; 15 Anker lesen die
  tragenden Zahlen als vollständiges Markup-Fragment zurück. `english render` dieselben 9.589
  Zustände ohne deutschen Rest. `panel i18n` 49 → 50 Panels, `renderer i18n` 1.831 → 1.901
  Strings.
- **Die Schranke wird von beiden Seiten gehalten**: der Guard schlägt fehl, wenn der
  Acht-Dokumente-Korpus über 12,5000 % kommt, **und** wenn er darunter bleibt — eine gedruckte
  Schranke, die nie erreicht wird, wäre eine Übertreibung.
- **Eine Division durch null ist ein Ergebnis, keine Panne**: ein gekürzter
  Ein-Dokument-Strom kann null vollständige Blöcke ergeben; der Renderer sagt das in Worten, und
  der Guard verlangt, dass mindestens eine Einstellung diesen Fall überhaupt auslöst.
- `node scripts/build-site.mjs` grün. Guard-Laufzeit 50 s → 71 s.

### Mutationstest: 24 echte Mutationen in drei Läufen, 0 entkommen

Jeder Lauf mit Kontrollmutation (nur ein Kommentar geändert — dreimal grün geblieben) und
Arbeitsbaum nach jedem Lauf per `git status` geprüft.

Runde 1 (20 Mutationen) fing 17 sofort: fehlendes Endetoken in der Dokumentlänge, die naive
Längenregel, ein aufrundender Trim, doppelt gezählte Klassen, nicht erkannte Dokumentgrenzen,
ein Select aus der falschen Konstante, ein vom Zitat abweichender Korpus, ein Kopfanteil ohne
Prozentzahl, vertauschte Klassenzeilen, eine falsche Spalte in der Trade-off-Tabelle, eine
wieder eingebaute Division durch null, ein Renderer, der in Modus B die Steuerung aus Modus A
liest, ein Lab am falschen Konzept, ein falscher Antwortschlüssel, ein fehlender englischer
Titel und ein verändertes Handout-Beispiel.

**Drei Entkommene, alle behandelt statt weggeschrieben:**

1. **Die Konzeptseiten-Prüfung suchte ein Wort statt einer Aussage.** „blockdiagonale" stand
   zweimal im Begriff, also überlebte eine Mutation, die eine der beiden Stellen entwertete. Der
   Guard verlangt jetzt drei Aussagen und verbietet eine vierte (die alte Behauptung), in beiden
   Sprachen. Runde 2 fängt alle drei Varianten.
2. **Eine geänderte Zahl im englischen `transferAnswer` blieb grün** — die Lücke, aus der
   `content numerals` wurde. Runde 2 prüft sie an drei Stellen nach (Labkarte, Konzeptbegriff,
   Formelantwort), alle gefangen.
3. **Die dritte war nachweislich inert.** Sie las eine Steuerung, ohne deren Wert je auszugeben
   (`${read("spSeq")?"":""}`) — eine Mutation, die den Render nicht bewegen *kann*, fängt keine
   Render-Eigenschaft. Ersetzt durch die nicht-inerte Fassung an derselben Stelle (Modus A druckt
   die Sequenzlänge wirklich); sie wird gefangen, mit passender Meldung.

Eine Mutation der Runde 1 (`m08b`, „das Lab zitiert etwas, das die Seite nicht sagt") wurde
zunächst von einem **unbeteiligten** Guard gefangen — eine Änderung nur der deutschen Seite
bricht den i18n-Eintrag. Nach [[cs336-guard-verification-lessons]] zählt das nicht als CAUGHT,
solange die Meldung nicht zur Mutation passt. Wiederholt mit konsistenter Änderung in beiden
Sprachen: `sft packing: the lab quotes "…", which the concept page does not say`.

## Was ich nicht gemacht habe

- **Kein Browsertest.** In geplanten Läufen ist `preview_start` gesperrt
  ([[cs336-unattended-no-preview]]). Ersatz ist das headless Rendern von 9.589 Zuständen über 14
  Labs in beiden Sprachen.
- **`a4:mask_pii` und `lm-objective` bleiben ohne Lab.** Beide sind kleiner als der gewählte
  Hebel; sie stehen unten.
- **Die 45 noch nicht render-fähigen Lab-Panels sind unverändert.** Das neue Lab ist von Tag eins
  dabei, die alten hält weiterhin nur `panel i18n`.
- **Der fremde Worktree wurde nicht angefasst**, obwohl er eine ungebundene Änderung trägt.

## Nächste Hebel

1. **`content numerals` hat einen Zwilling, den es noch nicht gibt.** Der Guard prüft, dass keine
   Zahl auf einer Seite fehlt — aber nicht, dass ein vorgerechnetes Beispiel in beiden Sprachen
   **gleich viele Schritte** zeigt. Genau das war der Mechanismus hinter fünf der acht Funde: die
   englische Fassung kürzt. Eine Prüfung auf gleiche Anzahl von Gleichheitszeichen oder
   Zwischenwerten je Beispiel wäre der nächste Schritt.
2. **`lm-objective` ist das letzte Selbststudium-Konzept ohne Lab** (offen seit v85). Es
   entscheidet kein Problem allein, aber es ist die Definition, auf der A1s Trainingsschleife
   ruht.
3. **`a4:mask_pii` (3 P.)** ist das letzte Problem außerhalb von A5 ohne rechnendes Lab.
4. **Die restlichen 45 Labs render-fähig machen** — `render coverage` erreicht 14 von 59.
5. **Der README-Versionsstand lief eine Version hinterher** (74 gegen sw.js v75); jetzt beide auf
   76, aber kein Guard hält das zusammen.
