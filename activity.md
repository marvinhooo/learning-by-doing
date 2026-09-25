# Activity

Iteration Counter: 4

## 2026-07-14 - Interaktiver CS336-Lernbegleiter (manueller Run)

- Status: abgeschlossen
- Quelleninventur abgeschlossen: 15 Lecture-PDFs sowie 6 Assignment-PDFs.
- Acht zunaechst fehlerhafte Lecture-Dateien wurden durch den Nutzer als echte PDFs ersetzt und anschliessend verifiziert.
- `/Users/martin/tafelwerk.html` als UX-Referenz geprueft.
- Scope um einen vollstaendigen Symbol- und Formelkatalog erweitert.
- Ergebnis: `cs336-lernwerk.html` als offline-faehige interaktive Einzeldatei erstellt.
- Umfang: 12 Lernmodule, 43 Konzepte, 52 Formeln, 47 Symboleintraege, 54 Glossarbegriffe, 11 Labs, Diagnose und Quiz sowie Assignment-Coaches fuer A1 bis A5.
- Verifiziert: JavaScript-Parsing, globale und lokale Suche, Formeldetails, kontextsensitive Symbolsuche, BPE- und GRPO-Labs, Diagnose-Dialog, gestufte Hinweisfreigabe, Theme-Wechsel sowie mobile Navigation bei 390 x 844 Pixeln.
- Browserkonsole: keine Fehler oder Warnungen. PDF-Stichproben fuer Attention und RMSNorm visuell mit den hinterlegten Quellen abgeglichen.
- Der Iteration Counter wurde nicht erhoeht, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-14 - Supabase, GitHub Pages und mobile PWA (manueller Run)

- Status: technisch vorbereitet; externe Projektkonfiguration offen.
- Produktentscheidung: bestehender Supabase-Account beziehungsweise dieselbe Organisation, aber ein separates Projekt `CS336-Lernwerk` statt Wiederverwendung des Immo-Checker-Projekts.
- `index.html` als kanonischen Einstieg eingerichtet; der bisherige Dateiname leitet kompatibel weiter.
- E-Mail-/Passwort-Login ohne oeffentliche Registrierung, benutzerspezifische lokale Speicherung und Offline-first-Synchronisation mit Konfliktzusammenfuehrung implementiert.
- Privaten Bucket `cs336-pdfs`, Row Level Security (RLS; zeilenbasierte Zugriffskontrolle) und minimale Datenbankrechte in `supabase/setup.sql` vorbereitet.
- PDFs durch `.gitignore` vom GitHub-Deployment ausgeschlossen; lokales Upload-Skript mit Service-Role-Umgebungsvariable angelegt.
- PWA-Manifest, Service Worker, App-Icons, Safe-Area-Unterstuetzung und mobile Touch-/Eingabeanpassungen fuer iPhone und iPad ergaenzt.
- GitHub-Actions-Workflow und reproduzierbaren `_site`-Build angelegt; Publishable Key wird erst im Deployment aus Repository-Variablen erzeugt.
- Verifiziert: HTML-JavaScript, Service Worker und Manifest parsen; lokaler Modus, Login-Oberflaeche, Quellenbuttons und Notiz-Autosave wurden ohne Browser-Konsolenfehler geprueft. Der Build enthaelt weder PDFs noch Service-Role-Key.
- Offen: Supabase-Projekt, Auth-Benutzer, GitHub-Repository und Repository-Variablen extern anlegen; danach PDF-Upload, Live-Login, RLS- und Geraete-Ende-zu-Ende-Test.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-14 - Secret-Key-Kompatibilitaet beim PDF-Upload (manueller Run)

- Root Cause: Der neue opaque Supabase-Secret-Key `sb_secret_...` wurde zusaetzlich als Bearer-JWT gesendet; Storage antwortete deshalb mit `Invalid Compact JWS`.
- Fix: Neue Secret Keys werden nur noch im `apikey`-Header gesendet; nur der alte JWT-basierte `service_role`-Key erhaelt weiterhin einen `Authorization: Bearer`-Header.
- Der Upload bleibt durch `x-upsert` wiederholbar und ueberschreibt gleichnamige Dateien kontrolliert.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-14 - GitHub-Pages-Produktivsetzung (manueller Run)

- Status: erfolgreich veroeffentlicht.
- Leeres Repository `marvinhooo/learning-by-doing` als `origin` eingetragen und `main` ohne PDFs gepusht.
- GitHub-Actions-Run 29343090502 inklusive Build, Artifact-Upload und Pages-Deployment erfolgreich abgeschlossen.
- Produktions-URL: `https://marvinhooo.github.io/learning-by-doing/`.
- Verifiziert: Startseite HTTP 200, Manifest HTTP 200, bekannte PDF auf GitHub Pages HTTP 404 und derselbe Pfad ueber den oeffentlichen Supabase-Storage-Endpunkt HTTP 400; der Bucket ist damit nicht oeffentlich auslieferbar.
- Der produktive Build enthaelt die konfigurierte Supabase Project URL und ausschliesslich den oeffentlichen Publishable Key.
- Offen bleibt der authentifizierte Ende-zu-Ende-Test mit dem echten Benutzer; Passwort oder Secret Key werden dafuer nicht an Codex uebermittelt.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-14 - UX-Verdichtung mit Akkordeons (manueller Run)

- Status: abgeschlossen und erfolgreich veroeffentlicht.
- Formeln, Symbole und Glossar von Kachelrastern auf kompakte native Akkordeons umgestellt; mehrere Eintraege koennen gleichzeitig offen bleiben und ihr Zustand ueberlebt Filter- und Lesezeichen-Renderings.
- Formeln bleiben geschlossen vollstaendig sichtbar, brechen auf schmalen Displays um und zeigen aufgeklappt Zweck, Lesart, Dimensionen, Intuition, Beispiel, Fehlerbild, Selbstcheck, Variablen und Quellen.
- Dashboard, Lernpfad, Konzepte, Labs und Assignments in scanbare Listen beziehungsweise Timeline-Akkordeons verdichtet; redundante Karten und tote Chevron-Aktionsflaechen entfernt.
- Mobile Navigation bis 900 Pixel als Offcanvas-Menue mit `inert`, `aria-hidden`, Escape-Schliessen, Fokusuebergabe und Fokuswiederherstellung umgesetzt.
- Verifiziert: Inline-JavaScript und Hilfsskripte parsen, `git diff --check` ist sauber, Formel-Entities werden korrekt angezeigt, Lesezeichen behalten Fokus und Offen-Zustand, und die Ansichten laufen bei 390 x 844, 768 x 1024 sowie 1280 x 720 Pixeln ohne horizontales Ueberlaufen. Zentrale Touch-Ziele sind mindestens 44 Pixel hoch.
- Zwei unabhaengige Read-only-Code-Reviews fanden nach den Korrekturen keine verbleibenden High- oder Medium-Blocker.
- Commit `49a261b` wurde gepusht; GitHub-Actions-Run 29349877544 schloss erfolgreich ab. Die Produktionsseite antwortete mit HTTP 200 und enthielt die neuen Akkordeon- und Mobile-Navigationsmarker.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-14 - UX- und Accessibility-Audit nach aktuellen Standards (manueller Run)

- Status: Umsetzung und statische Verifikation abgeschlossen; Produktionspruefung nach Deployment ausstehend.
- Abgleich mit WCAG 2.2, WAI-ARIA Authoring Practices und aktuellen Apple-Vorgaben fuer iPhone/iPad durchgefuehrt.
- Light-Theme-Kontraste, Fokusindikatoren und Form-Control-Grenzen auf AA-taugliche Werte angehoben; Skip-Link und dynamische Seitentitel ergaenzt.
- Hauptnavigation auf semantische Links umgestellt; Browser-Zurueck/-Vorwaerts, iOS-Swipe und Scrollpositionswiederherstellung implementiert.
- Dialog und mobiler Drawer mit Hintergrund-Inertheit, Fokusbegrenzung, Escape, Scrim und Fokuswiederherstellung vervollstaendigt; Offcanvas-Breakpoint auf 1180 Pixel angehoben.
- Globale Suche als zugängliche Combobox mit Listbox, Ergebnismeldung und Pfeiltastensteuerung umgesetzt.
- Dateiimport, Kompetenzwahl, Filter, Assignment-Hinweise und relevante Statusmeldungen tastatur- und screenreaderfreundlich nachgebessert.
- Detailseiten von wiederholten Panel-Kacheln zu einem ruhigeren Lesefluss verdichtet; Attention-Matrix als echte Tabelle und Lab-Diagramme ohne winzige SVG-Beschriftungen umgesetzt.
- Service-Worker-Cleanup auf eigene `cs336-shell-*`-Caches begrenzt, damit andere GitHub-Pages-Projekte auf demselben Origin unberuehrt bleiben.
- Verifiziert: Inline-JavaScript, Service Worker, Build- und Upload-Skripte parsen; `git diff --check` ist sauber; der reproduzierbare Site-Build enthaelt weder PDFs noch Notebooks.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-15 - Glossar-Akkordeons mit echtem Zusatznutzen (manueller Run)

- Geschlossene Glossareintraege zeigen Begriff, Kategorie und vollstaendige Kurzdefinition; beim Oeffnen erscheint eine deutlich ausfuehrlichere, beginner-freundliche Erklaerung.
- Das Glossar umfasst nun 55 Eintraege einschliesslich `Linear Layer / Projection`, das den in LLM-Texten gebraeuchlichen Begriff Projection als gelernte lineare Abbildung erklaert.
- Verifiziert: Alle Glossarbegriffe besitzen Kurz- und Langdefinition; Inline-JavaScript, `git diff --check` und der reproduzierbare Site-Build sind sauber.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-15 - Beginner-first Erklaerungen und aufklappbare Lernantworten (manueller Run)

- Status: Umsetzung und Verifikation abgeschlossen.
- Alle 52 Konzeptseiten auf weniger vorausgesetztes Vorwissen umgeschrieben und vertieft: jeweils mentales Modell, drei schrittweise Erklaerabschnitte, typische Fehlannahmen sowie zwei begruendete Selbstcheck-Antworten; insgesamt 156 Vertiefungsabschnitte und 104 Musterloesungen.
- Standardbegriffe wie `Linear Layer`, `Attention Head`, `Forward Pass` und `Backward Pass` repo-weit beibehalten beziehungsweise vereinheitlicht; missverstaendliche Woertlich-Uebersetzungen entfernt. `Projection` bleibt nur im erklaerenden Glossareintrag erhalten.
- Fuer alle 52 Formel-Abrufchecks, 20 Readiness-Fragen der Assignments und 11 Lab-Transferfragen standardmaessig geschlossene Antworten beziehungsweise Loesungsideen ergaenzt. Assignment-Antworten bleiben konzeptuell und enthalten keinen Abgabecode.
- Jede Konzeptseite endet mit einer klaren Weiter-Aktion; nach dem letzten der 52 Konzepte fuehrt sie zur Konzeptuebersicht. Vertiefte Texte und Antworten sind in lokaler und globaler Suche enthalten.
- Quellenabgleich gegen die jeweils verknuepften Lecture- und Assignment-PDFs durchgefuehrt; Formelantworten und Lab-Loesungsideen wurden zusaetzlich unabhaengig fachlich geprueft.
- Verifiziert: JavaScript-Parsing und Dateninvarianten, 52/52 Konzepte und Formeln, 55/55 Glossareintraege, 20/20 Assignment-Antworten und 11/11 Lab-Antworten, `git diff --check`, Hilfsskripte sowie reproduzierbarer `_site`-Build ohne PDFs, Notebooks oder Temporaerdateien.
- Browserpruefung ohne Konsolenfehler: Selbstcheck-, Formel-, Assignment-, Lab- und Glossar-Akkordeons sowie erste und letzte Konzeptnavigation funktionieren. Bei 390 x 844, 768 x 1024 und 1280 x 800 Pixeln trat kein horizontales Ueberlaufen auf; zentrale Touch-Ziele blieben mindestens 44 Pixel hoch.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-15 - Vollstaendige Englisch-/Deutsch-Umschaltung und ehrliche Diagnoseoption (manueller Run)

- Status: abgeschlossen und fuer das Deployment vorbereitet.
- Englisch als Standardsprache eingerichtet; ein 44 Pixel grosser Umschalter wechselt vollstaendig zu Deutsch und speichert die Praeferenz geraetelokal, getrennt vom synchronisierten Lernstand.
- Vollstaendige ID-basierte englische Sprachschicht fuer 12 Module, 52 Konzepte, 52 Formeln mit 167 Variablenerklaerungen, 5 Assignment-Coaches, 11 Labs, 12 Diagnosefragen, 12 Quizfragen, 55 Glossarbegriffe und 48 Symbole ergaenzt. Ein automatischer Paritaetscheck prueft diese Abdeckung und 465 statische beziehungsweise dynamische Oberflaechentexte bei jedem Build.
- Jede der 12 Diagnosefragen besitzt nun zusaetzlich `I don't know` beziehungsweise `Ich weiss es nicht`. Die Option zaehlt bewusst nicht als richtige Antwort und bleibt Teil des Nenners, damit die Lernreihenfolge echte Wissensluecken priorisiert; das regulaere Quiz bleibt unveraendert.
- Der Sprachwechsel behaelt aktuelle Ansicht, Filter, Formulare, Akkordeons, Scrollposition und den laufenden BPE-Merge-Zustand. Der Service-Worker-Cache wurde auf `cs336-shell-v5` angehoben, damit installierte iPhone-/iPad-Apps die neue Sprachdatei sicher erhalten.
- Verifiziert: Locale-Paritaet, JavaScript-Syntax, reproduzierbarer `_site`-Build ohne PDFs oder Notebooks und bytegleiche Quell-/Build-Dateien. Browserpruefungen deckten Diagnose, Account-Dialog, dynamisches BPE-Lab, Sprachwechsel und 24 Routen ab; die Konsole blieb ohne Fehler oder Warnungen.
- Bei 390 x 844, 768 x 1024 und 1280 x 800 Pixeln trat kein horizontales Ueberlaufen auf; zentrale Touch-Ziele einschliesslich Sprachumschalter und Diagnoseoptionen sind mindestens 44 Pixel hoch.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-15 - Lernpfad und Konzepte zu einer Kursstruktur zusammengefuehrt (manueller Run)

- Status: abgeschlossen und lokal verifiziert.
- Redundanten Top-Level-Menuepunkt `Konzepte` sowie die zweite Konzeptuebersicht entfernt. Der Lernpfad ist nun die einzige Kursuebersicht; jedes Modul zeigt aufgeklappt direkt seine geordneten Konzepte und zugehoerigen Labs.
- Konzeptsuche in den Lernpfad integriert. Suchtreffer reduzieren die sichtbaren Module und Konzeptzeilen, oeffnen passende Module automatisch und blenden fuer einen fokussierten Scan die Lablisten aus.
- Optionale Moduldetailseite auf Voraussetzungen, Quellen, Lernziel und Fortschritt begrenzt. Dashboard-Karten oeffnen das zugehoerige Modul im Lernpfad; `Lernen fortsetzen` fuehrt direkt zum naechsten offenen Konzept.
- Konzeptfortsetzung folgt explizit `MODULES[].concepts`: innerhalb eines Moduls zum naechsten Konzept, an der Grenze zum ersten Konzept des naechsten Moduls und am Kursende zur Lernpfaduebersicht.
- Alte `#concepts`-Hashes und gespeicherte `lastView: "concepts"` werden nach `#path` migriert. Modul- und Konzeptdetails markieren den Lernpfad als aktiven Navigationskontext; Zurueck/Vorwaerts erhaelt das geoeffnete Modul.
- Verifiziert: Inline-JavaScript, Locale-Paritaet mit 469 Oberflaechentexten, reproduzierbarer Site-Build und Service-Worker-Cache `cs336-shell-v6`. Browsertests fuer beide Sprachen, Legacy-Route, Suche, Modulgrenzen, Kursabschluss und History liefen ohne Konsolenfehler.
- Bei 320 x 700, 390 x 844 und 768 x 1024 Pixeln trat kein horizontales Ueberlaufen auf; Menue- und Sprachbutton blieben 44 x 44 Pixel gross.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-15 - Beginner-first Labs und erklaerender Shape Ledger (manueller Run)

- Status: Umsetzung und lokale Verifikation abgeschlossen.
- Alle elf Labs um einen bereits geschlossen sichtbaren Formel-Refresher erweitert. Jedes Lab nennt Mental Model, Kernformel oder Entscheidungsregel, verwendete Symbole, konkrete Beobachtungsaufgabe und typische Fehlannahme; alle Felder sind ID-basiert auf Englisch und Deutsch gepflegt und werden vom Locale-Paritaetscheck erzwungen.
- Tensor Shape Tracer von vier unbeschrifteten Ergebniswerten zu einer sechsstufigen Rechenkette umgebaut: Token-IDs, Embedding-Lookup und `X`, drei Linear Layers fuer `Q/K/V`, Head-Aufteilung mit `d_head=D/H`, rohe `QK^T`-Compatibility-Scores, Maske und Softmax sowie Value-Mischung, Head-Concat und `W_O`. Jede Shape benennt alle Achsen; auch das Sofortergebnis zeigt `[B,H,T,d_head]` beziehungsweise `[B,H,T_query,T_key]`. Regleraenderungen erklaeren die betroffene Achse und ihre Invarianten.
- BPE als Unicode-Zeichen-Toy-Modell gegenueber echtem Byte-level BPE abgegrenzt; Attention zeigt Score-, Masken-, Temperatur-, Softmax- und Value-Schritt; Optimizer, Ressourcen, Roofline, Scaling, Datenpipeline und GRPO zeigen Formeln mit aktuell eingesetzten Werten.
- Roofline-Plot auf eine konsistente logarithmische Arithmetic-Intensity-Achse korrigiert. DDP unterscheidet nun Speicher pro Rank und replizierten Clusterzustand; Scaling bezeichnet den berechneten Punkt korrekt als compute-kompatible Aufteilung statt als gemessenes Optimum; `D_model` und `D_tokens` sind getrennt.
- Verifiziert: Inline-JavaScript, Locale-Paritaet mit 594 Oberflaechentexten, `git diff --check` und reproduzierbarer Site-Build. Alle elf Labs wurden auf 390 Pixel Breite ohne horizontales Ueberlaufen gerendert; ab 760 Pixel bleiben Regler und Ergebnis auf dem iPad zweispaltig. Shape-Regler, BPE-Merge, Attention-Maske, Roofline-Klassifikation und GRPO-Nullsignal reagierten korrekt. Formel-Akkordeon und Sprachwechsel behalten Regler- und Offen-Zustand; dynamische Attention-, Parallelism- und Datenpipeline-Ausgaben wurden in beiden Sprachen geprueft.
- Service-Worker-Cache auf `cs336-shell-v7` und die Sprachdatei auf eine versionierte URL angehoben, damit bestehende Installationen die neuen englischen Labtexte ohne Zwischenzustand laden.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-15 - Lecture-Abdeckung, Assignment-Readiness und objektive Lernkontrolle (manueller Run)

- Status: inhaltliche und technische Ueberarbeitung lokal abgeschlossen; noch nicht committed oder deployed.
- Alle 16 vorhandenen Lecture-PDFs und sechs Assignment-Handouts erneut gegen die Plattformstruktur auditiert. Eine abgeleitete Lecture Coverage Map zeigt je Vorlesung die verknuepften Concepts, Formeln, Labs und Assignments; 29 Missions enthalten alle 124 Problem-IDs der Handouts.
- Bestand auf 13 Module, 62 Concepts, 65 Formeln, 67 Symbole, 55 Glossarbegriffe und 18 Labs erweitert. Lecture 10, moderne Architekturentscheidungen und Mixture of Experts (MoE; Expertenmischung) sind nun in Lernpfad, Quellen und Formeln integriert.
- Prerequisite Sprint fuer Python-, PyTorch-, Tensor-, Wahrscheinlichkeits-, Logarithmus-, Gradienten- und Ressourcenvertraege geschaerft. Die Diagnose umfasst weiterhin 12 Auswahlfragen und jetzt vier angewandte Kurzherleitungen; das Kursquiz umfasst 17 Fragen.
- Terminiertes Retrieval-Training ergaenzt: `Again`, `Hard` und `Good` planen Wiederholungen; der hoechste Concept-Level verlangt einen zeitversetzten erfolgreichen Abruf und wird durch ein spaeteres `Again` wieder entzogen.
- Drei besonders assignmentnahe Lernkontrollen neu beziehungsweise objektiv gemacht: Tensor Shape Tracer mit festem Shape-Transfer, PyTorch Contract Debugger mit fuenf isomorphen Failure Traces sowie Policy Loss Tracer fuer Shift, Response Mask, Gather, Vorzeichen und Reduction. Zusammen mit Triton, Online Softmax, Scaling Fit, Dedup und GRPO sind acht Labs fachlich gegated.
- Assignment-Missions koennen nicht mehr durch einen einzelnen Haken abgeschlossen werden: Alle verknuepften Concepts muessen mindestens erklaert, alle verknuepften Labs angewandt und mindestens 30 Zeichen eigener Nachweis gespeichert sein. Semantische Checks erzwingen Scope, Evidence, Failure Spur sowie Concept- und Lab-Verknuepfungen in beiden Sprachen.
- Wiederaufnahme bestandener Labs korrigiert: Erfolgsstatus und sichtbare korrekte Antwortspur bleiben konsistent. Lange BPE-Tokens und Code umbrechen; die Jaccard-Tabelle besitzt Caption und Header-Semantik; grosse slidergetriebene Bereiche verursachen keine Screenreader-Meldungsflut.
- Verifiziert: Locale- und Semantikcheck fuer 62 Concepts, 65 Formeln, 67 Symbole, 55 Glossareintraege, 18 Labs, 29 Missions und 1052 UI-Texte; Inline-JavaScript, Sprachbundle und Service Worker parsen; reproduzierbarer `_site`-Build ist quellgleich und enthaelt weder PDFs noch Notebooks.
- Browsertests in Englisch und Deutsch: Lecture Coverage Map, Mission-Gates, Objective Checks, Sprachwechsel und persistierte Lab-Erfolge. Bei 390 x 844, 768 x 1024 und 1024 x 768 Pixeln trat kein horizontales Ueberlaufen auf; alle sichtbaren Controls waren mindestens 44 Pixel hoch. Labs stapeln bis 899 Pixel Breite und bleiben im iPad-Landscape zweispaltig. Die Browserkonsole blieb leer.
- Service-Worker-Cache und Sprachbundle auf Version 18 angehoben. Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-15 - Erklaerungstiefe am Beispiel Linear Layer / Projection (manueller Run)

- Status: lokal abgeschlossen; noch nicht committed oder deployed.
- `Linear Layer / Projection` wird nun konsistent als gelernter Feature-Mixer erklaert: Bedeutung eines Features, einzelne gewichtete Summe, Bias, Lernen durch Backpropagation, Shape-Vertrag, Abgrenzung zwischen positionsweise und kontextfrei sowie die konkreten Rollen in Q/K/V, `W_O`, MLP und LM Head.
- Das Tafelwerk enthaelt eine neue, vollstaendige Formelkarte mit Zahlenbeispiel, Variablen, Shape-Folgen, PyTorch-Gewichtskonvention, Affinitaet bei Bias und Abgrenzung zur geometrischen Projection. Concept, Glossar, Symboltabelle und Tensor Shape Tracer verweisen auf dasselbe mentale Modell.
- Die Inhaltspruefung erzwingt in Deutsch und Englisch eine Mindesttiefe: mindestens drei Concept-Details, zwei Fehlerbilder, zwei beantwortete Selbstchecks, erklaerte Formelvariablen, substanzielle Formelantworten und Glossarvertiefungen. Diese Strukturpruefung ergaenzt den manuellen fachlichen Audit, ersetzt ihn aber nicht.
- Verifiziert: 62 Concepts, 65 Formeln, 67 Symbole, 55 Glossareintraege, 18 Labs, 29 Assignment-Missions und 1052 UI-Texte sind sprachlich und semantisch konsistent; Inline-JavaScript, Sprachbundle und Service Worker parsen; `_site` ist reproduzierbar und enthaelt weder PDFs/Notebooks noch administrative Secret-Marker.
- Browserpruefung in Deutsch und Englisch: Concept, Formel-Akkordeon, aufklappbare Musterloesung, Glossarvertiefung und dynamischer Shape-Tracer zeigen die neue Erklaerung. Bei 390 x 844 und 768 x 1024 Pixeln gab es kein horizontales Ueberlaufen; sichtbare Controls blieben mindestens 44 Pixel hoch und die Browserkonsole leer.
- Service-Worker-Cache und Sprachbundle auf Version 20 angehoben, damit bestehende Installationen die vertiefte englische Fassung sicher neu laden. Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-15 - Erklaerungsstandard auf weitere Kernbegriffe ausgeweitet (manueller Run)

