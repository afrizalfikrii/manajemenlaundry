-- ============================================
-- LAUNDRY ADMIN SYSTEM - SEED DATA
-- ============================================
-- Run this script AFTER schema.sql
-- This will populate the database with sample data for testing

-- ============================================
-- 1. SAMPLE CUSTOMERS
-- ============================================
INSERT INTO customers (name, phone, email, address, city, postal_code, special_notes, is_active) VALUES
('Budi Santoso', '081234567890', 'budi@email.com', 'Jl. Merdeka No. 123', 'Jakarta', '12345', 'Alergi detergen wangi', true),
('Siti Nurhaliza', '081234567891', 'siti@email.com', 'Jl. Sudirman No. 45', 'Jakarta', '12346', NULL, true),
('Ahmad Dahlan', '081234567892', 'ahmad@email.com', 'Jl. Gatot Subroto No. 78', 'Bandung', '40123', 'Pisahkan pakaian putih', true),
('Dewi Lestari', '081234567893', 'dewi@email.com', 'Jl. Asia Afrika No. 90', 'Bandung', '40124', NULL, true),
('Eko Prasetyo', '081234567894', 'eko@email.com', 'Jl. Diponegoro No. 12', 'Surabaya', '60234', NULL, true),
('Fitri Handayani', '081234567895', 'fitri@email.com', 'Jl. Pemuda No. 56', 'Surabaya', '60235', 'Cuci dengan air dingin', true),
('Gunawan Wijaya', '081234567896', 'gunawan@email.com', 'Jl. Malioboro No. 34', 'Yogyakarta', '55271', NULL, true),
('Hani Kusuma', '081234567897', 'hani@email.com', 'Jl. Solo No. 67', 'Yogyakarta', '55272', NULL, true),
('Irfan Hakim', '081234567898', 'irfan@email.com', 'Jl. Raya Bogor No. 89', 'Bogor', '16151', NULL, true),
('Julia Perez', '081234567899', 'julia@email.com', 'Jl. Pajajaran No. 23', 'Bogor', '16152', 'Setrika rapi', true);

-- ============================================
-- 2. SAMPLE SERVICES
-- ============================================
INSERT INTO services (name, description, unit_price, unit, category, is_active) VALUES
('Cuci Kering Reguler', 'Cuci dan kering standar, selesai 2 hari', 8000, 'kg', 'washing', true),
('Cuci Kering Express', 'Cuci dan kering cepat, selesai 1 hari', 12000, 'kg', 'washing', true),
('Cuci Setrika Reguler', 'Cuci, kering, dan setrika standar, selesai 3 hari', 10000, 'kg', 'washing', true),
('Cuci Setrika Express', 'Cuci, kering, dan setrika cepat, selesai 1 hari', 15000, 'kg', 'washing', true),
('Setrika Saja', 'Hanya setrika, selesai 1 hari', 5000, 'kg', 'ironing', true),
('Dry Cleaning Jas', 'Dry cleaning untuk jas/blazer', 35000, 'item', 'dry_cleaning', true),
('Dry Cleaning Gaun', 'Dry cleaning untuk gaun/dress', 40000, 'item', 'dry_cleaning', true),
('Cuci Sepatu', 'Cuci sepatu mendalam', 25000, 'item', 'washing', true),
('Cuci Boneka', 'Cuci boneka ukuran sedang', 20000, 'item', 'washing', true),
('Cuci Karpet', 'Cuci karpet per meter persegi', 15000, 'piece', 'washing', true);

-- ============================================
-- 3. SAMPLE ORDERS
-- ============================================
-- Get customer IDs for reference
DO $$
DECLARE
  customer1_id UUID;
  customer2_id UUID;
  customer3_id UUID;
  customer4_id UUID;
  customer5_id UUID;
  
  service1_id UUID;
  service2_id UUID;
  service3_id UUID;
  service4_id UUID;
  service5_id UUID;
  service6_id UUID;
  
  order1_id UUID;
  order2_id UUID;
  order3_id UUID;
  order4_id UUID;
  order5_id UUID;
