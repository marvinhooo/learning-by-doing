# Deep Review 2026-07-26 (Claude, geplanter Lauf)

Basis: `claude/intelligent-vaughan-0f7d6e` (0f9bd16, v47) — **nicht** das veraltete `main`.
Ergebnis: Commit `f354ea3` (v48) auf `claude/magical-hypatia-ae59fa`, nicht gepusht.

## Vorgehen

Kein Vollaudit (alle 17 Lectures sind seit 2026-07-20 tief geprüft, Abdeckung ist
mit 124/124 exakt). Stattdessen die Plattform empirisch als Nutzer abgegangen:
Übersicht → L3 → A1/A2/A5 mit aufgeklappten Blöcken → Lab `attention`.

## Befund

Die Plattform ist inhaltlich sehr reif. Lecture-Seiten (Kontext, erklärte
Voraussetzungen mit Refresher, Symbole, Konzepte, Formeln mit Beispiel-vor-
Gleichung, Quelle mit Seitenzahlen, prev/next, „Was das vorbereitet"), Labs
(echt gerechnet, erklären das Warum) und die Assignment-Blöcke (Aufgabe,
Prüfstrategie, Fehlersuche, Problem-Map mit Punkten/Art/Adapter/Test) tragen.

**Der verbliebene Bruch war die Auflösung der Verlinkung**, nicht der Inhalt:
Konzepte hingen am *Block*, nicht am *Problem*. Konkret gemessen:

- A1 „Tensor Primitives": 8 Konzepte für 6 Probleme.
- A2 „Compilation & Activation Checkpointing": 3 Konzepte für 3 Probleme — die
  für `torch_compile` bzw. `pytorch_attention` entscheidenden Konzepte
  (`fusion-tiling`, `flash-attention`) waren im Block **gar nicht** gelistet.
- A1 `softmax`: das entscheidende Konzept ist `logs` (numerische Stabilität,
  Max-Subtraktion) — im Block ebenfalls nicht gelistet.

Die Blockliste war also stellenweise nicht nur grob, sondern unvollständig.

## Umgesetzt

`PROBLEM_CONCEPTS` (119 Einträge, 198 Links) verengt pro Problem auf 1–3
Konzepte, gerendert als `data-open-concept`-Buttons in einer neuen `Konzept`-
Zeile **über** Adapter/Test (verstehen vor verifizieren). Reuse des bestehenden
`bindOpeners`-Musters, kein neuer Navigationsvertrag, keine neuen i18n-Keys
(Inline-Ternary wie im Umfeld).

Fünf Probleme sind bewusst nicht verlinkt: sie sitzen allein in ihrem Block
(a3 ×4, a4 `quality_classifier`, a5 `prompting_baselines`, a5 `baseline_calcs`),
dort ist die Blockliste bereits exakt.

Neue Drift-Guards in `check-i18n.mjs`: Key muss ein Handout-Problem sein; 1–3
eindeutige Konzepte; jede ID existiert; jede ID ist vom eigenen Assignment aus
erreichbar (eigene Blöcke ∪ `assignment.concepts` ∪ `foundations`); die Liste
muss den Block echt verengen; jedes Problem in einem Mehr-Problem-Block braucht
einen Link; Renderer muss die Konzeptzeile vor Adapter/Test zeigen.

Nebenbei: README-Zahlen korrigiert (72→75 Konzepte, 26→27 Labs), Version v48.

## Verifiziert

- `node scripts/check-i18n.mjs` grün: 124 Probleme / 523 Punkte / 47 GPU-h /
  45 Handles / 119 Konzept-Links; 75 Konzepte, 27 Labs, 1102 UI-Strings.
- `node --check` auf extrahiertem Inline-Script und auf `i18n-en.js`.
- Browser DE **und** EN: 198 Buttons gerendert, Soll==Ist pro Assignment
  (a1 64, a2 51, a3 0, a4 19, a5 64); Stichprobenklicks in a1/a2/a4/a5 routen
  korrekt (`#detail/concept/logs`, `fusion-tiling`, `bloom-filters`, `dpo`).
- Layout @375 px und @1280 px: kein horizontaler Overflow, keine Überlappung
  mit dem Label, Touch-Ziel 44 px auf Mobil (bestehende Media Query greift).
- Keine Konsolenausgabe; `i18n-en.js?v=48` lädt mit 200.

## Bewusst nicht gemacht

- **Grundlagen-Verkettung** („nächste Grundlage"-Button): fasst `routeHash`/
  `routeKey`/`backButton`/`conceptContinuation` an, also History und
  Scrollwiederherstellung. Zu invasiv für einen unbeaufsichtigten Lauf.
- **Lecture → konkrete Probleme** (statt nur „A1"): jetzt datenseitig möglich,
  weil `PROBLEM_CONCEPTS` ∩ `LECTURE_GUIDES[l].concepts` die Probleme liefert,
  die eine Lecture wirklich vorbereitet. Nächster naheliegender Hebel, braucht
  aber eine Entscheidung, ob die Lecture-Seite so viel Assignment-Kontext tragen
  soll.
- Labs für die dünnen Blöcke (a1 `generation-experiments` 10 Probleme/2 Labs,
  a5 `supplement` 16/1) — Aufwand pro Lab ist hoch, Nutzen unklar, da beides
  überwiegend Schreib-/Messaufgaben sind.

## Merge-Lage (unverändert kritisch)

`main` steht auf `4bb5465`. Offen und **nicht gepusht**, sauber gestapelt:
`bf6cbe7` → `cd3af6a` (v46) → `0f9bd16` (v47) → `f354ea3` (v48).
Ein linearer Merge dieser Kette nach `main` genügt; keine Rebase-Konflikte wie
bei den 2026-07-22/23-Branches, weil dieser Lauf auf der Spitze aufgesetzt hat.
