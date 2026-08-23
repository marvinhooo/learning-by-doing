# Deep Review 2026-08-23 — der Schritt von der Kurve zur Konfiguration, und ein Guard, der endlich hinsieht (v82)

Basis `9889a45` (v81). Der v81-Report schloss mit fünf offenen Hebeln; vier betrafen Werkzeug,
der fünfte den Lernpfad: **„A3s Leaderboard hat noch keinen Weg von der gefitteten Kurve zur
eingereichten Konfiguration."** Dieser Durchgang ist diesen Weg gegangen — und der Guard, den er
dafür brauchte, hat nebenbei fünf untersetzte deutsche Textstellen in bereits ausgelieferten
Labs gefunden.

## Der Befund: A3s letzte Frage war unbeantwortet

A3 §3.3 endet wörtlich mit: „If you were to train a model with your predicted optimal number of
parameters, what hyperparameters would you use? To estimate the number of non-embedding
parameters for a given model hyperparameter configuration, use 12 n_layer d_model^2."

Die App hatte beide Enden und nicht die Mitte. `scaling-fit` fittet `N_opt ∝ C^a`,
`run-budget-ledger` (v81) prüft eine **fertige** Anfrage. Dazwischen liegt der Schritt, auf dem
A3s 50 Punkte stehen: aus einer stetigen Zahl eine diskrete, absendbare Konfiguration machen.
Die Gegenprobe in HEAD:

| gesucht | Treffer |
| --- | --- |
| `Aspektverhältnis`, `aspect ratio`, `d_model / n_layer`, `Seitenverhältnis` | je 0 |
| irgendeine Umkehrung von `12 · n_layer · d_model²` | 0 |

Die A3-Mission `target-decision` verlangt wörtlich „Übersetze die stetige Fitprognose in gültige
diskrete Hyperparameter" — und nichts in der App zeigte, wie das geht oder was dabei schiefgeht.

## Das Lab: `target-config`

**Modus A — dein N ist eine Zahl, dein Modell sind zwei.** `N = 12 · L · d²` ist eine Gleichung
mit zwei Unbekannten. Erst eine gewählte Form `rho = d/L` macht sie lösbar:
`d = (rho·N/12)^(1/3)`, `L = d/rho`. Danach sind beide Zahlen diskret — `L` ganzzahlig, `d` ein
Vielfaches von `head_dim` — und es entstehen vier Rundungsecken. Drei Ergebnisse, alle gemessen:

- **Keine der vier Ecken trifft N_pred.** Über die 18 einstellbaren Kombinationen liegt die
  nächstgelegene zwischen **0,16 % und 2,93 %** daneben, die schlechteste bei **24,90 %**. Das
  Raster ist grob, weil N mit `d²` wächst.
- **Es gibt keine Rundungsregel.** Sicher ist nur die Richtung (beide ab → immer zu tief, beide
  auf → immer zu hoch, 18/18). Welche Ecke gewinnt, ist damit nicht entschieden: in **elf von
  achtzehn** ist es eine gemischte, in **sieben** eine reine. Man rechnet alle vier aus.
- **`head_dim` kommt in A3s Formel nicht vor und entscheidet trotzdem mit.** Es setzt die
  Schrittweite der Breitenachse; der Wechsel von 64 auf 128 verändert die erreichbare Menge in
  **9 von 9** Ziel/Form-Paaren. Und die Kopfzahl, die dabei herausfällt, entscheidet die
  Attention: `num_key_value_heads` muss die Kopfzahl teilen, also sind die zulässigen
  Grouped-Query-Aufteilungen exakt deren Teiler. In **4 von 18** Kombinationen ist die Kopfzahl
  **prim** — dort gibt es GQA schlicht nicht.

**Modus B — was die Rundung mit den 48 Stunden macht.** Zuerst die Brücke, die A3 nicht
mitliefert: das Budget steht in Wall-Clock-Stunden, `C = 6ND` rechnet in FLOPs. Die Umrechnung
misst man aus dem eigenen abgeschlossenen Lauf (`used_runtime_seconds`, `total_train_tokens`, N).
Dann die eigentliche Rechnung, bei N_pred = 850.000.000:

