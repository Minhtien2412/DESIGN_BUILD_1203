# Social Feed Database Schema

## Tổng quan

Schema này được thiết kế để lưu trữ và truy vấn nhanh các dữ liệu social feed bao gồm:
- **Posts**: Bài đăng với media, location, tags
- **Comments**: Bình luận với replies lồng nhau
- **Reactions**: Like/Love/Haha... cho posts và comments
- **Notifications**: Thông báo hoạt động
- **Activity Log**: Nhật ký hoạt động

## Cấu trúc Tables

### 1. Posts Table

```sql
posts
├── id (PK)
├── author_id (FK → users)
├── content
├── privacy (public/friends/only_me...)
├── location_name, location_lat, location_lng
├── feeling
├── reactions_count (denormalized)
├── comments_count (denormalized)
├── shares_count (denormalized)
├── shared_post_id (FK → posts)
├── is_edited, is_pinned, is_sponsored
├── created_at, updated_at, deleted_at
```

**Indexes:**
- `idx_author_id` - Truy vấn posts theo user
- `idx_created_at` - Sắp xếp feed theo thời gian
- `idx_author_created` - Timeline của user
- `idx_privacy` - Filter theo privacy

### 2. Comments Table

```sql
comments
├── id (PK)
├── post_id (FK → posts)
├── author_id (FK → users)
├── parent_id (FK → comments) -- Cho nested replies
├── reply_to_user_id (FK → users)
├── content
├── media_type, media_url
├── reactions_count (denormalized)
├── replies_count (denormalized)
├── created_at, updated_at, deleted_at
```

**Indexes:**
- `idx_post_id` - Lấy comments của 1 post
- `idx_post_parent_created` - Comments theo cấp + thời gian
- `idx_author_id` - Comments của 1 user

### 3. Reactions Table (Unified)

```sql
reactions
├── id (PK)
├── user_id (FK → users)
├── target_type (post/comment)
├── target_id
├── reaction_type (like/love/haha/wow/sad/angry)
├── created_at
```

**Indexes:**
- `unique_user_reaction` (user_id, target_type, target_id) - 1 user = 1 reaction
- `idx_target` - Lấy reactions của target
- `idx_user_id` - Reactions của user

### 4. Notifications Table

```sql
social_notifications
├── id (PK)
├── user_id (FK → users) -- Người nhận
├── actor_id (FK → users) -- Người thực hiện action
├── type (post_reaction/comment/reply/mention...)
├── target_type, target_id, target_preview
├── message
├── is_read
├── created_at, read_at
```

**Indexes:**
- `idx_user_unread` - Đếm unread nhanh
- `idx_user_created` - Danh sách notifications
- `idx_target` - Notifications theo target

## Tối ưu Performance

### 1. Denormalized Counts

Các count được lưu trực tiếp trong table chính để tránh COUNT queries:

```sql
-- Posts
UPDATE posts SET reactions_count = reactions_count + 1 WHERE id = ?;

-- Comments  
UPDATE comments SET replies_count = replies_count + 1 WHERE id = ?;
```

### 2. Cursor-based Pagination

Sử dụng cursor thay vì offset để scroll vô hạn:

```sql
-- Thay vì OFFSET (chậm khi data lớn)
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20 OFFSET 1000;

-- Dùng cursor (nhanh)
SELECT * FROM posts 
WHERE created_at < '2024-01-15 10:30:00'
ORDER BY created_at DESC 
LIMIT 20;
```

### 3. Stored Procedures

Các operations phức tạp được đóng gói:

```sql
CALL sp_get_feed('user123', '2024-01-15 10:30:00', 20);
CALL sp_add_reaction('user123', 'post', 'post456', 'like');
CALL sp_add_comment('comment789', 'post456', 'user123', NULL, NULL, 'Great!');
```

### 4. Views cho Common Queries

```sql
-- Feed với author info
SELECT * FROM v_post_feed 
WHERE created_at < ? 
ORDER BY created_at DESC 
LIMIT 20;
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /social/feed | Lấy news feed |
| GET | /social/posts/:id | Lấy single post |
| POST | /social/posts | Tạo post mới |
| POST | /social/posts/:id/reactions | Like/react post |
| DELETE | /social/posts/:id/reactions | Remove reaction |
| GET | /social/comments | Lấy comments của post |
| POST | /social/comments | Thêm comment |
| DELETE | /social/comments/:id | Xóa comment |
| POST | /social/comments/:id/reactions | Like comment |
| POST | /social/posts/:id/save | Save/unsave post |
| GET | /social/notifications | Lấy notifications |
| POST | /social/notifications/:id/read | Mark as read |

## Infinite Scroll Implementation

### Frontend (React Native)

```typescript
// hooks/useSocialFeed.ts
export function usePosts(options) {
  const [posts, setPosts] = useState([]);
  const [cursor, setCursor] = useState(undefined);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    const response = await getFeed(cursor);
    setPosts(prev => [...prev, ...response.data.posts]);
    setCursor(response.data.nextCursor);
    setHasMore(response.data.hasMore);
  };

  return {
    posts,
    hasMore,
    loadMore,
    onEndReached: () => hasMore && loadMore(),
    onEndReachedThreshold: 0.3, // Load khi còn 30% scroll
  };
}
```

### Auto-load Logic

```typescript
// Trong social.tsx
const AUTO_LOAD_THRESHOLD = 5; // Còn 5 bài thì load thêm

const handleScroll = (event) => {
  const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
  const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
  
  if (isCloseToBottom && hasMorePosts && !isLoadingMore) {
    loadMorePosts();
  }
};
```

## Notifications Flow

```
User A likes User B's post
    ↓
Backend creates notification record
    ↓
WebSocket pushes to User B
    ↓
Frontend updates badge count
    ↓
User B opens notifications
    ↓
Mark as read
```

## Migration Commands

```bash
# Chạy migration
mysql -u root -p database_name < prisma/migrations/social_feed_schema.sql

# Verify tables
mysql -e "SHOW TABLES LIKE 'social%'"
```

## Files Created

1. **Database Schema**: [prisma/migrations/social_feed_schema.sql](../prisma/migrations/social_feed_schema.sql)
2. **Backend Routes**: [BE-baotienweb.cloud/src/routes/social.routes.ts](../BE-baotienweb.cloud/src/routes/social.routes.ts)
3. **Frontend Hooks**: [hooks/useSocialFeed.ts](../hooks/useSocialFeed.ts)
4. **Updated Social Screen**: [app/(tabs)/social.tsx](../app/(tabs)/social.tsx)

## Next Steps

1. Chạy SQL migration trên VPS
2. Register routes trong server
3. Test infinite scroll với mock data
4. Connect real database
5. Implement WebSocket for real-time notifications
