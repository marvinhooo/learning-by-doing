# Remediation Draft · L01–L05 / A1–A2

Zweck: lernfertige Ergänzungen für die größten Coverage-Lücken. Die Inhalte erklären die mathematischen und systemischen Verträge, ohne Implementierungen oder Lösungen der Assignments vorzugeben. Seitenangaben beziehen sich auf die physischen PDF-Seiten.

## 1 · Initialization und `einsum` als Shape-Verträge

**Quellen:** Lecture 02, PDF-S. 7–12; Assignment 1, PDF-S. 16–18.

### Warum, wo, wie?

Eine Linear Layer soll Informationen mischen, ohne dass ihre Aktivierungen allein wegen einer größeren Input-Dimension explodieren. Gleichzeitig muss der Tensorvertrag eindeutig sagen, welche Achse gemischt und welche nur mitgeführt wird. Genau diese beiden Aufgaben verbinden Initialization und `einsum`:

- **Initialization** kontrolliert die Größenordnung von Forward Activations und Backward Gradients am Trainingsstart.
- **`einsum`** macht sichtbar, welche Achsen erhalten bleiben, kontrahiert werden oder neu entstehen.
- Verwendet wird das in praktisch jeder Projection eines Transformers: Query, Key, Value, Output, SwiGLU und LM Head.

### Gleichungen, Symbole und Shapes

Für die Assignment-Konvention gilt

\[
X\in\mathbb{R}^{\ldots\times d_{in}},\qquad
W\in\mathbb{R}^{d_{out}\times d_{in}},\qquad
Y=XW^\top\in\mathbb{R}^{\ldots\times d_{out}}.
\]

`...` steht für beliebig viele Batch-like Axes, etwa `(batch, sequence)`. Als benannter Vertrag:

```text
X: ... i, W: o i  ->  Y: ... o
```

`i` fehlt rechts und wird daher summiert; alle führenden Achsen bleiben unverändert. PyTorch-Code kann Gewichte auch als `(d_in, d_out)` speichern und dann `X @ W` verwenden. Beides ist korrekt, solange Speicherform und Gleichung zusammenpassen.

Sind \(X_j\) und \(W_{kj}\) unabhängig, mittelwertfrei und haben \(\operatorname{Var}(X_j)=q\) sowie \(\operatorname{Var}(W_{kj})=\sigma_W^2\), dann

\[
\operatorname{Var}(Y_k)=d_{in}\,q\,\sigma_W^2.
\]

Damit die Output-Varianz ungefähr in derselben Größenordnung bleibt, braucht man \(\sigma_W^2\propto 1/d_{in}\). Assignment 1 schreibt für Linear Weights konkret vor:

\[
W_{kj}\sim\mathcal N\!\left(0,\frac{2}{d_{in}+d_{out}}\right),
\quad \text{truncated auf }[-3\sigma,3\sigma],
\quad \sigma=\sqrt{\frac{2}{d_{in}+d_{out}}}.
\]

Bei \(d_{in}=d_{out}\) ist das genau \(\sigma^2=1/d_{in}\). Embeddings folgen im Assignment einer anderen Vorgabe, \(\mathcal N(0,1)\), ebenfalls auf drei Standardabweichungen begrenzt; RMSNorm Gains starten bei Eins.

### Worked Micro-Example

Sei \(X\) von Shape `(2, 3, 4)` und \(W\) von Shape `(5, 4)`. Dann ist \(Y\) `(2, 3, 5)`: Für jedes der sechs `(batch, token)`-Elemente entstehen fünf Outputs aus Dot Products der Länge vier.

- Parameter: \(5\cdot4=20\)
- Matmul-FLOPs pro Token: \(2\cdot4\cdot5=40\)
- Bei \(\operatorname{Var}(X)=1\) und \(\sigma_W^2=2/(4+5)\): \(\operatorname{Var}(Y_k)=4\cdot2/9=8/9\), also nahe bei Eins.

### Typischer Irrtum

`W` versus `W.T` ist keine Geschmacksfrage: Die Gleichung muss zur gespeicherten Shape passen. Ein zweiter häufiger Fehler ist, auf `[-3, 3]` statt auf `[-3σ, 3σ]` zu truncaten. Das ist nur dann dasselbe, wenn \(\sigma=1\).

### Retrieval

1. Welche Achse verschwindet bei `... i, o i -> ... o`, und warum?
2. Warum wächst die Output-Varianz ohne Skalierung ungefähr linear mit \(d_{in}\)?

