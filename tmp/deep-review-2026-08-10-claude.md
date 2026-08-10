# Deep Review 2026-08-10 — v67: der Advantage-Normalisierer wird eine Gewichtung über Prompts

Basis: `d04bb69` (v66) auf `claude/wonderful-jennings-ae0f73`. Der Worktree stand auf dem
veralteten `main` (1461c41) und wurde per `git merge --ff-only` auf die Kette gehoben.
Neuer Commit `b70a620` auf `claude/jovial-dijkstra-8e5391`, **nicht gepusht**.

## Vorprüfung statt Kennzahl

Die Prioritätenliste aus v66 nannte `a5:variants` (25 P.) an erster Stelle. Nach der Lehre
„Kennzahl ist Verdacht, nicht Befund" wurde zuerst geprüft, ob die Lücke echt ist — der
`grpo`-Lab deckt Baseline, Std-Konvention und Loss-Nenner bereits ab, also war ein
Duplikat möglich.

Die Lücke war echt und schärfer als notiert:

- **`advantage_normalizer` kam 0× in `index.html` vor** — der exakte Parametername, den das
  Handout in vier Problemen verlangt (`compute_group_normalized_rewards_drgrpo`,
  `_maxrl`, `think_about_advantage_normalization`, `grpo_train_step_variants_on_policy`).
- **`difficulty` kam genau 1× vor**, und zwar ausschließlich im rohen `scope`-String der
  Mission. `derive_difficulty_reweightings` ist mit **6 Punkten das teuerste Einzelproblem
  der Mission** (nach dem 10-Punkte-Experimentlauf) und hatte kein Objekt.
- Der `grpo`-Lab fixiert die Baseline auf das Gruppenmittel und kennt nur „Std ja/nein".
  **`baseline = "none"` (RFT) und `advantage_normalizer = "mean"` (MaxRL) rechnete nichts.**
- Der `grpo`-Lab stellt in seiner eigenen `transferQuestion` die Frage „Wie ändert
  Std-Normalisierung die Gewichtung leichter und schwerer Promptgruppen?" — und hat nur
  **eine** Gruppe, kann sie also nicht beantworten.

## Gebaut: Lab #42 `advantage-normalizers`

