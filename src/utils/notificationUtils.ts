import {Platform, Alert, Linking} from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  request,
  check,
  openSettings,
} from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_PREFERENCE_KEY = 'notification_enabled';

export interface NotificationPermissionResult {
  granted: boolean;
  canAskAgain: boolean;
  shouldShowSettings: boolean;
}

/**
 * Check if notifications are enabled in user preferences
 */
export const getNotificationPreference = async (): Promise<boolean> => {
  try {
    const preference = await AsyncStorage.getItem(NOTIFICATION_PREFERENCE_KEY);
    return preference === 'true';
  } catch (error) {
    console.error('Error getting notification preference:', error);
    return true; // Default to enabled
  }
};

/**
 * Save notification preference to AsyncStorage
 */
export const setNotificationPreference = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_PREFERENCE_KEY, enabled.toString());
  } catch (error) {
    console.error('Error saving notification preference:', error);
  }
};

/**
 * Get the appropriate notification permission for the current platform
 */
const getNotificationPermission = () => {
  if (Platform.OS === 'android') {
    // For Android 13+ (API level 33+), we need POST_NOTIFICATIONS permission
    if (Platform.Version >= 33) {
      return PERMISSIONS.ANDROID.POST_NOTIFICATIONS;
    }
    // For older Android versions, notifications are enabled by default
    return null;
  } else if (Platform.OS === 'ios') {
    // iOS doesn't have a specific permission in react-native-permissions
    // We'll handle this through system settings
    return null;
  }
  return null;
};

/**
 * Check current notification permission status
 */
export const checkNotificationPermission = async (): Promise<NotificationPermissionResult> => {
  const permission = getNotificationPermission();
  
  if (!permission) {
    // For platforms/versions that don't require explicit permission
    return {
      granted: true,
      canAskAgain: true,
      shouldShowSettings: false,
    };
  }

  try {
    const result = await check(permission);
    
    switch (result) {
      case RESULTS.GRANTED:
        return {
          granted: true,
          canAskAgain: true,
          shouldShowSettings: false,
        };
      case RESULTS.DENIED:
        return {
          granted: false,
          canAskAgain: true,
          shouldShowSettings: false,
        };
      case RESULTS.BLOCKED:
        return {
          granted: false,
          canAskAgain: false,
          shouldShowSettings: true,
        };
      case RESULTS.UNAVAILABLE:
      case RESULTS.LIMITED:
      default:
        return {
          granted: false,
          canAskAgain: false,
          shouldShowSettings: false,
        };
    }
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return {
      granted: false,
      canAskAgain: true,
      shouldShowSettings: false,
    };
  }
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermissionResult> => {
  const permission = getNotificationPermission();
  
  if (!permission) {
    // For platforms/versions that don't require explicit permission
    return {
      granted: true,
      canAskAgain: true,
      shouldShowSettings: false,
    };
  }

  try {
    const result = await request(permission);
    
    switch (result) {
      case RESULTS.GRANTED:
        return {
          granted: true,
          canAskAgain: true,
          shouldShowSettings: false,
        };
      case RESULTS.DENIED:
        return {
          granted: false,
          canAskAgain: true,
          shouldShowSettings: false,
        };
      case RESULTS.BLOCKED:
        return {
          granted: false,
          canAskAgain: false,
          shouldShowSettings: true,
        };
      case RESULTS.UNAVAILABLE:
      case RESULTS.LIMITED:
      default:
        return {
          granted: false,
          canAskAgain: false,
          shouldShowSettings: false,
        };
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return {
      granted: false,
      canAskAgain: true,
      shouldShowSettings: false,
    };
  }
};

/**
 * Show alert to guide user to settings for notification permission
 */
export const showNotificationSettingsAlert = () => {
  const title = 'Notification Permission Required';
  const message = Platform.OS === 'ios' 
    ? 'To receive notifications, please enable them in Settings > Notifications > HouseApp'
    : 'To receive notifications, please enable them in Settings > Apps > HouseApp > Notifications';
  
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            openSettings();
          }
        },
      },
    ],
  );
};

/**
 * Handle notification toggle - combines permission check and preference saving
 */
export const handleNotificationToggle = async (
  enabled: boolean,
  onSuccess?: (enabled: boolean) => void,
  onError?: (error: string) => void,
): Promise<void> => {
  try {
    if (enabled) {
      // User wants to enable notifications
      const permissionResult = await checkNotificationPermission();
      
      if (!permissionResult.granted) {
        if (permissionResult.shouldShowSettings) {
          // Permission is blocked, show settings alert
          showNotificationSettingsAlert();
          onError?.('Permission blocked. Please enable in settings.');
          return;
        } else if (permissionResult.canAskAgain) {
          // Request permission
          const requestResult = await requestNotificationPermission();
          if (!requestResult.granted) {
            if (requestResult.shouldShowSettings) {
              showNotificationSettingsAlert();
            }
            onError?.('Notification permission denied.');
            return;
          }
        }
      }
      
      // Permission granted or not required, save preference
      await setNotificationPreference(true);
      onSuccess?.(true);
    } else {
      // User wants to disable notifications
      await setNotificationPreference(false);
      onSuccess?.(false);
    }
  } catch (error) {
    console.error('Error handling notification toggle:', error);
    onError?.('Failed to update notification settings.');
  }
};

/**
 * Initialize notification settings - check both permission and preference
 */
export const initializeNotificationSettings = async (): Promise<{
  enabled: boolean;
  permissionGranted: boolean;
}> => {
  try {
    const [preference, permissionResult] = await Promise.all([
      getNotificationPreference(),
      checkNotificationPermission(),
    ]);
    
    return {
      enabled: preference,
      permissionGranted: permissionResult.granted,
    };
  } catch (error) {
    console.error('Error initializing notification settings:', error);
    return {
      enabled: true,
      permissionGranted: false,
    };
  }
};
