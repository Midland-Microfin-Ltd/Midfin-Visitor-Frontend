# Codebase Index — Visitor Management Frontend

> **Stack:** React 19 · Vite · MUI v7 · React Router v7 · Axios  
> **Build:** `npm run dev` (dev) · `npm run build` (production)

---

## Project Structure

```
visitor_frontend/
├── index.html                  # HTML entry point
├── vite.config.js              # Vite configuration
├── eslint.config.js            # ESLint configuration
├── Dockerfile                  # Container definition
├── package.json
└── src/
    ├── main.jsx                # React DOM root mount
    ├── App.jsx                 # Router, route definitions, theme init
    ├── index.css               # Global styles
    ├── assets/
    │   └── form registration.json   # Lottie animation asset
    ├── context/
    │   └── ThemeContext.jsx    # MUI dark/light theme context
    ├── components/
    │   ├── Layout.jsx          # App shell / authenticated layout wrapper
    │   ├── MiniDrawer.jsx      # Collapsible sidebar navigation
    │   └── ThemeToggle.jsx     # Light/dark mode toggle button
    ├── pages/
    │   ├── Login.jsx           # Login + QR code generation page
    │   ├── Dashboard.jsx       # Main dashboard (protected)
    │   ├── NotFound.jsx        # 404 catch-all page
    │   ├── statuspass.jsx      # Visitor pass status viewer (public)
    │   ├── Visitor/
    │   │   ├── VisitorForm.jsx # Multi-step self-registration form (public)
    │   │   └── Visitors.jsx    # Visitor list / management table (protected)
    │   ├── Manage/
    │   │   └── Management.jsx  # Admin management panel (protected)
    │   └── Passess/
    │       ├── GeneratePass.jsx    # Pass generation UI (protected)
    │       └── VisitorPassmaker.jsx # Pass card renderer / PDF export
    └── utilities/
        ├── axiosConfig.jsx         # Axios instance, interceptors, auth header
        ├── commonutilities.jsx     # Host resolution, token expiry redirect
        ├── localStorageUtils.jsx   # localStorage CRUD helpers
        ├── sessionStorageUtils.jsx # sessionStorage CRUD helpers
        ├── PassDownloadUtils.js    # jsPDF / html2canvas pass download logic
        └── apiUtils/
            └── apiHelper.jsx       # All API calls (auth, visitor, passes)
```

---

## Routes (`src/App.jsx`)

| Path | Component | Auth Required |
|---|---|---|
| `/` | `Login` | No |
| `/dashboard` | `Dashboard` | Yes |
| `/visitors` | `Visitors` | Yes |
| `/management` | `Management` | Yes |
| `/passes` | `GeneratePass` | Yes |
| `/register/:qrCode` | `VisitorForm` | No |
| `/statuspass` | `StatusPass` | No |
| `/statuspass/:passId` | `StatusPass` | No |
| `*` | `NotFound` | — |

> Auth guard: `ProtectedRoute` checks `localStorage.isAuthenticated === "true"`.

---

## Pages

### `Login.jsx`
- Tabs: **Visitor QR** (default) | **Admin Login**
- Generates time-stamped QR codes (`VISITOR-<base36>-<random>`)
- Produces shareable registration link: `{origin}/#/register/{qrCode}`
- On successful login stores `token`, `isAuthenticated`, `userData` to localStorage and navigates to `/dashboard`

### `VisitorForm.jsx` *(public, 6-step stepper)*
| Step | Label | Key Logic |
|---|---|---|
| 0 | Verify | Phone input → OTP send/verify via `sendOtp` / `verifyOtp` |
| 1 | Photo | Webcam capture or file upload; uploads via `submitVisitorSelfie` |
| 2 | Purpose | Card picker: **Interview · Meeting · Company Visit · Other** |
| 3 | Details | Full name (required), Company (optional), Government ID (required) |
| 4 | Meeting | Person to meet, Department, Visit duration |
| 5 | Review | Summary + submit via `submitVisitorRequest`; shows QR code on success |

