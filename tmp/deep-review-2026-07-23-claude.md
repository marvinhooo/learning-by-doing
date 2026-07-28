# Deep Review 2026-07-23 (Claude-Run)

Kontext: Isolierter git-Worktree `hungry-allen-18721f`, Basis `54ed090`. Das
Haupt-Worktree trägt weiterhin die **uncommitteten v45-Änderungen** (mtime
`index.html` 22.07. 00:48) — Codex war seit >24 h inaktiv, ich habe im
Haupt-Worktree nichts angefasst. Wie schon `clever-tharp-bd83d2` enthält dieser
Branch die v45-Änderungen **nicht**; beide Feature-Branches müssen später gegen
den v45-Stand gemerged werden.

Commit: `c923a5b` auf `claude/hungry-allen-18721f`.

## 1. Erst geprüft, dann gebaut: stimmt die Assignment-Treue wirklich?

Die Vorreports behaupten, die Plattform hänge sich exakt an den Original-Handouts
entlang. Das ist die stärkste Einzelbehauptung im Repo, also habe ich sie nicht
geglaubt, sondern gemessen: alle `Problem (…)`-IDs aus den sechs PDFs extrahiert
(`pdftotext` + Positionsscan) und beidseitig gegen die `mission.scope`-Strings der
laufenden App gediffed.

**Ergebnis: 124/124, exakter Match in beide Richtungen, über alle fünf
Assignments.** Kein Problem im Handout fehlt in der Plattform, kein Eintrag in der
Plattform ist erfunden. Die Behauptung hält.

| | Probleme | Punkte | GPU-h |
|---|---|---|---|
| A1 Basics | 38 | 109 | 17 |
| A2 Systems | 27 | 137 | 0 |
| A3 Scaling | 2 | 55 | 0 |
| A4 Data | 13 | 71 | 0 |
| A5 Alignment (+Supplement) | 44 | 151 | 30 |
| **Summe** | **124** | **523** | **47** |

## 2. Die eigentliche Lücke

Abdeckung war also nicht das Problem — **Auflösung** war es. Ein Missionsblock
zeigte bisher nur die nackten IDs als flachen Punkt-String:

```
unicode1 · unicode2 · train_bpe · train_bpe_tinystories · …
```

Das Handout trägt pro Problem aber deutlich mehr: den Originaltitel, den
Punktwert, die Deliverable-Formulierung und teils ein GPU-Stunden-Budget. Genau
diese Metadaten bedienen zwei erklärte Ziele:

- *„extrem effizient"* — ohne Gewichte kann man Aufwand nicht planen. `train_bpe`
  (15 Punkte, Code) und `unicode1` (1 Punkt, kurze Antwort) sahen vorher
  identisch aus.
- *„konfident lösen"* — man muss vorher wissen, ob ein Problem eine
  Implementierung, eine Herleitung oder einen gemessenen Lauf verlangt. Das
  entscheidet, ob man den Editor oder das Notizblatt aufmacht.

Und: das sind **Metadaten, keine Lösungen**. Die Grenze „Lernhilfe, keine
Abgabelösung" bleibt unberührt.

## 3. Umgesetzt

**`HANDOUT_PROBLEMS`** (neue Konstante, 124 Einträge). Keys sind
`<assignment>:<problem>` — nötig, weil `data_loading` und `leaderboard` über
Assignments hinweg kollidieren. Werte `[points, modes, gpuHours, title]`, `modes`
eine Teilmenge von `c`/`w`/`r`.

**Problem-Map im Missionsblock.** Pro Problem eine Zeile: ID, Originaltitel, Art
der Arbeit, Punkte. Darunter eine Blocksumme, z. B.

> `7 Probleme · 42 Punkte · 2× Code, 5× Schreiben, 1× Messen`

Mit Legende, die erklärt, was die drei Kategorien bedeuten, und dem expliziten
Satz: *„Nichts davon ist ein Termin oder ein Soll."*

**Aufwands-Callout auf der Assignment-Seite:**

> Was dieses Assignment tatsächlich verlangt — 38 Probleme · 109 Punkte · 17
> GPU-Stunden Trainingsbudget. 18 verlangen Code; 15 verlangen Schreiben; 10
> verlangen einen Messlauf. Ein Problem kann mehreres zugleich verlangen, deshalb
> überschneiden sich die Zahlen. Das ist Orientierung für deine eigene
> Aufwandsplanung – nie ein Zeitplan, kein Abschluss-Gate und keine
> Kompetenzwertung.

