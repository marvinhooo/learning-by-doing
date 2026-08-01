# Deep Review 2026-08-01 — RMSNorm & SwiGLU interaktiv gemacht

**Basis:** `dd25971` (v56). Worktree `confident-satoshi-b06651`, Branch `claude/quizzical-dijkstra-d518c3`,
per Fast-Forward auf die offene Kette gehoben (kein Rebase-Konflikt).
**Ergebnis:** **v57**, Commit `e30e6e1`, **nicht gepusht**.
**Keine parallele Codex-Session:** `index.html`/`i18n-en.js` mtimes vom 26./29. Juli, also mehrere Tage alt.

## Wie der Hebel gewählt wurde

Kein weiteres Coverage-Audit. Stattdessen gezählt: **welche A1-Codeprobleme mit exaktem
Zahlenvertrag haben kein interaktives Objekt?** Grundlage waren die 49 Probleme mit
Adapter-Hook aus `HANDOUT_PROBLEMS` gegen die Labs ihrer Mission.

Befund: `a1:rmsnorm` (Konzept `rmsnorm`) und `a1:positionwise_feedforward` (Konzept `swiglu`)
waren die letzten beiden A1-Primitiven mit einem exakten Zahlenvertrag und **keinem** Lab, das
diesen Vertrag übt. Die Missions-Labs (`pytorch-debugger`, `shapes`, `einsum-pattern`,
`rope-rotation`) decken Registrierung, Shapes, Achsenbindung und Rotation ab — die
Reduktionsachse, die ε-Platzierung, den Gain und die SwiGLU-Zweigrollen keines davon.
Lecture 3 führte damit 9 Konzepte gegen 2 Labs. Das deckt sich mit dem Kandidaten, den der
v56-Lauf notiert hatte.

Die Verträge wurden vor dem Bauen wörtlich aus dem Handout geholt (`pdftotext`):
§3.4.1 Gleichung (4) inkl. „ε unter der Wurzel" und dem FP32-Upcast-Absatz, §3.4.2
Gleichung (7) inkl. „d_ff = 8/3·d_model, Vielfaches von 64", Abbildung 3 (SiLU gegen ReLU)
und Gleichung (6) als die GLU, die man mit (7) verwechselt.

## Gebaut: Lab `norm-and-ffn` — „RMSNorm & SwiGLU: Achse, ε und Gate"

15 min, Modul `transformer`, bespoke-interaktiv nach dem `loss-and-clip`/`dpo-loss`-Muster
(zwei Modi in einem Lab). Registriert in `LECTURE_GUIDES.l03`, `MODULES.transformer`,
A1-Mission `tensor-primitives`, `OBJECTIVE_LAB_IDS`, `initLab`, `restorePassedLab`.

**Modus A — RMSNorm:** 5 Eingabefälle × 5 Implementierungen, ε = 1e−5, Doppelgenauigkeit,
Vergleich auf sechs Nachkommastellen.

| Variante | 1 Token, g=1 | große Akt. | Akt. ≈ ε | Mittelwert 0 | trainierter Gain |
|---|---|---|---|---|---|
| `epsOutside` (ε neben der Wurzel) | entlarvt | **versteckt** | entlarvt | entlarvt | entlarvt |
| `layerNorm` (Mittelwert abziehen) | entlarvt | entlarvt | entlarvt | **versteckt** | entlarvt |
| `flatMean` (Reduktion über alles) | **versteckt** | **versteckt** | **versteckt** | entlarvt | entlarvt |
| `noGain` (Gain vergessen) | **versteckt** | **versteckt** | **versteckt** | **versteckt** | entlarvt |

**Modus B — SwiGLU:** 4 Eingabefälle × 5 Implementierungen, feste Gewichte D=2 → F=3 → D=2.

| Variante | x=[1,1] | x=[0,0] | x=[2,2] | x=[3,−1] |
|---|---|---|---|---|
| `swapBranches` (SiLU auf W₃) | **versteckt** | **versteckt** | **versteckt** | entlarvt |
| `plainGlu` (σ statt SiLU, Gl. 6) | **versteckt** | **versteckt** | entlarvt | entlarvt |
| `noGate` (W₃-Zweig fehlt) | **versteckt** | **versteckt** | entlarvt | entlarvt |
| `reluGate` (ReLU statt SiLU) | entlarvt | **versteckt** | entlarvt | entlarvt |

### Die didaktischen Kernpunkte

1. **Der Handtest beweist fast nichts.** Ein Token mit dem frisch initialisierten Gain — das
   Erste, was man rechnet — kann die falsche Reduktionsachse *strukturell* nicht sehen (bei
   einer Zeile ist der Mittelwert über den Tensor derselbe wie der über D) und den fehlenden
   Gain auch nicht (A1 initialisiert g mit Einsen, die Multiplikation ist die Identität).
   Erst geladene Referenzgewichte trennen beides — genau das stellt `test_rmsnorm` her.
