# Memory

## Stabile Produktentscheidungen

- Die CS336-Lernhilfe ist deutschsprachig und offline-first; sie bleibt lokal ohne Build-Schritt nutzbar und kann als PWA ueber GitHub Pages bereitgestellt werden.
- Sie folgt der Assignment-KI-Richtlinie: Konzepterklaerungen und gestufte Hinweise sind erlaubt; Assignment-Implementierungen und abgabefertige Antworten sind ausgeschlossen.
- Der Lernfluss priorisiert Diagnose, aktives Abrufen, interaktive Experimente und Selbstpruefung.
- Symbole und Formeln erhalten einen eigenstaendigen, durchsuchbaren Tafelwerk-Bereich mit Dimensionen, Intuition, Fehlerbildern und Quellen.
- Browser-Fortschritt, Notizen und Lesezeichen werden sofort benutzerspezifisch lokal gespeichert und nach Login optional ueber Supabase synchronisiert; Darstellungsmodus und zuletzt geoeffnete Ansicht bleiben geraetespezifisch.
- Fuer Cloud-Funktionen wird derselbe Supabase-Account beziehungsweise dieselbe Organisation wie beim Immo-Checker genutzt, aber dauerhaft ein separates Projekt `CS336-Lernwerk`.
- Die Anmeldung nutzt E-Mail und Passwort ohne oeffentliche Registrierung; aktive Benutzer werden per Membership-Tabelle freigeschaltet.
- Kurs-PDFs bleiben aus GitHub ausgeschlossen und liegen in einem privaten, nur lesbaren Supabase-Bucket; der administrative Secret Key beziehungsweise alte Service-Role-Key darf nie im Browser oder Repository stehen.
- GitHub Pages liefert nur statische Dateien und einen Publishable Key aus; Row Level Security (RLS; zeilenbasierte Zugriffskontrolle) schützt Lernstand und PDFs.
- `index.html` ist ab Version 2 der kanonische Einstieg; `cs336-lernwerk.html` bleibt als Weiterleitung erhalten. Der Quellenbestand umfasst 15 Lecture-PDFs und die sechs Assignment-PDFs zu A1 bis A5 inklusive A5-Supplement.
