# Deep Review 2026-07-22 (Claude-Run, nachmittags)

Kontext: Dieser Run lief in einem **isolierten git-Worktree** (`clever-tharp-bd83d2`,
Basis `54ed090`). Das Haupt-Worktree trägt weiterhin die **uncommitteten v45-Änderungen**
von heute Nacht (Zeitrahmen pro Lecture, `lectureTimeEstimate`, mtimes 00:44–00:52).
Codex war seit ~6 h inaktiv (keine Fremd-Edits während des Runs). Weil der Worktree
isoliert ist, konnte ich sicher editieren, ohne Codex' uncommittete Arbeit anzufassen.

## Ausgangslage

Der Fidelity-Audit aller 17 Lectures ist abgeschlossen; Inhalt ist nicht mehr der
Engpass. Der letzte Run (00:52) hat den neutralen Zeitrahmen (v45) gebaut und als
nächsten großen Hebel den **„Grundlagen-Schnellstart"** empfohlen — genau die Frage,
die der Nutzer im geplanten Auftrag wiederholt stellt: *„wie kann ich extrem schnell
und effizient die nötigen prerequisites aufbauen?"* — bewusst aber vertagt, weil er
als „neue Ansicht/Navigation" den Vertrag „Lernpfad ist die einzige kanonische
Übersicht" zu berühren schien.

## Zentraler Befund: Der Schnellstart ist zu 90 % schon gebaut

Bei der Code-Analyse zeigte sich: Es braucht **keine neue Ansicht und keinen neuen
Inhalt**. Zwei Bausteine existieren bereits:

