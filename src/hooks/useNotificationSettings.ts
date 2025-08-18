import {useState, useEffect, useCallback} from 'react';
import {
  getNotificationPreference,
  setNotificationPreference,
  checkNotificationPermission,
  handleNotificationToggle,
  NotificationPermissionResult,
} from '../utils/notificationUtils';

interface UseNotificationSettingsReturn {
  isEnabled: boolean;
  isLoading: boolean;
  permissionStatus: NotificationPermissionResult | null;
  toggleNotifications: (enabled: boolean) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
}

export const useNotificationSettings = (): UseNotificationSettingsReturn => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionResult | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const [preference, permission] = await Promise.all([
        getNotificationPreference(),
        checkNotificationPermission(),
      ]);
      
      setIsEnabled(preference);
      setPermissionStatus(permission);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleNotifications = useCallback(async (enabled: boolean): Promise<boolean> => {
    return new Promise((resolve) => {
      handleNotificationToggle(
        enabled,
        (success) => {
          setIsEnabled(success);
          // Refresh permission status after toggle
          checkNotificationPermission().then(setPermissionStatus);
          resolve(true);
        },
        (error) => {
          console.error('Toggle error:', error);
          resolve(false);
        },
      );
    });
  }, []);

  const refreshSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    isEnabled,
    isLoading,
    permissionStatus,
    toggleNotifications,
    refreshSettings,
  };
};
