# Deep Review v101 — 2026-09-05 — die Initialisierung, die kein Test sieht

Fortsetzung von [v100](deep-review-2026-09-05-claude.md). Der zugewiesene Worktree stand auf
**v99** (`2ed21e7`), der Kettenkopf auf **v100** (`57ce035`, Branch
`claude/intelligent-vaughan-5896db`) — Fast-Forward, kein Merge. Kein Codex aktiv (Haupt-Checkout
mtimes Juli).

Auftrag ist unverändert der Gesamtauftrag: denselben Wissensstand wie aus der Vorlesung, und die
Assignments lösen können. v100 hatte den nächsten Hebel namentlich hinterlassen.

## Die Vorprüfung, und was sie schärfer machte

`parameter-initialization` entscheidet `a1:linear` und `a1:embedding` und war nach v100 das letzte
Konzept mit Problemen und ohne rechnendes Lab. Nach der Regel aus
[[cs336-metric-is-a-suspicion]] ist das nur ein Verdacht. Die Trefferzählung nach den Bezeichnern
der Rechnung selbst:

| Bezeichner | Treffer |
| --- | --- |
| `trunc_normal` | 7 |
| „Initialisierung" | 32 |
| `3σ` | 10 |
| `erf(`, `erfc`, `normalCdf`, `truncNormal` | **0** |
| `Math.sqrt(2 /`, `dIn + dOut` | **0** |

Das bekannte Muster: Prosa reichlich, Rechnung keine. Die Konzeptseite rechnet **einen** festen
Zahlenfall vor (d_in=64, d_out=192), die Formelkarte einen zweiten (d_in=2, d_out=6) — aber keine
Stelle im Repo bildet σ aus d_in und d_out, und `LAB_CONCEPTS` nennt das Konzept nirgends.

Zusätzlich hielt die Vorprüfung, was v100 empfiehlt: **erst fragen, ob eine Modulgrenze die
Ursache ist.** Hier nicht — kein bestehendes Lab rechnet eine Streuung aus Layerbreiten. Das war
also wirklich ein neues Lab.

**Und die Vorprüfung ging, wie bei v91, in die schärfere Richtung aus.** Die Konzeptseite behauptet
über A1s Test wörtlich: *„Ein Test prüft die verwendeten Argumente, die Grenzen und den
Modultyp."* A1 §3.3.2 schreibt für denselben Test aber: *der Adapter lädt die vorgegebenen
Gewichte in dein Modul.* Ein Test, der die Gewichte lädt, prüft den Forward-Pass und kann die
Initialisierung **grundsätzlich nicht sehen**. Die Seite versprach dem Leser eine Absicherung, die
das Assignment nicht leistet.

## Das Lab `init-scale`

Zwei Modi, beide in geschlossener Form und ohne eine einzige Zufallszahl.

**Modus A — die drei Regeln auf A1s eigenem Modell** (V = 10.000, d_model = 512, d_ff = 1.344 aus
§7.2.1). Für jede der fünf Gewichtstabellen: σ² aus der Regel, σ, die Grenzen ±3σ, die
**realisierte** Streuung nach dem Abschneiden, und — getrennt — die zwei Effekte, die die
Konzeptseite bislang in einem Atemzug nannte:

- **Abschneiden bei ±3σ: −1,342161 %.** Systematisch, bei jeder Tabellengröße gleich.
- **Stichprobenstreuung: ±0,132067 % bei 262.144 Gewichten**, fallend mit 1/√n; bei zehn Millionen
  Gewichten ist der systematische Anteil **62,77-mal** größer.

Daraus folgt die Zahl, die die Konzeptseite braucht und nicht hatte: **eine Toleranz unter
1,342161 % wird nie zuverlässig, egal wie groß die Tabelle ist.**

Nebenbefund derselben Tabelle: die Regel ist symmetrisch in d_in und d_out, ihre Wirkung nicht.
Der Vorwärtsfaktor d_in·σ² ist **exakt 1** bei der Q/K/V/O-Projektion, 0,5517 bei W1, 1,4483 bei
W2 und 0,0974 beim LM-Head — über ein Raster von 65.536 Paaren gilt „Faktor eins genau dann, wenn
quadratisch" in beide Richtungen.

**Modus B — welcher Test welchen Fehler findet.** Fünf Implementierungen: die korrekte und die
vier, die A1 und die Konzeptseite selbst als Fallstricke führen.

