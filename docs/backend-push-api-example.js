/**
 * Backend Push Notification API Example
 * 
 * Đây là ví dụ code Node.js/Express để gửi push notifications từ server.
 * Copy file này vào backend project của bạn.
 * 
 * SETUP:
 * 1. npm install express node-fetch
 * 2. Cấu hình environment variables
 * 3. Import và sử dụng các routes
 * 
 * @author AI Assistant
 * @date 14/01/2026
 */

// =====================================================
// ENVIRONMENT VARIABLES (đặt trong .env của backend)
// =====================================================
/*
EXPO_ACCESS_TOKEN=your_expo_access_token
FCM_SERVER_KEY=your_fcm_server_key
DATABASE_URL=your_database_url
*/

// =====================================================
// PUSH SERVICE (backend)
// =====================================================

const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send';
const FCM_API = 'https://fcm.googleapis.com/fcm/send';

/**
 * Gửi push notification qua Expo
 * @param {string[]} tokens - Mảng Expo push tokens
 * @param {object} message - { title, body, data }
 */
async function sendExpoPush(tokens, message) {
  const messages = tokens.map(token => ({
    to: token,
    title: message.title,
    body: message.body,
    data: message.data || {},
    sound: 'default',
    priority: 'high',
  }));

  // Chia thành batch 100 tokens
  const BATCH_SIZE = 100;
  const results = [];

  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);
    
    const response = await fetch(EXPO_PUSH_API, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Optional: 'Authorization': `Bearer ${process.env.EXPO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(batch),
    });

    const data = await response.json();
    results.push(...(data.data || []));
  }

  return results;
}

/**
 * Gửi push notification qua FCM
 * @param {string[]} tokens - Mảng FCM tokens
 * @param {object} message - { title, body, data }
 */
async function sendFCMPush(tokens, message) {
  const results = [];

  for (const token of tokens) {
    const response = await fetch(FCM_API, {
      method: 'POST',
      headers: {
        'Authorization': `key=${process.env.FCM_SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        notification: {
          title: message.title,
          body: message.body,
        },
        data: message.data || {},
        priority: 'high',
      }),
    });

    const data = await response.json();
    results.push({ token, success: data.success === 1 });
  }

  return results;
}

/**
 * Gửi push đến FCM topic (all subscribers)
 */
