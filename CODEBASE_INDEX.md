# Codebase Index — Visitor Management Frontend

> **Project:** Visitor Management System Frontend  
> **Stack:** React 19 · Vite 7 · MUI v7 · React Router v7 · Axios  
> **Build:** `npm run dev` (dev) · `npm run build` (production)  
> **Containerized:** Multi-stage Docker build with Node 20 Alpine

---

## 📋 Project Overview

### Purpose
A comprehensive visitor management web application designed to streamline visitor registration, approval workflows, and pass generation for organizations. The system provides:

- **Public-facing visitor self-registration** with QR code entry points
- **OTP-based phone verification** for security
- **Multi-step guided forms** for visitor information collection
- **Admin dashboard** for approval/rejection workflows
- **Digital visitor passes** with QR codes and photo identification
- **Real-time status checking** for visitors

### Key Features

#### For Visitors (Public Access)
✅ **QR Code Registration:** Scan QR code to access registration form  
✅ **Phone Verification:** OTP-based authentication via SMS  
✅ **Photo Capture:** Webcam or file upload for visitor selfie  
✅ **Purpose Selection:** Interview, Meeting, Company Visit, Other  
✅ **Meeting Details:** Person to meet, department, visit duration  
✅ **Status Tracking:** Check pass status (Pending/Approved/Rejected/Expired)

#### For Administrators (Protected Access)
✅ **Dashboard:** Visitor statistics with period filters and charts  
✅ **Visitor Management:** Review, approve, or reject visitor requests  
✅ **Pass Generation:** Create digital passes with QR codes  
✅ **Pass Export:** Download as PNG or print visitor passes  
✅ **Department/Building Management:** Configure organizational data  
✅ **Dark/Light Theme:** User preference with persistence

### Technology Highlights
- **Modern React:** Hooks-based components with React 19
- **Fast Development:** Vite for instant HMR and optimized builds
- **Material Design:** MUI v7 with custom theming
- **Client-Side Routing:** React Router v7 with lazy loading
- **Type-Safe API Layer:** Centralized Axios configuration with interceptors
- **Responsive Design:** Mobile-friendly UI with MUI breakpoints
- **Production-Ready:** Docker containerization with multi-stage builds

---

## 📁 Project Structure

```
visitor_frontend/
├── index.html                  # HTML entry point
├── vite.config.js              # Vite configuration (minimal setup)
├── eslint.config.js            # ESLint configuration
├── Dockerfile                  # Multi-stage Docker build (builder + serve)
├── package.json                # Dependencies & scripts
├── README.md                   # Vite + React template info
└── src/
    ├── main.jsx                # React DOM root mount point
    ├── App.jsx                 # Router config, routes, theme initialization
    ├── index.css               # Global styles
    ├── assets/
    │   └── form registration.json   # Lottie animation asset
    ├── context/
    │   └── ThemeContext.jsx    # MUI dark/light theme context provider
    ├── components/
    │   ├── Layout.jsx          # Simple layout with AppBar and ThemeToggle
    │   ├── MiniDrawer.jsx      # Collapsible sidebar navigation (240px ↔ 73px)
    │   └── ThemeToggle.jsx     # Light/dark mode toggle button
    ├── pages/
    │   ├── Login.jsx           # Login + QR code generation page
    │   ├── Dashboard.jsx       # Main dashboard with stats (protected)
    │   ├── NotFound.jsx        # 404 catch-all page
    │   ├── statuspass.jsx      # Visitor pass status viewer (public)
    │   ├── Visitor/
    │   │   ├── VisitorForm.jsx # Multi-step self-registration form (6 steps)
    │   │   └── Visitors.jsx    # Visitor list / management table (protected)
    │   ├── Manage/
    │   │   └── Management.jsx  # Admin management panel (protected)
    │   └── Passess/
    │       ├── GeneratePass.jsx    # Pass generation & listing UI (protected)
    │       └── VisitorPassmaker.jsx # Pass card renderer / PDF export
    └── utilities/
        ├── axiosConfig.jsx         # Axios instance, interceptors, auth header
        ├── commonutilities.jsx     # Host resolution, network errors, redirects
        ├── localStorageUtils.jsx   # localStorage CRUD helpers
        ├── sessionStorageUtils.jsx # sessionStorage CRUD helpers
        ├── PassDownloadUtils.js    # Pass download (PNG) and print utilities
        └── apiUtils/
            └── apiHelper.jsx       # All API endpoint functions
```

---

