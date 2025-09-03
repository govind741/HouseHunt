import React from 'react';
import {MainStackParamList} from '../../types/appTypes';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreenStack} from '../bottomTabStack';
import AuthRoutes from '../AuthRoutes';
import PendingApprovalScreen from '../../screen/AppScreen/PendingApprovalScreen';
import {useAppSelector} from '../../store';

const AppStack = createNativeStackNavigator<MainStackParamList>();

const AppRoutes = () => {
  const {token} = useAppSelector(state => state.auth);

  return (
    <AppStack.Navigator 
      screenOptions={{headerShown: false}}
      initialRouteName="HomeScreenStack"
    >
      <AppStack.Screen name="HomeScreenStack" component={HomeScreenStack} />
      <AppStack.Screen name="AuthStack" component={AuthRoutes} />
      <AppStack.Screen name="PendingApprovalScreen" component={PendingApprovalScreen} />
    </AppStack.Navigator>
  );
};

export default AppRoutes;