<details><summary>Lösungen</summary>

1. `i` verschwindet, weil darüber summiert wird; `...` bleibt als Batch-like Prefix erhalten und `o` ist die neue Output-Achse.
2. Jeder Output ist eine Summe aus \(d_{in}\) unabhängigen Beiträgen. Varianzen solcher Beiträge addieren sich, daher entsteht der Faktor \(d_{in}\).

</details>

### Objektiver Transfer Check

Gegeben seien `X: (4, 7, 3, 16)` und `W: (24, 16)`. Nenne Output-Shape, kontrahierte Achse, Parameterzahl und Matmul-FLOPs pro Element des Prefix `(4,7,3)`.

<details><summary>Check-Werte</summary>

Output `(4, 7, 3, 24)`; kontrahiert wird die 16er-Achse; \(24\cdot16=384\) Parameter; \(2\cdot16\cdot24=768\) FLOPs pro Prefix-Element. Bestanden nur, wenn alle vier Angaben stimmen.

</details>

---

## 2 · RoPE: exakte Frequenzen, relative Position und Broadcasting

**Quellen:** Lecture 03, PDF-S. 32–35; Assignment 1, PDF-S. 22–25.

### Warum, wo, wie?

Rotary Position Embeddings (RoPE) geben Attention Positionsinformation, ohne einen Positionsvektor zum Token zu addieren. Stattdessen werden je zwei Koordinaten von Query und Key positionsabhängig rotiert. Dadurch hängt ihr Dot Product natürlich von der **relativen** Distanz der Positionen ab. RoPE wird nach den Query/Key Projections pro Head angewendet; Values werden nicht rotiert.

### Gleichungen, Symbole und Shapes

Für eine gerade Head Dimension \(d_k\), Pair Index \(r=0,\ldots,d_k/2-1\), Base \(\Theta\) und Token Position \(p\):

\[
\omega_r=\Theta^{-2r/d_k},\qquad
\phi_{p,r}=p\,\omega_r.
\]

Das Koordinatenpaar \((x_{2r},x_{2r+1})\) wird mit

\[
R(\phi)=
\begin{bmatrix}
\cos\phi&-\sin\phi\\
\sin\phi& \cos\phi
\end{bmatrix}
\]

rotiert. Für Query an Position \(p\) und Key an Position \(s\) gilt

\[
(R_pq)^\top(R_sk)=q^\top R_p^\top R_s k=q^\top R_{s-p}k.
\]

Das Attention Score kann also die relative Verschiebung \(s-p\) erkennen.

Bei `Q, K: (..., sequence, d_k)` und `positions: (..., sequence)` haben vorab berechnete Tabellen zunächst Shape `(max_sequence, d_k/2)`. Nach Indexing mit `positions` entsteht `(..., sequence, d_k/2)`; fehlende Head/Batch Axes werden nur gebroadcastet. Sinus und Cosinus sind feste **Buffers**, keine trainierbaren Parameter.

### Worked Micro-Example

Wähle \(d_k=4\), \(\Theta=16\), Position \(p=2\). Dann

\[
\omega_0=1,\qquad \omega_1=16^{-1/2}=1/4,
\]

also Winkel \((2, 0.5)\). Für \(q=(1,0,0,1)\) ergibt sich

\[
R_2q=(\cos2,\sin2,-\sin0.5,\cos0.5).
\]

Sind die tatsächlichen Token Positions `[5, 7]`, müssen Tabellenzeilen 5 und 7 verwendet werden — nicht automatisch die lokalen Indizes 0 und 1. Das ist bei gecachtem Decoding entscheidend.

### Typischer Irrtum

RoPE ist weder eine Addition noch eine Rotation über die Head Axis. Es rotiert Paare **innerhalb** der letzten Achse, identisch und unabhängig pro Head. Query und Key werden rotiert; Value nicht.

### Retrieval

1. Warum wird das RoPE Dot Product von \(s-p\) statt von beiden absoluten Positionen getrennt bestimmt?
2. Warum gehört die Sin/Cos-Tabelle in einen Buffer und nicht in einen Parameter?

<details><summary>Lösungen</summary>

1. Weil \(R_p^\top R_s=R_{s-p}\); die beiden Rotationen reduzieren sich algebraisch auf ihre Winkeldifferenz.
2. Frequenzen und Winkel sind fest definiert und sollen nicht durch Gradient Descent verändert werden. Ein Buffer bewegt sich dennoch mit dem Modul zwischen Devices und Dtypes.

