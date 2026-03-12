# 🚀 Deployment Directory

All deployment and build-related files.

## 📂 Structure

### `/scripts/`
- `deploy-*.ps1|sh` - Deployment scripts
- `build-*.ps1` - Build scripts
- `pre-build-check.ps1` - Pre-build validation
- `verify-database.sh` - Database verification

### `/configs/`
- `eas.json` - Expo Application Services config
- `app.config.*.js` - App configurations
- `privacy-policy.html` - Privacy policy
- `terms-of-service.html` - Terms of service

### `/guides/`
Deployment documentation and guides

## 🚀 Quick Commands

```bash
# Build APK
./deployment/scripts/build-apk.ps1

# Deploy to VPS
./deployment/scripts/deploy-vps.ps1

# Pre-build check
./deployment/scripts/pre-build-check.ps1
```

## 📖 Documentation
See [Deployment Guides](../docs/deployment/) for detailed instructions.
