-- Sample data for TechCompare application

-- Insert sample products
INSERT INTO products (id, name, brand, price, image_url, rating, reviews, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'iPhone 15 Pro', 'Apple', 999.00, 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800', 4.8, 1247, 'Latest iPhone with A17 Pro chip'),
('550e8400-e29b-41d4-a716-446655440002', 'Galaxy S24 Ultra', 'Samsung', 1199.00, 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=800', 4.7, 892, 'Premium Samsung flagship with S Pen'),
('550e8400-e29b-41d4-a716-446655440003', 'Pixel 8 Pro', 'Google', 899.00, 'https://images.pexels.com/photos/1482476/pexels-photo-1482476.jpeg?auto=compress&cs=tinysrgb&w=800', 4.6, 634, 'Google flagship with AI photography'),
('550e8400-e29b-41d4-a716-446655440004', 'OnePlus 12', 'OnePlus', 799.00, 'https://images.pexels.com/photos/3761020/pexels-photo-3761020.jpeg?auto=compress&cs=tinysrgb&w=800', 4.5, 456, 'Fast charging flagship killer'),
('550e8400-e29b-41d4-a716-446655440005', 'Xiaomi 14 Ultra', 'Xiaomi', 1099.00, 'https://images.pexels.com/photos/2148216/pexels-photo-2148216.jpeg?auto=compress&cs=tinysrgb&w=800', 4.4, 723, 'Leica camera partnership'),
('550e8400-e29b-41d4-a716-446655440006', 'Nothing Phone 2', 'Nothing', 599.00, 'https://images.pexels.com/photos/1841841/pexels-photo-1841841.jpeg?auto=compress&cs=tinysrgb&w=800', 4.3, 312, 'Unique transparent design');

-- Insert product specifications
INSERT INTO product_specs (product_id, display_size, processor, ram, storage, camera, battery, operating_system) VALUES
('550e8400-e29b-41d4-a716-446655440001', '6.1" Super Retina XDR OLED', 'A17 Pro', '8GB', '128GB', '48MP Triple Camera', '3274mAh', 'iOS 17'),
('550e8400-e29b-41d4-a716-446655440002', '6.8" Dynamic AMOLED 2X', 'Snapdragon 8 Gen 3', '12GB', '256GB', '200MP Quad Camera', '5000mAh', 'Android 14'),
('550e8400-e29b-41d4-a716-446655440003', '6.7" LTPO OLED', 'Google Tensor G3', '12GB', '128GB', '50MP Triple Camera', '5050mAh', 'Android 14'),
('550e8400-e29b-41d4-a716-446655440004', '6.82" LTPO AMOLED', 'Snapdragon 8 Gen 3', '16GB', '256GB', '50MP Triple Camera', '5400mAh', 'OxygenOS 14'),
('550e8400-e29b-41d4-a716-446655440005', '6.73" LTPO AMOLED', 'Snapdragon 8 Gen 3', '12GB', '512GB', '50MP Quad Camera', '5300mAh', 'MIUI 15'),
('550e8400-e29b-41d4-a716-446655440006', '6.7" LTPO OLED', 'Snapdragon 8+ Gen 1', '8GB', '128GB', '50MP Dual Camera', '4700mAh', 'Nothing OS 2.0');

-- Insert product features
INSERT INTO product_features (product_id, feature_name) VALUES
('550e8400-e29b-41d4-a716-446655440001', '5G'),
('550e8400-e29b-41d4-a716-446655440001', 'Face ID'),
('550e8400-e29b-41d4-a716-446655440001', 'Wireless Charging'),
('550e8400-e29b-41d4-a716-446655440001', 'Water Resistant'),
('550e8400-e29b-41d4-a716-446655440002', '5G'),
('550e8400-e29b-41d4-a716-446655440002', 'S Pen'),
('550e8400-e29b-41d4-a716-446655440002', 'Wireless Charging'),
('550e8400-e29b-41d4-a716-446655440002', 'Water Resistant'),
('550e8400-e29b-41d4-a716-446655440003', '5G'),
('550e8400-e29b-41d4-a716-446655440003', 'AI Photography'),
('550e8400-e29b-41d4-a716-446655440003', 'Wireless Charging'),
('550e8400-e29b-41d4-a716-446655440003', 'Pure Android'),
('550e8400-e29b-41d4-a716-446655440004', '5G'),
('550e8400-e29b-41d4-a716-446655440004', 'Fast Charging'),
('550e8400-e29b-41d4-a716-446655440004', 'Wireless Charging'),
('550e8400-e29b-41d4-a716-446655440004', 'Alert Slider'),
('550e8400-e29b-41d4-a716-446655440005', '5G'),
('550e8400-e29b-41d4-a716-446655440005', 'Leica Cameras'),
('550e8400-e29b-41d4-a716-446655440005', 'Wireless Charging'),
('550e8400-e29b-41d4-a716-446655440005', 'IP68'),
('550e8400-e29b-41d4-a716-446655440006', '5G'),
('550e8400-e29b-41d4-a716-446655440006', 'Glyph Interface'),
('550e8400-e29b-41d4-a716-446655440006', 'Wireless Charging'),
('550e8400-e29b-41d4-a716-446655440006', 'Unique Design');