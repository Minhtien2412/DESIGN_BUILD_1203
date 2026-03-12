#!/usr/bin/env python3
"""
Fix admin-crm.html WebSocket issues:
1. Add Socket.IO client CDN (backend uses Socket.IO, not raw WS)
2. Rewrite connectNotificationWs to use Socket.IO client with /notifications namespace
3. Add max reconnect attempts to prevent infinite retry spam
4. Limit WS reconnect to max 5 attempts then stop
"""
import re

HTML_PATH = '/var/www/baotienweb-api/public/admin-crm.html'

with open(HTML_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

original = content
changes = 0

# ============================================================
# FIX 1: Add Socket.IO client CDN in <head>
# ============================================================
# Add it before the closing </head> or after the last <link> in head
# Best: add after bootstrap-icons CDN (if exists) or before </head>
if 'socket.io' not in content:
    # Insert Socket.IO CDN before closing style or after last CDN link
    head_insert = '<script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>\n'
    
    # Insert before </head>
    if '</head>' in content:
        content = content.replace('</head>', head_insert + '  </head>', 1)
        changes += 1
        print('[FIX 1] Added Socket.IO client CDN')
    else:
        print('[SKIP 1] </head> not found')
else:
    print('[SKIP 1] Socket.IO client already loaded')

# ============================================================
# FIX 2: Replace raw WebSocket notification code with Socket.IO
# ============================================================
old_ws_func = """      // WebSocket for real-time notifications
      function connectNotificationWs() {
        if (notiWs && notiWs.readyState === WebSocket.OPEN) return;
        const wsUrl = location.protocol === 'https:'
          ? 'wss://' + location.host + '/ws?token=' + authToken
          : 'ws://' + location.host + '/ws?token=' + authToken;

        try {
          notiWs = new WebSocket(wsUrl);

          notiWs.onopen = () => {
            console.log('[WS] Notification connected');
            // Send auth
            notiWs.send(JSON.stringify({ type: 'AUTH', token: authToken }));
          };

          notiWs.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.type === 'AUTH_OK') {
                console.log('[WS] Authenticated');
                return;
              }
              if (data.type === 'AUTH_EXPIRED') {
                console.log('[WS] Token expired, reconnecting...');
                doRefreshToken().then(() => connectNotificationWs());
                return;
              }
              if (data.channel === 'NOTIFICATION' || data.type?.startsWith('NOTI')) {
                handleRealtimeNotification(data);
              }
              // ACK
              if (data.id) {
                notiWs.send(JSON.stringify({ type: 'ACK', id: data.id }));
              }
            } catch (e) {
              console.log('[WS] Parse error:', e);
            }
          };

          notiWs.onclose = () => {
            console.log('[WS] Disconnected, reconnecting in 5s...');
            if (notiReconnectTimer) clearTimeout(notiReconnectTimer);
            notiReconnectTimer = setTimeout(connectNotificationWs, 5000);
          };

          notiWs.onerror = (err) => {
            console.log('[WS] Error:', err);
          };
        } catch (e) {
          console.log('[WS] Connection failed:', e);
        }
      }"""

new_ws_func = """      // Socket.IO for real-time notifications
      let notiReconnectAttempts = 0;
      const NOTI_MAX_RECONNECT = 5;

      function connectNotificationWs() {
        // Use Socket.IO instead of raw WebSocket
        if (typeof io === 'undefined') {
          console.log('[WS] Socket.IO not loaded, skipping real-time notifications');
          return;
        }
        // Don't reconnect if already connected
        if (notiWs && notiWs.connected) return;
        // Disconnect old socket if exists
        if (notiWs) { try { notiWs.disconnect(); } catch(e) {} }

        try {
          notiWs = io(location.origin + '/notifications', {
            transports: ['websocket', 'polling'],
            auth: { token: authToken },
            reconnection: true,
            reconnectionAttempts: NOTI_MAX_RECONNECT,
            reconnectionDelay: 5000,
          });

          notiWs.on('connect', () => {
            console.log('[WS] Notification Socket.IO connected');
            notiReconnectAttempts = 0;
            // Register current user
            if (currentUser?.id) {
              const userId = typeof currentUser.id === 'number' ? currentUser.id
                : parseInt(currentUser.id) || currentUser.id;
              notiWs.emit('register', { userId: userId });
            }
          });

          notiWs.on('registered', (data) => {
            console.log('[WS] Registered:', data);
          });

          notiWs.on('notification', (data) => {
            console.log('[WS] Notification received:', data);
            handleRealtimeNotification(data);
          });

          notiWs.on('broadcast', (data) => {
            console.log('[WS] Broadcast:', data);
            handleRealtimeNotification(data);
          });

          notiWs.on('disconnect', (reason) => {
            console.log('[WS] Disconnected:', reason);
          });

          notiWs.on('connect_error', (err) => {
            notiReconnectAttempts++;
            if (notiReconnectAttempts >= NOTI_MAX_RECONNECT) {
              console.log('[WS] Max reconnect attempts reached, stopping');
              notiWs.disconnect();
            } else {
              console.log(`[WS] Connection error (${notiReconnectAttempts}/${NOTI_MAX_RECONNECT}):`, err.message);
            }
          });

          notiWs.on('pong', (data) => {
            // Keepalive response
          });

        } catch (e) {
          console.log('[WS] Socket.IO connection failed:', e);
        }
      }"""

if old_ws_func in content:
    content = content.replace(old_ws_func, new_ws_func, 1)
    changes += 1
    print('[FIX 2] Replaced raw WebSocket with Socket.IO client')
else:
    print('[SKIP 2] WebSocket function pattern not found, trying flexible match')
    # Try a more flexible approach
    # Find the function start
    start_marker = '// WebSocket for real-time notifications'
    end_marker = "console.log('[WS] Connection failed:', e);"
    
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)
    
    if start_idx >= 0 and end_idx >= 0:
        # Find the closing braces after end_marker
        rest = content[end_idx:]
        # Find: }  }  } pattern (catch, try, function)
        brace_count = 0
        func_end = end_idx
        for i, ch in enumerate(rest):
            if ch == '}':
                brace_count += 1
                if brace_count >= 3:
                    func_end = end_idx + i + 1
                    break
        
        # Replace the whole function
        old_func = content[start_idx:func_end]
        content = content[:start_idx] + new_ws_func.lstrip() + content[func_end:]
        changes += 1
        print('[FIX 2] Replaced WebSocket via flexible match')
    else:
        print(f'[FAIL 2] Could not find WS function (start: {start_idx}, end: {end_idx})')

