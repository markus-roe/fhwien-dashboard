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

- React/Next.js-Anwendung mit TypeScript
- RESTful API-Endpoints für CRUD-Operationen
- Datenbank-Schema und Migrations (Prisma)
- Authentifizierung und Rollenverwaltung (NextAuth)
- Responsive Design für alle Geräte
- Dashboard für Professoren/Admins
- Schedule/Kalender für Studierende
- Gruppen-Verwaltung
- Coaching-Terminbuchung

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

Bevor Sie das Projekt lokal einrichten können, benötigen Sie:

- **Node.js** (Version 18 oder höher)
- **pnpm** oder **npm** als Package Manager
- **PostgreSQL** Datenbank (lokal oder remote)
- **Git** für Versionskontrolle

## Umgebungsvariablen

Erstellen Sie eine `.env` Datei im Root-Verzeichnis des Projekts mit folgenden Variablen:

```env
# Datenbank
DATABASE_URL="postgresql://user:password@localhost:5432/database_name"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

**Wichtig:**
- `DATABASE_URL`: PostgreSQL-Verbindungsstring für Ihre Datenbank
- `NEXTAUTH_SECRET`: Ein zufälliger, sicherer String für die Session-Verschlüsselung (kann mit `openssl rand -base64 32` generiert werden)
- `NEXTAUTH_URL`: Die Basis-URL Ihrer Anwendung (für lokale Entwicklung: `http://localhost:3000`)

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
   - Erstellen Sie eine `.env` Datei (siehe Abschnitt "Umgebungsvariablen")
   - Füllen Sie alle erforderlichen Variablen aus

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
   - Öffnen Sie [http://localhost:3000](http://localhost:3000) im Browser

### Verfügbare Scripts

- `pnpm dev` - Startet den Entwicklungsserver
- `pnpm build` - Erstellt eine Production-Build
- `pnpm start` - Startet den Production-Server
- `pnpm lint` - Führt ESLint aus
