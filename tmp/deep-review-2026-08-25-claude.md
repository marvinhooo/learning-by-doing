# Deep Review 2026-08-25 — die erste Frage, die A3 stellt, war die einzige ohne Antwort (v83)

Basis `a65c3e4` (v82). Der v82-Report schloss mit fünf offenen Hebeln; vier betrafen Werkzeug,
der fünfte den Lernpfad: „Der Weg von `scaling-fit` zu `target-config` ist noch keine Kette."
Beim Nachlesen von A3 §3.3 stellte sich heraus, dass die Lücke größer ist als eine fehlende
Verbindung — sie liegt **vor** beiden Enden, und zwar bei dem Punkt, den A3 als **ersten**
im Writeup verlangt.

## Der Befund

A3 §3.3 listet die Fragen, die das Writeup beantworten soll, in dieser Reihenfolge:

1. **„Given your fixed scaling laws budget of 12 B200-hours, how did you decide which runs to query?"**
2. Wie hast du gefittet?
3. Wie gut passt der Fit?
4. Welches N und welchen Loss sagt er für 48 B200-Stunden voraus?
5. Welche Hyperparameter würdest du dann fahren?

Die App beantwortete 2 bis 5. `scaling` und `scaling-fit` arbeiten auf Daten, die schon da
sind. `run-budget-ledger` (v81) prüft, was die API annimmt und abrechnet. `target-config`
(v82) übersetzt ein fertiges N in eine Konfiguration. **Welche Runs man überhaupt kauft,
entschied nirgends etwas** — obwohl die Mission `budget-design` „Geometrische Compute-Tiers
und Run-Matrix planen" wörtlich als Meilenstein führt. Gegenprobe in HEAD: `Versuchsplan`,
`experiment plan`, `Hebelarm`, `lever arm`, `welche Runs`, `which runs` — je 0 Treffer.

## Das Lab: `run-plan`

**Die Wahrheit ist eine Herleitung, kein gesetzter Wert.** Hoffmann et al. [2] — A3s eigene
Referenz — geben `L(N,D) = E + A/N^α + B/D^β` an. Unter `D = C/(6N)` löst sich `dL/dN = 0`
geschlossen auf zu `N_opt = [αA/(βB·6^β)]^(1/(α+β)) · C^(β/(α+β))`. Der Exponent ist damit
**0,451613** — genau das `a = 0,46`, das Hoffmann et al. berichten. Der Guard prüft die
geschlossene Form gegen eine Suche über fünf Compute-Größenordnungen.

**Modus A — dein Plan, von den 12 Stunden bis zur Verschwendung.** Vier Regler: Spannweite
der Tiers, Zahl der Tiers, Runs je Tier, Rasterschritt. Die Leiter wird immer so skaliert,
dass sie das Budget exakt füllt (`k · Σ C_j / Durchsatz = 43.200 s`), also **kostet jeder
der 108 Pläne dasselbe**. Drei gemessene Ergebnisse:

- **Dasselbe Geld, mehr als vier Größenordnungen Unterschied im Preis.** Die Vorhersagen
  für den 48-Stunden-Lauf liegen zwischen **0,22 %** und **52,17 %** daneben — in der
  Währung, die A3 benotet, zwischen **0,0002 %** und **15,60 %** weggeworfenem Compute.
- **Eine Regel gibt es nicht.** Spannweite hilft am deutlichsten und rettet trotzdem kein
  grobes Raster (bei Spannweite 64 geben 16 von 36 Plänen den Prior zurück). Mehr Tiers
  helfen am wenigsten, weil sie aus demselben Topf bezahlt werden und dabei das größte Tier
  schrumpfen — den Punkt, der dem Ziel am nächsten liegt. **Der beste Plan hat drei Tiers.**
- **Der teuerste Fehler ist unsichtbar.** Zentriert man das Raster auf einen Prior
  (Hoffmanns 20 Tokens je Parameter, `N = √(C/120)`, Exponent exakt 0,5) und ist es zu grob,
  gewinnt in **jedem** Tier derselbe Rasterindex. Jedes gemessene Minimum ist dann derselbe
  feste Faktor mal `√C`, und die Kleinste-Quadrate-Steigung ist im Lograum zwangsläufig
  0,5 — **mit perfekter Passgenauigkeit**. Kein Rauschen, keine schlechten Residuen, keine
  Warnung. **63 der 108 Pläne enden so:**

