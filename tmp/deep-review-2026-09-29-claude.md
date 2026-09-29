# Deep Review 2026-09-29 (v126): der Normierer, der über Dokumente summiert, nicht über Typen

Basis: Kettenkopf v125 (`440b23b`), neuer Branch `claude/deep-review-v126b`. Alle Branch-Spitzen
sind Ahnen des Kopfes.

## Geborgen

Der Lauf vom 28.09. (`claude/deep-review-v126`, Worktree `xenodochial-jones-725f8d`) hatte die
DSIR-Korrektur geschrieben und nicht committet. Die Ahnenprüfung über Branch-Spitzen sieht so
etwas nicht — nur `git status` im Worktree. Übernommen, nachgerechnet, abgesichert.

## Befund

`importance-resampling` (Lecture 14) zeigte nur die erste Hälfte seiner Gleichung (w=p_T/p_R).
Die zweite, der Normierer w̃ᵢ=w(xᵢ)/Σⱼw(xⱼ), lief leer. Genau er entscheidet, was ausgewählt wird:

| Sicht | A | B | C |
|---|---|---|---|
| w = p_T/p_R | 0,30/0,60 = 0,5 | 0,20/0,10 = 2 | 0,50/0,30 = 5/3 |
| im Pool (10 nach p_R) | 6 | 1 | 3 |
| w̃ je Dokument (Σ=10) | 0,05 | 0,2 | ≈0,167 |
| Anteil der Auswahl | 0,30 | 0,20 | 0,50 = p_T |

Das alte Beispiel und die l14-Quizantwort („B wird deshalb häufiger resampled“) lehrten die
Dokument-Sicht als Aussage über die Auswahl. Resampling stellt p_T her, es kippt nicht zu B.

## Absicherung

Guard `card importance resampling` (80 → 81 Blöcke, 130 Prüfungen), Mutationstest 16/16
gefangen, 0 inert. Cache v103.

## Nächste Hebel

1. Restliche Beispiele, die an Handout-Tabellen hängen (u. a. Kaskadenanteile), nach dem Muster
   von `card lab arithmetic`.
2. Die string-lokale Notationsklasse (34 Strings) — Entscheidung über Lesefluss, gehört dem Nutzer
   (Liste im v122-Report).
3. Korpus-Detektor auf Konzept- und Lecture-Seiten ausweiten.
