# Deep Review 2026-08-22 — A3 war die einzige Aufgabe ohne Vertrag, und der neue Guard fand einen Fehler von vorher (v81)

Basis `e9e8fa0` (v80). Die letzten Durchgänge haben die Lecture-Treue tief geprüft und die
Guard-Infrastruktur gebaut; der v80-Report schloss mit vier offenen Hebeln, die alle
Werkzeug betrafen. Dieser Durchgang ist stattdessen an der Frage entlanggegangen, die der
Auftrag stellt — „wird sich wirklich an den Assignments entlang gehangelt?" — und hat dort
eine Lücke gefunden, die größer war als jeder der vier Hebel.

## Der Befund: A3 verschwieg seinen eigenen Vertrag

Erst die Gegenprobe, dass die Abdeckung überhaupt stimmt: aus den sechs Handout-PDFs
extrahiert ergeben sich **122 Problem-IDs, und die App führt exakt dieselben 122** — keine
fehlt, keine ist erfunden. Auf dieser Ebene hängt sich die Plattform sauber an die
Assignments.

Eine Ebene tiefer nicht. `memory.md` führt einen handout-exakten Vertrag für A1, für A2
und für A5. Für A3 keinen — und die Suche in `index.html` sagt warum:

| gesucht | Treffer in HEAD |
| --- | --- |
| `max_runtime_seconds`, `total_train_tokens`, `hidden_size`, `n_evals` | je 0 |
| `43200`, `12 B200`, `48 B200`, `12 n_layer` | je 0 |
| `hyperturing`, `isoflops_curves`, `num_key_value_heads` | je 0 |

Das ist nicht irgendein Detail. A3 hat 55 Punkte, davon 50 auf dem Leaderboard-Problem,
und dieses Problem besteht vollständig darin, **innerhalb eines harten Budgets und unter
konkreten Gültigkeitsbedingungen eine Run-Matrix zu planen**. Die A3-Mission
„Budgetledger & Run-Design" verlangt wörtlich „eine Tabelle aus gültiger Architektur, N,
D_tokens, geschätzter Laufzeit, Compute-Tier und verbleibendem Budget", und das
Abschlusskriterium lautet „Ziel erfüllt API-Constraints". Nur stand nirgends, was eine
gültige Architektur ist, wie groß das Budget ist oder wie es abgerechnet wird. Die beiden
Labs, auf die die Mission zeigte, modellieren etwas anderes: `scaling` rechnet mit
generischen GPU-Stunden und sagt selbst „Das Lossprofil ist schematisch",
`decay-horizon` rechnet Schedules.

## Das Lab: `run-budget-ledger`

Zwei Modi, beide direkt aus A3 §3.1–§3.3.

**Modus A — nimmt die API diese Anfrage an?** Fünf `architecture_config`-Objekte gegen vier
Tokenzahlen. Zwei der Architekturen verletzen genau eine Bedingung: `hidden_size = 512`
neben 7 Heads à 64 (weil 7 · 64 = 448), und 12 Query-Heads auf 5 Key-Value-Heads. Eine
Tokenzahl ist die runde, die man eintippt: 100.000.000 mod 65.536 = 57.600.

Interessanter ist die zweite Tabelle. A3 §3.3 schreibt vor, `N` mit
`12 · n_layer · d_model²` zu schätzen, und das Lab stellt daneben, was ein Parameterzähler
sonst ausgibt:

| Zählweise | N (Beispielmodell) | gegenüber A3 |
| --- | --- | --- |
| `12 · n_layer · d_model²` | 21.676.032 | 1,000000 |
| `L · (4d² + 3d·d_ff + 2d)` | 22.716.288 | 1,047991 |
| alles inklusive Embeddings | 51.388.736 | **2,370763** |

Beim Beispielmodell sind die beiden Embedding-Matrizen zusammen größer als alle neun
Blöcke — wer sie mitzählt, trägt ein um **Faktor 2,37 verschobenes C = 6ND** in den Fit.
Und die Vorschrift ist keine Konvention: `12 · L · d²` ist exakt der Matrixanteil eines
Blocks bei `d_ff = 8/3 · d_model` — 4d² aus den vier Attention-Matrizen plus 3d·d_ff = 8d²
aus dem SwiGLU-Netz. Beim breiten Kandidaten (d_model 1024, d_ff 2731) lässt sich die
Differenz vollständig aufteilen: 12 · 16 · 1024² = 201.326.592 ist der Matrixanteil, dazu
32.768 Norm-Gains und 16.384 aus `d_ff = 2.731` statt 2.730,6667 ergeben die exakten
201.375.744. Und der Embedding-Anteil fällt mit der Breite — 2,370763 bei d_model 448
gegen 1,325770 bei 1024. **Genau deshalb** wirft A3 ihn weg: ein Term, der anders skaliert
als der Rest, verbiegt den Exponenten, den man gerade misst.

