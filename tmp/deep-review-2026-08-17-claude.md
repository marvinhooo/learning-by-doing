# Deep Review 2026-08-17 — NoPE hört auf, ein Handout-Titel zu sein (v74)

Basis `1802791` (v73, Branch `claude/deep-review-v73`). Der zugewiesene Worktree
`brave-clarke-bb2f60` stand wieder auf `1461c41` (v50, 28 Commits alt) — die Kette liegt auf
`deep-review-v73`. Neuer Branch `claude/deep-review-v74` von `1802791`. **Nicht gepusht.**
Keine Codex-Aktivität seit 33 Stunden (letzte Dateiänderung 2026-08-16 07:48), also gebaut
statt nur berichtet.

## Wie das Ziel gewählt wurde

v73 hat seinen eigenen nächsten Hebel benannt: `no_pos_emb`/NoPE als Rechnung. Die Kennzahl
war wie immer nur der Verdacht, der Beleg kam aus der Trefferzählung:

```
NoPE                 3 (DE) / 4 (EN)   ← Handout-Titel + eine Zeilenbeschriftung des v73-Ledgers
Kazemnejad           0        absolute Position    0        1/t                 0
„position embedding" 0        keine Positions…     0
—— dagegen ——
RoPE                51        Rotation            31
```

v73 hatte NoPE als *Zeile* im Parameterledger eingeführt (RoPE hat keine Parameter, der
Vergleich ist exakt kontrolliert) und im eigenen Report festgehalten, dass damit *was* NoPE
inhaltlich bedeutet weiterhin unerklärt bleibt. Genau das war noch offen.

**Der Fund lag wie schon bei `lsh`, `bpe` und den Ablationen in den Quellen selbst.**
A1 §7.3 begründet die Ablation mit einem Satz, den die Plattform nirgends aufgriff:

> „decoder-only transformers, i.e., those with a causal mask as we have implemented, can in
> theory infer relative or absolute position information without being provided with position
> embeddings explicitly [Tsai et al. 2019; Kazemnejad et al. 2023]" (A1.txt 2243–2245)

Und L3 formuliert das Entwurfsziel, gegen das sich alle drei Varianten messen lassen:

> „a relative position embedding should be some 𝑓(𝑥,𝑖) s.t. ⟨𝑓(𝑥,𝑖), 𝑓(𝑦,𝑗)⟩ = 𝑔(𝑥,𝑦,𝑖−𝑗)"
> (L03.txt 357–359), dazu „Sine: Has various cross-terms that are not relative" und
> „Absolute: obviously not relative" (365–369)

Beide Sätze waren Prosa. Das bestehende `rope-rotation`-Lab prüft die *Implementierung*
(Pairing, Winkel, Positionsindex) und sagt die relative Eigenschaft selbst nur als Behauptung
an — „die Attention-Scores hängen weiterhin nur vom Abstand zweier Positionen ab". Keine
Überschneidung.

## Gebaut: Lab #49 `position-signal`

Modul `transformer`, 16 min, registriert in **l03** (ein Guard hält fest, dass es genau diese
eine Lecture ist), im Modul `transformer` und in `a1:generation-experiments` — dort an
**zweiter** Stelle: der v73-Guard reserviert die Führung für `ablation-controls`, das alle vier
Ablationen abdeckt, während dieses Lab eine davon vertieft. Die Reihenfolge ist damit auch
didaktisch richtig. 22 Zustände, zwei Modi.

### Modus A — Ist die Positionsinformation relativ? (2 Inhalte × 2 Tabellen × 4 Abstände)

Drei Varianten nebeneinander: gar keine, additiv (`Embed(x,i) = v_x + u_i`), RoPE. d = 4,
Θ = 100, damit beide Paare in wenigen Positionen auseinanderlaufen.

**Der Befund ist eine 2×3-Wahrheitstabelle, und sein Kern ist, dass L3s Bedingung zwei
Prüfungen sind, nicht eine.** Vier Positionspaare mit *demselben* Abstand, danach vier
*verschiedene* Abstände am selben Startpunkt:

| Variante | Spannweite bei gleichem Abstand | Spannweite bei verschiedenem Abstand |
|---|---|---|
| NoPE | **exakt 0** ✓ | **exakt 0** ✗ |
| additiv | 6,0 (gelernte Tabelle) ✗ | 5,0 ✓ |
| RoPE | **< 6,7·10⁻¹⁶** ✓ | 2,544047 ✓ |

**NoPE besteht ausgerechnet die erste Prüfung — und zwar aus dem falschen Grund.** Ein
NoPE-Score ist gegen jede Verschiebung beider Positionen invariant, weil er überhaupt keine
Position enthält. Wer nur diese Prüfung macht, hält die Ablation für unauffällig. Das ist die
Fehlannahme, die das Lab benennt.

