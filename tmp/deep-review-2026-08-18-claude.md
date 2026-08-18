# Deep Review 2026-08-18 — Die Kante der Stabilität hört auf, Folklore zu sein (v76)

Basis `9021497` (v75, Branch `claude/deep-review-v75`). Der zugewiesene Worktree
`recursing-merkle-4b39e0` stand wie üblich auf `1461c41` (v50, 25 Commits alt) — die Kette lag
auf `deep-review-v75`. Per `git merge --ff-only` aufgeholt, neuer Branch
`claude/deep-review-v76`. **Nicht gepusht.**

Keine Codex-Aktivität seit ~12 Stunden (letzte Dateiänderung 2026-08-17 19:32), also gebaut
statt nur berichtet. **Hinweis für den nächsten Lauf:** im Worktree `frosty-swirles-966e50`
(v75) liegen **719 ungespeicherte Zeilen** in `index.html`, `i18n-en.js` und
`scripts/check-i18n.mjs`, seit 12 Stunden unangetastet. Ich habe auf dem *committeten* Kopf
gebaut und diese Arbeitskopie nicht angefasst; wenn sie später committet wird, ist ein
Konflikt in der 1,8-MB-Datei möglich.

## Wie das Ziel gewählt wurde

v74 hat seinen eigenen nächsten Hebel benannt: `a1:learning_rate` / `a1:batch_size_experiment`,
„edge of stability" mit 0 Treffern. Die Kennzahl war wieder nur der Verdacht — der Beleg kam aus
der Trefferzählung und aus dem, was die Treffer tatsächlich *sind*:

```
edge of stability     0    Krümmung / curvature   0    Hessian          0
Eigenwert/eigenvalue  0    Konditionszahl         0    McCandlish       0
critical batch        3  ← und das ist der Punkt
```

