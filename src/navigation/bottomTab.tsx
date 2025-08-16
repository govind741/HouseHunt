import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {COLORS} from '../assets/colors';
import {FONTS} from '../assets/font';
import {HomeScreenStack} from './bottomTabStack';
import {BottomTabParamList} from '../types/appTypes';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const BottomTab = () => {
  return (
    <>
      <Tab.Navigator
        initialRouteName="HomeScreen"
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarActiveTintColor: COLORS.RED,
          tabBarInactiveTintColor: COLORS.BLACK,
          tabBarStyle: {
            height: 60,
          },
          tabBarLabelStyle: {
            fontFamily: FONTS.OPENSANS_REGULAR,
          },
          tabBarIconStyle: {
            marginBottom: 4,
          },
        })}>
        <Tab.Screen
          name="HomeScreen"
          // component={HomeScreen} //to hide bottom tab pass only screen
          component={HomeScreenStack} //to not hide bottom tab pass screen stack
          options={{tabBarLabel: 'HOME'}}
        />
      </Tab.Navigator>
    </>
  );
};

export default BottomTab;
