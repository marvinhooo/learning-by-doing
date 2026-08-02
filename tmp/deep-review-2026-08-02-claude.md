# Deep Review 2026-08-02 — Die Kommunikationsschranke wird rechenbar (v58)

## Auftrag

Geplanter Lauf des Standing Brief: „nimm mal das aktuelle Repo und schaue was kannst du nochmal deutlich
verbessern … wird sich wirklich an den Vorlesungen und den Assignments entlang gehangelt?" Unbeaufsichtigt.
Gestapelt auf `b7c2496` (v57) auf `claude/quizzical-dijkstra-d518c3`, wie in der Memory festgehalten.
Keine parallele Codex-Session aktiv (letzte Änderung an `index.html` im Tip-Worktree: 2026-08-01 07:33,
also der vorherige geplante Lauf).

## Audit — wo klafft nach v57 die größte Lücke?

Nach v52/v54/v56/v57 sind A1 und A5 dicht mit interaktiven Objekten belegt. Durchgezählt wurde deshalb
diesmal **A2 nach Punktwert gegen interaktive Objekte**:

| Cluster | Punkte | vorhandenes Objekt |
|---|---|---|
| FlashAttention (`flash_forward`, `flash_backward`, `flash_benchmarking`) | 25 | `triton-tile`, `online-softmax-kata`, `kernel-contracts` |
| Sharding-Code (`optimizer_state_sharding`, `fsdp`) | 30 | `parallelism` (Ownership Map), `resources` |
| **Abschnitt 8: `data_parallel_calcs`, `fsdp_calcs`, `tp_calcs`, `fsdp_tp_calcs`** | **16** | **keins, das rechnet** |

Abschnitt 8 des A2-Handouts ist rein analytisch: für einen einzigen FFN-Layer soll Rechenzeit gegen
Ring-Kommunikationszeit gestellt und die Ungleichung nach der Gerätezahl aufgelöst werden. Die Plattform
hatte dafür kein rechnendes Objekt. `parallelism` ist eine **symbolische** Ownership Map
(`M_rank ≈ P + (G+O)/W`) ohne eine einzige Zahl; `roofline` und `resources` sind Ein-Geräte-Rechner.

Gegenprobe im Repo, vor v58 jeweils **0 Treffer** in `index.html` und `i18n-en.js`:
`N_DP`, `N_FSDP`, `N_TP`, „kommunikationsgebunden", „communication bottleneck", „row parallel",
„column parallel", `D_FF`. Der Begriff Egress-Bandbreite kam nirgends vor (die 30 `grep`-Treffer auf
„egress" waren allesamt „Regression").

Das ist keine kosmetische Lücke: Genau diese Kürzung erklärt, warum Tensor Parallelism in den Node gehört
und Data Parallel dazwischen — die Entscheidung, die in `sharding-fsdp` und `parallel-accounting` hinter
insgesamt 51 A2-Punkten steht.

## Was gebaut wurde — Lab #33 `comm-crossover`

Ein bespoke interaktives Lab (rechnet wirklich), Modul `distributed`, registriert in Lecture 7, Lecture 8,
den A2-Missionen `sharding-fsdp` und `parallel-accounting` sowie im Modul.

Gerechnet wird der FFN-Layer aus Gleichung (20)–(23) des Handouts: `x [B,D]`, `W₁,W₂ [D,D_FF]`,
`W₃ [D_FF,D]`, FP16, `2·A·B·C` FLOPs pro Matmul. Vier Fälle, die sich jeweils in **genau einer** Zahl
unterscheiden:

| Fall | B | D_FF | W | DP-Schranke | TP-Schranke (fwd) |
|---|---|---|---|---|---|
| Ein Node · NVLink | 65536 | 16384 | 450 GB/s | 74,73 | 28,65 |
| Zwischen Nodes | 65536 | 16384 | 25 GB/s | 5,10 | 2,54 |
| kleiner Batch | 8192 | 16384 | 450 GB/s | **10,22** | 28,65 |
| breite FFN | 65536 | 65536 | 450 GB/s | 74,73 | **111,59** |

