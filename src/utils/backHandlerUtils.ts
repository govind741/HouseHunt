import {Alert, BackHandler} from 'react-native';
import {NavigationContainerRef, CommonActions} from '@react-navigation/native';

export interface BackHandlerConfig {
  navigationRef: React.RefObject<NavigationContainerRef<any>>;
}

/**
 * Centralized back handler that manages navigation flow properly
 * - Follows standard mobile UX patterns
 * - Shows exit prompt only when at root screens
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
    const state = navigation.getState();
    
    if (!state) {
      return false;
    }

    // Check if we can go back in the current stack
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true; // Prevent default back behavior
    }

    // If we can't go back, we're at a root screen
    // Check if we're at the main root screen (CitySelectionScreen or HomeScreen)
    const currentRoute = navigation.getCurrentRoute();
    const isAtMainRoot = this.isAtMainRootScreen(currentRoute?.name);

    if (isAtMainRoot) {
      // We're at the main root screen, handle app exit
      return this.handleAppExit();
    } else {
      // We're at a root screen but not the main one, navigate to main root
      this.navigateToMainRoot();
      return true;
    }
  }

  /**
   * Check if current screen is a main root screen
   */
  private isAtMainRootScreen(routeName?: string): boolean {
    const mainRootScreens = ['CitySelectionScreen', 'HomeScreen'];
    return routeName ? mainRootScreens.includes(routeName) : false;
  }

  /**
   * Handle app exit with proper confirmation dialog
   */
  private handleAppExit(): boolean {
    // Show confirmation dialog with Cancel and Exit options
    Alert.alert(
      'Exit App',
      'Are you sure you want to exit the app?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            // User cancelled, reset counter
            this.exitBackPressCount = 0;
            if (this.exitTimeout) {
              clearTimeout(this.exitTimeout);
              this.exitTimeout = null;
            }
          }
        },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            // User confirmed exit
            if (this.exitTimeout) {
              clearTimeout(this.exitTimeout);
              this.exitTimeout = null;
            }
            BackHandler.exitApp();
          }
        }
      ],
      {
        cancelable: true,
        onDismiss: () => {
          // Dialog dismissed by tapping outside, reset counter
          this.exitBackPressCount = 0;
          if (this.exitTimeout) {
            clearTimeout(this.exitTimeout);
            this.exitTimeout = null;
          }
        }
      }
    );

    return true; // Prevent default back behavior
  }

  /**
   * Navigate to the main root screen
   */
  private navigateToMainRoot() {
    if (!this.navigationRef?.current) {
      return;
    }

    const navigation = this.navigationRef.current;
    
    // Reset to the main app flow
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

  /**
   * Force navigation back (for UI back buttons)
   */
  static navigateBack(navigation: any) {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // If can't go back, navigate to main root
      const instance = AppBackHandler.getInstance();
      instance.navigateToMainRoot();
    }
  }

  /**
   * Check if current screen should show exit prompt
   */
  static shouldShowExitPrompt(routeName: string): boolean {
    const mainRootScreens = ['CitySelectionScreen', 'HomeScreen'];
    return mainRootScreens.includes(routeName);
  }
}
