# Deep Linking Guide

Complete guide to implementing and using deep links in the App Design & Build application.

---

## Overview

Deep linking allows users to navigate directly to specific screens within the app using URLs. This enables:
- Opening specific features from external sources (email, SMS, web)
- Sharing direct links to content
- Notifications that navigate to relevant screens
- Marketing campaigns with trackable links

---

## URL Scheme

**Base Scheme**: `appdesignbuild://`

### Supported Deep Link Patterns

| Pattern | Description | Example |
|---------|-------------|---------|
| `appdesignbuild://` | Open app to home screen | `appdesignbuild://` |
| `appdesignbuild://categories/:categoryId` | Open specific category | `appdesignbuild://categories/architecture` |
| `appdesignbuild://modules/:moduleId` | Open specific module | `appdesignbuild://modules/3d-modeling` |
| `appdesignbuild://search?q=query` | Open search with query | `appdesignbuild://search?q=thiết kế` |

---

## Configuration

### 1. Android (android/app/src/main/AndroidManifest.xml)

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <application>
    <activity
      android:name=".MainActivity"
      android:launchMode="singleTask">
      
      <!-- Deep linking intent filter -->
      <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <!-- Custom URL scheme -->
        <data android:scheme="appdesignbuild" />
      </intent-filter>
      
      <!-- Universal links (HTTPS) -->
      <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <data
          android:scheme="https"
          android:host="app.appdesignbuild.com"
          android:pathPrefix="/" />
      </intent-filter>
      
    </activity>
  </application>
</manifest>
```

### 2. iOS (ios/AppDesignBuild/Info.plist)

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>appdesignbuild</string>
    </array>
    <key>CFBundleURLName</key>
    <string>com.appdesignbuild</string>
  </dict>
</array>

<!-- Universal Links -->
<key>com.apple.developer.associated-domains</key>
<array>
  <string>applinks:app.appdesignbuild.com</string>
</array>
```

### 3. Expo Configuration (app.config.ts)

```typescript
export default {
  expo: {
    scheme: 'appdesignbuild',
    slug: 'app-design-build',
    
    android: {
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'app.appdesignbuild.com',
              pathPrefix: '/',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    
    ios: {
      associatedDomains: ['applinks:app.appdesignbuild.com'],
    },
  },
};
```

---

## Implementation

### 1. Handle Deep Links in App

```tsx
// app/_layout.tsx
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Handle initial deep link (app opened via link)
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle deep links while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  const handleDeepLink = (url: string) => {
    const { hostname, path, queryParams } = Linking.parse(url);

    // Extract route information
    if (hostname === 'categories' && path) {
      const categoryId = path.split('/')[0];
      router.push(`/categories/${categoryId}`);
    } else if (hostname === 'modules' && path) {
      const moduleId = path.split('/')[0];
      router.push(`/modules/${moduleId}`);
    } else if (hostname === 'search') {
      const query = queryParams?.q || '';
      router.push(`/search?q=${query}`);
    }
  };

  return <Stack />;
}
```

### 2. Create Deep Link Helper

```tsx
// utils/deeplink.ts
import * as Linking from 'expo-linking';

export const DeepLink = {
  // Base URL
  BASE: 'appdesignbuild://',

  // Create category link
  category: (categoryId: string): string => {
    return `appdesignbuild://categories/${categoryId}`;
  },

  // Create module link
  module: (moduleId: string): string => {
    return `appdesignbuild://modules/${moduleId}`;
  },

  // Create search link
  search: (query: string): string => {
    return `appdesignbuild://search?q=${encodeURIComponent(query)}`;
  },

  // Open deep link
  open: async (url: string): Promise<void> => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      console.error('Cannot open URL:', url);
    }
  },
};
```

### 3. Share Deep Links

```tsx
// components/ShareButton.tsx
import { Share } from 'react-native';
import { DeepLink } from '@/utils/deeplink';

interface ShareButtonProps {
  categoryId?: string;
  moduleId?: string;
  title: string;
  message: string;
}

