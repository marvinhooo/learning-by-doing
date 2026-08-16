# Deep Review 2026-08-16 — vier Ablationen hören auf, eine Zeile Code zu sein (v73)

Basis `dbece8f` (v72, Branch `claude/gallant-dijkstra-317d5d`). Der zugewiesene Worktree
`upbeat-elion-a3a969` stand wieder auf `1461c41` (v50, 28 Commits alt) — die Kette liegt auf
`gallant-dijkstra`. Neuer Branch `claude/deep-review-v73` von `dbece8f`. **Nicht gepusht.**

## Wie das Ziel gewählt wurde

Die Kennzahl **Mission ohne exklusives Lab** liefert nach v72 noch `a1:generation-experiments`
(20 Punkte, **10 Probleme** — der größte A1-Block ohne eigenes Lab), `a4:pipeline-audit`,
`a4:web-extraction`, `a4:tokenize-train`, `a3`-Missionen, `a5:pg-math`. Die Kennzahl war wie
immer nur der Verdacht. Der Beleg kam aus der Trefferzählung nach den Bezeichnern der Rechnung:

```
NoPE                 1   ← und zwar ausschließlich der rohe Handout-Titel "Implement NoPE"
Positionskodierung   0        Kazemnejad          0        absolute Position   0
postNorm             0        preNorm             0        gradient norm       0
d_ff = 4·d_model     0        FFN_SiLU            0        ungated             0
mod 64               0        edge of stability   0        activation scale    0
—— dagegen ——
SiLU                48        GLU                69        pre-norm           25
post-norm           13 (Prosa)                    residual            38
```

Drei der vier Ablationen aus A1 §7.3 hatten damit **kein Objekt, das irgendetwas rechnet**, und
`no_pos_emb` hatte nicht einmal eine Erklärung: `NoPE` kommt in der gesamten Plattform genau
**einmal** vor, im rohen `HANDOUT_PROBLEMS`-Titel, und in `i18n-en.js` **null** mal.

**Der Fund lag wie schon bei `lsh`, `precision-recall` und `bpe` in der Lecture selbst.**
Lecture 3 führt die Frage aus, die A1 dann messen lässt:

- „Almost all modern LMs use pre-norm (but BERT was post-norm)" und, als einzige Begründung,
  „Observations – nicer gradient propagation, fewer spikes" (Zeilen 115, 209). Die Plattform hat
  dafür das Konzept `pre-post-norm` mit genau derselben Behauptung als Prosa — **und nichts, das
  einen Gradienten durch einen Block rechnet.**
- „Note: Gated models use smaller dimensions for the 𝑑ff by 2/3" (Zeile 276) und, eine Folie davor,
  „note that we have an extra parameter (V)". Genau die Regel, mit der A1 §7.3 den Parameterabgleich
  von `swiglu_ablation` begründet — und die `transformer-ledger` mit `3DF` nur für **eine** Seite
  rechnet. Die FFN_SiLU-Seite (`2D·4D`) existierte nirgends.

Dazu die Formulierung, an der die ganze Ablation hängt: A1 schreibt „your FFN_SiLU implementation
should instead set d_ff = 4 × d_model, **to approximately match** the parameter count". Wie
ungefähr „approximately" ist, sagt das Handout nicht.

## Gebaut: Lab #48 `ablation-controls`

Modul `transformer` (sources `a1`/`l02`/`l03`), 15 min, registriert in **l03** (ein Guard hält
fest, dass es genau diese eine Lecture ist), im Modul `transformer` und an **erster Stelle** von
`a1:generation-experiments`. 32 Zustände, zwei Modi.

### Modus A — Der Parameterledger der vier Ablationen (4 Konfigurationen × 5 Zeilen)

