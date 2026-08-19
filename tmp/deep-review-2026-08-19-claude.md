# Deep Review 2026-08-19 — A4s Filteraufteilung hört auf, eine Behalterate zu sein (v77)

Basis `5ffb33d` (v76, Branch `claude/deep-review-v76`). Der zugewiesene Worktree
`quirky-lumiere-d7549c` stand wie üblich auf `1461c41` (v50, 27 Commits alt) — die Kette lag
auf `deep-review-v76`. Per `git merge --ff-only` aufgeholt, neuer Branch
`claude/deep-review-v77`. **Nicht gepusht.**

Keine Codex-Aktivität seit ~24 Stunden (letzte Dateiänderung 2026-08-18 07:42), also gebaut
statt nur berichtet.

**Erledigt: der Hinweis aus v76 zu den 719 ungespeicherten Zeilen in `frosty-swirles-966e50`.**
Ich habe sie angesehen: es ist eine **frühere, unterlegene Fassung genau des Labs, das v76
committet hat** (`stability-edge` mit 27 statt 28 Zuständen). Sie ist vollständig überholt und
kann verworfen werden; ein Konflikt in der 1,8-MB-Datei droht daraus nicht mehr. Angefasst habe
ich die Arbeitskopie nicht.

## Wie das Ziel gewählt wurde

v76 hat `a4:pipeline-audit` und `a4:web-extraction` als die größten Missionen ohne exklusives
Lab benannt. Die Kennzahl war wieder nur der Verdacht — beide Missionen verlinkten lediglich
das generische `data-pipeline`-Lab. Der Beleg kam aus den Quellen.

`web-extraction` (`look_at_cc` · `extract_text`, 7 Punkte) ist **bewusst nicht** das Ziel
geworden: A4 verlangt dort Prosa über WARC/WET-Records und einen Vergleich zweier
Extraktionen. Da ist nichts exakt zu rechnen, ohne es zu erfinden.

`pipeline-audit` dagegen verlangt in **einem einzigen Problem zwei Zahlen**:

> „Your script should report the number of examples kept by each filter that you've used …
> **A written breakdown of what proportion of the discarded examples are removed by each
> filter step.**" (A4.txt 678–682)

> „**How long does it take to filter the provided WET files (originally 2,500 raw WET files)?
> How long would it take to filter the entire Common Crawl dump?**" (A4.txt 684–686)

Trefferzählung vor dem Lab:

```
Kaskade / cascade      0    Zurechnung          0    per stage        0
Reihenfolge der Filter 0    Ausschussrate       0    Grund je Stufe   0
Anteil der verworfenen 0    240T / 3.8T / 15T   0    600B             0
```

Die Pipelines waren namentlich da (`RefinedWeb` 2×, `DCLM` 7×, `CCNet` 5×, `Gopher` 12×) —
**ihre Ausbeuten nirgends.** Und L13 nennt sie in einer Form, die exakt genug für eine
Rechnung ist: RefinedWeb „Release 600B (out of 5T) tokens" (373–376), DCLM „DCLM-pool (240T
tokens)" → „Result: 3.8T tokens" (407–417). Dasselbe Muster wie bei `lsh`, `bpe`, den
Ablationen, NoPE und der kritischen Batchgröße: benannt, nie gerechnet.

Kein bestehendes Lab überschneidet sich. `data-pipeline` schaltet Filter an und aus und zeigt
eine Behalterate — es zählt **keine Stufe**, und seine `reasons`-Liste sammelt bewusst *alle*
Gründe je Dokument, modelliert also gerade nicht, was ein Kaskadenskript tut. `quality-threshold`
rechnet Confusion Matrix und Schwelle, `dedup-pipeline` und `lsh-bands` die Dedup-Mechanik.
Keines fragt, **wer ein Dokument entfernt hat** oder **was der Lauf kostet**.

## Gebaut: Lab #51 `pipeline-yield`

