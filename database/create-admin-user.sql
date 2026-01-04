-- Create test admin user for development
-- Run this in Supabase SQL Editor

-- Note: Supabase Auth handles user creation
-- You can create users via Supabase Dashboard:
-- 1. Go to Authentication → Users
-- 2. Click "Add User"
-- 3. Enter email and password
-- 4. Click "Create User"

-- Alternatively, you can use this SQL to create a user programmatically:
-- (This requires admin privileges)

/*
Example credentials for testing:
Email: admin@laundry.com
Password: admin123

To create via Dashboard:
1. Open Supabase Dashboard
2. Go to Authentication → Users
3. Click "Add User"
4. Email: admin@laundry.com
5. Password: admin123
6. Email Confirm: ON (or OFF for testing)
7. Click "Create User"
*/

-- If you want to create via SQL (advanced):
-- Note: This is not recommended for production
-- Use Supabase Dashboard instead

-- For testing purposes, you can also use Supabase CLI:
-- supabase auth users create admin@laundry.com --password admin123
