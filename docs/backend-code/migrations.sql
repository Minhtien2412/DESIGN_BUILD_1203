-- ============================================================================
-- Database Migration Script for App API
-- Run this on PostgreSQL server
-- Created: 2026-01-24
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- BANNERS TABLE - Quản lý banner trang chủ
-- ============================================================================
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  image_url VARCHAR(500) NOT NULL,
  route VARCHAR(255),
  link VARCHAR(500),
  placement VARCHAR(50) DEFAULT 'home',
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- FEATURED SERVICES TABLE - Dịch vụ nổi bật
-- ============================================================================
CREATE TABLE IF NOT EXISTS featured_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  route VARCHAR(255) NOT NULL,
  price VARCHAR(100),
  location VARCHAR(255),
  category VARCHAR(50) DEFAULT 'main',
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CATEGORIES TABLE - Danh mục
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  route VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'main',
  item_count INTEGER DEFAULT 0,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- WORKER CATEGORIES TABLE - Danh mục thợ
-- ============================================================================
CREATE TABLE IF NOT EXISTS worker_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(100),
  description TEXT,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- WORKERS TABLE - Thợ/Nhân công
-- ============================================================================
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  phone VARCHAR(20),
  email VARCHAR(255),
  location VARCHAR(255),
  description TEXT,
  skills TEXT[],
  price VARCHAR(100),
  price_unit VARCHAR(20) DEFAULT 'day',
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  category_id UUID REFERENCES worker_categories(id),
  experience_years INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workers_category ON workers(category_id);
CREATE INDEX IF NOT EXISTS idx_workers_available ON workers(is_available);
CREATE INDEX IF NOT EXISTS idx_workers_rating ON workers(rating DESC);

-- ============================================================================
-- NOTIFICATIONS TABLE - Thông báo
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type VARCHAR(50) DEFAULT 'system',
  title VARCHAR(255) NOT NULL,
  body TEXT,
  data JSONB,
  icon VARCHAR(100),
  image VARCHAR(500),
  action_url VARCHAR(500),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  sender_id UUID,
  sender_name VARCHAR(255),
  sender_avatar VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(user_id, type);

-- ============================================================================
-- NOTIFICATION SETTINGS TABLE - Cài đặt thông báo
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  message_notifications BOOLEAN DEFAULT true,
  call_notifications BOOLEAN DEFAULT true,
  task_notifications BOOLEAN DEFAULT true,
  project_notifications BOOLEAN DEFAULT true,
  system_notifications BOOLEAN DEFAULT true,
  marketing_notifications BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CONVERSATIONS TABLE - Hội thoại
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  type VARCHAR(20) DEFAULT 'direct',
  avatar VARCHAR(500),
  last_message_id UUID,
  last_message_at TIMESTAMP,
  last_message_preview TEXT,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CONVERSATION PARTICIPANTS TABLE - Người tham gia hội thoại
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name VARCHAR(255),
  user_avatar VARCHAR(500),
  role VARCHAR(20) DEFAULT 'member',
  unread_count INTEGER DEFAULT 0,
  last_read_at TIMESTAMP,
  last_read_message_id UUID,
  is_muted BOOLEAN DEFAULT false,
  muted_until TIMESTAMP,
  is_pinned BOOLEAN DEFAULT false,
  nickname VARCHAR(100),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP,
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_conv ON conversation_participants(conversation_id);

-- ============================================================================
-- MESSAGES TABLE - Tin nhắn
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_name VARCHAR(255),
  sender_avatar VARCHAR(500),
  type VARCHAR(20) DEFAULT 'text',
  content TEXT,
  metadata JSONB,
  reply_to_id UUID REFERENCES messages(id),
  forward_from_id UUID,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_by UUID[],
  reactions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- ============================================================================
-- CALLS TABLE - Cuộc gọi
-- ============================================================================
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id UUID NOT NULL,
  caller_name VARCHAR(255),
  caller_avatar VARCHAR(500),
  type VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'initiating',
  room_id VARCHAR(100),
  room_token TEXT,
  started_at TIMESTAMP,
  answered_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration_seconds INTEGER DEFAULT 0,
  end_reason VARCHAR(50),
  quality_rating INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_calls_caller ON calls(caller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);

