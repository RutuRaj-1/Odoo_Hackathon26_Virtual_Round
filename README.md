# AssetFlow ── Enterprise Asset & Resource Management System
### Odoo Hackathon 2026 (Virtual Round Entry)

---

## Project
**AssetFlow** is a centralized, high-performance Enterprise Resource Planning (ERP) platform built to streamline the registration, tracking, allocation, and maintenance of physical assets and shared resources. Designed for modern organizations, it replaces manual spreadsheets with a unified system backed by real-time Firestore synchronization, database-driven Role-Based Access Control (RBAC), and automated lifecycle alerts.

---

## Problem
In fast-scaling enterprises, asset management often becomes disjointed, leading to:
*   **Asset Misallocation & Conflicts**: Multiple teams booking or allocating the same hardware simultaneously (double-allocation).
*   **Untracked Lifecycles**: Difficulty tracking whether an asset is active, in-use, retired, lost, or currently under repair.
*   **Manual Onboarding & Permissions**: Lack of custom organizational structures where departments, parent categories, and employee access ranks are centralized.
*   **Fragmented Maintenance**: High latency in logging technical incidents, assigning technicians, and recording repair costs.
*   **Lack of Audit Trail**: No active checks for verifying physical asset locations or tracking missing inventory.

---

## Solution
AssetFlow provides a comprehensive, conflict-aware solution:
*   **Collision Alert System**: Prevents double-allocation of equipment. If an asset is already in use, the system blocks allocation and forces a transfer request workflow.
*   **Live Maintenance Kanban Workflow**: Manages technical tickets from pending reviews to resolved status. Transitioning a ticket automatically updates the asset's system status.
*   **Real-time Audit Cycles**: Starts dedicated checks per department, allowing auditors to mark inventory as Verified, Missing, or Damaged.
*   **Organization Directory**: Administrative console to manage departments, assign department heads, and adjust employee roles and access levels.
*   **Analytical Dashboards**: Aggregates live Firestore statistics, computing category distributions, department utilization, and maintenance expenses with exportable reporting.

---

## Features
*   **Strict Database-Driven RBAC**: Guards routes based on user credentials (Admin, Asset Manager, Department Head, Employee).
*   **Dynamic Overdue Warnings**: Automatically flags allocated assets that have exceeded 30 days without status updates.
*   **Multi-Level Filtering**: Search directory filtering by name, tag, category, status, and department.
*   **Conflict-Preventing Bookings**: Booking form checks reservation periods and handles overlaps.
*   **Interactive Kanban Board**: Drag/click cards to approve, start work, assign technicians, or resolve maintenance issues.
*   **Audit Checklists**: Multi-pill verification triggers status updates (e.g. marking as missing sets the asset status to `Lost`).
*   **CSV Data Exporting**: Download detailed analytical logs for department audits with a single click.

---

## Tech Stack
*   **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion
*   **State & Database**: Firebase Authentication (Email/Password, Google Sign-in, Phone OTP), Cloud Firestore
*   **Component Library**: Radix UI (primitives), Lucide React (icons)
*   **Data Visualization**: Recharts

---

## Architecture
AssetFlow uses a decoupled layout hierarchy connecting page triggers to Firestore service adapters:

```mermaid
graph TD
    subgraph View Layer (React components)
        Dash[Dashboard Page]
        Alloc[Allocation & Transfer]
        Maint[Kanban Maintenance]
        Audit[Audit Cycles]
        Reports[Analytics Dashboard]
    end

    subgraph Service Layer (TypeScript)
        AS[assetService]
        BS[bookingService]
        MS[maintenanceService]
        ES[employeeService]
    end

    subgraph Database Layer (Cloud Firestore)
        F_Assets[(/assets)]
        F_Users[(/users)]
        F_Bookings[(/bookings)]
        F_Maint[(/maintenanceRequests)]
    end

    Dash -->|Reads aggregate counts| F_Assets & F_Users & F_Bookings
    Alloc -->|Collision validation| AS
    Maint -->|State changes| MS
    Audit -->|Flags status| AS
    Reports -->|Reads analytics| F_Assets & F_Maint

    AS -->|CRUD| F_Assets
    BS -->|CRUD| F_Bookings
    MS -->|CRUD| F_Maint
    ES -->|CRUD| F_Users
```

---

## Screenshots
Screenshots of the implemented POC layouts are saved in the project's artifact directory:
*   **Dashboard Overview**: Overdue banners and active asset statistics.
*   **Organization Console**: Department hierarchies and employee directories.
*   **Allocation & Transfer**: Double-allocation warning panels.
*   **Maintenance Board**: Kanban workflow columns.
*   **Asset Audits**: Verified/Missing/Damaged pill selectors.
*   **Reports Dashboard**: Utilization and maintenance frequency charts.

---

## Installation

### Prerequisites
*   Node.js (v18+)
*   Firebase project configuration keys

### Setup Instructions
1.  **Clone the repository and install dependencies**:
    ```bash
    npm install
    ```
2.  **Add Firebase configuration keys**:
    Create a `.env` file in the `assetflow` subdirectory containing your project credentials:
    ```env
    VITE_FIREBASE_API_KEY=your-api-key
    VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
    VITE_FIREBASE_PROJECT_ID=your-project-id
    VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
    VITE_FIREBASE_APP_ID=your-app-id
    ```
3.  **Run locally**:
    ```bash
    npm run dev
    ```
4.  **Build production version**:
    ```bash
    npm run build
    ```

---

## Team
*   **Hackathon Entry ID**: RutuRaj-1
*   **Project Title**: AssetFlow ERP System

---

## Future Scope
*   **Barcode/QR Scanner Integration**: Scan physical tags directly with a mobile device camera.
*   **Push Notifications**: Notify department heads instantly on allocation request conflicts.
*   **Offline Data Sync**: Cache audit records locally when offline and synchronize upon reconnection.
*   **Predictive Maintenance**: Use Recharts history to alert managers when an asset is approaching its average failure threshold.
