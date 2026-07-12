# Product Requirements Document (PRD)
## AssetFlow — Enterprise Asset & Resource Management System
**Prepared for:** Odoo Hackathon 2026
**Document type:** PRD for prototype development / vibe coding reference
**Version:** 1.0

---

## 1. Overview

### 1.1 Product Summary
AssetFlow is a centralized ERP module for tracking, allocating, booking, and maintaining an organization's physical assets and shared resources. It replaces manual tracking (spreadsheets, paper logs) with structured lifecycles, role-based workflows, conflict-free allocation/booking, and real-time visibility into asset status, location, and condition.

### 1.2 Problem Statement
Organizations of any type (offices, schools, hospitals, factories, agencies) struggle to answer basic questions — who holds what asset, where is it, what condition is it in, is a room double-booked, has maintenance been approved — because tracking is manual and fragmented. AssetFlow centralizes this into one platform.

### 1.3 Goals
- Digitize the full asset lifecycle: Available → Allocated → Reserved → Under Maintenance → Lost → Retired → Disposed.
- Prevent double-allocation of assets and overlapping bookings of shared resources through hard validation rules.
- Provide a structured, approval-gated workflow for maintenance requests.
- Provide structured, auditor-assigned audit cycles with auto-generated discrepancy reports.
- Give every role a real-time KPI dashboard and proactive notifications for overdue items.
- Enforce realistic, non-self-elevating role assignment (no signup-time admin/role selection).

### 1.4 Non-Goals (Explicitly Out of Scope)
- Purchasing, procurement, or vendor management.
- Invoicing, billing, or payment processing.
- General ledger / accounting integration (acquisition cost is stored for reporting/ranking only — it is not linked to accounting).
- Multi-tenant SaaS billing/subscription management (single organization scope for this prototype).

---

## 2. Users & Roles

| Role | Assigned By | Core Capabilities |
|---|---|---|
| **Admin** | System (first/seed account) | Manages departments, asset categories, audit cycles; promotes Employees to Department Head / Asset Manager via Employee Directory; views org-wide analytics |
| **Asset Manager** | Admin (promotion only) | Registers & allocates assets; approves transfers, maintenance requests, and audit discrepancy resolutions; approves returns and condition check-in notes |
| **Department Head** | Admin (promotion only) | Views assets allocated to their department; approves allocation/transfer requests within department; books shared resources on behalf of department |
| **Employee** | Self-signup (default role) | Views assets allocated to them; books shared resources; raises maintenance requests; initiates return/transfer requests |

**Critical rule:** Signup always creates an **Employee** account. There is no role selector at signup. Roles are elevated **only** by an Admin from the Employee Directory (Screen 3, Tab C). This must be enforced at the API/business-logic layer, not just hidden in the UI.

---

## 3. Core Entities & Relationships (Data Model Overview)

This is a conceptual model to guide schema design — exact fields/types are an implementation decision.

- **Organization** *(implicit, single-tenant for prototype)*
- **Department**: name, head (Employee ref), parent department (self-ref, nullable), status (Active/Inactive)
- **AssetCategory**: name, custom fields (e.g., warranty period), status
- **Employee**: name, email, password/auth, department (ref), role (Employee/Dept Head/Asset Manager/Admin), status
- **Asset**: name, category (ref), asset tag (auto-generated, e.g. `AF-0001`), serial number, acquisition date, acquisition cost, condition, location, photos/documents, is_bookable (bool), current status (enum, see §4.3), current holder (Employee/Department ref, nullable)
- **Allocation**: asset (ref), holder (Employee/Department ref), allocated date, expected return date, actual return date, condition notes (on return), status (Active/Returned/Overdue)
- **TransferRequest**: asset (ref), from holder, to holder, requested by, status (Requested/Approved/Rejected), approver, timestamps
- **Booking**: resource/asset (ref), booked by, start time, end time, status (Upcoming/Ongoing/Completed/Cancelled)
- **MaintenanceRequest**: asset (ref), raised by, issue description, priority, photo, status (Pending/Approved/Rejected/Technician Assigned/In Progress/Resolved), approver, technician, timestamps
- **AuditCycle**: scope (department/location), date range, assigned auditors (Employee refs), status (Open/Closed)
- **AuditEntry**: audit cycle (ref), asset (ref), auditor (ref), result (Verified/Missing/Damaged), notes
- **DiscrepancyReport**: audit entry (ref), auto-generated summary, resolution status
- **Notification**: recipient (Employee ref), type, message, related entity ref, read status, timestamp
- **ActivityLog**: actor (Employee ref), action, entity affected, timestamp

