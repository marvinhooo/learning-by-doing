# Deep Review v123 — 2026-09-25

Branch `claude/deep-review-v123`, gebaut auf dem Kettenkopf v122 (`29e0540`). Der zugewiesene
Worktree stand auf v99 (`2ed21e7`), 24 Commits dahinter. Ahnenprüfung über alle Branch-Spitzen:
kein Zweig außerhalb, vor und nach dem Lauf. Haupt-Checkout seit dem 29. Juli unberührt, also
keine parallele Codex-Sitzung.

Guard-Suite: **76 → 78 Blöcke grün**, Exit 0. Cache v99 → **v100**. Tafelwerk 82 → **83 Karten**.

---

## 1. Der inhaltliche Hebel: die Regel, die das Handout ausschreibt

A4 §2.6 schreibt vier Schwellen wortwörtlich aus — weniger als 50 oder mehr als 100 000 Wörter,
mittlere Wortlänge außerhalb 3 bis 10 Zeichen, mehr als 30 % Zeilen auf drei Punkten, weniger als
80 % Wörter mit mindestens einem alphabetischen Zeichen — und Problem (gopher_quality_filters)
trägt dafür 3 Punkte. Lecture 13 nennt die vierte Regel selbst:

> Quality filtering using manual rules (not classifier) - e.g., 80% words contain at least one
> alphabetic character

**Das Tafelwerk kannte die Regel nicht.** L13 kuratierte `corpus-throughput` und `cascade-yield`;
das Konzept `quality-filtering`, dessen erster Begriff „Heuristische Qualitätsregeln
(Gopher-Regeln)" heißt, verlinkte als einzige Formelkarte `logistic` — den **Klassifikator**. Das
Lab `quality-threshold` rechnet die vier Regeln vollständig und korrekt; aber die Fläche, auf der
man während des Lösens eine Regel *nachschlägt*, endete einen Klick vor ihr.

### Neu: Formelkarte `gopher-rules`

Deutsch und englisch, mit Gleichung als Konjunktion, sieben Symbolerklärungen, Intuition,
Fallstrick, gerechnetem Beispiel und Selbstcheck samt Musterlösung. Eingehängt in
`quality-filtering` (ans **Ende** der Liste, siehe unten) und in L13s kuratierte Liste.

Das gerechnete Beispiel ist der Fallstrick selbst, weil drei der vier Regeln Wörter zählen und A4
ausdrücklich offen lässt, was ein Wort ist:

| Dokument | Tokenisierung | N | L̄ | f_α | Urteil |
|---|---|---|---|---|---|
| Linkliste (6 URLs) | Leerraum | 6 | 417/6 = 69,5 | 6/6 = 1,0000 | verworfen (Wortzahl **und** Wortlänge) |
| dieselbe | Satzzeichen | 102 | 417/102 = 4,0882 | 54/102 = 0,5294 | verworfen (nur alphabetischer Anteil) |
| Forumsbeitrag (Mensch: behalten) | Leerraum | 76 | 299/76 = 3,9342 | 73/76 = 0,9605 | **behalten** |
| derselbe | Satzzeichen | 100 | 299/100 = 2,99 | 76/100 = 0,7600 | **verworfen** (zwei Regeln) |

Nicht nur der *Grund* wandert, das *Urteil* dreht sich — genau der Vergleich mit dem eigenen
Urteil, den A4 (b) an 20 Beispielen verlangt.

### Ein struktureller Fund nebenbei

Die Karte **zuerst** in `quality-filtering.formulas` einzutragen ließ `lecture formulas` rot
laufen. Grund: auf einer Lecture, die keine Karte des Konzepts kuratiert, druckt die App nur die
**erste** Karte der Liste — `logistic` fiel damit vollständig vom Lernpfad. Anhängen ist richtig,
Voranstellen still falsch. Der neue Guard hält das jetzt mit Namen fest, damit der Fehler dort
gemeldet wird, wo er entsteht.

---

## 2. Guard `gopher rules` (Suite 76 → 77), 140 Checks

- Alle sechs Schwellen werden aus den Prädikaten des Labs **herausgemessen** statt getippt und
  gegen A4 §2.6 gehalten; jede muss in der Gleichung beider Sprachen stehen.
- Jede Zahl des Beispiels wird **zweimal** nachgerechnet: durch `qtMeasure` der App und durch die
  unabhängige Handout-Referenz am Kopf der Suite. Beide müssen übereinstimmen.
- Jede Zahl wird in **dem** Abschnitt des Beispiels verlangt, der zu ihrer eigenen Tokenisierung
  gehört — und der Wert der anderen ist dort **verboten**. Das ist die Paarung, an der v121s
  `compression-ratio` gescheitert war.
- Die gerichtete Behauptung (Satzzeichen abtrennen hebt N, senkt L̄ und f_α) ist auf allen acht
  Dokumenten in beide Richtungen bewiesen, als nicht-leer belegt, mit ihrem Mechanismus (beide
  Tokenisierungen behalten exakt dieselben Zeichen) und **mit ihrer Grenze** versehen: eine
  Messung an acht konstruierten Dokumenten, kein Satz.
