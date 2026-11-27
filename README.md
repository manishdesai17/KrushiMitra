# KrushiMitra

**Smart Farmer Assistant** is a Gujarati-first farm management application. This repository starts with one Spring Boot monolith, PostgreSQL, and an Angular web client. It is intentionally developed in phases rather than pretending every future integration is already available.

## Current Project Structure

```text
Farmer/
├── backend/
│   ├── .mvn/wrapper/                 Maven wrapper files
│   ├── mvnw.cmd                      Windows Maven entry point
│   ├── pom.xml                       Spring Boot, Java 17 dependencies
│   └── src/
│       ├── main/java/com/krushimitra/
│       │   ├── config/               CORS, password hashing, security boundary
│       │   ├── controller/           Farmer REST endpoints
│       │   ├── dto/                  Validated request/response records
│       │   ├── entity/               JPA user and farmer entities
│       │   ├── exception/            API error handling
│       │   ├── repository/           Spring Data repositories
│       │   ├── service/              Farmer service contract
│       │   ├── service/impl/         Farmer CRUD implementation
│       │   └── resources/
│       │       ├── application.properties
│       │       └── db/migration/     PostgreSQL Flyway migrations
│       └── test/                     H2-backed context tests
├── frontend/
│   ├── angular.json
│   ├── package.json
│   └── src/
│       ├── app/                      Gujarati views and application state
│       ├── index.html                Gujarati document metadata
│       └── styles.css                Shared typography and base styles
├── docker-compose.yml                Local PostgreSQL service
└── .env.example
```

As features grow, Angular views can move into `features/farm`, `features/crop`, `features/activity`, and `features/ai-assistant`; shared navigation and API clients belong in `shared/` and `core/`. The current first slice keeps setup small while keeping the Java API layers separate.

## Architecture

```text
Angular (Gujarati UI, port 4200)
    └── REST / JSON ──> Spring Boot monolith (port 8080)
                            ├── Controller: HTTP and validation boundary
                            ├── Service: farmer rules and password encoding
                            ├── Repository: Spring Data JPA
                            └── PostgreSQL: Flyway-managed schema
```

Farmer registration is stored through the REST API. Farm, crop, activity, and mock-chat screens are usable prototypes saved in this browser's local storage; those records are not yet sent to the server. Weather and market cards explicitly show that no live provider is configured. The assistant is a local mock and is not an agricultural expert.

The seven initial PostgreSQL tables are created by `backend/src/main/resources/db/migration/V1__create_initial_schema.sql`: `mst_user`, `mst_farmer`, `mst_farm`, `mst_crop`, `trn_crop_activity`, `trn_ai_conversation`, and `trn_ai_message`. Password hashes are generated with BCrypt and are never included in API responses.

## Run Locally

Prerequisites: Java 17+, Node.js 20.19+ or 22.12+, npm, and Docker Desktop (or a local PostgreSQL 17 installation).

1. Start PostgreSQL from the project root:

   ```powershell
   docker compose up -d postgres
   ```

   The default local database is `krushimitra` with user/password `postgres`. For a shared or production environment, set strong credentials through environment variables; do not commit `.env`.

2. Start the API in a PowerShell terminal:

   ```powershell
   .\backend\mvnw.cmd -f backend\pom.xml spring-boot:run
   ```

3. Start Angular in a second terminal:

   ```powershell
   npm start --prefix frontend
   ```

   Open `http://localhost:4200`.

The API uses `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` when provided; defaults point to the local Compose database. On the first API startup, Flyway creates the schema.

## Farmer API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/farmers` | List farmers |
| `GET` | `/api/farmers/{id}` | View one farmer |
| `POST` | `/api/farmers` | Register a farmer |
| `PUT` | `/api/farmers/{id}` | Update profile |
| `DELETE` | `/api/farmers/{id}` | Delete a farmer |

Example registration body:

```json
{
  "fullName": "Ramesh Patel",
  "mobileNumber": "9876543210",
  "email": "ramesh@example.com",
  "password": "change-this-password",
  "village": "Naranpura",
  "taluka": "Ahmedabad City",
  "district": "Ahmedabad",
  "state": "Gujarat"
}
```

Validation errors return a `ProblemDetail` response with field messages. The API is open during this first CRUD phase; login and role-based authorization are not implemented yet, so do not expose it publicly.

## Checks

```powershell
npm run build --prefix frontend
& .\backend\mvnw.cmd -f backend\pom.xml test
```

Backend tests use an isolated H2 database. The application itself remains configured for PostgreSQL and Flyway.

## Development Phases

1. Farmer CRUD API and Angular registration/list integration (current backend and first UI slice).
2. Authentication, profile, and dashboard integration.
3. Persist farms, crops, and activities through the API.
4. Replace the mock assistant with an optional Spring AI provider; add RAG only after a trusted knowledge source exists.
5. Add weather, market data, and disease-image analysis only after authentic providers and expert-reviewed guidance are selected.
6. Add admin permissions and prepare an Ionic/Capacitor mobile client.

## Location suggestions

The Gujarat district, taluka, town, and village suggestions are derived from DataMeet's Indian Village Boundaries dataset and its Census 2011 source. Administrative boundaries may have changed since then, so the registration form allows missing or newer place names to be entered manually. Location suggestions for states outside Gujarat are not bundled.

The location database is shared under the Open Database License (ODbL). See [the included ODbL text](frontend/public/assets/data/ODbL.txt) and the [DataMeet source project](https://github.com/datameet/indian_village_boundaries).