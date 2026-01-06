# Project Requirements - Client Management System

## Tech Stack

- React + TypeScript
- Tailwind CSS
- Firebase (Firestore + Auth)

---

## User Roles & Permissions

### 1. Admin

- Full access to everything
- Can view and manage private users
- Can add/edit/delete users, bundles, cities, resellers
- Can track income, expenses, and balances (including private users)
- Can view all invoices and print them

### 2. Manager

- Access to everything except private users
- All financial summaries (dashboard, income, balance) exclude private users
- Cannot view or manage private user data

### 3. User

- Can access the Clients page only
- Can add users
- Can mark users as paid
- Can print invoices
- Cannot access dashboard, financial modules, or resellers

---

## Features & Modules

### 📊 Dashboard (Admin & Manager only)

- Total number of users
- Total income
- Total unpaid balance
- "Who Paid Today" section (shows only today's payments)
- Manager view excludes private users' data

### 👤 Clients Module

**Client Information:**

- Name
- Account Name
- Phone
- Address
- City
- Bundle (name + price)
- Monthly Payment Status (paid / not paid)
- Is Private (yes / no)

**Features:**

- Add/Edit/Delete clients
- Mark as paid manually per month
- View and print invoices
- Track monthly payments

**Filters & Search:**

- Filter by date (monthly/yearly range)
- Filter by payment status (paid / unpaid)
- Filter by city
- Global search (name, account name, phone)

### 🧳 Bundles Management

- Add/Edit/Delete bundles
- Each bundle has:
  - Name
  - Price

### 🏙 Cities Management

- Add/Edit/Delete cities

### 🤝 Reseller Management

**Reseller Information:**

- Name
- Address
- Phone number

**Monthly Tracking:**

- Manually enter how much each reseller has to pay for a given month
- Mark as paid when payment is received
- When marked as paid, amount is added to income

### 💸 Income & Expenses Tracking

- Admin and manager can add income or expenses
- Each entry includes:
  - Amount
  - Type: income or expense
  - Notes
  - Date
- Client payments and reseller dues (when marked paid) go into income automatically

### 🧾 Invoice Printing

- All roles (admin, manager, user) can print invoices
- Invoices can be printed from the Clients page
- Invoice includes:
  - Client name
  - Bundle
  - Price
  - Date
  - Payment status

---

## Access Control Summary

| Feature / Module        | Admin | Manager         | User |
| ----------------------- | ----- | --------------- | ---- |
| Dashboard               | ✅    | ✅ (no private) | ❌   |
| Add/Edit Users          | ✅    | ✅ (no private) | ✅   |
| Mark as Paid            | ✅    | ✅              | ✅   |
| View Private Users      | ✅    | ❌              | ❌   |
| Bundles Management      | ✅    | ✅              | ❌   |
| Cities Management       | ✅    | ✅              | ❌   |
| Reseller Management     | ✅    | ✅              | ❌   |
| Income/Expenses         | ✅    | ✅              | ❌   |
| Invoice Printing        | ✅    | ✅              | ✅   |
| Who Paid Today (Dash)   | ✅    | ✅              | ❌   |
| Filter Payments by Date | ✅    | ✅              | ✅   |

---

## Development Notes

### Phase 1: Core Features (Build as Admin-only first)

1. Bundles & Cities Management
2. Enhanced Client Management
3. Dashboard with metrics
4. Reseller Management
5. Income/Expense Tracking
6. Invoice System

### Phase 2: Access Control (Add later)

- Implement role-based permissions
- Hide/show features based on user role
- Filter private users for managers
- Restrict access to management modules for regular users

### Key Business Logic

- When a client payment is marked as paid → automatically create income record
- When a reseller payment is marked as paid → automatically create income record
- Private clients should be hidden from Manager and User roles
- All financial calculations for Managers should exclude private client data
