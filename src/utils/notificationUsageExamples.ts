/**
 * Notification Settings Usage Examples
 * 
 * This file contains examples of how to use the notification settings
 * throughout the app. These examples show best practices for checking
 * user preferences before sending notifications.
 */

import {
  getNotificationPreference,
  checkNotificationPermission,
  initializeNotificationSettings,
} from './notificationUtils';

/**
 * Example 1: Check if notifications should be sent before triggering
 * Use this pattern before sending any push notifications
 */
export const shouldSendNotification = async (): Promise<boolean> => {
  try {
    const [userPreference, permissionStatus] = await Promise.all([
      getNotificationPreference(),
      checkNotificationPermission(),
    ]);
    
    // Only send notifications if user has enabled them AND permission is granted
    return userPreference && permissionStatus.granted;
  } catch (error) {
    console.error('Error checking notification status:', error);
    return false;
  }
};

/**
 * Example 2: Initialize notification settings on app startup
 * Call this in your main App component or splash screen
 */
export const initializeAppNotifications = async () => {
  try {
    const settings = await initializeNotificationSettings();
    
    console.log('Notification settings initialized:', {
      userEnabled: settings.enabled,
      permissionGranted: settings.permissionGranted,
    });
    
    // You can use this information to configure your notification service
    // For example, register/unregister for push notifications based on settings
    
    return settings;
  } catch (error) {
    console.error('Failed to initialize notification settings:', error);
    return null;
  }
};

/**
 * Example 3: Property booking notification check
 * Use this pattern when sending booking confirmations, updates, etc.
 */
export const sendBookingNotification = async (message: string) => {
  const canSend = await shouldSendNotification();
  
  if (!canSend) {
    console.log('Notification not sent - user preferences or permissions');
    return false;
  }
  
  // Your notification sending logic here
  console.log('Sending notification:', message);
  // await pushNotificationService.send(message);
  
  return true;
};

/**
 * Example 4: Property alert notification check
 * Use this for property price changes, new listings, etc.
 */
export const sendPropertyAlert = async (propertyId: string, alertType: string) => {
  const canSend = await shouldSendNotification();
  
  if (!canSend) {
    console.log(`Property alert not sent for ${propertyId} - user settings`);
    return false;
  }
  
  // Your property alert logic here
  console.log(`Sending property alert: ${alertType} for property ${propertyId}`);
  
  return true;
};

/**
 * Example 5: Marketing notification check
 * Use this for promotional content, new features, etc.
 */
export const sendMarketingNotification = async (campaign: string) => {
  const canSend = await shouldSendNotification();
  
  if (!canSend) {
    console.log(`Marketing notification not sent: ${campaign}`);
    return false;
  }
  
  // Your marketing notification logic here
  console.log(`Sending marketing notification: ${campaign}`);
  
  return true;
};

/**
 * Example 6: Batch notification check
 * Use this when you need to send multiple notifications
 */
export const sendBatchNotifications = async (notifications: Array<{id: string, message: string}>) => {
  const canSend = await shouldSendNotification();
  
  if (!canSend) {
    console.log('Batch notifications not sent - user settings');
    return [];
  }
  
  const results = [];
  
  for (const notification of notifications) {
    try {
      // Your notification sending logic here
      console.log(`Sending notification ${notification.id}: ${notification.message}`);
      results.push({id: notification.id, success: true});
    } catch (error) {
      console.error(`Failed to send notification ${notification.id}:`, error);
      results.push({id: notification.id, success: false, error});
    }
  }
  
  return results;
};
