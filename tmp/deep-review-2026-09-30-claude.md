# Deep Review 2026-09-30 (v127): die Stufe, die zugleich die mildeste und die letzte war

Basis: Kettenkopf v126 (`aa77e25`), neuer Branch `claude/deep-review-v127`. Alle Branch-Spitzen
sind Ahnen des Kopfes; keine uncommittete Arbeit zu bergen.

## Befund 1 — `cascade-yield` (A4 `filter_data`, 6 Punkte)

Der Schlusssatz sagte, die 0,90-Stufe trage „keineswegs die mildeste Regel“. Sie ist die mildeste.
Der Guard prüfte seit v118 das Richtige (die mildeste Regel entfernt am wenigsten) und las den
Satz daneben nicht. Der eigentliche Mangel: in dieser Reihenfolge ist die mildeste Regel auch die
letzte, das Beispiel kann Milde und Position nicht trennen — gerade die Reihenfolgeabhängigkeit,
die Pitfall, Check und Antwort der Karte lehren.

| Reihenfolge | 0,60 | 0,50 | 0,80 | 0,90 |
|---|---|---|---|---|
| Karte (0,90 zuletzt) | 51,02 % | 38,27 % | 7,65 % | 3,06 % |
| mildeste zuerst | 45,92 % | 34,44 % | 6,89 % | 12,76 % |

Gleiche 216000 Überlebende; die mildeste Regel steigt >4× und überholt die strengere 0,80-Regel.

## Befund 2 — `decode-bandwidth` (Lecture 10)

Die Karte rechnete ein erfundenes Modell mit festem M_KV. Lecture 10 rechnet dieselbe Grenze für
Llama 2 13B auf H100 — nichts davon stand in der App. Neu nach Trace-Konfiguration:

| Fall | M_step | t_ideal | Tokens/s |
|---|---|---|---|
| B=1 | 26,87 GB | 8,02 ms | 125 |
| B=64 | 79,72 GB | 23,80 ms | 2.689 |
| B=256 | 240,78 GB (passt nicht in 80 GB) | – | ≤3.562 |
| B=256, GQA H_kv=8 | 65,63 GB (passt) | 19,59 ms | 13.068 |

## Absicherung

`corpus arithmetic` erweitert, neuer Block `card lecture decode` (81 → 82 Blöcke). Mutationstest
21/21 vom neuen Code gefangen, 0 inert, drei Kontrollen grün. Cache v104. Kein Browsertest
(geplanter Lauf).

## Nächste Hebel

1. Weitere Karten gegen Rechnungen, die die Vorlesung selbst vorführt, prüfen — Muster
   `card lecture decode`: `kv-cache` und `inference-params-gqa` rechnen Toy-Modelle, Lecture 10
   rechnet dieselben Größen am Llama 2 13B (GQA K=40→8 bei B=64). Ebenso `mup-transfer` gegen
   Lecture 11, `compute-optimal-predictions` gegen A3.
2. Beim Nachrechnen zusätzlich fragen: fällt der erklärte Effekt mit einem zweiten zusammen?
3. Die string-lokale Notationsklasse (34 Strings) — Nutzerentscheidung (Liste im v122-Report).
