# Deep Review v102 — 2026-09-06 — die zwei Streuungen, von denen A5 nur eine kennt

Fortsetzung von [v101](deep-review-2026-09-05b-claude.md). Der zugewiesene Worktree stand auf
**v99** (`2ed21e7`), der Kettenkopf auf **v101** (`3d234bb`, Branch
`claude/confident-knuth-2b11ab`) — Fast-Forward, kein Merge. Kein Codex aktiv (Haupt-Checkout
mtimes Juli). Neu gegenüber v101: **`origin/main` steht jetzt auf `2ed21e7` (v99)**, die Kette
ist also nur noch ab v100 ungepusht statt ab v86.

Auftrag ist unverändert der Gesamtauftrag: derselbe Wissensstand wie aus der Vorlesung, und die
Assignments lösen können.

## Die Suche, und die vier Verdachtsmomente davor

v101 hinterließ als offene Punkte nur noch drei Konzepte ohne Lab, die **null** Probleme
entscheiden. Der Hebel musste also aus einer neuen Richtung kommen. Vier Kandidaten wurden
geprüft und **verworfen**:

| Kandidat | Messung | Befund |
| --- | --- | --- |
| Probleme ohne Adapter/Testbefehl | 49 von 124 tragen einen Adapter, 50 einen Testbefehl | die 10 Code-Probleme ohne Testbefehl sind Skripte und Experimente, für die A1–A5 keinen vorsehen — **kein Befund** |
| Lecture-Abschnitte ohne Abdeckung | Abschnittsindex aus `main()` der acht Trace-PDFs gegen die kuratierten Konzepte | L10s zwölf Abschnitte (Quantisierung, Pruning, Speculative, Continuous Batching, Paged) sind alle in der Prosa — **kein Befund** |
| Formelkarten als Sackgasse | `renderFormulaDetail` rendert kein `data-open-lab` und kein `data-open-concept` | echt, aber die Karten sind aus den Lecture-Seiten erreichbar, auf denen die Labs daneben stehen — **schwacher Hebel**, nicht verfolgt |
| Diagnose ohne Anschluss | 12 Bereiche, jeder auf ein Konzept gemappt, jedes Konzept hat seit v93/v100 sein Lab | **kein Befund** |

Der fünfte Faden trug. Ausgangspunkt war eine Prosastelle ohne Rechnung: die
A5-Voraussetzungskarte „Mehrere Zufallsstarts" sagt, mehrere Seeds „zeigen Mittelwert und
Streuung" — und nannte keine einzige Zahl.

## Der Befund

**A5 verlangt an drei benoteten Stellen ein Urteil über Streuung**, zusammen **16 Punkte**:

- `grpo_experiments_standard_on_policy` (10 P.): „Log the following metrics … while noting the
  variance between runs", Deliverable „describing … how much variance there is between runs",
  und eine Accuracy von mindestens 25 % **„averaged across random seeds"**.
- `grpo_learning_rate` (3 P.): **„Based on the amount of variance you observed in the previous
  part, you should decide how many random seeds you want to use for each training run."**
- `grpo_prompt_ablation` (3 P.): „Which prompts have the best average reward, and the lowest
  variance? … **Based on the variance between runs, how confident are you in your findings?**"

Entscheidendes Konzept ist für alle drei — und zusätzlich für A1s vier Ablationen (4 P.) —
`benchmark-validity`. Zusammen **20 Punkte auf einer Konzeptseite**.

**Diese Konzeptseite kannte genau eine Streuung.** Ihr Begriff „Stichproben-Standardfehler"
definierte `SE = √(p(1−p)/n)` als „die statistische Unsicherheit einer gemessenen Accuracy",
und `details[1]` nannte als einzige Einschränkung „gemeinsame Themen und Subgruppen". Die
Trefferzählung nach den Bezeichnern der anderen Rechnung: `Standardfehler` 16, `1,96` 3 — aber
**null Stellen im Repo, die eine Streuung über Läufe bilden**. Das Muster aus v90 und v101:
Prosa reichlich, Rechnung keine.

