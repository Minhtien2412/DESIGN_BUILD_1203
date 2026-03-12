#!/bin/bash
# Update OPENAI_API_KEY in .env
ENV_FILE="/var/www/baotienweb-api/.env"
NEW_KEY='YOUR_OPENAI_API_KEY_HERE'

# Remove old OPENAI_API_KEY line and add new one
grep -v '^OPENAI_API_KEY=' "$ENV_FILE" > "${ENV_FILE}.tmp"
echo "OPENAI_API_KEY=\"$NEW_KEY\"" >> "${ENV_FILE}.tmp"
mv "${ENV_FILE}.tmp" "$ENV_FILE"

echo "Updated OPENAI_API_KEY:"
grep 'OPENAI_API_KEY' "$ENV_FILE"
