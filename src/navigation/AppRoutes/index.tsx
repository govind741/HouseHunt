import React from 'react';
import {MainStackParamList} from '../../types/appTypes';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreenStack} from '../bottomTabStack';
import AuthRoutes from '../AuthRoutes';
import {useAppSelector} from '../../store';

const AppStack = createNativeStackNavigator<MainStackParamList>();

const AppRoutes = () => {
  const {token} = useAppSelector(state => state.auth);

  return (
    <AppStack.Navigator 
      screenOptions={{headerShown: false}}
      initialRouteName={token ? "HomeScreenStack" : "AuthStack"}
    >
      <AppStack.Screen name="HomeScreenStack" component={HomeScreenStack} />
      <AppStack.Screen name="AuthStack" component={AuthRoutes} />
    </AppStack.Navigator>
  );
};

export default AppRoutes;