**Key relationships:**
- One Asset → many Allocations (history), many MaintenanceRequests (history), many AuditEntries (across cycles).
- One Asset → at most **one active** Allocation at a time (enforces no double-allocation).
- One bookable resource/Asset → many Bookings, but **no two Bookings may overlap in time** for the same resource.
- One Department → many Employees, optional nested sub-Departments.

---

## 4. Functional Requirements by Screen

### 4.1 Screen 1 — Login / Signup
- FR-1.1: Signup form collects name, email, password; creates an Employee-role account only. No role field exposed.
- FR-1.2: Login via email + password.
- FR-1.3: Forgot password flow (reset link/token).
- FR-1.4: Session validation — protected routes redirect unauthenticated users to login.
- FR-1.5: Backend must reject any client-supplied role/admin flag on signup requests.

### 4.2 Screen 2 — Dashboard / Home
- FR-2.1: KPI cards: Assets Available, Assets Allocated, Maintenance Today, Active Bookings, Pending Transfers, Upcoming Returns. Values scoped to what the logged-in role is permitted to see (Admin/Asset Manager = org-wide; Dept Head = department-scoped; Employee = personal).
- FR-2.2: Overdue returns (past Expected Return Date) shown in a visually distinct section from upcoming returns.
- FR-2.3: Quick action buttons: Register Asset (Asset Manager/Admin), Book Resource (all roles), Raise Maintenance Request (all roles).

### 4.3 Screen 3 — Organization Setup (Admin only)
**Tab A – Department Management**
- FR-3.1: Create/edit/deactivate department.
- FR-3.2: Assign Department Head (must be an existing Employee), optional Parent Department, Status.

**Tab B – Asset Category Management**
- FR-3.3: Create/edit categories (e.g., Electronics, Furniture, Vehicles).
- FR-3.4: Support optional category-specific custom fields (e.g., warranty period for Electronics).

**Tab C – Employee Directory**
- FR-3.5: List/search employees with Name, Email, Department, Role, Status.
- FR-3.6: Admin can promote an Employee to Department Head or Asset Manager here — the **only** place role changes happen.
- FR-3.7: Admin can activate/deactivate employee accounts.

### 4.4 Screen 4 — Asset Registration & Directory
- FR-4.1: Register asset with: Name, Category, auto-generated Asset Tag (`AF-XXXX` sequential), Serial Number, Acquisition Date, Acquisition Cost (report/ranking use only), Condition, Location, photo/document upload, "shared/bookable" flag.
- FR-4.2: Search/filter by Asset Tag, Serial Number, QR code, Category, Status, Department, Location.
- FR-4.3: Display current lifecycle status per asset: Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed.
- FR-4.4: Per-asset detail view showing combined Allocation History and Maintenance History (reverse-chronological).
- FR-4.5: Asset lifecycle state machine must be enforced server-side (see §5 State Machine below) — no illegal transitions via API.

### 4.5 Screen 5 — Asset Allocation & Transfer
- FR-5.1: Allocate an Available asset to an Employee or Department, with optional Expected Return Date.
- FR-5.2: **Conflict rule (hard constraint):** the system MUST block allocation of an already-allocated asset. Show "currently held by [holder]" and present a **Transfer Request** action instead of allowing a second allocation.
- FR-5.3: Transfer workflow: `Requested → Approved (by Asset Manager or the relevant Department Head) → Re-allocated`. On approval, the allocation history is updated automatically and the asset's current holder changes.
- FR-5.4: Return flow: mark asset returned, capture condition check-in notes (by Asset Manager), asset status reverts to Available.
- FR-5.5: Overdue allocations (past Expected Return Date, not yet returned) are auto-flagged; they must feed both the Dashboard KPI/overdue section and the Notifications screen.