async function sendToTopic(topic, message) {
  const response = await fetch(FCM_API, {
    method: 'POST',
    headers: {
      'Authorization': `key=${process.env.FCM_SERVER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: `/topics/${topic}`,
      notification: {
        title: message.title,
        body: message.body,
      },
      data: message.data || {},
    }),
  });

  return response.json();
}

// =====================================================
// EXPRESS ROUTES
// =====================================================

/*
const express = require('express');
const router = express.Router();

// Database model giả định
// const PushToken = require('../models/PushToken');
// const News = require('../models/News');
// const Notification = require('../models/Notification');

// =====================================================
// 1. Đăng ký Push Token
// =====================================================
router.post('/push-token', async (req, res) => {
  try {
    const { token, userId, deviceId, platform } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Lưu hoặc cập nhật token
    await PushToken.upsert({
      token,
      userId: userId || null,
      deviceId: deviceId || null,
      platform: platform || 'unknown',
      isActive: true,
      lastUsed: new Date(),
    });

    res.json({ success: true, message: 'Token registered' });
  } catch (error) {
    console.error('Push token registration error:', error);
    res.status(500).json({ error: 'Failed to register token' });
  }
});

// =====================================================
// 2. Gửi thông báo hệ thống đến tất cả
// =====================================================
router.post('/notifications/broadcast', async (req, res) => {
  try {
    const { title, body, data, topic } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    // Gửi qua FCM topic (nếu có)
    if (topic) {
      const result = await sendToTopic(topic, { title, body, data });
      return res.json({ success: true, result });
    }

    // Lấy tất cả active tokens
    const tokens = await PushToken.findAll({ where: { isActive: true } });
    
    const expoTokens = tokens
      .filter(t => t.token.startsWith('ExponentPushToken['))
      .map(t => t.token);
    
    const fcmTokens = tokens
      .filter(t => !t.token.startsWith('ExponentPushToken['))
      .map(t => t.token);

    // Gửi song song
    const [expoResults, fcmResults] = await Promise.all([
      expoTokens.length > 0 ? sendExpoPush(expoTokens, { title, body, data }) : [],
      fcmTokens.length > 0 ? sendFCMPush(fcmTokens, { title, body, data }) : [],
    ]);

    // Lưu notification history
    await Notification.create({
      type: 'broadcast',
      title,
      body,
      data: JSON.stringify(data || {}),
      sentCount: expoTokens.length + fcmTokens.length,
      createdAt: new Date(),
    });

    res.json({
      success: true,
      sentTo: {
        expo: expoTokens.length,
        fcm: fcmTokens.length,
      },
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ error: 'Failed to send broadcast' });
  }
});

// =====================================================
// 3. Gửi thông báo đến user cụ thể
// =====================================================
router.post('/notifications/send', async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({ error: 'userId, title and body are required' });
    }

    // Lấy tokens của user
    const tokens = await PushToken.findAll({
      where: { userId, isActive: true }
    });

    if (tokens.length === 0) {
      return res.status(404).json({ error: 'No active tokens for this user' });
    }

    const tokenStrings = tokens.map(t => t.token);
    
    // Phân loại và gửi
    const expoTokens = tokenStrings.filter(t => t.startsWith('ExponentPushToken['));
    const fcmTokens = tokenStrings.filter(t => !t.startsWith('ExponentPushToken['));

    const results = await Promise.all([
      expoTokens.length > 0 ? sendExpoPush(expoTokens, { title, body, data }) : [],
      fcmTokens.length > 0 ? sendFCMPush(fcmTokens, { title, body, data }) : [],
    ]);

    res.json({ success: true, results });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// =====================================================
// 4. Tạo tin tức và gửi push
// =====================================================
router.post('/news', async (req, res) => {
  try {
    const { title, summary, content, category, imageUrl, isBreaking, sendPush } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Tạo tin tức
    const news = await News.create({
      title,
      summary: summary || content.substring(0, 200),
      content,
      category: category || 'general',
      imageUrl,
      isBreaking: isBreaking || false,
      publishedAt: new Date(),
    });

    // Gửi push notification nếu yêu cầu
    if (sendPush) {
      const tokens = await PushToken.findAll({ where: { isActive: true } });
      const tokenStrings = tokens.map(t => t.token);

      const message = {
        title: isBreaking ? `🔥 ${title}` : `📰 ${title}`,
        body: summary || content.substring(0, 100),
        data: {
          type: 'news',
          newsId: news.id.toString(),
          route: `/news/${news.id}`,
        },
      };

      // Gửi async (không chờ)
      sendExpoPush(
        tokenStrings.filter(t => t.startsWith('ExponentPushToken[')),
        message
      ).catch(err => console.error('Push error:', err));
    }

    res.json({ success: true, news });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ error: 'Failed to create news' });
  }
});

// =====================================================
// 5. Lấy lịch sử notifications đã gửi
// =====================================================
router.get('/notifications/history', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const notifications = await Notification.findAll({
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// =====================================================
// 6. Xóa token không hợp lệ (cleanup)
// =====================================================
router.delete('/push-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    await PushToken.update(
      { isActive: false },
      { where: { token } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Delete token error:', error);
    res.status(500).json({ error: 'Failed to delete token' });
  }
});

module.exports = router;
*/

// =====================================================
// DATABASE SCHEMA (SQL)
// =====================================================
/*
-- Push Tokens table
CREATE TABLE push_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  device_id VARCHAR(100),
  platform VARCHAR(20) DEFAULT 'unknown',
  is_active BOOLEAN DEFAULT true,
  last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_push_tokens_user ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_active ON push_tokens(is_active);

-- Notifications history table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  data JSONB,
  sent_count INTEGER DEFAULT 0,
  target_user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News table
CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  category VARCHAR(50) DEFAULT 'general',
  author VARCHAR(100),
  is_breaking BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  tags TEXT[],
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_published ON news(published_at DESC);
CREATE INDEX idx_news_breaking ON news(is_breaking) WHERE is_breaking = true;
*/

// Export cho TypeScript reference
module.exports = {
  sendExpoPush,
  sendFCMPush,
  sendToTopic,
};