**Modus B — was zwölf Läufe vom Budget abziehen.** A3 §3.1 versteckt die eigentliche Regel
in vier Sätzen: reserviert wird `max_runtime_seconds`, abgerechnet wird beim Abschluss die
tatsächliche Laufzeit auf [1 s, max] geklemmt — ein Timeout dagegen die volle Reservierung.
Zwölf Läufe, die je 900 s brauchen:

| Reservierung | abgerechnet | abgeschlossen | gleichzeitig zulässig |
| --- | --- | --- | --- |
| 600 s | **7.200 s** | **0 von 12** | 72 |
| 900 s | 10.800 s | 12 | 48 |
| 1.200 s | 10.800 s | 12 | 36 |
| 3.600 s | 10.800 s | 12 | 12 |
| 10.800 s | 10.800 s | 12 | **4** |

Die erste Zeile ist die Lektion: die sparsamste Reservierung ist **billiger** und liefert
**nichts**. Jeder Lauf läuft in den Timeout, wird voll abgerechnet und hinterlässt nur
`partial_val_losses`, die A3 ausdrücklich nicht als abgeschlossenen Lauf zählt. Ein Timeout
ist die einzige Art, im vollen Umfang für nichts zu bezahlen.

Nach oben gilt das Gegenteil nicht symmetrisch. Die letzten drei Zeilen rechnen identisch
ab — bezahlt wird in der letzten Spalte. `remaining_seconds` zieht die vollen
Reservierungen wartender und laufender Experimente ab, also begrenzt
⌊43.200 / max_runtime_seconds⌋ die Zahl gleichzeitiger Anfragen, und darunter antwortet die
API mit 400 statt mit einer `experiment_id`. **Eine großzügige Reservierung kostet kein
Budget, sie kostet Parallelität.**

## Der neue Guard `panel i18n` — und sein Fund

Beim Übersetzen des Labs fiel auf, dass der v80-Guard `renderer i18n` nur eine Hälfte hält.
Er prüft jeden String, den ein Renderer durch `tr()` schickt. Die andere Hälfte ist das
**Panel-Markup**: dessen Textknoten gehen ohne `tr()` in den DOM, und erst der Sprachwalker
übersetzt sie — per exaktem Eintrag im `ui`-Pack oder per Pattern. Ohne Eintrag bleibt der
Text stehen, und nichts sagt es.

Der Guard baut den statischen Text jedes Panels nach, dekodiert HTML-Entities und jagt ihn
durch den **echten** `translateUiValue` der App, samt `CORE_UI_TRANSLATIONS` und
`__patterns`. Übrig bleibendes Deutsch schlägt fehl. Zwei Zusicherungen halten den
Übersetzer selbst ehrlich: ein String mit bekanntem Eintrag muss verändert zurückkommen,
einer ohne unverändert.

Ergebnis: **734 deutsche Textknoten über 44 Lab-Panels**, davon 37 ohne Eintrag — 17 aus
meinem neuen Lab und **20 aus `stability-edge` (v76)**. Gegen HEAD gemessen, nicht
geschätzt: dessen Panel ist byteweise identisch mit HEAD, und 20 von 20 dieser Strings
hatten dort keinen englischen Eintrag. Betroffen sind Legende, alle drei Fragen und alle
neun Antwortoptionen des Kurzchecks — ein englischer Leser bekam den **kompletten Kurzcheck
auf Deutsch**, also wieder genau den Text, den man liest, wenn man nicht weiterkommt. Alle
37 sind übersetzt.

Eine Falle beim Bau: die Deutscherkennung muss konservativ sein. `die`, `was`, `war`, `hat`,
`man` und `all` sind auch englische Wörter; mit ihnen in der Liste meldet der Guard jeden
übersetzten Satz als unübersetzt. Übrig bleiben eindeutige Funktionswörter plus Umlaut/ß.

## Verifikation

- **25 Guard-Blöcke grün**, keine bestehende Zahl bewegt. Die einzige Abweichung gegenüber
  HEAD ist die Zahl der UI-Strings (3434 → 3556), also exakt die 122 neuen Einträge.
- **Mutationstest 14/14 gefangen, 0 escaped, 0 inert** — in zwei Runden. Die erste Runde
  meldete 3 von 12 als entkommen; alle drei waren in Wahrheit **wirkungslos**: zwei
  mathematisch identisch zum Original (`min(max(need,1),reserve)` ist bei `need > reserve`
  schon `reserve`), eine ohne Effekt auf das Markup.
