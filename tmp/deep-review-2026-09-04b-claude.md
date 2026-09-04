# Deep Review v97/v98 — 2026-09-04 — die letzten offenen Hebel, bis auf einen

Fortsetzung von [v96](deep-review-2026-09-04-claude.md). Auftrag: die englischen
Dezimalpunkte in deutscher Prosa bleiben stehen, alles andere aus der Hebelliste schließen.
Drei von vier sind geschlossen; der vierte ist gemessen und begründet offen geblieben.

## v97 — `lm-objective` bekommt sein Lab (offen seit v85)

Die Konzeptseite nennt als ersten Fallstrick, Input und Target nicht zu verschieben — „das
Modell lernt dann, das sichtbare aktuelle Token zu kopieren" — und nennt keine Zahl dazu.
**Die Zahl ist der Punkt, denn sie ist null.**

### Modus A — welche Paarung der Loss bevorzugt

Gerechnet wird der kleinstmögliche Trainingsloss der vier Paarungen, die beim Schreiben von
`get_batch` entstehen können, also die empirische bedingte Entropie. Ein größeres Modell kann
sie nicht unterbieten, die Rangfolge hängt damit nicht an der Architektur.

| Regel | Loss | eindeutige Kontexte | greedy erzeugt |
| --- | --- | --- | --- |
| **nicht verschoben · Target = x[t]** | **0,000000** | 4/4 | 0, 0, 0, 0, 0, 0, 0, 0 |
| korrekt · Target = x[t+1] | 0,440664 | 1/4 | 1, 2, 3, 1, 2, 3, 1, 2 |
| rückwärts · Target = x[t−1] | 0,466802 | 1/4 | 2, 1, 0, 2, 1, 0, 2, 1 |
| um zwei · Target = x[t+2] | 0,752039 | 0/4 | — |

Die Regel mit dem besten Loss ist die, die nichts lernt: ohne Verschiebung ist das Target eine
Kopie des Kontexts, die Abbildung also eine Funktion, die ausgezählte Verteilung One-Hot und
der Loss **exakt** null — in allen drei Texten und bei jeder Modellgröße. Was gelernt wurde,
steht in der Generierungsspalte: greedy dasselbe Token endlos, Wiederholungsquote 100 %.

**Eine Behauptung hat die Messung nicht überlebt.** Der erste Entwurf des Kurzchecks fragte,
welche der drei falschen Regeln sich am Loss am besten versteckt, und antwortete „die
Rückwärtsverschiebung". Der Sweep sagte nein:

| Text | dichteste falsche Regel | Abstand zur korrekten |
| --- | --- | --- |
| vierzehn Tokens | rückwärts | 0,026138 |
| ein Token dominiert | rückwärts | 0,101429 |
| **Doppelungen im Text** | **um zwei verschoben** | **0,001330** |

Die Frage steht jetzt auf der Aussage, die hält — *welche* Regel sich versteckt, ist eine
Eigenschaft des Textes, nicht der Regel —, und der Guard hält die Zuordnung je Korpus fest.
Was überall gilt, hält er auch: die nicht verschobene Regel ist immer die **entfernteste** von
der korrekten und trotzdem die mit dem besten Loss.

### Modus B — die Indexgrenze, die A1 nicht ausschreibt

`get_batch` gibt `x[i:i+m]` und `x[i+1:i+m+1]` zurück. Das Target reicht bis `x[i+m]`, also
gilt `i + m ≤ n − 1`. Die naive Grenze `i ≤ n − m` lässt **genau einen** Startindex mehr durch
— immer genau einen, über 44.730 geprüfte (n, m) beidseitig brute-force belegt.

Und deshalb ist der Fehler so unangenehm: die Trefferwahrscheinlichkeit sinkt mit
1/(n − m + 1), also **wird er seltener, je größer der Datensatz ist**.

