import re
with open('/var/www/baotienweb-api/public/admin-crm.html') as f:
    for i, line in enumerate(f, 1):
        # Find onclick handlers referencing 'TC'
        if re.search(r'onclick.*\bTC\b', line):
            print(f'{i}: {line.strip()[:200]}')
        # Also find any standalone TC( pattern
        if re.search(r'\bTC\s*\(', line):
            print(f'{i}[TC(]: {line.strip()[:200]}')