Die additive Spalte scheitert an genau den Kreuztermen, die L3 nennt: der Score zerfällt in
⟨v_q,v_k⟩ + ⟨v_q,u_j⟩ + ⟨u_i,v_k⟩ + ⟨u_i,u_j⟩, und die beiden mittleren hängen an je einer
absoluten Position allein. In der Termtabelle steht die erste Spalte in allen vier Zeilen gleich
und die Summe trotzdem verschieden — der Unterschied kommt vollständig aus den Kreuztermen.
Mit der Ganzzahltabelle sind das **10 / 6 / 12 / 11**, von Hand nachrechenbar, Spannweite exakt 6.
Zwei Tabellen (Sinus wie im Originaltransformer, gelernt als kleine Ganzzahlen) belegen, dass
der Befund nicht an der Tabelle hängt, sondern daran, dass überhaupt addiert wird.

RoPEs Null ist keine Messung, sondern eine Identität: (R(θ_i)q)·(R(θ_j)k) = qᵀR(θ_j−θ_i)k. Das
Lab rechnet beide Wege und zeigt den Abstand als reinen Gleitkommarest (max. 4,4·10⁻¹⁶).

### Modus B — Was die kausale Maske allein lesbar macht (2 × 3)

Gleiche Logits, kausale Maske, ein Kanal. Position t sieht genau t Tokens, der Softmax verteilt
exakt 1/t, und ein einziges unterscheidbares Token schreibt damit **genau 1/t** in seinen Kanal:
1, 1/2, 1/3, 1/4 … Die absolute Position folgt als Kehrwert, exakt, **ohne ein einziges
Positionsembedding und ohne eine einzige gelernte Zahl**.

**Die Kontrolle ist der Punkt des Modus.** Stellt man die Markierung ab, bleibt alles gleich —
dieselbe Maske, dieselben Gewichte 1/t — und die Ausgabe ist an jeder Position exakt eins. Aus
einer Konstanten folgt keine Position. Der Satz aus A1 hat also **zwei** Voraussetzungen, nicht
eine: die Maske liefert die Fenstergröße, aber es braucht etwas Unterscheidbares im Fenster,
damit die Fenstergröße im Ergebnis auftaucht.

**Und dann die Zahl, die den Modus trägt.** Der Abstand zweier Nachbarpositionen ist
1/(t·(t+1)), relativ also 1/(t+1) — er schrumpft, während der Wert selbst nur wie 1/t schrumpft.
Ein Format mit p Signifikandenbits kann relative Abstände unter etwa 2^(−p) nicht mehr trennen,
ein Zusammenfallen ist deshalb frühestens ab t + 1 > 2^(p−1) möglich (bewiesene Untergrenze,
im Lab ausgewiesen und von einem Guard unterhalb der Grenze geprüft).

| Format | Signifikandenbits | erstes Zusammenfallen | in A1s Kontextlänge 256 |
|---|---|---|---|
| fp32 | 24 | keines bis 4096 | 256 von 256 unterscheidbar |
| fp16 | 11 | **1464** | 256 von 256 |
| bf16 | **8** | **190** | **234 von 256**, 22 Nachbarpaare fallen zusammen |

**In bf16 endet der Kanal bei t = 190 — innerhalb der Kontextlänge 256, die A1 §7.2.1 selbst
vorschreibt.** Und die Reihenfolge kippt gegen die Intuition: das ältere fp16 hält den Kanal
länger als bf16, weil bf16 Signifikand gegen Exponentenbereich tauscht. Genau dieser Kanal
zahlt dafür — eine direkte Brücke zum `mixed-precision`-Lab aus v63.

### Was das Lab bewusst nicht behauptet

Modus B ist eine **Konstruktion, keine Messung**: gleiche Logits, ein markiertes Token, ein
Kanal. Sie beweist, dass die Information vorhanden und exakt auslesbar ist — nicht, dass ein
trainiertes NoPE-Modell sie so ausliest oder überhaupt benutzt. Die Rundungsgrenze gilt für
diesen einen Kanal in diesem einen Format, nicht für die Genauigkeit eines ganzen Modells; ein
Modell kann dieselbe Information über mehrere Kanäle und Schichten verteilen. Das steht als
eigener Absatz im Lab, und die Transferantwort sagt ausdrücklich, welche der beiden Zahlen
*keine* Aussage über trainierte Modelle ist. Was A1 §7.3 verlangt, bleibt die Lernkurve.

Ebenso in Modus A: der Score steht vor Skalierung und Softmax, bei d = 4 und Θ = 100 statt A1s
Θ = 10000 — das ändert die Zahlen, nicht das Muster, weil die Identität für jede Basis und jede
gerade Breite gilt. Welche Variante besser *trainiert*, entscheidet keine dieser Tabellen.

## Verifikation

