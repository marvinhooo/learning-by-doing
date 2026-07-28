# Deep Review 2026-07-15 (geplanter Claude-Run, 07:00–07:30)

Hinweis: Während dieses Reviews wurde das Arbeitsverzeichnis parallel aktiv weiterbearbeitet
(index.html zuletzt 07:21, i18n-en.js 07:20). Deshalb wurden bewusst **keine konkurrierenden
Edits** an App-Dateien vorgenommen; dieser Report ist der Output des Runs.

## Gesamturteil

Der ungecommittete Stand (auf Basis von 5c99f36) adressiert die Kernfragen des Auftrags bereits
sehr gut und ist fachlich hochwertig. Alle folgenden Punkte wurden in diesem Run aktiv verifiziert.

## Verifiziert (mit Beleg)

1. **Prerequisite Sprint (Modul 00, 9 Konzepte)**: `python-engineering`, `pytorch-tensors`,
   `pytorch-state` + Mathe-Grundlagen; Inhalte beginner-first und fachlich korrekt
   (u. a. decode(encode(x))=x-Invariante, Generator-Erschöpfung, Tie-Break-Determinismus).
2. **Assignment Mission Maps A1–A5 sind PDF-treu**: Alle Problem-IDs der Missions wurden gegen
   die tatsächlichen `Problem (...)`-Blöcke der Assignment-PDFs geprüft (A1: 38 Probleme,
   A2: 27, A4: 13, A5: 29) – die Zuordnung stimmt; Kürzungen wie `overlap` für
   `ddp_overlap_individual_parameters` sind unkritisch.
3. **Volle Lecture-Abdeckung**: Alle 16 Lecture-PDFs (1–13, 15–17; Lecture 14 existiert nicht
   im Ordner) sind als Quellen registriert und werden von mindestens einem Modul UND einem
   Konzept referenziert. Lecture 10 hat jetzt ein eigenes Inference-Modul.
4. **Neues Lab „Inference Memory & Latency Budget"**: Formeln nachgerechnet und korrekt
   (M_KV = 2·L·B·T·H_kv·d_head·bytes; N ≈ 12·L·D² + V·D; GQA-Ersparnis; Prefill/Decode-Trennung).
   Interaktiv geprüft, Reaktion auf Regler korrekt.
5. **Triton-Konzept fachlich stark**: inkl. der subtilen Falle „maskierte Softmax-Loads brauchen
   −∞ statt 0 als other-Wert" und Strides als Teil der Operatorsemantik.
6. **Diagnose ausgebaut**: 15 MC-Fragen (neu: python, pytorch, inference) + 4 angewandte
   Transferchecks mit Rubriken; `FOUNDATION_DIAGNOSTIC_MAP` routet schwächste Bereiche korrekt
   auf die neuen Prerequisite-Konzepte; „Ich weiß es nicht" bleibt im Nenner.
7. **Evidenz-Gate funktioniert**: Missions lassen sich erst nach ≥30 Zeichen eigener
   Readiness-Evidenz als erfüllt markieren (getestet; Toast erscheint korrekt).
8. **Qualitätssicherung**: `node --check` des Inline-JS sauber, `scripts/check-i18n.mjs` grün
   (59 Konzepte, 52 Formeln, 55 Glossar, 732 UI-Strings) inkl. der neuen
   Referenzintegritätsprüfungen. Keine Konsolenfehler im Browser-Smoke-Test
   (Dashboard, Konzeptseite, Lab, Assignment-Coach).

## Konkrete nächste Verbesserungen (priorisiert)

1. **Wiederholung als größter verbleibender Hebel – aber pull-basiert, ohne Termindruck**
   (explizite Nutzerentscheidung vom 2026-07-15: kein „Heute fällig", keine Tagespflichten,
   keine Streaks – der Lernende bestimmt selbst, wann er wiederholt):
   Karteikarten sind aktuell ein lineares Deck aus nur 13 Quizfragen + den ersten 15 von
   52 Formeln – ohne Shuffle, ohne Selbstbewertung, ohne Priorisierung.
   Vorschlag: Deck aus allen Formel-Abrufchecks + Konzept-Selbstchecks generieren;
   pro Karte „Gewusst/Nicht gewusst" speichern; wenn der Nutzer von sich aus das
   Abruftraining öffnet, Karten nach Priorität sortieren (nie abgerufen → zuletzt nicht
   gewusst → am längsten nicht erfolgreich abgerufen) statt nach Kalender. Kein Datum,
   keine Fälligkeitsanzeige im Dashboard. Erfolgreiche zeitversetzte Abrufe können weiterhin
   Stufe 4 „Zeitversetzt sicher" belegen – als Evidenz, nicht als Terminpflicht.
2. **Abruftraining deckt Modul 00 nicht ab**: 13 Fragen decken 12 Module ab, aber keine der
   9 Prerequisite-Konzepte. 2–3 Fragen ergänzen (z. B. Views/Strides & contiguous,
   bytes↔str-Roundtrip, was gehört in state_dict/Optimizer-State).
3. **Diagnose-Ergebnis zeigt rohe Bereichs-Slugs** („python 0% · grad 0% · systems 0%") im
   Ergebnis-Callout – auf lesbare, lokalisierte Labels mappen.
4. **A3-Missions kennzeichnen**: Das A3-Handout hat real nur ~2 Problem-IDs
   (`chinchilla_isoflops`, `scaling_laws`); die 4-Missions-Unterteilung ist didaktisch sinnvoll,
   sollte aber als eigene Strukturierung erkennbar bleiben (nicht als Handout-Scope).
5. **Vor Deployment**: i18n-Versionsparameter (`?v=`) und `sw.js`-Cache-Name konsistent bumpen –
   während des Reviews führte ein zwischenzeitlicher Edit zu einem Stale-Cache-Artefakt
   (alte i18n-Datei unter neuer Versionsnummer im Browser-HTTP-Cache). Kein Produktbug,
   aber der Ablauf „erst Inhalte final, dann Version bump, dann deploy" bleibt wichtig.

## Kleinigkeiten / Ideen (optional)

- Dashboard könnte den Zeitgewinn sichtbar machen (Summe Modul-Minuten ≈ 3.660 min vs.
  ~28 h Vorlesungen + Nacharbeit) – motivierend fürs Durchhalten.
- Missions könnten den passenden lokalen Testbefehl als Text nennen
  (z. B. `uv run pytest -k rmsnorm`), ohne Implementierungshinweise – bleibt in der KI-Richtlinie.
