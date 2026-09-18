# Deep Review v115 — 2026-09-18 — der Rückweg stand dort, wo der Leser selten steht

Fortsetzung von [v114](deep-review-2026-09-17-claude.md). Der zugewiesene Worktree stand auf
**v99** (`2ed21e7`), der Kettenkopf auf **v114** (`98fcf0d`, Branch `claude/deep-review-v114`
bzw. `claude/gracious-matsumoto-1df44d`). Die Ahnenprüfung über alle Branch-Spitzen ergab **keinen
verlorenen Zweig** — weder vor noch nach dem Lauf. **Kein Codex auf diesem Repo**: der
Haupt-Checkout trägt Zeitstempel vom 29. Juli. `origin/main` steht auf `2ed21e7`; **v100 bis v115
sind ungepusht.**

Auftrag unverändert: derselbe Wissensstand wie aus der Vorlesung, und die Assignments lösen können.

## Der Befund

v114 hinterließ als Hebel 1 den Rückweg im Formel-Akkordeon, offen seit v108. Er ist gebaut.

`formulaAccordion` enthält **alles**, was `renderFormulaDetail` enthält — Primer, Lernsequenz,
Intuition, Dimensionen, Fehlerbild, Selbstcheck — **außer `formulaRouteMarkup`**. Genau dieser eine
fehlende Baustein ist der Weg vom Lesen zum Rechnen: die Konzeptseite, die die Regel herleitet, und
das Experiment, das sie ausrechnet. Der Rückweg war also auf der Fläche gebaut, auf der der Leser
**selten** steht, und fehlte auf der, auf der er ständig steht.

Und der einzige Ausgang des Akkordeons hieß „Vollständig öffnen" / „Open full explanation": er
verspricht **mehr Erklärung** und liefert **Navigation** zu demselben Text. Ein Leser, der die Karte
schon offen hat, hat damit einen aktiven Grund, ihn *nicht* zu drücken.

### Die Kennzahl war ein Verdacht, und sie stimmte nicht

v114 bezifferte die Fläche auf **294 Akkordeon-Instanzen**. Nachgerechnet sind es **262**:

| Fläche | Instanzen |
| --- | --- |
| Tafelwerk | 82 |
| 17 Lecture-Seiten | 74 |
| 75 Konzeptseiten | 106 |
| **gesamt** | **262** (267 bei der formelreichsten Ankunft) |
| Detailseiten, die den Rückweg bisher trugen | **82** |

Die 294 entstanden, indem `c.formulas` direkt aufsummiert wurde. Eine Konzeptseite rendert aber
`conceptFormulaIds(c, lectureId)` — aus einer Lecture heraus geöffnet **nur die von dieser Lecture
kuratierten** Formeln. Zusätzlich übersah die alte Zählung die `sources`-Rückfallebene in
`lectureForConcept`. Die Richtung des Befunds ändert sich nicht: die Akkordeon-Fläche ist
**3,2-mal** so groß wie die Detailseiten. Die Zahl im Quellkommentar ist jetzt die gerechnete, und
ein Guard rechnet sie bei jedem Lauf nach.

## Was gebaut wurde

`formulaAccordionRoute(f, omitConceptId)` rendert in **jedem** Akkordeon — Tafelwerk, Lecture,
Konzeptseite — nach dem Selbstcheck und vor den Kartenaktionen:

- **„Hergeleitet in: &lt;Konzept&gt; · &lt;Heimat&gt;"** für jede Konzeptseite, die die Regel herleitet,
  mit demselben Heimat-Badge (Lecture *n* / Modul 00 / Selbststudium), das die Detailseite zeigt.
- **„Üben: &lt;Lab&gt;"** für jedes Experiment dieser Konzepte.

Nichts davon ist neu erfunden: es ist dieselbe Umkehrung von `CONCEPTS[].formulas`, die
`formulaRouteMarkup` auf der Detailseite rendert, in der kompakten Form, die ein Akkordeon tragen
kann (`<div>`-Block statt `<section>`/`<h2>` — eine zweite Seitenüberschrift in einer Karte wäre
falsch).

**Die Seite, auf der der Leser steht, wird nicht angeboten.** Auf einer Konzeptseite fällt deren
eigene Zeile samt ihren Übungsknöpfen weg — dieselbe Hausregel, die `conceptProblemMarkup` seit
v114 befolgt. Gemessen: **64** Akkordeons behalten ein Geschwisterkonzept, **42** schweigen ganz,
weil die Seite selbst der einzige Herleiter ist. Ein Knopf, der auf die Seite führt, auf der man
schon steht, ist eine Sackgasse, die wie ein Weg aussieht.

**Das Label ist ehrlich geworden:** „Als eigene Seite öffnen" / „Open as its own page".

### Drei Aufrufstellen, die sonst den Array-Index übergeben hätten

`formulaAccordion` bekam einen zweiten Parameter — und `.map(formulaAccordion)` übergibt
`(element, index, array)`. Der **Index** wäre als `omitConceptId` angekommen. Alle drei Aufrufstellen
sagen jetzt, was sie auslassen; ein Guard verbietet die nackte Form.

## Der Fehler, den der Render-Sweep nebenbei fand

Weil der neue Guard nur das Fragment prüft, wurde zusätzlich das **ganze** Akkordeon gerendert
(440 Renders: 82 Karten × beide Sprachen × jede Auslassung). Dabei fiel ein Fehler auf, den **kein**
bestehender Guard sehen konnte:

