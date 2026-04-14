# iPhone Repair Tracking System — GitHub Copilot Instructions

## Project Overview

Build a full-stack web application for a team of iPhone repair technicians. The system tracks phone repairs, parts used, testing results, and logs them to a Google Sheet that mirrors the existing spreadsheet format. Each technician has a personal dashboard, can take ownership of phones, and collaborate with colleagues.

---

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (primary) + Google Sheets API (sync/export)
- **Auth:** JWT-based login (one account per employee)
- **Google Sheets:** Used as the final output log (write-only sync)

---

## Data Model

### Users (employees)
```
id, name, username, password_hash, role (admin | technician), created_at
```
Employee codes from the spreadsheet (used as identifiers in the sheet):
`BAC, BAE, BAI, BAO, BAU, BAV, BBE, KEA, KEO, KET, MTT, NRM, PDK, POE, PPF, TNL, TTA, ZAA, ZAM, CZ`
Each user has one of these codes assigned to their profile.

### Phones
```
id,
serial_number,       -- e.g. VYK261701003, REF252800242, KEO529070
serial_prefix,       -- VYK | REF | KEO | KET | other (auto-detected)
model,               -- e.g. iPhone 15 Pro, iPhone 13 Mini
status,              -- in_progress | testing | completed | on_hold
assigned_to,         -- user_id of current technician
created_at,
updated_at
```

### Repair Entries (service records)
Each phone can have multiple repair entries (the spreadsheet allows multiple rows per phone).
```
id,
phone_id,
assigned_to,         -- user_id
date,
parts_used,          -- comma-separated part numbers (e.g. "658195, 658796, 659960")
description,         -- text notes / Popis + poznamka
service_type,        -- tag: TEL | TAB | NTB | FOTO | DIAG | INE | REK | KON | DRON
test_ok,             -- boolean (OK column)
test_nok,            -- boolean (NOK column)
button_action,       -- 1 | 2 | 3 | 4 (see Button Actions section)
is_refurb,           -- boolean
service_price,       -- Cena servisu
normo_hours,         -- Nh
synced_to_sheet,     -- boolean
created_at
```

### Messages (colleague communication)
```
id, from_user_id, to_user_id, phone_id (optional), message, read, created_at
```

---

## Serial Number Logic

Serial numbers follow these patterns — auto-detect prefix on input:
- `VYK` + digits — standard service phone
- `REF` + digits — refurbished phone
- `KEO`, `KET`, `BAC`, `BAE`, etc. — customer phones (prefix = employee code)

Validate format on entry: must start with known prefix + digits. Show warning if unknown format but allow saving.

---

## Button Actions (1, 2, 3, 4)

These are the core workflow buttons. Each button corresponds to a point value logged in the sheet's SERVIS section:

| Button | What it means                          | Points |
|--------|----------------------------------------|--------|
| **1**  | Basic repair / diagnostics / battery   | 5 Nh   |
| **2**  | LCD / display repair (Repas displeja)  | 10 Nh  |
| **3**  | Housing replacement                    | 15 Nh  |
| **4**  | Complex / full refurb (housing+LCD+parts) | 15 Nh |

A repair entry gets exactly **one button** clicked. The button selection writes the appropriate column (1, 2, 3, or 4) in the sheet with the Nh value.

Button behavior in the UI:
- Show all 4 as large toggle buttons on the repair entry form
- Only one can be selected at a time
- Visually highlight the selected one
- Required before submitting to Google Sheet

---

## Workflow (Step-by-Step)

1. **Technician picks up a phone** → creates a new phone record (serial number + model)
2. **Repair work** → adds parts used + description → saves to DB
3. **Testing** → marks test as OK or NOK
4. **Google Sheet sync** → clicks "Log to Sheet" → selects button 1/2/3/4 → entry is written to the correct monthly sheet tab (e.g. `0426` for April 2026)
5. **Phone is done** → status updated to `completed`

---

## Google Sheets Integration

### Sheet Structure (mirrors existing spreadsheet)

Each monthly tab is named `MMYY` (e.g. `0426` = April 2026).

