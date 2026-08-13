# Deep Review 2026-08-13 — die Kompressionsrate hört auf, Prosa zu sein (v71)

Basis `3f31ed3` (v70, Branch `claude/sweet-haslett-6b74b7`), per Fast-Forward in den Worktree
`agitated-mirzakhani-eb6d79` geholt. Ergebnis auf `claude/objective-dubinsky-6e7cf7`, Commit
`a764b47`. **Nicht gepusht.**

## Wie das Ziel gewählt wurde

Die von v70 notierten Hebel (`a4:harmful_content` / `a4:language_identification`,
`a4:pipeline-audit`, `a1:checkpointing`) wurden **nicht** übernommen. Grund: der naheliegendste
davon — Language ID und Harm — hätte die Confusion Matrix wiederholt, die `quality-threshold`
gerade erst eingeführt hat, und wäre damit dieselbe Duplikatsgefahr gewesen, die `a2:parallel-accounting`
(v63) und der A3-Fehlalarm (v66) erzeugt haben. Statt der Liste zu folgen wurde die Kennzahl neu
abgeleitet: **Missionen ohne exklusives Lab**, danach die Pflichtfrage *welche konkrete Zahl
verlangt das Handout, die die Plattform nirgends rechnet?*

Kandidatenliste (Punkte über deduplizierte `HANDOUT_PROBLEMS`, nicht über Missionen):

| Mission | P. | Probleme | Labs | exklusiv |
|---|---|---|---|---|
| `a4:safety-filters` | 18 | 4 | quality-threshold, filtering-mechanics, data-pipeline | keins |
| `a4:pipeline-audit` | 10 | 2 | data-pipeline | keins |
| `a4:tokenize-train` | 10 | 2 | data-pipeline, evaluation | keins |
| `a4:web-extraction` | 7 | 2 | data-pipeline | keins |

Der Beleg kam nicht aus der Tabelle, sondern aus der Trefferzählung nach den Bezeichnern der
Rechnung selbst:

```
bytes/token        0        compression        0        bytes/second       0
tokens per byte    0        Bytes/Sekunde      0        vocab_size         0
Bytes pro Token    3   ← nur Konzeptprosa (Zeilen 1756, 1758, 1778)
Kompressionsrate   1   ← dieselbe Prosa
825 / Pile         3/4 ← eine CSS-Farbe, eine SKU-Zeile, Korpusgeschichte; keine Rechnung
```

**Der Fund lag in Lecture 1.** Sie definiert in ihrem eigenen Trace (Zeile 565–569)

```python
def get_compression_ratio(string: str, indices: list[int]) -> float:
    num_bytes = len(bytes(string, encoding="utf-8"))
    num_tokens = len(indices)
    return num_bytes / num_tokens
```

und ruft sie **fünfmal** auf — für GPT-2, Character, Byte, Word — mit `@inspect compression_ratio`,
darunter `assert compression_ratio == 1` beim Byte-Tokenizer und der Konsequenz „The compression
ratio is terrible, which means the sequences will be too long." **Die Lecture rechnet, die
Plattform druckte** — dasselbe Muster wie `parallelism` vor v65, `rlvr-system-transfer` vor v66,
`lsh` vor v69 und `precision-recall` vor v70.

Auf der Assignmentseite verlangt `a1:tokenizer_experiments` (4 P.) genau diese Zahl in (a) für zwei
Tokenizer, in (b) für den gekreuzten Fall, in (c) den Durchsatz mit Hochrechnung auf den Pile
(825 GB) und in (d) die uint16-Begründung. `tokenizer-tradeoffs` ist außerdem das entscheidende
Konzept von vier Problemen und die erste Zeile der Mission `a4:tokenize-train`.

**Die schärfste Einzelbeobachtung:** die `transferQuestion` des bestehenden `bpe`-Labs lautet
wörtlich „Wie beeinflusst ein größeres Vokabular Sequenzlänge, Embeddingkosten und seltene
Sprachen?" — die Plattform *stellte* die Frage und hatte kein Objekt, das sie beantwortet.

Gegenprobe vor dem Bauen: `renderBpe` zählt Symbole und prüft den Roundtrip, rechnet aber keine
Bytes; `bpe-encode` zeigt ID-Folgen und Peak-Speicher; `batch-windows` (v62) deckt die
uint16-Überlaufseite (`np.iinfo`, V = 70.000 → 4464), nicht die Größenseite. Kein Duplikat.

