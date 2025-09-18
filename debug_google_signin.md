# Google Sign-In Debug Guide

## Current Configuration Status ✅

1. **Package Installed**: `@react-native-google-signin/google-signin@15.0.0` ✅
2. **Android Configuration**: 
   - `google-services.json` exists ✅
   - Google Services plugin applied ✅
   - Play Services Auth dependency added ✅
3. **Code Implementation**: Google Sign-In button and handler implemented ✅

## Potential Issues & Solutions

### 1. **SHA-1 Fingerprint Not Configured**
**Problem**: Google Console doesn't have the correct SHA-1 fingerprint for your app.

**Solution**: 
```bash
# Get debug SHA-1 fingerprint
cd android
./gradlew signingReport

# Or use keytool
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```
Add the SHA-1 fingerprint to your Google Console project.

### 2. **Web Client ID Issues**
**Current Web Client ID**: `1083768578728-oivr4obskcvsfr18vukr2vjjnul48iot.apps.googleusercontent.com`

**Verify**: Make sure this Web Client ID exists in your Google Console and is enabled.

### 3. **Google Play Services Not Updated**
**Solution**: Update Google Play Services on the device/emulator.

### 4. **Package Name Mismatch**
**Check**: Ensure the package name in `google-services.json` matches your app's package name.

## Testing Steps

1. **Check Console Logs**: Look for detailed error messages in the updated code
2. **Test on Real Device**: Google Sign-In often works better on real devices
3. **Clear App Data**: Clear app data and try again
4. **Check Internet**: Ensure device has internet connection

## Debug Commands

```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run android

# Check if Google Services are properly configured
adb logcat | grep -i google
```

## Common Error Codes

- `SIGN_IN_CANCELLED`: User cancelled (normal)
- `PLAY_SERVICES_NOT_AVAILABLE`: Update Google Play Services
- `DEVELOPER_ERROR`: SHA-1 fingerprint or configuration issue
- `NETWORK_ERROR`: Internet connection issue