- Eine dieser wirkungslosen Mutationen deckte eine **echte Guard-Lücke** auf: alle fünf
  angebotenen Reservierungen teilen 43.200 exakt, also waren `Math.floor` und `Math.ceil`
  auf den echten Daten ununterscheidbar. Der Guard fährt jetzt zusätzlich Reservierungen,
  die nicht teilen (5.000 → 8, nicht 9).
- Ein zweiter Fund im eigenen Lab, ebenfalls aus dem Mutationstest: `rbCount` bewegte den
  Render (die markierte Tabellenzeile), aber die Ledger-Zeile mit dem gewählten N ließ sich
  auf `handout` festnageln, ohne dass etwas anschlug. Die Render-Coverage-Eigenschaft „der
  Regler bewegt den Render" ist dagegen blind. Drei Anker lesen die Zahl jetzt selbst
  zurück.
- **Render coverage 1813 → 3613 Zustände über 8 Labs**, 3719 Prüfungen; das neue Lab hat
  alle vier Eigenschaften von Tag eins.
- Beide Sprachen headless gerendert, vier Zustände je Sprache: DE `1.048.576` /
  `intermediate_size = 1.280`, EN `1,048,576` / `intermediate_size = 1,280`, Handout-Zitate
  in beiden Sprachen mit den korrekten Anführungszeichen.
- `node --check` auf Inline-Script, `i18n-en.js` und `check-i18n.mjs`; **555 DOM-IDs,
  0 Duplikate**. Laufzeit 7,6 s → 9,8 s.
- Nebenbei geschlossen: **offener Hebel 3 aus v80** — `sliceDeclaration` fand `const NAME={`
  ohne Leerzeichen nicht. Hier bei `CORE_UI_TRANSLATIONS` gebraucht.

## Zwei eigene Zahlen, die falsch waren

Beide vor dem Einbau gefangen, beide von Hand gerechnet statt vom Code:

- `1,325882` als Embedding-Faktor des breiten Kandidaten. Richtig ist **1,325770**.
- „exakt die Blockzahl für `d_ff = 8/3 · d_model`". Das stimmt nicht: bei dieser Breite ist
  die Blockzahl `12Ld² + 2Ld`, die Formel also der **Matrixanteil**, und die Norm-Gains
  fehlen zusätzlich. In sechs Textstellen (DE und EN) präzisiert.

## Was ich nicht gemacht habe

- **Das Lab steht auf keiner Lecture-Seite.** Keine Lecture-PDF lehrt A3s API; nach der
  bestehenden Regel gehört ein solches Lab zur Assignment-Seite, nicht in den Lecture-Pfad.
  Verlinkt ist es im Modul `scaling` und in A3s Missionen `budget-design` und
  `target-decision`.
- **Die zwölf Läufe und ihre drei Bedarfsverteilungen sind gesetzt, nicht gemessen.** A3
  nennt keine Laufzeiten. Exakt ist die Struktur, nicht der Wert — das sagt das Lab in
  seinem eigenen „Was dieser Modus nicht behauptet"-Abschnitt.
- **Die vier geprüften Konsistenzbedingungen sind nicht vollständig.** A3 schreibt „For
  example"; eine Anfrage, die hier durchgeht, kann die echte API trotzdem ablehnen. Die
  Gegenrichtung gilt.
- **Der `panel i18n`-Guard prüft nur Textknoten, keine Attribute.** `aria-label`,
  `placeholder` und `title` in Lab-Panels laufen durch `localizeElementAttributes` und sind
  hier nicht abgedeckt.

## Nächste Hebel

1. **Attribute in denselben Panels** (`aria-label`, `title`, `placeholder`) gegen dieselbe
   Eigenschaft halten. Der Guard steht, ihm fehlt nur die zweite Quelle.
2. **Die zehn bereits rendernden Guards gegen die Panel-Renderer-Kopplung halten** — offen
   seit v80, und dieser Durchgang hat gezeigt, dass selbst die Kopplung nicht reicht, wenn
   der Anker die entscheidende Zahl nicht zurückliest.
3. **Gruppierung vereinheitlichen** (offen seit v79). `fixedNum` gruppiert nicht, die sieben
   älteren sprachbewussten Helfer schon.
4. **Sechs unerreichbare Defaults** in den Lab-Helfern (offen seit v79).
5. **A3s Leaderboard hat noch keinen Weg von der gefitteten Kurve zur eingereichten
   Konfiguration.** Modus A prüft eine Konfiguration, `scaling-fit` fittet — dazwischen
   liegt A3s eigene Frage „welche Hyperparameter würdest du bei dieser Parameterzahl
   fahren", und die ist noch unbeantwortet.
