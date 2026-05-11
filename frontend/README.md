# Our Door Frontend

React + Vite frontend for **Our Door**, a Socratic learning chatbot for coding cohort students.

The frontend supports two MVP roles:

- **Student:** asks curriculum questions and receives guided, Socratic responses.
- **Admin / Instructor:** reviews logged questions and stuck points.

## Frontend MVP Status

Current focus:
- Connect `StudentChat.jsx` to `POST /chat`
- Pass the JWT from login into the student chat flow
- Display the student question and Socratic response

Later:
- Build out admin log display with `GET /logs`
- Revisit visual design after the core flow works

## Tech Stack

- React
- Vite
- Axios
- ESLint

## Setup

From the `frontend` directory:

```bash
npm install
npm run dev
```

The app runs at:

```txt
http://localhost:5173
```

If that port is already in use, Vite may choose the next available port.

## Backend Connection

API requests are configured in:

```txt
src/api.js
```

By default, the frontend talks to:

```txt
http://localhost:8000
```

You can override this with:

```txt
VITE_API_URL=http://your-api-url
```

## Available API Helpers

`src/api.js` currently exports:

- `login(password, role)` -> `POST /auth/token`
- `sendMessage(message, token)` -> `POST /chat`
- `getLogs(token)` -> `GET /logs`

Authenticated requests send the JWT as a bearer token:

```txt
Authorization: Bearer <token>
```

## Dev Credentials

These are for local MVP development only:

```txt
Student password: learn2024
Admin password: teach2024
```

## Current Frontend Structure

```txt
src/
  App.jsx
  App.css
  api.js
  main.jsx
  index.css
  pages/
    Login.jsx
    StudentChat.jsx
    AdminDashboard.jsx
```

## Page Responsibilities

`Login.jsx`
- Handles role-based login.
- Calls `login()` from `api.js`.
- Receives a JWT from the backend.

`StudentChat.jsx`
- Student-facing chat page.
- Should call `sendMessage(message, token)` to reach `POST /chat`.
- MVP goal: input, submit button, message history, loading state, and error state.

`AdminDashboard.jsx`
- Admin-facing page.
- Should call `getLogs(token)` to display conversation logs.

`App.jsx`
- App entry point for deciding which page to render.
- May need to hold session state so the JWT can be passed to student/admin pages.

## Useful Commands

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## MVP Scope Notes

Keep the frontend simple and focused:

- No individual user accounts.
- No registration flow.
- No advanced analytics.
- No curriculum upload UI.
- No large redesigns unless they are part of a dedicated design branch.

The main goal is an end-to-end student flow:

```txt
login -> ask question -> receive Socratic response
```
