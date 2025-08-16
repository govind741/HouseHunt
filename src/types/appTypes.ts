import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthStackParamList} from './authTypes';
import {AgentUserType, UserType} from '.';

type MainStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  HomeScreenStack: NavigatorScreenParams<HomeScreenStackParamList>;
};

type HomeScreenStackParamList = {
  HomeScreen: any;
  ProprtyDetailScreen: {agent_id: number};
  AddReviewScreen: any;
  ProfileScreen: any;
  ExpertsScreen: any;
  SavedScreen: any;
  ReviewDetailsScreen: any;
  CitySelectionScreen: undefined;
  AreaSelectionScreen: undefined;
  LocalitiesScreen: undefined;
  ProfileDetailScreen: {userDetails: UserType & AgentUserType};
  PendingApprovalScreen: undefined;
  WorkingLocationsListScreen: undefined;
  AccountSettings: undefined;
  PaymentOptionsScreen: undefined;
};

export type HomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeScreenStackParamList, 'HomeScreen'>,
  NativeStackScreenProps<MainStackParamList, 'AuthStack'>
>;

export type ProprtyDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeScreenStackParamList, 'ProprtyDetailScreen'>,
  NativeStackScreenProps<MainStackParamList, 'AuthStack'>
>;

export type AddReviewScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeScreenStackParamList, 'AddReviewScreen'>,
  NativeStackScreenProps<MainStackParamList, 'AuthStack'>
>;

export type ProfileScreennProps = CompositeScreenProps<
  NativeStackScreenProps<HomeScreenStackParamList, 'ProfileScreen'>,
  NativeStackScreenProps<MainStackParamList, 'AuthStack'>
>;
export type ExpertsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeScreenStackParamList, 'ExpertsScreen'>,
  NativeStackScreenProps<MainStackParamList, 'AuthStack'>
>;
export type SavedScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeScreenStackParamList, 'SavedScreen'>,
  NativeStackScreenProps<MainStackParamList, 'AuthStack'>
>;
export type ReviewDetailsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeScreenStackParamList, 'ReviewDetailsScreen'>,
  NativeStackScreenProps<MainStackParamList, 'AuthStack'>
>;

export type CitySelectionScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeScreenStackParamList, 'CitySelectionScreen'>,
  NativeStackScreenProps<MainStackParamList>
>;

export type AreaSelectionScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeScreenStackParamList, 'AreaSelectionScreen'>,
  NativeStackScreenProps<MainStackParamList, 'AuthStack'>
>;

export type LocalitiesScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeScreenStackParamList, 'LocalitiesScreen'>,
  NativeStackScreenProps<MainStackParamList, 'AuthStack'>
>;

export type ProfileDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeScreenStackParamList, 'ProfileDetailScreen'>,
  NativeStackScreenProps<MainStackParamList, 'AuthStack'>
>;

export type PendingApprovalScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeScreenStackParamList, 'PendingApprovalScreen'>,
  NativeStackScreenProps<MainStackParamList, 'AuthStack'>
>;

export type WorkingLocationsListScreenProps = CompositeScreenProps<
  NativeStackScreenProps<
    HomeScreenStackParamList,
    'WorkingLocationsListScreen'
  >,
  NativeStackScreenProps<MainStackParamList, 'AuthStack'>
>;

export type AccountSettingsProps = CompositeScreenProps<
  NativeStackScreenProps<HomeScreenStackParamList, 'AccountSettings'>,
  NativeStackScreenProps<MainStackParamList, 'AuthStack'>
>;

export type PaymentOptionsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeScreenStackParamList, 'PaymentOptionsScreen'>,
  NativeStackScreenProps<MainStackParamList, 'AuthStack'>
>;

export type {MainStackParamList, HomeScreenStackParamList};