2. **Der Nulltest ist wertlos, obwohl er grün wird.** Bei x = 0 liefern alle fünf
   SwiGLU-Varianten dieselbe Ausgabe, weil jede entweder mit null multipliziert oder eine bei
   null verschwindende Funktion auswertet. Der Einservektor versteckt immer noch drei von vier,
   weil er beide Zweige gleichsetzt *und* SiLU(1) = σ(1) erzwingt.
3. **ε ist kein Rundungsdetail, sondern skalenabhängig.** Bei quadratischem Mittel 125000 ist
   die Abweichung 3,994e−8 und unter jeder Anzeigegenauigkeit; sobald das quadratische Mittel
   unter ε fällt (1,5625e−6), ändert dieselbe Zeile das Ergebnis um Faktor 2,7.
4. **Keine der acht falschen Varianten verändert eine Shape**, und alle wären als Architektur
   brauchbar — das Modell trainiert, die Lernkurve verrät nichts.
5. **d_ff ist keine freie Wahl:** eine statische Ledger-Zeile rechnet 512 → 1344 und
   1600 → 4288 vor; beide Zahlen stehen wörtlich im Handout.

Dazu ein objektiver Drei-Feld-Transfer-Kurzcheck über `user.labChecks` mit Restore.

## Verifikation

- **Unabhängige Referenz:** Gleichungen (4) und (7) getrennt vom App-Code neu getippt; danach
  die Funktionen der Plattform aus `index.html` extrahiert und per `Object.is` verglichen —
  **180 Werte, 0 Abweichungen.** Die Hidden/Exposed-Matrix wurde aus der Referenz abgeleitet
  und stimmt mit der Prosa des Labs überein.
- **Echtes DOM:** alle 45 Kombinationen in DE und EN durchgeschaltet, Zahlen identisch, alle
  Verdict-Banner korrekt („deckt es auf" / „deckt es nicht auf"), Kurzcheck leer/falsch/richtig,
  Reload-Restore.
- **EN:** `check-i18n` grün (**32 Labs, 1469 UI-Strings**); über alle 45 Kombinationen kein
  deutscher Reststring. Ein echtes Leck gefunden und geschlossen: `"Ausgabe"` hatte keinen
  `ui`-Eintrag.
- **Layout:** kein Overflow bei 375 px und 1280 px (per `getBoundingClientRect`/`scrollWidth`
  gemessen, nicht per Screenshot — die Browser-Pane scrollt weiterhin nicht), Touch-Ziele 44 px,
  Konsole leer.
- **Erreichbarkeit:** Labs-Index, Lecture 3 (zeigt jetzt 3 Experimente), A1-Mission
  `tensor-primitives`, Modul `transformer`.
- **Guards:** 14 neue in `check-i18n.mjs` (ε-Fixierung, beide Hidden/Exposed-Kontrakte,
  Struktur der Fälle, Nulltest-Eigenschaft, W₁x=1 im Einserfall, Verlinkung l03/Modul/Mission,
  d_ff-Rundung gegen das Handout-Beispiel). **Fünf negativ getestet — alle lösen aus.**

## Nebenbefund und Fix

`hidden` auf einem `<label class="field">` wirkt **nicht**, weil `.field { display: grid }` das
Attribut überschreibt — beide Modi zeigten ihre Selektoren gleichzeitig. Im Browser gefunden,
nicht im Code-Review. Die Modusfelder liegen jetzt in schlichten `<div>`s, wie `loss-and-clip`
es schon macht. **Für künftige Labs mit Modi: das Muster von `loss-and-clip` übernehmen.**

Nebenbei die veraltete README-Zahl korrigiert (29 → 32 interaktive Labs; stand seit v51 falsch).

## Bewusst nicht gemacht

- **FP32-Upcast als eigene Variante.** Das Handout begründet ihn mit Overflow beim Quadrieren.
  In simulierter bf16 lässt sich der Effekt nicht ehrlich zeigen, ohne ε-Exaktheit zu verlieren;
  der Punkt steht als Prosa in der Konzeptseite und im `misconception`-Feld.
- **Eintrag in weitere `LECTURE_GUIDES`** — beide Primitiven gehören zu Lecture 3.
- **Grundlagen-Verkettung** (Navigationsvertrag), wie in allen Vorläufen.

## Nächster Kandidat nach demselben Maßstab

`a1:data_loading` (2 Punkte, Adapter `run_get_batch`, Konzept `token-array-loading`): exakter
Vertrag mit exklusivem Startindexbereich n−m, X/Y-Slices und der Invariante Y_b[:−1] = X_b[1:].
Die Mission `training-state` führt drei Labs, aber alle drei sind von anderen Missionen geborgt
(`pytorch-debugger`, `optimizer`, `resources`) — kein einziges übt den Off-by-one. Dieselbe
Hidden/Exposed-Konstruktion trägt: ein Batch mit m = n − 1 versteckt den Randfehler, eine
Kontextlänge, die glatt aufgeht, versteckt den Slice-Fehler.