### Modus A — eine Strategie
Strategie × Pass × N. Das Ledger setzt alles ein: `FLOPs = 6·B·D·D_FF/N` bzw. `12·…`, `T_comp = FLOPs/C`,
jedes Collective einzeln mit Shape, Bytes und ausgeschriebenem Ringfaktor
(`2·(N−1)/N · S/W` für All-Reduce, `(N−1)/N · S/W` für All-Gather und Reduce-Scatter), das Verhältnis,
das Verdict und die geschlossene Schranke. Darunter stehen alle drei Strategien im selben Fall
nebeneinander — die Zeile, an der die didaktische Pointe hängt.

Die Pointe: **welche Größe die Schranke bestimmt, entscheidet allein, was gesendet wird.**
DP und FSDP bewegen `3·D·D_FF` Elemente und rechnen proportional zu `B·D·D_FF` — `D·D_FF` kürzt sich
vollständig heraus, übrig bleibt `N < 1 + B·W/C`. TP bewegt `B·D` Elemente; dieselbe Kürzung entfernt `B·D`
und lässt `N < 1 + (3/2)·D_FF·W/C` stehen. Deshalb bewegt ein kleinerer Batch **nur** die DP-Schranke und
eine breitere FFN **nur** die TP-Schranke — im Lab auf die Ziffer nachprüfbar.

Zwei weitere Ergebnisse, die aus derselben Rechnung fallen:
- DP kommuniziert im Forward **gar nicht** → dort gibt es keine Schranke.
- FSDP sendet im Forward zusätzlich und hat trotzdem **dieselbe** Schranke wie DP, weil der Forward auch
  nur halb so viel rechnet. Das Verhältnis ist in beiden Pässen `(N−1)·C/(B·W)`.
- TP verträgt im Backward doppelt so viele Geräte wie im Forward (doppelte Rechnung, ein All-Reduce) —
  der Forward ist also die bindende Bedingung.

### Modus B — 2D (FSDP × TP)
`N_TP` × `N_FSDP` × Overlap-Schalter, Forward Pass wie im Handout. Beide Achsen getrennt ausgewiesen
(TP-All-Reduce über `y [B/N_FSDP, D]`, FSDP-All-Gather über den TP-Shard der Gewichte), dann `max` bzw.
Summe. Darunter die beiden Gesetze mit eingesetzten Zahlen:

- **überlappt:** beide Bedingungen sind unabhängig → `N < 28,65 · 74,73 = 2141`
- **seriell:** ein gemeinsames Budget, optimal aufgeteilt → `N < 562 ≈ 26 % des überlappten Werts`

