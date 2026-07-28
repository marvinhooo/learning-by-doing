# Remediation-Entwurf L06-L11

Zweck: tutorielle Bausteine fuer die groessten Coverage-Luecken. Die Beispiele sind absichtlich kleine, generische Lernfaelle und keine Assignment-Loesungen oder Implementierungsvorlagen.

## 1. Distributed Runtime und exaktes Parallel-Accounting

**Quellen:** Lecture 7, S. 7-25 und 28-49; Lecture 8, S. 3-11; Assignment 2, S. 30-46.

### Warum, wo, wie?

- Ein **Rank** ist ein nummerierter Prozess in einer **Process Group**. Im Kurs wird meist ein Rank einer GPU zugeordnet; die Definition gilt aber auch fuer CPU/Gloo.
- `world_size` ist immer gruppenspezifisch. Bei `W_total = d * t * p` mit Data-Parallel-Grad `d`, Tensor-Parallel-Grad `t` und Pipeline-Parallel-Grad `p` hat eine DP-Collective Group nur Groesse `d`, nicht `W_total`.
- Alle Ranks einer Group muessen Collectives mit kompatiblen Shapes und in kompatibler Reihenfolge aufrufen. Eine abweichende Verzweigung kann einen Deadlock erzeugen.
- GPU-Arbeit und Collectives sind asynchron. Ein zurueckgegebenes Handle bedeutet nicht automatisch, dass der Output bereits sicher fuer den Optimizer-Step verwendbar ist. Entscheidend ist die Abhaengigkeits-Timeline.

### Symbole und Kostenmodell

| Symbol | Bedeutung |
|---|---|
| `d,t,p` | DP-, TP- und PP-Grad |
| `P,G,O` | Bytes fuer Parameter, Gradienten und Optimizer-State des ganzen Modells |
| `M` | Payload eines Collective in Bytes |
| `alpha` | Startlatenz pro serieller Kommunikationsphase |
| `BW_eff` | effektiv gemessene Bandbreite |
| `b_a` | Bytes pro Aktivierungselement |

Fuer einen Ring mit Group-Size `w`:

```text
All-Reduce:       V_rank ~= 2 (w-1)/w * M,   n_phases = 2(w-1)
Reduce-Scatter:   V_rank ~=   (w-1)/w * M,   n_phases =   w-1
All-Gather:       V_rank ~=   (w-1)/w * M,   n_phases =   w-1
T_comm ~= n_phases * alpha + V_rank / BW_eff
T_step ~= T_compute + max(0, T_comm - T_overlap)
```

Das ist ein Bandbreiten-/Latenzmodell, keine Garantie: NCCL kann Chunks pipelinen, und Topologie sowie Konkurrenz um Links veraendern `BW_eff`.

Vereinfachter persistenter State pro DP-Rank:

```text
DDP:       P + G + O
ZeRO-1:    P + G + O/d
ZeRO-2:    P + (G + O)/d
FSDP/Z3:   (P + G + O)/d + temporaerer Full-Layer-Gather
```

Typischer Kommunikationspfad pro Step:

```text
DDP:       Gradient All-Reduce                 ~= 2(d-1)/d * G
ZeRO-1/2:  Gradient Reduce-Scatter + Parameter All-Gather
                                               ~= (d-1)/d * (G + P)
FSDP:      zwei Parameter All-Gather + ein Gradient Reduce-Scatter
                                               ~= (d-1)/d * (2P + G)
```

Die FSDP-Zeile ist das vereinfachte Lecture-Modell. Reshard-Policy, Wrapper-Grenzen und Prefetching koennen Peak und Kommunikation aendern. Aktivierungen sind darin noch nicht enthalten.

**Tensor Parallelism:** Fuer `X [R,D]`, `W1 [D,F]`, `W2 [F,D]`, `R=B*S` und TP-Grad `t`:

```text
Column-Shard W1: W1_i [D,F/t]  -> Z_i [R,F/t]
Row-Shard W2:    W2_i [F/t,D]  -> Y_i_partial [R,D]
All-Reduce(Y_partial)           -> Y [R,D]
```

Ein uebliches gepaartes MLP benoetigt einen Aktivierungs-Collective im Forward und einen im Backward. Der Payload eines `Y [R,D]` ist `R*D*b_a`; die konkrete Zahl der Collectives haengt vom Sharding-Layout ab.

**Pipeline Parallelism:** Ein Boundary-Tensor pro Microbatch hat etwa