| eingereichtes N | gegenüber N_pred | D aus N_pred behalten | D neu gerechnet |
| --- | --- | --- | --- |
| 855.638.016 | +0,66 % | 48,3182 h | 47,9999 h |
| 805.306.368 | −5,26 % | 45,4760 h · 2,5 h verschenkt | 47,9999 h |
| 909.950.976 | **+7,05 %** | **51,3853 h · abgeschnitten** | 47,9998 h |

Die Lektion ist die Spaltendifferenz: **ein stehengelassenes D trägt die N-Abweichung eins zu
eins in die Laufzeit**, und ein Wall-Clock-Budget quittiert das nicht mit einer höheren Rechnung,
sondern mit einem abgebrochenen Lauf ohne finalen Validation Loss. Ein neu gerechnetes D landet
dagegen unabhängig von Durchsatz und Wahl auf den 48 Stunden. Der Fehler kennt den Durchsatz
nicht: dieselbe Zeile steht bei 3·10^14, 5·10^14 und 8·10^14 FLOP/s auf **48,3184 / 48,3182 /
48,3183** — gleich bis auf die Tokenrundung. Ein besser gemessener Durchsatz repariert ihn nicht.

**Und die Asymmetrie, auf der das Lab steht.** Zwei Zahlen werden gerundet, und sie sind völlig
ungleich:

- `total_train_tokens` muss durch `512 · train_batch_size` teilbar sein. Das ist die Bedingung,
  die A3 §3.2 nennt und für die die API **ablehnt** — und sie kostet unter **3,24 Millionstel**
  des Laufs.
- N prüft die API **nie**. `12 · n_layer · d_model²` ist die eigene Buchhaltung — und diese
  ungeprüfte Zahl kostet bis zu **7,05 %**, also gut das Zwanzigtausendfache.

Die Rundung, für die man einen Fehler bekommt, ist die harmlose.

## Der neue Guard `english render` — und seine fünf Funde

Beim Übersetzen fiel auf, dass `renderer i18n` (v80) nur `tr("…")` als **ganzes Argument** findet.
Ein `tr(over ? "…" : "…")` lief daran vorbei. Mein eigenes Lab hatte genau diese Form — zwei
komplett deutsche Absätze des Budget-Verdikts, und alle 26 Guards blieben grün.

Zwei Konsequenzen gezogen:

1. **`renderer i18n` liest jetzt das ganze Argument.** Literale in Wertposition (das Argument
   selbst oder ein Zweig hinter `?`/`:`) zählen; Vergleichsoperanden und Literale in
   verschachtelten Aufrufen (`tr(x.split(" · ")[0])`) nicht. Template-Literal-Argumente bleiben
   ausgenommen — deren `${…}` brauchen einen Parser, keinen Scanner.
2. **Neuer Guard `english render`.** Quelltext zu lesen reicht prinzipiell nicht: ein
   `tr(entry.note)` trägt gar kein Literal. Also wird gerendert — **4.261 Zustände über 9 Labs**,
   durch den **echten** Übersetzer, und übrig bleibendes Deutsch schlägt fehl. Er prüft zusätzlich
   auf uninterpoliertes `${…}`, also genau den Fehler, an dem ich hängengeblieben war.

Gefunden wurden damit **fünf** untersetzte Stellen — zwei meine, **drei aus v81**:

| Lab | Stelle | Wie es durchkam |
| --- | --- | --- |
| target-config | Budget-Verdikt, beide Zweige | `tr(cond?"…":"…")` |
| run-budget-ledger | Annahme-/Ablehnungs-Callout, beide Zweige | `tr(cond?"…":"…")` |
| run-budget-ledger | „alles inklusive Embeddings" (Tabellenkopf) | verschachtelte Ternäre |
| run-budget-ledger | zwei der vier Constraint-Regeln | ging als `esc(check.rule)` **ganz ohne `tr()`** in den DOM |

