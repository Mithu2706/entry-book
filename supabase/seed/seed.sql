-- ============================================
-- Entry Book - Seed Data
-- ============================================
-- This file creates demo data for testing.
-- Run AFTER creating an admin user via Supabase Auth.
--
-- INSTRUCTIONS:
-- 1. Create an admin user in Supabase Dashboard > Authentication
--    Email: admin@entrybook.com, Password: Admin123!
-- 2. Get the user's UUID from the auth.users table
-- 3. Replace 'YOUR_ADMIN_USER_ID' below with the actual UUID
-- 4. Run this SQL in the Supabase SQL Editor
-- ============================================

-- First, update the admin user's profile role
-- Replace the email below with your admin user's email
UPDATE profiles SET role = 'admin' WHERE email = 'nithishkarthick2412@gmail.com';

-- Create a regular user profile for testing (optional)
-- Do this by signing up a user via the app first, then these entries can be attributed

-- Insert demo entries
-- Note: subtotal, discount_amount, and final_amount are generated columns
-- so we don't include them in the INSERT
INSERT INTO entries (name, entry_date, product, quantity, price, discount_percent, created_by) VALUES
  ('Mithu', '2026-10-01', 'Widget A', 10, 250.00, 5, (SELECT id FROM profiles WHERE email = 'nithishkarthick2412@gmail.com')),
  ('Mithu', '2026-10-01', 'Widget B', 5, 500.00, 10, (SELECT id FROM profiles WHERE email = 'nithishkarthick2412@gmail.com')),
  ('Nithish', '2026-10-02', 'Gadget Pro', 3, 1500.00, 0, (SELECT id FROM profiles WHERE email = 'nithishkarthick2412@gmail.com')),
  ('Nithish', '2026-10-02', 'Widget A', 20, 250.00, 15, (SELECT id FROM profiles WHERE email = 'nithishkarthick2412@gmail.com')),
  ('Ravi', '2026-10-03', 'Gadget Pro', 1, 1500.00, 5, (SELECT id FROM profiles WHERE email = 'nithishkarthick2412@gmail.com')),
  ('Ravi', '2026-10-03', 'Widget C', 8, 350.00, 0, (SELECT id FROM profiles WHERE email = 'nithishkarthick2412@gmail.com')),
  ('Priya', '2026-10-04', 'Widget A', 15, 250.00, 10, (SELECT id FROM profiles WHERE email = 'nithishkarthick2412@gmail.com')),
  ('Priya', '2026-10-04', 'Gadget Lite', 4, 800.00, 20, (SELECT id FROM profiles WHERE email = 'nithishkarthick2412@gmail.com')),
  ('Mithu', '2026-10-05', 'Widget C', 6, 350.00, 0, (SELECT id FROM profiles WHERE email = 'nithishkarthick2412@gmail.com')),
  ('Kumar', '2026-10-05', 'Gadget Pro', 2, 1500.00, 10, (SELECT id FROM profiles WHERE email = 'nithishkarthick2412@gmail.com')),
  ('Kumar', '2026-10-06', 'Widget B', 12, 500.00, 5, (SELECT id FROM profiles WHERE email = 'nithishkarthick2412@gmail.com')),
  ('Nithish', '2026-10-06', 'Gadget Lite', 7, 800.00, 15, (SELECT id FROM profiles WHERE email = 'nithishkarthick2412@gmail.com')),
  ('Mithu', '2026-10-07', 'Widget A', 25, 250.00, 8, (SELECT id FROM profiles WHERE email = 'nithishkarthick2412@gmail.com')),
  ('Priya', '2026-10-07', 'Widget B', 3, 500.00, 0, (SELECT id FROM profiles WHERE email = 'nithishkarthick2412@gmail.com')),
  ('Ravi', '2026-10-07', 'Gadget Pro', 5, 1500.00, 12, (SELECT id FROM profiles WHERE email = 'nithishkarthick2412@gmail.com'));
