/**
 * Database Migration Script
 * 
 * Run this script to set up the PostgreSQL database schema.
 * Usage: psql -U postgres -d repair_db -f migrations.sql
 */

-- 1. users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  employee_code VARCHAR(10) UNIQUE,
  role VARCHAR(20) DEFAULT 'technician',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. phones table
CREATE TABLE IF NOT EXISTS phones (
  id SERIAL PRIMARY KEY,
  serial_number VARCHAR(50) UNIQUE NOT NULL,
  serial_prefix VARCHAR(10),
  model VARCHAR(100),
  status VARCHAR(30) DEFAULT 'in_progress',
  assigned_to INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. repair_entries table
CREATE TABLE IF NOT EXISTS repair_entries (
  id SERIAL PRIMARY KEY,
  phone_id INTEGER REFERENCES phones(id) ON DELETE CASCADE,
  assigned_to INTEGER REFERENCES users(id),
  repair_date DATE DEFAULT CURRENT_DATE,
  parts_used TEXT,
  description TEXT,
  service_type VARCHAR(10),
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

-- 4. messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  from_user_id INTEGER REFERENCES users(id),
  to_user_id INTEGER REFERENCES users(id),
  phone_id INTEGER REFERENCES phones(id),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_phones_assigned_to ON phones(assigned_to);
CREATE INDEX IF NOT EXISTS idx_phones_serial ON phones(serial_number);
CREATE INDEX IF NOT EXISTS idx_repair_entries_phone ON repair_entries(phone_id);
CREATE INDEX IF NOT EXISTS idx_repair_entries_synced ON repair_entries(synced_to_sheet);
CREATE INDEX IF NOT EXISTS idx_messages_to_user ON messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_from_user ON messages(from_user_id);