- Status: lokal abgeschlossen und verifiziert; noch nicht committed oder deployed.
- Den bei `Linear Layer / Projection` eingefuehrten Erklaerungsstandard auf weitere haeufige Black Boxes ausgeweitet: Embedding Lookup, Kettenregel und Backpropagation, Softmax und Cross-Entropy, Q/K/V und Attention, RMSNorm, Residual Stream, SwiGLU, RoPE, KV-Cache, AdamW, Gradient Clipping, GQA/MQA, Mixture of Experts sowie DPO, GRPO, PPO und zentrale Distributed Collectives. Die Texte verbinden nun Input und Output, Mechanismus, gelernte beziehungsweise feste Teile, Shapes, Zweck, Einsatzort, Beispiel und Fehlannahme.
- Das Tafelwerk umfasst jetzt 66 Formeln; die neue `Token Embedding Lookup`-Karte und vertiefte Kernkarten besitzen vollstaendige Variablen-, Shape-, Beispiel- und Abruferklaerungen in Englisch und Deutsch. Die Notation wurde vereinheitlicht: `H` beziehungsweise `H_q` bezeichnet die Head-Anzahl, `d_head` die Featurebreite eines Heads.
- Das Glossar umfasst jetzt 66 Begriffe. Neu hinzugekommen sind eigenstaendige Eintraege fuer Embedding, Softmax, Cross-Entropy, Backpropagation, Query/Key/Value, Attention, Causal Mask, Broadcasting, AdamW, Parameter/Buffer sowie Stride/Contiguous; weitere zentrale bestehende Eintraege wurden substanziell vertieft.
- Optimizer-, Ressourcen-, Parallelismus- und Inference-Labs erklaeren nun die Zwischenschritte ihrer Rechnungen: Adam-Momente und Bias Correction, Herkunft der Faktoren 12 und 16, Datenbewegung bei All-Reduce/Reduce-Scatter/All-Gather sowie alle KV-Cache-Achsen, Faktor 2 und das Wachstum von `S`. Ein doppelter dynamischer Sprachersatz von `Bytes` zu `bytess` wurde dabei gefunden und an der Regex-Grenze behoben.
- Der Inhaltscheck erzwingt fuer 13 Kernformeln feldweise Mindesttiefe und fuer 33 grundlegende Glossarbegriffe substanzielle Langfassungen in beiden Sprachen. Verifiziert: 62 Concepts, 66 Formeln, 67 Symbole, 66 Glossareintraege, 18 Labs, 29 Missions und 1083 UI-Texte; Inline-JavaScript, Sprachbundle und Service Worker parsen; der reproduzierbare `_site`-Build ist quellgleich und enthaelt weder PDFs/Notebooks noch administrative Secret-Marker.
- Browserpruefung in Englisch und Deutsch: Glossarvorschau und -vertiefung, Embedding-Formel und Musterloesung, Embedding-Concept mit drittem Selbstcheck sowie Optimizer-, Ressourcen-, KV-Cache- und Parallelismus-Labs funktionieren. Bei 390 x 844, 768 x 1024 und 1024 x 768 Pixeln gab es kein horizontales Ueberlaufen; sichtbare Controls blieben mindestens 44 Pixel gross, iPad-Portrait stapelt die Labspalten und iPad-Landscape zeigt sie zweispaltig. Die Browserkonsole blieb leer.
- Service-Worker-Cache und Sprachbundle wurden auf Version 24 angehoben. Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-15 - Seitengenauer Deep Audit auf Lecture-Paritaet (manueller Run)

- Status: Review abgeschlossen; Lecture-Paritaet und vollstaendige Assignment-Readiness sind noch nicht erreicht. Es wurden in diesem Review keine Produktinhalte als abgeschlossen markiert.
- Quellenbasis: alle 16 vorhandenen Lecture-PDFs mit zusammen 617 Seiten und alle sechs Assignment-Handouts mit zusammen 176 Seiten. Relevante Formel-, Algorithmus-, System- und Pipeline-Seiten wurden zusaetzlich visuell geprueft. Eine Lecture-14-PDF ist im Ordner nicht vorhanden.
- Bewertungsstandard verschaerft: Eine Lecture-Quelle an einem Concept, einer Formel oder einer Mission ist nur Rueckverfolgbarkeit. Inhaltliche Abdeckung verlangt drei getrennte Nachweise: beginner-verstaendliche Erklaerung, nachvollziehbare Mechanik beziehungsweise Herleitung und Transfer auf einen neuen Fall.
- Staerken: Dense-Transformer-Datenfluss, Attention und Shapes, BPE-Kern, Cross-Entropy/AdamW, Roofline/Online Softmax, KV-Cache/Serving, MinHash/LSH, SFT/RLHF/DPO sowie Policy Gradient/GRPO-Grundmechanik sind bereits substanziell aufbereitet. Lecture 10 ist der derzeit am vollstaendigsten abgebildete Lecture-Block.
- Groesste Lecture-Luecken: Lecture 4 (MoE-Varianten, Routertraining, Capacity/Overflow und Systeme), Lecture 8 (Process Groups, NCCL/Gloo, DDP-Buckets, Async/Deadlocks und Codepfade), Lecture 11 (muP-Herleitung, parameterrollenspezifische Skalierung und WSD) sowie Lecture 16 (PPO/RLVR-Systeme, R1/Kimi/Qwen und Rollout-Infrastruktur).
- Assignment-Urteil: A1 ist wegen Initialisierung, exaktem RoPE, komponentengenauem Accounting und Streaming noch nicht vollstaendig vorbereitet; A2 wegen zweidimensionalem Triton, FlashAttention-Backward und exaktem Distributed Accounting nicht; A3 wegen `D_opt(C)`, Loss-Prognose und muP-Transfer nicht; A4 ist stark bei Dedup/Filtering, aber besitzt eine falsche Validation-Nuance; A5/A5-Supplement fehlen insbesondere Dr. GRPO/RFT/MaxRL/GSPO und ein objektiver SFT-zu-DPO-Systemtransfer.
- Klarer Korrektheitsbefund: A4 erlaubt die Nutzung der Paloma-Validation zur Filterentwicklung. Dadurch wird sie zur Development-Metrik; Kontamination ist insbesondere die woertliche Uebernahme in den Trainingskorpus. Die aktuelle Plattform vermischt diese Faelle und darf vor der Korrektur keine A4-Readiness behaupten.
- Der Deep Audit bestaetigt keine weiteren schwerwiegenden fachlichen Falschaussagen in den zentralen deutsch- oder englischsprachigen Erklaerungen. Die bestehenden Struktur- und Wortzaehlchecks messen Erklaerungstiefe, nicht Lecture-Vollstaendigkeit.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-15 - Lecture 14 vollstaendig integriert (manueller Run)

- Status: fachliche Integration und lokale Verifikation abgeschlossen; noch nicht committed oder deployed.
- Die neue 14-seitige PDF `Trace - lecture_14.pdf` wurde seitenweise per Text- und visueller PDF-Pruefung auditiert. Der Quellenbestand umfasst nun 17 Lectures mit zusammen 631 Seiten sowie sechs Assignment-Handouts mit 176 Seiten.
- Lecture 14 ist nicht nur verlinkt: KenLM und n-Gram-Perplexity, Kneser-Ney Smoothing, fastText, Data Selection via Importance Resampling (DSIR), Language Identification, Quality- und Toxicity-Filtering, exakte und approximative Deduplizierung, Bloom Filter sowie Jaccard, MinHash und Locality-Sensitive Hashing (LSH) wurden in Lernpfad, Concepts, Formeln, Symbolen, Glossar, Quiz, Coverage Map und Assignment-4-Bruecken integriert.
- Zwei objektiv gegatete Labs ergaenzt: `KenLM vs fastText vs DSIR` trennt Target-Likelihood, Class Probability und Density Ratio an denselben Toy-Dokumenten; der `Bloom Filter Simulator` leitet Bitbelegung, False-Positive-Wahrscheinlichkeit und die optimale Hashzahl her. Beide wiederholen Formel und Symbolbedeutung direkt im Anwendungskontext.
- Fachliche Fallstricke explizit korrigiert: KenLM liefert Logarithmen zur Basis 10; die Standard-False-Positive-Rate eines Bloom Filters wird ueber negative Queries definiert; ein Hash-Fingerprint beweist wegen moeglicher Kollisionen keine Identitaet; Assignment 4 unterscheidet exakte Line-Deduplication von repraesentativer Dokument-Deduplication; Validation darf fuer Filterentwicklung genutzt werden und ist dann eine Development-Metrik, waehrend ein unangetasteter Test fuer eine unabhaengige Schlussaussage erforderlich bleibt.
- Aktueller Bestand: 13 Module, 64 Concepts, 70 Formeln, 71 Symbole, 70 Glossarbegriffe, 20 Labs, 19 Quizfragen und 29 Assignment-Missions mit allen 124 Problem-IDs. Deutsch und Englisch besitzen stabile IDs, damit bestehender Lernfortschritt durch die Erweiterung nicht verschoben wird.
- Verifiziert: Locale- und Semantikcheck fuer 64 Concepts, 70 Formeln, 71 Symbole, 70 Glossareintraege, 20 Labs, 29 Missions und 1142 UI-Texte; JavaScript-Syntax, `git diff --check`, reproduzierbarer `_site`-Build und bytegleiche zentrale Build-Dateien. Der Build enthaelt weder PDFs/Notebooks noch administrative Secret-Marker.
- Browserpruefung in Deutsch und Englisch: beide neuen Labs, Methodenwechsel, Bloom-FPR jenseits des Optimums und Lecture-14-Quelle funktionieren. Bei 390 x 844, 768 x 1024 und 1024 x 768 Pixeln trat kein horizontales Ueberlaufen auf; alle sichtbaren Controls waren mindestens 44 Pixel hoch. iPhone und iPad-Portrait stapeln die Labspalten, iPad-Landscape zeigt sie zweispaltig; die Browserkonsole blieb ohne Fehler oder Warnungen.
- Service-Worker-Cache und Sprachbundle wurden auf Version 25 angehoben. Der lokale PDF-Link funktioniert; der Upload in den privaten Supabase-Bucket wurde nicht ausgefuehrt, weil `SUPABASE_URL` und `SUPABASE_SECRET_KEY` im Codex-Prozess nicht gesetzt waren.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.

## 2026-07-16 - Geplanter Deep Review des lokalen Version-12-Stands

- Status: Review abgeschlossen; keine App-Dateien geaendert. Vollstaendiger Report: `tmp/deep-review-2026-07-16.md`.
- Verifiziert: JavaScript-Syntax, Locale- und Semantikcheck fuer 64 Concepts, 70 Formeln, 71 Symbole, 70 Glossareintraege, 20 Labs, 29 Missions und 1142 UI-Texte sowie Browser-Smoke-Test ohne Konsolenfehler.
- Lecture 14 ist mit 17 von 17 Lectures integriert. Das Bloom-Filter-Lab liefert fuer `m=100`, `n=10`, `k=7` eine exakte False-Positive-Rate von 0,839 Prozent; das objektive Transfer-Gate schaltet erst nach drei richtigen Antworten frei.
- Drei Empfehlungen des Vortags sind umgesetzt: Modul-00-Fragen im Quiz, lesbare Diagnose-Labels und sichtbarer Original-Handout-Scope pro Mission.
- P0-Befund: Das neue Abruftraining widerspricht der dokumentierten Kein-Termindruck-Entscheidung. Faelligkeits-Gate, Tagesanzeigen und Intervallversprechen werden durch jederzeit startbare, nach Lernbedarf priorisierte Sitzungen ersetzt. Zeitabstand bleibt ausschliesslich Evidenzkriterium fuer den hoechsten Concept-Level; ein spaeteres `Noch nicht` entzieht diesen Nachweis weiterhin.
- P1-Befund: Die Lecture Coverage Map zeigt weiterhin nur Zaehler und Links statt der drei getrennten Nachweise `erklaert`, `hergeleitet beziehungsweise mechanisch nachvollzogen` und `transfergeprueft`.
- Inhaltliche Reihenfolge des offenen Rests: zuerst A1-Initialisierung, exaktes RoPE, komponentengenaues Accounting und Streaming; danach Lecture 8/A2, Lecture 11/A3, Lecture 4/MoE und Lecture 16/A5.
- Der lokale Stand bleibt mit 4048 Insertions und 798 Deletions gegen `5c99f36` uncommitted und nicht deployed. Weitere App-Edits sollen deshalb eng abgegrenzt und vor einem Commit vollstaendig verifiziert werden.
- Der Iteration Counter wurde auf 1 erhoeht, weil dieser Review ueber einen geplanten Task gestartet wurde.

## 2026-07-16 - Pull-basiertes Abruftraining umgesetzt

- Status: P0 lokal umgesetzt und verifiziert; kein Commit und kein Deployment ausgefuehrt.
- Das Faelligkeits-Gate ist entfernt. Sobald mindestens ein Concept erklaert ist, kann jederzeit eine Sitzung mit bis zu zehn Karten gestartet werden. Die Reihenfolge ist jetzt fest: nie abgerufen, zuletzt `Noch nicht`, danach am laengsten ohne erfolgreichen Abruf. Alte `dueAt`-Werte bleiben wirkungslos.
- Dashboard und Abrufansicht zeigen neutralen Kartenbestand und Retention-Fortschritt. Deutsche und englische Bewertungsbuttons enthalten keine Minuten- oder Tagesversprechen mehr. Ohne erklaertes Concept fuehrt ein Inline-Hinweis direkt zum naechsten offenen Concept.
- Der Stufe-4-Nachweis bleibt erhalten: Der erste erfolgreiche Abruf setzt einen Evidenzanker; erst ein weiterer erfolgreicher Abruf nach mindestens 24 Stunden qualifiziert. Fruehes Ueben verschiebt den Anker nicht, `Schwer` erzeugt keine neue Evidenz und `Noch nicht` entzieht vorhandene Evidenz.
- Verifiziert: Locale- und Semantikcheck fuer 64 Concepts, 70 Formeln, 71 Symbole, 70 Glossareintraege, 20 Labs, 29 Missions und 1139 UI-Texte; feste Regressionstests fuer Priorisierung, 24-Stunden-Grenze, Legacy-Daten und Evidenzentzug; JavaScript-Syntax, sauberer Diff und reproduzierbarer `_site`-Build.
- Browserpruefung in Englisch und Deutsch: Erstnutzer-Link, aktivierter Sitzungsstart, qualitative Bewertungsbuttons und sofortiger erneuter Sitzungsstart nach zwei `Gewusst`-Antworten funktionieren. Beide Browserzustaende blieben ohne Fehler oder Warnungen.
- Service-Worker-Cache und Sprachbundle wurden auf Version 27 angehoben. Der Iteration Counter bleibt 1, da diese Umsetzung manuell/interaktiv gestartet wurde.

## 2026-07-16 - Stufe 4 auf Sitzungen statt Uhr umgestellt

- Status: Nutzerentscheidung lokal umgesetzt und verifiziert. Der zuvor dokumentierte 24-Stunden-Anker ist vollstaendig supersediert; es gibt keine Mindestwartezeit mehr.
- Jede Abrufsitzung erhaelt eine eigene Sitzungs-ID. Eine Concept-Frage kann pro Sitzung hoechstens einmal mit `Gewusst` gutgeschrieben werden; zwei verschiedene selbst gestartete Sitzungen reichen auch dann, wenn sie unmittelbar nacheinander stattfinden. Zeitstempel dienen nur Sortierung und Verlauf.
- `Schwer` erhoeht den Abrufnachweis nicht und erhaelt den vorhandenen Stand. `Noch nicht` setzt den Nachweis der Karte zurueck und stuft ein zuvor bestaetigtes Concept effektiv wieder auf Stufe 3 herab. Legacy-Zustaende mit `streak` oder `retainedAt` bleiben kompatibel; alte `dueAt`- und `retentionAnchorAt`-Felder werden beim naechsten Bewerten entfernt.
- Die sichtbare Stufe 4 heisst jetzt `Abruf bestaetigt` beziehungsweise `Retrieval confirmed`. Dashboard, Concept-Seite, Abruftraining und Abschlussdialog erklaeren in Deutsch und Englisch: Sitzungen koennen direkt nacheinander stattfinden und haben keine Mindestwartezeit.
- Verifiziert: erstes `Gewusst` in Sitzung A bleibt bei einem Nachweis; ein doppelter Aufruf derselben Sitzung zaehlt nicht; Sitzung B schaltet auch bei identischem Zeitstempel frei; `Schwer`, `Noch nicht`, Legacy-Daten und Priorisierung besitzen feste Regressionstests.
- Browserpruefung auf frischem Profil: Sitzung 1 liess Stufe 4 gesperrt, die unmittelbar gestartete Sitzung 2 schaltete `Retrieval confirmed` frei, und ein anschliessendes `Again` entzog den Nachweis wieder. Deutsche und englische Texte waren korrekt; die Browserkonsole blieb ohne Fehler oder Warnungen.
- Service-Worker-Cache und Sprachbundle wurden auf Version 28 angehoben. Kein Commit und kein Deployment ausgefuehrt. Der Iteration Counter bleibt 1, da diese Korrektur manuell/interaktiv gestartet wurde.

## 2026-07-16 - Reale Sitzungsabstaende als reine Verlaufsinformation ergaenzt

- Status: Die nachgereichte Transparenzanforderung ist lokal umgesetzt und statisch vollstaendig verifiziert; kein Commit und kein Deployment ausgefuehrt.
- Pro Concept-Selbstcheck werden Zeitpunkt und Sitzungs-ID des ersten `Gewusst`-Nachweises eingefroren. Das zweite `Gewusst` aus einer anderen selbst gestarteten Sitzung setzt den Bestaetigungszeitpunkt; spaetere erfolgreiche Uebung verschiebt keinen der beiden Evidenzzeitpunkte.
- Ein bestaetigtes Concept zeigt auf seiner Detailseite einen neutralen `Lernverlauf` beziehungsweise `Learning history` mit dem tatsaechlich beobachteten Abstand je Selbstcheck in Minuten, Stunden oder Tagen. Der Abstand ist nur Information und weder Mindestwert noch Gate; direkt aufeinanderfolgende Sitzungen erscheinen ehrlich als `unter 1 Minute` beziehungsweise `under 1 minute`.
- Legacy-Zustaende uebernehmen einen gueltigen `retentionAnchorAt` als ersten Erfolgszeitpunkt. Fehlt bei einem aelteren bestaetigten Nachweis einer der beiden Zeitpunkte, zeigt die Oberflaeche `Abstand nicht gespeichert`, statt einen Wert aus `firstAt` oder `lastGoodAt` zu schaetzen. `Noch nicht` loescht Nachweis und Verlauf weiterhin vollstaendig.
- Die Session-Grenze ist fail-closed: Ohne echte Sitzungs-ID erzeugt auch ein beliebig grosser Zeitabstand keinen Nachweis. Regressionen decken dieselbe Sitzung nach zwei Tagen, eine andere Sitzung bei identischem Zeitpunkt, eingefrorene Anker, `Schwer`, `Noch nicht`, Legacy-Migration, unbekannte oder rueckwaerts laufende Zeitpunkte sowie deutsche und englische Formatierung ab.
- Verifiziert: Locale- und Semantikcheck fuer 64 Concepts, 70 Formeln, 71 Symbole, 70 Glossareintraege, 20 Labs, 29 Missions und 1139 UI-Texte; Inline-JavaScript, Sprachbundle, Testskript und Service Worker parsen; `git diff --check` ist sauber; der reproduzierbare `_site`-Build ist bei allen kopierten Kernassets bytegleich und enthaelt keine PDFs oder Notebooks.
- Ein erneuter interaktiver Browserlauf fuer die neue Abstandsanzeige war in diesem Run extern blockiert: Der lokale Server durfte wegen des erreichten Freigabe-Limits keinen Port oeffnen, und die direkte `file://`-Vorschau wurde von der Browser-URL-Richtlinie abgelehnt. Der zuvor erfolgreich gepruefte v28-Sitzungsflow bleibt unveraendert; die neue v29-Darstellung ist deshalb in diesem Run statisch, nicht erneut visuell, verifiziert.
- Service-Worker-Cache und Sprachbundle wurden auf Version 29 angehoben. Der Iteration Counter bleibt 1, da diese Umsetzung manuell/interaktiv gestartet wurde.

## 2026-07-16 - A1-Initialisierung, exaktes RoPE und Memory-Mapped Tokenbatches

- Status: Die drei spezifizierten A1-Inhaltsluecken sind lokal umgesetzt und im Browser verifiziert; kein Commit und kein Deployment ausgefuehrt.
- Der vom Nutzer auf frischem Profil nachgeholte v29-Browsernachweis schliesst den vorherigen statischen Rest: zwei unmittelbar aufeinanderfolgende Sitzungen schalten `Retrieval confirmed` ohne Wartezeit frei, `observed gap under 1 minute` bleibt reine Information und `Again` entzieht den Nachweis. Das Termindruck-Thema ist damit fachlich und interaktiv abgeschlossen.
- Ein neues Concept `Parameterinitialisierung fuer A1` und die Formelkarte `A1-Parameterinitialisierung` erklaeren die Handout-Regeln aus Abschnitt 3.3.1: Linear-Varianz `2/(d_in+d_out)` wird vor `trunc_normal_` zur Standardabweichung gewurzelt und auf `[-3sigma,3sigma]` begrenzt; Embeddings verwenden `std=1` und `[-3,3]`; der RMSNorm-Gain startet bei eins. Die Texte warnen davor, nach Truncation eine exakt empirische Varianz zu erwarten.
- RoPE ist jetzt A1-exakt: `theta_(i,k)=i/Theta^((2k-2)/d)`, benachbarte Paare `(2k-1,2k)` beziehungsweise `[0,1],[2,3],...`, Q/K vor `QK^T`, V unveraendert. Half-Split wird als testbrechende andere Konvention benannt; ein einziges geteiltes Modul haelt Sinus/Kosinus als `register_buffer(..., persistent=False)` und besitzt dafuer keine lernbaren Parameter.
- Das bestehende Python-Concept und die neue Formelkarte fuer Next-Token-Batches decken flache Token-Arrays, B zufaellige Starts aus `{0,...,n-m-1}`, die Slices `X=x[s:s+m]` und `Y=x[s+1:s+m+1]`, `np.memmap` beziehungsweise `np.load(..., mmap_mode='r')`, exakten gespeicherten dtype, Vokabular-Sanity-Checks und den exklusiven Off-by-one-Rand `n-m` ab. Die A1-Missions `tensor-primitives` und `training-state` verknuepfen diese Nachweise explizit.
- Regressionen in `scripts/check-i18n.mjs` schuetzen beide Sprachen gegen semantischen Drift bei Standardabweichung/Varianz, Initialisierungsgrenzen, RoPE-Division, Adjacent- statt Half-Split-Pairing, Shared-Buffer-Lifecycle, Memory Mapping, dtype, Startindex und Targetverschiebung. Der Bestand umfasst nun 65 Concepts und 72 Formeln; 71 Symbole, 70 Glossareintraege, 20 Labs und 29 Missions bleiben unveraendert.
- Verifiziert: `node scripts/check-i18n.mjs`, JavaScript-Syntax, `git diff --check` und reproduzierbarer `_site`-Build sind gruen. Browserpruefungen zeigen alle drei Inhalte auf Deutsch und Englisch, erhalten die geoeffnete Seite beim Sprachwechsel und erzeugen bei mobiler Breite weder Seiten- noch Formelueberlauf; die Konsole blieb ohne Fehler oder Warnungen.
- Service-Worker-Cache und Sprachbundle wurden auf Version 30 angehoben. Der Iteration Counter bleibt 1, da diese Umsetzung manuell/interaktiv gestartet wurde.

## 2026-07-16 - Coverage-Nachweise und restliche Assignment-Cluster geschlossen

