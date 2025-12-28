-- 메뉴 테이블
CREATE TABLE IF NOT EXISTS menus (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  price INTEGER NOT NULL CHECK (price >= 0),
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 메뉴 옵션 테이블
CREATE TABLE IF NOT EXISTS menu_options (
  id SERIAL PRIMARY KEY,
  menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  additional_price INTEGER NOT NULL DEFAULT 0 CHECK (additional_price >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 재고 테이블
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  menu_id INTEGER NOT NULL UNIQUE REFERENCES menus(id) ON DELETE CASCADE,
  current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  unit VARCHAR(10) DEFAULT '개',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 주문 테이블
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'received' 
    CHECK (status IN ('received', 'preparing', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 주문 아이템 테이블
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id INTEGER NOT NULL REFERENCES menus(id),
  menu_name VARCHAR(100) NOT NULL,
  base_price INTEGER NOT NULL CHECK (base_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  item_total_price INTEGER NOT NULL CHECK (item_total_price >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 주문 아이템 옵션 테이블
CREATE TABLE IF NOT EXISTS order_item_options (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  option_id INTEGER NOT NULL REFERENCES menu_options(id),
  option_name VARCHAR(100) NOT NULL,
  additional_price INTEGER NOT NULL DEFAULT 0 CHECK (additional_price >= 0)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_menus_name ON menus(name);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_inventory_menu_id ON inventory(menu_id);

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_options_updated_at BEFORE UPDATE ON menu_options
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