| Shard | naive Startindizes | p(Treffer) | 1.000 Batches verfehlen |
| --- | --- | --- | --- |
| n = 1.000, m = 256 | 745 | 0,134228 % | 26,1013 % |
| n = 10.000, m = 256 | 9.745 | 0,010262 % | **90,2468 %** |
| n = 100.000, m = 256 | 99.745 | 0,001003 % | **99,0024 %** |

## v98 — `a4:mask_pii` bekommt sein Lab (offen seit v94)

A4 prüft die drei Masker gegen den **maskierten String**, nicht gegen ein Urteil „gefunden
ja/nein". Daraus folgen zwei Dinge, für die keine Zahl in der App stand.

**Die Spanne ist die Größe, nicht der Fund.** Das lockere Muster `\S+@\S+` findet alle drei
Adressen und besteht keinen einzigen Test — es nimmt das folgende Satzzeichen mit, also liegt
seine Spanne neben der markierten:

| Muster | Treffer | richtig/falsch/übersehen | Precision | Recall |
| --- | --- | --- | --- | --- |
| lokal@domain.tld | 3 | 3/0/0 | 100,0000 % | 100,0000 % |
| alles um ein @ | 3 | 1/2/2 | 33,3333 % | 33,3333 % |

Dieselbe Adresse steht dabei gleichzeitig unter „falsch maskiert" und unter „übersehen". Der
Guard prüft genau das: zu jedem übersehenen Eintrag muss ein Fehlalarm existieren, der ihn
überschießt — sonst wäre der Fehler nicht die Spanne.

**Die naheliegende Reparatur kann den zweiten Fehlalarm nicht entfernen.** Die Bereichsprüfung
0–255 hebt die IP-Precision von 66,6667 % auf 80,0000 % bei unverändertem Recall von
100,0000 %. Sie streicht `999.999.999.999`, das als IP nicht existieren kann, und lässt
`1.2.3.4` stehen — **weil das eine syntaktisch völlig gültige IP-Adresse ist**. Dass sie hier
eine Versionsnummer bezeichnet, entscheidet der Kontext und kein Muster. Der Guard belegt das,
indem er die Versionsnummer selbst gegen das Bereichsmuster testet.

### Modus B — was die Maskierung kostet

| Einstellung | Instanzen | netto Zeichen | zerstörter legitimer Text |
| --- | --- | --- | --- |
| überall eng | 12 | **+41** (7,7505 %) | 19 |
| überall locker | **10** | +29 (5,4820 %) | **34** |
| enge Adressen, naive IPs | 13 | +42 (7,9395 %) | 34 |

Zwei Zahlen, die niemand erwartet: der Korpus **wächst** beim Schwärzen, weil der Platzhalter
länger ist als fast jeder Treffer; und die Einstellung mit den **wenigsten** Instanzen ist
nicht die schonendste. Dazu der Zählfallstrick: A4 gibt `(maskierter Text, Anzahl)` zurück,
und wer die Anzahl im Ergebnis zählt statt in der Eingabe, bekommt **0 statt 12**.

### Eine Gegenprobe ohne Befund

Der erste Entwurf für Modus B war die Reihenfolgeabhängigkeit der drei Masker. Gemessen über
alle sechs Reihenfolgen und alle drei Einstellungen: **die Gesamtzahl ändert sich nicht**, weil
kein Platzhalter von einem anderen Muster getroffen wird. Ein Modus über die Reihenfolge wäre
eine Behauptung ohne Inhalt gewesen. Die Idempotenz steht jetzt trotzdem im Guard, damit sie
eine Eigenschaft bleibt und kein Zufall.

## Der vierte Hebel: `cache version`

Vier Stellen nennen die Cacheversion — der Shell-Cachename, zwei `?v=`-Querys und ein
README-Satz —, und nichts hielt sie zusammen. Der README-Satz lief zweimal eine Version
hinterher. Harmlos; ein veraltetes `?v=` ist es nicht, denn dann serviert der Browser die
Übersetzungen von gestern gegen das Markup von heute. Neuer Block: alle vier müssen dieselbe
Zahl tragen, und die Zahl darf nicht unter die höchste in `activity.md` protokollierte fallen.

