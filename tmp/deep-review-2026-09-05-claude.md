# Deep Review v100 — 2026-09-05 — die eine Station, die im Lesen endete

Fortsetzung von [v99](deep-review-2026-09-04b-claude.md). Auftrag war die offene Frage des
Nutzers: „wie kann ich extrem schnell und effizient die nötigen Prerequisites aufbauen?" —
zusammen mit dem Gesamtziel, denselben Wissensstand wie aus der Vorlesung zu erreichen und die
Assignments lösen zu können.

## Was zuerst *widerlegt* wurde

Nach 99 Iterationen sind die naheliegenden Verdachtsmomente meist schon geschlossen. Vier
davon wurden geprüft und als Befund verworfen, statt sie als Fund zu berichten:

| Verdacht | Messung | Ergebnis |
| --- | --- | --- |
| Konzepte ohne Zugang | alle Oberflächen durchgezählt | 0 von 75 unerreichbar |
| Probleme ohne rechnendes Lab | je Problem über seine entscheidenden Konzepte | 0 von 124 |
| „126 Probleme" statt 124 | Scope-Einträge dedupliziert | `a3:scaling_laws` steht in 3 Blöcken |
| Zeitangaben getippt statt gerechnet | `lectureTimeEstimate` gelesen | aus Textvolumen abgeleitet |

`MODULES[].minutes` (330, 170, 360, …) ist **totes Feld** — es wird nirgends gerendert, die
Anzeige rechnet ausschließlich aus dem Wortvolumen. Nicht angefasst, nur vermerkt.

## Der Befund liegt genau auf der gestellten Frage

