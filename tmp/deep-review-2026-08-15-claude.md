# Deep Review 2026-08-15 — der Schrittzähler hört auf, Buchhaltung zu sein (v72)

Basis `dd73bca` (v71, Branch `claude/objective-dubinsky-6e7cf7`), per Fast-Forward in den Worktree
`jovial-dijkstra-8e5391` geholt — der Worktree stand auf einem 28 Commits alten Stand (v50), die
laufende Kette liegt auf `objective-dubinsky`. Ergebnis auf `claude/gallant-dijkstra-317d5d`.
**Nicht gepusht.**

## Wie das Ziel gewählt wurde

Die Kennzahl **Mission ohne exklusives Lab** liefert weiterhin `a4:pipeline-audit`,
`a4:web-extraction` und `a1:generation-experiments`. Keiner dieser drei wurde gebaut. Stattdessen
zuerst die Pflichtfrage: *welche konkrete Zahl verlangt das Handout, die die Plattform nirgends
rechnet?* — und die Trefferzählung nach den Bezeichnern der Rechnung selbst, nicht nach Themenwörtern:

```
torch.save        0        rng_state        0        m_hat / v_hat      0/0
alphaMax          0        warmupSteps      0        biasCorrection     0
Math.pow(beta     0        edge of stability 0       iteration          1  ← nur Prosa
Kosinus          16        Warmup          50        ← reichlich Prosa, eine einzige Rechnung
```

**Der Fund war kein Loch, sondern eine falsche Rechnung.** Die Plattform hat genau *eine* Funktion,
die einen Schedule ausrechnet — `schedule(step,warm,max,min=.1)` im alten `optimizer`-Lab
(Zeile 6894). Sie implementiert **zwei** der drei Zweige von A1 4.4:

- `T_c` ist hart auf **100** verdrahtet (`(step-warm)/(100-warm)`), `α_min` hart auf `0.1·α_max`;
- der dritte Zweig (`t > T_c → α_min`) **fehlt vollständig**;
- der Regler `optStep` endet bei genau 100, also bei `T_c` — der fehlende Zweig ist nicht nur
  ungerechnet, er ist **unerreichbar**.

Gleichzeitig steht der vollständige Vertrag als Prosa in der Plattform: das Konzept `schedules`
schreibt „nach T_c bleibt die Lernrate bei α_min", die `pitfalls` nennen „Beim Resume nur den
Optimizer laden: … setzt das Training mit einer falschen Lernrate fort", und `pytorch-state`
beschreibt sogar den Versuchsaufbau wörtlich: „Der stärkste Test vergleicht einen ununterbrochenen
Lauf mit Save/Reload: Der nächste Schritt muss übereinstimmen." **Die Plattform beschreibt das
Experiment und hatte kein Objekt, das es ausführt** — dasselbe Muster wie die `transferQuestion`
des `bpe`-Labs vor v71.

Dazu die zwei Missionstexte, die es selbst verlangen: `a1:optimization` schreibt in `derive`
„Rechne einen skalaren Zwei-Step-Optimierungsfall mit Momenten, **Bias Correction** … und
**Schedule-Grenzen** von Hand", `a1:training-state` in `failure` „Bei abweichendem Resume vergleiche
nächsten Batch, **Update-Step**, RNG und Optimizer-Momente – **nicht nur Gewichte**".

Getroffen werden damit zwei Handout-Probleme mit Adapter **und** Testbefehl:
`a1:learning_rate_schedule` (`get_lr_cosine_schedule`, `-k test_get_lr_cosine_schedule`) und
`a1:checkpointing` (`run_save_checkpoint`/`run_load_checkpoint`, `-k test_checkpointing`) — der seit
v57 offene und in v71 als Hebel 4 notierte Punkt. A1 5.2 verbindet beide selbst: „to resume the
learning rate schedule, we will need to know the iteration number we stopped at."

## Gebaut: Lab #47 `resume-contract`

„Der Schrittzähler: Schedule, Bias-Korrektur & Wiederanlauf", Modul `training`, 15 min.
46 wählbare Zustände, ~2176 angezeigte Werte.

### Modus A — die drei Zweige von A1 4.4

α_max = 1e-3, α_min = 1e-4, T_w = 200, T_c = 5000. Sechs Schritte × fünf Implementierungen.