## 🛤️ Routes (`src/App.jsx`)

| Path | Component | Auth Required | Description |
|---|---|---|---|
| `/` | `Login` | No | Login page with QR code generation |
| `/dashboard` | `Dashboard` | Yes | Admin dashboard with statistics |
| `/visitors` | `Visitors` | Yes | Visitor requests management table |
| `/management` | `Management` | Yes | Admin panel (users/settings) |
| `/passes` | `GeneratePass` | Yes | Pass generation and listing |
| `/register/:qrCode` | `VisitorForm` | No | Public visitor self-registration (6 steps) |
| `/statuspass` | `StatusPass` | No | Check visitor pass status |
| `/statuspass/:passId` | `StatusPass` | No | Check specific pass by ID |
| `*` | `NotFound` | — | 404 error page |

**Router Config:**
- Uses `HashRouter` for client-side routing
- All routes wrapped in `<Suspense>` with `CircularProgress` loader
- Lazy loading for all page components via `React.lazy()`

**Authentication Guard:**
- `ProtectedRoute` component checks `localStorage.isAuthenticated === "true"`
- Redirects to `/` if not authenticated
- Token attached to requests via Axios interceptor

---

## 📄 Pages

### `Login.jsx`
**Purpose:** Dual-mode login page with visitor QR generation and admin authentication

**Features:**
- **Two Tabs:**
  - **Visitor QR:** Generates time-stamped QR codes for visitor registration
    - Format: `VISITOR-<base36-timestamp>-<random-string>`
    - Creates shareable link: `{origin}/#/register/{qrCode}`
    - QR code rendered using `qrcode.react`
  - **Admin Login:** Form-based authentication for staff
    - Calls `loginUser(credentials)`
    - Stores `token`, `isAuthenticated`, `userData` in localStorage
    - Navigates to `/dashboard` on success

### `VisitorForm.jsx` *(Public — 6-Step Multi-Step Form)*
**Purpose:** Self-service visitor registration with OTP verification

| Step | Label | Fields | API Calls | Key Logic |
|---|---|---|---|---|
| **0** | Verify | Phone number input | `sendOtp({ phoneNo })` → `verifyOtp({ txnId, otp })` | OTP-based phone verification |
| **1** | Photo | Webcam or file upload | `submitVisitorSelfie(file)` | Selfie capture & upload |
| **2** | Purpose | Purpose selection cards | — | Interview · Meeting · Company Visit · Other |
| **3** | Details | Full name, Company, Gov ID | — | Visitor personal information |
| **4** | Meeting | Person to meet, Dept, Duration | — | Meeting details & visit duration |
| **5** | Review | Summary + Submit button | `submitVisitorRequest(visitorId, data)` | Final submission & QR code display |

**Post-Submission:** Displays success message with visitor QR code

### `statuspass.jsx` *(Public)*
**Purpose:** Check visitor pass status using pass ID

**Features:**
- Reads `?id=` query param or `:passId` route param
- Calls `getVisitorStatus(visitorId)` 
- Displays status badge: **Pending · Approved · Rejected · Expired · Not Found**
- Shows visitor details and pass information if approved
- "Return to Home" button → redirects to `/register/self`

### `Dashboard.jsx` *(Protected)*
**Purpose:** Admin overview with visitor statistics and charts

**Features:**
- Period filter: Today, Yesterday, Last 7 Days, Last 30 Days, This Month, Last Month, This Year
- Calls `getDashboardData(period)`
- Displays visitor metrics, approval rates, and trends
- Charts rendered using `recharts` library

### `Visitors.jsx` *(Protected)*
**Purpose:** Visitor request management with approval/rejection actions

**Features:**
- Paginated table of visitor requests
- Calls `getVisitorRequests({ page, pageSize })`
- Action buttons per row:
  - **Approve:** `takeVisitorAction({ visitorId, status: 'approved', ... })`
  - **Reject:** `takeVisitorAction({ visitorId, status: 'rejected', ... })`
- Filters and search functionality
- Real-time status updates

### `Management.jsx` *(Protected)*
**Purpose:** Admin panel for system configuration

**Features:**
- Department management: `getDepartments()`
- Building management: `getBuildings()`, `updateBuilding(buildingData)`
- User management (admin users)
- System settings configuration

### `GeneratePass.jsx` *(Protected)*
**Purpose:** Generate and manage visitor passes

**Features:**
- List of approved visitors eligible for pass generation
- Calls `generateVisitorPass({ visitorId })`
- Pass preview and download options
- Integrates with `VisitorPassmaker` component

