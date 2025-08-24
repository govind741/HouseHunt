import {AppBackHandler} from './backHandlerUtils';

/**
 * Navigation helper utilities for consistent back navigation behavior
 */
export class NavigationHelpers {
  /**
   * Handle back navigation for UI back buttons
   * This should be used in onBackPress props of ScreenHeader and other UI elements
   */
  static handleBackPress = (navigation: any) => {
    AppBackHandler.navigateBack(navigation);
  };

  /**
   * Navigate to a specific screen with proper stack management
   */
  static navigateToScreen = (navigation: any, screenName: string, params?: any) => {
    navigation.navigate(screenName, params);
  };

  /**
   * Replace current screen with a new one
   */
  static replaceScreen = (navigation: any, screenName: string, params?: any) => {
    navigation.replace(screenName, params);
  };

  /**
   * Reset navigation stack to a specific screen
   */
  static resetToScreen = (navigation: any, screenName: string, params?: any) => {
    navigation.reset({
      index: 0,
      routes: [{name: screenName, params}],
    });
  };

  /**
   * Go back to a specific screen in the stack
   */
  static goBackToScreen = (navigation: any, screenName: string) => {
    // Check if the screen exists in the navigation state
    const state = navigation.getState();
    const routeIndex = state.routes.findIndex((route: any) => route.name === screenName);
    
    if (routeIndex !== -1) {
      // Calculate how many screens to pop
      const currentIndex = state.index;
      const popCount = currentIndex - routeIndex;
      
      if (popCount > 0) {
        // Pop the required number of screens
        for (let i = 0; i < popCount; i++) {
          navigation.goBack();
        }
      }
    } else {
      // If screen not found in stack, navigate to it
      navigation.navigate(screenName);
    }
  };

  /**
   * Check if navigation can go back
   */
  static canGoBack = (navigation: any): boolean => {
    return navigation.canGoBack();
  };

  /**
   * Get current route name
   */
  static getCurrentRouteName = (navigation: any): string | undefined => {
    const state = navigation.getState();
    return state?.routes?.[state.index]?.name;
  };

  /**
   * Check if current screen should show exit prompt
   */
  static shouldShowExitPrompt = (navigation: any): boolean => {
    const currentRoute = NavigationHelpers.getCurrentRouteName(navigation);
    return currentRoute ? AppBackHandler.shouldShowExitPrompt(currentRoute) : false;
  };

  /**
   * Get navigation stack depth (how many screens can we go back)
   */
  static getStackDepth = (navigation: any): number => {
    const state = navigation.getState();
    return state?.index || 0;
  };

  /**
   * Check if we're at a root screen
   */
  static isAtRootScreen = (navigation: any): boolean => {
    return !navigation.canGoBack();
  };
}

/**
 * Hook-style helper for functional components
 */
export const useNavigationHelpers = (navigation: any) => {
  return {
    handleBackPress: () => NavigationHelpers.handleBackPress(navigation),
    navigateToScreen: (screenName: string, params?: any) => 
      NavigationHelpers.navigateToScreen(navigation, screenName, params),
    replaceScreen: (screenName: string, params?: any) => 
      NavigationHelpers.replaceScreen(navigation, screenName, params),
    resetToScreen: (screenName: string, params?: any) => 
      NavigationHelpers.resetToScreen(navigation, screenName, params),
    goBackToScreen: (screenName: string) => 
      NavigationHelpers.goBackToScreen(navigation, screenName),
    canGoBack: () => NavigationHelpers.canGoBack(navigation),
    getCurrentRouteName: () => NavigationHelpers.getCurrentRouteName(navigation),
    shouldShowExitPrompt: () => NavigationHelpers.shouldShowExitPrompt(navigation),
    getStackDepth: () => NavigationHelpers.getStackDepth(navigation),
    isAtRootScreen: () => NavigationHelpers.isAtRootScreen(navigation),
  };
};
