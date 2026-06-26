# AI Safety Compliance App

## Project Overview

This project is an Expo React Native mobile application paired with a FastAPI backend. Its purpose is to support workplace safety compliance by allowing workers to report incidents, view assigned training modules, access an AI safety assistant, and enable admins/officers to manage users, incidents, and safety-related content.

The frontend is built using Expo and `expo-router`. The backend is built with FastAPI and SQLAlchemy, with JWT-based authentication.

---

## Folder Structure

- `my-app/`
  - `package.json` - Expo app dependencies and scripts.
  - `tsconfig.json` - TypeScript configuration.
  - `README.md` - Expo starter documentation.
  - `project_summary.txt` - high-level project summary.
  - `src/` - Expo frontend sources.
    - `constants/api.ts` - API base URL and external AI endpoint.
    - `app/` - app screens and route definitions.
    - `components/` - reusable UI components.
    - `hooks/` - custom hooks.
  - `backend/` - FastAPI backend sources.
    - `main.py` - API endpoints and app configuration.
    - `models.py` - SQLAlchemy ORM models.
    - `schemas.py` - Pydantic request/response schemas.
    - `auth.py` - authentication utilities.
    - `dependencies.py` - auth role enforcement and token handling.
    - `database.py` - DB connection and session management.
    - `requirements.txt` - backend Python dependencies.

---

## Technology Stack

### Frontend

- Expo `~55.0.11`
- React Native `0.83.4`
- Expo Router `~55.0.10`
- React Navigation bottom tabs
- AsyncStorage
- Expo Camera, Audio, Image, Location, Linking, Speech
- TypeScript

### Backend

- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic
- python-jose
- passlib[bcrypt]
- python-multipart
- python-dotenv
- ultralytics / YOLO support for PPE detection

---

## Frontend Architecture

### App Entry and Auth

- `src/app/login.tsx`
  - Sends credentials to `POST /login`.
  - Stores JWT token in AsyncStorage.
  - Redirects users by role:
    - `admin` → `/(admin)/admin_dashboard`
    - `officer` → `/(officer)/officer_dashboard`
    - fallback `worker` → `/(worker)/ai_assistant`

- `src/app/register.tsx`
  - Sends registration data to `POST /register`.
  - Always creates users with `role: "worker"`.
  - Redirects to login on success.

- `src/constants/api.ts`
  - Defines `API_BASE_URL` from `EXPO_PUBLIC_API_URL` or default `http://192.168.100.16:8000`.
  - Defines `AI_CHAT_URL` fallback external AI endpoint.

### Admin Routes

- `src/app/(admin)/_layout.tsx`
  - Admin tab navigation with screens:
    - `admin_dashboard`
    - `create_module`
    - `module_list`
    - `manage_simulations`
    - `manage_zones`
    - `camera`

- `src/app/(admin)/admin_dashboard.tsx`
  - Admin dashboard fetches `/admin/users`.
  - Enables changing user roles to `officer` or `admin`.
  - Provides logout behavior.

- `src/app/(admin)/camera.tsx`
  - Displays live PPE camera scanning for admin.
  - Uses Expo Camera and sends image frames to `/detect-ppe`.
  - Detects PPE items and triggers alarm when PPE is missing.

- `src/app/(admin)/create_module.tsx`
  - UI for admin to create training modules.

- `src/app/(admin)/module_list.tsx`
  - UI for admin to view training modules.

- `src/app/(admin)/manage_simulations.tsx`
  - Admin simulation management UI.

- `src/app/(admin)/manage_zones.tsx`
  - Admin risk zone management UI.

### Officer Routes

- `src/app/(officer)/officer_dashboard.tsx`
  - Officer dashboard fetches `/incidents`.
  - Displays incident cards and allows status updates.
  - Logout support.

### Worker Routes

- `src/app/(worker)/_layout.tsx`
  - Worker tab navigation with screens:
    - `ai_assistant`
    - `report_incident`
    - `get_assigned_module`
    - `sos_alerts`
    - `simulations`
    - `risk_zone`

- `src/app/(worker)/ai_assistant.tsx`
  - In-app chat assistant for worker safety questions.
  - Provides local SOP responses for keywords.
  - Falls back to external AI service at `AI_CHAT_URL`.

- `src/app/(worker)/report_incident.tsx`
  - Enables workers to report incidents.
  - Captures location permissions and media attachments.
  - Sends incident data to `POST /incidents/`.

- `src/app/(worker)/get_assigned_module.tsx`
  - Fetches assigned modules from `/my-modules`.
  - Displays training module cards with title, industry, SOP steps, and media.

- `src/app/(worker)/sos_alerts.tsx`
  - Worker SOS screen with alerts and location capture.
  - Sends emergency POST to `/sos` (backend endpoint currently missing).

- `src/app/(worker)/simulations.tsx`
  - Worker simulation screen.

- `src/app/(worker)/risk_zone.tsx`
  - Displays risk zone data for worker safety.

---

## Backend Architecture

### `backend/main.py`

- Creates FastAPI app and enables permissive CORS.
- Uses SQLAlchemy models to create DB tables at startup.
- Provides authentication and protected endpoints.

### `backend/database.py`