Modul `data`, 17 min, registriert in **l13** (ein Guard hält fest, dass es genau diese eine
Lecture ist — L13 geht die veröffentlichten Common-Crawl-Pipelines durch und nennt ihre
Ausbeuten), im Modul `data` und in `a4:pipeline-audit` an **erster** Stelle: die Mission hatte
bis v77 kein eigenes Lab, das Lab, das ihre beiden Deliverables rechnet, führt sie an.
28 Zustände, zwei Modi.

Der Korpus sind **16 explizite Fehlersignaturen** über vier Ausschlussstufen (Language,
Gopher-Regeln, Quality Classifier, Near-Dedup) — 10.000 Dokumente, jede Überlappung
ausgeschrieben. Damit ist jede Zahl ganzzahlig und von Hand nachrechenbar.

### Modus A — Wer hat es entfernt (4 Reihenfolgen × 4 Stufen)

**Der Befund ist, dass A4s Deliverable keine Eigenschaft der Daten und keine der Filter ist,
sondern eine des Skripts.**

Ein Dokument bleibt nur, wenn es jede Stufe besteht. Die Endmenge ist damit der Schnitt aller
vier Bestehensmengen — und ein Schnitt hängt nicht von der Reihenfolge ab:

| | Wert | über alle 24 Reihenfolgen |
|---|---|---|
| behalten | **1.200** (12,0000 %) | unverändert |
| verworfen | **8.800** | unverändert |
| Summe der Zurechnungen | **8.800** | unverändert |

Die Aufteilung dieser Summe bewegt sich dagegen erheblich:

| Stufe | kleinste | größte | Anteil an den Verworfenen | Faktor |
|---|---|---|---|---|
| Language | 1.500 | 3.970 | 17,0455 % … 45,1136 % | 2,646667 |
| Gopher | 700 | 2.700 | 7,9545 % … 30,6818 % | **3,857143** |
| **Quality Classifier** | **1.800** | **4.500** | **20,4545 % … 51,1364 %** | 2,500000 |
| Near-Dedup | 900 | 2.050 | 10,2273 % … 23,2955 % | 2,277778 |

Derselbe Korpus, derselbe Klassifikator, dieselbe Schwelle — je nach Position in der Kaskade
ist der Quality Classifier der **größte oder der drittgrößte Posten im Bericht**. In A4s
eigener Reihenfolge (L→G→Q→D) bekommt er 2.200 zugerechnet, lässt man ihn früh laufen, 3.950.
Zwei Studierende mit identischem Code berichten also verschiedene Zahlen, und beide haben recht.

**Und die naheliegende Reparatur — jede Stufe einzeln messen — geht in die andere Falle:**

```
Language 3.970 + Gopher 2.700 + Classifier 4.500 + Dedup 2.050 = 13.220
13.220 / 8.800 = 150,2273 %   ← A4 fragt nach einem "proportion"
```

Der Überschuss ist **4.420**, und das ist exakt die Summe von (Anzahl Gründe − 1) über alle
verworfenen Dokumente — Inklusion-Exklusion, im Ledger als Gegenprobe ausgewiesen und von
einem Guard geprüft. Ein Guard hält außerdem fest, dass eine Stufe, die zuerst läuft, immer
genau ihre isolierte Ausschlussmenge zugerechnet bekommt (das Maximum) — die beiden Spalten
hängen also zusammen, statt zwei unabhängige Zahlen zu sein.

Als Realitätsanker steht L13 daneben: die Behalterate von 12 % ist **auf RefinedWebs
veröffentlichten Anteil gesetzt** (600B/5T = 12,000000 %), DCLM-baseline liegt bei 3,8T/240T =
1,583333 %. Der Unterschied ist kein Fehler, sondern der zwischen Regelfiltern und einem
Qualitätsklassifikator — RefinedWeb verzichtet ausdrücklich auf ML-Filter, DCLM filtert genau
damit. Guards binden beide Zahlen an die Lecture und prüfen, dass die Behalterate exakt auf
RefinedWebs Bruch sitzt.