| Rasterschritt | 1,10 | 1,25 | 1,60 | 2,00 |
| --- | --- | --- | --- | --- |
| gibt den Prior zurück | 6/27 | 6/27 | **24/27** | **27/27** |

  `distinct === 1` und `|a − 0,5| < 1e-12` sind in allen 108 Zuständen dieselbe Menge. Der
  Abstand zwischen den beiden Familien ist dreizehn Größenordnungen breit: 41 der 63 landen
  bitgleich auf 0,5, der Rest innerhalb 3e-15, während der nächste wirklich messende Plan
  **0,0164** entfernt liegt.

**Modus B — wie genau das überhaupt sein muss.** Modus A liefert Prozentzahlen, und A3
benotet keine Exponenten, sondern einen Validation Loss. Also bekommt die Abweichung einen
Preis: das Compute, das man bezahlt und nicht genutzt hat. Am Optimum gilt
`αA·N^-α = βB·D^-β`, also ist der reduzierbare Loss bei `N = f·N_opt` genau
`(β f^-α + α f^β)/(α+β)` mal so groß wie am Optimum — und weil er entlang der Frontier ein
reines Potenzgesetz in C ist, **kürzt sich C vollständig heraus**:

```
Verschwendung(f) = 1 − [(β·f^-α + α·f^β)/(α+β)]^(−(α+β)/(α·β))
```

Diese Zahlen hängen an nichts, was das Lab setzt — nicht am Durchsatz, nicht am Budget,
nicht am Ziel. Gegen eine Bisektion auf der Frontier bei vier Budgets über fünf
Größenordnungen geprüft, Übereinstimmung auf 1e-9.

| höchstens weggeworfen | N darf liegen zwischen |
| --- | --- |
| 1 % | 0,8355 × und 1,1977 × |
| 2 % | 0,7751 × und 1,2918 × |
| 5 % | 0,6665 × und 1,5053 × |
| 10 % | 0,5592 × und 1,8004 × |

Zwei Konsequenzen, beide unbequem: Eine Vorhersage auf drei signifikante Stellen ist
verschenkte Mühe. Und **107 der 108 Pläne bleiben unter zehn Prozent Verschwendung**, auch
die mit grob falschem Exponenten — die Frontier ist so flach, dass sich schlechte Planung
erst im letzten Prozent zeigt. Genau ein Plan reißt die Grenze. Die verbreitete Faustregel
„im Zweifel größer" stimmt und bringt fast nichts: halb so groß kostet 13,9178 %, doppelt
so groß 13,5679 %.

## Ein Widerspruch zwischen zwei Labs, aufgelöst durch Nachrechnen

`scaling-fit` schließt Randminima aus dem Fit aus. A3 §2.1 empfiehlt wörtlich, je
Compute-Tier einfach den Run mit dem niedrigsten Loss zu nehmen. Beides steht jetzt in
derselben App, also musste die Frage entschieden werden — und sie wurde gemessen, nicht
geglaubt: Wirft man die markierten Tiers aus dem Fit, ändert sich in **11** der 108 Pläne
überhaupt etwas, und in **10 davon wird das Ergebnis schlechter**. **18 weitere** behalten
dann weniger als zwei Tiers und lassen sich gar nicht mehr fitten.

Der Grund steht im Guard: ein Randpunkt ist hier immer noch der dem wahren Optimum
nächstgelegene Rasterpunkt — geprüft für jede markierte Zeile. Zu eng ist das Fenster, nicht
falsch der Punkt. Die richtige Antwort auf ein ⚠ ist **Fenster verbreitern, nicht Zeile
löschen** — und beides kostet Budget, womit man wieder bei der Entscheidung ist, um die das
Lab geht.

## Verifikation

- **28 Guard-Blöcke grün** (27 → 28), keine bestehende Zahl bewegt. Laufzeit 14,4 s → 22,2 s.
- **Mutationstest 18/18 gefangen, 0 escaped**, nach einer Runde Nachbessern. Drei weitere
  Mutationen als **inert statt entkommen** identifiziert und der Grund jeweils gemessen:
  - `<` gegen `<=` bei der Minimumsuche: **0 exakte Gleichstände** in 468 Tier-Zeilen; der
    engste Abstand zwischen bestem und zweitbestem Loss ist 3,7e-6 relativ.
  - Obergrenze des Randtests entfernt: **0 von 468** Minima liegen am oberen Rand (87 am
    unteren), weil der Prior in 460 der 468 Zeilen überschätzt und in den 8 kleinsten um
    höchstens 1,59 % unterschätzt. Dieselbe Form von blindem Fleck wie v81s
    `Math.floor`/`Math.ceil`; der Guard zählt jetzt beide Seiten, damit die Verzweigung
    **wissentlich** ungetestet bleibt statt still.
  - Prior-Toleranz von 1e-12 auf 1e-2 geweitet: inert, weil der nächste messende Plan
    0,0164 entfernt liegt. Der Guard hält genau diese Trennung fest.
