# Deep Review 2026-08-26 — die Kette, die A3 wirklich benotet, war nirgends gerechnet (v84)

Basis `ea49bb4` (v83). Der v83-Report schloss mit fünf offenen Hebeln; der erste war der
einzige, der den Lernpfad betraf: „Die Kette wirklich verdrahten. `run-plan` →
`scaling-fit` → `target-config` → `run-budget-ledger` decken jetzt alle vier Schritte von
A3 ab, aber jedes Lab setzt sein Eingangs-N selbst."

Beim Nachrechnen stellte sich heraus, dass die Lücke nicht die fehlende Verdrahtung ist.
Sie ist eine fehlende **Zahl** — und zwar genau die, die A3 benotet.

## Der Befund

A3 §3.3 wird in vier Schritten gelöst. Die App rechnete jeden für sich:

| Lab | misst | wogegen |
| --- | --- | --- |
| `run-plan` (v83) | N_pred | die Wahrheit |
| `target-config` (v82) | die vier Ecken | **N_pred** |
| `run-budget-ledger` (v81) | die Anfrage | den API-Vertrag |

Benotet wird aber das Modell, das man wirklich trainiert, und das hat ein `N_final`.
`N_final` gegen das wahre Optimum stand **in keiner Zeile beider Labs**. Gegenprobe in
HEAD: `params/truth`, `N_final`, `Gesamtfaktor`, `total factor` — je 0 Treffer.

Zwei Vorprüfungen liefen ins Leere und sind der Grund, dass der Hebel schmaler ausfiel als
gedacht — beide bestätigen die Regel aus [[cs336-metric-is-a-suspicion]], dass zuerst zu
prüfen ist, ob das Repo den Fall schon entschieden hat:

- **Der Timeout beim stehengelassenen D war schon da.** Die Vermutung, dass `target-config`
  und `run-budget-ledger` je eine Hälfte davon halten und niemand sie zusammensetzt, war
  falsch: `target-config`s `transferAnswer` sagt wörtlich „der Lauf wird abgebrochen,
  hinterlässt nur partielle Validation Losses" und zieht sogar die Konsequenz „wenn du die
  Richtung wirklich absichern willst, rundest du nach unten".
- **Die Asymmetrie der Losskurve war schon da.** `run-plan`s Modus B hält den Abschnitt
  „Die Richtung ist fast egal" mit 13,9178 % gegen 13,5679 %. Eine eigene Herleitung, dass
  der gleichteure Partner von `f` fast exakt `1/f` ist, hätte nichts Neues gesagt.

Übrig blieb die Verkettung selbst — und die trägt.

## Das Lab: `chain-carry`

**Verdrahtet, nicht nacherzählt.** Das Lab ruft `rpPlan` und `tcCandidates` auf, statt sie
nachzubauen. Ein Guard prüft für jeden der vier benannten Pläne, dass Planfaktor, Planwaste
und die Rasterfest-Diagnose exakt die von `run-plan` sind, und dass die Ecken über alle
sechs Formen byteweise `target-config`s eigene Liste sind. Eine Zahl, die hier von der
Quelle abweicht, ist damit ein Fehler in einem der drei Labs und schlägt hier an.

**Modus A — eine Kette vom Plan bis zur eingereichten Zahl.**

- **Die Fehler multiplizieren sich, sie addieren sich nicht.** `f = f₁ · f₂`, und die
  Verschwendung ist eine nichtlineare Funktion von `f`. Die Summe der beiden gemeldeten
  Verschwendungen ist deshalb die falsche Arithmetik — und sie hat nicht einmal ein festes
  Vorzeichen. Beim schlechtesten Plan:

  | Zeile | Wert |
  | --- | --- |
  | run-plan meldet | 15,6024 % |
  | target-config meldet für diese Ecke | 0,0030 % |
  | addiert | 15,6054 % |
  | **wirklich weggeworfen** | **15,2279 %** |

  Das Raster hat einen Teil des Planfehlers **zurückgenommen**. Über alle 648 geprüften
  Kombinationen passiert das in **319**.

- **Welcher Schritt dominiert, kehrt sich um.** Beim besten Plan ist der Planfehler
  0,0002 % und jede erreichbare Ecke liegt 2,7 % bis 10 % von N_pred entfernt — das Raster
  macht dort den ganzen Fehler und hebt ihn je nach Ecke auf 0,0191 % bis 0,2927 %, also
  auf das 95- bis 1.460-Fache. Beim schlechtesten Plan ist es umgekehrt: er wirft allein
  15,60 % weg, und die Ecken bewegen das Ergebnis zwischen 12,27 % und 18,34 %. Dort ist
  das Raster kein Rundungsdetail, sondern die Gelegenheit, knapp drei Prozentpunkte
  zurückzuholen. Wer die beiden Schritte getrennt liest, sieht in **beiden** Fällen die
  falsche Größenordnung.