## Gebaut: Lab #46 `compression-ratio`

„Bytes pro Token: Kompressionsrate, Tokenbudget & Durchsatz", Modul `tokenization`, 15 min.
Registriert in **l01** (die einzige Lecture, die die Zahl rechnet — ein Guard verbietet es den
übrigen sechzehn), im Modul, an dritter Stelle von `a1:text-tokenizer` und an **erster** Stelle von
`a4:tokenize-train`. 32 wählbare Zustände, 52 geprüfte Werte.

### Modus A — Lecture 1s vier Entwürfe

Vier Strings (zwei davon Lecture 1s eigene) × vier Entwürfe. Alles wird live gerechnet, auch das
BPE: ein echter Byte-Level-Trainer mit A1s Tie-Break läuft auf einem gezeigten Mini-Korpus.

| String | Bytes | Zeichen | character | byte | word | bpe |
|---|---|---|---|---|---|---|
| `Hello, 🌍! 你好!` | 20 | 13 | 1,5385 | **1,0000** | 2,5000 | 1,0000 |
| `I'll say supercalifragilistic…!` | 44 | 44 | 1,0000 | **1,0000** | 5,5000 | 1,1282 |
| Englischer Fließtext | 85 | 85 | 1,0000 | **1,0000** | 2,7419 | 2,8333 |
| Derselbe Satz auf Chinesisch | 66 | 22 | 3,0000 | **1,0000** | 22,0000 | 1,0000 |

**Kern:** Die Byte-Zeile steht auf allen vier Strings auf exakt 1 — das ist keine Messung, sondern
Bauart, und Lecture 1 schreibt deshalb `assert` statt `print`. Die Character-Zeile daneben bewegt
sich nur, wenn die Schrift die Bytes pro Zeichen ändert. **Auf zwei der vier Strings sind beide
Entwürfe an dieser Zahl nicht zu unterscheiden, auf zweien schon** — eine Kompressionsrate, die auf
englischem Text gemessen wurde, trennt zwei völlig verschiedene Tokenizer nicht.

Der Word-Tokenizer liefert auf Chinesisch 22,0000, weil Pythons `\w+` einen ganzen CJK-Lauf als
*ein* Wort nimmt: die beste Zahl der Tabelle gehört dem Entwurf, der dort vollständig versagt.

Die BPE-Zeile ist im Lab ausdrücklich als geschmeichelt ausgewiesen: der englische Fließtext ist
dem Demokorpus fast gleich, deshalb schlägt BPE dort sogar den Word-Tokenizer. Ein Guard hält
sowohl die Zahl als auch die gerenderte Warnung fest.

### Modus B — A1 §2.7 in klein

Zwei Register (Kindergeschichten ↔ Webforum/Technik), je ein echt trainierter Byte-Level-BPE, und
gemessen wird **ausschließlich auf Held-out-Text** (ein Guard verbietet, dass der Held-out-Text im
Trainingstext vorkommt, und ein zweiter, dass der Renderer `target.train` misst).

Bei 128 angeforderten Merges:

| Held-out | Bytes | T_stories | T_web | Aufschlag der falschen Wahl |
|---|---|---|---|---|
| Geschichten | 204 | 101 tok · **2,0198** | 138 tok · 1,4783 | **+36,63 %** |
| Web | 234 | 194 tok · 1,2062 | 172 tok · **1,3605** | **+12,79 %** |

**Befund 1 — der Aufschlag ist asymmetrisch.** Derselbe Tokenizerwechsel kostet den
wiederholungsreichen Text fast dreimal so viel wie den Webtext. Der Aufschlag gehört nicht dem
Tokenizerpaar, sondern dem gemessenen Text; eine Antwort auf `tokenizer_experiments` (b), die die
Richtung der Kreuzung nicht nennt, ist unvollständig. Bei 64 Merges liegt der Webaufschlag sogar
bei nur +2,04 % — die Messung, aus der man schließen würde, es sei egal.