- Eingebaute Fixture: eine gekreuzte Paarung muss gefangen werden, der eigene Text grün bleiben.

---

## 3. Guard `card arithmetic` (Suite 77 → 78), 109 Checks

v122s zweiter offener Hebel, in seinen eigenen Worten: „Die Arithmetik ist einmal von Hand
geprüft, aber von keinem Guard gehalten."

Die drei bestehenden Kartensweeps fragen, wie eine Zahl **geschrieben** ist (`card numerals`), ob
ihr Komma ein Dezimaltrenner ist (`card comma lists`) und ob beide Sprachen dieselben Ziffern
drucken (`worked steps`). Ein Beispiel, dessen Zahlen in beiden Sprachen gleich falsch sind, kommt
durch alle drei.

Gehalten werden jetzt die sechs Karten, deren Beispiel reine Arithmetik ist — `mean-var`,
`softmax`, `logsumexp`, `rmsnorm`, `swiglu`, `bloom-filter` —, aus ihrer eigenen Gleichung
nachgerechnet: **25 Zahlen und 11 ausgeschriebene Divisionen und Summen**, in beiden Sprachen, in
der Reihenfolge, in der die Rechnung sie erzeugt.

### Zwei Blindstellen, die erst der Mutationstest zeigte

1. **Anwesenheit genügt nicht.** `softmax` druckt seine Summe `1,503` viermal — einmal als
   Ergebnis, dreimal als Nenner. Eine davon zu verfälschen lässt die Zahl im Text stehen; ein
   `includes` sieht nichts. Erst die festgeschriebene **Fundstellenzahl** fängt es.
2. **Reihenfolge hat zwei Ebenen.** `rmsnorm`s zwei Zähler zu tauschen lässt `3/3,536` und
   `4/3,536` je einmal und die beiden Quotienten in richtiger Reihenfolge stehen. Erst die
   Reihenfolgeprüfung **der ausgeschriebenen Schritte** fängt es.

Beide Lücken standen in der ersten Fassung offen und wurden geschlossen, nicht wegdefiniert.

### Eine Lehre über das Messinstrument

Die erste Schwellenmessung lief `value += 0.01` und meldete die Ellipsen-Schwelle bei 0,295, weil
die Akkumulation 0,30000000000000004 ergibt: der Code war richtig, die Messung falsch. Seitdem
scannt sie über exakt darstellbare Kandidaten `i/100`. Und die erste Wortzahl-Mutation wurde von
der **Randschranke des Lineals** gefangen statt von der gemeinten Klausel — der Scan wurde
geweitet, bis die Klausel selbst spricht.

---

## 4. Mutationstest

| | Mutationen | gefangen | entkommen | inert | grüne Kontrollen |
|---|---|---|---|---|---|
| `gopher rules` | 30 | 30 | 0 | 0 | 3 |
| `card arithmetic` | 28 | 28 | 0 | 0 | 3 |

Kontrolle vor **und** nach dem Lauf grün. Schlankfassung nach dem bewährten Muster: 0,25 s je Lauf
statt 85 s. Drei erste Ergebnisse waren Lehrgeld und stehen oben: eine inerte Mutation durch einen
nicht eindeutigen Anker, ein Fang durch eine Leerlauf-Schranke statt durch die geprüfte Klausel,
und eine Mutation, die eine von vier Fundstellen traf und deshalb durchlief.

---

## 5. Statt Browsertest

In geplanten Läufen ist `preview_start` gesperrt. Ersatz: die neue Karte headless durch die
Renderer der App selbst — `formulaLearningSequence`, `formulaPrimerMarkup`,
`formulaNotationMarkup`, `selfCheckMarkup` — in beiden Sprachen gerendert: 5471 und 5301 Zeichen,
neun Tagpaare ausbalanciert, kein `undefined`, kein uninterpoliertes Template, kein NaN, kein
deutscher Rest im englischen Render. Die volle Suite rendert die Karte zusätzlich in
`accordion route` (265 Akkordeon-Instanzen) und prüft sie in `formula field fallthrough`.

---

## 6. Was offen bleibt

1. **Die übrigen gerechneten Beispiele** hängen an Lab-Code oder an Handout-Tabellen statt an
   reiner Arithmetik (`flash-backward`, `grpo-advantage`, `moe-capacity`, die Kaskadenanteile).
   Dasselbe Muster, ein Schritt weiter: über die jeweilige Lab-API nachrechnen, wie es
   `compression growth` und `gopher rules` bereits tun.
2. **Die string-lokale Notationsklasse** (34 Strings) bleibt eine Entscheidung über den Lesefluss,
   nicht über Korrektheit — echte Intervalle `[0,1)`, Matrixadressen, das Skalarprodukt-Beispiel.
   Die Liste steht im v122-Report; sie gehört dem Nutzer, nicht einem unbeaufsichtigten Lauf.
3. **Korpus-Detektor auf Konzept- und Lecture-Seiten ausweiten** (unverändert aus v122).
