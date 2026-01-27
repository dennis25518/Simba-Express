-- ============================================
-- CLEAR OLD PRODUCTS AND INSERT 44 WITH DESCRIPTIONS
-- ============================================
-- Run this SQL script in Supabase SQL Editor

-- Step 1: Add 'desc' column if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS "desc" TEXT;

-- Step 2: Clear existing products
TRUNCATE TABLE products;

-- Step 3: Insert all 44 products WITH descriptions
INSERT INTO products ("id", "brand", "name", "price", "category", "desc", "img") VALUES

-- Nafaka na Chakula (Food & Grains)
('AS-01', 'Asas', 'Maziwa ya Asas', 16000, 'Maziwa', 'Boxi la Maziwa ya Asas.', 'grain/ASAS_MILK-removebg.png'),
('Az-011', 'Azam', 'Nazi ya Azam', 30000, 'Vyakula', 'Boxi ya Nazi ya Azam', 'grain/AZAM_COCONUT_CREAM-removebg.png'),
('Az-012', 'Azam', 'Bisuit za Azam', 15000, 'Vyakula', 'Boxi la Biscuit za Azam', 'grain/AZAM-MARIE-GINGER-removebg.png'),
('Az-013', 'Azam', 'Unga wa PPf', 21500, 'Unga', 'Unga wa PPF - 1', 'grain/Azam-PPF-1.png'),
('Kr-10', 'Korie', 'Mafuta ya Korie', 29500, 'Vyakula', 'Mafuta ya kula ya lita 1', 'grain/Korie Cooking Oil 900Ml.webp'),
('Kr-11', 'Korie', 'Mafuta ya Korie', 39000, 'Vyakula', 'Mafuta ya kula ya lita 20', 'grain/Korie Cooking.webp'),
('S-10', 'Singida', 'Mafuta ya Kula', 30900, 'Vyakula', 'Mafuta ya kula ya lita 5', 'grain/SINGIDA_COOKING_OIL-removebg.png'),
('Mo-10', 'Mo', 'Tambi za Mo', 23000, 'Vyakula', 'Boxi La Tambi za Mo', 'grain/mospagheti-removebg.png'),
('Rg-10', 'Redgold', 'Redgold Tomato Sauce', 16000, 'Vyakula', 'Boxi la Redgold Tomato Sauce', 'grain/tomatopaste70g-removebg.png'),
('Rg-11', 'Redgold', 'Redgold Tomato Paste', 13500, 'Vyakula', 'Boxi la Redgold Tomato Paste', 'grain/redgold-tomato-removebg.png'),
('S-11', 'Singida', 'Mafuta ya Kula Lite', 15000, 'Vyakula', 'Mafuta ya kula ya lita 5', 'oil/SINGIDA COOKING OIL.jpg'),
('S-12', 'Singida', 'Mafuta ya Kula Pro', 15000, 'Vyakula', 'Mafuta ya kula ya lita 5', 'oil/SINGIDA COOKING OIL.jpg'),
('S-13', 'Singida', 'Mafuta ya Kula Plus', 15000, 'Vyakula', 'Mafuta ya kula ya lita 5', 'oil/SINGIDA COOKING OIL.jpg'),
('S-14', 'Singida', 'Mafuta ya Kula Premium', 15000, 'Vyakula', 'Mafuta ya kula ya lita 5', 'oil/SINGIDA COOKING OIL.jpg'),
('MO-01', 'METL', 'Mo Cola', 4700, 'Vinywaji', 'Katoni ya Soda ya Mo Cola. Ujazo 300Ml. Idadi 12', 'drinks/mocola-1-removebg-preview.png'),
('MO-02', 'METL', 'Mo xtra', 4800, 'Vinywaji', 'Katoni ya Energy drink ya Mo. Ujazo 300Ml. Idadi 12', 'drinks/moextra1-removebg.png'),
('MO-03', 'METL', 'Mo Chungwa', 4600, 'Vinywaji', 'Katoni ya Juisi ya Mo Chungwa. Ujazo 300Ml. Idadi 12', 'drinks/moorange-removebg.png'),
('MO-04', 'METL', 'Mo Passion', 4800, 'Vinywaji', 'Katoni ya Juisi ya Mo Passion. Ujazo 300Ml. Idadi 12', 'drinks/mopassion-removebg.png'),
('Az-01', 'Azam', 'Azam Cola', 9400, 'Pipi', 'Azam Cola - Soda drink. Ujazo 300Ml. Idadi 12', 'drinks/AZAM-COLA-CROPPED.png'),
('Az-02', 'Azam', 'Azam Energy', 11950, 'Vinywaji', 'Katoni ya Juisi ya Azam Energy. Ujazo 300Ml. Idadi 12', 'drinks/azam_energy-removebg.png'),
('Az-03', 'Azam', 'Azam Apple Punch', 9500, 'Vinywaji', 'Katoni ya juisi ya Apple Punch. Ujazo 300Ml. Idadi 12', 'drinks/Azam-Apple-Punch-300ml-removebg.png'),
('Az-04', 'Azam', 'Azam Embe', 10700, 'Vinywaji', 'Katoni ya juisi ya Azam Embe. Ujazo 300Ml. Idadi 12', 'drinks/Azam-Mango-1Litre-removebg.png'),
('Az-05', 'Azam', 'Azam Max', 9500, 'Vinywaji', 'Katoni ya juisi ya Azam Max. Ujazo 300Ml. Idadi 12', 'drinks/AZAM-MAX2.png'),
('Az-06', 'Azam', 'Azam Swiss', 9500, 'Vinywaji', 'Katoni ya juisi ya Azam Swiss. Ujazo 300Ml. Idadi 12', 'drinks/Swiss-New-removebg.png'),
('AF-01', 'Afia', 'Afiya Strawberry', 4600, 'Vinywaji', 'Katoni ya juisi ya Afiya Nyeusi. Ujazo 300Ml. Idadi 12', 'drinks/afyablack-removebg.png'),
('AF-02', 'Afiya', 'Afiya Orange', 4600, 'Vinywaji', 'Katoni ya juisi ya Afiya Orange. Ujazo 300Ml. Idadi 12', 'drinks/afyaorange-removebg.png'),
('AF-03', 'Afiya', 'Afiya Passion', 4600, 'Vinywaji', 'Katoni ya juisi ya Afiya Passion. Ujazo 300Ml. Idadi 12', 'drinks/afyapasion-removebg.png'),
('AF-04', 'Afiya', 'Afiya Malta', 4600, 'Vinywaji', 'Katoni ya juisi ya Afiya Malta. Ujazo 300Ml. Idadi 12', 'drinks/afyamalta-removebg.png'),
('AF-05', 'Afiya', 'Afiya Pineapple', 4600, 'Vinywaji', 'Katoni ya juisi ya Afiya Pineapple. Ujazo 300Ml. Idadi 12', 'drinks/afiyapineapple-removebg.png'),
('SH-09', 'Shwari', 'Shwari Toilet Paper', 10000, 'Usafi', 'Box la toilet paper za shwari.', 'other/SHWARI_TOILET_PAPER-removebg.png'),
('Mo-01-s', 'Mo', 'Mo Taifa Blue', 10000, 'Usafi', 'Box la Sabuni za Mo za Unga.', 'other/motaifablue-removebg.png'),
('Mo-02-s', 'Mo', 'Mo Taifa Yellow', 10000, 'Usafi', 'Box la Sabuni za Mo za Unga.', 'other/motaifayellow-removebg.png'),
('Mo-03-s', 'Mo', 'Mo Halisi Red', 10000, 'Usafi', 'Box la Sabuni za Mo za Unga.', 'other/mohalisi1-removebg.png'),
('Mo-04-s', 'Mo', 'Mo soap', 10000, 'Usafi', 'Box la sabuni ya Kuogea.', 'other/mosoap-removebg.png'),
('SF-01', 'Softcare', 'Softcare Diaper', 10000, 'Watoto', 'Box la Softcare Diapersi.', 'other/SOFTCARE_DIAPERS-removebg.png'),
('SF-09', 'Softcare', 'Softcare Pads', 34000, 'Afya', 'Box la Softcare Pads.', 'other/SOFTCARE_PADS-removebg.png'),
('Mk-01', 'Mk', 'Mosquito King', 20650, 'Usafi', 'Box la dawa ya Mbu.', 'other/dawayambuuu-removebg.png'),
('Df-01', 'Doffi', 'Doffi Yellow', 9850, 'Usafi', 'Box la Doffi Yellow.', 'other/doffiyellow-removebg.png'),
('Df-02', 'Doffi', 'Doffi Pink', 9850, 'Usafi', 'Box la Doffi Pink', 'other/doffipink-removebg.png'),
('Ks-09', 'Kleesoft', 'Sabuni Ya Kleesoft', 4150, 'Usafi', 'Box la Sabuni ya Kleesoft.', 'other/Kleesoft-removebg.png'),
('Nc-09', 'Niceone', 'Sabuni Ya Niceone', 9700, 'Usafi', 'Box la Sabuni ya Niceone.', 'other/niceone-removebg.png'),
('An-01', 'Azania', 'Sabuni ya Marhaba', 4300, 'Usafi', 'Box la Sabuni ya Marhaba.', 'other/Marhaba-removebg.png'),
('Vv-01', 'Viva', 'Viva Tissue Paper', 10000, 'Usafi', 'Box la Tissue paper za Viva.', 'other/vivasoft-removebg.png'),
('Jm-01', 'Jamaa', 'Sabuni ya Jamaa', 15150, 'Usafi', 'Box la Miche ya Jamaa.', 'other/sabuniyajamaa-removebg.png');

-- ============================================
-- VERIFICATION (Run these after to confirm)
-- ============================================
-- SELECT COUNT(*) as total_products FROM products;
-- SELECT DISTINCT category FROM products ORDER BY category;
