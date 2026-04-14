# Quick Start Guide - iPhone Repair Tracking System

## 1. Initialize Environment

```bash
# Navigate to project
cd /Users/jankarchnak/revis2.0

# Install dependencies
npm install

# Create PostgreSQL database
createdb repair_db

# Run database migrations
psql -U postgres -d repair_db -f server/migrations.sql
```

## 2. Configure Environment

```bash
# Copy and edit the environment file
cp server/.env.example server/.env
```

Edit `server/.env` with your values:

```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/repair_db
JWT_SECRET=your_super_secret_key_here_min_32_chars
GOOGLE_SHEET_ID=1a2b3c4d5e6f...
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
PORT=3001
```

## 3. Create Initial Admin User (Optional, for testing)

```bash
# Connect to PostgreSQL and create test user:
psql -U postgres -d repair_db

-- Inside psql:
INSERT INTO users (name, username, password_hash, role, employee_code)
VALUES (
  'Admin User',
  'admin',
  '$2b$10$...',  -- bcrypt hash of your password
  'admin',
  'ADM'
);
```

To generate bcrypt hash, use Node.js:
```bash
node -e "require('bcryptjs').hash('yourpassword', 10, (e,h) => console.log(h))"
```

## 4. Start Development Servers

```bash
npm run dev
```

This starts:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api

## 5. Test the Application

1. Open http://localhost:5173/login
2. Login with your created credentials
3. Navigate to dashboard
4. Create a test phone entry

## 📚 Key Resources

- Full setup instructions: See README.md
- API documentation: See server/index.js
- Database schema: server/migrations.sql
- Design guidelines: instructions/design.md
- Complete specifications: instructions/INSTRUCTIONS.md

## 🔍 Common Issues

### "Database connection error"
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify database exists: `createdb repair_db`

### "Port already in use"
- Change PORT in .env file
- Kill existing process: `lsof -i :3001` then `kill -9 <PID>`

### "Module not found errors"
- Ensure `npm install` was completed in both root and subdirectories
- Try: `npm install --workspace=client && npm install --workspace=server`

### "Google Sheets sync not working"
- Verify credentials JSON is valid
- Check Sheet ID is correct
- Ensure service account has editor access

## 📝 Next Steps

1. Review the complete technical specification: `instructions/INSTRUCTIONS.md`
2. Set up Google Sheets API credentials
3. Create user accounts for technicians
4. Configure employee codes
5. Set up monthly tabs template in Google Sheets

---

**For development support**: Reference the detailed specifications in the `/instructions` folder.
