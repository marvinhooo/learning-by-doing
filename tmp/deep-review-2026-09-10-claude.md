# Deep Review v106 — 2026-09-10 — die Abgabe war nie eine Zahl

Fortsetzung von [v105](deep-review-2026-09-09-claude.md). Der zugewiesene Worktree stand auf
**v99** (`2ed21e7`), der Kettenkopf auf **v105** (`a9d63be`, Branch
`claude/eloquent-shirley-4d30c2`) — Fast-Forward, kein Merge. Kein Codex aktiv (der
Kopf-Worktree zuletzt am 9. September geschrieben, Arbeitsbaum sauber). `origin/main` steht
weiter auf `2ed21e7`; **v100 bis v106 sind ungepusht**.

Auftrag unverändert: derselbe Wissensstand wie aus der Vorlesung, und die Assignments lösen
können.

## Die Wahl, und eine Korrektur an ihrer Zahl

v105 nannte `transformer-ledger` mit **8 Punkten** als nächsten Hebel. Nachgerechnet stimmt
das nur, wenn man beide Probleme zählt, die das Konzept berühren:

| Problem | Punkte | entscheidendes Konzept |
| --- | --- | --- |
| `a1:transformer_lm` | 3 | `transformer-block` — das hat sein eigenes Lab |
| `a1:transformer_accounting` | **5** | `transformer-ledger` — kein anderes Lab führt es |

Der ehrliche Wert ist also **5**, nicht 8, und er bleibt trotzdem der größte offene Posten:
`transformer_accounting` ist das größte schriftliche Problem in ganz A1.

## Der Befund

Die Kennzahl war nur der Verdacht. Der Beleg steht im Handout selbst — A1 §3.4 verlangt
**fünf** Abgaben, und keine davon ist eine einzelne Zahl:

- **(a)** Parameterzahl eines GPT-2-XL-förmigen Modells und ihr FP32-Speicher
- **(b)** die Liste der Matrixmultiplikationen samt Gesamtsumme bei `context_length` Token
- **(c)** welcher Teil des Modells am meisten FLOPs verlangt
- **(d)** dieselbe Rechnung für GPT-2 small, medium und large — ausdrücklich *„as a
  proportion of the total FLOPs"* — und wie sich diese Anteile mit der Modellgröße verschieben
- **(e)** GPT-2 XL bei `context_length` 16.384: wie ändert sich die Summe, wie die Anteile

Das Lab dazu stellte drei Auswahlfragen zu einem Spielzeugfall (V=1000, D=64, F=192, L=3,
T=32) und rechnete nichts. **Keine der vier GPT-2-Größen kam irgendwo in der App vor**, und
die Zahl 16.384 als Kontextlänge nirgends. Von fünf Abgaben war keine bedient.

## Was die Rechnung zeigt

Zwei Dinge, und beide sind das Gegenteil dessen, was man erwartet.

### A · Der quadratische Term wird mit der Modellgröße *unwichtiger*

Bei der Kontextlänge, die das Handout selbst vorgibt (T = 1024):

| Anteil am Forward Pass | small | medium | large | XL |
| --- | --- | --- | --- | --- |
| Projektionen 8LTD² | 19,8808 | 24,8332 | 27,3212 | **28,6238 %** |
| **Attention-Scores 4LT²D** | **13,2539** | 12,4166 | 10,9285 | **9,1596 %** |
| SwiGLU 6LTDF | 39,7616 | 50,0544 | 54,3009 | **57,5338 %** |
| **LM Head 2TDV** | **27,1037** | 12,6957 | 7,4494 | **4,6828 %** |

Dass der LM Head fällt, ist die erwartete Hälfte von (d): 2TDV wächst linear in D, die Blöcke
mit L·D². Die unerwartete Hälfte steht daneben — **auch die Attention-Scores fallen**, von
13,2539 auf 9,1596 %. Ihr Verhältnis zu den Projektionen ist

> 4LT²D / 8LTD² = **T/(2D)**

— L kürzt sich vollständig heraus, und bei festem T sinkt der Quotient mit jeder breiteren
Schicht. „Quadratisch" heißt quadratisch in der *Sequenzlänge*, nicht in der Modellgröße. Wer
das verwechselt, beantwortet (d) genau falsch herum.

