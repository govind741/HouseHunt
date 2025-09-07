import {Alert, Linking, PermissionsAndroid, Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {locationType, UserType} from '../types';

const getLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else if (result === PermissionsAndroid.RESULTS.DENIED) {
        return false;
      } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          'Permission Required',
          'Location permission has been permanently denied. Please enable it from settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ],
        );
      }
    } catch (error) {
      return false;
    }
  }
};

const getCurrentLocation = () => {
  return Geolocation.getCurrentPosition(
    position => {
      console.log(position);
      return position;
    },
    error => {
      console.error(error.code, error.message);
      throw error;
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    },
  );
};

const getFirstInitial = (name: string) => {
  if (!name) return 'NA';
  const firstName = name.trim().split(' ')[0];
  return firstName.charAt(0);
};

const getBreadcrumText = (location: locationType) => {
  const arr: string[] = [];

  if (location?.city_name) {
    arr.push(location.city_name);
  }

  if (location?.area_name) {
    arr.push(location.area_name);
  }

  if (location?.locality_name) {
    arr.push(location.locality_name);
  }

  return arr.join(' > ');
};

const prepareUserObj = (userData: any = {}) => {
  console.log('Preparing user object from:', userData);
  
  // Helper function to safely parse JSON or return the value as-is
  const safeJsonParse = (value: any) => {
    if (!value) return '';
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value; // Return as-is if not valid JSON
      }
    }
    return value;
  };

  // Helper function to safely parse location (might be double-encoded)
  const safeLocationParse = (location: any) => {
    if (!location) return null;
    if (typeof location === 'object') return location;
    
    try {
      // Try parsing once
      const parsed = JSON.parse(location);
      if (typeof parsed === 'string') {
        // If it's still a string, parse again (double-encoded)
        return JSON.parse(parsed);
      }
      return parsed;
    } catch (e) {
      console.warn('Failed to parse location:', location);
      return null;
    }
  };

  const userObj: UserType = {
    id: userData.id || userData.user_id || '',
    name: userData.name || '',
    dob: userData.dob || '',
    phone: userData.phone || userData.mobile_number || '',
    email: safeJsonParse(userData.email),
    profile: safeJsonParse(userData.profile) || userData.image || '',
    role: userData.role || 'user',
    status: userData.status || 0,
    location: safeLocationParse(userData.location),
  };

  console.log('Prepared user object:', userObj);
  return userObj;
};

export {
  getCurrentLocation,
  getLocationPermission,
  getFirstInitial,
  getBreadcrumText,
  prepareUserObj,
};
