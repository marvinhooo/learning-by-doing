# Deep Review 2026-10-04 (v131): das Matrix-Rätsel, in dem zwei Verluste zusammenfallen

Basis: Kettenkopf v130 (`f92f60e`), neuer Branch `claude/deep-review-v131`. Alle Branch-Spitzen
sind Ahnen des Kopfes; keine uncommittete Arbeit zu bergen.

## Warum dieser Hebel

Die letzten Läufe haben die vorhandenen Beispiele immer feiner abgesichert. Diesmal stand der
Abgleich gegen die Vorlesung im Vordergrund: Das PRD führt „Coalescing und Wave Quantization“ seit
Langem als offene Lücke. Lecture 5 (52 Folien) seitenweise gegen den l05-Guide gehalten:

| Lecture-5-Teil | Folien | Abdeckung vorher |
|---|---|---|
| GPU-Anatomie, Ausführungs-/Speichermodell | 8–18 | Konzept `gpu-model` |
| Low Precision, Fusion, Recomputation | 23–32 | `fusion-tiling`, `checkpointing`, Lab `checkpoint-segments` |
| Coalescing, Tiling | 33–40 | qualitativ in `fusion-tiling` |
| **Matrix-Rätsel: Tile- und Wave-Quantization** | **41–44** | **nur Begriff in einer Termliste** |
| FlashAttention vorwärts | 46–50 | `flash-attention`, `online-softmax` |

## Neu: Formelkarte `tile-wave-quantization`

Zahlen der Lecture (A100, 108 SMs, Tiles 256 × 128):

| Größe | Tiles | Wellen | Tile-Füllgrad | Wellen-Füllgrad | U |
|---|---|---|---|---|---|
| 1792 | 7 · 14 = 98 | 1 | 1 | 0,9074 | 0,9074 |
| 1793 | 8 · 15 = 120 | 2 | 0,8176 | 0,5556 | 0,4542 |
| 2048 (Selbstcheck) | 8 · 16 = 128 | 2 | 1 | 0,5926 | 0,5926 |

Im 1793-Fall fallen beide Verluste zusammen — deshalb zerlegt das Beispiel U in zwei Faktoren.
Der Selbstcheck trennt sie endgültig: Auffüllen auf ein Vielfaches der Tilegröße heilt die Rand-Tiles
und lässt die Welle stehen. 1792 ist die größte quadratische Größe mit einer Welle.

Für A2 (Benchmarking): Eine Messgröße knapp über einer solchen Kante misst die Aufteilung in Tiles
und Wellen, nicht die Qualität des Kernels.

## Absicherung

Guard `card wave quantization` (86 → 87, 82 Prüfungen). Mutationstest 26/26 gefangen (jeder Fang
vom neuen Block), 0 inert, zwei grüne Kontrollmutationen. Volle Suite grün. Cache v108. Kein
Browsertest (geplanter Lauf).

## Nächste Hebel

1. Lecture 5 weiter: **Coalescing/DRAM-Bursts** (Folien 33–35, 40) und die **Tiling-Rechnung**
   (Folie 38: globale Lesezugriffe sinken um den Faktor T) sind noch rein qualitativ. Kandidat:
   eine kleine Karte oder ein Lab „Lesezugriffe je Element mit/ohne Tiling“.
2. Derselbe Abgleich „Folienliste gegen Guide“ für die anderen PDF-Lectures (3, 4, 7, 9, 11, 15, 16):
   Welche Abschnitte, mit denen eine Lecture schließt, existieren nur als Termlisten-Eintrag?
3. Aus v130 offen: allgemeiner Guard für Lab-Startzustände; `distributed-runtime` getrennte
   Startwerte je Modus (Nutzerentscheidung); string-lokale Notationsklasse (Nutzerentscheidung).
