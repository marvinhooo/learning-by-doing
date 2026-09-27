# Deep Review 2026-09-27 (v125): der Parameter, der den eigenen Operator abschaltete

Basis: Kettenkopf v124 (`d5fd4c3`), neuer Branch `claude/deep-review-v125`. Alle Branch-Spitzen
sind Ahnen des Kopfes. Haupt-Checkout seit 29.07. unberührt.

## Was geprüft wurde

v124 hatte die Prüffrage gefunden: *Welcher Operator der Gleichung läuft in diesem Beispiel leer?*
Diesmal habe ich sie auf alle 83 Formelkarten angewendet.

## Befunde (keine falsche Zahl, vier Beispiele, die ihren Kern nicht zeigen konnten)

| Karte | Assignment | Leerlauf | neu |
|---|---|---|---|
| `attention` | A1 `scaled_dot_product_attention` | dₖ=1 → /√dₖ teilt durch 1 | dₖ=4, dazu der Zwilling ohne Division: [0,1; 0,9] statt [0,25; 0,75] |
| `causal-attention` | A1 | dₖ=1 | dₖ=4, rohe Skalarprodukte [4; 12; 16] → Scores [2; 6; 8] |
| `dpo` | A5-Supplement `dpo_loss` | β=1 → β·Marge = Marge | β=0,1 (Handout §6.4): L≈0,659 statt 0,403 |
| `scaling-law` | A3 | α=β=1 → Potenzgesetz wird Division | α=1/2, β=1/3: Verdoppeln senkt den Term nur um √2 |

Bewusst belassen: `rmsnorm` g=[1; 1] (das Beispiel sagt es selbst), ε≈0 als Numerikschutz.

## Guard

`card idle operators` (79 → 80 Blöcke). Er liest jeden Parameter aus dem Text beider Sprachen,
verlangt, dass er nicht leerläuft, und rechnet das Beispiel am gelesenen Wert nach. Dazu kommen
die Zwillinge und die Eingaben als Pflichtschritte sowie eine eingebaute Fixture.
Mutationstest: 37/37 gefangen, 0 inert. Der erste Lauf fand eine echte Lücke: Vertauschte
Gewichte gingen durch, weil sich wiederholende Zahlen die Reihenfolgeprüfung aushebeln. Jetzt
werden die Listen als Ganzes verlangt. Volle Suite grün, Cache v102.

## Lerneffekt für dich

- **A1 Attention:** Vergisst du `/ math.sqrt(d_k)`, sieht jeder Rechenschritt richtig aus. Die
  Softmax wird aber schärfer: Aus 0,75 wird 0,9, und bei d_k=64 ist der Faktor 8. Der
  Snapshot-Test fängt das, dein Auge nicht.
- **A5 DPO:** Bei β=0,1 bewegt eine Marge von 0,7 den Loss kaum von log 2 weg. Wenn dein
  DPO-Loss am Anfang ≈0,69 steht, ist das korrekt und kein Bug.
- **A3 Scaling:** Mit realistischen Exponenten (≈0,3) kostet jede Halbierung des Modellterms
  ein Vielfaches an Parametern. Das ist die ganze Pointe von Chinchilla.

## Nächste Hebel

1. `importance-resampling`: Das Beispiel rechnet die Normierung w̃ᵢ seiner eigenen Gleichung
   nicht vor und schreibt „.30/.60" ohne führende Null (die Dezimal-Guards übersehen diese
   Schreibweise offenbar).
2. Kaskadenanteile und Beispiele an Handout-Tabellen (aus v124 offen).
3. Weiter offen aus v122: Die Notations-Klasse (34 Strings) entscheidest du.
