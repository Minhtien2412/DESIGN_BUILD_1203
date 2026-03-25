#!/usr/bin/env python3
"""Fix api.baotienweb.cloud Nginx socket.io location to include full proxy headers"""
import re

path = "/etc/nginx/sites-enabled/api.baotienweb.cloud"
content = open(path).read()

# Match the existing socket.io location block
old_pat = r"location /socket\.io/ \{[^}]+\}"
m = re.search(old_pat, content)

if m:
    old = m.group(0)
    new = """location /socket.io/ {
        proxy_pass http://baotienweb_api_docker/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }"""
    content = content.replace(old, new)
    open(path, "w").write(content)
    print("PATCHED OK")
else:
    print("SOCKET.IO BLOCK NOT FOUND")
