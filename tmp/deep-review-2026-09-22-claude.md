# Deep Review 2026-09-22 — v119

Branch `claude/deep-review-v119`, gebaut auf dem Kettenkopf v118 (`3e39cf9`).
Ahnenprüfung **vor** dem Lauf: der zugewiesene Worktree stand auf v99 (`2ed21e7`),
**19 Commits hinter dem Kopf** — und die Prüfung über alle Spitzen fand die Kette
v100–v118 als verlorenen Zweig. Auf v118 zurückgesetzt, dort gearbeitet.
Ahnenprüfung **nach** dem Lauf: jede Branch-Spitze im Kopf enthalten.

Baseline: 72 Guard-Blöcke grün, 77 s. Danach: 72 grün, 79 s.

## Der geschlossene Hebel: offener Hebel 1

Die Liste sagte: „`GERMAN_WORDS` blind für deutsche Substantive ohne Umlaut — dieser
Lauf hat ein reales Leck dieser Klasse gefunden (`C_Ziel / C_oben`), also ist der
Hebel nicht mehr theoretisch." Vorgeschlagener nächster Schritt: gegen die ui-Pack-
Schlüssel prüfen statt gegen eine Wortliste.

Der Detektor war eine Liste von rund 60 Wörtern. Seine Lücke ist strukturell: ein
deutsches Substantiv ohne Umlaut und ohne eines der gelisteten Funktionswörter geht
durch. Statt die Liste zu verlängern — sie kennt immer nur die Schreibweisen, an die
jemand gedacht hat — wird die Frage ans Korpus gestellt: **welche Wörter benutzt die
deutsche Seite dieser App, die die englische nie benutzt?**

Ergebnis: **10.457 Wörter**, abgeleitet statt getippt, und sie wachsen mit der App.

### Vor dem Bau gemessen

Erst gemessen, ob die Sache überhaupt etwas findet, und was sie an Fehlalarm kostet.
Ein instrumentierter Lauf über alle fünf Flächen, an denen bisher `GERMAN_WORDS`
stand: **44 Treffer auf 7 verschiedenen Wörtern.** Jeder einzeln beurteilt:

| Wort | Treffer | Urteil |
|---|---|---|
| `gegen` | 32 | **echtes Leck** — rohes Literal in `shown`, an `tr()` vorbei |
| `neu` | 1 | **echtes Leck** — der Index von `θ_neu` blieb deutsch |
| `lang` | 6 | `lang=en`, maschinenlesbares Feld |
| `hbm-byte` | 2 | `FLOP/HBM-Byte`, eine Einheit |
| `reacts`, `confounder`, `webpage` | 3 | englische Prosa aus bilingualen `en:`-Feldern |

Zwei echte Lecks also, die die Wortliste durchgelassen hat — und fünf Fehlalarme,
die keine Ausnahmeliste brauchen, sondern drei **strukturelle** Regeln.

## Die zwei Lecks

**`run-budget-ledger`** (index.html:11396). `rbConstraints` baut die Spalte „Ergebnis":

    shown:`${arch.d} gegen ${arch.heads} · ${arch.headDim} = ...`

Die Zeile daneben, `rule`, geht durch `tr()`; `shown` nicht. Im englischen Render
stand `448 gegen 7 · 64 = 448`. Zweimal im selben Block (`hidden`, `runtime`).

Der erste Reparaturversuch war falsch und hat das selbst gezeigt: `tr()` direkt in
`rbConstraints` gesetzt — woraufhin zwei Guard-Sandboxes mit `ReferenceError: tr is
not defined` abbrachen. Der Grund ist kein Sandbox-Problem: **die App hat gar kein
globales `tr`**, jedes `tr` ist lokal in einer Renderfunktion deklariert. Die
Reparatur hätte die echte Seite gebrochen. Stattdessen nimmt `rbConstraints` das
Wort jetzt als Parameter entgegen, und die Renderfunktion, die ein `tr` im Scope
hat, reicht es herein. Ohne Default — ein Default, den niemand erreicht, ist genau
das, was ein anderer Guard in diesem Repo verbietet.

**`optimizer`** (index.html:7680). Das Label ging durch `tr()`, der Index nicht:
`<strong>θ_neu = ...</strong>` wurde im Englischen zu „New parameter θ_neu".
Jetzt `tr("θ_neu")` mit Pack-Eintrag `θ_new`.

Beide Richtungen nachgesehen: Deutsch zeigt weiter `gegen` und `θ_neu`, Englisch
zeigt `versus` und `θ_new`.

## Die drei Ausschlüsse, und warum keiner eine Liste ist