export function ShareButton({ categoryId, moduleId, title, message }: ShareButtonProps) {
  const handleShare = async () => {
    try {
      let url = DeepLink.BASE;
      
      if (categoryId) {
        url = DeepLink.category(categoryId);
      } else if (moduleId) {
        url = DeepLink.module(moduleId);
      }

      await Share.share({
        message: `${message}\n\n${url}`,
        title,
        url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Pressable onPress={handleShare}>
      <Ionicons name="share-social" size={24} color="#333" />
    </Pressable>
  );
}
```

---

## Usage Examples

### Example 1: Open Category from Notification

```tsx
import { DeepLink } from '@/utils/deeplink';

// In notification handler
const handleNotificationPress = (categoryId: string) => {
  const url = DeepLink.category(categoryId);
  DeepLink.open(url);
};

// Usage
handleNotificationPress('architecture');
// Opens: appdesignbuild://categories/architecture
```

### Example 2: Share Module Link

```tsx
import { Share } from 'react-native';
import { DeepLink } from '@/utils/deeplink';

const shareModule = async (moduleId: string, moduleName: string) => {
  const url = DeepLink.module(moduleId);
  
  await Share.share({
    message: `Check out ${moduleName} in App Design & Build!`,
    url,
    title: moduleName,
  });
};

// Usage
shareModule('3d-modeling', 'Mô phỏng 3D');
```

### Example 3: Email Link

```html
<!-- Email HTML -->
<a href="appdesignbuild://modules/3d-modeling">
  Open 3D Modeling in App
</a>
```

### Example 4: QR Code with Deep Link

```tsx
import QRCode from 'react-native-qrcode-svg';
import { DeepLink } from '@/utils/deeplink';

export function CategoryQRCode({ categoryId }: { categoryId: string }) {
  const url = DeepLink.category(categoryId);
  
  return (
    <QRCode
      value={url}
      size={200}
      backgroundColor="white"
      color="black"
    />
  );
}
```

---

## Testing Deep Links

### Android

#### Using ADB
```bash
# Test category deep link
adb shell am start -W -a android.intent.action.VIEW \
  -d "appdesignbuild://categories/architecture" \
  com.appdesignbuild

# Test module deep link
adb shell am start -W -a android.intent.action.VIEW \
  -d "appdesignbuild://modules/3d-modeling" \
  com.appdesignbuild

# Test search deep link
adb shell am start -W -a android.intent.action.VIEW \
  -d "appdesignbuild://search?q=thiết%20kế" \
  com.appdesignbuild
```

#### Using Expo CLI
```bash
npx uri-scheme open "appdesignbuild://categories/architecture" --android
```

### iOS

#### Using Expo CLI
```bash
npx uri-scheme open "appdesignbuild://categories/architecture" --ios
```

#### Using xcrun
```bash
xcrun simctl openurl booted "appdesignbuild://categories/architecture"
```

### Web Browser
Open directly in browser (will prompt to open app):
```
appdesignbuild://categories/architecture
```

---

## Universal Links (HTTPS)

Universal Links allow HTTPS URLs to open the app instead of the browser.

### Setup

1. **Create apple-app-site-association file**:
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.appdesignbuild",
        "paths": [
          "/categories/*",
          "/modules/*",
          "/search"
        ]
      }
    ]
  }
}
```

2. **Host at**: `https://app.appdesignbuild.com/.well-known/apple-app-site-association`

3. **Create assetlinks.json for Android**:
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.appdesignbuild",
      "sha256_cert_fingerprints": [
        "YOUR_CERTIFICATE_FINGERPRINT"
      ]
    }
  }
]
```

4. **Host at**: `https://app.appdesignbuild.com/.well-known/assetlinks.json`

### Test Universal Links
```bash
# Android
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://app.appdesignbuild.com/categories/architecture"

# iOS
xcrun simctl openurl booted \
  "https://app.appdesignbuild.com/categories/architecture"
```

---

## Analytics Tracking

Track deep link usage:

```tsx
import { useAnalytics } from '@/hooks/useAnalytics';

const { trackFeature } = useAnalytics();

const handleDeepLink = (url: string) => {
  const { hostname, path, queryParams } = Linking.parse(url);
  
  // Track deep link usage
  trackFeature('deep_link_open', {
    url,
    hostname,
    path,
    queryParams,
  });

  // Navigate...
};
```

---

## Best Practices

1. **Validate Parameters**: Always validate category/module IDs before navigation
   ```tsx
   const category = CATEGORIES.find(c => c.id === categoryId);
   if (!category) {
     console.error('Invalid category:', categoryId);
     router.push('/'); // Fallback to home
     return;
   }
   ```

2. **Handle Errors Gracefully**: Show user-friendly error messages
   ```tsx
   try {
     await DeepLink.open(url);
   } catch (error) {
     Alert.alert('Error', 'Unable to open link');
   }
   ```

3. **Test All Platforms**: Deep links behave differently on Android/iOS
   
4. **Use URL Encoding**: Encode special characters in query params
   ```tsx
   const query = encodeURIComponent('thiết kế 3D');
   const url = `appdesignbuild://search?q=${query}`;
   ```

5. **Track Usage**: Monitor which deep links are most used

---

## Troubleshooting

### Issue: Deep Link Not Opening App
**Solution**: 
- Check URL scheme matches exactly (`appdesignbuild://`)
- Verify intent filters in AndroidManifest.xml
- Test with `npx uri-scheme open`

### Issue: Universal Link Opens Browser Instead
**Solution**:
- Verify `apple-app-site-association` file is accessible
- Check `autoVerify="true"` in Android intent filter
- Ensure certificate fingerprints are correct

### Issue: Parameters Not Parsing
**Solution**:
- Use `Linking.parse()` to extract params
- Check URL encoding for special characters
- Log parsed URL to debug

---

## Future Enhancements

- [ ] Deep link to specific sections within modules
- [ ] Deferred deep linking (install attribution)
- [ ] Branch.io integration for advanced tracking
- [ ] Dynamic links with fallback URLs
- [ ] Deep link preview cards for sharing

---

**Related Documentation**:
- [Navigation Guide](./NAVIGATION_GUIDE.md)
- [Category Reference](./CATEGORY_REFERENCE.md)
- [Component Library](./COMPONENT_LIBRARY.md)
