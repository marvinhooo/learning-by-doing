# Deep Review v105 — 2026-09-09 — dieselbe Messung, zwei entgegengesetzte Sätze

Fortsetzung von [v104](deep-review-2026-09-08-claude.md). Der zugewiesene Worktree stand auf
**v99** (`2ed21e7`), der Kettenkopf auf **v104** (`f328637`, Branch
`claude/mystifying-cannon-664e47`) — Fast-Forward, kein Merge. Kein Codex aktiv (der
Kopf-Worktree zuletzt am 8. September geschrieben, Arbeitsbaum sauber). `origin/main` steht
weiter auf `2ed21e7`; **v100 bis v105 sind ungepusht**.

Auftrag unverändert: derselbe Wissensstand wie aus der Vorlesung, und die Assignments lösen
können.

## Die Wahl

v104 hinterließ eine geordnete Liste. Sie wurde nachgerechnet statt übernommen — aus
`HANDOUT_PROBLEMS`, `PROBLEM_CONCEPTS` und `LAB_CONCEPTS` neu, nach der v100-Regel (nur
Konzepte zählen, die kein zweites Lab führt):

| Prüfung | Ergebnis |
| --- | --- |
| Punkte auf `distributed-runtime` | a2:distributed_communication_single_node 5 · a2:naive_ddp 5 → **10** |
| Gegenprobe nach der v100-Regel | **negativ** — kein anderes Lab führt `distributed-runtime` |
| Kontrolle an v104s eigener Zahl | dieselbe Messung gibt für `pytorch-state` **16,5** zurück |
| Zustand des Labs | drei Auswahlfragen zu World Size, Batch und async-Handle, keine gerechnete Zeile |

## Der Befund

