# Deep Review 2026-07-26 (c) — Die Lücke zwischen Lecture-Pfad und Handout schließen (v50)

## Auftrag
„noch was zu verbessern? dann go" — selbst suchen, entscheiden, bauen.

## Audit
Nach v49 systematisch durchgezählt, was zwischen Lecture-Pfad und Handout noch fehlt:

- **Mission-Guides:** alle 29 Themenblöcke haben einen Guide. Keine Lücke.
- **Deciding Concepts:** 119 von 126 Scope-Einträgen haben eine eigene Problemliste, 7 fallen sauber auf
  die Blockliste zurück (a3 ×4, a4 ×1, a5 ×2). Keine Lücke.
- **Adapter/Test-Handles:** hier lag eine. Vor v50: a1 18/38, a2 5/27, a3 0/2, a4 **0**/13, a5 14/44.

### Befund 1 — A4 hatte keinen einzigen Adapter-Hook
Gegen `cs336_assignment4_data.pdf` geprüft (`pdftotext -layout`, Problemblöcke einzeln gelesen): das
Handout nennt für acht Probleme wörtlich „Implement the adapter [run_…]". Die Plattform zeigte für dieselben
Probleme nur den pytest-Befehl. Der Leser wusste also, welcher Test grün werden soll, aber nicht, welche
Funktion er dafür schreibt. Bei `gopher_quality_filters` fehlte zusätzlich der Testbefehl komplett (im PDF
über einen Zeilenumbruch getrennt: `uv run pytest -` / `k test_gopher`, deshalb bei der ersten Extraktion
durchgerutscht).

Gegenprobe für die anderen Assignments: a1 nennt im Handout 19 Adapternamen über 18 Probleme — alle da.
a2 nennt 6 — alle da. a5 nennt 7 — alle da. Nur a4 war leer.

### Befund 2 — fünf Konzepte liefert der Lecture-Pfad nie
Nebenbefund aus v49, jetzt zu Ende gedacht. `causal-mask`, `cross-entropy`, `adamw`, `clipping`, `sampling`
werden von keiner der 17 Lecture-Seiten aufgeführt, entscheiden aber neun A1- und zwei A5-Probleme. Wer den
Pfad L1→L17 abläuft, bekommt sie nie vorgelegt.

Vor v50 waren `cross-entropy` und `clipping` aus dem Lernfluss heraus **gar nicht** erreichbar: der
„nur noch ein Konzept entfernt"-Block auf den Lecture-Seiten kann sie nicht zeigen, weil keine Lecture
irgendein entscheidendes Konzept ihrer Probleme beisteuert. Sie standen nur hinter dem aufgeklappten
Themenblock des Assignments.

Root-Cause-Fix geprüft und **verworfen**: Konzepte nachträglich in die Lecture-Guides eintragen würde die
PDF-Treue brechen. Belege — `Trace - lecture_02.pdf`: „AdamW" 1×, kein Cross-Entropy-, kein Clipping-Treffer.
`2025 Lecture 3 - architecture.pdf`: kein Treffer für kausale Maskierung. `Trace - lecture_10.pdf`:
10× „sampling", aber ausschließlich *speculative sampling* (Inferenz-Beschleunigung), nicht das
autoregressive Decoding mit Temperatur/Top-p, an dem `a1:decoding` hängt. Die Lecture-Guides sind korrekt;
die Lücke ist echt und gehört benannt, nicht wegdefiniert.

## Umgesetzt

### 1. A4-Adapter-Hooks (Daten)
Acht Einträge in `HANDOUT_PROBLEMS` um die vom Handout genannten Adapter ergänzt, plus der fehlende
Gopher-Test:

| Problem | Adapter | Test |
|---|---|---|
| extract_text | run_extract_text_from_html_bytes | −k test_extract_text_from_html_bytes |
| language_identification | run_identify_language | −k test_identify_language |
| mask_pii | run_mask_emails, run_mask_ips, run_mask_phone_numbers | 3 Tests |
| harmful_content | run_classify_nsfw, run_classify_toxic_speech | 2 Tests |
| gopher_quality_filters | run_gopher_quality_filter | −k test_gopher **(neu)** |
| quality_classifier | run_classify_quality | −k test_classify_quality |
| exact_deduplication | run_exact_line_deduplication | −k test_exact_line_deduplication |
| minhash_deduplication | run_minhash_deduplication | −k test_minhash_deduplication |