| Variante | Abweichung von σ | Varianztest | Grenzentest |
| --- | --- | --- | --- |
| korrekt | **−1,3422 %** | besteht | besteht |
| Wurzel vergessen (std=σ²) | −95,64 … −98,64 % | fängt | besteht |
| Breitenregel auch fürs Embedding | −98,64 % (nur dort) | fängt | besteht |
| **Grenzen ±3 statt ±3σ** | **0,0000 %** | **fängt nie** | fängt (707,7 von 262.144) |
| PyTorch-Standard gelassen | −22,27 … +84,98 % | fängt | fängt (Head, Embedding) |

**Das ist der Fund.** Die Variante mit den falschen Grenzen besteht einen Vergleich mit der
vorgeschriebenen Streuung **besser als die korrekte Implementierung** — exakt 0,0000 % gegen
−1,3422 % —, weil sie genau das Abschneiden weglässt, das σ senkt. Der Varianztest fängt sie auf keiner der fünf
Tabellen und bei keiner der vier angebotenen Toleranzen — gemessen in einem Sweep über 80
Kombinationen aus Tabelle, Variante und Toleranz. Sichtbar ist sie
allein am Grenzentest.

Damit steht die Lehre, die A1 selbst nicht ausspricht: **eine Initialisierungsregel besteht aus
zwei Angaben, und jeder der beiden billigen Tests sieht nur eine.** Zusammen fangen sie alle vier
Fehler, einzeln keiner.

Dritte Zahl: das brauchbare **Toleranzfenster 1,7384 % bis 22,0273 %**. Darunter fällt die
korrekte Implementierung an ihrer eigenen Abschneidewirkung durch — bei vier der fünf Tabellen
sogar zuverlässig, nicht nur zufällig. Darüber beginnt der erste Fehler durchzurutschen, und zwar
derselbe PyTorch-Standard, der auf einer anderen Tabelle 84,9831 % danebenliegt: **welche Tabelle
man prüft, entscheidet mit, ob eine Toleranz den Fehler fängt.**

## Die Korrektur der Prosa

Drei Stellen behaupteten in beiden Sprachen, ein Test prüfe Argumente, Grenzen und Modultyp:
die Konzeptseite (`details[3]`), ihre Antwort auf die eigene zweite Kontrollfrage, und die
Antwort der Formelkarte `parameter-init`. Alle drei sagen jetzt, was A1 §3.3.2 wirklich tut, und
nennen die Zahl, die den Unterschied zwischen den beiden Fehlerquellen ausmacht.

Die Kontrollfrage der Konzeptseite („warum ist ein Test auf exakt empirische Varianz ungeeignet,
und welche Eigenschaften prüfst du stattdessen?") hat damit erstmals eine Antwort mit Zahlen —
und ein Lab, das sie durchrechnet.

## Prüfung

- **Guard-Suite 52 → 53 Blöcke grün**, Build grün, Cache-Bump auf v81, README 61 → 62 Labs.
- Neuer Block **`init scale`** (277 Checks). Er tippt A1s Regeln aus dem Handout neu und geht
  einen **anderen Rechenweg als die App**: die Momente der abgeschnittenen Normalverteilung
  werden per **Simpson über 200.000 Intervalle** integriert, wo die App sie geschlossen löst
  (Übereinstimmung auf 1e−9). Jede Variante ist aus ihrer eigenen Definition zweitens
  hergeleitet; die Fenstergrenzen werden über **5.000 Toleranzen gescannt** statt aus der App
  zurückgelesen; die Symmetrie von σ und die Quadratbedingung des Vorwärtsfaktors über
  **65.536 Rasterpaare in beide Richtungen**.
- `concept experiments` 71 → **72 von 75**; `parameter-initialization` fällt von der
  Waisenliste. `lab render sweep` 53 → **54 von 62 Labs**, `lab prose anchors` 319 → **330**
  Zahlen.
- **Mutationstest: 14 Mutationen, 14 gefangen, 0 entkommen**, Kontrolle grün. Neun davon fängt
  `lab prose anchors` zuerst — die Karte zitiert die gerechneten Zahlen, also schlägt jede
  Zahlendrift dort früher an. Um zu messen, was der **neue** Block allein leistet, wurde er in
  einer Kopie der Suite ohne den Anker-Block noch einmal gegen dieselben Mutationen gefahren:
  er fängt **alle vierzehn selbst**, jede mit der Meldung, die die Ursache benennt (etwa
  „the fourth moment integrates to 2.680043 where the app computes 2.560059").
- **Kein Browsertest** — in geplanten Läufen gesperrt ([[cs336-unattended-no-preview]]).

## Was offen bleibt

1. Die drei Konzepte ohne Lab (`dataset-lineage`, `copyright-licensing`,
   `alternative-sequence-models`) entscheiden weiterhin **null** Probleme.
2. `origin/main` steht unverändert auf `4067294`; die Kette ist jetzt **ungepusht bis v101**.
