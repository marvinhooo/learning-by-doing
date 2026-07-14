# Activity

Iteration Counter: 0

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

- Geschlossene Glossareintraege zeigen nur noch Begriff und Kategorie, damit die Liste schnell scanbar bleibt.
- Beim Oeffnen erscheint die jeweilige kurze Definition unter der eindeutigen Kennzeichnung `Kurz erklaert`.
- Verifiziert: Alle 54 Glossarbegriffe besitzen Begriff, Kategorie und Definition; Inline-JavaScript, `git diff --check` und der reproduzierbare Site-Build sind sauber.
- Der Iteration Counter blieb unveraendert, da der Run manuell/interaktiv gestartet wurde.