Columns to write (row per repair entry):
| Col | Field                     |
|-----|---------------------------|
| A   | Dátum (date)              |
| B   | Číslo servisu (serial no) |
| C   | Zariadenie (model)        |
| D   | Použité diely (parts)     |
| E   | Popis + poznamka (notes)  |
| G   | Button 1 (TRUE/FALSE or value) |
| H   | Button 2                  |
| I   | Button 3                  |
| J   | Button 4                  |
| K   | Z (flag)                  |
| L   | Cena servisu              |
| M   | Nh                        |
| O   | OK (test passed)          |
| P   | NOK (test failed)         |
| R   | TAG (TEL/TAB/NTB/FOTO/DIAG/INE/REK/KON/DRON) |

### Sheet API Setup
- Use `googleapis` npm package
- Service account credentials stored in `.env` as `GOOGLE_SERVICE_ACCOUNT_JSON`
- Spreadsheet ID in `.env` as `GOOGLE_SHEET_ID`
- Before writing: check if tab for current month exists; if not, duplicate the `VZOR` template tab and rename it
- Append rows starting from row 2 (skip header row 1)

---

## Frontend Pages & Components

### 1. Login Page (`/login`)
- Username + password form
- On success: store JWT in localStorage, redirect to dashboard

### 2. My Dashboard (`/dashboard`)
- Shows **only phones assigned to the current user**
- Summary cards: total phones, in progress, testing, completed today
- Phone list table with columns: Serial, Model, Status, Parts Count, Last Updated, Actions
- Filter bar: by status, by serial prefix (VYK/REF/KEO...), by date range, by model
- Search box (searches serial + model + description)
- "New Phone" button

### 3. All Phones (`/phones`)
- Same table as dashboard but shows **all phones from all technicians**
- Extra column: "Assigned To"
- "Take Over" button — reassigns phone to current user
- Filters: same as dashboard + filter by assigned technician

### 4. Phone Detail (`/phones/:id`)
- Header: serial number, model, status badge, assigned technician
- Repair history (list of all entries for this phone)
- "Add Repair Entry" form:
  - Date picker (default today)
  - Parts input (comma-separated part numbers)
  - Description textarea
  - Service type dropdown (TEL / TAB / NTB / FOTO / DIAG / INE / REK / KON / DRON)
  - Test result: OK / NOK toggle
  - Button selector: [1] [2] [3] [4] — large clickable buttons
  - "Save Draft" (saves to DB only)
  - "Log to Sheet" (saves + syncs to Google Sheet)
- Messages panel: send/receive messages about this phone

### 5. Colleagues / Messages (`/messages`)
- Inbox: list of messages received
- Can send message to any colleague, optionally linked to a phone
- Unread count badge in navigation

### 6. Admin Panel (`/admin`) — admin role only
- User management (create/edit/delete employees, assign employee codes)
- View all sync logs (which entries were synced to sheet, when, by whom)
- Monthly stats per employee

---

## API Endpoints

```
POST   /api/auth/login
GET    /api/auth/me

GET    /api/phones              -- all phones (with ?assigned_to=me filter)
POST   /api/phones              -- create new phone
GET    /api/phones/:id
PATCH  /api/phones/:id          -- update status, reassign
DELETE /api/phones/:id          -- admin only

GET    /api/phones/:id/repairs
POST   /api/phones/:id/repairs  -- create repair entry
PATCH  /api/repairs/:id
DELETE /api/repairs/:id

POST   /api/repairs/:id/sync    -- sync single entry to Google Sheet

GET    /api/messages
POST   /api/messages
PATCH  /api/messages/:id/read

GET    /api/users               -- admin only
POST   /api/users               -- admin only
PATCH  /api/users/:id

GET    /api/stats/monthly       -- stats for current month
```

---

## UI/UX Details

### Status Badges (color coding)
- `in_progress` → blue
- `testing` → yellow/orange
- `completed` → green
- `on_hold` → gray

### Phone List Row Actions
- **Edit** — open detail page
- **Test OK** / **Test NOK** — quick toggle without opening detail
- **Log to Sheet** — opens modal with button 1/2/3/4 selector, then syncs
- **Take Over** — visible on All Phones page if phone belongs to someone else

### Notifications
- When a colleague sends you a message → toast notification
- When a phone you worked on gets logged to sheet → optional notification
- Use polling (every 30s) or WebSocket for real-time messages

### Form Validation
- Serial number: required, must match `^(VYK|REF|KEO|KET|BAC|BAE|BAI|BAO|BAU|BAV|BBE|MTT|NRM|PDK|POE|PPF|TNL|TTA|ZAA|ZAM|CZ)\d+$` or warn
- Parts: optional, validate each part is numeric (6 digits)
- Button: required before "Log to Sheet" is allowed
- Test result: required before "Log to Sheet" is allowed

