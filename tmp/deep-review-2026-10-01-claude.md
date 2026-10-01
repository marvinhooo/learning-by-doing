# Deep Review 2026-10-01 (v128): fünf Zweien, die das Beispiel nicht unterscheiden konnte

Basis: Kettenkopf v127 (`47302e6`), neuer Branch `claude/deep-review-v128`. Alle Branch-Spitzen
sind Ahnen des Kopfes; keine uncommittete Arbeit zu bergen.

## Befund 1 — `kv-cache` (Lecture 10, Kernformel)

Das Toy setzte K/V-Faktor, L, H_kv, d_head und b_KV alle auf 2. Wer H_kv mit d_head verwechselt,
b_KV vergisst und dafür den K/V-Faktor doppelt zählt, bekam dieselben 384 Bytes. H_q, vor dem die
Pitfall warnt, stand nicht im Beispiel. Neu nach Lecture 10 (Llama 2 13B):

| Fall | je Sequenz | B=64 |
|---|---|---|
| MHA, H_kv=40 | 838.860.800 B ≈ 0,839 GB | 53,69 GB (> 26,03 GB Gewichte) |
| GQA, H_kv=8 | 167.772.160 B ≈ 0,168 GB | 10,74 GB |

Faktor H_q/H_kv = 5. Die beiden Zweien der Formel (K+V, Bytes) werden im Text getrennt.

## Befund 2 — `inference-params-gqa` (Lecture 10)

Toy ersetzt durch Lecture 10s `num_params`: Vokabular 327.680.000 (c_tie=2), Layer 317.194.240,
P=13.015.449.600; mit GQA H_kv=8 P=11.337.728.000. Ohne GQA ist der KV-Term genau Q+O
(52.428.800 je Layer). Die Pitfall „nicht sofort 12LD²“ jetzt belegt: 0,8 % daneben ohne GQA,
14 % zu hoch mit GQA.

## Absicherung

Neuer Block `card lecture kv` (82 → 83 Blöcke). Mutationstest 32/32 gefangen, 0 inert, Kontrolle
vor und nach grün. Cache v105. Kein Browsertest (geplanter Lauf).

## Nächste Hebel

1. `mup-transfer` gegen Lecture 11, `compute-optimal-predictions` gegen A3 (Muster
   `card lecture decode`/`card lecture kv`).
2. Neue Prüffrage zusätzlich zu Leerlauf-Operator und zusammenfallendem Effekt: **haben zwei
   Faktoren denselben Wert, sodass ein Tausch unsichtbar bleibt?** — als Sweep über alle Karten.
3. Die string-lokale Notationsklasse (34 Strings) — Nutzerentscheidung (Liste im v122-Report).
