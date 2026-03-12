import re

with open('/var/www/baotienweb-api/public/admin-crm.html') as f:
    content = f.read()
    lines = content.split('\n')

# Find all onclick handlers in template literals that might have truncated function names
for i, line in enumerate(lines, 1):
    # Look for onclick with function names that are uppercase or 2-3 chars
    matches = re.findall(r'onclick="(\w{1,3})\(', line)
    if matches:
        for m in matches:
            if m not in ('del', 'new', 'var', 'let'):
                print(f'Line {i}: onclick="{m}(..." -> {line.strip()[:150]}')

# Also look for any ${...} template interpolation that could generate TC
print('\n--- Template literals with short function calls ---')
for i, line in enumerate(lines, 1):
    matches = re.findall(r'onclick=.*?\$\{.*?\}.*?\(', line)
    if matches:
        print(f'Line {i}: {line.strip()[:200]}')
