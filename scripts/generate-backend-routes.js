#!/usr/bin/env node

/**
 * Script để generate backend route templates
 * Chạy: node scripts/generate-backend-routes.js
 */

const fs = require('fs');
const path = require('path');

const routes = {
  users: [
    { path: '/contacts', method: 'GET', description: 'Lấy danh sách contacts' },
    { path: '/presence', method: 'POST', description: 'Cập nhật trạng thái online' },
    { path: '/search', method: 'GET', description: 'Tìm kiếm users' }
  ],
  'video-call': [
    { path: '/sessions', method: 'POST', description: 'Tạo session video call' },
    { path: '/sessions/:id/join', method: 'POST', description: 'Join video call' },
    { path: '/sessions/:id/end', method: 'POST', description: 'Kết thúc video call' },
    { path: '/history', method: 'GET', description: 'Lấy lịch sử cuộc gọi' },
    { path: '/history', method: 'POST', description: 'Lưu lịch sử cuộc gọi' },
    { path: '/history/:callId', method: 'PUT', description: 'Cập nhật lịch sử' },
    { path: '/invite', method: 'POST', description: 'Gửi lời mời' },
    { path: '/ice-config', method: 'GET', description: 'Lấy ICE config' },
    { path: '/sessions/:id/feedback', method: 'POST', description: 'Gửi feedback' },
    { path: '/notifications', method: 'GET', description: 'Lấy thông báo' },
    { path: '/notifications/:id/read', method: 'POST', description: 'Đánh dấu đã đọc' }
  ],
  'auth': [
    { path: '/api-key', method: 'POST', description: 'Tạo API key' },
    { path: '/api-key/refresh', method: 'POST', description: 'Refresh API key' },
    { path: '/api-key/revoke', method: 'POST', description: 'Thu hồi API key' }
  ]
};

function generateRouteTemplate(prefix, routeList) {
  const routerName = `${prefix.replace('/', '')}.routes.ts`;
  const content = `import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';

const router = Router();

// ${prefix} routes
${routeList.map(route => {
  const method = route.method.toLowerCase();
  const pathParam = route.path.includes(':') ? ', requireAuth' : '';
  return `router.${method}('${route.path}'${pathParam}, async (req, res) => {
  try {
    // TODO: Implement ${route.description}
    // const { ... } = req.body;
    // const userId = (req as AuthedRequest).userId;

    // Placeholder response
    res.json({
      success: true,
      message: '${route.description} - Not implemented yet',
      data: null
    });
  } catch (error) {
    console.error('Error in ${prefix}${route.path}:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' }
    });
  }
});`;
}).join('\n\n')}

export default router;
`;

  return { routerName, content };
}

function generateMainRoutesUpdate() {
  return `
// Thêm vào server/src/index.ts sau các routes hiện tại:

// User routes
import userRouter from './routes/users.routes.js';
app.use('/users', userRouter);

// Video call routes
import videoCallRouter from './routes/video-call.routes.js';
app.use('/video-call', videoCallRouter);

// API Key routes (thêm vào auth router)
import apiKeyRouter from './routes/api-key.routes.js';
app.use('/auth', apiKeyRouter);
`;
}

// Generate files
Object.entries(routes).forEach(([prefix, routeList]) => {
  const { routerName, content } = generateRouteTemplate(prefix, routeList);
  const filePath = path.join(__dirname, '..', 'server', 'src', 'routes', routerName);

  // Create directory if not exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, content);
  console.log(`Generated ${routerName}`);
});

// Generate main routes update
const mainRoutesContent = generateMainRoutesUpdate();
const mainRoutesPath = path.join(__dirname, '..', 'server', 'src', 'ROUTES_UPDATE.md');
fs.writeFileSync(mainRoutesPath, mainRoutesContent);
console.log('Generated ROUTES_UPDATE.md');

console.log('\n✅ Generated backend route templates!');
console.log('📁 Check server/src/routes/ for new files');
console.log('📄 Check server/src/ROUTES_UPDATE.md for integration instructions');