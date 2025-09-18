# Fix Google Sign-In DEVELOPER_ERROR

## The Issue
**Error Code 10 (DEVELOPER_ERROR)** means the SHA-1 fingerprint is missing or incorrect in Google Console.

## Quick Fix Steps

### 1. Get SHA-1 Fingerprint
Run this command in your project root:

```bash
# For Windows (if you have Android Studio installed)
cd android
gradlew signingReport

# Alternative method - find your debug keystore
# Usually located at: C:\Users\{username}\.android\debug.keystore
```

### 2. If gradlew doesn't work, use keytool:
```bash
# Find your debug keystore (usually in one of these locations):
# Windows: C:\Users\{YourUsername}\.android\debug.keystore
# Mac/Linux: ~/.android/debug.keystore

# Then run:
keytool -list -v -keystore "C:\Users\{YourUsername}\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

### 3. Add SHA-1 to Google Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Find your Android app
5. Add the SHA-1 fingerprint under "SHA certificate fingerprints"

### 4. Alternative Quick Fix (Temporary)
If you can't get SHA-1 immediately, try using a different Web Client ID:

```typescript
// In LoginScreen/index.tsx, replace the webClientId:
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_FROM_GOOGLE_CONSOLE',
  offlineAccess: true,
});
```

## Current Configuration
- **Package Name**: `com.agentapp` ✅
- **Web Client ID**: `1083768578728-oivr4obskcvsfr18vukr2vjjnul48iot.apps.googleusercontent.com`
- **API Endpoint**: `/v1/auth/user/auth/google` ✅

## Test After Fix
1. Clean build: `npm run android`
2. Test Google Sign-In
3. Check console logs for success

The SHA-1 fingerprint is the most critical missing piece for Google Sign-In to work.