### `VisitorPassmaker.jsx` *(Protected)*
**Purpose:** Render visitor pass cards for download/print

**Features:**
- Pass card design with QR code, photo, and visitor details
- Export options via `PassDownloadUtils.js`:
  - Download as PNG image
  - Print pass
- Pass includes: Pass number, visitor name, photo, validity dates, QR code

---

## 🧩 Components

### `Layout.jsx`
**Purpose:** Simple layout wrapper with app bar and theme toggle

**Structure:**
- `<CssBaseline>` for MUI baseline styles
- `<AppBar>` with site title and `<ThemeToggle>`
- `<Container maxWidth="lg">` for children content
- Used for public pages (non-authenticated views)

### `MiniDrawer.jsx`
**Purpose:** Collapsible sidebar navigation for authenticated users

**Features:**
- **Drawer States:**
  - Expanded: `240px` width
  - Collapsed: `73px` width (mini mode)
  - Smooth transition animation (0.3s ease)
- **Navigation Items:**
  - Dashboard → `/dashboard`
  - Visitors → `/visitors`
  - Management → `/management`
  - Passes → `/passes`
- **Header Section:**
  - User avatar with initials
  - Username display (when expanded)
- **Footer Actions:**
  - Theme toggle (light/dark mode)
  - Logout button
- **Responsive:**
  - Desktop: Permanent drawer
  - Mobile: Temporary drawer (swipeable)
- **Active Route Highlighting:** Visual indicator for current page
- **Theme-Aware Styling:**
  - Dark mode: `#2A303D` background
  - Light mode: `#CFD4DE` background

### `ThemeToggle.jsx`
**Purpose:** Toggle button for switching between light and dark modes

**Features:**
- Icon switches between `Brightness7` (light) and `Brightness4` (dark)
- Calls `toggleTheme()` from `ThemeContext`
- Persists preference to localStorage

---

## 🎨 Context

### `ThemeContext.jsx`
**Provider:** `ThemeContextProvider` — wraps entire app in `App.jsx`  
**Hook:** `useThemeContext()` → `{ mode, toggleTheme }`

**Features:**
- **State Management:** `mode` state: `"light"` | `"dark"`
- **Persistence:** 
  - Saves to `localStorage.themeMode` and `localStorage.theme`
  - Initializes from localStorage on mount
- **MUI Theme Configuration:**
  - Dark mode palette:
    - Background: `#2A303D`
    - Paper: `#353C4A`
  - Light mode palette:
    - Background: `#CFD4DE`
    - Paper: `#FFFFFF`
- **Theme Cleanup:** 
  - Removes inconsistent keys on initialization
  - Validates theme values
- **Global Provider:** All components have access via `useThemeContext()`

---

## 🔧 Utilities

### `axiosConfig.jsx`
**Purpose:** Centralized Axios HTTP client with authentication and error handling

**Configuration:**
- **Base URL:** Determined by `determineHost()` from `commonutilities.jsx`
- **Timeout:** `VITE_API_TIMEOUT` (default: 30000ms)
- **Headers:** `Content-Type: application/json`

**Request Interceptor:**
- Automatically attaches `Authorization: Bearer <token>` header
- Retrieves token from `localStorage.token`

**Response Interceptor:**
- **Success:** Unwraps `response.data` automatically
- **401 Unauthorized:** Calls `redirectOnTokenExpiry()` to logout
- **Network Error:** Returns `{ errorCode: "networkError", errorDescription: "..." }`
- **Other Errors:** Returns `error.response.data`

**Export:** `apiClient` instance used by all API functions

---

### `commonutilities.jsx`
**Purpose:** Shared utility functions for host resolution and error handling

| Export | Type | Purpose |
|---|---|---|
| `determineHost()` | Function | Returns API base URL based on environment |
| `networkError` | Object | Standard network error object |
| `redirectOnTokenExpiry()` | Function | Clears auth data and redirects to login |

**`determineHost()` Logic:**
```javascript
if (VITE_ENVIRONMENT === "development" && hostname === "localhost")
  → "http://localhost:5678"
else
  → "https://{VITE_HOST_DOMAIN}"
```

**`redirectOnTokenExpiry()` Actions:**
1. Removes `token`, `isAuthenticated`, `userData` from localStorage
2. Redirects to `{origin}/login`

---

### `localStorageUtils.jsx`
**Purpose:** Type-safe localStorage wrapper functions

