# Deep Review 2026-10-07 — Lecture 4, Folie 28: der Gradient, der die Überlastung misst

Branch `claude/deep-review-v135`, gebaut auf dem Kettenkopf v134 (`b0cab63`).
Zwei Commits: `526aa85` (v135, die neue Karte) und `5882a4d` (Copy-LaTeX-Fix).
Guard-Suite grün: 93 Blöcke, Exit 0.

---

## 0. Zuerst das Wichtigste: `main` enthält die Lecture-Arbeit seit v100 nicht

Der zugewiesene Worktree stand auf **v99 plus einem fremden Commit** (`dce0496`,
*Sync reading position across signed-in devices*, aus dem Codex-Worktree
`reading-position-release`). Dieser Zweig hat **47 Commits verloren** — die ganze Kette
v100 bis v134, rund 360 KB Inhalt in `index.html` und 238 KB in `i18n-en.js`.

Und `origin/main` steht auf **genau diesem Zweig**. Die Ahnenprüfung über alle
Branch-Spitzen, vor und nach dem Lauf:

- `b0cab63` (v134) ist **nicht** Vorfahre von `dce0496`.
- Nach dem Lauf ist jede Branch-Spitze des Repos Vorfahre von HEAD — **außer** `dce0496`,
  `origin` und `origin/main`, die alle derselbe Commit sind.

Das ist kein verlorener Zweig dieses Laufs, sondern ein offener Rest für dich:
**die veröffentlichte Version kennt die Arbeit der Versionen 100 bis 135 nicht.**
Beide Seiten sind inhaltlich echt — `dce0496` bringt die geräteübergreifende Leseposition,
die Kette bringt 36 Versionen Lecture-Inhalt. Sie müssen zusammengeführt werden; der
Merge-Base ist v99 (`2ed21e7`). Das habe ich **nicht** getan, weil es eine
Produktentscheidung über zwei parallele Arbeitslinien ist und niemand zum Rückfragen da war.

Haupt-Checkout unberührt: HEAD unverändert bei `1461c41`, alle mtimes unverändert
(er trägt eigene uncommittete Änderungen). Kein aktiver Codex während des Laufs.

---

## 1. Der Befund: eine qualitative Aussage ohne ihre Zahl

Fortsetzung des folienweisen Abgleichs. Erledigt waren die Lectures 3, 5 und 7; ich habe
**Lecture 4 (MoEs, 47 Folien)** genommen. Abgedeckt war viel: MoE-Ausgabe (Folien 13–19),
Expert Capacity, der Balance-Loss als Formel (28), Router z-loss (36), die Per-Expert-Biases
von DeepSeek v3 (30), Upcycling (38–40).

**Die Lücke lag auf Folie 28 — nicht in der Formel, sondern in ihrer Ableitung.**

Folie 28 ist die **einzige Stelle der ganzen Lecture, die ableitet**. Sie schreibt

    ∂L/∂p_i(x) = (α·N/T²) · Σ_x 1[argmax p(x) = i]

hin, mit dem Kommentar *„more frequent use = stronger downweighting"*. Im Markup kam weder
diese Ableitung noch `Folie 28` noch eine der Zahlen ein einziges Mal vor. Das Lab
`moe-routing` sagte dazu nur qualitativ, der Balance-Loss verwende „harte
Dispatchhäufigkeit plus differenzierbare Routerwahrscheinlichkeit".

### Warum das keine Kosmetik ist

Der Loss ist `α·E·Σ_i f_i·P_i` — ein **Skalarprodukt**, und damit strukturell
**symmetrisch in f und P**. Vertauscht man die beiden Vektoren, kommt derselbe Wert heraus;
das vorhandene Beispiel von `moe-balance` liefert vertauscht wieder 0,55.

Die Behauptung *„f ist die harte Häufigkeit, P die differenzierbare Wahrscheinlichkeit"*
ist am Loss also **prinzipiell nicht prüfbar** — nicht wegen schlecht gewählter Zahlen,
sondern weil kein Beispiel dieses Losses die beiden Hälften je unterscheiden kann.
Erst der Gradient trennt sie.

