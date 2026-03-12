#!/usr/bin/env python3
import re

CONF = '/etc/nginx/sites-enabled/baotienweb.cloud'

with open(CONF, 'r') as f:
    content = f.read()

# Remove the broken AI Render Studio blocks (from bad sed)
# Find and remove everything between "# AI Render Studio" and "# Root"
pattern = r'    # AI Render Studio.*?(?=    # Root - proxy to backend landing page)'
content = re.sub(pattern, '', content, flags=re.DOTALL)

# Insert correct blocks before "# Root - proxy to backend landing page"
new_blocks = """    # AI Render Studio - redirect non-trailing-slash
    location = /ai-render-studio {
        return 301 /ai-render-studio/;
    }

    # AI Render Studio static files
    location /ai-render-studio/ {
        alias /var/www/baotienweb-api/public/ai-render-studio/;
        try_files $uri $uri/ /ai-render-studio/index.html;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    """

content = content.replace(
    '    # Root - proxy to backend landing page',
    new_blocks + '# Root - proxy to backend landing page'
)

with open(CONF, 'w') as f:
    f.write(content)

print('Nginx config updated successfully')