Die drei `critical batch`-Treffer stehen alle in **einem einzigen Lernzielsatz**
(„Erklären, warum Batchgröße (Critical Batch Size) und Lernrate bei fairen Vergleichen
mitentschieden werden müssen"). Der Begriff war benannt und **nirgends gerechnet** — dasselbe
Muster wie bei `lsh`, `bpe`, den Ablationen und NoPE. Kein bestehendes Lab überschneidet sich:
`cosine-lr` ist die Form des Schedules, `optimizer` der AdamW-Schritt, `global-batch` die
Buchhaltung von B_global, `gradient-clip` die Norm. Keines fragt, *wann* ein Schritt überhaupt
konvergiert.

**Der Fund lag wieder in den Quellen selbst.** A1 stellt die Behauptung auf und lässt sie stehen:

> „Folk wisdom is that the best learning rate is 'at the edge of stability.' Investigate how the
> point at which learning rates diverge is related to your best learning rate." (A1.txt 2122–2124)

Und L9 definiert die kritische Batchgröße in einer Zeile, die exakt genug für eine Rechnung ist:

> „Critical batch = min number of examples for target loss / min number of steps for target loss"
> (L09.txt 362), dazu „strong diminishing returns past a certain point" (360)

L1 nennt die Quelle dafür beim Namen: „Batch size (e..g, critical batch size) [McCandlish+ 2018]"
(L01.txt 278). Alle drei Sätze waren in der Plattform Prosa.

## Gebaut: Lab #50 `stability-edge`

Modul `training`, 18 min, registriert in **l02** (ein Guard hält fest, dass es genau diese eine
Lecture ist — L2 implementiert SGD als `p.data -= lr * grad`, also genau den Schritt, dessen
Stabilität das Lab entscheidet), im Modul `training` und in `a1:generation-experiments` an
**dritter** Stelle: der v73-Guard reserviert die Führung für `ablation-controls`, v74 hat
`position-signal` auf Platz zwei gesetzt. 28 Zustände, zwei Modi.

### Modus A — Wo eine Lernrate divergiert (4 Krümmungen × 4 Lernraten)

Quadratische Zielfunktion f(θ) = ½ Σ λ_i θ_i². Ein Gradientenschritt ist in jeder Richtung
dieselbe Multiplikation: θ_i ← (1 − ηλ_i)θ_i. Damit ist alles exakt:

| | Wert | woher |
|---|---|---|
| Divergenzschwelle | η_div = 2/λ_max | \|1 − ηλ_max\| < 1 |
| beste Lernrate | η_opt = 2/(λ_max + λ_min) | balanciert schnellste und langsamste Richtung |
| **ihr Verhältnis** | **κ/(κ+1)** | hängt an nichts als der Konditionszahl |

**Der Befund ist, dass A1s Folk Wisdom eine Aussage über Kondition ist und nicht über
Gradientenabstieg.**

| κ | η_opt als Anteil von η_div |
|---|---|
| 1 | **50,0000 %** ← die Folk Wisdom ist hier schlicht falsch |
| 10 | 90,9091 % |
| 100 | 99,0099 % |
| 1000 | **99,9001 %** ← praktisch nicht mehr unterscheidbar |

Bei κ = 1 liegt das Optimum bei der *halben* Schwelle und trifft das Minimum in einem einzigen
Schritt (Kontraktion exakt 0). Erst mit wachsender Konditionszahl rückt es an den Rand — und
reale Netze sind extrem schlecht konditioniert. Die Folk Wisdom stimmt also in der Praxis und
scheitert ausgerechnet in dem Fall, den man am ehesten von Hand nachprüft.

**Die zweite Zahl des Modus ist für A1s Aufgabe (b) die praktisch entscheidende.** A1 verlangt
„at least one divergent run". Ein Prozent über der Schwelle wächst die schärfste Richtung mit
1,02 pro Schritt — bis zum Faktor 1000 sind das **349 Schritte**, und währenddessen fällt der
Loss durch die anderen Richtungen weiter. Eine Kurve über 100 Schritte zeigt hier nichts, oder
schlimmer: einen Lauf, der besser aussieht als der stabile daneben. Bei doppelter Schwelle ist
es nach **7** Schritten offensichtlich. Wer die Schwelle fein sucht, muss entsprechend lang
fahren — sonst findet er nicht den Divergenzpunkt, sondern das Ende seiner Laufzeit.

Der Sweep enthält bewusst den Punkt η = η_div selbst, an dem der Betrag exakt 1 ist: weder
Konvergenz noch Divergenz, die Amplitude bleibt stehen. Ein Guard hält fest, dass genau dieser
Punkt in der Liste steht.

### Modus B — Was eine Batchgröße kostet (6 Batchgrößen × 2 Tuningregeln)

L9s Definition als Rechnung: B_crit = E_min/S_min. Mit S_min = 2000 und E_min = 512.000 ist
B_crit = 256, und daraus folgen McCandlishs zwei Beziehungen S/S_min = 1 + B_crit/B und
E/E_min = 1 + B/B_crit. **Alle Zeilen sind ganzzahlig, eine Rundung kann sich nicht verstecken:**

| B | Schritte | Beispiele | S/S_min | E/E_min | optimale LR |
|---|---|---|---|---|---|
| 1 | 514.000 | 514.000 | 257 | 1,0039 | 1/257 |
| 64 | 10.000 | 640.000 | 5 | 1,25 | 1/5 |
| 128 | 6.000 | 768.000 | 3 | 1,5 | 1/3 |
| **256** | **4.000** | **1.024.000** | **2** | **2** | 1/2 |
| 1024 | 2.500 | 2.560.000 | 1,25 | 5 | 4/5 |

Die kritische Batchgröße ist exakt der Punkt mit dem **doppelten Minimum an beidem**. Beide
Beziehungen sind dieselbe Hyperbel: (S/S_min − 1)(E/E_min − 1) = 1, im Ledger als Gegenprobe
ausgewiesen, zusammen mit E = B·S — eine Konsistenzbedingung, die der Code nirgends annimmt.

**Damit beantwortet der Modus A1s wörtliche Frage** („is it true that we always want batch sizes
to be large?") mit einem Wechselkurs statt mit einer Meinung: von 64 auf 128 fallen die Schritte
auf 60 % bei 120 % Beispielen, von 1024 auf 2048 nur noch auf 90 % bei 180 %. Der Kurs
verschlechtert sich monoton (0,5 → 1 → 2 → 4 → 8 → 16); ein Guard prüft genau diese Monotonie.
Das ist L9s „strong diminishing returns" als Zahl.

**Und dann der Befund, der die beiden Modi verbindet.** A1 schreibt in dieselbe Aufgabe: „The
learning rates should be optimized again if necessary." Die optimale Lernrate wächst mit
B/(B + B_crit). Tunt man sie einmal bei B = 128 und fährt damit den ganzen Sweep, dann liegt

- der Lauf bei **B = 1** um den Faktor **85,6667 über** seiner eigenen optimalen Lernrate,
- der Lauf bei **B = 1024** um den Faktor **2,4 darunter**.

Der Sweep vergleicht dann keine Batchgrößen, sondern verschieden schlecht getroffene Lernraten —
und die Fehlrichtung ist tückisch: die kleinen Batches liegen zu *hoch*, divergieren, und man
notiert „kleine Batches funktionieren nicht". **Modus A liefert die Größenordnung, die das
entscheidet:** bei κ = 100 liegt zwischen bester Lernrate und Divergenz genau ein Prozent. Ein
Faktor 85 ist weit jenseits davon. Ein Guard prüft auch die *Richtung*: unterhalb des
Tuningpunkts zu groß, oberhalb zu klein.

### Was das Lab bewusst nicht behauptet

Beide Modi sind Modelle, keine Messungen, und sagen das je in einem eigenen Absatz.

Modus A gilt für feste Krümmung und reinen Gradientenabstieg — ohne Rauschen, Momente, Schedule.
Ein Transformerloss ist nicht quadratisch, AdamW macht keinen reinen Gradientenschritt, **2/λ_max
ist keine Vorhersage für einen echten Lauf**. Der Absatz nennt ausdrücklich auch den Effekt, den
dieses Modell *nicht* hat: in echten Netzen wächst die Krümmung während des Trainings, bis sie
selbst an 2/η anstößt — die Schwelle bewegt sich also auf die Lernrate zu, statt fest zu stehen.
Das ist der eigentliche „edge of stability"-Effekt der Literatur, und das Lab beansprucht ihn
nicht, sondern grenzt sich davon ab.

Modus B: S_min, E_min und damit B_crit sind **gesetzt, nicht gemessen** — gewählt, damit B_crit
eine runde 256 ist. Exakt ist die Struktur (Hyperbel, doppeltes Minimum, monotoner Wechselkurs),
nicht der Zahlenwert. Auch B/(B + B_crit) ist ein Modell; es sagt richtig voraus, *dass* die
optimale Lernrate steigt und sättigt, nicht *welcher* Wert herauskommt.

## Verifikation

- **191 Guard-Werte** gegen eine **unabhängig getippte Referenz** — 0 Abweichungen.
- Zuerst eine **Python-Referenz** aus den Quellen geschrieben (exakte Brüche via `Fraction`),
  *bevor* App-Code entstand; alle Kennzahlen (50 % / 90,9091 % / 99,0099 % / 99,9001 % / 349 / 7 /
  256 / 85,6667 / 2,4) stammen von dort und wurden in JS unabhängig reproduziert.
- **28 Zustände × 2 Sprachen headless gerendert**: **17.620 Ziffern je Sprache, identisch**,
  0 `undefined`/`NaN`, keine unaufgelösten Template-Literale, keine deutschen Reste im
  englischen Render.
- **Übersetzungen laufzeitgeprüft** statt gegrept: `localizedUi` instrumentiert — 104 distinkte
  Strings, alle 104 neu, **0 ohne englischen Eintrag**.
- `check-i18n` grün: **50 Labs, 3.198 UI-Strings** (vorher 49 / 3.094).
- `node --check` auf dem extrahierten Inline-Script und auf `i18n-en.js`.
- **0 Identifier-Kollisionen** (30 Namen) und **0 doppelte DOM-IDs** (13 IDs) im gemeinsamen
  1,8-MB-Scope.
- **Mutationstest 50/50 — 0 escaped, 0 inert.**
- Kein Browsertest — `preview_start` ist in unbeaufsichtigten Läufen gesperrt (siehe
  `cs336-unattended-no-preview`). Ersatz ist das headless Rendern aller Zustände in beiden Sprachen.

### Was der erste Mutationslauf über die eigenen Guards verriet

Der erste Durchlauf meldete **7 escaped und 3 inert** — deutlich unter dem Standard aus v74.
Beides war echt und beides ist aufgelöst:

Die 7 Entkommenen zeigten drei blinde Flecken, die alle dasselbe Muster hatten: **ich hatte die
Werte geprüft, die das Lab ausrechnet, aber nicht die, die es auswählt und hinschreibt.**
1. `seProbeEta` war völlig ungeprüft — die vier Lernraten-Vorwahlen konnten beliebig verstellt
   werden (auch so, dass „knapp über der Schwelle" stabil wurde), ohne dass ein Guard ansprang.
   Jetzt prüft eine Referenz jede Vorwahl gegen ihr Label, plus dass „near" stabil und „over"
   instabil ist.
2. `seStepsToShrink` war ungeprüft; die Quadrierung (der Loss ist quadratisch in θ, ein Faktor r
   auf θ ist r² auf dem Loss) konnte ersatzlos entfallen.
3. Der Sweep konnte den Punkt η = η_div verlieren — womit der Fall „weder Konvergenz noch
   Divergenz" ungetestet gewesen wäre, obwohl die Tabelle ihn anzeigt.
4. **Vier Prosa-Zahlen waren ungebunden.** Nach der Lehre aus früheren Läufen brauchen Zahlen in
   Prosa eigene Guards, weil sie sich nicht mitbewegen, wenn der Code sich ändert. Jetzt werden
   neun Prosa-Stellen aus den *berechneten* Werten zusammengesetzt und im gerenderten HTML
   gesucht — inklusive der beiden Brüche 10/11 und 100/101 in den Krümmungsnotizen.

Die 3 inerten Mutationen waren **Fehler im Test, nicht im Code**: zwei Suchmuster trafen wegen
Groß-/Kleinschreibung und Umformulierung nicht, eines war mehrdeutig (die Zahl 85,6667 steht an
zwei Stellen). Eine Mutation, die kein Bit ändert, ist kein bestandener Test, sondern ein
untauglicher — alle drei Muster sind korrigiert, und fünf weitere Prosa-Mutationen kamen dazu.
Danach: **50/50, 0 escaped, 0 inert.**

Dazu ein eigener Fehler, den erst `check-i18n` fand: ich hatte das Lab zunächst in **l09**
registriert (dort steht L9s Definition der kritischen Batchgröße). Der bestehende Guard
verlangt, dass eine Lecture nur Labs führt, deren **Modul** sie zitiert — Modul `training` zitiert
a1 und l02, nicht l09. Der Guard hatte recht: das Lab beantwortet zwei A1-Probleme, gehört also
nach `training`, und die passende Lecture ist l02, weil dort der Schritt `p.data -= lr * grad`
implementiert wird, dessen Stabilität Modus A entscheidet.

## Bewusst nicht

- **Eine Lernkurve erfinden.** Beide Modi rechnen, was vor der GPU-Stunde feststeht, und sagen es.
- **Behaupten, welche Lernrate oder Batchgröße die beste ist.** Das entscheidet der Sweep, den A1
  verlangt; das Lab entscheidet nur, was der Sweep überhaupt messen kann.
- **Den echten „edge of stability"-Effekt (progressive sharpening) nachbauen.** Er ist im
  Ehrlichkeitsabsatz benannt und ausdrücklich als das bezeichnet, was dieses Modell *nicht* hat.
- **Das alte `optimizer`-Lab reparieren** (zweizweigiger Schedule mit hart verdrahtetem
  T_c = 100) — fremdes Lab mit eigenem Zahlenvertrag, seit v72 offen.
- **Die deutsche Zahlenformatierung repo-weit anfassen** — siehe nächster Hebel.

## Nächste Hebel

1. **Dezimaltrennzeichen im deutschen Render.** In den Tabellen steht `514.000` (Tausenderpunkt
   aus `toLocaleString("de-DE")`) direkt neben `1.0039` (Dezimalpunkt aus `toFixed`) — in
   derselben Zeile, in derselben Sprache. Das ist **kein Fehler dieses Labs, sondern eine
   repo-weite Konvention**: `psInt`/`psNumber` und alle gleichnamigen Helfer der anderen 49 Labs
   machen es genauso, und die Prosa schreibt daneben korrekt `99,0099 %`. Ein eigener Lauf, der
   einen gemeinsamen lokalisierten Zahlenformatierer einzieht und alle Labs darauf umstellt,
   wäre die erste Änderung seit langem, die *jede* Seite betrifft — und braucht deshalb einen
   Mutationstest über alle Guards, nicht nur einen.
2. Die zweizweigige `schedule()` im `optimizer`-Lab auflösen (seit v72 offen).
3. `a4:pipeline-audit` und `a4:web-extraction` sind weiterhin die größten Missionen ohne
   exklusives Lab.
