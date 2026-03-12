# ============================================================
# BUILD STATUS SUMMARY
# Last Updated: 09/01/2026
# ============================================================

## Current Builds

### Preview Build (Internal Testing)
- **Build ID**: abfaef29-df94-4805-aa29-f2894bcc9064
- **Profile**: preview
- **Status**: IN PROGRESS
- **URL**: https://expo.dev/accounts/adminmarketingnx/projects/APP_DESIGN_BUILD/builds/abfaef29-df94-4805-aa29-f2894bcc9064

---

## Environment Configuration

| Environment | Status | API |
|-------------|--------|-----|
| Development | Ready | http://10.0.2.2:4000 |
| Staging/Preview | Ready | https://baotienweb.cloud/api/v1 |
| Production | Ready | https://api.thietkeresort.com.vn |

---

## Scripts Available

| Script | Description | Usage |
|--------|-------------|-------|
| `pre-build-check.ps1` | Verify all prerequisites | `./pre-build-check.ps1` |
| `build-apk.ps1` | Build APK with EAS | `./build-apk.ps1 -env preview` |
| `download-apk.ps1` | Download completed builds | `./download-apk.ps1 -buildId <id>` |

---

## Quick Commands

```powershell
# Check prerequisites
./pre-build-check.ps1

# Build for internal testing
./build-apk.ps1 -env preview

# Build for Play Store
./build-apk.ps1 -env prod

# Build Production APK (direct install)
./build-apk.ps1 -env prod-apk

# List recent builds
eas build:list --platform android --limit 5

# Download specific build
./download-apk.ps1 -buildId abfaef29-df94-4805-aa29-f2894bcc9064
```

---

## Credentials

- **EAS Account**: adminmarketingnx
- **Project ID**: 54fbd98b-b34c-47eb-afd1-450b8ee4ca98
- **Package Name**: com.adminmarketingnx.APP_DESIGN_BUILD
- **Keystore**: Build Credentials SGLx1-O6Qf (managed by EAS)

---

## Next Steps

1. [ ] Wait for preview build to complete
2. [ ] Download and test APK on device
3. [ ] Fix any issues found
4. [ ] Build production APK
5. [ ] Submit to Play Store (internal track)
