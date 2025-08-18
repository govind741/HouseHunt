import React, {useState} from 'react';
import {
  View,
  Switch,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MagicText from '../MagicText';
import {COLORS} from '../../assets/colors';
import {useNotificationSettings} from '../../hooks/useNotificationSettings';
import Toast from 'react-native-toast-message';

interface NotificationToggleProps {
  onToggle?: (enabled: boolean) => void;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({onToggle}) => {
  const {isEnabled, isLoading, toggleNotifications} = useNotificationSettings();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (value: boolean) => {
    if (isUpdating) return;

    setIsUpdating(true);
    
    const success = await toggleNotifications(value);
    
    if (success) {
      onToggle?.(value);
      Toast.show({
        type: 'success',
        text1: value 
          ? 'Notifications enabled successfully' 
          : 'Notifications disabled successfully',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Failed to update notification settings',
        text2: 'Please try again or check your device settings',
      });
    }
    
    setIsUpdating(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.PRIMARY} />
        <MagicText style={styles.loadingText}>Loading...</MagicText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <MagicText style={styles.title}>Push Notifications</MagicText>
        <MagicText style={styles.subtitle}>
          Receive updates about properties, bookings, and important announcements
        </MagicText>
      </View>
      <View style={styles.switchContainer}>
        {isUpdating && (
          <ActivityIndicator 
            size="small" 
            color={COLORS.PRIMARY} 
            style={styles.updateIndicator}
          />
        )}
        <Switch
          trackColor={{
            false: COLORS.LIGHT_GRAY,
            true: COLORS.PRIMARY,
          }}
          thumbColor={
            isEnabled 
              ? COLORS.WHITE
              : Platform.OS === 'ios' ? COLORS.WHITE : COLORS.GRAY
          }
          ios_backgroundColor={COLORS.LIGHT_GRAY}
          onValueChange={handleToggle}
          value={isEnabled}
          disabled={isUpdating}
          style={styles.switch}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.GRAY,
    lineHeight: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switch: {
    transform: Platform.OS === 'ios' ? [{scaleX: 0.9}, {scaleY: 0.9}] : [],
  },
  updateIndicator: {
    marginRight: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.GRAY,
  },
});

export default NotificationToggle;
