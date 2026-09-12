# Deep Review v109 — 2026-09-12 — das Tafelwerk schwieg über den Anfang des Kurses

Fortsetzung von [v108](deep-review-2026-09-12-claude.md). Der zugewiesene Worktree stand auf
**v99** (`2ed21e7`), der Kettenkopf auf **v108** (`b2aa46a`, Branch
`claude/strange-elion-5573bc`) — neuer Branch `claude/deep-review-v109` von dort, kein Merge.
Kein Codex aktiv: der Kopf-Worktree ist sauber und zuletzt am 12. September 07:26 geschrieben,
der Haupt-Checkout trägt Zeitstempel aus dem Juli. `origin/main` steht weiter auf `2ed21e7`;
**v100 bis v109 sind ungepusht.**

Auftrag unverändert: derselbe Wissensstand wie aus der Vorlesung, und die Assignments lösen
können.

## Die Wahl, und die Vorprüfung

v108 hinterließ als Hebel 3 einen Verdacht statt eines Befundes: vier Labs (`bpe`,
`bpe-encode`, `data-pipeline`, `pipeline-yield`) blieben von jeder Formelkarte unerreichbar,
weil die Module `tokenization` und `data` `formulas:[]` führen — „zu prüfen wäre, ob das
Tafelwerk dort wirklich nichts zu sagen hat". Nach [[cs336-metric-is-a-suspicion]] ist eine
solche Zahl nie der Befund. Die Vorprüfung hat nach den Zahlen der Handouts gegriffen, nicht
nach ihren Wörtern.

**A1 §2.7, `tokenizer_experiments`, 4 Punkte.** Vier Teilfragen, und drei davon sind reine
Rechnungen: (a) „What is each tokenizer's compression ratio (bytes/token)?", (c) „Estimate the
throughput of your tokenizer (e.g., in bytes/second). How long would it take to tokenize the
Pile dataset (825GB of text)?", (d) „Why is uint16 an appropriate choice?"

**A4, `filter_data`, 6 Punkte.** „A written breakdown of what proportion of the discarded
examples are removed by each filter step" — und „How long does it take to filter the provided
WET files (originally 2,500 raw WET files)? How long would it take to filter the entire Common
Crawl dump?" Dazu `tokenize_data`, 2 Punkte: „How many tokens are in your filtered dataset?"

**Und Lecture 1 rechnet es selbst vor.** Der Trace definiert die Funktion wörtlich:

```
def get_compression_ratio(string: str, indices: list[int]) -> float:
    num_bytes = len(bytes(string, encoding="utf-8"))
    num_tokens = len(indices)
    return num_bytes / num_tokens
```

und hält für den Byte-Tokenizer `assert compression_ratio == 1` fest.

Damit war der Verdacht ein Befund, und ein größerer als gedacht: Es fehlte kein Weg, es fehlte
**Inhalt**. Die erste Lecture des Kurses und das Datenkapitel führten keine einzige Formelkarte,
obwohl **12 Aufgabenpunkte** genau an diesen Größen hängen — und obwohl die Kompressionsrate die
Brücke zwischen den beiden Einheiten ist, in denen der ganze Kurs zählt: Text in Bytes, Training
in Tokens.

| | vorher | nachher |
| --- | --- | --- |
| Formelkarten | 79 | **82** |
| Karten für `tokenization` / `data` | 0 | **3** |
| Labs von einer Formelkarte erreichbar | 59 von 63 | **63 von 63** |
| Kategorien im Tafelwerk | 21 | **22** (neu: Tokenisierung) |

## Was gebaut wurde

Drei Karten, jede an der Stelle, die sie herleitet:

- **`compression-ratio`** (Kategorie Tokenisierung, Quellen `l01`, `a1`) — `r = num_bytes /
  num_tokens`, rückwärts `num_tokens = num_bytes / r`, und die Folgerung für die Platte:
  `Dateigröße(uint16) / num_bytes = 2 / r`. Gerechnet an Lecture 1s eigenem String
  „Hello, 🌍! 你好!": 13 Zeichen, 20 UTF-8-Bytes, Byte-Tokenizer 1,0000 (die Zahl, die die
  Lecture per `assert` festhält), Character-Tokenizer 1,5385.