- Status: Die konkret offenen Luecken fuer Coverage Map, A1, A2, A3, MoE und A5 sind lokal umgesetzt und verifiziert; kein Commit und kein Deployment ausgefuehrt.
- Die Coverage Map zeigt fuer jede der 17 Lectures genau drei explizite, direkt oeffnende Nachweise: beginner-freundliche Erklaerung, Formel beziehungsweise Mechanik und objektiven Transfer. Jeder Eintrag nennt den seitengenauen Lecture-Anker; die alten Concept-, Formel- und Lab-Zaehler sind entfernt und regressionsgeschuetzt.
- A1 ergaenzt das vollstaendige Parameter- und Forward-FLOP-Ledger. Das feste Gate prueft fuer `V=1000`, `D=64`, `F=192`, `L=3`, `T=32` exakt `288192` Parameter, `3670016` FLOPs pro Block und `15106048` Gesamt-FLOPs.
- A2 ergaenzt zweidimensionale Triton-Grid-, Masken- und Partial-Buffer-Vertraege, FlashAttention-Backward mit `Drow`, `P`, `dS`, `dQ`, `dK`, `dV` und Zeilensummen-Invariante sowie Distributed Runtime mit Process Groups, World Size, Global Batch, Async-Lifetime, Collective-Reihenfolge, Ring-Volumen und overlap-bewusstem Critical Path.
- A3 ergaenzt `N_opt(C)`, `D_opt(C)` und `L_opt(C)` mit Offset-Fit und Sensitivitaet, die Lecture-11-Rollenregeln der Maximum Update Parametrization (muP) sowie die Finalitaetsgrenze von Warmup-Stable-Decay (WSD). MoE trennt Top-k-Normalisierung, Expert Capacity, Overflow, Auxiliary Loss und Device-Auslastung.
- A5 unterscheidet Standard-, Constant-, Dr.-GRPO-, Reinforce-Like Fine-Tuning- und MaxRL-Varianten, exakte Sequenzgewichte und den stabileren Group-Sequence-Policy-Optimization-Surrogate (GSPO), erklaert den RLVR-Systemzyklus und prueft Response-Masken sowie die vier Policy-/Reference-Log-Probabilities von Direct Preference Optimization (DPO).
- Verifiziert: `scripts/check-i18n.mjs` schuetzt 17 Lecture-Einheiten, sechs neue objektive Gates, feste Antwortschluessel und numerische Invarianten in beiden Sprachen. Der Browser belegte Lecture 2 und Lecture 16 mit den drei Nachweisarten, bestand die A1- und A5-Gates, erhielt Antworten und Ergebnis beim Sprachwechsel, zeigte bei 390 x 844 Pixeln keinen horizontalen Ueberlauf und meldete keine Fehler oder Warnungen.
- Der Bestand umfasst 71 Concepts, 79 Formeln, 71 Symbole, 70 Glossareintraege, 26 Labs, 29 Missions und 1139 UI-Texte. Service-Worker-Cache und Sprachbundle stehen auf Version 31. Der Iteration Counter bleibt 1, da dieser Run manuell/interaktiv gestartet wurde.

## 2026-07-16 - Deep Review und Coverage-Quellenfehler korrigiert

- Status: Review, Korrektur und lokale Verifikation abgeschlossen; fuer Commit und Push freigegeben.
- Der Review fand fuenf konkrete Traceability-Verletzungen in drei Lecture-Zeilen: Das Lecture-2-Accounting-Lab zeigte seine Lecture-2-Quelle nicht; Lecture 13 verwendete faelschlich die erst in Lecture 14 behandelte DSIR-Formel; und die drei DPO-Nachweise fuer Lecture 15 nannten Lecture 15 nicht beziehungsweise oeffneten ein allgemeines Evaluation-Lab.
- PDF-Abgleich: Lecture 13, Seiten 5 bis 7 behandeln Crawl-, CCNet-, C4- und GPT-3-Filterpipelines, nicht DSIR. Lecture 15, Seiten 54 bis 56 fuehren von Alternativen zu PPO direkt in DPO und dessen RLHF-Herleitung.
- Korrektur: Lecture 13 zeigt nun Webdaten-Pipeline, Quality-Filtering-Mechanik und Datenpipeline-Transfer auf Seiten 1 bis 7. Lecture 15 verknuepft DPO-Concept, DPO-Formel und den vorhandenen DPO-Systemtransfer. Die betroffenen Module, das DPO-Concept und die DPO-Formel nennen die jeweiligen Lectures sichtbar als Quellen.
- `scripts/check-i18n.mjs` prueft jetzt fail-closed, dass jeder der 51 Coverage-Nachweise seine behauptete Lecture als Quelle fuehrt. Objektive Labs pruefen zusaetzlich eindeutige und zwischen Deutsch und Englisch identische Option-IDs.
- Verifiziert: Locale-/Semantikcheck, JavaScript-Syntax, sauberer Diff und Browser-Smoke fuer alle sechs neuen Gates. Die Coverage Map besitzt 17 Zeilen und 51 aufloesbare Nachweisbuttons; die korrigierten Lecture-2-, Lecture-13- und Lecture-15-Ziele zeigen ihre Quelle im Browser. Desktop und 390-Pixel-Ansicht laufen ohne horizontalen Ueberlauf, die Browserkonsole bleibt ohne Fehler oder Warnungen.
- Service-Worker-Cache und Sprachbundle stehen auf Version 32. Der Iteration Counter bleibt 1, da dieser Run manuell/interaktiv gestartet wurde.

## 2026-07-16 - Beginner-first Orientierung und aufgeteilte Datenpipeline

- Status: Die beanstandete fehlende Einordnung der Concept-Texte ist lokal systemisch korrigiert und statisch sowie im Browser verifiziert; Commit, Push und Deployment stehen noch aus.
- Alle 72 Concepts beginnen nun vor Mental Model und Schrittfolge mit drei direkt sichtbaren Antworten: Worum geht es, wo liegt das Thema in der gesamten Lern- oder Ausfuehrungskette, und welche konkrete Fehlfolge verhindert das Wissen. Direkte Deep Links setzen keinen vorherigen Seitenbesuch voraus.
- Der ueberladene Python-Block wurde getrennt: `Python-Datenvertraege` fuehrt von Rohdokumenten ueber `str`, UTF-8-Bytes und Streaming bis zur verlaesslichen Tokenizer-Eingabe; das neue Concept `token-array-loading` beginnt erst bei den gespeicherten Token-IDs und endet bei den um eins verschobenen PyTorch-Batches. Counter und reguläre Ausdruecke nennen jetzt ihre konkrete Rolle beim Paarzaehlen und bei der Pretokenisierung.
- Explizite Primer erklaeren auf der Beispielseite unter anderem Byte-Pair Encoding (BPE), Unicode, UTF-8, Iterator/Generator, Counter, regulaere Ausdruecke und Input/Output (I/O). Das Batch-Concept definiert Token-ID, Batch, Kontextlaenge, Input/Target, Memory Mapping, NPY, dtype und `torch.long`, bevor Formeln oder Slices erscheinen.
- Die vorherige automatische Glossarsuche ueber beliebige Teilwoerter ist entfernt. Eine kontrollierte zweisprachige Abkuerzungsliste und lokale Concept-Begriffe speisen die sichtbaren maximal acht Primer; das Matching ist bei Akronymen gross-/kleinschreibungssensitiv. Dadurch kann `Zero-shot` nicht mehr den unpassenden `ZeRO`-Eintrag ausloesen.
- Der Token-Dateivertrag ist fachlich nachgeschaerft: dtype und Byte-Reihenfolge gehoeren zum Rohformat, `V-1<=np.iinfo(dtype).max` wird vor dem Cast geprueft, und ein bereits als `uint16` ueberlaufener Wert wird nicht faelschlich durch einen spaeteren Range-Check als sicher bewertet. Ein noetiger Vollscan erfolgt bewusst stueckweise; `min(x)` und `max(x)` werden nicht im normalen Batchpfad ausgefuehrt. Die Slice-Invariante ist eindeutig pro Beispiel als `Y_b[:-1]=X_b[1:]` notiert.
- Vier vorhandene Lernpfad-Reihenfolgen folgen nun ihren Voraussetzungen: Kernel-Vertraege vor FlashAttention, Distributed Runtime vor Collectives, Skalierungsoptima vor praktischer Skalierung sowie Off-Policy-Grundlagen vor GRPO-Varianten.
- Verifiziert: Locale-/Semantikcheck fuer 72 Concepts, 79 Formeln, 71 Symbole, 70 Glossareintraege, 26 Labs, 29 Missions und 1144 UI-Texte; JavaScript-Syntax, sauberer Diff und reproduzierbarer `_site`-Build. Browserchecks belegen Deutsch und Englisch, direkte Concept-Routen, Sprachwechsel ohne Routenverlust, korrekte Primer, 390-Pixel-Layout ohne horizontalen Ueberlauf und keine unpassende `ZeRO`-Erklaerung bei `Zero-shot`.
- Service-Worker-Cache und Sprachbundle stehen auf Version 35. Der Iteration Counter bleibt 1, da dieser Run manuell/interaktiv gestartet wurde.

## 2026-07-17 - Lecture-first-Neukonzeption ohne Schein-Evidence (manueller Run)

- Status: Die Neukonzeption und lokale Verifikation sind abgeschlossen.
- Der kanonische Lernweg folgt jetzt Lectures 1 bis 17 statt 13 internen Modulen. Jede Lecture besitzt eine eigene zweisprachige Seite mit einfacher Einordnung, konkreter Relevanz, Lernzielen, lokal erklaerten Voraussetzungen, kuratierten Kernkonzepten, Formeln samt Symbolen und Beispielen, passenden Experimenten sowie dem Original-PDF mit korrigiertem Seitenanker.
- Freitext-Evidence, Mission- und Modul-Gates, manuelle Concept-Level, pauschale Lab-Haken, Hypothesen-Freischaltungen und der sichtbare `Learn -> Recall -> Apply`-Vertrag sind entfernt. Alte Zustandsfelder bleiben ausschliesslich zur verlustfreien Synchronisations- und Downgrade-Kompatibilitaet erhalten und werden nicht mehr als Kompetenz ausgewertet oder angezeigt.
- Assignment 1 bis 5 zeigen die 29 Handout-Zuordnungen als erklaerende Themenbloecke mit Original-Scope, benoetigter Idee, Pruefstrategie, Fehlerspur, Meilensteinen und direkt zugaenglichen Hinweisen. Es gibt keine Zeichenlaengen- oder Checkbox-Readiness mehr.
- Der optionale Grundlagencheck verwendet nur feste Multiple-Choice-Antworten, schaltet nichts frei und empfiehlt lediglich Auffrischungen. Abrufbewertungen sortieren nur weitere Uebungskarten. Labs ohne festen Antwortschluessel behaupten keinen Abschluss; objektive Kurzchecks bleiben lokales Feedback fuer genau die gepruefte Aufgabe.
- Der fachliche Quellenabgleich korrigiert insbesondere die Lecture-Anker fuer Lectures 1, 5, 7, 9, 13, 14, 15 und 16, entfernt FlashAttention-Backward aus Lecture 5 und ergaenzt das Alignment-Symbol `beta`. Lecture 16 erklaert Policy Gradient lokal als Voraussetzung, statt dieses Vorwissen stillschweigend anzunehmen.
- Verifiziert: `scripts/check-i18n.mjs` prueft 17 vollstaendige zweisprachige Lecture-Guides, 72 Concepts, 79 Formeln, 72 Symbole, 70 Glossareintraege, 26 Labs, 29 Handout-Zuordnungen und 1047 aktive UI-Texte. Inline-JavaScript, reproduzierbarer `_site`-Build und `git diff --check` sind sauber. Der Browser oeffnet alle 17 Lecture-Seiten mit Kontext, Relevanz, Lernzielen und erklaerten Voraussetzungen; direkte Voraussetzung- und Concept-Links behalten den jeweiligen Lecture-Kontext. Deutsch und Englisch, Lecture 5 ohne FlashAttention-Backward, der reine Multiple-Choice-Grundlagencheck, optionale Notizen ohne Wertung sowie 390 x 844 Pixel ohne horizontalen Ueberlauf sind geprueft. Die Konsole blieb ohne Fehler oder Warnungen.
- Service-Worker-Cache und Sprachbundle stehen auf Version 38. Der Iteration Counter bleibt 1, da dieser Run manuell/interaktiv gestartet wurde.

## 2026-07-17 - Beispiel-vor-Formel-Redesign (manueller Run)

- Status: Der didaktische Darstellungsvertrag und die vollstaendige lokale Abschlussverifikation sind abgeschlossen; Commit, Push und Produktionspruefung erfolgen unmittelbar in diesem Run.
- Formelerklaerungen folgen verbindlich der Reihenfolge `konkretes Problem und praktischer Zweck -> Namen und Symbole in Alltagssprache -> kleines vollstaendig gerechnetes Zahlenbeispiel -> allgemeine Formel -> Intuition und Fallstrick`. Damit kann die Kursnotation nicht mehr vor ihrer Bedeutung und einem nachvollziehbaren Fall erscheinen.
- Geschlossene Formelkarten zeigen Titel, sofortige Abkuerzungserklaerungen und den praktischen Zweck, aber keine Gleichung. Geoeffnete Formelvertiefungen und Lab-Primer stellen Erklaerung und Zahlenbeispiel vor die allgemeine Formel.
- Conceptseiten ohne kuratierte Formel beginnen vor den technischen Details mit einer konkreten Frage und ihrer nachvollziehbaren Erklaerung; damit faellt der Beispielschritt auch in prozesslastigen Lectures nicht leer aus.
- Conceptseiten im Kontext einer Lecture zeigen nur die fuer diese Lecture kuratierten Formeln. Verknuepfte Concepts koennen dadurch keine weiteren, fuer die Lecture nicht ausgewaehlten Gleichungen einschleusen.
- Assignment 1 bis 5 erklaeren ihre Voraussetzungen vor den Themenbloecken in einfachen Worten und mit Beispielen. Konzept- und Formelwege stehen vor der technischen Aufgabenreferenz; der rohe Handout-Scope erscheint zuletzt.
- Die in der Lecture-first-Neukonzeption entfernte Freitext-Evidence bleibt entfernt. Freie Eingaben, Seitenaufrufe, Klicks und manuelle Haken erzeugen weiterhin weder Kompetenznachweis noch Readiness.
- Verifiziert: Alle 79 Formelkarten besitzen in beiden Sprachen einen Zahlenfall mit sichtbarer Rechnung und Ergebnis; der Regressionstest deckt Reihenfolge, Symbolerklaerungen, geschlossene Karten, Lecture-Kuratierung und alle 29 Assignment-Themen ab. Im Browser folgen Parameterinitialisierung und Assignment 1 dem neuen Erklaerpfad, enthalten keine Schein-Evidence und laufen bei 390 x 844 Pixeln ohne horizontalen Ueberlauf; die Konsole blieb ohne Fehler oder Warnungen.
- Ein abschliessender Sprachreview fand noch stillschweigend vorausgesetzte Operatoren sowie vier zu knapp gerechnete Beispiele. Die zentrale Notationshilfe erklaert nun unter anderem `~`, `N(...)`, `∈` und `√` vor der Regel; Parameterinitialisierung zeigt die vollstaendige Einsetzung `2/(d_in+d_out)=2/(2+6)=2/8`, und Linear Layer, Residualupdate sowie MFU rechnen jeden Schritt sichtbar aus. Geschlossene Karten schreiben alle im Zweck verwendeten erkannten Abkuerzungen aus.
- Service-Worker-Cache und Sprachbundle werden auf Version 41 angehoben. Der Iteration Counter bleibt 1, da dieser Run manuell/interaktiv gestartet wurde.

## 2026-07-29 - Vollstaendige Seitenposition innerhalb einer Lecture (manueller Run)

- Status: lokal umgesetzt und verifiziert; kein Commit, Push oder Deployment ausgefuehrt.
- Produktionsdiagnose: Commit `be6b6c7` und Service-Worker-Version 51 waren bereits live, zaehlten aber nur die drei Kernkonzepte von Lecture 1. Vorgeschaltete Lernseiten konnten deshalb weiterhin ohne Seitenzahl erscheinen.
- Die Seitenfolge umfasst nun alle navigierbaren Konzeptseiten einer Lecture: zuerst Voraussetzungskonzepte, die nicht ohnehin Kernkonzept sind, danach die kuratierten Kernkonzepte ohne Duplikate. Jede Seite zeigt direkt in der Kopfzeile `Lecture N · Seite X / Y · Level`.
- Ein kompakter segmentierter Streifen wiederholt die Seitenzahl und markiert genau die aktuelle Seite, ohne vorherige Seiten als abgeschlossen darzustellen. Der Weiter-Button nennt die kommende Seitenzahl, beispielsweise `Naechste Seite · 3 / 4`.
- Deutsch und Englisch sind vollstaendig abgedeckt. Ein Regressionstest sichert die deduplizierte Lecture-Seitenfolge, Kopfzeile, Positionsstreifen, aktuelle Segmentmarkierung und Seitenzahl im Weiter-Button.
- Verifiziert: Locale- und Semantikcheck fuer 75 Concepts, 79 Formeln, 72 Symbole, 70 Glossareintraege, 27 Labs, 29 Missions und 1102 UI-Texte; Inline-JavaScript und Service Worker parsen; reproduzierbarer `_site`-Build und `git diff --check` sind sauber.
- Browserpruefung: Lecture 1 zeigt im vollstaendigen Ablauf korrekt `1 / 4`, `2 / 4`, `3 / 4` und `4 / 4`; der Weiter-Button wechselt von der vorgeschalteten Seite 1 auf Seite 2. Deutsch und Englisch, 390 x 844 Pixel ohne horizontalen Ueberlauf und eine leere Fehler-/Warnungskonsole wurden geprueft.
- Service-Worker-Cache und Sprachbundle stehen auf Version 52. Der Iteration Counter bleibt 1, da dieser Run manuell/interaktiv gestartet wurde.

## 2026-08-27 - Der Test, den A1 nennt, hat nie jemand laufen lassen (geplanter Deep Review, v85)

- Gegenprobe zum vermuteten Hebel aus v84: alle 375 numerischen Strings deutsch gegen englisch geprueft, genau eine echte Abweichung gefunden. Der Hebel war praeventiv, nicht kurativ.
- Befund stattdessen ueber die eigenen Guards: 11 der 124 Probleme werden ueber den Lecture-Pfad nie erreichbar, 9 davon in A1. `causal-mask` entscheidet zwei der groessten A1-Probleme, wird von keiner Lecture gelehrt und war das einzige Selbststudium-Konzept ohne Lab.
- Neues Lab `causal-invariance`: fuenf Maskenvarianten gegen drei Tests. Der Test, den A1s Mission selbst nennt, findet eine von vier; "nach Softmax maskiert" ist vollkommen kausal, und die vergessene Diagonale mit endlichem Platzhalter ist nur bei voller Testtiefe zu sehen (12 von 15 Sondenpositionen sind fuer die enge Lesart blind). Grund hergeleitet: softmax(x+c) = softmax(x), also gibt eine voll maskierte Zeile die unmaskierte Verteilung zurueck.
- Modus B rechnet die bisher nur behauptete Leakage-Folge: die korrekte Maske hat bei jeder Sequenzlaenge den hoechsten Loss aller fuenf Varianten. Der Loss ordnet frische Implementierungen falsch.
- Selbststudium-Abschnitt bietet jetzt zu fuenf von sechs Konzepten das Lab an, das sie durchrechnet.
- Repo-weiter Guard `english numerals` ueber Ziffernfolgen: 372 Strings, 1.293 Folgen beidseitig identisch.
- Pruefung: alle Guards gruen (41 s), render coverage 6.757 auf 7.657 Zustaende ueber 12 Labs, beide Sprachen headless ueber 420 Zustaende, 612 DOM-IDs ohne Duplikat. Mutationstest 19 Mutationen; der erste Lauf war durch gleichzeitige Edits ungueltig und wurde wiederholt, die eine Entkommene (Invarianzschwelle) als inert nachgewiesen und ihre Marge direkt geguardet.

## 2026-08-31 - Die Formelkarte, zu der der Weg nicht fuehrt (geplanter Deep Review, v89)

- Kettenkopf war nicht der zugewiesene Worktree: dieser stand auf `4067294`, der Kopf auf `01764fe` (v88). Fast-Forward statt Merge, keine fremde Session aktiv.
- Zwei Gegenproben ohne Befund: die Guard-Zeile "50 of 124 with adapter/test handles" ist kein Loch (48 der 58 Code-Probleme tragen sie, die zehn uebrigen sind Skript-/Experimentprobleme ohne Adapter im Handout), und `lm-objective` entscheidet laut `PROBLEM_CONCEPTS` 0 der 124 Probleme, bleibt also zu Recht hinten einsortiert.
- Befund: Wer Lecture 1 bis 17 durchgeht, erreicht nur 68 der 79 Formelkarten. Elf liegen ausserhalb beider Renderflaechen (Lecture-Seite und gefilterte Konzeptseite) und sind nur ueber Tafelwerk oder Assignment-Seite zu finden - also am Problem statt davor. Darunter `mfu`, an dem 14 Handout-Probleme mit 56 Punkten haengen, und die gesamte Filter-Haelfte von Lecture 14.
- Ursache: `conceptFormulaIds` filtert die Formeln eines Konzepts auf die kuratierte Liste der Lecture; vier Lectures fuehrten eine unvollstaendige Liste. Die Karten selbst waren vollstaendig und zweisprachig vorhanden.
- Alle 17 Quell-PDFs im Volltext geprueft: neun der elf Karten werden von der Lecture, die ihr Konzept fuehrt, woertlich hergeleitet (L02 hat fuer MFU eine eigene Abschnittsueberschrift, L10 rechnet `intensity == S*T / (S + T)`, L14 hat die Abschnitte `fasttext_main()` und `dsir_main()`). Die restlichen zwei gehoeren nicht auf den Pfad: "gradient clip" hat in allen siebzehn PDFs null Treffer.
- Unabhaengige Bestaetigung aus den Daten der App: alle zwoelf Karten nannten in ihrem eigenen `sources`-Feld bereits genau die Lecture, auf die die PDFs sie legen; die beiden off-path-Karten nennen `a1` und keine Lecture.
- Geaendert: die kuratierten Formellisten von L02 (4 auf 8), L03 (8 auf 9), L10 (3 auf 7) und L14 (4 auf 7). Erreichbar auf dem Pfad jetzt 77 von 79, ohne dass eine Karte ihre Erreichbarkeit verliert.
- Drei Arbeitsbeispiele wechseln dadurch auf die Gleichung, die ihre Lecture wirklich herleitet: L02 `resource-accounting` von 12*L*d^2 (A3s Formel, in keiner Lecture) auf 6ND, L02 `training-loop` auf `mfu`, L03 `probability` auf `softmax`.
- Neuer Guard-Block `lecture formulas`: rechnet die Erreichbarkeit mit `lectureLearningPages` und `conceptFormulaIds` der App selbst (per `sliceDeclaration` geschnitten, nicht nachgetippt), haelt beide Renderflaechen und den Primer-Fallback im Quelltext fest, bindet die zwei Ausnahmen daran, dass `causal-mask` und `clipping` Konzepte ohne Lecture bleiben, und nagelt sechs Arbeitsbeispiele fest.
- Der Mutationstest zeigte, dass das Repo die eine Richtung laengst prueft ("wer kuratiert, muss zitieren"); die fehlende Gegenrichtung - "wer eine Lecture zitiert, muss auf dem Pfad erscheinen" - schliesst dieser Block.
- Pruefung: Guard-Suite 36 auf 37 Bloecke, gruen. Mutationstest 13 echte Mutationen, 0 entkommen, Kontrolle gruen. Alle zwoelf neu kuratierten Karten inhaltlich vollstaendig und zweisprachig. Zwei abgeschossene Vordergrund-Mutationslaeufe liessen je eine Mutation im Arbeitsbaum stehen; beide wurden per `git diff` sofort bemerkt und zurueckgesetzt.
- Kein Cache-Bump noetig: `index.html` wird network-first ausgeliefert, `i18n-en.js` ist unveraendert.

## 2026-09-02 - Die Voraussetzung, die auf einen Link zeigte, den es nicht gab (geplanter Deep Review, v91)

