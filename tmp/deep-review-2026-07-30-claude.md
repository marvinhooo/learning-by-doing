# Deep Review 2026-07-30 — DPO-Loss-Lab (v54)

Automatischer Lauf des Scheduled Task `deep-review-lern-plattform`. Branch
`claude/confident-satoshi-b06651`.

## Was gefunden wurde

Der Review dieses Laufs hat eine strukturelle Lücke gefunden, keine inhaltliche:

- **Lecture 15 (RLHF & Alignment) war die einzige der 17 Lectures ohne
  interaktives Lab.** Sie konnte nur gelesen werden. Genau diese Lecture liefert
  aber die Gleichung, die im A5-Supplement implementiert werden muss.
- **Das Modul `alignment` hatte kein eigenes Lab.** Es hat sich das Lab
  `evaluation` geborgt, dessen eigenes Modul `evaluation` ist.
- **Die Mission `a5:supplement`** — 16 Probleme, 61 Punkte, die größte Mission
  der Assignment-Seite — hatte ebenfalls nur `evaluation` verlinkt.

Damit fiel der Weg von „Lecture 15 gelesen" zu „`run_compute_per_instance_dpo_loss`
besteht `-k test_per_instance_dpo_loss`" komplett auf das Handout zurück. Das ist
die Stelle, an der die Plattform ihr Versprechen nicht gehalten hat.

## Was gebaut wurde