| t | korrekt | ohne 3. Zweig | Nenner T_c | ohne Warmup | α_max im Term |
|---|---|---|---|---|---|
| 0 | 0 | = | = | **1,000000e-3** | = |
| 100 | 5,000000e-4 | = | = | **9,991120e-4** | = |
| 200 = T_w | 1,000000e-3 | = | = | **9,964516e-4** | **1,100000e-3** |
| 2600 | 5,500000e-4 | = | **5,782557e-4** | **5,217443e-4** | **6,000000e-4** |
| 5000 = T_c | 1,000000e-4 | = | **1,035484e-4** | = | = |
| 6000 | 1,000000e-4 | **1,929910e-4** | = | = | = |

**Kern:** Jede der vier falschen Varianten ist an mindestens einer Stelle exakt richtig, und
**keine zwei werden von derselben Menge Schritte entlarvt** — ein Guard erzwingt das. Der fehlende
dritte Zweig ist an **fünf von sechs** Schritten nicht von der Referenz zu unterscheiden; er zeigt
sich ausschließlich jenseits von T_c, und dort steigt die Lernrate auf das **1,93-fache von α_min**
statt konstant zu bleiben. Genau die Kurve, die wie ein gewollter Restart aussieht — A1 erwähnt
Restarts in einer Fußnote, hier ist keiner gewollt.

Die zwei Grenzen sind exakt geprüft, nicht ungefähr: bei t = T_w liefern beide Teilformeln
identisch α_max (deshalb ist ein Off-by-one **dort** folgenlos — die Stelle, an der die meisten
suchen), bei t = T_c exakt α_min. Der Nennerfehler landet dort auf 1,035484e-4 statt 1,000000e-4:
3,5 % daneben, auf keinem Kurvenbild sichtbar.

### Modus B — Zweig A gegen Zweig B, gerechnet

Ein Parameter θ₀ = 1, fester Gradientenstrom über 30 Schritte, AdamW **nach A1 Algorithmus 1**
(α_t = α·√(1−β₂ᵗ)/(1−β₁ᵗ), Weight Decay mit α und nicht α_t, t startet bei 1), derselbe Schedule in
klein. Vier Speicherzeitpunkte × vier Checkpoint-Inhalte.

Bei Speicherung nach Schritt 20:

| gespeichert | θ nach dem Laden | erste LR danach | Bias-Faktor | Abweichung |
|---|---|---|---|---|
| Modell + Optimizer + iteration | 0,98623028 | 3,5840e-4 | 0,161908 | **exakt null** |
| Modell + Optimizer | 0,98623028 | **2,0000e-4** | 0,161908 | 4,4873e-3 |
| Modell + iteration | 0,98623028 | 3,5840e-4 | **0,316228** | 3,5529e-4 |
| nur Modell | 0,98623028 | 2,0000e-4 | 0,316228 | 6,1111e-3 |

**Befund 1 — der Moment des Ladens beweist nichts.** Die Spalte θ ist in allen vier Zeilen
identisch, an allen vier Speicherzeitpunkten. Ein Test, der nach `load_checkpoint` die Gewichte
vergleicht, ist bei jedem dieser vier Checkpoints grün; die Abweichung entsteht erst im nächsten
Schritt. Der Renderer rechnet diese Gleichheit aus den Zeilen aus, statt sie zu behaupten.

**Befund 2 — die Rangfolge ist umgekehrt zur Intuition.** Vergessene AdamW-Momente kosten
3,5529e-4, ein vergessener Schrittzähler 4,4873e-3 — das **12,63-fache**. Die Reihenfolge hält an
allen vier Speicherzeitpunkten (Faktor 4,45 / 7,97 / 12,63 / 13,42), ein Guard prüft sie an jedem.
Die Momente sind gleitende Mittelwerte und laufen sich wieder ein; der Schedule tut das nicht.

**Befund 3 — ein zurückgesetzter Zähler macht den Schritt größer, nicht kleiner.** Die
Bias-Korrektur startet wieder bei t = 1 und damit bei Faktor **0,316228** statt 0,161908 — fast das
Doppelte. Das Lab zeigt beide Zähler nebeneinander (Schedule-Schritt und AdamW-Schritt), weil ein
verlorenes `iteration` genau einen von beiden bewegt und ein verlorener Optimizer genau den anderen;
Guards prüfen diese Trennung an allen vier Zeitpunkten.

