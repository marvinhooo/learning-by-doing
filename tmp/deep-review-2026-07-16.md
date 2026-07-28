# Deep Review 2026-07-16 (geplanter Claude-Run, ~07:10)

Kontext: Codex' letzte Edits waren ~9,5 h alt (15.07., 21:37), keine aktive Session erkennbar.
Der große Stand (4.048 Insertions auf Basis 5c99f36) ist weiterhin **uncommitted und nicht deployed**.
Konvention wie am 15.07.: keine konkurrierenden Edits an App-Dateien; dieser Report ist der Output.

## Gesamturteil

Der Stand ist nochmals deutlich besser als am 15.07. Lecture 14 ist jetzt vollständig integriert
(17/17 Lectures), das Abruf-Deck wird automatisch aus allen Selbstchecks und Formeln erzeugt,
und drei der fünf Empfehlungen vom Vortag sind umgesetzt. **Ein Befund ist aber prioritär:
Das neue Abruftraining ist termingesteuert gebaut („heute fällig") und widerspricht damit der
explizit dokumentierten Nutzerentscheidung vom 15.07.**

## Verifiziert in diesem Run (mit Beleg)

1. `node --check` auf dem extrahierten Inline-Script und auf `i18n-en.js`: sauber.
2. `node scripts/check-i18n.mjs` grün: 64 Concepts, 70 Formeln, 71 Symbole, 70 Glossar,
   20 Labs, 29 Missions, 1.142 UI-Strings.
3. Browser-Smoke-Test ohne Konsolenfehler (Dashboard, Abruftraining-View, Lab-Detail).
4. **Bloom-Filter-Lab nachgerechnet und korrekt**: P(0)=(1−1/100)^70=0,4948; Belegung 50,5 %;
   FPR=0,839 % (exakt) bzw. 0,819 % (e-Näherung); k*=(100/10)·ln2=6,93→7. Das objektive
   Transfer-Gate reagiert korrekt: erst nach drei richtigen Auswahlen erscheint
   „✓ Bloom contract understood".
5. **Empfehlungen vom 15.07. umgesetzt:**
   - #2 Modul-00-Abdeckung: Quiz hat jetzt 19 Fragen inkl. view-nach-transpose,
     Parameter-Registrierung in Python-Listen, zero_grad/Gradient-Akkumulation.
   - #3 Diagnose-Slugs: lesbare Labels gemappt (`python:"Python Engineering"`, …).
   - #4 A3-Kennzeichnung: Jede Mission zeigt den `Original-Handout-Scope` als eigenes Feld.
   - #1 teilweise: Deck wird aus allen Selbstchecks + verknüpften Formeln der erklärten
     Concepts generiert (statt 13+15 statischer Karten) — **aber die Mechanik ist
     kalendergesteuert statt pull-basiert, siehe Hauptbefund.**

## Hauptbefund (hohe Priorität): Abruftraining verletzt die Kein-Termindruck-Vorgabe

Martin hat am 15.07. explizit abgelehnt, dass Wiederholung über Fälligkeit läuft
(„ich will meine eigene Zeit nehmen und nutzen" — keine „Heute fällig"-Kacheln, keine
Tagespflichten). Der aktuelle Stand baut genau das:

- Dashboard-Kachel: „0 reviews due today".
- Abruftraining-Panel: „X heute fällig · Y freigeschaltet"; Sitzung = „höchstens zehn fällige Karten".
- Bewertungsbuttons mit Terminzusage: „Noch nicht · 10 min", „Schwer · 1 Tag", „Gewusst · N Tage".
- Abschlussmodal: „Der nächste Zeitpunkt ist geplant."
- **Härtester Punkt: Wenn nichts „fällig" ist, kann man gar nicht üben.** Der Button wird zu
  „Abrufstatus anzeigen" und das Modal sagt „Heute ist nichts fällig … Der nächste Abruf
  erscheint automatisch zum geplanten Zeitpunkt." Freiwilliges Üben ist blockiert —
  das Gegenteil von pull-basiert. (Beide Sprachen betroffen: „due today", „scheduled time".)

**Vorgeschlagenes Redesign (erhält alle fachlichen Stärken, entfernt nur den Kalender):**

1. Abrufsitzung ist **immer startbar**, sobald mindestens ein Concept erklärt ist.
2. Kartenauswahl nach **Priorität statt Datum**: nie abgerufen → zuletzt „Noch nicht" →
   am längsten kein erfolgreicher Abruf. Die bestehenden Zeitstempel bleiben gespeichert,
   werden aber nur zum Sortieren genutzt, nie als Fälligkeit angezeigt.
3. Buttons ohne Terminzusage: „Noch nicht / Schwer / Gewusst" (die Intervall-Anhänge
   „· 1 Tag" etc. streichen).
4. Statt „X heute fällig": neutrale Bestandsanzeige, z. B.
   „12 Karten nie abgerufen · 3 zuletzt nicht gewusst · 41 sicher".
5. **Stufe 4 („Zeitversetzt sicher") bleibt wie spezifiziert**: Sie verlangt weiterhin einen
   erfolgreichen Abruf mit genügend Zeitabstand und wird durch späteres „Noch nicht" entzogen.
   Der Zeitabstand ist Qualitätskriterium der Evidenz — keine Terminpflicht. Wer früh übt,
   verliert nichts; die Karte zählt für Stufe 4 einfach erst, wenn der Abstand groß genug war.
6. Dashboard-Kachel ersetzen durch Bestand/Fortschritt (z. B. „x/y Concepts zeitversetzt
   belegt"), kein „due today".

Caveat: Falls Martin das termingesteuerte Design in einer Codex-Session inzwischen bewusst
angenommen hat, entfällt der Befund — die dokumentierte Entscheidung vom 15.07. sagt das
Gegenteil, deshalb steht er hier an erster Stelle.

## Befund 2 (mittel): Coverage Map erfüllt den eigenen Drei-Nachweise-Standard nicht

`memory.md` legt fest: Eine verlinkte Lecture beweist nur Rückverfolgbarkeit; die Coverage Map
muss pro Lecture die drei Nachweise ausweisen (beginner-verständlich **erklärt**, mechanisch
**hergeleitet/nachvollzogen**, mit neuem Fall **transfer-geprüft**) und darf reine Zähler nicht
als Vollständigkeitsbeleg verwenden. Die aktuelle Map rendert genau Zähler + Link-Listen
(„n Concepts · m Formeln · k Labs"). Vorschlag: pro Lecture drei Status-Badges ableiten —
„erklärt" aus Concept-Tiefe, „hergeleitet" aus Formel-/Lab-Bindung, „geprüft" aus objektiven
Gates bzw. Transferchecks — und offene Lectures ehrlich als „nur verlinkt" markieren. Das macht
die verbleibenden Lücken (Befund 3) direkt im Produkt sichtbar, statt nur im Audit-Log.

## Befund 3 (Inhalt): Die im Deep Audit vom 15.07. benannten Lücken sind weiterhin offen

Der Lecture-14-Run hat die Datenthemen geschlossen; die übrigen Audit-Lücken nicht. Für das
Ziel „Assignments konfident lösen" ist das die wichtigste verbleibende Inhaltsarbeit, in
sinnvoller Reihenfolge:

1. **A1-Restlücken** (Initialisierung/truncated normal, exaktes RoPE inkl. Paarbildung,
   komponentengenaues Parameter-/FLOP-Accounting, Streaming/np.memmap) — A1 ist der Einstieg,
   hier zahlt sich Tiefe zuerst aus.
2. **Lecture 8 / A2**: Process Groups, NCCL/Gloo, DDP-Buckets und Overlap, Async/Deadlocks;
   dazu 2D-Triton-Grids und FlashAttention-Backward (Rekomputation aus m,l statt Speicherung).
3. **Lecture 11 / A3**: muP-Herleitung (parameterrollenspezifische Skalierung), WSD-Schedule,
   D_opt(C)-Herleitung und Loss-Prognose als eigene Formelkarten + idealerweise ein Lab
   „Vorhersage aus Fit" mit objektivem Gate.
4. **Lecture 4**: MoE-Systeme vertiefen — Routertraining (Load-Balancing-Loss mit f_i·P_i),
   Capacity Factor/Token-Overflow, Expert/Device-Placement.
5. **Lecture 16 / A5**: PPO/RLVR-Systemsicht, Dr. GRPO/RFT/GSPO-Abgrenzungen,
   Rollout-Infrastruktur; objektiver SFT→DPO-Systemtransfer.

---

# Re-Check 2026-07-16 (~11:45, interaktiv mit Martin)

## Status der Befunde vom Morgen

1. **P0 Abruftraining pull-basiert: umgesetzt und verifiziert.** Kein „fällig/due today" mehr in
   `index.html` oder `i18n-en.js`; Sitzung jederzeit startbar, sobald ein Concept erklärt ist;
   Priorisierung nie abgerufen → zuletzt „Noch nicht" → am längsten ohne Erfolg; Buttons ohne
   Intervallversprechen („Noch nicht / Schwer / Gewusst"); Erstnutzer-Hinweis mit Link zum
   nächsten offenen Concept. `node --check` sauber, `check-i18n` grün (1.139 UI-Strings),
   SW auf v27.
2. **P1 Coverage Map: weiterhin offen.** Die Map rendert unverändert nur Zähler + Link-Listen,
   keine drei Nachweise (erklärt / hergeleitet / transfergeprüft).
3. **Inhaltslücken (A1-Details, L8/A2, L11/A3, L4-MoE, L16/A5): weiterhin offen.**
   Bestand unverändert (64 Concepts, 70 Formeln, 20 Labs, 29 Missions).

## Neue Nutzerentscheidung (2026-07-16): Stufe 4 ohne Uhr — „Sitzungen statt Uhr"

Martin hat klargestellt, dass er **zeitlich komplett eigenständig** entscheiden will, wann er
was macht. Die verbliebene 24-Stunden-Regel für Stufe 4 (`retentionDelayMs`, Evidenzanker,
gesperrter Stufe-4-Button) ist damit abgelehnt — auch als reines Evidenzkriterium.
Gewählte Variante: **Stufe 4 = zwei erfolgreiche Abrufe in zwei verschiedenen Abrufsitzungen,
egal wie viel Zeit dazwischen liegt. Der tatsächliche Abstand wird angezeigt — Information
statt Gate.**

### Spezifikation für Codex

1. **`REVIEW_POLICY` umbauen** (`index.html` ~Z. 4319 ff.):
   - `retentionDelayMs` und jede Uhrzeit-Bedingung (`now-anchor>=…`) entfernen.
   - Jede Abrufsitzung erhält beim Start eine eigene Session-ID (einfacher Zähler oder
     Zufalls-ID im User-Store; der Zeitstempel darf gespeichert, aber nie als Bedingung
     genutzt werden).
   - Pro Karte speichern: Session-ID des ersten erfolgreichen Abrufs (Anker-Session).
     Ein weiteres „Gewusst" in einer **anderen** Session ⇒ `streak=2`, `retainedAt=now`.
     „Gewusst" in derselben Session verändert den Anker nicht (kein Verlust, kein Gewinn).
   - Unverändert: „Schwer" erzeugt keine neue Evidenz; „Noch nicht" entzieht den Nachweis
     (`streak=0`, `retainedAt=null`) — das ist Qualitäts-, nicht Zeitkriterium.
   - `conceptRetained` (beide Concept-Fragen nötig) bleibt unverändert.
2. **Migration bestehender Daten:** vorhandenes `retentionAnchorAt` als Anker-Session
   eines früheren Laufs interpretieren (d. h. Karten mit `streak=1` qualifizieren beim
   nächsten „Gewusst" in einer neuen Session); gesetztes `retainedAt` bleibt gültig.
   Alte `dueAt`-Reste bleiben wirkungslos.
3. **Ehrliche Abstandsanzeige statt Gate:** Wo Stufe 4 belegt ist, den echten Abstand der
   beiden Abrufe anzeigen (Minuten/Stunden/Tage, z. B. „belegt durch zwei Abrufe im Abstand
   von 2 Tagen" bzw. „… von 6 Minuten"). Kein Mindestwert, keine Warnung, keine Sperre.
4. **Alle UI-Texte DE/EN anpassen** (keine 24h-/„zeitversetzt nötig"-Formulierungen mehr):
   - Abruftraining-Panel: „Stufe 4 bleibt an zwei erfolgreiche Abrufe beider Concept-Fragen
     in verschiedenen Sitzungen gebunden; der tatsächliche Abstand wird angezeigt."
   - Concept-Aside („Stufe 4 braucht …") und Toast in `setConceptLevel` analog.
   - Levelnamen prüfen: „Zeitversetzt sicher" nur beibehalten, wenn die Abstandsanzeige
     daneben steht; sonst neutraler benennen (z. B. „In zweiter Sitzung sicher").
5. **Regressionstests aktualisieren:** die neuen Tests zur 24-Stunden-Grenze durch
   Session-Grenze-Tests ersetzen (gleiche Session zählt nicht doppelt; andere Session
   qualifiziert unabhängig vom Zeitabstand; Entzug durch „Noch nicht"; Legacy-Migration).
6. **Verifikation wie üblich:** `node --check`, `node scripts/check-i18n.mjs`,
   Browser-Test DE/EN (zwei Sitzungen direkt nacheinander ⇒ Stufe 4 freigeschaltet,
   Abstandsanzeige korrekt), Version-Bump von Bundle + SW.

Bewusst akzeptierter Trade-off: Zwei Sitzungen direkt hintereinander schalten Stufe 4 frei.
Das ist gewollt (volle Autonomie); die Abstandsanzeige hält die Evidenz trotzdem ehrlich.

---

# Run 3: Geplanter Deep Review (2026-07-16, ~13:10)

## „Sitzungen statt Uhr" (v28/v29): vollständig umgesetzt und jetzt auch im Browser verifiziert

Codex konnte die v29-Abstandsanzeige im letzten Run nur statisch prüfen (Port-Freigabe
blockiert). Dieser Run hat den kompletten Flow auf frischem Profil interaktiv nachgeholt:

1. Concept `logs` auf „Explained" gesetzt ⇒ Deck zeigt „5 cards available", Sitzung sofort startbar.
2. Sitzung 1: 5× „Got it" ⇒ Stufe 4 bleibt korrekt gesperrt (ein Nachweis pro Frage).
3. Sitzung 2 direkt im Anschluss: 5× „Got it" ⇒ **Stufe 4 „Retrieval confirmed" freigeschaltet,
   ohne Mindestwartezeit**; Button wählbar und aktivierbar.
4. Lernverlauf auf der Concept-Seite zeigt ehrlich „Self-check 1 · observed gap under 1 minute"
   (Information, kein Gate) — exakt wie spezifiziert.
5. Entzug: Ein „Again" auf eine Concept-Frage nahm den Nachweis zurück (Concept fiel auf
   „3 · Applied", Stufe-4-Button wieder gesperrt).
6. Deutsch geprüft: „zwei selbst gestartete Sitzungen … dürfen direkt nacheinander stattfinden";
   Priorisierung zeigt korrekt „1 zuletzt nicht gewusst". Keine Konsolenfehler in beiden Sprachen.
7. Die Regressionstests stecken in `check-i18n.mjs` (Session-Grenze, Fail-closed ohne
   Session-ID, Legacy-Migration, Entzug) und laufen grün: 1.139 UI-Strings, SW v29.

**Damit sind alle Termindruck-Befunde abgeschlossen.** Keine Uhr mehr im Produkt.

## Weiterhin offen (unverändert seit dem Morgen)

- **P1 Coverage Map**: rendert immer noch nur Zähler + Links (`countLabel`), keine drei
  Nachweise erklärt / hergeleitet / transfergeprüft pro Lecture.
- **Inhaltslücken**: Bestand unverändert (64 Concepts, 70 Formeln, 20 Labs, 29 Missions).

## Neu: Konkrete Content-Spez für die oberste Lücke (A1-Readiness)

Gegen `cs336_assignment1_basics.pdf` geprüft. Drei präzise Aufträge für Codex:

1. **Parameter-Initialisierung fehlt komplett** (`trunc_normal` hat 0 Treffer in der App;
   A1 §3.3.1 verlangt sie explizit). Neues Concept oder Erweiterung des Optimizer-/
   Trainings-Moduls mit: Linear-Gewichte 𝒩(0, σ²=2/(d_in+d_out)) truncated auf [−3σ,3σ];
   Embedding 𝒩(0,1) truncated auf [−3,3]; RMSNorm-Gain=1; Werkzeug `torch.nn.init.trunc_normal_`.
   Didaktisch anbinden: Warum Varianz ~1/Breite (Signalerhalt über Layer), warum Truncation
   (Ausreißer bei kleinem Fan-in), warum Pre-Norm robuster ist (A1 sagt es, Lecture 3 begründet
   es); Fehlannahme „Default-Init von nn.Linear reicht" adressieren. Formelkarte + 1 Selbstcheck.
2. **RoPE-Karte auf Handout-Exaktheit heben.** Die bestehende Karte ist konzeptuell richtig,
   aber A1-Implementierer brauchen zusätzlich: exakte Winkelformel θ_{i,k}=i/Θ^{(2k−2)/d} mit
   Basis Θ und Paarindex k∈{1,…,d/2} (aktuell nur generisch „θ=p·ωᵢ"); Pairing-Konvention
   benennen (A1 rotiert benachbarte Paare q_{2k−1:2k} — verbreitete Half-Split-Varianten sind
   testinkompatibel); Implementierungsvertrag: ein geteiltes RoPE-Modul für alle Layer,
   2D-cos/sin-Buffer via `register_buffer(persistent=False)` statt nn.Parameter, keine
   d×d-Matrix materialisieren; gleiche Rotation für K mit Position j. Ideal: Mini-Lab-Erweiterung
   oder Selbstcheck „Warum bricht ein anderes Pairing die Tests, obwohl die Mathematik stimmt?".
3. **np.memmap-Datenladen fehlt** (0 Treffer; A1 §Data Loading verlangt Memory-Mapped-Zugriff
   und `mmap_mode='r'`). Das Python-Concept behandelt Text-Streaming, nicht das
   Token-Array-Sampling. Ergänzen: Warum der Tokenstream nicht in RAM passt; memmap als
   On-Demand-Sicht auf die Datei; Batch-Sampling als zufällige Offsets i mit Paar
   (x[i:i+m], x[i+1:i+m+1]); Fallstricke dtype-Mismatch beim Reload (uint16 gespeichert,
   falsch als int64 interpretiert) und Off-by-one am Dateiende; Validierungs-Tipp aus dem
   Handout (gemappte Daten stichprobenartig auf Plausibilität prüfen). Anbindung an die
   bestehende `training-state`-Mission (scope `data_loading`).

Danach wie priorisiert weiter: Lecture 8/A2 (Process Groups, DDP-Buckets, FlashAttention-
Backward), Lecture 11/A3 (muP, WSD, D_opt(C)), Lecture 4 (MoE-Systeme), Lecture 16/A5.

## Kleinigkeiten

- **Erstnutzer-Sackgasse im Abruftraining**: Neues Profil sieht „0 fällig · 0 freigeschaltet";
  der einzige Button führt in ein Modal, das nur erklärt, warum nichts da ist. Beim
  Pull-Redesign gleich mitlösen: Button deaktivieren + Inline-Hinweis „Erkläre zuerst ein
  Concept, dann entsteht dein Deck" mit Direktlink zum nächsten offenen Concept.
- Ideen vom 15.07. bleiben offen (optional): Zeitgewinn-Anzeige im Dashboard
  (~61 h Modulzeit vs. Vorlesungen+Nacharbeit); lokaler Testbefehl pro Mission
  (z. B. `uv run pytest -k rmsnorm`) als Text ohne Implementierungshinweise.
- Der große uncommittete Stand sollte, sobald Martin ihn abgenommen hat, committed werden —
  bei der Dateigröße (826 KB index.html) steigt sonst das Risiko, gute Arbeit zu verlieren.
- Version-Bump-Disziplin ist aktuell eingehalten (Bundle/SW auf v25, konsistent).
