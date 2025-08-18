-- TechCompare Database Schema
-- PostgreSQL initialization script

-- Create database (run this separately if needed)
-- CREATE DATABASE techcompare_db;

-- Connect to the database
-- \c techcompare_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2),
    image_url TEXT,
    rating DECIMAL(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    reviews INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product specifications table
CREATE TABLE IF NOT EXISTS product_specs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    display_size VARCHAR(50),
    processor VARCHAR(100),
    ram VARCHAR(20),
    storage VARCHAR(20),
    camera VARCHAR(100),
    battery VARCHAR(20),
    operating_system VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product features table
CREATE TABLE IF NOT EXISTS product_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Predictions table
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    brand VARCHAR(100),
    display_size VARCHAR(50),
    processor VARCHAR(100),
    ram VARCHAR(20),
    storage VARCHAR(20),
    camera VARCHAR(100),
    battery VARCHAR(20),
    predicted_price DECIMAL(10, 2),
    confidence_score DECIMAL(5, 2),
    model_version VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_product_specs_product_id ON product_specs(product_id);
CREATE INDEX IF NOT EXISTS idx_product_features_product_id ON product_features(product_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Insert sample data
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

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

COMMIT;