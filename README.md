# FH Wien Dashboard - DTI/DI

## Gruppenprojekt - Software Engineering

Dieses Projekt wurde im Rahmen des Software Engineering Kurses an der FH Wien entwickelt.

### Projektstruktur

**Pair Programming** Teams:

- **Pair 1 (Frontend)**: Entwicklung der Frontend-Anwendung mit Next.js und TypeScript

  - Benutzeroberfläche für alle Bereiche (Dashboard, Schedule, Gruppen, Coaching)
  - UI-Komponenten und Design-System
  - Client-seitige Logik und State-Management
  - Responsive Design und Mobile-Optimierung

- **Pair 2 (Backend)**: Entwicklung des Backend-Systems
  - API-Endpoints für alle Datenoperationen
  - Datenbank-Integration
  - Business-Logik und Datenvalidierung

### Projektbeschreibung

Ein modernes Dashboard-System für die FH Wien, entwickelt für das DTI/DI-Programm. Die Anwendung bietet umfassende Funktionen zur Verwaltung von Lehrveranstaltungen, Coaching-Terminen, Gruppen und Benutzern.

**Architektur:**

1. **Frontend (Pair 1)**: Vollständige React/Next.js-Anwendung mit allen Benutzeroberflächen

   - Dashboard für Professoren/Admins
   - Schedule/Kalender für Studierende
   - Gruppen-Verwaltung
   - Coaching-Terminbuchung
   - Responsive Design für alle Geräte

2. **Backend (Pair 2)**: RESTful API und Datenbank-System
   - API-Endpoints für CRUD-Operationen
   - Datenbank-Schema und Migrations
   - Authentifizierung und Rollenverwaltung
   - Datenvalidierung und Business-Logik

## Features

### Schedule (Kalender)

- **Kalenderansichten**: Monats-, Wochen- und Tagesansicht
- **Listenansicht**: Übersichtliche Darstellung aller Sessions
- **Session-Panel**: Detaillierte Informationen zu einzelnen Sessions
- **Filterung**: Nach Kursen filtern und Sichtbarkeit steuern
- **Next-Up Card**: Übersicht über anstehende Sessions
- **Mobile Responsive**: Optimiert für alle Bildschirmgrößen

### Dashboard (für Professoren/Admins)

- **Sessions-Verwaltung**: Erstellen, Bearbeiten und Löschen von Sessions
- **Coaching-Slots**: Verwaltung von Coaching-Terminen
- **Gruppen-Verwaltung**: Übersicht und Verwaltung aller Gruppen
- **Benutzer-Verwaltung**: Verwaltung von Studierenden
- **Kurs-Auswahl**: Filterung nach verschiedenen Kursen

### Gruppen

- **Gruppen-Erstellung**: Neue Gruppen für Kurse erstellen
- **Gruppen-Beitritt**: Studierenden können Gruppen beitreten
- **Suche**: Durchsuchung nach Gruppenname, Beschreibung oder Mitgliedern
- **Kurs-Filter**: Filterung nach spezifischen Kursen
- **Meine Gruppen**: Separate Ansicht für eigene Gruppen

### Coaching

- **Coaching-Slots**: Verfügbare Coaching-Termine anzeigen
- **Buchung**: Studierende können Coaching-Termine buchen
- **Meine Buchungen**: Übersicht über gebuchte Termine
- **Vergangene Coachings**: Collapsible Ansicht für vergangene Termine
- **Kurs-Filter**: Filterung nach Kursen

### Profil

- Name und E-Mail bearbeiten
- Passwort ändern