```text
M_activation = B_micro * S * D * b_a.
```

Forward sendet Aktivierungen, Backward die zugehoerigen Aktivierungsgradienten. Mehr Microbatches verkleinern den relativen Bubble-Anteil, erhoehen aber Nachrichtenanzahl und gespeicherte In-Flight-Aktivierungen.

### Micro-Beispiel

`W_total=16`, `t=2`, `p=2` ergibt `d=4`. Bei `B_micro=3` und zwei Accumulation-Steps ist

```text
B_global = B_micro * accumulation * d = 3 * 2 * 4 = 24,
```

nicht `3*2*16`: TP- und PP-Ranks verarbeiten keine zusaetzlichen unabhaengigen Batchbeispiele.

Seien `P=200 MiB`, `G=200 MiB`, `O=800 MiB`. Dann sind die vereinfachten persistenten Werte pro DP-Rank:

```text
DDP  = 1200 MiB
Z1   = 200 + 200 + 800/4 = 600 MiB
Z2   = 200 + (200+800)/4 = 450 MiB
FSDP = (200+200+800)/4   = 300 MiB + temporaerer Layer-Gather
```

DDP bewegt im Ring pro Rank `2*3/4*200 = 300 MiB` Gradienten. Bei sechs Ringphasen, `alpha=5 us` und `BW_eff=50 GB/s` sind das grob `6*5 us + 300 MiB/50 GB/s ~= 6.32 ms`. Wenn 5 ms davon mit Backward ueberlappen, verlaengert Kommunikation den kritischen Pfad nur noch um etwa 1.32 ms.

### Pitfalls

- Gesamtzahl GPUs statt Process-Group-Size in eine Collective-Formel einsetzen.
- Persistenten Shard-Speicher als Peak ausgeben und Full-Layer-Gather/Buckets vergessen.
- `async_op=True` mit „fertig“ verwechseln und vor `optimizer.step()` nicht auf die relevante Abhaengigkeit warten.
- Nur Bytes zaehlen: Viele kleine Buckets koennen trotz gleichem Volumen am `alpha`-Term verlieren.

### Retrieval

1. **Warum vergroessert TP bei festem `W_total` nicht automatisch den globalen Batch?**  
   **Loesung:** TP-Ranks bearbeiten unterschiedliche Shards derselben Beispiele. Nur der DP-Grad multipliziert unabhaengige lokale Batches.
2. **Warum kann FSDP weniger persistenten Speicher, aber mehr Kommunikation als DDP haben?**  
   **Loesung:** FSDP shardet den State, muss Parameter jedoch fuer Forward und Backward zeitweise per All-Gather rekonstruieren und Gradienten per Reduce-Scatter verteilen.

### Objektives Lab: „Group & Critical-Path Tracer“

Controls: `W_total,d,t,p`, `P/G/O`, Aktivierungsshapes, `alpha`, `BW_eff`, Bucketgroesse und Gradient-Ready-Zeitpunkte. Output: Group-Koordinaten, globaler Batch, persistenter/temporarer Peak, Collective-Payloads, Nachrichtenphasen und exponierte Kommunikationszeit.

**Transfer-Check:** `W_total=32,t=4,p=2,B_micro=2,accum=4`. Welche Aussage stimmt?

- A: `d=4`, `B_global=32`, Gradient All-Reduce laeuft in Groups der Groesse 4.
- B: `d=32`, `B_global=256`.
- C: `d=4`, aber All-Reduce muss alle 32 Ranks enthalten.

**Erwartet:** A.

---

## 2. Scaling Theory: `N_opt`, `D_opt` und `L_opt`

**Quellen:** Lecture 9, S. 14-20 und 40-50; Lecture 11, S. 21-36; Assignment 3, S. 2-8.

### Warum, wo, wie?

Ein festes Compute-Budget bestimmt nicht allein die Modellgroesse. Mit der dichten Transformer-Naeherung

```text
C ~= 6 N D
```

tauscht ein groesseres Modell `N` gegen weniger Trainingstokens `D`. Pro Compute-Tier braucht man deshalb mehrere **vollstaendige** Runs, deren Lossminimum von kleineren und groesseren `N` eingeklammert ist.

Aus `K` gueltigen Tiers entstehen Envelope-Vektoren `C,N_opt,D_opt,L_opt` mit Shape `[K]`:

```text
N_opt(C) = A_N C^a
D_opt(C) = A_D C^b
L_opt(C) = E + A_L C^(-gamma)
```