Der Grundlagenpfad (Modul 00, „Grundlagen am Stück aufbauen") ist die einzige geordnete
Antwort der App auf „wie baue ich die Voraussetzungen auf". Neun seiner zehn Stationen boten
ein Experiment. Eine nicht.

| # | Station | Experiment | entscheidet Probleme |
| --- | --- | --- | --- |
| 7 | probability | baseline-variance | 1 |
| **8** | **logs** | **— keines —** | **3** |
| 9 | gradients | pytorch-debugger | 0 |

`logs` ist Log-Sum-Exp und numerische Stabilität. Damit endete ausgerechnet die Station im
Lesen, an der Schritt 2 der eigenen Fünf-Schritte-Methode („das Lab der Lecture machen")
hätte greifen müssen — und es ist keine Randstation: die App selbst nennt `logs` als
entscheidendes Konzept von `a1:softmax`, `a1:cross_entropy` und `a5:get_response_log_probs`.

## Das Lab existierte bereits — eine Modulgrenze entfernt

Der teure Reflex wäre ein neues Lab gewesen. `loss-and-clip` rechnet aber längst genau die
zwei Fehlerarten durch, die die Konzeptseite lehrt, und zwar in simulierter float32-Arithmetik:

- **Überlauf:** `exp` läuft oberhalb von x ≈ 88,7 nach unendlich über; Zähler und Nenner
  werden beide unendlich, ihr Quotient ist NaN.
- **Unterlauf:** ohne das Kürzen von log und exp wird die Zielwahrscheinlichkeit exakt null,
  ihr Logarithmus minus unendlich.

Seine Formelzeile *ist* Log-Sum-Exp mit Maximum-Abzug, und seine drei Kurzcheck-Fragen fragen
wörtlich diese beiden Klippen ab. Es lag im Modul `training`, `logs` im Modul `foundations` —
also sahen sich die beiden nie.

**Vor einem neuen Lab lohnt die Frage, ob eine Modulgrenze die Ursache ist.**

Repariert wurde deshalb die Zuordnung, nicht der Inhalt: `logs` steht jetzt bei den Konzepten
des Themenblocks `a1:optimization`. Das ist keine Erfindung, sondern die Angleichung des
Blocks an seine eigenen Probleme — dessen `cross_entropy` hängt laut der App an `logs`, und
`loss-and-clip` ist eines seiner Labs. Damit trägt die Paarung die Ko-Lokations-Prüfung von
`concept experiments` von selbst. Nebenwirkung gemessen: kein neuer Formeleintrag (die Formeln
`logsumexp` und `perplexity` hingen schon über `cross-entropy` am Block), genau ein
zusätzlicher Konzeptbutton.

## Der neue Guard, und eine Prüfung, die wieder verschwand

`prerequisite sprint` hält fest, dass **jede** Station des geordneten Modul-00-Pfads das
Experiment anbietet, das sie durchrechnet — gerendert gelesen, in beiden Sprachen. Dazu zwei
Zusicherungen gegen billige Wahrheit: `foundationSprintConcepts` muss weiter das
foundations-Modul lesen (sonst prüfte der Guard eine andere Liste als die Seite läuft), und
eine unter acht Stationen geschrumpfte Liste lässt ihn fallen.

**Eine geschriebene Prüfung wurde wieder entfernt, weil sie nicht auslösbar war.** Die
Gegenrichtung „`logs` muss auch auf dem Pfad bleiben" ließ sich in keiner Konstruktion zum
Feuern bringen:

- Station streichen → `problem concepts` bricht zuerst („a5:get_response_log_probs points at
  logs, which this assignment never reaches").
- Station stattdessen auf eine Lecture verschieben, um sie erreichbar zu halten → der
  Modul-Guard bricht zuerst („concept logs belongs to foundations"), weil das `module`-Feld
  eines Konzepts seine Heimat festnagelt.

Statt sie als Dekoration stehenzulassen, steht der **gemessene Grund** jetzt im Kommentar.
Das ist die v99-Lehre in ihrer sauberen Form: eine inerte Prüfung ist erst geklärt, wenn ihr
Grund gemessen ist — und dann gehört sie oft entfernt, nicht behalten.

## Prüfung

- **Guard-Suite 51 → 52 Blöcke grün**, Build grün, Cache-Bump auf v80.
- `concept experiments` **70 → 71 von 75** Konzeptseiten mit Experiment, 85 → 86 Paare.
- `prerequisite sprint`: 30 Checks, 22 Buttons aus dem echten Markup in beiden Sprachen.
- Mutationstest **6 Mutationen, 6 gefangen, Kontrolle grün**. Drei fängt der neue Guard selbst
  (Paarung entfernt · `a1:softmax` nennt `logs` nicht mehr · Sprint-Liste zeigt woandershin);
  drei fangen bestehende Guards früher ab — ehrlich vermerkt, weil sie damit nichts über den
  neuen aussagen.
- **Kein Browsertest** — in geplanten Läufen gesperrt ([[cs336-unattended-no-preview]]).

## Was offen bleibt, und warum

1. **30 von 119 Themenblock/Konzept-Paaren** nennen ein entscheidendes Konzept ihrer eigenen
   Probleme nicht in der Blockliste (z. B. `a1:generation-experiments` führt `rope`, `swiglu`,
   `rmsnorm` nicht, obwohl seine Ablationsprobleme daran hängen). **Geprüft, ob das den Leser
   trifft: nein** — `problemVerifyMarkup` druckt die entscheidenden Konzepte direkt neben
   jedem Problem. Es ist eine Redundanzlücke, kein Loch im Lernweg. Eine Sammeländerung wäre
   groß und ohne belegten Nutzen; die Kennzahl allein hätte sie ausgelöst.
2. **`parameter-initialization`** ist das nächste Konzept, das Probleme entscheidet
   (`a1:linear`, `a1:embedding`) und kein rechnendes Lab hat. Anders als bei `logs` existiert
   dafür **keines** — das wäre also ein neues Lab, kein Zuordnungsfehler. Der lohnende
   Zuschnitt wäre die abgeschnittene Normalverteilung: welche Standardabweichung A1 vorschreibt,
   und warum eine falsche Initialisierung die Shape-Tests besteht und trotzdem das Training
   verdirbt.
3. Die drei restlichen Konzepte ohne Lab (`dataset-lineage`, `copyright-licensing`,
   `alternative-sequence-models`) entscheiden **null** Probleme — dort ist kein Lab fällig.