### Modus B — Was der Lauf kostet (4 Reihenfolgen × 3 Messverfahren)

Die Kosten einer Stufe sind ihr Preis je Dokument mal der Zahl der Dokumente, die sie
**erreicht**. Nur die erste Stufe sieht den ganzen Korpus. Daraus folgt das Gegenstück zu
Modus A: **gleiches Ergebnis, verschiedene Rechnung.**

| Reihenfolge | Kosten | gegenüber der billigsten | behalten |
|---|---|---|---|
| G → L → Q → D (c/p) | 10.030 ms | 1,000000 | 1.200 |
| G → L → D → Q (Preis allein) | 10.230 ms | 1,019940 | 1.200 |
| L → G → Q → D (A4s Reihenfolge) | 10.443 ms | 1,041176 | 1.200 |
| D → Q → L → G | 18.930 ms | **1,887338** | 1.200 |

Zwischen billigster und teuerster aller 24 Reihenfolgen liegt Faktor **1,887338** bei
identischem Korpus. Der Brute-Force-Vergleich über alle 24 steht im Code, nicht in der Prosa —
ein Guard prüft, dass die als „billigste" und „teuerste" ausgewiesenen Reihenfolgen wirklich
die Extreme sind.

**Ein zweiter Befund, den ich nicht erwartet hatte:** nach Preis allein zu sortieren ist
**nicht** optimal. Near-Dedup (0,8 ms) ist billiger als der Classifier (1,2 ms), nimmt aber so
viel weniger weg, dass es sich lohnt, den Classifier vorzuziehen — 200 ms Unterschied. Die
Größe, die beides zusammenfasst, ist c/p (Preis geteilt durch den allein entfernten Anteil):

```
Gopher 0,370370   Language 0,755668   Classifier 2,666667   Dedup 3,902439
→ G → L → Q → D, und das ist exakt das Brute-Force-Optimum
```

Ein Guard prüft beides: dass c/p das Optimum trifft **und** dass die Sortierung nach Preis
allein es verfehlt — ohne die zweite Hälfte behauptet das Lab nichts.

**Und dann der Befund, der die beiden Modi verbindet.** A4s Teil (a) und Teil (b) ziehen
gegeneinander. Reihenfolgefrei wird die Aufteilung nur, wenn jede Stufe auf jedem Dokument
läuft — und genau dann spart die Kaskade nichts mehr:

| Messverfahren | Kosten | gegenüber der Kaskade |
|---|---|---|
| nur Kaskade | 10.030 ms | 1,000000 |
| volle Signatur auf allem | 24.000 ms | **2,392822** |
| volle Signatur auf 1 %, Kaskade auf dem Rest | 10.169,7 ms | **1,013928** |

Aufgelöst wird das nicht durch einen Kompromiss bei der Reihenfolge, sondern durch die
Trennung von Messung und Produktionslauf — **1,4 % Aufschlag für eine Aufteilung, die nicht
mehr an der Reihenfolge hängt.** Genau diese Trennung legt A4 selbst nahe:
`inspect_filtered_data` verlangt ohnehin nur fünf behaltene und fünf verworfene Beispiele.

