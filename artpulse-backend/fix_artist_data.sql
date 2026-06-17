-- Update artist, year, medium, dimensions, condition, provenance for all auction products
UPDATE products SET artist='Marie Leblanc', year=2022, medium='Oil on Canvas', dimensions='120 x 100 cm', item_condition='Excellent', provenance='Private Collection, Paris' WHERE id=12;
UPDATE products SET artist='Kenji Watanabe', year=2021, medium='Bronze', dimensions='45 x 30 x 25 cm', item_condition='Stable', provenance='Direct from artist' WHERE id=23;
UPDATE products SET artist='Ines Moreau', year=2023, medium='Mixed Media', dimensions='80 x 80 cm', item_condition='New', provenance='Studio Sale' WHERE id=50;
UPDATE products SET artist='Marco Rossi', year=2024, medium='Giclée Print', dimensions='60 x 90 cm', item_condition='Pristine' WHERE id=15;
UPDATE products SET artist='Ama Diallo', year=2023, medium='Acrylic on Linen', dimensions='150 x 120 cm' WHERE id=14;
UPDATE products SET artist='Arjun Mehta', year=2023, medium='Oil and Sand' WHERE id=13;
UPDATE products SET artist='Omar Faroq', year=2020, medium='Silver Gelatin Print' WHERE id=11;
UPDATE products SET artist='Leo Chen', year=2022 WHERE id=16;
UPDATE products SET artist='Sarah Jenkins', year=2022 WHERE id=17;
UPDATE products SET artist='Elena Popa', year=2021 WHERE id=18;
UPDATE products SET artist='Victor H.' WHERE id=19;
UPDATE products SET artist='Nina Simone' WHERE id=20;
UPDATE products SET artist='Ivan Petroff' WHERE id=21;
UPDATE products SET artist='Chloe Bell' WHERE id=22;
UPDATE products SET artist='Dante Ali' WHERE id=23;
UPDATE products SET artist='Luca Moretti' WHERE id=24;
UPDATE products SET artist='J. Banksy' WHERE id=25;
-- Auction 15 Solar Plexus uses product 23
-- Correct auctions to match frontend: update current_price where null
UPDATE auctions SET current_price=start_price WHERE current_price IS NULL;
-- Update status for auction 10 (nearly expired)
UPDATE auctions SET status='ACTIVE' WHERE id=10 AND status='UPCOMING';