</details>

### Objektiver Transfer Check

`Q` habe Shape `(2, 8, 6, 32)` = `(batch, heads, sequence, d_k)`, `positions` Shape `(2, 6)`. Gib die Shape der indizierten Sin/Cos-Werte vor und nach Einfügen der Head Axis sowie die Output-Shape an.

<details><summary>Check-Werte</summary>

Vor der Head Axis `(2, 6, 16)`, broadcast-ready `(2, 1, 6, 16)`, Output weiterhin `(2, 8, 6, 32)`. Bestanden nur, wenn die 16 als Anzahl der 2-D-Paare erklärt wird.

</details>

---

## 3 · Exaktes Transformer Parameter- und FLOP-Ledger

**Quellen:** Lecture 02, PDF-S. 8–12; Assignment 1, PDF-S. 27–28.

### Warum, wo, wie?

Faustformeln wie \(12LD^2\) sind nützlich für eine erste Größenordnung, aber nicht für Architekturentscheidungen oder Assignment Accounting. Ein exaktes Ledger zwingt dazu, jede Matrix einmal zu benennen. So sieht man, welcher Teil Parameter speichert, welcher mit Context Length quadratisch wächst und warum Head Count bei fester Model Dimension oft aus der Rechnung verschwindet.

### Symbole und Annahmen

- \(V\): Vocabulary Size, \(T\): Sequence Length
- \(L\): Anzahl Transformer Blocks
- \(D=d_{model}\), \(F=d_{ff}\), \(H\): Heads, \(d_k=D/H\)
- untied Token Embedding und LM Head, keine Biases
- pro Block zwei RMSNorm Gains; SwiGLU mit drei Matrizen
- gezählt werden Matmul-FLOPs; Lookup, Norm, Activation und Softmax werden separat ignoriert

### Parameter

\[
P_{embed}=VD,\quad P_{head}=VD,
\]

\[
P_{block}=\underbrace{4D^2}_{Q,K,V,O}
+\underbrace{3DF}_{W_1,W_2,W_3}
+\underbrace{2D}_{2\times RMSNorm},
\]

\[
\boxed{P_{total}=2VD+L(4D^2+3DF+2D)+D}
\]

Der letzte Term ist Final RMSNorm. RoPE besitzt keine trainierbaren Parameter. Bei Weight Tying zwischen Embedding und LM Head fällt einmal \(VD\) weg.

### Forward-Matmul-FLOPs pro Sequenz

Mit der Regel \((m\times n)(n\times p)\Rightarrow2mnp\) FLOPs:

\[
F_{block}=\underbrace{8TD^2}_{Q,K,V,O\ projections}
+\underbrace{4T^2D}_{QK^\top\ und\ PV}
+\underbrace{6TDF}_{SwiGLU},
\]

\[
\boxed{F_{total}=L(8TD^2+4T^2D+6TDF)+2TDV.}
\]

Der Head Count kürzt sich aus den Attention Matmuls heraus: \(H\cdot d_k=D\). Das gilt bei vollständiger Multi-Head Attention und fixer Gesamtbreite. Die Formel zählt dichte \(T\times T\)-Matmuls; ein optimierter causal Kernel kann weniger reale Arbeit ausführen.

### Worked Micro-Example

Für \(V=100,D=8,F=16,L=2,T=4,H=2\):

\[
P=2(100)(8)+2[4(8^2)+3(8)(16)+2(8)]+8=2920.
\]

Pro Block:

- Projections: \(8(4)(8^2)=2048\)
- Attention Matmuls: \(4(4^2)(8)=512\)
- SwiGLU: \(6(4)(8)(16)=3072\)

Zwei Blocks kosten 11,264 FLOPs, der LM Head 6,400; insgesamt 17,664 Matmul-FLOPs.

Die bekannte Näherung \(12LD^2\) für Block-Parameter entsteht bei \(F\approx8D/3\): \(4D^2+3D(8D/3)=12D^2\). Sie unterschlägt Embeddings, Norms und exakte \(F\)-Werte.

### Typischer Irrtum

Parameter und FLOPs skalieren nicht identisch mit \(T\). Die Projection/FFN/LM-Head-Terme sind linear in \(T\), Attention Scores und Weighted Sum quadratisch. Außerdem hat ein Embedding Lookup Parameterkosten, aber keinen dichten Matrix-Multiply im Forward Pass.

### Retrieval