Die Laufzeittabelle beantwortet A4s zweite Hälfte: bei 40.000 Dokumenten je WET-Datei kosten
A4s 2.500 Dateien **27,861111 h** mit einem Prozess, **3,482639 h** mit acht. Für „the entire
Common Crawl dump" gibt das Lab bewusst **keine erfundene Dumpgröße**, sondern eine Rate (Tage
je 100.000 Dateien) plus L13s Größenordnung des Archivs („~100 crawls from 2008-2025").

### Was das Lab bewusst nicht behauptet

Beide Modi sagen es in einem eigenen Absatz, und Guards halten beide Absätze fest.

Modus A: die 16 Zahlen sind **gesetzt, nicht gemessen** — gewählt, damit jede Überlappung
sichtbar ist und die Behalterate auf RefinedWebs Anteil trifft. Exakt ist die Struktur, nicht
der Zahlenwert. Der Modus sagt auch nichts darüber, ob ein Filter *richtig* entscheidet — das
rechnet `quality-threshold`, und der Absatz verweist ausdrücklich dorthin.

Modus B: die vier Preise und die Dokumente je WET-Datei sind gesetzt. Die Skalierung mit der
Prozesszahl ist ideal angenommen; in Wirklichkeit teilen sich die Prozesse Platte und
Dekompression, und bei genug Prozessen ist das Auspacken der Engpass. Die Tabelle sagt
deshalb, **wie lange die Filter brauchen, nicht wie lange dein Skript braucht.**

## Verifikation

- **231 Guard-Werte** gegen eine **unabhängig getippte Referenz** — 0 Abweichungen.
- Zuerst eine **Python-Referenz** aus den Quellen geschrieben (exakte Brüche via `Fraction`),
  *bevor* App-Code entstand; alle Kennzahlen (150,2273 / 4.420 / 3,857143 / 1,887338 /
  2,392822 / 1,013928 / 27,861111) stammen von dort und wurden in JS unabhängig reproduziert.
- **28 Zustände × 2 Sprachen headless gerendert**: **11.860 Ziffern je Sprache, identisch**,
  0 `undefined`/`NaN`, keine unaufgelösten Template-Literale, keine deutschen Reste im
  englischen Render.
- **Übersetzungen laufzeitgeprüft** statt gegrept: `localizedUi` instrumentiert plus die
  Textknoten des Bedienfelds extrahiert — **142 distinkte Strings, 129 neu, 0 ohne englischen
  Eintrag**.
- `check-i18n` grün: **51 Labs, 3.327 UI-Strings** (vorher 50 / 3.198).
- `node --check` auf dem extrahierten Inline-Script, auf `i18n-en.js` und auf `check-i18n.mjs`.
- **0 Identifier-Kollisionen** (32 Namen) und **0 doppelte DOM-IDs** repo-weit.
- **Mutationstest 75/75 — 0 escaped, 0 inert**, vom verifiziert sauberen Baseline aus.
- Kein Browsertest — `preview_start` ist in unbeaufsichtigten Läufen gesperrt (siehe
  `cs336-unattended-no-preview`). Ersatz ist das headless Rendern aller Zustände in beiden Sprachen.

### Was die Mutationsläufe über die eigenen Guards verrieten

Der erste Lauf meldete **2 escaped und 5 inert**, der zweite nochmal **2 escaped**. Alles echt,
alles aufgelöst — und drei der Funde waren Lehren über die Prüfung selbst:

1. **Ein Guard, der Tabellenzeilen nicht sehen konnte.** Die Zeilenprüfung splittete auf
   `"<tr>"` — Zeilen mit `class="is-active"` heißen aber `<tr class=…>` und wurden an die
   Kopfzeile geklebt. Damit war ausgerechnet die Zeile ungeprüft, die die Bedienelemente
   auswählen. Jetzt wird auf `"<tr"` gesplittet. **Derselbe blinde Fleck steckt im Guard von
   `stability-edge` (v76) und in weiteren Labs**, die dieses Muster kopiert haben — ich habe
   ihn in meinem Guard behoben und den fremden nicht angefasst; siehe nächster Hebel.
2. **Die Laufzeittabelle war nur gegen die eigene Referenz geprüft, nicht gegen das Gerenderte.**
   Ein Ersatz von `/workers` durch `/Math.sqrt(workers)` **im Render** blieb unentdeckt, weil
   der Guard seine eigene Formel nachrechnete. Jetzt liest er die Zahlen aus den
   `data-`-Attributen der Tabelle und prüft zusätzlich, dass die gedruckte Zeit wirklich durch
   die Prozesszahl teilt (mit einer Toleranz, die mit dem Multiplikator wächst, weil die
   Ausgabe auf sechs Stellen gerundet ist).
3. **Mehrdeutige Prosa-Suchmuster.** „4.500" steht zweimal im selben Absatz — eine Mutation an
   einer Stelle wurde von der anderen gedeckt. Sechs Muster tragen jetzt die umgebenden Wörter,
   nicht nur die Zahl. Beim Aufräumen fiel außerdem auf, dass ein Splice den Guard für die
   Erfolgsmeldung in ein totes Array verschoben hatte — wieder eingehängt und um vier weitere
   Zahlen erweitert.

Dazu eine Mutation, die sich als **äquivalent** herausstellte: die Summenzelle der
Kaskadentabelle durch `rejected` zu ersetzen ändert in allen 28 Zuständen kein Byte, weil der
Guard selbst beweist, dass beide gleich sind. Eine Mutation, die nichts ändert, ist kein
bestandener Test — sie wurde durch eine beobachtbare ersetzt.

Und zwei eigene Fehler, die erst die Guards fanden: die Notiz zur c/p-Reihenfolge sagte
zunächst `c/(1−p)`, während Tabelle und Symbolliste `c/p` schreiben (dieselbe Größe, zwei
Schreibweisen — vereinheitlicht); und sechs Zahlen in der Lab-Karte (Widerlegung,
Transferfrage, Transferantwort) waren zunächst ungebunden, weil ich nur die Zahlen der
gerenderten Modi geguardet hatte.

## Bewusst nicht

- **`a4:web-extraction` mit einem Lab versorgen.** A4 verlangt dort Prosa über WARC/WET-Records;
  eine Rechnung daraus zu machen hieße, sie zu erfinden. Die Mission bleibt ohne exklusives Lab,
  und das ist die richtige Antwort, nicht eine offene Lücke.
- **Eine Dumpgröße für Common Crawl setzen.** A4 fragt danach; das Lab antwortet mit einer Rate
  und L13s Größenordnung des Archivs, statt eine Zahl zu behaupten, die keine Quelle trägt.
- **Behaupten, welche Filterreihenfolge die richtige ist.** Das Lab entscheidet nur, was der
  Bericht überhaupt messen kann und was der Lauf kostet.
- **Die Zeilenprüfung in fremden Guards reparieren** — siehe nächster Hebel; das gehört in einen
  eigenen Lauf mit eigenem Mutationstest über die betroffenen Labs.
- **Das alte `optimizer`-Lab reparieren** (zweizweigiger Schedule mit hart verdrahtetem
  T_c = 100) — fremdes Lab mit eigenem Zahlenvertrag, seit v72 offen.
- **Die deutsche Zahlenformatierung repo-weit anfassen** — seit v76 offen, unverändert.

## Nächste Hebel

1. **Die Zeilenprüfung in allen Lab-Guards.** Der unter „Verifikation" beschriebene blinde Fleck
   (`split("<tr>")` sieht keine `is-active`-Zeile) betrifft jeden Guard, der dieses Muster
   kopiert hat. Das ist eine kleine Änderung pro Stelle, aber sie kann in den betroffenen Labs
   bisher ungeprüfte Zeilen aufdecken — deshalb gehört ein Mutationstest je berührtem Lab dazu,
   nicht nur ein grüner Lauf.
2. **Dezimaltrennzeichen im deutschen Render** (aus v76, unverändert): `psInt`/`fcInt` und alle
   gleichnamigen Helfer setzen `toLocaleString`, daneben steht `toFixed` mit Dezimalpunkt.
   Repo-weit, braucht einen Mutationstest über alle Guards.
3. Die zweizweigige `schedule()` im `optimizer`-Lab auflösen (seit v72 offen).