Erst die zweite Achse dreht es um, und die Schwellen stehen sauber in Einheiten der Breite:

| Schwelle | Regel | small | medium | large | XL |
| --- | --- | --- | --- | --- | --- |
| Scores > Projektionen | T = 2D | 1.536 | 2.048 | 2.560 | 3.200 |
| Scores > SwiGLU | T = 1,5·F ≈ 4D | 3.072 | 4.128 | 5.088 | 6.432 |

Bei T = 16.384 tragen die Scores in XL deshalb **61,7344 %** statt 9,1596 %, der LM Head nur
noch 1,9726 % — und die Summe wächst um Faktor **37,9831**, obwohl T nur um Faktor 16 wächst.
Das ist (e), vollständig.

### B · Die Abkürzung, die genau dort stimmt, wo man sie prüft

„Forward-FLOPs ≈ 2 · Parameter · Token" macht **drei** Fehler gleichzeitig:

| Posten | Größe | Richtung |
| --- | --- | --- |
| Eingabe-Embedding als Matmul gezählt | 2TVD | zu viel |
| RMSNorm-Gains als Matmul gezählt | 2TD(2L+1) | zu viel |
| Attention-Scores fehlen ganz | 4LT²D | zu wenig |

Zwei zählen zu viel, einer zu wenig, und ihre Nullstelle ist

> **T\* = (V + 2L + 1)/(2L)**

— eine Kontextlänge, in der **keine Modellbreite vorkommt**. Sie hängt allein an Vokabular und
Tiefe, und sie wandert nach *links*, wenn das Modell tiefer wird, während beide
Architekturschwellen oben nach rechts wandern.

| | small | medium | large | XL |
| --- | --- | --- | --- | --- |
| T\* | 2.095,0833 | **1.048,0417** | 699,0278 | 524,5208 |
| 2·P·T / wahr bei T = 1024 | 1,1386 | **1,0029** | 0,9653 | 0,9553 |
| dasselbe bei T = 16.384 | 0,3811 | 0,3504 | 0,3658 | **0,4024** |

GPT-2 mediums T\* liegt **2,3468 % neben der Kontextlänge, die das Handout selbst vorgibt**.
Dort liest die Abkürzung auf **0,2915 %** genau — in genau der Zelle, in der ein Lernender sie
am ehesten gegenprüft. Bei XL und 16.384 liest dieselbe Abkürzung 0,4024 des wahren Werts,
also weniger als die Hälfte. Nichts an medium macht die Abkürzung richtig; drei Fehler heben
sich dort zufällig auf.

Und selbst repariert wird sie nicht exakt: zieht man das Eingabe-Embedding ab *und* addiert
4LT²D, bleibt genau 2TD(2L+1) übrig — die Norm-Gains, die nichts multiplizieren. Bei XL und
T = 1024 sind das 317.849.600 von 3.516.769.894.400 FLOPs, also 0,0090 %.

### Was A1 daneben noch mitliefert, ohne es zu sagen

`num_heads` steht in allen vier Konfigurationen des Handouts — und kommt in **keiner** der
beiden Formeln vor. H Heads rechnen je 2T²·(D/H), zusammen 2T²D, unabhängig von H; und die
vier Projektionsmatrizen sind 4D² groß, egal wie man sie aufteilt. Bei allen vier GPT-2-Größen
ist d_head = D/H übrigens exakt 64.