### 4.6 Screen 6 — Resource Booking
- FR-6.1: Calendar view showing a given bookable resource's existing bookings.
- FR-6.2: **Overlap validation (hard constraint):** a new booking request that overlaps an existing booking for the same resource must be rejected. A booking starting exactly when a prior one ends is valid (back-to-back allowed, no gap required).
  - Example: existing 9:00–10:00 booking → request for 9:30–10:30 is rejected; request for 10:00–11:00 is accepted.
- FR-6.3: Booking status lifecycle: Upcoming → Ongoing → Completed, or → Cancelled.
- FR-6.4: Support cancel and reschedule (reschedule re-runs overlap validation).
- FR-6.5: Reminder notification sent before a booking's start time.

### 4.7 Screen 7 — Maintenance Management
- FR-7.1: Raise a maintenance request: select asset, describe issue, set priority, attach photo.
- FR-7.2: Workflow: `Pending → Approved/Rejected (by Asset Manager) → Technician Assigned → In Progress → Resolved`.
- FR-7.3: Asset status auto-transitions to **Under Maintenance** on approval, and back to **Available** on resolution (unless it was Allocated/Reserved prior — define fallback state per business rule; recommended default: return to prior non-maintenance state, else Available).
- FR-7.4: Maintenance history retained per asset and viewable on Screen 4.

### 4.8 Screen 8 — Asset Audit
- FR-8.1: Create an Audit Cycle with scope (department and/or location) and date range.
- FR-8.2: Assign one or more auditors to the cycle.
- FR-8.3: Auditor marks each in-scope asset as Verified / Missing / Damaged.
- FR-8.4: System auto-generates a discrepancy report listing all Missing/Damaged flagged items.
- FR-8.5: "Close Audit Cycle" action locks the cycle (no further entries) and updates affected asset statuses (e.g., confirmed-missing → **Lost**).
- FR-8.6: Audit history retained and browsable per cycle.

### 4.9 Screen 9 — Reports & Analytics
- FR-9.1: Asset utilization trends (most-used vs. idle assets).
- FR-9.2: Maintenance frequency by asset/category.
- FR-9.3: Assets due for maintenance or nearing retirement.
- FR-9.4: Department-wise allocation summary.
- FR-9.5: Resource booking heatmap (peak usage windows).
- FR-9.6: Export reports (e.g., CSV/PDF).

### 4.10 Screen 10 — Activity Logs & Notifications
- FR-10.1: Notification types include: Asset Assigned, Maintenance Approved/Rejected, Booking Confirmed/Cancelled/Reminder, Transfer Approved, Overdue Return Alert, Audit Discrepancy Flagged.
- FR-10.2: Full activity log capturing actor, action, affected entity, and timestamp for admin/manager/employee actions.
- FR-10.3: Log and notifications should be filterable/searchable (by role visibility — Employees see their own activity; Admin sees all).

---

## 5. Asset Lifecycle State Machine

**States:** `Available`, `Allocated`, `Reserved`, `Under Maintenance`, `Lost`, `Retired`, `Disposed`

**Allowed transitions (minimum required by the problem statement):**
- `Available → Allocated` (on successful allocation)
- `Allocated → Available` (on return)
- `Available ↔ Under Maintenance` (approval sends it to maintenance; resolution returns it)
- `Available → Reserved` (booking a shared/bookable asset for a future slot)
- `Reserved → Available` (booking cancelled or completed, if not converted to allocation)
- `Any active state → Lost` (confirmed-missing at audit close)
- `Any state → Retired` (admin/asset manager action, end of useful life)
- `Retired → Disposed` (final decommission)

**Enforcement rule:** All transitions must be validated server-side against this state machine — a request that attempts an illegal transition (e.g., allocating a Retired asset) must be rejected with a clear error, not silently accepted.

