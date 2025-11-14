# Firebase App Distribution Setup Guide

## Quick Start (5 phút)

### 1. Cài đặt Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login và khởi tạo
```bash
firebase login
cd /path/to/APP_DESIGN_BUILD
firebase init appdistribution
```

### 3. Tạo Firebase config
```javascript
// firebase.json
{
  "appDistribution": {
    "app": "1:YOUR_PROJECT_ID:android:YOUR_APP_ID",
    "releaseNotes": "Automatic build from development",
    "groups": ["internal-testers"]
  }
}
```

### 4. Build và distribute
```bash
# Build APK
npm run build:preview

# Distribute
firebase appdistribution:distribute android/app/build/outputs/apk/release/app-release.apk \
    --app 1:YOUR_PROJECT_ID:android:YOUR_APP_ID \
    --testers "reviewer1@company.com,reviewer2@company.com" \
    --notes "$(date): Latest features and bug fixes"
```

## Automatic Script

Tạo file `distribute-app.sh`:
```bash
#!/bin/bash
set -e

echo "🏗️  Building APK..."
npm run build:preview

echo "📱 Distributing via Firebase..."
firebase appdistribution:distribute android/app/build/outputs/apk/release/app-release.apk \
    --app 1:YOUR_PROJECT_ID:android:YOUR_APP_ID \
    --testers-file testers.txt \
    --notes "Build $(date '+%Y-%m-%d %H:%M') - $(git log -1 --pretty=%B)"

echo "✅ Distribution complete!"
echo "📧 Testers will receive email with download link"
```

## Testers File
Tạo `testers.txt`:
```
reviewer1@company.com
reviewer2@company.com
manager@company.com
client@business.com
```

## GitHub Action (Tự động hóa)
```yaml
# .github/workflows/distribute.yml
name: Build and Distribute
on:
  push:
    branches: [main, staging]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build APK
        run: npm run build:preview
        
      - name: Distribute to Firebase
        run: |
          firebase appdistribution:distribute android/app/build/outputs/apk/release/app-release.apk \
            --app ${{ secrets.FIREBASE_APP_ID }} \
            --testers-file testers.txt \
            --notes "Auto build from ${{ github.sha }}"
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

## Lấy Firebase App ID

1. Vào [Firebase Console](https://console.firebase.google.com)
2. Tạo project mới hoặc chọn existing
3. Vào **Project Settings > General**  
4. Thêm Android app với package name: `com.adminmarketingnx.APP_DESIGN_BUILD`
5. Copy **App ID** (có format: `1:123456789:android:abc123def456`)

## Alternative: Manual File Sharing

Nếu không muốn setup Firebase:

### Google Drive
```bash
# Build APK
npm run build:preview

# Upload to Google Drive (manual)
# Share link với view permission
```

### WeTransfer API
```bash
# Cài đặt wetransfer-cli
npm install -g wetransfer-cli

# Upload APK
wetransfer upload android/app/build/outputs/apk/release/app-release.apk \
    --to "reviewer@company.com" \
    --message "APP_DESIGN_BUILD - Latest build for review"
```

### Dropbox
```bash
# Cài đặt dbx CLI
# Upload và tạo share link
dbx cp android/app/build/outputs/apk/release/app-release.apk dropbox:/shared/
dbx sharelink dropbox:/shared/app-release.apk
```

## Web Version (Instant Preview)

Dự án đã support React Native Web:
```bash
# Start web version
npm run web

# Tạo production build
npm run build:web

# Deploy lên Vercel
npx vercel --prod
```

## Monitoring & Analytics

Thêm vào Firebase config:
```javascript
// firebase.json
{
  "appDistribution": {
    "app": "1:YOUR_PROJECT_ID:android:YOUR_APP_ID", 
    "releaseNotes": "Automatic build from development",
    "groups": ["internal-testers"],
    "releaseNotesFile": "release-notes.md"
  },
  "crashlytics": {
    "enabled": true
  }
}
```

## Cost Comparison

| Method | Cost | Setup Time | Maintenance |
|--------|------|------------|-------------|
| Firebase App Distribution | Free (25GB storage) | 10 mins | Very Low |
| Google Drive | Free (15GB) | 2 mins | Manual upload |
| WeTransfer | Free (2GB) | 5 mins | Link expires |
| Dropbox | $10/month (2TB) | 5 mins | Low |
| Vercel (Web) | Free (100GB) | 5 mins | Auto deploy |

**Recommendation:** Firebase App Distribution cho mobile + Vercel cho web preview.