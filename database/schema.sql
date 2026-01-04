-- ============================================
-- LAUNDRY ADMIN SYSTEM - DATABASE SCHEMA
-- ============================================
-- Run this script in Supabase SQL Editor
-- This will create all tables, indexes, and policies

-- ============================================
-- 1. CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(10),
  special_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active);

-- ============================================
-- 2. SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  unit_price DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL, -- "kg", "item", "piece"
  category VARCHAR(50), -- "washing", "dry_cleaning", "ironing"
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

-- ============================================
-- 3. ORDERS TABLE
-- ============================================
CREATE SEQUENCE IF NOT EXISTS orders_seq;

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pickup_date TIMESTAMP WITH TIME ZONE,
  delivery_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, ready, completed, cancelled
  notes TEXT,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);

-- ============================================
-- 4. ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_service_id ON order_items(service_id);

-- ============================================
-- 5. PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_method VARCHAR(50), -- "cash", "transfer", "credit_card"
  status VARCHAR(50) DEFAULT 'completed', -- pending, completed, failed
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- ============================================
-- 6. EXPENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL, -- "supplies", "utilities", "staff", "maintenance"
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  expense_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - you can restrict later based on auth)
DROP POLICY IF EXISTS "Allow all access to customers" ON customers;
CREATE POLICY "Allow all access to customers" ON customers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to services" ON services;
CREATE POLICY "Allow all access to services" ON services FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to orders" ON orders;
CREATE POLICY "Allow all access to orders" ON orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to order_items" ON order_items;
CREATE POLICY "Allow all access to order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to payments" ON payments;
CREATE POLICY "Allow all access to payments" ON payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to expenses" ON expenses;
CREATE POLICY "Allow all access to expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);


-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR AS $$
DECLARE
  order_num VARCHAR;
BEGIN
  order_num := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('orders_seq')::TEXT, 4, '0');
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- SCHEMA SETUP COMPLETE
-- ============================================
-- Next step: Run seed.sql to populate with sample data
