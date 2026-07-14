# CS336 Lernwerk

Inoffizielle, deutschsprachige Lernhilfe für Stanford CS336 „Language Models from Scratch“. Das Projekt ist nicht mit Stanford verbunden und erzeugt keine Assignment-Lösungen.

## Architektur

- GitHub Pages veröffentlicht ausschließlich die statische Lernhilfe.
- Supabase Auth schützt den persönlichen Lernstand und die privaten Kurs-PDFs.
- `localStorage` speichert Änderungen sofort auf dem Gerät; Supabase synchronisiert sie nach dem Login.
- Eine Progressive Web App (PWA) ermöglicht die Installation auf iPhone und iPad.
- Die PDFs werden durch `.gitignore` vom öffentlichen Repository ausgeschlossen.

## Supabase einrichten

1. Im bestehenden Supabase-Account ein neues Projekt `CS336-Lernwerk` anlegen.
2. Unter **Authentication → Providers → Email** E-Mail/Passwort aktivieren und öffentliche Registrierung deaktivieren.
3. Unter **Authentication → Users** den persönlichen Benutzer manuell anlegen und bestätigen.
4. `supabase/setup.sql` im SQL Editor ausführen.
5. Die UUID des Benutzers in die am Ende von `setup.sql` dokumentierte `insert`-Anweisung einsetzen und ausführen.
6. Unter **Project Settings → API** die Project URL und den Publishable Key kopieren. Der Publishable Key darf im Browser stehen; niemals Secret- oder `service_role`-Keys veröffentlichen.

## PDFs einmalig privat hochladen

Der Upload läuft lokal mit einem temporär gesetzten Service-Role-Key. Der Schlüssel wird weder gespeichert noch ausgegeben:

```bash
SUPABASE_URL="https://PROJECT.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="..." \
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