---

## 2. Die neue Formelkarte `moe-balance-gradient`

DE/EN, Antwortschlüssel, Quelle `l04`. Kuratiert von Lecture 4 (4. Formel, nach dem Loss,
den sie ableitet), verlinkt am Ende der geordneten Liste von `moe-routing-capacity`.

    g_i = ∂L_bal/∂p_i(x) = α·E·c_i/T²      ∂L_bal/∂z_j = p_j·(g_j − ḡ)      α ≤ L_bal ≤ α·E

Bei T = 10, E = 4, α = 0,01, c = [5; 3; 1; 1] und P = [0,40; 0,35; 0,20; 0,05]:

| Größe | Wert |
|---|---|
| L_bal | 0,0132 (Boden α = 0,01, Decke α·E = 0,04 → 1,32-Faches des Bodens) |
| g | [0,002; 0,0012; 0,0004; 0,0004] |
| ḡ | 0,00132 — und das ist genau L_bal/T |
| ∂L_bal/∂z | [+0,000272; −0,000042; −0,000184; −0,000046], Summe exakt 0 |

### Fünf Pointen

1. **Der Gradient hängt gar nicht von p ab.** L_bal ist in p linear, also ist
   `∂L/∂p_i(x)` eine Konstante: Jeder Token drückt Expert i gleich stark, unabhängig davon,
   wie sicher der Router gerade ist. Und diese Konstante ist genau die Tokenzahl:
   g_1/g_3 = 5 wie 5 zu 1 Tokens. Das ist Folie 28s Kommentar als Zahl.

2. **Die Blindstelle wird aufgehoben.** Über P_i folgen die Verhältnisse den Tokenzahlen (5),
   über f_i würden sie den Wahrscheinlichkeiten folgen (2). Das Beispiel ist so gewählt, dass
   f_i und P_i in **keinem** Slot zusammenfallen — sonst wäre der Gegenvergleich dort
   textgleich mit dem Original und der Tausch unsichtbar.

3. **Der Maßstab ist nicht der Schnitt.** Auf den Logits zählt `p_j·(g_j − ḡ)`, und ḡ ist das
   wahrscheinlichkeitsgewichtete Mittel, nicht T/E. Expert 2 liegt mit 3 Tokens **über** dem
   Schnitt 2,5 und wird **trotzdem hochgezogen**, weil 0,0012 unter 0,00132 liegt.
   „Über dem Schnitt, also wird heruntergedrückt" ist falsch.

4. **Der Boden ist ein stationärer Punkt.** Das Lab sagte bisher, der Loss sei bei
   gleichmäßigem Routing nicht null, sein Gradient könne trotzdem Balance fördern. Gerechnet
   ist es schärfer: Bei perfekter Balance ist L_bal = α **exakt** (Cauchy-Schwarz im
   gekoppelten Fall f = P) und der Logit-Gradient **exakt null** in allen Koordinaten.
   Der Wert über null ist kein Mangel, sondern das Minimum.

