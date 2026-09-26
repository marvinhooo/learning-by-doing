# Deep Review 2026-09-26 (v124) — das Beispiel lebte in der einen Dimension, in der sein Fehler nicht existiert

Basis: Kettenkopf v123 (`7ab1ac0`), neuer Branch `claude/deep-review-v124`. Alle Branch-Spitzen
sind Ahnen des Kopfes; kein verlorener Zweig. Haupt-Checkout seit 29.07. unberührt (keine aktive
Codex-Session).

## Was geprüft wurde

Der von v123 benannte Hebel: gerechnete Beispiele der Formelkarten, die an Lab-Code hängen.
Nachgerechnet: `flash-backward`, `grpo-advantage`, `moe-capacity`.

## Befunde

1. **`flash-backward` – richtig gerechnet, aber am falschen Fall.** Das Beispiel lief bei d=1,
   wo 1/√d=1 ist. Damit war der einzige Fehler unsichtbar, den das Lab `flash-backward-kernel`
   gezielt lehrt: den vergessenen oder doppelten Faktor 1/√d in dQ und dK, für den die übliche
   Selbstprüfung rowsum(dS)=0 blind ist. Das Beispiel endete mit genau dieser Selbstprüfung, und
   der Antwortschlüssel nannte „Skalierung" als etwas, das eine Zeilensumme aufdeckt – was nur
   für die Skala *in P* stimmt. Karte und Lab widersprachen sich.
   **Fix:** d=4 (√d=2) mit nur einer belegten Koordinate, sodass alle Zwischenwerte gleich
   bleiben; dQ = ln2/3 ≈ 0,231, dazu der Satz, dass ohne /√d dS dasselbe Array ist und dQ ≈ 0,462
   doppelt so groß wird. Antwortschlüssel (DE/EN) nennt jetzt beide Hälften.
2. **`moe-capacity` – das ⌈·⌉ rundete nie.** c_f=1 und T·k/E=6 ergeben eine ganze Zahl. Neu: der
   Schritt c_f=1,25 → 7,5 → ⌈7,5⌉=8, mit Begründung.
3. **`grpo-advantage`** – korrekt, jetzt über die Lab-Funktion `advAdvantages` gehalten.

## Guard

`card lab arithmetic` (Suite 78 → 79, 108 Prüfungen): zwei Rechenwege für flash-backward
(geschlossene Form + finite Differenzen), d>1 wird aus dem Beispiel gelesen und verlangt, beide
Behauptungen der Karte werden am Beispiel bewiesen, jede Zahl in Reihenfolge mit
Fundstellenzahl (an Zahlgrenzen gezählt), beide Sprachen; eingebaute Fixture.
Mutationstest: 30 Mutationen, 0 entkommen, 0 inert; Kontrolle vor/nach grün.
Volle Suite grün (79 Blöcke). Cache v101.

## Lerneffekt für dich

Wer A2 `flash_backward` implementiert und die Karte nachrechnet, sieht jetzt am Zahlenbeispiel,
dass ein fehlendes /√d den Gradienten um √d verfälscht, ohne dass rowsum(dS) es merkt – bei
Head-Dimension 64 ist das Faktor 8. Prüfe deinen Kernel deshalb immer per Betragsvergleich gegen
eine Referenz (wie A2s Test), nicht nur per Zeilensumme.

## Nächste Hebel

1. Kaskadenanteile und weitere Beispiele, die an Handout-Tabellen hängen, nach demselben Muster.
2. Bei jedem Beispiel zusätzlich fragen: welcher Operator der Gleichung ist hier Leerlauf
   (Faktor 1, Rundung ohne Wirkung, Summe über ein Element)?
3. Weiter offen aus v122: die Notations-Klasse (34 Strings) ist eine Entscheidung für dich.