---

## Environment Variables (`.env`)

```
DATABASE_URL=postgresql://user:pass@localhost:5432/repair_db
JWT_SECRET=your_secret_here
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
PORT=3001
```

---

## Database Migrations (run in order)

```sql
-- 1. users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  employee_code VARCHAR(10) UNIQUE, -- BAC, KEO, etc.
  role VARCHAR(20) DEFAULT 'technician',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. phones
CREATE TABLE phones (
  id SERIAL PRIMARY KEY,
  serial_number VARCHAR(50) UNIQUE NOT NULL,
  serial_prefix VARCHAR(10),
  model VARCHAR(100),
  status VARCHAR(30) DEFAULT 'in_progress',
  assigned_to INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. repair_entries
CREATE TABLE repair_entries (
  id SERIAL PRIMARY KEY,
  phone_id INTEGER REFERENCES phones(id) ON DELETE CASCADE,
  assigned_to INTEGER REFERENCES users(id),
  repair_date DATE DEFAULT CURRENT_DATE,
  parts_used TEXT,
  description TEXT,
  service_type VARCHAR(10), -- TEL, TAB, NTB, FOTO, DIAG, INE, REK, KON, DRON
  test_ok BOOLEAN DEFAULT FALSE,
  test_nok BOOLEAN DEFAULT FALSE,
  button_action INTEGER CHECK (button_action IN (1,2,3,4)),
  service_price NUMERIC(10,2),
  normo_hours NUMERIC(5,2),
  is_refurb BOOLEAN DEFAULT FALSE,
  synced_to_sheet BOOLEAN DEFAULT FALSE,
  synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. messages
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  from_user_id INTEGER REFERENCES users(id),
  to_user_id INTEGER REFERENCES users(id),
  phone_id INTEGER REFERENCES phones(id),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Project Structure

```
/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AllPhones.jsx
│   │   │   ├── PhoneDetail.jsx
│   │   │   ├── Messages.jsx
│   │   │   └── Admin.jsx
│   │   ├── components/
│   │   │   ├── PhoneTable.jsx
│   │   │   ├── RepairForm.jsx
│   │   │   ├── ButtonSelector.jsx  -- the 1/2/3/4 buttons
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   └── MessagePanel.jsx
│   │   ├── api/             # axios API calls
│   │   └── App.jsx
├── server/                  # Express backend
│   ├── routes/
│   │   ├── auth.js
│   │   ├── phones.js
│   │   ├── repairs.js
│   │   ├── messages.js
│   │   └── users.js
│   ├── services/
│   │   └── googleSheets.js  -- all Sheets API logic
│   ├── middleware/
│   │   └── auth.js          -- JWT verification
│   ├── db.js                -- PostgreSQL pool
│   └── index.js
├── .env
└── package.json
```

---

## Google Sheets Service (`server/services/googleSheets.js`)

Key function to implement:
```javascript
async function appendRepairToSheet(repairEntry, phone, user) {
  // 1. Determine sheet tab name: format current month as MMYY
  // 2. Check if tab exists; if not, duplicate VZOR tab
  // 3. Find next empty row in that tab
  // 4. Build row data matching the column structure above
  // 5. Append the row using sheets.spreadsheets.values.append
  // 6. Return success/failure
}
```

---

## Notes for Copilot

- The Google Sheet has tabs named like `0426` (April 2026), `0326` (March 2026), etc. Always write to the tab matching the repair entry's date month.
- The `VZOR` tab is a blank template — copy it when creating a new monthly tab.
- The employee codes in the statistics section of the sheet (BAC, KEO, etc.) correspond to user accounts. The sheet tracks counts per employee code.
- Buttons 1–4 are mutually exclusive per repair entry. In the sheet, only the selected button column gets a value; others stay 0.
- Test result (OK/NOK) must be set before a repair can be logged to the sheet.
- "Repas displeja" (display repair) = button 2. This is called out separately in the sheet's header as a special stat.
- The `Z` column in the sheet is a flag for scrapped/written-off phones — add a "Mark as Scrap" option in the UI that sets this.
- Part numbers are 6-digit numeric codes. Multiple parts per entry separated by `, `.
- The `Nh` (normohodiny = standard hours) value is automatically derived from the button selection (5/10/15 Nh).