Fit im Lograum:

```text
log N_opt       = log A_N + a log C
log D_opt       = log A_D + b log C
log(L_opt - E)  = log A_L - gamma log C
```

Wenn `D_opt` strikt aus `C/(6N_opt)` abgeleitet wird, gilt ideal `b=1-a`. Bei zwei unabhaengigen Fits ist `a+b ~= 1` ein Konsistenzcheck, kein erzwungenes Naturgesetz. Ist `E` unbekannt, darf man nicht einfach `log L` linear fitten; `E` muss gemeinsam und sinnvoll beschraenkt geschaetzt oder in Sensitivitaetsvarianten behandelt werden.

### Micro-Beispiel

Didaktische innere Minima:

| `C` | `N_opt` | `D_opt` | `L_opt` |
|---:|---:|---:|---:|
| `6e18` | `100M` | `10B` | `2.300` |
| `2.4e19` | `200M` | `20B` | `2.066` |
| `9.6e19` | `400M` | `40B` | `1.900` |

Jede Zeile erfuellt `C=6ND`. Eine Vervierfachung von `C` verdoppelt hier `N_opt` und `D_opt`: `a=b=0.5`. Mit `c=C/(6e18)` und dem Toy-Fit `L_opt=1.5+0.8*c^(-0.25)` folgt fuer `c=64`:

```text
N_pred=800M, D_pred=80B, L_pred ~= 1.783.
```

Das ist nur eine Rechendemonstration. Reale Prognosen brauchen Holdout, Residuen, mehrere Fitvarianten und Unsicherheit. Nach Rundung auf eine gueltige diskrete Architektur werden `N`, `D` und `C` neu gerechnet.

### Pitfalls

- Randminimum als `N_opt` behandeln: Es zeigt nur, in welche Richtung weiter gesucht werden muss.
- Partial-/Timeout-Loss wie einen abgeschlossenen Run verwenden.
- Learning-Rate-Schedule, Daten, Architektur oder Tuningqualitaet zwischen Tiers veraendern und Optimierungsfehler als Scaling Law fitten.
- Nur `N_opt` extrapolieren, aber `D_opt` oder den verlangten Ziel-Loss nicht modellieren.
- Hohes In-Sample-`R^2` mit verlaesslicher Extrapolation verwechseln.

### Retrieval

1. **Wenn `N_opt pro 4x Compute` um Faktor 2 steigt, wie muss `D_opt` bei exaktem `6ND` reagieren?**  
   **Loesung:** Ebenfalls Faktor 2; damit sind `a=b=0.5` und `a+b=1`.
2. **Warum wird `log(L_opt-E)` statt automatisch `log L_opt` gefittet?**  
   **Loesung:** Ein nichtverschwindender Rest-Loss `E` biegt `log L`; erst nach Abzug des passenden Offsets ist ein einzelner Potenzterm log-linear.

### Objektives Lab: „N-D-L Envelope“

Zeige eine ragged Run-Matrix `[K,J_k]`. Der Lernende muss pro Tier das innere Minimum markieren, ein Randminimum ablehnen, `N_opt` und `D_opt` separat fitten, `a+b` pruefen, ein Tier vorhersagen und danach `L_opt(C)` mit zwei plausiblen `E`-Werten vergleichen.

**Transfer-Check:** Der Fit liefert `a=0.62`, der unabhaengige D-Fit `b=0.57`. Welche Reaktion ist korrekt?

- A: Blind extrapolieren, weil beide Fits einzeln gerade aussehen.
- B: Compute-Konvention, ausgewaehlte Minima und Confounder pruefen; `a+b=1.19` widerspricht dem exakten `6ND`-Ledger.
- C: `b` automatisch auf null setzen.

**Erwartet:** B.

---

## 3. Maximum Update Parametrization (muP) und WSD

**Quellen:** Lecture 11, S. 17-20 und 38-54; Assignment 3, S. 2-8.

### Warum, wo, wie?

Beim Verbreitern eines Netzes sollen weder Aktivierungskoordinaten noch die durch einen Optimizer-Step verursachte Funktionsaenderung allein wegen der Breite verschwinden oder explodieren:

```text
A1: Aktivierungskoordinaten bei Initialisierung = Theta(1)
A2: Aenderung der Aktivierungskoordinaten nach einem Step = Theta(1)
```

