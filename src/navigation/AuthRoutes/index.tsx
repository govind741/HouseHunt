import React from 'react';
import LoginScreen from '../../screen/AuthScreen/LoginScreen';
import {AuthStackParamList} from '../../types/authTypes';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import OtpScreen from '../../screen/AuthScreen/OtpScreen';
import SignupScreen from '../../screen/AuthScreen/SignupScreen';
import AgentLoginScreen from '../../screen/AuthScreen/AgentLoginScreen';
import WorkLocationScreen from '../../screen/AuthScreen/WorkLocationScreen';
import UserSignupScreen from '../../screen/AuthScreen/SignupScreen/UserSignupScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();
const AuthRoutes = () => {
  return (
    <Stack.Navigator
      initialRouteName="LoginScreen"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="OtpScreen" component={OtpScreen} />
      <Stack.Screen name="SignupScreen" component={SignupScreen} />
      <Stack.Screen name="AgentLoginScreen" component={AgentLoginScreen} />
      <Stack.Screen name="WorkLocationScreen" component={WorkLocationScreen} />
      <Stack.Screen name="UserSignupScreen" component={UserSignupScreen} />
    </Stack.Navigator>
  );
};

export default AuthRoutes;