Das Viertel ist kein Erfahrungswert, sondern folgt: unter einer Summenbedingung wird ein Produkt maximal,
wenn beide Summanden gleich sind; zwei halbierte Faktoren ergeben ein Viertel. Exakt
`N ≤ (1+α+β)²/(4αβ)` mit `α = 2C/(3·D_FF·W)`, `β = C/(B·W)`; der Grenzwert für große Schranken ist 1/4
(gemessen 0,256 im Fall „breite FFN", 0,262 im Node-Fall).

## Verifikation

- **Unabhängige Referenz.** Die gesamte Mathematik wurde zweimal getrennt aus dem PDF getippt: einmal im
  Scratchpad (Node), einmal in `scripts/check-i18n.mjs`. Beide teilen keinen Code mit der App.
- **Geschlossene Formen gegen Brute Force.** Für alle 4 Fälle × 3 Strategien × 2 Pässe wurde die Schranke
  zusätzlich durch Hochzählen von N bestimmt, bis `T_comm ≥ T_comp` — jedes Mal exakt
  `⌈Schranke⌉−1`. Für 2D ebenso per Gittersuche über alle Zweierpotenzen bis 2¹⁴.
- **Echtes DOM, beide Modi.** 192 Kombinationen in Modus A (inklusive **jeder einzelnen** Collective-Zeile,
  192 Stück, mit Operation, Bytes und ausgeschriebenem Ringfaktor) und 384 in Modus B durchgeschaltet;
  jeder angezeigte String **zeichengenau** gegen die unabhängig getippte Referenz verglichen — 0 Abweichungen.
- **Transfer-Kurzcheck.** Falsches Tripel → „Noch nicht.", keine Persistenz. Richtiges Tripel → Erfolgs-Callout,
  `labChecks["comm-crossover"] === true`; nach Reload stellt `restorePassedLab` alle drei Selects und das
  Erfolgsmarkup wieder her.
- **Beide Sprachen vollständig.** 144 Zustände in EN auf deutsche Rückstände gescannt und 144 in DE auf
  englische — je 0 Treffer. 71 neue `ui`-Paare plus vollständiger EN-Lab-Eintrag.
- **Layout 375 px.** 144 Zustände geprüft: `scrollWidth === clientWidth === 375`, kein Element über die
  Kante, alle sichtbaren Controls ≥ 44 px. 1280 px ebenfalls ohne Überlauf. Konsole leer.
- **13 neue Drift-Guards**, davon 5 negativ getestet (alle feuern): FP16-Bytes, Ringfaktor 2 statt 1,
  TP-Faktor 3/2, Fall-Isolation (`wide` darf die DP-Schranke nicht bewegen), Registrierung in l07/l08.

## Zwei Funde am Rand

1. **`.claude/launch.json` lieferte aus dem falschen Verzeichnis.** Der Eintrag hatte
   `--directory /Users/martin/Documents/Python Folder/CS336` fest verdrahtet — jeder Worktree servierte
   also den **Haupt-Checkout**. Genau dieses Symptom (»der Browser zeigt hartnäckig den alten Stand«) ist im
   Report vom 2026-07-28 als Stolperstein festgehalten; die Ursache stand in der Konfiguration. `--directory`
   ist jetzt entfernt, der Server liefert aus dem Verzeichnis, in dem er gestartet wird. Verifiziert:
   `curl … /sw.js` zeigt `cs336-shell-v58`.
2. **Eigene Verifikation hatte anfangs ein Loch.** Der erste DOM-Vergleich für Modus B suchte Zeilen über
   ihr englisches Label; die Labels „TP-Achse"/„FSDP-Achse" waren aber noch nicht übersetzt, die Zeilen
   wurden nicht gefunden, und `Math.abs(NaN − x) > tol` ist `false` — der Test meldete grün, ohne etwas zu
   prüfen. Der zweite Durchlauf wirft bei fehlender Zeile hart. Merke für künftige Läufe: ein Vergleich, der
   eine fehlende Zeile still überspringt, ist kein Test.

## Getroffene Entscheidungen (unbeaufsichtigt)

- **Eigenes Lab statt Erweiterung von `parallelism`.** Die Ownership Map beantwortet „wem gehört was", das
  neue Lab „wie weit trägt das". Beide in eine Karte zu legen hätte die qualitative Frage mit der
  quantitativen vermischt.
- **Feste benannte Fälle statt freier Regler.** Die vier Fälle sind so gewählt, dass jeder gegenüber dem
  ersten genau eine Zahl ändert; nur dadurch ist die Kürzung überhaupt beobachtbar. Ein freier Regler hätte
  immer mehrere Größen gleichzeitig bewegt.
- **Deutscher Titel geändert** von „Kommunikationsschranke: …" auf „Compute gegen Kommunikation: …":
  „Kommunikationsschranke:" ist im H1-Schriftgrad 396 px breit und passt bei 375 px in keine Zeile — das war
  der einzige horizontale Überlauf der Seite. Gemessen, nicht geraten.
- **Keine Zeit-, Termin- oder Streak-Mechanik.** Wie festgehalten.

## Stand

- Commit `feat: v58 …`, gestapelt auf `b7c2496` (v57).
- Geändert: `index.html`, `i18n-en.js`, `scripts/check-i18n.mjs`, `sw.js` (Cache `cs336-shell-v58`),
  `README.md` (33 Labs, Version 58), `.claude/launch.json`.
- **Achtung beim Testen:** nach dem Versionssprung `getRegistrations().unregister()` + `caches.delete()`,
  sonst zeigt der Browser den alten Stand.