| Function | Parameters | Returns | Purpose |
|---|---|---|---|
| `storeInLocalStorage(key, val)` | `key: string, val: any` | `void` | Sets item in localStorage |
| `retrieveFromLocalStorage(key)` | `key: string` | `string \| null` | Gets item from localStorage |
| `removeFromLocalStorage(key)` | `key: string` | `void` | Removes item from localStorage |
| `storeObjectInLocalStorage(key, obj)` | `key: string, obj: object` | `void` | JSON.stringify + store |
| `retrieveObjectFromLocalStorage(key)` | `key: string` | `object \| null` | Retrieve + JSON.parse |

---

### `sessionStorageUtils.jsx`
**Purpose:** Type-safe sessionStorage wrapper functions (same API as localStorageUtils)

| Function | Purpose |
|---|---|
| `storeInSessionStorage(key, val)` | Sets item in sessionStorage |
| `retrieveFromSessionStorage(key)` | Gets item from sessionStorage |
| `removeFromSessionStorage(key)` | Removes item from sessionStorage |
| `storeObjectInSessionStorage(key, obj)` | JSON.stringify + store in session |
| `retrieveObjectFromSessionStorage(key)` | Retrieve + JSON.parse from session |

---

### `PassDownloadUtils.js`
**Purpose:** Visitor pass export utilities (PNG download and printing)

**Functions:**

#### `downloadPassAsImage(passRef, passData, showSnackbar)`
**Parameters:**
- `passRef: React.RefObject` — Reference to pass card component
- `passData: object` — Pass data including passNumber
- `showSnackbar: function` — Optional snackbar callback

**Process:**
1. Clones pass card DOM element
2. Positions clone off-screen with fixed dimensions (460px)
3. Waits for fonts to load
4. Renders to canvas using `html2canvas` (2x scale for quality)
5. Converts canvas to PNG data URL
6. Triggers download: `visitor-pass-{passNumber}-{date}.png`

**Returns:** `Promise<boolean>` — Success status

#### `printPass(passRef, passData)`
**Parameters:**
- `passRef: React.RefObject` — Reference to pass card component
- `passData: object` — Pass data for title

**Process:**
1. Opens new window
2. Writes pass HTML with print-specific styles
3. Auto-triggers print dialog
4. Closes window after printing

**Styling:** Centered, A4-optimized, print-friendly CSS

---

### `apiUtils/apiHelper.jsx`
**Purpose:** Centralized API endpoint functions (all use `apiClient` from `axiosConfig.jsx`)

#### 🔐 Authentication APIs

| Function | Method | Endpoint | Parameters | Purpose |
|---|---|---|---|---|
| `loginUser(credentials)` | POST | `/api/v1/auth/login` | `{ username, password }` | Admin login |
| `sendOtp(data)` | POST | `/api/v1/auth/sendOtp` | `{ phoneNo }` | Send OTP to phone |
| `verifyOtp({ txnId, otp })` | GET | `/api/v1/auth/verifyOtp` | Query: `txnId`, `otp` | Verify OTP code |

#### 👤 Visitor APIs

| Function | Method | Endpoint | Parameters | Purpose |
|---|---|---|---|---|
| `submitVisitorSelfie(selfieFile)` | POST | `/api/v1/visitor/visitor-selfie` | `FormData: selfie` | Upload visitor photo |
| `submitVisitorRequest(visitorId, data)` | POST | `/api/v1/visitor/visitor-request/{visitorId}` | Visitor form data | Submit registration |
| `getVisitorRequests({ page, pageSize })` | GET | `/api/v1/visitor/visitor-requests/{page}/{pageSize}` | Pagination params | Get visitor list |
| `getVisitorStatus(visitorId)` | GET | `/api/v1/visitor/visitor-pass/{visitorId}` | `visitorId` | Check pass status |
| `takeVisitorAction(actionData)` | POST | `/api/v1/visitor/visitor-request-action` | `{ visitorId, status, comment, guestHouseId? }` | Approve/Reject visitor |

**`takeVisitorAction` Parameters:**
- `visitorId: string` — Visitor request ID
- `status: string` — "approved" | "rejected"
- `comment: string` — Action comment/reason
- `guestHouseId?: number` — Optional guest house assignment

#### 🎫 Pass APIs

| Function | Method | Endpoint | Parameters | Purpose |
|---|---|---|---|---|
| `generateVisitorPass({ visitorId })` | GET | `/api/v1/visitor/visitor-pass/{visitorId}` | `visitorId` | Generate visitor pass |