- **2.166 Guard-Werte** gegen eine **unabhängig getippte Referenz** (A1s Winkelregel, RoPE,
  beide Positionstabellen, die Scores aller drei Varianten, die Rundung auf p Bits) — 0 Abweichungen.
- Zuerst eine **Python-Referenz** aus den Quellen geschrieben, *bevor* App-Code entstand; alle
  Kennzahlen (190 / 22 / 234 / 1464) stammen von dort und wurden in JS unabhängig reproduziert.
- **Rundung doppelt abgesichert:** einfache Rundung auf p Bits gegen die Doppelrundung
  double→fp32→bf16 verglichen — **0 Abweichungen** über alle 1/t, die Kennzahlen hängen also
  nicht an der Definition.
- **22 Zustände × 2 Sprachen headless gerendert**: 4.369 Zahlen je Sprache, **0 Abweichungen in
  der Anzahl**, 0 `undefined`/`NaN`, keine unaufgelösten Template-Literale, keine deutschen Reste
  im englischen Render.
- **Übersetzungen laufzeitgeprüft** statt gegrept: `localizedUi` instrumentiert — 99 distinkte
  Strings, davon 95 neu, **0 ohne englischen Eintrag**; dazu die 27 statischen Textknoten des
  Kontrollpanels.
- `check-i18n` grün: **49 Labs, 3.094 UI-Strings** (vorher 48 / 2.975).
- **Mutationstest 45/45 — 0 escaped, 0 inert.**
- Kein Browsertest — `preview_start` ist in unbeaufsichtigten Läufen gesperrt (siehe
  `cs336-unattended-no-preview`). Ersatz ist das headless Rendern aller Zustände in beiden Sprachen.

### Zwei inerte Mutationen, und was sie über die eigenen Guards verrieten

Der erste Durchlauf meldete 0 escaped, aber **2 inert** — und nach der Lehre aus v73 ist eine
Mutation, die kein Bit ändert, kein bestandener Test, sondern ein untauglicher. Beide Fälle
waren echt und beide sind jetzt aufgelöst:

1. **„Rundung verliert ties-to-even" war inert**, weil 1/t **nie** auf einer Tie-Grenze landet:
   ein Tie verlangt, dass 1/t in p+1 Bits exakt darstellbar ist, und Kehrwerte von
   Nicht-Zweierpotenzen sind unendliche Binärbrüche. Über alle drei Formate und t ≤ 4096:
   **0 Ties**. Der Zweig ist für die Labordaten also unerreichbar. Statt ihn zu entfernen (und
   damit eine subtil falsche Rundung auszuliefern) hält jetzt ein Guard **beides** fest: dass
   kein Eingabewert des Labs je einen Tie erzeugt, und dass die Regel auf Werten, die es tun,
   die IEEE-Regel ist. Damit wird die Mutation gefangen statt ignoriert (+192 Guard-Werte).
2. **„Kontextkollisionen ±1 an der Grenze" war inert**, weil das Paar (256, 257) in **keinem**
   der drei Formate zusammenfällt. Der gezählte Bereich 1…255 ist trotzdem der semantisch
   richtige (beide Positionen müssen im Fenster liegen). Die Mutation ist durch eine sichtbare
   Bereichsänderung ersetzt, und ein Guard hält die Randbedingung ausdrücklich fest, damit
   niemand den Bereich für willkürlich hält — falls ein Format je an der Grenze kollidiert,
   schlägt er an.

Dazu ein eigener Fehler, den erst die Registrierung fand: das Lab stand zunächst an **erster**
Stelle von `a1:generation-experiments` und brach damit den v73-Guard, der diese Stelle für das
Lab reserviert, das alle vier Ablationen abdeckt. Der Guard hatte recht — korrigiert auf Platz zwei.

## Bewusst nicht

- **Eine Lernkurve erfinden.** Das Lab rechnet, was vor der GPU-Stunde feststeht, und sagt das.
- **Behaupten, NoPE sei schlechter.** Beide Modi entscheiden das nicht und schreiben es hin.
- **Das alte `optimizer`-Lab reparieren** (zweizweigiger Schedule mit hart verdrahtetem
  T_c = 100) — fremdes Lab mit eigenem Zahlenvertrag, seit v72 offen.
- **`LECTURE_GUIDES` über l03 hinaus** — ein Guard verbietet es, die Mutation dagegen wurde gefangen.

## Nächste Hebel

1. **`a1:learning_rate` / `a1:batch_size_experiment`** — „edge of stability" hat weiterhin
   0 Treffer, und v73 hat den Hebel schon benannt. Modus B dieses Labs liefert die Vorlage:
   eine Größe, die vor dem Lauf feststeht, gegen eine, die ihn braucht.
2. Die zweizweigige `schedule()` im `optimizer`-Lab auflösen (seit v72 offen).
3. `a4:pipeline-audit` und `a4:web-extraction` sind nach v74 die größten Missionen ohne
   exklusives Lab.