## Zwei Guard-Reparaturen, beide vom Mutationstest erzwungen

1. **`chain-carry` und `causal-invariance` schnitten zu weit.** Beide lasen ihren Codeblock von
   ihrem eigenen Header bis zu einem fest verdrahteten `ablation-controls` — und deckten damit
   still jedes Lab ab, das dazwischen geschrieben wurde, inzwischen drei. Das fiel erst auf, als
   ein neues Lab eine Tausendergruppe in deutscher Prosa schrieb und dafür ein Guard brach, der
   nichts damit zu tun hat. Beide schneiden jetzt bis zum nächsten Lab-Header.
2. **Antwortschlüssel wurden nur auf einer Seite geprüft.** Der Guard verlangte, dass der
   Checker die Schlüssel kennt — nicht, dass das Panel sie anbietet. Ein umbenanntes
   `value`-Attribut machte die Frage unbeantwortbar, ohne irgendetwas zu brechen. Jetzt beide
   Seiten je Select, in beiden neuen Labs.

## Ein Befund über den eigenen Sweep

Der erste Grenzen-Sweep lief `n` in Siebenerschritten und besuchte damit ausschließlich die
Restklasse 6 mod 7. Eine gepaarte Mutation, die die Grenze genau bei `n % 7 === 3` brach, lief
grün durch. **Ein Sweep, dessen Schrittweite einen Faktor mit der geprüften Eigenschaft teilt,
deckt eine Restklasse ab und nennt es einen Bereich.** Schrittweite 1 hat keinen; mit ihr wird
dieselbe Mutation bei n = 24 gefangen, und eine zweite mit Modulus 11 bei n = 27.

## Prüfung

- **Guard-Suite 47 → 50 Blöcke grün**, Build grün, Cache-Bump auf v79, README auf 61 Labs.
- Neu: `target shift` (44.730 Checks), `mask pii` (106 Checks), `cache version`.
- `render coverage` 14 → **16 Labs** (10.327 Zustände), `lab render sweep` 51 → **53 von 61**.
- **Alle sechs Selbststudium-Konzepte** haben jetzt das Lab, das sie durchrechnet.
- **Alle 124 Handout-Probleme** haben jetzt für ihr entscheidendes Konzept ein rechnendes Lab.
- Mutationstests: v97 **15 Mutationen, 13 gefangen** (beide Entkommenen behandelt), v98
  **11 Mutationen, 11 gefangen, 0 entkommen**; Kontrolle in beiden Läufen grün.
- **Kein Browsertest** — in geplanten Läufen gesperrt ([[cs336-unattended-no-preview]]).

## Was offen bleibt, und warum

1. **Die 70 englischen Dezimalpunkte in deutscher Prosa** — auf ausdrücklichen Wunsch stehen
   gelassen. Die Begründung steht in [[cs336-german-decimal-sweep]].
2. **`render coverage` erreicht 16 von 61 Labs.** Gemessen, was das noch bedeutet: die übrigen
   45 lesen ihre Regler selbst aus dem DOM. `lab render sweep` fährt davon **53 von 61** durch
   die echten `labMarkup`/`initLab` gegen einen DOM-Stub, in beiden Sprachen, und die
   restlichen 8 sind namentlich als Labs ohne rechnende Bühne ausgenommen — **strukturell ist
   also jedes Lab abgedeckt**. Was den 45 fehlt, ist allein die Anker-Eigenschaft: die tragende
   Zahl aus dem echten Markup zurückzulesen. Die 45 dafür umzubauen ist ein mechanischer
   Eingriff in App-Code mit echtem Regressionsrisiko und wiederholt, was der Sweep strukturell
   schon zeigt. Der lohnendere Zuschnitt wäre, Anker **nachträglich** in die Labs zu setzen,
   deren Behauptungen an einer einzelnen Zahl hängen, statt alle 45 umzustellen.
