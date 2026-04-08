-- ===========================================
-- MOCK DATA PENTRU ARTPULSE_DB (CERINTE)
-- ===========================================
USE artpulse_db;

-- 1. Utilizatori specificati
INSERT INTO users (id, email, password, full_name, role, physical_address) VALUES 
(100, 'admin@artpulse.com', '{noop}admin123', 'Admin General', 'ADMIN', 'Str. Centrala 1'),
(101, 'expert1@artpulse.com', '{noop}expert123', 'Evaluator Principal (Exp 1)', 'EXPERT', 'Bd. Artelor 10'),
(102, 'expert2@artpulse.com', '{noop}expert123', 'Evaluator Secundar (Exp 2)', 'EXPERT', 'Str. Picturilor 5'),
(103, 'seller1@artpulse.com', '{noop}seller123', 'Galerie Arta (Seller 1)', 'SELLER', 'Piata Unirii 22'),
(104, 'seller2@artpulse.com', '{noop}seller123', 'Colectionar Privat (Seller 2)', 'SELLER', 'Str. Veche 4'),
(105, 'bidder1@artpulse.com', '{noop}bidder123', 'Andrei Cumparator (Bid 1)', 'BIDDER', 'Bd. Victoriei 100'),
(106, 'bidder2@artpulse.com', '{noop}bidder123', 'Elena Licitator (Bid 2)', 'BIDDER', 'Str. Noua 12');

-- 2. Categorii create experimental
INSERT INTO categories (id, name, created_by_expert_id) VALUES 
(10, 'Pictura Clasica', 101),
(11, 'Sculptura', 102);

-- 3. Produse (diferite stari pt Selleri)
-- Seller 1 are un produs in asteptare
INSERT INTO products (id, title, description, seller_id, status, category_id, expert_id) VALUES 
(50, 'Tablou Abstract', 'O pictura moderna din anii 90', 103, 'UNKNOWN', NULL, NULL);

-- Seller 1 are un produs asignat la Expertul 1 (in evaluare)
INSERT INTO products (id, title, description, seller_id, status, category_id, expert_id) VALUES 
(51, 'Peisaj de Toamna', 'Prezinta usoare semne de decolorare', 103, 'UNDER_REVIEW', NULL, 101);

-- Seller 2 are un produs aprobat si listat de Expert 2
INSERT INTO products (id, title, description, seller_id, status, category_id, expert_id, suggested_price) VALUES 
(52, 'Bust Vechime', 'Bust de bronz, stare excelenta', 104, 'APPROVED', 11, 102, 5000.00);

-- Seller 2 are un produs respins
INSERT INTO products (id, title, description, seller_id, status, category_id, expert_id, rejection_reason) VALUES 
(53, 'Reproducere Ieftina', 'Print de slaba calitate', 104, 'REJECTED', NULL, 101, 'Nu este lucrare originala.');

-- 4. Calendar (Programari Evaluare)
INSERT INTO appointments (id, product_id, expert_id, seller_id, appointment_date, location, status, notes) VALUES 
(20, 51, 101, 103, DATE_ADD(NOW(), INTERVAL 2 DAY), 'Sediu ArtPulse', 'SCHEDULED', 'Aduceti toate certificatele.');

-- 5. Mesaje (Chat real seller <-> expert)
INSERT INTO messages (id, sender_id, receiver_id, product_context_id, content, sent_at) VALUES 
(30, 103, 101, 51, 'Buna ziua, ati primit cererea mea?', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(31, 101, 103, 51, 'Da, tocmai v-am programat pentru poimaine. Va convine?', DATE_SUB(NOW(), INTERVAL 20 HOUR)),
(32, 103, 101, 51, 'Cum decurge de fapt procesul de evaluare?', DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- 6. Licitatii si Bids pe produsul 52
INSERT INTO auctions (id, product_id, start_price, current_price, start_time, end_time, status) VALUES 
(40, 52, 5000.00, 5600.00, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY), 'ACTIVE');

-- Bidder 1 liciteaza
INSERT INTO bids (id, auction_id, bidder_id, amount, bid_time) VALUES 
(60, 40, 105, 5200.00, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Bidder 2 supraliciteaza
INSERT INTO bids (id, auction_id, bidder_id, amount, bid_time) VALUES 
(61, 40, 106, 5600.00, DATE_SUB(NOW(), INTERVAL 5 HOUR));
