# iPhone Repair Tracking System

A full-stack web application for managing iPhone repairs, tracking parts used, and syncing data to Google Sheets. Built with React + Express + PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- PostgreSQL 12+
- npm or yarn
- Google Service Account credentials (for Sheets API)

### Installation

1. Clone the repository:
```bash
cd /Users/jankarchnak/revis2.0
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
# Create PostgreSQL database
createdb repair_db

# Run migrations
psql -U postgres -d repair_db -f server/migrations.sql
```

4. Configure environment variables:
```bash
# Copy the example .env file
cp server/.env.example server/.env

# Edit server/.env and add:
# - DATABASE_URL (your PostgreSQL connection string)
# - JWT_SECRET (generate a secure random key)
# - GOOGLE_SHEET_ID (your Google Sheet ID)
# - GOOGLE_SERVICE_ACCOUNT_JSON (your service account credentials)
```

5. Start development servers:
```bash
npm run dev
```

This starts both:
- Frontend (Vite) on http://localhost:5173
- Backend (Express) on http://localhost:3001

## 📁 Project Structure

```
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── api/             # Axios API client
│   │   ├── App.jsx          # Main app router
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Tailwind + Apple design
│   ├── index.html           # HTML template
│   ├── vite.config.js       # Vite configuration
│   └── tailwind.config.js   # Tailwind CSS config
│
├── server/                    # Express backend
│   ├── routes/              # API route handlers
│   │   ├── auth.js          # Authentication
│   │   ├── phones.js        # Phone management
│   │   ├── repairs.js       # Repair entries
│   │   ├── messages.js      # Messaging
│   │   └── users.js         # User management
│   ├── services/
│   │   └── googleSheets.js  # Google Sheets integration
│   ├── middleware/
│   │   └── auth.js          # JWT middleware
│   ├── db.js                # PostgreSQL pool
│   ├── index.js             # Express server
│   ├── migrations.sql       # Database schema
│   └── .env.example         # Example environment variables
│
├── instructions/             # Original requirements
│   ├── INSTRUCTIONS.md      # Detailed specifications
│   └── design.md            # Apple design system
│
└── package.json             # Root package.json (workspace)
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username/password
- `GET /api/auth/me` - Get current user info

### Phones
- `GET /api/phones` - List phones (optionally filtered to current user)
- `POST /api/phones` - Create new phone
- `GET /api/phones/:id` - Get phone details
- `PATCH /api/phones/:id` - Update phone status/assignment
- `DELETE /api/phones/:id` - Delete phone (admin only)

### Repairs
- `GET /api/phones/:id/repairs` - List repairs for a phone
- `POST /api/phones/:id/repairs` - Create repair entry
- `POST /api/repairs/:id/sync` - Sync repair entry to Google Sheet

### Messages
- `GET /api/messages` - Get user's messages
- `POST /api/messages` - Send message
- `PATCH /api/messages/:id/read` - Mark message as read

### Users (Admin)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user

## 🎨 Design System

This application follows Apple's design language:

- **Colors**: Apple Blue (#0071e3), Black/White backgrounds, Dark surfaces
- **Typography**: SF Pro Display/Text with optical sizing
- **Components**: Minimalist cards, glass-effect navigation
- **Spacing**: 8px base unit with generous whitespace

See `instructions/design.md` for the complete design specification.

## 🔑 Key Features

### For Technicians
- Personal dashboard showing assigned phones
- Create and manage repair entries
- Quick buttons (1-4) for repair classification
- Test result tracking (OK/NOK)
- Message colleagues about repairs

### For Admin
- User management and employee code assignment
- View all phones and technician assignments
- Monthly statistics and sync logs
- Reassign phones between technicians

### System Integration
- Automatic Google Sheets sync with monthly tabs
- Part number tracking and validation
- Repair history and timeline
- Employee code integration for sheet reporting

## 📊 Database Schema

### Users
- id, name, username, password_hash, employee_code, role, created_at

### Phones
- id, serial_number, serial_prefix, model, status, assigned_to, created_at, updated_at

### Repair Entries
- id, phone_id, assigned_to, repair_date, parts_used, description, service_type
- test_ok, test_nok, button_action, service_price, normo_hours, is_refurb
- synced_to_sheet, synced_at, created_at

### Messages
- id, from_user_id, to_user_id, phone_id, message, read, created_at

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Setup
Update `.env` with production values:
- Secure PostgreSQL credentials
- Strong JWT_SECRET
- Production Google Sheets service account
- Correct PORT

### Running in Production
```bash
# Client is static, serve from web server
# Server
npm start
```

## 📝 Developer Notes

### Serial Number Formats
- `VYK###` - Standard service phones
- `REF###` - Refurbished phones
- `KEO/KET/BAC/...` - Customer phones (employee codes)

### Button Actions
1. **Button 1**: Basic repair (5 Nh)
2. **Button 2**: Display repair (10 Nh)
3. **Button 3**: Housing replacement (15 Nh)
4. **Button 4**: Complex refurbishment (15 Nh)

### Google Sheets Integration
- Monthly tabs named `MMYY` (e.g., `0426` for April 2026)
- Duplicates from `VZOR` template tab
- Service account credentials required
- Automatic tab creation on first entry

## 🐛 Troubleshooting

### Database Connection Error
- Check PostgreSQL is running: `brew services list` (macOS)
- Verify DATABASE_URL in `.env`
- Create database: `createdb repair_db`

### Google Sheets Sync Not Working
- Verify GOOGLE_SERVICE_ACCOUNT_JSON is valid JSON
- Check GOOGLE_SHEET_ID is correct
- Service account must have edit access to spreadsheet

### Port Already in Use
- Backend: Change PORT in `.env`
- Frontend: Vite will auto-select next available port

## 📧 Support

For issues or questions, refer to `instructions/INSTRUCTIONS.md` for detailed specifications.
