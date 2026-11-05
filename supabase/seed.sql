-- ====================================================================
-- KABADIWALA CONNECT - INITIAL SEED DATA
-- Primary Database: Supabase PostgreSQL
-- ====================================================================

-- 1. Profiles
INSERT INTO profiles (id, auth_user_id, full_name, email, phone, role, preferred_language, account_status)
VALUES 
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Dr. Anand Kulkarni', 'admin@kabadiwalaconnect.org', '+91 98220 11223', 'admin', 'en', 'active'),
('a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Rameshwar Pawar', 'ramesh.pawar@example.com', '+91 98231 44556', 'collector', 'mr', 'active'),
('a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'Santosh Yadav', 'santosh.yadav@example.com', '+91 97654 33221', 'collector', 'hi', 'active'),
('a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'Ganesh Shinde', 'ganesh.shinde@example.com', '+91 99221 88776', 'collector', 'mr', 'active'),
('a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'Sunita Bai Kamble', 'sunita.kamble@example.com', '+91 96543 22110', 'collector', 'mr', 'active'),
('a0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', 'Mohammad Rafiq Ansari', 'rafiq.ansari@example.com', '+91 91345 67890', 'collector', 'hi', 'active'),
('a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', 'Vikramaditya Singhania', 'vikram@greenearthsmelters.in', '+91 98210 55667', 'recycler', 'en', 'active'),
('a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000008', 'Pradeep Deshmukh', 'pune.polymers@ecorecycle.com', '+91 98500 44332', 'recycler', 'mr', 'active'),
('a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000009', 'Nitin Agarwal', 'nitin@sahyadripulp.co.in', '+91 99700 88112', 'recycler', 'en', 'active'),
('a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000010', 'Farhan Sheikh', 'farhan@apexewasterecycling.in', '+91 98900 77221', 'recycler', 'hi', 'active'),
('a0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000011', 'Ajay Kadam', 'ajay@maharashtrabatteries.org', '+91 94220 99331', 'recycler', 'mr', 'active');

-- 2. Collectors
INSERT INTO collectors (id, profile_id, address, city, state, pin_code, latitude, longitude)
VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Ganesh Nagar, Bhavani Peth', 'Pune', 'Maharashtra', '411042', 18.5089, 73.8722),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', '90 Feet Road, Dharavi', 'Mumbai', 'Maharashtra', '400017', 19.0434, 72.8567),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'Khadki Bazar, Railway Line', 'Pune', 'Maharashtra', '411003', 18.5626, 73.8341),
('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', 'Bhim Nagar, Rabodi, Thane West', 'Thane', 'Maharashtra', '400601', 19.2012, 72.9781),
('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000006', 'Itwari Metal Market', 'Nagpur', 'Maharashtra', '440002', 21.1498, 79.1121);

-- 3. Recyclers
INSERT INTO recyclers (id, profile_id, business_name, owner_name, address, city, state, pin_code, verification_status, gst_number)
VALUES
('r0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000007', 'GreenEarth Metal Smelters Pvt Ltd', 'Vikramaditya Singhania', 'Plot B-44, MIDC Bhosari', 'Pune', 'Maharashtra', '411026', 'approved', '27AABCG1234F1Z8'),
('r0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000008', 'Pune Polymers & Granules LLP', 'Pradeep Deshmukh', 'Survey 112, Uruli Devachi', 'Pune', 'Maharashtra', '412308', 'approved', '27AADCP8876K1ZQ'),
('r0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000009', 'Sahyadri Paper & Board Mills', 'Nitin Agarwal', 'Chakan MIDC Phase 2', 'Pune', 'Maharashtra', '410501', 'pending', '27AAACS4321E1Z3'),
('r0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000010', 'Apex Circular E-Waste Hub', 'Farhan Sheikh', 'Taloja MIDC Estate', 'Navi Mumbai', 'Maharashtra', '410208', 'approved', '27AACEA5544J1ZN'),
('r0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000011', 'Maha Battery Smelting Works', 'Ajay Kadam', 'Shiroli MIDC', 'Kolhapur', 'Maharashtra', '416122', 'requires_info', '27AAFFM9911D1ZX');

-- 4. Materials (12 Standard Categories)
INSERT INTO materials (id, name, category, subtype, unit, description, indicative_price, is_active)
VALUES
('m0000000-0000-0000-0000-000000000001', 'Iron & Heavy Scrap (लोहा)', 'Metals', 'Cast Iron & Structural Rods', 'kg', 'Heavy structural scrap and cast engine blocks', 38.50, true),
('m0000000-0000-0000-0000-000000000002', 'Mild Steel (स्टील पत्री व रॉड)', 'Metals', 'CRC Sheets & Rebar', 'kg', 'Clean MS sheet offcuts and punchings', 42.00, true),
('m0000000-0000-0000-0000-000000000003', 'Aluminum Extrusions (ॲल्युमिनियम)', 'Metals', 'Window Sections & Alloy Wheels', 'kg', '6063 clean architectural sections', 185.00, true),
('m0000000-0000-0000-0000-000000000004', 'Pure Copper Wire (तांबे)', 'Metals', 'Millberry 99.9% Bright Wire', 'kg', 'Stripped transformer coils & motor windings', 745.00, true),
('m0000000-0000-0000-0000-000000000005', 'Brass Honey & Utensils (पितळ)', 'Metals', 'Plumbing Valves & Radiators', 'kg', 'Yellow brass scrap & pipe valves', 490.00, true),
('m0000000-0000-0000-0000-000000000006', 'High-Density Polyethylene - HDPE (कडक प्लास्टिक)', 'Plastics', 'Drums & Pipe Offcuts', 'kg', 'Blow-molded chemical drums & conduits', 54.00, true),
('m0000000-0000-0000-0000-000000000007', 'Clear PET Bottles (पाण्याच्या बाटल्या)', 'Plastics', 'Clean Baled Transparent Bottles', 'kg', 'Post-consumer soda & water bottles', 36.50, true),
('m0000000-0000-0000-0000-000000000008', 'Corrugated Cardboard - OCC (पुठ्ठा)', 'Paper & Cardboard', 'Kraft Fluted Packaging Boxes', 'kg', 'Clean grocery cartons and kraft boxes', 14.50, true),
('m0000000-0000-0000-0000-000000000009', 'Glass Bottles & Cullet (काचेच्या बाटल्या)', 'Glass', 'Flint Clear & Amber Bottles', 'kg', 'Segregated soda and beer glass bottles', 4.50, true),
('m0000000-0000-0000-0000-000000000010', 'Mixed E-Waste (इ-कचरा)', 'E-Waste', 'Appliances & Inverters', 'kg', 'Decommissioned UPS units and monitors', 68.00, true),
('m0000000-0000-0000-0000-000000000011', 'Printed Circuit Boards - PCB (मदरबोर्ड)', 'E-Waste', 'Green Motherboards & Gold Fingers', 'kg', 'High-yield server and PC circuit boards', 320.00, true),
('m0000000-0000-0000-0000-000000000012', 'Lead-Acid Batteries (जुनी बॅटरी)', 'Batteries', 'Automotive & Inverter Cells', 'kg', 'Unbroken automotive & solar backup batteries', 92.00, true);