5. **Der Loss kann einen kollabierten Experten nicht zurückholen.** Für c_i = 0 ist g_i = 0:
   direkt belohnt der Balance-Loss einen ungenutzten Experten **nie**, er drückt nur die
   anderen. Gehoben wird er allein über die Softmax-Kopplung mit `−p_j·ḡ`, also proportional
   zu der Wahrscheinlichkeit, die er schon hat — und für p_j → 0 verschwindet die Hebung.
   Im Beispiel haben die Experten 3 und 4 **dieselbe** Tokenzahl und damit dasselbe g, werden
   aber um den Faktor 4 verschieden stark gehoben, genau im Verhältnis 0,20/0,05 ihrer
   heutigen Wahrscheinlichkeiten.

   Das ist die gerechnete Begründung dafür, warum DeepSeek v3 auf Folie 30 zusätzlich einen
   gelernten Bias je Expert braucht — der Bogen von Folie 28 über 30 zu 31
   („What happens when removing load balancing losses?").

Der Selbstcheck erzeugt Zahlen, die im Beispiel nicht stehen: (a) T = 20 mit vier mal 5 Tokens
→ L_bal = 0,01 = α, g_i = 0,0005, Logit-Gradient null; (b) T = 10 mit c = [6; 4; 0; 0]
→ L_bal = 0,0168, ḡ = 0,00168, Hebungen −0,000252 gegen −0,000084, Verhältnis 3 wie 0,15 zu 0,05.

---

## 3. Guard `card balance gradient` — 252 Prüfungen

44 Modellzusicherungen **vor dem ersten gelesenen Zeichen** der Karte, darunter:

- die p-Unabhängigkeit **bewiesen** durch Variieren von P, nicht behauptet;
- `ḡ = L_bal/T` und die Nullsumme der Logit-Gradienten über vier zusätzliche Fälle, weil beide
  an einem einzigen Beispiel zufällig gelten könnten;
- die Decke über einen deterministischen **4.000-Fälle-Sweep**;
- der Boden als stationärer Punkt **in beiden Richtungen**: exakt null bei perfekter Balance
  **und** messbar nicht null daneben — sonst sagt „stationär am Boden" nichts;
- die Notwendigkeit der Einschränkung „nur für f = P" selbst geprüft: ohne Kopplung muss der
  Boden tatsächlich unterschritten werden, sonst wäre der Hedge unnötig und gehört entfernt;
- die Blindstelle **konstruktiv**: der Guard vertauscht f und P, zeigt den Loss unbewegt und
  den Gradienten von 5 auf 2 springen, und **liest das 0,55 aus `moe-balance` heraus**
  statt es abzuschreiben.

### Mutationstest: 331 Mutationen, 0 entkommen, 0 unerklärt inert

323 Fänge nachweislich aus dem neuen Block (Schlankfassung 0,25 s statt 80 s). 7
Kontrollmutationen in den bewusst nicht gebundenen Feldern (`read`, `intuition`, `dims`,
`aliases`, `title`) blieben grün; Kontrolle vor und nach jedem Durchgang grün. Eine Mutation
(l04 aus `sources` entfernen) fängt ein **älterer** Block — deshalb habe ich die eigene
Klausel auf die *andere* Richtung geschärft (eine zusätzliche, nicht belegte Quelle) und sie
dadurch beweisbar scharf gestellt.

**Der erste Durchgang deckte 42 Entkommene auf. Alle sechs Klassen sind geschlossen:**

1. **Ein Token, das auf einer nackten Ziffer endet, passt auch auf eine längere Zahl.**
   `= 0` passte auf `= 0,0005` — damit entkam genau die Mutation, die den stationären Punkt
   aufhob. Jedes solche Token trägt jetzt die folgenden Wörter, und eine eigene Fixture
   beweist die Reparatur.
2. **Eine Teilstring-Prüfung auf ein Wort passt auf seine eigene Negation.** `symmetrisch`
   steckt in **`unsymmetrisch`** — die Prüfung ließ die exakte Umkehrung der tragenden Aussage
   durch. Jetzt mit Wortgrenze plus namentlicher Abweisung der Negationen.
3. **`0,55` steht in `moe-balance` zweimal** (einmal als Summe, einmal in `0,01·2·0,55`), eine
   bloße `includes`-Prüfung lässt also jede der beiden Mutationen durch. Beide Fundstellen sind
   mit eigenem Trägersatz verankert, und ihre Anzahl ist festgenagelt.
4. **Prosa benennt Rollen per Index, und Indizes sind Behauptungen.** `Nur Expert 1`,
   `auch Expert 2`, `die Experten 3 und 4` — alle entkamen. Die Indizes werden jetzt aus dem
   Modell abgeleitet, und der Guard verlangt, dass die vier Rollen auf **vier verschiedene**
   Experten fallen; fielen zwei zusammen, bewiese das Benennen nichts.
5. **Ein Fallstrick mit drei Punkten gehört als geordnete Liste geprüft, nicht als Menge.**
   Eine Menge sieht weder einen umbenannten Experten noch zwei zwischen ihren Hälften
   vertauschte Verhältnisse.
6. **`expr` war ungebunden** — das Feld, das der Leser als *die* Formel sieht.

### Kein Browsertest (geplanter Lauf)

Ersatz: die Karte durch die app-eigenen Renderer (`formulaAccordion` über
`activateCourseLanguage`) headless gerendert, beide Sprachen. Alle **29 gerechneten Zahlen
erreichen den Leser**, Markup in zehn Tagpaaren balanciert, kein `undefined`/`NaN`/
uninterpoliertes Template, die vier Schritte der Lernsequenz in Reihenfolge, die geschlossene
Karte zeigt keine Gleichung, und das Beispiel steht vor der allgemeinen Regel.

---

## 4. Nebenbefund, als eigener Commit behoben: `Copy LaTeX` war kaputt

`f.latex` ist das **einzige Kartenfeld, das die App als Text verlässt**: `copyText(f.latex)`
legt es unverändert in die Zwischenablage, der Leser fügt es in ein eigenes Dokument ein.

Im Dateiquelltext wird ein LaTeX-Befehl `\\frac` geschrieben (ein Backslash im JS-String).
Zwei Karten schrieben `\\\\frac`, die Zwischenablage bekam also `\\frac` — und in LaTeX ist
`\\` ein **Zeilenumbruch** und kein Escape. Eingefügt ergab das einen Umbruch und danach das
nackte Wort `frac`:

- `decode-intensity-heads` (v133): 8 Stellen
- `zero-stage-ceiling` (v134): 3 Stellen

86 Karten folgten der Konvention, zwei nicht, und nichts erzwang sie — **dieselbe Klasse wie
das ungeschützte `expr` aus v133**. Beide Felder korrigiert; alle 91 Felder beider Sprachen
liefern jetzt gültiges LaTeX.

Neuer Guard `copy latex` (97 Prüfungen). Die Regel ist bewusst **nicht** „kein `\\\\` vor
einem Buchstaben": in einer Matrix ist `\\` genau der Zeilenumbruch, und `rope` trägt ihn zu
Recht in `q'_{2k-1}\\q'_{2k}`. Ein doppelter Backslash ist deshalb nur dort ein Defekt, wo
keine Umgebung einen Umbruch annehmen könnte — so bleibt `rope` gültig, **ohne als
namentliche Ausnahme geführt zu werden**. Der Guard prüft zusätzlich, dass der Kopierpfad
selbst noch existiert, sonst wacht er über toten Daten. Vier Fixtures beweisen ihn sehend,
darunter die Gegenprobe, dass der legitime Matrixumbruch *nicht* gemeldet wird.

Eine erste Zusatzklausel („eine Karte ohne LaTeX-Befehl ist kein LaTeX") scheiterte an
`advantage` mit `A(x,y)=R(x,y)-b(x)` — gültiges LaTeX, das keinen Befehl braucht. Dort war die
**Zusicherung falsch und nicht die Karte**: der Fall wird jetzt gezählt und namentlich geführt.

---

## 5. Stand und offener Rest

- Folienweise abgeglichen: Lectures **3, 4, 5, 7**. Offen: **9, 11, 15, 16**.
- Bestand: 88 Formeln, 75 Konzepte, 72 Symbole, 70 Glossarbegriffe, 64 Labs.
  Service Worker und Sprachbundle auf **v112**.
- Guard-Suite: **93 Blöcke**, Exit 0, ~80 s.
- **Für dich zu entscheiden:** die Zusammenführung von `origin/main` (`dce0496`,
  Leseposition-Sync) mit der Inhaltskette (jetzt `claude/deep-review-v135`). Merge-Base v99.
  Solange das nicht passiert, zeigt die veröffentlichte App den Stand von v99.