### `statuspass.jsx` *(public)*
- Reads `?id=` query param or `:passId` route param
- Calls `getVisitorStatus` and renders one of: **Pending · Approved · Rejected · Expired · Not Found**
- "Return to Home" → redirects to `/register/self`

### `Dashboard.jsx`
- Protected overview page for admin users

### `Visitors.jsx`
- Paginated visitor request table
- Calls `getVisitorRequests`, `approveVisitorRequest`, `rejectVisitorRequest`

### `Management.jsx`
- Admin management panel (users / settings)

### `GeneratePass.jsx` / `VisitorPassmaker.jsx`
- Pass list view with PDF/image export via `PassDownloadUtils.js`

---

## Context

### `ThemeContext.jsx`
```
ThemeContextProvider  →  wraps entire app
useThemeContext()      →  { mode, toggleTheme }
```
- Persists mode to `localStorage.themeMode` and `localStorage.theme`
- MUI palette: dark bg `#2A303D`, light bg `#CFD4DE`

---

## Utilities

### `axiosConfig.jsx`
- Base URL resolved by `determineHost()` (localhost dev / production domain)
- **Request interceptor:** attaches `Authorization: Bearer <token>`
- **Response interceptor:** unwraps `response.data`; on 401 calls `redirectOnTokenExpiry()`; on network failure returns `{ errorCode: "networkError" }`

### `commonutilities.jsx`
| Export | Purpose |
|---|---|
| `determineHost()` | Returns API base URL based on `VITE_ENVIRONMENT` |
| `networkError` | Standard network error object |
| `redirectOnTokenExpiry()` | Clears auth storage, redirects to `/login` |

### `localStorageUtils.jsx`
| Export | Purpose |
|---|---|
| `storeInLocalStorage(key, val)` | `localStorage.setItem` |
| `retrieveFromLocalStorage(key)` | `localStorage.getItem` |
| `removeFromLocalStorage(key)` | `localStorage.removeItem` |
| `storeObjectInLocalStorage(key, obj)` | JSON-stringified set |
| `retrieveObjectFromLocalStorage(key)` | JSON-parsed get |

### `apiHelper.jsx` — API Endpoints

| Function | Method | Endpoint |
|---|---|---|
| `loginUser(credentials)` | POST | `/api/v1/auth/login` |
| `sendOtp({ phoneNo })` | POST | `/api/v1/auth/sendOtp` |
| `verifyOtp({ txnId, otp })` | GET | `/api/v1/auth/verifyOtp?txnId=&otp=` |
| `submitVisitorSelfie(visitorId, file)` | POST | `/api/v1/visitor/selfie/{visitorId}` |
| `submitVisitorRequest(visitorId, data)` | POST | `/api/v1/visitor/visitor-request/{visitorId}` |
| `getVisitorRequests({ page, pageSize })` | GET | `/api/v1/visitor/visitor-requests/{page}/{pageSize}` |
| `getVisitorStatus(visitorId)` | GET | `/api/v1/visitor/status/{visitorId}` |
| `approveVisitorRequest(id)` | POST/PUT | approve endpoint |
| `rejectVisitorRequest(id)` | POST/PUT | reject endpoint |

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_ENVIRONMENT` | `"development"` enables localhost API |
| `VITE_HOST_DOMAIN` | Production API domain (e.g. `api.example.com`) |
| `VITE_API_TIMEOUT` | Axios timeout in ms (default `30000`) |

---

## Key Dependencies

| Package | Use |
|---|---|
| `@mui/material` v7 | UI components + theming |
| `@mui/icons-material` v7 | Icons throughout the app |
| `react-router-dom` v7 | Client-side routing (HashRouter) |
| `axios` | HTTP client |
| `qrcode.react` | QR code generation (SVG + Canvas) |
| `lottie-react` | JSON animation playback |
| `jspdf` + `html2canvas` | Visitor pass PDF export |
| `lucide-react` | Additional icon set |