**Befund 4 — die Richtung des Schedulefehlers kippt.** Bei Speicherung nach Schritt 5, 10 und 20 ist
die neu gestartete Warmup-Rate zu klein, nach Schritt 25 (2,0000e-4 gegen korrekt 1,5566e-4) zu
groß. Der Betrag bleibt, das Vorzeichen nicht.

### Der Fund aus Lecture 2

`Trace - lecture_02.pdf` hat einen eigenen Abschnitt `checkpointing()`, und der speichert:

```python
checkpoint = {"model": model.state_dict(), "optimizer": optimizer.state_dict()}
```

**Kein `iteration`.** Das Beispiel der Lecture ist wörtlich Zeile zwei der Tabelle oben. Die Lecture
zeigt den Mechanismus, A1 5.2 ergänzt das dritte Feld und nennt den Grund. Das Lab benennt diesen
Übergang und beziffert ihn; ein Guard hält Zeile zwei auf genau diesen zwei Feldern fest.
Registriert ist das Lab deshalb in **l02** — der einzigen Lecture, die wirklich einen Checkpoint
schreibt; ein Guard verbietet es den übrigen sechzehn.

## Verifikation

- `node --check` auf dem extrahierten Inline-Script, `new Function` auf `i18n-en.js`: grün.
- **132 Werte gegen eine unabhängig aus A1 4.4 und Algorithmus 1 neu getippte Referenz** —
  0 Abweichungen (Schedule aller fünf Varianten an allen sechs Schritten, Gradientenstrom
  elementweise, alle vier Checkpoints × vier Inhalte in θ, α, Bias-Faktor und Abweichung).
- `check-i18n` grün: **47 Labs, 2866 UI-Strings**, `resume-contract OK: 1147 values`.
- **Übersetzung:** alle sichtbaren Strings durch Rendern eingesammelt (nicht per Regex) und exakt
  gegen die Schlüssel der `ui`-Map geprüft, Pack als Objekt geladen, Abbruch unter 1000 Schlüsseln —
  0 fehlend. Danach **alle 46 Zustände in DE und EN gerendert** plus das Bedienfeld mit
  DOM-Übersetzung: 0 deutsche Rückstände, 0 `undefined`/`NaN`, Tags ausgeglichen. Der Scanner wurde
  vorher **bewiesen**: eine einzige entfernte Übersetzung erzeugt 30 Treffer.
- **Mutationstest: 51 Mutationen, 51 gefangen, 0 escaped, 0 inert.**

### Was der Mutationstest gefunden hat

Der erste Lauf meldete 44/2/2. Beide Escapes waren **dieselbe Fehlerklasse in neuer Ausprägung**:
der Guard leitete seine Referenz aus genau der Konstante ab, um die es ging. `aMin` von 1e-4 auf
2e-4 und `beta2` von .999 auf .99 blieben unentdeckt, weil die nachgetippte Referenz `RC_SCHEDULE`
beziehungsweise `RC_RUN` liest — die Rechnung blieb konsistent, aber die **Prosa** wurde falsch
(„fast doppelt so hoch wie α_min", „Bei t = 1 ist dieser Faktor 0,316228"). Geschlossen durch zwei
Guards, die den Satz prüfen statt die Rechnung. Zwei weitere Mutationen waren `INERT` (ein Anker kam
zweimal vor, einer gar nicht) und wurden durch eindeutige ersetzt; die eine davon deckte eine dritte
echte Lücke auf: die Schedulefunktion von Modus B hatte **gar keine** unabhängige Referenz und wurde
nur indirekt über die Resume-Zeilen berührt. Auch das ist jetzt geguardet.

Vor der Verifikation wurde die eigene Datenstruktur auf tote Felder geprüft: `first.adamStep` war
deklariert und von keinem Renderer gelesen. Statt es zu löschen wird es jetzt angezeigt — es ist die
klarste Form der Kernaussage, dass zwei Zähler existieren, und zwei neue Guards prüfen, dass die
beiden wirklich getrennt auseinanderlaufen.

## Nicht verifiziert