1. Warum verändert eine Verdopplung von \(H\) bei festem \(D\) die obige Attention-FLOP-Zahl nicht?
2. Welche zwei Terme werden bei langem Context gegenüber den übrigen relativ wichtiger?

<details><summary>Lösungen</summary>

1. Jeder Head wird schmaler: \(d_k=D/H\), daher bleibt \(H d_k=D\).
2. Die beiden \(T^2\)-Matmuls, \(QK^\top\) und \(PV\), zusammen \(4T^2D\) pro Block.

</details>

### Objektiver Transfer Check

Berechne für \(V=1000,D=64,F=192,L=3,T=32,H=8\) die trainierbaren Parameter und Forward-Matmul-FLOPs. Erkläre zusätzlich, was sich bei \(T=64\) verdoppelt und was sich vervierfacht.

<details><summary>Check-Werte</summary>

\(P=288{,}192\). Pro Block 3,670,016 FLOPs; drei Blocks 11,010,048; LM Head 4,096,000; total 15,106,048. Bei \(T\to2T\) verdoppeln sich Projections, SwiGLU und LM Head; \(QK^\top\) und \(PV\) vervierfachen sich.

</details>

---

## 4 · FlashAttention-2 Forward und Backward als ein konsistenter Vertrag

**Quellen:** Lecture 05, PDF-S. 46–50; Assignment 2, PDF-S. 22–28.

### Warum, wo, wie?

Naive Attention materialisiert die vollständige Probability Matrix \(P\) mit \(N_qN_k\) Einträgen pro Batch/Head. FlashAttention-2 berechnet exakt dasselbe Ergebnis tileweise, hält nur kleine Tiles und zeilenweise Statistiken im schnellen On-Chip Memory und rekonstruiert \(P\) im Backward Pass. Es ist keine Approximation: Der Gewinn kommt aus weniger High-Bandwidth-Memory-I/O (HBM-I/O), Fusion und Recomputation.

Falte für die folgenden Shapes Batch und Heads in \(B\):

\[
Q\in\mathbb R^{B\times N_q\times d},\quad
K,V\in\mathbb R^{B\times N_k\times d},\quad
O\in\mathbb R^{B\times N_q\times d},\quad
L\in\mathbb R^{B\times N_q}.
\]

### Forward: Online Softmax über Key Tiles

Für ein Query Tile \(Q_i\in\mathbb R^{B_q\times d}\) halte
\(m\in\mathbb R^{B_q}\) als Running Maximum,
\(\ell\in\mathbb R^{B_q}\) als skalierten Nenner und
\(A\in\mathbb R^{B_q\times d}\) als noch unnormalisierten Output. Initial: \(m=-\infty,\ell=0,A=0\).

Für jedes \(K_j,V_j\in\mathbb R^{B_k\times d}\):

\[
S=Q_iK_j^\top/\sqrt d\in\mathbb R^{B_q\times B_k},
\]

