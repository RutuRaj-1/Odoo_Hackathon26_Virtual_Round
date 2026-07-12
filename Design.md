# 🎨 AssetFlow Frontend Design System

> Enterprise Asset & Resource Management System
>
> Frontend Documentation

---

# Design Philosophy

AssetFlow is an ERP platform.

The UI should feel like:

- Professional
- Clean
- Data-focused
- Fast
- Minimal clicks
- Responsive
- Accessible

Instead of colorful dashboards, the interface should resemble products like:

- Odoo
- Jira
- Linear
- Notion
- Zoho
- ERPNext

The application should allow users to manage hundreds or thousands of assets efficiently.

---

# Design Principles

## 1. Simplicity

Every screen should have one clear purpose.

Avoid unnecessary decoration.

---

## 2. Consistency

Every page follows the same layout.

```
Navbar
↓

Sidebar

↓

Page Header

↓

Filters

↓

Main Content

↓

Tables / Cards
```

---

## 3. Information First

Enterprise users care more about data than graphics.

Prioritize:

- Tables
- Status chips
- Search
- Filters
- Quick Actions

---

## 4. Responsive

Desktop First

Tablet Supported

Mobile Friendly

---

# Color Palette

## Primary

Blue

```
#2563EB
```

Used for

- Primary buttons
- Active sidebar
- Links

---

## Success

```
#22C55E
```

---

## Warning

```
#F59E0B
```

---

## Danger

```
#EF4444
```

---

## Info

```
#06B6D4
```

---

## Background

```
#F8FAFC
```

---

## Cards

```
#FFFFFF
```

---

## Border

```
#E5E7EB
```

---

## Text

Primary

```
#111827
```

Secondary

```
#6B7280
```

---

# Typography

Font

```
Inter
```

Fallback

```
sans-serif
```

Heading

```
Bold
```

Body

```
Medium
```

Table

```
Regular
```

---

# Border Radius

Cards

```
12px
```

Buttons

```
10px
```

Inputs

```
10px
```

Badges

```
999px
```

---

# Shadows

Light

```
shadow-sm
```

Cards

```
shadow-md
```

Hover

```
shadow-lg
```

---

# Layout

## Sidebar

Width

```
260px
```

Contains

- Dashboard
- Organization Setup
- Assets
- Allocation
- Booking
- Maintenance
- Audit
- Reports
- Notifications

Bottom

Profile

Logout

---

## Navbar

Height

```
70px
```

Contains

- Search
- Notification Bell
- User Avatar

---

## Content

Maximum Width

```
1440px
```

Padding

```
24px
```

---

# Component Library

## Buttons

### Primary

Blue Filled

Examples

```
Register Asset
Book Resource
Save
```

---

### Secondary

Gray Outline

Examples

```
Cancel
Back
```

---

### Danger

Red Filled

Examples

```
Delete
Reject
```

---

# Cards

Used for

- KPI
- Statistics
- Reports

Structure

```
Icon

Title

Value

Small trend
```

Example

```
Assets Available

582

+12 Today
```

---

# Tables

All major screens use tables.

Features

- Search
- Pagination
- Sorting
- Filters
- Bulk Actions

Alternating row hover

Sticky Header

---

# Search Bar

Global search

Placeholder

```
Search assets, employees...
```

---

# Filters

Dropdowns

- Department
- Status
- Category
- Date
- Priority

---

# Status Badges

Available

Green

Allocated

Blue

Reserved

Orange

Maintenance

Purple

Lost

Red

Retired

Gray

Disposed

Black

---

# Forms

Every form follows

Label

↓

Input

↓

Helper Text

↓

Validation

Spacing

```
16px
```

---

# Dashboard

Contains

## KPI Cards

- Total Assets
- Available Assets
- Active Bookings
- Pending Maintenance
- Overdue Returns
- Audit Cycles

---

## Charts

Asset Distribution

Pie Chart

Maintenance Trend

Line Chart

Bookings

Bar Chart

---

## Recent Activity

Timeline

---

## Quick Actions

Register Asset

Book Resource

Raise Maintenance

Create Audit

---

# Organization Setup

Tabs

- Departments
- Categories
- Employees

Each tab contains

Top Action Button

Search

Table

Drawer Form

---

# Asset Directory

Top

Search

Filters

Grid/Table Toggle

Table

Columns

- Asset Tag
- Name
- Category
- Status
- Holder
- Department
- Condition

Click row

Opens Asset Details Drawer

---

# Asset Details

Tabs

Overview

History

Maintenance

Allocation

Documents

---

# Allocation Screen

Split Layout

Left

Available Assets

Right

Allocation Form

Bottom

History Table

---

# Booking Screen

Calendar View

Daily

Weekly

Monthly

Booking Cards

Color based on status

Overlap validation shown immediately

---

# Maintenance

Kanban Workflow

Pending

↓

Approved

↓

Assigned

↓

In Progress

↓

Resolved

Each card displays

Priority

Requester

Asset

Time

---

# Audit

Wizard Style

Step 1

Create Cycle

↓

Step 2

Assign Auditors

↓

Step 3

Verify Assets

↓

Step 4

Generate Report

↓

Step 5

Close Cycle

---

# Reports

Charts

Tables

Export PDF

Export Excel

Date Range Picker

---

# Notifications

Grouped by

Today

Yesterday

Earlier

Unread shown with blue dot

---

# Empty States

Every screen should have an illustration

Example

"No Assets Registered"

Button

Register Asset

---

# Loading States

Skeleton Loader

Avoid Spinner whenever possible

---

# Error States

Simple card

⚠️ Something went wrong.

Retry Button

---

# Success Feedback

Toast

Green

Appears top-right

Duration

3 seconds

---

# Icons

Lucide Icons

Examples

Laptop

Building

Calendar

Wrench

Users

Bell

File

BarChart

---

# Animations

Very minimal

Fade

Slide

Hover

150ms

No excessive motion

---

# Accessibility

Minimum Contrast Ratio

WCAG AA

Keyboard Navigation

Visible Focus Ring

ARIA labels for forms

---

# Dark Mode

Optional

Not a priority during hackathon.

---

# Suggested Tech Stack

- React
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- React Router
- React Hook Form
- Zod
- TanStack Table
- Recharts
- Lucide React
- React Query (optional)

---

# Folder Structure

```
src/
│
├── assets/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── dashboard/
│   ├── assets/
│   ├── booking/
│   ├── maintenance/
│   └── audit/
│
├── pages/
│
├── hooks/
│
├── services/
│
├── routes/
│
├── utils/
│
├── constants/
│
├── types/
│
└── App.tsx
```

---

# UI Goal