Vier Breiten, alle nach A1s eigener Regel `d_ff = round₆₄(8·d_model/3)`, die an beiden vom Handout
selbst genannten Ankern reproduziert wird: **512 → 1344** (§7.2.1) und **1600 → 4288** (§3.4,
wörtlich „the nearest multiple of 64 to 8/3 × 1,600").

**Erster Befund — drei der vier Ablationen sind von selbst kontrolliert, und das ist keine
Redensart, sondern exakt null.** `pre_norm_ablation` verschiebt die Norm (zwei Gains je Block
davor wie danach) und `no_pos_emb` entfernt eine Rotation ohne trainierbare Parameter: Δ = **exakt
0** an allen vier Konfigurationen. `layer_norm_ablation` entfernt `2·L·d_model + d_model` Werte,
beim TinyStories-Modell **−4.608 von 22.696.448**, also **−0,0203 %**.

**Zweiter Befund — der gesamte SwiGLU/FFN_SiLU-Unterschied ist die Rundung.** Ungerundet sind
beide Seiten identisch: 3 Matrizen der Breite 8D/3 sind 8D², 2 Matrizen der Breite 4D ebenfalls 8D².
Der Unterschied je Block ist deshalb exakt `3·d_model·Rest`, relativ `3·Rest/(8·d_model)`:

| d_model | 8D/3 | d_ff | Rest | Δ je Block | Δ relativ | Δ gesamt |
|---|---|---|---|---|---|---|
| 512 (A1 §7.2.1) | 1365,3333 | 1344 | **−21,3333** | −32.768 | **−1,5625 %** | **+131.072** (SiLU ist größer) |
| 768 | 2048,0000 | 2048 | **0** | 0 | **0 %** | **exakt 0** |
| 1024 | 2730,6667 | 2752 | **+21,3333** | +65.536 | +0,7813 % | −262.144 |
| 1600 (A1 §3.4) | 4266,6667 | 4288 | **+21,3333** | +102.400 | +0,5000 % | −4.915.200 |

Das **Vorzeichen kippt**: bei der Breite, die A1 für alle vier Ablationen vorschreibt, ist
ausgerechnet das *ablatierte* Modell das größere (+0,58 %). Und der Abgleich ist **genau dann
exakt, wenn d_model durch 24 teilbar ist** — die einzige Bedingung, unter der 8D/3 schon ein
Vielfaches von 64 ist. Die Forward-FLOPs folgen derselben Identität (SwiGLU `6DF`, FFN_SiLU `16D²`).

**Dritter Befund, der die Pointe des Modus ist:** der Eingriff mit dem größten Effekt des ganzen
Abschnitts (`layer_norm_ablation`) ist der mit dem kleinsten Parameterunterschied. Was diese vier
Eingriffe verändern, steht nicht in der Parameterzahl — Überleitung zu Modus B.

### Modus B — Der Residualpfad (3 Platzierungen × 4 Blockstärken)

Vier Features, zwölf Blöcke, Startvektor mit RMS eins. Unterblock `F(x) = c·Q·x` mit einer festen
Drehung um θ = 60°. Weil `I + cQ` damit konform ist, ist **jede** Zahl exakt statt gemessen:

- **keine Norm:** Länge *und* Gradient werden je Block mit exakt `λ = |1 + c·e^(iθ)| =
  √(1 + 2c·cos θ + c²)` multipliziert. Über zwölf Blöcke: **5,112059** bei c = 0,25,
  28,722900 bei c = 0,5, **exakt 729** bei c = 1 (√3¹² = 3⁶) und **exakt 117.649** bei c = 2 (√7¹² = 7⁶).
- **Pre-Norm:** der Stream wächst je Block um exakt `c·cos θ` — also **linear** in der Tiefe
  (0,125 / 0,25 / 0,5 / 1,0 je Block), weil der Unterblock immer einen normierten Vektor sieht und
  deshalb immer einen Beitrag derselben Länge schreibt.
- **Post-Norm:** RMS **exakt 1 an jeder Tiefe**. Die Skala kann strukturell nicht entgleisen.

**Der schärfste Einzelwert ist ein einziger Test an allen drei Platzierungen.** Schickt man die
Richtung des Residual Stream selbst durch die Jacobi-Matrix eines Blocks, steht dort

| Platzierung | \|J·x\|/\|x\| |
|---|---|
| Pre-Norm | **1** (bis auf den ε-Rest: 1,0000000114) |
| Post-Norm | **0** (bis auf den ε-Rest: 3,3·10⁻⁶) |
| keine Norm | **λ** (1,732051 bei c = 1) |

Pre-Norm reicht den Identitätspfad exakt durch; Post-Norm **löscht** ihn — ein Post-Norm-Block ist
für Änderungen entlang des Streams blind; ohne Norm wird er Block für Block mit λ multipliziert.
Das ist die Rechnung hinter Lecture 3s „nicer gradient propagation", und sie ist von Hand
nachprüfbar.

**Damit ist A1s eigene Frage beantwortet** („What happens at the previous optimal learning rate?
Can you get stability by using a lower learning rate?"): der Faktor ist `λ^L`, hängt also im
**Exponenten an der Tiefe**, während die Lernrate ein einziger konstanter Faktor davor ist.

### Was das Lab bewusst nicht behauptet

Der erste Entwurf von Modus B benutzte zufällige Matrizen mit SiLU und lieferte eine **unklare**
Geschichte: bei c = 1 schrumpfte der Stream ohne Norm sogar. Der zweite Entwurf in 2D war exakt,
aber **irreführend** — im Zweidimensionalen ist der Tangentialraum eindimensional, und Post-Norm
zeigte je Schicht exakt Faktor 1,0000, was den Eindruck erweckt hätte, die Platzierung sei
folgenlos. Erst die 4D-Fassung ist beides. Und sie zeigt etwas, das der Folklore widerspricht:
**Post-Norm begrenzt vorwärts wie rückwärts, es entgleist nichts.** Genau das steht deshalb als
eigener Absatz im Lab: der Unterschied, den Lecture 3 berichtet (Loss-Spikes, Warmup-Empfindlichkeit),
hängt an *gelernten* Gewichten, und diese Tabelle entscheidet ihn nicht. Sie zeigt, was allein die
Platzierung festlegt. Eine Behauptung, die das Modell nicht trägt, wäre schlimmer als keine.

## Verifikation

- **632 Guard-Werte** gegen eine **unabhängig getippte Referenz** des gesamten Stapels (Vorwärts,
  Rückwärts, Radialtest) und gegen die neu getippte A1-Parameterformel — 0 Abweichungen.
- Beide von A1 selbst genannten `d_ff`-Anker reproduziert (1344, 4288); beide Rundungsrichtungen
  und der rest-freie Fall müssen in der Konfigurationsliste vorkommen, sonst ist der Vorzeichenwechsel
  nicht sichtbar (Guard).
- **32 Zustände × 2 Sprachen headless gerendert**: 3.234 Zahlen je Sprache, **0 Abweichungen in der
  Anzahl**, 0 `undefined`/`NaN`, 0 Konsolenfehler.
- **Übersetzungen laufzeitgeprüft** statt gegrept: `localizedUi` wurde instrumentiert — 86 distinkte
  Strings, **0 ohne englischen Eintrag**; dazu 43 statische Textknoten des Kontrollpanels, **0 ohne
  Eintrag**. Der Scanner ist als sehend bewiesen: vor dem Einfügen meldete er 106 Lücken, danach 0,
  und er hat vier Strings gefunden, die die Quelltext-Suche übersehen hatte (Ternaries innerhalb
  von `tr(...)`).
- `check-i18n` grün: **48 Labs, 2.975 UI-Strings**.
- **Mutationstest 56/56, 0 escaped, 0 inert.**
- Kein Browsertest — `preview_start` ist in unbeaufsichtigten Läufen gesperrt (siehe
  `cs336-unattended-no-preview`). Ersatz ist das headless Rendern aller Zustände in beiden Sprachen.

### Vier eigene Fehler, die erst die Verifikation gefunden hat

1. **Der Kurzcheck behauptete „drei"** und erklärte im selben Satz, dass nur zwei exakt null sind —
   die richtige Antwort für die gerundeten Breiten ist **zwei**. Korrigiert samt Preset und
   Erfolgstext.
2. **`toLocaleString("de-DE")` fest verdrahtet** — die englische Oberfläche hätte „4.608" gezeigt,
   also vier Komma sechs. Auf `localeCode()` umgestellt (der Rest der Plattform macht es so).
3. **„Post-Norm löscht sie exakt"** war mit ε = 1e−5 in der RMSNorm nicht exakt. Prosa auf „bis auf
   den ε-Rest" geschärft, DE und EN, plus ein Guard, der genau diese Grenze prüft.
4. **Drei Renderer-Guards waren blind**, und alle drei aus demselben Grund: sie suchten einen
   Ausdruck, den derselbe Renderer an **zwei** Stellen benutzt, sodass die Mutation der ersten
   Stelle unbemerkt blieb. Beim Zählen der Vorkommen half nicht — der Gradientenfaktor ohne Norm
   **ist** λ¹², die Zahl stand also weiterhin zweimal da. Alle drei sind jetzt auf das Markup der
   konkreten Zeile verankert (`λ¹² = …</strong>`, `= …</strong>`, `<td>… %</td>`) und werden gegen
   das **wirklich gerenderte HTML** geprüft statt gegen den Quelltext. Erst danach 0 escaped.
   Verwandt mit der Lehre aus `cs336-guard-verification-lessons`, aber eine Stufe schärfer:
   *ein Guard, der eine Zahl sucht, prüft nicht die Zeile, in der sie stehen soll.*

## Bewusst nicht

- **NoPE als eigene Rechnung.** Der Ledger belegt, dass RoPE keine Parameter hat und der Vergleich
  damit exakt kontrolliert ist; *was* NoPE inhaltlich bedeutet, bleibt unerklärt. Das ist die
  größte verbliebene Lücke dieses Blocks (siehe nächste Hebel).
- **Das alte `optimizer`-Lab reparieren** (v72s Hebel 2, zweizweigiger Schedule mit hart
  verdrahtetem T_c = 100) — fremdes Lab mit eigenem Zahlenvertrag, weiterhin offen.
- **Eine Lernkurve erfinden.** Das Lab rechnet, was vor der GPU-Stunde feststeht, und sagt das auch.
- **LECTURE_GUIDES über l03 hinaus** — ein Guard verbietet es, die Mutation dagegen wurde gefangen.

## Nächste Hebel

1. **`no_pos_emb`/NoPE als Rechnung** — jetzt naheliegend, weil der Ledger steht und die Lücke
   benannt ist: kausale Attention über vier Tokens, mit und ohne RoPE, und der exakte Punkt, dass
   NoPE *nicht* „keine Positionsinformation" heißt (ein unterscheidbares Token macht 1/t sichtbar).
   Lecture 3 nennt NoPE selbst („Long-range info via NoPE, short-range info via RoPE + SWA").
2. Die zweizweigige `schedule()` im `optimizer`-Lab auflösen (seit v72 offen).
3. `a1:learning_rate`/`a1:batch_size_experiment` — „edge of stability" hat weiterhin 0 Treffer.