- **`corpus-throughput`** (Daten, `l13`/`a1`/`a4`) — `v = B_Probe / t_Probe`, `t = B_gesamt / v`,
  `t_parallel = t / w`. **Eine Karte für zwei Assignments:** dieselbe Rechnung beantwortet A1s
  Pile-Frage (825 GB, 9,549 Tage bei 1 MB/s) und A4s Frage nach dem vollständigen CC-Dump.
- **`cascade-yield`** (Daten, `l13`/`a4`) — `Y = ∏ᵢ yᵢ`, und die Zurechnung
  `entfernt_i = N · (∏_{j<i} y_j) · (1 − yᵢ)`, also genau die Aufschlüsselung, die A4 als
  Deliverable verlangt: 51,02 %, 38,27 %, 7,65 %, 3,06 %.

Verdrahtet über `CONCEPTS[].formulas` (`unicode`, `bpe`, `data-pipeline`, `tokenizer-tradeoffs`)
und die kuratierten Listen von `l01` und `l13`, sodass der in v108 gebaute Rückweg sie trägt.

## Was die Prüfung unterwegs erzwungen hat

Drei Fälle, in denen der Code recht hatte und die Absicht nicht:

1. **`embedding-params` wäre still vom Pfad gefallen.** Die Karte war bis dahin **nur** als
   Fallback-Primer auf Lecture 1s `tokenizer-tradeoffs`-Seite erreichbar — ein Zufall, den erst
   das Kuratieren sichtbar machte. Der naheliegende Ausweg (die Karte auf `l01` kuratieren)
   verlangt eine Quellenangabe `l01`, und Lecture 1 leitet `V · D` nirgends her; `embedding-params`
   steht bereits auf der Liste der **reparierten Falschzitate** (`l03`). Statt die Zusicherung zu
   schwächen, wurde der Bau geändert: `tokenizer-tradeoffs` behält `embedding-params` an erster
   Stelle, und die vierte geplante Karte (`token-storage`, uint16) wurde **fallen gelassen** und
   ihr Inhalt in `compression-ratio` gefaltet — wo er als Folgerung aus `r` ohnehin hingehört und
   wo das Lab ihn längst zusammen behandelt.
2. **Der eigene Text war an einer Stelle zu genau.** Die Musterlösung zu `corpus-throughput`
   behauptete „Faktor 625 in den Paaren". Der neue Guard rechnete nach: exakt sind es
   **631,0606**, das Quadrat ist nur die Asymptotik. Jetzt steht „rund Faktor 625" in der Karte,
   und der Guard misst die Güte der Rundung (< 1 %) und verlangt, dass der exakte Wert das
   Quadrat **übersteigt** — damit die Rundung nicht in die falsche Richtung verdeckt.
3. **Zwei Mutationen entkamen dem ersten Guard-Entwurf**, beide aus derselben Ursache: geprüft
   war das Vorkommen, nicht der Ort. „1.0000" steht im selben `pitfall` auch im Satz über den
   Byte-Tokenizer, und „60000" ist Teilstring des zwei Satzglieder vorher stehenden „600000".
   Beide Prüfungen sind jetzt an ihre Umgebung gebunden (`sieht 600000 und entfernt 300000`),
   und die **Ankunftsmengen** jeder Stufe werden zusätzlich geprüft — die hatte vorher nichts
   gelesen.

## Prüfung

