# Deep Review v88 — 2026-08-30

Kettenkopf beim Start war **nicht** der zugewiesene Worktree: dieser stand auf `4067294`
(Antigravitys Begriffslisten), der Kopf auf `15192b8` (v87) in `dreamy-wiles-e73735`.
`git merge-base --is-ancestor` sagte, dass v87 den Ast bereits enthält, also war es ein
sauberer Fast-Forward statt eines Merges. Keine fremde Session aktiv: `index.html` und
`i18n-en.js` waren zuletzt am 28.08. um 15:35 angefasst, der Lauf begann am 30.08. um 07:10.
Wieder [[cs336-parallel-codex-edits]].

## Wo ich gesucht habe, bevor ich etwas gefunden habe

v86 hat die Frage „folgt der Lernpfad wirklich den Vorlesungen?" für die **neun
Trace-Lectures** beantwortet, indem es ihr `main()` als Inhaltsverzeichnis las. Für die
**acht Foliendecks** (L03, L04, L05, L07, L09, L11, L15, L16) gab es keine solche
unabhängige Ableitung. Also habe ich sie gebaut: pro Seite die Zeile mit der größten
Schriftgröße als Folientitel, 467 Titel, 429 nach Deduplizierung, jeder Inhaltswort für
Inhaltswort gegen den App-Korpus geprüft.

Das Ergebnis ist wieder [[cs336-metric-is-a-suspicion]] — und diesmal zweimal
hintereinander:

* **7 Titel ohne ein einziges Inhaltswort in der App**: `CerebrasGPT`, `Safety-tuning`,
  `Logistics`, `Llama3 405B`, `Gemma 2`, `Hestness II`, `Interesting phenomena (?)` —
  Papernamen, Modellnamen und Organisatorisches, kein Stoff.
* Der stärkste Kandidat sah kurz nach einem echten Loch aus: **`muP` hatte 0 Treffer**,
  obwohl **27 der 55 Folien von Lecture 11** es nennen — die halbe Vorlesung. Das war ein
  Fehler meiner Suche, nicht der App: die App schreibt **μP** mit dem griechischen Buchstaben
  (71 Treffer), führt es als Lernziel von L11, hat die Formel `mup-transfer` und das Lab
  `scaling-transfer`. Nachgeprüft, bevor irgendetwas gebaut wurde.

Die Foliendecks tragen also. Der Befund lag anderswo — nicht darin, *ob* der Stoff da ist,
sondern ob er beim Lesenden ankommt.

## Der Befund: elf Labs öffneten „Lösungsidee anzeigen" auf eine leere Seite

Jedes der 57 Labs endet mit einer Transferfrage und einem aufklappbaren „Lösungsidee
anzeigen". Das ist die Stelle, an der aus einem Experiment eine verstandene Lösung wird.

Die Antwort hat zwei Wohnorte: die Map `LAB_TRANSFER_ANSWERS` und ein `transferAnswer:`
direkt am Lab. Zusammengeführt wurden sie so:

```js
LABS.forEach(item=>{ item.transferAnswer=LAB_TRANSFER_ANSWERS[item.id]; });
```

Das führt die beiden Wohnorte nicht zusammen — es **löscht einen davon**. Für jedes Lab,
das die Map nicht nennt, steht danach `undefined`, und `esc(undefined)` ist der leere
String. Betroffen sind genau die elf Labs, die ihre Antwort inline führen:

| Lab | verlorene Zeichen | seit |
| --- | --- | --- |
| `chain-carry` | 1476 | v84 |
| `run-budget-ledger` | 1417 | v81 |
| `decay-horizon` | 1220 | v78 |
| `pipeline-yield` | 1218 | v77 |
| `stability-edge` | 1178 | v76 |
| `run-plan` | 1136 | v83 |
| `target-config` | 1124 | v82 |
| `position-signal` | 1071 | v74 |
| `ablation-controls` | 859 | v73 |
| `resume-contract` | 837 | v72 |
| `causal-invariance` | 666 | v85 |

**12.202 Zeichen, elf Labs, sechzehn Versionen lang.** Das sind nicht irgendwelche elf:
es sind exakt die Labs, die die letzten zehn Deep-Review-Läufe gebaut haben, weil sie die
schwerste Assignment-Argumentation tragen — die vollständige A3-Kette
(`run-budget-ledger` → `run-plan` → `target-config` → `chain-carry`), A1s vier Ablationen,
der Decay-Horizont, die Stabilitätskante und der Kausalitätstest. Wer eines davon öffnete,
las die Frage, dachte nach, klickte auf „Lösungsidee anzeigen" — und bekam:

```html
<details class="answer-disclosure"><summary>Lösungsidee anzeigen</summary><p></p></details>
```

**Und es war deutschsprachig-exklusiv.** Der englische Overlay setzt `transferAnswer` aus
`i18n-en.js` neu — dort liegen alle elf Antworten vollständig, 812 bis 1352 Zeichen. Der
englische Leser sah also alles, der deutsche nichts, und beim Zurückschalten verschwand es
wieder: `GERMAN_I18N_DATA` wird **nach** dem Löschen aufgenommen, und `JSON.parse(JSON.stringify(…))`
wirft `undefined`-Felder ganz weg.