-- ============================================================================
-- CALL PARTICIPANTS TABLE - Người tham gia cuộc gọi
-- ============================================================================
CREATE TABLE IF NOT EXISTS call_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name VARCHAR(255),
  user_avatar VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending',
  joined_at TIMESTAMP,
  left_at TIMESTAMP,
  is_seen BOOLEAN DEFAULT false,
  seen_at TIMESTAMP,
  is_muted BOOLEAN DEFAULT false,
  is_video_off BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(call_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_call_participants_user ON call_participants(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_participants_call ON call_participants(call_id);
CREATE INDEX IF NOT EXISTS idx_call_participants_unseen ON call_participants(user_id, is_seen) WHERE is_seen = false;

-- ============================================================================
-- PUSH TOKENS TABLE - Token đẩy thông báo
-- ============================================================================
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL,
  platform VARCHAR(20) NOT NULL,
  device_id VARCHAR(255),
  device_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON push_tokens(user_id);

-- ============================================================================
-- USER PRESENCE TABLE - Trạng thái online
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY,
  status VARCHAR(20) DEFAULT 'offline',
  last_seen_at TIMESTAMP,
  current_device VARCHAR(255),
  is_typing_in UUID,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SEED DATA - Dữ liệu mẫu
-- ============================================================================

-- Seed categories
INSERT INTO categories (name, icon, route, type, "order") VALUES
  ('Thiết kế kiến trúc', 'home-outline', '/design/architecture', 'main', 1),
  ('Thiết kế nội thất', 'bed-outline', '/design/interior', 'main', 2),
  ('Thiết kế cảnh quan', 'leaf-outline', '/design/landscape', 'main', 3),
  ('Thi công xây dựng', 'construct-outline', '/construction', 'main', 4),
  ('Vật liệu xây dựng', 'cube-outline', '/materials', 'main', 5),
  ('Thiết bị & Nội thất', 'desktop-outline', '/equipment', 'main', 6),
  ('Biệt thự', 'home-outline', '/library/villa', 'library', 1),
  ('Resort', 'business-outline', '/library/resort', 'library', 2),
  ('Nhà phố', 'storefront-outline', '/library/townhouse', 'library', 3),
  ('Văn phòng', 'briefcase-outline', '/library/office', 'library', 4),
  ('Khách sạn', 'bed-outline', '/library/hotel', 'library', 5),
  ('Nhà hàng', 'restaurant-outline', '/library/restaurant', 'library', 6)
ON CONFLICT DO NOTHING;

-- Seed worker categories
INSERT INTO worker_categories (name, slug, icon, "order") VALUES
  ('Thợ xây dựng', 'construction', 'hammer-outline', 1),
  ('Thợ hoàn thiện', 'finishing', 'brush-outline', 2),
  ('Thợ điện', 'electrical', 'flash-outline', 3),
  ('Thợ nước', 'plumbing', 'water-outline', 4),
  ('Thợ sơn', 'painting', 'color-palette-outline', 5),
  ('Thợ mộc', 'carpentry', 'construct-outline', 6),
  ('Thợ hàn', 'welding', 'flame-outline', 7),
  ('Thợ ốp lát', 'tiling', 'grid-outline', 8),
  ('Thợ nhôm kính', 'aluminum', 'albums-outline', 9),
  ('Thợ trần thạch cao', 'ceiling', 'layers-outline', 10)
ON CONFLICT DO NOTHING;

-- Seed featured services
INSERT INTO featured_services (name, description, icon, route, category, "order") VALUES
  ('Thiết kế Biệt thự', 'Thiết kế kiến trúc biệt thự cao cấp', 'home', '/design/villa', 'main', 1),
  ('Thiết kế Resort', 'Thiết kế khu nghỉ dưỡng', 'business', '/design/resort', 'main', 2),
  ('Thiết kế Nội thất', 'Thiết kế nội thất chuyên nghiệp', 'bed', '/design/interior', 'main', 3),
  ('Thi công Xây dựng', 'Dịch vụ thi công xây dựng', 'construct', '/construction', 'main', 4),
  ('Thiết kế 3D', 'Dựng hình 3D kiến trúc', 'cube', '/design/3d', 'design', 1),
  ('Bản vẽ kỹ thuật', 'Bản vẽ chi tiết thi công', 'document', '/design/technical', 'design', 2),
  ('Phối cảnh', 'Render phối cảnh chất lượng cao', 'image', '/design/render', 'design', 3),
  ('Nội thất', 'Đồ nội thất cao cấp', 'bed', '/products/furniture', 'equipment', 1),
  ('Thiết bị', 'Thiết bị công trình', 'hardware-chip', '/products/equipment', 'equipment', 2),
  ('Vật liệu', 'Vật liệu xây dựng', 'cube', '/products/materials', 'equipment', 3)
ON CONFLICT DO NOTHING;

-- Seed banners
INSERT INTO banners (title, subtitle, image_url, route, placement, "order") VALUES
  ('Thiết kế Resort Cao Cấp', 'Chuyên thiết kế khu nghỉ dưỡng', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', '/design/resort', 'home', 1),
  ('Biệt thự Hiện Đại', 'Kiến trúc đẳng cấp Châu Âu', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', '/design/villa', 'home', 2),
  ('Nội thất Sang Trọng', 'Thiết kế nội thất cao cấp', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800', '/design/interior', 'home', 3),
  ('Thi công Chuyên nghiệp', 'Đội ngũ thợ lành nghề', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800', '/workers', 'home', 4)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%s_updated_at ON %s;
            CREATE TRIGGER update_%s_updated_at
                BEFORE UPDATE ON %s
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update conversation last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET 
        last_message_id = NEW.id,
        last_message_at = NEW.created_at,
        last_message_preview = LEFT(NEW.content, 100),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.conversation_id;
    
    -- Update unread count for other participants
    UPDATE conversation_participants 
    SET unread_count = unread_count + 1
    WHERE conversation_id = NEW.conversation_id 
    AND user_id != NEW.sender_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_conversation_last_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for unread counts per user
CREATE OR REPLACE VIEW user_unread_counts AS
SELECT 
    cp.user_id,
    COUNT(DISTINCT CASE WHEN cp.unread_count > 0 THEN cp.conversation_id END) as unread_conversations,
    COALESCE(SUM(cp.unread_count), 0) as total_unread_messages,
    (SELECT COUNT(*) FROM notifications n WHERE n.user_id = cp.user_id AND n.is_read = false) as unread_notifications,
    (SELECT COUNT(*) FROM call_participants callp 
     JOIN calls c ON c.id = callp.call_id 
     WHERE callp.user_id = cp.user_id 
     AND callp.is_seen = false 
     AND c.status = 'missed') as missed_calls
FROM conversation_participants cp
GROUP BY cp.user_id;

-- ============================================================================
-- GRANTS (adjust as needed for your setup)
-- ============================================================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

COMMIT;
