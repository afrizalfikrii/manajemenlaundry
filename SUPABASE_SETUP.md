# Supabase Setup Guide - Laundry Admin System

## 1. Prerequisites
- Akun Supabase (daftar di https://supabase.com)
- Project Supabase sudah dibuat
- Environment variables sudah diatur di `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  ```

## 2. Database Schema Setup

Jalankan SQL queries berikut di SQL Editor Supabase untuk membuat semua table:

### 2.1 Users Table (Customers)
```sql
CREATE TABLE customers (
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

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers(name);
```

### 2.2 Services Table
```sql
CREATE TABLE services (
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

CREATE INDEX idx_services_category ON services(category);
```

### 2.3 Orders Table
```sql
CREATE TABLE orders (
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

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
```

### 2.4 Order Items Table
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_service_id ON order_items(service_id);
```

### 2.5 Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_method VARCHAR(50), -- "cash", "transfer", "credit_card"
  status VARCHAR(50) DEFAULT 'completed', -- pending, completed, failed
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
```

### 2.6 Expenses Table
```sql
CREATE TABLE expenses (
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

CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
```

## 3. Row Level Security (RLS)

Aktifkan RLS untuk keamanan data:

```sql
-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now, restrict later based on auth)
CREATE POLICY "Allow all access to customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to services" ON services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
```

## 4. Utility Functions (Optional)

Buat fungsi untuk generate order number otomatis:

```sql
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR AS $$
DECLARE
  order_num VARCHAR;
BEGIN
  order_num := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('orders_seq')::TEXT, 4, '0');
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS orders_seq;
```

## 5. Helper Functions untuk Dashboard

```sql
-- Total revenue function
CREATE OR REPLACE FUNCTION get_total_revenue(start_date TIMESTAMP, end_date TIMESTAMP)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM payments
  WHERE payment_date BETWEEN start_date AND end_date
  AND status = 'completed';
$$ LANGUAGE SQL;

-- Active orders count
CREATE OR REPLACE FUNCTION get_active_orders_count()
RETURNS INTEGER AS $$
  SELECT COUNT(*)
  FROM orders
  WHERE status IN ('pending', 'processing', 'ready');
$$ LANGUAGE SQL;
```

## 6. Integrasi dengan Frontend Next.js

### 6.1 Setup Supabase Client

Buat file `lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 6.2 Setup Server Client (untuk Server Actions)

Buat file `lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Handle error silently
          }
        },
      },
    }
  )
}
```

### 6.3 Contoh Query - Fetch Customers

```typescript
import { supabase } from '@/lib/supabase/client'

export async function fetchCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

### 6.4 Contoh Mutation - Create Order

```typescript
export async function createOrder(orderData: {
  customer_id: string
  items: Array<{ service_id: string; quantity: number; unit_price: number }>
  notes?: string
}) {
  const orderNumber = `ORD-${Date.now()}`
  const totalAmount = orderData.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  )

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_id: orderData.customer_id,
      total_amount: totalAmount,
      notes: orderData.notes,
      status: 'pending',
    })
    .select()
    .single()

  if (orderError) throw orderError

  // Insert order items
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(
      orderData.items.map(item => ({
        order_id: order.id,
        service_id: item.service_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.quantity * item.unit_price,
      }))
    )

  if (itemsError) throw itemsError

  return order
}
```

### 6.5 Real-time Subscriptions (Optional)

```typescript
// Subscribe to order updates
export function subscribeToOrders(callback: (data: any) => void) {
  const subscription = supabase
    .from('orders')
    .on('*', (payload) => {
      callback(payload)
    })
    .subscribe()

  return subscription
}
```

## 7. Implementasi di Komponen

### Contoh: Customers List Component

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function CustomersList() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCustomers() {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error) setCustomers(data)
      setLoading(false)
    }

    loadCustomers()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {customers.map(customer => (
        <div key={customer.id}>{customer.name}</div>
      ))}
    </div>
  )
}
```

## 8. Environment Variables

Tambahkan ke `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Dapatkan dari Supabase Dashboard:
- Settings → API
- URL → copy ke `NEXT_PUBLIC_SUPABASE_URL`
- Anon public → copy ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 9. Testing

1. Buka Supabase Dashboard → SQL Editor
2. Run semua SQL queries di section 2 dan 3
3. Verify semua table sudah created
4. Buka aplikasi Next.js dan test fitur-fiturnya

## 10. Best Practices

- Selalu gunakan Row Level Security (RLS) di production
- Validate data di frontend sebelum insert ke database
- Gunakan error handling yang proper
- Cache data dengan SWR atau React Query untuk performa lebih baik
- Backup database secara berkala
- Gunakan Supabase client yang tepat (browser vs server)