- **Eine echte Lücke, die der Mutationstest fand:** die Spalte „gemessenes N_opt" ließ sich
  auf das *wahre* N_opt umbiegen, und alle Anker hielten weiter — während die Fehlerspalte
  daneben unverändert eine Abweichung meldete, die die Tabelle nicht mehr zeigte. Vier neue
  Anker lesen Messung und Rasterfehler jetzt gemeinsam zurück, in zwei Zuständen, in denen
  die beiden Zahlen weit auseinanderliegen.
- **`render coverage` 4.261 → 5.989 Zustände über 10 Labs**, 6.189 Prüfungen; das neue Lab
  hat alle vier Eigenschaften von Tag eins.
- **`english render` 5.989 Zustände** durch den echten Übersetzer, 0 deutsche Fragmente,
  0 uninterpolierte Platzhalter. `panel i18n` 45 → 46 Panels, `renderer i18n` 1.633 → 1.699
  Strings, `i18n` 54 → 55 Labs und 3.665 → 3.773 UI-Strings.
- **Beide Sprachen headless über alle 232 Zustände gerendert.** Zahlformat sprachrichtig:
  DE `0,451874` / `43200,0000 s` / `13,5679 %`, EN `0.451874` / `43200.0000 s` / `13.5679 %`.
- `node --check` auf Inline-Script, `i18n-en.js` und `check-i18n.mjs`; **584 DOM-IDs,
  0 Duplikate**.

## Eine eigene Behauptung, die falsch war

Im Guard hatte ich geschrieben, der 20-Tokens-Prior überschätze das Optimum „überall in
diesem Bereich" — das ist der Grund, warum ein Minimum nur nach unten herausfallen kann. Der
Guard schlug sofort an: die beiden Kurven kreuzen sich bei `C = 5,5·10^16`, und **8 der 468**
Tier-Zeilen liegen darunter. Dort unterschätzt der Prior, aber nur um bis zu 1,59 % — weit
weniger als der engste Rasterschritt, weshalb das obere Randfeld trotzdem nie gewinnt. Der
Guard hält jetzt die Zahl statt des Worts.

## Was ich nicht gemacht habe

- **Das Lab steht auf keiner Lecture-Seite.** Keine Lecture-PDF lehrt A3s Budgetdesign; nach
  der bestehenden Regel gehört es zur Assignment-Seite. Verlinkt im Modul `scaling` und in
  A3s Mission `budget-design`.
- **Rauschfrei, und das ist Absicht.** A3s API ist deterministisch — gleiche Anfrage, gleiche
  Datenreihenfolge, gleicher Loss. Jeder Fehler hier kommt aus dem Plan. In einem verrauschten
  Aufbau kämen zusätzliche Runs je Tier zurück ins Spiel, die hier nur Budget kosten; das
  sagt der Ehrlichkeitsabschnitt des Labs selbst.
- **Der Durchsatz ist gesetzt, nicht gemessen** (10^15 FLOP/s). Er skaliert Messbudget und
  Ziel gemeinsam, bewegt also keine Aussage — nur die absoluten Modellgrößen. Er ist so
  gewählt, dass das wahre Optimum bei 48 B200-Stunden auf 8,26·10^8 fällt und damit direkt
  neben `target-config`s mittlere Vorgabe von 8,5·10^8; die Kette ist damit sichtbar, ohne
  dass ein Lab das andere fütterte.
- **Die Modellgrößen laufen stetig.** Dass sie am Ende auf `12 · n_layer · d_model²`
  einrasten müssen, rechnet `target-config` — das Lab sagt das und verlinkt dorthin.

## Nächste Hebel

1. **Die Kette wirklich verdrahten.** `run-plan` → `scaling-fit` → `target-config` →
   `run-budget-ledger` decken jetzt alle vier Schritte von A3 ab, aber jedes Lab setzt sein
   Eingangs-N selbst. Ein durchgehender Lauf, in dem der Plan aus Modus A das N liefert, das
   `target-config` diskretisiert, wäre A3 in einem Stück.
2. **Die restlichen Labs render-fähig machen** (offen seit v82): `english render` erreicht
   10 von 55; die anderen 45 Panels hält weiterhin nur `panel i18n`.
3. **Attribute in denselben Panels** (`aria-label`, `title`, `placeholder`) — offen seit v81.
4. **Gruppierung vereinheitlichen** (offen seit v79).
5. **Sechs unerreichbare Defaults** in den Lab-Helfern (offen seit v79).