BEGIN
  -- Get customer IDs
  SELECT id INTO customer1_id FROM customers WHERE phone = '081234567890';
  SELECT id INTO customer2_id FROM customers WHERE phone = '081234567891';
  SELECT id INTO customer3_id FROM customers WHERE phone = '081234567892';
  SELECT id INTO customer4_id FROM customers WHERE phone = '081234567893';
  SELECT id INTO customer5_id FROM customers WHERE phone = '081234567894';
  
  -- Get service IDs
  SELECT id INTO service1_id FROM services WHERE name = 'Cuci Kering Reguler';
  SELECT id INTO service2_id FROM services WHERE name = 'Cuci Setrika Express';
  SELECT id INTO service3_id FROM services WHERE name = 'Dry Cleaning Jas';
  SELECT id INTO service4_id FROM services WHERE name = 'Setrika Saja';
  SELECT id INTO service5_id FROM services WHERE name = 'Cuci Sepatu';
  SELECT id INTO service6_id FROM services WHERE name = 'Cuci Kering Express';
  
  -- Order 1: Completed order
  INSERT INTO orders (order_number, customer_id, order_date, pickup_date, delivery_date, status, total_amount, paid_amount, notes)
  VALUES ('ORD-20241220-0001', customer1_id, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '4 days', 'completed', 80000, 80000, 'Pakaian sehari-hari')
  RETURNING id INTO order1_id;
  
  INSERT INTO order_items (order_id, service_id, quantity, unit_price, subtotal)
  VALUES (order1_id, service1_id, 10, 8000, 80000);
  
  INSERT INTO payments (order_id, amount, payment_date, payment_method, status)
  VALUES (order1_id, 80000, NOW() - INTERVAL '4 days', 'cash', 'completed');
  
  -- Order 2: Processing order
  INSERT INTO orders (order_number, customer_id, order_date, pickup_date, status, total_amount, paid_amount, notes)
  VALUES ('ORD-20241225-0002', customer2_id, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 'processing', 150000, 0, 'Cuci express untuk acara')
  RETURNING id INTO order2_id;
  
  INSERT INTO order_items (order_id, service_id, quantity, unit_price, subtotal)
  VALUES (order2_id, service2_id, 10, 12000, 120000);
  
  INSERT INTO order_items (order_id, service_id, quantity, unit_price, subtotal)
  VALUES (order2_id, service3_id, 1, 35000, 35000);
  
  -- Order 3: Ready for pickup
  INSERT INTO orders (order_number, customer_id, order_date, pickup_date, delivery_date, status, total_amount, paid_amount)
  VALUES ('ORD-20241226-0003', customer3_id, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NOW(), 'ready', 100000, 50000)
  RETURNING id INTO order3_id;
  
  INSERT INTO order_items (order_id, service_id, quantity, unit_price, subtotal)
  VALUES (order3_id, service1_id, 5, 8000, 40000);
  
  INSERT INTO order_items (order_id, service_id, quantity, unit_price, subtotal)
  VALUES (order3_id, service4_id, 12, 5000, 60000);
  
  INSERT INTO payments (order_id, amount, payment_date, payment_method, status)
  VALUES (order3_id, 50000, NOW() - INTERVAL '1 day', 'transfer', 'completed');
  
  -- Order 4: Pending order
  INSERT INTO orders (order_number, customer_id, order_date, status, total_amount, paid_amount, notes)
  VALUES ('ORD-20241227-0004', customer4_id, NOW() - INTERVAL '1 day', 'pending', 75000, 0, 'Cuci sepatu dan setrika')
  RETURNING id INTO order4_id;
  
  INSERT INTO order_items (order_id, service_id, quantity, unit_price, subtotal)
  VALUES (order4_id, service5_id, 2, 25000, 50000);
  
  INSERT INTO order_items (order_id, service_id, quantity, unit_price, subtotal)
  VALUES (order4_id, service4_id, 5, 5000, 25000);
  
  -- Order 5: Today's order
  INSERT INTO orders (order_number, customer_id, order_date, status, total_amount, paid_amount, notes)
  VALUES ('ORD-20241228-0005', customer5_id, NOW(), 'pending', 120000, 0, 'Cuci kilat untuk besok')
  RETURNING id INTO order5_id;
  
  INSERT INTO order_items (order_id, service_id, quantity, unit_price, subtotal)
  VALUES (order5_id, service6_id, 10, 12000, 120000);
  
  -- Additional completed orders for revenue data
  INSERT INTO orders (order_number, customer_id, order_date, delivery_date, status, total_amount, paid_amount)
  VALUES 
    ('ORD-20241215-0006', customer1_id, NOW() - INTERVAL '13 days', NOW() - INTERVAL '11 days', 'completed', 90000, 90000),
    ('ORD-20241218-0007', customer2_id, NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days', 'completed', 120000, 120000),
    ('ORD-20241221-0008', customer3_id, NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days', 'completed', 150000, 150000),
    ('ORD-20241223-0009', customer4_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days', 'completed', 80000, 80000),
    ('ORD-20241224-0010', customer5_id, NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days', 'completed', 100000, 100000);
  
  -- Add payments for completed orders
  INSERT INTO payments (order_id, amount, payment_date, payment_method, status)
  SELECT id, total_amount, delivery_date, 'cash', 'completed'
  FROM orders
  WHERE order_number IN ('ORD-20241215-0006', 'ORD-20241218-0007', 'ORD-20241221-0008', 'ORD-20241223-0009', 'ORD-20241224-0010');
  
END $$;

-- ============================================
-- 4. SAMPLE EXPENSES
-- ============================================
INSERT INTO expenses (category, description, amount, expense_date, payment_method, notes) VALUES
('supplies', 'Pembelian detergen 10kg', 250000, NOW() - INTERVAL '5 days', 'cash', 'Detergen merk ABC'),
('supplies', 'Pembelian pewangi pakaian', 150000, NOW() - INTERVAL '5 days', 'cash', NULL),
('utilities', 'Tagihan listrik bulan ini', 800000, NOW() - INTERVAL '3 days', 'transfer', 'PLN'),
('utilities', 'Tagihan air bulan ini', 200000, NOW() - INTERVAL '3 days', 'transfer', 'PDAM'),
('staff', 'Gaji karyawan - Rina', 3000000, NOW() - INTERVAL '2 days', 'transfer', 'Gaji bulan Desember'),
('staff', 'Gaji karyawan - Tono', 3000000, NOW() - INTERVAL '2 days', 'transfer', 'Gaji bulan Desember'),
('maintenance', 'Service mesin cuci', 500000, NOW() - INTERVAL '7 days', 'cash', 'Ganti bearing'),
('supplies', 'Plastik kemasan 1 roll', 100000, NOW() - INTERVAL '1 day', 'cash', NULL),
('utilities', 'Pulsa internet', 300000, NOW() - INTERVAL '4 days', 'transfer', 'Indihome'),
('maintenance', 'Beli setrika baru', 350000, NOW() - INTERVAL '6 days', 'cash', 'Setrika merk XYZ');

-- ============================================
-- SEED DATA COMPLETE
-- ============================================
-- You can now test the application with this sample data
