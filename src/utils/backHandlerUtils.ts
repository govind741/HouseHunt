import {Alert, BackHandler} from 'react-native';
import {NavigationContainerRef, CommonActions} from '@react-navigation/native';

export interface BackHandlerConfig {
  navigationRef: React.RefObject<NavigationContainerRef<any>>;
}

export class AppBackHandler {
  private static instance: AppBackHandler;
  private navigationRef: React.RefObject<NavigationContainerRef<any>> | null = null;
  private backHandler: any = null;
  private exitBackPressCount = 0;
  private exitTimeout: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): AppBackHandler {
    if (!AppBackHandler.instance) {
      AppBackHandler.instance = new AppBackHandler();
    }
    return AppBackHandler.instance;
  }

  initialize(navigationRef: React.RefObject<NavigationContainerRef<any>>) {
    this.navigationRef = navigationRef;
    this.setupBackHandler();
  }

  cleanup() {
    if (this.backHandler) {
      this.backHandler.remove();
      this.backHandler = null;
    }
    if (this.exitTimeout) {
      clearTimeout(this.exitTimeout);
      this.exitTimeout = null;
    }
  }

  private setupBackHandler() {
    this.cleanup();
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress.bind(this)
    );
  }

  private handleBackPress(): boolean {
    if (!this.navigationRef?.current) {
      return false;
    }

    const navigation = this.navigationRef.current;
    const currentRoute = navigation.getCurrentRoute();
    const routeName = currentRoute?.name;

    // Handle specific screens
    if (this.shouldShowExitPrompt(routeName)) {
      return this.handleAppExit();
    }

    // For all other screens, try to go back
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    }

    // If can't go back, navigate to home
    this.navigateToHome();
    return true;
  }

  private shouldShowExitPrompt(routeName?: string): boolean {
    const exitPromptScreens = ['CitySelectionScreen', 'PendingApprovalScreen'];
    return routeName ? exitPromptScreens.includes(routeName) : false;
  }

  private handleAppExit(): boolean {
    Alert.alert(
      'Exit App',
      'Are you sure you want to exit?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
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
          this.exitBackPressCount = 0;
          if (this.exitTimeout) {
            clearTimeout(this.exitTimeout);
            this.exitTimeout = null;
          }
        }
      }
    );
    return true;
  }

  private navigateToHome() {
    if (!this.navigationRef?.current) {
      return;
    }

    const navigation = this.navigationRef.current;
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'HomeScreen'}],
      })
    );
  }

  static navigateBack(navigation: any) {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      const instance = AppBackHandler.getInstance();
      instance.navigateToHome();
    }
  }

  static shouldShowExitPrompt(routeName: string): boolean {
    const mainRootScreens = ['CitySelectionScreen', 'PendingApprovalScreen'];
    return mainRootScreens.includes(routeName);
  }
}
