const { getDefaultConfig } = require('expo/metro-config');

module.exports = {
  expo: {
    "name": "LibraHome",
    "slug": "librahome",
    "extra": {
      "eas": {
        "projectId": "7bfa6018-e8d2-4160-a8cb-fc036d196ee6"
      },
      router: {
        origin: false
      }
    },
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.booklibrary.app",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.booklibrary.app",
      permissions: [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS"
      ],
      compileSdkVersion: 33,
      targetSdkVersion: 33
    },
    web: {
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      [
        "expo-router",
        {
          "sitemap": false
        }
      ],
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain"
        }
      ],
      "expo-audio",
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
          }
        }
      ],
      "expo-video"
    ],
    updates: {
      fallbackToCacheTimeout: 0
    },
    runtimeVersion: {
      policy: "appVersion"
    }
  }
};