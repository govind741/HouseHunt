import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import AppRoutes from './AppRoutes';
import {setToken, setUserData} from '../store/slice/authSlice';
import SplashScreen from '../screen/AuthScreen/SplashScreen';
import {setLocation} from '../store/slice/locationSlice';
import {defaultLocation} from '../constant';

const RootNavigator = () => {
  const [loading, setLoading] = useState<boolean>(true);

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

  const getRoute = () => {
    if (loading) {
      return <SplashScreen />;
    }

    return <AppRoutes />;
  };
  return <NavigationContainer>{getRoute()}</NavigationContainer>;
};

export default RootNavigator;
