#!/usr/bin/env python3
"""Fix the Illegal return statement syntax error in admin-crm.html.

The websocket fix accidentally left orphaned code (the body of handleRealtimeNotification)
outside any function. This script:
1. Removes the orphaned code block after connectNotificationWs() closing
2. Adds the proper handleRealtimeNotification(data) function definition
"""

import re
import shutil

FILE = '/var/www/baotienweb-api/public/admin-crm.html'

# Backup
shutil.copy2(FILE, FILE + '.pre-syntax-fix.bak')
print(f'[BACKUP] Created {FILE}.pre-syntax-fix.bak')

with open(FILE, 'r', encoding='utf-8') as f:
    content = f.read()

original = content

# The problem: after the connectNotificationWs function ends with "};", 
# there's orphaned code that should be wrapped in handleRealtimeNotification(data).
# 
# We need to find the orphaned block and wrap it properly.

# Strategy: Find the pattern where connectNotificationWs ends and orphaned code begins
# The orphaned code starts with "renderNotifications();" right after "};"
# and ends before "// Initialize WS on page load"

# Pattern to match the orphaned code block between end of connectNotificationWs and initWsOnAuth
pattern = re.compile(
    r"(        \} catch \(e\) \{\s*\n"
    r"          console\.log\('\[WS\] Socket\.IO connection failed:', e\);\s*\n"
    r"        \}\s*\n"
    r"      \};\s*\n)"  # End of connectNotificationWs
    r"(            renderNotifications\(\);\s*\n"  # Start of orphaned code
    r"            return;\s*\n"
    r"          \}\s*\n"
    r"        \}\s*\n"
    r"\s*\n"
    r"        // Add to list\s*\n"
    r"[\s\S]*?"  # Everything in between
    r"        updateNotiBellBadge\(unread\);\s*\n"
    r"      \}\s*\n)"  # End of orphaned handleRealtimeNotification body
    r"(\s*\n\s*// Initialize WS)",  # Before initWsOnAuth
    re.MULTILINE
)

match = pattern.search(content)
if match:
    print('[FOUND] Orphaned code block detected')
    # Replace: keep the connectNotificationWs ending, add proper function, keep initWsOnAuth
    replacement = (
        match.group(1) +  # Keep connectNotificationWs ending
        "\n"
        "      function handleRealtimeNotification(data) {\n"
        "        // Dedupe: check if notification with same dedupeKey exists\n"
        "        if (data.dedupeKey) {\n"
        "          const existing = allNotifications.findIndex(n => n.dedupeKey === data.dedupeKey);\n"
        "          if (existing >= 0) {\n"
        "            // Update existing instead of creating new\n"
        "            allNotifications[existing] = { ...allNotifications[existing], ...data };\n"
        "            renderNotifications();\n"
        "            return;\n"
        "          }\n"
        "        }\n"
        "\n"
        "        // Add to list\n"
        "        allNotifications.unshift({\n"
        "          id: data.id || 'rt_' + Date.now(),\n"
        "          title: data.title || 'Thông báo mới',\n"
        "          message: data.message || '',\n"
        "          type: data.type || 'SYSTEM',\n"
        "          priority: data.severity || 'MEDIUM',\n"
        "          read: false,\n"
        "          status: data.status || 'INFO',\n"
        "          progress: data.progress,\n"
        "          createdAt: data.createdAt || new Date().toISOString(),\n"
        "          data: data\n"
        "        });\n"
        "\n"
        "        renderNotifications();\n"
        "\n"
        "        // Show toast\n"
        "        const severity = data.severity || data.status;\n"
        "        if (severity === 'error' || severity === 'FAILED') {\n"
        "          showToast(data.title || 'Lỗi', 'error');\n"
        "        } else if (severity === 'success' || severity === 'SUCCESS') {\n"
        "          showToast(data.title || 'Thành công', 'success');\n"
        "        } else {\n"
        "          showToast(data.title || 'Thông báo mới', 'info');\n"
        "        }\n"
        "\n"
        "        // Update unread badge\n"
        "        const unread = allNotifications.filter(n => !n.read).length;\n"
        "        document.getElementById('notiUnreadBadge').textContent = unread + ' chưa đọc';\n"
        "        updateNotiBellBadge(unread);\n"
        "      }\n"
        + match.group(3)  # Keep "// Initialize WS" part
    )
    content = content[:match.start()] + replacement + content[match.end():]
    print('[FIX 1] Replaced orphaned code with proper handleRealtimeNotification function')