**Befund 2 — angefordert ist nicht gelernt.** 128, 256 und 512 angeforderte Merges liefern
identisch 91 (Geschichten) und 98 (Web) gelernte Merges: ein Merge entsteht nur, wenn sein Paar
mindestens zweimal vorkommt, und der Korpus ist vorher fertig. V ist eine Obergrenze, keine
Einstellung — das ist der Grund, warum A1 auf TinyStories 10K und auf OpenWebText 32K trainiert.

**Befund 3 — die uint16-Datei kippt bei genau 2 Bytes pro Token.** Die Datei ist 2·num_tokens Bytes
groß, der Rohtext num_bytes; sie wächst also exakt dann, wenn r < 2. Von den acht Zellen der
Tabelle liegt **genau eine** über 2 (r = 2,0198, Wachstum 0,990×), alle anderen darunter
(bis 1,658× auf dem Webtext). Ein tokenisierter Datensatz, der größer ist als sein Rohtext, ist
Arithmetik und kein Bug. Ein Guard prüft die Äquivalenz `r < 2 ⇔ Wachstum > 1` für jede Zelle und
verlangt, dass beide Seiten der Grenze in der Tabelle vorkommen.

**Befund 4 — ein festes Tokenbudget ist keine feste Textmenge.** 327,68 M Tokens kaufen mit dem
passenden Tokenizer 0,616 GiB Text und mit dem gekreuzten 0,451 GiB, also **26,81 % weniger**. Zwei
Läufe mit identischem Budget haben verschieden viel Text gesehen, und ihr Loss je Token zählt in
verschiedenen Einheiten. Genau das steht seit Langem als Falle in A1s eigener `pitfalls`-Liste
(„Perplexity über Tokenizer hinweg direkt vergleichen") — bisher ohne eine einzige Zahl daneben.

**Durchsatz (A1 (c)).** Die Rate ist ein Regler und ausdrücklich als *deine* Messung deklariert,
weil das Handout sie so verlangt; behauptet wird nur die Arithmetik. Bei 1 MB/s braucht der Pile
**246,07 h = 10,25 Tage**, bei 100 MB/s 2,46 h. Der Durchsatz hängt an Bytes, nicht an Tokens — die
Kompressionsrate verkürzt die Ausgabe, nicht die Arbeit.

## Verifikation

- `node --check` auf dem extrahierten Inline-Script, `new Function` auf `i18n-en.js`: grün.
- `check-i18n` grün: **46 Labs, 2754 UI-Strings**, `compression-ratio OK: 52 values`.
- **Übersetzung:** alle 114 Literale der Labregion und des Bedienfelds exakt gegen die Schlüssel der
  `ui`-Map (Pack als Objekt geladen, nicht per Regex; Abbruch unter 1000 Schlüsseln) — 0 fehlend.
  Zusätzlich alle **96 Zustände in DE und EN gerendert** und auf Rückstände gescannt: 0, keine
  `undefined`/`NaN`, Tags ausgeglichen. Der Scanner wurde vorher **bewiesen**: eine einzige
  entfernte Übersetzung erzeugt 16 Treffer.
- **Mutationstest: 32 Mutationen, 32 gefangen, 0 escaped, 0 inert.** Darunter invertierte Division,
  uint16 auf 4 Bytes, Pile auf 800 GB, vertauschte Tokenizer, gekippter BPE-Tie-Break, Merges ab
  Häufigkeit 1, Held-out aus dem Trainingstext, sechs Renderer-Mutationen, die je eine angezeigte
  Zahl entfernen, `target.train` statt `target.held`, Lab aus l01 entfernt, Lab zusätzlich in l04.
  Eine Erst-Mutation für die Held-out-Regel war **untauglich** (sie ersetzte nur die erste Zeile des
  Templates, die Behauptung blieb wahr) und wurde durch eine vollständige ersetzt — die dann den
  vorgesehenen Guard auslöste.

## Nicht verifiziert

**Kein Browsertest.** `preview_start` ist in unbeaufsichtigten Läufen gesperrt. Ungeprüft blieben
damit: die tatsächliche Darstellung bei 360 px mit aufgeklappten `<details>` (der latente
`.lab-stage`-Bug von v70 ist gefixt und durch Guards gehalten, aber die neue Tabelle mit vier
Spalten wurde nicht vermessen), Konsolenfehler und das Verhalten der Regler im echten DOM. Die
Renderfunktionen wurden statt dessen headless über alle 96 Zustände in beiden Sprachen ausgeführt.

**Nachzuholen beim nächsten beaufsichtigten Lauf:** `#detail/lab/compression-ratio` in DE und EN
bei 360 px und 1280 px, alle acht `<details>` geöffnet, Konsole leer, und nach dem Versionssprung
`getRegistrations().unregister()` + `caches.delete()` — sonst zeigt der Browser v70.

## Getroffene Entscheidungen (unbeaufsichtigt)

- **Die notierte Prioritätenliste wurde bewusst verlassen.** Language ID und Harm hätten die gerade
  gebaute Confusion Matrix wiederholt. Das ist dieselbe Entscheidung, die v63 und v66 im Nachhinein
  als richtig ausgewiesen haben.
- **Keine Zahl aus TinyStories oder OpenWebText behauptet.** Die beiden Register sind konstruiert
  und im Lab als solche deklariert; behauptet wird nur, wofür sie stehen. Die BPE-Rechnung darauf
  ist echt, nicht hinterlegt.
- **Kein GPT-2-Tokenizer.** Lecture 1 ruft `get_compression_ratio` auch auf tiktoken auf; ohne
  tiktoken im Repo wäre jede Tokenzahl dazu erfunden. Der vierte Entwurf ist deshalb ein selbst
  trainiertes Byte-Level-BPE.
- **Der Durchsatz ist ein Regler, keine Behauptung.** A1 verlangt ihn als eigene Messung des Lesers;
  eine Zahl zu setzen hieße, eine Messung zu erfinden.
- **Bits pro Byte kommt nicht vor.** Das ist die übliche Auflösung des Lossvergleichs, steht aber in
  keinem Handout und in keiner Lecture dieses Kurses (0 Treffer in allen 23 extrahierten PDFs). Das
  Lab benennt das Problem und rechnet die Textmengen; es erfindet keine Kursanforderung.
- **Keine `LECTURE_GUIDES` über l01 hinaus.** Ein Guard verbietet es den übrigen sechzehn, und die
  Mutation dagegen wurde gefangen.
- **Keine Zeit-, Termin- oder Streak-Mechanik.**

## Stand

- Commit `a764b47` auf `claude/objective-dubinsky-6e7cf7`, gestapelt auf `3f31ed3` (v70). **Nicht gepusht.**
- Geändert: `index.html`, `i18n-en.js`, `scripts/check-i18n.mjs`, `sw.js` (Cache `cs336-shell-v71`,
  Bundle `?v=71`), `README.md` (46 Labs, Version 71).

## Nächste Hebel

1. **Browsertest von v71 nachholen** — der einzige offene Punkt dieses Laufs.
2. **`a4:pipeline-audit` / `a4:web-extraction`** (10 + 7 P.) — beide führen nur `data-pipeline`.
   Vor dem Bauen prüfen, welche Zahl `filter_data` und `inspect_filtered_data` überhaupt verlangen;
   der Verdacht ist, dass es Schreib- und Stichprobenaufgaben sind und `quality-threshold` die
   Behaltequote bereits rechnet.
3. **`a4:harmful_content` / `a4:language_identification`** (6 + 6 P.) — weiterhin offen, aber nur
   bauen, wenn sich eine Zahl findet, die *nicht* Precision/Recall ist. Kandidat: FineWebs Schwelle
   `p(en) > 0.65` (0 Treffer) zusammen mit den fünf Caveats, die Lecture 14 für Language ID nennt
   (kurze Sequenzen, Low-Resource, Dialekte, ähnliche Sprachen, Code-Switching) — also die Frage,
   auf welchen Dokumenten die Sprachentscheidung überhaupt definiert ist, nicht wie gut sie ist.
4. **`a1:checkpointing` / der Resume-Vertrag** (1 P., aber echter Testvertrag). Belege aus diesem
   Lauf: `torch.save` 0, `rng_state` 0, `resume` 2 Treffer. Der stille Vertrag, den ein kurzer Test
   bestätigt und ein echter Wiederanlauf bricht.
5. **`a4:exact_deduplication`** (3 P.) — `exact_line` hat genau 1 Treffer (den Adapter-Hook),
   „unique lines" und „line count" je 0. Die Pointe wäre, dass eine Zeile *überall* verschwindet,
   auch in dem einen Dokument, in dem sie Inhalt war.
