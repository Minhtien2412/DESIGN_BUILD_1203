#!/bin/bash
# Fix users-admin.controller.js routes: :id -> admin/:id
FILE="/var/www/baotienweb-api/dist/crm/users-admin.controller.js"
cp "$FILE" "${FILE}.bak"

# Use python3 for reliable string replacement
python3 -c "
import re
with open('$FILE','r') as f: c=f.read()
# Change :id routes to admin/:id (except admin/list which is correct)
c = c.replace(\"(0, common_1.Get)(':id')\",\"(0, common_1.Get)('admin/:id')\")
c = c.replace(\"(0, common_1.Put)(':id')\",\"(0, common_1.Put)('admin/:id')\")
c = c.replace(\"(0, common_1.Patch)(':id/role')\",\"(0, common_1.Patch)('admin/:id/role')\")
c = c.replace(\"(0, common_1.Patch)(':id/ban')\",\"(0, common_1.Patch)('admin/:id/ban')\")
c = c.replace(\"(0, common_1.Delete)(':id')\",\"(0, common_1.Delete)('admin/:id')\")
with open('$FILE','w') as f: f.write(c)
print('Routes fixed')
"

# Verify
echo "=== After fix ==="
grep -E "common_1\.(Get|Put|Patch|Delete)" "$FILE"
