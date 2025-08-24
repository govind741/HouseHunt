import {Linking} from 'react-native';
import {NavigationContainerRef} from '@react-navigation/native';

/**
 * Deep link configuration
 */
export const DEEP_LINK_CONFIG = {
  screens: {
    // Main stack screens
    CitySelectionScreen: 'city-selection',
    HomeScreen: 'home',
    ProprtyDetailScreen: {
      path: 'property/:agent_id',
      parse: {
        agent_id: (agent_id: string) => parseInt(agent_id, 10),
      },
    },
    ProfileScreen: 'profile',
    SavedScreen: 'saved',
    LoginScreen: 'login',
    AgentLoginScreen: 'agent-login',
    AccountSettings: 'account-settings',
  },
};

/**
 * Deep link URL patterns
 */
export const DEEP_LINK_PATTERNS = {
  // HTTP/HTTPS patterns
  PROPERTY_HTTP: /^https?:\/\/houseapp\.in(?::81)?\/property\/(\d+)$/,
  PROPERTY_HTTPS: /^https:\/\/houseapp\.in\/property\/(\d+)$/,
  
  // Custom scheme patterns
  PROPERTY_CUSTOM: /^houseapp:\/\/property\/(\d+)$/,
  HOME_CUSTOM: /^houseapp:\/\/home$/,
  PROFILE_CUSTOM: /^houseapp:\/\/profile$/,
};

/**
 * Parse deep link URL and extract route information
 */
export const parseDeepLink = (url: string): {screen: string; params?: any} | null => {
  console.log('Parsing deep link:', url);
  
  // Check for property deep links
  let match = url.match(DEEP_LINK_PATTERNS.PROPERTY_HTTP);
  if (match) {
    const agent_id = parseInt(match[1], 10);
    console.log('Parsed property deep link, agent_id:', agent_id);
    return {
      screen: 'ProprtyDetailScreen',
      params: {agent_id},
    };
  }
  
  match = url.match(DEEP_LINK_PATTERNS.PROPERTY_HTTPS);
  if (match) {
    const agent_id = parseInt(match[1], 10);
    console.log('Parsed HTTPS property deep link, agent_id:', agent_id);
    return {
      screen: 'ProprtyDetailScreen',
      params: {agent_id},
    };
  }
  
  match = url.match(DEEP_LINK_PATTERNS.PROPERTY_CUSTOM);
  if (match) {
    const agent_id = parseInt(match[1], 10);
    console.log('Parsed custom property deep link, agent_id:', agent_id);
    return {
      screen: 'ProprtyDetailScreen',
      params: {agent_id},
    };
  }
  
  // Check for other deep links
  if (url.match(DEEP_LINK_PATTERNS.HOME_CUSTOM)) {
    return {screen: 'HomeScreen'};
  }
  
  if (url.match(DEEP_LINK_PATTERNS.PROFILE_CUSTOM)) {
    return {screen: 'ProfileScreen'};
  }
  
  console.log('No matching deep link pattern found for:', url);
  return null;
};

/**
 * Handle deep link navigation
 */
export const handleDeepLink = (
  url: string,
  navigationRef: React.RefObject<NavigationContainerRef<any>>
): boolean => {
  console.log('Handling deep link:', url);
  
  const parsedLink = parseDeepLink(url);
  if (!parsedLink) {
    console.log('Unable to parse deep link:', url);
    return false;
  }
  
  if (!navigationRef.current) {
    console.log('Navigation ref not available');
    return false;
  }
  
  try {
    const {screen, params} = parsedLink;
    console.log('Navigating to:', screen, 'with params:', params);
    
    // Navigate to the parsed screen
    navigationRef.current.navigate(screen as never, params as never);
    return true;
  } catch (error) {
    console.error('Error navigating to deep link:', error);
    return false;
  }
};

/**
 * Deep link manager class
 */
export class DeepLinkManager {
  private static instance: DeepLinkManager;
  private navigationRef: React.RefObject<NavigationContainerRef<any>> | null = null;
  private pendingUrl: string | null = null;

  private constructor() {}

  static getInstance(): DeepLinkManager {
    if (!DeepLinkManager.instance) {
      DeepLinkManager.instance = new DeepLinkManager();
    }
    return DeepLinkManager.instance;
  }

  /**
   * Initialize deep link manager
   */
  initialize(navigationRef: React.RefObject<NavigationContainerRef<any>>) {
    this.navigationRef = navigationRef;
    
    // Handle initial URL (app opened from deep link)
    this.handleInitialURL();
    
    // Listen for incoming URLs (app already running)
    this.setupURLListener();
    
    // Handle any pending URL
    if (this.pendingUrl) {
      this.handleURL(this.pendingUrl);
      this.pendingUrl = null;
    }
  }

  /**
   * Handle initial URL when app is opened from deep link
   */
  private async handleInitialURL() {
    try {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        console.log('Initial URL:', initialUrl);
        setTimeout(() => {
          this.handleURL(initialUrl);
        }, 1000); // Delay to ensure navigation is ready
      }
    } catch (error) {
      console.error('Error getting initial URL:', error);
    }
  }

  /**
   * Setup URL listener for incoming deep links
   */
  private setupURLListener() {
    const handleUrl = (event: {url: string}) => {
      console.log('Incoming URL:', event.url);
      this.handleURL(event.url);
    };

    Linking.addEventListener('url', handleUrl);
  }

  /**
   * Handle incoming URL
   */
  private handleURL(url: string) {
    if (!this.navigationRef) {
      console.log('Navigation not ready, storing pending URL:', url);
      this.pendingUrl = url;
      return;
    }

    const handled = handleDeepLink(url, this.navigationRef);
    if (!handled) {
      console.log('Deep link not handled, falling back to home');
      // Fallback to home screen if deep link couldn't be handled
      this.navigationRef.current?.navigate('HomeScreen' as never);
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    // Remove URL listener if needed
    // Note: React Native 0.65+ automatically handles cleanup
  }
}

/**
 * Generate app deep link URL
 */
export const generateAppDeepLink = (screen: string, params?: any): string => {
  switch (screen) {
    case 'ProprtyDetailScreen':
      if (params?.agent_id) {
        return `houseapp://property/${params.agent_id}`;
      }
      break;
    case 'HomeScreen':
      return 'houseapp://home';
    case 'ProfileScreen':
      return 'houseapp://profile';
    default:
      return 'houseapp://home';
  }
  return 'houseapp://home';
};

/**
 * Test deep link functionality
 */
export const testDeepLink = (agent_id: number) => {
  const testUrl = `http://houseapp.in:81/property/${agent_id}`;
  console.log('Testing deep link:', testUrl);
  Linking.openURL(testUrl);
};