Beide Hälften hängen am Latenzterm α — genau dem Term, den das Nachbarlab `comm-crossover`
ausdrücklich weglässt („ohne Startlatenz").

### A · Die Tabelle, deren Abgabe Sätze sind

A2s erste Aufgabe verlangt keine Zahl, sondern *„2-3 sentences of commentary"* über eine
Tabelle. Dieselbe Tabelle trägt zwei Bandbreiten:

| 1 GiB, NVLink (β = 450 GB/s, α = 5 µs) | d = 2 | d = 4 | d = 6 | Abfall |
| --- | --- | --- | --- | --- |
| **algbw = S/T** | 448,1219 | 297,5063 | 266,6475 GB/s | **40,4967 %** |
| **busbw = algbw · 2(d−1)/d** | 448,1219 | 446,2595 | 444,4125 GB/s | **0,8278 %** |

Die erste Zahl sagt „mehr Ranks, schlechtere Skalierung". Die zweite sagt „die Leitung ist
gleich ausgelastet, der Ring bewegt nur mehr". Beide stehen in derselben Messung, und nur die
zweite macht zwei Rankzahlen vergleichbar — es ist genau die Konvention von `nccl-tests`.

**Die flache Lesart gilt aber nicht immer.** Bei 1 MiB fällt die Busbandbreite ebenfalls, um
61,8617 %, weil dort **81,1019 % der Zeit reine Latenz** sind. Welche Lesart trägt, entscheidet
die Größe, und die Grenze ist

> **S\* = α·d·β** — der Ringfaktor 2(d−1) steht auf beiden Seiten und kürzt sich vollständig
> heraus.

Wo die Grenze liegt, hängt also gar nicht am Ringalgorithmus. Im Node liegt sie bei 4,2915 MiB
(d = 2) bis 12,8746 MiB (d = 6); A2s eigene Größenleiter 1 MB / 10 MB / 100 MB / 1 GB klammert
sie.

**Und die Messfalle, die die ganze Tabelle wertlos macht.** `torch.cuda.synchronize()` ist auch
bei `async_op=False` nötig, weil der Aufruf zurückkehrt, sobald das Collective eingereiht ist.
Ohne ihn misst der Timer in jeder Zelle dieselbe Konstante, und die abgeleitete Bandbreite
wächst exakt linear mit S:

| ohne synchronize | 1 MiB | 10 MiB | 100 MiB | 1 GiB |
| --- | --- | --- | --- | --- |
| gemessen | 0,0050 | 0,0050 | 0,0050 | 0,0050 ms |
| daraus algbw | 209,7152 | 2.097,1520 | 20.971,5200 | 214.748,3648 GB/s |

Die kleinste Zeile liest 209,7152 gegen die wahren 85,0415 GB/s — Faktor 2,4660, und **immer
noch unter der Bandbreite der Verbindung**, besteht also jede Plausibilitätsprüfung. Erst die
größte Zeile liest das 477,2186-fache der Leitung. Nicht eine Zelle verrät den Fehler, sondern
die *Form* der Tabelle — und wer nur eine kleine Größe misst, sieht ihn nie.

### B · Die beiden Verbesserungen, die nicht gleich viel wert sind

A2 verbessert `naive_ddp` zweimal: §5.3.1 fasst die Aufrufe zusammen, §5.3.2 zieht sie ins
Backward vor. Auf der Konfiguration des Handouts (xl, 1 Node × 2 GPUs, 291 Gradiententensoren,
3.406.809.600 Parameter, 13.627.238.400 Byte FP32-Gradienten, Backward 69,7715 ms):

| Zeitplan | Collectives | freiliegend | Anteil am Schritt |
| --- | --- | --- | --- |
| naive_ddp · nach dem Backward, je Tensor | 291 | 33,1928 ms | 32,2372 % |
| flach · nach dem Backward, ein Aufruf | 1 | 30,2928 ms | 30,2733 % |
| **überlappt · je Tensor** | 291 | **0,2376 ms** | **0,3393 %** |
| überlappt · 25 MiB (PyTorchs Default) | 226 | 0,2376 ms | 0,3394 % |
| überlappt · 250 MiB | 49 | 0,3541 ms | 0,5049 % |
| überlappt · 4 GiB | 4 | 7,4542 ms | 9,6525 % |

Drei Dinge daran:

1. **Zusammenfassen ist 8,7368 % wert, Vorziehen 99,2843 %** — und der wirksame Schritt bewegt
   kein einziges Byte weniger. Der erste ist exakt die Latenz der 290 entfernten Aufrufe.
2. **Was übrig bleibt, ist kein Rest, sondern ein Collective.** Die 0,2376 ms sind bitgenau das
   All-Reduce des Embedding-Gradienten — des letzten, den der Backward Pass fertigstellt. Von
   13,6 GB bewegter Gradienten können nur 102,4 MB je freiliegen.
3. **PyTorchs Default gruppiert in diesem Modell nichts** außer den 65 RMSNorm-Gains, weil
   schon die kleinste Gewichtsmatrix 25 MiB groß ist. Über den ganzen Bereich von einem Gain
   bis zur kleinsten Matrix steht die Bucketzahl konstant auf 226.

**Und der Fall, der das Gegenteil zeigt.** Zwischen Nodes (β = 25 GB/s) bringt derselbe Overlap
nur 12,3095 %, weil dort die Leitung selbst die Wand ist: die Kommunikation dauert 562,5495 ms
gegen 69,7715 ms Backward. Jeder Zeitplan hat **zwei Untergrenzen** —

> freiliegend ≥ T_comm − T_bwd (die Leitung kann höchstens den Backward Pass verdecken)
> freiliegend ≥ Dauer des letzten Collectives (es kann nicht vor seinem Gradienten starten)

— und welche bindet, sagt, welche Reparatur überhaupt etwas bringt. Im Node bindet die zweite,
und keine kleinere Bucketgröße ändert daran noch etwas. Zwischen Nodes bindet die erste
(492,7781 von 493,3024 ms), und erst dort existiert das Bucket-Optimum, nach dem die eigene
Transferfrage des Labs seit jeher fragt: bei 250 MiB, und es ist einstellig Prozent wert.

## Was gebaut wurde

`distributed-runtime` behält seinen Kurzcheck und bekommt eine rechnende Fläche in zwei Modi.

**Modus A — die Tabelle aus §5.1.1.** Vier Größen × drei Rankzahlen × zwei Verbindungen, je
Zelle Zeit, algbw, busbw und Latenzanteil, dazu die Regimemarkierung gegen S\* = α·d·β, die
gewählte Größe über alle Rankzahlen nebeneinander, und ein Schalter für den unsynchronisierten
Timer.

**Modus B — wann kommuniziert wird.** Das xl-Modell aus A2 Tabelle 1 mit seinen 291
Gradiententensoren gegen sechs Zeitpläne, je Plan Collectives, Kommunikationszeit, freiliegende
Zeit, Schrittdauer und beide Untergrenzen.

Zwei neue Kurzcheckfragen, beide auf den Befund: warum busbw fast konstant bleibt und algbw
nicht, und was die kleine Restzeit nach dem Überlappen eigentlich ist.

**Konzeptseite `distributed-runtime`** in beiden Sprachen um ein viertes `details`-Element,
zwei Pitfalls und eine Check-Frage samt Antwort erweitert. Sie beschrieb den Bucket-Tradeoff
schon vorher richtig — und nannte keine einzige Zahl dazu.

## Prüfung

- **Guard-Suite 56 → 57 Blöcke grün**, Build grün, Cache-Bump auf **v85** (4 Stellen),
  `LR_NO_STAGE` 6 → **5**, **`lab render sweep` 57 → 58 von 63 Labs**, `lab prose anchors`
  57 → 58 Karten. Laborzahl unverändert 63 — es kam kein Lab dazu, eines wurde rechnend.
- Neuer Block **`ddp schedule`** (975 Checks) auf einem **anderen Rechenweg als die App**: die
  Ringkosten werden Runde für Runde summiert, wo die App die geschlossene Form nimmt; der
  Zeitplan wird als **explizite Belegungsliste der Leitung** neu gelegt (und auf Überlappung
  sowie auf Start vor Existenz der Gradienten geprüft), wo die App ein laufendes `max()`
  rechnet; das Parametertotal kommt aus einer **Stückliste**, nicht aus P = 2VD + L(4D²+3DF+2D)
  + D; der Crossover wird per **Bisektion** über zehn Hardware/Rank-Paare gesucht und für
  Collectives mit 1, 2 und 7 Runden als gleich nachgewiesen. Beide Lesarten der Tabelle werden
  **in beide Richtungen** gehalten, ebenso beide Untergrenzen: jede muss von irgendeinem Plan
  auch wirklich erreicht werden, nicht bloß von allen respektiert.
- **`panel i18n` erweitert.** Der Guard fand Panels nur über `if(id==="x") return \`` — also
  nur inline gebaute — und sah damit zwei Labs überhaupt nicht (`pytorch-debugger`,
  `distributed-runtime`). Ihre statischen deutschen Beschriftungen erreichten einen englischen
  Leser ungeprüft. Jetzt 55 → **57 Panels**, 995 → **1017 Textknoten**; die Erweiterung fand
  sofort einen unübersetzten String.
- **Mutationstest: 22 Mutationen, 22 gefangen, 0 entkommen.** Der erste Lauf (20 Mutationen)
  ließ drei entkommen; **zwei davon waren echte Lücken**:
  - **Ein Feld, das der Guard nie liest, prüft er nicht.** `lastCost` und `lastBytes` ließen
    sich auf den *ersten* Bucket umschreiben, ohne dass etwas anschlug — im Zeitplan je Tensor
    sind lm_head und Embedding beide V·D groß und damit gleich teuer. Jetzt wird **jedes**
    zurückgegebene Feld über **alle** Zeitpläne gegen die eigene Zeitleiste gehalten.
  - **Ein deklarierter Parameter war an nichts gebunden.** „25 MiB (PyTorchs Default)" konnte
    250 MiB rechnen, ohne dass eine Prüfung das bemerkte. Jetzt wird jedes Label gegen seinen
    eigenen Wert und jede Bucketzahl gegen eine unabhängig gezählte geprüft.
  - Die dritte (`idle` verworfen) war inert, **weil das Feld nirgends gelesen wurde**. Es wird
    jetzt gegen die Zeitleiste geprüft und ist damit gefangen — die exakte Identität
    `freiliegend = T_comm + Leerlauf − T_bwd` steht seither im Guard.
  - Zwei weitere Mutationen gegen genau die neuen Prüfungen: beide gefangen. Kontrolle vor und
    nach allen Läufen grün.
- **Kein Browsertest** — in geplanten Läufen gesperrt ([[cs336-unattended-no-preview]]).
  Ersatz: alle Zustände beider Modi in beiden Sprachen headless gerendert und gelesen.

## Was offen bleibt

1. **Fünf Labs ohne rechnende Fläche**, nach entschiedenen Punkten auf Konzepten, die sonst
   kein Lab führt: `transformer-ledger` **8**, `rlvr-system-transfer` **2,5**,
   `policy-loss-tracer` **1**, `scaling-transfer` **0**, `moe-routing` **0**. Der nächste Hebel
   ist `transformer-ledger`.
2. Die drei Konzepte ohne Lab entscheiden weiterhin **null** Probleme.
3. `renderFormulaDetail` bleibt eine Sackgasse: 79 Formelkarten ohne Konzept- oder Labknopf.
4. `origin/main` steht auf `2ed21e7`; **v100 bis v105 sind ungepusht**.
