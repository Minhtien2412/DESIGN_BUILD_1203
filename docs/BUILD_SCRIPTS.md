# Build and Deployment Scripts

## Build Scripts

### Build iOS (Production)
```bash
#!/bin/bash
echo "🚀 Building iOS Production..."

# Clean build folder
rm -rf ios/build

# Install dependencies
npm install

# Build with EAS
eas build --platform ios --profile production --non-interactive

echo "✅ iOS build complete!"
```

### Build Android (Production)
```bash
#!/bin/bash
echo "🚀 Building Android Production..."

# Clean build folder
cd android && ./gradlew clean && cd ..

# Install dependencies
npm install

# Build with EAS
eas build --platform android --profile production --non-interactive

echo "✅ Android build complete!"
```

### Build Both Platforms
```bash
#!/bin/bash
echo "🚀 Building for all platforms..."

# Install dependencies
npm install

# Build iOS and Android
eas build --platform all --profile production --non-interactive

echo "✅ All builds complete!"
```

## Deployment Scripts

### Deploy to TestFlight (iOS Beta)
```bash
#!/bin/bash
echo "🚀 Deploying to TestFlight..."

# Build and submit
eas build --platform ios --profile preview
eas submit --platform ios --latest

echo "✅ Deployed to TestFlight!"
echo "📱 Share link: https://testflight.apple.com/join/YOUR_CODE"
```

### Deploy to Google Play Internal Testing
```bash
#!/bin/bash
echo "🚀 Deploying to Google Play Internal Testing..."

# Build and submit
eas build --platform android --profile preview
eas submit --platform android --latest --track internal

echo "✅ Deployed to Internal Testing!"
```

### Deploy to Production
```bash
#!/bin/bash
echo "🚀 Deploying to Production..."

# Confirm deployment
read -p "Are you sure you want to deploy to production? (yes/no) " -n 3 -r
echo
if [[ ! $REPLY =~ ^yes$ ]]
then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
npm test

# Build for production
echo "📦 Building for production..."
eas build --platform all --profile production --non-interactive

# Submit to stores
echo "📤 Submitting to App Store..."
eas submit --platform ios --latest

echo "📤 Submitting to Google Play..."
eas submit --platform android --latest

echo "✅ Production deployment complete!"
echo "⏱️  Review time: iOS (1-2 days), Android (1-3 days)"
```

## Pre-Deployment Checks

### Run All Tests
```bash
#!/bin/bash
echo "🧪 Running all tests..."

# TypeScript check
echo "Checking TypeScript..."
npx tsc --noEmit

# Unit tests
echo "Running unit tests..."
npm test -- --coverage

# Lint check
echo "Running linter..."
npx eslint .

echo "✅ All checks passed!"
```

### Bundle Size Analysis
```bash
#!/bin/bash
echo "📊 Analyzing bundle size..."

# Build for production
npx expo export --platform ios --output-dir dist/ios
npx expo export --platform android --output-dir dist/android

# Check sizes
echo "iOS bundle size:"
du -sh dist/ios

echo "Android bundle size:"
du -sh dist/android

echo "✅ Analysis complete!"
```

### Performance Check
```bash
#!/bin/bash
echo "⚡ Running performance checks..."

# Startup time measurement
echo "Measuring app startup time..."
# Add your measurement logic here

# Memory profiling
echo "Profiling memory usage..."
# Add your profiling logic here

echo "✅ Performance check complete!"
```

## Update Scripts

### OTA Update (Expo Updates)
```bash
#!/bin/bash
echo "🔄 Publishing OTA update..."

# Publish update
eas update --branch production --message "Bug fixes and improvements"

echo "✅ OTA update published!"
echo "Users will receive update within 24 hours"
```

### Rollback OTA Update
```bash
#!/bin/bash
echo "⏪ Rolling back OTA update..."

# Get previous update ID
PREVIOUS_UPDATE=$(eas update:list --branch production --limit 2 --json | jq -r '.[1].id')

# Rollback
eas update:rollback --update-id $PREVIOUS_UPDATE

echo "✅ Rolled back to previous version"
```

## Monitoring Scripts

### Check Build Status
```bash
#!/bin/bash
echo "📊 Checking build status..."

# Get latest builds
eas build:list --limit 5

echo "✅ Build status retrieved"
```

### Download Latest Build
```bash
#!/bin/bash
echo "⬇️ Downloading latest build..."

# Download iOS build
eas build:download --platform ios --latest

# Download Android build
eas build:download --platform android --latest

echo "✅ Builds downloaded!"
```

## Environment Setup

### Setup Development Environment
```bash
#!/bin/bash
echo "🔧 Setting up development environment..."

# Install dependencies
npm install

# Setup iOS (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    cd ios && pod install && cd ..
fi

# Setup Android
cd android && ./gradlew clean && cd ..

echo "✅ Development environment ready!"
```

### Setup Production Environment
```bash
#!/bin/bash
echo "🔧 Setting up production environment..."

# Create production config
cp .env.example .env.production

# Install production dependencies
npm ci --production

# Configure EAS
eas init

echo "✅ Production environment ready!"
echo "⚠️  Remember to update environment variables!"
```

## Quick Commands

Add these to `package.json`:

```json
{
  "scripts": {
    "build:ios": "./scripts/build-ios.sh",
    "build:android": "./scripts/build-android.sh",
    "build:all": "./scripts/build-all.sh",
    "deploy:testflight": "./scripts/deploy-testflight.sh",
    "deploy:internal": "./scripts/deploy-internal.sh",
    "deploy:production": "./scripts/deploy-production.sh",
    "test:all": "./scripts/test-all.sh",
    "analyze:bundle": "./scripts/analyze-bundle.sh",
    "update:ota": "./scripts/ota-update.sh",
    "update:rollback": "./scripts/rollback-update.sh"
  }
}
```

## Usage Examples

```bash
# Development builds
npm run build:ios
npm run build:android

# Testing
npm run test:all
npm run analyze:bundle

# Beta deployment
npm run deploy:testflight
npm run deploy:internal

# Production deployment
npm run deploy:production

# OTA updates
npm run update:ota
npm run update:rollback
```

## Notes

1. Make all scripts executable:
```bash
chmod +x scripts/*.sh
```

2. Store sensitive credentials in environment variables or EAS Secrets:
```bash
eas secret:create --scope project --name API_KEY --value your-key
```

3. Always test builds locally before deploying to production

4. Monitor crash reports and user feedback after deployment

5. Keep changelog updated for each release