d_ff nennt A1 nur für XL („the nearest multiple of 64 to 8/3 × 1,600" = 4.288). Für die
anderen drei muss dieselbe Regel selbst angewandt werden, und **genau eine** der vier Breiten
geht dabei ohne Rundung auf: 8/3 · 768 = 2.048.

Und die Antwort auf (a) ist nicht die Zahl, unter der GPT-2 XL sonst zitiert wird: unter A1s
Architektur (ungeteilte Embeddings, SwiGLU mit drei Matrizen) sind es **1.640.452.800**
Parameter und damit 6.561.811.200 Byte oder 6,1112 GiB in FP32.

## Was gebaut wurde

`transformer-ledger` verliert seinen reinen Auswahlfragen-Charakter und bekommt eine rechnende
Fläche in zwei Modi. Fünf Modelle (die vier GPT-2-Größen plus der bisherige Spielzeugfall) ×
fünf Kontextlängen (512 bis 16.384).

**Modus A — die Stückliste, für (a), (b) und (c).** Erst die Parameterzeilen, jede mit ihrer
Shape und ihrer Stückzahl (Eingabe-Embedding, 4L Attention-Matrizen, 3L SwiGLU-Matrizen,
2L+1 Norm-Gains, LM Head), darunter die Summe und der Speicher in drei Lesarten (FP32, BF16,
FP32 plus AdamW-Zustand). Dann die vier FLOP-Zeilen, jede mit dem Shape-Tripel der
Matrixmultiplikation, ihrem Term und ihrem Anteil. Zuletzt die Abkürzung in drei Stufen — mit
allen Parametern, ohne die Eingabe-Embeddingmatrix, und zusätzlich mit dem Attention-Term —
und darunter die drei Fehlerposten einzeln gegen die gemessene Differenz.

**Modus B — die Anteile, für (d) und (e).** Vier Modellgrößen nebeneinander bei der gewählten
Kontextlänge, darunter dasselbe Modell über fünf Kontextlängen mit dem Wachstumsfaktor gegen
T = 1024, darunter die drei Schwellen (T = 2D, T = 1,5·F, T\*) und die Abkürzung über alle
vier Größen mit ihrer Abweichung.

Drei neue Kurzcheckfragen, alle drei auf den Befund: welcher Posten von small zu XL am meisten
Anteil verliert, was der Anteil der Attention-Scores dabei tut, und warum 2·P·T ausgerechnet
bei medium und T = 1024 fast trifft.

**Konzeptseite `transformer-ledger`** in beiden Sprachen um ein `details`-Element, einen
Pitfall und eine Check-Frage samt Antwort erweitert. Sie beschrieb den Ledger vorher richtig —
inklusive des Wegkürzens von H — und nannte **keine einzige Zahl** über die Anteile, also über
genau das, was das Problem als Abgabe verlangt.

## Prüfung

- **Guard-Suite 57 → 58 Blöcke grün**, Build grün, Cache-Bump auf **v86** (4 Stellen),
  `LR_NO_STAGE` 5 → **4**, **`lab render sweep` 58 → 59 von 63 Labs**, `lab prose anchors`
  58 → **59 Karten**, `panel i18n` 57 → **58 Panels**. Laborzahl unverändert 63 — es kam kein
  Lab dazu, eines wurde rechnend.
- Neuer Block **`ledger shares`** (773 Checks) auf einem **anderen Rechenweg als die App**:
  der Forward Pass wird **Matrixmultiplikation für Matrixmultiplikation und Head für Head**
  durchlaufen, wo die App die geschlossene Form nimmt; das Parametertotal kommt aus einer
  **benannten Stückliste** (`block7.q_proj`, `block7.norm_ffn`, …), nicht aus den fünf
  gruppierten Zeilen; **jede Schwelle wird durch Abtasten von T gefunden**, mit beiden Seiten
  gehalten, statt aus der Algebra gelesen; und die Nullstelle der Abkürzung wird gesucht,
  nicht aus T\* ausgewertet.
- **Beide Richtungen jeder Behauptung.** Der Anteil der Attention-Scores muss über die vier
  Größen *fallen* und über die fünf Kontextlängen *steigen* — sonst wäre nur die halbe Aussage
  geprüft. Ebenso: H kürzt sich heraus, nachgewiesen durch **erneutes Durchlaufen des Passes
  mit jedem Teiler von d_model**, nicht durch Kürzen auf dem Papier. Und die beiden
  Architekturschwellen dürfen sich mit der Tiefe *nicht* bewegen, T\* dagegen muss sich mit
  der Tiefe bewegen und mit der Breite *nicht*.
- **Die Fehlerzerlegung wird als Behauptung geprüft**, nicht als Rechnung übernommen: die drei
  Posten müssen bei **jeder** Kombination aus Modell, Kontextlänge und Stufe exakt die
  gemessene Differenz ergeben, und jeder Posten wird einzeln aus seiner eigenen Definition
  neu gebildet. Ein vergessener vierter Posten würde hier auffallen.
- **Jede angezeigte Zelle ist an ihren Ausdruck gebunden.** Beide Modi werden gerendert und
  Anker für Anker gegen den hier neu gerechneten Wert gehalten — inklusive der Forderung, dass
  jede der drei Speicher-Lesarten und jede der drei Abkürzungsstufen eine *eigene* Zahl
  druckt, sonst wäre der Regler Dekoration.
- **Kein Browsertest** — in geplanten Läufen gesperrt ([[cs336-unattended-no-preview]]).
  Ersatz: alle Zustände beider Modi in beiden Sprachen headless gerendert und gelesen.
- **Mutationstest: 42 Mutationen, 42 gefangen, 0 entkommen, 0 inert.** Der erste Lauf
  (30 Mutationen) ließ **vier** entkommen, und alle vier waren echte Lücken:
  - **Die vier Konfigurationen waren an nichts gebunden.** GPT-2 large ließ sich auf 32 Layer
    umschreiben, ohne dass etwas anschlug — jede Zahl darunter wird ja aus L gerechnet und
    bleibt in sich stimmig. Jetzt sind alle vier Felder gegen die Tabelle des Handouts gepinnt,
    und die Beschriftung, die ein Leser sieht, gegen dieselben Zahlen.
  - **Der Kurzcheck konnte genau den Irrtum zertifizieren, den das Lab aufbricht.** Der
    Antwortschlüssel für Frage 2 ließ sich von „fällt" auf „steigt" drehen, ohne dass ein Guard
    das bemerkte — die App hätte einem Lernenden bestätigt, dass der Attention-Anteil mit der
    Modellgröße wächst. Jetzt wird der akzeptierte Dreier aus der Seite gelesen und jede der
    drei Antworten gegen die Rechnung gehalten (die größte Anteilsdifferenz wird *gesucht*,
    nicht benannt), und die Auflösung muss denselben Dreier vorbelegen.
  - **Geprüfte Zeilen, ungezählte Tabelle.** Der Spielzeugfall ließ sich in die Vier-Größen-
    Tabelle einschleusen: der Guard prüfte jede erwartete Zeile und war blind für eine, die
    nicht dort hingehört. Jetzt werden alle sechs Ankertypen gezählt, und die drei Schwellen
    müssen drei *verschiedene* Zahlen drucken.
  - **Ein Feld, das niemand liest, prüft niemand.** `tlShortcutFor` gab T\* als `exactAt`
    zurück, obwohl gerendert und geprüft nur `tlThresholds.exact` wird — dieselbe Konstante an
    zwei Stellen, eine davon tot. Sie wurde **entfernt statt abgesichert**; die verbliebene
    wurde danach mit zwei eigenen Mutationen gegengeprüft (Tiefe einmal statt zweimal gezählt,
    Norm-Gains aus der Nullstelle gestrichen — beide gefangen).
  - Zehn weitere Mutationen gegen genau die neuen Prüfungen: alle zehn gefangen. Kontrolle vor
    und nach jedem Lauf grün.

## Was offen bleibt

1. **Vier Labs ohne rechnende Fläche**, nach entschiedenen Punkten (v100-Regel: nur Konzepte,
   die kein zweites Lab führt): `rlvr-system-transfer` **2,5**, `policy-loss-tracer` **1**,
   `scaling-transfer` **0**, `moe-routing` **0**. Der nächste Hebel ist
   `rlvr-system-transfer` — und damit ist der Vorrat an *großen* Hebeln erschöpft: nach
   diesem Lauf hängt an keinem stagelosen Lab mehr als ein Bruchteil eines Problems.
2. Die drei Konzepte ohne Lab entscheiden weiterhin **null** Probleme.
3. `renderFormulaDetail` bleibt eine Sackgasse: 79 Formelkarten ohne Konzept- oder Labknopf.
   Das ist jetzt der größte verbliebene strukturelle Posten, nicht mehr ein einzelnes Lab.
4. `origin/main` steht auf `2ed21e7`; **v100 bis v106 sind ungepusht**.