- **Guard-Suite 60 → 61 Blöcke grün**, Cache-Bump auf **v89** (4 Stellen), README auf 82 Formeln.
- Neuer Block **`corpus arithmetic`** (4084 Checks). Er hält sechs Dinge:
  1. **Lecture 1s String wird im Prüfer neu kodiert**, nicht abgeschrieben: er kommt aus
     `CR_TEXTS` (was das Lab wirklich benutzt, [[cs336-guard-verification-lessons]]), und Bytes
     wie Codepoints werden dort gezählt. Dazu die beiden anderen Texte: 1,0000 auf ASCII,
     3,0000 auf Chinesisch.
  2. **Die uint16-Behauptung in beide Richtungen.** „Die Datei wächst genau dann, wenn r < 2"
     lässt sich an einem Beispiel nicht zeigen; der Block scannt **4000 Werte von r** über die
     Schwelle (1999 wachsen, 2000 schrumpfen, 1 trifft sie exakt) und bricht ab, wenn eine der
     drei Richtungen leer bleibt.
  3. **Die Kaskade wird Stufe für Stufe gelaufen**, wo die Karte das Produkt schließt; die
     Summe der Entfernungen muss exakt die Zahl der Verworfenen treffen, die Anteile 100 %.
  4. **Die Reihenfolge-Behauptung über alle 24 Permutationen** eines Korpus mit Mehrfachgründen
     — eine überlebende Menge, 8 verschiedene Zurechnungen. Der Block **bricht ab, wenn der
     Korpus keine Mehrfachüberdeckung hat**, sonst wäre der Nachweis inert
     ([[cs336-mutation-test-blind-spots]]).
  5. **Die Eingaben, nicht nur die Ergebnisse**: die Karte muss die Stichprobe, die Behaltequoten
     und die r-Werte nennen, die der Prüfer läuft — sonst rechnete er ein anderes Beispiel nach
     und bestünde trotzdem.
  6. **Die Verdrahtung**, und dass alle 63 Labs von einer Karte aus erreichbar bleiben.
- **Mutationstest: 32 Mutationen, 32 gefangen, 0 entkommen, 0 inert.** Gefahren gegen eine
  **Schlankfassung der Suite aus Setup + neuem Block allein** (0,25 s je Lauf), sodass ein Fang
  keinem älteren Block gehören kann — schärfer als das `void`-Verfahren aus v101 und schnell
  genug für 32 Läufe. Kontrolle vor und nach jedem Lauf grün.
- **Kein Browsertest** — in geplanten Läufen gesperrt ([[cs336-unattended-no-preview]]). Ersatz:
  alle drei Karten in beiden Sprachen auf Vollständigkeit aller 11 Felder, deutsche Rückstände,
  `undefined`, uninterpolierte Platzhalter und gleiche `vars`-Länge geprüft; die bestehenden
  Blöcke `formula route` (820 Checks, beide Sprachen), `content numerals` und `worked steps`
  tragen die Karten mit.

## Was offen bleibt

1. **Der Rückweg im Akkordeon** (aus v108 unverändert): `formulaAccordion` bietet weiter nur
   „Vollständig öffnen"; der Übungsknopf steht nur auf der Detailseite. Kleinster verbliebener
   Hebel derselben Art.
2. **Drei Labs ohne rechnende Fläche**, nach entschiedenen Punkten: `policy-loss-tracer` **1**,
   `scaling-transfer` **0**, `moe-routing` **0**. Unverändert.
3. **`embedding-params` hängt weiter an einem Fallback.** Es ist jetzt der Fallback-Primer von
   `tokenizer-tradeoffs`, also stabil — aber die Karte hat nach wie vor keine Lecture, die sie
   herleitet. Sauber wäre, sie dort zu kuratieren, wo der Kurs `V · D` wirklich rechnet
   (Lecture 3s Parameterbilanz oder A1 §7.2.1) statt sie am Tokenizer-Kapitel hängen zu lassen.
4. **`quality-threshold` und `filtering-mechanics`** liegen im Datenkapitel, hängen aber an
   `l14`-Karten. Ob `l13` eigene Karten für Qualitätsregeln braucht (Gopher-Schwellen sind
   zählbar), wäre der nächste Inhaltshebel derselben Art wie dieser.
5. Der Browsertest steht seit v71 aus; beim nächsten beaufsichtigten Lauf für die neue
   Tokenisierungs-Kategorie, die drei neuen Karten und die zuletzt gebauten Flächen nachholen,
   360 px und beide Sprachen.
6. `origin/main` steht auf `2ed21e7`; **v100 bis v109 sind ungepusht.**