Ein neues interaktives Lab `dpo-loss` („DPO-Loss: Referenzanker, Länge &
logsigmoid", 16 min), das Gleichung (3) des A5-Supplements in simulierter
float32-Arithmetik durchrechnet.

Die didaktische Konstruktion ist der eigentliche Inhalt: vier Präferenzpaare × fünf
Implementierungsvarianten. **Jede der vier falschen Varianten ist auf mindestens
einem Paar bit-identisch mit der korrekten** — und wird nur auf anderen Paaren
entlarvt:

| Variante | versteckt auf | entlarvt auf |
|---|---|---|
| `noRef` (Referenzterme fehlen) | indifferent | lengths, tied, confident |
| `swapped` (chosen/rejected vertauscht) | tied | lengths, indifferent, confident |
| `meanNormalize` (pro Token gemittelt) | tied | lengths, indifferent, confident |
| `sigmoidThenLog` (erst σ(h), dann log) | lengths, indifferent, tied | confident (+∞) |

Die Lehre daraus steht im Block „Was ein einzelnes Testpaar beweisen kann": ein
selbst gebautes Testpaar ist kein Ersatz für `test_per_instance_dpo_loss`, weil ein
einzelnes Paar jeden der vier Fehler durchlassen kann.

Der Transfer-Kurzcheck (drei Felder mit festen Antworten) prüft die drei
Entscheidungen, die man beim Implementieren übersieht: der Prompt-Anteil kürzt sich
weg, der Nenner mit der Tokenzahl macht die Marge längenabhängig, und die
Referenzterme kürzen sich nur, wenn π_ref beide Antworten gleich bewertet.

Berührte Dateien: `index.html`, `i18n-en.js`, `scripts/check-i18n.mjs`, `sw.js`
(v53 → v54).

## Verifikation

**Jede angezeigte Zahl gegen eine unabhängige Referenz geprüft, bitweise.**
`dpo-verify.mjs` hat die Funktionen der Plattform selbst aus `index.html`
extrahiert und mit `Object.is` gegen eine aus Gleichung (3) neu getippte
Implementierung verglichen: alle 20 Kombinationen `match`, kein einziger
Abweichler. Anschließend im Browser über das echte DOM alle 20 Kombinationen
durchgefahren — die gerenderten Zahlen stimmen mit derselben Tabelle überein.

Belegte Kernzahlen: `tied`/korrekt ergibt h = 0 und damit exakt log 2 = 0,693147.
`confident`/korrekt ergibt h = −119 und Loss 119,000000. `confident`/`sigmoidThenLog`
ergibt **+∞**, weil σ(−119) e^119 ≈ 4,8·10⁵¹ braucht und float32 bei 3,4·10³⁸ endet.

Weiter geprüft:

- `node --check` auf dem extrahierten Inline-Script: OK.
- Alle Guards grün: 124 Probleme / 523 Punkte, 110 von einer Lecture angekündigt,
  30 Labs (vorher 29), 1309 UI-Strings.
- **Beide neuen Guards negativ getestet** — sie schlagen tatsächlich an. Ein
  manipuliertes `tied`-Paar löst „variant swapped is exposed on every preference
  pair" aus, ein geleertes `l15.labs` löst „no interactive lab, so this lecture can
  only be read and never practised" aus.
- Browser, DE und EN, 375 px und 1280 px: keine Konsolenfehler, kein horizontaler
  Überlauf, keine abgeschnittenen oder kollidierenden Ledger-Zeilen in allen 20
  Kombinationen. Die Formulierung kippt korrekt zwischen „Falsch – aber dieses
  Präferenzpaar deckt es nicht auf" und „Falsch – und dieses Präferenzpaar deckt es
  auf". Kein deutscher Text leckt nach EN, kein englischer nach DE.
- Alle drei Antwortpfade des Kurzchecks: richtig → bestanden und persistiert,
  falsch → „Noch nicht.", unvollständig → Toast ohne Überschreiben.
- Nach Reload wird der bestandene Zustand wiederhergestellt (Selects und Callout).
- Das Lab ist von allen vier Einstiegen erreichbar: Labs-Index, Lecture 15,
  Assignment 5, Modul `alignment`.

## Autonome Entscheidungen (der Nutzer war nicht anwesend)

- **β bleibt bei 0,1 ohne Slider.** §6.4 des Supplements schreibt diesen Wert vor;
  so ist jede angezeigte Zahl gegen die Referenz geprüft. Unterhalb von etwa
  β = 0,075 überläuft der `confident`-Fall nicht mehr, womit genau die Lehre
  verschwinden würde, die die Transfer-Antwort erklärt. Ein neuer Guard hält
  `DPO_BETA === 0.1` fest.
- **Die Urteilstexte werden aus den formatierten Loss-Strings berechnet**, nicht
  hartcodiert. „Versteckt" heißt damit wörtlich: die Zahl, die der Lernende sieht,
  ist dieselbe.
- **Der `confident`-Fall zeigt Sequenzsummen und Tokenzahlen (512/480)**, keine
  Token-Liste — in den Loss gehen nur die Summen ein, eine Liste mit 512 Einträgen
  wäre Dekoration.
- **Der `tied`-Fall benutzt nur dyadische Werte**, damit jeder float32-Schritt exakt
  ist und h wirklich genau null wird.
- **Dezimaltrennzeichen:** deutsche Prosa mit Komma, berechnete Ausgabe mit Punkt.
  Das ist die vorhandene Hausregel (hunderte Komma-Dezimalstellen in der Prosa, alle
  34 `toFixed`-Ausgaben mit Punkt), nicht eine neue Inkonsistenz.

## Beobachtung, nicht geändert

`i18n-en.js` hat drei doppelte `ui`-Keys: `"Modelldimension D"` (7528 und 8217),
`"HBM-Bandbreite"` (7556 und 8223), `"Gruppenmittel μ"` (7588 und 7907). Beide
Vorkommen haben jeweils identische Werte, das Verhalten ist also unverändert. Sie
sind älter als dieser Lauf (per `git diff` bestätigt) und wurden deshalb nicht
angefasst.

## Weiter zurückgestellt

Foundations-Verkettung („nächste Grundlage"-Button). Greift in den
Navigationsvertrag ein und ist damit invasiver als der Nutzen rechtfertigt, solange
jede Lecture ihre Voraussetzungen ohnehin an der Stelle auffrischt, an der sie
gebraucht werden.