**Und das ist die falsche Größe für die gestellte Frage.** A5 §4.3 begründet die andere selbst:
*„the policy gradient estimator can have high variance and RL is self-reinforcing"*, weshalb
*„RL training run trajectories tend to have very high variance"*. Wer die Formel der
Konzeptseite auf ein GRPO-Ergebnis anwendet, bekommt ein Intervall über die **Testfälle** statt
über die **Läufe** — und es ist das engere der beiden, sieht also überzeugender aus.

Gegenprobe nach der v100-Regel („ist eine Modulgrenze die Ursache?"): **negativ**. Kein
bestehendes Lab bildet eine Streuung über Läufe. `baseline-variance` rechnet die Varianz des
*Schätzers* in einem Schritt — eine dritte, gut verwechselbare Größe. `evaluation`,
`answer-parsing` und `winrate-lc` rechnen alle drei den Stichprobenfehler über die Testfälle.

## Das Lab `seed-variance`

Modul `evaluation`, auf **l12**, im **A5-Block `on-policy-grpo`** (also neben den drei Problemen,
nicht daneben) und an `benchmark-validity` gekoppelt. Zwei Modi, beide in geschlossener Form.

**Modus A — die zwei Quellen nebeneinander**, bei A5s eigenen Werten (n_val = 1.024, Zielwert
25 %, vier Seeds, σ = 3 Prozentpunkte):

| Größe | Wert |
| --- | --- |
| Stichprobenfehler über die Testfälle `√(p(1−p)/n_val)` | **1,353165** Prozentpunkte |
| Standardfehler des Mittels über Seeds `σ/√n` | **1,500000** Prozentpunkte |
| Verhältnis | 1,108513 × |
| was die berichtete Zahl wirklich trägt | **2,020162** |
| um wie viel das Intervall der Konzeptseite zu eng ist | **49,2917 %** |
| Streuung, bei der beide gleich groß sind | **2,706329** Prozentpunkte |

Die beiden schrumpfen an **verschiedenen Hebeln**: mehr Validierungsbeispiele senken nur die
erste, mehr Seeds nur die zweite — über 120 Rasterpunkte geprüft.

**Die Punchline:** weil A5 alle Seeds auf **derselben** Validierungsmenge auswertet, ist ihr
Stichprobenfehler in jedem Lauf derselbe und mittelt sich beim Mitteln **nicht weg**. Der
Gesamtfehler fällt streng, erreicht aber **nie** die Bodenplatte 1,353165 — bei 256 Seeds steht
er noch auf 1,366093. Eine je Seed frisch gezogene Menge (die A5 nicht freigibt) nimmt diesen
Boden weg; der Vergleich steht im Lab, damit sichtbar ist, welcher Teil des Fehlers an der
Vorschrift hängt und nicht am Zufall.

**Modus B — was das Budget hergibt.** Der Preis eines Laufs ist die einzige Zahl, die das
Handout nicht druckt; er wird deshalb **abgeleitet und nie geraten**: A5 gibt
`grpo_experiments_standard_on_policy` zwei B200-Stunden und verlangt darin vier Seeds, also
höchstens **0,500000 Stunden je Lauf** (obere Schranke, weil Teil (b) zusätzlich läuft). Die
vier B200-Stunden von `grpo_learning_rate` kaufen damit **acht Läufe**, bei drei Lernraten
**zwei Seeds je Arm** — und der kleinste belegbare Abstand ist
`δ_min = 1,96·σ·√(2/n)` = **5,880000 Prozentpunkte** bei einem Zielwert von 25 %.

| gewünschter Abstand | Seeds je Arm | Läufe | B200-Stunden | Anteil am Budget |
| --- | --- | --- | --- | --- |
| 1 Punkt | 70 | 210 | 105,0000 | 26,2500 × |
| 2 Punkte | 18 | 54 | 27,0000 | **6,7500 ×** |
| 4 Punkte | 5 | 15 | 7,5000 | 1,8750 × |
| 8 Punkte | 2 | 6 | 3,0000 | 0,7500 × |

Weil `n` mit 1/δ² wächst, **vervierfacht jede Halbierung des gewünschten Abstands die
GPU-Stunden**. Damit steht die Antwort, die A5 wirklich verlangt: die belegbare Antwort auf
„welche Lernrate ist besser" ist bei dieser Streuung und diesem Budget oft **keine Rangfolge**,
sondern der Satz, ab welchem Abstand eine Rangfolge belegt wäre.

## Die Korrektur der Prosa

Zwei Stellen behaupteten in beiden Sprachen, `√(p(1−p)/n)` sei „die" Unsicherheit einer
gemessenen Accuracy — der Begriff `Stichproben-Standardfehler` und `details[1]`. Beide sagen
jetzt, dass diese Formel dem Score *dieses einen Modells* gilt und nicht dem Verfahren, das es
erzeugt hat, dass die zweite Hälfte nur mit der Zahl der Läufe schrumpft, und dass sie bei
geteilter Validierungsmenge beim Mitteln gar nicht verschwindet.

## Prüfung

- **Guard-Suite 53 → 54 Blöcke grün**, Build grün, Cache-Bump auf v82, README 62 → 63 Labs.
- Neuer Block **`seed variance`** (2.536 Checks) auf einem **anderen Rechenweg als die App**:
  der Stichprobenfehler wird durch **termweise Aufzählung der Binomialverteilung** (5.379 Terme,
  Log-Gamma für die Koeffizienten) neu gebildet, wo die App die geschlossene Form nimmt; die
  Seedzahl für einen Abstand wird **von eins aufwärts gezählt** statt geschlossen, jeweils mit
  der Zahl darunter als Gegenprobe; die Bodenplatte wird über einen Sweep bis 4.096 Seeds
  gehalten (streng fallend, nie erreicht) und die frisch gezogene Menge als Kontrast dazu; der
  Kreuzungspunkt über **200.000 σ-Werte gescannt** mit beiden Seiten geprüft; die Quadratur über
  1.600 weitere Paare.
- `concept experiments` 87 → **88 Paare**, `lab render sweep` 54 → **55 von 63 Labs**,
  `lab prose anchors` 330 → **343** Zahlen — jede Zahl der neuen Labkarte ist damit als auf dem
  Schirm erreichbar belegt.
- **Mutationstest: 18 Mutationen, 18 gefangen, 0 entkommen**, Kontrolle vor und nach allen
  Läufen grün. Acht davon fängt `lab prose anchors` zuerst; um zu messen, was der **neue** Block
  allein leistet, wurden genau diese acht in einer Suite-Kopie ohne den Anker-Block noch einmal
  gefahren: er fängt **alle acht selbst**, jede mit der Meldung, die die Ursache benennt (etwa
  „the price of a run is 0.4 and does not equal the handout's 2 hours divided by its 4").
- **Kein Browsertest** — in geplanten Läufen gesperrt.

## Was offen bleibt

1. Die drei Konzepte ohne Lab (`dataset-lineage`, `copyright-licensing`,
   `alternative-sequence-models`) entscheiden weiterhin **null** Probleme.
2. `renderFormulaDetail` bleibt eine Sackgasse: 79 Formelkarten bieten weder Konzept- noch
   Labknopf an. Gemessen als schwacher Hebel, weil die Karten aus den Lecture-Seiten erreichbar
   sind, auf denen die Labs ohnehin stehen — aber der nächste naheliegende Zuschnitt.
3. `origin/main` steht auf `2ed21e7`; **v100 bis v102 sind ungepusht**.
