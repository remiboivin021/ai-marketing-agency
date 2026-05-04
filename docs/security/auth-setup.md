# Auth Setup - Basic Authentication

## Overview

The AI Marketing Agency dashboard uses **Basic Authentication** (P0) to protect all API endpoints under `/api/*`. This is a simple username/password authentication suitable for internal use or small teams.

> **Note:** Basic Auth is planned for upgrade to JWT in a future release (see ADR-003).

---

## Configuration

### 1. Environment Variables

Add these variables to your `.env` file (copy from `.env.example`):

```bash
# Basic Auth credentials for dashboard access
ADMIN_USER=admin
ADMIN_PASSWORD=changeme
```

> **⚠️ Security Warning:** Change the default credentials immediately in production!

### 2. Credential Rules

- `ADMIN_USER`: Username for Basic Auth (default: `admin`)
- `ADMIN_PASSWORD`: Password for Basic Auth (default: `changeme`)
- Both must be set to enable authentication
- If either is empty/missing, auth is **disabled** (development mode)

---

## How It Works

### Backend (server/middleware/auth.js)

- All routes under `/api/*` are protected by the `basicAuth` middleware
- Credentials are read from environment variables at runtime
- On auth failure → returns `401 Unauthorized` with `WWW-Authenticate: Basic` header
- On success → request proceeds to the API endpoint

### Frontend (src/components/Login.jsx)

- Login form prompts for username/password
- Credentials are base64-encoded and stored in `sessionStorage`
- Stored as: `Basic <base64(username:password)>`
- Cleared when the browser tab is closed (session-only)
- All subsequent API calls include the `Authorization` header

---

## Usage

### Accessing the Dashboard

1. Open the dashboard in your browser (e.g., `http://localhost:3001` or via nginx)
2. You will see the Login form
3. Enter your credentials (default: `admin` / `changeme`)
4. On success, you are redirected to the dashboard
5. If credentials are wrong → error message displayed

### API Calls with Auth

When making API calls (Postman, curl, etc.):

```bash
# Example: Get gateway signals
curl -u admin:changeme http://localhost:3001/api/gateway

# Or manually with header:
curl -H "Authorization: Basic $(echo -n 'admin:changeme' | base64)" \
  http://localhost:3001/api/gateway
```

---

## Security Considerations

### P0 (Current)

- ✅ Basic Auth protects all `/api/*` endpoints
- ✅ Credentials stored only in sessionStorage (cleared on tab close)
- ⚠️ Credentials sent base64-encoded (NOT encrypted) unless HTTPS is used
- ✅ HTTPS enforced via nginx reverse proxy (self-signed cert for P0)

### Production Hardening (Future)

- Upgrade to JWT authentication (ADR-003)
- Use Let's Encrypt for valid SSL certificates (replace self-signed)
- Store credentials in a secure vault or hashed in database
- Add rate-limiting on auth failures (currently handled by existing rate limiter)
- Consider IP whitelisting for admin endpoints

---

## Troubleshooting

### 401 Unauthorized

- Check `.env` file has `ADMIN_USER` and `ADMIN_PASSWORD` set
- Verify credentials in Login form are correct
- Check server logs for: `[auth] Failed login attempt for user: <username>`

### Auth Disabled (No Prompt)

- Server logs will show: `[auth] ADMIN_USER or ADMIN_PASSWORD not set - auth disabled`
- Set both environment variables and restart the server

### sessionStorage Cleared

- Credentials are stored in sessionStorage (not localStorage)
- Closing the tab clears the auth session
- User must log in again on next visit

---

## Files Modified/Created

| File | Purpose |
|------|---------|
| `server/middleware/auth.js` | Basic Auth middleware |
| `server/index.js` | Applied auth to `/api/*` + trust proxy |
| `src/components/Login.jsx` | Frontend login form |
| `.env.example` | Documents `ADMIN_USER`, `ADMIN_PASSWORD` |

---

## Related ADR

- [ADR-003: Authentication System](../../governance/adr/26-05-04_auth-system.md)