Die Regel „keine Terminmechanik" ist auf jeder neuen Oberfläche explizit
ausgeschrieben, nicht nur implizit eingehalten.

**Drift-Guards in `check-i18n.mjs`.** Jede `mission.scope`-ID braucht einen
Eintrag, jeder Eintrag muss von einem Scope referenziert werden (beidseitig, also
kann weder eine ID noch ein Eintrag unbemerkt verwaisen), plus Shape-Validierung
aller vier Felder. Die bestehenden Renderer-Guards wurden auf den neuen
Markup-Vertrag umgestellt, ihre Absicht bleibt erhalten.

## 4. Genauigkeit der Extraktion — und ihre Grenzen

Titel, Punkte und GPU-Stunden stehen wörtlich in den Handout-Überschriften; die
sind exakt. Die **Arbeitsart** ist dagegen aus den Deliverable-Absätzen
klassifiziert, also eine Heuristik. Vier Fehlerklassen sind mir dabei
untergekommen und behoben:

1. *Regex-Lookahead-Backtracking* — begrenzte lazy Quantoren rissen ganze
   Problemblöcke weg (A1 lieferte 9 statt 38, A3/A4 null). Ersetzt durch
   Positionsscan mit Slicing zwischen aufeinanderfolgenden Treffern. Derselbe
   Fehler trat ein zweites Mal in der Deliverable-Regex auf.
2. *Einfach-Label war lossy* — die meisten CS336-Probleme verlangen Code **und**
   Write-up. Ersetzt durch unabhängige Flags.
3. *Unter-Matching* — A4-Deliverables in Nominalform („A function that performs
   exact line deduplication", ohne Imperativ) galten als Write-up. Regex
   erweitert.
4. *Textbluten* — `think_about_importance_reweighting` zog den Folgesatz „we will
   implement the GSPO loss" mit ein und galt fälschlich als Code. Behoben durch
   Abschneiden an der nächsten Abschnittsüberschrift; alle vier verdächtigen
   A5-Fälle stimmen danach mit dem Handout überein.

**Verbleibendes Risiko:** Grenzfälle können weiterhin ein Label zu viel oder zu
wenig tragen. Punkte und Titel sind belastbar, die Arbeitsart ist eine sehr gute
Näherung — kein Ersatz für den Blick ins Handout. Das ist vertretbar, weil die
Anzeige ausdrücklich als Orientierung deklariert ist.

## 5. Verifikation

- `node --check` auf dem extrahierten Inline-Script (1,07 MB): SYNTAX OK
- `node scripts/check-i18n.mjs`:
  `handout problems OK: 124 problems, 523 points, 47 GPU hours` +
  `i18n OK: 72 concepts, 79 formulas, 72 symbols, 70 glossary entries, 26 labs, 29 missions, 1047 UI strings`
  (Bundle-Zahlen unverändert — die neuen Strings sind Inline-Ternaries, keine
  Bundle-Keys)
- Browser EN und DE geprüft: Problem-Map und Callout rendern korrekt, Singular/
  Plural stimmt („1 Punkt" / „3 Punkte"), 38 Zeilen in 6 Maps auf A1 = die
  erwarteten 38 Probleme
- Keine Konsolenfehler
- Mobil (375 px): `@media (max-width: 540px)` greift, einspaltig, kein
  horizontales Überlaufen (`scrollWidth == innerWidth`)

Ein CSS-Kaskadenfehler ist dabei aufgefallen und behoben: die bestehende Regel
`.accordion-fact span` (`text-transform: uppercase`) trifft **alle**
Nachfahren-Spans, nicht nur das Abschnittslabel — die Problem-Map rendete
zunächst komplett in Großbuchstaben. Behoben durch expliziten Reset und
Umhängen der Selektoren von `.problem-row` auf `.problem-map`.

## 6. Nächster Hebel

Der Vorreport nannte den **Grundlagen-Schnellstart** und hat ihn großenteils
verdrahtet. Was aus diesem Run folgt: Die Problem-Map macht jetzt sichtbar, wo
das Gewicht in einem Assignment liegt (A2: 137 Punkte, aber nur 7 Code-Probleme
— der Aufwand steckt in Messung und Analyse, nicht im Tippen). Das wäre die
Grundlage für eine **gewichtete Reihenfolge innerhalb eines Assignments** — die
Blöcke nach Punktdichte statt nach Handout-Reihenfolge anbieten. Braucht
Freigabe, weil es die Lernpfad-Reihenfolge berührt.
