-- MediFinder — run in Supabase SQL Editor (once) if tables are missing.
-- Aligns with the Node API. Uses public schema.

CREATE TABLE IF NOT EXISTS insurance_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pharmacies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  delivery BOOLEAN NOT NULL DEFAULT FALSE,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medicines (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  strength TEXT,
  requires_prescription BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pharmacy_stocks (
  id SERIAL PRIMARY KEY,
  pharmacy_id TEXT NOT NULL REFERENCES pharmacies (id) ON DELETE CASCADE,
  medicine_id INTEGER NOT NULL REFERENCES medicines (id) ON DELETE CASCADE,
  price_rwf DOUBLE PRECISION NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  UNIQUE (pharmacy_id, medicine_id)
);

CREATE TABLE IF NOT EXISTS pharmacy_insurance (
  id SERIAL PRIMARY KEY,
  pharmacy_id TEXT NOT NULL REFERENCES pharmacies (id) ON DELETE CASCADE,
  insurance_id INTEGER NOT NULL REFERENCES insurance_types (id) ON DELETE CASCADE,
  UNIQUE (pharmacy_id, insurance_id)
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  pharmacy_id TEXT REFERENCES pharmacies (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  pharmacy_id TEXT NOT NULL REFERENCES pharmacies (id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  total_rwf DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  prescription_status TEXT DEFAULT 'pending',
  prescription_file TEXT,
  delivery BOOLEAN NOT NULL DEFAULT FALSE,
  delivery_address TEXT,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  payment_phone TEXT,
  payment_proof TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  insurance_provider TEXT,
  insurance_status TEXT NOT NULL DEFAULT 'not_required',
  insurance_documents TEXT,
  coverage_percent INTEGER,
  discount_rwf DOUBLE PRECISION NOT NULL DEFAULT 0,
  final_total_rwf DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  medicine_id INTEGER NOT NULL REFERENCES medicines (id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price_rwf DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_email TEXT,
  pharmacy_id TEXT,
  role_target TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pharmacies_sector ON pharmacies (sector);
CREATE INDEX IF NOT EXISTS idx_pharmacy_stocks_pharmacy ON pharmacy_stocks (pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_stocks_medicine ON pharmacy_stocks (medicine_id);
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines (name);
CREATE INDEX IF NOT EXISTS idx_users_pharmacy ON users (pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_orders_pharmacy ON orders (pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_pharmacy ON notifications (pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_email ON notifications (user_email);
