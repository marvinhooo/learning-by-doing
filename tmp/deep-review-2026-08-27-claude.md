# Deep Review 2026-08-27 — der Test, den A1 nennt, hat nie jemand laufen lassen (v85)

Basis `af5c73a` (v84). Der v84-Report schloss mit fünf offenen Hebeln. Der erste war
„die zwei neuen Guard-Klassen repo-weit ziehen", und zwar mit der Begründung, die zweite
sei „die unangenehmere: sie lässt eine falsche Zahl ausschließlich dem englischen Leser
zeigen". Englisch ist die Standardsprache, also klang das nach dem größten Hebel.

## Zuerst die Gegenprobe, und sie fiel anders aus als erwartet

Bevor ich den Guard gebaut habe, habe ich gemessen, ob es das Problem überhaupt gibt:
alle 375 numerischen `tr()`-Strings des Repos, deutsche gegen englische Zahlen.

**Ergebnis: eine einzige echte Abweichung.** Sechs weitere Treffer waren Artefakte meines
eigenen Tokenizers — das Komma in `[2,3,5,4]` und `max(1,2)` ist ein Listentrenner und kein
Dezimalzeichen. Die eine echte war eine deutsche Prosa­zeile, die eine Ledgerzeile als
„davon weggeworfener Anteil" zitierte, während der Schirm „davon weggeworfener Anteil des
48-Stunden-Laufs" rendert; das englische Zitat war vollständig.

Das ist wieder [[cs336-metric-is-a-suspicion]]: der vermutete Hebel war präventiv, nicht
kurativ. Er ist trotzdem gebaut (unten), aber er trägt den Lauf nicht. Also habe ich
weitergesucht — und die eigenen Guards des Repos zeigten, wo.

## Der Befund

Zwei Zeilen der Guardausgabe stehen direkt auf dem Ziel des Nutzers:

```
lecture outlook OK: 110 problems announced by a lecture, 113 of 124 approachable after Lecture 17
assignment self-study OK: 5 concepts no lecture teaches
```

**Elf der 124 Probleme werden nie erreichbar, wenn man den Lecture-Pfad geht — und neun
davon stehen in A1**, dem ersten Assignment. Sie hängen an fünf Konzepten, die keine der
siebzehn Lectures führt: `causal-mask`, `cross-entropy`, `adamw`, `clipping`, `sampling`.

Die App verschweigt das nicht — die Assignment-Seite hat einen eigenen Abschnitt dafür.
Aber ein Konzept davon war anders als die übrigen:

| Selbststudium-Konzept | entscheidet | Lab, das es durchrechnet |
| --- | --- | --- |
| adamw | 3 A1-Probleme | `optimizer` |
| clipping | 1 | `loss-and-clip` |
| cross-entropy | 2 | `loss-and-clip` |
| sampling | 3 | `decode-sampling` |
| **causal-mask** | **`scaled_dot_product_attention`, `multihead_self_attention`** | **keines** |

`causal-mask` entscheidet die beiden größten Implementierungsprobleme von A1, wird von
keiner Lecture gelehrt — und war das einzige der fünf ohne Lab. Seine Konzeptseite zählt
vier falsche Implementierungen auf, jede mit einer Folgenbehauptung in Prosa („der
Trainings-Loss wird durch Leakage bedeutungslos gut", „kann NaN liefern"). Gerechnet hat
keine davon irgendetwas.

Und A1s eigene Mission `attention-lm` nennt sogar den Test: *„Erste Spur: Teste kausale
Invarianz – eine Änderung an einem zukünftigen Token darf frühere Logits nicht verändern."*
Gegenprobe in HEAD: `kausale Invarianz` 1 Treffer (dieser Satz), `nach Softmax maskiert`
0 Treffer. **Die App nennt den Test und hat ihn nie ausgeführt.**

## Das Lab: `causal-invariance`

Fünf Implementierungen — die vier Fehlerbilder der Konzeptseite, wobei das dritte in seinen
beiden Ausprägungen dasteht — gegen drei Tests. Das Modell ist klein genug, dass jede Zahl
von Hand nachrechenbar ist: die Values sind One-Hot-Vektoren, also *ist* das Logit eines
Tokens die Aufmerksamkeitsmasse auf Positionen mit diesem Token.

**Modus A — welcher Test welchen Fehler findet.** Bei T = 6, p = 5:

| Variante | Zeilensumme = 1 | alles endlich | kausale Invarianz | mittlerer Loss |
| --- | --- | --- | --- | --- |
| korrekt · j ≤ i | ✓ | ✓ | ✓ | **3,307207** |
| Dreieck umgedreht · j ≥ i | ✓ | ✓ | **✗** | 1,492323 |
| nach Softmax maskiert | **✗** | ✓ | **✓** | 2,121400 |
| j < i mit −∞ | ✓ | **✗** | — | NaN |
| j < i mit −1e9 | ✓ | ✓ | **✗** | 2,781284 |

Der Test, den A1 nennt, findet **eine** der vier. Die beiden, die er durchlässt, sind die
interessanten:

- **„Nach Softmax maskiert" ist vollkommen kausal.** Der Fehler sitzt im Nenner, nicht in
  der Richtung. Nur die Zeilensumme sieht ihn — sie weicht um 0,746 von 1 ab.
- **Die vergessene Diagonale mit endlichem Platzhalter besteht beide Strukturtests.** Sie
  fällt nur auf, wenn der Test *alle* früheren Positionen prüft.

**Warum die leise Variante leise ist — hergeleitet, nicht beobachtet.** softmax(x + c) =
softmax(x). Eine vollständig maskierte Zeile bekommt überall denselben Summanden −1e9, also
gibt Softmax **exakt die unmaskierte Verteilung** zurück. Gemessen: Zeile 0 unter −1e9 und
dieselbe Zeile ganz ohne Maske unterscheiden sich um 1,43e-8 — reines Gleitkommarauschen.
Zeile 0 liest damit die ganze Sequenz einschließlich der Zukunft, jede andere Zeile sieht
korrekt aus. Mit −∞ wäre dieselbe Zeile NaN gewesen. **Die laute Variante ist die bessere.**

**Und deshalb hängt der Befund daran, wie man den Test liest.** Kaputt ist allein Zeile 0:

| geändertes Token an p | alle früheren j < p | nur p − 1 |
| --- | --- | --- |
| p = 1 | 1,34e-1 ✗ | 1,34e-1 ✗ |
| p = 2 | 1,35e-1 ✗ | **0,00e+0 ✓** |
| p = 3 | 1,33e-1 ✗ | **0,00e+0 ✓** |
| p = 4 | 1,76e-1 ✗ | **0,00e+0 ✓** |
| p = 5 | 1,67e-1 ✗ | **0,00e+0 ✓** |

Wer „frühere Logits" als „das Logit davor" liest, sieht den Fehler ab p = 2 nie wieder.
Über alle drei Längen: **12 von 15 Sondenpositionen sind für die enge Lesart blind.** Dieser
Unterschied wird in A1s Formulierung nirgends ausgesprochen.

**Modus B — was jeder Fehler den Loss kostet.** Hier steht die Zahl, die die Konzeptseite
behauptet und nie gerechnet hat, und sie ist schlimmer als das Wort „Leakage" andeutet:

**Die korrekte Maske hat den höchsten Loss aller fünf Varianten — bei jeder Sequenzlänge
von 4 bis 8.** Drei der vier kaputten sehen besser aus, die vierte hat gar keinen Loss.
Es gibt keine einzige Zeile, in der ein Fehler durch einen schlechteren Loss auffällt.

Der Mechanismus liegt offen: das umgedrehte Dreieck legt Masse direkt auf Position i + 1 —
das Token, das vorhergesagt werden soll. Der Loss fällt, weil die Antwort im Input steht
(Faktor 2,2161). „Nach Softmax maskiert" gewinnt anders: die verlorene Masse macht die
Verteilung flacher, und Hedging zahlt sich dort aus, wo die korrekte Maske ein noch nie
gesehenes Token mit fast null Masse bestrafen muss.

Für A1 heißt das: **die Lernkurve, die das Handout verlangt, ordnet eine frische
Implementierung falsch.** Was sie ordnet, sind die Struktureigenschaften daneben.

## Was ehrlich im Lab steht

- **Das Modell ist untrainiert.** Die Rangfolge gilt für den Anfang des Trainings, nicht
  für den Endzustand — ein fertig trainiertes Modell mit korrekter Maske schlägt ein
  leckendes selbstverständlich, sobald es generieren soll, weil es die Zukunft dann nicht
  gibt. Die Aussage, die bleibt: im Moment des Vergleichs zweier frischer Implementierungen
  ordnet der Loss sie falsch.
- **Die −∞-Variante bekommt kein Urteil, keinen Pass.** Ein NaN-Modell kann man nicht
  sondieren; das als Bestehen zu verbuchen wäre die schlimmere Lüge. Ein Guard hält es.
- **Der Logit-Massen-Aufbau ist eine Vereinfachung** (gebundene One-Hots statt gelernter
  Ausgabematrix) — das verschiebt die Zahlen, nicht den Weg des Zukunftstokens ins Logit.

## Der zweite Hebel: der Übungsschritt für Konzepte ohne Lecture

Die Methode auf der Startseite sagt in Schritt 2: „Das Lab der Lecture machen. Hier trennt
sich ‚gelesen' von ‚kann ich'." Für die fünf Konzepte, die *keine* Lecture liefert, fiel
genau dieser Schritt weg — der Abschnitt verlinkte nur die Konzeptseite, obwohl es für vier
von ihnen längst ein Lab gab. Jetzt steht das Lab darunter. Mit `causal-invariance` sind es
**fünf von sechs**; `lm-objective` hat bewusst keines, und ein Guard hält diesen Zustand
fest, damit er eine Entscheidung bleibt.

## Prüfung

- **Neuer Guard-Block `causal-invariance`: 5.089 Werte.** Maske, Softmax, Attention und
  Loss sind aus den Definitionen **neu getippt** statt aus der App gelesen; jede Zelle der
  Abdeckungsmatrix wird namentlich behauptet.