#### 📊 Dashboard APIs

| Function | Method | Endpoint | Parameters | Purpose |
|---|---|---|---|---|
| `getDashboardData(period)` | GET | `/api/v1/dashboard` | `period` query param | Get statistics |

**`period` Options:** `"today"` | `"yesterday"` | `"last7days"` | `"last30days"` | `"thisMonth"` | `"lastMonth"` | `"thisYear"`

#### 🏢 Admin/Management APIs

| Function | Method | Endpoint | Parameters | Purpose |
|---|---|---|---|---|
| `getDepartments()` | GET | `/api/v1/admin/department` | — | List all departments |
| `getBuildings()` | GET | `/api/v1/admin/buildings` | — | List all buildings |
| `updateBuilding(buildingData)` | POST | `/api/v1/admin/buidling` | `{ buildingType, name, address }` | Create/update building |

**Note:** API endpoint has typo: `/buidling` instead of `/building`

---

## 🌐 Environment Variables

| Variable | Type | Default | Purpose | Usage |
|---|---|---|---|---|
| `VITE_ENVIRONMENT` | string | — | Environment mode | `"development"` enables localhost API |
| `VITE_HOST_DOMAIN` | string | — | Production API domain | e.g., `"api.example.com"` |
| `VITE_API_TIMEOUT` | number | `30000` | Axios timeout (ms) | Request timeout duration |

**Configuration Location:** `.env` file in project root (not committed to Git)

**Example `.env`:**
```env
VITE_ENVIRONMENT=development
VITE_HOST_DOMAIN=api.example.com
VITE_API_TIMEOUT=30000
```

---

## 🐳 Docker Configuration

**File:** `Dockerfile` (Multi-stage build)

### Stage 1: Builder
```dockerfile
FROM node:20-alpine AS builder
```
- **Base Image:** Node.js 20 Alpine (lightweight)
- **Working Directory:** `/var/frontend`
- **Build Args:** `VITE_ENVIRONMENT`, `VITE_HOST_DOMAIN`, `VITE_API_TIMEOUT`
- **Process:**
  1. Copy `package*.json`
  2. Run `npm install --legacy-peer-deps`
  3. Copy source code
  4. Run `npm run build` → generates `/dist`

### Stage 2: Production
```dockerfile
FROM node:20-alpine
```
- **Server:** `serve` (static file server)
- **Port:** `5500`
- **Command:** `serve -s dist -l 5500`
- **Optimized:** Only production build artifacts (no source code or node_modules)

**Build Command:**
```bash
docker build --build-arg VITE_ENVIRONMENT=production \
             --build-arg VITE_HOST_DOMAIN=api.example.com \
             -t visitor-frontend .
```

**Run Command:**
```bash
docker run -p 5500:5500 visitor-frontend
```

---

## 📦 Key Dependencies

### Core Framework
| Package | Version | Purpose |
|---|---|---|
| `react` | 19.2.0 | UI framework |
| `react-dom` | 19.2.0 | React DOM renderer |
| `react-router-dom` | 7.10.1 | Client-side routing |
| `vite` | 7.2.4 | Build tool & dev server |

### UI Libraries
| Package | Version | Purpose |
|---|---|---|
| `@mui/material` | 7.3.6 | Material-UI components |
| `@mui/icons-material` | 7.3.6 | Material Design icons |
| `@emotion/react` | 11.14.0 | CSS-in-JS (MUI dependency) |
| `@emotion/styled` | 11.14.1 | Styled components (MUI dependency) |
| `lucide-react` | 0.562.0 | Additional icon library |

### Utilities
| Package | Version | Purpose |
|---|---|---|
| `axios` | 1.13.2 | HTTP client |
| `qrcode.react` | 4.2.0 | QR code generation (SVG) |
| `react-qr-code` | 2.0.18 | Alternative QR library |
| `lottie-react` | 2.4.1 | JSON animation playback |
| `recharts` | 3.7.0 | Charting library for dashboard |
| `html2canvas` | 1.4.1 | DOM to canvas conversion |
| `jspdf` | 3.0.4 | PDF generation (currently not used, PNG preferred) |

### Development Tools
| Package | Version | Purpose |
|---|---|---|
| `eslint` | 9.39.1 | Code linting |
| `@vitejs/plugin-react` | 5.1.1 | Vite React plugin (Fast Refresh) |
| `@types/react` | 19.2.5 | TypeScript definitions |
| `@types/react-dom` | 19.2.3 | TypeScript definitions |