- Kettenkopf war wieder nicht der zugewiesene Worktree: dieser stand auf `4067294`, der Kopf auf `276dcb9` (v90). Fast-Forward statt Merge, keine fremde Session aktiv, Baseline 38 Guard-Bloecke gruen.
- Gegenprobe ohne Befund: die vier reinen Rechenaufgaben aus A2 §8 (`data_parallel_calcs`, `fsdp_calcs`, `tp_calcs`, `fsdp_tp_calcs`, zusammen 16 Punkte bei null GPU-Stunden) rechnet `comm-crossover` vollstaendig durch, inklusive 2D-Schranke als Produkt der Einzelschranken und dem Viertel davon bei geteilter Leitung.
- Befund, schaerfer als die Kennzahl aus v90: die Assignment-Seite verspricht im eigenen Fliesstext „Oeffne ein verknuepftes Konzept nur, wenn du mehr Details brauchst" - und `assignmentPrerequisitesMarkup` rendert kein einziges `data-open-concept`. 18 von 18 Karten ohne Link, waehrend 45 von 45 Lecture-Voraussetzungen ihn tragen.
- Gebaut: 39 Konzeptlinks auf 33 Konzeptseiten, in der Reihenfolge, in der die Karte ihre Ideen nennt. Jeder Link traegt ein Wort, das Karte und Konzeptseite woertlich teilen (`state_dict`, `All-Reduce`, `Speicherhierarchie`, `MinHash`, `Lograum`, `Kettenregel`, `Residu`, `Unsicherheit`). Wo kein Anker existierte, wurde nicht verlinkt: „Holdout", „Confounder" und „Multiprocessing" haben in keinem der 75 Konzepte einen Treffer und bleiben in der Kartenprosa erklaert.
- Jeder Knopf sagt zusaetzlich, wo die Idee zu Hause ist: `Lecture N`, `Modul 00` oder `Selbststudium` - 31 / 7 / 1. Das ist die Zeitersparnis: wer den Pfad gegangen ist, geht an 31 der 39 vorbei. Die Dreiteilung ist genau die, die der Selbststudium-Abschnitt derselben Seite schon benutzt.
- Neuer Guard-Block `assignment prerequisites` (298 Checks): beide Richtungen der Zuordnung, alle 78 Knoepfe als vollstaendiges Markup-Fragment aus dem echten Render zurueckgelesen (beide Sprachen), Reihenfolge, `accordion-actions`-Zeile als Kasten, Ortsschild fuer alle 75 Konzepte zweitens hergeleitet, alle drei Zweige muessen vorkommen, Ziffern und geschriebene Shapes beidseitig.
- Die Deutscherkennung laeuft hier ohne Umlautklasse, weil die a1-Karte „ä" absichtlich als Beispiel fuer ein Zeichen mit zwei UTF-8-Bytes zitiert; der Guard prueft vorher, dass die Klasse in der geteilten Regex noch am Anfang steht, und beweist per deutschem Kontrollrender, dass der Rest noch Deutsch sieht.
- Mutationstest: 24 echte Mutationen, 0 entkommen, Kontrolle in allen fuenf Laeufen gruen. Drei Entkommene aus fruehen Runden wurden behandelt: Knoepfe ausserhalb der Aktionszeile (Guard verschaerft), geaenderte Ziffer im englischen Kartentext (v84s Ziffernregel jetzt auch hier, erweitert um Shapes wie `[B,T,D]`), und ein Synonymtausch im englischen `explain` als bewusste Grenze dokumentiert - Uebersetzungstreue hat im Repo keinen Pruefer, ausgeschriebene Zahlen braeuchten ein Woerterbuch.
- Pruefung: Guard-Suite 38 auf 39 Bloecke, gruen (46 s), `node scripts/build-site.mjs` gruen. Kein Cache-Bump noetig, `i18n-en.js` unveraendert.
- Neuer groesster offener Hebel, dabei gemessen: eine Konzeptseite bietet kein einziges Experiment an. `data-open-lab` kommt im ganzen Markup viermal vor, `renderConceptDetail` ist keine dieser Stellen. Genau deshalb baut sich der Selbststudium-Abschnitt seinen eigenen Uebungsknopf ueber `SELF_STUDY_LABS`. `LABS` traegt kein `concepts`-Feld; das ist die Datenluecke, die zuerst zu schliessen ist.

## 2026-09-03 - Der Absturz, den kein Guard sehen konnte (v94)

- Letzter offener Hebel aus v90: `render coverage` erreichte 13 von 58 Labs. Die uebrigen 45 lesen ihre Regler selbst per `document.getElementById`, waren also headless nicht aufrufbar - und "der Guard ist gruen" sagte ueber sie nichts.
- Statt 45 Labs umzubauen bekommt der Guard einen DOM: das gesamte Seitenskript wird mit einem kleinen Stub ausgewertet (getElementById, value, innerHTML, hidden, options), danach laufen `labMarkup()` und `initLab()` genau wie im Browser. Null Aenderung an der App noetig.
- **Sofortiger Fund: `fmtNum` im Lab `resources` stand als `returnfixedNum(...)` - `return` und der Helfername ohne Leerzeichen dazwischen.** Der Bezeichner existiert nicht, das Lab wirft eine ReferenceError fuer jeden Wert ab einer Million. Jedes realistische Modell ist darueber. Der Fehler stand auch auf `origin/main`, war also live. Behoben.
- Zweiter Fund, kein Fehler: `decode-sampling` druckt im Englischen "undefined", weil die App "nicht definiert" korrekt so uebersetzt. Die Regel vergleicht deshalb beide Sprachen gegeneinander - Englisch darf das Wort nur so oft tragen, wie Deutsch "nicht definiert" sagt, und Deutsch nie.
- Neuer Guard-Block `lab render sweep`: 1.006 Renders ueber 50 der 58 Labs in beiden Sprachen. Jeder Zustand tag-balanciert (19 Tagpaare), ohne uninterpoliertes `${`, ohne Deutsch im englischen Render; 133 von 175 Bedienelementen bewegen ihr Lab nachweislich. Die acht Labs ohne berechnete Buehne stehen namentlich im Guard.
- Die Reglerliste kommt aus dem `initLab`-Zweig des Labs selbst, nicht aus der Markup-Form: die `<select>` eines Kurzchecks sind Bedienelemente, sollen die Buehne aber nicht bewegen (alle fuenf von `scaling-fit` sind Antwortfelder). Und wo nichts sich bewegt, faehrt der Sweep das Lab ueber seine eigenen Weiter-Knoepfe durch die Schritte - `dedup-pipeline`s Schwelle wirkt erst ab Schritt fuenf.
- Begriffsliste `unicode`/hexadezimal neu formuliert: die alte Fassung sagte nur "jede Stelle zaehlt das Sechzehnfache der Stelle rechts daneben" und zeigte ein einziges zweistelliges Beispiel, sodass die Potenzen von 16 nie sichtbar wurden. Jetzt stehen 16^0/16^1/16^2 ausgeschrieben und ein dreistelliges Beispiel daneben (963 hex = 9*256 + 6*16 + 3 = 2.403). `check-term-examples.py`: 150 Begriffslisten, 0 falsche Gleichungen.
- Pruefung: Guard-Suite 43 auf 44 Bloecke gruen, Build gruen, sw-Cache auf v76. Mutationstest 6 Mutationen, 0 entkommen, Kontrolle in zwei Laeufen gruen; zwei erste Anlaeufe waren untaugliche Mutationen (Anker zweimal vorhanden, kaputte Komma-Kette) und wurden ersetzt statt als bestanden gezaehlt.
## 2026-09-03 - Zwei Loader in einem Assignment, und die Konzeptseite beschrieb den falschen (geplanter Deep Review, v94)

- Kettenkopf war wieder nicht der zugewiesene Worktree: dieser stand auf `4067294`, der Kopf auf `b056c10` (v93) in `lucid-turing-e88a7f`. Fast-Forward statt Merge; die fremde Session war zuletzt am 02.09. aktiv, ihr Arbeitsbaum traegt eine ungebundene Aenderung, die nicht angefasst wurde. Baseline 43 Guard-Bloecke gruen (50 s).
- Gegenprobe zuerst: alle 124 Handout-Probleme gegen `PROBLEM_CONCEPTS` und `LAB_CONCEPTS`. Nur drei Probleme haben ueberhaupt kein Lab (`a4:mask_pii`, `a5:look_at_sft`, `a5:sft`), zusammen 13 Punkte - davon 10 auf dem Konzept `sft`, an dem ausserdem `a5:data_loading` und alles Nachgelagerte bis DPO haengt.
- Befund im Handout selbst (A5-Supplement §4.2.1, per `pdftotext` gelesen): der SFT-Loader verkettet alle Dokumente zu einem Tokenstrom, trennt mit dem Endetoken, schneidet Bloecke der Laenge m und wirft den unvollstaendigen Rest weg. `__getitem__` gibt genau `input_ids` und `labels` zurueck - kein Maskenfeld -, und der Trainingscode ist `F.cross_entropy` ueber alles. Die Konzeptseite `sft` beschrieb daneben das Lehrbuchrezept: Antwortmaske und blockdiagonale Aufmerksamkeit, woertlich "ohne dass sich die Gespraeche gegenseitig beeinflussen". Beides stand nebeneinander, keine Zahl dazu.
- Die response_mask der App gehoert nachweislich zum anderen Loader: `tokenize_prompt_and_output` aus A5 §5 (RLVR) verlangt sie ausdruecklich. Zwei Loader, dasselbe Assignment.
- Neues Lab `sft-packing` (Modul `alignment`, 17 min, zwei Modi). Modus A rechnet die Lossmasse: im Beispiel der Konzeptseite selbst (500 Prompt-, 100 Antworttokens) entfallen 84,0442 % der Zielpositionen auf Template und Prompt, Verhaeltnis 5,2673 zu 1, waehrend ein maskierter Loss ueber 101 Positionen liefe. Der Anteil ist eine Eigenschaft des Korpus, nicht des Verfahrens (41,1207 % bei UltraChat-Laengen) und haengt mit hoechstens 4,0582 Punkten an der Templategroesse.
- Der strukturelle Teil von Modus A: es gibt kein Maskenfeld in der vorgeschriebenen Rueckgabe, und die Prompt-Antwort-Grenze traegt im Tokenstrom kein eigenes Zeichen - das Endetoken trennt Dokumente, nicht Prompt von Antwort. Eine Antwortmaske ist in dieser Schnittstelle also nicht implementierbar, ohne genau das zu aendern, was `test_packed_sft_dataset` prueft.
- Modus B rechnet das Packen. `__len__` ist `⌊(n − 1)/m⌋` und nicht `⌊n/m⌋`, weil die Labels eines Blocks ein Token weiter reichen; die beiden Regeln unterscheiden sich genau dann, wenn m die Zahl n teilt. Das Beispiel des Handouts (token_ids [0 … 10], seq_length 4) gibt unter beiden Regeln zwei Bloecke zurueck und kann die Frage deshalb nicht klaeren - ebenso wenig wie eine der neun Einstellungen, die das Lab anbietet. Ein Schalter kuerzt den Strom auf ein Vielfaches von m: dann trennen alle neun.
- Jede Zielposition faellt in genau eine von drei disjunkten Klassen: fremdes Dokument im Kontext, ohne den eigenen Anfang, oder das eigene Dokument von vorn und allein. Bei m = 512 und UltraChat-Laengen sind das 48,1771 % / 40,7118 % / 11,1111 %. Kurze Bloecke tauschen die erste Klasse gegen die zweite (bei m = 64: 4,9167 % / 92,4167 %), und die dritte bleibt in jedem Fall klein, weil ein Block nur dann sauber beginnt, wenn seine Grenze auf einen Dokumentanfang faellt.
- Die Konzeptseite `sft` sagt jetzt, was die Maske entscheidet und dass A5 §4.2.1 keine verlangt; die alte Behauptung ist raus, und ein Guard haelt beide Richtungen in beiden Sprachen fest.
- Neuer Guard-Block `sft packing` (16.177 Checks): Dokumentmodell, beide Laengenregeln und die drei Kontextklassen sind aus den Definitionen neu getippt statt aus der App gelesen; die Teilbarkeitsaussage ist ueber 15.561 Paare brute-force bewiesen; das Zitat der Korpusnote muss woertlich auf der Konzeptseite stehen; 54 Einstellungen pruefen die Partition; die 12,5000-%-Schranke wird nach oben und nach unten gehalten, damit sie nicht ueberzeichnet.
- Zweiter, repo-weiter Guard `content numerals`: `english numerals` (v85) sieht nur Strings, die durch `tr()` laufen - die Inhaltspakete (Labkarten, Konzeptbegriffe, Formelantworten) pruefte auf Zahlen nichts. Der neue Block vergleicht die Ziffernfolgen aller 840 numerischen uebersetzten Felder, nachdem Gruppierungs- und Dezimaltrenner zwischen Ziffern entfernt sind, und vergleicht die **Mengen** statt der Multimengen, damit eine Wiederholung in der Uebersetzung kein Fehlalarm ist.
- Er fand acht bestehende Stellen, an denen der englische Leser - und Englisch ist die Standardsprache - andere Zahlen sieht als der deutsche: `data-pipeline` zeigte ein anderes Unicode-Beispiel (U+0065/U+0301 statt U+0061/U+0308), `bloom-filters`, `dedup` und `benchmark-validity` liessen die Zwischenschritte der vorgerechneten Beispiele weg (darunter genau die, die `1e71662` auf der deutschen Seite ergaenzt hatte), `kv-serving` und `rlvr-systems` liessen je eine Zahl fallen, `roofline` nannte einen Datentyp nur englisch, und `formulas.importance-resampling` liess im Englischen den ganzen Schlusssatz mit den normalisierten Gewichten weg. Alle acht sind repariert.
- Mutationstest: 24 echte Mutationen in drei Laeufen, 0 entkommen, Kontrolle jedes Mal gruen, Arbeitsbaum nach jedem Lauf per `git status` geprueft. Drei Entkommene aus Runde eins wurden behandelt statt weggeschrieben: die Konzeptseiten-Pruefung suchte ein Wort statt der Aussage (jetzt drei Aussagen plus eine verbotene), eine geaenderte englische Zahl in einer Labkarte fand niemand (jetzt `content numerals`), und die dritte Mutation war nachweislich inert - sie las eine Steuerung, ohne ihren Wert je auszugeben; die nicht-inerte Fassung derselben Mutation wird gefangen.
- Pruefung: Guard-Suite 43 auf 45 Bloecke, gruen. `render coverage` 8.617 auf 9.589 Zustaende ueber 14 Labs, `english render` dieselben 9.589 ohne deutschen Rest, `panel i18n` 49 auf 50 Panels, `renderer i18n` 1.831 auf 1.901 Strings. Cache-Bump auf v76, weil `i18n-en.js` sich geaendert hat; README auf 59 Labs und Version 76 nachgezogen.

## 2026-09-04 - Der englische Leser bekam das Ergebnis, der deutsche den Rechenweg (geplanter Deep Review, v96)