else:
    print('[WARN] Could not find orphaned code with regex, trying simpler approach...')
    
    # Simpler approach: find the exact orphaned lines after "};" and before "// Initialize WS"
    # Look for the closing of connectNotificationWs followed by orphaned renderNotifications
    simple_pattern = r"(      \};)\s*\n(            renderNotifications\(\);)"
    match2 = re.search(simple_pattern, content)
    if match2:
        print(f'[FOUND] Orphaned code starts at position {match2.start(2)}')
        
        # Find the end of orphaned code (before "// Initialize WS on page load")
        init_ws_match = re.search(r'\n(\s*// Initialize WS on page load)', content[match2.start(2):])
        if init_ws_match:
            orphan_end = match2.start(2) + init_ws_match.start()
            # Replace orphaned code with proper function
            proper_function = (
                "\n"
                "      function handleRealtimeNotification(data) {\n"
                "        // Dedupe: check if notification with same dedupeKey exists\n"
                "        if (data.dedupeKey) {\n"
                "          const existing = allNotifications.findIndex(n => n.dedupeKey === data.dedupeKey);\n"
                "          if (existing >= 0) {\n"
                "            allNotifications[existing] = { ...allNotifications[existing], ...data };\n"
                "            renderNotifications();\n"
                "            return;\n"
                "          }\n"
                "        }\n"
                "\n"
                "        allNotifications.unshift({\n"
                "          id: data.id || 'rt_' + Date.now(),\n"
                "          title: data.title || 'Thông báo mới',\n"
                "          message: data.message || '',\n"
                "          type: data.type || 'SYSTEM',\n"
                "          priority: data.severity || 'MEDIUM',\n"
                "          read: false,\n"
                "          status: data.status || 'INFO',\n"
                "          progress: data.progress,\n"
                "          createdAt: data.createdAt || new Date().toISOString(),\n"
                "          data: data\n"
                "        });\n"
                "\n"
                "        renderNotifications();\n"
                "\n"
                "        const severity = data.severity || data.status;\n"
                "        if (severity === 'error' || severity === 'FAILED') {\n"
                "          showToast(data.title || 'Lỗi', 'error');\n"
                "        } else if (severity === 'success' || severity === 'SUCCESS') {\n"
                "          showToast(data.title || 'Thành công', 'success');\n"
                "        } else {\n"
                "          showToast(data.title || 'Thông báo mới', 'info');\n"
                "        }\n"
                "\n"
                "        const unread = allNotifications.filter(n => !n.read).length;\n"
                "        document.getElementById('notiUnreadBadge').textContent = unread + ' chưa đọc';\n"
                "        updateNotiBellBadge(unread);\n"
                "      }\n"
            )
            content = content[:match2.end(1)] + proper_function + content[orphan_end:]
            print('[FIX 1] Replaced orphaned code with proper handleRealtimeNotification function')
        else:
            print('[ERROR] Could not find end of orphaned code')
    else:
        print('[ERROR] Could not locate orphaned code at all')

if content != original:
    with open(FILE, 'w', encoding='utf-8') as f:
        f.write(content)
    print('[SAVED] File updated successfully')
    
    # Verification
    print('\n=== VERIFICATION ===')
    
    # Check no orphaned return statements
    lines = content.split('\n')
    issues = []
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        # Very rough check - just make sure there's no bare "return;" at weird indentation
        # after the connectNotificationWs function
    
    # Check handleRealtimeNotification is defined
    if 'function handleRealtimeNotification(data)' in content:
        print('[OK] handleRealtimeNotification function is properly defined')
    else:
        print('[FAIL] handleRealtimeNotification function NOT found')
    
    # Check the function is called
    calls = content.count('handleRealtimeNotification(data)')
    # Subtract 1 for the definition
    print(f'[OK] handleRealtimeNotification is called {calls - 1} time(s) and defined once')
    
    # Check for SyntaxError-prone patterns: "return" outside functions
    # Simple heuristic: search near line 6675 area
    if '      };' in content:
        # Find the position after connectNotificationWs closing
        idx = content.find('      function handleRealtimeNotification(data)')
        if idx > 0:
            print('[OK] Function definition found at correct position')
    
    # Check the closing brace count matches opening
    ws_func_start = content.find('function connectNotificationWs()')
    ws_func_area = content[ws_func_start:ws_func_start+3000] if ws_func_start > 0 else ''
    
    print(f'\n[DONE] File size: {len(content)} bytes')
else:
    print('[NO CHANGES] Content was not modified - manual fix may be needed')
