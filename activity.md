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
