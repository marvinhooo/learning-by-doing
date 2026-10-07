# Deep Review 2026-10-07 (zweiter Lauf) — v136

## Was geändert wurde
- **Lecture 9 folienweise abgeglichen.** Die App hatte die empirische Gerade (Chinchilla-Modell,
  IsoFLOPs, Fit), aber nicht die Begründung aus Teil 1 der Lecture (Folien 16–20), *warum* Scaling
  Laws Potenzgesetze sind.
- Neue Formelkarte **`estimation-rate`** („Warum Potenzgesetze? Die Schätzrate hinter der Geraden“),
  in Lecture 9 vor `scaling-law` kuratiert, am Ende des Konzepts `power-laws`, plus neues Lernziel.
  - σ²/n → Steigung −1; σ verschiebt nur den Achsenabschnitt (Brücke zu Folie 22).
  - n^(−1/d) bei d = 8 → 256-fache Daten je Halbierung.
  - Kaplans α = 0,095 (Folie 15) → 1475-fache Daten je Halbierung, 10× Daten = Loss × 0,804.
  - Fallstrick: bei d = 2 (dem Beispiel der Folie) fallen 1/d und 2/(d+2) zusammen; eine
    Steigung liefert zwei „intrinsische Dimensionen“.
- Guard `card estimation rate` (143 Prüfungen); volle Suite 94/94 grün; Mutationstest 32/0/0.

## Offen / für den Menschen
1. **`origin/main` (`dce0496`) kennt v100–v136 nicht** — Merge-Base v99. Unverändert seit v135;
   die Zusammenführung ist eine Produktentscheidung.
2. **localsub ist falsch konfiguriert:** `~/.claude/localsub-model` nennt `qwen3.8:27b`, Ollama
   hat nur `qwen3.8:27b-mlx`. Jeder localsub-Aufruf scheitert mit „model not found“.
3. Kein Browsertest (geplanter Lauf); Rendering nur über die Suite-Renderer geprüft.

## Nächste Hebel
- Folienabgleich für Lectures 11, 15, 16.
- Lecture 9, ebenfalls ohne Karte: Datenwiederholung (Folie 23, effektive Daten D′ nach
  Muennighoff) und die Tokens-pro-Parameter-Liste zum Übertrainieren für Inferenz (GPT-3 2 →
  Llama 3 70B 215). Beide sind Kandidaten für den nächsten Lauf.