**Modus B — welche Rundungsregel über alle Pläne gewinnt.** Alle 108 Pläne aus `run-plan`
gegen alle sechs Formen aus `target-config`, vier Regeln:

| Regel | mittlere Verschwendung | schlechtester Fall | besser | schlechter |
| --- | --- | --- | --- | --- |
| nächstgelegene Ecke | 2,7342 % | 15,7657 % | — | — |
| immer abrunden | 2,6188 % | **25,8705 %** | 452 | 196 |
| immer aufrunden | 3,8496 % | 14,8524 % | 199 | 449 |
| **nach der Diagnose** | **2,2232 %** | 15,7657 % | **309** | **0** |

Die Regel lautet: **hat dein Fit den Prior zurückgegeben, runde ab; sonst nimm die
nächstgelegene Ecke.** Sie ist keine neue Messung — `run-plan` zeigt die Diagnose bereits
an, als Exponent exakt 0,5.

**Warum sie überhaupt etwas weiß, ist eine Herleitung und keine Statistik.** Ein
rasterfester Fit gibt den Prior zurück; der Prior wächst mit Exponent 0,5, die Wahrheit mit
0,451613; oberhalb des Kreuzungspunkts überschätzt er, und der 48-Stunden-Lauf liegt
darüber. Gemessen: **378 von 378** rasterfesten Kombinationen liegen zu hoch, mit Faktoren
zwischen 1,1629 und 1,4536. Die messenden Fits zeigen dagegen beide Vorzeichen (78 von
270) — dort ist jede pauschale Richtung geraten, und genau daran scheitern die beiden
pauschalen Regeln an entgegengesetzten Enden.

## Eine Ehrlichkeit, die im Lab steht

Die 378 rasterfesten Kombinationen fallen auf **3 verschiedene Vorhersagen** zusammen, weil
ein rasterfester Fit nicht mehr von den Daten abhängt, sondern nur noch von der Geometrie
des Priors. „378 von 378" ist also schwächer, als es klingt. Das Lab druckt die Zahl selbst
in einer eigenen Ledgerzeile, und ein Guard hält sie — dieselbe Form wie v83s bewusst
untestbare Verzweigung.

Ebenso ausdrücklich: die Spalte mit dem ◀ (die billigste Ecke) ist gegen die Wahrheit
gerechnet und damit ein Rückblick, keine Regel. Genau deshalb ist die vierte Regel nicht
„nimm die billigste", sondern eine, deren Eingabe vor dem Einreichen vorliegt.

## Prüfung

- **Neuer Guard-Block `chain-carry`: 3.362 Werte.** Alle vier Rundungsregeln werden in
  jeder der 648 Kombinationen aus der Eckenliste **neu hergeleitet** statt an den Zuständen
  der Anker geprüft — Auswahlfunktionen sind die Stelle, an der ein Lab eine wahre Zahl
  unter einer lügenden Beschriftung zeigen kann ([[cs336-mutation-test-blind-spots]] Punkt 1).
- **`render coverage` 5.989 → 6.757 Zustände über 11 Labs**, 7.024 Prüfungen; das neue Lab
  hat alle vier Eigenschaften von Tag eins.
- **`english render` 6.757 Zustände**, 0 deutsche Fragmente, 0 uninterpolierte Platzhalter.
  `panel i18n` 46 → 47 Panels, `renderer i18n` 1.699 → 1.750 Strings.
- **Beide Sprachen headless über alle 768 Zustände gerendert.** DE-Zahlformat geprüft:
  `0,478316 × 1,009748 = 0,482978 ×`, `15,2279 %`. Kein NaN, kein `${`, kein `undefined`.
- **Mutationstest: 25 Mutationen auf `index.html` + 9 auf `i18n-en.js`, 0 entkommen.**
- `node --check` auf Inline-Script, `i18n-en.js` und `check-i18n.mjs`; **590 DOM-IDs,
  0 Duplikate**. Guard-Laufzeit 22 s → 34 s.

## Was der Mutationstest gefunden hat

Vier Entkommene in der ersten Runde, und drei davon waren neue Klassen:

1. **Zwei abhängige Tabellenspalten, von denen keine zurückgelesen wurde.** Die Spalte
   „gegenüber N_pred" ließ sich auf den Gesamtfaktor umbiegen und umgekehrt, während alle
   Ledger-Anker hielten — auf dem Schirm hätte dann eine Ecke gestanden, die 2 % von N_pred
   entfernt ist und gleichzeitig 52 % von der Wahrheit. Das ist exakt v83s Lehre, eine
   Ebene tiefer. Drei neue Anker lesen jetzt Rasterfaktor, Gesamtfaktor und Verschwendung
   einer Zeile **gemeinsam**, in Zuständen, in denen sie weit auseinanderliegen.
2. **Die Lab-Karte hat keinen Übersetzungsanker.** `renderer i18n` hält Renderer-Strings,
   weil eine geänderte deutsche Zeichenkette ihren englischen Eintrag verliert. Die Felder
   der Karte werden dagegen über die Lab-ID gefunden — eine Zahl in `observe` oder
   `transferAnswer` darf von der Rechnung wegdriften, und nichts merkt es. Ein neuer Guard
   bindet die Zahlen **beider** Sprachkarten an die berechneten Werte.
3. **Die Zahlen im englischen Eintrag prüfte gar nichts.** `renderer i18n` beweist, dass ein
   englischer Eintrag *existiert*; `english render` beweist, dass kein Deutsch übrig ist.
   Was im englischen Wert steht, war frei — ein übersetzter Satz konnte eine Zahl nennen,
   die die App nie rechnet, und beide Guards blieben grün. Der neue Guard verlangt, dass
   jede Zahl eines deutschen Strings dieses Labs in seinem englischen Eintrag wieder
   auftaucht und keine erfunden wird (Dezimalkomma → Dezimalpunkt; eine Tausendergruppierung
   wäre nicht modelliert und wird ausdrücklich zurückgewiesen statt still falsch verglichen).
4. **Eine inerte Mutation, die eine Eigenschaft der Daten benannte.** `factor > 1` gegen
   `factor > 0` ist auf den rasterfesten Zeilen ununterscheidbar, weil deren kleinster
   Faktor 1,1629 ist. Statt die Mutation nur zu ersetzen, hält der Guard jetzt die Marge
   direkt (kleinster rasterfester Faktor ≥ 1,05) und verlangt zusätzlich, dass die messenden
   Fits Unterschätzungen enthalten — sonst wäre derselbe Vergleich überall untestbar.
   Der beobachtbare Zwilling (dieselbe Mutation im messenden Zweig) wird gefangen.

Eine Mutation blieb bewusst „nicht eingespielt": `378 von 378` existiert in `i18n-en.js`
nicht, weil die Zahl aus den Daten gerendert und nicht als Prosa übersetzt wird — sie hält
bereits ein Render-Anker.

## Was ich nicht gemacht habe

- **Kein Browsertest.** Nach [[cs336-unattended-no-preview]] ist `preview_start` in
  geplanten Läufen gesperrt; Ersatz ist das headless Rendern aller 768 Zustände in DE und EN,
  oben aufgeführt.
- **Der Durchsatz bleibt gesetzt** (10¹⁵ FLOP/s, wie in `run-plan`). Er skaliert Messbudget
  und Ziel gemeinsam und bewegt keine Aussage dieses Labs.
- **Die Budgetseite ist nicht mitgerechnet.** Dass eine zu große Ecke mit stehengelassenem D
  den Lauf ins Timeout schickt, steht in `target-config` und `run-budget-ledger`; das Lab
  sagt das und verlinkt dorthin, statt die Rechnung ein drittes Mal zu führen.
- **Erreichbar gemacht.** Das Lab steht im Modul `scaling` und in beiden A3-Missionen, die
  es betreffen — `budget-design` und `target-decision`, dessen Beschreibung („Übersetze die
  stetige Fitprognose in gültige diskrete Hyperparameter und rechne … Abweichung von der
  Fitkurve erneut nach") genau diese Rechnung verlangt. In beiden Sprachen.

## Nächste Hebel

1. **Die zwei neuen Guard-Klassen repo-weit ziehen.** Kartenzahlen und Zahlen im englischen
   Eintrag sind bisher nur für `chain-carry` gebunden. Beide Lücken gelten für alle 56 Labs,
   und die zweite ist die unangenehmere: sie lässt eine falsche Zahl ausschließlich dem
   englischen Leser zeigen.
2. **Die restlichen Labs render-fähig machen** (offen seit v82): `english render` erreicht
   11 von 56; die anderen 45 Panels hält weiterhin nur `panel i18n`.
3. **Attribute in denselben Panels** (`aria-label`, `title`, `placeholder`) — offen seit v81.
4. **Gruppierung vereinheitlichen** (offen seit v79).
5. **Sechs unerreichbare Defaults** in den Lab-Helfern (offen seit v79).
