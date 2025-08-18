// Product-related SQL queries

const productQueries = {
  // Get all products with pagination
  getAllProducts: `
    SELECT 
      p.id,
      p.name,
      p.brand,
      p.price,
      p.image_url as image,
      p.rating,
      p.reviews,
      p.created_at,
      p.updated_at,
      json_build_object(
        'display', ps.display_size,
        'processor', ps.processor,
        'ram', ps.ram,
        'storage', ps.storage,
        'camera', ps.camera,
        'battery', ps.battery,
        'os', ps.operating_system
      ) as specs,
      array_agg(pf.feature_name) as features
    FROM products p
    LEFT JOIN product_specs ps ON p.id = ps.product_id
    LEFT JOIN product_features pf ON p.id = pf.product_id
    GROUP BY p.id, ps.display_size, ps.processor, ps.ram, ps.storage, ps.camera, ps.battery, ps.operating_system
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $2
  `,

  // Get product by ID
  getProductById: `
    SELECT 
      p.id,
      p.name,
      p.brand,
      p.price,
      p.image_url as image,
      p.rating,
      p.reviews,
      p.description,
      p.created_at,
      p.updated_at,
      json_build_object(
        'display', ps.display_size,
        'processor', ps.processor,
        'ram', ps.ram,
        'storage', ps.storage,
        'camera', ps.camera,
        'battery', ps.battery,
        'os', ps.operating_system
      ) as specs,
      array_agg(pf.feature_name) as features
    FROM products p
    LEFT JOIN product_specs ps ON p.id = ps.product_id
    LEFT JOIN product_features pf ON p.id = pf.product_id
    WHERE p.id = $1
    GROUP BY p.id, ps.display_size, ps.processor, ps.ram, ps.storage, ps.camera, ps.battery, ps.operating_system
  `,

  // Search products
  searchProducts: `
    SELECT 
      p.id,
      p.name,
      p.brand,
      p.price,
      p.image_url as image,
      p.rating,
      p.reviews,
      json_build_object(
        'display', ps.display_size,
        'processor', ps.processor,
        'ram', ps.ram,
        'storage', ps.storage,
        'camera', ps.camera,
        'battery', ps.battery,
        'os', ps.operating_system
      ) as specs,
      array_agg(pf.feature_name) as features
    FROM products p
    LEFT JOIN product_specs ps ON p.id = ps.product_id
    LEFT JOIN product_features pf ON p.id = pf.product_id
    WHERE 
      LOWER(p.name) LIKE LOWER($1) OR 
      LOWER(p.brand) LIKE LOWER($1) OR
      LOWER(p.description) LIKE LOWER($1)
    GROUP BY p.id, ps.display_size, ps.processor, ps.ram, ps.storage, ps.camera, ps.battery, ps.operating_system
    ORDER BY p.rating DESC
    LIMIT $2 OFFSET $3
  `,

  // Filter products
  filterProducts: `
    SELECT 
      p.id,
      p.name,
      p.brand,
      p.price,
      p.image_url as image,
      p.rating,
      p.reviews,
      json_build_object(
        'display', ps.display_size,
        'processor', ps.processor,
        'ram', ps.ram,
        'storage', ps.storage,
        'camera', ps.camera,
        'battery', ps.battery,
        'os', ps.operating_system
      ) as specs,
      array_agg(pf.feature_name) as features
    FROM products p
    LEFT JOIN product_specs ps ON p.id = ps.product_id
    LEFT JOIN product_features pf ON p.id = pf.product_id
    WHERE 
      ($1::text IS NULL OR p.brand = $1) AND
      ($2::numeric IS NULL OR p.price >= $2) AND
      ($3::numeric IS NULL OR p.price <= $3) AND
      ($4::text IS NULL OR ps.ram = $4) AND
      ($5::text IS NULL OR ps.storage = $5)
    GROUP BY p.id, ps.display_size, ps.processor, ps.ram, ps.storage, ps.camera, ps.battery, ps.operating_system
    ORDER BY p.rating DESC
    LIMIT $6 OFFSET $7
  `,

  // Get products by IDs for comparison
  getProductsByIds: `
    SELECT 
      p.id,
      p.name,
      p.brand,
      p.price,
      p.image_url as image,
      p.rating,
      p.reviews,
      json_build_object(
        'display', ps.display_size,
        'processor', ps.processor,
        'ram', ps.ram,
        'storage', ps.storage,
        'camera', ps.camera,
        'battery', ps.battery,
        'os', ps.operating_system
      ) as specs,
      array_agg(pf.feature_name) as features
    FROM products p
    LEFT JOIN product_specs ps ON p.id = ps.product_id
    LEFT JOIN product_features pf ON p.id = pf.product_id
    WHERE p.id = ANY($1::uuid[])
    GROUP BY p.id, ps.display_size, ps.processor, ps.ram, ps.storage, ps.camera, ps.battery, ps.operating_system
    ORDER BY p.name
  `,

  // Insert new product
  insertProduct: `
    INSERT INTO products (name, brand, price, image_url, rating, reviews, description)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `,

  // Insert product specifications
  insertProductSpecs: `
    INSERT INTO product_specs (product_id, display_size, processor, ram, storage, camera, battery, operating_system)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `,

  // Insert product features
  insertProductFeature: `
    INSERT INTO product_features (product_id, feature_name)
    VALUES ($1, $2)
  `,

  // Update product
  updateProduct: `
    UPDATE products 
    SET name = $2, brand = $3, price = $4, image_url = $5, rating = $6, reviews = $7, description = $8, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `,

  // Delete product
  deleteProduct: `
    DELETE FROM products WHERE id = $1
  `,

  // Get product count
  getProductCount: `
    SELECT COUNT(*) as total FROM products
  `,

  // Get brands
  getBrands: `
    SELECT DISTINCT brand FROM products ORDER BY brand
  `,

  // Get admin stats
  getAdminStats: `
    SELECT 
      (SELECT COUNT(*) FROM products) as total_products,
      (SELECT COUNT(DISTINCT brand) FROM products) as total_brands,
      (SELECT AVG(rating) FROM products) as avg_rating,
      (SELECT COUNT(*) FROM predictions) as total_predictions
  `
};

module.exports = productQueries;