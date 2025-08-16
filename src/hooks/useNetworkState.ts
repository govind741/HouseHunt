import {useEffect, useState} from 'react';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
}

export const useNetworkState = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: null,
    type: null,
  });

  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const newState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      };

      // Show toast when connection status changes
      if (networkState.isConnected && !newState.isConnected) {
        // Just went offline
        setWasOffline(true);
        Toast.show({
          type: 'error',
          text1: 'No Internet Connection',
          text2: 'Please check your network settings',
          visibilityTime: 4000,
        });
      } else if (!networkState.isConnected && newState.isConnected && wasOffline) {
        // Just came back online
        setWasOffline(false);
        Toast.show({
          type: 'success',
          text1: 'Connection Restored',
          text2: 'You are back online',
          visibilityTime: 2000,
        });
      }

      setNetworkState(newState);
    });

    return () => unsubscribe();
  }, [networkState.isConnected, wasOffline]);

  return networkState;
};