Fuer `h_l=W_l h_(l-1)`, `W_l [n_l,n_(l-1)]` und Koordinaten von `h_(l-1)` der Groesse `Theta(1)` ist `||h_(l-1)||=Theta(sqrt(n_(l-1)))`. Die Lecture leitet als breite-stabile Initialisierungs-Skala her:

```text
std(W_l) = Theta( 1/sqrt(n_(l-1)) * min(1, sqrt(n_l/n_(l-1))) ).
```

Fuer SGD ist `Delta W_l = -eta_l * grad_(h_l)L * h_(l-1)^T`; die Zerlegung

```text
Delta h_l = W_l Delta h_(l-1) + Delta W_l (h_(l-1)+Delta h_(l-1))
```

zeigt, warum auch die Update-Skala kontrolliert werden muss. Im „baby muP“-Modell der Lecture skaliert die Adam-Lernrate eines hidden-width Inputs wie `1/n_(l-1)`.

**Rollen sind entscheidend; keine globale Regel fuer alle Matrizen.** Fuer Breite `M` im Lecture-Protokoll:

| Rolle | Beispiel | Init-Varianz | Adam-LR |
|---|---|---:|---:|
| Input/Embedding | feste Token-ID -> Breite `M` | `Theta(1)` | `Theta(1)` |
| Hidden -> Hidden | Q/K/V/O, MLP-Matrizen | `Theta(1/M)` (bzw. `1/F`) | `Theta(1/M)` (bzw. `1/F`) |
| Readout | Breite `M` -> feste Vokabularachse | `Theta(1/M^2)` | `Theta(1/M)` |

Das ist das spezifische vereinfachte Lecture-Protokoll, kein universeller Drop-in. Base Width, Optimizer, Attention-Skalierung und Parameterrollen muessen zusammenpassen. Die untersuchte Familie skaliert vor allem **Breite**, nicht automatisch Tiefe. Lernbare RMSNorm-Gains, exotische Optimizer und starke Weight Decay koennen den Transfer brechen.

**WSD (Warmup-Stable-Decay):**

```text
eta(t) = eta_max * t/T_w                         fuer t < T_w
eta(t) = eta_max                                 fuer T_w <= t < T_s
eta(t) = eta_max * g((t-T_s)/(T_end-T_s))        fuer T_s <= t <= T_end
```

`g(0)=1`; Endwert und Form von `g` muessen dokumentiert werden. Checkpoints entlang einer langen Stable-Phase koennen jeweils mit einer eigenen Decay-Phase abgeschlossen werden. Ein Stable-Checkpoint ohne Decay ist aber kein final trainierter Vergleichspunkt.

### Micro-Beispiel

Base `M0=256`, Ziel `M=1024`, also `r=4`:

```text
Embedding: Init-Varianz x1,    Adam-LR x1
Hidden W:  Init-Varianz x1/4,  std x1/2, Adam-LR x1/4
Readout:   Init-Varianz x1/16, std x1/4, Adam-LR x1/4
```

Eine unveraenderte globale Adam-LR waere daher kein konsistenter muP-Transfer. Ebenso darf ein WSD-Checkpoint aus der Stable-Phase erst nach seiner definierten Decay-Branch als abgeschlossener Run verglichen werden.

### Pitfalls

- Einzelne muP-Regeln mit Standard Parametrization mischen.
- Init-**Varianz** und Init-**Standardabweichung** verwechseln.
- Breiten-Transfer ungeprueft auf Tiefe, andere Optimizer oder starke Regularisierung ausdehnen.
- Stable-Checkpoint als finalen Loss in einen Chinchilla-Fit aufnehmen.

### Retrieval

1. **Warum erhalten Embedding und Readout bei wachsendem `M` nicht dieselbe Skalierung?**  
   **Loesung:** Sie haben entgegengesetzte Rollen: feste Inputachse -> wachsende Breite versus wachsende Breite -> feste Outputachse. A1/A2 erzwingen deshalb andere Varianzregeln.
2. **Bei vierfacher Breite sinkt Hidden-Init-Varianz um 4. Was passiert mit der Standardabweichung?**  
   **Loesung:** Sie sinkt nur um `sqrt(4)=2`.

### Objektives Lab: „Width Transfer Table“

Controls: Base-/Zielbreite, Rolle (Embedding/Hidden/Readout), SGD/Adam, RMSNorm-Gain und starke Weight Decay. Output: relative Init-Varianz, Std und LR; Warnung, wenn eine Lecture-Annahme verlassen wird. Zweiter Tab zeigt WSD-Branches und unterscheidet Stable-Checkpoint, Decay-Compute und finalen Loss.