---

## 6. Cross-Cutting / Non-Functional Requirements

- **NFR-1 Role-based access control (RBAC):** Every endpoint/screen enforces role permissions server-side; UI hiding alone is insufficient.
- **NFR-2 Data integrity:** Allocation conflict rule and booking overlap rule are hard database/business-logic constraints, not just UI warnings — must hold even under concurrent requests.
- **NFR-3 Auditability:** Every state-changing action (allocate, transfer, return, maintenance status change, audit result) must write to the Activity Log.
- **NFR-4 Responsiveness:** UI must be usable on desktop and tablet at minimum (asset audits and maintenance are often done on the move).
- **NFR-5 Extensibility:** Module boundaries (Org Setup, Assets, Allocation, Booking, Maintenance, Audit, Reports, Notifications) should be loosely coupled so features can be added without cross-module rewrites — reflecting the "clean architecture, reusable modules" mandate.
- **NFR-6 Notifications delivery:** In-app notification center is required; email/push is optional/stretch.
- **NFR-7 Industry-agnostic data model:** No field or workflow should hard-code a specific industry (e.g., "patient," "student") — use generic terms (employee, department, asset, resource).

---

## 7. Primary User Flows (End-to-End)

1. **Org bootstrap:** Admin creates departments → creates asset categories → promotes selected Employees to Department Head / Asset Manager.
2. **Asset onboarding:** Asset Manager registers a new asset → enters system as `Available`.
3. **Allocation:** Asset Manager/Dept Head allocates asset to Employee/Department → if already held, system blocks and offers Transfer Request instead.
4. **Booking:** Employee/Dept Head books a shared resource for a time slot → overlapping requests auto-rejected.
5. **Maintenance:** Holder raises maintenance request → Asset Manager approves → asset flips to `Under Maintenance` → technician assigned → resolved → asset flips back.
6. **Transfer/Return:** Asset transferred (approval-gated) or returned (condition check-in) as needs change → overdue returns auto-flagged.
7. **Audit:** Admin creates audit cycle, assigns auditors → auditors mark each asset Verified/Missing/Damaged → discrepancy report auto-generated → cycle closed → statuses updated (e.g., `Lost`).
8. **Visibility:** All of the above generates notifications, activity log entries, and feeds dashboard KPIs and reports.

---

## 8. Acceptance Criteria (Hackathon Demo Checklist)

- [ ] Signup only ever creates an Employee; role elevation only possible via Admin → Employee Directory.
- [ ] Attempting to allocate an already-allocated asset is blocked and surfaces a Transfer Request option with current holder's name.
- [ ] Attempting to book an overlapping time slot is rejected; back-to-back bookings (end = start) succeed.
- [ ] Maintenance request cannot move an asset to "Under Maintenance" without Asset Manager approval.
- [ ] Closing an audit cycle with a "Missing" entry updates that asset's status to `Lost` and cycle becomes locked.
- [ ] Dashboard KPI values and overdue sections update live/near-live as underlying data changes.
- [ ] Every allocate/transfer/return/maintenance/audit action produces a corresponding notification and activity log entry.
- [ ] Illegal asset state transitions are rejected by the backend even if attempted directly via API.

---

## 9. Reference

- Mockup (POC / wireframes): https://app.excalidraw.com/l/65VNwvy7c4X/5ceOBMjbDby
- Source: AssetFlow — Odoo Hackathon 2026 Problem Statement (provided PDF)

---

## 10. Open Questions for the Team (to resolve before/at build time)

- Exact fallback state for an asset when maintenance resolves if it was `Allocated`/`Reserved` before entering maintenance.
- Whether Department Heads can approve transfers/allocations for assets outside their own department.
- QR code generation/scanning: in-scope for prototype, or asset tag search only?
- Notification channels beyond in-app (email/push) — stretch goal or required for demo?
- Multi-auditor audit cycles: do all auditors need to agree, or does any single entry finalize an asset's audit result?
