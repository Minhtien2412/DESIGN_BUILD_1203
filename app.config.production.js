/**
 * Production Build Configuration
 * Override settings for production builds
 */

module.exports = {
  expo: {
    name: 'Construction Manager Pro',
    slug: 'construction-manager',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'constructionmanager',
    userInterfaceStyle: 'automatic',
    
    // Production-specific settings
    updates: {
      fallbackToCacheTimeout: 0,
      url: 'https://u.expo.dev/your-project-id', // Update with your project ID
    },
    runtimeVersion: {
      policy: 'sdkVersion',
    },

    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },

    assetBundlePatterns: ['**/*'],

    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.baotienweb.constructionmanager',
      buildNumber: '1',
      infoPlist: {
        NSCameraUsageDescription: 'This app needs access to your camera to capture construction site photos and documents.',
        NSPhotoLibraryUsageDescription: 'This app needs access to your photo library to upload images for projects and reports.',
        NSMicrophoneUsageDescription: 'This app needs microphone access for video meetings and voice notes.',
        NSLocationWhenInUseUsageDescription: 'This app needs location access to track equipment and construction sites.',
      },
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },

    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.baotienweb.constructionmanager',
      versionCode: 1,
      permissions: [
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'RECORD_AUDIO',
      ],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },

    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },

    plugins: [
      'expo-router',
      'expo-secure-store',
      [
        'expo-image-picker',
        {
          photosPermission: 'The app accesses your photos for project documentation.',
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission: 'Allow Construction Manager to use your location for site tracking.',
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      apiUrl: 'https://baotienweb.cloud',
      environment: 'production',
      eas: {
        projectId: 'your-eas-project-id', // Update with your EAS project ID
      },
    },
  },
};
