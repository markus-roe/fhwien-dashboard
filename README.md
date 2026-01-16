# FH Wien Dashboard - DTI/DI

## Gruppenprojekt - Software Engineering

Dieses Projekt wurde im Rahmen des Software Engineering Kurses an der FH Wien entwickelt.

### Team

- Johannes Liebacher
- Markus Rösner
- Melanie Trautenberger
- ÖZDEMIR Öznur

### Projektbeschreibung

Ein modernes Dashboard-System für die FH Wien, entwickelt für das DTI/DI-Programm. Die Anwendung bietet umfassende Funktionen zur Verwaltung von Lehrveranstaltungen, Coaching-Terminen, Gruppen und Benutzern.

**Architektur:**

![FH Wien Dashboard - Projektarchitektur](./public/image.png)

Die Anwendung folgt einer mehrschichtigen Architektur:

**User Interface Layer:**
- Next.js 15 mit App Router
- Seiten: Übersicht, Terminplan, Gruppen, Coachings

**Components Layer:**
- Shared Components (TopNav, Sidebar, Card, Button, Badge)
- Feature Components (SessionPanel, GroupsList, CoachingSlots)

**Data Layer:**
- React Query für State Management
- Custom Hooks (useCurrentUser, useSessions, useGroups, useCoachingSlots, useCourses)

**Backend Layer:**
- API Routes (/api)
- Prisma ORM
- PostgreSQL Database

**Features:**
- Dashboard für Professoren/Admins
- Schedule/Kalender für Studierende
- Gruppen-Verwaltung
- Coaching-Terminbuchung
- Responsive Design für alle Geräte

## Tech Stack

### Frontend
- **Next.js 14** - React Framework mit App Router
- **TypeScript** - Typsichere Entwicklung
- **React 18** - UI-Bibliothek
- **Tailwind CSS** - Utility-first CSS Framework
- **TanStack Query** - Daten-Fetching und State Management
- **Lucide React** - Icon-Bibliothek
- **date-fns** - Datums- und Zeitmanipulation

### Backend
- **Next.js API Routes** - Serverless API-Endpoints
- **Prisma** - ORM für Datenbankzugriffe
- **PostgreSQL** - Relationale Datenbank
- **NextAuth.js** - Authentifizierung und Session-Management
- **bcryptjs** - Passwort-Hashing

### Tools & Libraries
- **Swagger/OpenAPI** - API-Dokumentation
- **ESLint** - Code-Linting

## API Dokumentation

Die vollständige API-Dokumentation ist unter `/api-docs` verfügbar. Sie bietet eine interaktive Übersicht aller verfügbaren Endpoints, Request/Response-Schemas und Beispielanfragen.

Die OpenAPI-Spezifikation kann unter `/api/openapi` im JSON-Format abgerufen werden.

### API-Dokumentation

