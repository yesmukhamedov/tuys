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

## Frontend ↔ UnifiedAuth ↔ Rumor interaction
This frontend is a pure SPA that delegates authentication to the UnifiedAuthenticationService (auth-server) and then uses the resulting access token to call Rumor as a resource server. Rumor must **not** implement login or OTP flows.

### 1) UnifiedAuth OTP flow (frontend ↔ UnifiedAuth)
**A) Start OTP challenge**
```http
POST {AUTH_BASE_URL}/api/v1/auth/start
Content-Type: application/json

{
  "identifier": "+15551234567",
  "type": "PHONE"
}
```
Response: `OtpChallengeResponse` containing `challengeId`, `expiresAt`, `destination`, `type`.

**B) Verify OTP**
```http
POST {AUTH_BASE_URL}/api/v1/auth/verify
Content-Type: application/json

{
  "challengeId": "<challenge-id>",
  "code": "123456"
}
```
Response: `AuthVerifyResponse` containing `userId`, `accessToken`, `refreshToken`, `tokenType`, `expiresInSeconds`.

Frontend responsibilities:
- Store `accessToken` in memory (preferred) or `sessionStorage` (acceptable).
- Store `refreshToken` securely:
  - If you have a BFF, store the refresh token in an HttpOnly cookie on that BFF.
  - If you are a pure SPA, store the refresh token in `localStorage` with risk acknowledged.
- Schedule refresh slightly before expiry (e.g., at 0.8 * `expiresInSeconds`).

**C) Refresh**
```http
POST {AUTH_BASE_URL}/api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh-token>"
}
```
Response: `TokenResponse` with `accessToken`, `refreshToken`, `tokenType`, `expiresInSeconds`.

**D) Logout**
```http
POST {AUTH_BASE_URL}/api/v1/auth/logout
Content-Type: application/json

{
  "refreshToken": "<refresh-token>"
}
```
Frontend clears stored tokens.

### 2) Rumor API calls (frontend ↔ rumor)
Rumor expects a Bearer access token on every protected endpoint:

```
Authorization: Bearer <accessToken>
```

Example fetch helper (for documentation only; keep in frontend code where appropriate):
```ts
async function apiFetch(path: string, options: RequestInit = {}) {
  const token = authState.accessToken;
  const res = await fetch(`${RUMOR_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    await refreshToken();
    return apiFetch(path, options);
  }

  return res;
}
```

### 3) Rumor endpoints contract
**Public graph read**
- `GET /public/graph`
  - If `auth.permit-public=true`: no token required.
  - Else: token required.
  - Response: JSON-LD graph.

**Public graph write (token required)**
- `POST /public/graph`
  - Requires Bearer token.
  - Body: `PublicGraphPostRequest`.
  - Response: updated JSON-LD.
- `PATCH /public/values`
  - Requires Bearer token.
  - Body: `PublicValuesPatchRequest`.
  - Response: updated JSON-LD.

**Debug endpoint for frontend integration (token required)**
- `GET /api/me`
  - Requires Bearer token.
  - Response:
    ```json
    {
      "sub": "...",
      "userId": "...",
      "issuer": "...",
      "audience": ["rumor"],
      "roles": ["USER"],
      "scopes": ["profile", "orders:read"]
    }
    ```

### 4) Authorization policy (rumor)
- `/api/**` -> authenticated
- `/public/**`:
  - `GET /public/graph` -> configurable public (`auth.permit-public=true`)
  - `POST /public/graph`, `PATCH /public/values` -> authenticated
- `/admin/**` -> permitAll (temporary; ignore for frontend)

### 5) Token claims expected by rumor
Rumor validates JWTs locally and expects:
- `iss` matches the configured issuer.
- `aud` contains `rumor` (or configured audience).
- `exp` is valid.
- `roles` (optional) maps to authorities `ROLE_USER`, `ROLE_ADMIN`.
- `scope` (optional) maps to authorities like `SCOPE_profile`, `SCOPE_orders:read`.

If UnifiedAuth uses different claim names (e.g., `realm_access.roles`), configure the JWT authority mapping accordingly in rumor.

### 6) CORS configuration (rumor)
CORS is required for browser-based SPA calls and is **not** authorization. Rumor should:
- Allow origins from configuration (`app.cors.allowed-origins`), e.g.:
  - `http://localhost:5173`
  - `http://localhost:3000`
- Allow methods: `GET,POST,PATCH,DELETE,OPTIONS`
- Allow headers: `Authorization, Content-Type`
- Allow credentials: `false` (recommended for Bearer auth)

### 7) Error handling contract
- **401 Unauthorized**: token missing/expired/invalid -> frontend triggers refresh; if refresh fails, force re-login (OTP).
- **403 Forbidden**: token valid but missing role/scope -> show “no permission”.
- **400 Validation errors**: display server message.

Backend errors should be JSON (not HTML), e.g.:
```json
{
  "error": "...",
  "details": ["..."]
}
```

## Backend endpoints expected
The frontend expects these backend endpoints (same host or configured via `NEXT_PUBLIC_API_BASE_URL`):
- `GET /public/graph` (returns `application/ld+json`)
- `POST /public/graph` (accepts JSON `PublicGraphPostRequest`)
- `PATCH /public/values` (accepts JSON `PublicValuesPatchRequest`)
- `GET /api/me` (returns token-derived identity payload)

## Running with Docker Compose
```bash
docker compose up --build
```

The frontend will be available at `http://localhost:3000`. Ensure the backend is reachable from the container at the configured base URL.
