import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from './appTypes';

export type AuthStackParamList = {
  LoginScreen: undefined;
  AgentLoginScreen: undefined;
  OtpScreen: {mobile: string; screen: string};
  SignupScreen: {
    mobile_number: string;
    token: string;
    role: string;
    agent_id: string;
  };
  WorkLocationScreen: {
    signupPayload: any;
    token: string;
  };
  UserSignupScreen: {
    mobile_number: string;
    email?: string; // Optional email parameter for email login
    token?: string;
    role?: string;
    user_id?: string;
  };
};

export type LoginScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AuthStackParamList, 'LoginScreen'>,
  NativeStackScreenProps<MainStackParamList, 'HomeScreenStack'>
>;

export type AgentLoginScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AuthStackParamList, 'AgentLoginScreen'>,
  NativeStackScreenProps<MainStackParamList, 'HomeScreenStack'>
>;

export type OtpScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AuthStackParamList, 'OtpScreen'>,
  NativeStackScreenProps<MainStackParamList, 'HomeScreenStack'>
>;

export type SignupScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AuthStackParamList, 'SignupScreen'>,
  NativeStackScreenProps<MainStackParamList, 'HomeScreenStack'>
>;

export type WorkLocationScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AuthStackParamList, 'WorkLocationScreen'>,
  NativeStackScreenProps<MainStackParamList, 'HomeScreenStack'>
>;

export type UserSignupScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AuthStackParamList, 'UserSignupScreen'>,
  NativeStackScreenProps<MainStackParamList, 'HomeScreenStack'>
>;
