import React, {useState, useEffect, useRef} from 'react';
import {NavigationContainer, NavigationContainerRef} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import AppRoutes from './AppRoutes';
import {setToken, setUserData, setGuestMode} from '../store/slice/authSlice';
import SplashScreen from '../screen/AuthScreen/SplashScreen';
import {setLocation} from '../store/slice/locationSlice';
import {defaultLocation} from '../constant';
import {AppBackHandler} from '../utils/backHandlerUtils';
import {DeepLinkManager} from '../utils/deepLinkUtils';

const RootNavigator = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const getToken = async () => {
      //get token from local storage and set it to redux
      const accessToken = await AsyncStorage.getItem('token');
      dispatch(setToken(accessToken));

      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        dispatch(setUserData(JSON.parse(userData)));
      }

      // Set guest mode based on whether user has token
      dispatch(setGuestMode(!accessToken));

      //get location data
      const locationData = await AsyncStorage.getItem('location');
      if (locationData) {
        const parseData = JSON.parse(locationData);
        dispatch(setLocation(parseData));
      } else {
        dispatch(setLocation(defaultLocation));
      }

      setTimeout(() => {
        setLoading(false);
      }, 3000);
    };

    getToken();
  }, [dispatch]);

  useEffect(() => {
    // Initialize the centralized back handler
    const backHandler = AppBackHandler.getInstance();
    backHandler.initialize(navigationRef);

    // Initialize deep link manager
    const deepLinkManager = DeepLinkManager.getInstance();
    deepLinkManager.initialize(navigationRef);

    return () => {
      // Cleanup on unmount
      backHandler.cleanup();
      deepLinkManager.cleanup();
    };
  }, []);

  const getRoute = () => {
    if (loading) {
      return <SplashScreen />;
    }

    return <AppRoutes />;
  };
  
  return (
    <NavigationContainer ref={navigationRef}>
      {getRoute()}
    </NavigationContainer>
  );
};

export default RootNavigator;
