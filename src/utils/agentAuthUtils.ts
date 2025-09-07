import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAgentData, validateAgentProfile } from '../services/agentServices';

/**
 * Agent Authentication Utilities
 */

export interface AgentAuthState {
  isAuthenticated: boolean;
  hasCompleteProfile: boolean;
  needsApproval: boolean;
  agentData: any | null;
  error: string | null;
}

/**
 * Check the current agent authentication state
 */
export const checkAgentAuthState = async (): Promise<AgentAuthState> => {
  try {
    const token = await AsyncStorage.getItem('token');
    const role = await AsyncStorage.getItem('role');
    const userId = await AsyncStorage.getItem('userId');
    
    console.log('Checking agent auth state:', {
      hasToken: !!token,
      role,
      userId,
    });
    
    // Not authenticated if no token or not an agent
    if (!token || role !== 'agent') {
      return {
        isAuthenticated: false,
        hasCompleteProfile: false,
        needsApproval: false,
        agentData: null,
        error: !token ? 'No authentication token' : 'Not an agent role',
      };
    }
    
    // Try to fetch agent data
    try {
      const agentDataResult = await fetchAgentData(userId ? parseInt(userId) : undefined);
      
      if (agentDataResult.success && agentDataResult.data) {
        const profileValidation = validateAgentProfile(agentDataResult.data);
        const needsApproval = agentDataResult.data.verified === 0 || agentDataResult.data.status === 0;
        
        return {
          isAuthenticated: true,
          hasCompleteProfile: profileValidation.isComplete,
          needsApproval,
          agentData: agentDataResult.data,
          error: null,
        };
      } else {
        return {
          isAuthenticated: true,
          hasCompleteProfile: false,
          needsApproval: false,
          agentData: null,
          error: 'Could not fetch agent data',
        };
      }
    } catch (dataError: any) {
      console.error('Error fetching agent data in auth check:', dataError);
      
      // If it's a 403/404, agent probably needs to complete profile
      if (dataError?.response?.status === 403 || dataError?.response?.status === 404) {
        return {
          isAuthenticated: true,
          hasCompleteProfile: false,
          needsApproval: false,
          agentData: null,
          error: 'Agent profile not found or incomplete',
        };
      }
      
      return {
        isAuthenticated: true,
        hasCompleteProfile: false,
        needsApproval: false,
        agentData: null,
        error: dataError?.message || 'Unknown error fetching agent data',
      };
    }
  } catch (error: any) {
    console.error('Error in agent auth state check:', error);
    return {
      isAuthenticated: false,
      hasCompleteProfile: false,
      needsApproval: false,
      agentData: null,
      error: error?.message || 'Unknown error',
    };
  }
};

/**
 * Clear agent authentication data
 */
export const clearAgentAuth = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(['token', 'userData', 'role', 'userId']);
    console.log('Agent auth data cleared');
  } catch (error) {
    console.error('Error clearing agent auth data:', error);
  }
};

/**
 * Save agent authentication data
 */
export const saveAgentAuth = async (token: string, agentData: any, agentId: string | number): Promise<void> => {
  try {
    await AsyncStorage.multiSet([
      ['token', token],
      ['role', 'agent'],
      ['userId', agentId.toString()],
      ['userData', JSON.stringify(agentData)],
    ]);
    console.log('Agent auth data saved');
  } catch (error) {
    console.error('Error saving agent auth data:', error);
  }
};

/**
 * Determine the appropriate navigation route for an agent based on their state
 */
export const getAgentNavigationRoute = (authState: AgentAuthState) => {
  if (!authState.isAuthenticated) {
    return {
      stack: 'AuthStack',
      screen: 'AgentLoginScreen',
      reason: 'Not authenticated',
    };
  }
  
  if (!authState.hasCompleteProfile) {
    return {
      stack: 'AuthStack',
      screen: 'SignupScreen',
      reason: 'Incomplete profile',
    };
  }
  
  // Temporarily bypass approval check - all agents go to HomeScreen
  return {
    stack: 'HomeScreenStack',
    screen: 'HomeScreen',
    reason: 'Authenticated (approval check bypassed)',
  };
  
  /* TEMPORARILY DISABLED - PENDING APPROVAL CHECK
  if (authState.needsApproval) {
    return {
      stack: 'HomeScreenStack',
      screen: 'PendingApprovalScreen',
      reason: 'Pending approval',
    };
  }
  
  return {
    stack: 'HomeScreenStack',
    screen: 'HomeScreen',
    reason: 'Fully authenticated and approved',
  };
  */
};

/**
 * Debug agent authentication state
 */
export const debugAgentAuth = async (): Promise<void> => {
  const authState = await checkAgentAuthState();
  const route = getAgentNavigationRoute(authState);
  
  console.log('Agent Auth Debug:', {
    authState,
    recommendedRoute: route,
    timestamp: new Date().toISOString(),
  });
};
