#!/bin/bash
cd /var/www/baotienweb-api

echo "=== Fixing remaining dist/ files ==="

# Fix dist files that still have ParseIntPipe
for f in dist/posts/posts.controller.js dist/kyc/kyc.controller.js dist/tasks/tasks.controller.js dist/projects/projects.controller.js dist/comments/comments.controller.js dist/shared/shared.module.js; do
  if [ -f "$f" ]; then
    # Replace ParseIntPipe with FlexibleIdPipe
    sed -i 's/ParseIntPipe/FlexibleIdPipe/g' "$f"
    
    # Add FlexibleIdPipe require if not present
    if ! grep -q 'flexible-id.pipe' "$f"; then
      # Calculate relative path
      dir=$(dirname "$f")
      depth=$(echo "$dir" | tr '/' '\n' | wc -l)
      if [ "$depth" -eq 2 ]; then
        rel="../shared/pipes/flexible-id.pipe"
      else
        rel="./pipes/flexible-id.pipe"
      fi
      sed -i "1i const { FlexibleIdPipe } = require(\"$rel\");" "$f"
    fi
    echo "  Fixed: $f"
  fi
done

# Fix shared.module.ts source (remove duplicate FlexibleIdPipe)
SHARED_SRC="src/shared/shared.module.ts"
if [ -f "$SHARED_SRC" ]; then
  echo "  Fixing shared.module.ts..."
  # Remove the duplicate FlexibleIdPipe import line if it exists
  # Keep only one import of FlexibleIdPipe
  python3 -c "
import re
with open('$SHARED_SRC', 'r') as f:
    content = f.read()

# Remove duplicate FlexibleIdPipe imports
lines = content.split('\n')
seen_flexible = False
new_lines = []
for line in lines:
    if 'FlexibleIdPipe' in line and 'import' in line.lower():
        if not seen_flexible:
            # Keep the first proper import
            if 'flexible-id.pipe' in line:
                seen_flexible = True
                new_lines.append(line)
            elif 'parse-int.pipe' in line:
                # This is wrong import, skip
                continue
            else:
                seen_flexible = True
                new_lines.append(line)
        else:
            continue  # Skip duplicate
    else:
        new_lines.append(line)

content = '\n'.join(new_lines)

# Make sure FlexibleIdPipe is imported from correct path
if 'FlexibleIdPipe' not in content or 'flexible-id.pipe' not in content:
    # Add correct import
    content = content.replace(
        \"import { FlexibleIdPipe } from './pipes/flexible-id.pipe';\",
        ''
    )
    # Add after the first import
    idx = content.find(\";\n\") + 2
    content = content[:idx] + \"import { FlexibleIdPipe } from './pipes/flexible-id.pipe';\n\" + content[idx:]

with open('$SHARED_SRC', 'w') as f:
    f.write(content)
print('  Shared module fixed')
"
  # Recompile shared module
  npx tsc src/shared/shared.module.ts --outDir dist --rootDir src --skipLibCheck --target ES2021 --module commonjs --esModuleInterop --experimentalDecorators --emitDecoratorMetadata --declaration 2>&1 | head -5
fi

echo ""
echo "=== Verify remaining ParseIntPipe refs ==="
remaining=$(grep -rln 'ParseIntPipe' dist/ --include='*.js' 2>/dev/null | grep -v 'parse-int.pipe' | grep -v 'flexible-id.pipe')
if [ -z "$remaining" ]; then
  echo "  CLEAN! No more ParseIntPipe in dist/"
else
  echo "  Still found in:"
  echo "$remaining"
fi

echo ""
echo "=== Restart PM2 ==="
pm2 restart baotienweb-api
sleep 3
pm2 log baotienweb-api --lines 5 --nostream 2>/dev/null
echo "DONE"
