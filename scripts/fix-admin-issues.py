#!/usr/bin/env python3
"""
Fix admin-crm.html issues:
1. Chat room creation: send projectId (integer), remove type field
2. Product creation: remove status/comparePrice, fix category enum
3. User action buttons: /users/${id} -> /users/admin/${id}
4. Settings: fix health response parsing (info.database.status)
5. Product form: correct category options, remove status select
"""
import re, os, shutil

HTML_PATH = '/var/www/baotienweb-api/public/admin-crm.html'

with open(HTML_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

original = content
changes = 0

# ============================================================
# FIX 1: Chat room creation
# Exact current code:
#   body: JSON.stringify({ name: name, type: 'GROUP' })
# Need:
#   body: JSON.stringify({ name: name, projectId: 1 })
# ============================================================
old = "body: JSON.stringify({ name: name, type: 'GROUP' })"
new = "body: JSON.stringify({ name: name, projectId: 1 })"
if old in content:
    content = content.replace(old, new, 1)
    changes += 1
    print('[FIX 1] Chat: replaced type:GROUP with projectId:1')
else:
    print('[SKIP 1] Chat pattern not found')

# ============================================================
# FIX 2: Product saveProduct() - remove status and comparePrice
# ============================================================
old_product = """const payload = {
          name: document.getElementById('editProductName').value,
          description:
            document.getElementById('editProductDesc').value || undefined,
          price: parseFloat(document.getElementById('editProductPrice').value),
          comparePrice:
            parseFloat(
              document.getElementById('editProductComparePrice').value,
            ) || undefined,
          stock:
            parseInt(document.getElementById('editProductStock').value) || 0,
          category: document.getElementById('editProductCategory').value,
          status: document.getElementById('editProductStatus').value,
          images: document
            .getElementById('editProductImages')
            .value.split('\\n')
            .map((s) => s.trim())
            .filter(Boolean),
        };"""

new_product = """const _pName = document.getElementById('editProductName').value.trim();
        const _pPrice = document.getElementById('editProductPrice').value;
        const _pCat = document.getElementById('editProductCategory').value;
        const _validCats = ['ELECTRONICS','FASHION','HOME','BEAUTY','SPORTS','BOOKS','TOYS','FOOD','OTHER'];
        if (!_pName) { alert('Vui lòng nhập tên sản phẩm'); return; }
        if (!_pPrice || isNaN(parseFloat(_pPrice)) || parseFloat(_pPrice) < 0) { alert('Vui lòng nhập giá hợp lệ (>= 0)'); return; }
        if (!_validCats.includes(_pCat)) { alert('Danh mục không hợp lệ. Chọn: ' + _validCats.join(', ')); return; }
        const _imgLines = (document.getElementById('editProductImages')?.value || '').split('\\n').map(s=>s.trim()).filter(Boolean);
        const payload = {
          name: _pName,
          description: document.getElementById('editProductDesc')?.value?.trim() || undefined,
          price: parseFloat(_pPrice),
          stock: parseInt(document.getElementById('editProductStock')?.value) || 0,
          category: _pCat,
          images: _imgLines.length > 0 ? _imgLines : undefined,
        };"""

if old_product in content:
    content = content.replace(old_product, new_product, 1)
    changes += 1
    print('[FIX 2] Product saveProduct: removed status/comparePrice, added validation')
else:
    print('[SKIP 2] Product payload exact match not found, trying line-by-line')
    # Fallback: remove just the problematic lines
    c1 = content.count('status: document.getElementById')
    content = re.sub(
        r"\s*status:\s*document\.getElementById\('editProductStatus'\)\.value,",
        "",
        content, count=1
    )
    content = re.sub(
        r"\s*comparePrice:\s*\n\s*parseFloat\(\s*\n\s*document\.getElementById\('editProductComparePrice'\)\.value,\s*\n\s*\)\s*\|\|\s*undefined,",
        "",
        content, count=1
    )
    c2 = content.count('status: document.getElementById')
    if c2 < c1:
        changes += 1
        print('[FIX 2] Product: removed status/comparePrice via regex fallback')

# ============================================================
# FIX 3: User /users/${id} -> /users/admin/${id}
# Current code uses: fetchAPI(`/users/${id}`)  and  fetchAPI(`/users/${id}/role`)
# Need:              fetchAPI(`/users/admin/${id}`) etc.
# BUT: preserve /users/admin/ if already there, and /users/list patterns
# ============================================================

# Step 1: Replace fetchAPI(`/users/${...}` with fetchAPI(`/users/admin/${...}`
# But NOT /users/admin/ or /users/list or /users/signup etc
# We target: /users/${id} /users/${id}/role /users/${id}/ban
# Pattern: /users/${ but NOT /users/admin/

count_before = content.count('/users/admin/')

# Replace backtick patterns: `/users/${id}` -> `/users/admin/${id}`
# This handles: /users/${id}, /users/${id}/role, /users/${id}/ban, /users/${currentUser.id}
content = re.sub(
    r'`/users/\$\{',
    '`/users/admin/${',
    content
)
# Fix any that were already /users/admin/ -> now /users/admin/admin/
content = content.replace('/users/admin/admin/', '/users/admin/')

count_after = content.count('/users/admin/')
if count_after > count_before:
    changes += 1
    print(f'[FIX 3] Users: converted {count_after - count_before} /users/${{id}} -> /users/admin/${{id}}')
else:
    print('[SKIP 3] No user endpoint changes needed')

# ============================================================
# FIX 4: Settings health - fix data path
# API returns: { status, timestamp, uptime, info: { database: { status }, memory: { status, heap: { heapUsed } } } }
# Current code uses: health.database?.status, health.db, health.memory.heapUsed
# Need:              health.info?.database?.status, health.info?.memory?.heap?.heapUsed
# ============================================================

# Fix the loadSystemHealth function's innerHTML template
old_health = """<li class="list-group-item d-flex justify-content-between"><span>Database</span><span class="badge bg-${health.database?.status === 'up' || health.db === 'up' ? 'success' : 'danger'}">${health.database?.status || health.db || 'unknown'}</span></li>"""

new_health = """<li class="list-group-item d-flex justify-content-between"><span>Database</span><span class="badge bg-${health.info?.database?.status === 'up' ? 'success' : 'danger'}">${health.info?.database?.status || 'unknown'}</span></li>"""

if old_health in content:
    content = content.replace(old_health, new_health, 1)
    changes += 1
    print('[FIX 4a] Settings: fixed database status path (info.database.status)')
else:
    print('[SKIP 4a] Database health pattern not found')

# Fix memory path
old_mem = "health.memory ? Math.round(health.memory.heapUsed / 1024 / 1024)"
new_mem = "health.info?.memory?.heap ? Math.round(health.info.memory.heap.heapUsed / 1024 / 1024)"
if old_mem in content:
    content = content.replace(old_mem, new_mem, 1)
    changes += 1
    print('[FIX 4b] Settings: fixed memory path (info.memory.heap.heapUsed)')
else:
    print('[SKIP 4b] Memory health pattern not found')

# ============================================================
# FIX 5: Product form - fix category <select> options
# Current: CONSTRUCTION, TOOLS, ELECTRICAL, PLUMBING, PAINT, FURNITURE, OTHER
# Need:    ELECTRONICS, FASHION, HOME, BEAUTY, SPORTS, BOOKS, TOYS, FOOD, OTHER
# ============================================================
old_cat_options = """<select class="form-select" id="editProductCategory">
                  <option value="CONSTRUCTION">Vật liệu xây dựng</option>
                  <option value="TOOLS">Dụng cụ</option>
                  <option value="ELECTRICAL">Điện</option>
                  <option value="PLUMBING">Nước</option>
                  <option value="PAINT">Sơn</option>
                  <option value="FURNITURE">Nội thất</option>
                  <option value="OTHER">Khác</option>
                </select>"""

new_cat_options = """<select class="form-select" id="editProductCategory">
                  <option value="ELECTRONICS">Điện tử</option>
                  <option value="FASHION">Thời trang</option>
                  <option value="HOME">Nội thất & Gia dụng</option>
                  <option value="BEAUTY">Làm đẹp</option>
                  <option value="SPORTS">Thể thao</option>
                  <option value="BOOKS">Sách</option>
                  <option value="TOYS">Đồ chơi</option>
                  <option value="FOOD">Thực phẩm</option>
                  <option value="OTHER">Khác</option>
                </select>"""

if old_cat_options in content:
    content = content.replace(old_cat_options, new_cat_options, 1)
    changes += 1
    print('[FIX 5a] Product form: fixed category options to match ProductCategory enum')
else:
    print('[SKIP 5a] Category select pattern not found')

# Fix default category in openAddProductModal (CONSTRUCTION -> ELECTRONICS)
old_default_cat = "document.getElementById('editProductCategory').value = 'CONSTRUCTION';"
new_default_cat = "document.getElementById('editProductCategory').value = 'ELECTRONICS';"
if old_default_cat in content:
    content = content.replace(old_default_cat, new_default_cat, 1)
    changes += 1
    print('[FIX 5b] Product form: fixed default category CONSTRUCTION -> ELECTRONICS')

# Remove the status <select> group from product form HTML
old_status_html = """<div class="col-md-6">
                <label class="form-label">Trạng thái</label>
                <select class="form-select" id="editProductStatus">
                  <option value="APPROVED">Đã duyệt</option>
                  <option value="PENDING">Chờ duyệt</option>
                  <option value="REJECTED">Từ chối</option>
                </select>
              </div>"""

new_status_html = """<div class="col-md-6">
                <!-- Status field removed - not in CreateProductDto -->
              </div>"""

if old_status_html in content:
    content = content.replace(old_status_html, new_status_html, 1)
    changes += 1
    print('[FIX 5c] Product form: removed Status select (not in DTO)')
else:
    print('[SKIP 5c] Status select HTML pattern not found')

# Remove editProductStatus references in editProduct/openAddProduct JS
content = re.sub(
    r"\s*document\.getElementById\('editProductStatus'\)\.value\s*=\s*[^;]+;",
    "",
    content
)
# Remove editProductComparePrice references in editProduct/openAddProduct JS
content = re.sub(
    r"\s*document\.getElementById\('editProductComparePrice'\)\.value\s*=\s*[^;]+;",
    "",
    content
)
print('[FIX 5d] Removed JS refs to editProductStatus and editProductComparePrice')

# ============================================================
# FIX 6: Also fix the sidebar API section that got injected into health HTML
# The HTML output shows API section was concatenated into systemHealthInfo
# This is because the loadSystemHealth template literal was not properly closed
# ============================================================
# Check if API sidebar <li> exists inside loadSystemHealth
if '<!-- API Section -->' in content:
    # Check if it's inside the systemHealthInfo innerHTML
    health_func = re.search(r"document\.getElementById\('systemHealthInfo'\)\.innerHTML\s*=\s*`(.*?)`\s*;", content, re.DOTALL)
    if health_func and '<!-- API Section -->' in health_func.group(1):
        # The API section was accidentally concatenated into the health template
        # We need to close the template properly and move API section out
        old_template = health_func.group(0)
        # Find where the </ul> should close the health list
        health_content = health_func.group(1)
        # Split at the API section marker
        parts = health_content.split('<!-- API Section -->')
        if len(parts) == 2:
            # Fix: close template after the health list, before API section
            fixed_health = health_content.split('\n        <!-- API Section -->')[0].rstrip()
            if not fixed_health.strip().endswith('</ul>'):
                fixed_health += '\n            </ul>'
            new_template = f"document.getElementById('systemHealthInfo').innerHTML = `{fixed_health}`;"
            content = content.replace(old_template, new_template, 1)
            changes += 1
            print('[FIX 6] Fixed systemHealthInfo template that contained API sidebar HTML')

# ============================================================
# SAVE
# ============================================================
if content != original:
    backup = HTML_PATH + '.pre-fix4.bak'
    if not os.path.exists(backup):
        shutil.copy2(HTML_PATH, backup)

    with open(HTML_PATH, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'\n=== SAVED {changes} fixes to {HTML_PATH} ===')
else:
    print('\nNo changes needed')

# Verify
print('\n--- VERIFICATION ---')
with open(HTML_PATH, 'r', encoding='utf-8') as f:
    final = f.read()

checks = [
    ("Chat projectId", "projectId: 1" in final),
    ("No type: GROUP", "type: 'GROUP'" not in final),
    ("No comparePrice in payload", "comparePrice:" not in final.split('saveProduct')[1].split('try {')[0] if 'saveProduct' in final else True),
    ("Users admin endpoints", "/users/admin/${" in final),
    ("No /users/${id} direct", final.count('`/users/${') == 0),
    ("Health info.database", "info?.database?.status" in final),
    ("Health info.memory", "info?.memory?.heap" in final),
    ("Category ELECTRONICS", 'value="ELECTRONICS"' in final),
    ("No CONSTRUCTION cat", 'value="CONSTRUCTION"' not in final),
]
for label, ok in checks:
    print(f'  {"OK" if ok else "FAIL"}: {label}')

print('\nDone!')