Kein Renderer-Code nötig: `problemVerifyMarkup` (v46) zeigt die Zeilen automatisch.

### 2. „Was dieses Assignment braucht, aber keine Lecture liefert"
Neue abgeleitete Sektion auf der Assignment-Seite, direkt unter den erklärten Voraussetzungen und **über**
den Themenblöcken — sie ist eine Voraussetzung, keine Fußnote.

`assignmentSelfStudyConcepts(a)` in `index.html` (vor `renderAssignmentDetail`): nimmt dieselben
entscheidenden Konzepte wie die Lecture-Ableitung, zieht Foundations und alle 17 Lecture-Konzeptlisten ab
und gruppiert den Rest nach Konzept mit den Problemen, die daran hängen. Jede Zeile ist eine
`conceptCard`-artige Zeile mit `data-open-concept`; Format und Bindung wie überall sonst.

Ergebnis: A1 zeigt fünf Konzepte (Kausale Maske · Cross-Entropy · AdamW · Globales Gradient Clipping ·
Autoregressives Sampling), A5 zwei (Sampling · Cross-Entropy), A2/A3/A4 nichts — die Sektion verschwindet
dort ganz. Formulierung bewusst über *diesen Pfad*, nicht über den echten Stanford-Kurs.

## Guards (`scripts/check-i18n.mjs`)
- neu: kein `a4:*`-Problem darf einen pytest-Befehl ohne Adapter-Hook tragen (das Handout druckt beides)
- neu, Zeile „assignment self-study OK": Ableitung muss datengetrieben bleiben
  (`problemDecidingConcepts`, `foundations`, `LECTURE_IDS.forEach`, `missionProblems`, `data-open-concept`);
  Sektion muss gerendert werden und **vor** den Themenblöcken stehen; die abgeleitete Menge muss nichtleer
  sein und darf nur Konzepte aus der bestehenden Assignment-only-Liste enthalten
- bestehende Schwelle „≥ 45 Probleme mit Handles" steht jetzt bei 46

## Verifikation
- `node --check` auf Inline-Script und `i18n-en.js`
- `node scripts/check-i18n.mjs`: 124 Probleme / 523 Punkte / 47 GPU-h / **46** Handles / 119 Konzept-Links;
  lecture outlook 110 angekündigt, 113 erreichbar; assignment self-study 5 Konzepte auf 2 Seiten;
  75 Konzepte / 27 Labs / 1102 UI-Strings
- alle fünf Assignment-Seiten geprüft: Sektion an Position 2 bei a1/a5, fehlt bei a2/a3/a4
- A4: alle acht Problemzeilen tragen Adapter **und** Test, Text wörtlich wie im Handout
- Klick auf `cross-entropy` und `clipping` in der neuen Sektion routet auf `#detail/concept/…`,
  History-Back kehrt auf `#detail/assignment/a1` zurück
- DE und EN
- kein horizontaler Overflow @375 px und @1280 px (`docScrollW` ≤ `innerWidth`), keine Elemente außerhalb
- Regressionsprüfung v49: L01/L03/L10/L17 unverändert (8/5/0/6 neue Probleme, A4 jetzt 13/13)
- Konsole leer

## Bewusst nicht gemacht
- Konzepte nachträglich in `LECTURE_GUIDES` eintragen (PDF-Treue, siehe Befund 2)
- die fünf Konzepte in `ASSIGNMENTS.a1.concepts` nachtragen — die Ableitung kann nicht driften, eine
  handgepflegte Liste schon
- `a2:flash_backward` einen Adapter geben: das Handout nennt dort dieselbe Autograd-Function wie bei
  `flash_forward`, kein eigener Hook
- Grundlagen-Verkettung, Deep-Link auf einen einzelnen Themenblock (Navigationsvertrag, wie in den Vorläufen)

## Version
v50 (`sw.js`, `index.html`, `README.md`)
