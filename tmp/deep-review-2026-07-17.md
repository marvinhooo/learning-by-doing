# Deep Review 2026-07-17 (geplanter Claude-Run, ~07:10)

Kontext: Codex' letzte Edits waren ~4,5 h alt (Commit 54ed090, 02:39), keine aktive Session.
Anders als an den Vortagen ist der Stand **vollständig committed, gepusht und deployed**:
GitHub Pages liefert `cs336-shell-v41` aus — identisch mit lokalem HEAD; `_site` entspricht HEAD.

## Gesamturteil

Der beste Stand bisher. **Alle offenen Befunde vom 16.07. sind geschlossen** (Coverage,
A1-Details, L8/A2, L11/A3, L4-MoE, L16/A5), und zwei große Neukonzeptionen sind dazugekommen:
der Lecture-first-Lernpfad (17 Lecture-Guides als kanonischer Weg, Schein-Evidenz komplett
entfernt) und der Beispiel-vor-Formel-Vertrag (Problem → Namen/Symbole → gerechnetes
Zahlenbeispiel → allgemeine Formel → Fallstrick). Die Plattform erfüllt damit die Kernziele
des Auftrags: Sie hangelt sich real an Lectures und Assignments entlang, erklärt
Voraussetzungen dort, wo sie gebraucht werden, und ersetzt Selbsteinschätzung durch
objektive Kurzchecks. Es bleiben nur noch Feinschliff-Hebel, keine strukturellen Lücken.

## Verifiziert in diesem Run (mit Beleg)

1. **Qualitäts-Basis grün:** `node --check` auf dem extrahierten Inline-Script (1,05 MB)
   sauber; `node scripts/check-i18n.mjs` grün: 72 Concepts, 79 Formeln, 72 Symbole,
   70 Glossareinträge, 26 Labs, 29 Handout-Zuordnungen, 1.047 UI-Strings.
   Bundle (`i18n-en.js?v=41`) und SW-Cache (`cs336-shell-v41`) konsistent.
2. **Alle 79 Formel-Zahlenbeispiele arithmetisch nachgerechnet — null Fehler.**
   Darunter die anspruchsvollen: AdamW inkl. Bias-Korrektur (m̂=2, v̂=4, θ≈0,9989),
   FlashAttention-Backward mit rowsum(dS)=0-Invariante, GRPO Sample- vs.
   Population-Std (±0,866 vs. ±1), μP-Rollentabelle (Emb ×1 · Hidden var×1/r, lr×1/r ·
   Readout var×1/r², lr×1/r — entspricht dem Lecture-11-Protokoll), Bloom-FPR
   ((1−e^(−0,7))^7≈0,82 %), LSH-Kandidatenwahrscheinlichkeit (0,953),
   Ring-All-Reduce-Volumen (150 MB), Distributed Critical Path (115 ms),
   Pipeline-Bubble (8/11≈73 %), Online-Softmax-Akkumulator (1,503).
3. **A1 Accounting Gate interaktiv bestanden** mit unabhängig hergeleiteten Werten
   (P=288.192, F_block=3.670.016, F_fwd=15.106.048) → „✓ Transfer check passed".
   Distraktoren plausibel, kein Durchklicken möglich (Select-Pflicht vor Check).
4. **Abruftraining bleibt pull-basiert:** 231 Karten sofort verfügbar, Session jederzeit
   startbar (max. 10 Karten), Priorisierung „nie gesehen → zuletzt Again"; nirgendwo
   Fälligkeit, Termin oder Streak. Formulierung „practice history, not a competence score"
   konsistent auf Dashboard und Übungsseite.
5. **19 MC-Kernfragen stichprobenartig auf korrekte Antwortschlüssel geprüft**
   (FlashAttention ändert Compute-Komplexität nicht; ZeRO-2 shardet zusätzlich Gradienten;
   DSIR = Dichtequotient; negativer Bloom-Befund = sicher abwesend; PPO-Clipping =
   Stabilität gegen Bias; view(-1) nach transpose = Stride-Konflikt; doppeltes backward
   ohne zero_grad = Addition) — alle korrekt.
6. **Browser-Smoke ohne einen einzigen Konsolenfehler** über Dashboard, Lernpfad,
   Lecture-11-Guide, A1-Assignment-Guide, Labs-Übersicht, Ledger-Lab, Abruftraining.
   DE-Umschalter behält die Route (`#detail/lecture/l03` blieb erhalten, Inhalt
   vollständig übersetzt, Fachbegriffe wie „Attention", „Feed-Forward" korrekt englisch).
7. **A1-Guide didaktisch vollständig:** Voraussetzungen zuerst in Alltagssprache
   („ä = zwei UTF-8-Bytes"), 6 Themenblöcke, sinnvolle Implementierungsreihenfolge
   (Tiny-Batch-Overfit vor TinyStories), Definition of Done, gestufte Hints,
   typische Fehlerbilder — ohne jede Schein-Evidenz.
8. **Repo-Hygiene:** nichts Uncommittetes außer untracked `tmp/`, `test.ipynb`, `.claude/`;
   Kurs-PDFs bleiben korrekt aus git ausgeschlossen; L11-Quellenanker „pp. 17–54"
   passt zum 55-seitigen PDF.

## Nächste Hebel (priorisiert — Feinschliff, keine strukturellen Lücken)

1. **Gezieltes Abruftraining nach Lecture oder Assignment.** Die Session zieht heute die
   globalen Top-10 aus 231 Karten. Wer gerade L1–3 für A1 vorbereitet, bekommt GRPO-Karten
   aus L16/17 gemischt — für das Ziel „Assignment konfident lösen" ist gezieltes Üben der
   größte verbleibende Effizienzhebel. Vorschlag: optionaler Scope-Filter (Lecture 1–17
   oder A1–A5) vor Sessionstart; Priorisierungslogik und Pull-Prinzip unverändert.
   Technisch günstig: Karten stammen aus Concept-Selfchecks und Formeln, deren
   Lecture-Zuordnung (`lectureUsesConcept`, kuratierte Formeln) bereits existiert.
2. **Lecture-Seiten nennen ihr Assignment nicht.** Assignments verweisen auf ihre Lectures
   (A1 → L1–3), aber nicht umgekehrt. Ein Hinweis auf der Lecture-Seite
   („Diese Lecture bereitet A1, Topic 2–3 vor" mit Direktlink) beantwortet die
   Motivationsfrage „wofür brauche ich das gerade?" und macht den Assignment-Bezug
   in beide Richtungen navigierbar. Reine Orientierung, kein Gate.
3. **Optional (alte Idee vom 15.07., weiter offen):** neutrale Aufwandsangabe pro Lecture
   („~x min Guide + y min Experimente" — Labs zeigen bereits Minuten). Hilft bei der
   selbstbestimmten Sessionplanung; als Information, nie als Soll.

## Kleinigkeiten

- `test.ipynb` (14.07.) liegt untracked im Repo-Root und wirkt wie ein Versehen —
  löschen oder in `.gitignore` aufnehmen (Entscheidung bei Martin).
- Versteckte Views bleiben im DOM (Quiz-Labels sind bei dokumentweiten Queries sichtbar).
  Kein Bug und keine Nutzerwirkung; nur relevant, wenn Tests dokumentweit selektieren.
- Version-Bump-Disziplin weiterhin eingehalten (Bundle, SW und Produktion synchron auf v41).
