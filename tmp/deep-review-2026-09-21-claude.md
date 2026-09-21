# Deep Review 2026-09-21 — v118

Branch `claude/deep-review-v118`, gebaut auf dem Kettenkopf v117 (`f9c4663`).
Ahnenprüfung **vor** dem Lauf: jede Branch-Spitze im Kopf enthalten, kein verlorener Zweig.
Ahnenprüfung **nach** dem Lauf: dieselbe Antwort.

## Vorlauf

Der zugewiesene Worktree stand auf v99 (`2ed21e7`), 18 Commits hinter dem Kopf — wie üblich.
`git switch -c claude/deep-review-v118 f9c4663`, nachdem die Prüfung zeigte, dass die eigene
Spitze enthalten ist. Baseline: 71 Guard-Blöcke grün, 69 s.

## Der geschlossene Hebel: der Fit, den kein Bildschirm rechnete

Offener Hebel 4 der Liste lautete „`scaling-transfer` bleibt das eine Lab ohne rechnende Bühne".
Daneben stand in `check-i18n.mjs` eine Zusicherung, die das rechtfertigte:

> scaling-transfer stays, its surface is a question form and **nothing it could compute**.

Die eigene `desc` des Labs sagte etwas anderes: **„Prüfe Offset-Fit."** Und seine
`transferAnswer` nennt den Mechanismus vollständig — gefittet wird `log(L_opt − E)`, nicht
`log L_opt`, und ein verändertes E verschiebt γ. Das ist Arithmetik.

Die Gegenprobe über die ganze App: **keine Fläche hat je eine Loss-Kurve gefittet.**
`scaling-fit` fittet N_opt gegen C. `run-plan` wertet das Loss-Modell an einem bereits
vorhergesagten N aus. Der Offset selbst wurde nirgends geschätzt.

Und das ist keine Randnotiz: A3s größtes Problem, `scaling_laws` mit **50 Punkten**, verlangt
wörtlich „predict the validation loss that this model will obtain" und fragt „What is the
predicted loss?". Die Lücke saß unter dem am schwersten gewichteten Deliverable des Kurses.

### Vor dem Bau gemessen

Das Loss-Modell war schon da (Hoffmann et al., in `run-plan`: E = 1,69, A = 406,4, α = 0,34,
B = 410,7, β = 0,28), also wurde es nicht zweitgeschrieben. Gemessen wurde zuerst, ob die
Sache überhaupt etwas zeigt:

| Offset E | γ | Rest-RMSE | Vorhersage | Fehler |
|---|---|---|---|---|
| 0 (naiv) | 0,0720 | 0,0076 | 2,4328 | −0,0938 |
| 1,69 (wahr) | 0,1535 | 1e−15 | 2,5266 | 0,0000 |
| 2,1 | 0,2127 | 0,0056 | 2,5826 | +0,0560 |

γ spannt einen Faktor 2,95, während der Rest unter 0,011 bleibt. Das ist die Aussage des Labs,
und sie trägt: **die Fehlspezifikation ist in-sample unsichtbar und nur in der Extrapolation
zu sehen.** Bei σ = 0,005 stehen 2,6·σ Residuum gegen 19,1·σ Fehler.

### Was die Bühne zeigt

Drei Regler: wofür die 12 B200-Stunden ausgegeben werden (vier Leitern), wie mit dem Offset
umgegangen wird (fünf Fassungen), wie stark die Seeds streuen (vier Stufen). Daneben die
Messreihe Zeile für Zeile, der Fit im Lograum, die Extrapolation — und die zwei Zahlen
nebeneinander, jede in σ.

Drei Dinge, die dabei herauskamen und die ich vorher nicht wusste:

1. **Die spärliche Leiter.** Drei Punkte, drei Parameter (E, A, γ): der Fit interpoliert exakt,
   Rest-RMSE 1,9e−6 — und verfehlt das Ziel um 20,7·σ, das Tausendfache des Fehlers der
   fünfpunktigen Leiter bei *derselben* Reichweite. Ein makelloser Fit ist hier kein Gütezeichen,
   sondern die Abwesenheit einer Prüfung. Ohne Rauschen trifft dieselbe Leiter — es ist wirklich
   das Rauschen, das mitgefittet wurde.
2. **Die Reichweite ist ein Hebel, das Budget eine Schranke.** Dasselbe Budget höher oben
   ausgegeben halbiert den Fehler (−0,181 bei 43,2× gegen −0,094 bei 10,8×). Weiter als rund
   10× kommt man mit 12 B200-Stunden nicht: extrapoliert wird immer, die Frage ist nur, von wo.
3. **E und seine Vorhersage sind verschieden gut bestimmt.** Siehe unten — das hat den Bau
   einmal umgeworfen.

### Die Ziehung, die etwas behauptete, das der Leser nicht sieht

Die Prosa für den geschätzten Offset sagte zunächst „der geschätzte Offset wandert weit".
Der eigene Guard hat das abgelehnt, und zu Recht: **mit der festen Ziehungsliste landet der
Scan auf den fünfpunktigen Leitern zufällig innerhalb von 0,024 am wahren Offset.** Eine
Ziehung zeigt einen Zufall, keine Streuung — die Behauptung stimmte im Mittel und war auf dem
Schirm falsch.