\[
m'=\max(m,\operatorname{rowmax}S),\qquad
\widetilde P=\exp(S-m'[:,None]),\qquad
\alpha=\exp(m-m'),
\]

\[
\ell'=\alpha\odot\ell+\operatorname{rowsum}(\widetilde P),
\]

\[
A'=\alpha[:,None]\odot A+\widetilde P V_j.
\]

Nach dem letzten Key Tile:

\[
O_i=A/\ell[:,None],\qquad L_i=m+\log\ell.
\]

Bei causal Attention werden ungültige Score-Einträge **vor** `rowmax` und Exponentialfunktion auf \(-\infty\) gesetzt.

### Backward: Rekonstruktion statt Speichern

Mit Upstream Gradient \(dO\) gilt

\[
D=\operatorname{rowsum}(O\odot dO)\in\mathbb R^{B\times N_q},
\]

\[
S=QK^\top/\sqrt d,\qquad P=\exp(S-L[:,:,None]),
\]

\[
dV=P^\top dO,\qquad dP=dO V^\top,
\]

\[
dS=P\odot(dP-D[:,:,None]),
\]

\[
dQ=dS K/\sqrt d,qquad dK=dS^\top Q/\sqrt d.
\]

Für causal Attention muss dieselbe Maske auch bei der Rekonstruktion gelten. Wichtige Invariante: Jede Zeile von \(dS\) summiert sich bis auf Rundungsfehler zu null.

### Worked Micro-Example

Ein Query, zwei Keys, \(d=1\): \(q=1\), \(k=[0,\log3]\), \(v=[2,6]\). Die Scores sind `[0, log 3]`, also \(P=[1/4,3/4]\), \(O=5\), \(L=\log4\).

Mit je einem Key pro Tile:

- Tile 1: \(m=0,\ell=1,A=2\)
- Tile 2: \(m'=\log3,\alpha=1/3,\widetilde P=1\)
- \(\ell'=1/3+1=4/3\), \(A'=2/3+6=20/3\)
- \(O=(20/3)/(4/3)=5\), \(L=\log3+\log(4/3)=\log4\)

Für \(dO=1\): \(D=5\), \(dV=[1/4,3/4]\), \(dP=[2,6]\), \(dS=[-3/4,3/4]\), \(dQ=(3/4)\log3\), \(dK=[-3/4,3/4]\). Man sieht direkt \(\operatorname{rowsum}(dS)=0\).

### Typischer Irrtum

`L` ist nicht der Softmax-Nenner, sondern `logsumexp(S)` pro Query. Ohne `L` kann \(P\) im Backward nicht stabil als \(\exp(S-L)\) rekonstruiert werden. Ebenso darf der Running Output beim Wechsel des Maximums nicht unverändert bleiben; er braucht denselben \(\alpha\)-Rescale wie der alte Nenner.

### Retrieval

1. Warum muss beim Anstieg von \(m\) sowohl \(\ell\) als auch der alte Output-Akkumulator mit \(\exp(m-m')\) skaliert werden?
2. Wozu dient \(D=\operatorname{rowsum}(O\odot dO)\) im Softmax Backward?

<details><summary>Lösungen</summary>

1. Alte Exponentialgewichte waren relativ zum alten Maximum definiert. Der gemeinsame Rescale bringt alte und neue Beiträge in dieselbe numerische Skala.
2. \(D\) ist der pro Zeile gemeinsame Korrekturterm der Softmax-Jacobian-Vector-Multiplikation: \(dS_{ij}=P_{ij}(dP_{ij}-D_i)\).

</details>

### Objektiver Shape- und Invariant-Check

Gegeben `Q: (2,4,5,8)`, `K,V: (2,4,7,8)`, Query Tile 2, Key Tile 3. Nach Falten von Batch und Heads: Nenne Shapes von Score Tile, `m/l`, Output Tile, finalem `L`, `dQ/dK/dV`; nenne drei numerische Invarianten.

<details><summary>Check-Werte</summary>

Gefaltetes \(B=8\). Score Tile `(8,2,3)`, `m/l: (8,2)`, Output Tile `(8,2,8)`, finales `L: (2,4,5)`. `dQ: (2,4,5,8)`, `dK,dV: (2,4,7,8)`. Gültige Invarianten: Flash Output entspricht naive Attention; \(L=\operatorname{logsumexp}(S)\); Probability Rows summieren zu eins; masked Probabilities sind null; Zeilen von \(dS\) summieren zu null; alle Outputs/Gradients sind endlich. Bestanden: alle Shapes plus mindestens drei Invarianten.

</details>

---

## 5 · 2-D Triton, Block Pointers und eigener Autograd-Vertrag

**Quellen:** Lecture 05, PDF-S. 33–40; Assignment 2, PDF-S. 17–22.

### Warum, wo, wie?

PyTorch beschreibt **was** berechnet wird; ein Triton Kernel legt zusätzlich fest, **welches Program Instance welches Tile lädt**, wie es durch Memory läuft und wo partielle Ergebnisse landen. Ein eigener Kernel verlässt außerdem PyTorchs automatisch bekannte Ableitung: Der Autograd-Vertrag muss festhalten, welche Inputs für Backward nötig sind und welche Gradients zurückgegeben werden.

Ein 2-D Block Pointer beschreibt sechs Dinge: Base Pointer, globale Shape, Strides in Elementen, Start-Offsets, Tile Shape und Memory Order. `program_id` wählt das Tile. Offsets sind typischerweise `program_id * tile_size`; `advance` verschiebt in Tensor-Koordinaten. Boundary Checks verhindern Reads/Writes außerhalb nicht teilbarer Dimensionen.

### Gleichungen und Shapes am Weighted-Sum-Modell

\[
X\in\mathbb R^{R\times D},\quad w\in\mathbb R^D,\quad
y_r=\sum_{d=1}^D X_{rd}w_d\in\mathbb R^R.
\]

Mit \(g=dL/dy\in\mathbb R^R\):

\[
dX_{rd}=g_rw_d\quad [R,D],
\qquad
dw_d=\sum_r X_{rd}g_r\quad[D].
\]

Ein Program verarbeitet ein Row Tile \(B_R\) und iteriert über \(\lceil D/B_D\rceil\) Column Tiles. `dX` ist lokal: Jedes Program besitzt seine Rows exklusiv. `dw` reduziert dagegen über **alle** Rows. Ohne Synchronisation erzeugt jedes Program deshalb zunächst `partial_dw: (n_row_tiles, D)`; eine zweite Reduction summiert die erste Achse.

Autograd sieht nur den mathematischen Vertrag: Forward erhält \(X,w\), speichert die für Backward benötigten Größen und liefert \(y\). Backward erhält \(g\) und muss genau \(dX,dw\) in Input-Reihenfolge und Input-Shape liefern.

### Worked Micro-Example

\[
X=\begin{bmatrix}1&2&0&1\\0&1&1&2\\2&0&-1&1\end{bmatrix},
\quad w=[1,-1,2,0],\quad g=[1,2,-1].
\]

Dann \(y=[-1,1,0]\) und

\[
dX=\begin{bmatrix}1&-1&2&0\\2&-2&4&0\\-1&1&-2&0\end{bmatrix}.
\]

Bei \(B_R=B_D=2\) gibt es zwei Row Programs und je zwei Column-Schritte. Die partiellen Weight Gradients sind

\[
partial\_dw_0=[1,4,2,5],\quad partial\_dw_1=[-2,0,1,-1],
\]

also \(dw=[-1,4,3,4]\). Die gepaddete vierte Row des zweiten Tiles darf durch Boundary Masking nichts beitragen.

### Typischer Irrtum

`order` transponiert den Tensor nicht; es beschreibt dem Compiler die Memory-Lokalität. Ein weiterer Fehler ist, einen Cross-Program-Reduce wie `dw` direkt in denselben Output schreiben zu lassen: Dann entstehen Data Races, sofern weder Atomics noch ein Partial Buffer verwendet werden.

### Retrieval

1. Warum kann `dX` ohne Cross-Program-Synchronisation geschrieben werden, `dw` aber nicht?
2. Welche zwei Dimensionen benötigen bei \(R\not\equiv0\pmod{B_R}\) und \(D\not\equiv0\pmod{B_D}\) Boundary Checks?

<details><summary>Lösungen</summary>

1. Jedes Row Program besitzt disjunkte `dX`-Rows. Jeder Eintrag von `dw` summiert dagegen Beiträge aus allen Row Programs.
2. Sowohl Row- als auch Column-Achse; das letzte Tile ist in beiden Richtungen teilweise außerhalb der logischen Tensor-Shape.

</details>

### Objektiver Transfer Check

Für \(R=37,D=70,B_R=16,B_D=32\): Wie viele Row Programs und Column-Iterationen gibt es, welche Shape hat `partial_dw`, und wo braucht man Masks?

<details><summary>Check-Werte</summary>

\(\lceil37/16\rceil=3\) Row Programs, \(\lceil70/32\rceil=3\) Column-Iterationen, `partial_dw: (3,70)`. Das letzte Row Tile und das letzte Column Tile brauchen Boundary Checks; beim kombinierten Corner Tile gelten beide.

</details>

---

## 6 · Activation Checkpointing und Rekursions-Trade-off

**Quellen:** Lecture 05, PDF-S. 30–32; Assignment 2, PDF-S. 14–15.

### Warum, wo, wie?

Reverse-Mode Autograd speichert Activations, weil Backward sie später benötigt. Bei \(N\) sequentiellen Transformer Blocks kostet das ohne Checkpointing \(O(N)\) Activation Memory. Checkpointing verwirft innere Activations und berechnet sie im Backward erneut. Es spart also **Activation Memory**, nicht Parameter-, Gradient- oder Optimizer-State-Memory.

### Ein Level Checkpointing

Teile \(N\) Blocks in Segmente der Länge \(k\). Gespeichert werden ungefähr \(N/k\) Segmentgrenzen; während Backward wird ein Segment mit bis zu \(k\) inneren Activations materialisiert:

\[
M(k)\approx A\left(\frac Nk+k\right),
\]

wobei \(A\) die Activation-Größe pro Block bezeichnet. Das Minimum liegt bei

\[
k\approx\sqrt N,\qquad M_{min}=O(A\sqrt N).
\]

### Rekursives Checkpointing

Wird ein Segment wieder in balancierte Teilsegmente zerlegt, bleibt nur eine Grenze pro Rekursionsebene plus lokaler Block-Workspace live:

\[
M(N)=M(N/2)+O(A)=O(A\log N).
\]

Der Preis ist wiederholte Recomputation über mehrere Ebenen; für eine balancierte Standardkonstruktion wächst die Arbeit typischerweise auf \(O(N\log N)\). Genaues Peak Memory hängt zusätzlich von Block-internen Tensors und der Checkpoint-Implementierung ab.

### Worked Micro-Example

Bei \(N=16\):

- ohne Checkpointing: ungefähr \(16A\)
- ein Level mit \(k=4\): \(N/k+k=4+4=8A\)
- balancierte Rekursion: Tiefe \(\log_2 16=4\), also größenordnungsmäßig \(4A\) plus lokaler Workspace, aber mehrfache Forward-Arbeit

Der Sinn ist nicht „Recomputation ist kostenlos“, sondern: Unter einem harten Memory Limit kann zusätzliche Compute-Arbeit überhaupt erst einen größeren Batch oder Context ermöglichen.

### Typischer Irrtum

Ein kleinerer Checkpoint-Block ist nicht monoton besser: Bei einem Level sinkt zwar der materialisierte Segmentteil \(k\), aber die Zahl gespeicherter Segmentgrenzen \(N/k\) steigt. Außerdem müssen zufällige Operationen, etwa Dropout, bei Recomputation denselben Random State sehen, sonst ist der Backward nicht der Gradient desselben Forward Passes.

### Retrieval

1. Warum minimiert \(k=\sqrt N\) näherungsweise \(N/k+k\)?
2. Welche Memory-Kategorien werden durch Activation Checkpointing nicht kleiner?

<details><summary>Lösungen</summary>

1. Am Minimum sind beide konkurrierenden Terme gleich groß: \(N/k=k\Rightarrow k=\sqrt N\).
2. Parameter, Parameter Gradients und Optimizer States; reduziert werden gespeicherte Activations.

</details>

### Objektiver Transfer Check

Für \(N=256\): Vergleiche ein Level mit \(k=8,16,32\), und nenne die balancierte binäre Rekursionstiefe.

<details><summary>Check-Werte</summary>

\(M(8)/A=32+8=40\), \(M(16)/A=16+16=32\), \(M(32)/A=8+32=40\). Bestes der drei ist \(k=16=\sqrt{256}\). Rekursionstiefe: \(\log_2 256=8\).

</details>

---

## 7 · MoE Routing, Load, Capacity und Overflow

**Quellen:** Lecture 04, PDF-S. 13–36, besonders S. 19, 24–30 und 34–36.

### Warum, wo, wie?

Mixture of Experts (MoE) ersetzt typischerweise die dichte Feed-Forward Network (FFN) Sub-Layer durch viele Expert FFNs, aktiviert pro Token aber nur \(k\) davon. Dadurch steigen Gesamtparameter und Spezialisierungskapazität, ohne dass jedes Token alle Experts berechnet. Der Router ist jedoch zugleich ein ML- und ein Systems-Problem: Ungleiche Loads erzeugen Overflow, All-to-All-Bottlenecks und Stragglers.

### Gleichungen, Symbole und Shapes

Falte alle Tokens in \(X\in\mathbb R^{T\times D}\). Für \(E\) Experts:

\[
Z=XW_r\in\mathbb R^{T\times E},\qquad P=\operatorname{softmax}(Z),
\]

\[
S_t=\operatorname{TopK}(P_t,k),\qquad
y_t=\sum_{e\in S_t}g_{te}\,f_e(x_t)\in\mathbb R^D.
\]

\(f_e\) ist Expert \(e\), \(g_{te}\) sein Gate Weight. Der Vertrag muss explizit sagen, ob nach Top-k nochmals über die ausgewählten Experts normalisiert wird. Sonst können die Gates beispielsweise zu 0.9 statt zu 1 summieren.

Load und ideale Load:

\[
n_e=\sum_t\mathbf1[e\in S_t],\qquad
\sum_e n_e=Tk,qquad n_{ideal}=Tk/E.
\]

Mit Capacity Factor \(c\):

\[
C=\left\lceil c\frac{Tk}{E}\right\rceil,qquad
overflow_e=\max(0,n_e-C).
\]

Overflow muss definiert behandelt werden: Token droppen, zu einer Alternative rerouten oder Kapazität dynamisch erweitern. Token Dropping macht Outputs batchabhängig, weil andere Tokens die Expert Capacity belegen können.

Für Top-1 Routing verwendet Switch-artiges Balancing häufig

\[
f_e=\frac1T\sum_t\mathbf1[\arg\max_j P_{tj}=e],\qquad
\bar P_e=\frac1T\sum_tP_{te},
\]

\[
L_{aux}=\alpha E\sum_e f_e\bar P_e.
\]

\(f_e\) misst harte Nutzung, \(\bar P_e\) bleibt differenzierbar. Gleichmäßiges Routing ergibt \(L_{aux}=\alpha\), nicht null. Ein Router z-loss stabilisiert zusätzlich Logit-Größen:

\[
L_z=\frac\beta T\sum_t\left(\log\sum_e e^{Z_{te}}\right)^2.
\]

### Worked Micro-Example

Für \(T=6,E=3,k=1,c=1\) ist \(C=\lceil6/3\rceil=2\). Routes `[0,0,0,1,1,2]` ergeben

\[
n=[3,2,1],\qquad overflow=[1,0,0].
\]

Bei \(f=[1/2,1/3,1/6]\) und mittleren Router Probabilities \(\bar P=[0.45,0.35,0.20]\):

\[
L_{aux}/\alpha=3(0.5\cdot0.45+\tfrac13\cdot0.35+\tfrac16\cdot0.20)=1.125.
\]

Ein perfekt balancierter Zustand hätte 1.0. Die Zahl 1.125 sagt jedoch noch nicht, **welches** Token bei Overflow betroffen ist oder ob Device Loads ausgeglichen sind.

Für ein einzelnes Token mit \(P=[0.1,0.7,0.2]\) und Top-2 sind rohe ausgewählte Gates `[0.7,0.2]`; nach Renormalisierung `[0.778,0.222]`. Beide Varianten existieren — die Architektur muss eine festlegen.

### Typischer Irrtum

Ein Auxiliary Balancing Loss ist keine harte Capacity-Garantie. Er verändert den Lernanreiz, kann aber innerhalb eines konkreten Batches weiterhin starkes Ungleichgewicht zulassen. Außerdem ist Expert Balance nicht automatisch Device Balance, wenn mehrere Experts auf demselben Device liegen.

### Retrieval

1. Warum sind Top-k Entscheidungen schwer direkt zu trainieren, obwohl die Router Probabilities differenzierbar sind?
2. Warum kann Token Dropping denselben Request abhängig von anderen Batch-Elementen verändern?

<details><summary>Lösungen</summary>

1. Die diskrete Auswahlmenge ändert sich sprunghaft; durch `argmax`/Top-k fließt kein gewöhnlicher Gradient. Praktische Systeme nutzen daher unter anderem differenzierbare Gate Weights plus heuristische Balancing Losses.
2. Expert Capacity wird batchweise geteilt. Andere Tokens können Slots desselben Experts belegen, sodass ein Token je nach Batch aufgenommen oder gedroppt wird.

</details>

### Objektiver Routing/Overflow Transfer Check

Gegeben \(T=10,E=4,k=2,c=1.2\) und Loads `[8,6,4,2]`: Berechne ideale Load, Capacity, Overflow je Expert und die Zahl ausgeführter Assignments, falls Overflow gedroppt wird. Nenne zusätzlich zwei Beobachtungen, die ein Systems Dashboard zeigen müsste.

<details><summary>Check-Werte</summary>

Ideale Load \(Tk/E=5\), Capacity \(C=\lceil1.2\cdot5\rceil=6\), Overflow `[2,0,0,0]`; von 20 Assignments werden 18 ausgeführt. Geeignete Dashboard-Signale sind beispielsweise per-Expert Load/Overflow, per-Device Load, All-to-All-Volumen, Dropped-Token-Rate oder Zeit des langsamsten Experts. Bestanden: alle Zahlen plus zwei Systems-Signale.

</details>

## Adaptionshinweise für die Lernplattform

- Jede Retrieval-Frage zunächst ohne Lösung anzeigen; Lösung erst nach einer eigenen Antwort aufklappen.
- Transfer Checks nicht über „erledigt“ markieren lassen: Shapes und Zahlen automatisch oder per exaktem Rubric prüfen.
- Worked Examples dürfen erklärt werden; die Assignment-Konfigurationen und deren Endergebnisse bleiben bewusst außerhalb dieser Remediation.
- Mastery erst nach einem zweiten, verzögerten Check mit geänderten Zahlen vergeben.
