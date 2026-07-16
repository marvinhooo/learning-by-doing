# CS336 Lernwerk

Inoffizielle, zweisprachige Lernplattform für Stanford CS336 „Language Models from Scratch“. Englisch ist die Standardsprache, Deutsch lässt sich jederzeit zuschalten. Das Projekt ist nicht mit Stanford verbunden und erzeugt keine Assignment-Lösungen.

Der aktuelle Lernpfad umfasst 13 Module, 65 vertiefte Konzepte, 72 Formeln, 71 Symbole, 70 Glossarbegriffe und 20 interaktive Labs. Eine Lecture Coverage Map ordnet alle 17 Vorlesungen den passenden Konzepten, Formeln, Labs und Assignments zu; 29 Assignment-Missions bilden alle 124 Problem-IDs der sechs Handouts ab.

## Empfohlener Lernfluss

1. Grundlagen-Diagnose ohne Hilfsmittel durchführen und `I don't know` ehrlich nutzen.
2. Den daraus priorisierten Prerequisite Sprint bearbeiten: Concept erklären, Selbstchecks erst selbst beantworten, dann Musterlösung vergleichen.
3. Verknüpfte Labs mit einer Vorhersage beginnen und objektive Transfer-Gates bestehen.
4. Assignment-Missions erst nach eigenem Entwurf öffnen; die Plattform liefert Invarianten, Tests und gestufte Hinweise, aber keinen Abgabecode.
5. Retrieval-Karten jederzeit nach Lernbedarf abrufen. Für den höchsten Mastery-Level wird jede Concept-Frage in zwei selbst gestarteten Sitzungen erfolgreich abgerufen; zwischen den Sitzungen gibt es keine Mindestwartezeit. Der danach sichtbare Lernverlauf zeigt den tatsächlich beobachteten Abstand pro Selbstcheck nur als Information.

Die Plattform spart Lecture-Nacharbeit und Suchzeit, ersetzt aber nicht das eigenständige Implementieren, Testen, Profiling oder die exakten Schnittstellen und Regeln der Handouts.

## Architektur

- GitHub Pages veröffentlicht ausschließlich die statische Lernhilfe.
- Supabase Auth schützt den persönlichen Lernstand und die privaten Kurs-PDFs.
- `localStorage` speichert Änderungen sofort auf dem Gerät; Supabase synchronisiert sie nach dem Login.
- Eine Progressive Web App (PWA) ermöglicht die Installation auf iPhone und iPad.
- Die PDFs werden durch `.gitignore` vom öffentlichen Repository ausgeschlossen.
- Auf iPhone und iPad besitzen zentrale Controls mindestens 44 Pixel große Touch-Ziele; Labs stapeln im Portrait-Modus für lesbare Erklärungen und Antwortoptionen.

## Supabase einrichten

1. Im bestehenden Supabase-Account ein neues Projekt `CS336-Lernwerk` anlegen.
2. Unter **Authentication → Providers → Email** E-Mail/Passwort aktivieren und öffentliche Registrierung deaktivieren.
3. Unter **Authentication → Users** den persönlichen Benutzer manuell anlegen und bestätigen.
4. `supabase/setup.sql` im SQL Editor ausführen.
5. Die UUID des Benutzers in die am Ende von `setup.sql` dokumentierte `insert`-Anweisung einsetzen und ausführen.
6. Unter **Project Settings → API** die Project URL und den Publishable Key kopieren. Der Publishable Key darf im Browser stehen; niemals Secret- oder `service_role`-Keys veröffentlichen.

## PDFs einmalig privat hochladen

Der Upload läuft lokal mit einem temporär gesetzten Secret Key (`sb_secret_...`). Der Schlüssel wird weder gespeichert noch ausgegeben. Der alte `service_role`-Key wird aus Kompatibilitaetsgruenden ebenfalls akzeptiert:

```bash
SUPABASE_URL="https://PROJECT.supabase.co" \
SUPABASE_SECRET_KEY="sb_secret_..." \
node scripts/upload-pdfs.mjs
```

Danach die Shell schließen beziehungsweise die Variablen entfernen. Der Browser erhält ausschließlich Leserechte für angemeldete aktive Mitglieder.

## GitHub Pages

Im Repository unter **Settings → Secrets and variables → Actions → Variables** anlegen:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

Unter **Settings → Pages → Source** `GitHub Actions` auswählen. Jeder Push auf `main` veröffentlicht anschließend automatisch die Seite. Die PDFs sind nicht Teil des Deployments.

## Lokal testen

Ohne Supabase-Konfiguration funktioniert die Lernhilfe weiterhin lokal und öffnet die vorhandenen PDFs direkt:

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Dann `http://127.0.0.1:8765/` öffnen.
