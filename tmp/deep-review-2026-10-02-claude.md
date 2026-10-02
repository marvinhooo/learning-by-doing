# Deep Review 2026-10-02 (v129): Exponenten und Fehler, die sich nicht unterscheiden ließen

Basis: Kettenkopf v128 (`f25b99e`), neuer Branch `claude/deep-review-v129`. Alle Branch-Spitzen
sind Ahnen des Kopfes; keine uncommittete Arbeit zu bergen.

## Befund 1 — `mup-transfer` gegen Lecture 11: in Ordnung

Die Rollentabelle (Embedding 1/1, Hidden 1/r und 1/r, Readout Varianz 1/r², Lernrate 1/r) deckt
sich mit der Folie „SP Unembedding 1/M (SP) vs 1/M^2 (muP)" und der Herleitung (Adam-Lernrate
∝ 1/fan_in). Die Vorlesung rechnet kein Zahlenbeispiel; das r=4-Beispiel der Karte trennt
Varianz und Standardabweichung (1/16 gegen 1/4). Keine Änderung.

## Befund 2 — `compute-optimal-predictions` (A3 `chinchilla_isoflops`)

Vorher: normiertes C=4 mit a=b=γ=0,5 — jeder Exponent erzeugte dasselbe √4, ein Tausch war
unsichtbar, und die Pitfall-Probe a+b≈1 ließ sich auf einem normierten C gar nicht anwenden.
Neu: erfundener Fit (ausdrücklich nicht die A3-Daten) auf echten FLOPs:

| Größe | Wert |
|---|---|
| Anker | C₀=6·10¹⁸ (A3s kleinstes Budget), N₀=10⁸, D₀=10¹⁰ aus C=6ND |
| Exponenten | a=0,6, b=0,4, γ=0,2 |
| Ziel C=6·10²² | N_opt≈2,51·10¹⁰, D_opt≈3,98·10¹¹, L_opt≈1,890 |
| vertauscht | N_opt≈3,98·10⁹ — besteht dieselbe Probe a+b=1, Modell 6,31-mal kleiner |

## Befund 3 — Sweep „gleich große Faktoren" über alle Karten

| Karte | vorher | Problem | neu |
|---|---|---|---|
| `precision-recall` (A4) | FP=FN=2 | Precision=Recall; die Karte konnte ihre eigene Prüffrage nicht zeigen | FP=4: 0,667 gegen 0,8, Tausch gedruckt |
| `logit-soft-cap` (L3) | c=z=2 | c·tanh(z/c)=z·tanh(c/z) | z=3: 1,810, vertauscht 1,748; z=0,2 für \|z\|≪c |
| `grpo-variants` (A5) | b=c=0,5 | Tausch unsichtbar und A=1 (Multiplikation leer) | b=0,2, c=0,4: A=2, vertauscht 3 |
| `accuracy-se` (A5s) | Acc=0,5 | Acc·Acc = Acc·(1−Acc) | Acc=0,8: SE=0,04, falsch 0,08 |

Die anderen Treffer des Sweeps sind Zufälle der Form Ergebnis = Eingabe oder echte
Lecture-Konfigurationen (Llama 2 13B mit L=H_q=40), die bleiben.

## Absicherung

Zwei neue Blöcke `card distinct exponents` und `card equal factors` (83 → 85). Mutationstest
19 + 24 gefangen, 0 inert, Kontrolle vor und nach grün. Cache v106. Kein Browsertest (geplanter
Lauf).

## Nächste Hebel

1. Die beiden Sweeps (Leerlauf-Operator, gleich große Faktoren) auf **Lab-Startwerte** ausdehnen:
   die Regler-Defaults der 64 Labs sind dieselbe Art Beispiel, aber noch nie so geprüft.
2. Die string-lokale Notationsklasse (34 Strings) — Nutzerentscheidung (Liste im v122-Report).
3. Korpus-Detektor auf Konzept- und Lecture-Seiten ausweiten.