- Kettenkopf war erneut nicht der zugewiesene Worktree: dieser stand auf `4067294`, der Kopf auf `649c409` in `recursing-tesla-8fd256`. Sauberer Fast-Forward. Die fremde Session war zuletzt am 03.09. um 22:24 aktiv, ihr Arbeitsbaum ist sauber; nichts dort wurde angefasst. Baseline 45 Guard-Bloecke gruen (47 s).
- Gegenprobe zuerst, und sie fiel negativ aus: das Versprechen der Startseite, jede Formelkarte setze einen kleinen Zahlenfall vollstaendig ein und rechne ihn vor, halten alle 79 Karten - jede hat ein `example`, jedes mit Ziffern, 78 davon mit mindestens einem Gleichheitszeichen. Der vermutete Hebel war keiner.
- Der echte Hebel stand im v94-Report als offener Punkt eins: `content numerals` prueft, dass keine Zahl fehlt, aber nicht, dass ein vorgerechnetes Beispiel in beiden Sprachen **gleich viele Schritte** zeigt. Zwei Luecken, beide im Bestand offen.
- Erstens die Maskierung: `content numerals` vergleicht Ziffernmengen **je Feld**, und `concepts.X.terms` ist ein Feld mit acht Begriffspaaren. Der Ring-All-Reduce-Begriff druckte deutsch `2·(4-1)·100 / 4 = 2 · 3 · 25 = 150 MB` und englisch nur `= 150 MB`; die 25 blieb in der Feldmenge, weil ein Nachbarbegriff 25-MB-Buckets nennt. Dasselbe verdeckte in `perplexity-eval` eine verlorene 10.
- Zweitens die einstellige Arithmetik: `A = 1 - 0,125 = +0,875` und `A = +0.875` haben dieselben Ziffernfolgen ab zwei Stellen. Der englische Leser sah das Ergebnis einer Subtraktion, die die App ihm nie zeigte.
- Das Schrittmodell musste zweimal gebaut werden. Der erste Entwurf zaehlte Gleichheitszeichen mit einer Ziffer im Zeichenfenster und meldete 17 Treffer - 10 davon nur, weil deutsche Woerter laenger sind (`C = Durchsatz · 172800` gegen `C = throughput · 172800`). Das zweite Modell schneidet den Text in maximale Laeufe rein mathematischer Zeichen und zaehlt einen Lauf je Relationszeichen, wenn er eine Ziffer traegt; ein Buchstabe beendet den Lauf. Null Fehlalarme.
- Neuer Guard-Block `worked steps`: 6.845 Blattstrings paarweise, 597 davon mit zusammen 1.714 Rechenschritten, dazu 2.340 Ziffernfolgen **je Eintrag** statt je Feld.
- Elf reparierte Stellen, zehn auf der englischen Standardseite: Ring-All-Reduce-Zwischenschritt, GRPO-Subtraktion `1 - 0.125`, `σ_G = 0` (englisch stand dort „reward variance", also die Varianz statt der Standardabweichung), `rms(x) =` mit dem „statt 0", die Symbolbindungen `L = 12`/`L = 96` und `τ = 0.8` und `R = 1`, `p(w|h)=0` in `formulas.ngram-filter.answer`, `J=2/6` in `labs.dedup-pipeline.transferAnswer` und die 10-malige Kontamination in `perplexity-eval`. Die elfte lief andersherum: die deutsche RoPE-Erklaerung schrieb „vom ersten Paar (1,0)", was auf Deutsch wie eine Dezimalzahl liest und `k = 1` nie nennt - dort war das Englische vollstaendiger, und die deutsche Seite wurde nachgezogen.
- Mutationstest: 11 Inhaltsmutationen, alle gefangen, Kontrolle (nur ein Kommentar) gruen. Zwei Guard-schwaechende Mutationen entkamen und wurden gepaart aufgeloest statt weggeschrieben: mit abgeschaltetem Schrittvergleich faengt die Ziffernhaelfte den Ring-All-Reduce-Fall noch, die GRPO-Subtraktion aber nicht mehr - die Loeschung der eigenen Zusicherung kann ein Guard grundsaetzlich nicht selbst fangen, und die Paarung misst genau, was sie kostet. Die Untergrenze `wsWorked < 300` ist tragend: ein auf `[]` geleerter Feldwalk laeuft ohne sie gruen durch, mit ihr faellt er.
- Pruefung: Guard-Suite 45 auf 47 Bloecke gruen (der zweite kam ueber den Merge unten), `node scripts/build-site.mjs` gruen, Cache-Bump auf v79 (README nachgezogen), kein Browsertest (in geplanten Laeufen gesperrt).
- Zweiter Befund: **eine ganze Kette war verloren**. `8303fab` war die Vereinigung der beiden parallelen v94-Ketten; `649c409` wurde daneben auf nur einer von beiden gebaut und ist **kein Nachfahre des Merges**. Der juengste Commit war also nicht der Kettenkopf. Damit fehlten der Guard-Block `lab render sweep` (1.032 Renders ueber 51 der 59 Labs in beiden Sprachen), die neu gefasste Hexadezimal-Erklaerung und der Absturz, den dieser Guard gefunden hatte: `fmtNum` im Lab `resources` stand als `returnfixedNum(...)`, ein Bezeichner, den es nicht gibt - eine ReferenceError fuer jeden Wert ab einer Million, und jedes realistische Modell ist darueber. Der Fehler steht bis heute auf `origin/main`. `8303fab` ist gemergt; der einzige Konflikt lag in derselben Begriffsliste und wurde als Vereinigung aufgeloest, weil beide Seiten *verschiedene* Begriffe darin verbessert hatten.
- Dritter Befund, teils repariert: sieben Kurzcheck-Auswahlfelder in drei Labs boten ihre Antworten als feste Literale an (`0.25 / 0.50 / 0.75`), waehrend die Ledgerzeile daneben dieselbe Zahl durch `fixedNum` rechnet und dem deutschen Leser `0,500` druckt. Die Beschriftung laeuft jetzt durch `fixedNum`, der verglichene Wert steht unveraendert im `value`-Attribut - keine Antwortpruefung und kein gespeicherter Schluessel aendert sich. `lab render sweep` haelt das in beiden Sprachen fest.
- Der Rest desselben Befundes ist gemessen, aber bewusst **nicht** gefixt: 70 englische Dezimalpunkte in deutscher Prosa an 19 Stellen. Vier mechanische Anlaeufe wurden verworfen, jeder aus gemessenem Grund - naiv ersetzen macht aus `b=[0.5,1,−2]` das unlesbare `[0,5,1,−2]`; Klammerspannen ausnehmen liefert halb konvertierte Zeilen wie `0.5·2.924+(−1)·(−0,538)`; Alles-oder-nichts je String scheitert an einer Klammerheuristik, die `P(keep) = 0.001953125` fuer eine Liste haelt; und ein Veto auf jeden uebrigen Punkt scheitert an `≈1.503.` am Satzende, das die Regex gar nicht erst sieht. Der Kern ist die Sache selbst: das Komma ist im Deutschen Dezimal- und Listentrenner zugleich, und welche Rolle es spielt, entscheidet der Satz. Ein halber Sweep haette neue Widersprueche zwischen Formelkarte und Lab geschrieben.

## 2026-09-04 - Die letzten offenen Hebel, bis auf einen (Fortsetzung, v97/v98)

- Auftrag des Nutzers nach dem v96-Bericht: die englischen Dezimalpunkte in deutscher Prosa bleiben stehen, alles andere aus der Hebelliste schliessen. Drei von vier sind geschlossen, der vierte gemessen und begruendet offen.
- **v97, `target-shift`** schliesst `lm-objective` (offen seit v85). Modus A rechnet den kleinstmoeglichen Trainingsloss der vier Paarungsregeln: ohne Verschiebung ist das Target eine Kopie des Kontexts, die Abbildung also eine Funktion, und der Loss **exakt 0,000000** - der beste der vier, waehrend greedy dasselbe Token endlos erzeugt. Modus B rechnet A1s Indexgrenze: `i + m <= n - 1`, und die naive Grenze laesst genau einen Startindex mehr durch, immer genau einen, ueber 44.730 (n, m) beidseitig brute-force belegt. Deshalb verfehlen 1.000 gezogene Batches den Fehler bei n = 10.000 mit 90,2468 % und bei n = 100.000 mit 99,0024 %.
- Eine Behauptung des ersten Entwurfs hat die Messung nicht ueberlebt: „die Rueckwaertsverschiebung versteckt sich am besten" gilt in zwei von drei Texten, im Text mit Doppelungen liegt die um zwei verschobene mit 0,001330 dichter. Die Frage steht jetzt auf der Aussage, die haelt, und der Guard haelt die Zuordnung je Korpus fest.
- **v98, `mask-pii`** schliesst `a4:mask_pii` (offen seit v94). A4 prueft gegen den maskierten String, also ist die Spanne die Groesse und nicht der Fund: `\S+@\S+` findet alle drei Adressen und besteht keinen Test (33,3333 % gegen 100,0000 %), und dieselbe Adresse steht gleichzeitig unter „falsch maskiert" und „uebersehen". Die Bereichspruefung 0-255 hebt die IP-Precision von 66,6667 % auf 80,0000 % und kann `1.2.3.4` grundsaetzlich nicht entfernen, weil das eine gueltige IP ist. Modus B: der Korpus waechst beim Schwaerzen (+41 Zeichen), die Einstellung mit den wenigsten Instanzen zerstoert den meisten legitimen Text (10 Instanzen / 34 Zeichen gegen 12 / 19), und wer die Anzahl im Ergebnis zaehlt, bekommt 0 statt 12.
- Gegenprobe ohne Befund: die Reihenfolge der drei Masker aendert ueber alle sechs Reihenfolgen und drei Einstellungen nichts. Der geplante Modus darueber waere eine Behauptung ohne Inhalt gewesen; die Idempotenz steht jetzt trotzdem im Guard.
- **Neuer Block `cache version`**: Shell-Cachename, zwei `?v=`-Querys und der README-Satz muessen dieselbe Zahl tragen und duerfen nicht unter die hoechste in activity.md protokollierte fallen.
- Zwei Guard-Reparaturen, beide vom Mutationstest erzwungen: `chain-carry` und `causal-invariance` schnitten ihren Codeblock bis zu einem fest verdrahteten `ablation-controls` und deckten damit still drei fremde Labs ab (jetzt bis zum naechsten Lab-Header); und die Antwortschluessel wurden nur beim Checker geprueft, nicht beim Panel - ein umbenanntes `value` machte die Frage unbeantwortbar, ohne etwas zu brechen.
- Befund ueber den eigenen Sweep: der erste Grenzen-Sweep lief n in Siebenerschritten und besuchte nur die Restklasse 6 mod 7; eine Mutation, die die Grenze bei n % 7 === 3 brach, lief gruen durch. Ein Sweep, dessen Schrittweite einen Faktor mit der geprueften Eigenschaft teilt, deckt eine Restklasse ab und nennt es einen Bereich.
- Pruefung: Guard-Suite 47 auf **50 Bloecke** gruen, Build gruen, Cache-Bump auf v79, README auf 61 Labs. `render coverage` 14 auf 16 Labs (10.327 Zustaende), `lab render sweep` 51 auf 53 von 61. Alle sechs Selbststudium-Konzepte und **alle 124 Handout-Probleme** haben jetzt fuer ihr entscheidendes Konzept ein rechnendes Lab. Mutationstests: v97 15 Mutationen / 13 gefangen (beide Entkommenen behandelt), v98 11 / 11.
- Offen und begruendet: `render coverage` erreicht 16 von 61. Die uebrigen 45 sind durch `lab render sweep` strukturell abgedeckt (53 von 61, die restlichen 8 namentlich als Labs ohne rechnende Buehne ausgenommen); es fehlt ihnen allein der Anker, die tragende Zahl aus dem echten Markup zurueckzulesen. Der lohnendere Zuschnitt waere, Anker nachtraeglich dort zu setzen, wo eine Behauptung an einer einzelnen Zahl haengt, statt alle 45 Buehnenfunktionen umzustellen.

## 2026-09-04 - Anker dort, wo eine Behauptung an einer Zahl haengt (v99)

- Auftrag: statt alle 45 Buehnenfunktionen umzustellen, gezielt Anker setzen. Umgesetzt als **ein** Guard statt einer Handvoll Einzelanker: `lab prose anchors` prueft je Lab jede Ziffernfolge ab drei Stellen aus `desc`, `mental`, `observe`, `misconception` und `transferAnswer` gegen die Vereinigung aller Zustaende, die das Lab erreichen kann - 319 Zahlen auf 53 Labkarten.
- Guenstig gebaut: zuerst zaehlen die Renders, die `lab render sweep` ohnehin macht; nur ein Lab mit noch offener Zahl bezahlt eine breitere Suche (Regler an drei Positionen, dann das Produkt seiner Selects, Abbruch sobald die letzte Zahl auftaucht). Gemessen: 14 von 53 Labs, 5.211 zusaetzliche Renders, Laufzeit 59 s auf 67 s.
- **Drei echte Funde**, alle derselben Klasse: die Prosa zitiert eine gerundete Fassung dessen, was die Buehne mit voller Stellenzahl druckt, also findet der Leser die zitierte Zeichenfolge nicht. `advantage-normalizers` sagte „bei MaxRL 6,999944 an derselben Stelle", der Ledger druckt 6,9999. `run-plan` sagte „der Fit landet bei 0,4519", die Zeile druckt 0,451874. Und das eigene v97-Lab `target-shift` zitierte den Abstand 0,001330, den keine Zeile zeigte - dort war die richtige Reparatur, die Zahl auf den Schirm zu bringen: die Tabelle „Alle vier Regeln nebeneinander" hat jetzt eine Abstandsspalte, und ein Anker liest sie im Text mit Doppelungen zurueck.
- **Acht Zahlen sind namentlich als Referenz statt Schirmwert eingetragen**, jede mit Grund (eine Wurzel, auf die ein Plateau zeigt; eine Differenz zweier im selben Satz zitierter Werte; eine im Argument gebildete Summe; zwei Extrema ueber alle 378 Kombinationen; ein Fakt ueber Bytes; eine im Antworttext eingesetzte Rechnung; ein ausdrueckliches Gegenteil-Beispiel). Die Liste wird in beide Richtungen geprueft.
- Mutationstest: 8 Mutationen, 7 gefangen, Kontrolle gruen. Die eine Entkommene ist die abgeschaltete Zusicherung selbst; gepaart gemessen: eine Zahlendrift in **beiden** Sprachen - die Form, die eine echte Regression hat und gegen die `content numerals` blind ist - wird vom Anker gefangen und laeuft ohne ihn gruen durch.
- Pruefung: Guard-Suite 50 auf **51 Bloecke** gruen, Build gruen.

## 2026-09-05 - Die eine Station des Grundlagenpfads, die im Lesen endete (geplanter Deep Review, v100)

- Auftrag: die Plattform gegen ihr eigenes Ziel pruefen - denselben Wissensstand wie die Vorlesung, in deutlich weniger Zeit, und die Assignments am Ende loesen koennen. Zusaetzlich ausdruecklich gefragt: wie sich die noetigen Voraussetzungen extrem schnell aufbauen lassen.
- Zuerst die naheliegenden Verdachtsmomente **widerlegt**, statt sie zu berichten: alle 75 Konzepte sind erreichbar, alle 124 Handout-Probleme haben ein Lab fuer ihr entscheidendes Konzept, die 126 Scope-Eintraege loesen sich als 124 Probleme auf (`a3:scaling_laws` steht in drei Themenbloecken), und die Zeitangaben sind aus dem tatsaechlichen Textvolumen gerechnet statt getippt. `MODULES[].minutes` ist dagegen totes Feld - wird nirgends gerendert; nicht angefasst, nur vermerkt.
- **Der Befund liegt genau auf der gestellten Frage.** Der Grundlagenpfad (Modul 00, „Grundlagen am Stueck aufbauen") ist die einzige geordnete Antwort der App auf „wie baue ich die Voraussetzungen auf". Neun seiner zehn Stationen boten ein Experiment - `logs` (Log-Sum-Exp und numerische Stabilitaet) nicht. Damit endete genau die Station im Lesen, an der Schritt 2 der eigenen Fuenf-Schritte-Methode („das Lab der Lecture machen") haette greifen muessen. Und sie ist keine Randstation: die App selbst nennt `logs` als entscheidendes Konzept von `a1:softmax`, `a1:cross_entropy` und `a5:get_response_log_probs`.
- **Das Lab existierte bereits, nur eine Modulgrenze entfernt.** `loss-and-clip` rechnet in simulierter float32-Arithmetik genau die zwei Fehlerarten durch, die die Konzeptseite lehrt: `exp` laeuft oberhalb von x ~ 88,7 nach unendlich ueber (Zaehler und Nenner beide unendlich, Quotient NaN), und ohne das Kuerzen von log und exp wird die Zielwahrscheinlichkeit exakt null, ihr Logarithmus minus unendlich. Seine Formelzeile *ist* Log-Sum-Exp mit Maximum-Abzug. Es lag im Modul `training`, `logs` im Modul `foundations` - also sahen sich die beiden nie.
- Repariert wurde deshalb **nicht mit einem neuen Lab, sondern mit der Zuordnung**: `logs` steht jetzt bei den Konzepten des Themenblocks `a1:optimization` - was keine Erfindung ist, sondern die Angleichung des Blocks an seine eigenen Probleme, denn dessen `cross_entropy` haengt laut der App an `logs`, und `loss-and-clip` ist eines seiner Labs. Damit traegt die Paarung die Ko-Lokations-Pruefung von `concept experiments`, und die Konzeptseite bietet das Experiment an. Nebenwirkung geprueft: kein neuer Formeleintrag, genau ein zusaetzlicher Konzeptbutton.
- Neuer Guard `prerequisite sprint`: jede Station des geordneten Modul-00-Pfads muss das Experiment anbieten, das sie durchrechnet - gerendert gelesen, in beiden Sprachen, plus die Zusicherung, dass die Guard-Liste dieselbe ist, die die Seite laeuft (`foundationSprintConcepts` muss weiter das foundations-Modul lesen), und dass eine schrumpfende Liste die Aussage nicht billig wahr macht.
- **Eine geschriebene Pruefung wieder entfernt, weil sie nicht ausloesbar war.** Die Gegenrichtung „`logs` muss auch auf dem Pfad bleiben" liess sich in keiner Konstruktion zum Feuern bringen: die Station zu streichen bricht zuerst `problem concepts`, sie stattdessen auf eine Lecture zu verschieben bricht zuerst den Modul-Guard, weil das `module`-Feld eines Konzepts seine Heimat festnagelt. Der Grund ist gemessen und steht im Kommentar, statt als Dekoration stehenzubleiben.
- Mutationstest: 6 Mutationen, 6 gefangen, Kontrolle gruen. Drei davon faengt der neue Guard selbst (Paarung entfernt, `a1:softmax` nennt `logs` nicht mehr, Sprint-Liste zeigt woandershin), drei fangen bestehende Guards frueher ab - ehrlich vermerkt, weil sie damit nichts ueber den neuen aussagen.
- Pruefung: Guard-Suite 51 auf **52 Bloecke** gruen, `concept experiments` 70 auf **71 von 75** Konzeptseiten mit Experiment, Cache-Bump auf v80. Kein Browsertest - in geplanten Laeufen gesperrt.
- Offen und bewusst nicht angefasst: 30 von 119 Themenblock/Konzept-Paaren nennen ein entscheidendes Konzept ihrer eigenen Probleme nicht in der Blockliste. Geprueft, ob das den Leser trifft: nein - jedes Problem druckt seine entscheidenden Konzepte direkt neben sich. Es ist eine Redundanzluecke, kein Loch im Lernweg, und eine Sammelaenderung daran waere gross und ohne belegten Nutzen. `parameter-initialization` ist das naechste Konzept, das ein Problem entscheidet (`a1:linear`, `a1:embedding`) und kein rechnendes Lab hat - anders als `logs` existiert dafuer keines, das waere also ein neues Lab.

## 2026-09-05 - Die Initialisierung, die kein Test sieht (geplanter Deep Review, v101)

- Kettenkopf war **v100** (`57ce035`) auf `claude/intelligent-vaughan-5896db`, der zugewiesene Worktree stand auf v99 (`2ed21e7`) - Fast-Forward, kein Merge. Kein Codex aktiv (Haupt-Checkout mtimes Juli). v100 hatte den naechsten Hebel namentlich hinterlassen: `parameter-initialization` entscheidet `a1:linear` und `a1:embedding` und hatte als einziges solches Konzept kein rechnendes Lab.
- Vorpruefung nach der Regel „eine Kennzahl ist nur ein Verdacht": Trefferzaehlung **nach den Bezeichnern der Rechnung**, nicht nach den Themenwoertern. `trunc_normal` 7, „Initialisierung" 32, `3σ` 10 - aber `erf(`, `normalCdf`, `truncNormal`, `Math.sqrt(2 /` und `dIn + dOut` je **null**. Prosa reichlich, Rechnung keine. Zusaetzlich die v100-Frage geprueft, ob eine **Modulgrenze** die Ursache ist: nein, kein bestehendes Lab bildet eine Streuung aus Layerbreiten.
- **Und die Vorpruefung ging in die schaerfere Richtung aus** (das v91-Muster). Die Konzeptseite behauptet ueber A1s Test woertlich „Ein Test prueft die verwendeten Argumente, die Grenzen und den Modultyp". A1 §3.3.2 schreibt fuer denselben Test aber: *der Adapter laedt die vorgegebenen Gewichte in dein Modul*. Ein Test, der die Gewichte laedt, prueft den Forward-Pass und kann die Initialisierung **grundsaetzlich nicht sehen**. Die Seite versprach eine Absicherung, die das Assignment nicht leistet.
- Neues Lab **`init-scale`** (Modul `transformer`), beide Modi in geschlossener Form und ohne eine einzige Zufallszahl. **Modus A** rechnet die drei Regeln ueber A1s eigenes Modell (V = 10.000, d_model = 512, d_ff = 1.344 aus §7.2.1) und **trennt die zwei Gruende**, die die Konzeptseite bisher in einem Atemzug nannte: das Abschneiden bei ±3σ senkt die realisierte Streuung um **1,342161 %**, systematisch und bei jeder Tabellengroesse gleich; die Stichprobenstreuung faellt mit 1/√n und ist bei zehn Millionen Gewichten **62,77-mal** kleiner. Daraus die Zahl, die gefehlt hat: eine Toleranz unter 1,342161 % wird nie zuverlaessig, egal wie gross die Tabelle ist.
- Nebenbefund derselben Tabelle: die Regel ist symmetrisch in d_in und d_out, ihre **Wirkung nicht**. Der Vorwaertsfaktor d_in·σ² ist exakt 1 bei der Q/K/V/O-Projektion, 0,5517 bei SwiGLU W1, 1,4483 bei W2 (gleiches σ, gleiche Grenzen, gleich viele Gewichte) und 0,0974 beim LM-Head.
- **Modus B ist der Fund.** Fuenf Implementierungen - die korrekte und die vier Fallstricke, die A1 und die Konzeptseite selbst fuehren. Die Variante mit den Grenzen **±3 statt ±3σ** besteht einen Vergleich mit der vorgeschriebenen Streuung **besser als die korrekte Implementierung**: exakt 0,0000 % gegen −1,3422 %, weil sie genau das Abschneiden weglaesst, das σ senkt. Der Varianztest faengt sie auf keiner der fuenf Tabellen und bei keiner der vier angebotenen Toleranzen (Sweep ueber 80 Kombinationen aus Tabelle, Variante und Toleranz). Sichtbar ist sie allein am Grenzentest - bei der Q/K/V/O-Projektion liegen 707,7 von 262.144 Gewichten ausserhalb von ±3σ.
- Damit die Lehre, die A1 nicht ausspricht: **eine Initialisierungsregel besteht aus zwei Angaben, und jeder der beiden billigen Tests sieht nur eine.** Zusammen fangen sie alle vier Fehler, einzeln keiner - in beide Richtungen geprueft.
- Dritte Zahl: das brauchbare **Toleranzfenster 1,7384 % bis 22,0273 %**. Darunter faellt die korrekte Implementierung an ihrer eigenen Abschneidewirkung durch, bei vier der fuenf Tabellen sogar zuverlaessig statt nur zufaellig. Darueber beginnt der erste Fehler durchzurutschen - derselbe PyTorch-Standard, der auf einer anderen Tabelle 84,9831 % danebenliegt: **welche Tabelle man prueft, entscheidet mit, ob eine Toleranz den Fehler faengt.**
- Prosa in beiden Sprachen an drei Stellen korrigiert (Konzeptseite `details[3]`, ihre Antwort auf die eigene zweite Kontrollfrage, und die Antwort der Formelkarte `parameter-init`): sie sagen jetzt, was A1s Adapter wirklich tut, und nennen die Zahl, die die beiden Fehlerquellen trennt. Die Kontrollfrage der Seite hat damit erstmals eine Antwort mit Zahlen - und ein Lab, das sie durchrechnet.
- Neuer Guard `init scale` (277 Checks) auf einem **anderen Rechenweg als die App**: die Momente der abgeschnittenen Normalverteilung per **Simpson ueber 200.000 Intervalle** integriert, wo die App sie geschlossen loest (Uebereinstimmung auf 1e-9); jede Variante aus ihrer eigenen Definition zweitens hergeleitet; die Fenstergrenzen ueber **5.000 Toleranzen gescannt** statt zurueckgelesen; die Symmetrie von σ und die Quadratbedingung des Vorwaertsfaktors ueber **65.536 Rasterpaare in beide Richtungen**.
- Eine Zusicherung waehrend des Baus **korrigiert statt weggeschrieben**: „der Varianztest verwirft nie eine Variante, die hier mit der korrekten identisch ist" feuerte - bei Toleranz 1 % verwirft er auch die korrekte. Ein Treffer zaehlt jetzt nur, wenn dieselbe Toleranz die korrekte Implementierung durchlaesst. Ebenso wurde die obere Fenstergrenze neu definiert, nachdem der Guard die erste Fassung widerlegte: sie ist die Stelle, an der **der erste** Fehler zu rutschen beginnt, nicht der letzte.
- Mutationstest: **14 Mutationen, 14 gefangen, 0 entkommen**, Kontrolle gruen. Neun davon faengt `lab prose anchors` zuerst - die Karte zitiert die gerechneten Zahlen, also schlaegt jede Zahlendrift dort frueher an. Um zu messen, was der **neue** Block allein leistet, wurde er in einer Kopie der Suite ohne den Anker-Block noch einmal gegen dieselben Mutationen gefahren: er faengt **alle vierzehn selbst**, jede mit der Meldung, die die Ursache benennt.
- Pruefung: Guard-Suite 52 auf **53 Bloecke** gruen, `concept experiments` 71 auf **72 von 75** Konzeptseiten, `lab render sweep` 53 auf **54 von 62 Labs**, `lab prose anchors` 319 auf **330** Zahlen, Cache-Bump auf v81, README 61 auf 62 Labs. Kein Browsertest - in geplanten Laeufen gesperrt.
- Offen: die drei restlichen Konzepte ohne Lab (`dataset-lineage`, `copyright-licensing`, `alternative-sequence-models`) entscheiden **null** Probleme. `origin/main` steht unveraendert auf `4067294`.

## 2026-09-06 - Die zwei Streuungen, von denen die Konzeptseite nur eine kannte (geplanter Deep Review, v102)

- Kettenkopf war **v101** (`3d234bb`) auf `claude/confident-knuth-2b11ab`, der zugewiesene Worktree stand auf v99 (`2ed21e7`) - Fast-Forward, kein Merge. Kein Codex aktiv (Haupt-Checkout mtimes Juli). Neu: **`origin/main` steht jetzt auf `2ed21e7`**, die Kette ist nur noch ab v100 ungepusht.
- v101 liess nur noch Konzepte offen, die null Probleme entscheiden. **Vier neue Verdachtsmomente zuerst geprueft und verworfen:** Probleme ohne Adapter/Testbefehl (die 10 ohne sind Skripte, fuer die A1-A5 keinen vorsehen), Lecture-Abschnitte ohne Abdeckung (Abschnittsindex aus `main()` der acht Trace-PDFs; L10s zwoelf Abschnitte sind alle da), die Diagnose (12 Bereiche, jeder mit Konzept und seit v93/v100 mit Lab), und Formelkarten als Sackgasse (echt, aber als schwacher Hebel gemessen und nicht verfolgt).
- **Der Befund liegt auf 20 Punkten.** A5 verlangt an drei benoteten Stellen ein Urteil ueber Streuung - `grpo_experiments_standard_on_policy` (10 P., „how much variance there is between runs", Zielwert „averaged across random seeds"), `grpo_learning_rate` (3 P., „Based on the amount of variance you observed … decide how many random seeds you want to use") und `grpo_prompt_ablation` (3 P., „Based on the variance between runs, how confident are you in your findings?"). Entscheidendes Konzept ist fuer alle drei plus A1s vier Ablationen `benchmark-validity` - und diese Seite kannte **genau eine** Streuung: `SE = √(p(1−p)/n)` ueber die Testfaelle. Trefferzaehlung nach den Bezeichnern der anderen Rechnung: `Standardfehler` 16, `1,96` 3, **Stellen, die eine Streuung ueber Laeufe bilden: null**.
- Gegenprobe nach der v100-Regel: **negativ**, kein bestehendes Lab bildet eine Streuung ueber Laeufe. `baseline-variance` rechnet die Varianz des *Schaetzers* in einem Schritt (eine dritte, gut verwechselbare Groesse), `evaluation`/`answer-parsing`/`winrate-lc` rechnen alle drei den Stichprobenfehler.
- Neues Lab **`seed-variance`** (Modul `evaluation`, auf l12 und im A5-Block `on-policy-grpo`). Modus A bei A5s eigenen Werten: Stichprobenfehler **1,353165** gegen Seedfehler **1,500000** Prozentpunkte - fast gleich gross, keine ist die Nebensache der anderen -, gemeinsam **2,020162**, womit das Intervall der Konzeptseite **49,2917 %** zu eng ist. Beide schrumpfen an verschiedenen Hebeln (ueber 120 Rasterpunkte geprueft). **Punchline:** weil A5 alle Seeds auf derselben Validierungsmenge auswertet, mittelt sich der Eval-Anteil nicht weg - der Gesamtfehler faellt streng, erreicht die Bodenplatte 1,353165 aber nie (bei 256 Seeds noch 1,366093).
- Modus B uebersetzt das in Budget: der Preis eines Laufs wird aus A5s eigener Budgetzeile **abgeleitet und nie geraten** (zwei B200-Stunden fuer vier Seeds, also hoechstens **0,500000** je Lauf). Die vier Stunden des Sweeps kaufen **acht Laeufe**, bei drei Lernraten **zwei Seeds je Arm**, kleinster belegbarer Abstand `1,96·σ·√(2/n)` = **5,880000 Prozentpunkte** bei einem Zielwert von 25 %. Zwei Punkte aufzuloesen kostet 18 Seeds je Arm, 54 Laeufe, 27 Stunden - das **6,7500-Fache** des Budgets; jede Halbierung des Abstands vervierfacht die GPU-Stunden.
- Prosa in beiden Sprachen an zwei Stellen korrigiert: der Begriff `Stichproben-Standardfehler` und `details[1]` von `benchmark-validity` nannten `√(p(1−p)/n)` unqualifiziert „die" Unsicherheit einer gemessenen Accuracy.
- Pruefung: **Guard-Suite 53 → 54 Bloecke gruen**, Build gruen, Cache v82, README 62 → 63 Labs. Neuer Block **`seed variance`** (2.536 Checks) auf einem anderen Rechenweg als die App: Stichprobenfehler durch **termweise Aufzaehlung der Binomialverteilung** (5.379 Terme) statt geschlossen, Seedzahlen **von eins aufwaerts gezaehlt** mit der Zahl darunter als Gegenprobe, Bodenplatte ueber einen Sweep bis 4.096 Seeds, Kreuzungspunkt ueber **200.000 σ-Werte gescannt** mit beiden Seiten. `concept experiments` 87 → 88 Paare, `lab render sweep` 54 → 55 von 63, `lab prose anchors` 330 → **343** Zahlen.
- **Mutationstest: 18 Mutationen, 18 gefangen, 0 entkommen**, Kontrolle vor und nach allen Laeufen gruen. Acht faengt `lab prose anchors` zuerst; in einer Suite-Kopie ohne den Anker-Block faengt der neue Block **alle acht selbst**, jede mit der Meldung, die die Ursache benennt.
- Kein Browsertest (in geplanten Laeufen gesperrt).
- Offen: die drei Konzepte ohne Lab entscheiden null Probleme; `renderFormulaDetail` bleibt eine Sackgasse (79 Formelkarten ohne Konzept- oder Labknopf) als naechster naheliegender Zuschnitt; `origin/main` auf `2ed21e7`, v100-v102 ungepusht.

## v103 — 2026-09-07 — das Gate, das keins war
- Kettenkopf war **v102** (`6060aee`), zugewiesener Worktree **v99** — Fast-Forward. Kein Codex aktiv.
- Vier Deckungsfragen neu gerechnet und **ohne Befund** geschlossen: 124 von 124 Problemen haben auf jedem entscheidenden Konzept ein Lab; die drei Konzepte ohne Lab entscheiden null Probleme; A2 §8s 31 testlose Punkte deckt `comm-crossover` ausdruecklich ab; jede Voraussetzungskarte traegt einen Konzeptlink.
- Der Befund kam aus einer Zeile, die der Guard selbst schreibt: `LR_NO_STAGE` fuehrt **sieben Labs ohne rechnende Flaeche** namentlich. Davon traegt **`kernel-contracts` 20 Punkte** (a2:flash_forward 15, a2:flash_backward 5) und ist das **einzige Lab seines Konzepts** — Gegenprobe negativ, kein anderes Lab rechnet es.
- Das Lab hiess **„Flash-Backward Gate"** und lehrte `rowsum(dS) ≈ 0` als die Backward-Pruefung. Die Invariante ist wahr und **kein Gate**: sie folgt allein aus softmax(x+c)=softmax(x), in ihrer Herleitung kommt kein Skalenfaktor vor. Ein vergessener oder verdoppelter Faktor **1/√d** in dQ und dK laesst dS **bitgenau unveraendert** — Residuum 6,2e−17 wie bei der korrekten Implementierung, ueber sechs Toleranzen von 1e−14 bis 1e−4 gehalten. Auch eine **Richtungspruefung ist blind** (Kosinus exakt 1,000000000000), weil der Fehler ein einheitlicher Faktor ist; das Laengenverhaeltnis ist exakt **√d bzw. 1/√d**, bei A2s Head-Dimension 64 also **Faktor 8**. **dV = Pᵀ·dO** benutzt dS gar nicht und ist bei allen fuenf Varianten exakt null.
- `kernel-contracts` bekam eine rechnende Flaeche in zwei Modi (kein neues Lab): **Modus A** Grid, Randtiles, Partial-Buffer ueber 3 Formen × 3 Tilegroessen (A2s Fall: 3×3 Programs, Buffer [3,70], 4.608 Lanes fuer 2.590 gueltige Elemente, 43,7934 % maskiert); **Modus B** 3 Faelle × 5 Varianten gegen 3 Pruefungen mit Uebersichtstabelle. Die dritte Kurzcheck-Frage fragt jetzt, **welchen Fehler die Invariante grundsaetzlich nicht sehen kann**. Prosa in beiden Sprachen korrigiert (Konzeptseite: viertes `details`, zusaetzlicher Pitfall, `answers[1]`; Lab: `mental`, `misconception`, `formula`, `observe`, Symbolliste).
- Pruefung: **Guard-Suite 54 → 55 Bloecke gruen**, Build gruen, Cache v83, `LR_NO_STAGE` 8 → 7, **`lab render sweep` 55 → 56 von 63 Labs**, `panel i18n` 54 → 55 Panels, Laborzahl unveraendert 63. Neuer Block **`flash backward gate`** (292 Checks) auf einem anderen Rechenweg: jeder Gradient durch **zentrale finite Differenzen** von L=Σ(O⊙dO) neu gebildet (besser als 1e−7 auf dQ, dK, dV in allen drei Faellen), Gridachsen Tile fuer Tile hochgezaehlt statt aus `ceil()` gelesen.
- **Mutationstest: 18 Mutationen, 17 gefangen, 1 inert.** Der erste Lauf liess **sechs** entkommen; fuenf waren echte Guard-Luecken: **vier Render-Escapes derselben Art** (der Block prueste das Gerechnete, nie die gedruckte Zelle — vertauschte Ledger-Zellen und ein nach der falschen Achse indizierter Partial-Buffer blieben unsichtbar) und **eine Definitionsluecke** (Residuum als Summe statt Maximum der Betraege; zwei Zeilen +a/−a haetten sich zu null gekuerzt). Dabei war **die Zusicherung falsch statt der Code**: die erste Fassung behauptete, die Summe koenne das Maximum nicht ueberschreiten — mehrere gleichsinnige Zeilen tun genau das. Die abgeschaltete kausale Maske blieb unbemerkt, weil jede andere Aussage auch unmaskiert gilt; der Block verlangt jetzt einen maskierten Fall und zaehlt die genullten Gewichte ab.
- Die inerte Mutation ist **gemessen**: der MINSTD-Multiplikator verschiebt 12 von 15 angezeigten dQ-Fehlern und laesst jedes Verdikt unveraendert (Skalenverhaeltnisse bleiben exakt {2; 0,5}, jede falsche Variante bleibt falsch). Der Fall ist absichtlich beliebig.
- Kein Browsertest (in geplanten Laeufen gesperrt).
- Offen: **sechs Labs ohne rechnende Flaeche** (~38 Punkte), naechster `pytorch-debugger` (16,5, einziges Lab von `pytorch-state`), dann `distributed-runtime` (10) und `transformer-ledger` (8); die drei Konzepte ohne Lab entscheiden null Probleme; `renderFormulaDetail` bleibt eine Sackgasse; `origin/main` steht auf `2ed21e7`, **v100 bis v103 ungepusht**.


## 2026-09-11 - Zwei Skalen unter einem Argumentnamen (geplanter Deep Review, v107)

- Ausgangslage: zugewiesener Worktree auf v99, Kettenkopf auf v106 (`76da558`,
  `claude/gracious-spence-d2e4d4`) - Fast-Forward, kein Merge. Kein Codex aktiv.
  `origin/main` steht weiter auf `2ed21e7`; v100 bis v107 sind ungepusht.
- Gewaehlter Hebel: `rlvr-system-transfer` (2,5 Punkte, einziges Lab von `rlvr-systems`,
  das `a5:grpo_train_step_off_policy` entscheidet). Beleg aus dem Handout, nach den Zahlen
  gegreppt: `cliprange = 3e-4` fuer GSPO kam in der App nicht vor (die eine Fundstelle war
  eine SFT-Lernrate), die Clip Fraction, die §6.4 zu loggen und zu vergleichen verlangt,
  wurde nirgends gerechnet, und der 32-fache Plan (256 gegen 8) auch nicht.
- Befunde: bei train_batch_size = group_size = 8 ist jeder der 32 Schritte genau eine
  Promptgruppe - bei p = 0,9 tragen 13,7750 von 32 Schritten keinen Gradienten, und AdamW
  zieht trotzdem weiter. Und cliprange traegt zwei Skalen: GSPO mit 3·10⁻⁴ clippt im Modell
  138-mal mehr Token als grpo mit 0,2 (28,60 % gegen 0,2071 %), weil sein Ratio ein
  Mittelwert ueber die Antwort ist und es ganze Antworten clippt; derselbe Wert 0,2 an GSPO
  haelt dessen Clip Fraction bei jedem Schritt auf null. Richtung gegen das GSPO-Paper
  (arXiv 2507.18071, §5.2) geprueft: zwei Groessenordnungen mehr geclippte Token.
- Das Lab bekommt eine rechnende Flaeche in zwei Modi (Plan exakt, Clip Fraction als
  ausgewiesenes Driftmodell), drei neue Kurzcheckfragen; Konzeptseite `rlvr-systems` um ein
  Detail, einen Pitfall und eine Check-Frage erweitert; im Lab `offpolicy-clip` nennt das
  Symbol ε jetzt die GSPO-Vorgabe.
- Guard-Suite 58 -> 59 Bloecke gruen, neuer Block `clip fraction` auf einem anderen
  Rechenweg (Plan durch Ablaufen der Liste, leere Schritte durch alle 256 Reward-Ausgaenge,
  Clipping durch beide Terme des min, s als Produkt, Rauschen aus dem Seed neu gezogen).
  `lab render sweep` 59 -> 60 von 63 Labs, `lab prose anchors` 400 -> 407, `LR_NO_STAGE`
  4 -> 3. Cache-Bump auf v87 (4 Stellen).
- Mutationstest: 48 Mutationen, 48 gefangen gegen die volle Suite; gegen den neuen Block
  allein 47 von 48 - die fehlende (gelöschte englische Übersetzung) ist Sache von
  `renderer i18n`, das sie fängt. Kontrolle vor und nach beiden Läufen grün.
- Kein Browsertest - in geplanten Laeufen gesperrt.

## 2026-09-10 - Die Abgabe war nie eine Zahl (geplanter Deep Review, v106)

- Ausgangslage: zugewiesener Worktree auf v99, Kettenkopf auf v105 (`a9d63be`,
  `claude/eloquent-shirley-4d30c2`) - Fast-Forward, kein Merge. Kein Codex aktiv.
  `origin/main` steht weiter auf `2ed21e7`; v100 bis v106 sind ungepusht.
- Gewaehlter Hebel: `transformer-ledger`. **Die Zahl des Vorgaengerreports wurde dabei
  korrigiert**: v105 nannte 8 Punkte, aber das sind `a1:transformer_lm` (3) plus
  `a1:transformer_accounting` (5), und beim ersten entscheidet `transformer-block`, das
  sein eigenes Lab hat. Der ehrliche Wert ist **5** - und bleibt der groesste offene
  Posten, weil `transformer_accounting` das groesste schriftliche Problem in ganz A1 ist.
- Der Beleg kam aus dem Handout, nicht aus der Kennzahl: A1 §3.4 verlangt **fuenf** Abgaben
  ((a) Parameter und FP32-Speicher eines GPT-2-XL-foermigen Modells, (b) die Liste der
  Matmuls samt Summe, (c) der teuerste Teil, (d) dieselbe Rechnung fuer small/medium/large
  ausdruecklich *als Anteil am Gesamtwert* plus die Richtung ihrer Verschiebung, (e) XL bei
  Kontextlaenge 16.384). Das Lab stellte drei Auswahlfragen zu einem Spielzeugfall und
  rechnete nichts; **keine der vier GPT-2-Groessen kam irgendwo in der App vor**, die Zahl
  16.384 als Kontextlaenge nirgends. Von fuenf Abgaben war keine bedient.
- Befund A: der quadratische Term wird mit der Modellgroesse **unwichtiger**, nicht
  wichtiger. Bei T = 1024 faellt der Anteil der Attention-Scores von 13,2539 % (small) auf
  9,1596 % (XL), weil ihr Verhaeltnis zu den Projektionen exakt 4LT²D / 8LTD² = T/(2D) ist -
  L kuerzt sich vollstaendig heraus. „Quadratisch" heisst quadratisch in der Sequenzlaenge,
  nicht in der Modellgroesse; wer das verwechselt, beantwortet (d) genau falsch herum. Der
  LM Head faellt daneben von 27,1037 % auf 4,6828 %. Erst die Kontextlaenge dreht es um, und
  die Schwellen stehen in Einheiten der Breite: T = 2D gegen die Projektionen, T = 1,5·F ≈ 4D
  gegen SwiGLU. Bei T = 16.384 tragen die Scores in XL 61,7344 %, und die Summe waechst um
  Faktor 37,9831 bei nur sechzehnfachem T.
- Befund B: die Abkuerzung „Forward-FLOPs = 2 · Parameter · Token" macht **drei** Fehler auf
  einmal - das Eingabe-Embedding als Matmul gezaehlt (2TVD), die RMSNorm-Gains als Matmul
  gezaehlt (2TD(2L+1)), und 4LT²D fehlt ganz. Zwei zu viel, einer zu wenig, Nullstelle bei
  **T\* = (V + 2L + 1)/(2L)** - einer Kontextlaenge, in der keine Modellbreite vorkommt. Fuer
  GPT-2 medium sind das 1.048,0417 und damit 2,3468 % neben der Kontextlaenge, die das
  Handout selbst vorgibt: dort liest die Abkuerzung auf 0,2915 % genau, also ausgerechnet in
  der Zelle, in der man sie am ehesten gegenprueft. Bei XL und 16.384 liest sie 0,4024 des
  wahren Werts. Selbst repariert bleibt sie inexakt - uebrig bleiben genau die Norm-Gains.
- Nebenbefund: `num_heads` steht in allen vier Konfigurationen des Handouts und kommt in
  keiner der beiden Formeln vor (H Heads · 2T²·(D/H) = 2T²D); d_head ist bei allen vier
  GPT-2-Groessen exakt 64. d_ff nennt A1 nur fuer XL, und genau eine der vier Breiten geht
  ohne Rundung auf. Unter A1s Architektur hat GPT-2 XL 1.640.452.800 Parameter, nicht die
  ueblich zitierten 1,5 Milliarden.
- Das Lab bekommt eine rechnende Flaeche in zwei Modi ueber fuenf Modelle × fuenf
  Kontextlaengen. Modus A ist die Stueckliste fuer (a), (b) und (c) samt drei
  Speicher-Lesarten und der Abkuerzung in drei Stufen mit ihrer Fehlerzerlegung; Modus B sind
  die Anteile fuer (d) und (e) samt der drei Schwellen. Drei neue Kurzcheckfragen auf den
  Befund. Konzeptseite `transformer-ledger` in beiden Sprachen um ein `details`-Element,
  einen Pitfall und eine Check-Frage erweitert - sie beschrieb den Ledger vorher richtig und
  nannte keine einzige Zahl ueber die Anteile.
- Guard-Suite 57 -> 58 Bloecke gruen, neuer Block `ledger shares` (773 Checks) auf einem
  anderen Rechenweg als die App: der Forward Pass Matmul fuer Matmul und Head fuer Head
  durchlaufen, das Parametertotal aus einer benannten Stueckliste, jede Schwelle durch
  Abtasten von T mit beiden Seiten gehalten, die Nullstelle gesucht statt ausgewertet. Jede
  Behauptung in beiden Richtungen: der Score-Anteil muss ueber die Groessen fallen und ueber
  die Kontextlaengen steigen; H kuerzt sich heraus, nachgewiesen durch erneutes Durchlaufen
  mit jedem Teiler von d_model. `lab render sweep` 58 -> 59 von 63 Labs, `lab prose anchors`
  58 -> 59 Karten, `panel i18n` 57 -> 58 Panels, `LR_NO_STAGE` 5 -> 4. Cache-Bump auf v86
  (4 Stellen). Laborzahl unveraendert 63 - es kam kein Lab dazu, eines wurde rechnend.
- Mutationstest: **42 Mutationen, 42 gefangen, 0 entkommen, 0 inert.** Der erste Lauf
  (30 Mutationen) liess **vier** entkommen, und alle vier waren echte Luecken: (1) die vier
  GPT-2-Konfigurationen waren an nichts gebunden - GPT-2 large liess sich auf 32 Layer
  umschreiben, weil jede Zahl darunter aus L gerechnet wird und in sich stimmig bleibt;
  (2) **der Kurzcheck konnte genau den Irrtum zertifizieren, den das Lab aufbricht** - der
  Antwortschluessel fuer Frage 2 liess sich von „faellt" auf „steigt" drehen, ohne dass ein
  Guard es bemerkte; (3) der Spielzeugfall liess sich in die Vier-Groessen-Tabelle
  einschleusen, weil der Guard jede erwartete Zeile prueft und blind fuer eine ueberzaehlige
  war; (4) `tlShortcutFor` gab T* als `exactAt` zurueck, obwohl nur `tlThresholds.exact`
  gerendert wird - dieselbe Konstante an zwei Stellen, eine davon tot. Die ersten drei sind
  jetzt abgesichert (Konfigurationen und ihre Beschriftungen gegen die Handout-Tabelle
  gepinnt; der akzeptierte Antwort-Dreier aus der Seite gelesen und gegen die Rechnung
  gehalten, die groesste Anteilsdifferenz *gesucht* statt benannt, samt Auflösungspfad; alle
  sechs Ankertypen gezaehlt), die vierte **entfernt statt abgesichert** und die verbliebene
  Konstante danach mit zwei eigenen Mutationen gegengeprueft. Zehn weitere Mutationen gegen
  genau die neuen Pruefungen: alle gefangen. Kontrolle vor und nach jedem Lauf gruen.
- Kein Browsertest (in geplanten Laeufen gesperrt).
- Offen: **vier Labs ohne rechnende Flaeche**, naechster `rlvr-system-transfer` (2,5),
  danach `policy-loss-tracer` (1); `scaling-transfer` und `moe-routing` entscheiden null
  Punkte nach der v100-Regel. Die drei Konzepte ohne Lab entscheiden weiterhin null
  Probleme; `renderFormulaDetail` bleibt eine Sackgasse (79 Formelkarten ohne Konzept- oder
  Labknopf); `origin/main` steht auf `2ed21e7`, **v100 bis v106 ungepusht**.


## 2026-09-09 - Dieselbe Messung, zwei entgegengesetzte Saetze (geplanter Deep Review, v105)

- Ausgangslage: zugewiesener Worktree auf v99, Kettenkopf auf v104 (`f328637`,
  `claude/mystifying-cannon-664e47`) - Fast-Forward, kein Merge. Kein Codex aktiv.
  `origin/main` steht weiter auf `2ed21e7`; v100 bis v105 sind ungepusht.
- Gewaehlter Hebel: `distributed-runtime`, das einzige Lab seines Konzepts und damit
  entscheidend fuer 10 Punkte (a2:distributed_communication_single_node 5,
  a2:naive_ddp 5). Die Zahl wurde aus HANDOUT_PROBLEMS, PROBLEM_CONCEPTS und
  LAB_CONCEPTS neu gerechnet statt aus dem Vorgaengerreport uebernommen; dieselbe
  Messung reproduziert v104s 16,5 fuer `pytorch-state` als Kontrolle. Das Lab war ein
  Quiz aus drei Auswahlfragen ohne eine gerechnete Zeile.
- Befund A: eine gemessene All-Reduce-Zeit traegt zwei Bandbreiten, und sie stuetzen
  entgegengesetzte Saetze. Bei 1024 MiB im Node faellt S/T von d=2 auf d=6 um 40,4967 %,
  die Busbandbreite um 0,8278 % - die Leitung ist gleich ausgelastet, der Ring bewegt nur
  mehr. Bei 1 MiB faellt auch die Busbandbreite (61,8617 %), weil 81,1019 % der Zeit reine
  Latenz sind; die flache Lesart gilt also nicht immer. Die Grenze liegt bei S* = a*d*b,
  aus der sich der Ringfaktor 2(d-1) vollstaendig herauskuerzt. Dazu die Messfalle:
  ohne torch.cuda.synchronize() misst der Timer die Enqueue-Zeit, also in jeder Zelle
  dieselbe Konstante - die kleinste Zeile liest dabei 209,7152 statt 85,0415 GB/s und
  bleibt unter der Bandbreite der Verbindung, besteht also jede Plausibilitaetspruefung.
- Befund B: A2 verbessert naive_ddp zweimal, und die beiden sind sehr verschieden viel
  wert. Auf der Konfiguration des Handouts (xl, 1 Node x 2 GPUs) liegen bei naive_ddp
  32,2372 % des Schritts frei; Zusammenfassen zu einem flachen All-Reduce nimmt davon
  8,7368 % (und ist exakt die Latenz der 290 entfernten Aufrufe), Vorziehen ins Backward
  nimmt 99,2843 % - ohne ein Byte weniger zu bewegen. Uebrig bleiben 0,2376 ms, und das
  ist bitgenau das All-Reduce des Embedding-Gradienten, der vor dem Ende des Backward Pass
  gar nicht existiert. Zwischen Nodes bringt derselbe Overlap nur 12,3095 %, weil dort die
  Kapazitaetsgrenze bindet; dort gewinnen erst Buckets zu 250 MiB.
- Gebaut: `distributed-runtime` behaelt seinen Kurzcheck und bekommt eine rechnende
  Flaeche in zwei Modi - Modus A die 4x3-Tabelle aus A2 5.1.1 mit Zeit, algbw, busbw,
  Latenzanteil, Regimemarkierung, Crossover und einem Schalter fuer den unsynchronisierten
  Timer; Modus B das xl-Modell (291 Gradiententensoren, 226 Matrizen, 65 RMSNorm-Gains,
  3.406.809.600 Parameter) gegen sechs Zeitplaene mit Collectives, Kommunikationszeit,
  freiliegender Zeit und beiden Untergrenzen. Zwei neue Kurzcheckfragen auf den Befund.
- Konzeptseite `distributed-runtime` in beiden Sprachen um ein viertes `details`-Element,
  zwei Pitfalls und eine Check-Frage samt Antwort erweitert.
- Guard-Suite 56 -> 57 Bloecke gruen, neuer Block `ddp schedule` (975 Checks) auf einem
  anderen Rechenweg als die App: die Ringkosten Runde fuer Runde statt geschlossen, der
  Zeitplan als explizite Belegungsliste der Leitung statt als laufendes max(), das
  Parametertotal aus einer Stueckliste, der Crossover durch Bisektion. `lab render sweep`
  57 -> 58 von 63 Labs, `lab prose anchors` 57 -> 58 Karten, `LR_NO_STAGE` 6 -> 5.
  Cache-Bump auf v85 (4 Stellen). Laborzahl unveraendert 63.
- `panel i18n` erweitert: der Guard sah nur inline gebaute Panels und damit zwei Labs gar
  nicht (pytorch-debugger, distributed-runtime). Jetzt 55 -> 57 Panels, 995 -> 1017
  Textknoten - und er fand sofort einen untersetzten String.
- Mutationstest: 22 Mutationen, 22 gefangen, 0 entkommen. Der erste Lauf liess drei
  entkommen, zwei davon echte Luecken: `lastCost`/`lastBytes` lasen sich auf den *ersten*
  Bucket umschreiben, ohne dass etwas anschlug, weil lm_head und Embedding beide V*D gross
  sind; und die deklarierte Bucketgroesse eines Zeitplans war an nichts gebunden, sodass
  "25 MiB (PyTorchs Default)" 250 MiB rechnen konnte. Beide Felder werden jetzt gegen die
  Zeitleiste gehalten, und jedes Label wird gegen seinen eigenen Wert geprueft. Die dritte
  (`idle` verworfen) war inert, weil das Feld nirgends gelesen wurde - es wird jetzt gegen
  die Zeitleiste geprueft und ist damit gefangen. Kontrolle vor und nach allen Laeufen gruen.
- Kein Browsertest - in geplanten Laeufen gesperrt. Ersatz: alle Zustaende beider Modi in
  beiden Sprachen headless gerendert und gelesen.

## 2026-09-08 - Der Test, den PyTorch selbst nicht bestehen laesst (geplanter Deep Review, v104)

- Ausgangslage: zugewiesener Worktree auf v99, Kettenkopf auf v103 (`90c76c2`,
  `claude/nostalgic-rubin-6ddab0`) - Fast-Forward, kein Merge. Kein Codex aktiv.
  `origin/main` steht weiter auf `2ed21e7`; v100 bis v104 sind ungepusht.
- Gewaehlter Hebel: `pytorch-debugger`, das einzige Lab von `pytorch-state` und damit
  entscheidend fuer 16,5 Punkte (a1:linear 1, a1:embedding 1, a1:checkpointing 1,
  a1:training_together 4, a5:aggregate_loss_across_microbatch_sequence 0,5,
  a5:grpo_train_step_standard_on_policy 5, a5:sft_script 4). Bis v103 fuenf Auswahlfragen
  ohne eine einzige gerechnete Zeile. Gegenprobe nach der v100-Regel: kein anderes Lab
  fuehrt das Konzept.
- Befund: ein Untermodul in einer Python-Liste statt in einer nn.ModuleList ist im Forward
  Pass wertgleich - es fehlt allein in der Inventur. Fuenf wertfoermige Pruefungen bestehen
  deshalb bei allen vier Fehlern, darunter `load_state_dict(strict=True)`, das genau deshalb
  blind ist, weil es zwei Schluesselmengen vergleicht, denen dieselben Eintraege fehlen.
  Alle vier fangen nur `.to(device)` und der Werte-Rundlauf ueber Speichern und Laden; ohne
  zweites Geraet laeuft davon nur der Rundlauf. Die Parameterzahl gegen die Formel P faengt
  drei der vier und ist blind genau beim Buffer.
- Das Lab bekommt eine rechnende Flaeche in zwei Modi. Modus A stellt fuenf
  Speichervarianten denselben acht Pruefungen gegenueber; Modus B teilt die
  A1-Parameterformel P=2VD+L(4D²+3DF+2D)+D in registrierte und stillgelegte Gruppen auf.
  Bei A1 §7.2.1 (V=10000, D=512, F=1344, L=4) frieren 12.455.936 von 22.696.448 Parametern
  ein - 54,8806 Prozent, und der Loss sinkt trotzdem.
- Die Zahlen des Labs wurden gegen echtes PyTorch 2.11 gehalten: dieselben fuenf Varianten,
  dieselben Gewichte, Uebereinstimmung auf sechs Nachkommastellen bei jeder Variante.
- Konzeptseite `pytorch-state` in beiden Sprachen um ein viertes `details`-Element und einen
  vierten Pitfall erweitert; beide nennen die Blindheit von strict=True ausdruecklich.
- Guard-Suite 55 -> 56 Bloecke gruen, neuer Block `state contract` (286 Checks) auf einem
  anderen Rechenweg als die App: Gradienten durch zentrale finite Differenzen, Parametertotal
  aus einer Stueckliste Matrix fuer Matrix. `lab render sweep` 56 -> 57 von 63 Labs,
  `lab prose anchors` 56 -> 57 Karten, `LR_NO_STAGE` 7 -> 6. Cache-Bump auf v84 (4 Stellen).
  Laborzahl unveraendert 63 - es kam kein Lab dazu, eines wurde rechnend.
- Mutationstest: 20 Mutationen, 18 gefangen, 2 inert mit gemessenem Grund. Zwei echte
  Luecken gefunden und geschlossen (der Guard leitete seine Erwartung aus `variant.registered`
  ab und verglich sie gegen eine App, die dasselbe Feld liest; und die Schluesselmengen-
  Vergleichung liess sich auf einen Laengenvergleich abschwaechen, ohne dass eine Variante
  das gezeigt haette). Kontrolle vor und nach allen Laeufen gruen.
- Kein Browsertest - in geplanten Laeufen gesperrt.

## 2026-09-12 - Die Einbahnstrasse im Tafelwerk (geplanter Deep Review, v108)

- Ausgangslage: zugewiesener Worktree auf v99, Kettenkopf auf v107 (`cccf802`,
  `claude/wonderful-poincare-a87812`) - Fast-Forward, kein Merge. Kein Codex aktiv.
  `origin/main` steht weiter auf `2ed21e7`; v100 bis v108 sind ungepusht.
- Gewaehlter Hebel: `renderFormulaDetail`, von v107 als groesster struktureller Posten
  benannt - 79 Formelkarten ohne Konzept- oder Labknopf.
- Vorpruefung, drei Fragen. (1) Fehlen Inhalte? Nein: alle 79 Karten tragen Zweck, gerechnetes
  Beispiel, Pitfall, Selbstcheck und ueber FORMULA_ANSWERS eine Musterloesung. (Der erste
  Zaehlversuch meldete 79 Karten ohne Antwort, weil er die Zuweisung aus Zeile 4347 nicht
  mitausgefuehrt hatte - Muster 4: erst belegen, dass die Pruefung reale Daten sieht.)
  (2) Ist es eine Sackgasse? Ja, und schlimmer als gedacht: renderFormulaDetail rief
  `bindOpeners` gar nicht auf. (3) Braucht der Rueckweg eine neue Tabelle? Nein:
  CONCEPTS[].formulas ist die vom Autor gesetzte Beziehung, die conceptFormulaIds auf der
  Konzeptseite schon in der Gegenrichtung rendert.
- Gemessen: 79 von 79 Formelkarten erreichen mindestens ein Konzept, 77 davon mindestens ein
  Lab. Die zwei ohne Lab (`ssm-recurrence`, `diffusion-generation`) haengen an
  `alternative-sequence-models`, das `concept experiments` bereits als eines der drei Konzepte
  ohne Experiment fuehrt - das Repo hatte den Fall also schon entschieden.
- Gebaut: `formulaConcepts` (die Inversion) und `formulaRouteMarkup` (je Konzept eine Zeile mit
  Titel, Heimat-Badge aus `prerequisiteConceptHome` und Summary, darunter die Experimente als
  "Ueben: ..."-Knoepfe), aufgerufen nach dem Selbstcheck, plus `bindOpeners(el)`. 29 Zeilen in
  index.html. Wirkung: 133 Konzeptzeilen und 157 Uebungsknoepfe auf 79 Karten; 59 von 63 Labs
  und 69 von 75 Konzepten sind jetzt von einer Formelkarte aus erreichbar.
- Guard-Suite 59 -> 60 Bloecke gruen, neuer Block `formula route` (790 Checks): die Inversion in
  beiden Richtungen je Karte, die Labs pro Zeile aus LAB_CONCEPTS im Pruefer selbst statt ueber
  die App-Funktion, das vollstaendige Markup-Fragment statt des Vorkommens, alle 75
  Heimat-Etiketten unabhaengig nachgerechnet, die Ausnahmemenge abgeleitet statt gelistet (mit
  Abbruch, wenn sie leer ist), und Aufrufstelle samt `bindOpeners`. Cache-Bump auf v88
  (4 Stellen). Laborzahl, Konzeptzahl und Formelzahl unveraendert.
- Mutationstest: 19 Mutationen, 19 gefangen, 0 entkommen, 0 inert - alle 19 vom neuen Block
  allein (Suite-Kopie mit den aelteren Bloecken auf `void` statt `throw`). Drei waren im ersten
  Lauf inert, weil ihr Anker auch in `conceptCard` steht; mit dem laengeren, eindeutigen
  Fragment neu gefahren und gefangen. Kontrolle vor und nach jedem Lauf gruen.
- Kein Browsertest - in geplanten Laeufen gesperrt. Ersatz: alle 79 Karten in beiden Sprachen
  headless gerendert und auf Tag-Balance, undefined, Platzhalter und deutsche Rueckstaende im
  englischen Render geprueft.

## 2026-09-12 - Das Tafelwerk schwieg ueber den Anfang des Kurses (geplanter Deep Review, v109)

- Status: abgeschlossen. Kettenkopf war nicht der zugewiesene Worktree: dieser stand auf
  `2ed21e7` (v99), der Kopf auf `b2aa46a` (v108). Neuer Branch `claude/deep-review-v109` von
  dort, kein Merge, keine fremde Session aktiv.
- Hebel 3 aus v108 geprueft und als Inhalts- statt Wegeluecke bestaetigt: die Module
  `tokenization` (Lecture 1) und `data` fuehrten `formulas:[]`, obwohl A1s
  `tokenizer_experiments` (4 Punkte), A4s `filter_data` (6) und `tokenize_data` (2) genau an
  diesen Groessen haengen - zusammen 12 Aufgabenpunkte ohne eine einzige Formelkarte. Lecture 1
  definiert `get_compression_ratio` im eigenen Trace und haelt `assert compression_ratio == 1`
  fest. Nach den Zahlen der Handouts gegriffen, nicht nach ihren Woertern.
- Gebaut: drei Karten. `compression-ratio` (neue Kategorie Tokenisierung, Quellen l01/a1) mit
  `r = num_bytes / num_tokens`, der Umkehrung und der Plattenfolge `2/r`; `corpus-throughput`
  (Daten, l13/a1/a4), das mit derselben Rechnung A1s Pile-Frage (825 GB, 9,549 Tage bei 1 MB/s)
  und A4s CC-Dump-Frage beantwortet; `cascade-yield` (Daten, l13/a4) mit Ausbeute und der
  Zurechnung, die A4 als Deliverable verlangt (51,02 / 38,27 / 7,65 / 3,06 %). Verdrahtet ueber
  `CONCEPTS[].formulas` und die kuratierten Listen von l01 und l13.
- Wirkung: 79 -> 82 Karten, 21 -> 22 Kategorien, und alle **63 von 63 Labs** sind jetzt von
  einer Formelkarte aus erreichbar (vorher 59) - die vier Waisen `bpe`, `bpe-encode`,
  `data-pipeline` und `pipeline-yield` haben ihren Weg.
- Drei Korrekturen, die die Pruefung erzwungen hat: (1) `embedding-params` waere still vom Pfad
  gefallen, weil es nur als Fallback-Primer erreichbar war; statt es auf l01 zu kuratieren
  (Lecture 1 leitet `V*D` nirgends her, und die Karte steht schon auf der Liste reparierter
  Falschzitate) wurde die vierte geplante Karte `token-storage` fallen gelassen und ihr
  uint16-Inhalt in `compression-ratio` gefaltet. (2) Die eigene Musterloesung behauptete
  "Faktor 625 in den Paaren"; exakt sind es 631,0606, also steht jetzt "rund" da und der Guard
  misst die Rundungsguete. (3) Zwei Mutationen entkamen dem ersten Entwurf, weil das Vorkommen
  statt des Orts geprueft war ("1.0000" steht zweimal im selben pitfall, "60000" ist Teilstring
  von "600000"); beide Pruefungen sind jetzt an ihre Umgebung gebunden, und die Ankunftsmengen
  je Stufe werden zusaetzlich gelesen.
- Guard-Suite 60 -> 61 Bloecke gruen, neuer Block `corpus arithmetic` (4084 Checks): Lecture 1s
  String wird im Pruefer aus `CR_TEXTS` neu kodiert statt abgeschrieben, die uint16-Schwelle
  ueber 4000 Werte von r in beide Richtungen gescannt (1999 wachsen, 2000 schrumpfen, 1 trifft
  sie exakt), die Kaskade Stufe fuer Stufe gelaufen statt geschlossen, die Reihenfolge-Behauptung
  ueber alle 24 Permutationen bewiesen (eine Menge, 8 Zurechnungen) mit Abbruch ohne
  Mehrfachueberdeckung, und die Eingaben der Karte selbst verankert. Cache-Bump auf v89
  (4 Stellen), README auf 82 Formeln.
- Mutationstest: 32 Mutationen, 32 gefangen, 0 entkommen, 0 inert. Gefahren gegen eine
  Schlankfassung der Suite aus Setup + neuem Block allein (0,25 s je Lauf) statt gegen die
  `void`-Kopie - ein Fang kann damit keinem aelteren Block gehoeren. Kontrolle vor und nach
  jedem Lauf gruen.
- Kein Browsertest - in geplanten Laeufen gesperrt. Ersatz: die drei Karten in beiden Sprachen
  auf alle 11 Felder, deutsche Rueckstaende, undefined, Platzhalter und gleiche vars-Laenge
  geprueft; `formula route` (820 Checks), `content numerals` und `worked steps` tragen sie mit.

## 2026-09-13 - Der verlorene Zweig: der Backward Pass, den die Kette abgeworfen hatte (geplanter Deep Review, v110)

- **Der Befund kam aus der Ahnenpruefung, nicht aus dem Inhalt.** `git merge-base --is-ancestor`
  ueber alle Branch-Spitzen gegen den Kettenkopf `4b9fcce` (v109) liess **genau eine** Spitze
  uebrig: `454630e`, ein **zweites v72** ("der Backward Pass hoert auf, ein Satz Prosa zu sein"),
  parallel zu dem v72, das die Kette aufgenommen hat (`6d043f3`, der Schrittzaehler). Sein Inhalt
  war seit dem 14. August **lautlos verloren**: `grep -c ffn-backward` gab auf dem Kettenkopf 0.
- **Was fehlte, entscheidet drei Probleme.** A2 §8.2 druckt den FFN-Backward als Gleichungen
  (24)-(30) und laesst sie dreimal wiederverwenden: `data_parallel_calcs` (a) verlangt die
  Backward-FLOPs mit Begruendung, `tp_calcs` (a) verlangt **dieselben Gleichungen mit
  geshardeten Gewichten** ("Feel free to reference the non-sharded backward pass in Section 8.2
  and modify it"), `gradient_checkpointing` die Frage, welche von ihnen eine gespeicherte
  Aktivierung liest. Auf dem Kettenkopf hatte die Plattform fuer "dx₁", "dx₂", "W₃ᵀ" und
  "f'(" **je 0 Treffer**. Das Lab `comm-crossover` rechnet mit `(pass==="fwd"?6:12)` - die 12 ist
  fest eingetippt, also genau die Zahl, die das Handout herleiten laesst. Und der Faktor 2 hinter
  jeder der **38** Stellen, an denen die Plattform 6ND benutzt, stand in einem einzigen
  Nebensatz: "etwa 2ND_tokens fuer den Forward Pass und etwa doppelt so viel zusaetzlich fuer den
  Backward Pass". Lecture 2 rechnet ihn dagegen Term fuer Term vor (2x `2*B*D*K`, dann
  `(2 + 2) * B * D * D`, Schluss "Forward: 2, Backward: 4, Total: 6").
- **Geborgen statt neu gebaut.** Merge von `454630e` in den Kettenkopf: 11 Konflikte, alle an den
  bekannten Stellen. README/sw.js/`?v=` waren reine Versionskollisionen (HEAD gewinnt, danach
  Bump auf v90); `i18n-en.js` und die Guard-Suite waren **Anhaenge an dasselbe Dateiende**, also
  Vereinigung - und anders als 2026-09-04 endete die HEAD-Seite hier **mit** ihrer schliessenden
  Klammer, der Zweig der Gegenseite ist ein Block auf oberster Ebene, es fehlte keine. In
  `index.html` war HEAD in **allen sechs** Huenken die Obermenge; die Gegenseite steuerte nur
  `ffn-backward` in zwei Listen bei (`a3:synthetic-isoflops`, `OBJECTIVE_LAB_IDS`).
- **Drei Integrationsluecken, die erst die juengeren Guards sahen.** Das Lab ist 37 Commits
  aelter als der Kopf und verletzte drei Zusicherungen, die es zu seiner Zeit nicht gab:
  (1) `fbNumber` formatierte mit `toFixed` statt `fixedNum` - der deutsche Render haette Punkte
  gedruckt (Guard `decimal separator`); (2) `LAB_CONCEPTS` hatte keinen Eintrag, das Lab waere
  von keiner Konzeptseite aus angeboten worden; (3) ein `aria-label` blieb fuer den englischen
  Leser deutsch (Guard `attribute i18n`, seit v92). Dazu **eine, die kein Guard sah**: `fbExp`
  druckte die Abweichung mit `toExponential`, dessen Punkt der deutsche Sweep nie erreicht hat -
  jetzt locale-bewusst wie die beiden einzigen Stellen, die es schon waren.
- **Was das Lab nun rechnet.** Modus A laeuft die sieben Gleichungen an einem 2x3x4-Fall und
  prueft **jeden der vier Gradienten gegen eine zentrale Differenz auf dem Forward Pass allein**
  (2,71e-11). Die Falle: der Regelsatz `noBranch` - der zweite Pfad in Gleichung (27) vergessen -
  laesst dW₁, dW₂ und dW₃ **exakt richtig** (1e-11) und bricht nur dx (3,4e-1). Wer nur
  `W.grad` testet, sieht gruen. Modus B listet die Matmuls einzeln, 2 vorwaerts und 4 rueckwaerts,
  und liefert auf allen fuenf Rechenfaellen 2,0000 / 4,0000 / 6,0000 je Parameter je Token - C
  ≈ 6ND ist damit **gerechnet statt zitiert** -, dazu der Aktivierungssatz (x, h₁) mit
  `checkpoint` gegen +33,33 % Compute und Lecture 2s 70B-Frage: 47,98 / 95,95 / 143,93 Tage.
- Guard-Suite **61 -> 62 Bloecke gruen**, Labs 63 -> 64, Cache-Bump auf **v90** (4 Stellen),
  README auf 64 Labs. Der `lab render sweep` deckt jetzt **61 von 64** statt 60 von 63 Labs ab,
  die `corpus arithmetic`-Zusicherung "alle Labs von einer Formelkarte erreichbar" haelt bei 64.
- **Mutationstest gegen die Schlankfassung** (Setup bis `englishFormulas` plus nur der geborgene
  Block, 0,29 s je Lauf): **10 Mutationen, 10 gefangen, 0 entkommen, 0 inert**, Kontrolle vor und
  nach dem Lauf gruen. Mutiert wurden die Gleichungen selbst (fehlendes Transponat in (24),
  f statt f' in (26), fehlender x₂-Faktor, fehlender zweiter Pfad in (27), f(x₁) -> x₁ in (25),
  dW₂ aus dx₁ in (29), SiLU -> Sigmoid) sowie die FLOP-Zaehlung (2mkn -> mkn, dx-Matmul aus dem
  Ledger) und die Bytebreite.
- **Kein Browsertest** - in geplanten Laeufen gesperrt. Ersatz: alle **26 Zustaende** (4 Regelsaetze
  x 4 Gradienten, 5 Rechenfaelle x 2 Regeln) in **beiden Sprachen** headless gerendert, auf
  `undefined`/`NaN`, uninterpolierte Platzhalter, Tag-Balance und deutsche Rueckstaende geprueft.
  Der Scanner wurde vorher als **sehend belegt** - und die erste Fassung fiel dabei durch: ihre
  Wortliste kannte "Zuerst Lecture 2s eigenes Beispiel" nicht. Die Rueckstandspruefung liest
  seitdem **die Uebersetzungsmap selbst** statt einer Wortliste, damit sie nicht ueber jede
  Schreibweise schweigt, die sie nicht kennt.

## 2026-09-16 - Das Lab, das rechnen liess, ohne zu rechnen (geplanter Deep Review, v113)

- Status: abgeschlossen. Worktree stand auf v99, Kettenkopf auf v112 (`371338a`); Ahnenpruefung
  ueber alle 74 Branch-Spitzen: **kein verlorener Zweig**. Kein Codex auf diesem Repo.
- **Befund:** `moe-routing` forderte in seiner `observe`-Zeile "Berechne Capacity, Overflow bei
  sechs Assignments zu Expert 0 und den Aux-Loss" - und keine Flaeche der App zeigte eine dieser
  drei Zahlen. Die einzige Rueckmeldung war ein Ratefeld mit drei Dropdowns. Weil das Lab keine
  rechnende Buehne hatte, stand es zugleich auf `LR_NO_STAGE` und wurde vom Render-Sweep nie
  gerendert - dieselbe Doppelluecke wie bei `policy-loss-tracer` in v112.
- **Gebaut:** vier Regler (Routing ausgeglichen/schief/kollabiert, k = 2/1, Capacity Factor
  1/0,5/1,25/1,5/2, Expert-zu-Geraet blockweise/reihum) ueber einem festen Mini-Batch aus 8 Token
  und 4 Experts. Jede Router-Zeile ist dieselbe Permutation von [0,40 0,30 0,15 0,15], also
  summiert jede auf 1 und keine Top-k-Wahl haengt an einer Tie-Break-Regel. Die Buehne rechnet
  Router-Tabelle, Expert-Ledger (Assignments, verarbeitet, Overflow, f_e, P_e), Balance-Loss,
  Capacity-Bilanz, Geraeteauslastung und Top-k-Normalisierung.
- Die drei Zahlen der Aufgabe sind jetzt Ablesungen: Capacity **4**, Overflow **2** bei 6
  Assignments, L_balance **1,000000·α** statt null. Der Antwortschluessel wird aus genau diesen
  Zustaenden gerechnet statt eingetippt.
- Sichtbar gemacht: α ist der Boden des Balance-Loss (schief 1,046875·α, kollabiert 1,278125·α);
  bei c = 0,5 verwirft **auch perfekte Balance** 8 von 16 Assignments; der Puffer kostet, was er
  rettet (bei c = 2 werden 16 von 32 Plaetzen leer mitbewegt); und dieselben Expertlasten geben
  blockweise `max 10`, reihum `max 9` - die Antwort auf die Transferfrage, gerechnet.
- **Die Invariante hat drei Faelle, nicht zwei.** Ueber 60 Zustaende: 10 ausgeglichene, in denen
  die Zuordnung den Straggler nicht bewegen *kann*; 15 unausgeglichene, in denen sie ihn bewegt;
  und **5, in denen sie es nicht tut**. Die fuenf sind genau die Zustaende, in denen ein einziger
  Expert alle 16 Assignments haelt. Der Guard fordert diese Charakterisierung, statt die Ausnahmen
  zu dulden.
- **Zwei Fehler, die erst Mutationstest und Probelauf zeigten:** (1) `ceil -> floor` war inert,
  weil `c·T·k/E` bei T=8/E=4 gleich `2ck` ist und jeder angebotene Faktor ein Vielfaches von 0,5
  war - alle acht Capacities ganzzahlig, das `ceil` der Karte rundete nirgends. Behoben durch
  c = 1,25 (Switch Transformers eigener Default), der bei k=1 auf `ceil(2,5) = 3` fuehrt. (2) `P_2`
  und `P_3` sind beide exakt 7/32, entstehen aber aus verschieden geordneten Summen - untereinander
  in derselben Spalte las der Leser 0,2187 und 0,2188. `moeNumber` schnappt auf 1e-12; der Guard
  ist auf das Paar gerichtet, das wirklich auseinanderlaeuft, und fordert, dass es existiert.
- **Nebenbefund behoben:** `labHasObjectiveCheck` las nur `OBJECTIVE_LAB_IDS`, waehrend
  `moe-routing` und `scaling-transfer` ihren Kurzcheck ueber `LAB_OBJECTIVES` beziehen. Beide
  konnten bestanden werden, ohne je "✓ objektiver Kurzcheck bestanden" zu zeigen. Das Praedikat
  liest jetzt beide Listen; das repariert `scaling-transfer` mit.
- Guard-Suite **64 -> 65 Bloecke gruen**, neuer Block `moe-routing` mit **1444 Checks**.
  Render-Sweep **62 -> 63 von 64 Labs**, 1314 -> **1350 Renders**, `LR_NO_STAGE` 2 -> **1**.
  Cache-Bump auf **v93** (4 Stellen).
- **Mutationstest gegen die Schlankfassung** (0,24 s je Lauf): **20 Mutationen, 20 gefangen,
  0 entkommen, 0 inert**, Kontrolle vor und nach dem Lauf gruen.
- **Lehre aus dem Lauf:** der moeNumber-Guard landete zuerst im `policy-loss-tracer`-Block, weil
  beide denselben Ankerkommentar tragen und `String.replace` das erste Vorkommen nimmt. Die
  Schlankfassung enthaelt `policy-loss-tracer` nicht und meldete trotzdem gruen. Sie ist schnell,
  aber kein Beleg dafuer, dass eine Aenderung dort gelandet ist, wo sie hingehoert.
- **Kein Browsertest** - in geplanten Laeufen gesperrt. Ersatz: alle **60 Zustaende in beiden
  Sprachen** headless gerendert (120 Renders), auf Platzhalter, `undefined`, negative Nullen,
  falsche Dezimaltrennzeichen und deutsche Rueckstaende geprueft.

## 2026-09-17 - Die Konzeptseite wusste nicht, wofuer man sie liest (geplanter Deep Review, v114)

- **Der Befund.** `PROBLEM_CONCEPTS` ist eine Behauptung in einer Richtung - "dieses Problem haengt
  an diesen Ideen" - und die Assignment-Seite hat sie immer so gerendert: 211 Verknuepfungen ueber
  alle 124 Handout-Probleme. **Rueckwaerts hat sie nie jemand gelesen.** Eine Konzeptseite endete
  deshalb im Lesen: Orientierung, mentales Modell, Beispiel, Regeln, Fehlannahmen, Labs,
  Selbstcheck, Formelkarten - und dann nichts. Die eine Frage, die aus Lesen Fortschritt macht
  ("was genau kann ich damit abgeben?"), konnte die Seite nicht beantworten. Dieselbe Einbahnstrasse
  wie im Tafelwerk vor v108, nur auf der Flaeche, die der Lernpfad staendig benutzt.
- **Gebaut.** `conceptProblemMarkup` rendert auf **allen 75 Konzeptseiten** die Probleme, die genau
  dieses Konzept entscheiden - nach Assignment gruppiert, mit Punktzahl, Art der Arbeit, GPU-Budget,
  dem Adapter-Hook und dem `uv run pytest`-Befehl aus dem Handout, und mit **den uebrigen Konzepten
  desselben Problems** ("Braucht ausserdem"), damit sichtbar ist, was noch fehlt. 215 Problemzeilen,
  76 Assignment-Knoepfe, 62 Konzepte mit Abgabe.
- **Die Umkehrung war selbst der Pruefstand.** Drei Konzepte, deren Gegenstand ein Handout in seinem
  eigenen Problemtitel nennt, waren von **keinem Themenblock** gelistet und konnten deshalb von
  keinem Problem genannt werden: `pre-post-norm` (A1: *"Modify your pre-norm Transformer
  implementation into a post-norm one"*), `embeddings` (A1: *"the dimensionality of the token
  embedding matrix"*) und `perplexity-eval` (A1: *"submit your attained perplexities to a
  leaderboard"*; A4: *"minimizes validation perplexity on ... Paloma"*). Vier neue Verknuepfungen,
  drei Themenblock-Eintraege - und **gemessen null Verzoegerung**: kein einziges der 124 Probleme
  oeffnet dadurch spaeter.
- **Der Fehler, den die Umkehrung nebenbei fand.** Der Lecture-Ausblick seedet "abgedeckt" mit dem
  Foundations-Modul und den Lectures. Sechs Konzepte stehen in keinem von beiden - `lm-objective`,
  `causal-mask`, `cross-entropy`, `adamw`, `clipping`, `sampling` -, und die App **sagt das selbst**
  auf der Assignment-Seite ("Was dieses Assignment braucht, aber keine Lecture liefert"). Der
  Ausblick behandelte sie als fuer immer fehlend: **11 der 124 Probleme** tauchten im Ausblick
  keiner einzigen Lecture auf - darunter `a1:adamw`, `a1:cross_entropy`, `a1:decoding` -, und A1
  stand auch nach Lecture 17 noch bei **29 von 38**. Jetzt **124 von 124**; kein bereits offenes
  Problem bewegt sich, und ein Problem, das gar keine Lecture braucht, wird gezaehlt, ohne dass
  Lecture 1 behauptet, es geoeffnet zu haben.
- Guard-Suite **65 -> 67 Bloecke gruen**: `concept deliverables` (**657 Checks**) und
  `lecture outlook coverage` (**151 Checks**). Cache-Bump auf **v94** (4 Stellen).
- **Mutationstest gegen die Schlankfassung:** **24 Mutationen, 24 gefangen, 0 entkommen, 0 inert**,
  Kontrolle vor und nach dem Lauf gruen. Zwei Mutationen entkamen im ersten Durchgang und schlossen
  je eine echte Luecke: die **Punktsumme je Assignment-Block** war ungeprueft (nur die Gesamtzeile),
  und eine **spaeter gelehrte Verknuepfung, die ein Problem verzoegert**, war unsichtbar, weil der
  Vergleich "mit/ohne die vier neuen Links" eine fuenfte auf beiden Seiten stehen laesst. Jetzt ist
  die **Form des Ausblicks** festgeschrieben (wie viele der 124 Probleme jede Lecture oeffnet).
- **Lehre aus dem Lauf:** ein **Apostroph in einem Kommentar** innerhalb einer Funktion, die ein
  Guard per `sliceDeclaration` schneidet, liest sich fuer dessen Scanner als String-Anfang - der
  Schnitt lief bis zum Dateiende (1,3 MB statt 1,3 kB) und meldete sich als *"Identifier
  'LAB_CONCEPTS' has already been declared"*, was ueber die Ursache nichts sagt. Der Guard benennt
  das jetzt selbst, bevor der Code stirbt, der daran stirbt.
- **Kein Browsertest** - in geplanten Laeufen gesperrt. Ersatz: alle **75 Konzeptseiten in beiden
  Sprachen** headless gerendert (150 Renders), geprueft auf Platzhalter, Tag-Balance und deutsche
  Rueckstaende im englischen Render; der Scanner vorher als sehend belegt (er war es zuerst nicht -
  seine Regex kannte `</h2>` nicht, weil sie Ziffern im Tagnamen ausschloss).

## v115 - 2026-09-18 - der Rueckweg stand dort, wo der Leser selten steht

- **Hebel 1 aus v108-v114 geschlossen.** `formulaAccordion` enthielt alles, was
  `renderFormulaDetail` enthaelt - Primer, Lernsequenz, Intuition, Dimensionen, Fehlerbild,
  Selbstcheck - **ausser `formulaRouteMarkup`**, also ausgerechnet den Weg vom Lesen zum Rechnen.
  Der Rueckweg war damit auf der Flaeche gebaut, auf der der Leser **selten** steht (82
  Detailseiten), und fehlte auf der, auf der er staendig steht (**262** Akkordeon-Instanzen: 82
  Tafelwerk, 74 auf 17 Lecture-Seiten, 106 auf Konzeptseiten).
- **Die Kennzahl aus v114 war falsch.** Dort standen **294** Instanzen; das summierte `c.formulas`
  direkt, waehrend eine Konzeptseite `conceptFormulaIds(c, lectureId)` rendert - aus einer Lecture
  heraus **nur die von ihr kuratierten** Formeln - und die `sources`-Rueckfallebene in
  `lectureForConcept` uebersehen wurde. Gerechnet sind es **262** (267 bei der formelreichsten
  Ankunft). Richtung unveraendert: die Akkordeon-Flaeche ist **3,2-mal** so gross.
- `formulaAccordionRoute(f, omitConceptId)` rendert jetzt in jedem Akkordeon nach dem Selbstcheck
  „Hergeleitet in: &lt;Konzept&gt; · &lt;Heimat&gt;" und „Üben: &lt;Lab&gt;" - dieselbe Umkehrung von
  `CONCEPTS[].formulas`, die die Detailseite rendert, in der Form, die eine Karte tragen kann
  (`<div>` statt `<section>`/`<h2>`). **Die Seite, auf der der Leser steht, wird nicht angeboten**:
  64 Akkordeons behalten ein Geschwisterkonzept, **42 schweigen ganz**, weil die Seite selbst der
  einzige Herleiter ist.
- **Das Label war eine Luege.** „Vollstaendig oeffnen" / „Open full explanation" verspricht mehr
  Erklaerung und liefert Navigation zu demselben Text - ein Leser mit offener Karte hat damit einen
  aktiven Grund, ihn *nicht* zu druecken. Jetzt „Als eigene Seite oeffnen" / „Open as its own page".
  Im `ui`-Paket lag dazu eine **zweite, abweichende** englische Uebersetzung („Open full page"), die
  nie feuern konnte, weil die Ternaerform schon englisch antwortet; sie ist entfernt.
- **Drei Aufrufstellen haetten den Array-Index uebergeben.** `.map(formulaAccordion)` reicht
  `(element, index, array)` durch - der Index waere als `omitConceptId` angekommen. Alle drei sagen
  jetzt, was sie auslassen; ein Guard verbietet die nackte Form.
- **Der Render-Sweep fand einen Fehler, den kein Guard sehen konnte.** `compression-ratio.expr` -
  die **angezeigte Gleichung** - hatte keine englische Fassung und fiel auf den deutschen Wert
  zurueck: jeder englische Leser sah `Dateigroesse(uint16) / num_bytes = 2 / r` im Anzeigekasten.
  Unsichtbar, weil die Rueckstandspruefungen ueber die Pakete und ueber Renderer laufen, die `expr`
  nie zeichnen. Von 82 Karten x 13 Feldern haben **145 Felder keine englische Fassung**, und genau
  **eines** trug Deutsch. Nur `expr` (70) und `aliases` (75) koennen ueberhaupt durchfallen.
- Guard-Suite **67 -> 69 Bloecke gruen**: `accordion route` (**1422 Checks**) und
  `formula field fallthrough` (**150 Checks**). Cache-Bump auf **v95** (4 Stellen).
- **Mutationstest gegen die Schlankfassung:** `accordion route` **32/32 gefangen, 0 entkommen,
  0 inert**; `formula field fallthrough` **8 von 9 gefangen, 0 entkommen, 1 inert mit gemessenem
  Grund** (eine deutsche `cat` erreicht keinen Leser, weil `cat` auf jeder Karte uebersetzt ist).
- **Kein Browsertest** - in geplanten Laeufen gesperrt. Ersatz: **440 Renders des vollstaendigen
  Akkordeons** in DE und EN (82 Karten x beide Sprachen x jede Auslassung), geprueft auf Tag-Balance
  ueber neun Tags, Platzhalter, `<details>`-Gestalt und die Position des Rueckwegs vor den
  Aktionen - **0 Probleme**, mit dem Scanner vorher als sehend belegt.

## v116-v120 - 2026-09-19 bis 2026-09-23 (geplante Deep Reviews, nachgetragen)

Diese fuenf Laeufe haben ihren Bericht nur nach `tmp/` geschrieben. Hier der Stand in
einer Zeile je Lauf; die Einzelheiten stehen in `tmp/deep-review-2026-09-<tag>-claude.md`.

- **v116** (09-19): Die Assignment-Seite versprach „keine versteckten Voraussetzungen" und
  verschwieg die 3 Konzepte mit der laengsten Wartezeit. Guard-Suite 69 -> 70.
- **v117** (09-20): Der Totalenstreifen druckte „A1 28/38" und stand dann ueber neun
  Lecture-Seiten still. Guard-Suite 70 -> 71.
- **v118** (09-21): Der Offset-Fit, den kein Bildschirm rechnete - `scaling-transfer` war
  das letzte Lab ohne berechnete Buehne. Guard-Suite 71 -> 72.
- **v119** (09-22): Der Deutsch-Detektor kennt jetzt das Korpus statt einer getippten
  Wortliste. Guard-Suite 72 grün.
- **v120** (09-23): Das Bedienfeld - 23 Zahlen druckten dem deutschen Leser einen Punkt,
  wo das Panel daneben ein Komma rechnet. Guard-Suite 72 -> 73, Cache v97.

## v121 - 2026-09-23 - die Karte war halb uebersetzt, und das ist schlimmer als gar nicht

- **Die Flaeche.** Die drei Lab-Sweeps (Dezimal v92, Exponential v110, Bedienfeld v120)
  sehen alle auf ein Lab. Keiner hat je auf eine **Karte** gesehen: das gerechnete Beispiel
  einer Formel, die `details` eines Konzepts, die Beispielzeile eines Begriffs, das mentale
  Modell oder die Transferantwort eines Labs. Dort entscheidet **kein Helfer** ein
  Trennzeichen. Gemessen: **2296 Kartenstrings mit Ziffern, 452 Zahlen mit Punkt.**
- **Der Befund war die Kollision, nicht die Schreibweise.** Auf Deutsch ist das Komma
  Dezimal- *und* Listentrenner. Eine frueher halb gelaufene Konvertierung hatte die
  Dezimalen umgestellt und die Listentrenner nicht: `logsumexp` druckte
  `exp(z−m)≈[1,0,368]` fuer den zweielementigen Vektor `[1; 0,368]` - auf der Karte, deren
  Thema der Verlust von Genauigkeit ist. `temperature` `[1,0,5]` fuer `[1; 0,5]`, `softmax`
  `[1,0,368,0,135]`, `causal-attention` `[0,018,0,982,0]`, dazu `cross-entropy`,
  `gradient-clip`, `fasttext-filter`, `kl`. **`adamw`** schrieb, Weight Decay lasse θ „auf
  9.999" stehen, wo 9,999 gemeint ist - Faktor tausend, neben drei korrekt deutschen Zahlen.
- **Repariert:** 35 deutsche Strings ueber 27 Karten. Komma als Dezimaltrenner, Semikolon
  als Listentrenner, Klammern mit den Skalaren bewegt. Jede Rechnung nachgerechnet.
- **Die englische Seite trug dieselbe Kollision, ungesehen.** `content numerals` laesst
  jedes Trennzeichen zwischen zwei Ziffern fallen, also kollabierten beide Sprachen
  `b=[0.5,1,−2]` zur Phantomzahl `051` und stimmten ueberein. Deutsch allein zu reparieren
  legte 26 Felder mit Laeufen wie `102040` und `025075` frei. **30 englische Listen** tragen
  jetzt ein Leerzeichen hinter dem Trenner.
- **Die Zusicherung war der Grund.** `requireTextFragments` schrieb fuer `linear-map` und
  `residual` **ein** Fragment fuer beide Sprachen fest, waehrend `parameter-init` und `mfu`
  zwei Zeilen darueber laengst nach Locale unterscheiden. Genau diese beiden Karten hatten
  ihre englische Notation behalten.
- **Der englische Zwilling ist der einzige Ausweg aus der Mehrdeutigkeit.** `3.536`, `1.368`
  und `1.048` sehen exakt wie deutsche Tausendergruppen aus; strukturell ist das nicht
  entscheidbar. Alle 452 Stellen haben einen eigenen englischen Wert am selben Pfad, und
  Englisch ist eindeutig. **405 Gruppierungen, 405 gegen den Zwilling bestaetigt** statt
  angenommen - das fand `compression-ratio`s `1.353×` und `1.658×`, Verhaeltnisse in
  Gruppenschreibweise.
- **Kein Notationsfehler, sondern eine falsche Zahl:** `compression-ratio`s Transferantwort
  lehrt `Wachstum = 2/r` und nannte fuer den **passenden** Tokenizer bei `r = 1,3605` den
  Wert `1,658×` - das ist die **gekreuzte** Zelle (`r = 1,2062`); die passende liest
  `1,470×`. Wer die eben erklaerte Division nachrechnete, bekam eine dritte Antwort.
- Guard-Suite **73 -> 75 Bloecke gruen**: `card numerals` und `compression growth`.
  Cache-Bump auf **v98** (4 Stellen).
- **Mutationstest:** 16 Mutationen, 15 tragend oder gefangen, **1 inert mit gemessenem
  Grund**, 3 gruene Kontrollen. Drei Klauseln sind als Paar tragend bewiesen
  (Kollisionstest, Zwillingsbestaetigung, Zitatklausel). Die fuehrende-Null-Klausel aus
  v120 ist auf dieser Flaeche **redundant**, weil der Zwilling `0.731` ohnehin zurueckweist
  - sie bleibt tragend dort, wo es keinen Zwilling gibt, und die Grenze steht im Guard.
- **Kein Browsertest** - in geplanten Laeufen gesperrt. Ersatz: **164 Renders** aller 82
  Formelkarten als vollstaendiges Akkordeon in beiden Sprachen, 0 Probleme, der Scanner
  vorher mit zwei injizierten Defekten als sehend belegt.
- Der Iteration Counter wurde erhoeht, da der Run ueber einen Scheduled Task startete.

## v122 - 2026-09-24 - zwei Kommas hatte der Test verlangt, die Listen haben eins

- Status: abgeschlossen. Branch `claude/dreamy-cray-97d7fd`, gebaut auf dem Kettenkopf v121
  (`c230c69`). Der zugewiesene Worktree stand auf v99 (`2ed21e7`), **22 Commits hinter dem
  Kopf**; die Ahnenpruefung ueber alle Spitzen fand keinen verlorenen Zweig, auch der
  Haupt-Checkout (`1461c41`) ist im Kopf enthalten. Codex-Pruefung: Haupt-Checkout seit dem
  29. Juli unberuehrt.
- **Zuerst der Hebel, den v121 als groessten offenen genannt hatte:** die gerechneten
  Beispiele aller 82 Formelkarten gegen **ihre eigene Arithmetik** gehalten, nicht nur gegen
  ihre Schreibweise. Alle 82 nachgerechnet - Mittelwert bis PPO-Clip, inklusive der
  Byte-Zaehlung von Lecture 1s Emoji-String, der Kaskadenausbeute mit ihren vier
  Verwerfungsanteilen und des Flash-Backward-Falls. **Kein einziger Rechenfehler.** Die
  Kennzahl war Verdacht, der Befund liegt woanders.
- **Der Befund: `{2,}` heisst zwei Kommas.** `card numerals` (v121) prueft die Kollision mit
  `/\d+(?:,\d+){2,}/` - zwei Kommas, also drei Zahlen und mehr. Der Defekt, aus dem der Test
  entstand (`[1,0,368]`), trug genau zwei; das Muster wurde daran angepasst, und **eine Liste
  mit genau ZWEI Elementen wurde nie angesehen**. Das ist die Form, die die meisten Listen der
  App haben. Der Test lief ausserdem leer: 5 Komma-Laeufe, alle 5 als Tensor-Shape entschuldigt.
- **16 Kollisionen in 5 Feldern**, jede in einem String, der das Komma auch als Dezimaltrenner
  benutzt: `mean-var` „Zahlen [1,3]" neben eigenem `1,414`; `z-loss` `z_t=[0,0]` neben `0,693`
  - und ohne die zwei Nullen ist nicht nachvollziehbar, warum die Summe `log 2` ist;
  `logistic` `x=[2,1]` neben `0,368`, wo `wᵀx` zwei Komponenten braucht; **acht Listen in
  `flash-backward`** neben `dQ≈0,462`, in der Karte, die man Index fuer Index liest.
- **Der schaerfste Fall:** `concepts.rope.answers[1]` druckte die Dezimalzahl `0,2` und das
  Koordinatenpaar `[0,2]` **dreissig Zeichen auseinander in einem Satz** - als Antwort auf den
  Check, der genau fragt, welche *Winkel* und welche *Koordinatenpaare* A1 verlangt. Die zwei
  Dinge, die der Leser unterscheiden soll, waren gleich geschrieben.
- **Die Zusicherung war wieder der Grund.** `requireTextFragments` schrieb `"[0,1]"` und
  `"[2,3]"` fuer **beide** Sprachen fest - derselbe Fehler, den v121 zwei Zeilen unter
  `parameter-init`s korrekt getrennter Fassung bei `linear-map` gefunden hatte. Der Vertrag
  zertifizierte die Kollision.
- **Repariert:** 11 deutsche Strings (Semikolon als Listentrenner) und ihre 11 englischen
  Zwillinge (Leerzeichen hinter dem Trenner, damit `content numerals` nicht auf eine
  Phantomzahl laeuft). Dazu die drei rope-Geschwister (`details`, `mental`, `pitfall`), weil
  sonst die Antwort `[0; 1]` und die Erklaerung `[0,1]` schreibt.
- **Der Einzelfall, dessen Fehllesung eine gueltige Rechnung ist:**
  `distributed-critical-path` schrieb `max(0,40−25)`. Deutsch gelesen ist das `0,40−25 =
  −24,6` - ein vollstaendiger Ausdruck, der eine Zahl ergibt, an der Stelle, an der die Prosa
  eine Zahl verlangt. Ein fehlgelesener Shape ergibt nichts. Genau eine Fundstelle, und sie
  wird jetzt auch ohne Dezimalzahl in der Naehe gemeldet.
- **Neuer Guard `card comma lists`** (Suite **75 -> 76 Bloecke gruen**): 1743 Einkomma-Paare
  ueber 2296 Strings in 9 Paketen. **Der Zwilling wird an den eigenen Trennzeichen verankert**
  - 1446 so bestaetigt, 249 ueber den unverankerten Rueckfall. Ohne die Verankerung ist
  `rope.answers` **nicht** entscheidbar: eine Suche ueber den ganzen String findet dessen
  eigene legitime `0.2` im Englischen und buergt damit fuer das Paar `[0,2]` daneben - der
  Defekt zertifiziert sich selbst aus dem Bericht heraus.
- Entschuldigt und gezaehlt: 34 Strings ohne jeden Dezimalkomma-Gebrauch (PyTorch-Shapes,
  Python-Quelltext, Matrixadressen, Einheitsintervall, aus dem Handout zitierte Zahlen),
  10 Regex-Quantoren `\d{1,3}`, 2 tiefgestellte Indexpaare `θ_(2,1)`. Die erste Klasse ist
  **string-lokal und damit wissentlich blind**, denn die Gewohnheit eines Lesers ist es nicht;
  das steht im Guard.
- **Der Guard ist bei jedem Lauf als sehend belegt, nicht nur unter Mutation:** eine
  eingebaute Fixture-Kollision muss gefangen werden und ein Kontroll-Shape gruen bleiben,
  beide durch denselben Codepfad.
- **Mutationstest:** 19 Mutationen, **0 inert**. 12 gefangen (jeder reparierte String
  einzeln zurueck, plus die beiden Ausnahmen, deren Streichung Falschmeldungen erzeugt),
  3 als Paar tragend bewiesen (Verankerung, Arithmetik-Klausel, Fixture als letzte Instanz),
  4 gruene Kontrollen. Drei erste Ergebnisse waren Lehrgeld: zwei Mutationen wurden von einer
  **Leerlauf-Schranke** gefangen statt von der geprueften Klausel, und eine Kontrolle war
  falsch gebaut - ein Shape neben eine Dezimalzahl gesetzt **ist** die Kollision.
- **Kein Browsertest** - in geplanten Laeufen gesperrt. Ersatz: **778 Renders** aller
  Formelkarten-`example`/`pitfall` und aller Konzept-`mental`/`details`/`answers` in beiden
  Sprachen durch `formulaText`, `esc` und `selfCheckMarkup` der App selbst. 0 Probleme, 9/9
  geaenderte Felder im gerenderten Deutsch nachgewiesen, der Scanner vorher mit zwei
  injizierten Defekten als sehend belegt (0 -> genau 2 -> 0). Zusaetzlich geprueft: **kein
  `split(";")` existiert in der App**; die zwei `split(",")` treffen `adapters`/`tests` von
  Problemen, keine Kartenprosa.
- Cache-Bump auf **v99** (4 Stellen).
- Der Iteration Counter wurde erhoeht, da der Run ueber einen Scheduled Task startete.

## v123 - 2026-09-25 - die Regel, die das Handout ausschreibt, stand im Tafelwerk nicht

- Status: abgeschlossen. Branch `claude/deep-review-v123`, gebaut auf dem Kettenkopf v122
  (`29e0540`). Der zugewiesene Worktree stand auf v99 (`2ed21e7`), **24 Commits hinter dem
  Kopf**; die Ahnenpruefung ueber alle Branch-Spitzen fand keinen verlorenen Zweig.
  Codex-Pruefung: Haupt-Checkout seit dem 29. Juli unberuehrt.
- **Der Hebel, den v121 und v122 beide als groessten offenen *inhaltlichen* genannt hatten.**
  Lecture 13 kuratierte zwei Formelkarten (`corpus-throughput`, `cascade-yield`) und keine fuer
  den regelbasierten Qualitaetsfilter - obwohl A4 §2.6 alle vier Schwellen wortwoertlich
  ausschreibt (50 bis 100000 Woerter, mittlere Wortlaenge 3 bis 10 Zeichen, hoechstens 30 %
  Zeilen auf drei Punkten, mindestens 80 % Woerter mit Buchstaben), Problem
  (gopher_quality_filters) 3 Punkte traegt und L13 die vierte Regel selbst nennt: „Quality
  filtering using manual rules (not classifier) - e.g., 80% words contain at least one
  alphabetic character". Das Lab rechnete die Regeln; die Flaeche, auf der ein Leser eine Regel
  **nachschlaegt**, nannte sie nicht. Und die einzige Formelkarte des Konzepts
  `quality-filtering` war `logistic` - der **Klassifikator**.
- **Neue Karte `gopher-rules`** (Tafelwerk 82 -> 83), deutsch und englisch, mit Gleichung als
  Konjunktion der vier Bedingungen, sieben Symbolerklaerungen, Intuition, Fallstrick, gerechnetem
  Beispiel und Selbstcheck mit Musterloesung. Verknuepft in `quality-filtering` und in L13s
  kuratierter Liste.
- **Das gerechnete Beispiel ist der Fallstrick selbst.** Drei der vier Regeln zaehlen Woerter,
  und A4 legt nicht fest, was ein Wort ist. Die Linkliste aus dem Lab: an Leerraum getrennt
  N = 6 und L̄ = 417/6 = 69,5 - zwei Regeln greifen; satzzeichenweise N = 102 und
  L̄ = 417/102 = 4,0882 - beide Wortregeln erfuellt, verworfen nur noch vom alphabetischen
  Anteil 54/102 = 0,5294. Der Forumsbeitrag (menschliches Urteil: behalten) **dreht das Urteil**:
  an Leerraum besteht er alle vier, satzzeichenweise faellt er durch zwei. Dasselbe Dokument,
  zwei zulaessige Tokenisierungen, zwei Urteile - genau der Vergleich, den A4 (b) an 20
  Beispielen verlangt.
- **Die Reihenfolge in `CONCEPTS[].formulas` ist tragend, nicht kosmetisch.** Die Karte zuerst
  einzutragen liess `lecture formulas` sofort rot laufen: auf einer Lecture, die **keine** Karte
  des Konzepts kuratiert, druckt die App nur die **erste** - `logistic` fiel damit vollstaendig
  vom Lernpfad. Anhaengen ist richtig, Voranstellen still falsch; der neue Guard haelt genau das
  mit Namen fest.
- **Guard 1: `gopher rules`** (Suite 76 -> 77). Alle sechs Schwellen werden aus den Praedikaten
  des Labs **herausgemessen** statt getippt, jede Zahl des Beispiels zweimal nachgerechnet (durch
  `qtMeasure` der App und durch die Handout-Referenz am Dateikopf) und dann in **dem** Abschnitt
  des Beispiels verlangt, der zu ihrer eigenen Tokenisierung gehoert - der Wert der anderen ist
  dort **verboten**. Die gerichtete Behauptung (Satzzeichen abtrennen hebt N und senkt L̄ und
  f_α) ist auf allen 8 Dokumenten in beide Richtungen bewiesen, als nicht-leer belegt und mit
  ihrem Mechanismus (beide Tokenisierungen behalten exakt dieselben Zeichen) und ihrer Grenze
  (eine Messung an acht konstruierten Dokumenten, kein Satz) im Guard notiert.
- **Guard 2: `card arithmetic`** (Suite 77 -> 78) - der zweite Hebel aus v122: „Die Arithmetik
  ist einmal von Hand geprueft, aber von keinem Guard gehalten." Die sechs Karten, deren Beispiel
  reine Arithmetik ist (`mean-var`, `softmax`, `logsumexp`, `rmsnorm`, `swiglu`, `bloom-filter`),
  werden jetzt aus ihrer eigenen Gleichung nachgerechnet: 25 Zahlen plus 11 ausgeschriebene
  Divisionen und Summen, in beiden Sprachen, **in der Reihenfolge**, in der die Rechnung sie
  erzeugt. Die drei bestehenden Kartensweeps fragen nur, wie eine Zahl *geschrieben* ist; ein
  Beispiel, dessen Zahlen in beiden Sprachen gleich falsch sind, kommt durch alle drei.
- **Zwei Blindstellen, die erst der Mutationstest zeigte.** (1) **Anwesenheit genuegt nicht:**
  `softmax` druckt seine Summe `1,503` viermal - einmal als Ergebnis und dreimal als Nenner. Eine
  davon zu verfaelschen laesst die Zahl im Text stehen; erst die **festgeschriebene
  Fundstellenzahl** faengt es. (2) **Die Reihenfolge braucht beide Haelften:** `rmsnorm`s zwei
  Zaehler zu tauschen laesst `3/3,536` und `4/3,536` je einmal stehen - erst die
  Reihenfolgepruefung **der Schritte** faengt es. Beide Luecken standen in der ersten Fassung
  des Blocks offen und wurden geschlossen, nicht wegdefiniert.
- **Eine dritte Lehre, ueber die Messung statt ueber den Code:** die erste Fassung der
  Schwellenmessung lief `value += 0.01` und meldete die Ellipsen-Schwelle bei 0,295, weil die
  Akkumulation 0,30000000000000004 ergibt. Der Code war richtig, das Messinstrument falsch;
  seitdem laeuft die Messung ueber exakt darstellbare Kandidaten `i/100`. Und die erste
  Wortzahl-Messung wurde von der **Randschranke** des Lineals gefangen statt von der geprueften
  Klausel - der Scan wurde geweitet, bis die gemeinte Klausel spricht.
- **Mutationstest:** 58 Mutationen ueber beide Bloecke, **0 entkommen, 0 inert**, 6 gruene
  Kontrollen, Kontrolle vor und nach dem Lauf gruen. `gopher rules`: 30 gefangen (jede Zahl des
  Beispiels einzeln, die gekreuzte Paarung bei stehengebliebenem eigenen Wert, die vertauschte
  Reihenfolge, beide Sprachen, die vier Lab-Praedikate, die Tokenizer-Regex, das menschliche
  Urteil des Forumsbeitrags und ein neuntes Dokument). `card arithmetic`: 28 gefangen.
  Schlankfassung nach [[cs336-guard-suite-slim-harness]]: 0,25 s je Lauf statt 85 s.
- **Kein Browsertest** - in geplanten Laeufen gesperrt. Ersatz: die neue Karte durch
  `formulaLearningSequence`, `formulaPrimerMarkup`, `formulaNotationMarkup` und
  `selfCheckMarkup` der App selbst headless gerendert, in beiden Sprachen, 5471 und 5301 Zeichen,
  neun Tagpaare ausbalanciert, kein `undefined`, kein uninterpoliertes Template, kein NaN. Die
  volle Suite rendert die Karte zusaetzlich in `accordion route` (265 Akkordeon-Instanzen) und
  prueft sie in `formula field fallthrough` gegen deutsche Reste.
- Cache-Bump auf **v100** (4 Stellen), README auf 83 Formeln.
- Der Iteration Counter wurde erhoeht, da der Run ueber einen Scheduled Task startete.
