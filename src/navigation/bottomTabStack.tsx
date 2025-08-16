import React from 'react';
import HomeScreen from '../screen/AppScreen/HomeScreen';
import {HomeScreenStackParamList} from '../types/appTypes';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ProprtyDetailScreen from '../screen/AppScreen/ProprtyDetailScreen';
import AddReviewScreen from '../screen/AppScreen/AddReviewScreen';
import ProfileScreen from '../screen/AppScreen/ProfileScreen';
import AboutUsScreen from '../screen/AppScreen/AboutUsScreen';
import ExpertsScreen from '../screen/AppScreen/ExpertsScreen';
import SavedScreen from '../screen/AppScreen/SavedScreen';
import ReviewDetailsScreen from '../screen/AppScreen/ReviewDetailsScreen';
import CitySelectionScreen from '../screen/AppScreen/CitySelectionScreen';
import AreaSelectionScreen from '../screen/AppScreen/AreaSelectionScreen';
import LocalitiesScreen from '../screen/AppScreen/LocalitiesScreen';
import ProfileDetailScreen from '../screen/AppScreen/ProfileDetailScreen';
import PendingApprovalScreen from '../screen/AppScreen/PendingApprovalScreen';
import WorkingLocationsListScreen from '../screen/AppScreen/WorkingLocationsListScreen';
import AccountSettings from '../screen/AppScreen/AccountSettings';
import PaymentOptionsScreen from '../screen/AppScreen/PaymentOptionsScreen';

const HomeStack = createNativeStackNavigator<HomeScreenStackParamList>();

const HomeScreenStack = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="CitySelectionScreen">
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />

      <HomeStack.Screen
        name="ProprtyDetailScreen"
        component={ProprtyDetailScreen}
      />

      <HomeStack.Screen name="AddReviewScreen" component={AddReviewScreen} />

      <HomeStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <HomeStack.Screen name="AboutUsScreen" component={AboutUsScreen} />

      <HomeStack.Screen name="ExpertsScreen" component={ExpertsScreen} />
      <HomeStack.Screen name="SavedScreen" component={SavedScreen} />
      <HomeStack.Screen
        name="ReviewDetailsScreen"
        component={ReviewDetailsScreen}
      />
      <HomeStack.Screen
        name="CitySelectionScreen"
        component={CitySelectionScreen}
      />
      <HomeStack.Screen
        name="AreaSelectionScreen"
        component={AreaSelectionScreen}
      />
      <HomeStack.Screen name="LocalitiesScreen" component={LocalitiesScreen} />
      <HomeStack.Screen
        name="ProfileDetailScreen"
        component={ProfileDetailScreen}
      />
      <HomeStack.Screen
        name="PendingApprovalScreen"
        component={PendingApprovalScreen}
      />
      <HomeStack.Screen
        name="WorkingLocationsListScreen"
        component={WorkingLocationsListScreen}
      />
      <HomeStack.Screen name="AccountSettings" component={AccountSettings} />
      <HomeStack.Screen name="PaymentOptionsScreen" component={PaymentOptionsScreen} />
    </HomeStack.Navigator>
  );
};
export {HomeScreenStack};
