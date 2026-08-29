# Deep Review v87 — 2026-08-29

## Der Kettenkopf war diesmal nicht der Kettenkopf

Der zugewiesene Worktree stand auf `4067294` (Antigravitys Begriffslisten, abgezweigt
von v85). **v86 war darin nicht enthalten** — `git merge-base --is-ancestor 231073c HEAD`
sagte nein. Zwei Äste über v85 (`1561712`): der Begriffslisten-Ast und v86. Sauber
gemergt (`ort`, keine Konflikte in der 2,3-MB-Datei), Guard-Suite danach grün — der
textuell saubere Merge war auch semantisch sauber. Ohne diesen Schritt wäre der
Grundlagencheck aus v86 in dieser Kette verschwunden. Wieder [[cs336-parallel-codex-edits]].

Keine fremde Session aktiv: die mtimes von `index.html`/`i18n-en.js` waren die
Checkout-Zeit des Worktrees (07:10), nicht ein fremder Edit.

## Wo ich gesucht habe, bevor ich etwas gefunden habe

Die Frage des Auftrags: *reicht der Lernpfad statt der Vorlesungen, und trägt er bis
zu den Assignments?* Die naheliegenden Kennzahlen habe ich gerechnet, und sie haben
nichts gefunden — was ein Ergebnis ist:

| geprüft | Befund |
| --- | --- |
| Handout-Probleme ohne Mission | **0 von 124** |
| Missionen ohne Lab | **0 von 29** |
| Labs, die nirgends verlinkt sind | **0 von 57** |
| Concepts, die nirgends verlinkt sind | **0 von 75** |
| Concepts ohne Selbstcheck / mit Länge ≠ Antworten | **0** |

Der Inhaltslayer trägt also. Wieder [[cs336-metric-is-a-suspicion]]: die offensichtliche
Kennzahl war ein Verdacht, kein Befund. Der Befund lag eine Ebene tiefer — nicht darin,
*ob* der Stoff da ist, sondern ob er hängen bleibt.

## Der Befund: die Abrufkarten zeigten zuletzt, was du nicht konntest

Die Abrufkarten sind das einzige Feature, das die Frage „was muss ich nochmal ansehen?"
beantwortet. Sie beantworteten die Umkehrung.

```js
priority(record){if(!this.attempted(record))return 0;return record.lastResult==="again"?1:...}
```

Eine **unbewertete** Karte bekam 0, jede **bewertete** 1, 2 oder 3. Damit schob *jede*
Bewertung — „Noch nicht" eingeschlossen — eine Karte hinter alle 237 anderen. Gemessen
an den echten Funktionen aus `index.html`, nicht an einer Nachbildung:

| | vorher | jetzt |
| --- | --- | --- |
| Rang einer gerade verfehlten Karte | **238 von 238** | **1 von 238** |
| Rückkehr dieser Karte | **Sitzung 24** | **Sitzung 2** |
| Rang nach „Schwer" | 238 von 238 | 1 von 238 |

238 Karten zu zehn je Sitzung sind 24 Sitzungen. Die drei Knöpfe „Noch nicht / Schwer /
Gewusst" änderten also **24 Sitzungen lang nichts, was der Lesende beobachten konnte** —
sie unterschieden sich nur untereinander, und das wurde erst wirksam, als das Deck einmal
durch war. Wer am ersten Tag eine Karte nicht konnte, sah sie am vierundzwanzigsten wieder.

Dazu beschrieb das Deck selbst die Behandlung, die es nicht gab: „Eine Sitzung wählt
höchstens zehn Karten und **priorisiert neue sowie zuletzt mit ‚Noch nicht' bewertete
Karten**." Priorisiert wurde ausschließlich das Neue.

Für das erklärte Ziel — *denselben Wissensstand erreichen wie mit vollem Kursbesuch* —
ist das die teuerste Sorte Fehler: Der Stoff ist vorhanden, die Selbsteinschätzung wird
erhoben, und dann wird genau die Information weggeworfen, für die sie erhoben wurde.

## Was jetzt da ist

Zwei Eigenschaften müssen **gleichzeitig** gelten, weshalb ein bloßes Umsortieren nicht
reicht:

1. Was verfehlt wurde, kommt in der **nächsten** Sitzung zurück.
2. Neuer Stoff bleibt nie dahinter stehen.

Reihenfolge: **„Noch nicht" → „Schwer" → nie gesehen → „Gewusst"**. Dazu reserviert eine
Sitzung **fünf ihrer zehn Plätze für nie gesehene Karten**; den Rest nimmt der Rückstand,
und die Reservierung entfällt, sobald nichts mehr ungesehen ist. Welche Seite ausgeht,
die andere füllt auf — keine Sitzung ist je kürzer als zehn Karten.

Gemessen über 30 simulierte Sitzungen an den echten Funktionen:

* Ein Lesender, der **jede einzelne Karte** mit „Noch nicht" bewertet, trifft trotzdem in
  **jeder** Sitzung 5 neue und hat nach 30 Sitzungen 155 der 238 Karten gesehen. Kein
  Stillstand — das ist die Eigenschaft, die eine naive „Rückstand zuerst"-Regel verliert.
* Jede dritte Karte verfehlt: Rückkehr in Sitzung 2, mindestens 6 neue je Sitzung.
* Deck durchgearbeitet, 20 offen: die Sitzung besteht aus 10 offenen, **nicht** aus 5
  offenen plus 5 bereits gewussten — die Reservierung gilt Ungesehenem, nicht Bekanntem.

Kein Kalender, keine Fälligkeit, kein Termin — die Auswahl bleibt reiner Pull nach
Priorität ([[cs336-no-deadline-learning]]).

Der Abschlussdialog sagt jetzt, was passiert, statt nur „die Bewertungen sortieren
spätere Karten":

> Die 4 Karten, die du nicht parat hattest, stehen in deiner nächsten Sitzung vorn.

und nach einem sauberen Durchgang:

> Es blieb nichts offen, deine nächste Sitzung besteht also aus neuen Karten.

Die Deckbeschreibung nennt jetzt die echte Regel inklusive der Hälfte-Reservierung, in
beiden Sprachen. Gespeicherte Bewertungen aus der Zeit davor tragen dieselben drei Felder
und lesen sich unverändert weiter — es migriert nichts.

## Nebenbefund

`README.md` warb mit **48 interaktiven Labs**, die App führt **57** — eine Zahl, die
schlicht stehen geblieben war (in [[cs336-audit-status]] als beobachtet, nicht angefasst
vermerkt). Korrigiert, und die ganze Aufzählung wird jetzt aus den Daten zurückgelesen,
damit die Titelseite nicht wieder eine andere App beschreibt als die ausgelieferte.

## Prüfung

* **Guard-Suite 33 → 35 Blöcke, grün**, Laufzeit ~42 s.
* Neuer Block **`review order`**: lädt `REVIEW_POLICY`, `buildReviewCards`,
  `prioritizedReviewCards` und `reviewStats` per `sliceDeclaration` aus `index.html` —
  die echten Funktionen, keine nachgetippte Kopie.
  * Reihenfolge an drei gesetzten Karten: `again → hard → new → … → good`.
  * **Die Zahl der ersetzten Fassung wird nachgerechnet, nicht erinnert**: der Block baut
    die alte `priority` nach und prüft, dass sie eine verfehlte Karte auf Rang 238 von 238
    legt. Stimmt das nicht mehr, schlägt der Block fehl, statt eine veraltete Behauptung
    weiterzutragen.
  * Drei Bewertungsgewohnheiten über je 30 Sitzungen (alles „Noch nicht", jede dritte,
    alles „Gewusst"), dazu: keine Sitzung kürzer als zehn, keine Karte doppelt in einer
    Sitzung, Rückkehr in Sitzung 2, nie unter 5 ungesehenen je Sitzung.
  * Reservierung entfällt am durchgearbeiteten Deck (20 offene füllen alle 10 Plätze).
  * Ein **vor v87 gespeicherter Datensatz** sortiert weiter nach vorn und zählt weiter in
    der Deckstatistik.
  * **Vier Abschlusspanels headless gerendert** (zwei Formen × zwei Sprachen): Tag-Balance,
    kein `undefined`/`NaN`, kein uninterpolierter Platzhalter, und die zurückkehrende
    Anzahl steht wirklich auf dem Schirm — 3 „Noch nicht" + 1 „Schwer" drucken **4**, ein
    sauberer Durchgang druckt keine. Das schließt [[cs336-mutation-test-blind-spots]]:
    geprüft ist das Gedruckte, nicht nur das Berechnete.
* Neuer Block **`readme counts`**: jede Zahl im Werbesatz gegen die Daten.
* **Mutationstest: 10 echte Mutationen, 10 gefangen**, plus eine Kontrolle, die grün
  bleiben musste und blieb (geänderter Kommentar). Keine entkommene, keine inerte.

| Mutation | gefangen |
| --- | --- |
| alte Priorität (neu vor verfehlt) | ✓ |
| `backlog` zählt auch „Gewusst" | ✓ |
| Reservierung nimmt die ganze Sitzung | ✓ |
| gar keine Reservierung für Neues | ✓ |
| „Noch nicht" und „Schwer" vertauscht | ✓ |
| Sitzung läuft über zehn Karten hinaus | ✓ |
| `unseen` zählt alle Nicht-Rückstandskarten | ✓ |
| Abschlusspanel zählt nur „Noch nicht" statt beider | ✓ |
| „Gewusst" nach ganz vorn | ✓ |
| README-Zahl zurückgedreht | ✓ |
| *Kontrolle: nur Kommentar geändert* | *grün geblieben* |

## Offen

Unverändert aus v86: `lm-objective` ohne Lab, Render-Fähigkeit der übrigen 45 Labs,
Attribut-i18n, uneinheitliche Tausendergruppierung, sechs unerreichbare Defaults.