1. **Das `foundations`-Modul** (`MODULES`, `id:"foundations"`, Stage „Prerequisite
   Sprint") bündelt schon exakt die kursweiten Grundlagen in kuratierter
   Abhängigkeitsreihenfolge:
   `python-engineering → pytorch-tensors → pytorch-state → shapes → matmul →
   probability → logs → gradients → resource-accounting`.
   `MODULES` ist als Navigation deprecatet, die Datenstruktur lebt aber weiter.

2. **Die Grundlagen-Diagnose** wertet pro `area` einen Prozentwert aus und zeigt die
   drei schwächsten. **Aber:** die Ausgabe war reiner Text
   (`„Vorgeschlagene Auffrischungen: python 40% · math 55%"`) und **führte nirgends
   hin** — exakt die Lücke, die der Vorreport benannte („schlägt Themen vor, führt
   aber nirgends konkret hin").

Damit war der eigentliche Hebel eine **winzige, vertragskonforme Verdrahtung**, nicht
ein neues Feature.

## Umgesetzt (verifiziert, committet auf dem Feature-Branch)

**Ein Hunk** in `index.html` (`openDiagnostic`, Ergebnis-Rendering). Jede der 12
Diagnose-Areas ist auf ein **bereits existierendes** Konzept gemappt; die drei
schwächsten Areas werden als Buttons gerendert, die die Konzeptkarte öffnen und den
Modal schließen:

| area | → Konzept | | area | → Konzept |
|---|---|---|---|---|
| python | python-engineering | | scaling | power-laws |
| pytorch | pytorch-tensors | | rl | rl-setup |
| shapes | shapes | | data | data-pipeline |
| grad | gradients | | inference | inference-workload |
| math | probability | | eval | benchmark-validity |
| systems | resource-accounting | | transformer | transformer-block |

Bewusst wiederverwendet: `data-open-concept` + `.card-actions` + `bindOpeners` — das
**gleiche Muster**, das die Concept-Orientierung und die Quiz-Ergebnisse schon nutzen.
Also **kein neuer Interaktions- oder Navigationsvertrag**. Das No-Gate/No-Competence-
Framing wurde nicht nur bewahrt, sondern geschärft („Nur ein Vorschlag … dies ist
keine Kompetenzwertung"), konform zu den Memory-Regeln (keine Fälligkeit, kein
Kompetenzanspruch).

Damit beantwortet die Plattform die Prerequisite-Frage jetzt **operativ**: Diagnose
machen → schwächste Grundlagen werden zu einem direkten Einstieg in genau die
Grundlagenkarten, die die Foundations abdecken. Reaktive Just-in-time-Prereqs pro
Lecture bleiben unverändert daneben bestehen.

### Verifikation (mit Beleg)
1. `node --check` auf dem extrahierten Inline-Script (1,05 MB): **SYNTAX OK**.
2. `node scripts/check-i18n.mjs`: **grün, unverändert** (72 Concepts, 79 Formeln,
   72 Symbole, 70 Glossar, 26 Labs, 29 Missions, 1047 UI-Strings) — die neuen Strings
   sind Inline-Ternaries, keine Bundle-Keys.
3. Browser-Smoke (file://, Reload nach Edit): **keine Konsolenfehler**.
4. End-to-End im Browser getrieben: Diagnose ausgefüllt → Ergebnis zeigt 3 Buttons mit
   echten Konzepttiteln + Prozent, **0 ungemappte Fallbacks** (alle 12 Areas
   auflösbar). Klick auf „Wahrscheinlichkeit…" bzw. „Python-Datenverträge…"
   navigiert zu `#detail/concept/…` **und schließt den Modal** (nach dem Fix;
   der erste Wurf ließ den Modal offen über der Konzeptseite — behoben).
5. **Zweisprachig bestätigt:** DE-Umschaltung → Buttons „Python-Datenverträge…",
   „Tensorformen als Typsystem", „Wahrscheinlichkeit, Erwartungswert & Varianz",
   deutscher Intro-Text.

Commit: `9756b88 feat: deep-link diagnostic refreshers to foundation concepts`
(Feature-Branch `claude/clever-tharp-bd83d2`, **nicht** gepusht, `main` unberührt).

## Wichtig für die Übernahme (v45-Divergenz)

Dieser Branch basiert auf `54ed090` und enthält **nicht** die uncommitteten v45-
Änderungen aus dem Haupt-Worktree. Der Fix ist **ein lokaler Hunk** in `openDiagnostic`,
weit entfernt von v45's `lectureTimeEstimate`-Code. Zwei saubere Wege:
- **Empfohlen:** v45 im Haupt-Worktree zuerst committen, dann diesen Branch mergen →
  git auto-merged (nicht überlappende Hunks).
- Oder den einen Hunk manuell auf das aktuelle `index.html` anwenden (Suchanker:
  `const weakest=Object.entries(scores).sort(...).slice(0,3)` im `diagnosticForm`-
  onsubmit).

Ein Version-Bump (SW-Cache) ist **nicht** enthalten, weil er `sw.js`/README berührt,
die im Haupt-Worktree bereits v45-modifiziert sind — das gehört in denselben Commit
wie v45, um Divergenz zu vermeiden.

## Antworten auf die vier Nutzerfragen (Stand jetzt)

1. **Sachverhalte besser erklären / fehlen Infos?** — Inhaltlich abgedeckt (Audit
   fertig). Kleinreste bewusst offen (kosmetisch, kein Lernverlust):
   `dataset-lineage` optional in A4-Konzeptliste, je ein Satz zu `torch.compile`/PTX
   in L6, Gloo-Erwähnung in L8.
2. **Interaktive Lösungs-Verständnis-Bereiche optimieren?** — Predict-Observe-Labs,
   gestufte Hinweise und Assignment-Coach sind stark. Heutige Verbesserung macht die
   Diagnose vom Sackgassen-Report zum interaktiven Einstieg.
3. **Wird sich an Lectures/Assignments entlanggehangelt?** — Ja: 17 Lectures =
   kanonischer Pfad, jede mit Quellenanker; Assignments über `sources` an Lectures
   gekoppelt, Missions decken alle 124 Problem-IDs ab.
4. **Prerequisites schnell aufbauen?** — Jetzt operativ gelöst (siehe oben) *und*
   just-in-time pro Lecture.

## Nächster empfohlener Hebel (braucht Martins Freigabe)

Der Diagnose-Einstieg deckt die **drei schwächsten** Areas ab. Optionaler Ausbau:
ein **einzelner** Button „Grundlagen der Reihe nach" im Diagnose-Ergebnis, der die
**geordnete** `foundations`-Konzeptliste (die 9 oben, in Abhängigkeitsreihenfolge)
als Sequenz öffnet — statt nur der drei schwächsten. Nutzt `renderModuleDetail`
(existiert schon, backward-compat reachable) oder eine schlanke Konzept-Sequenz.
Bewusst **nicht** autonom gebaut, weil es die Frage „reaktivieren wir eine Modul-
Ansicht?" berührt — das ist eine Produktentscheidung, keine Bugfix-Verdrahtung.