- **`render coverage` 6.757 → 7.657 Zustände über 12 Labs**, 7.958 Prüfungen — das neue Lab
  hat alle vier Eigenschaften von Tag eins.
- **`english render` 7.657 Zustände**, 0 deutsche Fragmente, 0 uninterpolierte Platzhalter.
  `panel i18n` 47 → 48 Panels, `renderer i18n` 1.750 → 1.810 Strings.
- **Beide Sprachen headless über alle 420 Zustände gerendert**, 0 Auffälligkeiten;
  Dezimaltrennzeichen geprüft (`3,307207` gegen `3.307207`).
- **Mutationstest: 19 Mutationen, 1 entkommen** — siehe unten. Nach dessen Behandlung
  bleiben 0 unerklärt.
- `node --check` auf Inline-Script, `i18n-en.js` und `check-i18n.mjs`; **612 DOM-IDs,
  0 Duplikate**. Guard-Laufzeit 34 s → 41 s.

### Ein Fehlversuch, der im Protokoll bleibt

Der erste Mutationslauf meldete „0 entkommen" und war **ungültig**. Zwei Ursachen fielen
zusammen: ein vorher abgebrochener Vordergrundlauf hatte eine Mutation im Arbeitsbaum
stehen lassen, und ich hatte während des Laufs eine Prosazeile geändert, sodass 15 von 19
Mutationen von einer *unbeteiligten* `renderer i18n`-Meldung „gefangen" wurden. Der Lauf
wurde nach Reparatur und Baseline-Prüfung wiederholt; erst dieser zweite zählt. Lehre:
ein Mutationsrunner, der eine Momentaufnahme zurückschreibt, verträgt keine gleichzeitigen
Edits — und ein „CAUGHT" ist erst dann eines, wenn die Fehlermeldung zur Mutation passt.

### Die eine echte Entkommene

`m06` lockerte die Invarianzschwelle von 1e-9 auf 1e-3, und nichts bewegte sich. Das ist
keine fehlende Prüfung, sondern eine Eigenschaft der Arithmetik — und nach
[[cs336-mutation-test-blind-spots]] ist eine inerte Mutation erst geklärt, wenn ihr Grund
gemessen ist. Gemessen: **jede bestandene Sonde liest exakt 0**, nicht „fast 0", weil
Maskieren exakt ist; die kleinste echte Verletzung liegt bei **0,1029**. Zwischen beiden
liegen mehr als acht Größenordnungen. Der Guard hält jetzt genau das (alle Passes exakt 0,
kleinste Verletzung > 1e-3), womit die Konstante nachweislich keine Stellschraube ist.
Der Text des Labs sagt das nun ebenfalls — statt der vorherigen Hedge-Formulierung.

## Der repo-weite Guard, doch gebaut

`english numerals`: **372 übersetzte Strings mit Zahlen, 1.293 Ziffernfolgen** beidseitig
identisch. Statt Dezimaltrennzeichen zu raten, vergleicht er *Ziffernfolgen ohne Trenner* —
ein Locale-Wechsel lässt die unverändert, eine erfundene oder verlorene Zahl nicht. Damit
fallen alle sechs Tokenizer-Artefakte weg, ohne die Empfindlichkeit zu verlieren.
Gegenprobe: `48` → `96` in einem rein englischen Eintrag wird gefangen. Blind bleibt er für
genau eine Klasse (dieselben Ziffern anders gruppiert, `1,23` gegen `12,3`) — deshalb tragen
die Zahlen, auf denen eine Behauptung ruht, weiterhin eigene Render-Anker.

## Was ich nicht gemacht habe

- **Kein Browsertest.** Nach [[cs336-unattended-no-preview]] ist `preview_start` in
  geplanten Läufen gesperrt; Ersatz ist das headless Rendern beider Sprachen, oben.
- **`causal-mask` bleibt Selbststudium.** Kein Lecture-PDF lehrt es, also darf keine
  Lecture-Seite das Lab führen — ein Guard hält das, wie für die anderen fünf.
- **Die restlichen zehn nicht erreichbaren Probleme** sind unverändert: sie hängen an
  `cross-entropy`, `adamw`, `clipping`, `sampling`, die alle bereits Labs haben. Der
  fehlende Schritt dort war der Link, nicht der Inhalt — und der steht jetzt.

## Nächste Hebel

1. **`lm-objective` hat als einziges Selbststudium-Konzept kein Lab.** Es entscheidet kein
   Problem allein, deshalb steht es hinten — aber es ist die Definition, auf der A1s
   gesamte Trainingsschleife ruht.
2. **Die restlichen Labs render-fähig machen** (offen seit v82): `english render` erreicht
   12 von 57; die anderen 45 Panels hält weiterhin nur `panel i18n`.
3. **Attribute in denselben Panels** (`aria-label`, `title`, `placeholder`) — offen seit v81.
4. **Gruppierung vereinheitlichen** (offen seit v79).
5. **Sechs unerreichbare Defaults** in den Lab-Helfern (offen seit v79).
