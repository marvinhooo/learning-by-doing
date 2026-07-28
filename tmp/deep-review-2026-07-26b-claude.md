# Deep Review 2026-07-26 (b) — Lecture → konkrete Probleme (v49)

## Auftrag
Zwei Teile vom Nutzer:
1. Alles committen und pushen.
2. Den zuvor vorgeschlagenen Hebel bauen: „Was das vorbereitet" auf der Lecture-Seite von Assignment- auf Problemebene heben.

## Teil 1 — Push
Vorher geprüft: `.gitignore` deckt `*.pdf` und `CS336 lectures/`, keine PDFs getrackt.
`main` per Fast-Forward über die offene Kette `bf6cbe7 → cd3af6a (v46) → 0f9bd16 (v47) → f354ea3 (v48)`, dann
`git push origin main` → `54ed090..f354ea3`. `tmp/` (Reports) und `.claude/` (Worktrees) bewusst untracked gelassen.

## Teil 2 — Befund
Die Lecture-Seite endete bei „Das bereitet A1 vor". Damit bleibt die eigentliche Frage offen: *Welche der
38 A1-Probleme kann ich nach Lecture 3 anfassen?* Seit v48 ist das ableitbar, weil jedes Problem die
Konzepte kennt, an denen es hängt.

## Umgesetzt
Neue Sektion am Ende jeder Lecture-Seite (vor „Originalmaterial"):
**„Welche Assignment-Probleme das jetzt öffnet" / „Which assignment problems this opens up"**.

Ableitung (`lectureProblemOutlook` in `index.html`, direkt vor `renderLectureDetail`):
- entscheidende Konzepte je Problem = `PROBLEM_CONCEPTS[key]`, sonst die Blockliste `mission.concepts`
- abgedeckt nach Lecture N = `foundations` ∪ Konzepte der Lectures 1..N
- ein Problem erscheint genau auf der Lecture, die seine Menge vervollständigt

Drei Blöcke:
1. **Neu angehbar nach dieser Lecture** — Problemzeilen im Stil der Assignment-Seite (ID, Handout-Titel,
   Art der Arbeit, Punkte), gruppiert nach Assignment mit Zwischensumme.
2. **Kumulativ** — „A1 · 20/38 Probleme" als Button zum Assignment Coach; nur Assignments mit > 0;
   dedupliziert, weil einzelne Probleme in mehreren Blöcken stehen (a3 zählte sonst 4 statt 2).
3. **Nur noch ein Konzept entfernt** — Probleme, die diese Lecture speist, denen aber genau **ein**
   Konzept fehlt; dieses Konzept als `data-open-concept`-Button.

Verteilung: L1 8 · L2 6 · L3 5 · L4 0 · L5 2 · L6 10 · L7 15 · L8 0 · L9 1 · L10 0 · L11 2 · L12 14 ·
L13 5 · L14 6 · L15 11 · L16 19 · L17 6 → 110 der 124 Probleme werden von einer Lecture angekündigt,
113 sind nach L17 erreichbar.

### Entscheidende Designentscheidung
Die Kappung „genau ein fehlendes Konzept". Ohne sie zeigte L2 dreizehn Buttons quer durch den ganzen Kurs
(SFT, GRPO, FSDP …) — formal korrekt, praktisch nutzlos. Mit ihr steht dort eine belastbare Aussage:
17 Probleme hängen nach L2 nur noch an je einem Konzept.

### Nebenbefund
Sechs Konzepte lehrt **keine** Lecture: `causal-mask`, `cross-entropy`, `adamw`, `clipping`, `sampling`,
`lm-objective`. Das ist reine Assignment-Materie mit eigener Konzeptseite. Folge: A1 erreicht nur 29/38 und
A5 42/44. Genau diese Konzepte tauchen jetzt in Block 3 auf (nach L3 z. B. „Kausale Maske") und sind damit
erstmals aus dem Lernfluss heraus erreichbar. Ein Guard hält die Liste explizit, damit kein weiteres Konzept
unbemerkt dazukommt und sein Problem unsichtbar macht.

## Guards (`scripts/check-i18n.mjs`, neue Zeile „lecture outlook OK")
- Renderer muss datengetrieben bleiben (`PROBLEM_CONCEPTS`, `mission.concepts`, `foundations`,
  `LECTURE_IDS.slice(0,index)`, `gap.length!==1`, `data-open-assignment`, `data-open-concept`)
- „kein Gate" / „never a gate" muss im Abschnitt stehen bleiben
- Sektion muss vor dem Originalmaterial stehen
- jedes Problem braucht entscheidende Konzepte; jedes davon muss aus Lecture, Foundations oder der
  expliziten Assignment-only-Liste erreichbar sein
- kein Problem darf von zwei Lectures angekündigt werden
- mindestens 100 Probleme müssen erreichbar bleiben

## Verifikation
- `node --check` auf Inline-Script und `i18n-en.js`
- `node scripts/check-i18n.mjs`: 124 Probleme / 523 Punkte / 47 GPU-h / 45 Handles / 119 Konzept-Links;
  lecture outlook 110 angekündigt, 113 erreichbar; 75 Konzepte / 27 Labs / 1102 UI-Strings
- alle 17 Lecture-Seiten durchgeklickt, Inhalte stichprobenhaft gegen die Ableitung geprüft
- DE und EN
- Klick auf Konzept- und Assignment-Button routet korrekt, History zurück funktioniert
- kein horizontaler Overflow @375 px und @1280 px, keine Elemente außerhalb, 44 px Touch-Ziele mobil
- Konsole leer

## Bewusst nicht gemacht
- Grundlagen-Verkettung („nächste Grundlage") — Navigationsvertrag, wie in den Vorläufen
- Deep-Link auf einen einzelnen Themenblock (würde `openAssignmentMissionIds` vor der Navigation setzen);
  der Assignment-Button reicht, und es wäre ein neuer Zustandspfad
- Retro-Fit der sechs lecture-losen Konzepte in die Lecture-Guides — das würde die PDF-Treue der
  Lecture-Seiten brechen

## Version
v49 (`sw.js`, `index.html`, `README.md`), Commit `8f6c3b1`, gepusht (`f354ea3..8f6c3b1`).