Die Reparatur macht die Aussage sichtbar statt sie zu streichen: Das Lab rechnet dieselbe
Schätzung auf allen acht Rotationen derselben Liste und zeigt die Spannen. Bei σ = 0,005 auf
der tiefen Leiter spannt **E 0,700, die Vorhersage daraus 0,079** — Faktor 8,9. Das ist die
eigentliche Lehre, und sie ist besser als die, die ich schreiben wollte: dieselbe Kopplung,
die E unbestimmt macht, schützt die Vorhersage. Für A3 heißt das: für E ein Intervall
berichten, den Fit aber an der Vorhersage bewerten.

### Ein Nebenbefund aus der Absatzprüfung

Die neue Prüfung „welcher Absatz erscheint in welchem Zustand" hat einen echten Inhaltsfehler
gefunden: Ein Offset **über** dem kleinsten gemessenen Loss fiel auf den beiden Leitern, auf
denen er trotzdem fittet, in den `else`-Zweig und bekam die Prosa des *wahren* Offsets
(„Mit dem wahren Offset ist der Fit exakt"). Behoben; die Grenze `E < min L` wird jetzt
8-mal als Ablehnung und 8-mal als Fit durchlaufen.

## Guard `offset fit` — 923 Prüfungen

Unabhängig, nicht gegen sich selbst geprüft:

- Die Frontier wird durch **Minimierung von L(N, C/(6N)) über N** neu gerechnet statt über die
  geschlossene Form (Übereinstimmung besser als 1e−9 an 8 Tiers).
- `(L − E)` wird als reines Potenzgesetz in C über 5 Spannen **belegt**, statt angenommen —
  daraus folgt γ = 0,153548 als die Zahl, die der Fit zurückgeben muss.
- Beide Summenstatistiken (`rmse`, `worst`) werden aus den Punkten und dem Fit neu gebildet.
- **624 Zahlen** werden aus dem gerenderten Markup zurückgelesen, in beiden Sprachen, mit
  sprachrichtiger Trennzeichen-Auswertung (ein deutsches „31.0" fiele hier durch).

`LR_NO_STAGE` ist jetzt **leer**: der Render-Sweep erfasst **64 von 64 Labs** (vorher 63).

### Mutationstest: 42 von 46 gefangen

Drei Runden. Die erste meldete 6 entkommen — alle sechs waren echte Befunde:

| Entkommen | Warum | Behoben durch |
|---|---|---|
| `rmse` ohne Wurzel | Markup und Report waren beide falsch, also einig | unabhängige Neuberechnung |
| `worst` ohne Betrag | nie gegen eine zweite Rechnung gehalten | dito, plus: 23 Zustände haben ein negatives größtes Residuum |
| Ensemble auch ohne Rauschen | hätte NaN gerendert; nur verrauschte Zustände geprüft | beide Richtungen + NaN-Prüfung |
| „gemessen"-Spalte zeigte den Frontier-Wert | die Spalte war nie gelesen worden | Anker + Rücklesung, plus die Forderung, dass sich beide Spalten unterscheiden |
| Absatzwahl (2 Mutationen) | geprüft war das Gerechnete, nicht das *Ausgewählte* | Absatz je Zustand unabhängig hergeleitet |

Zwei Mutationen bleiben entkommen, und der Grund ist gemessen: die **Obergrenze des
Offset-Scans entscheidet nichts**, weil `stFit` ohnehin jeden Offset ab dem kleinsten
gemessenen Loss ablehnt (0 von 201 geprüften Offsets darüber fitten). Sie verschiebt den
gefundenen Offset um **0,724 eines Rasterschritts**. Der Guard hält diese Zahl fest, damit
die Grenze wissentlich statt still ungeprüft bleibt; wird sie je größer als ein Schritt,
schlägt er an. Die *Auflösung* des Rasters ist dagegen geprüft (die Mutation auf 20 Schritte
wird gefangen). Der überflüssige Sicherheitsabstand von 0,01 wurde dabei entfernt — er täuschte
eine Wahl vor, die es nicht gab.

Kontrollmutation (ein deutsches Kommentarwort) bleibt wie gefordert grün: der Runner
unterscheidet.

## Kopflose Renderprüfung

Alle **80 Zustände** in beiden Sprachen: kein `undefined`, kein `NaN`, kein uninterpoliertes
`${`, Tag-Bilanz ausgeglichen. Ein Nebenbefund dabei: `C_Ziel / C_oben` stand außerhalb von
`tr()` und blieb im englischen Render deutsch — genau der bekannte blinde Fleck von
`GERMAN_WORDS` (deutsche Substantive ohne Umlaut, offener Hebel 2). Behoben. Ein anschließender
Sweep aller 80 englischen Renders gegen eine erweiterte Wortliste findet nur noch `in` und
`Fit`, beide hier echtes Englisch.

## Offene Hebel

1. **`GERMAN_WORDS` blind für deutsche Substantive ohne Umlaut** — dieser Lauf hat einen realen
   Leck dieser Klasse gefunden (`C_Ziel / C_oben`), also ist der Hebel nicht mehr theoretisch.
   Nächster Schritt: die Wortliste um Substantive erweitern oder, besser, gegen die
   ui-Pack-Schlüssel prüfen statt gegen eine Wortliste.
2. Tausendergruppierung im deutschen Render (`43200` statt `43.200`), legitime Ausnahmen
   unklassifiziert.
3. `l13` fehlt eine Formelkarte für die Gopher-Qualitätsregeln.
4. **Erledigt:** jedes der 64 Labs hat eine rechnende Bühne.
5. Browsertest steht seit v71 aus (in geplanten Läufen gesperrt).
6. `origin/main` auf `2ed21e7`; **v100–v118 ungepusht.**
