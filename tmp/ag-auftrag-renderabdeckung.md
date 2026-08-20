# Auftrag: Sieben Lab-Renderer headless prüfbar machen

## Repo und Zweig

Arbeite im Worktree `/Users/martin/Documents/Python Folder/CS336/.claude/worktrees/festive-kalam-e08d8c`
auf dem Branch `claude/deep-review-v78` (Kettenkopf, Stand `d096712`). Nicht pushen.
Alle Änderungen betreffen ausschließlich `index.html`.

## Warum

Sieben Labs der Lernplattform haben Guards in `scripts/check-i18n.mjs`, die ihre Rechenkerne
prüfen — aber nie ihr Rendering. Der Grund ist strukturell: die Funktionen, die das Markup
bauen, lesen die Regler selbst über `document.getElementById(...)` und sind deshalb ohne
Browser nicht aufrufbar.

Gemessen: von acht realistischen Renderfehlern in diesen Labs gehen **vier unbemerkt durch**,
obwohl `check-i18n` grün bleibt. Zwei davon wurden nachgemessen — sie verändern 48
beziehungsweise 192 angezeigte Zahlen. Ein Lernender bekäme also falsche Zahlen zu sehen,
ohne dass irgendetwas anschlägt.

**Dein Auftrag ist ausschließlich der mechanische Umbau, der das Rendering aufrufbar macht.**
Die inhaltlichen Guards schreibe ich anschließend selbst. Ändere also **kein Verhalten** und
**keine Zahl**.

## Das Muster

Führe pro Lab genau einen Lesehelfer ein. Ohne Argument liest er weiter aus dem DOM — dadurch
verhält sich die App exakt wie vorher. Mit Argument liest er aus einer übergebenen Belegung.

```js
// Alle Regler dieses Labs an einer Stelle lesen. Ohne Argument kommen die Werte wie bisher
// aus dem DOM; mit einer übergebenen Belegung ist der Renderer ohne Browser aufrufbar.
function offRead(values){return id=>values?values[id]:document.getElementById(id).value}
```

Danach nimmt jede Funktion, die Regler liest, einen optionalen Parameter `values` entgegen und
reicht ihn weiter.

### Vollständiges Beispiel: `offpolicy-clip` (dieses Lab ist bereits verifiziert)

Vorher:

```js
function offSelection(){
  return {
    drift:offFind(OFF_DRIFTS,document.getElementById("offDrift").value,1),
    seq:offFind(OFF_SEQS,document.getElementById("offSeq").value,1),
    epsilon:offFind(OFF_EPSILONS,document.getElementById("offEps").value,1)
  };
}
function offClipStage(){ ... offSelection() ... }
function offGspoStage(){ ... offSelection() ... }
function offStageMarkup(){return document.getElementById("offMode").value==="gspo"?offGspoStage():offClipStage()}
```

Nachher:

```js
function offRead(values){return id=>values?values[id]:document.getElementById(id).value}
function offSelection(values){
  const read=offRead(values);
  return {
    drift:offFind(OFF_DRIFTS,read("offDrift"),1),
    seq:offFind(OFF_SEQS,read("offSeq"),1),
    epsilon:offFind(OFF_EPSILONS,read("offEps"),1)
  };
}
function offClipStage(values){ ... offSelection(values) ... }
function offGspoStage(values){ ... offSelection(values) ... }
function offStageMarkup(values){const read=offRead(values);return read("offMode")==="gspo"?offGspoStage(values):offClipStage(values)}
```

`updateOffPolicyClip()` ruft `offStageMarkup()` weiterhin **ohne Argument** auf. Diese Zeile
wird nicht angefasst.

## Die sieben Labs, vollständig

Jede hier genannte Funktion liest Regler und braucht den Parameter. Die Regler-IDs stehen
dabei; ersetze in diesen Funktionen **jedes** `document.getElementById("X").value` durch
`read("X")`.

