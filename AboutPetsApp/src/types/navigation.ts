/**
 * Navigation Types
 * 
 * TypeScript definitions for React Navigation.
 * Defines the navigation structure and route parameters.
 */

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  ChatList: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: {
    chatId: string;
    chatName?: string;
  };
  NewChat: undefined;
  ChatSettings: {
    chatId: string;
  };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
  Notifications: undefined;
  Privacy: undefined;
  About: undefined;
};