Modul `rlvr`, 16 min, registriert in `LECTURE_GUIDES.l16` (dessen eigene Lernzielzeile
wörtlich „GRPO-Varianten über Baseline, Normalisierer und Loss-Nenner vergleichen" lautet),
in `l17` (Trace-Zeile „variants like Dr. GRPO do not perform this normalization"), im Modul
und an **erster Stelle** der Mission `a5:variants`. Ein Prompt, G = 8 binäre Rollouts,
Antwortlängen [12, 60, …], Z = B·G·L = 4096. 30 Zustände.

### Modus A — die vier Einstellungen aus §5.4 nebeneinander

5 Promptgruppen × 2 Loss-Nenner × 2 eps-Modi.

Kernbefund, exakt: **auf der Gruppe, in der alle acht Rollouts scheitern, liefern alle vier
Varianten dieselbe Zeile aus Nullen**, und auf der Gruppe, in der alle acht gelingen, sind
drei der vier identisch — nur RFT lernt dort weiter (genau die L16-Folie „Could we avoid
RL-style negative gradients and just learn from positives?"). Das sind die beiden Gruppen,
die ein selbstgebauter Test am ehesten enthält.

Erst eine schiefe Gruppe trennt alles. Bei einer richtigen von acht steht an derselben
Position **0,875 (Dr. GRPO) · 2,474867 (GRPO) · 6,999944 (MaxRL)**, und RFT wirft **87,5 %
des Batches** weg — die Zahl, aus der die Handout-Notiz „reduce gradient_accumulation_steps
by the same factor" wird.

Weitere gerechnete Punkte:

- **`advantage_eps` ändert nirgends eine Zahl, außer wo der Nenner null ist.** Ohne ihn
  steht auf beiden uniformen Gruppen NaN (0/0) — im Modus `advantage_eps = 0` sichtbar.
- **Loss-Nenner:** Die Zeile sucht datengetrieben zwei verschieden lange Antworten mit
  demselben Advantage ungleich null und zeigt das Verhältnis ihrer Gesamtgewichte:
  **exakt 5,0000 mit festem Z, exakt 1,0000 mit dem Sequenzmittel.**
- **Spiegelung:** Der GRPO-Betrag der Minderheitsantwort ist bei η = 1/8 und η = 7/8
  dieselbe Zahl (2,474867) — die endliche Form der Symmetrie aus Modus B.

### Modus B — `derive_difficulty_reweightings` als Tabelle

5 Bezugspunkte × 2 Konventionen. Die Antworten auf (a)–(c) mit Z = G und G → ∞:
**w = 1 (Dr. GRPO), w = 1/std = 1/√(η(1−η)) (GRPO), w = 1/μ = 1/η (MaxRL).**

Die eigentliche Pointe steht in den Zahlen: **1/std ist symmetrisch in η ↔ 1−η**, gibt also
η = 0,125 und η = 0,875 dasselbe Gewicht 3,023716, und ist bei η = 0,5 **minimal** (2,0).
GRPO gewichtet nicht nach Schwierigkeit, sondern nach Sicherheit — und benachteiligt
ausgerechnet die Gruppen mit dem meisten Signal. Nur MaxRL ist monoton: dasselbe Paar
teilt es 8,0 gegen 1,1429, also genau im Verhältnis 7.

Brücke zwischen den Modi: Stichproben- und Populations-Std unterscheiden sich um den
konstanten Faktor √(G/(G−1)) = 1,069045, der in der relativen Spalte vollständig kürzt —
deshalb ist die Antwort der Herleitung unabhängig von der Konvention. Die relative Spalte
ist in beiden Konventionen zeichengleich; ein Guard prüft das.

## Ein eigener Fehler, von der Verifikation gefunden

Die erste Fassung der Längenzeile verglich fest die Antworten 1 und 2 und behauptete dazu,
beide trügen denselben Advantage. Auf der Gruppe η = 1/8 ist Antwort 2 die einzige richtige
— die Zeile zeigte dort **−35,0000** unter einem Satz, der für diese Gruppe schlicht falsch
war. Der Guard hatte nur die gemischte Gruppe geprüft, also genau den Fall, in dem die
Behauptung zufällig stimmte. Behoben: `advEqualAdvantagePair()` sucht das Paar aus den
Daten; die uniformen Gruppen sagen jetzt ausdrücklich, dass der Längeneffekt dort nicht
isolierbar ist. Der Guard läuft nun über **alle** Gruppen.

## Verifikation

- **Unabhängige Referenz** (`scratchpad/ref.mjs`, aus Gleichungen (34)–(43) getippt, nicht
  aus der App abgeleitet): 990 + 6 Werte in `check-i18n`, 0 Abweichungen.
- **Echtes DOM:** 1430 gerenderte Zahlen je Sprache über 30 Zustände, **0 Abweichungen**
  in DE und EN.
- **Sprachprüfung:** 0 deutsche Rückstände im EN-Modus über alle 30 Zustände plus beide
  Kurzcheck-Pfade (132 Textknoten); 0 englische Rückstände im DE-Modus. 82 neue UI-Strings.
- **Kurzcheck:** 27/27 Kombinationen — 1 akzeptiert, 26 mit Hinweis abgewiesen, 0 Leckage,
  leerer Zustand abgewiesen. Die Persistenzprüfung wurde selbst geprüft (löschen → liest
  `false`), und ein erster Testlauf meldete fälschlich eine Leckage, weil das **Testskript**
  die Flagge zwischen Kombinationen nicht zurücksetzte — nicht die App.
- **Layout:** kein Overflow bei 375 px und 1280 px in allen Zuständen, alle 10 sichtbaren
  Bedienelemente ≥ 44 px, Konsole leer, Reload-Restore stellt Auswahl und Erfolgs-Callout her.
- **Guards:** `check-i18n` grün (**42 Labs, 2394 UI-Strings**). **45 Mutationen, alle 45
  gefangen, 0 escaped, 0 inert.**

Drei Guards fielen im ersten Mutationslauf durch und wurden verschärft:

1. Die Symmetrie-Prüfung nannte 0,125 und 0,875 fest, statt zu verlangen, dass die Leiter
   überhaupt ein Spiegelpaar enthält.
2. Der Renderer-Guard verlangte den Bezeichner `nanCount`, der auch in der Deklaration
   steht — jetzt den Anzeige-Ausdruck `${nanCount?\`<br><strong>`.
3. Der Kurzcheck-Guard suchte `'"offpolicy-clip","advantage-normalizers"'` im Quelltext und
   wurde von der **Labs-Liste des Moduls** erfüllt, nicht von `OBJECTIVE_LAB_IDS` — jetzt
   liest er die Deklaration selbst. Wieder dieselbe Lehre: eine Prüfung muss lesen, was sie
   behauptet zu prüfen.

## Bewusst nicht gemacht

- **Kein Eintrag in `LECTURE_GUIDES` über l16/l17 hinaus** — nur diese beiden PDFs nennen
  Dr. GRPO bzw. Expert Iteration; L15 hat null Treffer.
- **Kein Slider für die Gruppengröße G in Modus A** — alle Punkte der Mission hängen an den
  vier festen Einstellungen; G als Regler hätte die Leiter in Modus B mitverschieben müssen.
- **Kein echter GLM/Trainingslauf** — die Gewichte gelten im Grenzfall G → ∞ und sind als
  solcher deklariert; die endliche Gegenprobe steht als eigener Callout daneben.
- **`grpo_experiments_variants_on_policy` (10 P.)** bleibt ein Messlauf ohne Zahlenvertrag.

## Nächste Hebel

1. `a5:on-policy-grpo` (23,5 P.) — **erst prüfen**, ob `policy-loss-tracer` den Vertrag
   schon deckt; nach der v66-Erfahrung ist die Vorprüfung die halbe Arbeit.
2. `a4:pipeline-audit` / `a4:tokenize-train` (je 10 P., nur `data-pipeline`).
3. `a1:checkpointing` / Resume-Vertrag (seit v57 offen, 1 Punkt, aber echter Testvertrag).