1. **Bilinguale `en:`-Werte.** index.html trägt `{de:…, en:…}`-Einträge. Der erste
   Entwurf nahm sie nur von der *deutschen* Seite weg — und scheiterte an
   „Confounder": ein Lehnwort, das die deutsche Prosa benutzt und das Pack nie,
   dessen englische Übersetzung aber inline in index.html steht. Richtig ist die
   symmetrische Fassung: die `en:`-Werte gehören **auf die englische Seite**.
2. **`ui.__patterns`.** 84 Regex-Quellen, die Deutsch matchen, um es zu übersetzen —
   ihr Deutsch ist der Zweck. Als englischer Beleg gezählt hätten sie 258 Wörter aus
   dem Vokabular gelöscht, darunter „und", „von", „durch".
3. **Bindestrichhälften.** „HBM-Byte" zerfällt in zwei englisch belegte Hälften,
   „C_Ziel" überlebt die Trennung.

Dazu am Aufrufort: `wort=` wird übersprungen (`lang=en` ist ein Feld) — und zwar
**ohne** Leerzeichen um das `=`. Die Unterscheidung ist nicht kosmetisch: siehe M2.

## Mutationstest: 6 von 7, plus die geforderte grüne Kontrolle

| Mutation | Ergebnis |
|---|---|
| `gegen` als rohes Literal zurück | gefangen |
| `θ_neu` zurück | **zuerst entkommen**, siehe unten |
| Detektor kann nicht feuern | gefangen (Gegenrichtung, 0 von 686) |
| bilinguale Hälften vermischt | gefangen |
| `__patterns` nicht ausgeschlossen | **zuerst entkommen**, siehe unten |
| Vokabular ohne Bindestrich-Trennung | gefangen |
| Vokabular-Untergrenze entfernt | inert, Grund gemessen |
| *Kontrolle:* deutsches Wort in einem Kommentar | bleibt grün |

**M2 entkam zuerst, und das war ein echter Fund.** Die `lang=en`-Regel erlaubte
Leerzeichen um das `=` und verschluckte damit `θ_neu = 1.000000` im Ganzen — die
Reparatur dieses Laufs wäre unter einer Mutation unbemerkt zurückgekommen. Ohne
Leerzeichen trennt die Regel das maschinenlesbare Feld vom beschrifteten Wert.

**M5 entkam zuerst, weil die Fläche fehlte.** Der Ausschluss von `__patterns` hing
an keiner Prüfung; die Flächen, auf denen sich das zeigt, waren nicht verdrahtet.
Eine inerte Mutation ist erst geklärt, wenn ihr Grund gemessen ist — hier war der
Grund eine Lücke, also wurde die Lücke geschlossen: die Assignment-Voraussetzungen
werden jetzt mitgescannt, und die 258 Wörter sind als Zahl festgehalten.

**M8 ist inert mit gemessenem Grund:** die Untergrenze (8.000) ist ein Rückfallnetz
unter einem realen Vokabular von 10.457; sie allein zu senken kann nichts ändern.
Dass ein *kollabiertes* Korpus auffliegt, zeigt M7 über die Gegenrichtung.

## Die Grenze des Modells steht im Guard

„mit" ist **nicht** im Vokabular — die MIT-Lizenz im englischen Pack macht es
kleingeschrieben zu einem englischen Beleg. Das ist als Ausnahme benannt und in
**beiden Richtungen** gehalten: das Wort muss fehlen, *und* der Grund dafür muss
noch da sein. Verschwindet der Lizenztext, meldet sich die Ausnahme selbst, statt
als blinder Fleck liegen zu bleiben. Die übrigen 14 Kernwörter sind als Zusicherung
festgeschrieben, darunter die vier, die dieser Lauf scharf gemacht hat: „gegen",
„neu", „ziel", „oben".

## Offene Hebel

1. **Erledigt:** `GERMAN_WORDS` ist als alleiniger Detektor abgelöst; die Wortliste
   läuft weiter daneben, das Korpus-Vokabular ist der schärfere Teil.
2. Tausendergruppierung im deutschen Render (`43200` statt `43.200`), legitime
   Ausnahmen unklassifiziert. **Jetzt der größte offene Hebel.**
3. `l13` fehlt eine Formelkarte für die Gopher-Qualitätsregeln.
4. Der Korpus-Detektor läuft an 5 der Flächen; die Konzept- und Lecture-Seiten
   könnten denselben Scan bekommen.
5. Browsertest steht seit v71 aus (in geplanten Läufen gesperrt).
6. `origin/main` auf `2ed21e7`; **v100–v119 ungepusht.**
