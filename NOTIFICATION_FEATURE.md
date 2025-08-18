# Notification Toggle Feature

This document describes the implementation of the Notifications ON/OFF toggle feature in the Account Settings screen.

## Overview

The notification toggle feature provides users with granular control over push notifications within the app. It handles platform-specific permissions (Android 13+ POST_NOTIFICATIONS, iOS system settings) and saves user preferences locally using AsyncStorage.

## Features

- ✅ **User-friendly toggle switch** in Account Settings
- ✅ **Platform-specific permission handling** (Android 13+ POST_NOTIFICATIONS)
- ✅ **Local preference storage** using AsyncStorage
- ✅ **Automatic permission requests** when enabling notifications
- ✅ **Settings guidance** for blocked permissions
- ✅ **Loading states and error handling**
- ✅ **Toast notifications** for user feedback
- ✅ **Reusable components and utilities**

## File Structure

```
src/
├── components/
│   └── NotificationToggle/
│       └── index.tsx                 # Main toggle component
├── hooks/
│   └── useNotificationSettings.ts    # Custom hook for notification state
├── utils/
│   ├── notificationUtils.ts          # Core notification utilities
│   └── notificationUsageExamples.ts  # Usage examples and patterns
└── screen/AppScreen/AccountSettings/
    └── index.tsx                     # Updated with notification toggle
```

## Components

### NotificationToggle Component

A self-contained toggle switch component that handles:
- Loading notification preferences
- Displaying current state
- Handling user interactions
- Showing loading/updating states
- Providing user feedback via toasts

**Usage:**
```tsx
import NotificationToggle from '../../../components/NotificationToggle';

<NotificationToggle 
  onToggle={(enabled) => {
    console.log('Notifications toggled:', enabled);
  }}
/>
```

### useNotificationSettings Hook

A custom hook that provides:
- Current notification state
- Loading states
- Permission status
- Toggle functionality
- Settings refresh capability

**Usage:**
```tsx
import {useNotificationSettings} from '../../../hooks/useNotificationSettings';

const {isEnabled, isLoading, permissionStatus, toggleNotifications} = useNotificationSettings();
```

## Utilities

### notificationUtils.ts

Core utilities for notification management:

- `getNotificationPreference()` - Get user preference from AsyncStorage
- `setNotificationPreference(enabled)` - Save user preference to AsyncStorage
- `checkNotificationPermission()` - Check current system permission status
- `requestNotificationPermission()` - Request notification permission
- `handleNotificationToggle(enabled)` - Complete toggle handling with permissions
- `initializeNotificationSettings()` - Initialize settings on app startup

### Platform-Specific Behavior

#### Android
- **Android 13+ (API 33+)**: Requires `POST_NOTIFICATIONS` permission
- **Older Android**: Notifications enabled by default
- **Permission blocked**: Directs user to app settings

#### iOS
- **Permission handling**: Directs user to system settings
- **Settings path**: Settings > Notifications > HouseApp

## Implementation Details

### Permission Flow

1. **User enables notifications**:
   - Check current permission status
   - If not granted and can ask again → Request permission
   - If blocked → Show settings alert
   - If granted → Save preference and enable

2. **User disables notifications**:
   - Save preference to AsyncStorage
   - No permission changes needed

### Storage

User preferences are stored in AsyncStorage with the key `notification_enabled`:
- `"true"` - Notifications enabled
- `"false"` - Notifications disabled
- Default: `true` (enabled)

### Error Handling

- **Permission denied**: User-friendly error message with settings guidance
- **Storage errors**: Graceful fallback to default enabled state
- **Network errors**: Local preference still saved
- **Loading errors**: Retry mechanism available

## Usage Examples

### Basic Integration

```tsx
// In Account Settings or any settings screen
import NotificationToggle from '../../../components/NotificationToggle';

<NotificationToggle 
  onToggle={(enabled) => {
    // Optional: Handle toggle events
    analytics.track('notification_toggled', {enabled});
  }}
/>
```

### Advanced Usage with Hook

```tsx
import {useNotificationSettings} from '../../../hooks/useNotificationSettings';

const MyComponent = () => {
  const {isEnabled, isLoading, toggleNotifications} = useNotificationSettings();
  
  const handleCustomToggle = async () => {
    const success = await toggleNotifications(!isEnabled);
    if (success) {
      // Handle success
    }
  };
  
  return (
    <View>
      <Text>Notifications: {isEnabled ? 'ON' : 'OFF'}</Text>
      <Button onPress={handleCustomToggle} disabled={isLoading} />
    </View>
  );
};
```

### Checking Before Sending Notifications

```tsx
import {shouldSendNotification} from '../../../utils/notificationUsageExamples';

const sendPropertyAlert = async (message: string) => {
  const canSend = await shouldSendNotification();
  
  if (!canSend) {
    console.log('Notification not sent - user preferences');
    return;
  }
  
  // Send notification
  await pushNotificationService.send(message);
};
```

## Testing

### Manual Testing Checklist

- [ ] Toggle switch appears in Account Settings
- [ ] Initial state loads correctly
- [ ] Enabling notifications requests permission (Android 13+)
- [ ] Disabling notifications saves preference
- [ ] Settings alert appears for blocked permissions
- [ ] Toast messages show appropriate feedback
- [ ] Preference persists across app restarts
- [ ] Loading states display correctly
- [ ] Error states handle gracefully

### Test Scenarios

1. **First-time user**: Should default to enabled, request permission on first enable
2. **Permission granted**: Toggle should work smoothly
3. **Permission denied**: Should show settings guidance
4. **Permission blocked**: Should direct to system settings
5. **Offline usage**: Preferences should still save locally
6. **App restart**: Settings should persist

## Troubleshooting

### Common Issues

1. **Toggle not working on Android 13+**
   - Ensure `POST_NOTIFICATIONS` permission is in AndroidManifest.xml
   - Check if `react-native-permissions` is properly linked

2. **Settings not persisting**
   - Verify AsyncStorage is working correctly
   - Check for storage permission issues

3. **Permission requests not showing**
   - Ensure app targets correct Android API level
   - Check if permission was previously blocked

### Debug Information

Enable debug logging by adding to your development build:
```tsx
// In your main App component
import {initializeAppNotifications} from './src/utils/notificationUsageExamples';

useEffect(() => {
  if (__DEV__) {
    initializeAppNotifications().then(settings => {
      console.log('Debug - Notification settings:', settings);
    });
  }
}, []);
```

## Future Enhancements

Potential improvements for the notification system:

1. **Granular controls**: Separate toggles for different notification types
2. **Quiet hours**: Time-based notification scheduling
3. **Notification categories**: Property alerts, bookings, marketing, etc.
4. **Push notification integration**: FCM/APNS integration
5. **Analytics**: Track notification engagement and preferences
6. **A/B testing**: Test different notification strategies

## Dependencies

- `@react-native-async-storage/async-storage`: Local storage
- `react-native-permissions`: Permission handling
- `react-native-toast-message`: User feedback
- `react-native`: Core platform APIs

## Compatibility

- **React Native**: 0.76.9+
- **Android**: API 21+ (Android 5.0+)
- **iOS**: iOS 11.0+
- **Android 13+ POST_NOTIFICATIONS**: Fully supported
- **Older Android versions**: Graceful fallback
