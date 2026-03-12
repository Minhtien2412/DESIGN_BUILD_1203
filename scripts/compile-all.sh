#!/bin/bash
cd /var/www/baotienweb-api

echo "=== Compiling all changed files ==="

# Compile controllers in batches to avoid command line too long
FILES=$(grep -rln 'FlexibleIdPipe' src/ --include='*.controller.ts' --include='*.module.ts' | grep -v '.bak')
COUNT=$(echo "$FILES" | wc -l)
echo "Found $COUNT files to compile"

# Split into batches of 10
echo "$FILES" | xargs -n 10 bash -c '
  echo "  Batch: $@"
  npx tsc "$@" --outDir dist --rootDir src --skipLibCheck --target ES2021 --module commonjs --esModuleInterop --experimentalDecorators --emitDecoratorMetadata --declaration 2>/dev/null
  exit_code=$?
  if [ $exit_code -ne 0 ]; then
    echo "  Batch had errors (exit $exit_code), trying individually..."
    for f in "$@"; do
      npx tsc "$f" --outDir dist --rootDir src --skipLibCheck --target ES2021 --module commonjs --esModuleInterop --experimentalDecorators --emitDecoratorMetadata --declaration 2>/dev/null
      if [ $? -ne 0 ]; then
        echo "    FAIL: $f"
      else
        echo "    OK: $f"
      fi
    done
  fi
' _

echo ""
echo "=== Restarting PM2 ==="
pm2 restart baotienweb-api
sleep 3
pm2 status | head -10

echo ""
echo "=== Verifying no more ParseIntPipe in compiled dist ==="
REMAINING=$(grep -rln 'ParseIntPipe' dist/ --include='*.js' 2>/dev/null | wc -l)
echo "Files in dist/ still referencing ParseIntPipe: $REMAINING"

echo ""
echo "=== ALL DONE ==="
