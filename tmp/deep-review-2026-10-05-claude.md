# Deep Review 2026-10-05 (v132): der zweite Faktor, den Folie 37 nennt und Folie 38 nicht zählt

Basis: Kettenkopf v131 (`69a9f94`), neuer Branch `claude/deep-review-v132`. Alle Branch-Spitzen
sind Ahnen des Kopfes; keine uncommittete Arbeit zu bergen. Hauptcheckout seit 29. Juli unberührt.

## Warum dieser Hebel

v131 hatte ihn namentlich hinterlassen: Lecture 5 schließt ihren Tiling-Teil mit zwei Folien ab,
die in der App rein qualitativ standen.

| Lecture-5-Teil | Folien | Abdeckung vorher |
|---|---|---|
| Memory Coalescing, DRAM-Bursts | 33–35 | zwei Prosasätze in `fusion-tiling`, nie mit einer Zahl |
| **Tiling-Rechnung (Faktor T)** | **38** | **nicht vorhanden** |
| Tile-/Wave-Quantization | 41–44 | seit v131 Karte `tile-wave-quantization` |

„Burst" kam im gesamten Markup **null** Mal vor. Folie 37 nennt zwei Vorteile des Tilings in einem
Atemzug — die wiederholten Lesezugriffe wandern in den Shared Memory, *und* die Zugriffe lassen
sich koaleszieren — und Folie 38 beziffert nur den ersten. Die App hatte dieselbe Asymmetrie.

## Neu: Formelkarte `global-memory-traffic`

q = N/T · α = n_burst · B/(32 · b) · Q = 2 · N³/T · b · α

Bei N = 1024, T = 64, FP32 (b = 4 Bytes), 32-Byte-Bursts:

| | Lesungen | Bytes | α | Q |
|---|---|---|---|---|
| naiv, quer gelesen | 2.147.483.648 | 8 GiB | 8 | **64 GiB** |
| naiv, koalesziert | 2.147.483.648 | 8 GiB | 1 | **8 GiB** |
| gekachelt, quer gelesen | 33.554.432 | 128 MiB | 8 | **1 GiB** |
| gekachelt, koalesziert | 33.554.432 | 128 MiB | 1 | **128 MiB** |

**Pointe:** Die Faktoren sind unabhängig und multiplizieren sich. Tiling ist für sich 64 wert —
aber der gekachelte, quer lesende Kernel holt 1 GiB gegen 8 GiB des naiven, koaleszierten: Faktor
8, von 64 übrig. Schlechtester zu bestem Fall 512 = 64 · 8.

**Die Koinzidenz, um die das Beispiel herumgebaut ist:** α ist ab einer Schrittweite von einer
Burstlänge nicht die Warpbreite, sondern B/b — die Zahl der Elemente je Burst. Bei den üblichen
128-Byte-Bursts und FP32 ist B/b = 32 und trifft die 32 Lanes; daher die zählebige Faustregel
„ein unkoaleszierter Zugriff kostet das 32-Fache". Das Beispiel rechnet deshalb bei 32-Byte-Bursts
(α = 8); erst der Selbstcheck erzeugt die 32 und benennt ihren anderen Grund.

Für A2: Ein Kernel, der nach dem Tiling nicht schneller wird, ist oft nicht zu wenig gekachelt,
sondern liest seine Tiles noch quer zum Speicherlayout.

## Absicherung

Guard `card memory traffic` (87 → 88 Blöcke, 131 Prüfungen). 16 Modellzusicherungen laufen, bevor
ein Zeichen der Karte gelesen wird: Tiling bewegt genau die Lesezahl, α genau die Bytes je Lesung,
beide als reine Faktoren in beide Richtungen; α = B/b statt Warpbreite, in beide Richtungen geprüft
(beim Beispielburst verschieden, bei 128 Byte gleich); und paarweise, dass keine zwei der Größen
T, α, W, b, N denselben Wert tragen — außer der einen Koinzidenz, die das Beispiel ausschreibt.

**Mutationstest:** 41 Mutationen, **0 entkommen, 0 inert**, jeder Fang mit gemessenem Grund, aus
dem neuen Block (Schlankfassung 0,25 s statt 86 s). 5 Kontrollmutationen blieben grün.

Ein erster Durchgang ließ eine Mutation entkommen: Der englische Selbstcheck durfte „although a
warp has 32 lanes" verlieren, weil die Prüfung nur auf die nackte „32" sah — die der Fragesatz
selbst noch trägt. Verschärft auf eine geordnete Tokenliste beider Hälften, danach gefangen.

Volle Suite grün (88 Blöcke, Exitcode 0). Cache v109. Kein Browsertest (geplanter Lauf).

## Nebenbefund: ein Guard, der seit zwanzig Versionen halb blind war

`cache version` hält die Cacheversion monoton, indem es die höchste je in `activity.md` genannte
liest — mit einem Muster, das auf ein nacktes `v` ankert. Seit v90 setzt jeder Eintrag die Version
**fett**, also fand das Muster seit zwanzig Versionen nur noch v89. Der Guard sagte es in seiner
eigenen Erfolgszeile („never below the v89"), und niemand las sie.

Gegenprobe gegen den unveränderten Guard: ein Rücksetzen von v109 auf **v90**, in allen vier
Stellen konsistent, lief **grün** durch. Muster um optionale Sternchen erweitert; zusätzlich fällt
der Guard jetzt aus, wenn die Schranke die aktuelle sw.js-Version nicht erreicht — ein Muster, das
seine eigene Quelle nicht mehr liest, soll laut scheitern statt ein kleineres Maximum
zurückzugeben. Beide Fälle im Mutationstest gefangen, zwei Kontrollen grün.

## Nächste Hebel

1. Derselbe Folienabgleich für die übrigen PDF-Lectures (3, 4, 7, 9, 11, 15, 16): Welche
   Abschnitte, mit denen eine Lecture schließt, existieren nur als Termlisten-Eintrag? Lecture 5
   ist damit abgeglichen; offen bleibt dort allein Tensor Cores (PRD-P1).
2. Ein Lab zu `global-memory-traffic`: N, T, b, B und das Zugriffsmuster als Regler, Q als
   Treppe. Die Karte rechnet den Fall vor, aber das Produkt der zwei Regler ist eine Fläche, die
   sich besser schieben als lesen lässt — und `fusion-tiling` hat bis heute kein eigenes Lab.
3. Aus v130 offen: allgemeiner Guard für Lab-Startzustände; `distributed-runtime` getrennte
   Startwerte je Modus (Nutzerentscheidung); string-lokale Notationsklasse (Nutzerentscheidung).
