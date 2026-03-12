#!/bin/bash
FILE="/var/www/baotienweb-api/public/ai-render-studio/index.html"
sed -i 's|src="/assets/|src="./assets/|g' "$FILE"
sed -i 's|href="/assets/|href="./assets/|g' "$FILE"
grep -E "assets" "$FILE"
echo "DONE"