# ============================================================
# FIX 3: Also fix the notiWs variable declaration if it uses WebSocket type
# ============================================================
# Change any raw WS checks like notiWs.readyState === WebSocket.OPEN
content = content.replace('notiWs.readyState === WebSocket.OPEN', 'notiWs && notiWs.connected')

# ============================================================
# FIX 4: Fix any other place that tries raw notiWs.send()
# ============================================================
# The handleRealtimeNotification might try notiWs.send for ACK
content = content.replace(
    "notiWs.send(JSON.stringify({ type: 'ACK', id: data.id }));",
    "// ACK handled by Socket.IO automatically"
)

# ============================================================
# SAVE
# ============================================================
if content != original:
    import shutil, os
    backup = HTML_PATH + '.pre-ws-fix.bak'
    if not os.path.exists(backup):
        shutil.copy2(HTML_PATH, backup)
    
    with open(HTML_PATH, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'\n=== SAVED {changes} fixes to {HTML_PATH} ===')
else:
    print('\nNo changes made')

# Verify
with open(HTML_PATH, 'r', encoding='utf-8') as f:
    final = f.read()

checks = [
    ("Socket.IO CDN loaded", 'socket.io.min.js' in final),
    ("No raw WebSocket /ws", "'wss://' + location.host + '/ws'" not in final),
    ("Socket.IO namespace /notifications", "'/notifications'" in final),
    ("Max reconnect limit", "NOTI_MAX_RECONNECT" in final),
    ("io() call exists", "io(location.origin" in final),
]
print('\n--- Verification ---')
for label, ok in checks:
    print(f'  {"OK" if ok else "FAIL"}: {label}')