> `compression-ratio.expr` — die **angezeigte Gleichung** der Karte — hat keine englische
> Übersetzung und fiel auf den deutschen Wert zurück. Jeder englische Leser sah im Anzeigekasten
> `Dateigröße(uint16) / num_bytes = 2 / r`.

Unsichtbar war das, weil die deutschen Rückstandsprüfungen über die **Pakete** und über Renderer
laufen, die `expr` nie zeichnen. Ein Zählwerk über alle 82 Karten × 13 übersetzbare Felder: **145
Felder haben keine englische Fassung** — und genau **eines** davon trug Deutsch. Repariert, und der
neue Guard hält die allgemeine Regel statt nur der einen Reparatur: *ein Feld ohne Übersetzung darf
durchfallen, aber nur wenn das Durchfallende frei von Deutsch ist.* Nur `expr` (70 Karten) und
`aliases` (75) können überhaupt durchfallen; alle übrigen elf Felder sind auf jeder Karte übersetzt.

## Prüfung

- **Guard-Suite 67 → 69 Blöcke grün**, Exit 0.
  - `accordion route` (**1422 Checks**): die Umkehrung je Karte in **beiden Richtungen** und beiden
    Sprachen aus dem **gerenderten Markup** zurückgelesen (276 Konzeptknöpfe, 340 Übungsknöpfe),
    die Erwartung aus den Daten neu aufgebaut statt aus dem Renderer; die Auslassung als
    chirurgisch belegt (nur die eigene Zeile **und deren** Labs fallen weg); **beide** Zweige als
    erreichbar gemessen (64 / 42), sonst wäre die Prüfung Dekoration; alle drei Aufrufstellen und
    alle drei Binder; das Label; und die Zahlen des Quellkommentars nachgerechnet.
  - `formula field fallthrough` (**150 Checks**): die Feldliste aus `I18N_FIELDS` der App gelesen
    statt kopiert, die 145 übersetzungslosen Felder auf Deutsch geprüft, die reparierte Gleichung
    Wort für Wort und Trenner für Trenner gegen ihren deutschen Zwilling gehalten.
- **Mutationstest gegen die Schlankfassung** (0,4 s je Lauf, Kontrolle vor und nach dem Lauf grün):
  - `accordion route`: **32 Mutationen, 32 gefangen, 0 entkommen, 0 inert.**
  - `formula field fallthrough`: **9 Mutationen, 8 gefangen, 0 entkommen, 1 inert mit gemessenem
    Grund** — eine deutsche `cat` entkommt nicht etwa dem Guard, sondern kann den Leser nicht
    erreichen: `cat` ist auf **jeder** der 82 Karten übersetzt. Nur `expr` und `aliases` fallen durch,
    und für beide fängt der Guard die Mutation.
  - Sechs Mutationen des ersten Durchgangs lagen an **nicht eindeutigen Ankern**, eine weitere baute
    einen **doppelten Objektschlüssel** (`aliases` zweimal in `softmax`, der letzte gewinnt) und war
    damit wirkungslos, ohne es zu melden. Beides ist ein Fehler des Mutationswerkzeugs, nicht des
    Guards; nach dem Nachschärfen wurden alle gefangen.
- **Kein Browsertest** — in geplanten Läufen gesperrt. Ersatz: **440 Renders des vollständigen
  Akkordeons** in DE und EN, geprüft auf Tag-Balance über neun Tags, Platzhalter, `undefined`,
  `<details>`-Gestalt und die Position des Rückwegs vor den Aktionen: **0 Probleme**. Der Scanner
  war vorher als **sehend** belegt — er hat den `expr`-Leak zuerst gefunden; zwei seiner Meldungen
  waren dagegen eigene Stub-Artefakte (deutsche Quellenlabels, das englische Wort „undefined") und
  wurden am Stub repariert, nicht weggeschaltet.
- `node --check` auf dem extrahierten Inline-Script (2,7 MB) und auf `sw.js`, `i18n-en.js` geladen.
- **Cache-Bump auf v95** (4 Stellen: `sw.js` ×2, `index.html`, `README.md`).

## Was offen bleibt

1. **9 Probleme von A1 öffnen erst in Lecture 11/12**, weil sie an `benchmark-validity` (l12) und
   `schedules` (l11) hängen, während A1 von l01–l03 vorbereitet wird. Unverändert aus v114; eine
   Inhaltsfrage, die dieser Lauf nicht entschieden hat. **Jetzt Hebel 1.**
2. **Die Tausendergruppierung** — ein deutscher Render, der `43200` statt `43.200` zeigt, fällt
   durch kein Netz; die legitimen Ausnahmen sind nicht klassifiziert.
3. **`GERMAN_WORDS` ist blind für deutsche Substantive ohne Umlaut.** Unverändert seit v112 — und
   dieser Lauf hat gezeigt, dass daran etwas hängt: die `expr`- und `aliases`-Felder werden jetzt
   von genau dieser Regex bewacht.
4. **`l13` fehlt eine Formelkarte** für die Gopher-Qualitätsregeln (Lab `quality-threshold` rechnet
   sie, das Tafelwerk zeigt sie nicht).
5. `scaling-transfer` bleibt das eine Lab ohne rechnende Bühne; `LR_NO_STAGE` ist auf seinem Boden.
6. Der Browsertest steht seit v71 aus; beim nächsten beaufsichtigten Lauf für die in v110–v115
   angefassten Flächen nachholen, 360 px, DE und EN. Das Akkordeon ist dabei die erste Fläche: der
   Rückweg-Block ist neu und wurde nur headless geprüft.
7. `origin/main` steht auf `2ed21e7`; **v100 bis v115 sind ungepusht.**