---

## 🚀 Development Workflow

### Setup
```bash
npm install --legacy-peer-deps
```
> **Note:** `--legacy-peer-deps` flag required due to peer dependency conflicts

### Development Server
```bash
npm run dev
```
- Runs Vite dev server on `http://localhost:5173`
- Hot Module Replacement (HMR) enabled
- Fast Refresh for React components

### Production Build
```bash
npm run build
```
- Output directory: `dist/`
- Optimized and minified bundle
- Tree-shaking and code splitting enabled

### Preview Production Build
```bash
npm run preview
```
- Serves production build locally for testing

### Linting
```bash
npm run lint
```
- Runs ESLint on the codebase

---

## 🗂️ Data Flow

### Authentication Flow
```
Login Page → loginUser() → API Response
  ↓
Store: token, isAuthenticated, userData → localStorage
  ↓
Navigate to /dashboard → ProtectedRoute checks auth
  ↓
All API requests include Bearer token (via interceptor)
```

### Visitor Registration Flow
```
1. QR Code Generation (Login page)
2. Visitor scans QR → /register/:qrCode
3. Phone OTP verification → sendOtp() → verifyOtp()
4. Photo upload → submitVisitorSelfie()
5. Form completion (purpose, details, meeting info)
6. Final submission → submitVisitorRequest()
7. Success → Display visitor QR code
```

### Visitor Approval Flow
```
1. Admin → /visitors page
2. Load requests → getVisitorRequests()
3. Review visitor details
4. Take action → takeVisitorAction({ status: 'approved|rejected' })
5. Pass generation → /passes → generateVisitorPass()
6. Download/Print → PassDownloadUtils
```

### Pass Status Check Flow
```
Visitor → /statuspass/:passId → getVisitorStatus()
  ↓
Display: Pending | Approved (with pass) | Rejected | Expired
```

---

## 🔑 LocalStorage Schema

| Key | Type | Purpose | Set By |
|---|---|---|---|
| `token` | string | JWT authentication token | Login |
| `isAuthenticated` | "true" \| "false" | Auth flag for route guards | Login |
| `userData` | JSON string | User profile data | Login |
| `username` | string | Display name | Login |
| `themeMode` | "light" \| "dark" | UI theme preference | ThemeContext |
| `theme` | "light" \| "dark" | Legacy theme key | ThemeContext |

---

## 📝 Code Conventions

### File Naming
- **Components:** PascalCase (e.g., `MiniDrawer.jsx`)
- **Utilities:** camelCase (e.g., `axiosConfig.jsx`)
- **Pages:** PascalCase (e.g., `Dashboard.jsx`)
- **Exception:** `statuspass.jsx` (lowercase)

### Import Order
1. React and React libraries
2. Third-party libraries (MUI, Axios, etc.)
3. Local components
4. Local utilities
5. Assets

### Component Structure
- Prefer functional components with hooks
- Lazy loading for routes via `React.lazy()`
- PropTypes/TypeScript not currently used

### State Management
- Local state via `useState`
- Context API for theme (`ThemeContext`)
- No global state management library (Redux, Zustand, etc.)

---

## 🛠️ Build Configuration

### Vite Config (`vite.config.js`)
```javascript
export default defineConfig({
  plugins: [react()],
})
```
- **Minimal configuration:** Uses Vite defaults
- **No custom paths or aliases defined**
- **React plugin:** Enables Fast Refresh

### ESLint Config (`eslint.config.js`)
- Based on `@eslint/js` recommended rules
- React-specific rules via `eslint-plugin-react-hooks`
- React Refresh plugin for development

---

## 🐛 Known Issues & Notes

1. **API Endpoint Typo:** `/api/v1/admin/buidling` should be `/building`
2. **Inconsistent Naming:** `statuspass.jsx` should follow PascalCase convention
3. **Legacy Peer Deps:** Project requires `--legacy-peer-deps` flag for installation
4. **Multiple QR Libraries:** Both `qrcode.react` and `react-qr-code` present (redundant)
5. **jsPDF Unused:** Included in dependencies but PNG download preferred
6. **Hash Router:** Using `HashRouter` instead of `BrowserRouter` (may limit SEO/deployment options)

---

## 📚 Additional Resources

- **Vite Documentation:** https://vite.dev/
- **React Router v7:** https://reactrouter.com/
- **MUI v7:** https://mui.com/
- **Axios:** https://axios-http.com/
