
-- UPDATE schema_and_mock_data_complete.sql to include new tables and columns



-- Create eval_requests table
CREATE TABLE IF NOT EXISTS eval_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    message TEXT,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    accepted_by_expert_id BIGINT,
    sent_at VARCHAR(100),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (accepted_by_expert_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS eval_request_documents (
    eval_request_id BIGINT NOT NULL,
    document_url VARCHAR(255),
    FOREIGN KEY (eval_request_id) REFERENCES eval_requests(id)
);

SET FOREIGN_KEY_CHECKS = 0;

-- Additional users
INSERT IGNORE INTO users (id, email, password, full_name, role, status) VALUES (110, 'deleted1@artpulse.com', '{noop}12345678', 'Deleted User 1', 'BIDDER', 'DEACTIVATED');
INSERT IGNORE INTO users (id, email, password, full_name, role, status) VALUES (111, 'deleted2@artpulse.com', '{noop}12345678', 'Deleted User 2', 'GUEST', 'DEACTIVATED');
INSERT IGNORE INTO users (id, email, password, full_name, role, status) VALUES (112, 'deleted3@artpulse.com', '{noop}12345678', 'Deleted User 3', 'SELLER', 'DEACTIVATED');
INSERT IGNORE INTO users (id, email, password, full_name, role, status) VALUES (113, 'deleted4@artpulse.com', '{noop}12345678', 'Deleted User 4', 'BIDDER', 'DEACTIVATED');
INSERT IGNORE INTO users (id, email, password, full_name, role, status) VALUES (114, 'deleted5@artpulse.com', '{noop}12345678', 'Deleted User 5', 'GUEST', 'DEACTIVATED');
INSERT IGNORE INTO users (id, email, password, full_name, role, status) VALUES (115, 'suspended1@artpulse.com', '{noop}12345678', 'Suspended User 1', 'BIDDER', 'DEACTIVATED');
INSERT IGNORE INTO users (id, email, password, full_name, role, status) VALUES (116, 'suspended2@artpulse.com', '{noop}12345678', 'Suspended User 2', 'SELLER', 'DEACTIVATED');

-- Add missing products for auctions
INSERT IGNORE INTO products (id, seller_id, category_id, title, description, status, artist, year, medium, dimensions, item_condition, provenance) VALUES (1001, 103, 1, 'Lumière dorée', 'Mock product', 'APPROVED', 'Marie Leblanc', 2022, 'Oil on Canvas', '120 x 100 cm', 'Excellent', 'Private Collection, Paris');
UPDATE products SET status = 'APPROVED' WHERE id = 1001;
INSERT IGNORE INTO product_images (product_id, image_url) VALUES (1001, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=900&q=85');
INSERT IGNORE INTO auctions (id, product_id, start_price, current_price, status, start_time, end_time) VALUES (1, 1001, 2500, 4200, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 1 DAY), '2026-05-17 22:39:19');
INSERT IGNORE INTO products (id, seller_id, category_id, title, description, status, artist, year, medium, dimensions, item_condition, provenance) VALUES (1002, 103, 2, 'Silent Forms', 'Mock product', 'APPROVED', 'Kenji Watanabe', 2021, 'Bronze', '45 x 30 x 25 cm', 'Stable', 'Direct from artist');
UPDATE products SET status = 'APPROVED' WHERE id = 1002;
INSERT IGNORE INTO product_images (product_id, image_url) VALUES (1002, 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=900&q=85');
INSERT IGNORE INTO auctions (id, product_id, start_price, current_price, status, start_time, end_time) VALUES (2, 1002, 5000, 8750, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 1 DAY), '2026-05-18 23:39:19');
INSERT IGNORE INTO products (id, seller_id, category_id, title, description, status, artist, year, medium, dimensions, item_condition, provenance) VALUES (1003, 103, 3, 'Fragile Geometry', 'Mock product', 'APPROVED', 'Ines Moreau', 2023, 'Mixed Media', '80 x 80 cm', 'New', 'Studio Sale');
UPDATE products SET status = 'APPROVED' WHERE id = 1003;
INSERT IGNORE INTO product_images (product_id, image_url) VALUES (1003, 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=900&q=85');
INSERT IGNORE INTO auctions (id, product_id, start_price, current_price, status, start_time, end_time) VALUES (3, 1003, 800, 1450, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 1 DAY), '2026-05-18 06:39:19');
INSERT IGNORE INTO products (id, seller_id, category_id, title, description, status, artist, year, medium, dimensions, item_condition, provenance) VALUES (15, 103, 4, 'Ocean Breath', 'Mock product', 'APPROVED', 'Marco Rossi', 2024, 'Giclée Print', '60 x 90 cm', 'Pristine', NULL);
UPDATE products SET status = 'APPROVED' WHERE id = 15;
INSERT IGNORE INTO product_images (product_id, image_url) VALUES (15, 'https://images.unsplash.com/photo-1500628550463-c8881a54d4d4?w=900&q=85');
INSERT IGNORE INTO auctions (id, product_id, start_price, current_price, status, start_time, end_time) VALUES (4, 15, 600, 950, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 1 DAY), '2026-05-18 20:39:19');
INSERT IGNORE INTO products (id, seller_id, category_id, title, description, status, artist, year, medium, dimensions, item_condition, provenance) VALUES (14, 103, 1, 'Golden Hour', 'Mock product', 'APPROVED', 'Ama Diallo', 2023, 'Acrylic on Linen', '150 x 120 cm', NULL, NULL);
UPDATE products SET status = 'APPROVED' WHERE id = 14;
INSERT IGNORE INTO product_images (product_id, image_url) VALUES (14, 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=900&q=85');
INSERT IGNORE INTO auctions (id, product_id, start_price, current_price, status, start_time, end_time) VALUES (5, 14, 2000, 3100, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 1 DAY), '2026-05-19 20:39:19');
INSERT IGNORE INTO products (id, seller_id, category_id, title, description, status, artist, year, medium, dimensions, item_condition, provenance) VALUES (13, 103, 3, 'Midnight Canvas', 'Mock product', 'APPROVED', 'Arjun Mehta', 2023, 'Oil and Sand', NULL, NULL, NULL);
UPDATE products SET status = 'APPROVED' WHERE id = 13;
INSERT IGNORE INTO product_images (product_id, image_url) VALUES (13, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900&q=85');
INSERT IGNORE INTO auctions (id, product_id, start_price, current_price, status, start_time, end_time) VALUES (6, 13, 1500, 2300, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 1 DAY), '2026-05-18 16:39:19');
INSERT IGNORE INTO products (id, seller_id, category_id, title, description, status, artist, year, medium, dimensions, item_condition, provenance) VALUES (1007, 103, 4, 'Eternal Sands', 'Mock product', 'APPROVED', 'Omar Faroq', 2020, 'Silver Gelatin Print', NULL, NULL, NULL);
UPDATE products SET status = 'APPROVED' WHERE id = 1007;
INSERT IGNORE INTO product_images (product_id, image_url) VALUES (1007, 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?w=900&q=85');
INSERT IGNORE INTO auctions (id, product_id, start_price, current_price, status, start_time, end_time) VALUES (7, 1007, 1000, 1800, 'CLOSED', DATE_SUB(NOW(), INTERVAL 1 DAY), '2026-05-17 19:39:19');
INSERT IGNORE INTO products (id, seller_id, category_id, title, description, status, artist, year, medium, dimensions, item_condition, provenance) VALUES (1008, 103, 5, 'Urban Rhythm', 'Mock product', 'APPROVED', 'Leo Chen', 2022, NULL, NULL, NULL, NULL);
UPDATE products SET status = 'APPROVED' WHERE id = 1008;
INSERT IGNORE INTO product_images (product_id, image_url) VALUES (1008, 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80');
INSERT IGNORE INTO auctions (id, product_id, start_price, current_price, status, start_time, end_time) VALUES (8, 1008, 3000, 5600, 'CLOSED', DATE_SUB(NOW(), INTERVAL 1 DAY), '2026-05-17 18:39:19');
INSERT IGNORE INTO products (id, seller_id, category_id, title, description, status, artist, year, medium, dimensions, item_condition, provenance) VALUES (1009, 103, 4, 'Ethereal Glow', 'Mock product', 'APPROVED', 'Sarah Jenkins', 2022, NULL, NULL, NULL, NULL);
UPDATE products SET status = 'APPROVED' WHERE id = 1009;
INSERT IGNORE INTO product_images (product_id, image_url) VALUES (1009, 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80');
INSERT IGNORE INTO auctions (id, product_id, start_price, current_price, status, start_time, end_time) VALUES (9, 1009, 500, 1200, 'CLOSED', DATE_SUB(NOW(), INTERVAL 1 DAY), '2026-05-16 20:39:19');
INSERT IGNORE INTO products (id, seller_id, category_id, title, description, status, artist, year, medium, dimensions, item_condition, provenance) VALUES (18, 103, 1, 'Velvet Mountains', 'Mock product', 'APPROVED', 'Elena Popa', 2021, NULL, NULL, NULL, NULL);
UPDATE products SET status = 'APPROVED' WHERE id = 18;
INSERT IGNORE INTO product_images (product_id, image_url) VALUES (18, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=85');
INSERT IGNORE INTO auctions (id, product_id, start_price, current_price, status, start_time, end_time) VALUES (10, 18, 2000, 3400, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 1 DAY), '2026-05-17 20:42:19');
INSERT IGNORE INTO products (id, seller_id, category_id, title, description, status, artist, year, medium, dimensions, item_condition, provenance) VALUES (19, 103, 2, 'Static Vibration', 'Mock product', 'APPROVED', 'Victor H.', NULL, NULL, NULL, NULL, NULL);
UPDATE products SET status = 'APPROVED' WHERE id = 19;
INSERT IGNORE INTO product_images (product_id, image_url) VALUES (19, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85');
INSERT IGNORE INTO auctions (id, product_id, start_price, current_price, status, start_time, end_time) VALUES (11, 19, 4000, 7100, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 1 DAY), '2026-05-18 04:39:19');
INSERT IGNORE INTO products (id, seller_id, category_id, title, description, status, artist, year, medium, dimensions, item_condition, provenance) VALUES (20, 103, 3, 'Emerald Dreams', 'Mock product', 'APPROVED', 'Nina Simone', NULL, NULL, NULL, NULL, NULL);
UPDATE products SET status = 'APPROVED' WHERE id = 20;
INSERT IGNORE INTO product_images (product_id, image_url) VALUES (20, 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=900&q=85');
INSERT IGNORE INTO auctions (id, product_id, start_price, current_price, status, start_time, end_time) VALUES (12, 20, 1500, 2800, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 1 DAY), '2026-05-18 08:39:19');
INSERT IGNORE INTO products (id, seller_id, category_id, title, description, status, artist, year, medium, dimensions, item_condition, provenance) VALUES (21, 103, 2, 'Cold Fusion', 'Mock product', 'APPROVED', 'Ivan Petroff', NULL, NULL, NULL, NULL, NULL);
UPDATE products SET status = 'APPROVED' WHERE id = 21;
INSERT IGNORE INTO product_images (product_id, image_url) VALUES (21, 'https://images.saatchiart.com/saatchi/1874890/art/8827728/7891102-HSC00923-7.jpg');
INSERT IGNORE INTO auctions (id, product_id, start_price, current_price, status, start_time, end_time) VALUES (13, 21, 10000, 15400, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 1 DAY), '2026-05-17 21:39:19');
INSERT IGNORE INTO products (id, seller_id, category_id, title, description, status, artist, year, medium, dimensions, item_condition, provenance) VALUES (22, 103, 5, 'Shattered Glass', 'Mock product', 'APPROVED', 'Chloe Bell', NULL, NULL, NULL, NULL, NULL);
UPDATE products SET status = 'APPROVED' WHERE id = 22;
INSERT IGNORE INTO product_images (product_id, image_url) VALUES (22, 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=900&q=85');
INSERT IGNORE INTO auctions (id, product_id, start_price, current_price, status, start_time, end_time) VALUES (14, 22, 3000, 4900, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 24 HOUR));
INSERT IGNORE INTO products (id, seller_id, category_id, title, description, status, artist, year, medium, dimensions, item_condition, provenance) VALUES (23, 103, 2, 'Solar Plexus', 'Mock product', 'APPROVED', 'Dante Ali', NULL, NULL, NULL, NULL, NULL);
UPDATE products SET status = 'APPROVED' WHERE id = 23;
INSERT IGNORE INTO product_images (product_id, image_url) VALUES (23, 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80');
INSERT IGNORE INTO auctions (id, product_id, start_price, current_price, status, start_time, end_time) VALUES (15, 23, 4500, 6300, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 18 HOUR));
INSERT IGNORE INTO products (id, seller_id, category_id, title, description, status, artist, year, medium, dimensions, item_condition, provenance) VALUES (24, 103, 1, 'Horizon Echoes', 'Mock product', 'APPROVED', 'Luca Moretti', NULL, NULL, NULL, NULL, NULL);
UPDATE products SET status = 'APPROVED' WHERE id = 24;
INSERT IGNORE INTO product_images (product_id, image_url) VALUES (24, 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=900&q=85');
INSERT IGNORE INTO auctions (id, product_id, start_price, current_price, status, start_time, end_time) VALUES (16, 24, 1200, 1200, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 36 HOUR));
INSERT IGNORE INTO products (id, seller_id, category_id, title, description, status, artist, year, medium, dimensions, item_condition, provenance) VALUES (25, 103, 5, 'Urban Decay', 'Mock product', 'APPROVED', 'J. Banksy', NULL, NULL, NULL, NULL, NULL);
UPDATE products SET status = 'APPROVED' WHERE id = 25;
INSERT IGNORE INTO product_images (product_id, image_url) VALUES (25, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPnFrbAPqp-oynIeQ7ekb3pTpn6GEUonnfdg&s');
INSERT IGNORE INTO auctions (id, product_id, start_price, current_price, status, start_time, end_time) VALUES (17, 25, 5000, 5000, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 50 HOUR));
INSERT IGNORE INTO products (id, seller_id, category_id, title, description, status, artist, year, medium, dimensions, item_condition, provenance) VALUES (26, 103, 1, 'Floral Symphony', 'Mock product', 'APPROVED', 'Rose Miller', NULL, NULL, NULL, NULL, NULL);
UPDATE products SET status = 'APPROVED' WHERE id = 26;
INSERT IGNORE INTO product_images (product_id, image_url) VALUES (26, 'https://images.unsplash.com/photo-1552083375-1447ce886485?w=900&q=85');
INSERT IGNORE INTO auctions (id, product_id, start_price, current_price, status, start_time, end_time) VALUES (18, 26, 800, 800, 'UPCOMING', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 120 HOUR));
INSERT IGNORE INTO products (id, seller_id, category_id, title, description, status, artist, year, medium, dimensions, item_condition, provenance) VALUES (1019, 103, 3, 'Obsidian Night', 'Mock product', 'APPROVED', 'Stefan Kunz', NULL, NULL, NULL, NULL, NULL);
UPDATE products SET status = 'APPROVED' WHERE id = 1019;
INSERT IGNORE INTO product_images (product_id, image_url) VALUES (1019, 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80');
INSERT IGNORE INTO auctions (id, product_id, start_price, current_price, status, start_time, end_time) VALUES (19, 1019, 2800, 3200, 'UPCOMING', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 72 HOUR));
INSERT IGNORE INTO products (id, seller_id, category_id, title, description, status, artist, year, medium, dimensions, item_condition, provenance) VALUES (1020, 103, 1, 'Velvet Dreams', 'Mock product', 'APPROVED', 'Ina G.', NULL, NULL, NULL, NULL, NULL);
UPDATE products SET status = 'APPROVED' WHERE id = 1020;
INSERT IGNORE INTO product_images (product_id, image_url) VALUES (1020, 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=900&q=85');
INSERT IGNORE INTO auctions (id, product_id, start_price, current_price, status, start_time, end_time) VALUES (20, 1020, 1200, 1550, 'UPCOMING', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 48 HOUR));

-- Insert eval requests
INSERT IGNORE INTO products (id, seller_id, title, status) VALUES (50, 103, 'Eval Request Product 50', 'UNKNOWN');
INSERT IGNORE INTO eval_requests (id, product_id, seller_id, message, status, accepted_by_expert_id, sent_at) VALUES (1, 50, 103, 'Buna ziua! As dori o evaluare urgenta pentru aceasta lucrare abstracta. Este o pictura veche din anii 90 si cred ca are valoare istorica.', 'pending', NULL, '2 hours ago');
INSERT IGNORE INTO eval_request_documents (eval_request_id, document_url) VALUES (1, 'certificate_autenticitate.pdf');
INSERT IGNORE INTO eval_request_documents (eval_request_id, document_url) VALUES (1, 'foto_spate.jpg');
INSERT IGNORE INTO eval_request_documents (eval_request_id, document_url) VALUES (1, 'raport_restaurare.pdf');
INSERT IGNORE INTO products (id, seller_id, title, status) VALUES (16, 103, 'Eval Request Product 16', 'UNKNOWN');
INSERT IGNORE INTO eval_requests (id, product_id, seller_id, message, status, accepted_by_expert_id, sent_at) VALUES (2, 16, 103, 'Va rog sa evaluati aceasta colaj urban. Lucrarea are o dimensiune mare (200x150cm) si contine materiale mixte.', 'pending', NULL, '1 day ago');
INSERT IGNORE INTO eval_request_documents (eval_request_id, document_url) VALUES (2, 'provenienta.pdf');
INSERT IGNORE INTO products (id, seller_id, title, status) VALUES (60, 104, 'Eval Request Product 60', 'UNKNOWN');
INSERT IGNORE INTO eval_requests (id, product_id, seller_id, message, status, accepted_by_expert_id, sent_at) VALUES (3, 60, 104, 'Buna ziua! Aceasta lucrare este o acuarela originala executata in 2023. Doresc o evaluare profesionista inainte de a o pune la licitatie.', 'pending', NULL, '3 hours ago');
INSERT IGNORE INTO eval_request_documents (eval_request_id, document_url) VALUES (3, 'acuarela_certificat.pdf');
INSERT IGNORE INTO eval_request_documents (eval_request_id, document_url) VALUES (3, 'foto_verso.jpg');
INSERT IGNORE INTO products (id, seller_id, title, status) VALUES (61, 104, 'Eval Request Product 61', 'UNKNOWN');
INSERT IGNORE INTO eval_requests (id, product_id, seller_id, message, status, accepted_by_expert_id, sent_at) VALUES (4, 61, 104, 'Va rog sa evaluati aceasta pictura in ulei. Dimensiunile sunt 120x90cm si a fost expusa la o galerie locala in 2022.', 'pending', NULL, '1 day ago');
INSERT IGNORE INTO eval_request_documents (eval_request_id, document_url) VALUES (4, 'galerie_expozitie.pdf');
INSERT IGNORE INTO eval_request_documents (eval_request_id, document_url) VALUES (4, 'contract_galerie.pdf');
INSERT IGNORE INTO eval_request_documents (eval_request_id, document_url) VALUES (4, 'foto_expozitie.jpg');
INSERT IGNORE INTO products (id, seller_id, title, status) VALUES (62, 103, 'Eval Request Product 62', 'UNKNOWN');
INSERT IGNORE INTO eval_requests (id, product_id, seller_id, message, status, accepted_by_expert_id, sent_at) VALUES (5, 62, 103, 'Fotografie de natura realizata cu echipament profesional. Tiparita pe hartie de calitate muzeala. Va rog evaluati!', 'pending', NULL, '5 hours ago');
INSERT IGNORE INTO eval_request_documents (eval_request_id, document_url) VALUES (5, 'spec_tehnice.pdf');
INSERT IGNORE INTO products (id, seller_id, title, status) VALUES (63, 108, 'Eval Request Product 63', 'UNKNOWN');
INSERT IGNORE INTO eval_requests (id, product_id, seller_id, message, status, accepted_by_expert_id, sent_at) VALUES (6, 63, 108, 'Arta digitala generativa unica. NFT-ul corespunzator exista pe blockchain. Doresc o evaluare fizica a printului.', 'pending', NULL, '2 hours ago');
INSERT IGNORE INTO eval_request_documents (eval_request_id, document_url) VALUES (6, 'nft_certificate.pdf');
INSERT IGNORE INTO eval_request_documents (eval_request_id, document_url) VALUES (6, 'blockchain_proof.pdf');
INSERT IGNORE INTO eval_request_documents (eval_request_id, document_url) VALUES (6, 'print_specs.jpg');
INSERT IGNORE INTO products (id, seller_id, title, status) VALUES (64, 103, 'Eval Request Product 64', 'UNKNOWN');
INSERT IGNORE INTO eval_requests (id, product_id, seller_id, message, status, accepted_by_expert_id, sent_at) VALUES (7, 64, 103, 'Salut! Am gasit aceasta schita in pod. Nu sunt sigur de autor, dar pare de epoca.', 'pending', NULL, '10 min ago');
INSERT IGNORE INTO eval_request_documents (eval_request_id, document_url) VALUES (7, 'pod_gasire.jpg');
INSERT IGNORE INTO products (id, seller_id, title, status) VALUES (51, 103, 'Eval Request Product 51', 'UNKNOWN');
INSERT IGNORE INTO eval_requests (id, product_id, seller_id, message, status, accepted_by_expert_id, sent_at) VALUES (8, 51, 103, 'Cerere de re-evaluare dupa restaurare.', 'accepted', 101, '4 hours ago');
INSERT IGNORE INTO eval_request_documents (eval_request_id, document_url) VALUES (8, 'restaurare_finala.pdf');
INSERT IGNORE INTO products (id, seller_id, title, status) VALUES (11, 103, 'Eval Request Product 11', 'UNKNOWN');
INSERT IGNORE INTO eval_requests (id, product_id, seller_id, message, status, accepted_by_expert_id, sent_at) VALUES (9, 11, 103, 'Va rog reconsiderati respingerea.', 'rejected', NULL, '2 days ago');
INSERT IGNORE INTO products (id, seller_id, title, status) VALUES (70, 103, 'Eval Request Product 70', 'UNKNOWN');
INSERT IGNORE INTO eval_requests (id, product_id, seller_id, message, status, accepted_by_expert_id, sent_at) VALUES (10, 70, 103, 'Solicitare evaluare rapidă.', 'pending', NULL, '5 min ago');
INSERT IGNORE INTO products (id, seller_id, title, status) VALUES (71, 104, 'Eval Request Product 71', 'UNKNOWN');
INSERT IGNORE INTO eval_requests (id, product_id, seller_id, message, status, accepted_by_expert_id, sent_at) VALUES (11, 71, 104, 'Evaluare pentru fotografie alb-negru.', 'pending', NULL, '15 min ago');
INSERT IGNORE INTO products (id, seller_id, title, status) VALUES (72, 104, 'Eval Request Product 72', 'UNKNOWN');
INSERT IGNORE INTO eval_requests (id, product_id, seller_id, message, status, accepted_by_expert_id, sent_at) VALUES (12, 72, 104, 'Peisaj de toamnă târzie.', 'pending', NULL, '25 min ago');
INSERT IGNORE INTO products (id, seller_id, title, status) VALUES (12, 103, 'Eval Request Product 12', 'UNKNOWN');
INSERT IGNORE INTO eval_requests (id, product_id, seller_id, message, status, accepted_by_expert_id, sent_at) VALUES (13, 12, 103, 'Evaluat deja.', 'accepted', 101, '1 week ago');
INSERT IGNORE INTO products (id, seller_id, title, status) VALUES (17, 108, 'Eval Request Product 17', 'UNKNOWN');
INSERT IGNORE INTO eval_requests (id, product_id, seller_id, message, status, accepted_by_expert_id, sent_at) VALUES (14, 17, 108, 'Respins anterior.', 'rejected', NULL, '2 weeks ago');
INSERT IGNORE INTO products (id, seller_id, title, status) VALUES (73, 108, 'Eval Request Product 73', 'UNKNOWN');
INSERT IGNORE INTO eval_requests (id, product_id, seller_id, message, status, accepted_by_expert_id, sent_at) VALUES (15, 73, 108, 'Solicitare artist digital.', 'pending', NULL, '35 min ago');
INSERT IGNORE INTO products (id, seller_id, title, status) VALUES (60, 104, 'Eval Request Product 60', 'UNKNOWN');
INSERT IGNORE INTO eval_requests (id, product_id, seller_id, message, status, accepted_by_expert_id, sent_at) VALUES (16, 60, 104, 'Urgent!', 'pending', NULL, 'Just now');
INSERT IGNORE INTO products (id, seller_id, title, status) VALUES (70, 103, 'Eval Request Product 70', 'UNKNOWN');
INSERT IGNORE INTO eval_requests (id, product_id, seller_id, message, status, accepted_by_expert_id, sent_at) VALUES (17, 70, 103, 'Aștept răspuns.', 'pending', NULL, 'Just now');

SET FOREIGN_KEY_CHECKS = 1;