## Warum sechzehn Versionen Prüfungen das nicht gesehen haben

Der Prüfer trug seine **eigene, nachgetippte Kopie** derselben Zeile:

```js
base.labs.forEach(item => { item.transferAnswer = labAnswers[item.id]; });
```

Er reproduzierte den Defekt also, statt ihn aufzudecken. Alle bestehenden Blöcke, die
`lab.transferAnswer` lesen (`decode-sampling`, `winrate-lc`, `mixed-precision`,
`checkpoint-segments`, `shard-ledger`), lasen den gelöschten Wert — und schlugen nur nicht
fehl, weil keiner der elf betroffenen Labs eine solche Zusicherung hatte. Genau das ist
[[cs336-guard-verification-lessons]] in Reinform: eine Prüfung muss lesen, was die App
wirklich tut. Die Kopie steht jetzt nicht mehr da; der Prüfer holt sich die **echte
Anweisung aus `index.html`** und führt sie aus.

## Was jetzt da ist

Ein Wort in der App:

```js
LABS.forEach(item=>{ if(item.transferAnswer===undefined) item.transferAnswer=LAB_TRANSFER_ANSWERS[item.id]; });
```

Die Map darf **auffüllen, nie überschreiben**. Alle 46 Map-Antworten stehen unverändert,
die elf inline geführten kommen zurück. Nichts migriert, nichts wird verschoben, kein
Datensatz ändert sich.

## Prüfung

* **Guard-Suite 35 → 36 Blöcke, grün**, Laufzeit ~45 s.
* Neuer Block **`lab transfer answers`**:
  * führt die **echte Merge-Anweisung aus `index.html`** aus (dieselbe Zeile, die die App
    ausführt), nicht eine nachgetippte Fassung — und benutzt sie auch als den einen Merge
    des ganzen Prüfers;
  * rendert alle 57 Antworten durch das **echte `answerDisclosure`** der App und prüft den
    **gedruckten Absatz**, nicht das berechnete Feld: nicht leer, kein `undefined`, nicht
    unter 80 Zeichen — in **beiden Sprachen**, 114 Disclosures ([[cs336-mutation-test-blind-spots]]:
    geprüft ist das Gedruckte);
  * verlangt, dass `renderLabDetail` das Feld weiterhin durch `answerDisclosure` druckt,
    und dass `I18N_FIELDS.labs` `transferAnswer` weiterhin führt — sonst bekäme der
    englische Leser den deutschen Text;
  * verlangt **einen Wohnort je Lab**: kein Lab darf inline *und* in der Map stehen, und die
    Map darf kein Lab nennen, das es nicht gibt;
  * **rechnet die Zahl der ersetzten Fassung nach, statt sie zu erinnern**: der Block baut
    die alte unbedingte Zuweisung nach und prüft, dass sie genau die inline geführten Labs
    löscht. Bleibt kein Lab mehr inline, schlägt er fehl statt eine leere Behauptung
    weiterzutragen.
* **Mutationstest: 10 echte Mutationen, 10 gefangen**, Kontrolle grün geblieben.

| Mutation | gefangen |
| --- | --- |
| alte unbedingte Zuweisung zurück | ✓ (`resume-contract` … leerer Absatz) |
| Map füllt nur, wo schon inline steht | ✓ |
| eine Inline-Antwort gelöscht (`chain-carry`) | ✓ |
| eine Inline-Antwort auf 5 Zeichen gekürzt | ✓ |
| `I18N_FIELDS.labs` ohne `transferAnswer` | ✓ |
| eine englische Antwort fehlt | ✓ |
| Map dupliziert ein inline geführtes Lab | ✓ |
| Map nennt ein Lab, das es nicht gibt | ✓ |
| Lab-Seite druckt das Feld nicht mehr | ✓ |
| `esc` macht aus fehlend nicht mehr leer | ✓ |
| *Kontrolle: nur ein Kommentar geändert* | *grün geblieben* |

Kein Cache-Bump nötig: `index.html` wird vom Service Worker network-first ausgeliefert, und
`i18n-en.js` ist unverändert — die README-Angabe „Version 74" bleibt korrekt.

## Offen

Der Browsertest bleibt in geplanten Läufen strukturell nicht durchführbar
([[cs336-unattended-no-preview]]); ersetzt ist er hier durch das headless gerenderte
Disclosure-Markup in beiden Sprachen. Unverändert aus v87: `lm-objective` ohne Lab,
Render-Fähigkeit der übrigen 45 Labs, Attribut-i18n, uneinheitliche Tausendergruppierung,
sechs unerreichbare Defaults. Neu notiert: die drei übrigen Merge-Stellen
(`FORMULA_ANSWERS`, `ASSIGNMENT_CHECK_ANSWERS`, `GLOSSARY_DETAILS`) sind heute vollständig
(79/79, 5/5, 70/70) und daher unauffällig — sie tragen aber dasselbe Muster und wären beim
ersten inline geführten Eintrag genauso betroffen.