- **Interaktive Dokumentation**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs) (im Development-Modus)
- **OpenAPI JSON**: [http://localhost:3000/api/openapi](http://localhost:3000/api/openapi)

### Verfügbare API-Endpoints

#### Benutzer (Users)
- `GET /api/users` - Alle Benutzer abrufen (mit optionalen Filtern: `program`, `search`)
- `GET /api/users/{id}` - Benutzer nach ID abrufen
- `POST /api/users` - Neuen Benutzer erstellen
- `PUT /api/users/{id}` - Benutzer aktualisieren
- `DELETE /api/users/{id}` - Benutzer löschen

#### Kurse (Courses)
- `GET /api/courses` - Alle Kurse abrufen (mit optionalem Filter: `program`)

#### Sessions
- `GET /api/sessions` - Alle Sessions abrufen (mit optionalem Filter: `courseId`)
- `GET /api/sessions/{id}` - Session nach ID abrufen
- `POST /api/sessions` - Neue Session erstellen
- `PUT /api/sessions/{id}` - Session aktualisieren
- `DELETE /api/sessions/{id}` - Session löschen

#### Gruppen (Groups)
- `GET /api/groups` - Alle Gruppen abrufen (mit optionalem Filter: `courseId`)
- `GET /api/groups/{id}` - Gruppe nach ID abrufen
- `POST /api/groups` - Neue Gruppe erstellen
- `PUT /api/groups/{id}` - Gruppe aktualisieren
- `DELETE /api/groups/{id}` - Gruppe löschen
- `POST /api/groups/{id}/join` - Gruppe beitreten
- `POST /api/groups/{id}/leave` - Gruppe verlassen

#### Coaching-Slots
- `GET /api/coaching-slots` - Alle Coaching-Slots abrufen (mit optionalem Filter: `courseId`)
- `GET /api/coaching-slots/{id}` - Coaching-Slot nach ID abrufen
- `POST /api/coaching-slots` - Neuen Coaching-Slot erstellen
- `PUT /api/coaching-slots/{id}` - Coaching-Slot aktualisieren
- `DELETE /api/coaching-slots/{id}` - Coaching-Slot löschen
- `POST /api/coaching-slots/{id}/book` - Coaching-Slot buchen
- `POST /api/coaching-slots/{id}/cancel` - Buchung stornieren

#### Authentifizierung & Profil
- `POST /api/change-password` - Passwort des aktuellen Benutzers ändern

### Authentifizierung

Die Endpoints erfordern eine Authentifizierung über NextAuth.js. Die Session wird automatisch über Cookies verwaltet.

Für die API-Dokumentation wird Bearer Token Authentication unterstützt (siehe `/api-docs` für Details).

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

## Voraussetzungen

Für die lokale Einrichtung des Projekts werden benötigt:

- **Node.js** (Version 18 oder höher)
- **pnpm** oder **npm** als Package Manager
- **PostgreSQL** Datenbank (lokal oder remote)
- **Git** für Versionskontrolle

## Umgebungsvariablen

Eine `.env` Datei wird im Root-Verzeichnis des Projekts mit folgenden Variablen erstellt:

```env
# Datenbank
DATABASE_URL="postgresql://user:password@localhost:5432/database_name"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email Notifications (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxx"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
NOTIFICATION_EMAIL="admin@yourdomain.com"
```

**Wichtig:**
- `DATABASE_URL`: PostgreSQL-Verbindungsstring für die Datenbank
- `NEXTAUTH_SECRET`: Ein zufälliger, sicherer String für die Session-Verschlüsselung (kann mit `openssl rand -base64 32` generiert werden)
- `NEXTAUTH_URL`: Die Basis-URL der Anwendung (für lokale Entwicklung: `http://localhost:3000`)
- `RESEND_API_KEY`: API-Schlüssel von Resend für E-Mail-Versand (erforderlich für Bug-Report-Benachrichtigungen)
- `RESEND_FROM_EMAIL`: Absender-E-Mail-Adresse für Benachrichtigungen (optional, Standard: "onboarding@resend.dev")
- `NOTIFICATION_EMAIL`: E-Mail-Adresse, an die Bug-Report-Benachrichtigungen gesendet werden (optional, falls nicht gesetzt werden Admin-Benutzer aus der Datenbank verwendet)

## Installation & Setup

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd fhwien-dashboard
   ```

2. **Dependencies installieren**
   ```bash
   pnpm install
   # oder
   npm install
   ```

3. **Umgebungsvariablen konfigurieren**
   - Eine `.env` Datei wird erstellt (siehe Abschnitt "Umgebungsvariablen")
   - Alle erforderlichen Variablen werden ausgefüllt

4. **Datenbank einrichten**
   ```bash
   # Prisma Client generieren
   npx prisma generate
   
   # Datenbank-Migrationen ausführen
   npx prisma migrate deploy
   # oder für Development
   npx prisma migrate dev
   
   # Optional: Datenbank mit Seed-Daten füllen
   npx prisma db seed
   ```

5. **Entwicklungsserver starten**
   ```bash
   pnpm dev
   # oder
   npm run dev
   ```

6. **Anwendung öffnen**
   - Die Anwendung wird unter [http://localhost:3000](http://localhost:3000) im Browser geöffnet

### Verfügbare Scripts

- `pnpm dev` - Startet den Entwicklungsserver
- `pnpm build` - Erstellt eine Production-Build
- `pnpm start` - Startet den Production-Server
- `pnpm lint` - Führt ESLint aus
