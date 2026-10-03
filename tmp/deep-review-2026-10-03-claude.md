# Deep Review 2026-10-03 (v130): der Startwert, an dem p und 1−p gleich sind

Basis: Kettenkopf v129 (`77524a2`), neuer Branch `claude/deep-review-v130`. Alle Branch-Spitzen
sind Ahnen des Kopfes; keine uncommittete Arbeit zu bergen.

## Hebel 1: Startwerte der 64 Labs

Alle Labs headless gerendert (Sandbox des `lab render sweep`), Startwert jedes Reglers notiert und
gegen zwei Fragen gehalten: Welcher Operator läuft hier leer? Welche zwei Größen sind gleich, sodass
ein Tausch unsichtbar bleibt?

### Fund — `baseline-variance` (A5 baseline_calcs, 5 Punkte)

| | vorher (p = 0,5) | neu (p = 0,1) |
|---|---|---|
| verschiedene Varianzen der 5 Baselines | 2 | 5 |
| b = p / b = 1−p / b = 0,5 | alle 0 | 0,0144 / 0 / 0,0036 (n=4) |
| Teil (a) p(1−p)³ gegen Tausch p³(1−p) | gleich | 0,018225 gegen 0,000225 |

Grund: Var₁ = p(1−p)(1−p−b)². Auf der Leiter sind nur p = 0,1 und 0,9 voll unterscheidbar, und nur
bei 0,1 hilft b = p noch (das Lehrbuchbild kommt zuerst, die Warnung bei 0,9 danach).

**Falscher Satz im `observe`-Text (DE/EN):** „bei p = 0,9 ist das Populationsmittel die
schlechteste der fünf Wahlen“. Tatsächlich ist b = 1 schlechter (0,018225 gegen 0,0144). Korrigiert;
der p = 0,5-Fall ist jetzt ein ausdrücklicher Vergleichsschritt.

### Geprüft und belassen

- Testfall-Labs, die absichtlich im blinden Fall starten und fragen, wie viele Fehler er sieht:
  `rope-rotation` (Position 0), `norm-and-ffn` (Gain 1, x = [1, 1]), `microbatch-denominator` (k = 1),
  `offpolicy-clip` (ein innerer Schritt).
- Natürliche Bezugszustände: `attention` τ = 1, `moe-routing` c = 1.
- `lsh-bands` b = r = 10: Einstellung aus Lecture 14; der Tausch b = 2/r = 50 gegen b = 50/r = 2
  ist Kurzcheckfrage 1.
- `distributed-runtime` d = 2: algbw = busbw in der oberen Tabelle, aber derselbe Regler speist
  Modus B, dessen Zahlen `desc`/`mental` für die 2-GPU-Konfiguration des Handouts zitieren; die
  Rankzahl-Tabelle zeigt den Ringfaktor auf demselben Bildschirm. **Nutzerentscheidung**, ob der
  Startwert in Modus A auf d = 4 wandern soll (bräuchte getrennte Startwerte je Modus).

## Absicherung

Neuer Guard `lab start values` (85 → 86, 34 Prüfungen). Mutationstest 25/25 gefangen, 0 inert,
Kontrolle grün. Volle Suite grün. Cache v107. Kein Browsertest (geplanter Lauf).

## Nächste Hebel

1. Der Lab-Startwert-Sweep war ein Inventar plus Handprüfung; ein **allgemeiner** Guard
   (je Lab: Startzustand rendern, Paare gleicher gedruckter Zahlen melden) wäre der nächste Schritt.
2. `distributed-runtime`: getrennte Startwerte je Modus (Nutzerentscheidung, siehe oben).
3. String-lokale Notationsklasse (34 Strings, Liste im v122-Report): Nutzerentscheidung.
4. Korpus-Detektor auf Konzept- und Lecture-Seiten ausweiten.
