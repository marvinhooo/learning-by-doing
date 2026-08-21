# Deep Review 2026-08-21 — Hebel 1 geschlossen, und er hat zwei echte Fehler ausgespuckt (v80)

Basis `fc4c559` (v79 plus AG-Auftrag). Der v79-Report schloss mit drei offenen Hebeln und
nannte den ersten ausdrücklich als „in diesem Durchgang nicht erledigt": die sieben Labs,
deren Guards nie rendern. Der letzte Durchgang hatte dafür einen Auftrag an Antigravity
geschrieben; AG hat ihn nicht ausgeführt (Worktree sauber, kein Commit). Dieser Durchgang
macht die Arbeit selbst — und der neue Guard hat beim ersten Lauf sofort zwei echte
Fehler gefunden, die niemand gesucht hatte.

## Der Umbau: 29 Lesezugriffe, kein Verhalten

Jede Stage-Funktion der sieben Labs nimmt jetzt eine optionale Reglerbelegung entgegen,
gelesen über einen Helfer pro Lab:

```js
function offRead(values){return id=>values?values[id]:document.getElementById(id).value}
```

Ohne Argument liest er weiter aus dem DOM. **Alle 21 bestehenden Guard-Blöcke laufen mit
unveränderten Werten** — das ist der Beweis, dass der Umbau ein No-op ist. Der einzige
Unterschied im gesamten Prüflauf gegenüber HEAD ist die Zahl der UI-Strings
(3430 → 3434), also genau die vier Übersetzungen, die unten dazukamen.

29 Lesezugriffe und 19 interne Aufrufe, mechanisch umgeschrieben mit einer Zusicherung je
Funktion: die Zahl der `document.`-Vorkommen musste exakt der Zahl der Reglerlesungen
entsprechen, sonst bricht das Skript ab. Ein bestehender Guard musste mitwandern
(`mbdBaselineStage\(\)` → `\(values\)`); das ist die einzige Stelle, an der ein alter
Guard angefasst wurde.

## Der neue Guard: was der Render eigentlich zusichert

`render coverage` fährt **1813 Zustände über sieben Labs** und hält vier Eigenschaften.
Die interessante ist die zweite:

> Der Render ist eine Funktion des Modus **und genau der Regler, die dieser Modus zeigt** —
> nicht mehr und nicht weniger.

Das ist die Verbindung zwischen Panel und Renderer, und sie fällt in beide Richtungen:

- Ein Renderer, der die **falsche Regler-ID** liest, zeigt sich als Regler, der in einen
  Modus leckt, dessen Panel ihn versteckt.
- Ein Renderer, der **seinen eigenen** Regler ignoriert, zeigt sich als toter Regler.

Gemessen, nicht behauptet: die Aufteilung stimmt heute exakt mit den Panel-Gruppen
überein, die `updateX()` ein- und ausblendet — `offDriftFields` enthält genau `offDrift`,
`advVariantFields` genau `advGroup`/`advLossNorm`/`advEps`, und so weiter für alle sieben.
Der Guard prüft diese Mengengleichheit selbst, statt sie als Tabelle zu glauben.

Die anderen drei: jeder Zustand rendert überhaupt (die Sandbox hat **gar kein `document`**,
also fliegt eine Funktion, die die Belegung nicht durchreicht, sofort auf); NaN erreicht
den Schirm in genau den Zuständen, deren Nenner null ist; und die Zahl, auf der die
Behauptung jedes Labs ruht, wird aus dem Markup zurückgelesen.

### Eine Kleinigkeit, die den NaN-Test erst scharf machte

Ein pauschales `/NaN/` auf dem Markup schlug bei `mixed-precision` an — aber dort steht
das Wort in der Prosa: „es erscheint **kein NaN** in der Ausgabe". Der Ausweg war, den
Render ein zweites Mal mit `localizedUi = () => ""` zu fahren. Damit fällt jede übersetzte
Prosa weg und übrig bleibt genau das, was das Lab gerechnet hat. Sauber getrennt:
40 Zustände mit NaN als **Wert** (advantage-normalizers), 20 mit NaN nur als **Wort**
(mixed-precision), 0 sonst.

## Fund 1: eine Prozentzahl, die die Lektion umdrehte

`advantage-normalizers` kann den Schutzterm im Nenner abschalten (`advantage_eps = 0`).
Auf einer Gruppe ohne Streuung ist das 0/0, und das Lab ist genau dafür gebaut — der
Abschlusshinweis erklärt es sogar ausführlich. In derselben Zeile stand aber:

```
A = NaN · NaN · NaN · NaN · NaN · NaN · NaN · NaN
ohne Gradient: 0,0 %
```

`advPrunedShare` zählt `value === 0`, und `NaN === 0` ist falsch. Die Zeile behauptete
also **„kein einziger Rollout ist ohne Gradient"** in dem einen Zustand, in dem der Lauf
zerstört ist. Dieselbe Gruppe **mit** Schutzterm druckt korrekt `100,0 %`. Der Regler, der
zeigen soll, wofür `advantage_eps` existiert, drehte die Zahl also von 100 % auf 0 % —
in die falsche Richtung.

**40 von 200 Variant-Zuständen** waren betroffen. Eine NaN-Zeile sagt jetzt
`Gradient undefiniert · 0/0` statt einer Quote; die endliche Gruppe druckt weiter ihre
Prozentzahl. Beide Richtungen sind geguardet, die Rückkehr der alten Zeichenkette
ausdrücklich verboten.