| Lab | Funktion | Regler-IDs |
|---|---|---|
| offpolicy-clip | `offSelection` | `offDrift`, `offSeq`, `offEps` |
| | `offStageMarkup` | `offMode` |
| | `offClipStage`, `offGspoStage` | (nur durchreichen) |
| advantage-normalizers | `advSelection` | `advConvention`, `advEps`, `advGroup`, `advLossNorm`, `advRef` |
| | `advStageMarkup` | `advMode` |
| | `advWeightStage`, `advVariantStage` | (nur durchreichen) |
| microbatch-denominator | `mbdSelection` | `mbdNorm`, `mbdRule`, `mbdSplit` |
| | `mbdStageMarkup` | `mbdMode` |
| | `mbdBaselineStage`, `mbdLedgerStage` | (nur durchreichen) |
| checkpoint-segments | `ckptSetup` | `ckptBlocks`, `ckptRatio` |
| | `ckptSegmentsStage` | `ckptSegment` (liest zusätzlich selbst) |
| | `ckptStageMarkup` | `ckptMode` |
| | `ckptNestingStage` | (nur durchreichen) |
| mixed-precision | `precAutocastStage` | `precCast`, `precScale` |
| | `precAccumulationStage` | `precCase`, `precScheme` |
| | `precStageMarkup` | `precMode` |
| winrate-lc | `winrateStageMarkup` | `winrateBound`, `winrateProfile`, `winrateVariant` |
| batch-windows | `batchStageMarkup` | `batchSetup`, `batchStart`, `batchTarget` |

Bei `mixed-precision`, `winrate-lc` und `batch-windows` gibt es keinen Selection-Helfer; dort
stehen die Lesezugriffe direkt in der Stage-Funktion. Das Muster ist dasselbe: Parameter
hinzufügen, `const read=xRead(values);` als erste Zeile, Lesezugriffe ersetzen.

Achtung `mbdReport`: diese Funktion ruft `mbdSelection()` auf. Gib ihr ebenfalls den Parameter
und reiche ihn durch. Prüfe für jedes Lab, ob es solche Zwischenfunktionen gibt — suche nach
Aufrufen von `xSelection()` und `xSetup()` und reiche `values` überall durch.

## Harte Bedingungen

1. **Kein Verhalten ändert sich.** Ohne Argument muss jede Funktion exakt dasselbe tun wie
   vorher. Der Fallback im Lesehelfer ist wörtlich `document.getElementById(id).value` —
   keine Umformulierung, kein `?.`, kein Default.
2. **Keine Zahl, kein Text, kein Markup ändert sich.** Es werden nur Signaturen und
   Lesezugriffe umgeschrieben.
3. **Keine `update*`-Funktion wird angefasst.** Sie rufen weiterhin ohne Argument auf.
4. **Keine neuen Abstraktionen** über das beschriebene Muster hinaus. Ein Lesehelfer pro Lab,
   sonst nichts. Keine gemeinsame Hilfsfunktion über Labs hinweg.
5. **Kommentare auf Deutsch**, im Stil der Datei: sie erklären das *Warum*, nicht das *Was*.
   Ein Kommentar pro Lesehelfer reicht.
6. **`scripts/check-i18n.mjs` nicht anfassen.** Wenn dort etwas bricht, ist der Umbau falsch.

## Abnahme — bitte selbst prüfen, bevor du abgibst

```bash
cd "/Users/martin/Documents/Python Folder/CS336/.claude/worktrees/festive-kalam-e08d8c"
node scripts/check-i18n.mjs
```

Muss grün durchlaufen und **21 `OK:`-Zeilen mit unveränderten Werten** ausgeben.

Zusätzlich müssen alle vier Aussagen zutreffen:

1. `grep -c 'function [a-z]*Read(values)' index.html` ergibt **7**.
2. In keiner der oben aufgelisteten Funktionen steht noch ein `document.getElementById`,
   außer im Fallback des jeweiligen Lesehelfers.
3. Die Zahl der `document.getElementById`-Vorkommen in `index.html` sinkt von **678** auf
   genau **656**. Rechnung: die 14 Funktionen der Tabelle enthalten zusammen 29 Lesezugriffe;
   29 verschwinden, 7 kommen als Fallback in den Lesehelfern zurück, macht −22.
4. Die Datei parst: das Inline-Script durch `node --check` schicken.

## Ausdrücklich nicht dein Auftrag

- Guards schreiben oder ändern.
- Zahlen, Texte, Reglerauswahl oder Lab-Inhalte anfassen.
- Andere Labs als die sieben genannten anfassen.
- Committen oder pushen.
