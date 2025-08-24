import {useAppSelector} from '../store';
import {useNavigation} from '@react-navigation/native';
import {useCallback} from 'react';

export const useAuthGuard = () => {
  const {token, isGuestMode} = useAppSelector(state => state.auth);
  const navigation = useNavigation();

  const requireAuth = useCallback((callback?: () => void) => {
    if (!token || isGuestMode) {
      // Navigate to login screen
      navigation.navigate('AuthStack' as never, {screen: 'LoginScreen'} as never);
      return false;
    }
    
    // User is authenticated, execute callback if provided
    if (callback) {
      callback();
    }
    return true;
  }, [token, isGuestMode, navigation]);

  const isAuthenticated = !isGuestMode && !!token;

  return {
    requireAuth,
    isAuthenticated,
    isGuestMode,
  };
};