**Kein Browsertest.** `preview_start` ist in unbeaufsichtigten Läufen gesperrt (siehe Report v71,
unverändert). Ungeprüft blieben: Darstellung bei 360 px mit aufgeklappten `<details>`, die vierte
Tabellenspalte in Modus A, Konsolenfehler und das Verhalten der Selektoren im echten DOM. Ersatz war
das headless Rendern aller 46 Zustände in beiden Sprachen.

**Nachzuholen beim nächsten beaufsichtigten Lauf:** `#detail/lab/resume-contract` in DE und EN bei
360 px und 1280 px, beide Modi, und nach dem Versionssprung `getRegistrations().unregister()` +
`caches.delete()` — sonst zeigt der Browser v71. Der offene Browsertest aus v71 (`compression-ratio`)
kommt hinzu.

## Getroffene Entscheidungen (unbeaufsichtigt)

- **Registrierung in l02 statt l11.** Erste Wahl war l11, weil Konzept `schedules` und Formel
  `cosine-lr` dort hängen. Ein bestehender Guard hat das verhindert (das Modul eines Labs muss die
  Lecture zitieren, `MODULES.training.sources` sind `a1`/`l02`). Die Prüfung der PDFs hat die
  Korrektur bestätigt: L11 behandelt Cosine nur als das, was WSD ersetzt, L02 schreibt wirklich
  einen Checkpoint. Der Guard war hier schärfer als meine erste Absicht.
- **Das alte `optimizer`-Lab wurde nicht angefasst.** Seine `schedule()`-Funktion ist die
  zweizweigige Demo, die den Anlass gab. Sie zu reparieren wäre eine Änderung an einem fremden Lab
  mit eigenem Zahlenvertrag und eigener Prosa („Zwei getrennte Step-Begriffe"); das neue Lab rechnet
  den vollständigen Vertrag daneben. **Als eigener Hebel notiert.**
- **AdamW nach A1 Algorithmus 1, nicht in der m̂/v̂-Form.** Das Handout faltet die Bias-Korrektur in
  α_t und setzt ε **außerhalb** der Wurzel; das alte `optimizer`-Lab benutzt die andere Schreibweise.
  Beide sind gängig, nur eine steht im Handout.
- **Keine erfundene Trainingskurve.** Der Lauf ist ein einzelner Parameter mit festem
  Gradientenstrom und im Lab als bewusst winzig deklariert. Behauptet wird die Arithmetik, nicht ein
  Trainingsergebnis.
- **Kein RNG- und kein Datenpositions-Zustand.** `pytorch-state` nennt beide, A1 5.2 verlangt sie
  nicht, und ohne Modell wären ihre Kosten erfunden. Das Lab benennt sie in der Prosa und rechnet
  nur, was das Handout verlangt.
- **Keine Zeit-, Termin- oder Streak-Mechanik.**

## Stand

- Geändert: `index.html`, `i18n-en.js`, `scripts/check-i18n.mjs`, `sw.js` (Cache `cs336-shell-v72`,
  Bundle `?v=72`), `README.md` (47 Labs, Version 72).
- 46 Labs → 47; 2754 → 2866 UI-Strings.

## Nächste Hebel

1. **Browsertest von v71 und v72 nachholen** — der einzige offene Punkt beider Läufe.
2. **Die zweizweigige `schedule()` im `optimizer`-Lab.** Sie ist jetzt nachweislich unvollständig
   und steht neben einem Lab, das denselben Vertrag vollständig rechnet. Entweder auf `rcSchedule`
   umstellen oder ihre Prosa auf „Skizze" korrigieren — so ist sie ein Widerspruch in der Plattform.
3. **`a1:generation-experiments`** (20 P., 10 Probleme, kein exklusives Lab) — sieben der zehn
   Probleme hängen an `benchmark-validity`, dem Konzept mit den meisten Punkten der Plattform. Vor
   dem Bauen prüfen, welche Zahl die Ablationen verlangen; der Verdacht ist, dass es eine
   Vergleichbarkeitsregel ist und keine Metrik.
4. **`a4:pipeline-audit` / `a4:web-extraction`** (10 + 7 P.) — unverändert offen aus v71.
5. **`a4:exact_deduplication`** (3 P.) — unverändert offen aus v71.
