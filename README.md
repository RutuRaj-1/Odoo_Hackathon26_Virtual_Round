# AssetFlow ── Enterprise Asset & Resource Management System
### Odoo Hackathon 2026 (Virtual Round Entry)

AssetFlow is a centralized, premium ERP platform designed to simplify how organizations register, track, allocate, and maintain their physical assets and shared resources. It features a complete role-based workflow, strict Cloud Firestore integration, and real-time operational metrics.

---

## 1. System Vision & Mission
- **Organizational Setup**: Maintain departments, asset categories, and a secure employee directory under strict admin control.
- **Asset Lifecycle Management**: Track assets from acquisition through states: `Available`, `Allocated`, `Reserved`, `Under Maintenance`, `Lost`, `Retired`, and `Disposed`.
- **Conflict-Aware Allocations**: Prevent double-allocations of assets and suggest transfer request routes if an asset is already in use.
- **Resource Bookings**: Calendar-based resource time-slot booking with overlap validation.
- **Maintenance Workflows**: Log repair requests and automatically route them to "Under Maintenance" on approval and back to "Available" on resolution.

---

## 2. Technical Stack
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion
- **UI Components**: Radix UI (accessible primitives) & custom premium components
- **Database**: Cloud Firestore
- **Authentication**: Firebase Authentication (supporting Email/Password, Google OAuth, and Phone OTP verification)
- **Charts**: Recharts (for live analytical breakdowns)

---

## 3. Core Database Schemas (Cloud Firestore)

The application communicates with Firestore collections through a scalable service layer:

### `users`
Represents employees and system accounts:
- `uid`: Unique identifier (auth matched)
- `email`: User email address
- `name`: Full display name
- `role`: `'Admin' | 'Asset Manager' | 'Department Head' | 'Employee'` (strictly database-driven)
- `departmentId`: Reference ID of assigned department
- `status`: `'Active' | 'Inactive'`
- `avatarUrl`: Reference image URL

### `departments`
Maintains the organizational hierarchy:
- `id`: Unique department code
- `name`: Department name (e.g. Engineering)
- `code`: Abbreviation code (e.g. ENG)
- `parentDepartmentId`: Self-referential ID for sub-departments
- `departmentHeadId`: Reference ID of assigned manager
- `status`: `'Active' | 'Inactive'`

### `assetCategories`
Configures categorization metadata:
- `id`: Category slug
- `name`: Category name (e.g. Laptops)
- `description`: Text notes
- `warrantyPeriod`: Numeric months duration
- `status`: `'Active' | 'Inactive'`

### `assets`
Contains physical tracking logs:
- `id`: Unique generated document ID
- `assetTag`: Sequential tag (`AF-XXXX`)
- `name`: Asset name
- `category`: String classification slug
- `status`: `'active' | 'in_use' | 'maintenance' | 'retired' | 'missing'`
- `condition`: `'excellent' | 'good' | 'fair' | 'poor'`
- `serialNumber`: Unique manufacturer code
- `purchasePrice`: Numeric acquisition cost

### `bookings`
Handles scheduling slots for bookable assets:
- `id`: Booking document ID
- `bookingNumber`: Reference sequence (`BK-XXXX`)
- `assetId`: Target asset reference
- `requestedBy`: Requester user reference
- `status`: `'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'`
- `startDate`: ISO datetime
- `endDate`: ISO datetime

### `maintenanceRequests`
Tracks technical repair tickets:
- `id`: Ticket document ID
- `ticketNumber`: Reference sequence (`MT-XXXX`)
- `assetId`: Target asset reference
- `status`: `'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'`
- `priority`: `'low' | 'medium' | 'high' | 'critical'`
- `title`: Short issue title
- `description`: Detailed log notes

---

## 4. Implemented Role Workflows & Routing

Routes are protected by case-insensitive, whitespace-agnostic guards to prevent credential mismatches:

1.  **Admin (`/admin/*`)**:
    *   Full Dashboard metrics.
    *   Organization Setup: Add departments, categories, and adjust employee roles/statuses.
2.  **Asset Manager (`/asset-manager/*`)**:
    *   Dedicated Dashboard.
    *   Register assets, approve return condition notes, and assign maintenance technicians.
3.  **Department Head (`/department/*`)**:
    *   Approve asset allocations/transfers within their department.
    *   Book resources on behalf of the department.
4.  **Employee (`/employee/*`)**:
    *   View allocated assets.
    *   Book shared resources and log maintenance tickets.

---

## 5. Getting Started

### Local Setup
1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Add environment keys**:
    Create a `.env` file at the root containing your Firebase configuration:
    ```env
    VITE_FIREBASE_API_KEY=your-api-key
    VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
    VITE_FIREBASE_PROJECT_ID=your-project-id
    VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
    VITE_FIREBASE_APP_ID=your-app-id
    ```
3.  **Run in development mode**:
    ```bash
    npm run dev
    ```
4.  **Build production version**:
    ```bash
    npm run build
    ```
