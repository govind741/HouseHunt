# WebView Setup Instructions

The AboutUsScreen uses `react-native-webview` which requires additional setup steps.

## Installation Steps

1. **Package is already installed** via npm install

2. **iOS Setup** (if building for iOS):
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Android Setup** (if building for Android):
   - No additional steps required for React Native 0.60+

## Build the App

After installation, rebuild the app:

```bash
# For Android
npm run android

# For iOS  
npm run ios
```

## Troubleshooting

If you encounter any issues:

1. **Clean and rebuild**:
   ```bash
   # Clean Metro cache
   npm start -- --reset-cache
   
   # Clean Android build
   cd android && ./gradlew clean && cd ..
   
   # Clean iOS build (if on macOS)
   cd ios && xcodebuild clean && cd ..
   ```

2. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules
   npm install
   cd ios && pod install && cd .. # iOS only
   ```

The AboutUsScreen includes fallback content in case WebView fails to load, ensuring a good user experience regardless of any setup issues.