- Loads `DATABASE_URL` from environment.
- Creates SQLAlchemy engine, sessionmaker, and `Base`.
- Provides `get_db()` for request-scoped DB sessions.

### `backend/models.py`

- `User` model with fields:
  - `user_id`, `name`, `email`, `password`, `role`, `created_at`
- `Incident` model with fields for description, severity, location, media, status, reviewed_by, timestamp
- `TrainingModule` model for title, industry, description, SOP steps, media URL, creator
- `ModuleAssignment` linking modules to workers
- Simulation models for admin simulation creation

### `backend/schemas.py`

- User request/response schemas:
  - `UserCreate`, `UserLogin`, `UserResponse`
- Incident schemas:
  - `IncidentCreate`, `IncidentOut`
- Training module schemas:
  - `TrainingModuleCreate`, `TrainingModuleOut`, `AssignModule`, `ModuleAssignmentOut`
- Simulation schemas

### `backend/auth.py`

- Password hashing with bcrypt.
- Password verification.
- JWT creation with HS256 and expiry.

### `backend/dependencies.py`

- `get_current_user` decodes bearer token and returns payload.
- `require_role(role)` secures endpoints by role.

---

## API Endpoints

### Public / Auth

- `POST /register`
  - Register a new user.
  - Request model includes `name`, `email`, `password`, and `role`.

- `POST /login`
  - Login returns JWT access token.

### Incident Management

- `POST /incidents/`
  - Create an incident report.
  - Requires authentication.

- `GET /incidents/`
  - Get all incidents for authenticated users.

- `PUT /incidents/{incident_id}`
  - Update incident status.
  - Requires authentication.

### Training Modules

- `POST /modules`
  - Create a training module.
  - Requires `admin` role.

- `GET /modules`
  - List all training modules.
  - Requires `admin` role.

- `POST /assign-module`
  - Assign a module to a worker.
  - Requires `admin` role.

- `GET /my-modules`
  - List modules assigned to the logged-in worker.
  - Requires `worker` role.

- `POST /admin/assign-module/{module_id}/{user_id}`
  - Assign module to specific worker.
  - Requires `admin` role.

### Admin / User Management

- `GET /admin/users`
  - Returns worker users.
  - Requires `admin` role.

- `POST /simulations`
  - Create a simulation.
  - Requires `admin` role.

- `POST /simulation-step`
  - Add a simulation step.
  - Requires `admin` role.

- `GET /simulations`
  - List simulations.

- `GET /simulation/{simulation_id}`
  - Get steps for a simulation.

### Health and Profile

- `GET /profile`
  - Returns decoded token payload.

- `GET /officer/dashboard`
  - Officer-only health endpoint.

- `GET /admin/dashboard`
  - Admin-only health endpoint.

### PPE Detection

- `POST /detect-ppe`
  - Accepts `UploadFile` named `file`.
  - Runs YOLO detection and returns detected labels and confidence.

---

## Known Issues and Notes

- `src/app/(worker)/sos_alerts.tsx` sends `POST /sos`, but backend does not implement a `/sos` endpoint.
- Officer UI expects an incident `title`, but backend incident model does not define `title`.
- `backend/main.py` defines two `@app.get("/admin/users")` routes; the second definition overrides the first.
- The admin route `camera` is available in `src/app/(admin)/_layout.tsx` and uses `camera.tsx` for live PPE scan.
- Frontend uses `role` from decoded JWT to route users after login.
- `register.tsx` hardcodes every new user to the `worker` role.

---

## Running the Project

### Frontend

1. Install dependencies:
   ```bash
   cd my-app
   npm install
   ```
2. Start Expo:
   ```bash
   npx expo start
   ```
3. Use Expo Go, Android emulator, or iOS simulator.

### Backend

1. Create and activate a Python environment.
2. Install dependencies:
   ```bash
   cd my-app/backend
   pip install -r requirements.txt
   ```
3. Start the API server:
   ```bash
   uvicorn main:app --reload
   ```
4. Set `EXPO_PUBLIC_API_URL` in the app environment if using a different backend host.

### Environment Variables

- Frontend:
  - `EXPO_PUBLIC_API_URL` - backend base URL.
  - `EXPO_PUBLIC_AI_CHAT_URL` - external AI assistant service.
- Backend:
  - `DATABASE_URL` - SQLAlchemy database connection string.

---

## Important Files to Reference

- `src/app/login.tsx`
- `src/app/register.tsx`
- `src/app/(admin)/admin_dashboard.tsx`
- `src/app/(admin)/camera.tsx`
- `src/app/(admin)/_layout.tsx`
- `src/app/(worker)/_layout.tsx`
- `src/app/(worker)/report_incident.tsx`
- `src/app/(worker)/get_assigned_module.tsx`
- `src/app/(worker)/sos_alerts.tsx`
- `backend/main.py`
- `backend/models.py`
- `backend/schemas.py`
- `backend/auth.py`
- `backend/dependencies.py`
- `backend/database.py`
- `backend/requirements.txt`

---

## Summary

This documentation captures the full project as implemented in the current workspace. It is suitable for project documentation and handoff, with frontend routes, backend APIs, authentication flow, and known current gaps.
