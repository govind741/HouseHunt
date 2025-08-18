import {Alert, BackHandler} from 'react-native';
import {NavigationContainerRef, CommonActions} from '@react-navigation/native';

export interface BackHandlerConfig {
  navigationRef: React.RefObject<NavigationContainerRef<any>>;
}

/**
 * Centralized back handler that manages navigation flow properly
 * - Shows exit prompt only on login screen
 * - Allows natural navigation on all other screens
 */
export class AppBackHandler {
  private static instance: AppBackHandler;
  private navigationRef: React.RefObject<NavigationContainerRef<any>> | null = null;
  private backHandler: any = null;

  private constructor() {}

  static getInstance(): AppBackHandler {
    if (!AppBackHandler.instance) {
      AppBackHandler.instance = new AppBackHandler();
    }
    return AppBackHandler.instance;
  }

  /**
   * Initialize the back handler with navigation reference
   */
  initialize(navigationRef: React.RefObject<NavigationContainerRef<any>>) {
    this.navigationRef = navigationRef;
    this.setupBackHandler();
  }

  /**
   * Clean up the back handler
   */
  cleanup() {
    if (this.backHandler) {
      this.backHandler.remove();
      this.backHandler = null;
    }
  }

  /**
   * Setup the hardware back button handler
   */
  private setupBackHandler() {
    this.cleanup(); // Remove any existing handler

    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress.bind(this)
    );
  }

  /**
   * Handle back press logic
   */
  private handleBackPress(): boolean {
    if (!this.navigationRef?.current) {
      return false;
    }

    const navigation = this.navigationRef.current;
    const currentRoute = navigation.getCurrentRoute();
    
    if (!currentRoute) {
      return false;
    }

    // Check if we're on a login screen (any auth screen that should show exit prompt)
    const exitPromptScreens = ['LoginScreen', 'AgentLoginScreen'];
    
    if (exitPromptScreens.includes(currentRoute.name)) {
      this.showExitPrompt();
      return true; // Prevent default back behavior
    }

    // For all other screens, check if we can go back
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true; // Prevent default back behavior
    }

    // If we can't go back and we're not on a login screen,
    // navigate to the appropriate initial screen
    this.navigateToInitialScreen();
    return true;
  }

  /**
   * Show exit confirmation dialog
   */
  private showExitPrompt() {
    Alert.alert(
      'Exit App',
      'Are you sure you want to exit?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => BackHandler.exitApp(),
        },
      ],
      {cancelable: false}
    );
  }

  /**
   * Navigate to the appropriate initial screen based on current stack
   */
  private navigateToInitialScreen() {
    if (!this.navigationRef?.current) {
      return;
    }

    const navigation = this.navigationRef.current;
    const state = navigation.getState();
    
    // If we're in the auth stack, go to login
    if (state?.routes?.some(route => route.name === 'AuthStack')) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'AuthStack',
              state: {
                routes: [{name: 'LoginScreen'}],
              },
            },
          ],
        })
      );
    } else {
      // If we're in the app stack, go to city selection (or home)
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'HomeScreenStack',
              state: {
                routes: [{name: 'CitySelectionScreen'}],
              },
            },
          ],
        })
      );
    }
  }

  /**
   * Force navigation back (for UI back buttons)
   */
  static navigateBack(navigation: any) {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // If can't go back, use the same logic as hardware back
      const instance = AppBackHandler.getInstance();
      instance.navigateToInitialScreen();
    }
  }

  /**
   * Check if current screen should show exit prompt
   */
  static shouldShowExitPrompt(routeName: string): boolean {
    const exitPromptScreens = ['LoginScreen', 'AgentLoginScreen'];
    return exitPromptScreens.includes(routeName);
  }
}
