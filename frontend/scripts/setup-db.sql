-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  total_price DECIMAL(10, 2) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  payment_method VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample products
INSERT INTO products (name, description, price, image_url, category) VALUES
('Minimalist Backpack', 'Premium lightweight backpack perfect for daily use', 89.99, '/classicwatch.jpg?height=400&width=400', 'accessories'),
('Classic Watch', 'Elegant timepiece with leather strap', 149.99, '/classicwatch.jpg?height=400&width=400', 'accessories'),
('Cotton T-Shirt', 'Comfortable everyday t-shirt in neutral colors', 29.99, '/classicwatch.jpg?height=400&width=400', 'clothing'),
('Denim Jeans', 'Timeless blue denim with perfect fit', 79.99, '/classicwatch.jpg?height=400&width=400', 'clothing'),
('Wireless Earbuds', 'High-quality sound with noise cancellation', 129.99, '/classicwatch.jpg?height=400&width=400', 'electronics'),
('Sunglasses', 'UV protection with stylish frame', 99.99, '/classicwatch.jpg?height=400&width=400', 'accessories'),
('Sneakers', 'Comfortable walking shoes with cushioning', 119.99, '/classicwatch.jpg?height=400&width=400', 'clothing'),
('Phone Case', 'Protective case with minimalist design', 24.99, '/classicwatch.jpg?height=400&width=400', 'electronics');
