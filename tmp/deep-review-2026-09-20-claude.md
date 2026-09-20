# Deep Review 2026-09-20 — v117

**Branch** `claude/deep-review-v117`, Commit `42b1863`, gebaut auf dem Kettenkopf v116 `33b4e0d`.
**71 Guard-Blöcke** grün (vorher 70), Suite-Exit 0, Cache **v97**, Build `scripts/build-site.mjs` grün.

## Vorlauf

Der zugewiesene Worktree stand auf **v99** (`2ed21e7`) — wieder nicht der Kettenkopf. Die
Ahnenprüfung über alle 60+ Branch-Spitzen nannte **v116** (`33b4e0d`, `claude/objective-elion-406e94`)
als einzigen Kopf, der jede andere Spitze enthält; `git switch -c` darauf statt `reset --hard`
(destruktiv, vom Klassifizierer abgelehnt und hier auch unnötig, weil v99 in v116 enthalten ist).
Der Haupt-Checkout ist seit 2026-07-29 unberührt — keine aktive Codex-Sitzung, also normaler Lauf
statt Nur-Report.

## Der geschlossene Hebel: die Zahl, die neun Lectures lang stehen blieb

Hebel 1 der offenen Liste, und beim Nachmessen größer als die Notiz sagte.

Die Lecture-Seite druckt eine Totals-Leiste — `A1 · 28/38 Probleme` — unter der Zeile „Bisher
vollständig auf abgedecktem Stoff". Diese Zahl steht **von Lecture 3 bis Lecture 11 still**, neun
Seiten lang. Der Grund ist strukturell: `lectureProblemOutlook` nennt ein wartendes Konzept nur,
wenn ein Problem an **genau einem** verbleibenden Konzept hängt *und* die Seite ein anderes seiner
entscheidenden Konzepte lehrt. Gemessen, was die neun Seiten über A1 sagen:

| Lecture | A1 zeigt | genannte Konzepte | davon für A1 verspätet |
|---|---|---|---|
| l03 | 28/38 | benchmark-validity | benchmark-validity |
| l04 | 28/38 | — | — |
| l05 | 28/38 | profiling, kernel-contracts | — |
| l06 | 28/38 | ddp-zero-fsdp | — |
| l07–l10 | 28/38 | — | — |

**Fünf der neun Seiten sagen gar nichts**, und auf den übrigen wird höchstens eines der drei
wartenden Konzepte zufällig getroffen. v116 hat das auf der A1-Seite beantwortet; die Fläche, auf
der die Frage beim Gehen des Pfades entsteht, schwieg weiter.

### Die Invariante

Vor dem Bau gemessen, über alle 5 Assignments × alle Lectures ab ihrer jeweiligen Grenze:

> **Jenseits der eigenen Vorbereitungsgrenze eines Assignments ist jedes noch geschlossene Problem
> durch ein Konzept geschlossen, das der Kurs später lehrt.**

`all − done` der Leiste stimmt in **jedem** Fall exakt mit der Spätmenge überein (A1: 10 Probleme
ab l03, 8 ab l11, 0 ab l12; die anderen vier Assignments stehen ab ihrer Grenze auf all/all). Das
ist die Aussage, die der neue Block druckt — und sie gilt auch rückwärts: *vor* der Grenze ist das
Warten der gewöhnliche Pfad, kein verdecktes Vorwissen, also schweigt der Block dort.

### Die Änderung

`lectureLateAssignments` / `lectureLateAssignmentsMarkup`, gerendert direkt hinter der Leiste, die
sie erklärt. Der Block **benutzt `assignmentLateConcepts` wieder**, statt dieselbe Menge ein zweites
Mal herzuleiten — nur so können die beiden Flächen nicht auseinanderlaufen. Gezählt werden nur
Konzepte, die noch vor dem Lesenden liegen, also schrumpft die Leiste mit, statt den festen
Gesamtwert der Assignment-Seite zu wiederholen. Jedes Konzept kommt als Button auf seine Seite,
mit der Lecture, in der es ankommt. Kein Gate, kein Termin — der Text sagt das ausdrücklich.

## Guard `lecture late` — 314 Prüfungen

Invariante über **37 Paare jenseits** und **48 diesseits** einer Grenze; Erscheinungsmenge
abgeleitet statt getippt; Zahlen, Punkte, Problem-IDs und Ankunfts-Lectures aus dem **gerenderten
Markup** zurückgelesen, in beiden Sprachen; Schrumpfen und Verstummen geprüft; Übereinstimmung mit
der v116-Fläche; Call-Site samt Binder; Sprachtrennung gezählt statt gegen eine Wortliste geprüft.

### Mutationstest: 24 gefangen, 0 entkommen, 0 inert

Der **erste** Lauf endete 19/5. Alle vier echten Escapes waren Wiederholungen bekannter Muster:

1. **Referenz aus der geprüften Größe abgeleitet** (Lektion 13): die erwartete Kopfzeile wurde aus
   `group.points` gebaut — eine Mutation, die jedes Problem mit 1 Punkt bewertet, bewegte beide
   Seiten gemeinsam. Jetzt wird der Punktwert aus `HANDOUT_PROBLEMS` neu addiert.
2. **Vorkommen statt Ort** (Muster 5, zum fünften Mal): die Ankunfts-Lecture wurde irgendwo im Text
   gesucht — die Kopfzeile nennt dieselben Lectures, also blieb der Guard grün, als *jeder* Button
   die Grenz-Lecture druckte. Jetzt am vollständigen Button-Fragment verankert.
3. **Badge gar nicht zurückgelesen**: zeigte die Konzept- statt der Problemzahl.
4. **Ankunftsliste gar nicht geprüft**: doppelte Lecture-Nennung blieb unbemerkt.

Die fünfte Mutation war **untauglich, nicht entkommen** (sie fügte ein deutsches Wort in den
deutschen Zweig ein und verletzte die geprüfte Behauptung nie) — ersetzt durch eine echte
Leck-Mutation (`english=false`), die gefangen wird.

## Kopflose Renderprüfung (Browsertest bleibt in geplanten Läufen gesperrt)

Die **vollständige** Lecture-Seite durch den echten App-Sandkasten gerendert, DE und EN, für
l02/l03/l07/l11/l12: Abschnitt erscheint genau auf l03–l11, sitzt hinter der Totals-Leiste und vor
dem Missing-Block, Tag-Bilanz 0 auf allen zehn Renders, Konzepttitel im Englischen übersetzt
(„Benchmarks, Validity & Contamination").

## Offene Hebel

1. Tausendergruppierung im deutschen Render (`43200` statt `43.200`), legitime Ausnahmen unklassifiziert.
2. `GERMAN_WORDS` blind für deutsche Substantive ohne Umlaut (seit v112).
3. `l13` fehlt eine Formelkarte für die Gopher-Qualitätsregeln.
4. `scaling-transfer` bleibt das eine Lab ohne rechnende Bühne.
5. Browsertest steht seit v71 aus (in geplanten Läufen gesperrt).
6. `origin/main` auf `2ed21e7`; **v100–v117 ungepusht.**
