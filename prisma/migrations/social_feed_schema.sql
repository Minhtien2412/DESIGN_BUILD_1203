-- =====================================================
-- Social Feed Database Schema
-- Optimized for high-performance queries
-- 
-- Features:
-- - Comments với nested replies
-- - Reactions (likes) với multiple types
-- - Notifications với activity tracking
-- - Indexes cho truy vấn nhanh
-- 
-- @created 16/01/2026
-- =====================================================

-- =====================================================
-- USERS TABLE (Reference)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    cover_photo_url VARCHAR(500),
    bio TEXT,
    verified BOOLEAN DEFAULT FALSE,
    
    -- Denormalized counts for fast display
    friends_count INT DEFAULT 0,
    followers_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    posts_count INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_display_name (display_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(36) PRIMARY KEY,
    author_id VARCHAR(36) NOT NULL,
    content TEXT,
    privacy ENUM('public', 'friends', 'friends_except', 'specific_friends', 'only_me') DEFAULT 'public',
    
    -- Location data
    location_name VARCHAR(200),
    location_address VARCHAR(500),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    
    feeling VARCHAR(50),
    
    -- Denormalized counts for fast queries
    reactions_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    
    -- Share tracking
    shared_post_id VARCHAR(36),
    shared_from_id VARCHAR(36),
    
    -- Flags
    is_edited BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_sponsored BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_post_id) REFERENCES posts(id) ON DELETE SET NULL,
    FOREIGN KEY (shared_from_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_author_id (author_id),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_author_created (author_id, created_at DESC),
    INDEX idx_privacy (privacy),
    INDEX idx_shared_post (shared_post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- POST MEDIA TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS post_media (
    id VARCHAR(36) PRIMARY KEY,
    post_id VARCHAR(36) NOT NULL,
    type ENUM('image', 'video', 'link') NOT NULL,
    url VARCHAR(1000) NOT NULL,
    thumbnail_url VARCHAR(1000),
    width INT,
    height INT,
    duration INT,  -- For videos, in seconds
    alt_text VARCHAR(500),
    sort_order INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    
    INDEX idx_post_id (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- POST TAGS TABLE (Tagged users in posts)
-- =====================================================
CREATE TABLE IF NOT EXISTS post_tags (
    id VARCHAR(36) PRIMARY KEY,
    post_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_post_tag (post_id, user_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- REACTIONS TABLE (For posts and comments)
-- Unified table for all reactions
-- =====================================================
CREATE TABLE IF NOT EXISTS reactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    target_type ENUM('post', 'comment') NOT NULL,
    target_id VARCHAR(36) NOT NULL,
    reaction_type ENUM('like', 'love', 'haha', 'wow', 'sad', 'angry') NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint: one reaction per user per target
    UNIQUE KEY unique_user_reaction (user_id, target_type, target_id),
    
    -- Indexes for fast queries
    INDEX idx_target (target_type, target_id),
    INDEX idx_user_id (user_id),
    INDEX idx_reaction_type (reaction_type),
    INDEX idx_target_type_created (target_type, target_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- COMMENTS TABLE
-- Supports nested replies with parent_id
-- =====================================================
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(36) PRIMARY KEY,
    post_id VARCHAR(36) NOT NULL,
    author_id VARCHAR(36) NOT NULL,
    parent_id VARCHAR(36) NULL,  -- For nested replies
    reply_to_user_id VARCHAR(36) NULL,  -- User being replied to
    
    content TEXT NOT NULL,
    
    -- Media attachment (optional)
    media_type ENUM('image', 'video') NULL,
    media_url VARCHAR(1000) NULL,
    
    -- Denormalized counts
    reactions_count INT DEFAULT 0,
    replies_count INT DEFAULT 0,
    
    is_edited BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to_user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes for fast queries
    INDEX idx_post_id (post_id),
    INDEX idx_author_id (author_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_post_created (post_id, created_at DESC),
    INDEX idx_post_parent_created (post_id, parent_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SAVED POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS saved_posts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    post_id VARCHAR(36) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_saved (user_id, post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_user_created (user_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- NOTIFICATIONS TABLE
-- Activity-based notifications
-- =====================================================
CREATE TABLE IF NOT EXISTS social_notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,  -- Recipient
    actor_id VARCHAR(36) NOT NULL, -- Who performed the action
    
    type ENUM(
        'post_reaction',
        'comment',
        'comment_reaction',
        'reply',
        'mention',
        'share',
        'friend_request',
        'friend_accepted',
        'birthday',
        'memory',
        'tag',
        'group_post',
        'page_post'
    ) NOT NULL,
    
    -- Target reference
    target_type ENUM('post', 'comment', 'story', 'profile', 'group', 'page') NULL,
    target_id VARCHAR(36) NULL,
    target_preview VARCHAR(200) NULL,  -- Preview text
    
    message TEXT,  -- Pre-formatted message
    
    is_read BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for fast queries
    INDEX idx_user_id (user_id),
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_user_created (user_id, created_at DESC),
    INDEX idx_user_type (user_id, type),
    INDEX idx_target (target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- NOTIFICATION ACTORS TABLE
-- For grouped notifications (e.g., "A, B and 3 others liked...")
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_actors (
    id VARCHAR(36) PRIMARY KEY,
    notification_id VARCHAR(36) NOT NULL,
    actor_id VARCHAR(36) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (notification_id) REFERENCES social_notifications(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_notification_actor (notification_id, actor_id),
    INDEX idx_notification_id (notification_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ACTIVITY LOG TABLE
-- For tracking all user activities (analytics & notifications)
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_log (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    action_type VARCHAR(50) NOT NULL,  -- 'create_post', 'like', 'comment', etc.
    
    target_type VARCHAR(50) NOT NULL,  -- 'post', 'comment', 'user', etc.
    target_id VARCHAR(36) NOT NULL,
    
    metadata JSON,  -- Additional data
    
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_action_type (action_type),
    INDEX idx_target (target_type, target_id),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_user_action_created (user_id, action_type, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VIEWS
-- Optimized views for common queries
-- =====================================================

-- View: Post feed with author info
CREATE OR REPLACE VIEW v_post_feed AS
SELECT 
    p.*,
    u.username AS author_username,
    u.display_name AS author_display_name,
    u.avatar_url AS author_avatar,
    u.verified AS author_verified
FROM posts p
JOIN users u ON p.author_id = u.id
WHERE p.deleted_at IS NULL;

-- View: Comments with author info
CREATE OR REPLACE VIEW v_comments AS
SELECT 
    c.*,
    u.username AS author_username,
    u.display_name AS author_display_name,
    u.avatar_url AS author_avatar,
    u.verified AS author_verified
FROM comments c
JOIN users u ON c.author_id = u.id
WHERE c.deleted_at IS NULL;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Procedure: Get feed with pagination
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_get_feed(
    IN p_user_id VARCHAR(36),
    IN p_cursor TIMESTAMP,
    IN p_limit INT
)
BEGIN
    SELECT 
        p.*,
        u.username AS author_username,
        u.display_name AS author_display_name,
        u.avatar_url AS author_avatar,
        u.verified AS author_verified,
        CASE WHEN r.id IS NOT NULL THEN r.reaction_type ELSE NULL END AS my_reaction,
        CASE WHEN sp.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_saved
    FROM posts p
    JOIN users u ON p.author_id = u.id
    LEFT JOIN reactions r ON r.target_type = 'post' AND r.target_id = p.id AND r.user_id = p_user_id
    LEFT JOIN saved_posts sp ON sp.post_id = p.id AND sp.user_id = p_user_id
    WHERE p.deleted_at IS NULL
        AND p.privacy = 'public'
        AND (p_cursor IS NULL OR p.created_at < p_cursor)
    ORDER BY p.created_at DESC
    LIMIT p_limit;
END //
DELIMITER ;

-- Procedure: Get comments for a post
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_get_comments(
    IN p_post_id VARCHAR(36),
    IN p_user_id VARCHAR(36),
    IN p_parent_id VARCHAR(36),
    IN p_cursor TIMESTAMP,
    IN p_limit INT
)
BEGIN
    SELECT 
        c.*,
        u.username AS author_username,
        u.display_name AS author_display_name,
        u.avatar_url AS author_avatar,
        u.verified AS author_verified,
        CASE WHEN r.id IS NOT NULL THEN r.reaction_type ELSE NULL END AS my_reaction
    FROM comments c
    JOIN users u ON c.author_id = u.id
    LEFT JOIN reactions r ON r.target_type = 'comment' AND r.target_id = c.id AND r.user_id = p_user_id
    WHERE c.post_id = p_post_id
        AND c.deleted_at IS NULL
        AND (p_parent_id IS NULL AND c.parent_id IS NULL OR c.parent_id = p_parent_id)
        AND (p_cursor IS NULL OR c.created_at < p_cursor)
    ORDER BY c.created_at DESC
    LIMIT p_limit;
END //
DELIMITER ;

-- Procedure: Add reaction (upsert)
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_add_reaction(
    IN p_user_id VARCHAR(36),
    IN p_target_type VARCHAR(20),
    IN p_target_id VARCHAR(36),
    IN p_reaction_type VARCHAR(20)
)
BEGIN
    DECLARE v_reaction_id VARCHAR(36);
    
    -- Check if reaction exists
    SELECT id INTO v_reaction_id 
    FROM reactions 
    WHERE user_id = p_user_id 
        AND target_type = p_target_type 
        AND target_id = p_target_id;
    
    IF v_reaction_id IS NOT NULL THEN
        -- Update existing reaction
        IF p_reaction_type IS NULL THEN
            -- Remove reaction
            DELETE FROM reactions WHERE id = v_reaction_id;
            
            -- Update count
            IF p_target_type = 'post' THEN
                UPDATE posts SET reactions_count = reactions_count - 1 WHERE id = p_target_id;
            ELSE
                UPDATE comments SET reactions_count = reactions_count - 1 WHERE id = p_target_id;
            END IF;
        ELSE
            -- Change reaction type
            UPDATE reactions SET reaction_type = p_reaction_type WHERE id = v_reaction_id;
        END IF;
    ELSE
        IF p_reaction_type IS NOT NULL THEN
            -- Add new reaction
            SET v_reaction_id = UUID();
            INSERT INTO reactions (id, user_id, target_type, target_id, reaction_type)
            VALUES (v_reaction_id, p_user_id, p_target_type, p_target_id, p_reaction_type);
            
            -- Update count
            IF p_target_type = 'post' THEN
                UPDATE posts SET reactions_count = reactions_count + 1 WHERE id = p_target_id;
            ELSE
                UPDATE comments SET reactions_count = reactions_count + 1 WHERE id = p_target_id;
            END IF;
        END IF;
    END IF;
END //
DELIMITER ;

-- Procedure: Add comment
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_add_comment(
    IN p_id VARCHAR(36),
    IN p_post_id VARCHAR(36),
    IN p_author_id VARCHAR(36),
    IN p_parent_id VARCHAR(36),
    IN p_reply_to_user_id VARCHAR(36),
    IN p_content TEXT
)
BEGIN
    INSERT INTO comments (id, post_id, author_id, parent_id, reply_to_user_id, content)
    VALUES (p_id, p_post_id, p_author_id, p_parent_id, p_reply_to_user_id, p_content);
    
    -- Update post comments count
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = p_post_id;
    
    -- Update parent comment replies count if it's a reply
    IF p_parent_id IS NOT NULL THEN
        UPDATE comments SET replies_count = replies_count + 1 WHERE id = p_parent_id;
    END IF;
END //
DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: After delete comment - update counts
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_after_delete_comment
AFTER UPDATE ON comments
FOR EACH ROW
BEGIN
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
        -- Update post comments count
        UPDATE posts SET comments_count = comments_count - 1 WHERE id = NEW.post_id;
        
        -- Update parent replies count if it was a reply
        IF NEW.parent_id IS NOT NULL THEN
            UPDATE comments SET replies_count = replies_count - 1 WHERE id = NEW.parent_id;
        END IF;
    END IF;
END //
DELIMITER ;

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample users
INSERT INTO users (id, username, display_name, avatar_url, verified) VALUES
('u1', 'admin', 'Admin User', 'https://i.pravatar.cc/150?u=admin', TRUE),
('u2', 'nguyenvana', 'Nguyễn Văn A', 'https://i.pravatar.cc/150?u=nguyenvana', FALSE),
('u3', 'tranvanb', 'Trần Văn B', 'https://i.pravatar.cc/150?u=tranvanb', FALSE);

-- Insert sample post
INSERT INTO posts (id, author_id, content, privacy, reactions_count, comments_count) VALUES
('p1', 'u1', 'Chào mừng đến với Social Feed! 🎉', 'public', 2, 1);

-- Insert sample reactions
INSERT INTO reactions (id, user_id, target_type, target_id, reaction_type) VALUES
(UUID(), 'u2', 'post', 'p1', 'like'),
(UUID(), 'u3', 'post', 'p1', 'love');

-- Insert sample comment
INSERT INTO comments (id, post_id, author_id, content) VALUES
(UUID(), 'p1', 'u2', 'Tuyệt vời! 👏');
