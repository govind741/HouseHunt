# Notification Toggle - Quick Start Guide

## What's Been Added

✅ **Complete notification toggle feature** in Account Settings  
✅ **Platform-specific permission handling** (Android 13+ POST_NOTIFICATIONS)  
✅ **Local preference storage** using AsyncStorage  
✅ **Reusable components and utilities**  
✅ **Comprehensive error handling and user feedback**  

## Files Created/Modified

### New Files:
- `src/components/NotificationToggle/index.tsx` - Main toggle component
- `src/hooks/useNotificationSettings.ts` - Custom hook for state management
- `src/utils/notificationUtils.ts` - Core notification utilities
- `src/utils/notificationUsageExamples.ts` - Usage patterns and examples
- `src/utils/__tests__/notificationUtils.test.ts` - Basic unit tests

### Modified Files:
- `src/screen/AppScreen/AccountSettings/index.tsx` - Added notification toggle

## How to Test

1. **Run the app**:
   ```bash
   npm run android
   # or
   npm run ios
   ```

2. **Navigate to Account Settings**:
   - Go to Profile → Settings (or however you access Account Settings)
   - You should see a new "Push Notifications" toggle

3. **Test the toggle**:
   - **First enable**: Should request permission on Android 13+
   - **Toggle off**: Should save preference and show success toast
   - **Toggle on**: Should check permissions and enable
   - **Restart app**: Settings should persist

## Key Features

### User Experience
- Clean, intuitive toggle switch
- Loading states during operations
- Success/error toast messages
- Automatic permission requests
- Settings guidance for blocked permissions

### Developer Experience
- Reusable components
- Custom hook for easy integration
- Comprehensive utility functions
- TypeScript support
- Error handling and logging

## Usage in Other Parts of the App

### Check if notifications should be sent:
```tsx
import {shouldSendNotification} from '../utils/notificationUsageExamples';

const sendAlert = async () => {
  if (await shouldSendNotification()) {
    // Send notification
  }
};
```

### Use the hook in any component:
```tsx
import {useNotificationSettings} from '../hooks/useNotificationSettings';

const MyComponent = () => {
  const {isEnabled, toggleNotifications} = useNotificationSettings();
  
  return (
    <Text>Notifications: {isEnabled ? 'ON' : 'OFF'}</Text>
  );
};
```

### Add toggle to other screens:
```tsx
import NotificationToggle from '../components/NotificationToggle';

<NotificationToggle onToggle={(enabled) => console.log(enabled)} />
```

## Platform Behavior

### Android 13+ (API 33+)
- Requests `POST_NOTIFICATIONS` permission
- Shows system permission dialog
- Directs to app settings if blocked

### Older Android
- No permission required
- Toggle works immediately

### iOS
- Directs to system settings for notification management
- Preference still saved locally

## Next Steps

1. **Test thoroughly** on different devices and Android versions
2. **Integrate with your push notification service** (FCM, etc.)
3. **Add analytics** to track notification preferences
4. **Consider granular controls** for different notification types
5. **Implement server-side** preference syncing if needed

## Troubleshooting

### Toggle not appearing
- Check if `NotificationToggle` import is correct
- Verify component is added to Account Settings

### Permission not requested on Android
- Ensure `POST_NOTIFICATIONS` is in AndroidManifest.xml (✅ already added)
- Check Android version (only required for API 33+)

### Settings not persisting
- Check AsyncStorage permissions
- Look for console errors in notification utilities

### Need help?
- Check `NOTIFICATION_FEATURE.md` for detailed documentation
- Review `notificationUsageExamples.ts` for implementation patterns
- Run the unit tests to verify basic functionality

## Success! 🎉

Your app now has a complete notification toggle feature that:
- Gives users control over notifications
- Handles platform-specific permissions properly
- Saves preferences locally
- Provides excellent user experience
- Is ready for integration with push notification services
