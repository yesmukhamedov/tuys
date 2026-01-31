# Rumor Graph Frontend

A standalone Next.js (App Router) + TypeScript frontend for exploring and submitting data to the PublicController API.

## Prerequisites
- Node.js 20+
- npm

## Running locally
```bash
npm install
npm run dev
```

## Environment variables
| Variable | Description | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for the backend PublicController | `http://localhost:8080` |

## Backend endpoints expected
The frontend expects these backend endpoints (same host or configured via `NEXT_PUBLIC_API_BASE_URL`):
- `GET /public/graph` (returns `application/ld+json`)
- `POST /public/graph` (accepts JSON `PublicGraphPostRequest`)
- `PATCH /public/values` (accepts JSON `PublicValuesPatchRequest`)

## Running with Docker Compose
```bash
docker compose up --build
```

The frontend will be available at `http://localhost:3000`. Ensure the backend is reachable from the container at the configured base URL.