**Transfer-Check:** Fuer `M0 -> 4M0` werden Embedding, `W_Q` und Unembedding skaliert. Erwartete Faktoren `(Init-Varianz, Adam-LR)` sind:

```text
Embedding (1,1), W_Q (1/4,1/4), Unembedding (1/16,1/4).
```

---

## 4. Speculative Decoding: exakte Accept/Residual-Mathematik

**Quellen:** Lecture 10, S. 15-17.

### Warum, wo, wie?

Ein kleines Draft Model `p` schlaegt Tokens guenstig sequenziell vor. Das Target Model `q` prueft mehrere Vorschlaege parallel. Fuer einen festen akzeptierten Prefix sind `p,q` Vektoren der Shape `[V]` ueber dasselbe Vokabular.

Draft-Token `x ~ p` wird akzeptiert mit

```text
a(x) = min(1, q(x)/p(x)).
```

Bei Ablehnung wird aus der Residualverteilung gesampelt:

```text
r(y) = [q(y)-p(y)]_+ / Z,
Z    = sum_y [q(y)-p(y)]_+.
```

**Warum ist das exakt?** Akzeptierte Masse fuer Token `y`:

```text
p(y)a(y) = min(p(y),q(y)).
```

Die Ablehnungswahrscheinlichkeit ist

```text
R = 1 - sum_y min(p(y),q(y)) = sum_y [q(y)-p(y)]_+ = Z.
```

Replacement-Masse ist `R*r(y)=[q(y)-p(y)]_+`. Insgesamt:

```text
min(p(y),q(y)) + [q(y)-p(y)]_+ = q(y).
```

Bei einem Draft-Block `[K]` wird links nach rechts unter den jeweils bedingten Verteilungen geprueft. Nach der ersten Ablehnung sind spaetere Vorschlaege nicht mehr zum neuen Prefix passend und werden verworfen. Die Target-Auswertung benoetigt typischerweise Logits der Shape `[K+1,V]`, damit bei voll akzeptiertem Block trotzdem Fortschritt moeglich ist.

### Micro-Beispiel

```text
p = [0.6, 0.4] fuer [A,B]
q = [0.3, 0.7]
```

`A` wird mit `0.3/0.6=0.5`, `B` mit 1 akzeptiert. Akzeptierte Masse ist `[0.3,0.4]`. Ablehnungsmasse ist `0.3`; das positive Residual `q-p` liegt voll auf `B`, also Replacement-Masse `[0,0.3]`. Endverteilung: `[0.3,0.7]=q`.

Speedup ist trotzdem nicht garantiert: Er haengt von Draft-Kosten, Blocklaenge, Accept-Rate und effizienter paralleler Target-Pruefung ab.

### Pitfalls

- Nur gleiche Argmax-Tokens akzeptieren: Das ist nicht dieselbe Sampling-Verteilung.
- Negative Eintraege von `q-p` in die Residualverteilung lassen oder nicht normieren.
- Nach erster Ablehnung spaetere Draft-Tokens behalten.
- `p` und `q` aus unterschiedlichen Prefixen vergleichen.

### Retrieval

1. **Was passiert, wenn `p(y) <= q(y)`?**  
   **Loesung:** Der Vorschlag `y` wird immer akzeptiert; fehlende Target-Masse fuer andere Tokens wird ueber Ablehnungen anderer Vorschlaege und das Residual ergaenzt.
2. **Warum beeinflusst ein besseres Draft Model die Geschwindigkeit, aber nicht die Zielverteilung?**  
   **Loesung:** Accept/Residual korrigiert jede Differenz mathematisch zu `q`; ein naeheres `p` erhoeht nur die Accept-Rate.

### Objektives Lab: „Accepted Mass + Residual“

Controls: zwei oder drei Kategorien fuer `p` und `q`, optional Blocklaenge/Draft-Kosten. Visualisierung zerlegt pro Token `q` in `min(p,q)` und `[q-p]_+`; eine Monte-Carlo-Ansicht darf erst nach der algebraischen Pruefung erscheinen.

**Transfer-Check:** `p=[0.7,0.2,0.1]`, `q=[0.4,0.4,0.2]`. Welche Residualgewichte vor Normierung sind korrekt?

- A: `[0,0.2,0.1]`
- B: `[-0.3,0.2,0.1]`
- C: `[0.3,0,0]`

**Erwartet:** A; `Z=0.3`, also normalisiert `[0,2/3,1/3]`.