## Fund 2: der Hilfetext, den ein englischer Leser auf Deutsch bekam

Beim Prüfen der neuen deutschen Zeichenkette fiel auf, dass eine **fehlende Übersetzung
in einem Lab-Renderer überhaupt nicht anschlägt**. Der i18n-Guard prüft den deklarativen
Inhalt — Concepts, Formeln, Labs, Missions —, aber nie die Strings, die die Renderer durch
`tr()` schicken. Und das sind die meisten.

Nachgezählt: von **1422** solchen Strings hatten sieben keinen englischen Eintrag. Vier
davon sind im Englischen dasselbe Wort (`Position`, `Gain`, `in FP32`,
`Connected Components`). Die anderen drei sind der **„Noch nicht."-Hinweis** der
Kurzchecks von `stability-edge`, `pipeline-yield` und `decay-horizon` — also genau der
Text, den man liest, wenn man die Frage falsch beantwortet hat und nicht weiterkommt.
Durch den eigenen Übersetzer der App gejagt kamen sie **unverändert deutsch** heraus.

Alle drei sind übersetzt. Dabei zwei Details, die aus v79 kommen und hier wieder greifen:
die zitierten Spaltennamen benutzen die **englischen** Überschriften, die die App wirklich
druckt (`of which α_min`, `Budget against T_c = N`, `η_opt as a fraction of η_div`,
`Measurement design`), und die genannte Zahl steht als `1.000000` statt `1,000000`. Ein
Hinweis, der auf eine Zeichenkette zeigt, die so nicht auf dem Schirm steht, schickt den
Lernenden ins Leere — das war der Kern von v79.

Der neue Guard `renderer i18n` hält das fest, samt einer Ausnahmeliste, die in beide
Richtungen geprüft wird: ein Begriff darauf muss vom Renderer noch benutzt werden **und**
darf keinen englischen Eintrag haben.

## Verifikation

- `check-i18n` grün, **alle 21 bestehenden Guard-Blöcke mit unveränderten Werten**; die
  einzige Abweichung gegenüber HEAD ist die Zahl der UI-Strings (3430 → 3434).
- **Mutationstest Renderabdeckung: 14 realistische Renderfehler, 14 gefangen, 0 escaped,
  0 inert.** Jede Mutation bewegt zwischen 36 und 924 gerenderte Zustände, keine ist also
  wirkungslos.
- **Dieselben Fehler gegen HEAD gemessen: 9 von 11 vergleichbaren escaped.** Das ist das
  Vorher/Nachher, nicht eine Schätzung. Gefangen wurden vor diesem Durchgang nur zwei, und
  beide durch alte Template-Textprüfungen, nicht durch einen Render.
- **Mutationstest renderer i18n: 5/5 gefangen**, darunter „ein Renderer bekommt einen neuen
  deutschen String, den niemand übersetzt hat".
- Der Fix in beiden Sprachen headless gerendert: DE `A = NaN · … Gradient undefiniert · 0/0`,
  EN `A = NaN · … gradient undefined · 0/0`; mit Schutzterm `ohne Gradient: 100,0 %` bzw.
  `no gradient: 100.0 %`; die endliche Gruppe unverändert bei `0,0 %` / `0.0 %`.
- `node --check` auf Inline-Script, `i18n-en.js` und `check-i18n.mjs`; **547 DOM-IDs,
  0 Duplikate**.
- Laufzeit `check-i18n` 4,0 s → 7,6 s. Das ist der Preis für 1813 zusätzliche Renders.

## Was ich nicht gemacht habe

- **Die Zustandsabdeckung ist nicht überall vollständig ehrlich.** Die DOM-Gegenprobe
  (Renderer ohne Argument gegen Renderer mit Belegung) läuft nur auf den Ankerzuständen,
  nicht auf allen 1813. Das reicht, weil eine vergessene Durchreichung schon im
  Hauptdurchlauf fliegt — die Sandbox hat kein `document` —, aber es ist eine Stichprobe
  und keine Vollprüfung.
- **`advPrunedShare` heißt weiter „Anteil mit Advantage exakt null"** und zählt NaN nicht
  mit. Das ist Absicht: die Bedeutung des Rechenkerns bleibt sauber, und die Entscheidung,
  was eine NaN-Zeile anzeigt, liegt im Renderer.

## Nächste Hebel

1. **Gruppierung vereinheitlichen** (offen seit v79). `fixedNum` gruppiert nicht, die
   sieben älteren sprachbewussten Helfer schon. Betrifft nur Werte mit Tausenderteil,
   verschiebt aber den englischen Render und braucht angepasste Guard-Erwartungen.
2. **Sechs unerreichbare Defaults** in den Lab-Helfern (`digits===undefined?6:digits`,
   obwohl keine Aufrufstelle die Stellenzahl weglässt). Offen seit v79.
3. **`sliceDeclaration` findet `const NAME={` nicht**, nur `const NAME =` mit Leerzeichen.
   Mir hier bei `CORE_UI_TRANSLATIONS` aufgefallen. Heute schadet es nichts, weil kein
   Guard so eine Konstante braucht — aber der nächste, der es versucht, bekommt eine
   verwirrende Fehlermeldung statt eines Treffers.
4. **Die zehn bereits rendernden Guards gegen dieselben vier Eigenschaften halten.** Sie
   rendern, aber keiner von ihnen prüft die Panel-Renderer-Kopplung, die hier zwei der
   drei schärfsten Mutationen gefangen hat.