Die letzte Zeile ist die unangenehmste: ein englischer Leser sah in A3s Constraint-Tabelle
„num_attention_heads teilbar durch num_key_value_heads" — also genau in der Tabelle, die erklärt,
warum die API ablehnt. Alle fünf sind übersetzt, `check.rule` geht jetzt durch `tr()`.

## Verifikation

- **27 Guard-Blöcke grün** (25 → 27), keine bestehende Zahl bewegt. Laufzeit 9,8 s → 14,6 s.
- **Mutationstest 16/16 gefangen, 0 escaped.** Ein erster Durchgang meldete `ledger N_final` als
  entkommen: die Ledgerzeile ließ sich auf N_pred festnageln, weil die Abweichung daneben
  weiterhin wanderte — der Render bewegte sich also, nur mit der falschen Zahl. Zwei Anker lesen
  die Zahl jetzt zurück. Der neue `english render`-Guard wurde separat mutationsgetestet.
- **Eine inerte Mutation identifiziert statt als Fund gezählt:** `widthUp: width > shape.width`
  gegen `>=` ist auf den echten Daten ununterscheidbar — die stetige Breite landet in **0 von 18**
  Zuständen exakt auf dem Raster. Wirkungslos, nicht entkommen.
- **Beide Sprachen headless über alle 648 Zustände des Labs gerendert**, 0 deutsche Fragmente in
  EN. Zahlformat sprachrichtig: DE `16.941.121.536` / `1,070527` / `203,1 Minuten`,
  EN `16,941,121,536` / `1.070527` / `203.1 minutes`.
- **Render coverage 3.613 → 4.261 Zustände über 9 Labs**, 4.413 Prüfungen; das neue Lab hat alle
  vier Eigenschaften von Tag eins.
- `node --check` auf Inline-Script, `i18n-en.js` und `check-i18n.mjs`; **561 DOM-IDs, 0 Duplikate**.

## Eine eigene Behauptung, die falsch war

Vor dem Einbau gefangen, weil gerechnet statt überlegt: Ich hatte geschrieben, die nächstgelegene
Ecke sei „in jeder Kombination eine, in der genau eine Zahl aufgerundet ist". Das stimmt in
**11 von 18**; in den übrigen sieben gewinnt eine reine Ecke. Der Text sagt jetzt, was gilt — die
Richtung ist sicher, die Wahl nicht — und der Guard hält die 11 fest.

## Was ich nicht gemacht habe

- **Das Lab steht auf keiner Lecture-Seite.** Keine Lecture-PDF lehrt A3s API-Constraints; nach
  der bestehenden Regel gehört es zur Assignment-Seite. Verlinkt im Modul `scaling` und in A3s
  Missionen `target-decision` und `budget-design`.
- **Welche Form die beste ist, entscheidet das Lab nicht.** N und C sind über alle drei Formen
  gleich; das müsste man messen, und genau dafür ist ein Teil der 12 Stunden da.
- **Die drei Durchsatzwerte und die drei N_pred sind gesetzt, nicht gemessen.** A3 nennt keine.
  Exakt ist die Struktur, nicht der Wert — das Lab sagt das in beiden Modi selbst.
- **`english render` deckt nur die 9 Labs ab, die ohne DOM rendern können.** Die übrigen 45
  Panels hält weiterhin nur `panel i18n`, und der prüft Textknoten, keine Attribute.

## Nächste Hebel

1. **Die restlichen Labs render-fähig machen**, damit `english render` sie erreicht. Er hat bei
   9 Labs fünf Stellen gefunden; die anderen sind ungeprüft.
2. **Attribute in denselben Panels** (`aria-label`, `title`, `placeholder`) — offen seit v81.
3. **Gruppierung vereinheitlichen** (offen seit v79): `fixedNum` gruppiert nicht, die sieben
   älteren sprachbewussten Helfer schon.
4. **Sechs unerreichbare Defaults** in den Lab-Helfern (offen seit v79).
5. **Der Weg von `scaling-fit` zu `target-config` ist noch keine Kette.** Der Fit gibt ein N aus,
   das Lab nimmt eines an — ein durchgehender Lauf von der IsoFLOPs-Leiter über den Fit bis zur
   abgeschickten Konfiguration wäre A3 in einem Stück.
